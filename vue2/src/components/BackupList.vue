<template>
  <div class="backup-list-container">
    <div v-if="backups.length === 0" class="empty-state">
      <p>您尚未建立任何备份</p>
    </div>
    <div v-else>
      <div class="backup-header">
        <h3 class="back-up-list-title">备份列表</h3>
        <button class="btn btn-edit" @click="toggleEditMode">
          {{ isEditMode ? '取消编辑' : '编辑' }}
        </button>
      </div>
      
      <!-- 编辑模式下的控制按钮 -->
      <div v-if="isEditMode" class="edit-controls-bar">
        <button class="btn btn-secondary" @click="selectAll">全选</button>
        <button class="btn btn-secondary" @click="reverseSelect">反选</button>
        <button class="btn btn-danger" @click="openDeleteConfirm" :disabled="selectedBackups.length === 0">
          删除选中 ({{ selectedBackups.length }})
        </button>
      </div>
      
      <div class="backup-item-list" :class="{ 'edit-mode': isEditMode }">
        <div 
          v-for="(backup, index) in backups" 
          :key="backup.id"
          :class="['backup-item', { selected: isEditMode && selectedBackups.includes(backup.id) }]"
          draggable="true"
          @dragstart="handleDragStart($event, index)"
          @dragover="handleDragOver($event)"
          @drop="handleDrop($event, index)"
          @dragend="handleDragEnd"
        >
          <!-- 编辑模式下的勾选框 -->
          <div v-if="isEditMode" class="checkbox">
            <input 
              type="checkbox" 
              :checked="selectedBackups.includes(backup.id)"
              @click.stop="toggleSelect(backup.id)"
            />
          </div>
          
          <div class="backup-item-img" @click="handleBackupClick(backup)">
            <img src="./img/备份列表图片.png">
          </div>
          <div style="padding: 14px; position: relative; min-height: 24px;" @dblclick.stop="handleDoubleClickRename(backup)">
            <span 
              v-if="editingBackupId !== backup.id"
              class="backup-name" 
            >{{backup.name}}</span>
            <!-- 重命名输入框，与span重叠 -->
            <input 
              v-if="!isEditMode && editingBackupId === backup.id"
              v-model="editingName"
              class="rename-input-overlay"
              @blur="handleRenameBlur(backup.id)"
              @input="handleRenameInput"
              @keyup.enter="handleRenameEnter(backup.id)"
              @keyup.esc="cancelRename"
              @click.stop
              @focus.stop
              ref="renameInput"
            />
          </div>
        </div>
      </div>
    </div>
    
    <!-- 删除确认弹窗 -->
    <div v-if="showDeleteConfirm" class="delete-confirm-modal">
      <div class="modal-content">
        <h3>确认删除</h3>
        <p>是否确认删除选中的 {{ selectedBackups.length }} 个备份？</p>
        <div class="modal-buttons">
          <button class="btn btn-secondary" @click="showDeleteConfirm = false">取消</button>
          <button class="btn btn-danger" @click="confirmDeleteModal">确认</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { loadBackups, saveBackups, removeBackup, renameBackup, addBackup } from '@/utils/storage.js';
import getFiles from '@/utils/getFiles.js';

export default {
  name: 'BackupList',
  props: {
    collectedItems: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      backups: [],
      isEditMode: false,
      selectedBackups: [],
      showDeleteConfirm: false,
      dragIndex: null,
      editingBackupId: null,
      editingName: '',
      shouldSkipBlurSubmit: false // 控制是否跳过blur提交（重名时设为true）
    }
  },
  async mounted() {
    await this.loadBackups();
    await this.initAuthorRecommendedBackup();
  },
  watch: {
    // 监听父组件更新，重新加载备份列表
    '$props': {
      handler() {
        this.loadBackups();
      },
      deep: true
    }
  },
  methods: {
    loadBackups() {
      this.backups = loadBackups();
    },
    async initAuthorRecommendedBackup() {
      // 检查是否已存在"作者推荐"备份
      const existingBackup = this.backups.find(b => b.name === '作者推荐');
      if (existingBackup) {
        return; // 已存在，不需要创建
      }

      // 作者推荐的44个蓝图列表
      const recommendedBlueprints = [
        // 01垂直上升
        { category: '01垂直上升', name: '火箭_悬浮台升空_分3级发射' },
        { category: '01垂直上升', name: '风弹II ｜ 仅需9矿达到游戏速度上限_b站搜前面的名字看使用方法_推荐' },
        { category: '01垂直上升', name: '弹簧5个飞天_21矿' },
        { category: '01垂直上升', name: '加农电梯_要站在最中间' },
        { category: '01垂直上升', name: '火箭热气球_驾驶一下_松开_反复_感觉不好用' },
        { category: '01垂直上升', name: '五连火箭垂直升空' },
        // 02飞行器
        { category: '02飞行器', name: '火箭mk2_推荐' },
        { category: '02飞行器', name: 'mk3' },
        { category: '02飞行器', name: '推荐_天空之城飞直线-需要倒转乾坤下使用-使用教程B站搜：自然选择号｜踏翼双模态的极速飞行，比射箭还快' },
        { category: '02飞行器', name: '飞机' },
        { category: '02飞行器', name: '飞鸟_造型哇塞_不实用飞得慢' },
        // 03地面载具
        { category: '03地面载具', name: '车子_独轮车_依盖队' },
        { category: '03地面载具', name: '哈雷摩托车' },
        { category: '03地面载具', name: '挖掘车_依盖队' },
        { category: '03地面载具', name: '车子_越野车带2个车灯' },
        { category: '03地面载具', name: '车子_造型帅的跑车' },
        // 04战车
        { category: '04战车', name: '10激光战车_左右各5个' },
        { category: '04战车', name: '脉冲星_打人马地下人马很快_ns2的话' },
        { category: '04战车', name: '战车_弹簧版_后面的弹簧可以弹射炸弹花出去，也可以弹射自己' },
        { category: '04战车', name: 'Depths_Tank' },
        { category: '04战车', name: '脉冲杀戮机器' },
        { category: '04战车', name: '坦克炮_造型很帅_要从顶部通天出来' },
        // 05空中战机
        { category: '05空中战机', name: '战斗机_蝎子' },
        { category: '05空中战机', name: '杀戮直升机_还行' },
        { category: '05空中战机', name: '悬浮石固定点位_不能移动_造型2' },
        // 06水里
        { category: '06水里', name: '船_小而美_简单' },
        // 07自动机器人
        { category: '07自动机器人', name: '冰刀全自动扫地机器人_还行的' },
        // 08高达
        { category: '08高达', name: '双形态之_机器人形态' },
        { category: '08高达', name: '地面走路高达_可驾驶' },
        // 09针对杀boss
        { category: '09针对杀boss', name: '悬浮固定在boss脸部高度旋转杀' },
        { category: '09针对杀boss', name: '悬浮boss脸_大摆锤版本' },
        { category: '09针对杀boss', name: '速杀属性龙，安全简单' },
        { category: '09针对杀boss', name: '飞机造型的炸弹花' },
        // 10有意思的东西
        { category: '10有意思的东西', name: '火葬配送专车_对着猪猪开_装进来火葬' },
        { category: '10有意思的东西', name: '猪猪陷阱_需要带魔吉拉面具用苹果把猪猪引过来' },
        { category: '10有意思的东西', name: '无限产蛋机' },
        { category: '10有意思的东西', name: '洒水机火箭升空' },
        { category: '10有意思的东西', name: '悬空洒水机_打水神兽很好用' },
        { category: '10有意思的东西', name: '水上制冰机_依盖队' },
        { category: '10有意思的东西', name: '战斗装置_电门_依盖队' },
        { category: '10有意思的东西', name: '自动烤肉机_激活后_站在上面放肉' },
        { category: '10有意思的东西', name: '高效捕鱼船' },
        // 11造型比较好看，没太大使用价值
        { category: '11造型比较好看，没太大使用价值', name: '直升飞机造型' },
        { category: '11造型比较好看，没太大使用价值', name: '恐龙_通过一上一下用嘴巴吃小猪_然后电死' }
      ];

      try {
        // 加载所有蓝图文件
        const allFiles = await getFiles();
        const matchedItems = [];

        // 遍历推荐列表，在所有蓝图中查找匹配项
        for (const recommended of recommendedBlueprints) {
          const category = allFiles[recommended.category];
          if (category && category.files) {
            // 精确匹配文件名
            let matched = category.files.find(file => file.name === recommended.name);
            
            // 如果精确匹配失败，尝试模糊匹配（去除特殊字符）
            if (!matched) {
              const normalizedName = recommended.name.replace(/[|｜]/g, '｜').trim();
              matched = category.files.find(file => {
                const fileNormalized = file.name.replace(/[|｜]/g, '｜').trim();
                return fileNormalized === normalizedName || file.name.includes(recommended.name) || recommended.name.includes(file.name);
              });
            }

            if (matched && matched.cai) {
              matchedItems.push({
                name: matched.name,
                cai: matched.cai,
                img: matched.img
              });
            } else {
              console.warn(`未找到蓝图: ${recommended.category} - ${recommended.name}`);
            }
          } else {
            console.warn(`未找到分类: ${recommended.category}`);
          }
        }

        // 如果有匹配到的蓝图，创建备份
        if (matchedItems.length > 0) {
          const result = addBackup({
            name: '作者推荐',
            items: matchedItems
          });

          if (result.success) {
            console.log(`成功创建"作者推荐"备份，包含 ${matchedItems.length} 个蓝图`);
            // 重新加载备份列表
            this.loadBackups();
            // 通知父组件更新备份数量
            this.$emit('backup-created');
          } else {
            console.error('创建"作者推荐"备份失败:', result.error);
          }

          // 如果有未找到的蓝图，输出提示
          const notFoundCount = recommendedBlueprints.length - matchedItems.length;
          if (notFoundCount > 0) {
            console.warn(`警告：有 ${notFoundCount} 个蓝图未找到，请核对文件名`);
          }
        } else {
          console.warn('警告：未找到任何匹配的蓝图，无法创建"作者推荐"备份');
        }
      } catch (error) {
        console.error('初始化"作者推荐"备份失败:', error);
      }
    },
    toggleEditMode() {
      this.isEditMode = !this.isEditMode;
      this.selectedBackups = [];
      // 编辑模式下，取消任何正在进行的重命名
      this.editingBackupId = null;
      this.editingName = '';
      this.shouldSkipBlurSubmit = false;
    },
    handleBackupClick(backup) {
      // 点击图片进入详情页面（编辑模式下也可以通过点击图片进入）
      if (!this.isEditMode) {
        this.$emit('view-backup', backup);
      }
    },
    toggleSelect(backupId) {
      const index = this.selectedBackups.indexOf(backupId);
      if (index >= 0) {
        this.selectedBackups.splice(index, 1);
      } else {
        this.selectedBackups.push(backupId);
      }
    },
    selectAll() {
      this.selectedBackups = this.backups.map(b => b.id);
    },
    reverseSelect() {
      const allIds = this.backups.map(b => b.id);
      this.selectedBackups = allIds.filter(id => !this.selectedBackups.includes(id));
    },
    openDeleteConfirm() {
      if (this.selectedBackups.length > 0) {
        this.showDeleteConfirm = true;
      }
    },
    confirmDeleteModal() {
      this.selectedBackups.forEach(backupId => {
        removeBackup(backupId);
      });
      this.selectedBackups = [];
      this.showDeleteConfirm = false;
      this.loadBackups();
      // 通知父组件更新备份数量
      this.$emit('backup-deleted');
    },
    handleDoubleClickRename(backup) {
      // 只有在非编辑模式下才能重命名
      if (!this.isEditMode) {
        this.startRename(backup);
      }
    },
    startRename(backup) {
      this.editingBackupId = backup.id;
      this.editingName = backup.name;
      this.shouldSkipBlurSubmit = false; // 开始重命名时重置标志
      this.$nextTick(() => {
        if (this.$refs.renameInput && this.$refs.renameInput.length) {
          this.$refs.renameInput[0].focus();
        } else if (this.$refs.renameInput) {
          this.$refs.renameInput.focus();
        }
      });
    },
    finishRename(backupId) {
      const trimmedName = this.editingName.trim();
      if (!trimmedName) {
        this.cancelRename();
        return;
      }
      
      // 如果名字没有改变，直接取消编辑
      const currentBackup = this.backups.find(b => b.id === backupId);
      if (currentBackup && currentBackup.name === trimmedName) {
        this.cancelRename();
        return;
      }
      
      // 检查重名（排除当前备份）
      const backups = loadBackups();
      const duplicateBackup = backups.find(b => b.id !== backupId && b.name === trimmedName);
      
      if (duplicateBackup) {
        // 重名时，设置标志为true，阻止后续blur提交
        this.shouldSkipBlurSubmit = true;
        alert('备份名称已存在，请使用其他名称。您可以继续编辑或按ESC取消。');
        
        // alert关闭后，重新focus输入框，让用户可以继续编辑
        this.$nextTick(() => {
          if (this.editingBackupId === backupId) {
            if (this.$refs.renameInput && this.$refs.renameInput.length) {
              this.$refs.renameInput[0].focus();
              this.$refs.renameInput[0].select();
            } else if (this.$refs.renameInput) {
              this.$refs.renameInput.focus();
              this.$refs.renameInput.select();
            }
          }
        });
        // 保持编辑状态，不关闭
        return;
      }
      
      // 不重名，可以保存
      const result = renameBackup(backupId, trimmedName);
      if (result.success) {
        this.loadBackups();
        this.editingBackupId = null;
        this.editingName = '';
        this.shouldSkipBlurSubmit = false;
      }
    },
    handleRenameBlur(backupId) {
      // 如果设置了跳过blur提交（通常是因为重名），则跳过
      if (this.shouldSkipBlurSubmit) {
        return;
      }
      
      // blur时正常提交
      this.finishRename(backupId);
    },
    handleRenameInput() {
      // 文本内容变更时，重置标志变量，允许下次blur提交
      this.shouldSkipBlurSubmit = false;
    },
    handleRenameEnter(backupId) {
      // Enter键时立即提交（不受shouldSkipBlurSubmit影响）
      this.finishRename(backupId);
    },
    cancelRename() {
      this.editingBackupId = null;
      this.editingName = '';
      this.shouldSkipBlurSubmit = false;
    },
    // 拖拽相关
    handleDragStart(event, index) {
      if (!this.isEditMode) return;
      this.dragIndex = index;
    },
    handleDragOver(event) {
      if (!this.isEditMode) return;
      event.preventDefault();
    },
    handleDrop(event, dropIndex) {
      if (!this.isEditMode) return;
      event.preventDefault();
      
      if (this.dragIndex !== null && this.dragIndex !== dropIndex) {
        const draggedBackup = this.backups[this.dragIndex];
        this.backups.splice(this.dragIndex, 1);
        this.backups.splice(dropIndex, 0, draggedBackup);
        // 保存新的顺序
        saveBackups(this.backups);
      }
    },
    handleDragEnd() {
      this.dragIndex = null;
    }
  }
}
</script>

<style scoped>
.backup-list-container {
  padding: 40px;
}
.backup-header{
    border-bottom: 1px solid #dcdfe6;
}
.back-up-list-title{
  text-align: left;
  padding-left: 36px;
  line-height: 36px;
}
.backup-item-list{
  display: flex;
  flex-wrap: wrap;
  padding: 20px 0;
}
.backup-item {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, .1);
  border-radius: 8px;
  border: 1px solid #ebeef5;
  margin-right: 26px;
  margin-bottom: 20px;
  cursor: pointer;
}
.backup-item img {
  width: 276px;
}

.backup-item-img {
  cursor: pointer;
}

.backup-item-img:hover {
  opacity: 0.8;
}

/* 空状态样式 */
.empty-state {
  text-align: center;
  padding: 100px;
  color: #909399;
  font-size: 16px;
}

/* 头部样式 */
.backup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

/* 编辑控制按钮栏 */
.edit-controls-bar {
  display: flex;
  gap: 10px;
  padding: 10px 20px;
  background: #f5f7fa;
  margin-bottom: 20px;
  border-radius: 4px;
}

/* 按钮样式 */
.btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.btn-edit {
  background-color: #409eff;
  color: white;
}

.btn-edit:hover {
  background-color: #66b1ff;
}

.btn-secondary {
  background-color: #909399;
  color: white;
}

.btn-secondary:hover {
  background-color: #a6a9ad;
}

.btn-danger {
  background-color: #f56c6c;
  color: white;
}

.btn-danger:hover {
  background-color: #f78989;
}

.btn-danger:disabled {
  background-color: #c0c4cc;
  cursor: not-allowed;
}

/* 编辑模式 */
.backup-item-list.edit-mode .backup-item {
  cursor: move;
}

.backup-item.selected {
  border: 2px solid #409eff;
  box-shadow: 0 2px 12px 0 rgba(64, 158, 255, 0.4);
}

.checkbox {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 20;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 4px;
  padding: 2px;
}

.checkbox input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.backup-item {
  position: relative;
}

.rename-input-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: calc(100% - 40px);
  padding: 0 12px;
  margin: 6px;
  border: 1px solid #409eff;
  font-size: inherit;
  background: white;
  z-index: 30;
  line-height: inherit;
  height: auto;
  line-height: 30px;
  color: rgb(96, 98, 102);
  border-radius: 4px;
}

.rename-input-overlay:focus, .rename-input-overlay:focus-visible{
  outline: none;
  line-height: 30px;
}

.backup-name {
  cursor: pointer;
}

/* 删除确认弹窗 */
.delete-confirm-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  max-width: 400px;
  text-align: center;
}

.modal-content h3 {
  margin: 0 0 15px 0;
  color: #303133;
}

.modal-content p {
  margin: 0 0 20px 0;
  color: #606266;
}

.modal-buttons {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.modal-buttons .btn {
  padding: 8px 20px;
  font-size: 14px;
}
</style>

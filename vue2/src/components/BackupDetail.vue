<template>
  <div class="backup-detail-container">
    <div v-if="!backupData || !backupData.items || backupData.items.length === 0" class="empty-state">
      <p>此备份为空</p>
    </div>
    <div v-else class="lantu-list-container">
      <!-- 第一行：返回、备份名、保存 -->
      <div class="backup-detail-top-header">
        <button class="btn btn-return" @click="handleReturn">返回</button>
        <h3 class="backup-name-title">{{ backupName }}</h3>
        <button class="btn btn-save" @click="handleSave">保存</button>
      </div>
      
      <div class="lantu-class-box">
        <div class="lantu-class-header">
          <div class="header-controls">
            <!-- 新建备份按钮 -->
            <button 
              v-if="backupData.items.length > 1 && !isEditMode"
              class="btn btn-create-backup" 
              @click="showCreateBackupModal"
            >
              新建备份
            </button>
            
            <!-- 导出到游戏按钮 -->
            <button 
              v-if="!isEditMode" 
              class="btn btn-export" 
              @click="showExportDialog"
              :disabled="backupData.items.length === 0"
            >
              导出到游戏
            </button>
            
            <!-- 编辑模式按钮 -->
            <div class="edit-controls" v-if="!isEditMode">
              <button class="btn btn-primary" @click="enterEditMode">编辑</button>
            </div>
            
            <!-- 编辑模式下的控制按钮 -->
            <div class="edit-controls" v-if="isEditMode">
              <button class="btn btn-secondary" @click="selectAll">全选</button>
              <button class="btn btn-secondary" @click="reverseSelect">反选</button>
              <button class="btn btn-danger" @click="removeSelected" :disabled="selectedItems.length === 0">
                删除 ({{ selectedItems.length }})
              </button>
              <button class="btn btn-primary" @click="exitEditMode">完成</button>
            </div>
            
            <!-- 排序控制 -->
            <div class="sort-controls">
              <select v-model="sortType" @change="applySorting">
                <option value="collection">按我的收藏勾选顺序排序</option>
                <option value="function">按蓝图功能排序</option>
              </select>
              <button class="btn btn-small" @click="toggleSortOrder" :class="{ active: sortOrder === 'desc' }">
                {{ sortOrder === 'asc' ? '正序' : '倒序' }}
              </button>
            </div>
          </div>
        </div>
        
        <div class="lantu-item-list" :class="{ 'edit-mode': isEditMode }">
          <div 
            v-for="(file, index) in sortedItems" 
            :key="file.name"
            :class="['lantu-item-box', { 
              teshu: isTeshuCategory(file),
              selected: isEditMode && selectedItems.includes(file),
              'edit-mode': isEditMode
            }]"
            @click="handleItemClick(file)"
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
                :checked="selectedItems.includes(file)"
                @click.stop="toggleSelect(file)"
              />
            </div>
            
            <div class="lantu-item-img">
              <div class="shoucang"></div>
              <img :src="getImagePath(file)" class="image"> 
            </div>
            <div style="padding: 14px;"><span>{{ file.name }}</span></div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 确认删除弹窗 -->
    <div v-if="showDeleteConfirm" class="delete-confirm-modal">
      <div class="modal-content">
        <h3>确认删除</h3>
        <p>是否确认删除勾选的 {{ selectedItems.length }} 个蓝图？</p>
        <div class="modal-buttons">
          <button class="btn btn-secondary" @click="showDeleteConfirm = false">取消</button>
          <button class="btn btn-danger" @click="confirmDelete">确认</button>
        </div>
      </div>
    </div>
    
    <!-- 新建备份对话框 -->
    <div v-if="showBackupModal" class="backup-modal">
      <div class="modal-content">
        <h3>新建备份</h3>
        <p class="backup-tip">请输入备份名称（最多10个字）</p>
        <div class="backup-input-container">
          <input 
            v-model="backupNameNew" 
            type="text" 
            class="backup-input"
            maxlength="10"
            placeholder="请输入备份名称"
            @keyup.enter="confirmCreateBackup"
            ref="backupInput"
          />
        </div>
        <div class="modal-buttons">
          <button class="btn btn-secondary" @click="cancelCreateBackup">取消</button>
          <button class="btn btn-primary" @click="confirmCreateBackup" :disabled="!backupName.trim()">确认</button>
        </div>
      </div>
    </div>
    
    <!-- 导出到游戏对话框 -->
    <div v-if="showExportModal" class="export-modal">
      <div class="modal-content">
        <h3>导出到游戏</h3>
        
        <!-- 首次选择路径 -->
        <div v-if="!exportPath" class="export-first-time">
          <p class="export-tip">请选择mod在电脑文件夹上的导出路径</p>
          <div class="export-buttons">
            <button class="btn btn-secondary" @click="selectExportPath">选择路径</button>
            <button class="btn btn-secondary" @click="cancelExport">取消</button>
          </div>
        </div>
        
        <!-- 显示已保存的路径 -->
        <div v-if="exportPath" class="export-path-set">
          <div class="path-display">
            <span class="path-label">导出路径：</span>
            <div class="path-value-container">
              <span class="path-value">{{ exportPath }}</span>
              <button class="btn btn-primary btn-small" @click="changeExportPath">修改路径</button>
            </div>
          </div>
          
          <div class="export-buttons">
            <button class="btn btn-primary" @click="confirmExport" :disabled="isExporting">
              {{ isExporting ? '导出中...' : '确认导出' }}
            </button>
            <button class="btn btn-secondary" @click="cancelExport">取消</button>
          </div>
        </div>
        
        <!-- 导出进度提示 -->
        <div v-if="isExporting" class="export-progress">
          <p>正在导出，请稍候...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { saveExportPath, loadExportPath } from '@/utils/exportPath.js';
import { loadBackups, addBackup } from '@/utils/storage.js';

export default {
  name: 'BackupDetail',
  props: {
    backup: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      backupData: null,
      isEditMode: false,
      selectedItems: [],
      sortType: 'collection', // 'collection' 或 'function'
      sortOrder: 'asc', // 'asc' 或 'desc'
      showDeleteConfirm: false,
      dragIndex: null,
      // 新建备份相关
      showBackupModal: false,
      // 导出相关
      showExportModal: false,
      exportPath: null,
      isExporting: false,
      backupNameNew: '',
    }
  },
  computed: {
    backupName() {
      return this.backup ? this.backup.name : '备份详情';
    },
    sortedItems() {
      if (!this.backupData || !this.backupData.items) return [];
      
      let items = [...this.backupData.items];
      
      if (this.sortType === 'function') {
        // 按蓝图功能排序
        items.sort((a, b) => {
          const numA = parseInt(a.cai ? a.cai.substring(0, 2) : '99') || 99;
          const numB = parseInt(b.cai ? b.cai.substring(0, 2) : '99') || 99;
          return this.sortOrder === 'asc' ? numA - numB : numB - numA;
        });
      } else {
        // 按收藏顺序排序（保持原有顺序）
        if (this.sortOrder === 'desc') {
          items.reverse();
        }
      }
      
      return items;
    }
  },
  mounted() {
    // 深拷贝备份数据，以便修改
    this.backupData = this.backup ? JSON.parse(JSON.stringify(this.backup)) : null;
    // 加载导出路径
    this.exportPath = loadExportPath();
  },
  methods: {
    getImagePath(file) {
      if (file.img) {
        return `./lantu/${file.img}`;
      }
      return '';
    },
    isTeshuCategory(file) {
      // 检查文件是否属于特殊分类
      if (!file.cai) return false;
      const teshuCategories = [
        '99外网采集的蓝图，因为太多没时间测分类/',
        '31哥布林怪/',
        '32Boss/',
        '33丘丘胶和蝙蝠/',
        '34左纳乌魔像/',
        '35蜥蜴怪/',
        '36人马和依盖队/',
        '37Miscellaneous/',
        '38章鱼怪和魔法师/',
        '39石怪和莱克莱克/',
        '40中等头目/',
        '41特殊效果蓝图/'
      ];
      return teshuCategories.some(category => file.cai.startsWith(category));
    },
    handleReturn() {
      this.$emit('return');
    },
    handleSave() {
      // 通知父组件保存备份
      this.$emit('save-backup', this.backupData);
    },
    // 编辑相关
    enterEditMode() {
      this.isEditMode = true;
      this.selectedItems = [];
    },
    exitEditMode() {
      this.isEditMode = false;
      this.selectedItems = [];
    },
    handleItemClick(file) {
      if (this.isEditMode) {
        this.toggleSelect(file);
      }
    },
    toggleSelect(file) {
      const index = this.selectedItems.findIndex(item => 
        item.cai === file.cai && item.name === file.name
      );
      if (index >= 0) {
        this.selectedItems.splice(index, 1);
      } else {
        this.selectedItems.push(file);
      }
    },
    selectAll() {
      this.selectedItems = [...this.sortedItems];
    },
    reverseSelect() {
      this.selectedItems = this.sortedItems.filter(item => 
        !this.selectedItems.some(selected => 
          selected.cai === item.cai && selected.name === item.name
        )
      );
    },
    removeSelected() {
      if (this.selectedItems.length > 0) {
        this.showDeleteConfirm = true;
      }
    },
    confirmDelete() {
      // 从备份中删除选中的项目
      this.selectedItems.forEach(item => {
        const index = this.backupData.items.findIndex(b => 
          b.cai === item.cai && b.name === item.name
        );
        if (index >= 0) {
          this.backupData.items.splice(index, 1);
        }
      });
      this.selectedItems = [];
      this.showDeleteConfirm = false;
      this.exitEditMode();
    },
    applySorting() {
      // 排序逻辑在 computed 中处理
    },
    toggleSortOrder() {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    },
    // 拖拽相关
    handleDragStart(event, index) {
      if (!this.isEditMode) return;
      this.dragIndex = index;
      event.dataTransfer.effectAllowed = 'move';
    },
    handleDragOver(event) {
      if (!this.isEditMode) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
    },
    handleDrop(event, dropIndex) {
      if (!this.isEditMode) return;
      event.preventDefault();
      
      if (this.dragIndex !== null && this.dragIndex !== dropIndex) {
        const draggedItem = this.sortedItems[this.dragIndex];
        const newItems = [...this.backupData.items];
        const originalIndex = newItems.findIndex(item => 
          item.cai === draggedItem.cai && item.name === draggedItem.name
        );
        if (originalIndex >= 0) {
          newItems.splice(originalIndex, 1);
          const targetIndex = newItems.findIndex(item => 
            item.cai === this.sortedItems[dropIndex].cai && 
            item.name === this.sortedItems[dropIndex].name
          );
          if (targetIndex >= 0) {
            newItems.splice(targetIndex, 0, draggedItem);
            this.backupData.items = newItems;
          }
        }
      }
    },
    handleDragEnd() {
      this.dragIndex = null;
    },
    // 新建备份相关
    showCreateBackupModal() {
      this.showBackupModal = true;
      this.backupNameNew = '';
      this.$nextTick(() => {
        if (this.$refs.backupInput) {
          this.$refs.backupInput.focus();
        }
      });
    },
    cancelCreateBackup() {
      this.showBackupModal = false;
      this.backupNameNew = '';
    },
    confirmCreateBackup() {
      const trimmedName = this.backupNameNew.trim();
      if (!trimmedName) {
        return;
      }
      
      // 检查重名
      const backups = loadBackups();
      const duplicateBackup = backups.find(b => b.name === trimmedName);
      if (duplicateBackup) {
        alert('备份名称已存在，请使用其他名称');
        this.$nextTick(() => {
          if (this.$refs.backupInput) {
            this.$refs.backupInput.focus();
            this.$refs.backupInput.select();
          }
        });
        return;
      }
      
      // 创建备份
      const result = addBackup({
        name: trimmedName,
        items: [...this.backupData.items]
      });
      
      if (result.success) {
        alert('备份创建成功！');
        this.showBackupModal = false;
        this.backupName = '';
        this.$emit('backup-created');
      } else {
        alert('创建备份失败：' + result.error);
      }
    },
    // 导出相关
    showExportDialog() {
      this.exportPath = loadExportPath();
      this.showExportModal = true;
    },
    async selectExportPath() {
      if (window.electronAPI) {
        const path = await window.electronAPI.selectExportPath();
        if (path) {
          this.exportPath = path;
          saveExportPath(path);
        }
      }
    },
    changeExportPath() {
      this.exportPath = null;
      this.selectExportPath();
    },
    cancelExport() {
      this.showExportModal = false;
      this.isExporting = false;
    },
    async confirmExport() {
      if (!this.exportPath) return;
      
      this.isExporting = true;
      
      try {
        if (window.electronAPI) {
          const result = await window.electronAPI.exportToGame({
            exportPath: this.exportPath,
            // 按当前可见顺序导出
            collectedItems: this.sortedItems
          });
          
          if (result.success) {
            this.isExporting = false;
            this.showExportModal = false;
            alert('导出成功！');
          } else {
            this.isExporting = false;
            alert('导出失败：' + (result.error || '未知错误'));
          }
        }
      } catch (error) {
        console.error('Export failed:', error);
        this.isExporting = false;
        alert('导出失败，请稍后重试');
      }
    }
  }
}
</script>

<style scoped>
.backup-detail-container {
  padding: 20px;
}

.empty-state {
  text-align: center;
  padding: 100px;
  color: #909399;
  font-size: 16px;
}

/* 顶部头部：返回、备份名、保存 */
.backup-detail-top-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #dcdfe6;
}

.backup-name-title {
  flex: 1;
  text-align: center;
  margin: 0;
  line-height: 36px;
  padding-left: 36px;
  color: #303133;
}

.btn-return {
  background-color: #909399;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-return:hover {
  background-color: #a6a9ad;
}

.btn-save {
  background-color: #67c23a;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-save:hover {
  background-color: #85ce61;
}

.lantu-list-container {
  padding: 20px;
}

.btn-create-backup {
  background-color: #67c23a;
  color: white;
}

.lantu-class-box {
  margin-left: 20px;
  margin-bottom: 30px;
}

.lantu-class-header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  border-bottom: 1px solid #dcdfe6;
  padding-bottom: 10px;
  margin-bottom: 20px;
}

.lantu-class-title {
  text-align: left;
  padding-left: 36px;
  line-height: 36px;
  margin: 0;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 15px;
}

.edit-controls {
  display: flex;
  gap: 8px;
}

.sort-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sort-controls select {
  padding: 4px 8px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 12px;
}

.btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s;
}

.btn-primary {
  background-color: #409eff;
  color: white;
}

.btn-primary:hover {
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

.btn-small {
  padding: 4px 8px;
  font-size: 11px;
}

.btn.active {
  background-color: #67c23a;
}

.btn-export {
  background-color: #67c23a;
  color: white;
}

.btn-export:hover:not(:disabled) {
  background-color: #85ce61;
}

.btn-export:disabled {
  background-color: #c0c4cc;
  cursor: not-allowed;
}

.lantu-item-list {
  display: flex;
  flex-wrap: wrap;
  padding: 20px 0;
}

.lantu-item-list.edit-mode {
  gap: 10px;
}

.lantu-item-box {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, .1);
  border-radius: 4px;
  border: 1px solid #ebeef5;
  margin-right: 24px;
  margin-bottom: 20px;
  cursor: pointer;
  width: 202px;
  position: relative;
  transition: all 0.3s;
}

.lantu-item-list.edit-mode .lantu-item-box {
  margin-right: 0;
  margin-bottom: 0;
}

.lantu-item-box:hover {
  box-shadow: 0 2px 12px 0 rgba(17, 134, 230, 0.3);
  border: 1px solid rgba(17, 134, 230, 0.3);
}

.lantu-item-box.selected {
  border: 2px solid #409eff;
  box-shadow: 0 2px 12px 0 rgba(64, 158, 255, 0.4);
}

.lantu-item-box.edit-mode {
  cursor: move;
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

.lantu-item-img {
  position: relative;
  width: 190px;
  height: 190px;
  background: url(./img/蓝图背景.png);
  background-size: 100% 100%;
  margin: 6px;
  display: flex;
  place-content: center;
  align-items: center;
}

.shoucang {
  position: absolute;
  top: 8px;
  left: 8px;
  width: 24px;
  height: 24px;
  background: url(./img/实五角星.png);
  background-size: 100% 100%;
  z-index: 10;
}

.lantu-item-box img {
  width: 200px;
}

.lantu-item-box.teshu img {
  width: 180px;
}

/* 确认删除弹窗样式 */
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
  max-width: 600px;
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

/* 新建备份对话框样式 */
.backup-modal {
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

.backup-input-container {
  margin: 20px 0;
}

.backup-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
}

.backup-input:focus {
  outline: none;
  border-color: #409eff;
}

.backup-tip {
  margin: 10px 0;
  color: #606266;
  font-size: 14px;
}

/* 导出到游戏对话框样式 */
.export-modal {
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

.export-first-time {
  text-align: center;
  padding: 20px 0;
}

.export-tip {
  margin-bottom: 20px;
  color: #606266;
  font-size: 14px;
}

.export-path-set {
  min-width: 500px;
}

.path-display {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 4px;
}

.path-label {
  font-weight: 500;
  color: #303133;
}

.path-value-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.path-value {
  flex: 1;
  color: #606266;
  word-break: break-all;
  max-width: 500px;
  overflow: auto;
  white-space: nowrap;
}

.export-buttons {
  display: flex;
  gap: 50px;
  justify-content: center;
}

.export-progress {
  text-align: center;
  padding: 20px 0;
  color: #409eff;
  font-size: 14px;
}
</style>

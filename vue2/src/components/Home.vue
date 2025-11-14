<template>
  <div id="home">
    <div id="menu-box">
      <li v-for="(item, i) in menuList" :key="i" :class="{active: activeIndex == i}" @click="switchMenu(i)">
        {{ item.text }}
        <span v-if="item.count !== null" class="count">({{ item.count }})</span>
      </li>
    </div>
    <div id="main-box">
      <!-- 蓝图列表 -->
      <LantuList 
        v-if="activeIndex === 0" 
        :collected-items="collectedItems"
        @toggle-collect="handleToggleCollect"
      />
      
      <!-- 我的收藏 -->
      <MyCollect 
        v-else-if="activeIndex === 1"
        :collected-items="collectedItems"
        @toggle-collect="handleToggleCollect"
        @reorder-items="handleReorderItems"
        @create-backup="handleCreateBackup"
      />
      
      <!-- 备份列表 -->
      <BackupList 
        v-else-if="activeIndex === 2 && !showBackupDetail"
        :collected-items="collectedItems"
        @view-backup="handleViewBackup"
        @backup-deleted="updateBackupCount"
        @backup-created="updateBackupCount"
      />
      
      <!-- 备份详情 -->
      <BackupDetail
        v-else-if="activeIndex === 2 && showBackupDetail"
        :backup="currentBackup"
        @return="handleBackupReturn"
        @save-backup="handleSaveBackup"
        @backup-created="updateBackupCount"
        @collection-overwritten="handleCollectionOverwritten"
      />
      
      <!-- 存档修改小白 -->
      <SaveGameEditXiaobai v-else-if="activeIndex === 3" />
      <!-- 存档修改小白 -->
      <SaveGameEditBendan v-else-if="activeIndex === 4" />
      <!-- 存档修改小白 -->
      <SaveGameEditDashi v-else-if="activeIndex === 5" />
      
      <!-- 使用说明 -->
      <Instructions v-else-if="activeIndex === 6" />
      
      <!-- 联系作者 -->
      <Connect v-else-if="activeIndex === 7" />
    </div>
    
    <!-- 最大收藏数量提示弹窗 -->
    <div v-if="showMaxCollectionToast" class="max-collection-toast">
      <div class="toast-content">
        <i class="toast-icon">⚠</i>
        <div class="toast-text">
          <div>最大收藏数量为46，</div>
          <div>因为设计石板12+依盖队设计图纸34，一起只能46个；</div>
          <div>想更多收藏，请参考【备份列表】功能，</div>
          <div>用多套收藏模板切换</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import LantuList from './LantuList.vue';
import MyCollect from './MyCollect.vue';
import BackupList from './BackupList.vue';
import BackupDetail from './BackupDetail.vue';
import SaveGameEditXiaobai from './SaveGameEditXiaobai.vue';
import SaveGameEditBendan from './SaveGameEditBendan.vue';
import SaveGameEditDashi from './SaveGameEditDashi.vue';
import Instructions from './Instructions.vue';
import Connect from './Connect.vue';
import { loadCollections, saveCollections, addBackup, updateBackup, loadBackups } from '@/utils/storage.js';

export default {
  name: 'Home',
  components: {
    LantuList,
    MyCollect,
    BackupList,
    BackupDetail,
    SaveGameEditXiaobai,
    SaveGameEditBendan,
    SaveGameEditDashi,
    Instructions,
    Connect
  },
  data() {
    return {
      menuList: [
        { text: '蓝图列表', count: null },
        { text: '我的收藏', count: 0 },
        { text: '备份列表', count: 0 },
        { text: '存档修改-小白版', count: null },
        { text: '存档修改-笨蛋版', count: null },
        { text: '存档修改-大师版', count: null },
        { text: '使用说明', count: null },
        { text: '联系作者', count: null }
      ],
      activeIndex: 0,
      collectedItems: [],
      showMaxCollectionToast: false,
      showBackupDetail: false,
      currentBackup: null
    }
  },
  mounted() {
    // 加载本地存储的收藏数据
    this.loadCollections();
    // 加载备份数量
    this.updateBackupCount();
  },
  methods: {
    switchMenu(index) {
      // 切换菜单时，如果离开备份列表，重置备份详情状态
      if (index !== 2) {
        this.showBackupDetail = false;
        this.currentBackup = null;
      }
      this.activeIndex = index;
    },
    handleToggleCollect(file) {
      const index = this.collectedItems.findIndex(
        item => item.cai === file.cai && item.name === file.name
      );
      
      if (index >= 0) {
        // 取消收藏
        this.collectedItems.splice(index, 1);
      } else {
        // 检查是否已达到最大收藏数量
        if (this.collectedItems.length >= 46) {
          this.showMaxCollectionToast = true;
          setTimeout(() => {
            this.showMaxCollectionToast = false;
          }, 5000);
          return;
        }
        // 添加收藏
        this.collectedItems.push(file);
      }
      
      // 更新菜单中的收藏数量
      this.updateCollectionCount();
      
      // 保存到本地存储
      saveCollections(this.collectedItems);
    },
    loadCollections() {
      this.collectedItems = loadCollections();
      this.updateCollectionCount();
    },
    updateCollectionCount() {
      this.menuList[1].count = this.collectedItems.length;
    },
    updateBackupCount() {
      const backups = loadBackups();
      this.menuList[2].count = backups.length;
    },
    handleReorderItems(newOrder) {
      this.collectedItems = newOrder;
      saveCollections(this.collectedItems);
    },
    handleCreateBackup(backupData) {
      const result = addBackup(backupData);
      if (result.success) {
        alert('备份创建成功！');
        this.updateBackupCount();
      } else {
        alert('创建备份失败：' + result.error);
      }
    },
    handleViewBackup(backup) {
      this.currentBackup = backup;
      this.showBackupDetail = true;
    },
    handleBackupReturn() {
      this.showBackupDetail = false;
      this.currentBackup = null;
      // 返回时更新备份列表，因为可能在其他地方修改了备份
      this.updateBackupCount();
    },
    handleSaveBackup(backupData) {
      const result = updateBackup(backupData.id, backupData);
      if (result.success) {
        alert('备份保存成功！');
        this.updateBackupCount();
      } else {
        alert('保存备份失败：' + result.error);
      }
      // 返回备份列表
      this.handleBackupReturn();
    },
    handleCollectionOverwritten() {
      // 重新加载收藏列表
      this.loadCollections();
    }
  }
}
</script>

<style scoped>
#home {
  width: 98vw;
  height: 98vh;
  margin: 1vh 1vw;
  box-shadow: 0 0 8px 0 rgba(232, 237, 250, .6), 0 2px 4px 0 rgba(232, 237, 250, .5);
  padding: auto;
}

#menu-box {
  width: 200px;
  height: 100%;
  background-color: #fff;
  float: left;
  border-right: 1px solid #e6e6e6;
}

#menu-box li {
  font-size: 14px;
  line-height: 56px;
  color: #303133;
  cursor: pointer;
  padding-left: 20px;
}

#menu-box li.active {
  color: #409eff;
  background-color: #ecf5ff;
}

.count {
  color: #909399;
  font-size: 12px;
  margin-left: 4px;
}

#main-box {
  height: 100%;
  overflow: auto;
  background-color: #f5f7fa;
}

/* 最大收藏数量提示弹窗样式 */
.max-collection-toast {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 9999;
  animation: fadeInOut 5s ease-in-out;
}

.toast-content {
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 20px 30px;
  border-radius: 12px;
  display: flex;
  align-items: flex-start;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(10px);
  max-width: 400px;
}

.toast-icon {
  font-size: 24px;
  color: #f56c6c;
  margin-right: 12px;
  font-weight: bold;
  margin-top: 2px;
}

.toast-text {
  font-size: 14px;
  font-weight: 500;
  line-height: 1.6;
}

.toast-text div {
  margin-bottom: 4px;
}

@keyframes fadeInOut {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.8);
  }
  15% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  85% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.8);
  }
}
</style>

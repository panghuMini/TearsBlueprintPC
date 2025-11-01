<template>
  <div class="lantu-list-container">
    <div v-if="!manifestLoaded" class="loading">加载中...</div>
    <div v-else>
      <div class="use_info">
        <h3>单击：收藏/取消收藏 </h3>
        <h3>目前收录蓝图：{{ totalBlueprintCount }}</h3>
        <div></div>
      </div>
      <div v-for="(category, key) in categories" :key="key" class="lantu-class-box">
        <h3 class="lantu-class-title">{{ category.displayName }}</h3>
        <div class="lantu-item-list">
          <div 
            v-for="file in category.files" 
            :key="file.name"
            :class="['lantu-item-box', { 
              active: isCollected(file),
              teshu: category.key === '99外网采集的蓝图，因为太多没时间测分类'
            }]"
            @click="toggleCollect(file)"
          >
            <div class="lantu-item-img">
              <div class="shoucang"></div>
              <img :src="getImagePath(file)" class="image"> 
            </div>
            <div style="padding: 14px;" class="backup-name"><span>{{ file.name }}</span></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import getFiles from '@/utils/getFiles.js';

export default {
  name: 'LantuList',
  props: {
    collectedItems: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      lantuFiles: {},
      manifestLoaded: false
    }
  },
  computed: {
    categories() {
      if (!this.lantuFiles || Object.keys(this.lantuFiles).length === 0) {
        return [];
      }
      
      const sorted = Object.entries(this.lantuFiles)
        .map(([key, value]) => ({
          key: key,
          name: value.name,
          displayName: this.removePrefix(value.name),
          files: value.files || []
        }))
        .sort((a, b) => {
          const numA = parseInt(a.key.substring(0, 2));
          const numB = parseInt(b.key.substring(0, 2));
          // 如果解析失败（NaN），放到最后
          if (isNaN(numA) && isNaN(numB)) return 0;
          if (isNaN(numA)) return 1;
          if (isNaN(numB)) return -1;
          return numA - numB;
        });
      return sorted;
    },
    totalBlueprintCount() {
      let count = 0;
      for (const categoryName in this.lantuFiles) {
        const category = this.lantuFiles[categoryName];
        if (category && category.files) {
          count += category.files.filter(file => file.cai).length;
        }
      }
      return count;
    }
  },
  async mounted() {
    await this.loadManifest();
  },
  methods: {
    async loadManifest() {
      this.lantuFiles = await getFiles();
      this.manifestLoaded = true;
      
      // 打印蓝图统计信息
      this.logBlueprintStats();
    },
    logBlueprintStats() {
      let totalCount = 0;
      let testedCount = 0;
      let untestedCount = 0;
      
      for (const categoryName in this.lantuFiles) {
        const category = this.lantuFiles[categoryName];
        if (category && category.files) {
          const caiFiles = category.files.filter(file => file.cai);
          const categoryCount = caiFiles.length;
          totalCount += categoryCount;
          
          if (categoryName === '99外网采集的蓝图，因为太多没时间测分类') {
            untestedCount = categoryCount;
          } else {
            testedCount += categoryCount;
          }
        }
      }
      
      console.log('目前蓝图数量：' + totalCount + '个\n');
      console.log('已测试蓝图数量：' + testedCount + '个\n');
      console.log('未测试蓝图数量：' + untestedCount + '个');
    },
    removePrefix(name) {
      return name.replace(/^\d{2}\s*/, '');
    },
    getImagePath(file) {
      if (file.img) {
        return `./lantu/${file.img}`;
      }
      return '';
    },
    isCollected(file) {
      return this.collectedItems.some(
        item => item.cai === file.cai && item.name === file.name
      );
    },
    toggleCollect(file) {
      this.$emit('toggle-collect', file);
    }
  }
}
</script>

<style scoped>
.use_info{
  position: fixed;
  top: 0;
  line-height: 36px;
  background: #f5f7fa;
  /* background: red; */
  width: 100%;
  text-align: left;
  z-index: 30;
}
.use_info h3:nth-child(1){
  display: block;
  float: left;
}
.use_info h3:nth-child(2){
  display: block;
  width: 780px;
  float: right;
}
.use_info div{
  clear: both;
}
.lantu-list-container > div> div:nth-child(2){
  margin-top: 42px;
}

.loading {
  text-align: center;
  padding: 40px;
  font-size: 16px;
  color: #909399;
}

.lantu-list-container {
  position: relative;
  padding: 20px;
}

.lantu-class-box {
  margin-left: 20px;
  margin-bottom: 30px;
}

.lantu-class-title {
  text-align: left;
  padding-left: 36px;
  border-bottom: 1px solid #dcdfe6;
  line-height: 36px;
}

.lantu-item-list {
  display: flex;
  flex-wrap: wrap;
  padding: 20px 0;
}

.lantu-item-box {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, .1);
  border-radius: 4px;
  border: 1px solid #ebeef5;
  margin-right: 24px;
  margin-bottom: 20px;
  cursor: pointer;
  width: 202px;
}

.lantu-item-box:hover {
  box-shadow: 0 2px 12px 0 rgba(17, 134, 230, 0.3);
  border: 1px solid rgba(17, 134, 230, 0.3);
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
  background: url(./img/空五角星.png);
  background-size: 100% 100%;
  z-index: 10;
}

.lantu-item-box.active .shoucang {
  background: url(./img/实五角星.png);
  background-size: 100% 100%;
}

.lantu-item-box img {
  width: 200px;
}

.lantu-item-box.teshu img {
  width: 180px;
}
</style>

<template>
  <div id="home">
    <div id="menu-box">
      <li v-for="(item, i) in menuList" :key="i" :class="{active: activeIndex == i}" @click="activeIndex = i">
        {{ item  }}
      </li>
    </div>
    <div id="main-box">
      <div >
        <h2>蓝图文件列表</h2>
        <div v-if="Object.keys(lantuFiles).length === 0">加载中...</div>
        <div v-else>
          <div v-for="(category, key) in lantuFiles" :key="key">
            <h3>{{ category.name }}</h3>
            <ul>
              <li v-for="file in category.files" :key="file.name">
                {{ file.name }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import getFiles from '@/utils/getFiles.js';

export default {
  name: 'Home',
  data() {
    return {
      menuList: [
        '蓝图列表',
        '我的收藏',
        '备份列表',
        '使用说明',
        '联系作者'
      ],
      activeIndex: 0,
      lantuFiles: {},
    }
  },
  async mounted() {
    // 读取 lantu 文件夹下的文件列表
    this.lantuFiles = await getFiles();
    console.log('Lantu files:', this.lantuFiles);
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  #home{
    width: 98vw;
    height: 98vh;
    margin: 1vh 1vw;
    box-shadow: 0 0 8px 0 rgba(232, 237, 250, .6), 0 2px 4px 0 rgba(232, 237, 250, .5);
    padding: auto;
  }
  #menu-box{
    width: 200px;
    height: 100%;
    background-color: #fff;
    float: left;
    border-right: 1px solid #e6e6e6;
  }
  #menu-box li{
    font-size: 14px;
    line-height: 56px;
    color: #303133;
    cursor: pointer;
  }
  #menu-box li.active{
    color: #409eff;
    background-color: #ecf5ff;
  }
  #main-box{
    height: 100%;
    overflow: auto;
  }
</style>

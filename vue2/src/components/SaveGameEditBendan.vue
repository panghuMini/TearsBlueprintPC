<template>
  <div class="savegame-edit-container">
    <!-- 第一部分：标题与下划线 -->
    <div class="header">
      <h3 class="title">存档修改&nbsp;&nbsp;&nbsp;&nbsp;小笨蛋图文引导版</h3>
    </div>

    <!-- 第二部分：指引步骤 -->
    <div class="guide">
      <ol>
        <li>在switch里，确认你的 《塞尔达传说 王国之泪》 这个游戏是关闭的</li>
        <li>
          点击switch最下方的【相册】<br/>
          <img src="./img/SaveGameEdit/相册.png" alt="" />
        </li>
        <li>
          在【相册】里，找到【JKSV】进入<br/>
          <img src="./img/SaveGameEdit/JKSV.png" alt="" />
        </li>
        <li>
          在【JKSV】里，选择你玩 王泪 的用户，游戏选择【塞尔达传说 王国之泪】<br/>
          <img src="./img/SaveGameEdit/JKSV2.png" alt="" />
        </li>
        <li>
          点击【新备份】按钮，记住自己新建备份的名字<br/>
          <img src="./img/SaveGameEdit/JKSV3.png" alt="" />
          <img src="./img/SaveGameEdit/JKSV4.png" alt="" />
        </li>
        <li>
          运行dbi，进入到 <span class="file-path">/1. SD卡:/JKSV/The Legend of Zelda Tears of the Kingdom/</span> 文件夹，把自己刚才的 zip 存档压缩包，拷贝到电脑上；(dbi不会使用的，b站自行搜索：switch硬破如何用dbi传输文件到电脑)<br/>
          <img src="./img/SaveGameEdit/JKSV5.png" alt="" />
        </li>
        <li>点击下方的【存档修改】按钮，然后选择你刚才导入到电脑上的 zip 压缩包</li>
        <li>几秒内，程序就会处理好，然后再次弹出一个弹窗，让你选择一个文件夹位置，选择后，这时候，你会看到，多出来了一个  ok.zip  的压缩包</li>
      </ol>
      <!-- 第三部分：按钮与处理进度 -->
      <div class="actions">
        <button class="btn btn-primary" @click="handleEditSave" :disabled="isProcessing">
          {{ isProcessing ? '处理中...' : '存档修改' }}
        </button>
      </div>

      <div v-if="isProcessing" class="loading">
        <p>{{ progressText }}</p>
        <p class="sub">请勿操作窗口，预计需几十秒</p>
      </div>

      <div v-if="finished && !isProcessing" class="done">
        <p>已执行完成！请选择导出文件夹位置，系统将生成 ok.zip</p>
        <button class="btn" @click="exportOkZip">选择导出位置</button>
      </div>
      <ol>
        <li><img src="./img/SaveGameEdit/ok.png" alt="" /></li>
        <li>将这个  ok.zip  的压缩包，通过dbi，传输到你switch的   <span class="file-path">/1. SD卡:/JKSV/The Legend of Zelda Tears of the Kingdom/</span>    文件夹</li>
        <li>
          进入【相册】-【JKSV】-【你玩王泪的用户】-【选中 ok.zip】，先按一下 Y，再长按A  5秒，将存档导入你的游戏<br />
          <img src="./img/SaveGameEdit/导入游戏.png"/>
        </li>
        <li>进游戏，如果你的材料里出现：<span class="file-path">左纳尼乌姆  999999 </span>就代表存档修改成功了，所有步骤结束</li>
      </ol>
    </div>

    <div class="guide">
      <ol>
        <li>上面的所有步骤是为了：
          <ol> 
            <li>解锁你游戏进度到：完成  12块设计石板+依盖队34张设计图 的任务</li>
            <li>帮你直接拿到蓝图，自动建造功能（就是游戏在中央大废矿那里拿的，拿到后会出现依盖队的）</li>
            <li>在 左纳乌装置 栏，帮你直接拿到所有 左纳乌装置 材料，并且设置数量为 888，寓意你和我都会发财</li>
            <li>在材料包里，附送你  左纳尼乌姆  999999  方便你建高达，也寓意我们的发财会长长久久</li>
            <li>将你的电池，直接升级为最顶级的电池</li>
          </ol>
        </li>
        <li>所以，上述步骤，只要做一遍就可以了，如果你只想要其中的一部分东西，可以自行使用：存档修改-大师版</li>
        <li>如果觉得作者的软件实用，可以点 【左侧】的【联系作者】，在里面【请作者喝奶茶】</li>
      </ol>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SaveGameEditBendan',
  data() {
    return {
      isProcessing: false,
      finished: false,
      zipPath: null,
      progressText: ''
    }
  },
  computed: {},
  methods: {
    async handleEditSave() {
      try {
        if (!window.electronAPI) return;
        const picked = await window.electronAPI.selectSaveZip();
        if (!picked) return;
        this.zipPath = picked;
        this.isProcessing = true;
        this.finished = false;
        this.progressText = '初始化...';
        // 监听进度
        window.electronAPI.onSaveEditProgress((payload) => {
          if (!payload) return;
          if (payload.stage === 'init') {
            this.progressText = payload.message || '解压中...';
          } else if (payload.stage === 'processing') {
            const step = payload.step || '';
            this.progressText = `正在执行 ${payload.slot || ''} - ${step}...`;
          } else if (payload.stage === 'zipping') {
            this.progressText = '正在打包 ok.zip...';
          } else if (payload.stage === 'done') {
            this.progressText = '已完成';
            this.isProcessing = false;
            this.finished = true;
          } else if (payload.stage === 'error') {
            this.isProcessing = false;
            this.finished = false;
            alert('处理失败：' + (payload.error || '未知错误'));
          }
        });
        const res = await window.electronAPI.processSaveZip(this.zipPath);
        if (!res || !res.success) {
          throw new Error(res && res.error ? res.error : '未知错误');
        }
      } catch (e) {
        this.isProcessing = false;
        this.finished = false;
        alert('处理失败：' + (e && e.message ? e.message : '未知错误'));
      }
    },
    async exportOkZip() {
      if (!this.zipPath || !window.electronAPI) return;
      const result = await window.electronAPI.exportOkZip(this.zipPath);
      if (result && result.success) {
        alert('已导出：' + result.output);
        this.finished = false;
      } else {
        alert('导出失败：' + (result && result.error ? result.error : '未知错误'));
      }
    }
  },
  beforeDestroy() {}
}
</script>

<style scoped>
.savegame-edit-container {
  padding: 40px;
}

.header {
  border-bottom: 1px solid #dcdfe6;
  margin-bottom: 20px;
}

.title {
  text-align: left;
  padding-left: 36px;
  line-height: 36px;
  margin: 0;
}

.guide {
  background: #fff;
  border-radius: 6px;
  padding: 16px 24px;
  margin: 10px 20px 20px 20px;
  color: #303133;
}

.guide ol {
  margin: 0;
  text-align: left;
}

.guide li {
  margin: 8px 0;
  line-height: 1.6;
  list-style: disc;
}

.actions {
  display: flex;
  justify-content: center;
  margin: 10px 0 20px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-primary {
  background-color: #409eff;
  color: white;
}

.btn-primary:disabled {
  background-color: #c0c4cc;
  cursor: not-allowed;
}

.loading, .done {
  text-align: center;
  color: #606266;
}

.sub {
  font-size: 12px;
  color: #909399;
}
.file-path {
  background: #e7e9ec;
  padding: 5px 12px;
  border-radius: 6px;
}
</style>



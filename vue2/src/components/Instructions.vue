<template>
  <div class="instructions-container">
    <!-- 第一部分：标题与下划线 -->
    <div class="instructions-header">
      <h3 class="instructions-title">使用说明</h3>
    </div>

    <!-- 第二部分：软件说明 -->
    <div class="section">
      <h4 class="section-title">软件说明：</h4>
      <div class="section-content">
        <ol class="content-list">
          <li>软件我写完，是完全免费分享出来的，不要钱！不要钱！不要钱！</li>
          <li>如果你认可我的程序，请在左侧菜单栏的【联系作者】里，请作者喝奶茶</li>
        </ol>
      </div>
    </div>

        <!-- 第四部分：B站教程链接 -->
    <div class="section">
      <div class="section-content">
        <p>使用教程视频版</p>
        <p>使用教程视频b站版：<a href="https://www.bilibili.com/xxxx" target="_blank" class="link">todo:https://www.bilibili.com/xxxx</a></p>
        <p>因为本人不玩b站，在此特别感谢b站up主：<span class="up-name"> Hahappify-开心</span>  帮忙发的视频，让更多的人可以看到这个软件</p>
        <p>&nbsp;</p>
        <p>抖音版：<a href="https://v.douyin.com/tO47-NjlfJY/" target="_blank" class="link">https://v.douyin.com/tO47-NjlfJY/</a></p>
      </div>
    </div>

    <!-- 第三部分：使用说明 -->
    <div class="section">
      <h4 class="section-title">使用教程文字版：</h4>
      <div class="section-content">
        <ol class="content-list">
          <li>利用存档修改-小白版，把你的游戏进度，改到 解锁12块设计石板+34依盖队设计图的地步</li>
          <li>在【蓝图列表】单击你喜欢的蓝图收藏，在【我的收藏】里，点【导出到游戏】，把mod文件，导出到你的电脑上；</li>
          <li>
            把那个 Game 的文件夹，导入到你的switch目录里；
            <div class="file-path-block">
              具体目录路径为：<span class="file-path">/1. SD卡:/atmosphere/contents/0100F2C0115B6000/romfs/Game/</span>
            </div>
            <div class="note-text">
              如果你的 contents 文件夹里，没有 0100F2C0115B6000 文件夹，就自行创建，romfs同理
            </div>
          </li>
        </ol>
      </div>
    </div>

    <!-- 第五部分：常见问题解答 -->
    <div class="section">
      <h4 class="section-title">常见问题解答：</h4>
      <div class="section-content">
        <div class="faq-item">
          <div class="faq-question">- 如何超快/更方便的使用这个mod？（省去数据线连电脑 和 选择switch文件目录的过程）</div>
          <div class="faq-answer">
            <div class="faq-answer-item">- 在你的switch上安装ftpsrv插件</div>
            <div class="faq-answer-item">- 在你的电脑上安装FlashFXP软件</div>
            <div class="faq-answer-item">- 上面2个软件的作用，是让你的 电脑 和 switch在不用连数据线的情况下，只要在同一个wifi，就可以互相传文件。</div>
            <div class="faq-answer-item">- 但是，还有一个选择文件夹的过程，这样太麻烦了。所以，下一步解决这个麻烦。</div>
            <div class="faq-answer-item">- FlashFXP的软件，在上方菜单选【站点】-【站点管理器】，新建一个 swichLantu 的站点。</div>
            <div class="faq-answer-item">- 如图所示，设置好你switch的对应连接；最关键的是要设置好【远程路径 - 对应你switch王泪的mod路径】，【本地路径-对应你的mod路径】</div>
            <div class="faq-answer-item"><img src="./img/ftp.png" alt=""></div>
            <div class="faq-answer-item">- 这样就大功告成啦，下次点一下传输，就一键传输了！不懂 switch大气层ftpsrv软件  和  电脑FlashFXP软件 的，自行百度</div>
          </div>
        </div>

        <div class="faq-item">
          <div class="faq-question">- 这软件有什么用？</div>
          <div class="faq-answer">
            <div class="faq-answer-item">- 这软件可以为switch硬破机 或者 模拟器，解决王国之泪，收藏蓝图只有8张的限制，新增46张蓝图；</div>
            <div class="faq-answer-item">- 这软件，可以为无法建造出 完美MK2，蝙蝠侠战车等高达的玩家，直接勾选 蓝图，实现能用蓝图；</div>
            <div class="faq-answer-item">- 这软件，提供 塞尔达王国之泪存档修改器，方便你修改材料数据等，代替你肝材料的过程；（对应左侧菜单栏的 存档修改大师版，当然外网也有大神的这个，可是需要翻墙，这个是本地的速度更快，断网也可以使用）</div>
          </div>
        </div>

        <div class="faq-item">
          <div class="faq-question">- 假如我选了40张蓝图，我现在想在中间插入一张蓝图在第21张，我必须要先取消20张蓝图的勾选，重新选一次么？</div>
          <div class="faq-answer">
            <div class="faq-answer-item">- 不用，【我的收藏】界面，点编辑后，是可以利用拖拽，直接更改蓝图排序位置，自定义排序的</div>
          </div>
        </div>

        <div class="faq-item">
          <div class="faq-question">- 外网采集的蓝图，因为太多没时间测分类，这个蓝图功能没分类，我怎么知道有什么用？</div>
          <div class="faq-answer">
            <div class="faq-answer-item">- 这是采集外网：https://www.hyruleworks.com/?content=has_blueprint 的蓝图，你看对应的蓝图介绍里，有没有写对这个蓝图的介绍，名字我保持了与采集网页里一样的标题。</div>
          </div>
        </div>

        <div class="faq-item">
          <div class="faq-question">- 这软件，哪些机器可以用？</div>
          <div class="faq-answer">
            <div class="faq-answer-item">- 直接用：switch硬破机器大气层19的系统</div>
            <div class="faq-answer-item">- 应该也可以用的：switch的模拟器</div>
            <div class="faq-answer-item">- 用起来需要些小修改的：switch大气层20的系统，这个系统主要是运存不够，运行王泪的一些mod，会出现黑屏死机情况，需要修改运存。但我还是更推荐大气层19系统玩；</div>
          </div>
        </div>

        <div class="faq-item">
          <div class="faq-question">- 我是正版ns1、ns2，没破解的，可以用么？</div>
          <div class="faq-answer">
            <div class="faq-answer-item">绝对用不了</div>
          </div>
        </div>

        <div class="faq-item">
          <div class="faq-question">- 我是模拟器 或者 硬破switch20的大气层系统，我很想用，但是使用过程中遇到问题，可以用么？</div>
          <div class="faq-answer">
            <div class="faq-answer-item">- 可以，因为作者是用 19大气层玩的，如果你是模拟器 或者 20大气层系统，真的很想用，你进QQ群：1051287661，找我，我会免费做模拟器 和 20大气层系统的支持；</div>
            <div class="faq-answer-item">- 但是，因为说不定根本没人想用这个，所以我现在自己能玩了，又把软件分享出来做了教程了，我就不花时间鼓捣 模拟器 和 20大气层的支持问题了；</div>
            <div class="faq-answer-item">- q群如果找不到我，就根据左侧菜单栏的【联系作者】找我</div>
          </div>
        </div>

        <div class="faq-item">
          <div class="faq-question">- 我用一个新的王泪账号，用存档修改后，打开 自动构建的蓝图功能，提示：设计图尚未登记</div>
          <div class="faq-answer">
            <div class="faq-answer-item">- 这个主要是你一次究极手功能都没使用过，你打开 背包里的 【左那乌装置】随便拿出一个【翼】+【电风扇】，用究极手组合下，就不会了</div>
          </div>
        </div>

        <div class="faq-item">
          <div class="faq-question">- 我是switch大气层20的虚拟系统，使用后，王国之泪这个游戏打不开了，怎么修复；</div>
          <div class="faq-answer">
            <div class="faq-answer-item">- 不用卸载游戏！这是因为20的系统运存变小了，一些王泪mod用不了，你进 <span class="file-path">/1. SD卡:/atmosphere/contents/0100F2C0115B6000/romfs/Game/</span> 目录，把 /Game/ 这个mod目录文件夹删除就行了</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Instructions'
}
</script>

<style scoped>
.instructions-container {
  padding: 40px;
}

/* 第一部分：标题与下划线 */
.instructions-header {
  border-bottom: 1px solid #dcdfe6;
  margin-bottom: 20px;
}

.instructions-title {
  text-align: left;
  padding-left: 36px;
  line-height: 36px;
  margin: 0;
  color: #303133;
}

/* 第二部分到第五部分：通用样式 */
.section {
  background: #fff;
  border-radius: 6px;
  padding: 20px 24px;
  margin: 10px 20px 20px 20px;
  color: #303133;
}

.section-title {
  text-align: left;
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.section-content {
  text-align: left;
}

/* 列表样式 */
.content-list {
  margin: 0;
  padding-left: 20px;
}

.content-list li {
  margin: 12px 0;
  line-height: 1.8;
  color: #606266;
}

/* 文件路径样式 */
.file-path-block {
  margin: 12px 0 12px 20px;
}

.file-path {
  background: #e7e9ec;
  padding: 5px 12px;
  border-radius: 6px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: #303133;
}

.note-text {
  margin: 8px 0 8px 20px;
  color: #909399;
  font-size: 14px;
}

/* 链接样式 */
.link {
  color: #409eff;
  text-decoration: none;
}

.link:hover {
  text-decoration: underline;
}

/* 常见问题样式 */
.faq-item {
  margin: 20px 0;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
}

.faq-item:last-child {
  border-bottom: none;
}

.faq-question {
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
  font-size: 15px;
}

.faq-answer {
  margin-left: 20px;
}

.faq-answer-item {
  margin: 8px 0;
  line-height: 1.8;
  color: #606266;
}
.up-name {
  color: rgb(226, 145, 158);
}
</style>

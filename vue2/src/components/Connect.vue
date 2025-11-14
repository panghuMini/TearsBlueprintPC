<template>
  <div class="connect-container">
    <!-- 第一部分：标题与下划线 -->
    <div class="connect-header">
      <h3 class="connect-title">联系作者</h3>
    </div>

    <!-- 第二部分：感谢 -->
    <div class="section">
      <h4 class="section-title">特别感谢：</h4>
      <div class="section-content">
        <p></p>
        <ul class="contact-list">
          <li>因为本人不玩b站，在此特别感谢b站up主：<span class="up-name"> Hahappify</span>  帮忙发的视频，让更多的人可以看到这个软件</li>
          <li>下面是b站知名up主：<span class="up-name">Hahappify</span>的qq群：1072063540 可以到里面找我反馈优化建议</li>
        </ul>
      </div>
    </div>

    <!-- 第二部分：联系作者 -->
    <div class="section">
      <h4 class="section-title">联系作者：</h4>
      <div class="section-content">
        <p>如果你遇到软件bug、或者改进建议，请通过以下方式联系作者：</p>
        <ul class="contact-list">
          <li>qq群：1072063540 找我反馈</li>
          <li>如果Q群消息太多，我没看到，也可以加我抖音免费的粉丝群，和我反馈，下面是我的抖音</li>
          <li>我的抖音抖音号是：<span class="highlight">panghuMini</span> 可以给我点个关注么？</li>
          <li>
            <img src="./img/dy.png"  class="qr-code-image" width="300px"/>
          </li>
        </ul>
      </div>
    </div>

    <!-- 第三部分：想说的话 -->
    <div class="section">
      <h4 class="section-title">想说的话：</h4>
      <div class="section-content">
        <p>这个软件是完全免费的，<strong>不要钱不要钱不要钱！</strong></p>
        
        <p>我因为最近玩王泪，为了方便自己使用蓝图功能写了这个，也是免费分享给大家的；</p>
        
        <p>一开始只为了自己使用，只用了半小时不到，搭建了电脑方便自己用的版本，是用excel来记录蓝图和更换的；</p>
        
        <p>可为了分享给大家，可视化，方便大家使用，后续又花了将近5天时间；</p>
        
        <p>构思软件应该是怎么样的，才方便大家使用，不断测试、使用、写使用教程 和 使用视频，改bug；</p>
        
        <p>真的很喜欢 <strong>塞尔达旷野之息，塞尔达王国之泪</strong> 这2部作品，也很想说：<strong>旷野是天，塞尔达是天外天；</strong></p>
        
        <p>因为站在我的立场来说，我喜欢旷野，但也的确更喜欢 <strong>王国之泪</strong> 这款游戏；</p>
        
        <p>王国之泪，的确是一款自由度很高的游戏，没想到，我只是想玩游戏，竟然不知不觉的，从游戏里，玩到了游戏之外的编程。</p>
        
        <p>我目前旷野之息是200小时左右的进度，王泪是20~30小时的进度，玩到蓝图这块，不知不觉就来写这个软件了。</p>
        
        <p>另外，在天外天以外，其实也有很多好游戏，塞尔达并非游戏世界的全部，推荐我玩过的另外一个神作-vr游戏的天：<strong>半条命alyx</strong>;</p>
        
        <p>它是作者在steam平台玩的，使用的设备是pico4，pico4已经停产了，可以买二手的，vr设备买更贵的也没必要，大概2000就行；</p>
        
        <p>最后，如果你支持作者的软件，可以用下面的支付宝/微信二维收款码，请作者喝奶茶</p>
      </div>
    </div>

    <!-- 第四部分：支付宝/微信二维码收款码 -->
    <div class="section">
      <h4 class="section-title">支付宝/微信二维码收款码：</h4>
      <div class="qr-code-section">
        <div class="qr-code-placeholder">
          <div class="qr-code-text">
            <img src="./img/zfb.png"  class="qr-code-image" style="margin-right: 20px; width: 300px;"/>
            <img src="./img/vx.png"  class="qr-code-image" style="margin-right: 20px; width: 300px;"/>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Connect'
}
</script>

<style scoped>
.connect-container {
  padding: 40px;
}

/* 第一部分：标题与下划线 */
.connect-header {
  border-bottom: 1px solid #dcdfe6;
  margin-bottom: 20px;
}

.connect-title {
  text-align: left;
  padding-left: 36px;
  line-height: 36px;
  margin: 0;
  color: #303133;
}

/* 第二部分到第四部分：通用样式 */
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

.section-content p {
  margin: 12px 0;
  line-height: 1.8;
  color: #606266;
}

/* 联系列表样式 */
.contact-list {
  margin: 12px 0;
  padding-left: 20px;
}

.contact-list li {
  margin: 8px 0;
  line-height: 1.8;
  color: #606266;
}

.highlight {
  color: #409eff;
  font-weight: 600;
}

/* 二维码区域样式 */
.qr-code-section {
  text-align: center;
  margin: 20px 0;
}

.qr-code-placeholder {
  display: inline-block;
  padding: 40px;
  border: 2px dashed #dcdfe6;
  border-radius: 8px;
  background: #f5f7fa;
  min-width: 200px;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.qr-code-text {
  font-size: 24px;
  color: #909399;
  margin-bottom: 10px;
  font-weight: 600;
}

.qr-code-note {
  font-size: 12px;
  color: #c0c4cc;
  font-style: italic;
}

.up-name {
  color: rgb(226, 145, 158);
}
</style>

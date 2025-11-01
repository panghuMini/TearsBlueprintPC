<template>
  <div class="savegame-edit-container">
    <!-- 第一部分：标题与下划线 -->
    <div class="header">
      <h3 class="title">存档修改&nbsp;&nbsp;&nbsp;&nbsp;大师版</h3>
    </div>
    <div id="game-save-edit">
      <iframe
        ref="editorFrame"
        :src="editorUrl"
        class="editor-iframe"
        frameborder="0"
        @load="onFrameLoad"
      ></iframe>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SaveGameEditDashi',
  data() {
    return {
      editorUrl: ''
    }
  },
  mounted() {
    this.initEditorUrl()
  },
  methods: {
    async initEditorUrl() {
      // 在 Electron 中，通过 IPC 获取编辑器路径
      if (window.electronAPI && window.electronAPI.getEditorPath) {
        try {
          const editorPath = await window.electronAPI.getEditorPath()
          // 将路径转换为 file:// 协议格式
          // Windows 路径需要特殊处理：C:\path\to\file -> file:///C:/path/to/file
          const normalizedPath = editorPath.replace(/\\/g, '/')
          // 如果是绝对路径且以盘符开头（Windows），直接使用
          if (normalizedPath.match(/^[A-Za-z]:/)) {
            this.editorUrl = `file:///${normalizedPath}`
          } else {
            this.editorUrl = `file://${normalizedPath.startsWith('/') ? '' : '/'}${normalizedPath}`
          }
        } catch (e) {
          console.error('获取编辑器路径失败:', e)
          // 降级方案：使用相对路径（可能无法正常工作）
          this.editorUrl = './vendor/savegame-editors/zelda-totk/index.html'
        }
      } else {
        // 非 Electron 环境，使用相对路径
        this.editorUrl = './vendor/savegame-editors/zelda-totk/index.html'
      }
    },
    onFrameLoad() {
      console.log('编辑器页面加载完成')
    }
  }
}
</script>

<style scoped>
.savegame-edit-container {
  padding: 20px;
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
}

.header {
  border-bottom: 1px solid #dcdfe6;
  margin-bottom: 20px;
  flex-shrink: 0;
}

.title {
  text-align: left;
  padding-left: 36px;
  line-height: 36px;
  margin: 0;
}

#game-save-edit {
  flex: 1;
  overflow: hidden;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #fff;
}

.editor-iframe {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
}
</style>



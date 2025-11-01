const { defineConfig } = require('@vue/cli-service')
const path = require('path');


module.exports = defineConfig({
  transpileDependencies: true,
  // 设置为相对路径，适合 Electron 使用
  publicPath: './',
  configureWebpack: {
    resolve: {
      alias: {
        '@public': path.resolve(__dirname, 'public')
      }
    }
  }
})

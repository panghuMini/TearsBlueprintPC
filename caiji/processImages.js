const sharp = require('sharp');
const fs = require('fs-extra');
const path = require('path');

// 配置
const IMG_DIR = path.join(__dirname, '99外网采集的蓝图，因为太多没时间测分类', 'img');
const IMG_DEAL_DIR = path.join(__dirname, '99外网采集的蓝图，因为太多没时间测分类', 'imgDeal');
const TARGET_WIDTH = 320;
const TARGET_HEIGHT = 180;

// 处理单个图片
async function processImage(filePath, toPath) {
  try {
    console.log(`正在处理: ${path.basename(filePath)}`);
    
    // 获取图片信息
    const metadata = await sharp(filePath).metadata();
    console.log(`  原始尺寸: ${metadata.width}x${metadata.height}`);
    
    // 计算缩放比例，保持长宽比
    const scaleX = TARGET_WIDTH / metadata.width;
    const scaleY = TARGET_HEIGHT / metadata.height;
    const scale = Math.min(scaleX, scaleY); // 使用较小的比例确保图片完全放入目标尺寸
    
    const newWidth = Math.round(metadata.width * scale);
    const newHeight = Math.round(metadata.height * scale);
    
    console.log(`  缩放后尺寸: ${newWidth}x${newHeight}`);
    
    // 计算居中位置
    const offsetX = Math.round((TARGET_WIDTH - newWidth) / 2);
    const offsetY = Math.round((TARGET_HEIGHT - newHeight) / 2);
    
    console.log(`  居中偏移: x=${offsetX}, y=${offsetY}`);
    
    // 创建透明背景画布
    const transparentBackground = {
      r: 0,
      g: 0,
      b: 0,
      alpha: 0
    };
    
    // 处理图片：缩放并放置在透明画布上
    await sharp(filePath)
      .resize(newWidth, newHeight, {
        fit: 'fill', // 精确尺寸
        background: transparentBackground
      })
      .extend({
        top: offsetY,
        bottom: TARGET_HEIGHT - newHeight - offsetY,
        left: offsetX,
        right: TARGET_WIDTH - newWidth - offsetX,
        background: transparentBackground
      })
      .png()
      .toFile(toPath); // 覆盖原文件
    
    console.log(`  ✅ 处理完成: ${path.basename(filePath)}`);
    
  } catch (error) {
    console.error(`  ❌ 处理失败 ${path.basename(filePath)}:`, error.message);
  }
}

// 主处理函数
async function processAllImages() {
  try {
    console.log('开始处理图片...');
    console.log(`目标目录: ${IMG_DIR}`);
    console.log(`目标尺寸: ${TARGET_WIDTH}x${TARGET_HEIGHT}`);
    
    // 检查目录是否存在
    if (!await fs.pathExists(IMG_DIR)) {
      console.error(`目录不存在: ${IMG_DIR}`);
      return;
    }
    
    // 读取所有图片文件
    const files = await fs.readdir(IMG_DIR);
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp'].includes(ext);
    });
    
    console.log(`找到 ${imageFiles.length} 个图片文件`);
    
    if (imageFiles.length === 0) {
      console.log('没有找到图片文件');
      return;
    }
    
    // 处理每个图片
    for (let i = 0; i < imageFiles.length; i++) {
      const fileName = imageFiles[i];
      const filePath = path.join(IMG_DIR, fileName);
      const toPath = path.join(IMG_DEAL_DIR, fileName);
      console.log(`\n[${i + 1}/${imageFiles.length}] 处理: ${fileName}`);
      await processImage(filePath, toPath);
    }
    
    console.log('\n🎉 所有图片处理完成！');
    console.log(`处理了 ${imageFiles.length} 个图片文件`);
    console.log(`所有图片已调整为 ${TARGET_WIDTH}x${TARGET_HEIGHT} 像素，透明背景，内容居中`);
    
  } catch (error) {
    console.error('处理过程中发生错误:', error.message);
  }
}

// 启动处理
if (require.main === module) {
  processAllImages().catch(console.error);
}

module.exports = { processAllImages };
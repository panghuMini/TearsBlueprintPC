const axios = require('axios');
const cheerio = require('cheerio');
const sharp = require('sharp');
const fs = require('fs-extra');
const path = require('path');

// 配置
const BASE_URL = 'https://www.hyruleworks.com';
const TARGET_URLS = [
  'https://www.hyruleworks.com/?content=has_blueprint',
  'https://www.hyruleworks.com/?content=has_blueprint&page=2',
  'https://www.hyruleworks.com/?content=has_blueprint&page=3',
  'https://www.hyruleworks.com/?content=has_blueprint&page=4',
  'https://www.hyruleworks.com/?content=has_blueprint&page=5',
  'https://www.hyruleworks.com/?content=has_blueprint&page=6',
  'https://www.hyruleworks.com/?content=has_blueprint&page=7'
];
const OUTPUT_DIR = path.join(__dirname, '99外网采集的蓝图，因为太多没时间测分类');
const IMG_DIR = path.join(OUTPUT_DIR, 'img');
const CAI_DIR = path.join(OUTPUT_DIR, 'cai');

// 确保输出目录存在
async function ensureDirectories() {
  await fs.ensureDir(IMG_DIR);
  await fs.ensureDir(CAI_DIR);
}

// 延迟函数，避免请求过快
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 下载文件
async function downloadFile(url, filepath) {
  try {
    console.log(`正在下载: ${url}`);
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'stream',
      timeout: 30000
    });

    const writer = fs.createWriteStream(filepath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  } catch (error) {
    console.error(`下载失败 ${url}:`, error.message);
    throw error;
  }
}

// 处理图片，转换为PNG格式并调整大小
async function processImage(inputPath, outputPath, name) {
  try {
    console.log(`正在处理图片: ${name}`);
    
    // 使用sharp处理图片
    await sharp(inputPath)
      .resize(320, 180, {
        fit: 'inside',
        withoutEnlargement: true,
        background: { r: 0, g: 0, b: 0, alpha: 0 } // 透明背景
      })
      .png()
      .toFile(outputPath);
    
    console.log(`图片处理完成: ${name}`);
  } catch (error) {
    console.error(`图片处理失败 ${name}:`, error.message);
    throw error;
  }
}

// 清理文件名，移除非法字符
function sanitizeFileName(name) {
  return name.replace(/[<>:"/\\|?*]/g, '_').trim();
}

// 采集单个蓝图详情页
async function crawlBlueprintDetail(detailUrl, name) {
  try {
    console.log(`正在采集详情页: ${name}`);
    
    const response = await axios.get(detailUrl, {
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    
    // 查找cai下载链接
    const caiLink = $('a[download$=".cai"]').attr('href');
    
    if (!caiLink) {
      console.log(`未找到cai文件: ${name}`);
      return;
    }
    
    const caiFileName = `${sanitizeFileName(name)}.cai`;
    const caiPath = path.join(CAI_DIR, caiFileName);
    
    // 下载cai文件
    await downloadFile(caiLink, caiPath);
    console.log(`cai文件下载完成: ${caiFileName}`);
    
  } catch (error) {
    console.error(`采集详情页失败 ${name}:`, error.message);
  }
}

// 采集单个页面的蓝图
async function crawlPage(url, pageNum) {
  try {
    console.log(`\n正在采集第 ${pageNum} 页: ${url}`);
    
    const response = await axios.get(url, {
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    
    // 查找所有蓝图项目
    const blueprints = [];
    
    $('.chakra-aspect-ratio.css-a2pzfj').each((index, element) => {
      const $element = $(element);
      
      // 查找图片
      const imgElement = $element.find('img').first();
      const imgSrc = imgElement.attr('src');
      
      // 查找标题链接
      const linkElement = $element.closest('.chakra-linkbox').find('a.chakra-linkbox__overlay').first();
      const detailPath = linkElement.attr('href');
      const titleElement = linkElement.find('h2').first();
      const name = titleElement.text().trim();
      
      if (imgSrc && detailPath && name) {
        blueprints.push({
          name: name,
          imgSrc: imgSrc.startsWith('http') ? imgSrc : `${BASE_URL}${imgSrc}`,
          detailPath: detailPath.startsWith('http') ? detailPath : `${BASE_URL}${detailPath}`
        });
      }
    });
    
    console.log(`第 ${pageNum} 页找到 ${blueprints.length} 个蓝图项目`);
    return blueprints;
    
  } catch (error) {
    console.error(`采集第 ${pageNum} 页失败:`, error.message);
    return [];
  }
}

// 主采集函数
async function crawlBlueprints() {
  try {
    console.log('开始采集蓝图数据...');
    console.log(`目标页面: ${TARGET_URLS.length} 页`);
    
    // 确保目录存在
    await ensureDirectories();
    
    // 清空输出目录
    console.log('清空输出目录...');
    await fs.emptyDir(IMG_DIR);
    await fs.emptyDir(CAI_DIR);
    
    let allBlueprints = [];
    
    // 采集所有页面
    for (let i = 0; i < TARGET_URLS.length; i++) {
      const url = TARGET_URLS[i];
      const pageNum = i + 1;
      
      const blueprints = await crawlPage(url, pageNum);
      allBlueprints = allBlueprints.concat(blueprints);
      
      // 页面间延迟
      if (i < TARGET_URLS.length - 1) {
        console.log('页面间延迟 5 秒...');
        await delay(5000);
      }
    }
    
    console.log(`\n总共找到 ${allBlueprints.length} 个蓝图项目`);
    
    // 处理每个蓝图
    for (let i = 0; i < allBlueprints.length; i++) {
      const blueprint = allBlueprints[i];
      console.log(`\n处理第 ${i + 1}/${allBlueprints.length} 个: ${blueprint.name}`);
      
      try {
        // 下载并处理图片
        const imgFileName = `${sanitizeFileName(blueprint.name)}.png`;
        const tempImgPath = path.join(IMG_DIR, `temp_${imgFileName}`);
        const finalImgPath = path.join(IMG_DIR, imgFileName);
        
        await downloadFile(blueprint.imgSrc, tempImgPath);
        await processImage(tempImgPath, finalImgPath, blueprint.name);
        
        // 删除临时文件
        await fs.remove(tempImgPath);
        
        // 采集详情页获取cai文件
        await crawlBlueprintDetail(blueprint.detailPath, blueprint.name);
        
        // 延迟避免请求过快
        await delay(10000);
        
      } catch (error) {
        console.error(`处理蓝图失败 ${blueprint.name}:`, error.message);
        continue;
      }
    }
    
    console.log('\n采集完成！');
    console.log(`图片保存到: ${IMG_DIR}`);
    console.log(`cai文件保存到: ${CAI_DIR}`);
    
  } catch (error) {
    console.error('采集过程中发生错误:', error.message);
  }
}

// 启动采集
if (require.main === module) {
  crawlBlueprints().catch(console.error);
}

module.exports = { crawlBlueprints };

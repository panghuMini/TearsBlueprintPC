const fs = require('fs');
const path = require('path');

// 获取指定文件夹下所有文件名的函数
function getFiles(filePath) {
  try {
    const fullPath = path.resolve(__dirname, '../public', filePath);
    const files = fs.readdirSync(fullPath);
    return files.map(file => file.split('.')[0]);
  } catch (err) {
    console.error('Error reading directory:', err);
    return [];
  }
}

// 获取分类文件夹下的所有文件
function getCategoryFiles(categoryName) {
  const categoryPath = path.resolve(__dirname, '../public/lantu', categoryName);
  const files = [];
  
  try {
    // 读取 cai 文件夹
    const caiPath = path.join(categoryPath, 'cai');
    let caiFiles = [];
    if (fs.existsSync(caiPath)) {
      caiFiles = fs.readdirSync(caiPath).filter(f => f.endsWith('.cai'));
    }
    
    // 读取 img 文件夹
    const imgPath = path.join(categoryPath, 'img');
    let imgFiles = [];
    if (fs.existsSync(imgPath)) {
      imgFiles = fs.readdirSync(imgPath).filter(f => f.endsWith('.png'));
    }
    
    // 合并 cai 和 img 文件，按文件名分组
    const fileMap = {};
    
    caiFiles.forEach(file => {
      const baseName = file.replace('.cai', '');
      fileMap[baseName] = fileMap[baseName] || { name: baseName, cai: null, img: null };
      fileMap[baseName].cai = `${categoryName}/cai/${file}`;
    });
    
    imgFiles.forEach(file => {
      const baseName = file.replace('.png', '');
      fileMap[baseName] = fileMap[baseName] || { name: baseName, cai: null, img: null };
      // 对文件名进行URL编码以避免双重编码问题
      const encodedFile = encodeURIComponent(file);
      fileMap[baseName].img = `${categoryName}/img/${encodedFile}`;
    });
    
    // 转换为数组
    files.push(...Object.values(fileMap));
    
  } catch (err) {
    console.error(`Error reading category ${categoryName}:`, err);
  }
  
  return files;
}

// 递归读取 lantu 文件夹的结构
function readLantuDir() {
  const lantuPath = path.resolve(__dirname, '../public/lantu');
  const categories = {};
  
  try {
    const entries = fs.readdirSync(lantuPath, { withFileTypes: true });
    
    entries.forEach(entry => {
      if (entry.isDirectory()) {
        const files = getCategoryFiles(entry.name);
        categories[entry.name] = {
          name: entry.name,
          type: 'category',
          files: files
        };
      }
    });
  } catch (err) {
    console.error('Error reading lantu directory:', err);
  }
  
  return categories;
}

// 生成 manifest
function generateManifest() {
  const manifest = readLantuDir();
  
  const outputPath = path.resolve(__dirname, '../public/manifest.json');
  fs.writeFileSync(outputPath, JSON.stringify(manifest, null, 2));
  console.log('Manifest generated successfully:', outputPath);
}

generateManifest();


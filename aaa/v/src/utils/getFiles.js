// 从生成的 manifest.json 读取文件列表
async function getFiles() {
  try {
    const response = await fetch('/manifest.json');
    const manifest = await response.json();
    return manifest;
  } catch (err) {
    console.error('Error loading manifest:', err);
    return {};
  }
}

// 获取所有 .cai 文件的路径数组
async function getAllCaiFiles() {
  const manifest = await getFiles();
  const caiFiles = [];
  
  // 遍历所有分类
  for (const categoryName in manifest) {
    const category = manifest[categoryName];
    if (category && category.files) {
      category.files.forEach(file => {
        if (file.cai) {
          caiFiles.push(`/lantu/${file.cai}`);
        }
      });
    }
  }
  
  return caiFiles;
}

export { getAllCaiFiles };
export default getFiles;


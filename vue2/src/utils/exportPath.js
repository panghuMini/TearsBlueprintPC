const EXPORT_PATH_KEY = 'lantu_export_path';

// 保存导出路径
export function saveExportPath(path) {
  try {
    localStorage.setItem(EXPORT_PATH_KEY, path);
    return true;
  } catch (e) {
    console.error("Error saving export path to localStorage", e);
    return false;
  }
}

// 读取导出路径
export function loadExportPath() {
  try {
    const path = localStorage.getItem(EXPORT_PATH_KEY);
    return path || null;
  } catch (e) {
    console.error("Error loading export path from localStorage", e);
    return null;
  }
}











// 本地存储工具

const STORAGE_KEY = 'lantu_collections';

export function saveCollections(collections) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(collections));
    return true;
  } catch (err) {
    console.error('保存收藏失败:', err);
    return false;
  }
}

export function loadCollections() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error('加载收藏失败:', err);
    return [];
  }
}

export function getCollectionCount() {
  return loadCollections().length;
}

// 备份相关
const BACKUP_STORAGE_KEY = 'lantu_backups';
const MAX_BACKUPS = 20;

export function saveBackups(backups) {
  try {
    localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(backups));
    return true;
  } catch (err) {
    console.error('保存备份失败:', err);
    return false;
  }
}

export function loadBackups() {
  try {
    const data = localStorage.getItem(BACKUP_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error('加载备份失败:', err);
    return [];
  }
}

export function addBackup(backup) {
  const backups = loadBackups();
  
  // 检查是否超过最大备份数量
  if (backups.length >= MAX_BACKUPS) {
    return { success: false, error: '最多只能创建20个备份' };
  }
  
  // 添加备份
  backup.id = Date.now().toString();
  backup.createdAt = new Date().toISOString();
  backups.push(backup);
  
  saveBackups(backups);
  return { success: true };
}

export function removeBackup(backupId) {
  const backups = loadBackups();
  const index = backups.findIndex(b => b.id === backupId);
  if (index >= 0) {
    backups.splice(index, 1);
    saveBackups(backups);
    return { success: true };
  }
  return { success: false, error: '备份不存在' };
}

export function updateBackup(backupId, backup) {
  const backups = loadBackups();
  const index = backups.findIndex(b => b.id === backupId);
  if (index >= 0) {
    backups[index] = { ...backups[index], ...backup };
    saveBackups(backups);
    return { success: true };
  }
  return { success: false, error: '备份不存在' };
}

export function renameBackup(backupId, newName) {
  const backups = loadBackups();
  const index = backups.findIndex(b => b.id === backupId);
  if (index >= 0) {
    backups[index].name = newName;
    saveBackups(backups);
    return { success: true };
  }
  return { success: false, error: '备份不存在' };
}



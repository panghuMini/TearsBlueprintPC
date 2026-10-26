export const LIMITS = { '19': 46, '20': 30 };
// NAS HTTP origins do not expose randomUUID; getRandomValues also works there.
export function createId() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 15) | 64;
  bytes[8] = (bytes[8] & 63) | 128;
  const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
}
export const VIDEOS = {
  '19': { id: '7567295735830514986', url: 'https://v.douyin.com/KLK_OrD4nJA/', bilibili: 'https://www.bilibili.com/video/BV1DX1GBeE8S/' },
  '20': { id: '7567973022204693801', url: 'https://v.douyin.com/XV9mihtqIow/', bilibili: 'https://www.bilibili.com/video/BV18NyoBpE2r/' }
};
export const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
export function assetURL(path, encoded = false) {
  return './lantu/' + path.split('/').map(part => encodeURIComponent(encoded ? decodeURIComponent(part) : part)).join('/');
}
export function flattenManifest(manifest) {
  return Object.entries(manifest).flatMap(([category, value]) => value.files.filter(f => f.cai).map(f => ({ ...f, id: f.cai, category, categoryName: category.replace(/^\d+/, ''), experimental: parseInt(category) >= 31 })));
}
export function validateState(raw, mode, ids) {
  if (!raw || typeof raw !== 'object' || !Array.isArray(raw.collection) || !Array.isArray(raw.backups)) throw new Error('收藏备份文件格式不正确');
  const check = list => {
    if (!Array.isArray(list) || list.length > LIMITS[mode] || new Set(list).size !== list.length || list.some(id => !ids.has(id))) throw new Error('备份包含未知蓝图、重复蓝图或超出当前版本上限');
    return [...list];
  };
  if (raw.backups.length > 20) throw new Error('最多可保存 20 套备份');
  const names = new Set();
  const backupIds = new Set();
  const backups = raw.backups.map(b => {
    if (!b || typeof b.name !== 'string' || !b.name.trim() || b.name.length > 30 || names.has(b.name.trim()) || typeof b.id !== 'string' || backupIds.has(b.id)) throw new Error('备份名称或编号不正确');
    names.add(b.name.trim()); backupIds.add(b.id);
    return { id: b.id, name: b.name.trim(), items: check(b.items), createdAt: typeof b.createdAt === 'string' ? b.createdAt : '' };
  });
  return { collection: check(raw.collection), backups };
}
export function readState(storage, mode, ids, recommended) {
  const saved = storage.getItem('tears-web-v1-' + mode);
  if (saved) return validateState(JSON.parse(saved), mode, ids);
  return { collection: [], backups: [{ id: 'recommended-' + mode, name: '作者推荐', items: recommended, createdAt: '' }] };
}
export function moveItem(items, from, to) {
  const result = [...items];
  if (from < 0 || from >= result.length || to < 0 || to >= result.length) return result;
  result.splice(to, 0, result.splice(from, 1)[0]);
  return result;
}
export function validateCAI(bytes) {
  if (![6688, 6712, 7840].includes(bytes.length) || String.fromCharCode(...bytes.subarray(0, 6)) !== 'CmbAct') throw new Error('蓝图不是有效的 CAI 文件');
  return bytes;
}

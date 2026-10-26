import { unzip, zip, strToU8 } from './lib/fflate.js';
import { validateCAI, assetURL } from './core.js';
const MAX_ZIP = 128 * 1024 * 1024;
const MAX_EXPANDED = 256 * 1024 * 1024;
export function unpack(bytes) {
  if (bytes.length > MAX_ZIP) return Promise.reject(new Error('压缩包超过 128 MB，请只选择王泪存档备份'));
  let total = 0, count = 0, problem;
  return new Promise((resolve, reject) => unzip(bytes, { filter(file) {
    const name = file.name;
    if (++count > 4096 || (total += file.originalSize) > MAX_EXPANDED || file.originalSize > 32 * 1024 * 1024) problem = '压缩包解压体积过大';
    if (name.includes('\\') || name.startsWith('/') || name.split('/').includes('..') || /^[A-Za-z]:/.test(name) || name.includes('\0') || ['__proto__', 'constructor', 'prototype'].includes(name)) problem = '压缩包包含不安全的文件路径';
    return !problem;
  } }, (error, entries) => error || problem ? reject(new Error(problem || 'ZIP 无法解压或已损坏')) : resolve(entries)));
}
export const pack = entries => new Promise((resolve, reject) => zip(entries, { level: 6 }, (error, data) => error ? reject(error) : resolve(data)));
export function findSlots(entries) {
  const slots = Object.keys(entries).filter(path => /(^|\/)slot_0[0-5]\/progress\.sav$/i.test(path)).map(path => ({ path, name: path.split('/').slice(-2, -1)[0], prefix: path.slice(0, -'progress.sav'.length) }));
  if (!slots.length && entries['progress.sav']) slots.push({ path: 'progress.sav', name: '单个存档', prefix: '' });
  if (!slots.length) throw new Error('未找到 slot_00～slot_05/progress.sav，请选择 JKSV 导出的王泪存档 ZIP');
  const roots = new Set(slots.map(s => s.prefix.replace(/slot_0[0-5]\/$/, '')));
  if (roots.size > 1) throw new Error('压缩包包含多套存档，请每次只导入一套备份');
  return slots.sort((a, b) => a.path.localeCompare(b.path));
}
export function captionImage(bytes) {
  if (!bytes || bytes.length < 0x1c0) return null;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  for (let i = 0x28; i < 0x1c0; i += 8) {
    if (view.getUint32(i, true) !== 0x63696a32) continue;
    const offset = view.getUint32(i + 4, true);
    if (offset + 4 > bytes.length) return null;
    const size = view.getUint32(offset, true);
    if (size < 3 || offset + 4 + size > bytes.length) return null;
    const jpg = bytes.slice(offset + 4, offset + 4 + size);
    return jpg[0] === 255 && jpg[1] === 216 ? jpg : null;
  }
  return null;
}
export async function fetchBytes(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error('资源下载失败，请检查网络后重试：' + decodeURI(url));
  return new Uint8Array(await response.arrayBuffer());
}
export async function makeMod(items, targets, get = fetchBytes, progress = () => {}) {
  if (!items.length || items.length > 46 || targets.length !== 46) throw new Error('19 版需要选择 1～46 个蓝图');
  const entries = {}, mapping = [];
  for (let i = 0; i < targets.length; i++) {
    const item = items[i], target = targets[i];
    entries[`Game/BluePrint/CombinedActorInfo/${target}.cai`] = validateCAI(await get(item ? assetURL(item.cai) : `./Game/BluePrint/CombinedActorInfo/${target}.cai`));
    // A missing source image is a visible placeholder, never an unrelated old preview.
    entries[`Game/BluePrint/Texture/${target}.png`] = await get(item ? item.img ? assetURL(item.img, true) : './missing-preview.png' : `./Game/BluePrint/Texture/${target}.png`);
    mapping.push({ slot: i + 1, target, blueprint: item?.name || '原始蓝图' });
    progress(i + 1, 46);
  }
  entries['蓝图对应表.json'] = strToU8(JSON.stringify(mapping, null, 2));
  entries['使用说明.txt'] = strToU8('王泪蓝图自由 · 大气层19及以下 / 模拟器\n这是与桌面版相同结构的46位蓝图资源包，不包含依盖队基础mod。\n先按教程安装对应游戏版本的依盖队蓝图mod，再将本包Game文件夹覆盖到原mod中Game的同级位置。\n未选满46项时，其余位置恢复为原始蓝图。请保留原始mod和游戏存档备份。\n教程：https://v.douyin.com/KLK_OrD4nJA/\n');
  return entries;
}

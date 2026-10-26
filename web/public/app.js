import { createId, LIMITS, VIDEOS, escapeHTML as e, assetURL, flattenManifest, readState, validateState, moveItem } from './core.js';
import { unpack, pack, findSlots, captionImage, fetchBytes, makeMod } from './archive.js';

const main = document.querySelector('#main'), modal = document.querySelector('#modal');
let catalog = [], byId = new Map(), config, states = {}, mode = '19', page = 'library';
let query = '', category = 'all', pageNumber = 1, sort = 'default', selection = new Set(), editing = false;
let detailId = null, session = null, exportIds = null, exportName = '', busy = false, lastHash = location.hash, resultURL = null, resultName = '', toastTimer, dragId = null;
const pageSize = 30;
const saveOptions = Object.fromEntries(['19','20'].map(m => [m, { unlock:true, battery:true, materials:true, devices:true, allSlots:true, protectFavorites:true }]));
const icon = '<span aria-hidden="true">↗</span>';
const button = (action, text, cls = 'secondary', extra = '') => `<button class="${cls}" data-act="${action}" ${extra}>${text}</button>`;
function toast(text) { const el = document.querySelector('#toast'); el.textContent = text; el.classList.add('visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('visible'), 4200); }
function openModal(title, body, actions = '') { modal.innerHTML = `<div class="modal-head"><h2 id="modal-title">${e(title)}</h2>${button('close', '×', 'close-modal', 'aria-label="关闭"')}</div>${body}${actions ? `<div class="modal-actions">${actions}</div>` : ''}`; if (!modal.open) modal.showModal(); }
function closeModal() { modal.close(); modal.innerHTML = ''; }
modal.addEventListener('click', event => { if (event.target === modal) closeModal(); });
modal.addEventListener('cancel', () => { modal.innerHTML = ''; });
function save(next) { localStorage.setItem('tears-web-v1-' + mode, JSON.stringify(next)); states[mode] = next; }
function change(fn) { const next = structuredClone(states[mode]); fn(next); save(next); }
function ids() { return detailId ? states[mode].backups.find(b => b.id === detailId)?.items || [] : states[mode].collection; }
function replaceIds(list) { change(s => { if (detailId) s.backups.find(b => b.id === detailId).items = list; else s.collection = list; }); }
function download(data, filename, type = 'application/octet-stream') {
  const url = URL.createObjectURL(new Blob([data], { type })); const link = document.createElement('a'); link.href = url; link.download = filename; link.click(); setTimeout(() => URL.revokeObjectURL(url), 60000);
}
function route(target) { location.hash = target; }
function markBusy(value) { busy = value; main.setAttribute('aria-busy', String(value)); main.querySelectorAll('button,input,select').forEach(el => { if (value) el.disabled = true; }); }
function progress(text, n, total) { const el = document.querySelector('#operation-progress'); if (el) el.innerHTML = `<div class="progress-panel" role="status">${e(text)}${total ? `<progress value="${n}" max="${total}"></progress>` : ''}</div>`; }
function modeDescription(m) { return m === '19' ? '19 及以下 · 模拟器 / 46 个 mod 替换位，图片同步更新' : '20 及以上 / 最多 30 条历史记录，图片保持原样'; }
function art() { return `<div class="hero-art" aria-hidden="true"><svg viewBox="0 0 480 340" fill="none"><circle cx="245" cy="166" r="130" stroke="#a7b69b" stroke-width=".7" stroke-dasharray="3 6"/><circle cx="245" cy="166" r="106" stroke="#c9d4bd" stroke-width=".7"/><path d="M65 166h360M245 24v280" stroke="#b9c6ad" stroke-width=".7"/><g transform="translate(245 174) rotate(-22)"><path d="M-99 0 0-32 105 0 0 34Z" fill="#40674d" stroke="#bac5a4" stroke-width="2"/><path d="M-99 0v14L0 49 105 14V0L0 34Z" fill="#284e3d" stroke="#c2cdad" stroke-width="1.5"/><path d="M0-32v66M-75 8 25-24M-49 17 53-15M-22 26 80-8" stroke="#86a17a"/><g transform="translate(-78 -25)"><ellipse cy="7" rx="41" ry="22" fill="#45664b" stroke="#aebd91" stroke-width="2"/><ellipse cy="-5" rx="41" ry="22" fill="#c8d6af" stroke="#426249" stroke-width="2"/><ellipse cy="-5" rx="28" ry="14" fill="#6e8f61"/><path d="M-23-9 20 3M-11-17 10 8M10-17-10 8M23-9-20 3" stroke="#bdcba4" stroke-width="4"/><ellipse cy="-5" rx="7" ry="5" fill="#2e5440"/></g><g transform="translate(78 4)"><ellipse cy="7" rx="41" ry="22" fill="#45664b" stroke="#aebd91" stroke-width="2"/><ellipse cy="-5" rx="41" ry="22" fill="#c8d6af" stroke="#426249" stroke-width="2"/><ellipse cy="-5" rx="28" ry="14" fill="#6e8f61"/><path d="M-23-9 20 3M-11-17 10 8M10-17-10 8M23-9-20 3" stroke="#bdcba4" stroke-width="4"/><ellipse cy="-5" rx="7" ry="5" fill="#2e5440"/></g><path d="M0 6v-51l16-5 4 12-14 4v39" stroke="#c4d1ac" stroke-width="7" stroke-linejoin="round"/><path d="m-9 6 18 6 13-4-18-7Z" fill="#d0d7a8"/><path d="m-16 28 11 4M15 31l10-4" stroke="#d7b668" stroke-width="3"/></g><path d="m118 134-30-40H45m294 85 40 30h55M245 235v45h62" stroke="#819c78" stroke-width=".8"/><text x="40" y="81" class="art-label">ZONAI ENGINEERING</text><text x="335" y="228" class="art-label">AUTOBUILD / 001</text><text x="260" y="296" class="art-label">IMAGINE. BUILD. EXPLORE.</text><path d="m385 60 6 10 6-10-6-10Z" fill="#b29a5e"/><circle cx="83" cy="248" r="3" fill="#b29a5e"/></svg></div>`; }
function versionCard(m) {
  const old = m === '19';
  return `<article class="version-card ${old ? 'mod' : 'history'}"><div class="version-body"><div class="version-kicker"><span>${old ? 'SCHEMATIC MOD' : 'SAVE HISTORY'}</span><span>${old ? '持久蓝图方案' : '历史记录方案'}</span></div><div class="version-title"><span class="version-number">${m}</span><div><h3>大气层 ${m}${old ? ' 及以下' : ' 及以上'}</h3><p>${old ? 'Switch 19 及以下系统 · 所有模拟器选此入口' : 'Switch 20 及以上系统选择此入口'}</p></div></div><p class="version-summary">${old ? '解锁自动建造与 46 张图纸进度，再用你选择的蓝图，替换依盖队设计图与设计石板。' : '将选择的蓝图写入存档的蓝图记录。无需替换 mod，直接改变自动建造的实际内容。'}</p><ul class="feature-list">${(old ? ['34 张依盖队设计图 + 12 块设计石板，共 46 个替换位','蓝图内容与预览图片一起更新','替换位可长期保留，另有游戏原本的 8 个收藏位'] : ['最多替换 30 条蓝图记录，可预览并选择存档','蓝图内容改变，游戏里的预览图片不会更新','历史记录会随建造逐渐消失，永久收藏仍只有 8 个']).map(t => `<li>${t}</li>`).join('')}</ul><div class="version-fact">${old ? '46 + 8 个蓝图可保留；游戏收藏栏本身仍为 8 格。' : '看到旧图片是正常的，实际造出来的是你选的新蓝图。'}</div><a class="primary full" href="#/${m}/library">进入大气层 ${m} 版<span class="arrow">→</span></a></div><div class="video-strip"><span class="video-play" aria-hidden="true">▶</span><div class="video-info">抖音 · ${m} 系统视频教学<small>等我AD进场 / panghuMini</small></div>${button('video', '观看介绍 ↗', '', `data-mode="${m}"`)}</div></article>`;
}
function landing() { main.innerHTML = `<div class="landing"><section class="hero"><div class="hero-copy"><div class="eyebrow">A LITTLE MORE FREEDOM IN HYRULE</div><h1>你的奇思妙想，<br>在海拉鲁<em>自由建造。</em></h1><p>从一架 MK2，到属于你的高达。<br>挑选喜欢的蓝图，打开浏览器，就能开始创造。</p><div class="hero-meta"><span><b>${catalog.length}</b> 个蓝图</span><i></i><span><b>25</b> 个分类</span><i></i><span>无需安装 · 本地处理</span></div></div>${art()}</section><section aria-labelledby="choose-title"><div class="section-heading"><h2 id="choose-title"><span class="step">01 /</span>先选对你的版本</h2><p>这里的 19 / 20 指系统环境，两个版本的实现原理不同。</p></div><div class="version-grid">${versionCard('19')}${versionCard('20')}</div><div class="notice-row"><span aria-hidden="true">ⓘ</span><span><strong>不确定怎么选？</strong> 先看对应的视频介绍。19 及以下系统和模拟器选左边，20 及以上系统选右边。开始前保留原始存档备份；未开放存档与 mod 访问的原版主机无法使用这些功能。</span></div></section><div class="privacy-row"><span>所有功能免费使用</span><span>存档不会上传服务器</span><span>两种版本独立保存收藏</span></div></div>`; }
function shell(content) {
  const tabs = [['library','蓝图库'],['collection','我的收藏'],['backups','备份方案'],['save',mode === '19' ? '存档修改' : '存档与历史导入'],['advanced','大师编辑器']];
  main.innerHTML = `<div class="workspace"><div class="workspace-header"><div class="workspace-title"><div class="eyebrow">HYRULE BLUEPRINT WORKSHOP</div><h1>蓝图工坊 <span class="mode-chip">大气层 ${mode}</span></h1></div><div class="workspace-actions"><a class="secondary" href="#/">切换版本</a>${button('export', mode === '19' ? '导出 mod 资源 ↓' : '导入蓝图到存档 →','primary')}</div></div><p class="mode-note">${modeDescription(mode)}。${mode === '20' ? '历史记录会逐渐被新建造替换；请在游戏内收藏想保留的蓝图。' : '需要先按教程安装依盖队基础 mod，再覆盖本工具导出的资源。'}</p><nav class="tabs" aria-label="工坊功能">${tabs.map(([key,label]) => `<a class="tab ${page === key ? 'active' : ''}" href="#/${mode}/${key}">${label}${key === 'collection' ? `<small>${states[mode].collection.length}/${LIMITS[mode]}</small>` : ''}</a>`).join('')}</nav><div id="workspace-content">${content}</div><div id="operation-progress" aria-live="polite"></div></div>`;
}
function displayItems() {
  let list = page === 'library' ? catalog : ids().map(id => byId.get(id));
  if (page === 'library' && category !== 'all') list = list.filter(item => item.category === category);
  const q = query.trim().toLocaleLowerCase(); if (q) list = list.filter(item => (item.name + ' ' + item.categoryName).toLocaleLowerCase().includes(q));
  if (sort === 'name') list = [...list].sort((a,b) => a.name.localeCompare(b.name, 'zh'));
  if (sort === 'category') list = [...list].sort((a,b) => a.category.localeCompare(b.category));
  if (sort === 'reverse') list = [...list].reverse();
  return list;
}
function blueprintCard(item, order) {
  const collected = states[mode].collection.includes(item.id);
  return `<article class="blueprint-card ${collected ? 'collected' : ''}" ${editing && page !== 'library' ? `draggable="true" data-drag="${e(item.id)}"` : ''}><button class="blueprint-image" data-act="preview" data-id="${e(item.id)}" aria-label="预览 ${e(item.name)}">${item.img ? `<img src="${e(assetURL(item.img,true))}" alt="${e(item.name)}" loading="lazy">` : '<span class="image-empty">暂无预览图片</span>'}</button>${editing ? `<input class="select-check" type="checkbox" aria-label="选择 ${e(item.name)}" data-select="${e(item.id)}" ${selection.has(item.id) ? 'checked' : ''}>` : ''}<button class="star-btn" data-act="collect" data-id="${e(item.id)}" aria-pressed="${collected}" aria-label="${collected ? '取消收藏' : '收藏'} ${e(item.name)}">${collected ? '★' : '☆'}</button><div class="card-copy"><div class="card-category"><span>${e(item.categoryName)}</span>${item.experimental ? '<span class="experimental">特殊 / 待验证</span>' : ''}</div><h3 class="card-name" title="${e(item.name)}">${e(item.name)}</h3><div class="card-bottom">${page === 'library' ? `<span>CAI 蓝图</span>` : `<span>导出位 ${String(order + 1).padStart(2,'0')}</span>`}<span>${editing && page !== 'library' ? `${button('up','↑','icon-button',`data-id="${e(item.id)}" aria-label="上移"`)} ${button('down','↓','icon-button',`data-id="${e(item.id)}" aria-label="下移"`)}` : button('download-cai','下载 ↓','icon-button',`data-id="${e(item.id)}"`)}</span></div></div></article>`;
}
function libraryContent() {
  const all = displayItems(); const total = Math.ceil(all.length / pageSize); pageNumber = Math.min(pageNumber, total || 1);
  const items = all.slice((pageNumber-1)*pageSize, pageNumber*pageSize);
  const backup = detailId && states[mode].backups.find(b => b.id === detailId);
  const collectionTools = page !== 'library' ? `<div class="toolbar">${backup ? `${button('backups','← 返回备份')}<strong>${e(backup.name)}</strong>` : ''}${button('edit',editing ? '完成编辑' : '编辑 / 排序')}${button('save-backup',backup ? '另存为备份' : '存为备份')}${backup ? button('apply-backup','应用到我的收藏','secondary',`data-id="${e(backup.id)}"`) : ''}${sort !== 'default' ? button('apply-sort','按此顺序导出','primary') : ''}${button('export','导出此方案','primary')}</div>` : '';
  return `${collectionTools}${editing ? `<div class="selection-bar"><span>已选 ${selection.size} 项</span>${button('select-all','全选')}${button('invert','反选')}${button('remove-selected','移除选中','danger-button')}<span class="muted">拖动卡片或用 ↑ ↓ 调整顺序</span></div>` : ''}<div class="toolbar"><label class="search-field"><span aria-hidden="true">⌕</span><input id="search" type="search" value="${e(query)}" placeholder="搜索蓝图，如 MK2、战车、高达…" aria-label="搜索蓝图"></label><select id="sort" aria-label="蓝图排序"><option value="default" ${sort==='default'?'selected':''}>${page==='library'?'默认分类':'收藏顺序'}</option><option value="name" ${sort==='name'?'selected':''}>名称排序</option><option value="category" ${sort==='category'?'selected':''}>功能分类排序</option><option value="reverse" ${sort==='reverse'?'selected':''}>倒序排列</option></select></div><div class="result-count"><span>${page === 'library' ? (category === 'all' ? '全部蓝图' : e(category.replace(/^\d+/,''))) : '当前方案'} · ${all.length} 个蓝图</span><span>${page === 'library' ? '点击图片查看大图，点星号收藏' : '导出使用保存的顺序；排序后可点击「按此顺序导出」'}</span></div>${items.length ? `<div class="blueprint-grid">${items.map(item => blueprintCard(item,page==='library'?0:ids().indexOf(item.id))).join('')}</div><div class="pagination">${button('prev','← 上一页','secondary',pageNumber<=1?'disabled':'')}<span>${pageNumber} / ${total}</span>${button('next','下一页 →','secondary',pageNumber>=total?'disabled':'')}</div>` : `<div class="empty-state"><div class="empty-symbol">◇</div><h3>${query ? '没有找到匹配的蓝图' : '把喜欢的创造，收进这里'}</h3><p>${query ? '试试更短的关键词，或切换分类。' : '在蓝图库点击星号，或者应用「作者推荐」备份开始。'}</p><a class="secondary" href="#/${mode}/library">浏览蓝图库 →</a></div>`}`;
}
function renderLibrary() {
  if (page === 'library') {
    const cats = [...new Set(catalog.map(item => item.category))];
    shell(`<div class="library-layout"><aside class="category-panel" aria-label="蓝图分类"><div class="category-label">EXPLORE / 分类</div>${[['all','全部蓝图',catalog.length],...cats.map(cat=>[cat,cat.replace(/^\d+/,''),catalog.filter(i=>i.category===cat).length])].map(([id,name,count])=>`<button class="category-btn ${category===id?'active':''}" data-act="category" data-id="${e(id)}"><span>${e(name)}</span><small>${count}</small></button>`).join('')}</aside><section id="library-content">${libraryContent()}</section></div>`);
  } else shell(`<section id="library-content">${libraryContent()}</section>`);
}
function refreshList() { const el = document.querySelector('#library-content'); if (el) el.innerHTML = libraryContent(); }
function renderBackups() {
  const backups = states[mode].backups;
  shell(`<div class="toolbar">${button('backup-current','保存当前收藏','primary')}${button('export-settings','导出收藏与备份 JSON')}${button('import-settings','导入 JSON')}${button('restore-recommended','恢复作者推荐')}${button('edit-backups',backupEditing?'完成编辑':'编辑备份列表')}<span class="muted">${backups.length} / 20 套 · 本浏览器本地保存</span></div>${backupEditing?`<div class="selection-bar"><span>已选 ${backupSelection.size} 套</span>${button('select-backups','全选')}${button('invert-backups','反选')}${button('remove-backups','删除选中','danger-button')}</div>`:''}<div class="backup-grid">${backups.map(b => `<article class="backup-card" ${backupEditing?`draggable="true" data-backup-drag="${e(b.id)}"`:''}>${backupEditing?`<div class="toolbar"><label><input type="checkbox" data-backup-select="${e(b.id)}" aria-label="选择方案 ${e(b.name)}" ${backupSelection.has(b.id)?'checked':''}> 选择方案</label>${button('backup-up','↑','icon-button',`data-id="${e(b.id)}" aria-label="上移方案"`)}${button('backup-down','↓','icon-button',`data-id="${e(b.id)}" aria-label="下移方案"`)}</div>`:''}<div class="backup-mosaic">${b.items.slice(0,4).map(id=>{const item=byId.get(id);return item.img?`<img src="${e(assetURL(item.img,true))}" alt="${e(item.name)}" loading="lazy">`:'<span></span>';}).join('')}</div><h3>${e(b.name)}</h3><div class="backup-meta">${b.items.length} 个蓝图 · 大气层 ${mode}${b.createdAt ? ' · '+e(new Date(b.createdAt).toLocaleDateString('zh-CN')) : ''}</div><div class="backup-buttons">${button('detail','查看 / 编辑','primary',`data-id="${e(b.id)}"`)}${button('apply-backup','应用','secondary',`data-id="${e(b.id)}"`)}${button('export-backup','导出','secondary',`data-id="${e(b.id)}"`)}${button('rename-backup','重命名','text-button',`data-id="${e(b.id)}"`)}${button('copy-backup','复制','text-button',`data-id="${e(b.id)}"`)}${button('delete-backup','删除','text-button',`data-id="${e(b.id)}"`)}</div></article>`).join('')}</div>${!backups.length?'<div class="empty-state"><p>还没有备份。可以保存当前收藏，或者恢复作者推荐。</p></div>':''}`);
}
function renderSave() {
  const old = mode === '19'; const chosen = exportIds || states[mode].collection;
  shell(`<div class="content-panel"><div class="eyebrow">${old?'UNLOCK & PREPARE':'IMPORT & BUILD'}</div><h2>${old?'解锁蓝图，准备开始建造':'把蓝图写入你的存档'}</h2><p>${old?'选择 JKSV 导出的 ZIP，或模拟器的 progress.sav。可一次处理压缩包内的所有有效存档，解锁自动建造、12 块设计石板与 34 张依盖队设计图。':'先选择蓝图，再导入 ZIP 或 progress.sav。选中要修改的存档位置，工具会将蓝图写入对应记录；其他存档位置和预览图片保持原样。'}</p>${!old?`<div class="warning">当前方案：${e(exportName || '我的收藏')}，共 <strong>${chosen.length}</strong> 个蓝图。游戏里的图片不会更新；实际建造内容会改变。${chosen.length===0?` <a href="#/20/library">先去收藏蓝图 →</a>`:''}</div>`:''}<label class="upload-zone"><span aria-hidden="true">⇧</span><strong>选择你的存档文件</strong><span>支持 .zip / progress.sav · ZIP 最大 128 MB · 仅在本地处理</span><input id="save-file" type="file" accept=".zip,.sav" aria-label="选择 ZIP 或 progress.sav 存档"></label><div id="save-session">${session ? sessionMarkup() : '<p class="muted">原始文件不会被覆盖，处理结果会作为新文件下载。</p>'}</div><div class="options-grid">${[['unlock','解锁自动建造与 46 张图纸','12 块设计石板 + 34 张依盖队设计图'],['battery','满电池','最大电量设置为 48000'],['materials','补充左纳尼乌姆','普通左纳尼乌姆设置为 999999'],['devices','补齐左纳乌装置','27 种装置，每种设置为 888']].map(([id,label,desc])=>`<label class="check-option"><input type="checkbox" id="option-${id}" ${saveOptions[mode][id]?'checked':''}><span>${label}<small>${desc}</small></span></label>`).join('')}</div>${old?`<label class="check-option"><input type="checkbox" id="all-slots" ${saveOptions[mode].allSlots?'checked':''}><span>处理压缩包内全部有效存档<small>取消勾选后，只处理上方选中的存档。</small></span></label>`:`<label class="check-option"><input type="checkbox" id="protect-favorites" ${saveOptions[mode].protectFavorites?'checked':''}><span>保留游戏中已有的收藏蓝图<small>收藏与历史共用 30 个记录位，保护后可替换的数量会减少。取消保护时，按原桌面版规则替换记录，可能替换已收藏的内容，但收藏标记保留。</small></span></label>`}<div class="warning">请保留原始存档备份。上述补充选项与桌面版一致，也可按需取消。生成结果后，按 <a href="#/guide">使用指南</a> 恢复到游戏。</div>${button('process-save',old?'生成并下载修改存档':'生成并下载蓝图存档','primary',!session?'disabled':'')}<div id="save-result">${resultMarkup()}</div></div>`);
}
function sessionMarkup() {
  if (!session) return '';
  return `<p class="muted">已载入：${e(session.fileName)}</p><div class="slot-grid">${session.slots.map((slot,i)=>`<label class="slot-card ${session.selected===i?'selected':''}">${slot.preview?`<img src="${slot.preview}" alt="${e(slot.name)} 游戏存档预览">`:'<span class="slot-placeholder">暂无游戏截图</span>'}<strong><input type="radio" name="slot" value="${i}" ${session.selected===i?'checked':''} ${slot.error?'disabled':''}> ${e(slot.name)}</strong><small>${slot.error?e(slot.error):`${e(slot.info.version)} · ${slot.info.records.length} 条记录<br>${slot.info.records.filter(r=>!r.favorite).length} 条非收藏 / ${slot.info.records.filter(r=>r.favorite).length} 条已收藏`}</small></label>`).join('')}</div>`;
}
function resultMarkup() { return resultURL ? `<div class="warning success">处理完成。${e(resultName)} 已准备好。<br><a href="${resultURL}" download="${e(resultName)}">再次下载结果 ↓</a></div>` : ''; }
function engine(action, bytes, options, blueprints) {
  return new Promise((resolve,reject)=>{
    const worker = new Worker(new URL('./engine-worker.js',import.meta.url));
    const timer = setTimeout(()=>{worker.terminate();reject(new Error('存档处理超时，请重试或检查文件'));},60000);
    const done=()=>{clearTimeout(timer);worker.terminate();};
    worker.onmessage=({data})=>{done();data.error?reject(new Error(data.error)):resolve(data.result);};
    worker.onerror=event=>{done();reject(new Error('存档引擎加载失败：'+event.message));};
    worker.postMessage({action,bytes,options,blueprints});
  });
}
async function loadSave(file) {
  if (!file) return;
  markBusy(true); progress('正在读取存档…');
  try {
    if (file.size > 128*1024*1024) throw new Error('文件超过 128 MB，请选择单套存档备份');
    const data = new Uint8Array(await file.arrayBuffer()); const raw = /\.sav$/i.test(file.name);
    if (raw && file.name.toLowerCase() !== 'progress.sav') throw new Error('单文件模式请选择 progress.sav');
    const entries = raw ? { 'progress.sav':data } : await unpack(data);
    const slots = findSlots(entries);
    for (let i=0;i<slots.length;i++) {
      progress('正在检查 '+slots[i].name, i+1,slots.length);
      try { slots[i].info = await engine('inspect',entries[slots[i].path]); } catch(error) { slots[i].error = error.message; }
      const jpg=captionImage(entries[slots[i].prefix+'caption.sav']);
      if(jpg)slots[i].preview=URL.createObjectURL(new Blob([jpg],{type:'image/jpeg'}));
    }
    const selected=slots.findIndex(s=>!s.error);
    if(selected<0){slots.forEach(s=>s.preview&&URL.revokeObjectURL(s.preview));throw new Error(slots[0].error);}
    session?.slots.forEach(s=>s.preview&&URL.revokeObjectURL(s.preview));
    session={fileName:file.name,raw,entries,slots,selected};
    if(resultURL)URL.revokeObjectURL(resultURL);resultURL=null;
    renderSave(); toast('已读取存档，请确认要修改的位置和选项');
  } catch(error) { renderSave();progress(error.message); } finally {busy=false;main.removeAttribute('aria-busy');}
}
async function processSave() {
  if(!session)throw new Error('请先选择存档');
  const opts=Object.fromEntries(['unlock','battery','materials','devices'].map(k=>[k,document.querySelector('#option-'+k).checked]));
  opts.protectFavorites=document.querySelector('#protect-favorites')?.checked??true;
  const chosen=(exportIds||states[mode].collection).map(id=>byId.get(id));
  if(mode==='20'&&!chosen.length)throw new Error('请先收藏至少一个蓝图');
  if(mode==='19'&&!Object.values(opts).some((v,i)=>i<4&&v))throw new Error('请至少选择一项存档修改');
  const targets=mode==='19'&&document.querySelector('#all-slots').checked?session.slots:[session.slots[session.selected]];
  if(targets.some(s=>s.error))throw new Error('压缩包中有不受支持的存档，请取消“全部存档”，选择有效的位置处理');
  markBusy(true);
  try {
    const blueprints=[];
    if(mode==='20')for(let i=0;i<chosen.length;i++){progress('读取蓝图 '+(i+1)+' / '+chosen.length,i+1,chosen.length);blueprints.push(await fetchBytes(assetURL(chosen[i].cai)));}
    const output={...session.entries};let replacements=[];
    for(let i=0;i<targets.length;i++){
      progress('正在处理 '+targets[i].name,i+1,targets.length);
      const result=await engine('process',session.entries[targets[i].path],opts,blueprints);
      output[targets[i].path]=result.bytes;replacements=result.replaced;
    }
    progress('正在生成下载文件…');
    const bytes=session.raw?output['progress.sav']:await pack(output);
    if(resultURL)URL.revokeObjectURL(resultURL);
    resultName=session.raw?'progress.sav':`王泪-${mode}-${mode==='19'?'解锁存档':'蓝图存档'}.zip`;
    resultURL=URL.createObjectURL(new Blob([bytes],{type:session.raw?'application/octet-stream':'application/zip'}));
    renderSave();
    const a=document.createElement('a');a.href=resultURL;a.download=resultName;a.click();
    progress(`已处理 ${targets.length} 个存档${replacements.length?'，替换记录：'+replacements.join('、'):''}。原始文件仍保留。`);
  } catch(error){renderSave();progress('处理失败：'+error.message);}finally{busy=false;main.removeAttribute('aria-busy');}
}
function renderAdvanced(){shell(`<div class="editor-warning">大师编辑器可自由修改物品、装备、坐标、蓝图及其他数值。独立读取 progress.sav；修改后点击“保存更改”，再用下方出现的链接下载。请保留原始备份。 <a class="text-button" href="./editor/zelda-totk/index.html" target="_blank" rel="noopener">独立窗口打开 ↗</a></div><iframe class="editor-frame" src="./editor/zelda-totk/index.html" title="王国之泪大师存档编辑器"></iframe><div id="editor-result"></div>`);}
function renderGuide(){main.innerHTML=`<article class="guide-page"><div class="eyebrow">BEFORE YOUR NEXT ADVENTURE</div><h1>从蓝图，到海拉鲁。</h1><p class="muted">先选对版本，再按对应流程操作。网页与桌面版的差别是：选择文件、在本地处理、下载结果。</p><div class="toolbar">${button('video','观看 19 版抖音教程','primary','data-mode="19"')}${button('video','观看 20 版抖音教程','secondary','data-mode="20"')}<a class="secondary" href="#/">返回版本入口 →</a></div><div class="table-wrap"><table class="comparison"><thead><tr><th>对比</th><th>19 及以下 / 模拟器</th><th>20 及以上</th></tr></thead><tbody>${[['实现方式','解锁进度 + 替换 46 个 mod 蓝图','修改存档中的蓝图记录'],['容量','34 张依盖图 + 12 块石板；另有原 8 收藏位','最多 30 条记录；永久收藏上限 8'],['预览图片','跟随选中的蓝图更新','图片保持原样，实际建造改变'],['保留方式','mod 替换位可长期保留','未收藏记录会被新历史逐渐替换'],['导出文件','Game/BluePrint 资源 ZIP + 修改后的存档','只修改选中 slot 的存档 ZIP']].map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div><details open><summary>1. 备份并导出游戏存档（图文引导）</summary>${[['关闭游戏','先彻底关闭《王国之泪》。打开相册，进入 JKSV。','相册.png'],['选择用户和游戏','选中你玩王泪的用户，再选择《塞尔达传说 王国之泪》。','JKSV2.png'],['创建一份新备份','选择新备份，记住名称，保存一份原始副本。','JKSV3.png'],['拷贝到电脑','通过 DBI 或你已有的文件传输方式，把 JKSV/The Legend of Zelda Tears of the Kingdom/ 中刚创建的 ZIP 拷到电脑。模拟器用户可选择存档目录里的 progress.sav。','JKSV5.png']].map(([title,desc,img],i)=>`<div class="guide-step"><span>0${i+1}</span><div><h3>${title}</h3><p>${desc}</p><img loading="lazy" src="./guide/SaveGameEdit/${img}" alt="${title}"></div></div>`).join('')}</details><details open><summary>2A. 19 及以下 / 模拟器：解锁进度，再生成 mod 资源</summary><ol><li>在 19 版“存档修改”中导入备份。勾选解锁自动建造和 46 张图纸；电池、矿石和装置可按需选择。生成并下载新的存档。</li><li>按视频教程安装适合游戏版本的依盖队蓝图基础 mod。本工具沿用原桌面版，只生成蓝图和图片资源，并不包含基础 mod。</li><li>在蓝图库收藏 1～46 个蓝图，在“我的收藏”中调整顺序，导出 mod 资源 ZIP。</li><li>解压后，将 Game 文件夹覆盖到已安装 mod 中 Game 所在的同级位置；模拟器同样覆盖相应 mod 目录。未选满 46 个的位置会恢复为原始图纸。</li><li>两张没有预览的源蓝图会使用占位图；其余图片随蓝图替换。蓝图 mod 保持安装时，这 46 个替换位可长期保留。</li></ol></details><details open><summary>2B. 20 及以上：选择存档，替换蓝图记录</summary><ol><li>收藏最多 30 个蓝图，调整顺序，点击“导入蓝图到存档”。</li><li>导入 ZIP，参考截图选择要修改的 slot。没有 caption.sav 也可按 slot 名称选择。</li><li>默认保护游戏中已有收藏；页面会显示可用的非收藏记录数量。超过容量时需要减少蓝图，或明确取消保护。取消保护可覆盖已收藏记录的内容。</li><li>生成结果 ZIP，其他 slot 和 caption.sav 图片不会改变。历史记录会随建造逐渐消失，想长期使用的蓝图请在游戏里收藏，仍只有 8 个永久收藏位。</li></ol></details><details><summary>3. 恢复修改后的存档</summary><p>把下载的新 ZIP 拷回 JKSV 对应游戏目录。进入 JKSV，选择备份，按界面提示恢复（原教程为按 Y，再长按 A）。模拟器用户在游戏关闭时，把下载的 progress.sav 放回对应存档目录。请保留原文件以便恢复。</p><img loading="lazy" src="./guide/SaveGameEdit/导入游戏.png" alt="JKSV 恢复存档步骤"></details><details><summary>提示“设计图尚未登记”，或者记录不足？</summary><p>新存档可能还没有任何建造记录。在游戏里使用究极手连接两个装置，比如翼和风扇，制造历史记录，重新保存、备份后再导入。网页版会拒绝写入不存在的记录，不会假报成功。</p></details><details><summary>收藏、排序、备份如何使用？</summary><p>网页收藏是你的导出方案，不等于游戏内的 8 个永久收藏。19 和 20 的收藏、备份完全独立。编辑模式支持拖动、上下移动、多选删除、全选和反选。每个版本最多存 20 套方案，可导出 JSON 跨浏览器迁移。清理网站数据会删除本地收藏，请定期导出 JSON。</p></details><details><summary>设备和浏览器要求</summary><p>建议使用新版 Chrome、Edge、Firefox 或 Safari。网页没有 Windows 安装包限制，但系统仍需能运行支持 Web Worker、现代 JavaScript 和文件下载的浏览器。普通未开放存档访问的主机无法使用存档与 mod 功能。</p></details></article>`;}
function renderAbout(){main.innerHTML=`<article class="guide-page"><div class="eyebrow">MADE FOR THE COMMUNITY</div><h1>因为热爱，所以分享。</h1><div class="content-panel"><h2>王泪蓝图自由 · panghuMini</h2><p>这是为《王国之泪》玩家制作的免费、非营利蓝图工具。网页版本将两条桌面分支的流程放在一起，让更多创造者打开浏览器就能使用。</p><p>感谢蓝图创作者、依盖队蓝图 mod 作者、存档编辑器作者 Marc Robledo，以及 Hahappify 的教程与传播支持。蓝图创作和上游工具的贡献归原作者所有。</p><div class="toolbar"><a class="primary" href="https://github.com/panghuMini/TearsBlueprintPC" target="_blank" rel="noopener">项目 GitHub ${icon}</a><a class="secondary" href="https://github.com/panghuMini/TearsBlueprintPC/issues" target="_blank" rel="noopener">问题反馈 ${icon}</a></div><p>抖音：panghuMini（等我AD进场） · 社区 QQ 群：1072063540</p><div class="qr-grid"><figure><img src="./guide/dy.png" alt="作者抖音二维码" loading="lazy"><figcaption>抖音 / 免费社区交流</figcaption></figure></div><details><summary>请作者喝奶茶（自愿支持）</summary><p>软件和教学始终免费。自愿支持不影响任何功能的使用。</p><div class="qr-grid"><figure><img src="./guide/zfb.png" alt="支付宝自愿支持二维码" loading="lazy"><figcaption>支付宝</figcaption></figure><figure><img src="./guide/vx.png" alt="微信自愿支持二维码" loading="lazy"><figcaption>微信</figcaption></figure></div></details><p class="muted">本地数据引擎及大师编辑器基于 <a href="https://github.com/panghuMini/savegame-editors" target="_blank" rel="noopener">savegame-editors</a>（MIT），ZIP 处理使用 fflate（MIT）。<a href="./editor/LICENSE" target="_blank">查看编辑器许可</a> · <a href="./lib/fflate.LICENSE" target="_blank">查看 fflate 许可</a>。本项目与任天堂无官方关联。</p></div></article>`;}
function render() {
  const parts=location.hash.replace(/^#\/?/,'').split('/');
  if(!parts[0])return landing();
  if(parts[0]==='guide')return renderGuide();
  if(parts[0]==='about')return renderAbout();
  if(!LIMITS[parts[0]]){location.hash='/';return;}
  mode=parts[0];page=parts[1]||'library';detailId=page==='backups'&&parts[2]?decodeURIComponent(parts[2]):null;
  if(detailId&&!states[mode].backups.some(b=>b.id===detailId)){detailId=null;route(`/${mode}/backups`);return;}
  if(page==='library'||page==='collection'||detailId)return renderLibrary();
  if(page==='backups')return renderBackups();
  if(page==='save')return renderSave();
  if(page==='advanced')return renderAdvanced();
  location.hash=`/${mode}/library`;
}
async function exportBlueprints(list = ids(), name = '') {
  if(!list.length)throw new Error('请先收藏蓝图或选择备份方案');
  if(mode==='20'){exportIds=[...list];exportName=name || (detailId?states[mode].backups.find(b=>b.id===detailId).name:'我的收藏');route('/20/save');if(page==='save')renderSave();return;}
  markBusy(true);
  try{const entries=await makeMod(list.map(id=>byId.get(id)),config.targets,fetchBytes,(n,total)=>progress(`正在打包蓝图与图片 ${n} / ${total}`,n,total));progress('正在压缩 mod 资源…');download(await pack(entries),'王泪-19-蓝图mod资源.zip','application/zip');progress('已下载 46 位蓝图资源包。解压后覆盖到教程中已安装的依盖队 mod 对应目录。');toast('mod 资源已生成');}
  finally{busy=false;render();}
}
function nameBackup(action,id=null){
  const b=states[mode].backups.find(b=>b.id===id);
  openModal(action==='rename'?'重命名备份':'保存蓝图方案',`<form id="name-form"><label>方案名称（最多 30 字）<input name="name" class="modal-input" value="${e(action==='rename'?b.name:action==='copy'?b.name+' 副本':'')}" maxlength="30" required autofocus></label><input name="action" type="hidden" value="${action}"><input name="id" type="hidden" value="${e(id||'')}"><div class="modal-actions"><button type="button" class="secondary" data-act="close">取消</button><button class="primary">保存方案</button></div></form>`);
}
async function act(action, el) {
  const id=el.dataset.id;
  if(action==='close')return closeModal();
  if(action==='video'){const m=el.dataset.mode;const v=VIDEOS[m];return openModal(`抖音 · 大气层 ${m} 视频介绍`,`<iframe class="video-frame" src="https://open.douyin.com/player/video?vid=${v.id}&autoplay=0" allow="fullscreen" allowfullscreen referrerpolicy="unsafe-url" title="大气层 ${m} 抖音教程"></iframe><p class="muted">抖音播放器可能受登录或网络限制。无法播放时可在抖音打开，或观看 B 站教学。</p><div class="toolbar"><a class="primary" target="_blank" rel="noopener" href="${v.url}">在抖音观看 ↗</a><a class="secondary" target="_blank" rel="noopener" href="${v.bilibili}">B 站教学 ↗</a></div>`);}
  if(action==='category'){category=id;pageNumber=1;renderLibrary();return;}
  if(action==='prev'||action==='next'){pageNumber+=action==='next'?1:-1;refreshList();document.querySelector('#library-content').scrollIntoView({block:'start'});return;}
  if(action==='preview'){const item=byId.get(id);return openModal(item.name,`${item.img?`<img class="modal-image" src="${e(assetURL(item.img,true))}" alt="${e(item.name)}">`:'<div class="empty-state">该蓝图暂缺预览图片</div>'}<p class="muted">${e(item.categoryName)}${item.experimental?' · 特殊或尚未逐项验证的社区蓝图，请参考原作者说明。':''}</p>`,button('download-cai','下载 CAI','secondary',`data-id="${e(id)}"`)+button('collect',states[mode].collection.includes(id)?'取消收藏':'加入收藏','primary',`data-id="${e(id)}"`));}
  if(action==='download-cai'){const item=byId.get(id);download(await fetchBytes(assetURL(item.cai)),item.name+'.cai');return;}
  if(action==='collect'){const current=states[mode].collection;if(!current.includes(id)&&current.length>=LIMITS[mode])throw new Error(`当前版本最多选择 ${LIMITS[mode]} 个蓝图，可以保存多套备份切换`);change(s=>{s.collection=current.includes(id)?current.filter(v=>v!==id):[...current,id];});if(modal.open){el.textContent=states[mode].collection.includes(id)?'取消收藏':'加入收藏';}render();return;}
  if(action==='edit'){editing=!editing;selection.clear();refreshList();return;}
  if(action==='up'||action==='down'){const list=ids(),index=list.indexOf(id);replaceIds(moveItem(list,index,index+(action==='up'?-1:1)));sort='default';refreshList();return;}
  if(action==='select-all'||action==='invert'){const shown=displayItems().map(i=>i.id);selection=action==='select-all'?new Set(shown):new Set(shown.filter(id=>!selection.has(id)));refreshList();return;}
  if(action==='remove-selected'){if(!selection.size)return;return openModal('移除选中的蓝图',`<p>从当前方案移除 ${selection.size} 个蓝图？蓝图库中的原文件会保留。</p>`,button('close','取消')+button('confirm-remove','移除','danger-button'));}
  if(action==='confirm-remove'){replaceIds(ids().filter(id=>!selection.has(id)));selection.clear();closeModal();render();return;}
  if(action==='apply-sort'){if(query)throw new Error('请先清空搜索，再保存完整方案排序');replaceIds(displayItems().map(i=>i.id));sort='default';render();toast('已保存导出顺序');return;}
  if(action==='export')return exportBlueprints(page==='library'||page==='save'||page==='advanced'||(page==='backups'&&!detailId)?states[mode].collection:ids());
  if(action==='export-backup'){const b=states[mode].backups.find(b=>b.id===id);return exportBlueprints(b.items,b.name);}
  if(action==='edit-backups'){backupEditing=!backupEditing;backupSelection.clear();renderBackups();return;}
  if(action==='backup-up'||action==='backup-down'){change(s=>{const i=s.backups.findIndex(b=>b.id===id);s.backups=moveItem(s.backups,i,i+(action==='backup-up'?-1:1));});renderBackups();return;}
  if(action==='select-backups'||action==='invert-backups'){backupSelection=new Set(states[mode].backups.map(b=>b.id).filter(id=>action==='select-backups'||!backupSelection.has(id)));renderBackups();return;}
  if(action==='remove-backups'){if(!backupSelection.size)return;return openModal('删除选中备份',`<p>删除选中的 ${backupSelection.size} 套方案？当前收藏不受影响。</p>`,button('close','取消')+button('confirm-remove-backups','删除','danger-button'));}
  if(action==='confirm-remove-backups'){change(s=>s.backups=s.backups.filter(b=>!backupSelection.has(b.id)));backupSelection.clear();closeModal();renderBackups();return;}
  if(action==='backups')return route(`/${mode}/backups`);
  if(action==='detail')return route(`/${mode}/backups/${encodeURIComponent(id)}`);
  if(action==='save-backup'||action==='backup-current'){if(!(action==='backup-current'?states[mode].collection:ids()).length)throw new Error('当前收藏是空的');return nameBackup(action==='backup-current'?'current':'new');}
  if(action==='rename-backup')return nameBackup('rename',id);
  if(action==='copy-backup')return nameBackup('copy',id);
  if(action==='delete-backup')return openModal('删除备份方案',`<p>删除「${e(states[mode].backups.find(b=>b.id===id).name)}」？此操作不会删除当前收藏。</p>`,button('close','取消')+button('confirm-delete','删除','danger-button',`data-id="${e(id)}"`));
  if(action==='confirm-delete'){change(s=>s.backups=s.backups.filter(b=>b.id!==id));closeModal();render();return;}
  if(action==='apply-backup')return openModal('应用备份方案','<p>用这个方案替换当前网页收藏？原来的收藏可先存为备份。</p>',button('close','取消')+button('confirm-apply','替换当前收藏','primary',`data-id="${e(id)}"`));
  if(action==='confirm-apply'){change(s=>s.collection=[...s.backups.find(b=>b.id===id).items]);exportIds=null;closeModal();route(`/${mode}/collection`);toast('方案已应用');return;}
  if(action==='restore-recommended'){if(states[mode].backups.some(b=>b.name==='作者推荐')){toast('作者推荐方案已在备份列表中');return;}if(states[mode].backups.length>=20)throw new Error('备份已达 20 套上限');change(s=>s.backups.push({id:createId(),name:'作者推荐',items:config.recommended[mode],createdAt:new Date().toISOString()}));render();return;}
  if(action==='export-settings'){download(JSON.stringify({format:'tears-blueprint-web',version:1,mode,...states[mode]},null,2),`王泪-${mode}-收藏与备份.json`,'application/json');return;}
  if(action==='import-settings')return openModal('导入收藏与备份',`<p class="muted">导入会替换大气层 ${mode} 版的网页收藏和备份；另一版本不受影响。建议先导出当前 JSON。</p><input id="settings-file" type="file" accept=".json" aria-label="选择收藏备份 JSON">`);
  if(action==='confirm-import'){save(pendingImport);pendingImport=null;closeModal();render();toast('收藏和备份已导入');return;}
  if(action==='process-save')return processSave();
}
let pendingImport=null;
let masterURL=null;
let backupEditing=false, backupSelection=new Set();
document.addEventListener('click',event=>{const el=event.target.closest('[data-act]');if(!el||el.disabled)return;if(busy&&el.dataset.act!=='close'){toast('正在处理文件，请稍候');return;}Promise.resolve(act(el.dataset.act,el)).catch(error=>toast(error.message));});
document.addEventListener('input',event=>{if(event.target.id==='search'){query=event.target.value;pageNumber=1;const start=event.target.selectionStart;refreshList();const input=document.querySelector('#search');input.focus();if(input.type==='text')input.setSelectionRange(start,start);}});
document.addEventListener('change',async event=>{
  const el=event.target;
  try{
    if(el.id.startsWith('option-')) saveOptions[mode][el.id.slice(7)]=el.checked;
    if(el.id==='all-slots') saveOptions[mode].allSlots=el.checked;
    if(el.id==='protect-favorites') saveOptions[mode].protectFavorites=el.checked;
    if(el.id==='sort'){sort=el.value;pageNumber=1;refreshList();}
    if(el.dataset.backupSelect){el.checked?backupSelection.add(el.dataset.backupSelect):backupSelection.delete(el.dataset.backupSelect);renderBackups();}
    if(el.dataset.select){el.checked?selection.add(el.dataset.select):selection.delete(el.dataset.select);refreshList();}
    if(el.name==='slot'){session.selected=Number(el.value);document.querySelector('#save-session').innerHTML=sessionMarkup();}
    if(el.id==='save-file')await loadSave(el.files[0]);
    if(el.id==='settings-file'&&el.files[0]){if(el.files[0].size>2*1024*1024)throw new Error('JSON 备份文件过大');const raw=JSON.parse(await el.files[0].text());if(raw.mode!==mode||raw.format!=='tears-blueprint-web'||raw.version!==1)throw new Error(`请选择网页 ${mode} 版导出的 JSON`);pendingImport=validateState(raw,mode,new Set(byId.keys()));openModal('确认导入',`<p>将替换当前收藏为 ${pendingImport.collection.length} 个蓝图，并导入 ${pendingImport.backups.length} 套方案。</p>`,button('close','取消')+button('confirm-import','确认替换','primary'));}
  }catch(error){toast(error.message);}
});
document.addEventListener('submit',event=>{
  if(event.target.id!=='name-form')return;event.preventDefault();
  try{const form=new FormData(event.target),name=String(form.get('name')).trim(),action=form.get('action'),id=form.get('id');if(!name||name.length>30)throw new Error('请输入 1～30 字的名称');if(states[mode].backups.some(b=>b.name===name&&!(action==='rename'&&b.id===id)))throw new Error('已有同名备份，请换一个名称');if(action!=='rename'&&states[mode].backups.length>=20)throw new Error('最多保存 20 套备份');change(s=>{if(action==='rename')s.backups.find(b=>b.id===id).name=name;else s.backups.push({id:createId(),name,items:[...(action==='copy'?s.backups.find(b=>b.id===id).items:action==='current'?s.collection:ids())],createdAt:new Date().toISOString()});});closeModal();render();toast('备份已保存');}catch(error){toast(error.message);}
});
document.addEventListener('dragstart',event=>{const backup=event.target.closest('[data-backup-drag]');if(backup){dragId='backup:'+backup.dataset.backupDrag;event.dataTransfer.setData('text/plain',dragId);return;}const card=event.target.closest('[data-drag]');if(card){dragId=card.dataset.drag;event.dataTransfer.setData('text/plain',dragId);event.dataTransfer.effectAllowed='move';}});
document.addEventListener('dragover',event=>{if(event.target.closest('[data-drag],[data-backup-drag]')&&dragId)event.preventDefault();});
document.addEventListener('drop',event=>{const backup=event.target.closest('[data-backup-drag]');if(backup&&dragId?.startsWith('backup:')){event.preventDefault();try{change(s=>s.backups=moveItem(s.backups,s.backups.findIndex(b=>b.id===dragId.slice(7)),s.backups.findIndex(b=>b.id===backup.dataset.backupDrag)));renderBackups();}catch(error){toast(error.message);}dragId=null;return;}const card=event.target.closest('[data-drag]');if(!card||!dragId)return;event.preventDefault();try{const list=ids();replaceIds(moveItem(list,list.indexOf(dragId),list.indexOf(card.dataset.drag)));sort='default';refreshList();}catch(error){toast(error.message);}dragId=null;});
document.addEventListener('dragend',()=>{dragId=null;});
window.addEventListener('hashchange',()=>{if(busy){history.replaceState(null,'',lastHash||'#/');toast('正在处理文件，请稍候');return;}lastHash=location.hash;if(modal.open)closeModal();pendingImport=null;backupEditing=false;backupSelection.clear();query='';sort='default';pageNumber=1;selection.clear();editing=false;const nextMode=location.hash.split('/')[1];if(nextMode&&nextMode!==mode){exportIds=null;if(resultURL)URL.revokeObjectURL(resultURL);resultURL=null;resultName='';}if(!location.hash.includes('/save')){exportIds=null;exportName='';}render();window.scrollTo(0,0);});
window.addEventListener('beforeunload',event=>{if(busy){event.preventDefault();event.returnValue='';}});
window.addEventListener('storage',event=>{if(!event.key?.startsWith('tears-web-v1-')||busy)return;try{const m=event.key.split('-').at(-1);states[m]=readState(localStorage,m,new Set(byId.keys()),config.recommended[m]);render();toast('已同步其他标签页的收藏');}catch{toast('其他标签页的收藏数据无法读取，请重新导入备份');}});
(async()=>{
  try{const responses=await Promise.all([fetch('./manifest.json'),fetch('./config.json')]);if(responses.some(r=>!r.ok))throw new Error('蓝图库资源加载失败，请刷新重试');const [manifest,cfg]=await Promise.all(responses.map(r=>r.json()));config=cfg;catalog=flattenManifest(manifest);byId=new Map(catalog.map(i=>[i.id,i]));for(const m of ['19','20']){try{states[m]=readState(localStorage,m,new Set(byId.keys()),config.recommended[m]);}catch(error){throw new Error(`无法读取 ${m} 版本地收藏：${error.message}。请保留网站数据，导出或修复备份后重试。`);}}render();}
  catch(error){main.innerHTML=`<div class="guide-page"><div class="warning error">${e(error.message)}</div><button class="secondary" onclick="location.reload()">重新加载</button></div>`;}
})();

window.addEventListener('message', event => {
  const frame = document.querySelector('.editor-frame');
  if (event.origin !== location.origin || event.source !== frame?.contentWindow || event.data?.type !== 'tears-editor-download' || !(event.data.blob instanceof Blob)) return;
  const name=String(event.data.filename || 'progress.sav').replace(/[\\/]/g, '_');
  if(masterURL)URL.revokeObjectURL(masterURL);
  masterURL=URL.createObjectURL(event.data.blob);
  const result=document.querySelector('#editor-result');
  if(result)result.innerHTML=`<div class="warning success">修改文件已生成。<a href="${masterURL}" download="${e(name)}">下载大师编辑器结果 ↓</a></div>`;
  result?.scrollIntoView({block:'center'});
  toast('修改文件已生成，请点击编辑器下方的下载链接');
});

const { app, BrowserWindow, ipcMain, dialog } = require('electron/main')
const path = require('node:path')
const fs = require('fs')
const fse = require('fs-extra')
const AdmZip = require('adm-zip')
const isDev = process.env.NODE_ENV === 'development'


const createWindow = () => {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    title: '王泪蓝图自由',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    },
    // 设置窗口图标（如果存在）
    icon: path.join(__dirname, 'assets', 'icon.png')
  })

  // 设置应用名称（显示在任务栏、窗口标题等）
  app.setName('TearsBlueprintPC')

  // 加载 Vue 项目构建后的页面
  const vueDistPath = path.join(__dirname, 'vue2', 'dist', 'index.html')
  win.loadFile(vueDistPath)
  
  // 开发时打开开发者工具
  if (isDev) {
    win.webContents.openDevTools()
  }
}

// IPC handlers
ipcMain.handle('select-export-path', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory']
  })
  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0]
  }
  return null
})

ipcMain.handle('export-to-game', async (event, options) => {
  try {
    const { exportPath, collectedItems } = options
    const gameSourcePath = path.join(__dirname, 'vue2')
    
    // 定义目标文件的固定命名（按指定顺序）
    const targetNames = [
      'Obj_AutoBuilderDraft_00',
      'Obj_AutoBuilderDraftAssassin_10',
      'Obj_AutoBuilderDraftAssassin_22',
      'Obj_AutoBuilderDraft_10',
      'Obj_AutoBuilderDraft_05',
      'Obj_AutoBuilderDraftAssassin_03',
      'Obj_AutoBuilderDraft_02',
      'Obj_AutoBuilderDraft_03',
      'Obj_AutoBuilderDraftAssassin_12',
      'Obj_AutoBuilderDraftAssassin_04',
      'Obj_AutoBuilderDraftAssassin_30',
      'Obj_AutoBuilderDraftAssassin_21',
      'Obj_AutoBuilderDraft_11',
      'Obj_AutoBuilderDraftAssassin_02',
      'Obj_AutoBuilderDraftAssassin_07',
      'Obj_AutoBuilderDraftAssassin_08',
      'Obj_AutoBuilderDraftAssassin_13',
      'Obj_AutoBuilderDraftAssassin_31',
      'Obj_AutoBuilderDraftAssassin_32',
      'Obj_AutoBuilderDraftAssassin_00',
      'Obj_AutoBuilderDraft_04',
      'Obj_AutoBuilderDraft_07',
      'Obj_AutoBuilderDraft_01',
      'Obj_AutoBuilderDraftAssassin_20',
      'Obj_AutoBuilderDraftAssassin_14',
      'Obj_AutoBuilderDraft_09',
      'Obj_AutoBuilderDraftAssassin_17',
      'Obj_AutoBuilderDraftAssassin_27',
      'Obj_AutoBuilderDraftAssassin_05',
      'Obj_AutoBuilderDraftAssassin_33',
      'Obj_AutoBuilderDraftAssassin_29',
      'Obj_AutoBuilderDraftAssassin_01',
      'Obj_AutoBuilderDraftAssassin_11',
      'Obj_AutoBuilderDraftAssassin_23',
      'Obj_AutoBuilderDraft_06',
      'Obj_AutoBuilderDraftAssassin_24',
      'Obj_AutoBuilderDraftAssassin_18',
      'Obj_AutoBuilderDraftAssassin_25',
      'Obj_AutoBuilderDraftAssassin_26',
      'Obj_AutoBuilderDraft_08',
      'Obj_AutoBuilderDraftAssassin_15',
      'Obj_AutoBuilderDraftAssassin_06',
      'Obj_AutoBuilderDraftAssassin_16',
      'Obj_AutoBuilderDraftAssassin_28',
      'Obj_AutoBuilderDraftAssassin_09',
      'Obj_AutoBuilderDraftAssassin_19'
    ];
    
    const caiTargetNames = targetNames.map(name => name + '.cai');
    const pngTargetNames = targetNames.map(name => name + '.png');
    
    // 创建目标目录结构
    const caiTargetDir = path.join(exportPath, 'Game', 'BluePrint', 'CombinedActorInfo')
    const pngTargetDir = path.join(exportPath, 'Game', 'BluePrint', 'Texture')
    
    // 确保目录存在
    fs.mkdirSync(caiTargetDir, { recursive: true })
    fs.mkdirSync(pngTargetDir, { recursive: true })
    
    // 复制收藏的蓝图文件
    for (let i = 0; i < collectedItems.length && i < 46; i++) {
      const item = collectedItems[i]
      
      // 复制cai文件
      if (item.cai) {
        const sourceCaiPath = path.join(gameSourcePath, 'public', 'lantu', item.cai)
        const targetCaiPath = path.join(caiTargetDir, caiTargetNames[i])
        
        if (fs.existsSync(sourceCaiPath)) {
          fs.copyFileSync(sourceCaiPath, targetCaiPath)
        }
      }
      
      // 复制png文件
      if (item.img) {
        // 对图片路径进行解码（因为manifest.json中对文件名进行了encodeURIComponent编码）
        // 需要解码整个路径，因为文件名部分被编码了
        let decodedImgPath = item.img
        try {
          // 尝试解码路径的每一段
          decodedImgPath = item.img.split('/').map(segment => {
            try {
              return decodeURIComponent(segment)
            } catch (e) {
              // 如果解码失败，可能是目录名没有被编码，直接返回原值
              return segment
            }
          }).join('/')
        } catch (e) {
          // 如果整体解码失败，使用原路径
          decodedImgPath = item.img
        }
        
        const sourcePngPath = path.join(gameSourcePath, 'public', 'lantu', decodedImgPath)
        const targetPngPath = path.join(pngTargetDir, pngTargetNames[i])
        
        if (fs.existsSync(sourcePngPath)) {
          fs.copyFileSync(sourcePngPath, targetPngPath)
        } else {
          console.warn(`PNG file not found: ${sourcePngPath} (original path: ${item.img})`)
        }
      }
    }
    
    // 从Game源文件夹复制剩余的文件补全到46个
    for (let i = collectedItems.length; i < 46; i++) {
      const sourceCaiPath = path.join(gameSourcePath, 'public', 'Game', 'BluePrint', 'CombinedActorInfo', caiTargetNames[i])
      const targetCaiPath = path.join(caiTargetDir, caiTargetNames[i])
      
      if (fs.existsSync(sourceCaiPath)) {
        fs.copyFileSync(sourceCaiPath, targetCaiPath)
      }
      
      const sourcePngPath = path.join(gameSourcePath, 'public', 'Game', 'BluePrint', 'Texture', pngTargetNames[i])
      const targetPngPath = path.join(pngTargetDir, pngTargetNames[i])
      
      if (fs.existsSync(sourcePngPath)) {
        fs.copyFileSync(sourcePngPath, targetPngPath)
      }
    }
    
    return { success: true }
  } catch (error) {
    console.error('Export to game failed:', error)
    return { success: false, error: error.message }
  }
})

// 获取编辑器路径
ipcMain.handle('get-editor-path', async () => {
  const editorPath = path.join(__dirname, 'vendor', 'savegame-editors', 'zelda-totk', 'index.html')
  return editorPath
})

// 选择zip存档文件
ipcMain.handle('select-save-zip', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'Zip Files', extensions: ['zip'] }]
  })
  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0]
  }
  return null
})

// 导出处理后的ok.zip（当前先复制原zip为ok.zip占位）
ipcMain.handle('export-ok-zip', async (event, zipPath) => {
  try {
    const result = await dialog.showOpenDialog({ properties: ['openDirectory'] })
    if (result.canceled || result.filePaths.length === 0) {
      return { success: false, error: '未选择导出目录' }
    }
    const outDir = result.filePaths[0]
    const targetZip = path.join(outDir, 'ok.zip')
    if (fs.existsSync(zipPath)) {
      fs.copyFileSync(zipPath, targetZip)
      return { success: true, output: targetZip }
    }
    return { success: false, error: '源zip不存在' }
  } catch (e) {
    return { success: false, error: e.message }
  }
})

// 保存编辑器隐藏窗口的单例
let editorWin = null
async function getEditorWindow() {
  if (editorWin && !editorWin.isDestroyed()) {
    return editorWin
  }
  editorWin = new BrowserWindow({
    show: false,
    webPreferences: {
      // 启用 Node 能力，允许被加载页面直接使用 fs/path
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
      preload: undefined
    }
  })
  const editorFile = path.join(__dirname, 'vendor', 'savegame-editors', 'zelda-totk', 'index.html')
  await editorWin.loadURL('file:///' + editorFile.replace(/\\/g, '/'))
  return editorWin
}

async function resetEditorWindow() {
  const win = await getEditorWindow()
  const editorFile = path.join(__dirname, 'vendor', 'savegame-editors', 'zelda-totk', 'index.html')
  await win.loadURL('file:///' + editorFile.replace(/\\/g, '/'))
  return win
}

function sendProgress(win, payload) {
  try {
    const all = BrowserWindow.getAllWindows()
    all.forEach(w => w.webContents.send('save-edit-progress', payload))
  } catch (e) {}
}

function analyzeZipTopLevel(zipPath) {
  const zip = new AdmZip(zipPath)
  const entries = zip.getEntries()
  const prefixes = new Set()
  for (const e of entries) {
    const name = e.entryName
    if (!name) continue
    const idx = name.indexOf('/')
    if (idx > 0) {
      prefixes.add(name.substring(0, idx))
    } else if (idx === -1) {
      // 顶层就是文件，无前缀
      prefixes.add('')
    }
  }
  if (prefixes.size === 1) {
    const only = Array.from(prefixes)[0]
    return { singleRootName: only } // 可能为 ''
  }
  return { singleRootName: null }
}

async function extractZipToTemp(zipPath) {
  const tempRoot = path.join(app.getPath('temp'), 'totk_edit_' + Date.now())
  fse.ensureDirSync(tempRoot)
  const zip = new AdmZip(zipPath)
  zip.extractAllTo(tempRoot, true)
  return tempRoot
}

function rezipPreservingTopLevel(tempRoot, singleRootName, outZipPath) {
  const zip = new AdmZip()
  if (singleRootName !== null) {
    if (singleRootName === '') {
      // 原zip顶层无文件夹，直接把 tempRoot 顶层的所有内容加到根
      const items = fs.readdirSync(tempRoot)
      for (const it of items) {
        const full = path.join(tempRoot, it)
        const stat = fs.statSync(full)
        if (stat.isDirectory()) {
          zip.addLocalFolder(full, it)
        } else {
          zip.addLocalFile(full)
        }
      }
    } else {
      // 原zip有单一顶层文件夹名
      const folder = path.join(tempRoot, singleRootName)
      if (fs.existsSync(folder)) {
        zip.addLocalFolder(folder, singleRootName)
      } else {
        // 回退：如果找不到同名文件夹，则按根添加
        const items = fs.readdirSync(tempRoot)
        for (const it of items) {
          const full = path.join(tempRoot, it)
          const stat = fs.statSync(full)
          if (stat.isDirectory()) {
            zip.addLocalFolder(full, it)
          } else {
            zip.addLocalFile(full)
          }
        }
      }
    }
  } else {
    // 多顶层混合，保持当前 tempRoot 的布局
    const items = fs.readdirSync(tempRoot)
    for (const it of items) {
      const full = path.join(tempRoot, it)
      const stat = fs.statSync(full)
      if (stat.isDirectory()) {
        zip.addLocalFolder(full, it)
      } else {
        zip.addLocalFile(full)
      }
    }
  }
  if (fs.existsSync(outZipPath)) fs.unlinkSync(outZipPath)
  zip.writeZip(outZipPath)
}

ipcMain.handle('process-save-zip', async (_event, zipPath) => {
  try {
    if (!zipPath || !fs.existsSync(zipPath)) {
      throw new Error('ZIP 文件不存在')
    }
    sendProgress(null, { stage: 'init', message: '解压zip' })
    const { singleRootName } = analyzeZipTopLevel(zipPath)
    const tempRoot = await extractZipToTemp(zipPath)

    // 根目录用于定位 slot 路径
    const rootDir = singleRootName && singleRootName !== ''
      ? path.join(tempRoot, singleRootName)
      : tempRoot

    const slots = ['slot_00','slot_01','slot_02','slot_03','slot_04','slot_05']
    let editor = await getEditorWindow()

    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i]
      const slotDir = path.join(rootDir, slot)
      if (!fs.existsSync(slotDir)) {
        // 允许不存在，跳过
        continue
      }
      const progressPath = path.join(slotDir, 'progress.sav')
      if (!fs.existsSync(progressPath)) {
        // 没有progress.sav也跳过
        continue
      }

      // 每个 slot 独立重置页面，避免状态残留
      editor = await resetEditorWindow()

      const steps = [
        { name: 'i18nPatch', code: async () => editor.webContents.executeJavaScript(`(() => {
            // 强制中文翻译补丁，补上缺失的条目
            try {
              const extraMap = { Energy_Material_03: '大的左纳尼乌能源' };
              const orig_ = window._;
              if (typeof orig_ === 'function') {
                window._ = function(key){ return (extraMap[key] || orig_(key)); };
              } else {
                window._ = function(key){ return extraMap[key] || key; };
              }
            } catch(e) {}
            return true;
        })()`)},
        { name: 'loadProgress', code: async (p) => {
          // 直接在编辑器窗口内通过 fs 读取文件，构造 MarcFile 并触发加载
          const js = `(() => {
            const fs = require('fs');
            const progressPath = ${JSON.stringify(progressPath)};
            if (!fs.existsSync(progressPath)) throw new Error('progress.sav 不存在: ' + progressPath);
            const buf = fs.readFileSync(progressPath);
            const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
            window.tempFile = new MarcFile(ab.byteLength);
            window.tempFile.fileName = 'progress.sav';
            window.tempFile._u8array = new Uint8Array(ab);
            window.tempFile._dataView = new DataView(ab);
            if (typeof window._tempFileLoadFunction !== 'function') throw new Error('_tempFileLoadFunction 不存在');
            window._tempFileLoadFunction();
            return true;
          })()`;
          return await editor.webContents.executeJavaScript(js)
        }},
        { name: 'autoBuild', code: async () => editor.webContents.executeJavaScript(`Promise.resolve(window.lantuTotk.autoBuild && window.lantuTotk.autoBuild())`) },
        { name: 'changeBattery', code: async () => editor.webContents.executeJavaScript(`Promise.resolve(window.lantuTotk.changeBattery && window.lantuTotk.changeBattery(48000))`) },
        { name: 'openLantu', code: async () => editor.webContents.executeJavaScript(`Promise.resolve(window.lantuTotk.openLantu && window.lantuTotk.openLantu())`) },
        // 确保DOM已渲染后再做材料与设备操作
        { name: 'awaitMaterialsDOM', code: async () => editor.webContents.executeJavaScript(`new Promise((resolve)=>{const check=()=>{if(document.getElementById('container-materials')) return resolve(true); setTimeout(check,100)}; check();})`) },
        { name: 'addMaterials1', code: async () => editor.webContents.executeJavaScript(`Promise.resolve(window.lantuTotk.addMaterials && window.lantuTotk.addMaterials('左纳尼乌姆', 999999))`) },
        // { name: 'addMaterials2', code: async () => editor.webContents.executeJavaScript(`Promise.resolve(window.lantuTotk.addMaterials && window.lantuTotk.addMaterials('大的左纳尼乌能源', 999))`) },
        { name: 'awaitDevicesDOM', code: async () => editor.webContents.executeJavaScript(`new Promise((resolve)=>{const check=()=>{if(document.getElementById('container-devices')) return resolve(true); setTimeout(check,100)}; check();})`) },
        { name: 'zuonawuAll', code: async () => editor.webContents.executeJavaScript(`Promise.resolve(window.lantuTotk.zuonawuAll && window.lantuTotk.zuonawuAll(888))`) },
        { name: 'saveChanges', code: async (p) => editor.webContents.executeJavaScript(`(() => {
            const fs = require('fs');
            if (!window.SavegameEditor || typeof window.SavegameEditor.save !== 'function') throw new Error('SavegameEditor.save 不存在');
            window.SavegameEditor.save();
            if (!window.tempFile || !window.tempFile._u8array) throw new Error('未找到已修改的存档缓冲区');
            const u8 = window.tempFile._u8array;
            const nodeBuf = Buffer.from(u8);
            fs.writeFileSync(${JSON.stringify(progressPath)}, nodeBuf);
            return true;
        })()`)}
      ]

      for (const step of steps) {
        sendProgress(null, { stage: 'processing', slot, step: step.name })
        await step.code(progressPath)
      }
    }

    sendProgress(null, { stage: 'zipping', message: '正在打包 ok.zip' })
    // 选择导出目录
    const result = await dialog.showOpenDialog({ properties: ['openDirectory'] })
    if (result.canceled || result.filePaths.length === 0) {
      throw new Error('未选择导出目录')
    }
    const outDir = result.filePaths[0]
    const outZip = path.join(outDir, 'ok.zip')
    rezipPreservingTopLevel(tempRoot, singleRootName, outZip)

    sendProgress(null, { stage: 'done', output: outZip })
    return { success: true, output: outZip }
  } catch (e) {
    sendProgress(null, { stage: 'error', error: e.message })
    return { success: false, error: e.message }
  }
})

app.whenReady().then(() => {
  ipcMain.handle('ping', () => 'pong')
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
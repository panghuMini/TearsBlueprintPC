const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
  ping: () => ipcRenderer.invoke('ping'),
  selectExportPath: () => ipcRenderer.invoke('select-export-path'),
  exportToGame: (options) => ipcRenderer.invoke('export-to-game', options),
  selectSaveZip: () => ipcRenderer.invoke('select-save-zip'),
  exportOkZip: (zipPath) => ipcRenderer.invoke('export-ok-zip', zipPath),
  processSaveZip: (zipPath) => ipcRenderer.invoke('process-save-zip', zipPath),
  onSaveEditProgress: (cb) => ipcRenderer.on('save-edit-progress', (_e, payload) => cb && cb(payload)),
  getEditorPath: () => ipcRenderer.invoke('get-editor-path')
})
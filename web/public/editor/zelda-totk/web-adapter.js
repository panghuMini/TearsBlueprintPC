/* Web migration adapter: retain upstream editing logic, use modern downloads. */
SavegameEditor.noDemo = true;
window.saveAs = function (blob, filename) {
  if (window.parent !== window && window.parent.location.origin === location.origin) {
    window.parent.postMessage({ type: 'tears-editor-download', blob, filename }, location.origin);
    return;
  }
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || 'progress.sav';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
};
window.addEventListener('error', function (event) {
  let notice = document.getElementById('web-editor-error');
  if (!notice) {
    notice = document.createElement('p'); notice.id = 'web-editor-error';
    notice.setAttribute('role', 'alert');
    notice.style.cssText = 'position:fixed;bottom:12px;left:12px;right:12px;z-index:99999;padding:16px;background:#702b23;color:white;';
    document.body.appendChild(notice);
  }
  notice.textContent = '编辑器操作失败：' + event.message;
});

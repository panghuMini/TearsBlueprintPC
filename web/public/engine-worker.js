/* The editor's data model runs off the UI thread; save data never leaves this worker. */
self.window = { addEventListener() {} };
self.setValue = function () {};
self.TOTKMasterEditor = {};
importScripts('./engine-vendor/marc-file.js', './engine-vendor/murmur.js', './engine-vendor/totk.js', './engine-vendor/variables.js', './engine-vendor/item.js', './engine-vendor/pouch.js', './engine-vendor/autobuilder.js', './engine-vendor/completism.js', './engine.js');
self.onmessage = ({ data }) => {
  try {
    const result = data.action === 'inspect' ? TearsEngine.inspect(data.bytes) : TearsEngine.process(data.bytes, data.options, data.blueprints);
    self.postMessage({ result }, result.bytes ? [result.bytes.buffer] : []);
  } catch (error) { self.postMessage({ error: error.message || String(error) }); }
};

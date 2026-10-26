/* Browser/Node shared binary operations. Upstream MIT modules live in engine-vendor. */
(function (root) {
  function marc(source) {
    const bytes = Uint8Array.from(source);
    const file = new MarcFile(bytes.length);
    file._u8array = bytes;
    file._dataView = new DataView(bytes.buffer);
    file.fileName = 'progress.sav'; file.littleEndian = true;
    return file;
  }
  function load(source) {
    if (!source || source.length < 2307552 || source.length >= 4194304) throw new Error('存档大小不受支持，请选择原始 progress.sav');
    root.tempFile = marc(source);
    Variable.resetCache();
    if (!SavegameEditor.checkValidSavegame()) throw new Error('无法识别此王国之泪存档，未生成修改文件');
    const version = SavegameEditor.Constants.GAME_VERSIONS.find(v => v.fileSize === source.length && v.header === tempFile.readU32(4) && v.metaDataStart === tempFile.readU32(8));
    if (!version) throw new Error('此存档版本或 mod 格式尚未验证，请使用大师编辑器检查');
    validateRecords();
    return version.version;
  }
  function validateRecords() {
    const prefix = 'AutoBuilder.Draft.Content.';
    for (const [name, stride] of [['Index',4], ['CameraPos',12], ['CameraAt',12], ['CombinedActorInfo',6692]]) {
      const offset = SavegameEditor.Offsets[prefix + name];
      if (!Number.isInteger(offset) || offset < 0 || offset + 4 + 30 * stride > tempFile.fileSize || tempFile.readU32(offset) !== 30) throw new Error('存档蓝图数组结构不完整，未生成修改文件');
    }
    const indices = SavegameEditor.readS32Array(prefix + 'Index');
    const active = indices.filter(i => i !== -1);
    if (active.some(i => i < 0 || i > 29) || new Set(active).size !== active.length) throw new Error('存档蓝图记录索引重复或无效');
    const flags = new Variable(prefix + 'IsFavorite', 'BoolArray').value;
    if (flags.length !== 30) throw new Error('存档收藏标记结构无效');
    const base = SavegameEditor.Offsets[prefix + 'CombinedActorInfo'] + 4;
    for (let i = 0; i < 30; i++) if (tempFile.readU32(base + i * 6692) !== 6688) throw new Error('存档蓝图数据块长度无效');
  }
  function setBool(name, value) {
    const v = new Variable(name, 'Bool'); v.value = value; v.save();
  }
  function upsert(category, entries) {
    const pouch = new Pouch(category);
    for (const [id, quantity] of entries) {
      const item = pouch.findItemById(id) || pouch.add({ id, quantity });
      if (!item) throw new Error('背包已满，无法添加 ' + id);
      item.quantity = quantity;
    }
    pouch.save();
  }
  function inspectCurrent() {
    const indices = SavegameEditor.readS32Array('AutoBuilder.Draft.Content.Index');
    const favorites = new Variable('AutoBuilder.Draft.Content.IsFavorite', 'BoolArray').value;
    return { records: Array.from(indices, (index, physical) => ({ index, favorite: !!favorites[physical] })).filter(r => r.index >= 0 && r.index < 30).sort((a, b) => a.index - b.index), energy: SavegameEditor.readF32('PlayerStatus.MaxEnergy') };
  }
  function inspect(source) { const version = load(source); return { version, ...inspectCurrent() }; }
  function process(source, options = {}, blueprints = []) {
    load(source);
    const info = inspectCurrent();
    const available = info.records.filter(r => !options.protectFavorites || !r.favorite);
    if (blueprints.length > available.length) throw new Error(`当前存档只有 ${available.length} 条可替换记录，已选 ${blueprints.length} 个蓝图。请减少选择、调整收藏保护，或先在游戏中用究极手建造以产生历史记录。`);
    if (options.unlock) {
      setBool('IsGet.Obj_AutoBuilder', true); setBool('IsGetAnyway.Obj_AutoBuilder', true);
      Completism._set(CompletismHashes.SCHEMATICS_STONE_FOUND);
      Completism._set(CompletismHashes.SCHEMATICS_YIGA_FOUND);
      upsert('key', [['Obj_AutoBuilderDraft_00', 12], ['Obj_AutoBuilderDraftAssassin_00', 34]]);
    }
    if (options.battery) SavegameEditor.writeF32('PlayerStatus.MaxEnergy', null, 48000);
    if (options.materials) upsert('materials', [['Item_Ore_L', 999999]]);
    if (options.devices) upsert('devices', Item.AVAILABILITY.devices.map(id => [id, 888]));
    const replaced = [];
    blueprints.forEach((source, i) => {
      const previous = AutoBuilder.readSingle(available[i].index);
      const imported = AutoBuilder.fromFile(marc(source));
      if (!previous || !imported) throw new Error('蓝图或目标历史记录无效，已停止导出');
      imported._index = previous._index; imported.index = previous.index;
      imported.save(); replaced.push(previous.index + 1);
    });
    return { bytes: Uint8Array.from(tempFile._u8array), replaced };
  }
  root.TearsEngine = { inspect, process };
})(globalThis);

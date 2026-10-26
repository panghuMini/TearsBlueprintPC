import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const fixture=new Uint8Array(fs.readFileSync(path.join(root,'tests/fixtures/progress.sav')));
const manifest=JSON.parse(fs.readFileSync(path.join(root,'public/manifest.json')));
const files=Object.values(manifest).flatMap(c=>c.files).filter(f=>f.cai);
const cai=new Uint8Array(fs.readFileSync(path.join(root,'public/lantu',files[0].cai)));
function context(){
 const c={console,Uint8Array,DataView,ArrayBuffer,BigInt,setTimeout(){},navigator:{userAgent:''},document:{},setValue(){},TOTKMasterEditor:{},window:{addEventListener(){}}};vm.createContext(c);
 for(const f of ['marc-file','murmur','totk','variables','item','pouch','autobuilder','completism'])vm.runInContext(fs.readFileSync(path.join(root,'public/engine-vendor',f+'.js'),'utf8'),c);
 vm.runInContext(fs.readFileSync(path.join(root,'public/engine.js'),'utf8'),c);return c;
}
const json=x=>JSON.parse(JSON.stringify(x));
test('19 restores cleared unlocks and supplies; keeps original input unchanged',()=>{
 const c=context();c.TearsEngine.inspect(fixture);
 for(const name of ['IsGet.Obj_AutoBuilder','IsGetAnyway.Obj_AutoBuilder']){const v=new c.Variable(name,'Bool');v.value=0;v.save();}
 c.Completism._set(c.CompletismHashes.SCHEMATICS_STONE_FOUND,undefined,0);
 c.Completism._set(c.CompletismHashes.SCHEMATICS_YIGA_FOUND,undefined,0);
 const pouch=new c.Pouch('key');pouch.items=pouch.items.filter(i=>!['Obj_AutoBuilderDraft_00','Obj_AutoBuilderDraftAssassin_00'].includes(i.id));pouch.save();
 const cleared=Uint8Array.from(c.tempFile._u8array),before=cleared.slice();
 const result=c.TearsEngine.process(cleared,{unlock:true,battery:true,materials:true,devices:true});assert.deepEqual(cleared,before);
 c.TearsEngine.inspect(result.bytes);
 assert.equal(new c.Variable('IsGet.Obj_AutoBuilder','Bool').value,1);assert.equal(new c.Variable('IsGetAnyway.Obj_AutoBuilder','Bool').value,1);
 assert.equal(c.Completism.countSchematicsStone(),12);assert.equal(c.Completism.countSchematicsYiga(),34);
 const key=new c.Pouch('key');assert.equal(key.findItemById('Obj_AutoBuilderDraft_00').quantity,12);assert.equal(key.findItemById('Obj_AutoBuilderDraftAssassin_00').quantity,34);
 assert.equal(c.SavegameEditor.readF32('PlayerStatus.MaxEnergy'),48000);
 assert.equal(new c.Pouch('materials').findItemById('Item_Ore_L').quantity,999999);
 const devices=new c.Pouch('devices');for(const id of c.Item.AVAILABILITY.devices)assert.equal(devices.findItemById(id).quantity,888);
});
test('20 protects existing favorites and maps logical history to physical slots',()=>{
 const c=context();const info=c.TearsEngine.inspect(fixture);const before=info.records.map(r=>json(c.AutoBuilder.readSingle(r.index).combinedActorInfo));
 const nonfavorites=info.records.filter(r=>!r.favorite);const result=c.TearsEngine.process(fixture,{protectFavorites:true},nonfavorites.map(()=>cai));
 c.TearsEngine.inspect(result.bytes);
 for(let i=0;i<info.records.length;i++){const record=info.records[i];assert.deepEqual(json(c.AutoBuilder.readSingle(record.index).combinedActorInfo),record.favorite?before[i]:Array.from(cai.slice(0,6688)));}
 assert.deepEqual(json(c.TearsEngine.inspect(result.bytes).records),json(info.records));
 assert.throws(()=>c.TearsEngine.process(fixture,{protectFavorites:true},Array(30).fill(cai)),/只有/);
});
test('20 can replace all 30 records with explicit favorite protection disabled',()=>{
 const c=context();const before=c.TearsEngine.inspect(fixture);const result=c.TearsEngine.process(fixture,{protectFavorites:false},Array(30).fill(cai));
 assert.equal(result.replaced.length,30);assert.deepEqual(json(c.TearsEngine.inspect(result.bytes).records),json(before.records));
 for(let i=0;i<30;i++)assert.deepEqual(json(c.AutoBuilder.readSingle(i).combinedActorInfo),Array.from(cai.slice(0,6688)));
});
test('no-op byte exact; malformed/unknown save and CAI are rejected',()=>{
 const c=context();assert.deepEqual(c.TearsEngine.process(fixture,{}).bytes,fixture);
 assert.throws(()=>c.TearsEngine.inspect(new Uint8Array(99)),/大小/);
 const unknown=fixture.slice();unknown[4]^=1;assert.throws(()=>c.TearsEngine.inspect(unknown),/版本/);
 assert.throws(()=>c.TearsEngine.process(fixture,{},[new Uint8Array(6688)]),/无效/);
});
test('duplicate record indices and malformed CAI block sizes fail before writing',()=>{
 const c=context();c.TearsEngine.inspect(fixture);
 const brokenIndex=fixture.slice();new DataView(brokenIndex.buffer).setInt32(c.SavegameEditor.Offsets['AutoBuilder.Draft.Content.Index']+4,0,true);
 assert.throws(()=>c.TearsEngine.inspect(brokenIndex),/索引/);
 c.TearsEngine.inspect(fixture);const brokenBlock=fixture.slice();new DataView(brokenBlock.buffer).setUint32(c.SavegameEditor.Offsets['AutoBuilder.Draft.Content.CombinedActorInfo']+4,1,true);
 assert.throws(()=>c.TearsEngine.process(brokenBlock,{},[cai]),/块长度/);
});

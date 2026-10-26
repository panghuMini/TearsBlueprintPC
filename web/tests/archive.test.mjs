import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { zipSync, unzipSync } from 'fflate';
import { makeMod, unpack, findSlots, captionImage } from '../public/archive.js';
import { flattenManifest, validateState, moveItem, assetURL } from '../public/core.js';
const root=new URL('../public/',import.meta.url);
const manifest=JSON.parse(await fs.readFile(new URL('manifest.json',root)));
const config=JSON.parse(await fs.readFile(new URL('config.json',root)));
const catalog=flattenManifest(manifest);
const get=url=>fs.readFile(new URL(url,root)).then(b=>new Uint8Array(b));
test('all 393 CAI and available previews resolve, recommended presets remain branch specific',async()=>{
 assert.equal(catalog.length,393);for(const item of catalog){await get(assetURL(item.cai));if(item.img)await get(assetURL(item.img,true));}
 assert.equal(config.recommended['19'].length,44);assert.equal(config.recommended['20'].length,30);
 assert.notDeepEqual(config.recommended['19'].slice(0,30),config.recommended['20']);
});
test('19 zip contains all 46 CAI+images, original fill and exact chosen order',async()=>{
 const chosen=[catalog[10],catalog.find(i=>!i.img),catalog[3]];
 const entries=await makeMod(chosen,config.targets,get);
 const reread=unzipSync(zipSync(entries));
 assert.equal(Object.keys(reread).filter(p=>p.endsWith('.cai')).length,46);
 assert.equal(Object.keys(reread).filter(p=>p.endsWith('.png')).length,46);
 for(let i=0;i<46;i++){const p=`Game/BluePrint/CombinedActorInfo/${config.targets[i]}.cai`;assert.deepEqual(reread[p],await get(i<chosen.length?assetURL(chosen[i].cai):'./'+p));}
 assert.deepEqual(reread[`Game/BluePrint/Texture/${config.targets[1]}.png`],await get('./missing-preview.png'));
});
test('archive roots, missing caption, invalid caption bounds, ambiguity',()=>{
 assert.equal(findSlots({'backup/slot_00/progress.sav':new Uint8Array(0)})[0].prefix,'backup/slot_00/');
 assert.equal(findSlots({'progress.sav':new Uint8Array(0)})[0].path,'progress.sav');
 assert.throws(()=>findSlots({'readme.txt':new Uint8Array(0)}),/未找到/);
 assert.throws(()=>findSlots({'a/slot_00/progress.sav':[],'b/slot_00/progress.sav':[]}),/多套/);
 const bytes=new Uint8Array(500);const view=new DataView(bytes.buffer);view.setUint32(0x28,0x63696a32,true);view.setUint32(0x2c,0xfffffff0,true);assert.equal(captionImage(bytes),null);
});
test('settings validate capacities, duplicate/unknown records, both modes independent',()=>{
 const ids=new Set(catalog.map(i=>i.id));const raw={collection:config.recommended['19'],backups:[]};assert.equal(validateState(raw,'19',ids).collection.length,44);assert.throws(()=>validateState(raw,'20',ids),/上限/);assert.throws(()=>validateState({collection:['unknown'],backups:[]},'19',ids));assert.deepEqual(moveItem(['a','b','c'],0,2),['b','c','a']);
});

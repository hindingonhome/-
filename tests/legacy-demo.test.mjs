import test from 'node:test';
import assert from 'node:assert/strict';
import {removeUntouchedLegacyCube} from '../src/legacy-demo.mjs';

const fixture=()=>({models:[{id:'legacy-cube',demo:'cube',name:'校验方块 · 10 mm'},{id:'ring',demo:'ring',name:'示例戒环 · 20.2 mm'}],cards:[{id:'cube-card',modelId:'legacy-cube',original:true,scale:[1,1,1],metal:'gold',density:19.3,priceBasis:'unconfirmed',fees:[],processTemplate:'',batchQuantity:1,feedAllowancePercent:null,materialBasis:'net'},{id:'ring-card',modelId:'ring',original:true,scale:[1,1,1],metal:'gold',density:19.3,priceBasis:'unconfirmed',fees:[],processTemplate:'',batchQuantity:1,feedAllowancePercent:null,materialBasis:'net'}],selected:'cube-card'});

test('upgrade removes only the untouched legacy 10 mm starter cube',()=>{
 const state=fixture();assert.equal(removeUntouchedLegacyCube(state),true);assert.deepEqual(state.models.map(m=>m.id),['ring']);assert.deepEqual(state.cards.map(c=>c.id),['ring-card']);assert.equal(state.selected,'ring-card');
});

test('upgrade preserves edited or duplicated legacy cubes',()=>{
 const changed=fixture();changed.cards[0].fees=[{name:'Casting'}];assert.equal(removeUntouchedLegacyCube(changed),false);assert.equal(changed.models.length,2);
 const duplicated=fixture();duplicated.cards.push({...duplicated.cards[0],id:'copy',original:false});assert.equal(removeUntouchedLegacyCube(duplicated),false);assert.equal(duplicated.models.length,2);
});

test('new 1 mm quick-start cube is not treated as the old 10 mm starter',()=>{
 const state=fixture();state.models[0].name='校验方块 · 1 mm';assert.equal(removeUntouchedLegacyCube(state),false);assert.equal(state.models.length,2);
});

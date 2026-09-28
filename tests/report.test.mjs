import test from 'node:test';
import assert from 'node:assert/strict';
import {buildReport} from '../src/report.mjs';

const manualState=(card)=>({models:[{id:'m',name:'手动体积',manual:true}],cards:[{modelId:'m',name:'甲',manualVolume:2.5,density:19.3,price:100,metal:'gold',...card}]});

test('plain text result includes independent records and manual volume',()=>{
 const state={models:[{id:'m',name:'手动体积',manual:true}],cards:[{modelId:'m',name:'甲',manualVolume:2.5,density:19.3,price:100,metal:'gold'},{modelId:'m',name:'乙',manualVolume:null,density:10.49,price:null,metal:'silver'}]};
 const text=buildReport(state);
 assert.match(text,/甲/);assert.match(text,/2\.5 cm³/);assert.match(text,/48\.25 g/);assert.match(text,/4,825/);assert.match(text,/乙/);assert.match(text,/待输入体积/);assert.doesNotMatch(text,/\{"models"/);
});

test('plain text report itemizes fees without duplicating a currency symbol',()=>{
 const text=buildReport(manualState({name:'含工费',manualVolume:1,price:100,fees:[{id:'f',kind:'bench',name:'手工加工',mode:'perGram',rate:10,quantity:1},{id:'s',kind:'setting',name:'镶嵌',mode:'perUnit',rate:20,quantity:2}]}));
 assert.match(text,/手工加工：CNY\s*10\.00 \/ 克/);assert.match(text,/镶嵌：CNY\s*20\.00 \/ 数量 × 2；小计 CNY\s*40\.00/);assert.match(text,/单件制作费用：CNY\s*233\.00/);assert.match(text,/单件材料＋制作：CNY\s*2,163\.00/);assert.doesNotMatch(text,/元 \/ g/);
});

test('text export follows English and Traditional Chinese UI languages',()=>{
 const state=manualState({name:'原始尺寸',manualVolume:1,price:100,fees:[]});
 const english=buildReport(state,new Date('2026-09-23T00:00:00Z'),'en');
 assert.match(english,/Metal Lab · Calculation results/);assert.match(english,/Material cost: CNY\s*1,930\.00/);assert.doesNotMatch(english,/金属|估价|手动体积/);
 const traditional=buildReport(state,new Date('2026-09-23T00:00:00Z'),'zh-TW');assert.match(traditional,/金屬工坊/);assert.match(traditional,/材料成本/);
});

test('report converts dimensions and prices to the chosen display preferences',()=>{
 const state={models:[{id:'m',name:'cube',ext:'stl',manual:false,analysis:{valid:true,volume:25.4**3,dimensions:[25.4,50.8,76.2],triangles:12,topologyChecked:true}}],cards:[{modelId:'m',name:'Original',manualVolume:null,density:19.3,price:100,metal:'gold',unit:'mm',scale:[1,1,1],fees:[],materialBasis:'net',batchQuantity:1,priceBasis:'unconfirmed'}]};
 const report=buildReport(state,new Date('2026-09-23T00:00:00Z'),'en','USD','in');
 assert.match(report,/Dimensions: 1 × 2 × 3 in/);assert.match(report,/Rate: USD\s*\d/);assert.match(report,/Material cost: USD\s*\d/);
});

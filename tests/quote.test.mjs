import test from 'node:test';
import assert from 'node:assert/strict';
import {calculateQuote,confidenceFor,processTemplates,applyProcessTemplate} from '../src/quote.mjs';

test('net mass, feed allowance, material and making stay separate',()=>{
 const today=new Date().toLocaleDateString('sv-SE');const card={feedAllowancePercent:20,materialBasis:'feed',batchQuantity:5,priceBasis:'supplier',supplierName:'厂商甲',quoteDate:today,validUntil:today,price:10,fees:[{id:'a',kind:'casting',name:'铸造',mode:'fixed',rate:5,quantity:1}]};
 const q=calculateQuote(card,{manual:false,analysis:{valid:true,topologyChecked:true,boundary:0,nonManifold:0,inconsistent:0,degenerate:0}},{volume:1,mass:10});
 assert.equal(q.netMass,10);assert.equal(q.feedMass,12);assert.equal(q.materialCost,120);assert.equal(q.makingCost,5);assert.equal(q.unitTotal,125);assert.equal(q.batchTotal,625);assert.equal(q.confidence,'已检查');assert.equal(q.priceReady,true);
});
test('reference price requires explicit choice, blank template fees remain pending',()=>{
 const card={price:10,priceBasis:'unconfirmed',batchQuantity:1,fees:applyProcessTemplate([], 'lostWaxBrooch')};
 const q=calculateQuote(card,{manual:true},{volume:1,mass:8});
 assert.equal(q.priceReady,false);assert.equal(q.pendingFees.length,card.fees.length);assert.equal(q.confidence,'需人工确认');assert.equal(q.feedMass,null);assert.ok(processTemplates.length>=3);
});
test('topology confidence reflects calculation limits',()=>{
 assert.equal(confidenceFor({manual:false,analysis:{valid:true,topologyChecked:false}}),'未完整检查');
 assert.equal(confidenceFor({manual:false,analysis:{valid:false,topologyChecked:true}}),'需人工确认');
});
test('switching process templates replaces previous and manually added fees',()=>{
 const old=applyProcessTemplate([], 'lacquerCopper');old[0].rate=250;old.push({id:'manual',kind:'custom',name:'额外打样',mode:'fixed',rate:99,quantity:1});
 const next=applyProcessTemplate(old,'printedCopper');
 assert.deepEqual(next.map(f=>f.kind),['printing','casting','finishing']);
 assert.ok(next.every(f=>f.rate===null));
 assert.ok(next.every(f=>!old.includes(f)));
});

import {makeFee,calculateFees} from './fees.mjs';

export const processTemplates=Object.freeze([
 {id:'lostWaxBrooch',name:'失蜡铸铜胸针',kinds:['prototype','casting','finishing','pinback']},
 {id:'printedCopper',name:'金属打印＋融铜',kinds:['printing','casting','finishing']},
 {id:'lacquerCopper',name:'铜件＋大漆',kinds:['prototype','casting','finishing','lacquer','pinback']}
]);
export function applyProcessTemplate(_fees,id){const template=processTemplates.find(x=>x.id===id);if(!template)throw Error('工艺模板无效');return template.kinds.map(makeFee);}
export function confidenceFor(model){if(!model||model.manual||!model.analysis?.valid)return '需人工确认';return model.analysis.topologyChecked===false?'未完整检查':'已检查';}
export function calculateQuote(card,model,estimate){
 const netMass=estimate?.mass??null,volume=estimate?.volume??null,price=Number.isFinite(card.price)?card.price:null;
 const allowance=card.feedAllowancePercent;
 const feedMass=netMass!==null&&Number.isFinite(allowance)?netMass*(1+allowance/100):null;
 const basis=card.materialBasis==='feed'?'feed':'net';
 const chargeMass=basis==='feed'?feedMass:netMass;
 const materialCost=chargeMass!==null&&price!==null?chargeMass*price:null;
 const fees=calculateFees(card.fees??[],netMass,materialCost);
 const batchQuantity=Number.isInteger(card.batchQuantity)&&card.batchQuantity>0?card.batchQuantity:1;
 const today=new Date().toLocaleDateString('sv-SE');
 const supplierReady=card.priceBasis==='supplier'&&!!card.supplierName?.trim()&&!!card.quoteDate&&!!card.validUntil&&card.validUntil>=card.quoteDate&&card.validUntil>=today&&card.quoteDate<=today;
 const priceReady=price!==null&&(card.priceBasis==='reference'||supplierReady);
 return {volume,netMass,feedMass,chargeMass,materialCost,makingCost:fees.making,unitTotal:fees.total,batchQuantity,batchTotal:fees.total===null?null:fees.total*batchQuantity,fees:fees.lines,pendingFees:fees.lines.filter(x=>x.rate===null),confidence:confidenceFor(model),priceReady,priceBasis:card.priceBasis??'unconfirmed',supplierReady};
}

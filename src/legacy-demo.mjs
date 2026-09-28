export function removeUntouchedLegacyCube(state){
 const model=state.models.find(item=>item.demo==='cube'&&item.name==='校验方块 · 10 mm');
 if(!model)return false;
 const records=state.cards.filter(card=>card.modelId===model.id);
 if(records.length!==1)return false;
 const card=records[0],untouched=card.original&&card.scale?.length===3&&card.scale.every(value=>value===1)&&card.metal==='gold'&&card.density===19.3&&card.priceBasis==='unconfirmed'&&card.materialBasis==='net'&&card.batchQuantity===1&&card.feedAllowancePercent==null&&card.processTemplate===''&&!(card.fees?.length);
 if(!untouched)return false;
 state.models=state.models.filter(item=>item.id!==model.id);
 state.cards=state.cards.filter(item=>item.modelId!==model.id);
 if(state.selected===card.id)state.selected=state.cards[0]?.id??null;
 return true;
}

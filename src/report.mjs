import {estimate,estimateVolume,UNITS} from './core.mjs';
import {calculateQuote,processTemplates} from './quote.mjs';
import {translateText} from './i18n.mjs';
import {formatCurrency} from './currency.mjs';
import {lengthFromMillimeters} from './preferences.mjs';
const numeric=(n,d=6,locale='zh-CN')=>Number.isFinite(n)?n.toLocaleString(({en:'en-US',ja:'ja-JP',ko:'ko-KR'}[locale]??locale),{maximumFractionDigits:d}):'—';
const feeUnit=(mode,locale)=>{
 const language=locale.startsWith('zh')?'zh':locale;
 const units={
  en:{perGram:'/ g',fixed:'/ item',perUnit:'/ unit',percentMaterial:'% of material cost'},
  ja:{perGram:'/ g',fixed:'/ 個',perUnit:'/ 個',percentMaterial:'材料費 %'},
  ko:{perGram:'/ g',fixed:'/ 개',perUnit:'/ 개',percentMaterial:'재료비 %'},
  zh:{perGram:'/ 克',fixed:'/ 件',perUnit:'/ 数量',percentMaterial:'材料费 %'}
 };
 return units[language]?.[mode]??'';
};
const materials={gold:'黄金',silver:'白银',copper:'铜',custom:'自定义金属'};
export function buildReport(state,now=new Date(),locale='zh-CN',currency='CNY',displayUnit='mm'){
 const L=(cn,en)=>locale==='en'?en:translateText(cn,locale),num=(n,d=6)=>numeric(n,d,locale),money=n=>Number.isFinite(n)?formatCurrency(n,currency,locale):'—';
 const localeTag=({en:'en-US',ja:'ja-JP',ko:'ko-KR'}[locale]??locale);
 const lines=[L('金属工坊 · 计算结果','Metal Lab · Calculation results'),L(`导出时间：${now.toLocaleString(localeTag)}`,`Exported: ${now.toLocaleString(localeTag)}`),L(`共 ${state.models.length} 个模型/手动体积组，${state.cards.length} 份计算记录`,`${state.models.length} model/volume groups · ${state.cards.length} calculations`),'',L('说明：理论净重 = 体积 × 密度；投料量由用户填写的余量估算。材料成本按选定计费重量和单价计算；制作费另计。未填工艺报价、税费与运费不计入。','Theoretical net mass = volume × density. Feed mass uses the entered allowance. Material cost uses the chosen charging mass and price. Making costs are separate; blank rates, taxes and shipping are excluded.'),''];
 for(const m of state.models){lines.push(`【${translateText(m.name,locale)}】`,m.manual?L('来源：手动输入体积','Source: manual volume'):L(`来源：${m.ext.toUpperCase()} · ${num(m.analysis.triangles,0)} 个三角面`,`Source: ${m.ext.toUpperCase()} · ${num(m.analysis.triangles,0)} triangles`));
  if(!m.manual&&m.analysis.topologyChecked===false)lines.push(L('提示：高面数模型未检查封闭性与自相交，结果以模型封闭且朝向一致为前提。','Note: closure and self-intersections were not checked for this high-face model. Results assume a closed mesh with consistent winding.'));
  for(const c of state.cards.filter(c=>c.modelId===m.id)){
   let r=null;try{if(m.manual){if(c.manualVolume!==null)r=estimateVolume(c.manualVolume,c.density,c.price);}else if(m.analysis.valid)r=estimate(m.analysis.volume,UNITS[c.unit],c.scale,c.density,c.price);}catch{}
   lines.push('',L(`  记录：${c.name}`,`  Calculation: ${translateText(c.name,locale)}`),L(`  金属：${materials[c.metal]||c.metal}`,`  Metal: ${translateText(materials[c.metal]||c.metal,locale)}`),L(`  体积：${r?num(r.volume):m.manual?'待输入体积':'几何待核对'}${r?' cm³':''}`,`  Volume: ${r?num(r.volume)+' cm³':m.manual?'Enter volume':'Check geometry'}`),L(`  密度：${num(c.density)} g/cm³`,`  Density: ${num(c.density)} g/cm³`),L(`  单价：${c.price===null?'未填写':money(c.price)+' / g'}`,`  Rate: ${c.price===null?'Not entered':money(c.price)+' / g'}`));
   const q=calculateQuote(c,m,r),fees={lines:q.fees,making:q.makingCost,total:q.unitTotal};
   const confidence=({已检查:'checked',未完整检查:'not fully checked',需人工确认:'manual confirmation needed'})[q.confidence]??q.confidence;
   lines.push(
    L(`  几何可信度：${q.confidence}`,`  Geometry confidence: ${confidence}`),
    L(`  理论成品净重：${num(q.netMass)} g`,`  Theoretical finished net mass: ${num(q.netMass)} g`),
    L(`  投料余量：${c.feedAllowancePercent===null||c.feedAllowancePercent===undefined?'待厂家确认':c.feedAllowancePercent+'%'} · 预估投料量：${num(q.feedMass)} g`,`  Feed allowance: ${c.feedAllowancePercent===null||c.feedAllowancePercent===undefined?'supplier confirmation needed':c.feedAllowancePercent+'%'} · Estimated feed mass: ${num(q.feedMass)} g`),
    L(`  材料计费口径：${c.materialBasis==='feed'?'预估投料量':'成品净重'} · 材料成本：${q.materialCost===null?'待计算':money(q.materialCost)}`,`  Material basis: ${c.materialBasis==='feed'?'estimated feed':'net mass'} · Material cost: ${q.materialCost===null?'pending':money(q.materialCost)}`),
    L(`  价格依据：${c.priceBasis==='supplier'?'厂家报价':c.priceBasis==='reference'?'离线参考价':'待选择'} · ${c.priceOrigin||''}`,`  Price basis: ${c.priceBasis==='supplier'?'supplier quote':c.priceBasis==='reference'?'offline reference':'unconfirmed'} · ${c.priceOrigin||''}`),
    L(`  供应商：${c.supplierName||'待填写'} · 报价日期：${c.quoteDate||'待填写'} · 有效期：${c.validUntil||'待填写'}`,`  Supplier: ${c.supplierName||'pending'} · Quote date: ${c.quoteDate||'pending'} · Valid until: ${c.validUntil||'pending'}`),
    L(`  工艺模板：${processTemplates.find(t=>t.id===c.processTemplate)?.name||'自定义 / 未选择'}`,`  Process: ${processTemplates.find(t=>t.id===c.processTemplate)?.name||'custom / not selected'}`));
   lines.push(L('  制作与附加费用：','  Making & extra costs:'));
   for(const f of fees.lines)lines.push(L(`    ${f.name}：${f.rate===null?'单价未填写':money(f.rate)+' '+feeUnit(f.mode,locale)}${f.mode==='perUnit'?' × '+num(f.quantity,3):''}；小计 ${f.amount===null?'待计算':money(f.amount)}`,`    ${translateText(f.name,locale)}: ${f.rate===null?'Rate not entered':money(f.rate)+' '+feeUnit(f.mode,locale)}${f.mode==='perUnit'?' × '+num(f.quantity,3):''}; subtotal ${f.amount===null?'pending':money(f.amount)}`));
   if(!fees.lines.length)lines.push(L('    未添加','    None added'));
   lines.push(L(`  单件制作费用：${fees.making===null?'待计算':money(fees.making)}`,`  Making cost per item: ${fees.making===null?'pending':money(fees.making)}`),L(`  单件材料＋制作：${fees.total===null?'待计算':money(fees.total)}`,`  Material + making per item: ${fees.total===null?'pending':money(fees.total)}`),L(`  数量：${q.batchQuantity} 件 · 整批估算：${q.batchTotal===null?'待计算':money(q.batchTotal)}`,`  Quantity: ${q.batchQuantity} · Batch estimate: ${q.batchTotal===null?'pending':money(q.batchTotal)}`),L(`  报价状态：${q.priceReady?'已选择价格依据':'待确认价格依据'} · ${q.pendingFees.length} 项工艺单价未填写`,`  Quote status: ${q.priceReady?'price basis selected':'price basis pending'} · ${q.pendingFees.length} process rates pending`));
   if(!m.manual){const dims=m.analysis.dimensions.map((n,i)=>num(lengthFromMillimeters(n*UNITS[c.unit]*c.scale[i],displayUnit),3)).join(' × ');lines.push(L(`  外形尺寸：${dims} ${displayUnit}`,`  Dimensions: ${dims} ${displayUnit}`),L(`  源文件单位：${c.unit}`,`  Source unit: ${c.unit}`),L(`  三轴比例：${c.scale.map(v=>num(v*100,3)+'%').join(' / ')}`,`  Axis scales: ${c.scale.map(v=>num(v*100,3)+'%').join(' / ')}`));}
  }lines.push('','');
 }
 return lines.join('\r\n');
}

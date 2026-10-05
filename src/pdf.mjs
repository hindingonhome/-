import {calculateQuote,processTemplates} from './quote.mjs';
import {estimate,estimateVolume,UNITS} from './core.mjs';
import {materials} from './materials.mjs';
import {translateText} from './i18n.mjs';
import {formatCurrency,getCurrencySnapshot} from './currency.mjs';
import {lengthFromMillimeters} from './preferences.mjs';

const sheetStrings={
 title:'金属工坊 · 打样询价单',material:'材质',process:'工艺',dimensions:'外形尺寸',volume:'模型体积',netMass:'理论成品净重',feedMass:'预估投料量',quantity:'数量',confidence:'几何依据',materialCost:'材料成本 / 件',makingCost:'制作费用 / 件',unitTotal:'合计 / 件',batchTotal:'整批估算',details:'工艺与费用明细',pending:'待确认',supplierPending:'待厂家确认',ratePending:'待报价',noModel:'无三维模型',customProcess:'自定义 / 待确认',reference:'采用参考价',supplierQuote:'厂家报价',basisPending:'待选择',empty:'待填写'
};
const sheetEnglish={
 title:'Metal Lab · Sample request',material:'Material',process:'Process',dimensions:'Dimensions',volume:'Model volume',netMass:'Theoretical net mass',feedMass:'Estimated feed mass',quantity:'Quantity',confidence:'Geometry basis',materialCost:'Material cost / item',makingCost:'Making cost / item',unitTotal:'Total / item',batchTotal:'Batch estimate',details:'Process & cost details',pending:'Needs confirmation',supplierPending:'Confirm with supplier',ratePending:'Rate pending',noModel:'No 3D model',customProcess:'Custom / to confirm',reference:'Reference price',supplierQuote:'Supplier quote',basisPending:'Not selected',empty:'To fill'
};
export function sampleSheetCopy(locale='zh-CN',currency='CNY',displayUnit='mm'){
 const strings=locale==='en'?sheetEnglish:locale==='zh-TW'||locale==='ja'||locale==='ko'?Object.fromEntries(Object.entries(sheetStrings).map(([key,value])=>[key,translateText(value,locale)])):sheetStrings;
 return {...strings,metal:key=>key==='custom'?(locale==='en'?'Custom':translateText('自定义金属',locale)):translateText(materials[key]?.name??materials.copper.name,locale),format:(n,d=2)=>Number.isFinite(n)?fmt(n,d,locale):strings.pending,money:n=>Number.isFinite(n)?formatCurrency(n,currency,locale):strings.pending,length:(n)=>Number.isFinite(n)?lengthFromMillimeters(n,displayUnit):NaN,displayUnit};
}

const fmt=(n,d=2,locale='zh-CN')=>Number.isFinite(n)?n.toLocaleString(({en:'en-US',ja:'ja-JP',ko:'ko-KR'}[locale]??locale),{maximumFractionDigits:d}):'待确认';
export function sampleSheetFileName(entries,date=new Date().toLocaleDateString('sv-SE'),format='pdf',locale='zh-CN'){
 if(!entries.length)throw Error('请至少选择一份计算记录');
 if(!['pdf','jpg'].includes(format))throw Error('打样单格式无效');
 const safe=value=>String(value??'未命名').replace(/[\\/:*?"<>|\x00-\x1f]/g,'_').replace(/\s+/g,' ').slice(0,36).replace(/^[_ .]+|[_ .]+$/g,'')||'未命名';
 const prefix=locale==='en'?'MetalLab-SampleSheet':locale==='zh-TW'?'金屬工坊打樣單':locale==='ja'?'メタルラボ見積シート':locale==='ko'?'메탈랩견적서':'金属工坊打样单';
 return entries.length===1?`${prefix}_${safe(translateText(entries[0].model.name,locale))}_${safe(translateText(entries[0].card.name,locale))}_${date}.${format}`:`${prefix}_${locale==='en'?'Batch':locale==='zh-TW'?'批量':'批量'}_${entries.length}${locale==='en'?'items':'份'}_${date}${format==='jpg'?'_JPG.zip':'.pdf'}`;
}
export function pdfFromJpeg(jpeg,width,height){return pdfFromJpegs([{jpeg,width,height}]);}
export function pdfFromJpegs(pages){
 if(!Array.isArray(pages)||!pages.length)throw Error('打样单没有可导出的页面');
 const enc=new TextEncoder(),chunks=[],offsets=[0];let size=0;
 const add=x=>{const b=typeof x==='string'?enc.encode(x):x;chunks.push(b);size+=b.length;};
 const obj=(id,parts)=>{offsets[id]=size;add(`${id} 0 obj\n`);for(const p of parts)add(p);add('\nendobj\n');};
 add('%PDF-1.4\n');obj(1,['<< /Type /Catalog /Pages 2 0 R >>']);obj(2,[`<< /Type /Pages /Kids [${pages.map((_,i)=>`${3+i*3} 0 R`).join(' ')}] /Count ${pages.length} >>`]);
 for(let i=0;i<pages.length;i++){const {jpeg,width,height}=pages[i];if(!(jpeg instanceof Uint8Array)||!Number.isInteger(width)||!Number.isInteger(height)||width<=0||height<=0)throw Error('打样单页面无效');const id=3+i*3,image=id+1,content=id+2;obj(id,[`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /XObject << /Im0 ${image} 0 R >> >> /Contents ${content} 0 R >>`]);obj(image,[`<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`,jpeg,'\nendstream']);const stream='q 595 0 0 842 0 0 cm /Im0 Do Q';obj(content,[`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`]);}
 const count=3+pages.length*3,xref=size;add(`xref\n0 ${count}\n0000000000 65535 f \n`);for(let i=1;i<count;i++)add(`${String(offsets[i]).padStart(10,'0')} 00000 n \n`);add(`trailer\n<< /Size ${count} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`);
 const out=new Uint8Array(size);let at=0;for(const b of chunks){out.set(b,at);at+=b.length;}return out;
}
async function renderSampleSheetJpeg(card,model,locale='zh-CN',currency='CNY',displayUnit='mm'){
 const copy=sampleSheetCopy(locale,currency,displayUnit),t=value=>translateText(value,locale),english=locale==='en';
 let r=null;try{if(model.manual){if(card.manualVolume!==null)r=estimateVolume(card.manualVolume,card.density,card.price);}else if(model.analysis.valid)r=estimate(model.analysis.volume,UNITS[card.unit],card.scale,card.density,card.price);}catch{}
 const q=calculateQuote(card,model,r),canvas=document.createElement('canvas');canvas.width=1240;canvas.height=1754;const ctx=canvas.getContext('2d');ctx.fillStyle='#faf8f4';ctx.fillRect(0,0,1240,1754);ctx.fillStyle='#24272b';ctx.font='bold 56px "Microsoft YaHei", sans-serif';ctx.fillText(copy.title,72,110);ctx.font='28px "Microsoft YaHei", sans-serif';ctx.fillStyle='#697078';ctx.fillText(english?`Generated ${new Date().toLocaleDateString('en-US')} · For quotation only; prices are not final`:t(`生成日期 ${new Date().toLocaleDateString('zh-CN')}  ·  本单为询价依据，金额非最终成交价`),72,160);
 ctx.fillStyle='#2d3035';ctx.fillRect(72,195,1096,290);if(model.thumbnail){try{const image=new Image();image.src=model.thumbnail;await image.decode();ctx.drawImage(image,91,213,250,250);}catch{}}
 ctx.fillStyle='#fff';ctx.font='bold 39px "Microsoft YaHei", sans-serif';ctx.fillText(t(card.name).slice(0,22),370,260);ctx.font='28px "Microsoft YaHei", sans-serif';ctx.fillText(t(model.name).slice(0,32),370,310);ctx.fillText(`${copy.material}: ${copy.metal(card.metal)}`,370,365);ctx.fillText(`${copy.process}: ${card.processTemplate?t(processTemplates.find(x=>x.id===card.processTemplate)?.name??copy.customProcess):copy.customProcess}`,370,420);
 let y=540;const line=(a,b)=>{ctx.fillStyle='#30343a';ctx.font='30px "Microsoft YaHei", sans-serif';ctx.fillText(a,82,y);ctx.font='bold 30px "Microsoft YaHei", sans-serif';ctx.textAlign='right';ctx.fillText(String(b).slice(0,36),1150,y);ctx.textAlign='left';y+=60;};
 line(copy.dimensions,model.manual?copy.noModel:model.analysis.dimensions.map((n,i)=>copy.format(copy.length(n*UNITS[card.unit]*card.scale[i]))).join(' × ')+' '+displayUnit);line(copy.volume,`${copy.format(q.volume,5)} cm³`);line(copy.netMass,`${copy.format(q.netMass,4)} g`);line(copy.feedMass,q.feedMass===null?copy.supplierPending:`${copy.format(q.feedMass,4)} g`);line(copy.quantity,english?String(q.batchQuantity):`${q.batchQuantity} ${t('件')}`);line(copy.confidence,t(q.confidence));
 y+=25;ctx.fillStyle='#c38c6b';ctx.fillRect(72,y,1096,3);y+=58;line(copy.materialCost,q.materialCost===null?copy.pending:copy.money(q.materialCost));line(copy.makingCost,q.makingCost===null?copy.pending:copy.money(q.makingCost));line(copy.unitTotal,q.unitTotal===null?copy.pending:copy.money(q.unitTotal));line(copy.batchTotal,q.batchTotal===null?copy.pending:copy.money(q.batchTotal));
 y+=25;ctx.fillStyle='#c38c6b';ctx.fillRect(72,y,1096,3);y+=55;ctx.fillStyle='#30343a';ctx.font='bold 32px "Microsoft YaHei", sans-serif';ctx.fillText(copy.details,82,y);y+=44;ctx.font='24px "Microsoft YaHei", sans-serif';for(const f of q.fees.slice(0,5)){ctx.fillText(`${t(f.name).slice(0,20)}  ·  ${f.rate===null?copy.ratePending:copy.money(f.amount)}`,92,y);y+=33;}if(q.fees.length>5){ctx.fillText(english?`${q.fees.length-5} more items omitted; confirm each with the supplier.`:t(`另有 ${q.fees.length-5} 项未在本页列明，请与厂家逐项确认。`),92,y);y+=33;}
 y=Math.max(y+35,1460);ctx.font='24px "Microsoft YaHei", sans-serif';const basis=card.priceBasis==='reference'?copy.reference:card.priceBasis==='supplier'?copy.supplierQuote:copy.basisPending;ctx.fillText((english?'Price basis: ':t('价格依据：'))+basis,82,y);y+=30;ctx.font='18px "Microsoft YaHei", sans-serif';const origin=t(card.priceOrigin||'');ctx.fillText(origin.slice(0,100),82,y);if(origin.length>100){y+=24;ctx.fillText(origin.slice(100,200),82,y);}y+=36;ctx.font='24px "Microsoft YaHei", sans-serif';ctx.fillText(english?`Supplier: ${card.supplierName||copy.empty}  Quoted: ${card.quoteDate||copy.empty}  Valid until: ${card.validUntil||copy.empty}`:t(`供应商：${card.supplierName||'待填写'}  报价日期：${card.quoteDate||'待填写'}  有效期：${card.validUntil||'待填写'}`),82,y);y+=54;ctx.fillText(english?`Confirm: shells, feed/recycling, ${q.pendingFees.length} rates, tax, shipping and final quote.`:t(`待确认：封闭/重叠壳体、实际投料与回收、${q.pendingFees.length}项工艺单价、税运与最终报价。`),82,y);y+=40;ctx.fillStyle='#727983';ctx.font='19px "Microsoft YaHei", sans-serif';const fx=getCurrencySnapshot();ctx.fillText(t('每日参考汇率')+` · ${fx.source} · ${fx.date}`,82,y);
 const jpeg=Uint8Array.from(atob(canvas.toDataURL('image/jpeg',.86).split(',')[1]),c=>c.charCodeAt(0));return {jpeg,width:canvas.width,height:canvas.height};
}
export async function buildSampleSheetJpegs(entries,onProgress=()=>{},locale='zh-CN',currency='CNY',displayUnit='mm'){if(!Array.isArray(entries)||!entries.length)throw Error('请至少选择一份计算记录');const pages=[];for(let i=0;i<entries.length;i++){const {card,model}=entries[i];if(!card||!model)throw Error('打样单记录缺少模型信息');pages.push(await renderSampleSheetJpeg(card,model,locale,currency,displayUnit));onProgress(i+1,entries.length);if(i+1<entries.length)await new Promise(resolve=>setTimeout(resolve,0));}return pages;}
export async function buildSampleSheetBatchPdf(entries,onProgress=()=>{},locale='zh-CN',currency='CNY',displayUnit='mm'){const pages=await buildSampleSheetJpegs(entries,onProgress,locale,currency,displayUnit);return new Blob([pdfFromJpegs(pages)],{type:'application/pdf'});}
export async function buildSampleSheetPdf(card,model,locale='zh-CN',currency='CNY',displayUnit='mm'){return buildSampleSheetBatchPdf([{card,model}],()=>{},locale,currency,displayUnit);}

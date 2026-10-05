import {createMarketClient,MARKET_SYMBOLS,MARKET_INTERVAL,usableReference,adoptReference} from './live-market.mjs';
import {setCurrencySnapshot,getCurrencySnapshot,toDisplayCurrency} from './currency.mjs';
export function initMarketUI({selected,apply,translate,currency,format,canRepaint,repaint,toast}){
 const $=id=>document.getElementById(id),CACHE='metal-lab-market-v1';let cached,enabled=true,updating=false,pendingFx=null;
 try{cached=JSON.parse(localStorage.getItem(CACHE));enabled=localStorage.getItem('metal-lab-market-auto')!=='off';}catch{}
 const client=createMarketClient({initial:cached,onChange:snapshot=>{try{localStorage.setItem(CACHE,JSON.stringify(snapshot));}catch{}pendingFx=snapshot.fx;applyFx();}});
 function applyFx(){if(pendingFx&&canRepaint())try{setCurrencySnapshot(pendingFx);pendingFx=null;repaint();}catch{pendingFx=null;}}
 function update(){
  const c=selected(),snapshot=client.snapshot,q=c?snapshot.quotes[c.metal]:null,supported=!!c&&Object.hasOwn(MARKET_SYMBOLS,c.metal),fx=getCurrencySnapshot();
  $('marketAuto').checked=enabled;$('marketRefreshBtn').disabled=updating||!navigator.onLine;
  $('referencePrice').textContent=q?`${format(toDisplayCurrency(q.priceCny,currency()),4)} ${currency()} / g`:'—';
  $('referenceTime').textContent=q?new Date(q.updatedAt).toLocaleString(document.documentElement.lang):'—';
  $('referenceSource').textContent=q?`${q.source} · ${q.symbol} · USD/toz → CNY/g`:'Gold API';$('referenceFxDate').textContent=q?.fxDate??'—';
  const problem=snapshot.errors.includes(c?.metal)||snapshot.errors.includes('fx');
  $('referenceStatus').textContent=translate(updating?'正在更新参考行情…':!supported?'暂无自动行情，请填写采购报价。':problem?'本次更新失败，保留上次数据。':!q?'尚未取得参考行情。':!usableReference(q)?'行情已过期或汇率不可用，请更新后再采用。':snapshot.cached?'数据来自缓存，请核对行情时间。':'已获取参考行情，仅供估算。');
  $('useLivePriceBtn').disabled=!supported||!usableReference(q)||updating;$('manualQuoteBtn').disabled=!c;
  $('currencyRateHint').replaceChildren();for(const text of [translate(fx.source==='ECB'?'内置汇率快照':'每日参考汇率'),fx.date,fx.source,translate(pendingFx?'正在编辑或导出，汇率稍后应用。':snapshot.errors.includes('fx')?'汇率更新失败，保留已有汇率。':'参考汇率仅用于估算，不是实时成交汇率。')]){
   const span=document.createElement('span');span.textContent=text;$('currencyRateHint').append(span,document.createElement('br'));
  }
 }
 async function refresh(){if(updating)return;updating=true;update();try{await client.refresh();}finally{updating=false;update();}}
 $('marketRefreshBtn').onclick=refresh;
 $('useLivePriceBtn').onclick=()=>{try{const c=selected(),q=client.snapshot.quotes[c?.metal];if(!c)return;apply(adoptReference(c,q));toast(translate('已采用参考价，仅更新当前记录。'));}catch{toast(translate('行情已过期或汇率不可用，请更新后再采用。'));}};
 $('manualQuoteBtn').onclick=()=>{const c=selected();if(!c)return;apply({...c,priceBasis:'supplier'});$('price').focus();};
 $('marketAuto').onchange=()=>{enabled=$('marketAuto').checked;try{localStorage.setItem('metal-lab-market-auto',enabled?'on':'off');}catch{}if(enabled)refresh();else update();};
 const poll=()=>{applyFx();if(enabled&&!document.hidden&&navigator.onLine)refresh();else update();};
 setInterval(poll,MARKET_INTERVAL);window.addEventListener('online',poll);document.addEventListener('visibilitychange',()=>{if(!document.hidden)poll();});
 document.addEventListener('focusout',()=>setTimeout(()=>{applyFx();update();},0));
 pendingFx=client.snapshot.fx;applyFx();update();if(enabled&&navigator.onLine)refresh();
 return {update,refresh,applyPending:()=>{applyFx();update();}};
}

export const MARKET_SYMBOLS=Object.freeze({gold:'XAU',silver:'XAG',platinum:'XPT',palladium:'XPD'});
export const TROY_OUNCE_GRAMS=31.1034768;
export const MARKET_INTERVAL=5*60*1000;
const FX_CODES=['USD','CNY','HKD','JPY','KRW','EUR','GBP','AUD','CAD','SGD'];
const FX_URL='https://api.frankfurter.dev/v1/latest?from=USD&to=CNY,HKD,JPY,KRW,EUR,GBP,AUD,CAD,SGD';
function positive(n){if(typeof n!=='number'||!Number.isFinite(n)||n<=0)throw Error('Invalid market value');return n;}
function timestamp(text,now){const n=Date.parse(text);if(typeof text!=='string'||!Number.isFinite(n)||n>now+300000)throw Error('Invalid market time');return n;}
export function normalizeFx(raw,now=Date.now()){
 if(raw?.base!=='USD'||!/^\d{4}-\d{2}-\d{2}$/.test(raw.date)||new Date(timestamp(raw.date,now)).toISOString().slice(0,10)!==raw.date||now-Date.parse(raw.date)>10*86400000)throw Error('Invalid FX snapshot');
 const rates={USD:1};for(const code of FX_CODES.filter(c=>c!=='USD'))rates[code]=positive(raw.rates?.[code]);
 return {base:'USD',date:raw.date,rates,source:'Frankfurter / ECB'};
}
export function normalizeMetal(raw,metal,fx,now=Date.now()){
 if(!Object.hasOwn(MARKET_SYMBOLS,metal)||raw?.symbol!==MARKET_SYMBOLS[metal]||raw.currency!=='USD')throw Error('Invalid metal response');
 timestamp(raw.updatedAt,now);const validatedFx=normalizeFx(fx,now),usdPerOunce=positive(raw.price),priceCny=usdPerOunce/TROY_OUNCE_GRAMS*validatedFx.rates.CNY;
 return {metal,symbol:raw.symbol,priceCny,usdPerOunce,updatedAt:raw.updatedAt,fxDate:validatedFx.date,usdCny:validatedFx.rates.CNY,source:'Gold API'};
}
export function usableReference(q,now=Date.now()){try{return !!q&&Object.hasOwn(MARKET_SYMBOLS,q.metal)&&q.symbol===MARKET_SYMBOLS[q.metal]&&positive(q.priceCny)>0&&now-timestamp(q.updatedAt,now)<=86400000&&now-timestamp(q.fxDate,now)<=10*86400000;}catch{return false;}}
export function adoptReference(card,q,now=Date.now()){
 if(!usableReference(q,now)||card.metal&&card.metal!==q.metal)throw Error('Reference unavailable');
 return {...card,price:q.priceCny,priceBasis:'reference',priceOrigin:`Gold API · ${q.symbol} · ${q.updatedAt} · USD/toz ${q.usdPerOunce} · FX ${q.fxDate} USD/CNY ${q.usdCny}`};
}
export function mergeMarket(previous,incoming){return {...previous,...incoming,quotes:{...previous?.quotes,...incoming.quotes}};}
function safeCache(initial,now){
 const quotes={};for(const [key,q] of Object.entries(initial?.quotes??{}))try{
  if(q.metal!==key||!Object.hasOwn(MARKET_SYMBOLS,key)||q.symbol!==MARKET_SYMBOLS[key])continue;
  positive(q.priceCny);positive(q.usdPerOunce);positive(q.usdCny);timestamp(q.updatedAt,now);timestamp(q.fxDate,now);
  if(Math.abs(q.priceCny-q.usdPerOunce/TROY_OUNCE_GRAMS*q.usdCny)>q.priceCny*1e-9)continue;
  quotes[key]={metal:key,symbol:q.symbol,priceCny:q.priceCny,usdPerOunce:q.usdPerOunce,usdCny:q.usdCny,updatedAt:q.updatedAt,fxDate:q.fxDate,source:'Gold API'};
 }catch{}
 let fx=null;try{fx=normalizeFx(initial?.fx,now);}catch{}
 return {quotes,fx,errors:[],cached:true,lastAttempt:null};
}
export function createMarketClient({fetcher=globalThis.fetch,now=()=>Date.now(),initial,onChange=()=>{}}={}){
 let snapshot=safeCache(initial,now()),pending=null,lastAttempt=-Infinity;
 async function json(url){const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),12000);try{const response=await fetcher(url,{signal:controller.signal,credentials:'omit',referrerPolicy:'no-referrer'});if(!response.ok)throw Error('Market HTTP error');return await response.json();}finally{clearTimeout(timer);}}
 async function refresh(){
  if(pending)return pending;if(now()-lastAttempt<30000)return snapshot;lastAttempt=now();
  pending=(async()=>{
   const errors=[],quotes={};let fx=snapshot.fx;try{fx=normalizeFx(await json(FX_URL),now());}catch{errors.push('fx');}
   let usableFx=null;try{usableFx=normalizeFx(fx,now());}catch{}
   if(usableFx)await Promise.all(Object.entries(MARKET_SYMBOLS).map(async([metal,symbol])=>{try{quotes[metal]=normalizeMetal(await json(`https://api.gold-api.com/price/${symbol}`),metal,usableFx,now());}catch{errors.push(metal);}}));
   else errors.push(...Object.keys(MARKET_SYMBOLS));
   snapshot=mergeMarket(snapshot,{quotes,fx:usableFx??snapshot.fx,errors,cached:false,lastAttempt:new Date(now()).toISOString()});
   onChange(snapshot);return snapshot;
  })();try{return await pending;}finally{pending=null;}
 }
 return {refresh,get snapshot(){return snapshot;}};
}

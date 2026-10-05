import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeFx,normalizeMetal,mergeMarket,adoptReference,createMarketClient,usableReference} from '../src/live-market.mjs';
import {setCurrencySnapshot,resetCurrencySnapshot,toDisplayCurrency,toCanonicalCny,getCurrencySnapshot} from '../src/currency.mjs';
import {marketStrings} from '../src/market-copy.mjs';
import {translateText} from '../src/i18n.mjs';
const now=Date.parse('2026-10-05T06:00:00Z');
const rates={CNY:7,HKD:8,JPY:150,KRW:1400,EUR:.9,GBP:.8,AUD:1.5,CAD:1.4,SGD:1.3};
const fx=()=>normalizeFx({base:'USD',date:'2026-10-02',rates},now);
const raw=(symbol='XAU')=>({symbol,currency:'USD',price:3110.34768,updatedAt:'2026-10-05T05:59:00Z'});
test('troy-ounce conversion uses market FX and never a snapshot from another currency',()=>{
 const q=normalizeMetal(raw(), 'gold',fx(),now);assert.equal(q.priceCny,700);assert.equal(q.fxDate,'2026-10-02');
 assert.throws(()=>normalizeMetal({...raw(),currency:'EUR'},'gold',fx(),now));
 assert.throws(()=>normalizeMetal(raw('XAG'),'gold',fx(),now));
});
test('reject invalid, future or stale data and unsupported metals',()=>{
 for(const price of [0,-1,NaN,Infinity,'4'])assert.throws(()=>normalizeMetal({...raw(),price},'gold',fx(),now));
 assert.throws(()=>normalizeMetal({...raw(),updatedAt:'2026-10-06'},'gold',fx(),now));
 assert.throws(()=>normalizeMetal(raw(),'copper',fx(),now));
 assert.throws(()=>normalizeFx({base:'USD',date:'2026-09-01',rates},now));
 assert.throws(()=>normalizeFx({base:'USD',date:'2026-10-02',rates:{CNY:7}},now));
 assert.equal(usableReference({...normalizeMetal(raw(),'gold',fx(),now),updatedAt:'2026-10-02'},now),false);
});
test('partial refresh preserves cache and quote adoption changes only selected record',()=>{
 const q=normalizeMetal(raw(),'gold',fx(),now),previous={quotes:{gold:q,silver:{...q,symbol:'XAG'}}};
 const merged=mergeMarket(previous,{quotes:{gold:{...q,priceCny:710}},errors:['silver']});
 assert.equal(merged.quotes.silver,previous.quotes.silver);
 const card={price:100,priceBasis:'supplier',supplierName:'Supplier',fees:[{rate:20}]},before=structuredClone(card);
 const adopted=adoptReference(card,q,now);assert.deepEqual(card,before);assert.equal(adopted.price,700);assert.equal(adopted.priceBasis,'reference');assert.deepEqual(adopted.fees,card.fees);
 assert.match(adopted.priceOrigin,/XAU.*2026-10-05.*2026-10-02/);
 assert.throws(()=>adoptReference(card,{...q,updatedAt:'2026-10-01'},now));
});
test('client coalesces simultaneous refresh, rate limits manual clicks, preserves partial successes',async()=>{
 let count=0;const fetcher=async url=>{count++;return {ok:true,json:async()=>url.includes('frankfurter')?{base:'USD',date:'2026-10-02',rates}:url.endsWith('XAG')?{error:'unavailable'}:raw(url.split('/').at(-1))};};
 const client=createMarketClient({fetcher,now:()=>now});
 const [a,b]=await Promise.all([client.refresh(),client.refresh()]);assert.equal(a,b);assert.equal(count,5);assert.ok(a.quotes.gold);assert.deepEqual(a.errors,['silver']);
 await client.refresh();assert.equal(count,5);
});
test('offline or malformed cache does not erase verified quotes',async()=>{
 const q=normalizeMetal(raw(),'gold',fx(),now);
 const c=createMarketClient({initial:{quotes:{gold:q},fx:fx()},fetcher:async()=>{throw Error('offline');},now:()=>now});
 assert.equal((await c.refresh()).quotes.gold.priceCny,700);
 assert.ok(c.snapshot.errors.length);
 const bad=createMarketClient({initial:{quotes:{gold:{priceCny:-5}},fx:{date:'oops'}},now:()=>now});assert.deepEqual(bad.snapshot.quotes,{});
});
test('live currency context updates display but keeps canonical amounts and roundtrip valid',()=>{
 try{setCurrencySnapshot(fx());assert.equal(toDisplayCurrency(700,'USD'),100);assert.equal(toCanonicalCny(100,'USD'),700);assert.equal(getCurrencySnapshot().date,'2026-10-02');
 assert.throws(()=>setCurrencySnapshot({rates:{USD:1,CNY:-1}}));assert.equal(toDisplayCurrency(700,'USD'),100);
 }finally{resetCurrencySnapshot();}
});
test('new market labels translate in all five UI locales',()=>{
 for(const text of Object.keys(marketStrings))for(const locale of ['en','ja','ko']){const translated=translateText(text,locale);assert.notEqual(translated,text);if(locale==='en')assert.doesNotMatch(translated,/[\u4e00-\u9fff]/u);}
 assert.equal(translateText('自动参考行情','zh-CN'),'自动参考行情');
 assert.equal(translateText('自动参考行情','zh-TW'),'自動參考行情');
});

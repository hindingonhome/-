export const CURRENCY_SNAPSHOT_DATE='2026-09-23';

// ECB euro reference rates for 23 September 2026, quoted as currency units per EUR.
export const currencies=Object.freeze([
 {code:'CNY',name:'人民币',rate:7.6538},
 {code:'USD',name:'美元',rate:1.1411},
 {code:'HKD',name:'港币',rate:8.9506},
 {code:'JPY',name:'日元',rate:180.17},
 {code:'KRW',name:'韩元',rate:1558.00},
 {code:'EUR',name:'欧元',rate:1},
 {code:'GBP',name:'英镑',rate:0.85950},
 {code:'AUD',name:'澳元',rate:1.6146},
 {code:'CAD',name:'加元',rate:1.6077},
 {code:'SGD',name:'新加坡元',rate:1.4587},
]);

const rateByCode=new Map(currencies.map(({code,rate})=>[code,rate]));
let currentSnapshot={date:CURRENCY_SNAPSHOT_DATE,source:'ECB',base:'EUR',rates:Object.fromEntries(rateByCode)};
export function getCurrencySnapshot(){return {...currentSnapshot,rates:{...currentSnapshot.rates}};}
export function setCurrencySnapshot(snapshot){
 if(!snapshot||!/^\d{4}-\d{2}-\d{2}$/.test(snapshot.date))throw Error('Invalid currency date');
 const rates=new Map();for(const {code} of currencies){const value=snapshot.rates?.[code];if(typeof value!=='number'||!Number.isFinite(value)||value<=0)throw Error('Invalid currency rate');rates.set(code,value);}
 for(const [code,value] of rates)rateByCode.set(code,value);currentSnapshot={date:snapshot.date,source:snapshot.source??'Frankfurter / ECB',base:snapshot.base??'USD',rates:Object.fromEntries(rates)};
}
export function resetCurrencySnapshot(){for(const {code,rate} of currencies)rateByCode.set(code,rate);currentSnapshot={date:CURRENCY_SNAPSHOT_DATE,source:'ECB',base:'EUR',rates:Object.fromEntries(rateByCode)};}
const localeFor=locale=>({en:'en-US',ja:'ja-JP',ko:'ko-KR'}[locale]??locale);
const formatters=new Map();

function rate(code){const value=rateByCode.get(code);if(!value)throw Error(`不支持的货币：${code}`);return value;}
function validAmount(amount){if(typeof amount!=='number'||!Number.isFinite(amount))throw Error('金额必须是有限数字');return amount;}

export function toDisplayCurrency(amountCny,code){return validAmount(amountCny)*rate(code)/rate('CNY');}
export function toCanonicalCny(amount,code){return validAmount(amount)*rate('CNY')/rate(code);}
export function formatCurrency(amountCny,code,locale='zh-CN'){
 const value=toDisplayCurrency(amountCny,code),tag=localeFor(locale),key=`${tag}:${code}`;
 let formatter=formatters.get(key);if(!formatter){formatter=new Intl.NumberFormat(tag,{style:'currency',currency:code,currencyDisplay:'code',maximumFractionDigits:code==='JPY'||code==='KRW'?0:2});formatters.set(key,formatter);}
 return formatter.format(value);
}

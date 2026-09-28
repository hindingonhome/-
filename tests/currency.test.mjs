import test from 'node:test';
import assert from 'node:assert/strict';
import {toDisplayCurrency,toCanonicalCny,formatCurrency,CURRENCY_SNAPSHOT_DATE,currencies} from '../src/currency.mjs';

test('currency preferences convert canonical CNY using the dated offline snapshot',()=>{
 assert.equal(CURRENCY_SNAPSHOT_DATE,'2026-09-23');
 assert.ok(currencies.some(currency=>currency.code==='JPY'));
 assert.ok(Math.abs(toDisplayCurrency(100,'USD')-14.9092)<0.001);
 assert.ok(Math.abs(toCanonicalCny(toDisplayCurrency(100,'JPY'),'JPY')-100)<1e-10);
 assert.equal(toDisplayCurrency(100,'CNY'),100);
});

test('currency conversion rejects unsupported codes and non-finite amounts',()=>{
 assert.throws(()=>toDisplayCurrency(1,'XXX'),/货币|currency/i);
 assert.throws(()=>toCanonicalCny(Infinity,'USD'),/金额|amount/i);
});

test('currency formatting respects the selected currency and locale',()=>{
 assert.match(formatCurrency(100,'JPY','ja'),/JPY/);
 assert.match(formatCurrency(100,'USD','en'),/USD/);
});

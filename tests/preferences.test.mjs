import test from 'node:test';
import assert from 'node:assert/strict';
import {lengthFromMillimeters,lengthToMillimeters,defaultCurrencyForLocale} from '../src/preferences.mjs';

test('dimension preferences convert displayed values without changing physical size',()=>{
 assert.ok(Math.abs(lengthFromMillimeters(25.4,'in')-1)<1e-12);
 assert.equal(lengthFromMillimeters(304.8,'ft'),1);
 assert.ok(Math.abs(lengthToMillimeters(lengthFromMillimeters(50.8,'in'),'in')-50.8)<1e-10);
 assert.throws(()=>lengthFromMillimeters(10,'yard'),/单位|unit/i);
});

test('language changes select the requested default currency',()=>{
 assert.deepEqual(['zh-CN','zh-TW','en','ja','ko'].map(defaultCurrencyForLocale),['CNY','HKD','USD','JPY','KRW']);
});

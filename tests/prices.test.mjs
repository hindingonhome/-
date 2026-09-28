import test from 'node:test';import assert from 'node:assert/strict';
import {parseHistory,summary} from '../src/market.mjs';
test('price CSV retains last 31 days and rejects invalid dates and duplicate days',()=>{
const a=parseHistory('date,price\n2026-09-21,950\n2026-09-18,970\n2026-07-01,500','2026-09-22');assert.equal(a.length,2);assert.equal(summary(a).mean,960);
assert.throws(()=>parseHistory('date,price\n2026-09-31,950','2026-09-22'));
assert.throws(()=>parseHistory('date,price\n2026-09-21,-10','2026-09-22'));
assert.throws(()=>parseHistory('date,price\n2026-09-21,20\n2026-09-21,30','2026-09-22'));
});

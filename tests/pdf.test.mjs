import test from 'node:test';import assert from 'node:assert/strict';import {pdfFromJpeg,pdfFromJpegs,sampleSheetFileName,sampleSheetCopy} from '../src/pdf.mjs';

test('sample sheets follow the selected language and name all metal presets',()=>{
 const en=sampleSheetCopy('en');
 assert.equal(en.title,'Metal Lab · Sample request');
 assert.equal(en.metal('aluminum'),'Aluminum');
 assert.equal(en.metal('bronze'),'Bronze (approx.)');
 assert.equal(en.format(null),'Needs confirmation');
 assert.ok(!/[\u3400-\u9fff]/.test(Object.values(en).filter(x=>typeof x==='string').join(' ')));
 assert.equal(sampleSheetCopy('zh-TW').title,'金屬工坊 · 打樣詢價單');
});
test('sample sheet values use the selected currency and dimension display unit',()=>{
 const us=sampleSheetCopy('en','USD','in');assert.match(us.money(100),/USD/);assert.equal(us.length(25.4),1);assert.equal(us.displayUnit,'in');
 const ja=sampleSheetCopy('ja','JPY','cm');assert.match(ja.money(100),/JPY/);assert.equal(ja.length(10),1);assert.match(ja.title,/メタルラボ/);assert.match(ja.dimensions,/外形寸法/);
 const ko=sampleSheetCopy('ko','KRW','mm');assert.match(ko.money(100),/KRW/);assert.doesNotMatch(Object.values(ko).filter(x=>typeof x==='string').join(' '),/[\u3400-\u9fff]/);
});
test('sample sheet PDF embeds a single JPEG page with valid cross-reference',()=>{const jpeg=new Uint8Array([255,216,255,217]);const pdf=pdfFromJpeg(jpeg,1240,1754),text=new TextDecoder('latin1').decode(pdf);assert.match(text,/^%PDF-1\.4/);assert.match(text,/\/Count 1/);assert.match(text,/\/Subtype \/Image/);assert.match(text,/\/Length 4/);assert.match(text,/startxref\n\d+\n%%EOF$/);});
test('selected records export as one multi-page PDF with one image per record',()=>{const jpeg=new Uint8Array([255,216,255,217]);const pdf=pdfFromJpegs([{jpeg,width:1240,height:1754},{jpeg,width:1240,height:1754}]),text=new TextDecoder('latin1').decode(pdf);assert.match(text,/\/Count 2/);assert.match(text,/\/Kids \[3 0 R 6 0 R\]/);assert.equal((text.match(/\/Subtype \/Image/g)||[]).length,2);assert.match(text,/xref\n0 9\n/);});
test('sample sheet filenames distinguish one selected record from a batch',()=>{const date='2026-09-24';assert.equal(sampleSheetFileName([{card:{name:'胸针/样品'},model:{name:'铜件'}}],date),'金属工坊打样单_铜件_胸针_样品_2026-09-24.pdf');assert.equal(sampleSheetFileName([{card:{name:'甲'},model:{name:'一'}},{card:{name:'乙'},model:{name:'二'}}],date),'金属工坊打样单_批量_2份_2026-09-24.pdf');});
test('English sheet export uses an English file prefix',()=>{assert.equal(sampleSheetFileName([{card:{name:'原始尺寸'},model:{name:'校验方块 · 1 mm'}}],'2026-09-24','pdf','en'),'MetalLab-SampleSheet_Test cube · 1 mm_Original size_2026-09-24.pdf');});

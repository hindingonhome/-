import test from 'node:test';
import assert from 'node:assert/strict';
import {translateText} from '../src/i18n.mjs';

test('UI translation preserves numbers and converts simplified to Taiwan Traditional',()=>{
 assert.equal(translateText('模型体积','zh-TW'),'模型體積');
 assert.equal(translateText('模型体积','en'),'Model volume');
 assert.equal(translateText('1,551,796 面','en'),'1,551,796 faces');
 assert.match(translateText('1,551,796 面 · 完整表面预览 / 完整体积计算 · 未检查封闭性与自相交 · 退化面 0 · 请确认网格封闭且朝向一致','en'),/closure and self-intersections unchecked/);
 assert.match(translateText('「oversize.obj」按毫米读取时，最长边为 1,000 mm，超出首饰常用检查范围（1—500 mm）。请选择正确单位。','en'),/choose the correct unit/);
 assert.equal(translateText('user_model.stl','en'),'user_model.stl');
 assert.equal(translateText('模型体积','zh-CN'),'模型体积');
 assert.equal(translateText('模型库','ja'),'モデルライブラリ');
 assert.equal(translateText('模型库','ko'),'모델 라이브러리');
 assert.equal(translateText('选择金属','ja'),'金属を選択');
 assert.equal(translateText('材料密度','ko'),'재료 밀도');
});

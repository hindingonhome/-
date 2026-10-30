import test from 'node:test';import assert from 'node:assert/strict';
import {isLiteTouchDevice,phoneFileLimit,phoneMessage,assertPhoneFileSize} from '../src/phone-policy.mjs';
const phone={document:{body:{classList:{contains:value=>value==='metallab-web'}},documentElement:{lang:'en'}},matchMedia:()=>({matches:true})};
test('phone safeguards apply only to the online Lite touch interface',()=>{assert.equal(isLiteTouchDevice(phone),true);assert.equal(isLiteTouchDevice({}),false);assert.equal(isLiteTouchDevice({...phone,matchMedia:()=>({matches:false})}),false);});
test('large conventional files and projects have bounded phone inputs',()=>{assert.equal(phoneFileLimit('stl'),128*1024*1024);assert.equal(phoneFileLimit('glb'),32*1024*1024);assert.equal(phoneFileLimit('project'),32*1024*1024);assert.match(phoneMessage('limit',phone),/desktop/i);});
test('phone project saves and restores share the same byte-size gate',()=>{const max=phoneFileLimit('project');assert.doesNotThrow(()=>assertPhoneFileSize({size:max},'project',phone));assert.throws(()=>assertPhoneFileSize({size:max+1},'project',phone),/too large/);assert.doesNotThrow(()=>assertPhoneFileSize({size:max+1},'project',{}));});

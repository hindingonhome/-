import test from 'node:test';
import assert from 'node:assert/strict';
import {nearestAxisFromDirection} from '../src/view-axis.mjs';

test('orbit direction snaps to the closest left, right, front, back or vertical axis',()=>{
  assert.equal(nearestAxisFromDirection({x:-.9,y:.2,z:.4}),'left');
  assert.equal(nearestAxisFromDirection({x:.9,y:.2,z:.4}),'right');
  assert.equal(nearestAxisFromDirection({x:.1,y:.2,z:.9}),'front');
  assert.equal(nearestAxisFromDirection({x:.1,y:-.95,z:.2}),'bottom');
});

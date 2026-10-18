import test from 'node:test';
import assert from 'node:assert/strict';
import { drawGun } from '../src/games/gunhit/game/art/guns';

function contextWithCalls(calls: string[]) {
  const gradient = { addColorStop: (_position: number, color: string) => {
    if (color.startsWith('#')) assert.match(color, /^#(?:[\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/i);
  } };
  return new Proxy({}, {
    get: (_target, prop) => (...args: unknown[]) => {
      if (prop === 'createLinearGradient' || prop === 'createRadialGradient') return gradient;
      if (prop === 'rotate') calls.push(`rotate:${args[0]}`);
      if (prop === 'rect' || prop === 'fillRect') calls.push(`${String(prop)}:${args.join(',')}`);
      if (prop === 'moveTo' || prop === 'lineTo' || prop === 'quadraticCurveTo' || prop === 'bezierCurveTo') calls.push(String(prop));
    },
    set: () => true,
  }) as CanvasRenderingContext2D;
}

test('Pistol uses the same rearward grip angle as Electro Gun', () => {
  const calls: string[] = [];
  drawGun(contextWithCalls(calls), 'pistol', 0, 0, 0.5, 0);
  const electroCalls: string[] = [];
  drawGun(contextWithCalls(electroCalls), 'electro', 0, 0, 0.5, 0);
  assert.ok(calls.includes('rotate:-0.72'), 'Pistol grip should match Electro Gun rake');
  assert.ok(electroCalls.includes('rotate:-0.72'), 'reference Electro grip should use the same rake');
  assert.ok(calls.includes('quadraticCurveTo'), 'grip should retain its ergonomic curves');
});

test('Plasma Gun renders its own angled, themed grip instead of the generic straight grip', () => {
  const calls: string[] = [];
  drawGun(contextWithCalls(calls), 'plasma', 0, 0, 0.5, 0);
  assert.ok(calls.includes('rotate:-0.32'), 'plasma grip should lean back from its receiver');
  assert.ok(calls.includes('quadraticCurveTo'), 'plasma grip should have a shaped ergonomic silhouette');
});

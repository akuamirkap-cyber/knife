import assert from 'node:assert/strict';
import test from 'node:test';
import { WEAPONS, getWeapon, type WeaponId } from '../src/games/gunhit/game/weapons';

test('peluru senjata UMUM tidak terlalu panjang (stick dipadatkan)', () => {
  const umum = WEAPONS.filter((w) => w.rarity === 'UMUM');
  assert.ok(umum.length >= 10, 'katalog UMUM harus tetap utuh');
  for (const w of umum) {
    assert.ok(w.stick <= 22, `${w.id} terlalu panjang (stick ${w.stick}); maksimal 22`);
  }
  // Yang dulu memakai default stick 30 kini jauh lebih pendek & proporsional.
  for (const id of ['pistol', 'ak47', 'nail', 'crossbow', 'blowgun', 'shotgun', 'soaker', 'pencil'] as WeaponId[]) {
    assert.ok(getWeapon(id).stick <= 20, `${id} harus pendek (stick <= 20), dapat ${getWeapon(id).stick}`);
  }
  // Senjata di luar UMUM tidak ikut diubah (punya karakter sendiri).
  assert.equal(getWeapon('bee').stick, 24);
  assert.equal(getWeapon('banana').stick, 30);
  assert.equal(getWeapon('snowball').stick, 16);
  assert.equal(getWeapon('honey').stick, 22);
});

import type { Weapon } from '../weapons';

const TAU = Math.PI * 2;

// -------------------------------------------------------------
// HIGH-END MATERIAL IMPACT DECAL GENERATOR
// Sesuai dengan jenis senjata (Laser, Peluru Logam, Pedang/Pisau, Air/Buah, Sihir, Ledakan, dll.)
// Menghasilkan bekas yang rapi, modern, dan sangat estetis!
// -------------------------------------------------------------

export function drawPreciseWeaponDecal(
  c: CanvasRenderingContext2D,
  R: number,
  a: number,
  w: Weapon,
  style: string
) {
  const x = Math.cos(a) * (R - 2.5);
  const y = Math.sin(a) * (R - 2.5);
  const inward = a + Math.PI; // Menghadap ke arah pusat target

  c.save();
  c.beginPath();
  c.arc(0, 0, R, 0, TAU);
  c.clip();

  // Celestial/prismatic shots leave a tiny constellation, not a black laser
  // entry hole. This imprint survives after the particle aura has faded.
  if (w.id === 'moonbeam' || w.id === 'rainbow') {
    c.save(); c.translate(x - Math.cos(a) * 7, y - Math.sin(a) * 7);
    c.rotate(inward - Math.PI / 2);
    const isMoon = w.id === 'moonbeam';
    const halo = c.createRadialGradient(0, 0, 1, 0, 0, 20);
    halo.addColorStop(0, isMoon ? 'rgba(255,250,225,0.85)' : 'rgba(255,255,255,0.8)');
    halo.addColorStop(0.5, isMoon ? 'rgba(185,160,246,0.42)' : 'rgba(244,150,234,0.37)');
    halo.addColorStop(1, 'rgba(184,148,248,0)');
    c.fillStyle = halo; c.beginPath(); c.arc(0, 0, 20, 0, TAU); c.fill();
    if (!isMoon) {
      const bands = ['#fb7185', '#fb923c', '#fde047', '#4ade80', '#60a5fa', '#c084fc'];
      for (let i = 0; i < bands.length; i++) {
        c.strokeStyle = bands[i]; c.lineWidth = 1.2;
        c.beginPath(); c.moveTo((i - 2.5) * 2, 3);
        c.quadraticCurveTo((i - 2.5) * 2.6, 13, (i - 2.5) * 1.2, 19); c.stroke();
      }
    }
    c.fillStyle = isMoon ? '#fff5e1' : '#ffffff';
    c.beginPath();
    for (let i = 0; i < 12; i++) {
      const angle = i * TAU / 12 - Math.PI / 2;
      const r = i % 2 ? 2.5 : 6;
      c.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
    }
    c.closePath(); c.fill();
    c.restore(); c.restore(); return;
  }

  // 1. SENJATA LASER / PLASMA / ENERGI (Seperti di screenshot kamu: Plasma/Laser Gun!)
  // Bukan cakar retakan jelek, melainkan burn pin laser mikro mengkilap dengan cincin energi pendaran tipis!
  if (w.energy || w.beam || w.id === 'plasma' || w.id === 'laser' || w.id === 'emerald' || w.id === 'buster') {
    c.save();
    c.translate(x, y);
    c.rotate(inward);

    // Singe entry mark (lubang laser halus lonjong presisi)
    const col = w.color || '#39ff9c';
    c.fillStyle = 'rgba(10, 8, 12, 0.85)';
    c.beginPath();
    c.roundRect(-2, -1, 4, 7, 2);
    c.fill();

    // Hot inner core
    c.fillStyle = '#ffffff';
    c.beginPath();
    c.arc(0, 0, 1.2, 0, TAU);
    c.fill();

    // Radial micro energy singe halo (glow lembut sesuai warna peluru)
    c.strokeStyle = col;
    c.lineWidth = 1.2;
    c.beginPath();
    c.arc(0, 1, 3.5, 0, Math.PI);
    c.stroke();

    // 2 hairline laser cracks yang tajam dan bersih (hanya 2 garis faset pendek 6px)
    c.strokeStyle = 'rgba(255,255,255,0.7)';
    c.lineWidth = 0.8;
    c.beginPath();
    c.moveTo(-2, 0); c.lineTo(-6, 3);
    c.moveTo(2, 0); c.lineTo(6, 3);
    c.stroke();

    c.restore();
    c.restore();
    return;
  }

  if (w.id === 'bamboo') {
    // A modest ring of pale gunpowder/ash; never a giant black blast mark.
    c.save(); c.translate(x - Math.cos(a) * 5, y - Math.sin(a) * 5);
    c.rotate(inward - Math.PI / 2);
    const ash = c.createRadialGradient(0, 4, 1, 0, 4, 16);
    ash.addColorStop(0, 'rgba(255,255,234,0.81)');
    ash.addColorStop(0.55, 'rgba(240,221,164,0.53)');
    ash.addColorStop(1, 'rgba(226,215,186,0)');
    c.fillStyle = ash; c.beginPath(); c.ellipse(0, 4, 16, 11, 0, 0, TAU); c.fill();
    c.strokeStyle = 'rgba(255,248,216,0.91)'; c.lineWidth = 1.2;
    c.beginPath(); c.arc(0, 2, 5, 0, Math.PI * 1.4); c.stroke();
    c.fillStyle = '#f5a345'; c.beginPath(); c.arc(1, 2, 1.4, 0, TAU); c.fill();
    c.restore(); c.restore(); return;
  }

  if (w.id === 'dragon') {
    c.save(); c.translate(x - Math.cos(a) * 5, y - Math.sin(a) * 5);
    c.rotate(inward - Math.PI / 2);
    const ember = c.createRadialGradient(0, 2, 1, 0, 2, 14);
    ember.addColorStop(0, 'rgba(255,224,127,0.83)');
    ember.addColorStop(0.32, 'rgba(228,91,34,0.56)');
    ember.addColorStop(1, 'rgba(105,32,30,0)');
    c.fillStyle = ember; c.beginPath(); c.ellipse(0, 3, 13, 12, 0, 0, TAU); c.fill();
    c.strokeStyle = 'rgba(255,221,126,0.84)'; c.lineWidth = 1.1;
    c.beginPath(); c.moveTo(-5, 4); c.lineTo(-2, 10); c.lineTo(-4, 15);
    c.moveTo(2, 1); c.lineTo(6, 11); c.lineTo(3, 16); c.stroke();
    c.restore(); c.restore(); return;
  }

  // 2. SENJATA TAJAM / SLIT (Pisau, Kunai, Crossbow, Nail Gun, Kartu, Jarum Sumpit)
  // Menghasilkan sayatan tipis bersih (Clean Blade Slit)
  if (w.half <= 3.2 || w.id === 'bee' || w.id === 'kunai' || w.id === 'nail' || w.id === 'crossbow' || w.id === 'card' || w.id === 'blowgun' || w.id === 'pencil') {
    c.save();
    c.translate(x, y);
    c.rotate(inward);

    // Sayatan bersih 1 garis dengan bayangan celah tipis
    c.fillStyle = '#0a0808';
    c.beginPath();
    c.roundRect(-1.2, -1, 2.4, 8, 1.2);
    c.fill();

    // Highlight tajam perak
    c.fillStyle = 'rgba(255,255,255,0.85)';
    c.fillRect(-0.4, 0, 0.8, 6);

    c.restore();
    c.restore();
    return;
  }

  // A packed snowball leaves a pale crushed rim and crystalline hairlines,
  // never the dark entry hole of a metal bullet.
  if (w.id === 'snowball') {
    c.save();
    c.translate(x - Math.cos(a) * 6, y - Math.sin(a) * 6);
    c.rotate(a - Math.PI / 2);
    const frost = c.createRadialGradient(0, 0, 1, 0, 0, 17);
    frost.addColorStop(0, 'rgba(255,255,255,0.9)');
    frost.addColorStop(0.52, 'rgba(237,248,251,0.66)');
    frost.addColorStop(1, 'rgba(211,231,238,0)');
    c.fillStyle = frost;
    c.beginPath(); c.ellipse(0, 0, 17, 12, 0, 0, TAU); c.fill();
    c.strokeStyle = 'rgba(241,252,255,0.9)'; c.lineWidth = 1.15;
    c.beginPath();
    c.moveTo(-12, -2); c.lineTo(-7, 1); c.lineTo(-10, 6);
    c.moveTo(2, -9); c.lineTo(1, -3); c.lineTo(7, -1);
    c.moveTo(4, 4); c.lineTo(10, 7); c.lineTo(12, 10);
    c.stroke();
    c.fillStyle = '#ffffff';
    for (const [dx, dy, r] of [[-13, 5, 1.5], [11, -5, 1.6], [5, 11, 1]]) {
      c.beginPath(); c.arc(dx, dy, r, 0, TAU); c.fill();
    }
    c.restore();
    c.restore();
    return;
  }

  // Honey is a permanent glossy puddle on the rotating face. The bead that
  // remains embedded is drawn separately on top of this smear.
  if (w.id === 'honey') {
    c.save(); c.translate(x, y); c.rotate(inward - Math.PI / 2);
    const syrup = c.createRadialGradient(-2, 8, 1, 0, 10, 28);
    syrup.addColorStop(0, 'rgba(255,242,162,0.96)');
    syrup.addColorStop(0.42, 'rgba(247,175,37,0.91)');
    syrup.addColorStop(1, 'rgba(157,82,12,0.55)');
    c.fillStyle = syrup;
    c.beginPath(); c.moveTo(-12, 0);
    c.bezierCurveTo(-16, 5, -9, 10, -9, 16);
    c.quadraticCurveTo(-8, 24, -5, 25);
    c.quadraticCurveTo(-3, 24, -5, 16);
    c.bezierCurveTo(-2, 16, 1, 16, 2, 19);
    c.quadraticCurveTo(4, 29, 6, 26);
    c.quadraticCurveTo(8, 22, 6, 14);
    c.bezierCurveTo(13, 11, 16, 5, 11, 0);
    c.quadraticCurveTo(1, -6, -12, 0); c.fill();
    c.fillStyle = 'rgba(255,200,72,0.82)';
    for (const [dx, dy, size] of [[-15, 10, 2.9], [14, 14, 2.7], [9, 26, 1.8]]) {
      c.beginPath(); c.arc(dx, dy, size, 0, TAU); c.fill();
    }
    c.strokeStyle = 'rgba(255,250,204,0.84)'; c.lineWidth = 1.4;
    c.beginPath(); c.moveTo(-9, 2);
    c.quadraticCurveTo(0, -2, 8, 1); c.stroke();
    c.restore(); c.restore(); return;
  }

  // Water leaves a reflective, translucent wet stain, not three opaque
  // blue circles (or a bullet hole) on the rotating target.
  if (w.id === 'soaker') {
    c.save();
    c.translate(x - Math.cos(a) * 5, y - Math.sin(a) * 5);
    c.rotate(a - Math.PI / 2);
    const wet = c.createRadialGradient(-2, -2, 1, 0, 0, 12);
    wet.addColorStop(0, 'rgba(216,250,255,0.56)');
    wet.addColorStop(0.5, 'rgba(47,181,227,0.34)');
    wet.addColorStop(1, 'rgba(32,146,207,0)');
    c.fillStyle = wet;
    c.beginPath(); c.ellipse(0, 0, 12, 7, 0, 0, TAU); c.fill();
    c.strokeStyle = 'rgba(219,251,255,0.64)'; c.lineWidth = 1.2;
    c.beginPath(); c.ellipse(0, 0, 9, 4, 0, Math.PI * 1.08, Math.PI * 1.93); c.stroke();
    c.fillStyle = 'rgba(55,188,234,0.5)';
    for (const [dx, dy, size] of [[-8, 7, 2], [7, -7, 1.7], [10, 4, 1.2]]) {
      c.beginPath(); c.arc(dx, dy, size, 0, TAU); c.fill();
    }
    c.restore();
    c.restore();
    return;
  }

  // Mashed banana and juice spread from the flesh embedded halfway in the
  // rim. There is no yellow peel on the board: that stays on the launcher.
  if (w.id === 'banana') {
    c.save(); c.translate(x - Math.cos(a) * 4, y - Math.sin(a) * 4);
    c.rotate(inward - Math.PI / 2);
    const juice = c.createRadialGradient(0, 4, 1, 0, 7, 22);
    juice.addColorStop(0, 'rgba(255,253,222,0.92)');
    juice.addColorStop(0.55, 'rgba(248,221,153,0.64)');
    juice.addColorStop(1, 'rgba(225,177,74,0)');
    c.fillStyle = juice; c.beginPath(); c.ellipse(0, 6, 22, 14, 0, 0, TAU); c.fill();
    c.fillStyle = '#fff2ca';
    for (const [dx, dy, rr] of [[-14, 13, 2.6], [12, 17, 3.3], [5, 24, 1.8]]) {
      c.beginPath(); c.arc(dx, dy, rr, 0, TAU); c.fill();
    }
    c.strokeStyle = 'rgba(255,255,245,0.9)'; c.lineWidth = 1.4;
    c.beginPath(); c.moveTo(-10, 2); c.quadraticCurveTo(1, -4, 13, 2); c.stroke();
    c.restore(); c.restore(); return;
  }

  // 3. SENJATA CAIRAN / BUAH / ORGANIK (Fish, Ink, Paintball, Coconut)
  if (w.id === 'paintball' || w.id === 'fish' || w.id === 'ink' || w.id === 'coconut') {
    c.save();
    c.translate(x, y);
    c.rotate(inward);

    const fluidCol =
      w.id === 'ink'
        ? 'rgba(30, 20, 60, 0.75)'
        : w.id === 'paintball'
        ? `rgba(${w.trail || '244,63,94'}, 0.75)`
        : 'rgba(56, 189, 248, 0.5)';

    // Splat droplet kental
    c.fillStyle = fluidCol;
    c.beginPath();
    c.arc(0, 3, 4, 0, TAU);
    c.arc(-4, 6, 2, 0, TAU);
    c.arc(3, 7, 2.5, 0, TAU);
    c.fill();

    // Specular glossy reflection
    c.fillStyle = 'rgba(255,255,255,0.7)';
    c.beginPath();
    c.arc(-1, 2, 1.2, 0, TAU);
    c.fill();

    c.restore();
    c.restore();
    return;
  }

  // 4. SENJATA ES (Freeze Ray, Sapphire Shotgun)
  if (w.slow && (w.id === 'freeze' || w.id === 'sapphire')) {
    c.save();
    c.translate(x, y);
    c.rotate(inward);

    // Kristal es 4-sudut bersih berkilau
    c.strokeStyle = 'rgba(255,255,255,0.9)';
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(0, -2); c.lineTo(0, 8);
    c.moveTo(-4, 3); c.lineTo(4, 3);
    c.moveTo(-3, 1); c.lineTo(3, 5);
    c.moveTo(3, 1); c.lineTo(-3, 5);
    c.stroke();

    c.fillStyle = 'rgba(186, 230, 253, 0.7)';
    c.beginPath();
    c.arc(0, 3, 2, 0, TAU);
    c.fill();

    c.restore();
    c.restore();
    return;
  }

  // 5. SENJATA LEDAKAN BESAR (RPG, Bazooka, Meteor, Pirate, Bamboo)
  if (w.explode || w.id === 'bazooka' || w.id === 'rpg' || w.id === 'meteor' || w.id === 'pirate') {
    c.save();
    c.translate(x, y);
    c.rotate(inward);

    // Bekas gosong ledakan radial halus
    const g = c.createRadialGradient(0, 3, 1, 0, 3, 12);
    g.addColorStop(0, 'rgba(15, 10, 8, 0.85)');
    g.addColorStop(0.5, 'rgba(60, 30, 10, 0.4)');
    g.addColorStop(1, 'rgba(0, 0, 0, 0)');
    c.fillStyle = g;
    c.beginPath();
    c.arc(0, 3, 12, 0, TAU);
    c.fill();

    // Retakan tajam minimalis 3 arah
    c.strokeStyle = 'rgba(15, 10, 8, 0.9)';
    c.lineWidth = 1.4;
    c.beginPath();
    c.moveTo(0, 0); c.lineTo(-5, 9);
    c.moveTo(0, 0); c.lineTo(0, 11);
    c.moveTo(0, 0); c.lineTo(5, 9);
    c.stroke();

    // Hot ember center
    c.fillStyle = '#ff8000';
    c.beginPath();
    c.arc(0, 1, 1.2, 0, TAU);
    c.fill();

    c.restore();
    c.restore();
    return;
  }

  // 6. DEFAULT SENJATA PELURU LOGAM (Pistol, AK-47, Shotgun, Minigun, Sniper, dll.)
  // Lubang peluru berdimensi estetik profesional Knife Hit
  c.save();
  c.translate(x, y);
  c.rotate(inward);

  // Jika di atas irisan jeruk, gunakan warna sari buah/kulit gelap, jika kayu gunakan warna kayu tua
  const darkColor = style === 'orange' ? '#5a2d0c' : '#140c06';

  // A. Soft indentation halo
  c.fillStyle = 'rgba(0,0,0,0.22)';
  c.beginPath();
  c.arc(0, 2, 4.5, 0, TAU);
  c.fill();

  // B. Circular bullet entry hole
  c.fillStyle = darkColor;
  c.beginPath();
  c.arc(0, 1.5, 2.4, 0, TAU);
  c.fill();

  // C. Tiny specular rim highlight di sisi atas
  c.strokeStyle = 'rgba(255, 255, 255, 0.6)';
  c.lineWidth = 0.8;
  c.beginPath();
  c.arc(0, 1.5, 2.2, Math.PI * 0.9, Math.PI * 1.7);
  c.stroke();

  // D. 2 hairline fractures halus (panjang 5-7px, rapi, BUKAN kaki laba-laba)
  c.strokeStyle = darkColor;
  c.lineWidth = 1.1;
  c.beginPath();
  c.moveTo(-1.8, 1);
  c.lineTo(-4.5, 5);
  c.moveTo(1.8, 1);
  c.lineTo(4.5, 5);
  c.stroke();

  c.restore();
  c.restore();
}

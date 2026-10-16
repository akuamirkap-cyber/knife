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

  // 2. SENJATA TAJAM / SLIT (Pisau, Kunai, Crossbow, Nail Gun, Kartu, Jarum Sumpit)
  // Menghasilkan sayatan tipis bersih (Clean Blade Slit)
  if (w.half <= 3.2 || w.id === 'kunai' || w.id === 'nail' || w.id === 'crossbow' || w.id === 'card' || w.id === 'blowgun' || w.id === 'pencil') {
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

  // 3. SENJATA CAIRAN / BUAH / ORGANIK (Soaker, Fish, Honey, Ink, Paintball, Banana, Coconut)
  // Tidak ada retakan, melainkan cipratan cairan / noda cat / tetesan air segar!
  if (w.id === 'paintball' || w.id === 'soaker' || w.id === 'fish' || w.id === 'honey' || w.id === 'ink' || w.id === 'banana' || w.id === 'coconut') {
    c.save();
    c.translate(x, y);
    c.rotate(inward);

    const fluidCol =
      w.id === 'honey'
        ? 'rgba(245, 158, 11, 0.65)'
        : w.id === 'ink'
        ? 'rgba(30, 20, 60, 0.75)'
        : w.id === 'banana'
        ? 'rgba(250, 204, 21, 0.55)'
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

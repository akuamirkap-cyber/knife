import C2S from 'canvas2svg';
import { strToU8, zipSync } from 'fflate';
import { getGunVariant } from './gunVariants';
import { drawGunCentered } from './drawCentered';
import { getGunMetrics } from './metrics';
import { WEAPONS } from '../weapons';

type SvgContext = CanvasRenderingContext2D & {
  getSerializedSvg: () => string;
};
type SvgContextPrototype = {
  roundRect?: (x: number, y: number, width: number, height: number, radii?: number | number[]) => void;
  ellipse?: (x: number, y: number, radiusX: number, radiusY: number, rotation: number, startAngle: number, endAngle: number, counterclockwise?: boolean) => void;
  setLineDash?: (segments: number[]) => void;
  beginPath?: () => void;
  clip?: () => void;
  __currentElement?: Element;
  __lastPathElement?: Element;
  restore?: () => void;
  __defs?: Element;
  __createElement?: (name: string, props?: Record<string, string>, resetFill?: boolean) => Element;
  __closestGroupOrSvg?: (node?: Node) => Element;
  __applyStyleToCurrentElement?: (type: string) => void;
  strokeStyle?: string | CanvasGradient;
  font?: string;
  __parseFont?: () => { style: string; size: string; family: string; weight: string; decoration: string; href: string | null };
  __fontUnderline?: string;
  __fontHref?: string;
}

let extensionsInstalled = false;

/** canvas2svg predates Canvas roundRect/ellipse; add cubic-path equivalents so gun art stays vector. */
function installSvgCanvasExtensions() {
  if (extensionsInstalled) return;
  const proto = C2S.prototype as unknown as SvgContextPrototype;
  if (!proto.roundRect) {
    proto.roundRect = function (this: CanvasRenderingContext2D, x, y, width, height, radii = 0) {
      const values = (Array.isArray(radii) ? radii : [radii]).map(r => Math.max(0, Number(r) || 0));
      const [tl, tr, br, bl] = values.length === 1
        ? [values[0], values[0], values[0], values[0]]
        : values.length === 2
          ? [values[0], values[1], values[0], values[1]]
          : values.length === 3
            ? [values[0], values[1], values[2], values[1]]
            : [values[0] ?? 0, values[1] ?? values[0] ?? 0, values[2] ?? values[0] ?? 0, values[3] ?? values[1] ?? values[0] ?? 0];
      const left = width < 0 ? x + width : x, top = height < 0 ? y + height : y;
      const w = Math.abs(width), h = Math.abs(height);
      const maxR = Math.min(w, h) / 2;
      const [a, b, c, d] = [tl, tr, br, bl].map(r => Math.min(r, maxR));
      this.moveTo(left + a, top);
      this.lineTo(left + w - b, top); this.quadraticCurveTo(left + w, top, left + w, top + b);
      this.lineTo(left + w, top + h - c); this.quadraticCurveTo(left + w, top + h, left + w - c, top + h);
      this.lineTo(left + d, top + h); this.quadraticCurveTo(left, top + h, left, top + h - d);
      this.lineTo(left, top + a); this.quadraticCurveTo(left, top, left + a, top);
      this.closePath();
    };
  }
  if (!proto.ellipse) {
    proto.ellipse = function (this: CanvasRenderingContext2D, x, y, rx, ry, rotation, start, end, ccw = false) {
      let sweep = end - start;
      if (ccw) {
        if (sweep < -Math.PI * 2) sweep = -Math.PI * 2;
        else while (sweep > 0) sweep -= Math.PI * 2;
      } else {
        if (sweep > Math.PI * 2) sweep = Math.PI * 2;
        else while (sweep < 0) sweep += Math.PI * 2;
      }
      const count = Math.max(1, Math.ceil(Math.abs(sweep) / (Math.PI / 2)));
      const step = sweep / count;
      const cosR = Math.cos(rotation), sinR = Math.sin(rotation);
      const point = (angle: number) => ({
        x: x + rx * Math.cos(angle) * cosR - ry * Math.sin(angle) * sinR,
        y: y + rx * Math.cos(angle) * sinR + ry * Math.sin(angle) * cosR,
      });
      const tangent = (angle: number) => ({
        x: -rx * Math.sin(angle) * cosR - ry * Math.cos(angle) * sinR,
        y: -rx * Math.sin(angle) * sinR + ry * Math.cos(angle) * cosR,
      });
      const first = point(start);
      this.moveTo(first.x, first.y);
      for (let i = 0; i < count; i++) {
        const a0 = start + i * step, a1 = a0 + step;
        const p0 = point(a0), p1 = point(a1), t0 = tangent(a0), t1 = tangent(a1);
        const k = 4 / 3 * Math.tan((a1 - a0) / 4);
        this.bezierCurveTo(p0.x + k * t0.x, p0.y + k * t0.y, p1.x - k * t1.x, p1.y - k * t1.y, p1.x, p1.y);
      }
    };
  }
  if (!proto.setLineDash) proto.setLineDash = function () { /* decorative dash patterns are omitted by SVG fallback */ };

  // canvas2svg assumes the current path is inside the current group. Canvas keeps
  // the path across save(), so retain the last path and apply it to the saved group.
  const beginPath = proto.beginPath;
  if (beginPath) {
    proto.beginPath = function (this: CanvasRenderingContext2D & SvgContextPrototype) {
      beginPath.call(this);
      this.__lastPathElement = this.__currentElement;
    };
  }
  proto.clip = function (this: CanvasRenderingContext2D & SvgContextPrototype) {
    const path = this.__lastPathElement;
    const current = this.__currentElement;
    if (!path || !this.__defs || !this.__createElement) return;
    const target = current && (current.nodeName === 'g' || current.nodeName === 'svg')
      ? current
      : this.__closestGroupOrSvg?.(path.parentNode ?? undefined);
    if (!target) return;

    const id = `gun-hit-clip-${Math.random().toString(36).slice(2)}`;
    const clip = this.__createElement('clipPath', { id, clipPathUnits: 'userSpaceOnUse' });
    clip.appendChild(path.cloneNode(true));
    this.__defs.appendChild(clip);
    target.setAttribute('clip-path', `url(#${id})`);
    const childGroup = this.__createElement('g');
    target.appendChild(childGroup);
    this.__currentElement = childGroup;
  };
  const restore = proto.restore;
  if (restore) {
    proto.restore = function (this: CanvasRenderingContext2D & SvgContextPrototype) {
      restore.call(this);
      if (this.__lastPathElement?.parentNode) this.__currentElement = this.__lastPathElement;
    };
  }
  const applyStyle = proto.__applyStyleToCurrentElement;
  if (applyStyle) {
    proto.__applyStyleToCurrentElement = function (this: CanvasRenderingContext2D & SvgContextPrototype, type: string) {
      const property = type === 'stroke' ? 'strokeStyle' : 'fillStyle';
      const previous = this[property];
      const gradientRoot = previous && typeof previous !== 'string'
        ? (previous as unknown as { __root?: Element }).__root : undefined;
      let opacity: string | null = null;
      if (type === 'stroke' && gradientRoot?.getAttribute('id')) {
        this.strokeStyle = `url(#${gradientRoot.getAttribute('id')})`;
      } else if (typeof previous === 'string') {
        const rgba = previous.match(/^rgba?\(\s*([\d.]+)(%)?\s*[, ]\s*([\d.]+)(%)?\s*[, ]\s*([\d.]+)(%)?\s*(?:[,/]\s*([\d.]+)(%)?)?\s*\)$/i);
        if (rgba) {
          const rgb = [1, 3, 5].map(i => Math.round(Number(rgba[i]) * (rgba[i + 1] ? 2.55 : 1))).join(',');
          opacity = String(rgba[7] ? Number(rgba[7]) / (rgba[8] ? 100 : 1) : 1);
          this[property] = `rgb(${rgb})`;
        }
      }
      try {
        applyStyle.call(this, type);
        if (opacity !== null && Number(opacity) < 1) {
          this.__currentElement?.setAttribute(type === 'stroke' ? 'stroke-opacity' : 'fill-opacity', opacity);
        }
      } finally { this[property] = previous as never; }
    };
  }
  const parseFont = proto.__parseFont;
  if (parseFont) {
    proto.__parseFont = function (this: CanvasRenderingContext2D & SvgContextPrototype) {
      try { return parseFont.call(this); }
      catch {
        const raw = this.font || '';
        const size = raw.match(/([\d.]+px)/i)?.[1] ?? '10px';
        const family = raw.match(/['\"]([^'\"]+)['\"]/i)?.[1] ?? 'sans-serif';
        return {
          style: /\bitalic\b/i.test(raw) ? 'italic' : 'normal', size, family,
          weight: /\bbold\b|\b[6-9]00\b/i.test(raw) ? 'bold' : 'normal',
          decoration: this.__fontUnderline === 'underline' ? 'underline' : 'normal',
          href: this.__fontHref ?? null,
        };
      }
    };
  }
  extensionsInstalled = true;
}

const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const escapeXml = (value: string) => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[char]!);

function weaponToSvg(id: (typeof WEAPONS)[number]['id'], name: string, rarity: string) {
  installSvgCanvasExtensions();
  const size = 512;
  const ctx = new C2S(size, size) as unknown as SvgContext;
  const metrics = getGunMetrics(id, getGunVariant(id));
  ctx.translate(size / 2, size / 2);
  ctx.rotate(Math.PI / 4);
  ctx.scale((size * 0.86) / Math.max(metrics.span, 130), (size * 0.86) / Math.max(metrics.span, 130));
  drawGunCentered(ctx, id, 0.7, 0, true, getGunVariant(id), false);
  const svg = ctx.getSerializedSvg();
  const title = `<title>${escapeXml(name)} — ${escapeXml(rarity)}</title>`;
  return svg.replace(/(<svg\b[^>]*>)/, `$1${title}`);
}

/** Creates one ZIP containing one real, editable vector SVG per catalog weapon. */
export async function buildWeaponSvgArchive(onProgress?: (done: number, total: number) => void): Promise<Uint8Array> {
  const files: Record<string, Uint8Array> = {};
  const readme = ['Gun Hit SGA — weapon SVG exports', '', 'Each file is a vector SVG rendered from the game weapon art.', 'Names and rarity follow the in-game catalog.', ''];
  const total = WEAPONS.length;
  for (let index = 0; index < total; index++) {
    const weapon = WEAPONS[index];
    const path = `gun-hit-sga/${slug(weapon.rarity)}/${slug(weapon.name)}.svg`;
    files[path] = strToU8(weaponToSvg(weapon.id, weapon.name, weapon.rarity));
    readme.push(`${weapon.rarity}\t${weapon.name}\t${path}`);
    onProgress?.(index + 1, total);
    if (index % 5 === 4) await new Promise<void>(resolve => window.setTimeout(resolve, 0));
  }
  files['gun-hit-sga/README.txt'] = strToU8(readme.join('\n'));
  return zipSync(files, { level: 6 });
}

declare module 'canvas2svg' {
  class Canvas2SVG {
    constructor(width: number, height: number, options?: { document?: Document; enableMirroring?: boolean });
    getSerializedSvg(fixNamedEntities?: boolean): string;
    [key: string]: any;
  }
  export default Canvas2SVG;
}

/**
 * @fukict/runtime - JSX Type Definitions
 *
 * JSX namespace and intrinsic elements for TypeScript
 */
import type { VNode } from './core.js';
import type {
  FukictDetachAttribute,
  FukictRefAttribute,
  FukictSlotAttribute,
  HTMLAttributes,
  SVGAttributes,
} from './dom-attributes.js';

/**
 * JSX namespace for TypeScript
 */
export namespace JSX {
  // JSX.Element is the return type of JSX expressions
  // VNode is a union type, so we use it directly as the type alias
  export type Element = VNode;

  /**
   * IntrinsicAttributes - Applied to ALL components (function and class)
   * This automatically adds fukict:slot support to all components
   */
  export interface IntrinsicAttributes extends FukictSlotAttribute {}

  /**
   * Props type for Function Components
   * Supports: fukict:slot (for children marking)
   */
  export type FunctionComponentProps<P = {}> = P & FukictSlotAttribute;

  /**
   * Props type for Class Components
   * Supports: fukict:ref, fukict:slot, fukict:detach
   */
  export type ClassComponentProps<P = {}> = P &
    FukictRefAttribute &
    FukictSlotAttribute &
    FukictDetachAttribute;

  /**
   * HTML intrinsic elements
   */
  export interface IntrinsicHTMLElements {
    // All standard HTML elements use HTMLAttributes with their corresponding DOM type
    // This automatically includes all native DOM properties via HTMLAttributes<T>

    // Document metadata
    base: HTMLAttributes<HTMLBaseElement>;
    head: HTMLAttributes<HTMLHeadElement>;
    link: HTMLAttributes<HTMLLinkElement>;
    meta: HTMLAttributes<HTMLMetaElement>;
    style: HTMLAttributes<HTMLStyleElement>;
    title: HTMLAttributes<HTMLTitleElement>;

    // Content sectioning
    address: HTMLAttributes<HTMLElement>;
    article: HTMLAttributes<HTMLElement>;
    aside: HTMLAttributes<HTMLElement>;
    footer: HTMLAttributes<HTMLElement>;
    header: HTMLAttributes<HTMLElement>;
    h1: HTMLAttributes<HTMLHeadingElement>;
    h2: HTMLAttributes<HTMLHeadingElement>;
    h3: HTMLAttributes<HTMLHeadingElement>;
    h4: HTMLAttributes<HTMLHeadingElement>;
    h5: HTMLAttributes<HTMLHeadingElement>;
    h6: HTMLAttributes<HTMLHeadingElement>;
    main: HTMLAttributes<HTMLElement>;
    nav: HTMLAttributes<HTMLElement>;
    section: HTMLAttributes<HTMLElement>;

    // Text content
    blockquote: HTMLAttributes<HTMLQuoteElement>;
    dd: HTMLAttributes<HTMLElement>;
    div: HTMLAttributes<HTMLDivElement>;
    dl: HTMLAttributes<HTMLDListElement>;
    dt: HTMLAttributes<HTMLElement>;
    figcaption: HTMLAttributes<HTMLElement>;
    figure: HTMLAttributes<HTMLElement>;
    hr: HTMLAttributes<HTMLHRElement>;
    li: HTMLAttributes<HTMLLIElement>;
    ol: HTMLAttributes<HTMLOListElement>;
    p: HTMLAttributes<HTMLParagraphElement>;
    pre: HTMLAttributes<HTMLPreElement>;
    ul: HTMLAttributes<HTMLUListElement>;

    // Inline text semantics
    a: HTMLAttributes<HTMLAnchorElement>;
    abbr: HTMLAttributes<HTMLElement>;
    b: HTMLAttributes<HTMLElement>;
    bdi: HTMLAttributes<HTMLElement>;
    bdo: HTMLAttributes<HTMLElement>;
    br: HTMLAttributes<HTMLBRElement>;
    cite: HTMLAttributes<HTMLElement>;
    code: HTMLAttributes<HTMLElement>;
    data: HTMLAttributes<HTMLDataElement>;
    dfn: HTMLAttributes<HTMLElement>;
    em: HTMLAttributes<HTMLElement>;
    i: HTMLAttributes<HTMLElement>;
    kbd: HTMLAttributes<HTMLElement>;
    mark: HTMLAttributes<HTMLElement>;
    q: HTMLAttributes<HTMLQuoteElement>;
    rp: HTMLAttributes<HTMLElement>;
    rt: HTMLAttributes<HTMLElement>;
    ruby: HTMLAttributes<HTMLElement>;
    s: HTMLAttributes<HTMLElement>;
    samp: HTMLAttributes<HTMLElement>;
    small: HTMLAttributes<HTMLElement>;
    span: HTMLAttributes<HTMLSpanElement>;
    strong: HTMLAttributes<HTMLElement>;
    sub: HTMLAttributes<HTMLElement>;
    sup: HTMLAttributes<HTMLElement>;
    time: HTMLAttributes<HTMLTimeElement>;
    u: HTMLAttributes<HTMLElement>;
    var: HTMLAttributes<HTMLElement>;
    wbr: HTMLAttributes<HTMLElement>;

    // Image and multimedia
    area: HTMLAttributes<HTMLAreaElement>;
    audio: HTMLAttributes<HTMLAudioElement>;
    img: HTMLAttributes<HTMLImageElement>;
    map: HTMLAttributes<HTMLMapElement>;
    track: HTMLAttributes<HTMLTrackElement>;
    video: HTMLAttributes<HTMLVideoElement>;

    // Embedded content
    embed: HTMLAttributes<HTMLEmbedElement>;
    iframe: HTMLAttributes<HTMLIFrameElement>;
    object: HTMLAttributes<HTMLObjectElement>;
    picture: HTMLAttributes<HTMLPictureElement>;
    source: HTMLAttributes<HTMLSourceElement>;

    // Scripting
    canvas: HTMLAttributes<HTMLCanvasElement>;
    noscript: HTMLAttributes<HTMLElement>;
    script: HTMLAttributes<HTMLScriptElement>;

    // Demarcating edits
    del: HTMLAttributes<HTMLModElement>;
    ins: HTMLAttributes<HTMLModElement>;

    // Table content
    caption: HTMLAttributes<HTMLTableCaptionElement>;
    col: HTMLAttributes<HTMLTableColElement>;
    colgroup: HTMLAttributes<HTMLTableColElement>;
    table: HTMLAttributes<HTMLTableElement>;
    tbody: HTMLAttributes<HTMLTableSectionElement>;
    td: HTMLAttributes<HTMLTableCellElement>;
    tfoot: HTMLAttributes<HTMLTableSectionElement>;
    th: HTMLAttributes<HTMLTableCellElement>;
    thead: HTMLAttributes<HTMLTableSectionElement>;
    tr: HTMLAttributes<HTMLTableRowElement>;

    // Forms
    button: HTMLAttributes<HTMLButtonElement>;
    datalist: HTMLAttributes<HTMLDataListElement>;
    fieldset: HTMLAttributes<HTMLFieldSetElement>;
    form: HTMLAttributes<HTMLFormElement>;
    input: HTMLAttributes<HTMLInputElement>;
    label: HTMLAttributes<HTMLLabelElement>;
    legend: HTMLAttributes<HTMLLegendElement>;
    meter: HTMLAttributes<HTMLMeterElement>;
    optgroup: HTMLAttributes<HTMLOptGroupElement>;
    option: HTMLAttributes<HTMLOptionElement>;
    output: HTMLAttributes<HTMLOutputElement>;
    progress: HTMLAttributes<HTMLProgressElement>;
    select: HTMLAttributes<HTMLSelectElement>;
    textarea: HTMLAttributes<HTMLTextAreaElement>;

    // Interactive elements
    details: HTMLAttributes<HTMLDetailsElement>;
    dialog: HTMLAttributes<HTMLDialogElement>;
    menu: HTMLAttributes<HTMLMenuElement>;
    summary: HTMLAttributes<HTMLElement>;

    // Web Components
    slot: HTMLAttributes<HTMLSlotElement>;
    template: HTMLAttributes<HTMLTemplateElement>;
  }

  /**
   * SVG intrinsic elements
   */
  export interface IntrinsicSVGElements {
    // SVG container elements
    svg: SVGAttributes<SVGSVGElement>;
    g: SVGAttributes<SVGGElement>;
    defs: SVGAttributes<SVGDefsElement>;
    symbol: SVGAttributes<SVGSymbolElement>;
    marker: SVGAttributes<SVGMarkerElement>;
    clipPath: SVGAttributes<SVGClipPathElement>;
    mask: SVGAttributes<SVGMaskElement>;
    pattern: SVGAttributes<SVGPatternElement>;
    foreignObject: SVGAttributes<SVGForeignObjectElement>;

    // SVG shape elements
    circle: SVGAttributes<SVGCircleElement>;
    ellipse: SVGAttributes<SVGEllipseElement>;
    line: SVGAttributes<SVGLineElement>;
    path: SVGAttributes<SVGPathElement>;
    polygon: SVGAttributes<SVGPolygonElement>;
    polyline: SVGAttributes<SVGPolylineElement>;
    rect: SVGAttributes<SVGRectElement>;

    // SVG text elements
    text: SVGAttributes<SVGTextElement>;
    tspan: SVGAttributes<SVGTSpanElement>;
    textPath: SVGAttributes<SVGTextPathElement>;

    // SVG gradient elements
    linearGradient: SVGAttributes<SVGLinearGradientElement>;
    radialGradient: SVGAttributes<SVGRadialGradientElement>;
    stop: SVGAttributes<SVGStopElement>;

    // SVG filter elements
    filter: SVGAttributes<SVGFilterElement>;
    feBlend: SVGAttributes<SVGFEBlendElement>;
    feColorMatrix: SVGAttributes<SVGFEColorMatrixElement>;
    feComponentTransfer: SVGAttributes<SVGFEComponentTransferElement>;
    feComposite: SVGAttributes<SVGFECompositeElement>;
    feConvolveMatrix: SVGAttributes<SVGFEConvolveMatrixElement>;
    feDiffuseLighting: SVGAttributes<SVGFEDiffuseLightingElement>;
    feDisplacementMap: SVGAttributes<SVGFEDisplacementMapElement>;
    feDistantLight: SVGAttributes<SVGFEDistantLightElement>;
    feDropShadow: SVGAttributes<SVGFEDropShadowElement>;
    feFlood: SVGAttributes<SVGFEFloodElement>;
    feFuncA: SVGAttributes<SVGFEFuncAElement>;
    feFuncB: SVGAttributes<SVGFEFuncBElement>;
    feFuncG: SVGAttributes<SVGFEFuncGElement>;
    feFuncR: SVGAttributes<SVGFEFuncRElement>;
    feGaussianBlur: SVGAttributes<SVGFEGaussianBlurElement>;
    feImage: SVGAttributes<SVGFEImageElement>;
    feMerge: SVGAttributes<SVGFEMergeElement>;
    feMergeNode: SVGAttributes<SVGFEMergeNodeElement>;
    feMorphology: SVGAttributes<SVGFEMorphologyElement>;
    feOffset: SVGAttributes<SVGFEOffsetElement>;
    fePointLight: SVGAttributes<SVGFEPointLightElement>;
    feSpecularLighting: SVGAttributes<SVGFESpecularLightingElement>;
    feSpotLight: SVGAttributes<SVGFESpotLightElement>;
    feTile: SVGAttributes<SVGFETileElement>;
    feTurbulence: SVGAttributes<SVGFETurbulenceElement>;

    // SVG animation elements
    animate: SVGAttributes<SVGAnimateElement>;
    animateMotion: SVGAttributes<SVGElement>;
    animateTransform: SVGAttributes<SVGAnimateTransformElement>;
    set: SVGAttributes<SVGSetElement>;

    // SVG other elements
    image: SVGAttributes<SVGImageElement>;
    use: SVGAttributes<SVGUseElement>;
    view: SVGAttributes<SVGViewElement>;
    desc: SVGAttributes<SVGDescElement>;
    metadata: SVGAttributes<SVGMetadataElement>;
    mpath: SVGAttributes<SVGElement>;
    switch: SVGAttributes<SVGSwitchElement>;
  }

  /**
   * All intrinsic elements (HTML + SVG)
   */
  export interface IntrinsicElements
    extends IntrinsicHTMLElements,
      IntrinsicSVGElements {
    // Allow any other HTML element
    [elemName: string]: any;
  }

  export interface ElementChildrenAttribute {
    children: {};
  }
}

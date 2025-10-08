/**
 * @fukict/runtime - JSX Type Definitions
 *
 * JSX namespace and intrinsic elements for TypeScript
 */
import type { VNode } from './core';
import type { HTMLAttributes, SVGAttributes } from './dom-attributes';

/**
 * JSX namespace for TypeScript
 */
export namespace JSX {
  export interface Element extends VNode {}

  export interface IntrinsicElements {
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

    // SVG
    svg: SVGAttributes<SVGSVGElement>;

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

    // Allow any other HTML element
    [elemName: string]: any;
  }

  export interface ElementChildrenAttribute {
    children: {};
  }
}

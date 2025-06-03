import type { DOMProps, VNode } from './types.js';

declare global {
  namespace JSX {
    interface Element extends VNode {}

    interface IntrinsicElements {
      // HTML 容器元素
      div: DOMProps;
      span: DOMProps;
      section: DOMProps;
      article: DOMProps;
      header: DOMProps;
      footer: DOMProps;
      main: DOMProps;
      aside: DOMProps;
      nav: DOMProps;

      // 文本元素
      p: DOMProps;
      h1: DOMProps;
      h2: DOMProps;
      h3: DOMProps;
      h4: DOMProps;
      h5: DOMProps;
      h6: DOMProps;
      strong: DOMProps;
      em: DOMProps;
      b: DOMProps;
      i: DOMProps;
      u: DOMProps;
      s: DOMProps;
      small: DOMProps;
      mark: DOMProps;
      del: DOMProps;
      ins: DOMProps;
      sub: DOMProps;
      sup: DOMProps;
      code: DOMProps;
      pre: DOMProps;
      kbd: DOMProps;
      samp: DOMProps;
      var: DOMProps;
      blockquote: DOMProps;
      cite: DOMProps;
      q: DOMProps;

      // 链接和媒体
      a: DOMProps & { href?: string; target?: string; rel?: string };
      img: DOMProps & {
        src?: string;
        alt?: string;
        width?: number;
        height?: number;
      };
      audio: DOMProps & {
        src?: string;
        controls?: boolean;
        autoplay?: boolean;
        loop?: boolean;
      };
      video: DOMProps & {
        src?: string;
        controls?: boolean;
        autoplay?: boolean;
        loop?: boolean;
        width?: number;
        height?: number;
      };
      source: DOMProps & { src?: string; type?: string; media?: string };
      track: DOMProps & {
        kind?: string;
        src?: string;
        srclang?: string;
        label?: string;
      };

      // 表单元素
      form: DOMProps & {
        action?: string;
        method?: 'get' | 'post';
        enctype?: string;
      };
      input: DOMProps & {
        type?: string;
        value?: string | number;
        placeholder?: string;
        checked?: boolean;
        disabled?: boolean;
        required?: boolean;
        readonly?: boolean;
        name?: string;
        id?: string;
        min?: number;
        max?: number;
        step?: number;
        pattern?: string;
        autocomplete?: string;
      };
      button: DOMProps & {
        type?: 'button' | 'submit' | 'reset';
        disabled?: boolean;
      };
      textarea: DOMProps & {
        value?: string;
        placeholder?: string;
        rows?: number;
        cols?: number;
        readonly?: boolean;
        disabled?: boolean;
      };
      select: DOMProps & {
        value?: string;
        multiple?: boolean;
        disabled?: boolean;
        size?: number;
      };
      option: DOMProps & {
        value?: string;
        selected?: boolean;
        disabled?: boolean;
      };
      optgroup: DOMProps & { label?: string; disabled?: boolean };
      label: DOMProps & { htmlFor?: string };
      fieldset: DOMProps & { disabled?: boolean };
      legend: DOMProps;
      datalist: DOMProps;

      // 列表元素
      ul: DOMProps;
      ol: DOMProps & {
        start?: number;
        reversed?: boolean;
        type?: '1' | 'a' | 'A' | 'i' | 'I';
      };
      li: DOMProps & { value?: number };
      dl: DOMProps;
      dt: DOMProps;
      dd: DOMProps;

      // 表格元素
      table: DOMProps;
      caption: DOMProps;
      thead: DOMProps;
      tbody: DOMProps;
      tfoot: DOMProps;
      tr: DOMProps;
      th: DOMProps & {
        scope?: 'col' | 'row' | 'colgroup' | 'rowgroup';
        colspan?: number;
        rowspan?: number;
      };
      td: DOMProps & { colspan?: number; rowspan?: number };
      colgroup: DOMProps;
      col: DOMProps & { span?: number };

      // 其他元素
      hr: DOMProps;
      br: DOMProps;
      wbr: DOMProps;
      details: DOMProps & { open?: boolean };
      summary: DOMProps;
      dialog: DOMProps & { open?: boolean };
      template: DOMProps;
      slot: DOMProps & { name?: string };

      // 内联框架和嵌入内容
      iframe: DOMProps & {
        src?: string;
        width?: number;
        height?: number;
        sandbox?: string;
        allow?: string;
      };
      embed: DOMProps & {
        src?: string;
        type?: string;
        width?: number;
        height?: number;
      };
      object: DOMProps & {
        data?: string;
        type?: string;
        width?: number;
        height?: number;
      };
      param: DOMProps & { name?: string; value?: string };

      // HTML5 语义化元素
      time: DOMProps & { datetime?: string };
      data: DOMProps & { value?: string };
      output: DOMProps & { htmlFor?: string; form?: string; name?: string };
      progress: DOMProps & { value?: number; max?: number };
      meter: DOMProps & {
        value?: number;
        min?: number;
        max?: number;
        low?: number;
        high?: number;
        optimum?: number;
      };

      // 交互元素
      menu: DOMProps;

      // Canvas 和 SVG
      canvas: DOMProps & { width?: number; height?: number };
      svg: DOMProps & { width?: number; height?: number; viewBox?: string };

      // 脚本和样式
      script: DOMProps & {
        src?: string;
        type?: string;
        async?: boolean;
        defer?: boolean;
      };
      noscript: DOMProps;
      style: DOMProps & { type?: string; media?: string };
      link: DOMProps & {
        href?: string;
        rel?: string;
        type?: string;
        media?: string;
      };

      // 元数据
      title: DOMProps;
      meta: DOMProps & {
        name?: string;
        content?: string;
        charset?: string;
        httpEquiv?: string;
      };
      base: DOMProps & { href?: string; target?: string };
    }

    interface ElementAttributesProperty {
      props: {};
    }

    interface ElementChildrenAttribute {
      children: {};
    }
  }
}

// 导出一个空对象以使此文件成为模块
export {};

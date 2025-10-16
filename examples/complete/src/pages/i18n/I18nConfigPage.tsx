import { Fukict } from '@fukict/basic';
import { createI18n } from '@fukict/i18n';
import { RouteComponent } from '@fukict/router';

import { CodeBlock } from '../../components/CodeBlock';
import { DemoBox } from '../../components/DemoBox';
import { SplitView } from '../../components/SplitView';

/**
 * 创建演示用的 i18n 实例
 */
const demoI18n = createI18n({
  defaultLocale: 'zh',
  locale: 'zh',
  fallbackLocale: 'en',
  messages: {
    en: {
      greeting: 'Hello, {name}!',
      welcome: 'Welcome to Fukict',
      currentLanguage: 'Current Language',
      switchTo: 'Switch to',
    },
    zh: {
      greeting: '你好,{name}!',
      welcome: '欢迎使用 Fukict',
      currentLanguage: '当前语言',
      switchTo: '切换到',
    },
    ja: {
      greeting: 'こんにちは、{name}!',
      welcome: 'Fukict へようこそ',
      currentLanguage: '現在の言語',
      switchTo: '切り替え',
    },
  },
});

/**
 * 基础配置演示
 */
class BasicConfigDemo extends Fukict {
  private unsubscribe?: () => void;

  mounted() {
    this.unsubscribe = demoI18n.subscribe(() => {
      this.update();
    });
  }

  beforeUnmount() {
    this.unsubscribe?.();
  }

  render() {
    return (
      <div class="space-y-4">
        <div class="space-y-2 rounded bg-gray-50 p-4 text-sm">
          <p class="text-gray-700">
            <strong>{demoI18n.t('currentLanguage')}:</strong> {demoI18n.locale}
          </p>
          <p class="text-gray-700">
            <strong>{demoI18n.t('welcome')}</strong>
          </p>
          <p class="text-gray-700">
            {demoI18n.t('greeting', { name: 'User' })}
          </p>
        </div>
        <div class="flex gap-2">
          <button
            class={`rounded px-4 py-2 text-sm transition-colors ${
              demoI18n.locale === 'zh'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            on:click={() => void demoI18n.changeLocale('zh')}
          >
            中文
          </button>
          <button
            class={`rounded px-4 py-2 text-sm transition-colors ${
              demoI18n.locale === 'en'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            on:click={() => void demoI18n.changeLocale('en')}
          >
            English
          </button>
          <button
            class={`rounded px-4 py-2 text-sm transition-colors ${
              demoI18n.locale === 'ja'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            on:click={() => void demoI18n.changeLocale('ja')}
          >
            日本語
          </button>
        </div>
      </div>
    );
  }
}

/**
 * 多语言配置演示
 */
const configI18n = createI18n({
  defaultLocale: 'en',
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en: {
      app: {
        title: 'My Application',
        description: 'This is a demo application',
      },
      nav: {
        home: 'Home',
        about: 'About',
        contact: 'Contact',
      },
    },
    zh: {
      app: {
        title: '我的应用',
        description: '这是一个演示应用',
      },
      nav: {
        home: '首页',
        about: '关于',
        contact: '联系',
      },
    },
  },
});

class NestedMessagesDemo extends Fukict {
  private unsubscribe?: () => void;

  mounted() {
    this.unsubscribe = configI18n.subscribe(() => {
      this.update();
    });
  }

  beforeUnmount() {
    this.unsubscribe?.();
  }

  render() {
    return (
      <div class="space-y-4">
        <div class="space-y-3 rounded bg-gray-50 p-4">
          <div class="border-b border-gray-200 pb-2">
            <h4 class="text-base font-medium text-gray-900">
              {configI18n.t('app.title')}
            </h4>
            <p class="text-sm text-gray-600">
              {configI18n.t('app.description')}
            </p>
          </div>
          <div class="flex gap-3 text-sm">
            <a href="#" class="text-blue-600 hover:text-blue-700">
              {configI18n.t('nav.home')}
            </a>
            <a href="#" class="text-blue-600 hover:text-blue-700">
              {configI18n.t('nav.about')}
            </a>
            <a href="#" class="text-blue-600 hover:text-blue-700">
              {configI18n.t('nav.contact')}
            </a>
          </div>
        </div>
        <div class="flex gap-2">
          <button
            class={`rounded px-3 py-1.5 text-sm transition-colors ${
              configI18n.locale === 'en'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            on:click={() => void configI18n.changeLocale('en')}
          >
            EN
          </button>
          <button
            class={`rounded px-3 py-1.5 text-sm transition-colors ${
              configI18n.locale === 'zh'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            on:click={() => void configI18n.changeLocale('zh')}
          >
            中文
          </button>
        </div>
      </div>
    );
  }
}

/**
 * 回退语言演示
 */
const fallbackI18n = createI18n({
  defaultLocale: 'zh',
  locale: 'zh',
  fallbackLocale: 'en',
  messages: {
    en: {
      hello: 'Hello',
      world: 'World',
      greeting: 'Hello, World!',
    },
    zh: {
      hello: '你好',
      // world 缺失,会使用 fallbackLocale 的翻译
      greeting: '你好,世界!',
    },
  },
});

class FallbackDemo extends Fukict {
  private unsubscribe?: () => void;

  mounted() {
    this.unsubscribe = fallbackI18n.subscribe(() => {
      this.update();
    });
  }

  beforeUnmount() {
    this.unsubscribe?.();
  }

  render() {
    return (
      <div class="space-y-4">
        <div class="space-y-2 rounded bg-gray-50 p-4 text-sm">
          <p class="text-gray-700">
            <strong>hello:</strong> {fallbackI18n.t('hello')}
          </p>
          <p class="text-gray-700">
            <strong>world:</strong> {fallbackI18n.t('world')}
            <span class="ml-2 text-xs text-orange-600">
              {fallbackI18n.locale === 'zh' && '(fallback to EN)'}
            </span>
          </p>
          <p class="text-gray-700">
            <strong>greeting:</strong> {fallbackI18n.t('greeting')}
          </p>
        </div>
        <div class="flex gap-2">
          <button
            class={`rounded px-3 py-1.5 text-sm transition-colors ${
              fallbackI18n.locale === 'zh'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            on:click={() => void fallbackI18n.changeLocale('zh')}
          >
            中文
          </button>
          <button
            class={`rounded px-3 py-1.5 text-sm transition-colors ${
              fallbackI18n.locale === 'en'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            on:click={() => void fallbackI18n.changeLocale('en')}
          >
            EN
          </button>
        </div>
        <div class="rounded border border-yellow-200 bg-yellow-50 p-3">
          <p class="text-xs text-yellow-700">
            <strong>提示:</strong> 当前语言为中文时,"world" 翻译缺失,会自动使用
            fallbackLocale (en) 的翻译
          </p>
        </div>
      </div>
    );
  }
}

/**
 * 基础配置页面
 */
export class I18nConfigPage extends RouteComponent {
  render() {
    return (
      <div class="space-y-12">
        {/* 创建 I18n 实例 */}
        <div class="space-y-4">
          <div>
            <h3 class="mb-1 text-base font-medium text-gray-800">
              创建 I18n 实例
            </h3>
            <p class="text-sm leading-relaxed text-gray-600">
              使用 createI18n 创建多语言实例,定义语言和翻译消息
            </p>
          </div>

          <SplitView leftTitle="代码示例" rightTitle="运行效果">
            <CodeBlock
              fukict:slot="code"
              code={`import { createI18n } from '@fukict/i18n';

const i18n = createI18n({
  // 默认语言
  defaultLocale: 'zh',

  // 当前语言
  locale: 'zh',

  // 回退语言(当翻译缺失时使用)
  fallbackLocale: 'en',

  // 翻译消息
  messages: {
    en: {
      greeting: 'Hello, {name}!',
      welcome: 'Welcome to Fukict',
    },
    zh: {
      greeting: '你好,{name}!',
      welcome: '欢迎使用 Fukict',
    },
    ja: {
      greeting: 'こんにちは、{name}!',
      welcome: 'Fukict へようこそ',
    },
  },
});

// 切换语言(异步)
await i18n.changeLocale('en');

// 使用翻译
const msg = i18n.t('greeting', { name: 'Alice' });`}
            />
            <DemoBox fukict:slot="demo">
              <BasicConfigDemo />
            </DemoBox>
          </SplitView>
        </div>

        {/* 消息格式 */}
        <div class="space-y-4">
          <div>
            <h3 class="mb-1 text-base font-medium text-gray-800">消息格式</h3>
            <p class="text-sm leading-relaxed text-gray-600">
              支持嵌套结构的翻译消息,便于组织和管理
            </p>
          </div>

          <SplitView leftTitle="代码示例" rightTitle="运行效果">
            <CodeBlock
              fukict:slot="code"
              code={`const messages = {
  en: {
    // 简单消息
    hello: 'Hello',

    // 嵌套结构
    app: {
      title: 'My Application',
      description: 'This is a demo application',
    },

    nav: {
      home: 'Home',
      about: 'About',
      contact: 'Contact',
    },
  },
  zh: {
    hello: '你好',
    app: {
      title: '我的应用',
      description: '这是一个演示应用',
    },
    nav: {
      home: '首页',
      about: '关于',
      contact: '联系',
    },
  },
};

// 使用嵌套键访问
i18n.t('app.title')      // "我的应用" (zh) / "My Application" (en)
i18n.t('nav.home')       // "首页" (zh) / "Home" (en)`}
            />
            <DemoBox fukict:slot="demo">
              <NestedMessagesDemo />
            </DemoBox>
          </SplitView>
        </div>

        {/* Fallback 语言 */}
        <div class="space-y-4">
          <div>
            <h3 class="mb-1 text-base font-medium text-gray-800">
              Fallback 语言
            </h3>
            <p class="text-sm leading-relaxed text-gray-600">
              当当前语言的翻译缺失时,自动使用 fallbackLocale 的翻译
            </p>
          </div>

          <SplitView leftTitle="代码示例" rightTitle="运行效果">
            <CodeBlock
              fukict:slot="code"
              code={`const i18n = createI18n({
  locale: 'zh',
  fallbackLocale: 'en',  // 回退到英文
  messages: {
    en: {
      hello: 'Hello',
      world: 'World',
      greeting: 'Hello, World!',
    },
    zh: {
      hello: '你好',
      // world 缺失
      greeting: '你好,世界!',
    },
  },
});

// 当前语言为 zh
i18n.t('hello')     // "你好" (存在)
i18n.t('world')     // "World" (缺失,使用 en 的翻译)
i18n.t('greeting')  // "你好,世界!" (存在)`}
            />
            <DemoBox fukict:slot="demo">
              <FallbackDemo />
            </DemoBox>
          </SplitView>
        </div>

        {/* 配置选项 */}
        <div class="space-y-4">
          <div>
            <h3 class="mb-1 text-base font-medium text-gray-800">配置选项</h3>
            <p class="text-sm leading-relaxed text-gray-600">
              createI18n 支持的完整配置选项
            </p>
          </div>

          <SplitView leftTitle="代码示例" rightTitle="选项说明">
            <CodeBlock
              fukict:slot="code"
              code={`const i18n = createI18n({
  // 默认语言
  defaultLocale: 'zh',

  // 当前语言
  locale: 'zh',

  // 回退语言(当翻译缺失时使用)
  fallbackLocale: 'en',

  // 翻译消息
  messages: {
    en: { /* ... */ },
    zh: { /* ... */ },
    ja: { /* ... */ },
  },
});

// API 方法
await i18n.changeLocale('en')  // 切换语言(异步)
i18n.t('key', params)          // 翻译
i18n.subscribe(callback)       // 订阅语言变化
i18n.n(value, options)         // 格式化数字
i18n.d(date, options)          // 格式化日期
i18n.rt(value, unit)           // 格式化相对时间`}
            />
            <DemoBox fukict:slot="demo">
              <div class="space-y-3 text-sm text-gray-700">
                <div class="rounded border border-blue-200 bg-blue-50 p-3">
                  <p class="mb-2 font-medium text-blue-900">配置项:</p>
                  <ul class="list-inside list-disc space-y-1 text-xs text-blue-800">
                    <li>
                      <strong>defaultLocale:</strong> 默认语言
                    </li>
                    <li>
                      <strong>locale:</strong> 当前使用的语言
                    </li>
                    <li>
                      <strong>fallbackLocale:</strong> 翻译缺失时的回退语言
                    </li>
                    <li>
                      <strong>messages:</strong> 所有语言的翻译消息
                    </li>
                  </ul>
                </div>
                <div class="rounded border border-green-200 bg-green-50 p-3">
                  <p class="mb-2 font-medium text-green-900">API 方法:</p>
                  <ul class="list-inside list-disc space-y-1 text-xs text-green-800">
                    <li>
                      <strong>changeLocale(locale):</strong> 切换语言(异步)
                    </li>
                    <li>
                      <strong>t(key, params):</strong> 获取翻译
                    </li>
                    <li>
                      <strong>subscribe(callback):</strong> 订阅语言变化
                    </li>
                    <li>
                      <strong>n(value, options):</strong> 格式化数字
                    </li>
                    <li>
                      <strong>d(date, options):</strong> 格式化日期
                    </li>
                    <li>
                      <strong>rt(value, unit):</strong> 格式化相对时间
                    </li>
                  </ul>
                </div>
              </div>
            </DemoBox>
          </SplitView>
        </div>
      </div>
    );
  }
}

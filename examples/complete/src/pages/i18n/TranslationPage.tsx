import { Fukict } from '@fukict/basic';
import { createI18n } from '@fukict/i18n';
import { RouteComponent } from '@fukict/router';

import { CodeBlock } from '../../components/CodeBlock';
import { DemoBox } from '../../components/DemoBox';
import { SplitView } from '../../components/SplitView';

/**
 * 基础翻译演示用的 i18n 实例
 */
const basicI18n = createI18n({
  locale: 'zh',
  fallbackLocale: 'en',
  messages: {
    en: {
      hello: 'Hello',
      world: 'World',
      user: {
        profile: 'User Profile',
        settings: 'Settings',
        logout: 'Logout',
      },
    },
    zh: {
      hello: '你好',
      world: '世界',
      user: {
        profile: '用户资料',
        settings: '设置',
        logout: '退出登录',
      },
    },
  },
});

/**
 * 基础翻译演示
 */
class BasicTranslationDemo extends Fukict {
  private unsubscribe?: () => void;

  mounted() {
    this.unsubscribe = basicI18n.subscribe(() => {
      this.update();
    });
  }

  beforeUnmount() {
    this.unsubscribe?.();
  }

  render() {
    return (
      <div class="space-y-4">
        <div class="bg-gray-50 rounded p-4 space-y-2 text-sm">
          <p class="text-gray-700">
            <strong>hello:</strong> {basicI18n.t('hello')}
          </p>
          <p class="text-gray-700">
            <strong>world:</strong> {basicI18n.t('world')}
          </p>
          <p class="text-gray-700">
            <strong>user.profile:</strong> {basicI18n.t('user.profile')}
          </p>
          <p class="text-gray-700">
            <strong>user.settings:</strong> {basicI18n.t('user.settings')}
          </p>
        </div>
        <div class="flex gap-2">
          <button
            class={`px-3 py-1.5 text-sm rounded transition-colors ${
              basicI18n.locale === 'zh'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            on:click={() => basicI18n.setLocale('zh')}
          >
            中文
          </button>
          <button
            class={`px-3 py-1.5 text-sm rounded transition-colors ${
              basicI18n.locale === 'en'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            on:click={() => basicI18n.setLocale('en')}
          >
            EN
          </button>
        </div>
      </div>
    );
  }
}

/**
 * 参数插值演示用的 i18n 实例
 */
const paramsI18n = createI18n({
  locale: 'zh',
  fallbackLocale: 'en',
  messages: {
    en: {
      greeting: 'Hello, {name}!',
      welcome: 'Welcome {user}, you have {count} new messages.',
      productInfo: 'Product: {name}, Price: ${price}',
    },
    zh: {
      greeting: '你好,{name}!',
      welcome: '欢迎 {user},你有 {count} 条新消息。',
      productInfo: '产品:{name},价格:¥{price}',
    },
  },
});

/**
 * 参数插值演示
 */
class ParamsDemo extends Fukict {
  private unsubscribe?: () => void;
  private userName = 'Alice';
  private messageCount = 5;
  private productName = 'Widget';
  private productPrice = 99;

  mounted() {
    this.unsubscribe = paramsI18n.subscribe(() => {
      this.update();
    });
  }

  beforeUnmount() {
    this.unsubscribe?.();
  }

  render() {
    return (
      <div class="space-y-4">
        <div class="bg-gray-50 rounded p-4 space-y-3 text-sm">
          <div>
            <p class="text-gray-600 text-xs mb-1">Single parameter:</p>
            <p class="text-gray-800">
              {paramsI18n.t('greeting', { name: this.userName })}
            </p>
          </div>
          <div>
            <p class="text-gray-600 text-xs mb-1">Multiple parameters:</p>
            <p class="text-gray-800">
              {paramsI18n.t('welcome', {
                user: this.userName,
                count: this.messageCount,
              })}
            </p>
          </div>
          <div>
            <p class="text-gray-600 text-xs mb-1">Product info:</p>
            <p class="text-gray-800">
              {paramsI18n.t('productInfo', {
                name: this.productName,
                price: this.productPrice,
              })}
            </p>
          </div>
        </div>
        <div class="flex gap-2">
          <button
            class={`px-3 py-1.5 text-sm rounded transition-colors ${
              paramsI18n.locale === 'zh'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            on:click={() => paramsI18n.setLocale('zh')}
          >
            中文
          </button>
          <button
            class={`px-3 py-1.5 text-sm rounded transition-colors ${
              paramsI18n.locale === 'en'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            on:click={() => paramsI18n.setLocale('en')}
          >
            EN
          </button>
        </div>
      </div>
    );
  }
}

/**
 * 复数形式演示用的 i18n 实例
 */
const pluralI18n = createI18n({
  locale: 'zh',
  fallbackLocale: 'en',
  messages: {
    en: {
      items: {
        none: 'You have no items',
        one: 'You have 1 item',
        other: 'You have {count} items',
      },
      files: 'Selected {count} file(s)',
    },
    zh: {
      items: {
        none: '你没有项目',
        one: '你有 1 个项目',
        other: '你有 {count} 个项目',
      },
      files: '已选择 {count} 个文件',
    },
  },
});

/**
 * 复数形式演示
 */
class PluralDemo extends Fukict {
  private unsubscribe?: () => void;
  private itemCount = 0;
  private fileCount = 3;

  mounted() {
    this.unsubscribe = pluralI18n.subscribe(() => {
      this.update();
    });
  }

  beforeUnmount() {
    this.unsubscribe?.();
  }

  private getItemsMessage = () => {
    if (this.itemCount === 0) {
      return pluralI18n.t('items.none');
    } else if (this.itemCount === 1) {
      return pluralI18n.t('items.one');
    } else {
      return pluralI18n.t('items.other', { count: this.itemCount });
    }
  };

  render() {
    return (
      <div class="space-y-4">
        <div class="bg-gray-50 rounded p-4 space-y-3 text-sm">
          <div>
            <p class="text-gray-600 text-xs mb-1">Item count with plural:</p>
            <p class="text-gray-800 font-medium">{this.getItemsMessage()}</p>
            <div class="flex gap-2 mt-2">
              <button
                class="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                on:click={() => {
                  this.itemCount = 0;
                  this.update();
                }}
              >
                0
              </button>
              <button
                class="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                on:click={() => {
                  this.itemCount = 1;
                  this.update();
                }}
              >
                1
              </button>
              <button
                class="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                on:click={() => {
                  this.itemCount = 5;
                  this.update();
                }}
              >
                5
              </button>
            </div>
          </div>
          <div class="border-t border-gray-300 pt-3">
            <p class="text-gray-600 text-xs mb-1">File count:</p>
            <p class="text-gray-800 font-medium">
              {pluralI18n.t('files', { count: this.fileCount })}
            </p>
            <div class="flex gap-2 mt-2">
              <button
                class="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                on:click={() => {
                  this.fileCount = Math.max(0, this.fileCount - 1);
                  this.update();
                }}
              >
                -
              </button>
              <span class="px-3 py-1 text-xs bg-gray-200 rounded">
                {this.fileCount}
              </span>
              <button
                class="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                on:click={() => {
                  this.fileCount++;
                  this.update();
                }}
              >
                +
              </button>
            </div>
          </div>
        </div>
        <div class="flex gap-2">
          <button
            class={`px-3 py-1.5 text-sm rounded transition-colors ${
              pluralI18n.locale === 'zh'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            on:click={() => pluralI18n.setLocale('zh')}
          >
            中文
          </button>
          <button
            class={`px-3 py-1.5 text-sm rounded transition-colors ${
              pluralI18n.locale === 'en'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            on:click={() => pluralI18n.setLocale('en')}
          >
            EN
          </button>
        </div>
      </div>
    );
  }
}

/**
 * 组件中使用演示用的 i18n 实例
 */
const componentI18n = createI18n({
  locale: 'zh',
  fallbackLocale: 'en',
  messages: {
    en: {
      title: 'My Component',
      description: 'This is a reactive component',
      button: 'Click Me',
      clickCount: 'Clicked {count} times',
    },
    zh: {
      title: '我的组件',
      description: '这是一个响应式组件',
      button: '点击我',
      clickCount: '已点击 {count} 次',
    },
  },
});

/**
 * 在组件中使用翻译的演示
 */
class ComponentUsageDemo extends Fukict {
  private unsubscribe?: () => void;
  private clickCount = 0;

  mounted() {
    this.unsubscribe = componentI18n.subscribe(() => {
      this.update();
    });
  }

  beforeUnmount() {
    this.unsubscribe?.();
  }

  render() {
    return (
      <div class="space-y-4">
        <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 shadow-sm">
          <h4 class="text-lg font-bold text-gray-800 mb-2">
            {componentI18n.t('title')}
          </h4>
          <p class="text-sm text-gray-600 mb-4">
            {componentI18n.t('description')}
          </p>
          <button
            class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow"
            on:click={() => {
              this.clickCount++;
              this.update();
            }}
          >
            {componentI18n.t('button')}
          </button>
          <p class="text-xs text-gray-500 mt-3">
            {componentI18n.t('clickCount', { count: this.clickCount })}
          </p>
        </div>
        <div class="flex gap-2">
          <button
            class={`px-3 py-1.5 text-sm rounded transition-colors ${
              componentI18n.locale === 'zh'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            on:click={() => componentI18n.setLocale('zh')}
          >
            中文
          </button>
          <button
            class={`px-3 py-1.5 text-sm rounded transition-colors ${
              componentI18n.locale === 'en'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            on:click={() => componentI18n.setLocale('en')}
          >
            EN
          </button>
        </div>
      </div>
    );
  }
}

/**
 * 翻译使用页面
 */
export class TranslationPage extends RouteComponent {
  render() {
    return (
      <div class="space-y-12">
        {/* 基础翻译 */}
        <div class="space-y-4">
          <div>
            <h3 class="text-base font-medium text-gray-800 mb-1">基础翻译</h3>
            <p class="text-sm text-gray-600 leading-relaxed">
              使用 t() 函数进行基础翻译,支持嵌套键
            </p>
          </div>

          <SplitView leftTitle="代码示例" rightTitle="运行效果">
            <CodeBlock
              fukict:slot="code"
              code={`import { createI18n } from '@fukict/i18n';

const i18n = createI18n({
  locale: 'zh',
  messages: {
    en: {
      hello: 'Hello',
      world: 'World',
      user: {
        profile: 'User Profile',
        settings: 'Settings',
      },
    },
    zh: {
      hello: '你好',
      world: '世界',
      user: {
        profile: '用户资料',
        settings: '设置',
      },
    },
  },
});

// 简单翻译
const msg1 = i18n.t('hello');
// zh: "你好" / en: "Hello"

// 嵌套键翻译
const msg2 = i18n.t('user.profile');
// zh: "用户资料" / en: "User Profile"`}
            />
            <DemoBox fukict:slot="demo">
              <BasicTranslationDemo />
            </DemoBox>
          </SplitView>
        </div>

        {/* 参数插值 */}
        <div class="space-y-4">
          <div>
            <h3 class="text-base font-medium text-gray-800 mb-1">参数插值</h3>
            <p class="text-sm text-gray-600 leading-relaxed">
              在翻译中使用动态参数,使用 {'{name}'} 语法
            </p>
          </div>

          <SplitView leftTitle="代码示例" rightTitle="运行效果">
            <CodeBlock
              fukict:slot="code"
              code={`const i18n = createI18n({
  locale: 'zh',
  messages: {
    en: {
      greeting: 'Hello, {name}!',
      welcome: 'Welcome {user}, you have {count} new messages.',
      productInfo: 'Product: {name}, Price: ${price}',
    },
    zh: {
      greeting: '你好,{name}!',
      welcome: '欢迎 {user},你有 {count} 条新消息。',
      productInfo: '产品:{name},价格:¥{price}',
    },
  },
});

// 单个参数
i18n.t('greeting', { name: 'Alice' });
// zh: "你好,Alice!" / en: "Hello, Alice!"

// 多个参数
i18n.t('welcome', { user: 'Alice', count: 5 });
// zh: "欢迎 Alice,你有 5 条新消息。"

// 数字和字符串参数
i18n.t('productInfo', { name: 'Widget', price: 99 });
// zh: "产品:Widget,价格:¥99"`}
            />
            <DemoBox fukict:slot="demo">
              <ParamsDemo />
            </DemoBox>
          </SplitView>
        </div>

        {/* 复数形式 */}
        <div class="space-y-4">
          <div>
            <h3 class="text-base font-medium text-gray-800 mb-1">复数形式</h3>
            <p class="text-sm text-gray-600 leading-relaxed">
              根据数量显示不同的翻译,需要在代码中处理复数逻辑
            </p>
          </div>

          <SplitView leftTitle="代码示例" rightTitle="运行效果">
            <CodeBlock
              fukict:slot="code"
              code={`const i18n = createI18n({
  locale: 'en',
  messages: {
    en: {
      items: {
        none: 'You have no items',
        one: 'You have 1 item',
        other: 'You have {count} items',
      },
      files: 'Selected {count} file(s)',
    },
    zh: {
      items: {
        none: '你没有项目',
        one: '你有 1 个项目',
        other: '你有 {count} 个项目',
      },
      files: '已选择 {count} 个文件',
    },
  },
});

// 根据数量选择不同的翻译
const getItemsMessage = (count: number) => {
  if (count === 0) {
    return i18n.t('items.none');
  } else if (count === 1) {
    return i18n.t('items.one');
  } else {
    return i18n.t('items.other', { count });
  }
};

// 简单的计数翻译
i18n.t('files', { count: 3 });
// zh: "已选择 3 个文件" / en: "Selected 3 file(s)"`}
            />
            <DemoBox fukict:slot="demo">
              <PluralDemo />
            </DemoBox>
          </SplitView>
        </div>

        {/* 在组件中使用 */}
        <div class="space-y-4">
          <div>
            <h3 class="text-base font-medium text-gray-800 mb-1">
              在组件中使用
            </h3>
            <p class="text-sm text-gray-600 leading-relaxed">
              在 Fukict 组件中使用翻译,订阅语言变化实现响应式更新
            </p>
          </div>

          <SplitView leftTitle="代码示例" rightTitle="运行效果">
            <CodeBlock
              fukict:slot="code"
              code={`import { Fukict } from '@fukict/basic';
import { i18n } from './i18n';

export class MyComponent extends Fukict {
  private unsubscribe?: () => void;
  private clickCount = 0;

  mounted() {
    // 订阅语言变化,自动更新组件
    this.unsubscribe = i18n.subscribe(() => {
      this.update();
    });
  }

  beforeUnmount() {
    // 清理订阅
    this.unsubscribe?.();
  }

  render() {
    return (
      <div>
        <h1>{i18n.t('title')}</h1>
        <p>{i18n.t('description')}</p>
        <button on:click={() => {
          this.clickCount++;
          this.update();
        }}>
          {i18n.t('button')}
        </button>
        <p>{i18n.t('clickCount', { count: this.clickCount })}</p>
      </div>
    );
  }
}`}
            />
            <DemoBox fukict:slot="demo">
              <ComponentUsageDemo />
            </DemoBox>
          </SplitView>
        </div>
      </div>
    );
  }
}

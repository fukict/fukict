import { Fukict } from '@fukict/basic';
import { createI18n } from '@fukict/i18n';
import { RouteComponent } from '@fukict/router';

import { CodeBlock } from '../../components/CodeBlock';
import { DemoBox } from '../../components/DemoBox';
import { SplitView } from '../../components/SplitView';

// 定义消息
const messages = {
  en: {
    greeting: 'Hello, {name}!',
    welcome: 'Welcome to Fukict i18n Demo',
    description: 'A lightweight, type-safe internationalization library',
    language: 'Language',
    features: {
      title: 'Features',
      item1: 'Type-safe translation keys',
      item2: 'Reactive locale switching',
      item3: 'Parameter interpolation',
      item4: 'Number and date formatting',
    },
    form: {
      nameLabel: 'Your name:',
      namePlaceholder: 'Enter your name',
      ageLabel: 'Your age:',
      itemsLabel: 'Item count:',
      greeting: 'Hello, {name}! You are {age} years old.',
      items: {
        zero: 'No items',
        one: '{count} item',
        other: '{count} items',
      },
    },
    formatting: {
      title: 'Formatting Examples',
      number: 'Number: {value}',
      currency: 'Currency: {value}',
      date: 'Date: {value}',
      relativeTime: 'Relative time: {value}',
    },
  },
  zh: {
    greeting: '你好，{name}！',
    welcome: '欢迎使用 Fukict i18n 演示',
    description: '一个轻量级、类型安全的国际化库',
    language: '语言',
    features: {
      title: '特性',
      item1: '类型安全的翻译键',
      item2: '响应式语言切换',
      item3: '参数插值',
      item4: '数字和日期格式化',
    },
    form: {
      nameLabel: '你的名字：',
      namePlaceholder: '输入你的名字',
      ageLabel: '你的年龄：',
      itemsLabel: '项目数量：',
      greeting: '你好，{name}！你今年 {age} 岁。',
      items: {
        zero: '没有项目',
        one: '{count} 个项目',
        other: '{count} 个项目',
      },
    },
    formatting: {
      title: '格式化示例',
      number: '数字：{value}',
      currency: '货币：{value}',
      date: '日期：{value}',
      relativeTime: '相对时间：{value}',
    },
  },
  ja: {
    greeting: 'こんにちは、{name}さん！',
    welcome: 'Fukict i18n デモへようこそ',
    description: '軽量で型安全な国際化ライブラリ',
    language: '言語',
    features: {
      title: '機能',
      item1: '型安全な翻訳キー',
      item2: 'リアクティブな言語切り替え',
      item3: 'パラメータ補間',
      item4: '数値と日付のフォーマット',
    },
    form: {
      nameLabel: 'お名前：',
      namePlaceholder: '名前を入力',
      ageLabel: '年齢：',
      itemsLabel: 'アイテム数：',
      greeting: 'こんにちは、{name}さん！{age} 歳ですね。',
      items: {
        zero: 'アイテムなし',
        one: '{count} 個のアイテム',
        other: '{count} 個のアイテム',
      },
    },
    formatting: {
      title: 'フォーマット例',
      number: '数値：{value}',
      currency: '通貨：{value}',
      date: '日付：{value}',
      relativeTime: '相対時刻：{value}',
    },
  },
} as const;

// 创建 i18n 实例
const demoI18n = createI18n({
  defaultLocale: 'zh',
  locale: 'zh',
  fallbackLocale: 'en',
  messages,
});

// 语言切换器组件
class LanguageSwitcher extends Fukict {
  private unsubscribe?: () => void;

  mounted() {
    this.unsubscribe = demoI18n.subscribe(() => {
      this.update();
    });
  }

  beforeUnmount() {
    this.unsubscribe?.();
  }

  handleChange(e: Event) {
    const select = e.target as HTMLSelectElement;
    void demoI18n.changeLocale(select.value);
  }

  render() {
    const currentLocale = demoI18n.locale;

    return (
      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-600">{demoI18n.t('language')}:</span>
        <select
          value={currentLocale}
          on:change={e => this.handleChange(e)}
          class="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value="zh">中文</option>
          <option value="en">English</option>
          <option value="ja">日本語</option>
        </select>
        <span class="text-xs text-gray-500">当前: {currentLocale}</span>
      </div>
    );
  }
}

// 交互式表单组件
class InteractiveForm extends Fukict {
  private unsubscribe?: () => void;
  private name = 'Alice';
  private age = 25;
  private itemCount = 3;

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
        {/* 名字输入 */}
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            {demoI18n.t('form.nameLabel')}
          </label>
          <input
            type="text"
            value={this.name}
            on:input={(e: Event) => {
              this.name = (e.target as HTMLInputElement).value;
              this.update();
            }}
            placeholder={demoI18n.t('form.namePlaceholder')}
            class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* 年龄输入 */}
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            {demoI18n.t('form.ageLabel')}
          </label>
          <input
            type="number"
            value={String(this.age)}
            on:input={(e: Event) => {
              this.age = parseInt(
                (e.target as HTMLInputElement).value || '0',
                10,
              );
              this.update();
            }}
            class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* 项目数量输入 */}
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            {demoI18n.t('form.itemsLabel')}
          </label>
          <input
            type="number"
            value={String(this.itemCount)}
            on:input={(e: Event) => {
              this.itemCount = parseInt(
                (e.target as HTMLInputElement).value || '0',
                10,
              );
              this.update();
            }}
            class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* 结果展示 */}
        <div class="space-y-2 rounded-lg border border-green-300 bg-green-50 p-4">
          <p class="text-sm text-green-900">
            {demoI18n.t('form.greeting', { name: this.name, age: this.age })}
          </p>
          <p class="text-sm text-green-900">
            {demoI18n.t('form.items', { count: this.itemCount })}
          </p>
        </div>
      </div>
    );
  }
}

// 格式化演示组件
class FormattingDemo extends Fukict {
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
      <div class="space-y-3">
        <h4 class="text-sm font-medium text-gray-900">
          {demoI18n.t('formatting.title')}
        </h4>
        <div class="space-y-2">
          <div class="rounded border border-blue-200 bg-blue-50 p-3">
            <p class="text-sm text-blue-900">
              {demoI18n.t('formatting.number', {
                value: demoI18n.n(1234567.89),
              })}
            </p>
          </div>
          <div class="rounded border border-purple-200 bg-purple-50 p-3">
            <p class="text-sm text-purple-900">
              {demoI18n.t('formatting.currency', {
                value: demoI18n.n(1234.56, {
                  style: 'currency',
                  currency: 'USD',
                }),
              })}
            </p>
          </div>
          <div class="rounded border border-orange-200 bg-orange-50 p-3">
            <p class="text-sm text-orange-900">
              {demoI18n.t('formatting.date', {
                value: demoI18n.d(new Date(), { dateStyle: 'long' }),
              })}
            </p>
          </div>
          <div class="rounded border border-pink-200 bg-pink-50 p-3">
            <p class="text-sm text-pink-900">
              {demoI18n.t('formatting.relativeTime', {
                value: demoI18n.rt(-2, 'day'),
              })}
            </p>
          </div>
        </div>
      </div>
    );
  }
}

// 特性展示组件
class FeaturesDisplay extends Fukict {
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
      <div class="space-y-3">
        <h4 class="text-sm font-medium text-gray-900">
          {demoI18n.t('features.title')}
        </h4>
        <ul class="space-y-2">
          <li class="flex items-start gap-2">
            <span class="mt-1 text-green-600">✓</span>
            <span class="text-sm text-gray-700">
              {demoI18n.t('features.item1')}
            </span>
          </li>
          <li class="flex items-start gap-2">
            <span class="mt-1 text-green-600">✓</span>
            <span class="text-sm text-gray-700">
              {demoI18n.t('features.item2')}
            </span>
          </li>
          <li class="flex items-start gap-2">
            <span class="mt-1 text-green-600">✓</span>
            <span class="text-sm text-gray-700">
              {demoI18n.t('features.item3')}
            </span>
          </li>
          <li class="flex items-start gap-2">
            <span class="mt-1 text-green-600">✓</span>
            <span class="text-sm text-gray-700">
              {demoI18n.t('features.item4')}
            </span>
          </li>
        </ul>
      </div>
    );
  }
}

/**
 * I18n 完整示例页面
 */
export class I18nIndexPage extends RouteComponent {
  private unsubscribe?: () => void;

  mounted() {
    this.unsubscribe = demoI18n.subscribe(() => {
      this.update(this.props);
    });
  }

  beforeUnmount() {
    this.unsubscribe?.();
  }

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
              定义多语言消息和配置
            </p>
          </div>

          <SplitView leftTitle="代码示例" rightTitle="运行效果">
            <CodeBlock
              fukict:slot="code"
              code={`import { createI18n } from '@fukict/i18n';

// 定义消息
const messages = {
  en: {
    greeting: 'Hello, {name}!',
    welcome: 'Welcome to Fukict',
    features: {
      item1: 'Type-safe keys',
      item2: 'Reactive switching',
    },
  },
  zh: {
    greeting: '你好,{name}!',
    welcome: '欢迎使用 Fukict',
    features: {
      item1: '类型安全的键',
      item2: '响应式切换',
    },
  },
} as const;

// 创建 i18n 实例
const i18n = createI18n({
  defaultLocale: 'zh',  // 必需
  locale: 'zh',
  fallbackLocale: 'en',
  messages,
});`}
            />
            <DemoBox fukict:slot="demo">
              <div class="space-y-3">
                <LanguageSwitcher />
                <div class="rounded border border-blue-200 bg-blue-50 p-3">
                  <p class="mb-1 text-sm font-medium text-blue-900">
                    {demoI18n.t('welcome')}
                  </p>
                  <p class="text-xs text-blue-700">
                    {demoI18n.t('description')}
                  </p>
                </div>
              </div>
            </DemoBox>
          </SplitView>
        </div>

        {/* 基础翻译 */}
        <div class="space-y-4">
          <div>
            <h3 class="mb-1 text-base font-medium text-gray-800">基础翻译</h3>
            <p class="text-sm leading-relaxed text-gray-600">
              使用 t() 函数进行翻译和参数插值
            </p>
          </div>

          <SplitView leftTitle="代码示例" rightTitle="运行效果">
            <CodeBlock
              fukict:slot="code"
              code={`// 简单翻译
const msg = i18n.t('welcome');
// 中文: "欢迎使用 Fukict i18n 演示"
// 英文: "Welcome to Fukict i18n Demo"

// 参数插值
const greeting = i18n.t('greeting', { name: 'Alice' });
// 中文: "你好，Alice！"
// 英文: "Hello, Alice!"

// 嵌套键
const feature = i18n.t('features.item1');
// 中文: "类型安全的翻译键"
// 英文: "Type-safe translation keys"`}
            />
            <DemoBox fukict:slot="demo">
              <InteractiveForm />
            </DemoBox>
          </SplitView>
        </div>

        {/* 数字和日期格式化 */}
        <div class="space-y-4">
          <div>
            <h3 class="mb-1 text-base font-medium text-gray-800">
              数字和日期格式化
            </h3>
            <p class="text-sm leading-relaxed text-gray-600">
              根据当前语言环境格式化数字、货币和日期
            </p>
          </div>

          <SplitView leftTitle="代码示例" rightTitle="运行效果">
            <CodeBlock
              fukict:slot="code"
              code={`// 数字格式化
const num = i18n.n(1234567.89);
// 中文: "1,234,567.89"
// 英文: "1,234,567.89"

// 货币格式化
const price = i18n.n(1234.56, {
  style: 'currency',
  currency: 'USD',
});
// 中文: "US$1,234.56"
// 英文: "$1,234.56"

// 日期格式化
const date = i18n.d(new Date(), {
  dateStyle: 'long',
});
// 中文: "2025年10月16日"
// 英文: "October 16, 2025"

// 相对时间
const relative = i18n.rt(-2, 'day');
// 中文: "2天前"
// 英文: "2 days ago"`}
            />
            <DemoBox fukict:slot="demo">
              <FormattingDemo />
            </DemoBox>
          </SplitView>
        </div>

        {/* 语言切换 */}
        <div class="space-y-4">
          <div>
            <h3 class="mb-1 text-base font-medium text-gray-800">语言切换</h3>
            <p class="text-sm leading-relaxed text-gray-600">
              动态切换应用语言并订阅变化
            </p>
          </div>

          <SplitView leftTitle="代码示例" rightTitle="特性说明">
            <CodeBlock
              fukict:slot="code"
              code={`class LanguageSwitcher extends Fukict {
  private unsubscribe?: () => void;

  mounted() {
    // 订阅语言变化
    this.unsubscribe = i18n.subscribe(() => {
      this.update();  // 语言变化时重新渲染
    });
  }

  beforeUnmount() {
    // 取消订阅
    this.unsubscribe?.();
  }

  handleChange(e: Event) {
    const select = e.target as HTMLSelectElement;
    // 异步切换语言
    void i18n.changeLocale(select.value);
  }

  render() {
    // 获取当前语言
    const currentLocale = i18n.locale;

    return (
      <div>
        <select
          value={currentLocale}
          on:change={e => this.handleChange(e)}
        >
          <option value="zh">中文</option>
          <option value="en">English</option>
        </select>
        <p>{i18n.t('welcome')}</p>
      </div>
    );
  }
}`}
            />
            <DemoBox fukict:slot="demo">
              <FeaturesDisplay />
            </DemoBox>
          </SplitView>
        </div>

        {/* 关键概念 */}
        <div class="space-y-4">
          <div>
            <h3 class="mb-1 text-base font-medium text-gray-800">关键概念</h3>
            <p class="text-sm leading-relaxed text-gray-600">
              理解 @fukict/i18n 的核心概念和使用模式
            </p>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <h4 class="mb-2 text-sm font-medium text-blue-900">类型安全</h4>
              <ul class="space-y-1 text-xs text-blue-700">
                <li>• 翻译键自动补全</li>
                <li>• 参数类型检查</li>
                <li>• 编译时错误提示</li>
                <li>• 使用 as const 确保类型推断</li>
              </ul>
            </div>

            <div class="rounded-lg border border-green-200 bg-green-50 p-4">
              <h4 class="mb-2 text-sm font-medium text-green-900">
                响应式切换
              </h4>
              <ul class="space-y-1 text-xs text-green-700">
                <li>• subscribe() 订阅语言变化</li>
                <li>• changeLocale() 异步切换语言</li>
                <li>• 组件自动重新渲染</li>
                <li>• 在 beforeUnmount 取消订阅</li>
              </ul>
            </div>

            <div class="rounded-lg border border-purple-200 bg-purple-50 p-4">
              <h4 class="mb-2 text-sm font-medium text-purple-900">格式化</h4>
              <ul class="space-y-1 text-xs text-purple-700">
                <li>• n() 格式化数字</li>
                <li>• d() 格式化日期</li>
                <li>• rt() 相对时间</li>
                <li>• 根据语言环境自动调整</li>
              </ul>
            </div>

            <div class="rounded-lg border border-orange-200 bg-orange-50 p-4">
              <h4 class="mb-2 text-sm font-medium text-orange-900">最佳实践</h4>
              <ul class="space-y-1 text-xs text-orange-700">
                <li>• 必须设置 defaultLocale</li>
                <li>• 使用 as const 定义消息</li>
                <li>• 在 mounted 订阅变化</li>
                <li>• 使用 fallbackLocale 作为后备</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

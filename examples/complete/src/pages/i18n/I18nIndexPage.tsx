import { RouteComponent } from '@fukict/router';

/**
 * I18n 模块页面
 */
export class I18nIndexPage extends RouteComponent {
  render() {
    return (
      <div class="space-y-8">
        {/* 页面头部 */}
        <div class="border-b border-gray-200/80 pb-5">
          <h1 class="text-2xl font-semibold text-gray-900">
            国际化 (@fukict/i18n)
          </h1>
          <p class="mt-2 text-sm text-gray-600 leading-relaxed">
            类型安全的国际化库,支持多语言、参数插值、语言切换等功能
          </p>
        </div>

        {/* 创建 I18n 实例 */}
        <div class="space-y-3">
          <h2 class="text-xl font-semibold text-gray-900">创建 I18n 实例</h2>
          <p class="text-sm text-gray-600 leading-relaxed">
            定义多语言消息和配置
          </p>
          <div class="bg-gray-50/50 rounded-lg p-4 border border-gray-200/60">
            <pre class="text-xs text-gray-700 leading-relaxed">
              {`import { createI18n } from '@fukict/i18n';

// 定义消息
const messages = {
  en: {
    greeting: 'Hello, {name}!',
    welcome: 'Welcome to Fukict',
    items: {
      count: 'You have {count} item(s)',
    },
  },
  zh: {
    greeting: '你好,{name}!',
    welcome: '欢迎使用 Fukict',
    items: {
      count: '你有 {count} 个项目',
    },
  },
};

// 创建 i18n 实例
const i18n = createI18n({
  locale: 'zh',      // 默认语言
  fallbackLocale: 'en',  // 回退语言
  messages,
});`}
            </pre>
          </div>
        </div>

        {/* 基础翻译 */}
        <div class="space-y-3">
          <h2 class="text-xl font-semibold text-gray-900">基础翻译</h2>
          <p class="text-sm text-gray-600 leading-relaxed">
            使用 t() 函数进行翻译
          </p>
          <div class="bg-gray-50/50 rounded-lg p-4 border border-gray-200/60">
            <pre class="text-xs text-gray-700 leading-relaxed">
              {`// 简单翻译
const msg1 = i18n.t('welcome');
// 中文: "欢迎使用 Fukict"
// 英文: "Welcome to Fukict"

// 嵌套键
const msg2 = i18n.t('items.count', { count: 5 });
// 中文: "你有 5 个项目"
// 英文: "You have 5 item(s)"

// 参数插值
const msg3 = i18n.t('greeting', { name: 'Alice' });
// 中文: "你好,Alice!"
// 英文: "Hello, Alice!"`}
            </pre>
          </div>
        </div>

        {/* 语言切换 */}
        <div class="space-y-3">
          <h2 class="text-xl font-semibold text-gray-900">语言切换</h2>
          <p class="text-sm text-gray-600 leading-relaxed">动态切换应用语言</p>
          <div class="bg-gray-50/50 rounded-lg p-4 border border-gray-200/60">
            <pre class="text-xs text-gray-700 leading-relaxed">
              {`// 获取当前语言
const currentLocale = i18n.getCurrentLocale();  // 'zh'

// 切换语言
i18n.setLocale('en');

// 监听语言变化
const unsubscribe = i18n.subscribe(() => {
  console.log('Language changed to:', i18n.getCurrentLocale());
  // 重新渲染组件
});

// 取消监听
unsubscribe();`}
            </pre>
          </div>
        </div>

        {/* 在组件中使用 */}
        <div class="space-y-3">
          <h2 class="text-xl font-semibold text-gray-900">在组件中使用</h2>
          <p class="text-sm text-gray-600 leading-relaxed">
            订阅语言变化并更新组件
          </p>
          <div class="bg-gray-50/50 rounded-lg p-4 border border-gray-200/60">
            <pre class="text-xs text-gray-700 leading-relaxed">
              {`import { Fukict } from '@fukict/basic';
import { i18n } from './i18n';

export class LanguageSwitcher extends Fukict {
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

  render() {
    const currentLang = i18n.getCurrentLocale();

    return (
      <div>
        <p>{i18n.t('welcome')}</p>
        <p>{i18n.t('greeting', { name: 'User' })}</p>

        <button on:click={() => i18n.setLocale('zh')}>
          中文
        </button>
        <button on:click={() => i18n.setLocale('en')}>
          English
        </button>

        <p>Current Language: {currentLang}</p>
      </div>
    );
  }
}`}
            </pre>
          </div>
        </div>

        {/* 类型安全 */}
        <div class="bg-gray-50/50 border border-gray-200/60 rounded-lg p-4">
          <h3 class="text-base font-medium text-gray-900 mb-2">类型安全</h3>
          <p class="text-sm text-gray-700 leading-relaxed">
            @fukict/i18n 提供完整的 TypeScript 类型支持:
          </p>
          <ul class="text-sm text-gray-700 mt-2 space-y-1">
            <li>翻译键自动补全</li>
            <li>参数类型检查</li>
            <li>编译时错误提示</li>
          </ul>
        </div>
      </div>
    );
  }
}

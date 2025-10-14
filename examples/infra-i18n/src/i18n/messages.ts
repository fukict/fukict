/**
 * @fukict/i18n Example - Translation Messages
 *
 * Multilingual translation resources
 */

export const messages = {
  en: {
    app: {
      title: 'Fukict i18n Example',
      subtitle: 'Type-safe internationalization for Fukict',
    },
    nav: {
      home: 'Home',
      demo: 'Demo',
      about: 'About',
    },
    home: {
      welcome: 'Welcome to Fukict i18n!',
      description:
        'A lightweight, type-safe internationalization library for Fukict framework.',
      features: {
        title: 'Features',
        typeafe: 'Type-safe translation keys',
        reactive: 'Reactive locale switching',
        formatting: 'Number and date formatting',
        plurals: 'Plural form support',
      },
    },
    demo: {
      title: 'Interactive Demo',
      greeting: 'Hello, {name}!',
      nameLabel: 'Your name:',
      namePlaceholder: 'Enter your name',
      items: {
        zero: 'No items',
        one: '{count} item',
        other: '{count} items',
      },
      itemsLabel: 'Items count:',
      number: 'Number formatting: {value}',
      currency: 'Currency: {value}',
      date: 'Date: {value}',
      relativeTime: 'Relative time: {value}',
    },
    about: {
      title: 'About i18n',
      description:
        '@fukict/i18n is designed to work seamlessly with the Fukict framework, providing a simple and intuitive API for managing multilingual content.',
      features: {
        title: 'Key Features',
        item1: 'Complete TypeScript support with automatic type inference',
        item2: 'Subscription-based reactive updates',
        item3: 'Lazy loading for language packs',
        item4: 'Built-in formatting using Intl API',
        item5: 'Small bundle size (< 3KB gzipped)',
      },
    },
    footer: {
      copyright: '© 2025 Fukict Team. All rights reserved.',
      docs: 'Documentation',
      github: 'GitHub',
      language: 'Language',
    },
  },
  zh: {
    app: {
      title: 'Fukict i18n 示例',
      subtitle: 'Fukict 框架的类型安全国际化库',
    },
    nav: {
      home: '首页',
      demo: '演示',
      about: '关于',
    },
    home: {
      welcome: '欢迎使用 Fukict i18n！',
      description: '一个轻量级、类型安全的 Fukict 框架国际化库。',
      features: {
        title: '特性',
        typeSafe: '类型安全的翻译键',
        reactive: '响应式语言切换',
        formatting: '数字和日期格式化',
        plurals: '复数形式支持',
      },
    },
    demo: {
      title: '交互式演示',
      greeting: '你好，{name}！',
      nameLabel: '你的名字：',
      namePlaceholder: '输入你的名字',
      items: {
        zero: '没有项目',
        one: '{count} 个项目',
        other: '{count} 个项目',
      },
      itemsLabel: '项目数量：',
      number: '数字格式化：{value}',
      currency: '货币：{value}',
      date: '日期：{value}',
      relativeTime: '相对时间：{value}',
    },
    about: {
      title: '关于 i18n',
      description:
        '@fukict/i18n 专为 Fukict 框架设计，提供简单直观的 API 来管理多语言内容。',
      features: {
        title: '核心特性',
        item1: '完整的 TypeScript 支持和自动类型推导',
        item2: '基于订阅的响应式更新',
        item3: '语言包懒加载',
        item4: '使用 Intl API 的内置格式化',
        item5: '小巧的包体积（< 3KB gzipped）',
      },
    },
    footer: {
      copyright: '© 2025 Fukict 团队。保留所有权利。',
      docs: '文档',
      github: 'GitHub',
      language: '语言',
    },
  },
  ja: {
    app: {
      title: 'Fukict i18n サンプル',
      subtitle: 'Fukict フレームワーク向けの型安全な国際化ライブラリ',
    },
    nav: {
      home: 'ホーム',
      demo: 'デモ',
      about: '概要',
    },
    home: {
      welcome: 'Fukict i18n へようこそ！',
      description:
        'Fukict フレームワーク向けの軽量で型安全な国際化ライブラリです。',
      features: {
        title: '機能',
        typeSafe: '型安全な翻訳キー',
        reactive: 'リアクティブな言語切り替え',
        formatting: '数値と日付のフォーマット',
        plurals: '複数形のサポート',
      },
    },
    demo: {
      title: 'インタラクティブデモ',
      greeting: 'こんにちは、{name}さん！',
      nameLabel: 'お名前：',
      namePlaceholder: '名前を入力',
      items: {
        zero: 'アイテムなし',
        one: '{count} 個のアイテム',
        other: '{count} 個のアイテム',
      },
      itemsLabel: 'アイテム数：',
      number: '数値フォーマット：{value}',
      currency: '通貨：{value}',
      date: '日付：{value}',
      relativeTime: '相対時刻：{value}',
    },
    about: {
      title: 'i18n について',
      description:
        '@fukict/i18n は Fukict フレームワークとシームレスに動作するよう設計されており、多言語コンテンツを管理するためのシンプルで直感的な API を提供します。',
      features: {
        title: '主な機能',
        item1: '自動型推論による完全な TypeScript サポート',
        item2: 'サブスクリプションベースのリアクティブ更新',
        item3: '言語パックの遅延ロード',
        item4: 'Intl API を使用した組み込みフォーマット',
        item5: '小さなバンドルサイズ（< 3KB gzipped）',
      },
    },
    footer: {
      copyright: '© 2025 Fukict チーム。すべての権利を保有します。',
      docs: 'ドキュメント',
      github: 'GitHub',
      language: '言語',
    },
  },
} as const;

export type Messages = typeof messages;
export type Locale = keyof Messages;

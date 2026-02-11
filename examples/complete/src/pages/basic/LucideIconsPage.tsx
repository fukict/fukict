import { Fukict, h } from '@fukict/basic';
import { RouteComponent } from '@fukict/router';
import {
  AlertCircle,
  Calendar,
  Camera,
  Check,
  ChevronRight,
  Clock,
  CreditCard,
  Download,
  Edit,
  Heart,
  Home,
  Info,
  Mail,
  Menu,
  Package,
  Phone,
  Search,
  Settings,
  ShoppingCart,
  Star,
  Trash2,
  Upload,
  User,
  X,
  Zap,
  createIcons,
} from 'lucide';

import { CodeBlock } from '../../components/CodeBlock';
import { DemoBox } from '../../components/DemoBox';
import { SplitView } from '../../components/SplitView';

/**
 * 简单图标展示组件
 */
class SimpleIconDemo extends Fukict {
  mounted() {
    // 组件挂载后，初始化图标
    createIcons({
      icons: { Camera, Heart, Home, Settings, User },
      attrs: {
        'stroke-width': 2,
        width: 24,
        height: 24,
      },
    });
  }

  render() {
    return (
      <div class="flex items-center gap-4">
        <i data-lucide="camera"></i>
        <i data-lucide="heart"></i>
        <i data-lucide="home"></i>
        <i data-lucide="settings"></i>
        <i data-lucide="user"></i>
      </div>
    );
  }
}

/**
 * 可配置的图标组件
 */
class Icon extends Fukict<{
  name: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
  class?: string;
}> {
  mounted() {
    this.updateIcon();
  }

  update() {
    super.update();
    this.updateIcon();
  }

  private updateIcon() {
    const { size = 24, color = 'currentColor', strokeWidth = 2 } = this.props;

    // 获取所有可用图标
    const allIcons = {
      Camera,
      Heart,
      Home,
      Settings,
      User,
      Mail,
      Phone,
      Search,
      Menu,
      X,
      ChevronRight,
      Star,
      ShoppingCart,
      Calendar,
      Clock,
      Download,
      Upload,
      Trash2,
      Edit,
      Check,
      AlertCircle,
      Info,
      CreditCard,
      Package,
      Zap,
    };

    createIcons({
      icons: allIcons,
      attrs: {
        width: size,
        height: size,
        stroke: color,
        'stroke-width': strokeWidth,
      },
    });
  }

  render() {
    const { name, class: className } = this.props;
    // Convert PascalCase to kebab-case for data-lucide attribute
    const kebabName = name
      .replace(/([A-Z])/g, '-$1')
      .toLowerCase()
      .replace(/^-/, '');

    return h(
      'i',
      {
        'data-lucide': kebabName,
        class: className || '',
        style: 'display: inline-block;',
      },
      [],
    );
  }
}

/**
 * 不同尺寸的图标示例
 */
class IconSizesDemo extends Fukict {
  render() {
    return (
      <div class="flex items-center gap-6">
        <Icon name="Heart" size={16} color="#ef4444" />
        <Icon name="Heart" size={24} color="#ef4444" />
        <Icon name="Heart" size={32} color="#ef4444" />
        <Icon name="Heart" size={48} color="#ef4444" />
        <Icon name="Heart" size={64} color="#ef4444" />
      </div>
    );
  }
}

/**
 * 不同颜色的图标示例
 */
class IconColorsDemo extends Fukict {
  render() {
    return (
      <div class="flex items-center gap-4">
        <Icon name="Star" size={32} color="#ef4444" />
        <Icon name="Star" size={32} color="#f59e0b" />
        <Icon name="Star" size={32} color="#10b981" />
        <Icon name="Star" size={32} color="#3b82f6" />
        <Icon name="Star" size={32} color="#8b5cf6" />
        <Icon name="Star" size={32} color="#ec4899" />
      </div>
    );
  }
}

/**
 * 不同粗细的图标示例
 */
class IconStrokeDemo extends Fukict {
  render() {
    return (
      <div class="flex items-center gap-4">
        <Icon name="Settings" size={32} strokeWidth={1} />
        <Icon name="Settings" size={32} strokeWidth={2} />
        <Icon name="Settings" size={32} strokeWidth={3} />
        <Icon name="Settings" size={32} strokeWidth={4} />
      </div>
    );
  }
}

/**
 * 图标库展示
 */
class IconGalleryDemo extends Fukict {
  render() {
    const icons = [
      { name: 'Camera', label: 'Camera' },
      { name: 'Heart', label: 'Heart' },
      { name: 'Home', label: 'Home' },
      { name: 'Settings', label: 'Settings' },
      { name: 'User', label: 'User' },
      { name: 'Mail', label: 'Mail' },
      { name: 'Phone', label: 'Phone' },
      { name: 'Search', label: 'Search' },
      { name: 'Menu', label: 'Menu' },
      { name: 'X', label: 'Close' },
      { name: 'ChevronRight', label: 'Chevron' },
      { name: 'Star', label: 'Star' },
      { name: 'ShoppingCart', label: 'Cart' },
      { name: 'Calendar', label: 'Calendar' },
      { name: 'Clock', label: 'Clock' },
      { name: 'Download', label: 'Download' },
      { name: 'Upload', label: 'Upload' },
      { name: 'Trash2', label: 'Trash' },
      { name: 'Edit', label: 'Edit' },
      { name: 'Check', label: 'Check' },
      { name: 'AlertCircle', label: 'Alert' },
      { name: 'Info', label: 'Info' },
      { name: 'CreditCard', label: 'Card' },
      { name: 'Package', label: 'Package' },
      { name: 'Zap', label: 'Zap' },
    ];

    return (
      <div class="grid grid-cols-4 gap-4 sm:grid-cols-6 lg:grid-cols-8">
        {icons.map(icon => (
          <div
            key={icon.name}
            class="flex flex-col items-center gap-2 rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50"
          >
            <Icon name={icon.name} size={28} color="#6366f1" />
            <span class="text-xs text-gray-600">{icon.label}</span>
          </div>
        ))}
      </div>
    );
  }
}

/**
 * 实际应用场景示例 - 按钮
 */
class IconButtonsDemo extends Fukict {
  render() {
    return (
      <div class="flex flex-wrap gap-3">
        <button class="flex items-center gap-2 rounded bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600">
          <Icon name="Download" size={18} color="white" />
          <span>Download</span>
        </button>

        <button class="flex items-center gap-2 rounded bg-green-500 px-4 py-2 text-white transition-colors hover:bg-green-600">
          <Icon name="Check" size={18} color="white" />
          <span>Confirm</span>
        </button>

        <button class="flex items-center gap-2 rounded bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600">
          <Icon name="Trash2" size={18} color="white" />
          <span>Delete</span>
        </button>

        <button class="flex items-center gap-2 rounded border border-gray-300 bg-white px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50">
          <Icon name="Edit" size={18} color="#374151" />
          <span>Edit</span>
        </button>
      </div>
    );
  }
}

/**
 * 实际应用场景示例 - 导航栏
 */
class IconNavDemo extends Fukict {
  render() {
    return (
      <div class="rounded-lg border border-gray-200 bg-white p-4">
        <nav class="flex items-center justify-between">
          <div class="flex items-center gap-6">
            <Icon name="Home" size={20} />
            <a
              href="#"
              class="flex items-center gap-2 text-gray-700 hover:text-blue-500"
            >
              <Icon name="ShoppingCart" size={20} />
              <span>Products</span>
            </a>
            <a
              href="#"
              class="flex items-center gap-2 text-gray-700 hover:text-blue-500"
            >
              <Icon name="Calendar" size={20} />
              <span>Events</span>
            </a>
            <a
              href="#"
              class="flex items-center gap-2 text-gray-700 hover:text-blue-500"
            >
              <Icon name="Mail" size={20} />
              <span>Contact</span>
            </a>
          </div>
          <div class="flex items-center gap-4">
            <Icon name="Search" size={20} />
            <Icon name="User" size={20} />
            <Icon name="Settings" size={20} />
          </div>
        </nav>
      </div>
    );
  }
}

/**
 * Lucide Icons 集成页面
 */
export class LucideIconsPage extends RouteComponent {
  render() {
    return (
      <div>
        <div class="space-y-8">
          {/* 基础用法 */}
          <SplitView>
            <DemoBox fukict:slot="demo" title="基础用法">
              <SimpleIconDemo />
            </DemoBox>
            <CodeBlock
              fukict:slot="code"
              language="tsx"
              code={`import { Fukict } from '@fukict/basic';
import { Camera, Heart, Home, Settings, User, createIcons } from 'lucide';

class SimpleIconDemo extends Fukict {
  mounted() {
    // 组件挂载后，初始化图标
    createIcons({
      icons: { Camera, Heart, Home, Settings, User },
      attrs: {
        'stroke-width': 2,
        width: 24,
        height: 24,
      },
    });
  }

  render() {
    return (
      <div class="flex items-center gap-4">
        <i data-lucide="camera"></i>
        <i data-lucide="heart"></i>
        <i data-lucide="home"></i>
        <i data-lucide="settings"></i>
        <i data-lucide="user"></i>
      </div>
    );
  }
}`}
            />
          </SplitView>

          {/* 可复用的 Icon 组件 */}
          <SplitView>
            <DemoBox fukict:slot="demo" title="可复用的 Icon 组件">
              <div class="space-y-4">
                <div class="flex items-center gap-4">
                  <Icon name="Camera" size={24} />
                  <Icon name="Heart" size={24} color="#ef4444" />
                  <Icon name="Star" size={24} color="#f59e0b" />
                </div>
              </div>
            </DemoBox>
            <CodeBlock
              fukict:slot="code"
              language="tsx"
              code={`import { Fukict, h } from '@fukict/basic';
import { createIcons, Camera, Heart, Star } from 'lucide';

class Icon extends Fukict<{
  name: string;
  size?: number;
  color?: string;
}> {
  mounted() {
    this.updateIcon();
  }

  private updateIcon() {
    const { size = 24, color = 'currentColor' } = this.props;
    createIcons({
      icons: { Camera, Heart, Star },
      attrs: { width: size, height: size, stroke: color }
    });
  }

  render() {
    const kebabName = this.props.name
      .replace(/([A-Z])/g, '-$1')
      .toLowerCase()
      .replace(/^-/, '');
    return h('i', { 'data-lucide': kebabName }, []);
  }
}

// 使用
<Icon name="Camera" size={24} />
<Icon name="Heart" size={24} color="#ef4444" />
<Icon name="Star" size={24} color="#f59e0b" />`}
            />
          </SplitView>

          {/* 不同尺寸 */}
          <SplitView>
            <DemoBox fukict:slot="demo" title="不同尺寸">
              <IconSizesDemo />
            </DemoBox>
            <CodeBlock
              fukict:slot="code"
              language="tsx"
              code={`<Icon name="Heart" size={16} color="#ef4444" />
<Icon name="Heart" size={24} color="#ef4444" />
<Icon name="Heart" size={32} color="#ef4444" />
<Icon name="Heart" size={48} color="#ef4444" />
<Icon name="Heart" size={64} color="#ef4444" />`}
            />
          </SplitView>

          {/* 不同颜色 */}
          <SplitView>
            <DemoBox fukict:slot="demo" title="不同颜色">
              <IconColorsDemo />
            </DemoBox>
            <CodeBlock
              fukict:slot="code"
              language="tsx"
              code={`<Icon name="Star" size={32} color="#ef4444" />
<Icon name="Star" size={32} color="#f59e0b" />
<Icon name="Star" size={32} color="#10b981" />
<Icon name="Star" size={32} color="#3b82f6" />
<Icon name="Star" size={32} color="#8b5cf6" />
<Icon name="Star" size={32} color="#ec4899" />`}
            />
          </SplitView>

          {/* 不同粗细 */}
          <SplitView>
            <DemoBox fukict:slot="demo" title="不同粗细 (strokeWidth)">
              <IconStrokeDemo />
            </DemoBox>
            <CodeBlock
              fukict:slot="code"
              language="tsx"
              code={`<Icon name="Settings" size={32} strokeWidth={1} />
<Icon name="Settings" size={32} strokeWidth={2} />
<Icon name="Settings" size={32} strokeWidth={3} />
<Icon name="Settings" size={32} strokeWidth={4} />`}
            />
          </SplitView>

          {/* 图标库 */}
          <div>
            <h3 class="mb-4 text-lg font-semibold text-gray-900">图标库</h3>
            <DemoBox title="常用图标展示">
              <IconGalleryDemo />
            </DemoBox>
          </div>

          {/* 实际应用 - 按钮 */}
          <SplitView>
            <DemoBox fukict:slot="demo" title="实际应用 - 图标按钮">
              <IconButtonsDemo />
            </DemoBox>
            <CodeBlock
              fukict:slot="code"
              language="tsx"
              code={`<button class="flex items-center gap-2 rounded bg-blue-500 px-4 py-2 text-white">
  <Icon name="Download" size={18} color="white" />
  <span>Download</span>
</button>

<button class="flex items-center gap-2 rounded bg-green-500 px-4 py-2 text-white">
  <Icon name="Check" size={18} color="white" />
  <span>Confirm</span>
</button>`}
            />
          </SplitView>

          {/* 实际应用 - 导航栏 */}
          <SplitView>
            <DemoBox fukict:slot="demo" title="实际应用 - 导航栏">
              <IconNavDemo />
            </DemoBox>
            <CodeBlock
              fukict:slot="code"
              language="tsx"
              code={`<nav class="flex items-center justify-between">
  <div class="flex items-center gap-6">
    <Icon name="Home" size={20} />
    <a href="#" class="flex items-center gap-2">
      <Icon name="ShoppingCart" size={20} />
      <span>Products</span>
    </a>
    <a href="#" class="flex items-center gap-2">
      <Icon name="Calendar" size={20} />
      <span>Events</span>
    </a>
  </div>
  <div class="flex items-center gap-4">
    <Icon name="Search" size={20} />
    <Icon name="User" size={20} />
    <Icon name="Settings" size={20} />
  </div>
</nav>`}
            />
          </SplitView>

          {/* 特性说明 */}
          <div class="rounded-lg border border-gray-200 bg-gray-50 p-6">
            <h3 class="mb-4 text-lg font-semibold text-gray-900">
              ✨ Lucide Icons 特性
            </h3>
            <ul class="space-y-2 text-gray-700">
              <li class="flex items-start gap-2">
                <Icon name="Check" size={20} color="#10b981" />
                <span>
                  <strong>完美兼容：</strong>Lucide vanilla 版本与 Fukict
                  天然兼容，无需任何框架改动
                </span>
              </li>
              <li class="flex items-start gap-2">
                <Icon name="Check" size={20} color="#10b981" />
                <span>
                  <strong>Tree-shaking：</strong>只导入使用的图标，最小化包体积
                </span>
              </li>
              <li class="flex items-start gap-2">
                <Icon name="Check" size={20} color="#10b981" />
                <span>
                  <strong>1600+ 图标：</strong>
                  丰富的图标库，涵盖各种使用场景
                </span>
              </li>
              <li class="flex items-start gap-2">
                <Icon name="Check" size={20} color="#10b981" />
                <span>
                  <strong>高性能：</strong>使用原生 SVG，性能优秀
                </span>
              </li>
              <li class="flex items-start gap-2">
                <Icon name="Check" size={20} color="#10b981" />
                <span>
                  <strong>高度可定制：</strong>
                  支持大小、颜色、粗细等各种配置
                </span>
              </li>
              <li class="flex items-start gap-2">
                <Icon name="Check" size={20} color="#10b981" />
                <span>
                  <strong>TypeScript 支持：</strong>完整的类型定义
                </span>
              </li>
            </ul>
          </div>

          {/* 安装说明 */}
          <div class="rounded-lg border border-blue-200 bg-blue-50 p-6">
            <h3 class="mb-4 text-lg font-semibold text-gray-900">
              📦 安装 Lucide
            </h3>
            <CodeBlock
              language="bash"
              code={`# 使用 npm
npm install lucide

# 使用 pnpm
pnpm add lucide

# 使用 yarn
yarn add lucide`}
            />
          </div>
        </div>
      </div>
    );
  }
}

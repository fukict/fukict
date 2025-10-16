import { Fukict } from '@fukict/basic';
import { RouteComponent } from '@fukict/router';

import { CodeBlock } from '../../components/CodeBlock';
import { DemoBox } from '../../components/DemoBox';
import { SplitView } from '../../components/SplitView';

/**
 * Class 绑定演示
 */
class ClassBindingDemo extends Fukict {
  private isActive = true;
  private hasError = false;

  private toggleActive = () => {
    this.isActive = !this.isActive;
    this.update();
  };

  private toggleError = () => {
    this.hasError = !this.hasError;
    this.update();
  };

  render() {
    return (
      <div class="space-y-4">
        {/* 基础类名绑定 */}
        <div>
          <div
            class={`rounded px-4 py-2 text-sm font-medium transition-colors ${
              this.isActive
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            状态按钮
          </div>
          <button
            class="mt-2 rounded bg-gray-500 px-3 py-1 text-xs text-white hover:bg-gray-600"
            on:click={this.toggleActive}
          >
            切换激活状态
          </button>
        </div>

        {/* 多条件类名 */}
        <div>
          <div
            class={`rounded px-4 py-2 text-sm font-medium ${
              this.hasError
                ? 'bg-red-500 text-white'
                : 'bg-green-500 text-white'
            }`}
          >
            {this.hasError ? '错误状态' : '成功状态'}
          </div>
          <button
            class="mt-2 rounded bg-gray-500 px-3 py-1 text-xs text-white hover:bg-gray-600"
            on:click={this.toggleError}
          >
            切换错误状态
          </button>
        </div>

        {/* 复杂组合 */}
        <div>
          <div
            class={`rounded px-4 py-2 text-sm font-medium transition-all ${this.isActive ? 'ring-2 ring-blue-400' : ''} ${this.hasError ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'} `}
          >
            复合状态按钮
          </div>
          <p class="mt-2 text-xs text-gray-600">
            激活: {this.isActive ? '是' : '否'}, 错误:{' '}
            {this.hasError ? '是' : '否'}
          </p>
        </div>
      </div>
    );
  }
}

/**
 * Style 绑定演示
 */
class StyleBindingDemo extends Fukict {
  private color = '#ef4444';
  private fontSize = 16;
  private rotation = 0;

  private changeColor = () => {
    const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];
    this.color = colors[Math.floor(Math.random() * colors.length)];
    this.update();
  };

  private increaseFontSize = () => {
    this.fontSize = Math.min(this.fontSize + 2, 32);
    this.update();
  };

  private decreaseFontSize = () => {
    this.fontSize = Math.max(this.fontSize - 2, 12);
    this.update();
  };

  private rotate = () => {
    this.rotation = (this.rotation + 45) % 360;
    this.update();
  };

  render() {
    return (
      <div class="space-y-4">
        {/* 颜色和字体大小 */}
        <div>
          <div
            style={{
              color: this.color,
              fontSize: `${this.fontSize}px`,
              fontWeight: 'bold',
              transition: 'all 0.3s',
            }}
          >
            可变样式文字
          </div>
          <div class="mt-2 space-x-2">
            <button
              class="rounded bg-blue-500 px-3 py-1 text-xs text-white hover:bg-blue-600"
              on:click={this.changeColor}
            >
              改变颜色
            </button>
            <button
              class="rounded bg-green-500 px-3 py-1 text-xs text-white hover:bg-green-600"
              on:click={this.increaseFontSize}
            >
              增大字号
            </button>
            <button
              class="rounded bg-orange-500 px-3 py-1 text-xs text-white hover:bg-orange-600"
              on:click={this.decreaseFontSize}
            >
              减小字号
            </button>
          </div>
        </div>

        {/* Transform 变换 */}
        <div>
          <div
            style={{
              width: '80px',
              height: '80px',
              backgroundColor: '#8b5cf6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '12px',
              fontWeight: 'bold',
              borderRadius: '8px',
              transform: `rotate(${this.rotation}deg)`,
              transition: 'transform 0.5s',
            }}
          >
            旋转盒子
          </div>
          <button
            class="mt-2 rounded bg-purple-500 px-3 py-1 text-xs text-white hover:bg-purple-600"
            on:click={this.rotate}
          >
            旋转 45°
          </button>
        </div>
      </div>
    );
  }
}

/**
 * 动态样式演示
 */
class AnimatedBoxDemo extends Fukict {
  private x = 0;
  private scale = 1;
  private isAnimating = false;
  private animationId: number | null = null;

  private animate = () => {
    this.x += 2;
    this.scale = 1 + Math.sin(this.x * 0.05) * 0.3;

    if (this.x > 200) {
      this.x = 0;
    }

    this.update();

    if (this.isAnimating) {
      this.animationId = requestAnimationFrame(this.animate);
    }
  };

  private toggleAnimation = () => {
    this.isAnimating = !this.isAnimating;

    if (this.isAnimating) {
      this.animate();
    } else if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    this.update();
  };

  private reset = () => {
    this.x = 0;
    this.scale = 1;
    this.update();
  };

  beforeUnmount() {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
    }
  }

  render() {
    return (
      <div class="space-y-4">
        {/* 动画容器 */}
        <div class="relative h-32 overflow-hidden rounded border border-gray-300 bg-gray-100">
          <div
            style={{
              position: 'absolute',
              left: `${this.x}px`,
              top: '50%',
              width: '60px',
              height: '60px',
              backgroundColor: '#3b82f6',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '10px',
              fontWeight: 'bold',
              transform: `translateY(-50%) scale(${this.scale})`,
              transition: 'transform 0.1s',
            }}
          >
            动画
          </div>
        </div>

        {/* 控制按钮 */}
        <div class="space-x-2">
          <button
            class={`rounded px-3 py-1 text-xs text-white ${
              this.isAnimating
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-green-500 hover:bg-green-600'
            }`}
            on:click={this.toggleAnimation}
          >
            {this.isAnimating ? '停止' : '开始'}
          </button>
          <button
            class="rounded bg-gray-500 px-3 py-1 text-xs text-white hover:bg-gray-600"
            on:click={this.reset}
          >
            重置
          </button>
        </div>

        <p class="text-xs text-gray-600">
          位置: {Math.round(this.x)}px, 缩放: {this.scale.toFixed(2)}x
        </p>
      </div>
    );
  }
}

/**
 * 样式绑定页面
 */
export class StylesPage extends RouteComponent {
  render() {
    return (
      <div class="space-y-12">
        {/* Class 绑定 */}
        <div class="space-y-4">
          <div>
            <h3 class="mb-1 text-base font-medium text-gray-800">Class 绑定</h3>
            <p class="text-sm leading-relaxed text-gray-600">
              动态绑定 CSS 类名，根据状态切换样式
            </p>
          </div>

          <SplitView leftTitle="代码示例" rightTitle="运行效果">
            <CodeBlock
              fukict:slot="code"
              code={`import { Fukict } from '@fukict/basic';

export class MyComponent extends Fukict {
  private isActive = true;
  private hasError = false;

  render() {
    return (
      <div>
        {/* 字符串拼接 */}
        <div class={\`btn \${this.isActive ? 'active' : ''}\`}>
          按钮
        </div>

        {/* 条件类名 */}
        <div class={this.hasError ? 'error' : 'success'}>
          状态
        </div>

        {/* 多个条件 */}
        <div class={\`
          btn
          \${this.isActive ? 'active' : ''}
          \${this.hasError ? 'error' : ''}
        \`}>
          复杂按钮
        </div>
      </div>
    );
  }
}`}
            />
            <DemoBox fukict:slot="demo">
              <ClassBindingDemo />
            </DemoBox>
          </SplitView>
        </div>

        {/* Style 绑定 */}
        <div class="space-y-4">
          <div>
            <h3 class="mb-1 text-base font-medium text-gray-800">Style 绑定</h3>
            <p class="text-sm leading-relaxed text-gray-600">
              动态绑定内联样式，使用对象或字符串形式
            </p>
          </div>

          <SplitView leftTitle="代码示例" rightTitle="运行效果">
            <CodeBlock
              fukict:slot="code"
              code={`import { Fukict } from '@fukict/basic';

export class MyComponent extends Fukict {
  private color = 'red';
  private fontSize = 16;

  render() {
    return (
      <div>
        {/* 对象形式 */}
        <div style={{
          color: this.color,
          fontSize: \`\${this.fontSize}px\`
        }}>
          彩色文字
        </div>

        {/* 字符串形式 */}
        <div style={\`color: \${this.color}; font-size: \${this.fontSize}px;\`}>
          彩色文字
        </div>

        {/* 动态变量 */}
        <div style={{
          backgroundColor: this.isActive ? '#00f' : '#ccc',
          transform: \`scale(\${this.scale})\`
        }}>
          动态样式
        </div>
      </div>
    );
  }
}`}
            />
            <DemoBox fukict:slot="demo">
              <StyleBindingDemo />
            </DemoBox>
          </SplitView>
        </div>

        {/* 动态样式 */}
        <div class="space-y-4">
          <div>
            <h3 class="mb-1 text-base font-medium text-gray-800">
              动态样式动画
            </h3>
            <p class="text-sm leading-relaxed text-gray-600">
              使用 requestAnimationFrame 创建平滑的样式动画
            </p>
          </div>

          <SplitView leftTitle="代码示例" rightTitle="运行效果">
            <CodeBlock
              fukict:slot="code"
              code={`import { Fukict } from '@fukict/basic';

export class AnimatedBox extends Fukict {
  private x = 0;
  private scale = 1;
  private isAnimating = false;

  private animate = () => {
    this.x += 2;
    this.scale = 1 + Math.sin(this.x * 0.05) * 0.3;

    if (this.x > 200) this.x = 0;

    this.update();
    if (this.isAnimating) {
      requestAnimationFrame(this.animate);
    }
  };

  render() {
    return (
      <div style={{
        width: '60px',
        height: '60px',
        backgroundColor: '#3b82f6',
        transform: \`translateX(\${this.x}px) scale(\${this.scale})\`,
        transition: 'transform 0.1s'
      }}>
        动画盒子
      </div>
    );
  }
}`}
            />
            <DemoBox fukict:slot="demo">
              <AnimatedBoxDemo />
            </DemoBox>
          </SplitView>
        </div>
      </div>
    );
  }
}

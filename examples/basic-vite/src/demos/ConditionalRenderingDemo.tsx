import { Fukict } from '@fukict/basic';

// 测试组件 A - 红色
class ComponentA extends Fukict {
  render() {
    return (
      <div class="rounded-lg border-2 border-red-500 bg-red-50 p-4">
        <div class="flex items-center gap-2">
          <div class="flex h-8 w-8 items-center justify-center rounded-full bg-red-500 font-bold text-white">
            A
          </div>
          <span class="font-semibold text-red-900">Component A</span>
        </div>
        <p class="mt-2 text-sm text-red-700">
          我应该始终在 Marker 1 和 Marker 2 之间（槽位 #1）
        </p>
      </div>
    );
  }
}

// 测试组件 B - 蓝色
class ComponentB extends Fukict {
  render() {
    return (
      <div class="rounded-lg border-2 border-blue-500 bg-blue-50 p-4">
        <div class="flex items-center gap-2">
          <div class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 font-bold text-white">
            B
          </div>
          <span class="font-semibold text-blue-900">Component B</span>
        </div>
        <p class="mt-2 text-sm text-blue-700">
          我应该始终在 Marker 2 和 Marker 3 之间（槽位 #3）
        </p>
      </div>
    );
  }
}

// 测试组件 C - 绿色
class ComponentC extends Fukict {
  render() {
    return (
      <div class="rounded-lg border-2 border-green-500 bg-green-50 p-4">
        <div class="flex items-center gap-2">
          <div class="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 font-bold text-white">
            C
          </div>
          <span class="font-semibold text-green-900">Component C</span>
        </div>
        <p class="mt-2 text-sm text-green-700">
          我应该始终在 Marker 3 之后（槽位 #5）
        </p>
      </div>
    );
  }
}

// 测试组件 D - 紫色（测试 render 返回 null）
class ComponentD extends Fukict<{ shouldRender: boolean }> {
  render() {
    // 测试 render() 可以返回 null
    if (!this.props.shouldRender) {
      return null;
    }

    return (
      <div class="rounded-lg border-2 border-purple-500 bg-purple-50 p-4">
        <div class="flex items-center gap-2">
          <div class="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500 font-bold text-white">
            D
          </div>
          <span class="font-semibold text-purple-900">
            Component D (Null Test)
          </span>
        </div>
        <p class="mt-2 text-sm text-purple-700">
          这个组件测试 render() 返回 null 的情况
        </p>
      </div>
    );
  }
}

// 主演示组件
export class ConditionalRenderingDemo extends Fukict {
  private showA: boolean = false;
  private showB: boolean = false;
  private showC: boolean = false;
  private showD: boolean = false;
  private autoPlayInterval: number | null = null;
  private testSequence: Array<{ a: boolean; b: boolean; c: boolean }> = [
    { a: true, b: false, c: false },
    { a: false, b: true, c: false },
    { a: false, b: false, c: true },
    { a: true, b: true, c: false },
    { a: false, b: true, c: true },
    { a: true, b: false, c: true },
    { a: true, b: true, c: true },
    { a: false, b: false, c: false },
  ];
  private currentTestIndex: number = 0;

  beforeUnmount() {
    this.stopAutoPlay();
  }

  // 切换 A
  toggleA() {
    this.showA = !this.showA;
    this.update(this.props);
  }

  // 切换 B
  toggleB() {
    this.showB = !this.showB;
    this.update(this.props);
  }

  // 切换 C
  toggleC() {
    this.showC = !this.showC;
    this.update(this.props);
  }

  // 切换 D (测试 render 返回 null)
  toggleD() {
    this.showD = !this.showD;
    this.update(this.props);
  }

  // 显示全部
  showAll() {
    this.showA = true;
    this.showB = true;
    this.showC = true;
    this.update(this.props);
  }

  // 隐藏全部
  hideAll() {
    this.showA = false;
    this.showB = false;
    this.showC = false;
    this.update(this.props);
  }

  // 运行测试序列
  nextTest() {
    const test = this.testSequence[this.currentTestIndex];
    this.showA = test.a;
    this.showB = test.b;
    this.showC = test.c;
    this.currentTestIndex =
      (this.currentTestIndex + 1) % this.testSequence.length;
    this.update(this.props);
  }

  // 自动播放测试序列
  startAutoPlay() {
    if (this.autoPlayInterval !== null) return;

    this.autoPlayInterval = window.setInterval(() => {
      this.nextTest();
    }, 1500);
  }

  stopAutoPlay() {
    if (this.autoPlayInterval !== null) {
      window.clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = null;
      this.update(this.props);
    }
  }

  toggleAutoPlay() {
    if (this.autoPlayInterval !== null) {
      this.stopAutoPlay();
    } else {
      this.startAutoPlay();
    }
  }

  render() {
    const isAutoPlaying = this.autoPlayInterval !== null;

    return (
      <div>
        <h2 class="mb-4 text-3xl font-bold">条件渲染顺序测试</h2>

        <div class="mb-6 space-y-3 border-l-4 border-blue-500 bg-blue-50 p-4">
          <p class="text-sm text-gray-700">
            <strong class="text-blue-900">测试目标：</strong>
            验证使用 PrimitiveVNode 后，条件渲染的组件始终保持在正确的 DOM
            槽位，不会因为条件变化而乱序。
          </p>
          <p class="text-sm text-gray-700">
            <strong class="text-blue-900">测试方法：</strong>
          </p>
          <ol class="ml-6 list-decimal space-y-1 text-sm text-gray-700">
            <li>打开浏览器开发者工具（F12）→ Elements 面板</li>
            <li>定位到下方 "条件渲染区域" 的 DOM 结构</li>
            <li>点击控制按钮切换组件显示/隐藏</li>
            <li>
              <strong>观察重点：</strong>
              <ul class="mt-1 ml-4 list-disc space-y-1">
                <li>
                  组件 A 应该始终在{' '}
                  <code class="rounded bg-blue-100 px-1">Marker 1</code> 和{' '}
                  <code class="rounded bg-blue-100 px-1">Marker 2</code>{' '}
                  之间（槽位 #1）
                </li>
                <li>
                  组件 B 应该始终在{' '}
                  <code class="rounded bg-blue-100 px-1">Marker 2</code> 和{' '}
                  <code class="rounded bg-blue-100 px-1">Marker 3</code>{' '}
                  之间（槽位 #3）
                </li>
                <li>
                  组件 C 应该始终在{' '}
                  <code class="rounded bg-blue-100 px-1">Marker 3</code>{' '}
                  之后（槽位 #5）
                </li>
                <li>
                  条件为 false 时，应该看到{' '}
                  <code class="rounded bg-blue-100 px-1">
                    &lt;!--fukict:primitive:false--&gt;
                  </code>{' '}
                  占位符
                </li>
                <li>
                  <strong class="text-red-600">不应该看到</strong>{' '}
                  <code class="rounded bg-red-100 px-1">
                    &lt;!--fukict-replace--&gt;
                  </code>{' '}
                  残留节点
                </li>
              </ul>
            </li>
          </ol>
        </div>

        {/* 控制面板 */}
        <div class="mb-6 rounded-lg bg-white p-4 shadow">
          <h3 class="mb-3 font-semibold text-gray-900">控制面板</h3>

          {/* 单独控制 */}
          <div class="mb-4">
            <p class="mb-2 text-sm text-gray-600">单独切换：</p>
            <div class="flex flex-wrap gap-2">
              <button
                on:click={() => this.toggleA()}
                class={`rounded px-4 py-2 font-medium transition-colors ${
                  this.showA
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {this.showA ? '✓ 隐藏 A' : '显示 A'}
              </button>
              <button
                on:click={() => this.toggleB()}
                class={`rounded px-4 py-2 font-medium transition-colors ${
                  this.showB
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {this.showB ? '✓ 隐藏 B' : '显示 B'}
              </button>
              <button
                on:click={() => this.toggleC()}
                class={`rounded px-4 py-2 font-medium transition-colors ${
                  this.showC
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {this.showC ? '✓ 隐藏 C' : '显示 C'}
              </button>
              <button
                on:click={() => this.toggleD()}
                class={`rounded px-4 py-2 font-medium transition-colors ${
                  this.showD
                    ? 'bg-purple-500 text-white hover:bg-purple-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {this.showD ? '✓ 隐藏 D (Null Test)' : '显示 D (Null Test)'}
              </button>
            </div>
          </div>

          {/* 批量控制 */}
          <div class="mb-4">
            <p class="mb-2 text-sm text-gray-600">批量操作：</p>
            <div class="flex flex-wrap gap-2">
              <button
                on:click={() => this.showAll()}
                class="rounded bg-purple-500 px-4 py-2 font-medium text-white transition-colors hover:bg-purple-600"
              >
                全部显示
              </button>
              <button
                on:click={() => this.hideAll()}
                class="rounded bg-gray-500 px-4 py-2 font-medium text-white transition-colors hover:bg-gray-600"
              >
                全部隐藏
              </button>
              <button
                on:click={() => this.nextTest()}
                class="rounded bg-indigo-500 px-4 py-2 font-medium text-white transition-colors hover:bg-indigo-600"
              >
                下一个测试场景
              </button>
            </div>
          </div>

          {/* 自动测试 */}
          <div>
            <p class="mb-2 text-sm text-gray-600">自动化测试：</p>
            <button
              on:click={() => this.toggleAutoPlay()}
              class={`rounded px-4 py-2 font-medium text-white transition-colors ${
                isAutoPlaying
                  ? 'bg-orange-500 hover:bg-orange-600'
                  : 'bg-teal-500 hover:bg-teal-600'
              }`}
            >
              {isAutoPlaying ? '⏸ 停止自动切换' : '▶ 自动切换场景 (1.5s间隔)'}
            </button>
            {isAutoPlaying && (
              <span class="ml-2 text-sm text-orange-600">
                正在自动测试中... 场景 {this.currentTestIndex}/
                {this.testSequence.length}
              </span>
            )}
          </div>
        </div>

        {/* 当前状态 */}
        <div class="mb-6 rounded-lg bg-gray-100 p-4">
          <h3 class="mb-2 font-semibold text-gray-900">当前显示状态：</h3>
          <div class="flex gap-4">
            <div class="flex items-center gap-2">
              <div
                class={`h-4 w-4 rounded-full ${this.showA ? 'bg-red-500' : 'bg-gray-300'}`}
              ></div>
              <span class="text-sm">
                组件 A: {this.showA ? '显示' : '隐藏'}
              </span>
            </div>
            <div class="flex items-center gap-2">
              <div
                class={`h-4 w-4 rounded-full ${this.showB ? 'bg-blue-500' : 'bg-gray-300'}`}
              ></div>
              <span class="text-sm">
                组件 B: {this.showB ? '显示' : '隐藏'}
              </span>
            </div>
            <div class="flex items-center gap-2">
              <div
                class={`h-4 w-4 rounded-full ${this.showC ? 'bg-green-500' : 'bg-gray-300'}`}
              ></div>
              <span class="text-sm">
                组件 C: {this.showC ? '显示' : '隐藏'}
              </span>
            </div>
          </div>
        </div>

        {/* 预期 DOM 结构 */}
        <div class="mb-6 rounded-lg bg-yellow-50 p-4">
          <h3 class="mb-2 font-semibold text-yellow-900">
            预期 DOM 结构（在 DevTools 中验证）：
          </h3>
          <pre class="overflow-x-auto rounded bg-yellow-100 p-3 text-xs text-yellow-900">
            <code>{`<div class="...条件渲染区域...">
  <div>📍 Marker 1</div>           <!-- 固定槽位 #0 -->
  ${this.showA ? '<div>🔴 Component A</div>     <!-- 槽位 #1 -->' : '<!--fukict:primitive:false-->  <!-- 槽位 #1 -->'}
  <div>📍 Marker 2</div>           <!-- 固定槽位 #2 -->
  ${this.showB ? '<div>🔵 Component B</div>     <!-- 槽位 #3 -->' : '<!--fukict:primitive:false-->  <!-- 槽位 #3 -->'}
  <div>📍 Marker 3</div>           <!-- 固定槽位 #4 -->
  ${this.showC ? '<div>🟢 Component C</div>     <!-- 槽位 #5 -->' : '<!--fukict:primitive:false-->  <!-- 槽位 #5 -->'}
</div>`}</code>
          </pre>
          <p class="mt-2 text-xs text-yellow-800">
            ✅ 关键点：无论组件显示还是隐藏，Marker 的位置始终不变
          </p>
        </div>

        {/* 条件渲染区域 */}
        <div class="space-y-3 rounded border-2 border-dashed border-purple-300 bg-purple-50 p-6">
          <h3 class="mb-4 text-center text-lg font-bold text-purple-900">
            ⬇️ 条件渲染区域 ⬇️
          </h3>

          {/* 槽位 #0 */}
          <div class="rounded bg-gray-200 px-4 py-2 font-mono text-sm text-gray-700">
            📍 Marker 1 (槽位 #0 - 固定)
          </div>

          {/* 槽位 #1 - Component A */}
          {this.showA && <ComponentA />}

          {/* 槽位 #2 */}
          <div class="rounded bg-gray-200 px-4 py-2 font-mono text-sm text-gray-700">
            📍 Marker 2 (槽位 #2 - 固定)
          </div>

          {/* 槽位 #3 - Component B */}
          {this.showB && <ComponentB />}

          {/* 槽位 #4 */}
          <div class="rounded bg-gray-200 px-4 py-2 font-mono text-sm text-gray-700">
            📍 Marker 3 (槽位 #4 - 固定)
          </div>

          {/* 槽位 #5 - Component C */}
          {this.showC && <ComponentC />}

          {/* 测试区域：render() 返回 null */}
          <div class="mt-6 rounded bg-yellow-100 px-4 py-2">
            <h4 class="mb-2 font-semibold text-yellow-900">
              🧪 Null Render Test (render() 返回 null 测试)
            </h4>
            <p class="mb-2 text-xs text-yellow-800">
              ComponentD 的 render() 方法会根据 props 返回 null 或 VNode
            </p>
            <ComponentD shouldRender={this.showD} />
          </div>
        </div>

        {/* JSX 代码展示 */}
        <div class="mt-6 overflow-x-auto rounded-lg bg-gray-900 p-4 text-gray-100">
          <pre class="text-xs">
            <code>{`// 关键代码结构：
<div>
  <div>📍 Marker 1</div>           {/* 槽位 #0 */}
  {this.showA && <ComponentA />}    {/* 槽位 #1 */}
  <div>📍 Marker 2</div>           {/* 槽位 #2 */}
  {this.showB && <ComponentB />}    {/* 槽位 #3 */}
  <div>📍 Marker 3</div>           {/* 槽位 #4 */}
  {this.showC && <ComponentC />}    {/* 槽位 #5 */}
</div>

// PrimitiveVNode 优化后的 children 数组：
[
  ElementVNode(Marker1),              // 槽位 #0
  PrimitiveVNode(false) | ComponentA, // 槽位 #1 (稳定)
  ElementVNode(Marker2),              // 槽位 #2
  PrimitiveVNode(false) | ComponentB, // 槽位 #3 (稳定)
  ElementVNode(Marker3),              // 槽位 #4
  PrimitiveVNode(false) | ComponentC, // 槽位 #5 (稳定)
]

// 优化前的问题：
// - children 数组长度不固定
// - diff 时槽位对应错乱
// - DOM 操作错误导致顺序混乱

// 优化后的效果：
// ✅ children 数组长度固定为 6
// ✅ 每个槽位始终对应同一个位置
// ✅ false 被包装为 PrimitiveVNode，保持结构稳定`}</code>
          </pre>
        </div>

        {/* 测试检查清单 */}
        <div class="mt-6 rounded-lg border-2 border-green-500 bg-green-50 p-4">
          <h3 class="mb-3 font-semibold text-green-900">✅ 测试检查清单：</h3>
          <ul class="space-y-2 text-sm text-gray-700">
            <li class="flex items-start gap-2">
              <span class="mt-0.5 text-green-600">□</span>
              <span>切换组件 A 时，Marker 1 和 Marker 2 的位置保持不变</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="mt-0.5 text-green-600">□</span>
              <span>切换组件 B 时，Marker 2 和 Marker 3 的位置保持不变</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="mt-0.5 text-green-600">□</span>
              <span>切换组件 C 时，Marker 3 的位置保持不变</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="mt-0.5 text-green-600">□</span>
              <span>
                组件隐藏时，对应位置有{' '}
                <code class="rounded bg-green-100 px-1">
                  &lt;!--fukict:primitive:false--&gt;
                </code>{' '}
                占位符
              </span>
            </li>
            <li class="flex items-start gap-2">
              <span class="mt-0.5 text-green-600">□</span>
              <span>
                运行自动测试，DOM 中没有多余的{' '}
                <code class="rounded bg-red-100 px-1">
                  &lt;!--fukict-replace--&gt;
                </code>{' '}
                节点
              </span>
            </li>
            <li class="flex items-start gap-2">
              <span class="mt-0.5 text-green-600">□</span>
              <span>快速切换多次后，组件始终出现在正确的槽位</span>
            </li>
          </ul>
        </div>
      </div>
    );
  }
}

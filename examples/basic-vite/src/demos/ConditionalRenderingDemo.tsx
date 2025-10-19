import { Fukict } from '@fukict/basic';

// 第一个条件组件 - 结果显示
class CalculatorResult extends Fukict<{
  title: string;
  days: number;
  isAuthenticated: boolean;
  onSave: () => void;
}> {
  render() {
    return (
      <div class="rounded-lg border-2 border-green-500 bg-green-50 p-6">
        <h3 class="mb-2 text-lg font-semibold text-green-900">
          {this.props.title}
        </h3>
        <div class="mb-4 text-4xl font-bold text-green-700">
          {this.props.days} 天
        </div>
        {this.props.isAuthenticated ? (
          <button
            on:click={this.props.onSave}
            class="rounded bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
          >
            保存到记忆
          </button>
        ) : (
          <p class="text-sm text-green-700">登录后可保存计算结果</p>
        )}
      </div>
    );
  }
}

// 第二个条件组件 - 记忆列表
class MemoryList extends Fukict<{
  memories: Array<{ id: number; title: string; days: number }>;
  onItemClick: (id: number) => void;
}> {
  render() {
    return (
      <div class="rounded-lg border-2 border-blue-500 bg-blue-50 p-6">
        <h3 class="mb-4 text-lg font-semibold text-blue-900">历史记忆</h3>
        <ul class="space-y-2">
          {this.props.memories.map(memory => (
            <li
              key={memory.id}
              on:click={() => this.props.onItemClick(memory.id)}
              class="cursor-pointer rounded bg-white p-3 shadow transition-all hover:scale-105 hover:shadow-md"
            >
              <div class="font-medium text-blue-900">{memory.title}</div>
              <div class="text-sm text-blue-700">{memory.days} 天</div>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

// 第三个条件组件 - 警告提示
class WarningMessage extends Fukict<{ message: string }> {
  render() {
    return (
      <div class="rounded-lg border-2 border-yellow-500 bg-yellow-50 p-4">
        <div class="flex items-center gap-2">
          <svg
            class="h-5 w-5 text-yellow-700"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clip-rule="evenodd"
            />
          </svg>
          <span class="font-medium text-yellow-900">{this.props.message}</span>
        </div>
      </div>
    );
  }
}

// 主演示组件
export class ConditionalRenderingDemo extends Fukict {
  private calculatedDays: number | null = null;
  private calculatedTitle: string = '';
  private isAuthenticated: boolean = false;
  private memories: Array<{ id: number; title: string; days: number }> = [];
  private showWarning: boolean = false;
  private warningMessage: string = '';
  private nextMemoryId: number = 1;

  // 模拟计算天数
  calculate() {
    const days = Math.floor(Math.random() * 365) + 1;
    this.calculatedDays = days;
    this.calculatedTitle = '计算结果';
    this.showWarning = false;
    this.update(this.props);
  }

  // 清除结果
  clearResult() {
    this.calculatedDays = null;
    this.calculatedTitle = '';
    this.update(this.props);
  }

  // 保存记忆
  saveMemory() {
    if (this.calculatedDays !== null) {
      this.memories.push({
        id: this.nextMemoryId++,
        title: this.calculatedTitle,
        days: this.calculatedDays,
      });
      this.showWarning = false;
      this.update(this.props);
    }
  }

  // 切换认证状态
  toggleAuth() {
    this.isAuthenticated = !this.isAuthenticated;
    this.update(this.props);
  }

  // 清空记忆
  clearMemories() {
    this.memories = [];
    this.update(this.props);
  }

  // 显示警告
  showWarningMessage() {
    this.showWarning = true;
    this.warningMessage = '请先进行计算后再保存！';
    this.update(this.props);
  }

  // 点击记忆项
  handleMemoryClick(id: number) {
    const memory = this.memories.find(m => m.id === id);
    if (memory) {
      alert(`记忆 #${id}: ${memory.title} = ${memory.days} 天`);
    }
  }

  // 同时显示/隐藏所有组件
  toggleAll() {
    if (this.calculatedDays === null && this.memories.length === 0) {
      // 全部显示
      this.calculate();
      this.memories = [
        { id: this.nextMemoryId++, title: '示例记忆 1', days: 100 },
        { id: this.nextMemoryId++, title: '示例记忆 2', days: 200 },
      ];
      this.showWarning = true;
      this.warningMessage = '所有组件已显示';
    } else {
      // 全部隐藏
      this.calculatedDays = null;
      this.memories = [];
      this.showWarning = false;
    }
    this.update(this.props);
  }

  render() {
    return (
      <div>
        <h2 class="mb-4 text-3xl font-bold">条件渲染 Bug 测试</h2>

        <div class="mb-6 border-l-4 border-red-500 bg-red-50 p-4">
          <p class="text-sm text-gray-700">
            <strong>Bug 描述：</strong>当多个 Class Component
            使用条件渲染（&&）时，
            <code class="rounded bg-red-100 px-1">
              &lt;!--fukict:ComponentName#id--&gt;
            </code>{' '}
            注释占位符没有被正确替换，且顺序可能混乱。
          </p>
          <p class="mt-2 text-sm text-gray-700">
            <strong>测试方法：</strong>打开开发者工具查看 DOM
            结构，观察注释节点是否被正确替换。
          </p>
        </div>

        {/* 控制按钮 */}
        <div class="mb-6 flex flex-wrap gap-3 rounded-lg bg-white p-4 shadow">
          <button
            on:click={() => this.calculate()}
            class="rounded bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
          >
            计算天数
          </button>
          <button
            on:click={() => this.clearResult()}
            class="rounded bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700"
          >
            清除结果
          </button>
          <button
            on:click={() => this.toggleAuth()}
            class={`rounded px-4 py-2 text-white transition-colors ${
              this.isAuthenticated
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-400 hover:bg-gray-500'
            }`}
          >
            {this.isAuthenticated ? '已登录 ✓' : '未登录'}
          </button>
          <button
            on:click={() => this.clearMemories()}
            class="rounded bg-orange-600 px-4 py-2 text-white transition-colors hover:bg-orange-700"
          >
            清空记忆
          </button>
          <button
            on:click={() => this.showWarningMessage()}
            class="rounded bg-yellow-600 px-4 py-2 text-white transition-colors hover:bg-yellow-700"
          >
            显示警告
          </button>
          <button
            on:click={() => this.toggleAll()}
            class="rounded bg-purple-600 px-4 py-2 text-white transition-colors hover:bg-purple-700"
          >
            切换全部
          </button>
        </div>

        {/* 状态显示 */}
        <div class="mb-6 rounded-lg bg-gray-100 p-4">
          <h3 class="mb-2 font-semibold">当前状态：</h3>
          <ul class="space-y-1 text-sm text-gray-700">
            <li>
              计算结果显示：
              <span
                class={
                  this.calculatedDays !== null
                    ? 'font-semibold text-green-600'
                    : 'text-red-600'
                }
              >
                {this.calculatedDays !== null ? '是' : '否'}
              </span>
            </li>
            <li>
              记忆列表显示：
              <span
                class={
                  this.memories.length > 0
                    ? 'font-semibold text-green-600'
                    : 'text-red-600'
                }
              >
                {this.memories.length > 0
                  ? `是 (${this.memories.length} 项)`
                  : '否'}
              </span>
            </li>
            <li>
              警告消息显示：
              <span
                class={
                  this.showWarning
                    ? 'font-semibold text-green-600'
                    : 'text-red-600'
                }
              >
                {this.showWarning ? '是' : '否'}
              </span>
            </li>
          </ul>
        </div>

        {/* 条件渲染区域 - 这里会出现 Bug */}
        <div class="space-y-4">
          <div class="rounded border-2 border-dashed border-gray-300 p-4">
            <p class="mb-3 text-sm font-medium text-gray-600">
              ⬇️ 条件渲染组件区域（打开 DevTools 检查 DOM）
            </p>

            <div> 计算结果: </div>
            {/* Bug 场景 1: 计算结果 */}
            {this.calculatedDays !== null && (
              <CalculatorResult
                title={this.calculatedTitle}
                days={this.calculatedDays}
                isAuthenticated={this.isAuthenticated}
                onSave={() => this.saveMemory()}
              />
            )}
            <div> 记忆列表: </div>
            {/* Bug 场景 2: 记忆列表 */}
            {this.memories.length > 0 && (
              <MemoryList
                memories={this.memories}
                onItemClick={id => this.handleMemoryClick(id)}
              />
            )}

            {/* Bug 场景 3: 警告消息 */}
            {this.showWarning && (
              <WarningMessage message={this.warningMessage} />
            )}
          </div>
        </div>

        {/* 说明代码 */}
        <div class="mt-6 overflow-x-auto rounded-lg bg-gray-900 p-4 text-gray-100">
          <pre class="text-xs">
            <code>{`// 条件渲染的关键代码：
{this.calculatedDays !== null && (
  <CalculatorResult
    title={this.calculatedTitle}
    days={this.calculatedDays}
    isAuthenticated={this.isAuthenticated}
    onSave={() => this.saveMemory()}
  />
)}

{this.memories.length > 0 && (
  <MemoryList
    memories={this.memories}
    onItemClick={this.handleMemoryClick}
  />
)}

{this.showWarning && (
  <WarningMessage message={this.warningMessage} />
)}

// 预期行为：
// - 条件为 false 时，组件不渲染（无 DOM 节点）
// - 条件为 true 时，渲染完整的组件 DOM
// - 组件顺序应该保持一致

// Bug 症状：
// - 可能会看到 <!--fukict:CalculatorResult#xx--> 注释节点
// - 可能会看到 <!--fukict:MemoryList#xx--> 注释节点
// - 注释节点顺序可能与预期不符
// - 注释节点没有被实际组件 DOM 替换`}</code>
          </pre>
        </div>
      </div>
    );
  }
}

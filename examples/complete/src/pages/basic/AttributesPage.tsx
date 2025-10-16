import { Fukict } from '@fukict/basic';
import { RouteComponent } from '@fukict/router';

import { CodeBlock } from '../../components/CodeBlock';
import { DemoBox } from '../../components/DemoBox';
import { SplitView } from '../../components/SplitView';

/**
 * 原生属性演示
 */
class NativeAttributesDemo extends Fukict {
  private inputValue = 'Hello Fukict';
  private placeholder = '请输入内容...';
  private isDisabled = false;
  private linkUrl = 'https://github.com/fukict/fukict';

  private handleInput = (e: Event) => {
    const target = e.target as HTMLInputElement;
    this.inputValue = target.value;
    this.update();
  };

  private toggleDisabled = () => {
    this.isDisabled = !this.isDisabled;
    this.update();
  };

  render() {
    return (
      <div class="space-y-4">
        {/* 基础输入属性 */}
        <div>
          <input
            type="text"
            class="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-200 disabled:text-gray-500"
            value={this.inputValue}
            placeholder={this.placeholder}
            disabled={this.isDisabled}
            on:input={this.handleInput}
          />
          <button
            class="mt-2 rounded bg-blue-500 px-3 py-1 text-xs text-white hover:bg-blue-600"
            on:click={this.toggleDisabled}
          >
            {this.isDisabled ? '启用输入' : '禁用输入'}
          </button>
        </div>

        {/* 链接属性 */}
        <div>
          <a
            href={this.linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            class="text-sm text-blue-600 underline hover:text-blue-800"
          >
            访问 GitHub (新窗口打开)
          </a>
        </div>

        {/* 图片属性 */}
        <div>
          <img
            src="https://avatars.githubusercontent.com/u/18474625"
            alt="示例图片"
            width={100}
            height={100}
            class="rounded border border-gray-300"
          />
          <p class="mt-2 text-xs text-gray-600">100x100 像素图片</p>
        </div>
      </div>
    );
  }
}

/**
 * Boolean 属性演示
 */
class BooleanAttributesDemo extends Fukict {
  private isChecked = true;
  private isDisabled = false;
  private isReadonly = false;
  private isRequired = true;
  private isMultiple = false;
  private textValue = '';

  private toggleCheck = () => {
    this.isChecked = !this.isChecked;
    this.update();
  };

  private toggleDisabled = () => {
    this.isDisabled = !this.isDisabled;
    this.update();
  };

  private toggleReadonly = () => {
    this.isReadonly = !this.isReadonly;
    this.update();
  };

  private toggleRequired = () => {
    this.isRequired = !this.isRequired;
    this.update();
  };

  private toggleMultiple = () => {
    this.isMultiple = !this.isMultiple;
    this.update();
  };

  render() {
    return (
      <div class="space-y-4">
        {/* Checkbox */}
        <div class="flex items-center space-x-2">
          <input
            type="checkbox"
            class="h-4 w-4"
            checked={this.isChecked}
            disabled={this.isDisabled}
            on:change={this.toggleCheck}
          />
          <span class="text-sm text-gray-700">
            复选框 {this.isChecked ? '(已选中)' : '(未选中)'}
          </span>
        </div>

        {/* Text Input */}
        <div>
          <input
            type="text"
            class="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="文本输入框"
            readOnly={this.isReadonly}
            required={this.isRequired}
            value={this.textValue}
            on:input={(e: Event) => {
              this.textValue = (e.target as HTMLInputElement).value;
              this.update();
            }}
          />
          <p class="mt-1 text-xs text-gray-600">
            只读: {this.isReadonly ? '是' : '否'}, 必填:{' '}
            {this.isRequired ? '是' : '否'}
          </p>
        </div>

        {/* Button */}
        <div>
          <button
            class="rounded bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-300"
            disabled={this.isDisabled}
          >
            提交按钮
          </button>
        </div>

        {/* Select */}
        <div>
          <select
            class="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            multiple={this.isMultiple}
            size={this.isMultiple ? 3 : 1}
          >
            <option>选项 1</option>
            <option>选项 2</option>
            <option>选项 3</option>
          </select>
          <p class="mt-1 text-xs text-gray-600">
            多选: {this.isMultiple ? '是' : '否'}
          </p>
        </div>

        {/* 控制按钮 */}
        <div class="space-x-2 border-t border-gray-200 pt-2">
          <button
            class="rounded bg-gray-500 px-3 py-1 text-xs text-white hover:bg-gray-600"
            on:click={this.toggleDisabled}
          >
            切换禁用
          </button>
          <button
            class="rounded bg-gray-500 px-3 py-1 text-xs text-white hover:bg-gray-600"
            on:click={this.toggleReadonly}
          >
            切换只读
          </button>
          <button
            class="rounded bg-gray-500 px-3 py-1 text-xs text-white hover:bg-gray-600"
            on:click={this.toggleRequired}
          >
            切换必填
          </button>
          <button
            class="rounded bg-gray-500 px-3 py-1 text-xs text-white hover:bg-gray-600"
            on:click={this.toggleMultiple}
          >
            切换多选
          </button>
        </div>
      </div>
    );
  }
}

/**
 * Data 属性演示
 */
class DataAttributesDemo extends Fukict {
  private users = [
    { id: '101', name: 'Alice', role: 'admin' },
    { id: '102', name: 'Bob', role: 'user' },
    { id: '103', name: 'Charlie', role: 'editor' },
  ];

  private selectedUser: { id: string; name: string; role: string } | null =
    null;

  private handleUserClick = (e: Event) => {
    const target = e.currentTarget as HTMLElement;
    const userId = target.dataset.userId;
    const userName = target.dataset.userName;
    const userRole = target.dataset.userRole;

    this.selectedUser = {
      id: userId || '',
      name: userName || '',
      role: userRole || '',
    };
    this.update();
  };

  render() {
    return (
      <div class="space-y-4">
        {/* 用户列表 */}
        <div class="space-y-2">
          {this.users.map(user => (
            <button
              class="w-full rounded bg-gray-100 px-4 py-2 text-left text-sm transition-colors hover:bg-gray-200"
              data-user-id={user.id}
              data-user-name={user.name}
              data-user-role={user.role}
              on:click={this.handleUserClick}
            >
              <span class="font-medium">{user.name}</span>
              <span class="ml-2 text-gray-500">({user.role})</span>
            </button>
          ))}
        </div>

        {/* 显示选中的用户 */}
        {this.selectedUser ? (
          <div class="rounded border border-blue-200 bg-blue-50 p-4">
            <h4 class="mb-2 text-sm font-medium text-blue-900">
              选中的用户信息:
            </h4>
            <div class="space-y-1 text-xs text-blue-800">
              <p>
                <span class="font-medium">ID:</span> {this.selectedUser.id}
              </p>
              <p>
                <span class="font-medium">姓名:</span> {this.selectedUser.name}
              </p>
              <p>
                <span class="font-medium">角色:</span> {this.selectedUser.role}
              </p>
            </div>
          </div>
        ) : (
          <div class="rounded border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
            点击上方按钮查看用户信息
          </div>
        )}
      </div>
    );
  }
}

/**
 * ARIA 属性演示
 */
class AriaAttributesDemo extends Fukict {
  private isExpanded = false;
  private hasError = false;
  private errorMessage = '';
  private inputValue = '';

  private toggleExpanded = () => {
    this.isExpanded = !this.isExpanded;
    this.update();
  };

  private handleValidation = (e: Event) => {
    const target = e.target as HTMLInputElement;
    this.inputValue = target.value;

    if (target.value.length < 3) {
      this.hasError = true;
      this.errorMessage = '输入内容至少需要 3 个字符';
    } else {
      this.hasError = false;
      this.errorMessage = '';
    }

    this.update();
  };

  render() {
    return (
      <div class="space-y-4">
        {/* 可展开区域 */}
        <div>
          <button
            class={[
              'rounded bg-blue-500 px-4 py-2 text-sm text-white',
              'hover:bg-blue-600',
            ]}
            aria-label="切换展开状态"
            aria-expanded={this.isExpanded}
            aria-controls="expandable-content"
            on:click={this.toggleExpanded}
          >
            {this.isExpanded ? '收起内容' : '展开内容'}
          </button>

          {this.isExpanded && (
            <div
              id="expandable-content"
              role="region"
              aria-labelledby="section-title"
              aria-live="polite"
              class="mt-3 rounded border border-gray-300 bg-gray-100 p-4"
            >
              <h4
                id="section-title"
                class="mb-2 text-sm font-medium text-gray-800"
              >
                展开的内容区域
              </h4>
              <p class="text-sm text-gray-700">
                这是一个使用 ARIA
                属性的可访问性内容区域。屏幕阅读器会正确识别这些属性。
              </p>
            </div>
          )}
        </div>

        {/* 表单验证 */}
        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700">
            带验证的输入框 <span class="text-red-500">*</span>
          </label>
          <input
            type="text"
            class={`w-full rounded border px-3 py-2 text-sm focus:ring-2 focus:outline-none ${
              this.hasError
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
            placeholder="至少输入 3 个字符"
            value={this.inputValue}
            aria-required="true"
            aria-invalid={this.hasError}
            aria-describedby="error-message"
            on:input={this.handleValidation}
          />
          {this.hasError && (
            <p
              id="error-message"
              role="alert"
              class="mt-1 text-xs text-red-600"
            >
              {this.errorMessage}
            </p>
          )}
        </div>

        {/* 信息提示 */}
        <div
          role="status"
          aria-live="polite"
          class="rounded border border-blue-200 bg-blue-50 p-3"
        >
          <p class="text-sm text-blue-800">
            当前输入长度: {this.inputValue.length} 字符
            {this.inputValue.length >= 3 && ' ✓'}
          </p>
        </div>
      </div>
    );
  }
}

/**
 * 属性绑定页面
 */
export class AttributesPage extends RouteComponent {
  render() {
    return (
      <div class="space-y-12">
        {/* 原生属性 */}
        <div class="space-y-4">
          <div>
            <h3 class="mb-1 text-base font-medium text-gray-800">原生属性</h3>
            <p class="text-sm leading-relaxed text-gray-600">
              绑定标准 HTML 属性，如 value, placeholder, href 等
            </p>
          </div>

          <SplitView leftTitle="代码示例" rightTitle="运行效果">
            <CodeBlock
              fukict:slot="code"
              code={`import { Fukict } from '@fukict/basic';

export class MyComponent extends Fukict {
  private inputValue = 'Hello';
  private placeholder = '请输入...';
  private isDisabled = false;

  render() {
    return (
      <div>
        {/* 基础属性 */}
        <input
          type="text"
          value={this.inputValue}
          placeholder={this.placeholder}
          disabled={this.isDisabled}
        />

        {/* 链接属性 */}
        <a href="/page" target="_blank" rel="noopener">
          链接
        </a>

        {/* 图片属性 */}
        <img
          src="/logo.png"
          alt="Logo"
          width={100}
          height={100}
        />
      </div>
    );
  }
}`}
            />
            <DemoBox fukict:slot="demo">
              <NativeAttributesDemo />
            </DemoBox>
          </SplitView>
        </div>

        {/* Boolean 属性 */}
        <div class="space-y-4">
          <div>
            <h3 class="mb-1 text-base font-medium text-gray-800">
              Boolean 属性
            </h3>
            <p class="text-sm leading-relaxed text-gray-600">
              处理布尔类型的 HTML 属性，如 checked, disabled, readonly 等
            </p>
          </div>

          <SplitView leftTitle="代码示例" rightTitle="运行效果">
            <CodeBlock
              fukict:slot="code"
              code={`import { Fukict } from '@fukict/basic';

export class FormComponent extends Fukict {
  private isChecked = true;
  private isDisabled = false;
  private isReadonly = false;
  private isRequired = true;

  render() {
    return (
      <div>
        {/* Checkbox */}
        <input
          type="checkbox"
          checked={this.isChecked}
          disabled={this.isDisabled}
        />

        {/* Input */}
        <input
          type="text"
          readonly={this.isReadonly}
          required={this.isRequired}
        />

        {/* Button */}
        <button disabled={this.isDisabled}>
          提交
        </button>

        {/* Select */}
        <select multiple={true}>
          <option>选项1</option>
          <option>选项2</option>
        </select>
      </div>
    );
  }
}`}
            />
            <DemoBox fukict:slot="demo">
              <BooleanAttributesDemo />
            </DemoBox>
          </SplitView>
        </div>

        {/* Data 属性 */}
        <div class="space-y-4">
          <div>
            <h3 class="mb-1 text-base font-medium text-gray-800">Data 属性</h3>
            <p class="text-sm leading-relaxed text-gray-600">
              使用 data-* 自定义属性在 DOM 元素上存储额外信息
            </p>
          </div>

          <SplitView leftTitle="代码示例" rightTitle="运行效果">
            <CodeBlock
              fukict:slot="code"
              code={`import { Fukict } from '@fukict/basic';

export class MyComponent extends Fukict {
  private userId = '123';
  private userName = 'Alice';

  private handleClick = (e: Event) => {
    const target = e.currentTarget as HTMLElement;
    const userId = target.dataset.userId;
    const userName = target.dataset.userName;
    console.log('User:', userId, userName);
  };

  render() {
    return (
      <div>
        {/* Data 属性 */}
        <button
          data-user-id={this.userId}
          data-user-name={this.userName}
          on:click={this.handleClick}
        >
          用户信息
        </button>

        {/* 多个 data 属性 */}
        <div
          data-type="card"
          data-status="active"
          data-index="0"
        >
          卡片
        </div>
      </div>
    );
  }
}`}
            />
            <DemoBox fukict:slot="demo">
              <DataAttributesDemo />
            </DemoBox>
          </SplitView>
        </div>

        {/* ARIA 属性 */}
        <div class="space-y-4">
          <div>
            <h3 class="mb-1 text-base font-medium text-gray-800">ARIA 属性</h3>
            <p class="text-sm leading-relaxed text-gray-600">
              提升无障碍访问性的 ARIA 属性，帮助屏幕阅读器理解页面结构
            </p>
          </div>

          <SplitView leftTitle="代码示例" rightTitle="运行效果">
            <CodeBlock
              fukict:slot="code"
              code={`import { Fukict } from '@fukict/basic';

export class AccessibleComponent extends Fukict {
  private isExpanded = false;
  private hasError = false;

  render() {
    return (
      <div>
        {/* 按钮 ARIA */}
        <button
          aria-label="关闭对话框"
          aria-expanded={this.isExpanded}
        >
          关闭
        </button>

        {/* 区域 ARIA */}
        <div
          role="region"
          aria-labelledby="section-title"
          aria-live="polite"
        >
          <h2 id="section-title">标题</h2>
          <p>内容</p>
        </div>

        {/* 表单 ARIA */}
        <input
          type="text"
          aria-required="true"
          aria-invalid={this.hasError}
          aria-describedby="error-message"
        />
      </div>
    );
  }
}`}
            />
            <DemoBox fukict:slot="demo">
              <AriaAttributesDemo />
            </DemoBox>
          </SplitView>
        </div>
      </div>
    );
  }
}

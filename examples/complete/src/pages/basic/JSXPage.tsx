import { Fukict } from '@fukict/basic';
import { RouteComponent } from '@fukict/router';

import { CodeBlock } from '../../components/CodeBlock';
import { DemoBox } from '../../components/DemoBox';
import { SplitView } from '../../components/SplitView';

/**
 * 基础语法演示
 */
class BasicSyntaxDemo extends Fukict {
  private name = 'World';
  private inputValue = 'Hello Fukict';

  render() {
    return (
      <div class="space-y-3 text-sm">
        <div>
          <span class="text-gray-600">表达式插值: </span>
          <span class="font-medium text-gray-900">Hello {this.name}</span>
        </div>
        <div>
          <input
            type="text"
            class="border border-gray-300 rounded px-3 py-2 w-full"
            value={this.inputValue}
          />
        </div>
        <div
          class="container p-3 bg-gray-50 rounded"
          style={{ color: 'red', fontWeight: 'bold' }}
        >
          样式绑定示例
        </div>
      </div>
    );
  }
}

/**
 * 条件渲染演示
 */
class ConditionalDemo extends Fukict {
  private isLoggedIn = false;
  private showMessage = true;
  private status: 'loading' | 'error' | 'success' = 'success';

  render() {
    return (
      <div class="space-y-3 text-sm">
        <div class="space-y-2">
          <label class="flex items-center gap-2">
            <input
              type="checkbox"
              checked={this.isLoggedIn}
              on:change={(e: Event) => {
                this.isLoggedIn = (e.target as HTMLInputElement).checked;
                this.update();
              }}
            />
            <span>已登录</span>
          </label>
          <div class="p-3 bg-gray-50 rounded">
            {this.isLoggedIn ? (
              <span class="text-green-600">欢迎回来!</span>
            ) : (
              <span class="text-gray-600">请登录</span>
            )}
          </div>
        </div>

        <div class="space-y-2">
          <label class="flex items-center gap-2">
            <input
              type="checkbox"
              checked={this.showMessage}
              on:change={(e: Event) => {
                this.showMessage = (e.target as HTMLInputElement).checked;
                this.update();
              }}
            />
            <span>显示消息</span>
          </label>
          <div class="p-3 bg-gray-50 rounded">
            {this.showMessage && (
              <span class="text-blue-600">这是一条消息</span>
            )}
          </div>
        </div>
      </div>
    );
  }
}

/**
 * 列表渲染演示
 */
class ListRenderDemo extends Fukict {
  private items = ['Apple', 'Banana', 'Cherry'];
  private users = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
    { id: 3, name: 'Charlie' },
  ];

  render() {
    return (
      <div class="space-y-4 text-sm">
        <div>
          <h4 class="font-medium text-gray-700 mb-2">简单列表:</h4>
          <ul class="list-disc list-inside space-y-1 text-gray-600">
            {this.items.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>

        <div>
          <h4 class="font-medium text-gray-700 mb-2">对象数组:</h4>
          <ul class="space-y-1">
            {this.users.map(user => (
              <li key={user.id} class="p-2 bg-gray-50 rounded text-gray-700">
                #{user.id} - {user.name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
}

/**
 * JSX 语法示例页面
 */
export class JSXPage extends RouteComponent {
  render() {
    return (
      <div class="space-y-12">
        {/* 基础语法 */}
        <div class="space-y-4">
          <div>
            <h3 class="text-base font-medium text-gray-800 mb-1">基础语法</h3>
            <p class="text-sm text-gray-600 leading-relaxed">
              JSX 的基本用法和语法规则
            </p>
          </div>

          <SplitView leftTitle="代码示例" rightTitle="运行效果">
            <CodeBlock
              fukict:slot="code"
              code={`// JSX 表达式插值
const name = 'World';
<div>Hello {name}</div>

// 属性绑定
<input type="text" value={inputValue} />

// Class 和 Style
<div class="container" style={{ color: 'red' }}>
  Content
</div>`}
            />
            <DemoBox fukict:slot="demo">
              <BasicSyntaxDemo />
            </DemoBox>
          </SplitView>
        </div>

        {/* 条件渲染 */}
        <div class="space-y-4">
          <div>
            <h3 class="text-base font-medium text-gray-800 mb-1">条件渲染</h3>
            <p class="text-sm text-gray-600 leading-relaxed">
              使用 if/else、三元运算符进行条件渲染
            </p>
          </div>

          <SplitView leftTitle="代码示例" rightTitle="运行效果">
            <CodeBlock
              fukict:slot="code"
              code={`// 三元运算符
{isLoggedIn ? <Dashboard /> : <Login />}

// && 短路运算
{showMessage && <Message />}

// if/else 语句
{(() => {
  if (status === 'loading') {
    return <Spinner />;
  } else if (status === 'error') {
    return <Error />;
  } else {
    return <Content />;
  }
})()}`}
            />
            <DemoBox fukict:slot="demo">
              <ConditionalDemo />
            </DemoBox>
          </SplitView>
        </div>

        {/* 列表渲染 */}
        <div class="space-y-4">
          <div>
            <h3 class="text-base font-medium text-gray-800 mb-1">列表渲染</h3>
            <p class="text-sm text-gray-600 leading-relaxed">
              使用数组映射渲染列表,key 属性的使用
            </p>
          </div>

          <SplitView leftTitle="代码示例" rightTitle="运行效果">
            <CodeBlock
              fukict:slot="code"
              code={`// 数组 map 渲染
const items = ['Apple', 'Banana', 'Cherry'];

<ul>
  {items.map((item, index) => (
    <li key={index}>{item}</li>
  ))}
</ul>

// 对象数组渲染
const users = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' }
];

<ul>
  {users.map(user => (
    <li key={user.id}>{user.name}</li>
  ))}
</ul>`}
            />
            <DemoBox fukict:slot="demo">
              <ListRenderDemo />
            </DemoBox>
          </SplitView>
        </div>
      </div>
    );
  }
}

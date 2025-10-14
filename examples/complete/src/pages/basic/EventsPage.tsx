import { Fukict } from '@fukict/basic';
import { RouteComponent } from '@fukict/router';

import { CodeBlock } from '../../components/CodeBlock';
import { DemoBox } from '../../components/DemoBox';
import { SplitView } from '../../components/SplitView';

/**
 * 原生事件演示
 */
class NativeEventsDemo extends Fukict {
  private clickCount = 0;
  private inputValue = '';

  private handleClick = () => {
    this.clickCount++;
    this.update();
  };

  private handleInput = (e: Event) => {
    const target = e.target as HTMLInputElement;
    this.inputValue = target.value;
    this.update();
  };

  render() {
    return (
      <div class="space-y-4">
        {/* Click 事件示例 */}
        <div>
          <button
            class="px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
            on:click={this.handleClick}
          >
            点击我
          </button>
          <p class="mt-2 text-sm text-gray-700">点击次数: {this.clickCount}</p>
        </div>

        {/* Input 事件示例 */}
        <div>
          <input
            type="text"
            class="px-3 py-2 border border-gray-300 rounded w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="输入文字..."
            value={this.inputValue}
            on:input={this.handleInput}
          />
          <p class="mt-2 text-sm text-gray-700">
            输入内容:{' '}
            <span class="font-medium">{this.inputValue || '(空)'}</span>
          </p>
        </div>
      </div>
    );
  }
}

/**
 * 事件对象演示
 */
class EventObjectDemo extends Fukict {
  private lastClickPos = { x: 0, y: 0 };
  private outerClicked = 0;
  private innerClicked = 0;

  render() {
    return (
      <div class="space-y-4">
        {/* 访问事件对象 */}
        <div>
          <button
            class="px-4 py-2 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors"
            on:click={(e: MouseEvent) => {
              this.lastClickPos = { x: e.clientX, y: e.clientY };
              this.update();
            }}
          >
            点击获取坐标
          </button>
          <p class="mt-2 text-sm text-gray-700">
            点击位置: ({this.lastClickPos.x}, {this.lastClickPos.y})
          </p>
        </div>

        {/* 阻止事件冒泡 */}
        <div
          class="p-4 bg-gray-100 rounded border border-gray-300"
          on:click={() => {
            this.outerClicked++;
            this.update();
          }}
        >
          <p class="text-sm text-gray-700 mb-2">
            外层点击次数: {this.outerClicked}
          </p>
          <button
            class="px-4 py-2 bg-purple-500 text-white text-sm rounded hover:bg-purple-600 transition-colors"
            on:click={(e: MouseEvent) => {
              e.stopPropagation();
              this.innerClicked++;
              this.update();
            }}
          >
            内层按钮 (阻止冒泡): {this.innerClicked}
          </button>
        </div>
      </div>
    );
  }
}

/**
 * 事件处理示例页面
 */
export class EventsPage extends RouteComponent {
  render() {
    return (
      <div class="space-y-12">
        {/* 原生事件 */}
        <div class="space-y-4">
          <div>
            <h3 class="text-base font-medium text-gray-800 mb-1">原生事件</h3>
            <p class="text-sm text-gray-600 leading-relaxed">
              使用 on:click, on:input 等处理原生 DOM 事件
            </p>
          </div>

          <SplitView leftTitle="代码示例" rightTitle="运行效果">
            <CodeBlock
              fukict:slot="code"
              code={`// 点击事件
<button on:click={() => console.log('Clicked')}>
  Click Me
</button>

// 输入事件
<input
  on:input={(e) => {
    const value = (e.target as HTMLInputElement).value;
    console.log(value);
  }}
/>

// 表单提交
<form on:submit={(e) => {
  e.preventDefault();
  handleSubmit();
}}>
  <button type="submit">Submit</button>
</form>

// 键盘事件
<input
  on:keydown={(e) => {
    if (e.key === 'Enter') {
      handleEnter();
    }
  }}
/>`}
            />
            <DemoBox fukict:slot="demo">
              <NativeEventsDemo />
            </DemoBox>
          </SplitView>
        </div>

        {/* 事件对象 */}
        <div class="space-y-4">
          <div>
            <h3 class="text-base font-medium text-gray-800 mb-1">事件对象</h3>
            <p class="text-sm text-gray-600 leading-relaxed">
              访问和使用事件对象参数
            </p>
          </div>

          <SplitView leftTitle="代码示例" rightTitle="运行效果">
            <CodeBlock
              fukict:slot="code"
              code={`// 访问事件对象
<button on:click={(e: MouseEvent) => {
  console.log('Button clicked at:', e.clientX, e.clientY);
  console.log('Target:', e.target);
  console.log('Current target:', e.currentTarget);
}}>
  Click Me
</button>

// 阻止默认行为
<a href="/page" on:click={(e) => {
  e.preventDefault();
  // 自定义导航逻辑
}}>
  Link
</a>

// 阻止事件冒泡
<div on:click={() => console.log('Outer')}>
  <button on:click={(e) => {
    e.stopPropagation();
    console.log('Inner');
  }}>
    Click
  </button>
</div>`}
            />
            <DemoBox fukict:slot="demo">
              <EventObjectDemo />
            </DemoBox>
          </SplitView>
        </div>
      </div>
    );
  }
}

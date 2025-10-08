import { RouteWidget } from '@fukict/router';
import { ExampleLayout, DemoCard } from '../../components/ExampleLayout';
import { Widget } from '@fukict/widget';

class RefDemo extends Widget {
  private inputElement: HTMLInputElement | null = null;
  private divElement: HTMLDivElement | null = null;

  render() {
    return (
      <div class="space-y-4">
        <div>
          <input
            type="text"
            placeholder="通过 ref 访问的输入框"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg"
            ref={(el) => {
              this.inputElement = el as HTMLInputElement;
            }}
          />
          <button
            on:click={() => this.focusInput()}
            class="mt-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            聚焦输入框
          </button>
          <button
            on:click={() => this.getInputValue()}
            class="mt-2 ml-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            获取值
          </button>
        </div>

        <div
          ref={(el) => {
            this.divElement = el as HTMLDivElement;
          }}
          class="p-4 bg-purple-100 rounded-lg"
        >
          <p>通过 ref 可以直接访问这个 div</p>
        </div>
        <button
          on:click={() => this.changeDivColor()}
          class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          改变 div 颜色
        </button>
      </div>
    );
  }

  private focusInput() {
    this.inputElement?.focus();
  }

  private getInputValue() {
    alert(`输入值: ${this.inputElement?.value || '(空)'}`);
  }

  private changeDivColor() {
    if (this.divElement) {
      const colors = ['bg-purple-100', 'bg-red-100', 'bg-green-100', 'bg-blue-100'];
      const currentColor = colors.find(c => this.divElement!.classList.contains(c)) || colors[0];
      const nextColor = colors[(colors.indexOf(currentColor) + 1) % colors.length];
      this.divElement.classList.remove(currentColor);
      this.divElement.classList.add(nextColor);
    }
  }
}

export default class extends RouteWidget {
  render() {
    return (
      <ExampleLayout
      title="06. Ref 引用"
      description="使用 ref 回调获取 DOM 元素的直接引用"
    >
      <DemoCard title="运行效果">
        <RefDemo />
      </DemoCard>
      </ExampleLayout>
    );
  }
}

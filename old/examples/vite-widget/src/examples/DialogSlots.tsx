import { Widget, type VNode } from '@fukict/widget';

class Header extends Widget<{ title: string }> {
  render(): VNode {
    return (
      <header class="dialog-header">
        <h3>{this.props.title}</h3>
      </header>
    );
  }
}

class Footer extends Widget<{}> {
  render(): VNode {
    return (
      <footer class="dialog-footer">
        <button>确定</button>
        <button>取消</button>
      </footer>
    );
  }
}

export class Dialog extends Widget<{ title: string }> {
  render(): VNode {
    return (
      <div class="dialog-example">
        <h2>Slots 演示: Dialog</h2>
        <div class="dialog">
          {/* 使用具名插槽 */}
          {this.slots.header || (
            <header class="dialog-header">
              <h3>{this.props.title}</h3>
            </header>
          )}

          {/* 默认插槽 */}
          <div class="dialog-body">{this.slots.default}</div>

          {/* 具名插槽 footer */}
          {this.slots.footer || (
            <footer class="dialog-footer">
              <button>确定</button>
            </footer>
          )}
        </div>
      </div>
    );
  }
}

// 导出子组件供外部使用
export { Header as DialogHeader, Footer as DialogFooter };

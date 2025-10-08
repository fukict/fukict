import { RouteWidget } from '@fukict/router';
import { ExampleLayout, DemoCard } from '../../components/ExampleLayout';
import { Widget } from '@fukict/widget';
import { updateDOM } from '@fukict/runtime';

class ConditionalDemo extends Widget {
  private showMessage = true;
  private loginStatus = 'guest';

  onMounted() {
    // 每2秒切换状态
    setInterval(() => {
      this.showMessage = !this.showMessage;
      this.forceUpdate();
    }, 2000);
  }

  render() {
    return (
      <div class="space-y-4">
        {/* 基础条件渲染 */}
        <div class="p-4 bg-blue-50 rounded">
          {this.showMessage && (
            <p class="text-blue-900">这条消息每2秒显示/隐藏</p>
          )}
          {!this.showMessage && (
            <p class="text-gray-400">消息已隐藏...</p>
          )}
        </div>

        {/* 三元表达式 */}
        <div class="p-4 bg-green-50 rounded">
          {this.loginStatus === 'loggedIn' ? (
            <p class="text-green-900">欢迎回来，用户！</p>
          ) : (
            <p class="text-gray-600">请先登录</p>
          )}
        </div>

        {/* 多条件判断 */}
        <div class="p-4 bg-purple-50 rounded">
          {this.loginStatus === 'admin' && <p>管理员权限</p>}
          {this.loginStatus === 'user' && <p>普通用户</p>}
          {this.loginStatus === 'guest' && <p>访客模式</p>}
        </div>
      </div>
    );
  }

  private forceUpdate() {
    if (!this.vnode || !this.root) return;
    const newVNode = this.render();
    updateDOM(this.vnode, newVNode, this.root);
    this.vnode = newVNode;
  }
}

export default class extends RouteWidget {
  render() {
    return (
      <ExampleLayout
      title="04. 条件渲染"
      description="使用 JavaScript 条件表达式控制元素的显示和隐藏"
    >
      <DemoCard title="运行效果">
        <ConditionalDemo />
      </DemoCard>
      </ExampleLayout>
    );
  }
}

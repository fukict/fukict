import { render } from '@fukict/runtime';

import { App } from './App';

// 使用 render 函数渲染应用
const container = document.getElementById('app');
if (container) {
  render(App(), { container });
}

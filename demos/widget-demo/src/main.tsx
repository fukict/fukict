import { render } from '@fukict/runtime';

import { App } from './App';

// import type { WidgeFuncInstance } from '@fukict/widget';

// 渲染主应用
const container = document.getElementById('app')!;
render(
  <App
  // onMounted={(instance: WidgeFuncInstance) => {
  //   console.log('instance', instance);
  // }}
  />,
  { container, replace: true },
);

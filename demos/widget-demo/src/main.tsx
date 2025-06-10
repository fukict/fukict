import { App } from './App';
import { render } from '@vanilla-dom/core';

// import type { WidgeFuncInstance } from '@vanilla-dom/widget';

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

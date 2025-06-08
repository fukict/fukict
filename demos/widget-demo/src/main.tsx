import { App } from './App';
import { render } from '@vanilla-dom/core';

// import type { SimpleWidgetInstance } from '@vanilla-dom/widget';

// 渲染主应用
const container = document.getElementById('app')!;
render(
  <App
  // onMounted={(instance: SimpleWidgetInstance) => {
  //   console.log('instance', instance);
  // }}
  />,
  { container, replace: true },
);

import { attach } from '@fukict/basic';

import { App } from './App';
import { routes } from './routes';
import { sidebarStore } from './stores/sidebarStore';

import './index.css';

// 初始化侧边栏数据
sidebarStore.actions.init(routes);

const root = document.getElementById('app');
if (root) {
  const timeStart = performance.now();

  attach(<App />, root);

  requestAnimationFrame(() => {
    const timeEnd = performance.now();

    console.log(`App rendered in ${timeEnd - timeStart}ms`);
  });
}

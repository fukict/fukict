import { createRouter } from '@fukict/router';
import { App } from './App';
import { routes } from './config/routes';
import './styles/index.css';

// 创建路由实例
const router = createRouter({
  routes,
  mode: 'hash',
});

// 创建应用实例并挂载（由 Router 驱动内容渲染）
const app = new App({ router });
app.mount(document.getElementById('app')!, true);

// 启动路由系统
router.start();

console.log('%c⚡ Fukict Comprehensive Demo', 'color: #667eea; font-size: 24px; font-weight: bold;');
console.log('%cExplore all examples from the sidebar →', 'color: #666; font-size: 14px;');

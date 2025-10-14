import { Fukict } from '@fukict/basic';
import { RouterProvider } from '@fukict/router';

import { routes } from './routes';

/**
 * App 组件
 * 初始化路由系统
 */
export class App extends Fukict {
  render() {
    return (
      <RouterProvider
        mode="history"
        routes={routes}
        beforeEach={(to, from, next) => {
          // 更新页面标题
          if (to.meta?.title) {
            document.title = `${to.meta.title} | Fukict Complete`;
          }
          console.log('Navigation:', from.path, '->', to.path);
          next();
        }}
      />
    );
  }
}

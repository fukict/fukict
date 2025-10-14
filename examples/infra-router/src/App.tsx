import { Fukict } from '@fukict/basic';
import { RouterProvider } from '@fukict/router';

import { routes } from './routes';

/**
 * App 组件
 *
 * 简化为只包含 Router 创建和 RouterView
 * 所有 UI（Header、Footer）都移到 LayoutPage 中
 */
export class App extends Fukict {
  constructor(props: any) {
    super(props);
  }

  render() {
    return (
      <RouterProvider
        mode="history"
        routes={routes}
        beforeEach={(to, from, next) => {
          console.log('Global beforeEach:', from.path, '->', to.path);
          // 更新页面标题
          if (to.meta.title) {
            document.title = `${to.meta.title} | Fukict Router`;
          }
          next();
        }}
        afterEach={(to, from) => {
          console.log('Global afterEach:', from.path, '->', to.path);
        }}
      />
    );
  }
}

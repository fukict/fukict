import { Fukict, type VNode, h } from '@fukict/basic';

import { Router } from './Router';
import type { LinkProps } from './types';

/**
 * Link 组件
 *
 * 路由导航链接组件
 */
export class Link extends Fukict<LinkProps> {
  /**
   * 获取 Router 实例
   */
  private getRouter(): Router | null {
    return Router.getInstance();
  }

  /**
   * 构建完整路径
   */
  private buildPath(): string {
    const { to } = this.props;

    if (typeof to === 'string') {
      return to;
    }

    const router = this.getRouter();
    if (!router) {
      return '/';
    }

    let path = to.path || router.currentRoute.path;

    // 添加查询参数
    if (to.query) {
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(to.query)) {
        params.append(key, value);
      }
      const queryString = params.toString();
      if (queryString) {
        path += '?' + queryString;
      }
    }

    // 添加 hash
    if (to.hash) {
      path += to.hash;
    }

    return path;
  }

  /**
   * 构建 href 属性（根据路由模式）
   */
  private buildHref(): string {
    const path = this.buildPath();
    const router = this.getRouter();

    if (!router) {
      return path;
    }

    // 获取路由模式（通过 router 的 history 实例判断）
    // @ts-ignore - 访问私有属性
    const history = router.history;

    // 如果是 HashHistory，则在路径前加 #
    if (history && history.constructor.name === 'HashHistory') {
      return `#${path}`;
    }

    // history 模式直接返回路径
    return path;
  }

  /**
   * 检查路径是否激活
   */
  private isActive(): boolean {
    const router = this.getRouter();
    if (!router) {
      return false;
    }

    const targetPath = this.buildPath();
    const currentPath = router.currentRoute.path;

    // 简单的路径匹配（可以优化为更精确的匹配）
    return currentPath.startsWith(targetPath);
  }

  /**
   * 检查路径是否精确激活
   */
  private isExactActive(): boolean {
    const router = this.getRouter();
    if (!router) {
      return false;
    }

    const targetPath = this.buildPath();
    const currentPath = router.currentRoute.path;

    return currentPath === targetPath;
  }

  /**
   * 处理点击事件
   */
  private handleClick = (e: Event): void => {
    // 阻止默认行为
    e.preventDefault();

    const router = this.getRouter();
    if (!router) {
      return;
    }

    const { to, replace } = this.props;

    // 导航
    if (replace) {
      router.replace(to);
    } else {
      router.push(to);
    }
  };

  /**
   * 渲染方法
   */
  render(): VNode {
    const {
      activeClass = 'router-link-active',
      exactActiveClass = 'router-link-exact-active',
    } = this.props;

    const href = this.buildHref();
    const isActive = this.isActive();
    const isExactActive = this.isExactActive();

    // 构建 class 列表
    const classes: string[] = ['router-link'];

    if (this.props.class) {
      classes.push(this.props.class);
    }

    if (isActive) {
      classes.push(activeClass);
    }

    if (isExactActive) {
      classes.push(exactActiveClass);
    }

    return h(
      'a',
      {
        href,
        class: classes.join(' '),
        'on:click': this.handleClick,
      },
      Array.isArray(this.$slots.default)
        ? this.$slots.default
        : this.$slots.default
          ? [this.$slots.default]
          : [],
    );
  }
}

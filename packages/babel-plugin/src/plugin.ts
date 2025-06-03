import type { BabelPluginState, PluginOptions } from './types.js';
import {
  convertJSXAttributes,
  convertJSXChildren,
  createRuntimeImport,
  getJSXElementName,
  isBuiltinElement,
  isJSXElement,
  isJSXFragment,
} from './utils.js';
import type { PluginObj, types as t } from '@babel/core';

/**
 * @vanilla-dom/babel-plugin
 *
 * 将 JSX 转换为 @vanilla-dom/core 的节点树结构调用
 *
 * 转换规则：
 * <div className="test">Hello</div>
 * ↓
 * jsx("div", { className: "test" }, "Hello")
 *
 * <MyComponent prop={value}>
 *   <span>child</span>
 * </MyComponent>
 * ↓
 * jsx(MyComponent, { prop: value }, jsx("span", null, "child"))
 */
export default function vanillaDomPlugin({
  types: t,
}: {
  types: any;
}): PluginObj<BabelPluginState> {
  return {
    name: '@vanilla-dom/babel-plugin',

    visitor: {
      Program: {
        enter(path: any, state: BabelPluginState) {
          // 初始化状态
          state.runtimeImportAdded = false;
          state.filename = state.filename || 'unknown';
        },

        exit(path: any, state: BabelPluginState) {
          // 如果使用了 JSX 但没有导入运行时，则自动添加导入
          if (state.runtimeImportAdded) {
            const importSource = state.opts.importSource || '@vanilla-dom/core';
            // 使用传入的 babel types
            const importNode = createRuntimeImport(importSource, t);
            path.node.body.unshift(importNode);
          }
        },
      },

      JSXElement(path: any, state: BabelPluginState) {
        const { node } = path;

        // 标记需要添加运行时导入
        if (!state.runtimeImportAdded) {
          state.runtimeImportAdded = true;
        }

        // 获取标签名
        const tagName = getJSXElementName(node);

        // 确定第一个参数：标签名或组件引用
        let firstArg: any;
        if (isBuiltinElement(tagName)) {
          // 内置元素使用字符串
          firstArg = t.stringLiteral(tagName);
        } else {
          // 自定义组件使用标识符引用
          firstArg = t.identifier(tagName);
        }

        // 转换属性，分离普通属性和事件
        const { props, events } = convertJSXAttributes(
          node.openingElement.attributes,
          t,
        );
        const propsArg = props.properties.length > 0 ? props : t.nullLiteral();
        const eventsArg = events;

        // 转换子元素 - 过滤掉 JSXSpreadChild
        const filteredChildren = node.children.filter(
          (child: any) => child.type !== 'JSXSpreadChild',
        );
        const children = convertJSXChildren(filteredChildren, t);

        // 创建 hyperscript() 调用，传入属性、事件和子元素
        const jsxCall = t.callExpression(t.identifier('hyperscript'), [
          firstArg,
          propsArg,
          eventsArg,
          ...children,
        ]);

        // 替换 JSX 元素
        path.replaceWith(jsxCall);
      },

      JSXFragment(path: any, state: BabelPluginState) {
        const { node } = path;

        // 标记需要添加运行时导入
        if (!state.runtimeImportAdded) {
          state.runtimeImportAdded = true;
        }

        // 转换子元素 - 过滤掉 JSXSpreadChild
        const filteredChildren = node.children.filter(
          (child: any) => child.type !== 'JSXSpreadChild',
        );
        const children = convertJSXChildren(filteredChildren, t);

        // 创建 hyperscript(Fragment, null, null, ...children) 调用
        const fragmentCall = t.callExpression(t.identifier('hyperscript'), [
          t.identifier('Fragment'),
          t.nullLiteral(),
          t.nullLiteral(),
          ...children,
        ]);

        // 替换 JSX Fragment
        path.replaceWith(fragmentCall);
      },
    },
  };
}

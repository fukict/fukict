import type { PluginObj } from '@babel/core';

import type { BabelPluginState } from './types.js';
import {
  convertJSXAttributes,
  convertJSXChildren,
  createRuntimeImport,
  getJSXElementName,
  isBuiltinElement,
} from './utils.js';

/**
 * @fukict/babel-plugin
 *
 * 将 JSX 转换为 @fukict/runtime 的节点树结构调用
 * 组件注册交由运行时处理
 *
 * 转换规则：
 * <div className="test">Hello</div>
 * ↓
 * hyperscript("div", { className: "test" }, null, "Hello")
 *
 * <MyComponent prop={value}>
 *   <span>child</span>
 * </MyComponent>
 * ↓
 * hyperscript(MyComponent, { prop: value }, null, hyperscript("span", null, null, "child"))
 */
export default function fukictBabelPlugin({
  types,
}: {
  types: any;
}): PluginObj<BabelPluginState> {
  return {
    name: '@fukict/babel-plugin',

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
            const importSource = state.opts.importSource || '@fukict/runtime';
            const importNode = createRuntimeImport(importSource, types);
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

        // 检查是否是内置元素
        if (isBuiltinElement(tagName)) {
          // 处理内置元素
          handleBuiltinElement(path, state, types);
          return;
        }

        // 处理普通的自定义组件（组件注册交由运行时处理）
        handleCustomComponent(path, state, types);
      },

      JSXFragment(path: any, state: BabelPluginState) {
        const { node } = path;

        // 标记需要添加运行时导入
        if (!state.runtimeImportAdded) {
          state.runtimeImportAdded = true;
        }

        // 转换子元素
        const filteredChildren = node.children.filter(
          (child: any) => child.type !== 'JSXSpreadChild',
        );
        const children = convertJSXChildren(filteredChildren, types);

        // 创建 hyperscript(Fragment, null, null, ...children) 调用
        const fragmentCall = types.callExpression(
          types.identifier('hyperscript'),
          [
            types.identifier('Fragment'),
            types.nullLiteral(),
            types.nullLiteral(),
            ...children,
          ],
        );

        path.replaceWith(fragmentCall);
      },
    },
  };
}

// 处理内置元素
function handleBuiltinElement(path: any, state: BabelPluginState, t: any) {
  const { node } = path;
  const tagName = getJSXElementName(node);

  const firstArg = t.stringLiteral(tagName);
  const { props, events } = convertJSXAttributes(
    node.openingElement.attributes,
    t,
  );
  const propsArg = props.properties.length > 0 ? props : t.nullLiteral();
  const eventsArg = events;

  const filteredChildren = node.children.filter(
    (child: any) => child.type !== 'JSXSpreadChild',
  );
  const children = convertJSXChildren(filteredChildren, t);

  const jsxCall = t.callExpression(t.identifier('hyperscript'), [
    firstArg,
    propsArg,
    eventsArg,
    ...children,
  ]);

  path.replaceWith(jsxCall);
}

// 处理普通的自定义组件
function handleCustomComponent(path: any, state: BabelPluginState, t: any) {
  const { node } = path;
  const tagName = getJSXElementName(node);

  const firstArg = t.identifier(tagName);
  const { props, events } = convertJSXAttributes(
    node.openingElement.attributes,
    t,
  );
  const propsArg = props.properties.length > 0 ? props : t.nullLiteral();
  const eventsArg = events;

  const filteredChildren = node.children.filter(
    (child: any) => child.type !== 'JSXSpreadChild',
  );
  const children = convertJSXChildren(filteredChildren, t);

  const jsxCall = t.callExpression(t.identifier('hyperscript'), [
    firstArg,
    propsArg,
    eventsArg,
    ...children,
  ]);

  path.replaceWith(jsxCall);
}

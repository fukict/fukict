import { transformToRegisteredComponent } from './component-detection.js';
import type { BabelPluginState } from './types.js';
import {
  convertJSXAttributes,
  convertJSXChildren,
  createRuntimeImport,
  getJSXElementName,
  isBuiltinElement,
} from './utils.js';
import type { PluginObj } from '@babel/core';

/**
 * @vanilla-dom/babel-plugin
 *
 * 将 JSX 转换为 @vanilla-dom/core 的节点树结构调用
 * 支持自动识别带有 __COMPONENT_TYPE__ 标志的组件
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
 *
 * <TodoList todos={myTodos} onMount={instance => this.todoList = instance} />
 * ↓
 * hyperscript("__registered_component__", { component: TodoList, componentProps: { todos: myTodos }, onMount: ... })
 */
export default function vanillaDomPlugin({
  types,
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
          state.componentDetectionCache = new Map();
        },

        exit(path: any, state: BabelPluginState) {
          // 如果使用了 JSX 但没有导入运行时，则自动添加导入
          if (state.runtimeImportAdded) {
            const importSource = state.opts.importSource || '@vanilla-dom/core';
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

        // 检查是否启用组件注册
        if (state.opts.enableComponentRegistry !== false) {
          // 检查是否是注册的组件
          const isRegistered = checkRegisteredComponent(
            tagName,
            path,
            state,
            types,
          );

          if (isRegistered) {
            // 处理注册的组件
            handleRegisteredComponent(path, state, types, tagName);
            return;
          }
        }

        // 处理普通的自定义组件
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
        const fragmentCall = types.callExpression(types.identifier('hyperscript'), [
          types.identifier('Fragment'),
          types.nullLiteral(),
          types.nullLiteral(),
          ...children,
        ]);

        path.replaceWith(fragmentCall);
      },
    },
  };
}

// 检查是否是注册的组件 - 自动检测 __COMPONENT_TYPE__ 标志
function checkRegisteredComponent(
  tagName: string,
  path: any,
  state: BabelPluginState,
  t: any,
): boolean {
  // 先检查缓存
  const cacheKey = `${tagName}_component_info`;
  if (state.componentDetectionCache?.has(cacheKey)) {
    const cached = state.componentDetectionCache.get(cacheKey);
    return Boolean(cached);
  }

  // 查找组件定义
  const componentBinding = path.scope.getBinding(tagName);

  if (!componentBinding) {
    state.componentDetectionCache?.set(cacheKey, false);
    return false;
  }

  const componentNode = componentBinding.path.node;
  let hasComponentType = false;

  // 检测类组件的 __COMPONENT_TYPE__ 标志
  if (t.isClassDeclaration(componentNode)) {
    hasComponentType = checkClassForComponentType(
      componentNode,
      componentBinding.path,
      t,
    );
  }

  // 检测函数组件的 __COMPONENT_TYPE__ 标志
  else if (t.isVariableDeclarator(componentNode)) {
    const init = componentNode.init;

    // 检查函数声明后是否设置了 __COMPONENT_TYPE__
    if (t.isFunctionExpression(init) || t.isArrowFunctionExpression(init)) {
      const parentPath = componentBinding.path.parentPath;
      if (parentPath && t.isVariableDeclaration(parentPath.node)) {
        const nextSibling = parentPath.getNextSibling();
        if (nextSibling && t.isExpressionStatement(nextSibling.node)) {
          const expr = nextSibling.node.expression;
          if (
            t.isAssignmentExpression(expr) &&
            t.isMemberExpression(expr.left) &&
            t.isIdentifier(expr.left.object) &&
            expr.left.object.name === tagName &&
            t.isIdentifier(expr.left.property) &&
            expr.left.property.name === '__COMPONENT_TYPE__' &&
            t.isStringLiteral(expr.right)
          ) {
            hasComponentType = true;
          }
        }
      }
    }

    // 检查是否是函数调用的结果（工厂函数）
    else if (t.isCallExpression(init)) {
      // 对于工厂函数，我们假设如果导入源包含关键词，则可能是组件
      // 这是一个启发式检测，运行时会有更准确的检测
      const callee = init.callee;
      if (t.isIdentifier(callee)) {
        const calleeBinding = componentBinding.path.scope.getBinding(
          callee.name,
        );
        if (
          calleeBinding &&
          (t.isImportDefaultSpecifier(calleeBinding.path.node) ||
            t.isImportSpecifier(calleeBinding.path.node))
        ) {
          const importDeclaration = calleeBinding.path.parent;
          if (
            t.isImportDeclaration(importDeclaration) &&
            t.isStringLiteral(importDeclaration.source)
          ) {
            const importSource = importDeclaration.source.value;
            // 启发式检测：如果导入源包含组件相关关键词
            if (
              importSource.includes('widget') ||
              importSource.includes('component') ||
              callee.name.toLowerCase().includes('create')
            ) {
              hasComponentType = true;
            }
          }
        }
      }
    }
  }

  // 缓存结果
  state.componentDetectionCache?.set(cacheKey, hasComponentType);
  return hasComponentType;
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

// 处理注册的组件
function handleRegisteredComponent(
  path: any,
  state: BabelPluginState,
  t: any,
  tagName: string,
) {
  const { node } = path;

  // 使用统一的注册组件标识符
  const transformTarget =
    state.opts.transformTarget || '__registered_component__';

  // 转换为注册组件调用
  const transformed = transformToRegisteredComponent(
    tagName,
    node.openingElement.attributes,
    node.children,
    transformTarget,
    t,
  );

  path.replaceWith(transformed);
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
function checkClassForComponentType(
  classNode: any,
  bindingPath: any,
  t: any,
): boolean {
  const hasOwnComponentType = classNode.body.body.some((member: any) => {
    return (
      t.isClassProperty(member) &&
      t.isIdentifier(member.key) &&
      member.key.name === '__COMPONENT_TYPE__' &&
      member.static === true &&
      t.isStringLiteral(member.value)
    );
  });
  if (hasOwnComponentType) {
    return true;
  }
  if (classNode.superClass && t.isIdentifier(classNode.superClass)) {
    const superClassName = classNode.superClass.name;
    const superClassBinding = bindingPath.scope.getBinding(superClassName);
    if (
      superClassBinding &&
      superClassBinding.path &&
      superClassBinding.path.node
    ) {
      const superClassNode = superClassBinding.path.node;
      if (t.isClassDeclaration(superClassNode)) {
        return checkClassForComponentType(
          superClassNode,
          superClassBinding.path,
          t,
        );
      }
      if (
        t.isImportDefaultSpecifier(superClassBinding.path.node) ||
        t.isImportSpecifier(superClassBinding.path.node)
      ) {
        const importDeclaration = superClassBinding.path.parent;
        if (
          t.isImportDeclaration(importDeclaration) &&
          t.isStringLiteral(importDeclaration.source)
        ) {
          const importSource = importDeclaration.source.value;
          if (
            importSource.includes('widget') ||
            importSource.includes('component')
          ) {
            return true;
          }
        }
      }
    }
  }
  return false;
}

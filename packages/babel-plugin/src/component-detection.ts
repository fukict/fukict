/**
 * @vanilla-dom/babel-plugin - 组件检测模块
 *
 * 编译时的组件标志识别逻辑 - 通用检测工具函数
 */
import type { types as t } from '@babel/core';

// 通用检测工具函数 - 可以被配置中的检测器使用

// 检测是否继承指定基类
export function extendsClass(
  node: t.Node,
  className: string,
  t: typeof import('@babel/types'),
): boolean {
  if (t.isClassDeclaration(node) && node.superClass) {
    return (
      t.isIdentifier(node.superClass) && node.superClass.name === className
    );
  }
  return false;
}

// 检测是否有静态的 __COMPONENT_TYPE__ 属性
export function hasStaticComponentType(
  node: t.Node,
  expectedType: string,
  t: typeof import('@babel/types'),
): boolean {
  if (t.isClassDeclaration(node)) {
    return node.body.body.some(member => {
      if (
        t.isClassProperty(member) &&
        t.isIdentifier(member.key) &&
        member.key.name === '__COMPONENT_TYPE__' &&
        member.static === true
      ) {
        return (
          t.isStringLiteral(member.value) && member.value.value === expectedType
        );
      }
      return false;
    });
  }
  return false;
}

// 检测是否是指定函数调用
export function isFunctionCall(
  node: t.Node,
  functionName: string,
  t: typeof import('@babel/types'),
): boolean {
  if (t.isVariableDeclarator(node)) {
    const init = node.init;
    if (
      t.isCallExpression(init) &&
      t.isIdentifier(init.callee) &&
      init.callee.name === functionName
    ) {
      return true;
    }
  }
  return false;
}

// 检测是否有指定装饰器
export function hasDecorator(
  node: t.Node,
  decoratorName: string,
  t: typeof import('@babel/types'),
): boolean {
  if (t.isClassDeclaration(node) && node.decorators) {
    return node.decorators.some(decorator => {
      if (
        t.isDecorator(decorator) &&
        t.isCallExpression(decorator.expression)
      ) {
        return (
          t.isIdentifier(decorator.expression.callee) &&
          decorator.expression.callee.name === decoratorName
        );
      }
      if (t.isDecorator(decorator) && t.isIdentifier(decorator.expression)) {
        return decorator.expression.name === decoratorName;
      }
      return false;
    });
  }
  return false;
}

// 创建通用的检测器工厂
export function createDetector(
  name: string,
  detectFn: (node: t.Node, t: typeof import('@babel/types')) => boolean,
  transformTarget?: string,
) {
  return {
    name,
    detect: detectFn,
    transformTarget,
  };
}

// 主要的组件检测函数 - 现在完全基于配置
export function detectComponentType(
  componentNode: t.Node,
  detectorConfigs: Array<{
    name: string;
    detect: (node: t.Node, t: any) => boolean;
    transformTarget?: string;
  }>,
  t: typeof import('@babel/types'),
): { type: string; transformTarget?: string } | null {
  // 遍历配置中的检测器
  for (const detector of detectorConfigs) {
    if (detector.detect(componentNode, t)) {
      return {
        type: detector.name,
        transformTarget: detector.transformTarget,
      };
    }
  }

  return null;
}

// 创建注册组件的 JSX 转换
export function transformToRegisteredComponent(
  elementName: string,
  attributes: t.JSXAttribute[],
  children: (
    | t.JSXElement
    | t.JSXFragment
    | t.JSXText
    | t.JSXExpressionContainer
  )[],
  transformTarget: string = '__registered_component__',
  t: typeof import('@babel/types'),
): t.CallExpression {
  // 分离 onMount 属性
  const onMountAttribute = attributes.find(
    attr =>
      t.isJSXAttribute(attr) &&
      t.isJSXIdentifier(attr.name) &&
      attr.name.name === 'onMount',
  );

  const otherAttributes = attributes.filter(attr => attr !== onMountAttribute);

  // 生成 props 对象
  const propsProperties: t.ObjectProperty[] = [];

  for (const attr of otherAttributes) {
    if (t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name)) {
      let value: t.Expression;

      if (attr.value === null) {
        // 布尔属性: <Component enabled />
        value = t.booleanLiteral(true);
      } else if (t.isStringLiteral(attr.value)) {
        // 字符串属性: <Component title="hello" />
        value = attr.value;
      } else if (
        t.isJSXExpressionContainer(attr.value) &&
        !t.isJSXEmptyExpression(attr.value.expression)
      ) {
        // 表达式属性: <Component count={5} />
        value = attr.value.expression;
      } else {
        continue; // 跳过无效的属性
      }

      propsProperties.push(
        t.objectProperty(t.identifier(attr.name.name), value),
      );
    }
  }

  const componentPropsObject = t.objectExpression(propsProperties);

  // 构建 VNode 的 props 对象
  const vnodePropsProperties: t.ObjectProperty[] = [
    t.objectProperty(t.identifier('component'), t.identifier(elementName)),
    t.objectProperty(t.identifier('componentProps'), componentPropsObject),
  ];

  // 添加 onMount 回调
  if (onMountAttribute && onMountAttribute.value) {
    if (
      t.isJSXExpressionContainer(onMountAttribute.value) &&
      !t.isJSXEmptyExpression(onMountAttribute.value.expression)
    ) {
      vnodePropsProperties.push(
        t.objectProperty(
          t.identifier('onMount'),
          onMountAttribute.value.expression,
        ),
      );
    }
  }

  const vnodePropsObject = t.objectExpression(vnodePropsProperties);

  // 处理子元素
  const processedChildren = children
    .filter(child => !t.isJSXText(child) || child.value.trim() !== '')
    .map(child => {
      if (t.isJSXText(child)) {
        return t.stringLiteral(child.value);
      } else if (
        t.isJSXExpressionContainer(child) &&
        !t.isJSXEmptyExpression(child.expression)
      ) {
        return child.expression;
      } else if (t.isJSXElement(child) || t.isJSXFragment(child)) {
        // 子 JSX 元素会在其他地方处理
        return child as any;
      }
      return null;
    })
    .filter((child): child is t.Expression => child !== null);

  // 创建 hyperscript 调用
  return t.callExpression(t.identifier('hyperscript'), [
    t.stringLiteral(transformTarget),
    vnodePropsObject,
    t.nullLiteral(), // events 参数
    ...processedChildren,
  ]);
}

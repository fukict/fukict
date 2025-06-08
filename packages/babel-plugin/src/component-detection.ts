/**
 * @vanilla-dom/babel-plugin - 组件检测模块
 *
 * 编译时的组件标志识别逻辑 - 通用检测工具函数
 */
import type * as t from '@babel/types';

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
  if (t.isClassDeclaration(node) && node.body) {
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

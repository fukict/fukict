import type { types as t } from '@babel/core';

/**
 * 检查是否为 JSX 元素
 */
export function isJSXElement(node: t.Node): node is t.JSXElement {
  return node.type === 'JSXElement';
}

/**
 * 检查是否为 JSX Fragment
 */
export function isJSXFragment(node: t.Node): node is t.JSXFragment {
  return node.type === 'JSXFragment';
}

/**
 * 获取 JSX 元素的标签名
 */
export function getJSXElementName(node: t.JSXElement): string {
  const name = node.openingElement.name;
  if (name.type === 'JSXIdentifier') {
    return name.name;
  }
  if (name.type === 'JSXMemberExpression') {
    // 处理 Namespace.Component 形式
    return `${getJSXMemberName(name)}`;
  }
  return 'UnknownComponent';
}

/**
 * 获取 JSX 成员表达式名称
 */
function getJSXMemberName(node: t.JSXMemberExpression): string {
  const object = node.object;
  const property = node.property;

  if (object.type === 'JSXIdentifier' && property.type === 'JSXIdentifier') {
    return `${object.name}.${property.name}`;
  }
  if (
    object.type === 'JSXMemberExpression' &&
    property.type === 'JSXIdentifier'
  ) {
    return `${getJSXMemberName(object)}.${property.name}`;
  }
  return 'UnknownMember';
}

/**
 * 将 JSX 属性转换为对象属性，分离普通属性和事件监听器
 */
export function convertJSXAttributes(
  attributes: Array<any>,
  t: typeof import('@babel/types'),
): { props: any; events: any } {
  const properties: Array<any> = [];
  const eventProperties: Array<any> = [];

  for (const attr of attributes) {
    if (attr.type === 'JSXAttribute') {
      let key: string;
      if (attr.name.type === 'JSXIdentifier') {
        key = attr.name.name;
      } else if (attr.name.type === 'JSXNamespacedName') {
        // 处理 on:click 这种格式
        key = `${attr.name.namespace.name}:${attr.name.name.name}`;
      } else {
        key = (attr.name as any).name || 'unknown';
      }
      let value: any;

      if (attr.value === null || attr.value === undefined) {
        // 布尔属性：<div disabled /> -> { disabled: true }
        value = t.booleanLiteral(true);
      } else if (attr.value.type === 'StringLiteral') {
        value = attr.value;
      } else if (attr.value.type === 'JSXExpressionContainer') {
        value = (attr.value as any).expression;
      } else {
        value = t.nullLiteral();
      }

      // 检查是否为事件监听器（on:click, on:change 等）
      // 确保 key 是字符串
      if (typeof key === 'string' && key.startsWith('on:')) {
        const eventName = key.slice(3); // 移除 'on:' 前缀
        eventProperties.push(
          t.objectProperty(t.stringLiteral(eventName), value),
        );
      } else {
        properties.push(
          t.objectProperty(
            typeof key === 'string' ? t.stringLiteral(key) : t.identifier(key),
            value,
          ),
        );
      }
    } else if (attr.type === 'JSXSpreadAttribute') {
      // 展开属性：<div {...props} />
      // 注意：展开属性只能用于普通属性，不能用于事件
      properties.push(t.spreadElement(attr.argument));
    }
  }

  return {
    props: t.objectExpression(properties),
    events:
      eventProperties.length > 0
        ? t.objectExpression(eventProperties)
        : t.nullLiteral(),
  };
}

/**
 * 转换 JSX 子元素
 */
export function convertJSXChildren(
  children: Array<any>,
  t: typeof import('@babel/types'),
): any[] {
  const result: any[] = [];

  for (const child of children) {
    if (child.type === 'JSXText') {
      const text = child.value.trim();
      if (text) {
        result.push(t.stringLiteral(text));
      }
    } else if (child.type === 'JSXExpressionContainer') {
      const expression = child.expression;
      if (expression.type !== 'JSXEmptyExpression') {
        result.push(expression as t.Expression);
      }
    } else {
      // JSXElement 或 JSXFragment 会被其他地方处理
      // 这里先占位，实际转换会在访问器中处理
      result.push(child as any);
    }
  }

  return result;
}

/**
 * 检查标签名是否为内置 HTML 元素
 */
export function isBuiltinElement(tagName: string): boolean {
  return /^[a-z]/.test(tagName);
}

/**
 * 创建运行时导入语句
 */
export function createRuntimeImport(
  importSource: string,
  t: typeof import('@babel/types'),
): any {
  return t.importDeclaration(
    [
      t.importSpecifier(
        t.identifier('hyperscript'),
        t.identifier('hyperscript'),
      ),
      t.importSpecifier(t.identifier('Fragment'), t.identifier('Fragment')),
    ],
    t.stringLiteral(importSource),
  );
}

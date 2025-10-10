import type * as t from '@babel/types';

/**
 * Check if a JSX element is a Fragment
 */
export function isFragment(
  node: t.JSXElement,
  t: typeof import('@babel/types'),
): boolean {
  const openingElement = node.openingElement;
  return (
    t.isJSXFragment(openingElement) ||
    (t.isJSXIdentifier(openingElement.name) &&
      openingElement.name.name === 'Fragment')
  );
}

/**
 * Check if identifier name starts with uppercase
 */
export function isComponentName(name: string): boolean {
  return /^[A-Z]/.test(name);
}

/**
 * Check if node has @nofukict comment
 */
export function hasNoFukictComment(
  comments: ReadonlyArray<t.Comment> | null | undefined,
): boolean {
  if (!comments) return false;

  return comments.some(comment => /@nofukict/.test(comment.value));
}

/**
 * Extract JSX attribute name (handles namespaced names like on:click)
 */
export function getAttributeName(
  attribute: t.JSXAttribute,
  t: typeof import('@babel/types'),
): string {
  if (t.isJSXIdentifier(attribute.name)) {
    return attribute.name.name;
  }

  if (t.isJSXNamespacedName(attribute.name)) {
    return `${attribute.name.namespace.name}:${attribute.name.name.name}`;
  }

  return '';
}

/**
 * Convert className to class
 */
export function normalizeAttributeName(name: string): string {
  if (name === 'className') {
    return 'class';
  }
  return name;
}

import type { PluginObj, types as t } from '@babel/core';
import { declare } from '@babel/helper-plugin-utils';

import type { PluginOptions } from './types.js';
import { getAttributeName, normalizeAttributeName } from './utils.js';

/**
 * JSX Transform Plugin
 * Transforms JSX to hyperscript calls
 */
export default declare<PluginOptions>(api => {
  api.assertVersion(7);

  const { types: t } = api;

  return {
    name: '@fukict/babel-preset/jsx-transform',

    visitor: {
      Program(path) {
        // Track if we need to import hyperscript and Fragment
        let needsHyperscript = false;
        let needsFragment = false;

        path.traverse({
          JSXElement() {
            needsHyperscript = true;
          },
          JSXFragment() {
            needsHyperscript = true;
            needsFragment = true;
          },
        });

        // Add imports if needed
        if (needsHyperscript || needsFragment) {
          // Find existing VALUE import from @fukict/basic (not type-only)
          let existingImport: t.ImportDeclaration | null = null;

          for (const node of path.node.body) {
            if (
              t.isImportDeclaration(node) &&
              node.source.value === '@fukict/basic' &&
              node.importKind !== 'type' // Skip type-only imports
            ) {
              existingImport = node;
              break;
            }
          }

          const existingSpecifierNames = new Set<string>();
          if (existingImport) {
            for (const spec of existingImport.specifiers) {
              if (t.isImportSpecifier(spec) && t.isIdentifier(spec.imported)) {
                existingSpecifierNames.add(spec.imported.name);
              }
            }
          }

          // Collect specifiers to add
          const specsToAdd: t.ImportSpecifier[] = [];

          if (needsHyperscript && !existingSpecifierNames.has('hyperscript')) {
            specsToAdd.push(
              t.importSpecifier(
                t.identifier('hyperscript'),
                t.identifier('hyperscript'),
              ),
            );
          }

          if (needsFragment && !existingSpecifierNames.has('Fragment')) {
            specsToAdd.push(
              t.importSpecifier(
                t.identifier('Fragment'),
                t.identifier('Fragment'),
              ),
            );
          }

          // Add missing specifiers
          if (specsToAdd.length > 0) {
            if (existingImport) {
              // Add to existing import
              existingImport.specifiers.push(...specsToAdd);
            } else {
              // Create new import declaration
              const importDeclaration = t.importDeclaration(
                specsToAdd,
                t.stringLiteral('@fukict/basic'),
              );
              path.unshiftContainer('body', importDeclaration);
            }
          }
        }
      },

      JSXElement: {
        exit(path) {
          const node = path.node;
          const openingElement = node.openingElement;

          // Get element type
          let elementType: t.Expression;

          if (t.isJSXIdentifier(openingElement.name)) {
            const name = openingElement.name.name;

            // Check if it's Fragment
            if (name === 'Fragment') {
              elementType = t.identifier('Fragment');
            } else if (name[0] === name[0].toUpperCase()) {
              // Component (uppercase)
              elementType = t.identifier(name);
            } else {
              // Native element (lowercase) - use string literal for tag name
              elementType = t.stringLiteral(name);
            }
          } else if (t.isJSXMemberExpression(openingElement.name)) {
            elementType = convertJSXMemberExpression(
              openingElement.name,
              t,
            ) as t.Expression;
          } else {
            throw path.buildCodeFrameError('Unsupported JSX element type');
          }

          // Build props object and extract fukict:slot
          const { props, slotName } = buildProps(openingElement.attributes, t);

          // Get children paths - at this point, child JSX nodes have already been transformed
          const childrenPaths = path.get('children');
          const children: Array<t.Expression | t.SpreadElement> = [];

          for (const childPath of childrenPaths) {
            const child = childPath.node;

            if (t.isJSXText(child)) {
              const text = child.value.replace(/\s+/g, ' ');
              if (text.trim() === '') continue;
              children.push(t.stringLiteral(text));
            } else if (t.isJSXExpressionContainer(child)) {
              if (t.isJSXEmptyExpression(child.expression)) continue;
              const expr = child.expression as t.Expression;

              // Spread arrays for:
              // 1. CallExpression (e.g., demos.map(...)) - likely returns array
              // 2. Identifier named "children" - props.children is typically an array
              if (
                t.isCallExpression(expr) ||
                (t.isIdentifier(expr) && expr.name === 'children')
              ) {
                // Use spread with runtime array check
                children.push(
                  t.spreadElement(
                    t.conditionalExpression(
                      t.callExpression(
                        t.memberExpression(
                          t.identifier('Array'),
                          t.identifier('isArray'),
                        ),
                        [expr],
                      ),
                      expr,
                      t.arrayExpression([expr]),
                    ),
                  ),
                );
              } else {
                // For all other expressions, push directly
                children.push(expr);
              }
            } else if (t.isJSXSpreadChild(child)) {
              // Skip spread children
              continue;
            } else if (t.isExpression(child)) {
              // This should be the transformed JSX element (now an expression)
              children.push(child);
            }
          }

          // Create hyperscript call directly: hyperscript(type, props, children)
          const call = t.callExpression(t.identifier('hyperscript'), [
            elementType,
            props,
            t.arrayExpression(children),
          ]);

          // Only handle fukict:slot if present
          if (slotName) {
            // Wrap with IIFE to add __slot_name__
            const vnodeId = path.scope.generateUidIdentifier('vnode');
            const wrappedCall = t.callExpression(
              t.arrowFunctionExpression(
                [vnodeId],
                t.sequenceExpression([
                  t.assignmentExpression(
                    '=',
                    t.memberExpression(vnodeId, t.identifier('__slot_name__')),
                    t.stringLiteral(slotName),
                  ),
                  vnodeId,
                ]),
              ),
              [call],
            );
            path.replaceWith(wrappedCall);
          } else {
            // No slot, just use hyperscript call directly
            path.replaceWith(call);
          }
        },
      },

      JSXFragment: {
        exit(path) {
          // Get children paths - at this point, child JSX nodes have already been transformed
          const childrenPaths = path.get('children');
          const children: Array<t.Expression | t.SpreadElement> = [];

          for (const childPath of childrenPaths) {
            const child = childPath.node;

            if (t.isJSXText(child)) {
              const text = child.value.replace(/\s+/g, ' ');
              if (text.trim() === '') continue;
              children.push(t.stringLiteral(text));
            } else if (t.isJSXExpressionContainer(child)) {
              if (t.isJSXEmptyExpression(child.expression)) continue;
              const expr = child.expression as t.Expression;

              // Spread arrays for:
              // 1. CallExpression (e.g., demos.map(...)) - likely returns array
              // 2. Identifier named "children" - props.children is typically an array
              if (
                t.isCallExpression(expr) ||
                (t.isIdentifier(expr) && expr.name === 'children')
              ) {
                // Use spread with runtime array check
                children.push(
                  t.spreadElement(
                    t.conditionalExpression(
                      t.callExpression(
                        t.memberExpression(
                          t.identifier('Array'),
                          t.identifier('isArray'),
                        ),
                        [expr],
                      ),
                      expr,
                      t.arrayExpression([expr]),
                    ),
                  ),
                );
              } else {
                // For all other expressions, push directly
                children.push(expr);
              }
            } else if (t.isJSXSpreadChild(child)) {
              // Skip spread children
              continue;
            } else if (t.isExpression(child)) {
              // This should be the transformed JSX element (now an expression)
              children.push(child);
            }
          }

          // Create hyperscript call with Fragment
          const call = t.callExpression(t.identifier('hyperscript'), [
            t.identifier('Fragment'),
            t.nullLiteral(),
            t.arrayExpression(children),
          ]);

          // Fragment doesn't need IIFE wrapper, hyperscript will detect it
          path.replaceWith(call);
        },
      },
    },
  } as PluginObj;
});

/**
 * Convert JSX member expression to member expression
 */
function convertJSXMemberExpression(
  node: t.JSXMemberExpression,
  t: typeof import('@babel/types'),
): t.MemberExpression | t.Identifier {
  if (t.isJSXIdentifier(node.object)) {
    return t.memberExpression(
      t.identifier(node.object.name),
      t.identifier(node.property.name),
    );
  }

  if (t.isJSXMemberExpression(node.object)) {
    return t.memberExpression(
      convertJSXMemberExpression(node.object, t),
      t.identifier(node.property.name),
    );
  }

  throw new Error('Unsupported JSX member expression');
}

/**
 * Build props object from JSX attributes
 * Returns both props and extracted fukict:slot value
 */
function buildProps(
  attributes: Array<t.JSXAttribute | t.JSXSpreadAttribute>,
  t: typeof import('@babel/types'),
): { props: t.ObjectExpression | t.NullLiteral; slotName: string | null } {
  if (attributes.length === 0) {
    return { props: t.nullLiteral(), slotName: null };
  }

  const properties: Array<t.ObjectProperty | t.SpreadElement> = [];
  let slotName: string | null = null;

  for (const attr of attributes) {
    if (t.isJSXSpreadAttribute(attr)) {
      properties.push(t.spreadElement(attr.argument));
      continue;
    }

    const name = getAttributeName(attr, t);

    // Extract fukict:slot and don't add it to props
    if (name === 'fukict:slot') {
      if (t.isStringLiteral(attr.value)) {
        slotName = attr.value.value;
      } else if (t.isJSXExpressionContainer(attr.value)) {
        // Only support string literals for slot names
        if (t.isStringLiteral(attr.value.expression)) {
          slotName = attr.value.expression.value;
        }
      }
      continue; // Skip adding to props
    }

    const normalizedName = normalizeAttributeName(name);

    let value: t.Expression;

    if (attr.value === null) {
      // <div disabled /> -> { disabled: true }
      value = t.booleanLiteral(true);
    } else if (t.isStringLiteral(attr.value)) {
      value = attr.value;
    } else if (t.isJSXExpressionContainer(attr.value)) {
      if (t.isJSXEmptyExpression(attr.value.expression)) {
        continue;
      }
      value = attr.value.expression as t.Expression;
    } else {
      continue;
    }

    properties.push(t.objectProperty(t.stringLiteral(normalizedName), value));
  }

  const props =
    properties.length === 0 ? t.nullLiteral() : t.objectExpression(properties);

  return { props, slotName };
}

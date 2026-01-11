import type { NodePath, PluginObj, types as t } from '@babel/core';
import { declare } from '@babel/helper-plugin-utils';

import * as pathUtil from 'node:path';

import type { PluginOptions } from './types.js';
import {
  getAttributeName,
  isComponentName,
  normalizeAttributeName,
} from './utils.js';

/**
 * JSX Transform Plugin
 * Transforms JSX to hyperscript calls
 */
export default declare<PluginOptions>((api, options) => {
  api.assertVersion(7);

  const { types: t } = api;
  const { development = false } = options;

  // Track filename and component context for development attributes
  let currentFilename: string | undefined;
  const componentScopes = new WeakMap<
    any,
    { name: string; filename: string }
  >();

  return {
    name: '@fukict/babel-preset/jsx-transform',

    visitor: {
      Program(path, state) {
        // Get filename from state for development attributes
        const filename = state.file.opts.filename || state.filename;

        // Convert to relative path if it's absolute
        if (filename && typeof filename === 'string') {
          if (pathUtil.isAbsolute(filename)) {
            currentFilename = pathUtil.relative(process.cwd(), filename);
          } else {
            currentFilename = filename;
          }
        } else {
          currentFilename = undefined;
        }
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

      // Track function components for development attributes
      VariableDeclarator(path: NodePath<t.VariableDeclarator>) {
        if (!development || !currentFilename) {
          return;
        }

        const { id, init } = path.node;

        // Must be identifier
        if (!t.isIdentifier(id)) {
          return;
        }

        // Check if it's a component name OR a temporary variable for export default
        const isExportDefault = id.name.startsWith('_');
        if (!isComponentName(id.name) && !isExportDefault) {
          return;
        }

        let funcPath: NodePath | null = null;

        // Check for arrow/function expression (before auto-define-fukict runs)
        if (t.isArrowFunctionExpression(init) || t.isFunctionExpression(init)) {
          funcPath = path.get('init') as NodePath;
        }
        // Check for defineFukict(arrow/function) (after auto-define-fukict runs)
        else if (
          t.isCallExpression(init) &&
          t.isIdentifier(init.callee) &&
          init.callee.name === 'defineFukict' &&
          init.arguments.length > 0
        ) {
          const arg = init.arguments[0];
          if (t.isArrowFunctionExpression(arg) || t.isFunctionExpression(arg)) {
            // Get the path to the function argument
            funcPath = (path.get('init') as NodePath<t.CallExpression>).get(
              'arguments.0',
            ) as NodePath;
          }
        }

        // Store component info in the function's scope
        if (funcPath && funcPath.isFunction()) {
          componentScopes.set(funcPath.scope, {
            name: isExportDefault ? 'DefaultExport' : id.name,
            filename: currentFilename,
          });
        }
      },

      // Track class components for development attributes
      ClassDeclaration(path: NodePath<t.ClassDeclaration>) {
        if (!development || !currentFilename) {
          return;
        }

        const classNode = path.node;

        // Check if class extends Fukict or RouteComponent (or any class, to be safe)
        const superClass = classNode.superClass;
        const isComponent =
          t.isIdentifier(superClass) &&
          (superClass.name === 'Fukict' ||
            superClass.name === 'RouteComponent' ||
            superClass.name.endsWith('Component'));

        if (!isComponent) {
          return;
        }

        const componentName = classNode.id?.name;
        if (!componentName) {
          return;
        }

        // Store component info for all render methods
        // Find the render method
        for (const member of classNode.body.body) {
          if (
            t.isClassMethod(member) &&
            t.isIdentifier(member.key) &&
            member.key.name === 'render'
          ) {
            // Get the path to the render method
            /* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
            const memberPath = path.get('body.body').find((p: any) => {
              return (
                p.isClassMethod() &&
                t.isIdentifier(p.node.key) &&
                p.node.key.name === 'render'
              );
            }) as NodePath<t.ClassMethod> | undefined;
            /* eslint-enable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */

            if (memberPath) {
              // Store component info in the render method's scope
              componentScopes.set(memberPath.scope, {
                name: componentName,
                filename: currentFilename,
              });
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

          // Find component context for development attributes
          let componentInfo: { name: string; filename: string } | undefined;
          let componentScope: any;
          if (development && currentFilename) {
            let currentScope: any = path.scope;
            while (currentScope) {
              const info = componentScopes.get(currentScope);
              if (info) {
                componentInfo = info;
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                componentScope = currentScope;
                break;
              }
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
              currentScope = currentScope.parent;
            }
          }

          // Check if this JSX is the root element of the component
          let isRootElement = false;
          if (componentInfo && componentScope) {
            // Get the nearest function scope containing this JSX
            let currentFunctionScope: any = path.scope;
            while (
              currentFunctionScope &&
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
              !currentFunctionScope.path.isFunction()
            ) {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
              currentFunctionScope = currentFunctionScope.parent;
            }

            // Only add attributes if JSX is in component's own scope (not nested function like map callback)
            if (currentFunctionScope === componentScope) {
              const parent = path.parent;
              const parentKey = path.parentKey;

              // Check if JSX is directly returned by the component
              // Case 1: return <JSX> (in function/method body)
              if (t.isReturnStatement(parent) && parentKey === 'argument') {
                isRootElement = true;
              }
              // Case 2: const Comp = () => <JSX> (arrow function without block)
              else if (
                t.isArrowFunctionExpression(parent) &&
                parentKey === 'body'
              ) {
                isRootElement = true;
              }
            }
          }

          // Build props object and extract fukict:slot
          const { props, slotName } = buildProps(
            openingElement.attributes,
            t,
            development,
            isRootElement ? componentInfo : undefined,
            path.parent,
            path.parentKey,
          );

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
  development: boolean,
  componentInfo: { name: string; filename: string } | undefined,
  parent: t.Node | null | undefined,
  parentKey: string | number | undefined,
): { props: t.ObjectExpression | t.NullLiteral; slotName: string | null } {
  const properties: Array<t.ObjectProperty | t.SpreadElement> = [];
  let slotName: string | null = null;

  // Add development attributes if in component context and root element
  if (development && componentInfo) {
    // Only add to root-level JSX (not nested in other JSX elements)
    const isJSXChild =
      parentKey === 'children' ||
      t.isJSXElement(parent) ||
      t.isJSXFragment(parent);

    if (!isJSXChild) {
      // Add data-fukict-component
      properties.push(
        t.objectProperty(
          t.stringLiteral('data-fukict-component'),
          t.stringLiteral(componentInfo.name),
        ),
      );

      // Add data-fukict-file
      properties.push(
        t.objectProperty(
          t.stringLiteral('data-fukict-file'),
          t.stringLiteral(componentInfo.filename),
        ),
      );
    }
  }

  if (attributes.length === 0) {
    // If we added dev attributes but no user attributes, return object
    if (properties.length > 0) {
      return { props: t.objectExpression(properties), slotName: null };
    }
    return { props: t.nullLiteral(), slotName: null };
  }

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

import type { NodePath, PluginObj, types as t } from '@babel/core';
import { declare } from '@babel/helper-plugin-utils';

import type { PluginOptions } from './types.js';
import { hasNoFukictComment, isComponentName } from './utils.js';

/**
 * Auto defineFukict Plugin
 * Automatically wraps function components with defineFukict
 */
export default declare<PluginOptions>(api => {
  api.assertVersion(7);

  const { types: t } = api;

  return {
    name: '@fukict/babel-preset/auto-define-fukict',

    visitor: {
      Program(path) {
        let needsDefineFukict = false;

        // First pass: check if we need defineFukict
        path.traverse({
          VariableDeclarator(varPath) {
            if (shouldWrapComponent(varPath, t)) {
              needsDefineFukict = true;
            }
          },
          ExportDefaultDeclaration(exportPath) {
            const declaration = exportPath.node.declaration;

            // Only handle anonymous function components
            if (
              (t.isArrowFunctionExpression(declaration) ||
                t.isFunctionExpression(declaration)) &&
              returnsJSX(declaration, t) &&
              !hasNoFukictComment(exportPath.node.leadingComments) &&
              !isDefineFukictCall(declaration, t)
            ) {
              needsDefineFukict = true;
            }
          },
        });

        // Add import if needed
        if (needsDefineFukict) {
          // Check if defineFukict is already imported
          const hasImport = path.node.body.some(node => {
            if (!t.isImportDeclaration(node)) return false;
            if (node.source.value !== '@fukict/basic') return false;

            return node.specifiers.some(
              spec =>
                t.isImportSpecifier(spec) &&
                t.isIdentifier(spec.imported) &&
                spec.imported.name === 'defineFukict',
            );
          });

          if (!hasImport) {
            // Find existing @fukict/basic import
            const existingImport = path.node.body.find(
              node =>
                t.isImportDeclaration(node) &&
                node.source.value === '@fukict/basic',
            ) as t.ImportDeclaration | undefined;

            if (existingImport) {
              // Add to existing import
              existingImport.specifiers.push(
                t.importSpecifier(
                  t.identifier('defineFukict'),
                  t.identifier('defineFukict'),
                ),
              );
            } else {
              // Create new import
              const importDeclaration = t.importDeclaration(
                [
                  t.importSpecifier(
                    t.identifier('defineFukict'),
                    t.identifier('defineFukict'),
                  ),
                ],
                t.stringLiteral('@fukict/basic'),
              );

              path.unshiftContainer('body', importDeclaration);
            }
          }
        }
      },

      VariableDeclarator(path) {
        if (!shouldWrapComponent(path, t)) {
          return;
        }

        const id = path.node.id;
        const init = path.node.init;
        if (!init || !t.isIdentifier(id)) return;

        // Check if already wrapped
        if (isDefineFukictCall(init, t)) {
          return;
        }

        // Wrap with defineFukict
        const wrappedInit = t.callExpression(t.identifier('defineFukict'), [
          init,
        ]);

        path.node.init = wrappedInit;
      },

      ExportDefaultDeclaration(path) {
        const declaration = path.node.declaration;

        // Only handle anonymous function components
        if (
          !t.isArrowFunctionExpression(declaration) &&
          !t.isFunctionExpression(declaration)
        ) {
          return;
        }

        // Check if returns JSX
        if (!returnsJSX(declaration, t)) {
          return;
        }

        // Check for @nofukict comment
        if (hasNoFukictComment(path.node.leadingComments)) {
          return;
        }

        // Check if already wrapped
        if (isDefineFukictCall(declaration, t)) {
          return;
        }

        // Create a temporary variable for the wrapped component
        const tempId = path.scope.generateUidIdentifier('component');

        // Wrap with defineFukict
        const wrappedComponent = t.callExpression(
          t.identifier('defineFukict'),
          [declaration],
        );

        // Create variable declaration
        const varDeclaration = t.variableDeclaration('const', [
          t.variableDeclarator(tempId, wrappedComponent),
        ]);

        // Export the temp variable
        const exportDeclaration = t.exportDefaultDeclaration(tempId);

        path.replaceWithMultiple([varDeclaration, exportDeclaration]);
      },

      // Handle class components
      ClassDeclaration(path) {
        const node = path.node;
        const id = node.id;

        // Must have a name
        if (!id) return;

        // Check if it extends Fukict
        if (!extendsClass(node, 'Fukict', t)) {
          return;
        }

        // Class components don't need any transformation
        // Just checking for Fukict extension is enough
      },
    },
  } as PluginObj;
});

/**
 * Check if a variable declarator should be wrapped with defineFukict
 */
function shouldWrapComponent(
  path: NodePath<t.VariableDeclarator>,
  t: typeof import('@babel/types'),
): boolean {
  const id = path.node.id;
  const init = path.node.init;

  // Must be identifier (const Greeting = ...)
  if (!t.isIdentifier(id)) {
    return false;
  }

  // Check if name starts with uppercase
  if (!isComponentName(id.name)) {
    return false;
  }

  // Must be function expression or arrow function
  if (!t.isArrowFunctionExpression(init) && !t.isFunctionExpression(init)) {
    return false;
  }

  // Check if returns JSX
  if (!returnsJSX(init, t)) {
    return false;
  }

  // Check for @nofukict comment
  const parent = path.parentPath;
  if (
    parent &&
    parent.node &&
    hasNoFukictComment(parent.node.leadingComments)
  ) {
    return false;
  }

  return true;
}

/**
 * Check if a function returns JSX
 */
function returnsJSX(
  func: t.ArrowFunctionExpression | t.FunctionExpression,
  t: typeof import('@babel/types'),
): boolean {
  // Arrow function with expression body
  if (
    t.isArrowFunctionExpression(func) &&
    (t.isJSXElement(func.body) || t.isJSXFragment(func.body))
  ) {
    return true;
  }

  // Check block statement for return statements
  if (t.isBlockStatement(func.body)) {
    let hasJSXReturn = false;

    // Simple traverse to check return statements
    for (const statement of func.body.body) {
      if (t.isReturnStatement(statement)) {
        const argument = statement.argument;
        if (t.isJSXElement(argument) || t.isJSXFragment(argument)) {
          hasJSXReturn = true;
          break;
        }
      }
    }

    return hasJSXReturn;
  }

  return false;
}

/**
 * Check if expression is a defineFukict call
 */
function isDefineFukictCall(
  node: t.Expression | t.PatternLike | null | undefined,
  t: typeof import('@babel/types'),
): boolean {
  if (!node) return false;

  return (
    t.isCallExpression(node) &&
    t.isIdentifier(node.callee) &&
    node.callee.name === 'defineFukict'
  );
}

/**
 * Check if a class extends a specific base class
 */
function extendsClass(
  node: t.ClassDeclaration,
  className: string,
  t: typeof import('@babel/types'),
): boolean {
  const superClass = node.superClass;
  if (!superClass) return false;

  return t.isIdentifier(superClass) && superClass.name === className;
}

import type { NodePath, PluginObj, types as t } from '@babel/core';
import { declare } from '@babel/helper-plugin-utils';

import type { PluginOptions } from './types.js';
import { isComponentName } from './utils.js';

/**
 * Display Name Plugin
 * Injects displayName for components in development mode
 */
export default declare<PluginOptions>((api, options) => {
  api.assertVersion(7);

  const { types: t } = api;
  const { development = false } = options;

  // Skip in production mode
  if (!development) {
    return {
      name: '@fukict/babel-preset/display-name',
      visitor: {},
    } as PluginObj;
  }

  return {
    name: '@fukict/babel-preset/display-name',

    visitor: {
      VariableDeclarator(path) {
        const id = path.node.id;
        const init = path.node.init;

        // Must be identifier
        if (!t.isIdentifier(id)) {
          return;
        }

        // Check if name starts with uppercase (component)
        if (!isComponentName(id.name)) {
          return;
        }

        // Must be defineFukict call or function
        if (
          !isDefineFukictCall(init, t) &&
          !t.isArrowFunctionExpression(init) &&
          !t.isFunctionExpression(init)
        ) {
          return;
        }

        // Inject displayName
        injectDisplayName(path, id.name, t);
      },

      ExportDefaultDeclaration(path) {
        const declaration = path.node.declaration;

        // Skip function/class declarations
        if (
          t.isFunctionDeclaration(declaration) ||
          t.isClassDeclaration(declaration)
        ) {
          return;
        }

        // Handle anonymous default export
        if (
          t.isArrowFunctionExpression(declaration) ||
          t.isFunctionExpression(declaration)
        ) {
          // Create a variable for the component
          const componentId = path.scope.generateUidIdentifier('Component');

          // Replace export with variable declaration + export
          const varDeclaration = t.variableDeclaration('const', [
            t.variableDeclarator(
              componentId,
              declaration as t.ArrowFunctionExpression | t.FunctionExpression,
            ),
          ]);

          // Add displayName
          const displayNameAssignment = t.expressionStatement(
            t.assignmentExpression(
              '=',
              t.memberExpression(componentId, t.identifier('displayName')),
              t.stringLiteral('DefaultExport'),
            ),
          );

          // Export the component
          const exportDeclaration = t.exportDefaultDeclaration(componentId);

          path.replaceWithMultiple([
            varDeclaration,
            displayNameAssignment,
            exportDeclaration,
          ]);
        } else if (
          t.isCallExpression(declaration) &&
          t.isIdentifier(declaration.callee) &&
          declaration.callee.name === 'defineFukict'
        ) {
          // Handle defineFukict call
          const componentId = path.scope.generateUidIdentifier('Component');

          const varDeclaration = t.variableDeclaration('const', [
            t.variableDeclarator(componentId, declaration),
          ]);

          const displayNameAssignment = t.expressionStatement(
            t.assignmentExpression(
              '=',
              t.memberExpression(componentId, t.identifier('displayName')),
              t.stringLiteral('DefaultExport'),
            ),
          );

          const exportDeclaration = t.exportDefaultDeclaration(componentId);

          path.replaceWithMultiple([
            varDeclaration,
            displayNameAssignment,
            exportDeclaration,
          ]);
        }
      },
    },
  } as PluginObj;
});

/**
 * Inject displayName assignment after variable declaration
 */
function injectDisplayName(
  path: NodePath<t.VariableDeclarator>,
  name: string,
  t: typeof import('@babel/types'),
): void {
  const parentPath = path.parentPath;

  if (!parentPath || !parentPath.isVariableDeclaration()) {
    return;
  }

  const grandParentPath = parentPath.parentPath;

  // Only inject if we're in a valid statement context
  if (
    !grandParentPath ||
    !(grandParentPath.isProgram() || grandParentPath.isBlockStatement())
  ) {
    return;
  }

  // Create displayName assignment
  const displayNameAssignment = t.expressionStatement(
    t.assignmentExpression(
      '=',
      t.memberExpression(t.identifier(name), t.identifier('displayName')),
      t.stringLiteral(name),
    ),
  );

  // Insert after the variable declaration
  parentPath.insertAfter(displayNameAssignment);
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

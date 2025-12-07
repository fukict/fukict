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

        // Skip generated UIDs (like _component, _Component, etc.)
        // These are created by auto-define-fukict or this plugin for export default
        // We'll handle them in the export visitor if needed
        if (id.name.startsWith('_')) {
          // Check if this is followed by an export default statement
          const parentPath = path.parentPath;
          if (!parentPath || !parentPath.isVariableDeclaration()) {
            return;
          }

          const grandParentPath = parentPath.parentPath;
          if (!grandParentPath || !grandParentPath.isProgram()) {
            return;
          }

          // Check if the next statement is export default with this identifier
          const statements = grandParentPath.get('body') as NodePath[];
          const currentIndex = statements.indexOf(parentPath as any);

          if (currentIndex >= 0 && currentIndex < statements.length - 1) {
            const nextPath = statements[currentIndex + 1];
            if (
              nextPath.isExportDefaultDeclaration() &&
              t.isIdentifier(nextPath.node.declaration) &&
              nextPath.node.declaration.name === id.name
            ) {
              // This is an export default pattern, add displayName
              const displayNameAssignment = t.expressionStatement(
                t.assignmentExpression(
                  '=',
                  t.memberExpression(id, t.identifier('displayName')),
                  t.stringLiteral('DefaultExport'),
                ),
              );

              parentPath.insertAfter(displayNameAssignment);
              return;
            }
          }

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

        // Handle identifiers (e.g., export default Greeting)
        if (t.isIdentifier(declaration)) {
          // Don't inject displayName for identifiers
          // The displayName should already be set when the variable was declared
          return;
        }

        // Handle anonymous function export
        if (
          t.isArrowFunctionExpression(declaration) ||
          t.isFunctionExpression(declaration)
        ) {
          // Check if auto-define-fukict has already created a variable
          // by looking at the previous statement
          const programPath = path.findParent(p => p.isProgram());
          if (!programPath) return;

          const statements = programPath.get('body') as NodePath[];
          const currentIndex = statements.indexOf(path as any);

          // Check if the previous statement is a variable declaration with defineFukict
          if (currentIndex > 0) {
            const prevPath = statements[currentIndex - 1];
            if (
              prevPath.isVariableDeclaration() &&
              prevPath.node.declarations.length === 1
            ) {
              const declarator = prevPath.node.declarations[0];
              if (
                t.isVariableDeclarator(declarator) &&
                t.isIdentifier(declarator.id) &&
                isDefineFukictCall(declarator.init, t)
              ) {
                // auto-define-fukict has already created the variable
                // Just add displayName after the variable declaration
                const displayNameAssignment = t.expressionStatement(
                  t.assignmentExpression(
                    '=',
                    t.memberExpression(
                      declarator.id,
                      t.identifier('displayName'),
                    ),
                    t.stringLiteral('DefaultExport'),
                  ),
                );

                prevPath.insertAfter(displayNameAssignment);

                // Don't create another variable
                return;
              }
            }
          }

          // If we get here, auto-define-fukict hasn't run yet
          // This shouldn't happen if plugin order is correct, but handle it anyway
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
          return;
        }

        // Handle defineFukict call export
        if (
          t.isCallExpression(declaration) &&
          isDefineFukictCall(declaration, t)
        ) {
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

/**
 * @fukict/basic - Renderer: Activate Nodes
 *
 * Mount DOM nodes and trigger lifecycle hooks at mounting moment
 */
import type { VNode, VNodeChild } from '../types/index.js';
import { VNodeType } from '../types/index.js';

type ActivateOptions =
  | {
      vnode: VNodeChild;
      container: Element;
      onMounted?: () => void;
    }
  | {
      vnode: VNodeChild;
      placeholder: Comment;
      onMounted?: () => void;
    };

/**
 * Context for activation strategy
 */
interface ActivateContext {
  vnode: VNode;
  container?: Element;
  placeholder?: Comment;
  onMounted?: () => void;
}

/**
 * Strategy function type
 */
type ActivateStrategy = (ctx: ActivateContext) => void;

/**
 * Helper: Auto-activate ClassComponents in VNode tree
 *
 * For JSX natural mounting - placeholders are already in DOM.
 * Recursively searches for ClassComponents, but stops at ClassComponent nodes
 * (since they handle their own children).
 */
function autoActivateClassComponentsInTree(
  vnode: VNode,
  _container: Element, // Not used, kept for signature compatibility
): void {
  // Special handling for FunctionComponent: use __rendered__ instead of children
  if (vnode.__type__ === VNodeType.FunctionComponent) {
    const rendered = (vnode as any).__rendered__;
    if (rendered && typeof rendered === 'object' && '__type__' in rendered) {
      autoActivateClassComponentsInTree(rendered as VNode, _container);
    }
    return;
  }

  // For other node types (Element, Fragment), check children
  if (vnode.children && Array.isArray(vnode.children)) {
    for (const child of vnode.children) {
      if (child && typeof child === 'object' && '__type__' in child) {
        const childVNode = child as VNode;

        // If child is a ClassComponent, activate it and stop recursion
        if (childVNode.__type__ === VNodeType.ClassComponent) {
          const instance = (childVNode as any).__instance__;
          const placeholder = (childVNode as any).__placeholder__;

          // Placeholder is already in DOM (from parent's createRealNode)
          // Use placeholder replacement mounting
          if (instance && placeholder && placeholder.parentNode) {
            instance.mount(placeholder.parentNode as Element, placeholder);
          }
          // Don't recurse into ClassComponent's children (it handles its own)
        } else {
          // For other node types, recurse
          autoActivateClassComponentsInTree(childVNode, _container);
        }
      }
    }
  }
}

/**
 * Strategy: Activate ClassComponent
 *
 * Supports both container and placeholder modes:
 * - container mode: for manual mounting via attach()
 * - placeholder mode: for diff/replace operations
 */
function activateClassComponent(ctx: ActivateContext): void {
  const { vnode, container, placeholder, onMounted } = ctx;
  const instance = (vnode as any).__instance__;

  if (!instance) return;

  // Determine which mode to use
  if (placeholder && placeholder.parentNode) {
    // Placeholder mode: replace placeholder with component DOM
    onMounted?.();
    instance.mount(placeholder.parentNode as Element, placeholder);
  } else if (container) {
    // Container mode: mount to container
    onMounted?.();
    instance.mount(container);
  }
}

/**
 * Strategy: Activate Element
 */
function activateElement(ctx: ActivateContext): void {
  const { vnode, container, placeholder, onMounted } = ctx;
  const dom = (vnode as any).__dom__;
  const actualContainer = container || placeholder?.parentNode;

  if (!actualContainer) return;

  // Mount or replace DOM
  if (dom) {
    if (placeholder && placeholder.parentNode) {
      placeholder.parentNode.replaceChild(dom, placeholder);
    } else {
      actualContainer.appendChild(dom);
    }
  }

  onMounted?.();

  // Auto-activate ClassComponent children (their placeholders are already in dom)
  autoActivateClassComponentsInTree(vnode, dom as Element);
}

/**
 * Strategy: Activate Fragment
 */
function activateFragment(ctx: ActivateContext): void {
  const { vnode, container, placeholder, onMounted } = ctx;
  const domArray = (vnode as any).__dom__;
  const actualContainer = container || placeholder?.parentNode;

  if (!actualContainer) return;

  // Mount or replace DOM array
  if (Array.isArray(domArray)) {
    if (placeholder && placeholder.parentNode) {
      // Replace mode: insert all before placeholder, then remove
      domArray.forEach(node => {
        placeholder.parentNode!.insertBefore(node, placeholder);
      });
      placeholder.parentNode.removeChild(placeholder);
    } else {
      // Mount mode: append all to container
      domArray.forEach(node => actualContainer.appendChild(node));
    }
  }

  onMounted?.();

  // Auto-activate ClassComponent children (their placeholders are already in actualContainer)
  autoActivateClassComponentsInTree(vnode, actualContainer as Element);
}

/**
 * Strategy: Activate FunctionComponent
 */
function activateFunctionComponent(ctx: ActivateContext): void {
  const { vnode, container, placeholder, onMounted } = ctx;
  const dom = (vnode as any).__dom__;
  const actualContainer = container || placeholder?.parentNode;

  if (!actualContainer) return;

  // Mount or replace DOM (can be single or array)
  if (dom) {
    if (placeholder && placeholder.parentNode) {
      // Replace mode
      if (Array.isArray(dom)) {
        dom.forEach(node => {
          placeholder.parentNode!.insertBefore(node, placeholder);
        });
        placeholder.parentNode.removeChild(placeholder);
      } else {
        placeholder.parentNode.replaceChild(dom, placeholder);
      }
    } else {
      // Mount mode
      if (Array.isArray(dom)) {
        dom.forEach(node => actualContainer.appendChild(node));
      } else {
        actualContainer.appendChild(dom);
      }
    }
  }

  onMounted?.();

  // Auto-activate all ClassComponents in __rendered__ tree
  const rendered = (vnode as any).__rendered__;
  if (rendered && typeof rendered === 'object' && '__type__' in rendered) {
    autoActivateClassComponentsInTree(
      rendered as VNode,
      actualContainer as Element,
    );
  }
}

/**
 * Strategy registry
 */
const strategies: Record<VNodeType, ActivateStrategy> = {
  [VNodeType.ClassComponent]: activateClassComponent,
  [VNodeType.Element]: activateElement,
  [VNodeType.Fragment]: activateFragment,
  [VNodeType.FunctionComponent]: activateFunctionComponent,
};

/**
 * Activate VNode: mount DOM and trigger lifecycle at mounting moment
 *
 * Two modes:
 * 1. container mode: mount DOM to container (used by attach)
 * 2. placeholder mode: replace placeholder with DOM (used by ClassComponent.mount)
 *
 * @param options - { vnode, container } or { vnode, placeholder }
 */
export function activate(options: ActivateOptions): void {
  const { vnode, onMounted } = options;
  const container = 'container' in options ? options.container : undefined;
  const placeholder =
    'placeholder' in options ? options.placeholder : undefined;

  // Early return for invalid vnodes
  if (!vnode || typeof vnode !== 'object' || !('__type__' in vnode)) {
    return;
  }

  const vnodeObj = vnode as VNode;
  const strategy = strategies[vnodeObj.__type__];

  if (strategy) {
    strategy({
      vnode: vnodeObj,
      container,
      placeholder,
      onMounted,
    });
  }
}

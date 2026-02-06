/**
 * Data extraction functions for hook
 * Extract instance data, context data from component instances
 */
import { serialize } from '~/utils/serialize';

/**
 * Extract all non-function properties from a component instance,
 * grouped into Framework, Computed (getters), and Properties.
 */
export function extractInstanceData(instance: any): Record<string, any> {
  const result: Record<string, any> = {};

  const skipKeys = new Set(['_render', '_parent', '_container', 'constructor']);

  const lifecycleMethods = new Set([
    'render',
    'mounted',
    'beforeUnmount',
    'updated',
    'beforeMount',
    'beforeUpdate',
    'errorCaptured',
  ]);

  // --- Framework group ---
  const frameworkKeys = ['$id', '$name', 'props', '$slots', '$refs', '_phase'];
  const framework: Record<string, any> = {};
  for (const key of frameworkKeys.sort()) {
    if (key in instance) {
      const val = instance[key];
      if (typeof val !== 'function') {
        framework[key] = serialize(val);
      }
    }
  }
  if (Object.keys(framework).length > 0) {
    result['Framework'] = framework;
  }

  // --- Computed group (prototype getters) ---
  const computed: Record<string, any> = {};
  let proto = Object.getPrototypeOf(instance);
  const visitedProtos = new Set<any>();
  while (proto && proto !== Object.prototype && !visitedProtos.has(proto)) {
    visitedProtos.add(proto);
    const descriptors = Object.getOwnPropertyDescriptors(proto);
    for (const [key, desc] of Object.entries(descriptors)) {
      if (skipKeys.has(key) || lifecycleMethods.has(key)) continue;
      if (desc.get && !desc.set) {
        try {
          computed[key] = serialize(instance[key]);
        } catch {
          computed[key] = '[Error reading getter]';
        }
      }
    }
    proto = Object.getPrototypeOf(proto);
  }
  const sortedComputed: Record<string, any> = {};
  for (const key of Object.keys(computed).sort()) {
    sortedComputed[key] = computed[key];
  }
  if (Object.keys(sortedComputed).length > 0) {
    result['Computed'] = sortedComputed;
  }

  // --- Properties group (user-defined own properties) ---
  const frameworkKeySet = new Set(frameworkKeys);
  const properties: Record<string, any> = {};
  for (const key of Object.keys(instance).sort()) {
    if (skipKeys.has(key) || frameworkKeySet.has(key)) continue;
    if (key.startsWith('_')) continue;
    const val = instance[key];
    if (typeof val === 'function') continue;
    properties[key] = serialize(val);
  }
  if (Object.keys(properties).length > 0) {
    result['Properties'] = properties;
  }

  return result;
}

/**
 * Collect all context keys from a ContextData object (string + symbol keys),
 * excluding the internal __parent__ key.
 */
function collectContextKeys(
  ctx: any,
  into: Record<string, any>,
  seen: Set<string>,
): void {
  for (const key of Object.keys(ctx)) {
    if (key === '__parent__') continue;
    const k = String(key);
    if (!seen.has(k)) {
      seen.add(k);
      into[k] = serialize(ctx[key]);
    }
  }
  for (const sym of Object.getOwnPropertySymbols(ctx)) {
    const desc = String(sym);
    if (!seen.has(desc)) {
      seen.add(desc);
      into[desc] = serialize(ctx[sym]);
    }
  }
}

/**
 * Extract context data from a component instance.
 *
 * - "Provided": context keys this component set via provideContext()
 * - "Inherited": context available from parent components
 */
export function extractContextData(
  instance: any,
): Record<string, any> | undefined {
  const result: Record<string, any> = {};
  const provided: Record<string, any> = {};
  const inherited: Record<string, any> = {};
  const seen = new Set<string>();

  const vnode = instance._render;

  // 1. Own provided context
  if (vnode && vnode.__context__) {
    collectContextKeys(vnode.__context__, provided, seen);

    // 2. Inherited via __context__.__parent__ chain (VNode-level)
    let parentCtx = vnode.__context__.__parent__;
    while (parentCtx) {
      collectContextKeys(parentCtx, inherited, seen);
      parentCtx = parentCtx.__parent__;
    }
  }

  // 3. Inherited via _parent component instance chain
  let parentInst = instance._parent;
  while (parentInst) {
    const parentVNode = parentInst._render;
    if (parentVNode && parentVNode.__context__) {
      let ctx = parentVNode.__context__;
      while (ctx) {
        collectContextKeys(ctx, inherited, seen);
        ctx = ctx.__parent__;
      }
    }
    parentInst = parentInst._parent;
  }

  if (Object.keys(provided).length > 0) {
    result['Provided'] = provided;
  }
  if (Object.keys(inherited).length > 0) {
    result['Inherited'] = inherited;
  }

  return Object.keys(result).length > 0 ? result : undefined;
}

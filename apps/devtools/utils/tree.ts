import type { ComponentId, ComponentInfo } from '~/types';

/**
 * Simple object diff (shallow comparison)
 */
export function shallowDiff(
  prev: Record<string, any>,
  next: Record<string, any>,
): {
  added: Record<string, any>;
  removed: Record<string, any>;
  changed: Record<string, any>;
} {
  const added: Record<string, any> = {};
  const removed: Record<string, any> = {};
  const changed: Record<string, any> = {};

  // Check for added and changed
  for (const key in next) {
    if (!(key in prev)) {
      added[key] = next[key];
    } else if (prev[key] !== next[key]) {
      changed[key] = next[key];
    }
  }

  // Check for removed
  for (const key in prev) {
    if (!(key in next)) {
      removed[key] = prev[key];
    }
  }

  return { added, removed, changed };
}

/**
 * Build component tree from flat map
 */
export function buildComponentTree(
  components: Map<ComponentId, ComponentInfo>,
  rootIds: ComponentId[],
): ComponentInfo[] {
  return rootIds
    .map(id => {
      const component = components.get(id);
      if (!component) return null;

      return {
        ...component,
        // Recursively build children
        children: component.children.map(childId => {
          const child = components.get(childId);
          return child?.id || childId;
        }),
      };
    })
    .filter(Boolean) as ComponentInfo[];
}

/**
 * Flatten component tree to map
 */
export function flattenComponentTree(
  roots: ComponentInfo[],
): Map<ComponentId, ComponentInfo> {
  const map = new Map<ComponentId, ComponentInfo>();

  function traverse(component: ComponentInfo) {
    map.set(component.id, component);
    // Recursively traverse children if they are full objects
    component.children.forEach(child => {
      const childComponent =
        typeof child === 'string' ? null : (child as any as ComponentInfo);
      if (childComponent) {
        traverse(childComponent);
      }
    });
  }

  roots.forEach(traverse);
  return map;
}

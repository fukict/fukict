/**
 * @fukict/runtime - Renderer: Mount Nodes
 *
 * Mount DOM nodes to container
 */

/**
 * Mount node to container
 *
 * @param node - DOM node to mount
 * @param container - Container element
 */
export function mount(node: Node, container: Element): void {
  // Simply insert DOM (no lifecycle management)
  container.appendChild(node);
}

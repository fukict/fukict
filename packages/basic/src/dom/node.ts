/**
 * @fukict/runtime - DOM Node Operations
 *
 * Node manipulation functions
 */

/**
 * Append child to parent
 */
export function appendChild(parent: Node, child: Node): void {
  parent.appendChild(child);
}

/**
 * Remove child from parent
 */
export function removeChild(parent: Node, child: Node): void {
  parent.removeChild(child);
}

/**
 * Replace old child with new child
 */
export function replaceChild(
  parent: Node,
  newChild: Node,
  oldChild: Node,
): void {
  parent.replaceChild(newChild, oldChild);
}

/**
 * Insert new child before reference node
 */
export function insertBefore(
  parent: Node,
  newChild: Node,
  referenceNode: Node | null,
): void {
  parent.insertBefore(newChild, referenceNode);
}

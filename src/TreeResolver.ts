//
// TreeResolver
// ---
// @copyright (c) Damian Bushong <katana@odios.us>
// @license MIT license
//

import { TreeNode } from './interfaces/TreeNode'
import { TreeResolveQueue } from './interfaces/TreeResolveQueue'
import { TreeResolverResult } from './interfaces/TreeResolverResult'

/**
 * TreeResolver is a single-parent dependency resolution algorithm,
 *   made to resolve dependencies optimally whilst detecting unresolvable or circular dependencies.
 */
export class TreeResolver {
  protected nodes: TreeNode[] = []

  /**
   * Add an instance to the resolution tree.
   * @param  {string} instanceName - The name of this instance.
   * @param  {string | null} instanceParent - The name of the parent of this instance.
   * @param  {any} instance - An object instance to tie directly to the node, if desired.
   * @return {void}
   *
   * @example
   * ```
   * import { TreeResolver } from 'treeresolver'
   * const tree = new TreeResolver()
   *
   * // add nodes to use when building the dependency tree with individual TreeResolver.addInstance() calls
   * tree.addInstance('node 1')
   * tree.addInstance('node 2', 'node 1')
   *
   * // ...
   * ```
   */
  public addInstance (instanceName: string, instanceParent: string | null = null, instance?: any): void {
    let node: TreeNode = {
      name: instanceName,
      parent: instanceParent,
      parentNode: null,
      rootNode: null,
      children: {},

      allDescendants: {},
      allAncestors: {},

      instance: instance
    }

    this.nodes.push(node)
  }

  /**
   * Clears out all added instances, to allow the resolver to start fresh.
   * @return {void}
   *
   * @example
   * ```
   * import { TreeResolver } from 'treeresolver'
   * const tree = new TreeResolver()
   *
   * tree.addInstance('node 1')
   * tree.addInstance('node 2', 'node 1')
   *
   * // ...
   *
   * // actually, we changed our mind, clear out all the nodes to process.
   * tree.clear()
   * ```
   */
  /* istanbul ignore next */
  public clear (): void {
    this.nodes = []
  }

  /**
   * Build the dependency tree.
   * @return {Promise<TreeResolverResult>}
   *
   * @example
   * ```
   * import { TreeResolver } from 'treeresolver'
   * const tree = new TreeResolver()
   *
   * tree.addInstance('node 1')
   * tree.addInstance('node 2', 'node 1')
   *
   * (async () => {
   *   // build the tree, and then
   *   const res = await tree.build()
   *   console.dir(res)
   * })()
   * ```
   */
  public async build (): Promise<TreeResolverResult> {
    let result: TreeResolverResult = {
      nodes: {},
      nodeList: {},
      unlinkedNodes: []
    }
    let resolveQueue: TreeResolveQueue = {}
    let keyQueue: string[] = []

    // -- linker, first pass
    // sort everything out into the resolveQueue...
    //   resolveQueue will contain our "buckets" of processing, where during the second pass
    //   we'll iterate what's available in resolvedTree and then handle what's in the resolveQueue afterwards
    const promises = this.nodes.map(async (node: TreeNode) => {
      // orphan nodes are our roots for the tree - everything else MUST depend on them
      //   if something does not depend on a root (eventually), it will be considered an "unlinked node"
      if (!node.parent) {
        /* istanbul ignore else */
        if (!resolveQueue[node.name]) {
          resolveQueue[node.name] = []
        }
        result.nodes[node.name] = node

        keyQueue.push(node.name)
      } else {
        if (!resolveQueue[node.parent]) {
          resolveQueue[node.parent] = []
        }

        resolveQueue[node.parent].push(node)
      }

      result.nodeList[node.name] = node
    })
    await Promise.all(promises)

    // -- linker, second pass
    // unfortunately, we cannot use a foreach, for, or any other reasonable loop.
    //   we're forced to use a while loop in order to construct a "pump" queue structure for processing.
    let processKey: string | undefined = keyQueue.shift()
    while (processKey) {
      if (resolveQueue[processKey] && resolveQueue[processKey].length > 0) {
        resolveQueue[processKey].forEach((node: TreeNode) => {
          // minor guard, unnecessary except TypeScript can't comprehend
          //   that we guarded against it in the first pass
          /* istanbul ignore next */
          if (node.parent === null) { return }

          result.nodeList[node.parent].children[node.name] = node

          // store the parent node ref
          node.parentNode = result.nodeList[node.parent]
          node.allAncestors[node.parent] = node.parentNode

          // get rootNode ref from parent, or if parent doesn't have a rootNode, assume it *is* a rootNode
          node.rootNode = node.parentNode.rootNode || node.parentNode

          // add this node to every parent's .allDescendants property
          let parentNode = node
          while (parentNode.parent !== null) {
            // more guarding because TypeScript is stupid...
            /* istanbul ignore next */
            if (!parentNode.parentNode) { break }
            parentNode = parentNode.parentNode

            parentNode.allDescendants[node.name] = node
            node.allAncestors[parentNode.name] = parentNode
          }

          keyQueue.push(node.name)
        })
      }

      // we'll delete each set of entries in the resolveQueue so that whatever's left is only the unlinked nodes
      delete resolveQueue[processKey]

      processKey = keyQueue.shift()
    }

    // flatten out the resolveQueue obj into the unlinkedNodes array like it's chicken parm
    result.unlinkedNodes = Object.values(resolveQueue).reduce((unlinkedNodes: TreeNode[], nodes: TreeNode[]) => {
      return unlinkedNodes.concat(nodes)
    }, result.unlinkedNodes)

    return result
  }
}

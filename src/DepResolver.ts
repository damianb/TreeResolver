//
// TreeResolver
// ---
// @copyright (c) Damian Bushong <katana@odios.us>
// @license MIT license
//

import { DepNode } from './interfaces/DepNode'
import { DepResolveQueue } from './interfaces/DepResolveQueue'
import { DepResolverResult } from './interfaces/DepResolverResult'

/**
 * DepResolver is a multi-parent dependency resolution algorithm,
 *   made to resolve dependencies optimally whilst detecting unresolvable or circular dependencies.
 */
export class DepResolver {
  protected ingestNodes: DepNode[] = []

  /**
   * Add an instance to the resolution tree.
   * @param  {string} instanceName - The name of this instance.
   * @param  {string[] | string | undefined} instanceParents - (optional) The name of the parents of this instance. Coerced into an array if a single string is provided.
   * @param  {string[] | string | undefined} instanceOptParents - (optional) The name of any optional parents of this instance. Coerced into an array if a single string is provided.
   * @param  {any} instance - An object or anything really to tie to this instance.
   * @return {void}
   *
   * @example
   * ```
   * import { DepResolver } from 'treeresolver'
   * const tree = new DepResolver()
   *
   * // add nodes to use when building the dependency tree with individual DepResolver.addInstance() calls
   * tree.addInstance('node 1')
   * tree.addInstance('node 2', ['node 1'])
   * tree.addInstance('node 3', ['node 1', 'node 2'])
   *
   * // ...
   * ```
   */
  public addInstance (instanceName: string, instanceParents?: string[] | string, instanceOptParents?: string[] | string, instance?: any): void {
    let _parentNames: string[] = []
    let _optParentNames: string[] = []

    if (instanceParents !== undefined) {
      _parentNames = !Array.isArray(instanceParents) ? [instanceParents] : instanceParents
    }

    if (instanceOptParents !== undefined) {
      _optParentNames = !Array.isArray(instanceOptParents) ? [instanceOptParents] : instanceOptParents
    }

    let node: DepNode = {
      name: instanceName,
      parents: {},
      children: {},
      allDescendants: {},
      allAncestors: {},

      _parentNames: _parentNames,
      _optParentNames: _optParentNames,

      instance: instance
    }

    this.ingestNodes.push(node)
  }

  /**
   * Clears out all added instances, to allow the resolver to start fresh.
   * @return {void}
   *
   * @example
   * ```
   * import { DepResolver } from 'treeresolver'
   * const tree = new DepResolver()
   *
   * tree.addInstance('node 1')
   * tree.addInstance('node 2', ['node 1'])
   *
   * // ...
   *
   * // actually, we changed our mind, clear out all the nodes to process.
   * tree.clear()
   * ```
   */
  public clear (): void {
    this.ingestNodes = []
  }

  /**
   * Build the dependency tree.
   * @return {Promise<DepResolverResult>}
   *
   * @example
   * ```
   * import { DepResolver } from 'treeresolver'
   * const tree = new DepResolver()
   *
   * tree.addInstance('node 1')
   * tree.addInstance('node 2', ['node 1'])
   * tree.addInstance('node 3', ['node 1', 'node 2'])
   *
   * (async () => {
   *   // build the tree, and then
   *   const res = await tree.build()
   *   console.dir(res)
   * })()
   * ```
   */
  public async build (): Promise<DepResolverResult> {
    let result: DepResolverResult = {
      nodes: {},
      nodeList: {},
      unlinkedNodes: []
    }
    let resolveQueue: DepResolveQueue = {}
    let keyQueue: string[] = []

    // -- linker, first pass
    // sort everything out into the resolveQueue...
    //   resolveQueue will contain our "buckets" of processing, where during the second pass
    //   we'll iterate what's available in resolvedTree and then handle what's in the resolveQueue afterwards
    let promises = this.ingestNodes.map(async (node: DepNode) => {
      // orphan nodes are our roots for the tree - everything else MUST depend on them
      //   if something does not depend on a root (eventually), it will be considered an "unlinked node"
      if (node._parentNames.length === 0) {
        if (!resolveQueue[node.name]) {
          resolveQueue[node.name] = []
        }
        result.nodes[node.name] = node

        keyQueue.push(node.name)
      } else {
        node._parentNames.forEach((dependency: string) => {
          if (!resolveQueue[dependency]) {
            resolveQueue[dependency] = []
          }

          resolveQueue[dependency].push(node.name)
        })
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
        resolveQueue[processKey].forEach((nodeName: string) => {
          const node: DepNode = result.nodeList[nodeName]

          node._parentNames.forEach((parentName: string) => {
            const parentNode: DepNode = result.nodeList[parentName]

            parentNode.children[node.name] = parentNode.allDescendants[node.name] = node
            node.parents[parentName] = node.allAncestors[parentName] = parentNode

            // we also depend on whatever the parent depends on, so...
            Object.keys(parentNode.allAncestors).forEach((ancestorName: string) => {
              const ancestorNode: DepNode = result.nodeList[ancestorName]

              ancestorNode.allDescendants[node.name] = node
              node.allAncestors[ancestorName] = ancestorNode
            })
          })

          keyQueue.push(nodeName)
        })
      }

      // we'll delete each set of entries in the resolveQueue so that whatever's left is only the unlinked nodes
      delete resolveQueue[processKey]

      processKey = keyQueue.shift()
    }

    Object.keys(result.nodeList).forEach((nodeName: string) => {
      const node: DepNode = result.nodeList[nodeName]

      node._optParentNames.forEach((optDependencyName: string) => {
        if (!result.nodeList[optDependencyName]) {
          return
        }

        const parentNode: DepNode = result.nodeList[optDependencyName]

        parentNode.children[node.name] = parentNode.allDescendants[node.name] = node
        node.parents[optDependencyName] = node.allAncestors[optDependencyName] = parentNode

        Object.keys(parentNode.allAncestors).forEach((ancestorName: string) => {
          const ancestorNode: DepNode = result.nodeList[ancestorName]

          ancestorNode.allDescendants[node.name] = node
          node.allAncestors[ancestorName] = ancestorNode
        })
      })
    })

    // flatten out the resolveQueue obj into the unlinkedNodes array like it's chicken parm
    result.unlinkedNodes = Object.values(resolveQueue).reduce((unlinkedNodes: DepNode[], nodeNames: string[]) => {
      const nodes: DepNode[] = nodeNames.map((nodeName: string) => result.nodeList[nodeName])

      return unlinkedNodes.concat(nodes)
    }, result.unlinkedNodes)

    return result
  }
}

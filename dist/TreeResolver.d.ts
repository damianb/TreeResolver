import { TreeNode } from './interfaces/TreeNode';
import { TreeResolverResult } from './interfaces/TreeResolverResult';
/**
 * TreeResolver is a single-parent dependency resolution algorithm,
 *   made to resolve dependencies optimally whilst detecting unresolvable or circular dependencies.
 */
export declare class TreeResolver {
    protected nodes: TreeNode[];
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
    addInstance(instanceName: string, instanceParent?: string | null, instance?: any): void;
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
    clear(): void;
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
    build(): Promise<TreeResolverResult>;
}

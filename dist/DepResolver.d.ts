import { DepNode } from './interfaces/DepNode';
import { DepResolverResult } from './interfaces/DepResolverResult';
/**
 * DepResolver is a multi-parent dependency resolution algorithm,
 *   made to resolve dependencies optimally whilst detecting unresolvable or circular dependencies.
 */
export declare class DepResolver {
    protected ingestNodes: DepNode[];
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
    addInstance(instanceName: string, instanceParents?: string[] | string, instanceOptParents?: string[] | string, instance?: any): void;
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
    clear(): void;
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
    build(): Promise<DepResolverResult>;
}

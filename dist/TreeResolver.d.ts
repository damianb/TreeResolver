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
     * @param  {any} instance - An object instance to
     * @return {Promise<void>}
     */
    addInstance(instanceName: string, instanceParent: string | null, instance?: any): Promise<void>;
    /**
     * Clears out all added instances, to allow the resolver to start fresh.
     * @return {Promise<void>}
     */
    clear(): Promise<void>;
    /**
     * Build the dependency tree.
     * @return {Promise<TreeResolverResult>}
     */
    build(): Promise<TreeResolverResult>;
}

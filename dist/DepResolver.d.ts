import { DepNode } from './interfaces/DepNode';
import { DepResolverResult } from './interfaces/DepResolverResult';
/**
 * DepResolver is a multi-parent dependency resolution algorithm,
 *   made to resolve dependencies optimally whilst detecting unresolvable or circular dependencies.
 */
export declare class DepResolver {
    protected nodes: DepNode[];
    /**
     * Add an instance to the resolution tree.
     * @param  {string} instanceName - The name of this instance.
     * @param  {string[]} instanceParents - The name of the parents of this instance.
     * @param  {string[]} instanceOptParents - The name of any optional parents of this instance.
     * @param  {any} instance - An object or anything really to tie to this instance.
     * @return {Promise<void>}
     */
    addInstance(instanceName: string, instanceParents?: string[], instanceOptParents?: string[], instance?: any): Promise<void>;
    /**
     * Clears out all added instances, to allow the resolver to start fresh.
     * @return {Promise<void>}
     */
    clear(): Promise<void>;
    /**
     * Build the dependency tree.
     * @return {Promise<DepResolverResult>}
     */
    build(): Promise<DepResolverResult>;
}

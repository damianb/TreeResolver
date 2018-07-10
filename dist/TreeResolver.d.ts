export interface TreeNode {
    instance?: any;
    name: string;
    parent: string | null;
    parentNode: TreeNode | null;
    rootNode: TreeNode | null;
    children: {
        [index: string]: TreeNode;
    };
    allDescendants: {
        [index: string]: TreeNode;
    };
    allAncestors: {
        [index: string]: TreeNode;
    };
}
export interface TreeResolverResult {
    nodes: {
        [index: string]: TreeNode;
    };
    nodeList: {
        [index: string]: TreeNode;
    };
    unlinkedNodes: TreeNode[];
}
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

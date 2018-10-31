import { TreeNode } from './TreeNode';
export interface TreeResolverResult {
    nodes: {
        [index: string]: TreeNode;
    };
    nodeList: {
        [index: string]: TreeNode;
    };
    unlinkedNodes: TreeNode[];
}

import { TreeNodeMap } from './TreeNodeMap';
export interface TreeNode {
    instance?: any;
    name: string;
    parent: string | null;
    parentNode: TreeNode | null;
    rootNode: TreeNode | null;
    children: TreeNodeMap;
    allDescendants: TreeNodeMap;
    allAncestors: TreeNodeMap;
}

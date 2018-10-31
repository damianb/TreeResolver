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

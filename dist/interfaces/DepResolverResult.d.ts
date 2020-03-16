import { DepNode } from './DepNode';
import { DepNodeMap } from './DepNodeMap';
export interface DepResolverResult {
    nodes: DepNodeMap;
    nodeList: DepNodeMap;
    unlinkedNodes: DepNode[];
}

import { DepNode } from './DepNode';
import { NodeMap } from './NodeMap';
export interface DepResolverResult {
    nodes: NodeMap;
    nodeList: NodeMap;
    unlinkedNodes: DepNode[];
}

import { NodeMap } from './NodeMap';
export interface DepNode {
    instance?: any;
    name: string;
    parents: NodeMap;
    children: NodeMap;
    allDescendants: NodeMap;
    allAncestors: NodeMap;
    _parentNames: string[];
    _optParentNames: string[];
}

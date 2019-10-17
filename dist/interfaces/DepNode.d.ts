import { DepNodeMap } from './DepNodeMap';
export interface DepNode {
    instance?: any;
    name: string;
    parents: DepNodeMap;
    children: DepNodeMap;
    allDescendants: DepNodeMap;
    allAncestors: DepNodeMap;
    _parentNames: string[];
    _optParentNames: string[];
}

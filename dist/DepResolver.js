"use strict";
//
// TreeResolver
// ---
// @copyright (c) Damian Bushong <katana@odios.us>
// @license MIT license
//
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * DepResolver is a multi-parent dependency resolution algorithm,
 *   made to resolve dependencies optimally whilst detecting unresolvable or circular dependencies.
 */
class DepResolver {
    constructor() {
        this.nodes = [];
    }
    /**
     * Add an instance to the resolution tree.
     * @param  {string} instanceName - The name of this instance.
     * @param  {string[]} instanceParents - The name of the parents of this instance.
     * @param  {string[]} instanceOptParents - The name of any optional parents of this instance.
     * @param  {any} instance - An object or anything really to tie to this instance.
     * @return {Promise<void>}
     */
    async addInstance(instanceName, instanceParents, instanceOptParents, instance) {
        let node = {
            name: instanceName,
            parents: {},
            children: {},
            allDescendants: {},
            allAncestors: {},
            _parentNames: instanceParents || [],
            _optParentNames: instanceOptParents || [],
            instance: instance
        };
        this.nodes.push(node);
    }
    /**
     * Clears out all added instances, to allow the resolver to start fresh.
     * @return {Promise<void>}
     */
    async clear() {
        this.nodes = [];
    }
    /**
     * Build the dependency tree.
     * @return {Promise<DepResolverResult>}
     */
    async build() {
        let result = {
            nodes: {},
            nodeList: {},
            unlinkedNodes: []
        };
        let resolveQueue = {};
        let keyQueue = [];
        // -- linker, first pass
        // sort everything out into the resolveQueue...
        //   resolveQueue will contain our "buckets" of processing, where during the second pass
        //   we'll iterate what's available in resolvedTree and then handle what's in the resolveQueue afterwards
        let promises = this.nodes.map(async (node) => {
            // orphan nodes are our roots for the tree - everything else MUST depend on them
            //   if something does not depend on a root (eventually), it will be considered an "unlinked node"
            if (node._parentNames.length === 0) {
                if (!resolveQueue[node.name]) {
                    resolveQueue[node.name] = [];
                }
                result.nodes[node.name] = node;
                keyQueue.push(node.name);
            }
            else {
                node._parentNames.forEach((dependency) => {
                    if (!resolveQueue[dependency]) {
                        resolveQueue[dependency] = [];
                    }
                    resolveQueue[dependency].push(node.name);
                });
            }
            result.nodeList[node.name] = node;
        });
        await Promise.all(promises);
        // -- linker, second pass
        // unfortunately, we cannot use a foreach, for, or any other reasonable loop.
        //   we're forced to use a while loop in order to construct a "pump" queue structure for processing.
        let processKey = keyQueue.shift();
        while (processKey) {
            if (resolveQueue[processKey] && resolveQueue[processKey].length > 0) {
                resolveQueue[processKey].forEach((nodeName) => {
                    const node = result.nodeList[nodeName];
                    node._parentNames.forEach((parentName) => {
                        const parentNode = result.nodeList[parentName];
                        parentNode.children[node.name] = parentNode.allDescendants[node.name] = node;
                        node.parents[parentName] = node.allAncestors[parentName] = parentNode;
                        // we also depend on whatever the parent depends on, so...
                        Object.keys(parentNode.allAncestors).forEach((ancestorName) => {
                            const ancestorNode = result.nodeList[ancestorName];
                            ancestorNode.allDescendants[node.name] = node;
                            node.allAncestors[ancestorName] = ancestorNode;
                        });
                    });
                    keyQueue.push(nodeName);
                });
            }
            // we'll delete each set of entries in the resolveQueue so that whatever's left is only the unlinked nodes
            delete resolveQueue[processKey];
            processKey = keyQueue.shift();
        }
        Object.keys(result.nodeList).forEach((nodeName) => {
            const node = result.nodeList[nodeName];
            node._optParentNames.forEach((optDependencyName) => {
                if (!result.nodeList[optDependencyName]) {
                    return;
                }
                const parentNode = result.nodeList[optDependencyName];
                parentNode.children[node.name] = parentNode.allDescendants[node.name] = node;
                node.parents[optDependencyName] = node.allAncestors[optDependencyName] = parentNode;
                Object.keys(parentNode.allAncestors).forEach((ancestorName) => {
                    const ancestorNode = result.nodeList[ancestorName];
                    ancestorNode.allDescendants[node.name] = node;
                    node.allAncestors[ancestorName] = ancestorNode;
                });
            });
        });
        // flatten out the resolveQueue obj into the unlinkedNodes array like it's chicken parm
        result.unlinkedNodes = Object.values(resolveQueue).reduce((unlinkedNodes, nodeNames) => {
            const nodes = nodeNames.map((nodeName) => result.nodeList[nodeName]);
            return unlinkedNodes.concat(nodes);
        }, result.unlinkedNodes);
        return result;
    }
}
exports.DepResolver = DepResolver;
//# sourceMappingURL=DepResolver.js.map
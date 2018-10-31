"use strict";
//
// TreeResolver
// ---
// @copyright (c) Damian Bushong <katana@odios.us>
// @license MIT license
//
Object.defineProperty(exports, "__esModule", { value: true });
class TreeResolver {
    constructor() {
        this.nodes = [];
    }
    /**
     * Add an instance to the resolution tree.
     * @param  {string} instanceName - The name of this instance.
     * @param  {string | null} instanceParent - The name of the parent of this instance.
     * @param  {any} instance - An object instance to
     * @return {Promise<void>}
     */
    async addInstance(instanceName, instanceParent, instance) {
        let node = {
            name: instanceName,
            parent: instanceParent,
            parentNode: null,
            rootNode: null,
            children: {},
            allDescendants: {},
            allAncestors: {}
        };
        if (instance) {
            node.instance = instance;
        }
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
     * @return {Promise<TreeResolverResult>}
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
        const promises = this.nodes.map(async (node) => {
            // orphan nodes are our roots for the tree - everything else MUST depend on them
            //   if something does not depend on a root (eventually), it will be considered an "unlinked node"
            if (!node.parent) {
                if (!resolveQueue[node.name]) {
                    resolveQueue[node.name] = [];
                }
                result.nodes[node.name] = node;
                keyQueue.push(node.name);
            }
            else {
                if (!resolveQueue[node.parent]) {
                    resolveQueue[node.parent] = [];
                }
                resolveQueue[node.parent].push(node);
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
                resolveQueue[processKey].forEach((node) => {
                    // minor guard, unnecessary except TypeScript can't comprehend
                    //   that we guarded against it in the first pass
                    if (node.parent === null) {
                        return;
                    }
                    result.nodeList[node.parent].children[node.name] = node;
                    // store the parent node ref
                    node.parentNode = result.nodeList[node.parent];
                    node.allAncestors[node.parent] = node.parentNode;
                    // get rootNode ref from parent, or if parent doesn't have a rootNode, assume it *is* a rootNode
                    node.rootNode = node.parentNode.rootNode || node.parentNode;
                    // add this node to every parent's .allDescendants property
                    let parentNode = node;
                    while (parentNode.parent !== null) {
                        // more guarding because TypeScript is stupid...
                        if (!parentNode.parentNode) {
                            break;
                        }
                        parentNode = parentNode.parentNode;
                        parentNode.allDescendants[node.name] = node;
                        node.allAncestors[parentNode.name] = parentNode;
                    }
                    keyQueue.push(node.name);
                });
            }
            // we'll delete each set of entries in the resolveQueue so that whatever's left is only the unlinked nodes
            delete resolveQueue[processKey];
            processKey = keyQueue.shift();
        }
        // flatten out the resolveQueue obj into the unlinkedNodes array like it's chicken parm
        result.unlinkedNodes = Object.values(resolveQueue).reduce((unlinkedNodes, nodes) => {
            return unlinkedNodes.concat(nodes);
        }, result.unlinkedNodes);
        return result;
    }
}
exports.TreeResolver = TreeResolver;
//# sourceMappingURL=TreeResolver.js.map
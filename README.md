# TreeResolver

TreeResolver is dependency resolution library, made to resolve dependencies optimally whilst detecting unresolvable or circular dependencies.

TreeResolver itself provides single-parent dependency resolution, whilst DepResolver provides multi-parent dependency resolution.

Written in TypeScript.

## license

MIT license; see ./LICENSE

## documentation

Automatically generated documentation is available in /docs/.

### TreeResolver - Single-parent dependency resolution

Usage is fairly simple.  Create a new TreeResolver instance, add new instances by declaring their names, dependencies, and optional dependencies, and then build the relationship tree.
The result should be a well-structured dependency tree free of unresolvable and circular dependencies.

``` ts
import { TreeResolver } from 'TreeResolver'
const tree = new TreeResolver()

(async () => {
  tree.addInstance('node 1')
  tree.addInstance('node 2', 'node 1')
  tree.addInstance('node 3', 'node 4') // node 4 does not exist...
  tree.addInstance('node 5', 'node 2')

  const res = await tree.build()
  console.dir(res)
})()
/*
> { nodes:
   { 'node 1':
      { name: 'node 1',
        parent: undefined,
        parentNode: null,
        rootNode: null,
        children: [Object],
        allDescendants: [Object],
        allAncestors: {} } },
  nodeList:
   { 'node 1':
      { name: 'node 1',
        parent: undefined,
        parentNode: null,
        rootNode: null,
        children: [Object],
        allDescendants: [Object],
        allAncestors: {} },
     'node 2':
      { name: 'node 2',
        parent: 'node 1',
        parentNode: [Object],
        rootNode: [Object],
        children: [Object],
        allDescendants: [Object],
        allAncestors: [Object] },
     'node 3':
      { name: 'node 3',
        parent: 'node 4',
        parentNode: null,
        rootNode: null,
        children: {},
        allDescendants: {},
        allAncestors: {} },
     'node 5':
      { name: 'node 5',
        parent: 'node 2',
        parentNode: [Object],
        rootNode: [Object],
        children: {},
        allDescendants: {},
        allAncestors: [Object] } },
  unlinkedNodes:
   [ { name: 'node 3',
       parent: 'node 4',
       parentNode: null,
       rootNode: null,
       children: {},
       allDescendants: {},
       allAncestors: {} } ] }
 */

// nodes will contain a hierarchial tree map, keyed by name of the node
// nodeList will contain ALL nodes that were able to be mapped, keyed by the name of the node
// unlinkedNodes will contain an array of all nodes which could not be mapped, such as if
//   they had unresolvable dependencies or a circular dependency.
```

### DepResolver - Multi-parent dependency resolution

Usage is fairly simple.  Create a new DepResolver instance, add new instances by declaring their names, dependencies, and optional dependencies, and then build the relationship tree.
The result should be a well-structured dependency tree free of unresolvable and circular dependencies.

``` ts
import { DepResolver } from 'DepResolver'
const tree = new DepResolver()

(async () => {
  tree.addInstance('node 1')
  tree.addInstance('node 2', [], ['node 4']) // has an optional dependency on "node 4", which will not exist
  tree.addInstance('node 3', ['node 2'])
  tree.addInstance('node 5', ['node 1', 'node 2', 'node 3'])

  const res = await tree.build()
  console.dir(res)
})()

/*
> { nodes:
   { 'node 1':
      { name: 'node 1',
        parents: {},
        children: [Object],
        allDescendants: [Object],
        allAncestors: {},
        _parentNames: [],
        _optParentNames: [] },
     'node 2':
      { name: 'node 2',
        parents: {},
        children: [Object],
        allDescendants: [Object],
        allAncestors: {},
        _parentNames: [],
        _optParentNames: [Array] } },
  nodeList:
   { 'node 1':
      { name: 'node 1',
        parents: {},
        children: [Object],
        allDescendants: [Object],
        allAncestors: {},
        _parentNames: [],
        _optParentNames: [] },
     'node 2':
      { name: 'node 2',
        parents: {},
        children: [Object],
        allDescendants: [Object],
        allAncestors: {},
        _parentNames: [],
        _optParentNames: [Array] },
     'node 3':
      { name: 'node 3',
        parents: [Object],
        children: [Object],
        allDescendants: [Object],
        allAncestors: [Object],
        _parentNames: [Array],
        _optParentNames: [] },
     'node 5':
      { name: 'node 5',
        parents: [Object],
        children: {},
        allDescendants: {},
        allAncestors: [Object],
        _parentNames: [Array],
        _optParentNames: [] } },
  unlinkedNodes: [] }
 */

// upon closer inspection of the tree, you'll notice that the node
//   for 'node 2' contains its appropriate descendants in correct lineage, along with others.
//
// nodes will contain a hierarchial tree map, keyed by name of the node
// nodeList will contain ALL nodes that were able to be mapped, keyed by the name of the node
// unlinkedNodes will contain an array of all nodes which could not be mapped, such as if
//   they had unresolvable dependencies or a circular dependency.
```

## tests

use `yarn test` to run unit tests

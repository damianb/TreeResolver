# TreeResolver

TreeResolver is a single-parent dependency resolution algorithm, made to resolve dependencies optimally whilst detecting unresolvable or circular dependencies.

Written in TypeScript.

## license

MIT license; see ./LICENSE

## documentation

Automatically generated documentation is available in /docs/.

Usage is fairly simple.  Create a new TreeResolver instance, add new instances by declaring their names, dependencies, and optional dependencies, and then build the relationship tree.
The result should be a well-structured dependency tree free of unresolvable and circular dependencies.

``` ts
import { TreeResolver } from 'TreeResolver'
const tree = new TreeResolver()

(async () => {
  await tree.addInstance('node 1')
  await tree.addInstance('node 2', 'node 1')
  await tree.addInstance('node 3', 'node 4') // node 4 does not exist...
  await tree.addInstance('node 5', 'node 2')

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

## tests

use `npm t` to run unit tests

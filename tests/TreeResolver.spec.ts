import { expect } from 'chai'
import { TreeResolver } from '../src/index'

import { TreeNode } from '../src/interfaces/TreeNode'

interface InstanceInput {
  name: string
  parent?: string
}

const wrapInstanceHelper = (instance: InstanceInput): TreeNode => {
  return {
    name: instance.name,
    parent: instance.parent || null,
    parentNode: null,
    rootNode: null,
    children: {},

    allDescendants: {},
    allAncestors: {},

    instance: undefined
  }
}

describe('TreeResolver', () => {
  let nodes: { [index: string]: TreeNode } = {}
  let nodeList: { [index: string]: TreeNode } = {}
  let unlinkedNodes: Array<TreeNode> = []

  beforeEach(async () => {
    /**
     * the constructed tree should look similar to this:
     *
     *      A        E
     *     / \       |
     *    B   C      F
     *    |
     *    D
     *
     * with [G, H, I] left dangling in unlinkedNodes
     */
    const instances: InstanceInput[] = [
      { name: 'a' },
      { name: 'b', parent: 'a' },
      { name: 'c', parent: 'a' },
      { name: 'd', parent: 'b' },
      { name: 'e' },
      { name: 'f', parent: 'e' },
      { name: 'g', parent: 'z' },
      { name: 'h', parent: 'i' },
      { name: 'i', parent: 'h' }
    ]

    const tree = new TreeResolver()
    await Promise.all(instances.map((instance: InstanceInput) => {
      return tree.addInstance(instance.name, instance.parent || null)
    }))
    const res = await tree.build()
    nodes = res.nodes
    nodeList = res.nodeList
    unlinkedNodes = res.unlinkedNodes
  })

  it('should correctly determine the root nodes', () => {
    expect(Object.keys(nodes).length).to.equal(2)
    expect(nodes).to.have.all.keys('a', 'e')
  })

  it('should correctly handled unlinked nodes', () => {
    expect(unlinkedNodes).to.have.lengthOf(3)

    expect(unlinkedNodes).to.deep.include(wrapInstanceHelper({ name: 'g', parent: 'z' }))
    expect(unlinkedNodes).to.deep.include(wrapInstanceHelper({ name: 'i', parent: 'h' }))
    expect(unlinkedNodes).to.deep.include(wrapInstanceHelper({ name: 'h', parent: 'i' }))
  })

  it('should correctly build parent-child relationships', () => {
    expect(nodes['a'].children).to.have.all.keys('b', 'c')
    expect(nodes['a'].children['b']).to.equal(nodeList['b'])
    expect(nodeList['b'].parentNode).to.equal(nodeList['a'])
    expect(nodes['a'].children['c']).to.equal(nodeList['c'])
    expect(nodeList['c'].parentNode).to.equal(nodeList['a'])

    expect(nodeList['b'].children).to.have.all.keys('d')
    expect(nodeList['b'].children['d']).to.equal(nodeList['d'])
    expect(nodeList['d'].parentNode).to.equal(nodeList['b'])

    expect(nodes['e'].children).to.have.all.keys('f')
    expect(nodes['e'].children['f']).to.equal(nodeList['f'])
    expect(nodeList['f'].parentNode).to.equal(nodeList['e'])
  })

  it('should correctly list all descendants under parent nodes', () => {
    expect(nodes['a'].allDescendants).to.have.all.keys('b', 'c', 'd')
    expect(nodes['a'].allDescendants['b']).to.equal(nodeList['b'])
    expect(nodes['a'].allDescendants['c']).to.equal(nodeList['c'])
    expect(nodes['a'].allDescendants['d']).to.equal(nodeList['d'])

    expect(nodeList['b'].allDescendants).to.have.all.keys('d')
    expect(nodeList['b'].allDescendants['d']).to.equal(nodeList['d'])

    expect(nodes['e'].allDescendants).to.have.all.keys('f')
    expect(nodes['e'].allDescendants['f']).to.equal(nodeList['f'])
  })

  it('should correctly link descendants to their root node', () => {
    expect(nodeList['b'].rootNode).to.equal(nodeList['a'])
    expect(nodeList['c'].rootNode).to.equal(nodeList['a'])
    expect(nodeList['d'].rootNode).to.equal(nodeList['a'])

    expect(nodeList['f'].rootNode).to.equal(nodeList['e'])
  })

  it('should correctly list all ancestors in child nodes', () => {
    expect(nodeList['b'].allAncestors).to.have.all.keys('a')
    expect(nodeList['b'].allAncestors['a']).to.equal(nodeList['a'])

    expect(nodeList['c'].allAncestors).to.have.all.keys('a')
    expect(nodeList['c'].allAncestors['a']).to.equal(nodeList['a'])

    expect(nodeList['d'].allAncestors).to.have.all.keys('a', 'b')
    expect(nodeList['d'].allAncestors['a']).to.equal(nodeList['a'])
    expect(nodeList['d'].allAncestors['b']).to.equal(nodeList['b'])

    expect(nodeList['f'].allAncestors).to.have.all.keys('e')
    expect(nodeList['f'].allAncestors['e']).to.equal(nodeList['e'])
  })

  it('should be able to traverse the tree through the nodes object', () => {
    expect(nodes['a'].children['b'].children['d']).to.equal(nodeList['d'])
  })
})

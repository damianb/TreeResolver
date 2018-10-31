import { expect } from 'chai'
import { DepResolver } from './../src/index'

import { DepNode } from '../src/interfaces/DepNode'

interface InstanceInput {
  name: string
  parents?: string[]
  optParents?: string[]
}

const wrapInstanceHelper = (instance: InstanceInput): DepNode => {
  return {
    name: instance.name,
    children: {},
    parents: {},
    allDescendants: {},
    allAncestors: {},

    _parentNames: instance.parents || [],
    _optParentNames: instance.optParents || [],

    instance: undefined
  }
}

describe('DepResolver', () => {
  let nodes: { [index: string]: DepNode } = {}
  let nodeList: { [index: string]: DepNode } = {}
  let unlinkedNodes: Array<DepNode> = []

  beforeEach(async () => {
    /**
     * the constructed dependency tree should look similar to this:
     *
     *           H
     *          /\
     *         /  \
     *        /    \
     *       /      \
     *      E        \
     *     /|\        \
     *    | | D       G
     *    | | |\     /|
     *    | | | \   / |       K
     *    |  \|  \ /  |       |
     *    A   B   C   F   I   J
     *
     * with [L, M, N] left dangling in unlinkedNodes
     */
    const instances: InstanceInput[] = [
      { name: 'a' },
      { name: 'b' },
      { name: 'c' },
      { name: 'd', parents: ['b', 'c'] },
      { name: 'e', parents: ['a', 'b', 'd'] },
      { name: 'f' },
      { name: 'g', parents: ['c', 'f'] },
      { name: 'h', parents: ['e', 'g'] },
      { name: 'i' },
      { name: 'j' },
      { name: 'k', parents: ['j'] },
      { name: 'l', parents: ['z'] },
      { name: 'm', parents: ['n'] },
      { name: 'n', parents: ['m'] }
    ]

    const tree = new DepResolver()
    await Promise.all(instances.map((instance: InstanceInput) => {
      return tree.addInstance(instance.name, instance.parents || [], instance.optParents || [])
    }))
    const res = await tree.build()
    nodes = res.nodes
    nodeList = res.nodeList
    unlinkedNodes = res.unlinkedNodes
  })

  it('should correctly determine the root nodes', () => {
    expect(Object.keys(nodes).length).to.equal(6)
    expect(nodes).to.have.all.keys('a', 'b', 'c', 'f', 'i', 'j')
  })

  it('should correctly handled unlinked nodes', () => {
    expect(unlinkedNodes).to.have.lengthOf(3)

    expect(unlinkedNodes).to.deep.include(wrapInstanceHelper({ name: 'l', parents: ['z'] }))
    expect(unlinkedNodes).to.deep.include(wrapInstanceHelper({ name: 'm', parents: ['n'] }))
    expect(unlinkedNodes).to.deep.include(wrapInstanceHelper({ name: 'n', parents: ['m'] }))
  })

  it('should correctly build immediate dependency relationships', () => {
    expect(nodeList['a'].parents).to.deep.equal({})

    expect(nodeList['b'].parents).to.deep.equal({})

    expect(nodeList['c'].parents).to.deep.equal({})

    expect(nodeList['d'].parents).to.have.all.keys('b', 'c')
    expect(nodeList['d'].parents['b']).to.equal(nodeList['b'])
    expect(nodeList['d'].parents['c']).to.equal(nodeList['c'])

    expect(nodeList['e'].parents).to.have.all.keys('a', 'b', 'd')
    expect(nodeList['e'].parents['a']).to.equal(nodeList['a'])
    expect(nodeList['e'].parents['b']).to.equal(nodeList['b'])
    expect(nodeList['e'].parents['d']).to.equal(nodeList['d'])

    expect(nodeList['f'].parents).to.deep.equal({})

    expect(nodeList['g'].parents).to.have.all.keys('c', 'f')
    expect(nodeList['g'].parents['c']).to.equal(nodeList['c'])
    expect(nodeList['g'].parents['f']).to.equal(nodeList['f'])

    expect(nodeList['h'].parents).to.have.all.keys('e', 'g')
    expect(nodeList['h'].parents['e']).to.equal(nodeList['e'])
    expect(nodeList['h'].parents['g']).to.equal(nodeList['g'])

    expect(nodeList['i'].parents).to.deep.equal({})

    expect(nodeList['j'].parents).to.deep.equal({})

    expect(nodeList['k'].parents).to.have.all.keys('j')
    expect(nodeList['k'].parents['j']).to.equal(nodeList['j'])
  })

  it('should correctly build immediate dependant relationships', () => {
    expect(nodeList['a'].children).to.have.all.keys('e')
    expect(nodeList['a'].children['e']).to.equal(nodeList['e'])

    expect(nodeList['b'].children).to.have.all.keys('d', 'e')
    expect(nodeList['b'].children['d']).to.equal(nodeList['d'])
    expect(nodeList['b'].children['e']).to.equal(nodeList['e'])

    expect(nodeList['c'].children).to.have.all.keys('d', 'g')
    expect(nodeList['c'].children['d']).to.equal(nodeList['d'])
    expect(nodeList['c'].children['g']).to.equal(nodeList['g'])

    expect(nodeList['d'].children).to.have.all.keys('e')
    expect(nodeList['d'].children['e']).to.equal(nodeList['e'])

    expect(nodeList['e'].children).to.have.all.keys('h')
    expect(nodeList['e'].children['h']).to.equal(nodeList['h'])

    expect(nodeList['f'].children).to.have.all.keys('g')
    expect(nodeList['f'].children['g']).to.equal(nodeList['g'])

    expect(nodeList['g'].children).to.have.all.keys('h')
    expect(nodeList['g'].children['h']).to.equal(nodeList['h'])

    expect(nodeList['h'].children).to.deep.equal({})

    expect(nodeList['i'].children).to.deep.equal({})

    expect(nodeList['j'].children).to.have.all.keys('k')
    expect(nodeList['j'].children['k']).to.equal(nodeList['k'])

    expect(nodeList['k'].children).to.deep.equal({})
  })

  it('should correctly build extended dependency relationships', () => {
    expect(nodeList['a'].allAncestors).to.deep.equal({})

    expect(nodeList['b'].allAncestors).to.deep.equal({})

    expect(nodeList['c'].allAncestors).to.deep.equal({})

    expect(nodeList['d'].allAncestors).to.have.all.keys('b', 'c')
    expect(nodeList['d'].allAncestors['b']).to.equal(nodeList['b'])
    expect(nodeList['d'].allAncestors['c']).to.equal(nodeList['c'])

    expect(nodeList['e'].allAncestors).to.have.all.keys('a', 'b', 'c', 'd')
    expect(nodeList['e'].allAncestors['a']).to.equal(nodeList['a'])
    expect(nodeList['e'].allAncestors['b']).to.equal(nodeList['b'])
    expect(nodeList['e'].allAncestors['c']).to.equal(nodeList['c'])
    expect(nodeList['e'].allAncestors['d']).to.equal(nodeList['d'])

    expect(nodeList['f'].allAncestors).to.deep.equal({})

    expect(nodeList['g'].allAncestors).to.have.all.keys('c', 'f')
    expect(nodeList['g'].allAncestors['c']).to.equal(nodeList['c'])
    expect(nodeList['g'].allAncestors['f']).to.equal(nodeList['f'])

    expect(nodeList['h'].allAncestors).to.have.all.keys('a', 'b', 'c', 'd', 'e', 'f', 'g')
    expect(nodeList['h'].allAncestors['a']).to.equal(nodeList['a'])
    expect(nodeList['h'].allAncestors['b']).to.equal(nodeList['b'])
    expect(nodeList['h'].allAncestors['c']).to.equal(nodeList['c'])
    expect(nodeList['h'].allAncestors['d']).to.equal(nodeList['d'])
    expect(nodeList['h'].allAncestors['e']).to.equal(nodeList['e'])
    expect(nodeList['h'].allAncestors['f']).to.equal(nodeList['f'])
    expect(nodeList['h'].allAncestors['g']).to.equal(nodeList['g'])

    expect(nodeList['i'].allAncestors).to.deep.equal({})

    expect(nodeList['j'].allAncestors).to.deep.equal({})

    expect(nodeList['k'].allAncestors).to.have.all.keys('j')
    expect(nodeList['k'].allAncestors['j']).to.equal(nodeList['j'])
  })

  it('should correctly build extended dependant relationships', () => {
    expect(nodeList['a'].allDescendants).to.have.all.keys('e', 'h')
    expect(nodeList['a'].allDescendants['e']).to.equal(nodeList['e'])
    expect(nodeList['a'].allDescendants['h']).to.equal(nodeList['h'])

    expect(nodeList['b'].allDescendants).to.have.all.keys('d', 'e', 'h')
    expect(nodeList['b'].allDescendants['d']).to.equal(nodeList['d'])
    expect(nodeList['b'].allDescendants['e']).to.equal(nodeList['e'])
    expect(nodeList['b'].allDescendants['h']).to.equal(nodeList['h'])

    expect(nodeList['c'].allDescendants).to.have.all.keys('d', 'e', 'g', 'h')
    expect(nodeList['c'].allDescendants['d']).to.equal(nodeList['d'])
    expect(nodeList['c'].allDescendants['e']).to.equal(nodeList['e'])
    expect(nodeList['c'].allDescendants['g']).to.equal(nodeList['g'])
    expect(nodeList['c'].allDescendants['h']).to.equal(nodeList['h'])

    expect(nodeList['d'].allDescendants).to.have.all.keys('e', 'h')
    expect(nodeList['d'].allDescendants['e']).to.equal(nodeList['e'])
    expect(nodeList['d'].allDescendants['h']).to.equal(nodeList['h'])

    expect(nodeList['e'].allDescendants).to.have.all.keys('h')
    expect(nodeList['e'].allDescendants['h']).to.equal(nodeList['h'])

    expect(nodeList['f'].allDescendants).to.have.all.keys('g', 'h')
    expect(nodeList['f'].allDescendants['g']).to.equal(nodeList['g'])
    expect(nodeList['f'].allDescendants['h']).to.equal(nodeList['h'])

    expect(nodeList['g'].allDescendants).to.have.all.keys('h')
    expect(nodeList['g'].allDescendants['h']).to.equal(nodeList['h'])

    expect(nodeList['h'].allDescendants).to.deep.equal({})

    expect(nodeList['i'].allDescendants).to.deep.equal({})

    expect(nodeList['j'].allDescendants).to.have.all.keys('k')
    expect(nodeList['j'].allDescendants['k']).to.equal(nodeList['k'])

    expect(nodeList['k'].allDescendants).to.deep.equal({})
  })

  it('should be able to traverse the tree through the nodes object', () => {
    expect(nodes['c'].children['d'].children['e'].children['h']).to.equal(nodeList['h'])
    expect(nodeList['h'].parents['e'].parents['d'].parents['b']).to.equal(nodeList['b'])
  })
})

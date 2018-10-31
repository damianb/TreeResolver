//
// TreeResolver
// ---
// @copyright (c) Damian Bushong <katana@odios.us>
// @license MIT license
//

import { DepNode } from './DepNode'
import { NodeMap } from './NodeMap'

export interface DepResolverResult {
  nodes: NodeMap
  nodeList: NodeMap
  unlinkedNodes: DepNode[]
}

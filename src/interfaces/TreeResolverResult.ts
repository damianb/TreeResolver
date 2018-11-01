//
// TreeResolver
// ---
// @copyright (c) Damian Bushong <katana@odios.us>
// @license MIT license
//

import { TreeNode } from './TreeNode'
import { TreeNodeMap } from './TreeNodeMap'

export interface TreeResolverResult {
  nodes: TreeNodeMap
  nodeList: TreeNodeMap
  unlinkedNodes: TreeNode[]
}

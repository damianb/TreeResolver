//
// TreeResolver
// ---
// @copyright (c) Damian Bushong <katana@odios.us>
// @license MIT license
//

import { TreeNode } from './TreeNode'

export interface TreeResolverResult {
  nodes: { [index: string]: TreeNode }
  nodeList: { [index: string]: TreeNode }
  unlinkedNodes: TreeNode[]
}

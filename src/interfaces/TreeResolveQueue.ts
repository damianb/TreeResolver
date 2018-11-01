//
// TreeResolver
// ---
// @copyright (c) Damian Bushong <katana@odios.us>
// @license MIT license
//

import { TreeNode } from './TreeNode'

export interface TreeResolveQueue {
  [index: string]: TreeNode[]
}

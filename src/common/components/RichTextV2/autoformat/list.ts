import { AutoformatRule } from '@udecode/plate-autoformat'
import { ELEMENT_LI, ELEMENT_OL, ELEMENT_UL } from '@udecode/plate-list'

import { clearBlockFormat, formatList } from './utils'

/**
 * Reference
 * https://github.com/udecode/plate/blob/main/docs/src/live/config/autoformat/autoformatLists.ts
 */
export const autoformatLists: AutoformatRule[] = [
  {
    mode: 'block',
    type: ELEMENT_LI,
    match: ['* ', '- '],
    preFormat: clearBlockFormat,
    format: (editor) => formatList(editor, ELEMENT_UL),
  },
  {
    mode: 'block',
    type: ELEMENT_LI,
    match: ['1. ', '1) '],
    preFormat: clearBlockFormat,
    format: (editor) => formatList(editor, ELEMENT_OL),
  },
]

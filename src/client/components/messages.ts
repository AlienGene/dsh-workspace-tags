/**
 * Human copy for a tag-name validation code.
 * @param code - validation failure.
 * @param t - localized translator.
 * @returns the localized message.
 */
import { MAX_TAG_TEXT } from '../../protocol.ts'
import type { TagNameErrorCode } from '../store.ts'
import type { Translate } from '../types.ts'

export function nameErrorMessage(code: TagNameErrorCode, t: Translate): string {
  switch (code) {
    case 'empty':
      return t('error.empty')
    case 'duplicate':
      return t('error.duplicate')
    case 'too-long':
      return t('error.tooLong', { max: MAX_TAG_TEXT })
  }
}

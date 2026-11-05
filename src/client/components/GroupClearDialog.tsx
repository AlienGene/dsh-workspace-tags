/**
 * Confirmation dialog for removing a tag from its whole group.
 *
 * Opened by the group row's remove action; the request lives in the store so
 * the dialog survives the row's repaint. The modal primitive owns focus,
 * Escape and the portal.
 *
 * @module dsh-workspace-tags/client/components/GroupClearDialog
 */
import type { ReactNode } from 'react'
import { Button, Modal } from '@deepseek-ai/dsh-client-ui-primitives'
import type { ClientTagSnapshot } from '../store.ts'
import type { Translate } from '../types.ts'

/** Props of {@link GroupClearDialog}. */
export interface GroupClearDialogProps {
  snapshot: ClientTagSnapshot
  t: Translate
  onDismiss: () => void
  onConfirm: () => void
}

/**
 * @param props - snapshot plus the confirm/dismiss actions.
 * @returns the dialog, or null while no request is pending.
 */
export function GroupClearDialog({ snapshot, t, onDismiss, onConfirm }: GroupClearDialogProps): ReactNode {
  const request = snapshot.groupClear
  if (request === null) return null
  const count = request.workspaceIds.length
  return (
    <Modal
      open
      onClose={onDismiss}
      title={t('group.clear.title', { name: request.tagName })}
      closeLabel={t('common.close')}
      footer={
        <>
          <Button variant="outline" onClick={onDismiss}>
            {t('group.clear.back')}
          </Button>
          <Button variant="primary" onClick={onConfirm}>
            {t('group.clear.confirm')}
          </Button>
        </>
      }
    >
      <p className="dshwt-dialog-body">
        {t(count === 1 ? 'group.clear.bodyOne' : 'group.clear.body', { count })}
      </p>
    </Modal>
  )
}

/**
 * The global Tags page behind the sidebar's "Tags" row.
 *
 * It is a `main` panel (root scope, no session binding), so opening it leaves
 * the workspace list in the sidebar and replaces the conversation area.
 *
 * @module dsh-workspace-tags/client/components/TagsPage
 */
import type { ReactNode } from 'react'
import { Button } from '@deepseek-ai/dsh-client-ui-primitives'
import { TagManager } from './TagManager.tsx'
import type { TagsPageProps } from './contract.ts'

/**
 * @param props - composed seat props (locale, injected actions, tag hook).
 * @returns the page.
 */
export function TagsPage(props: TagsPageProps): ReactNode {
  const snapshot = props.useTags((state) => state)
  const { t } = props
  return (
    <section className="dshwt-page" aria-label={t('page.title')} data-dshwt-page="">
      <div className="dshwt-page-scroll">
        <div className="dshwt-page-content">
          <h1 className="dshwt-page-title">{t('page.title')}</h1>
          <p className="dshwt-page-desc">{t('page.description')}</p>

          {snapshot.syncError !== null ? (
            <div className="dshwt-banner" role="status">
              <span>{snapshot.syncError === 'storage' ? t('error.storage') : t('error.save')}</span>
              <span className="dshwt-banner-spacer" />
              <Button size="sm" variant="outline" onClick={() => props.retrySync()}>
                {t('status.retry')}
              </Button>
            </div>
          ) : null}

          {!snapshot.hydrated && snapshot.loading ? (
            <div className="dshwt-banner" role="status">{t('status.loading')}</div>
          ) : null}

          <TagManager
            snapshot={snapshot}
            t={t}
            addTag={props.addTag}
            renameTag={props.renameTag}
            recolorTag={props.recolorTag}
            removeTag={props.removeTag}
          />
        </div>
      </div>
    </section>
  )
}

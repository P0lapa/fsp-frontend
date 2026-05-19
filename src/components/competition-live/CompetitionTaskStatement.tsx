import { useMemo } from 'react'
import type { KeyboardEvent } from 'react'
import type { ContestParticipantTaskDetailsDto, SubmissionResponseDto } from '../../api/contests'
import copyIcon from '../../assets/Copy.svg'
import { getProgrammingLanguageLabel, parseExampleBlocks } from './competitionLiveUtils'

export type CompetitionTaskStatementTab = 'statement' | 'submissions'

type CompetitionTaskStatementProps = {
  task: ContestParticipantTaskDetailsDto | null
  submissions: SubmissionResponseDto[]
  activeTab: CompetitionTaskStatementTab
  onTabChange: (tab: CompetitionTaskStatementTab) => void
  formatInputText: string
  formatOutputText: string
  isLoading?: boolean
  error?: string | null
  onRetry?: () => void
  isBlurred?: boolean
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-jetbrains text-[15px] tracking-[0.04em] text-[var(--color-text)]">
      {children}
    </h3>
  )
}

function StatementText({ children }: { children: React.ReactNode }) {
  return (
    <div className="whitespace-pre-wrap font-ibm text-[15px] leading-[1.65] text-[var(--color-text)]">
      {children}
    </div>
  )
}

function FramedInfoBlock({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="border border-[var(--color-border)] bg-[color:color-mix(in_srgb,var(--color-accent)_10%,var(--color-surface))] px-4 py-3">
      <SectionTitle>{title}</SectionTitle>
      <div className="mt-2">
        <StatementText>{children}</StatementText>
      </div>
    </section>
  )
}

function ExampleCard({
  title,
  content,
}: {
  title: string
  content: string
}) {
  async function handleCopy() {
    if (!content) {
      return
    }

    await navigator.clipboard.writeText(content)
  }

  return (
    <div className="border border-[var(--color-border)] bg-[color:color-mix(in_srgb,var(--color-accent)_10%,var(--color-surface))] px-4 py-3">
      <div className="mb-2 flex items-start justify-between gap-3">
        <SectionTitle>{title}</SectionTitle>
        <button
          type="button"
          onClick={() => {
            void handleCopy()
          }}
          className="inline-flex h-6 w-6 items-center justify-center transition hover:opacity-80"
          aria-label={`Скопировать ${title.toLowerCase()}`}
          title="Скопировать"
        >
          <img src={copyIcon} alt="" className="h-5 w-5" />
        </button>
      </div>
      <pre className="overflow-x-auto whitespace-pre-wrap font-ibm text-[15px] leading-[1.65] text-[var(--color-text)]">
        {content || ' '}
      </pre>
    </div>
  )
}

export function CompetitionTaskStatement({
  task,
  submissions,
  activeTab,
  onTabChange,
  formatInputText,
  formatOutputText,
  isLoading = false,
  error = null,
  onRetry,
  isBlurred = false,
}: CompetitionTaskStatementProps) {
  const tabs: CompetitionTaskStatementTab[] = ['statement', 'submissions']

  const exampleBlocks = useMemo(() => {
    if (!task) {
      return []
    }

    return parseExampleBlocks(task.exampleInput, task.exampleOutput)
  }, [task])

  const safeSubmissions = useMemo(() => {
    if (!task) {
      return []
    }

    return submissions.filter((submission) => submission.taskId === task.id)
  }, [submissions, task])

  if (isLoading) {
    return (
      <section className="px-1 py-2">
        <div className="font-ibm text-base text-[var(--color-text)]">
          Загружаем условие и отправки...
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="px-1 py-2">
        <div className="space-y-4">
          <div className="font-ibm text-base text-[var(--color-danger)]">{error}</div>
          {onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex min-h-11 items-center justify-center border border-[var(--color-accent)] px-4 font-jetbrains text-xs uppercase tracking-[0.14em] text-[var(--color-accent)] transition hover:bg-[color:color-mix(in_srgb,var(--color-accent)_12%,transparent)]"
            >
              Повторить
            </button>
          ) : null}
        </div>
      </section>
    )
  }

  if (!task) {
    return (
      <section className="px-1 py-2">
        <div className="font-ibm text-base text-[var(--color-text)]">
          Выберите задачу, чтобы открыть условие и историю отправок.
        </div>
      </section>
    )
  }

  const solved = task.myStats.solved
  const statusText = solved ? 'Решено' : 'Не решено'
  const statusClassName = solved ? 'text-[var(--color-text-muted)]' : 'text-[var(--color-text)]'
  const statementTabId = `competition-live-tab-statement-${task.id}`
  const submissionsTabId = `competition-live-tab-submissions-${task.id}`
  const statementPanelId = `competition-live-panel-statement-${task.id}`
  const submissionsPanelId = `competition-live-panel-submissions-${task.id}`
  const showBlurOverlay = isBlurred

  function handleTabKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    tab: CompetitionTaskStatementTab,
  ) {
    const currentIndex = tabs.indexOf(tab)

    if (event.key === 'ArrowRight') {
      event.preventDefault()
      onTabChange(tabs[(currentIndex + 1) % tabs.length] ?? 'statement')
      return
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      onTabChange(tabs[(currentIndex - 1 + tabs.length) % tabs.length] ?? 'statement')
      return
    }

    if (event.key === 'Home') {
      event.preventDefault()
      onTabChange('statement')
      return
    }

    if (event.key === 'End') {
      event.preventDefault()
      onTabChange('submissions')
    }
  }

  return (
    <section>
      <div className="flex min-h-11 items-center justify-between gap-4 px-1 py-0">
        <div
          role="tablist"
          aria-label="Переключение между условием и решениями"
          className="flex items-center gap-8"
        >
          <button
            type="button"
            id={statementTabId}
            role="tab"
            aria-selected={activeTab === 'statement'}
            aria-controls={statementPanelId}
            tabIndex={activeTab === 'statement' ? 0 : -1}
            onClick={() => onTabChange('statement')}
            onKeyDown={(event) => handleTabKeyDown(event, 'statement')}
            className={[
              'font-jetbrains text-[18px] tracking-[0.04em] transition',
              activeTab === 'statement'
                ? 'text-[var(--color-text-muted)] underline'
                : 'text-[var(--color-text)] hover:text-[var(--color-text-muted)]',
            ].join(' ')}
          >
            Описание
          </button>

          <button
            type="button"
            id={submissionsTabId}
            role="tab"
            aria-selected={activeTab === 'submissions'}
            aria-controls={submissionsPanelId}
            tabIndex={activeTab === 'submissions' ? 0 : -1}
            onClick={() => onTabChange('submissions')}
            onKeyDown={(event) => handleTabKeyDown(event, 'submissions')}
            className={[
              'font-jetbrains text-[18px] tracking-[0.04em] transition',
              activeTab === 'submissions'
                ? 'text-[var(--color-text-muted)] underline'
                : 'text-[var(--color-text)] hover:text-[var(--color-text-muted)]',
            ].join(' ')}
          >
            Решения
          </button>
        </div>

        <div className={['font-jetbrains text-[15px] tracking-[0.04em]', statusClassName].join(' ')}>
          {statusText}
        </div>
      </div>

      <div className="relative mt-5 px-1">
        {activeTab === 'statement' ? (
          <div
            id={statementPanelId}
            role="tabpanel"
            aria-labelledby={statementTabId}
            aria-hidden={showBlurOverlay}
            className={showBlurOverlay ? 'pointer-events-none invisible' : 'space-y-5'}
          >
            <h2 className="font-jetbrains text-[28px] tracking-[0.02em] text-[var(--color-text)]">
              {task.title}
            </h2>

            <section className="border border-[var(--color-border)] bg-[color:color-mix(in_srgb,var(--color-accent)_10%,var(--color-surface))] px-4 py-3">
              <div className="flex items-start justify-between gap-4 font-ibm text-[15px] leading-[1.65] text-[var(--color-text)]">
                <div className="space-y-2">
                  <div>Ограничение времени:</div>
                  <div>Ограничение памяти:</div>
                </div>
                <div className="space-y-2 text-right text-[var(--color-text)]">
                  <div>{(task.timeLimitMs / 1000).toString().replace('.', ',')} сек</div>
                  <div>{task.memoryLimitMb.toFixed(1)} Мб</div>
                </div>
              </div>
            </section>

            <FramedInfoBlock title="Ввод:">Стандартный ввод или stdin</FramedInfoBlock>
            <FramedInfoBlock title="Вывод:">Стандартный вывод или stdout</FramedInfoBlock>

            <section className="space-y-2">
              <SectionTitle>Задача:</SectionTitle>
              <StatementText>{task.statement}</StatementText>
            </section>

            <section className="space-y-2">
              <SectionTitle>Формат ввода:</SectionTitle>
              <StatementText>{formatInputText}</StatementText>
            </section>

            <section className="space-y-2">
              <SectionTitle>Формат вывода:</SectionTitle>
              <StatementText>{formatOutputText}</StatementText>
            </section>

            {exampleBlocks.map((example, index) => (
              <section key={`${task.id}-${index}`} className="space-y-3">
                <SectionTitle>Пример {index + 1}</SectionTitle>
                <div className="grid gap-4 md:grid-cols-2">
                  <ExampleCard title="Ввод:" content={example.input} />
                  <ExampleCard title="Вывод:" content={example.output} />
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div
            id={submissionsPanelId}
            role="tabpanel"
            aria-labelledby={submissionsTabId}
            aria-hidden={showBlurOverlay}
            className={showBlurOverlay ? 'pointer-events-none invisible' : 'space-y-3'}
          >
            {safeSubmissions.length > 0 ? (
              safeSubmissions.map((submission) => (
                <article
                  key={submission.attemptId}
                  className="border-b border-[var(--color-border-subtle)] py-3"
                >
                  <div className="grid grid-cols-[90px_1fr_1fr_60px_24px] items-center gap-3 font-ibm text-[15px] text-[var(--color-text)]">
                    <span>{submission.submissionTime}</span>
                    <span
                      className={
                        submission.success ? 'text-[var(--color-acid)]' : 'text-[var(--color-danger)]'
                      }
                    >
                      {submission.verdict}
                    </span>
                    <span>{getProgrammingLanguageLabel(submission.language)}</span>
                    <span>{submission.passedTestsCount}</span>
                    <span className="font-jetbrains text-lg" aria-hidden="true">
                      ›
                    </span>
                  </div>
                </article>
              ))
            ) : (
              <div className="font-ibm text-sm text-[var(--color-text)]">
                У вас пока нет локальной истории отправок по этой задаче.
              </div>
            )}
          </div>
        )}

        {showBlurOverlay ? (
          <div
            aria-live="polite"
            className="absolute inset-0 flex items-center justify-center bg-[color:color-mix(in_srgb,var(--color-surface)_88%,transparent)] text-center"
          >
            <div className="font-ibm text-sm leading-[1.6] text-[var(--color-text)]">
              Содержимое скрыто.
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}

import { useMemo, type KeyboardEvent, type ReactNode } from 'react'
import type {
  ContestParticipantSubmissionDetailsDto,
  ContestParticipantSubmissionListItemDto,
  ContestParticipantTaskDetailsDto,
} from '../../api/contests'
import copyIcon from '../../assets/Copy.svg'
import {
  getProgrammingLanguageLabel,
  getTaskVisualState,
  parseExampleBlocks,
} from './competitionLiveUtils'

export type CompetitionTaskStatementTab = 'statement' | 'submissions'

type CompetitionTaskStatementProps = {
  task: ContestParticipantTaskDetailsDto | null
  submissions: ContestParticipantSubmissionListItemDto[]
  activeSubmissionId: number | null
  submissionDetails: ContestParticipantSubmissionDetailsDto | null
  activeTab: CompetitionTaskStatementTab
  onTabChange: (tab: CompetitionTaskStatementTab) => void
  onSubmissionSelect: (attemptId: number) => void
  formatInputText: string
  formatOutputText: string
  isLoading?: boolean
  error?: string | null
  isSubmissionsLoading?: boolean
  submissionsError?: string | null
  isSubmissionDetailsLoading?: boolean
  submissionDetailsError?: string | null
  onRetry?: () => void
  isBlurred?: boolean
}

function formatSubmissionTime(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date)
}

function formatMemoryBytes(value: number | null) {
  if (value === null || Number.isNaN(value)) {
    return '—'
  }

  if (value >= 1024 * 1024) {
    return `${(value / (1024 * 1024)).toFixed(1)} МБ`
  }

  if (value >= 1024) {
    return `${Math.round(value / 1024)} КБ`
  }

  return `${value} Б`
}

function getVerdictClassName(verdict: string) {
  const state = getTaskVisualState({ bestVerdict: verdict })

  if (state === 'solved') {
    return 'text-[var(--color-accent)]'
  }

  if (state === 'failed') {
    return 'text-[var(--color-danger)]'
  }

  return 'text-[var(--color-text)]'
}

function formatCompactVerdict(verdict: string) {
  const normalizedVerdict = verdict.trim()

  if (normalizedVerdict.startsWith('TEST_STATUS_')) {
    return normalizedVerdict.slice('TEST_STATUS_'.length)
  }

  return normalizedVerdict
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="font-jetbrains text-[15px] tracking-[0.04em] text-[var(--color-text)]">
      {children}
    </h3>
  )
}

function StatementText({ children }: { children: ReactNode }) {
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
  children: ReactNode
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

function SubmissionDetailsPanel({
  submission,
  details,
  isLoading,
  error,
}: {
  submission: ContestParticipantSubmissionListItemDto
  details: ContestParticipantSubmissionDetailsDto | null
  isLoading: boolean
  error: string | null
}) {
  return (
    <div className="mt-3 space-y-4 border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-4">
      {isLoading ? (
        <div className="font-ibm text-sm text-[var(--color-text-muted)]">
          Загружаем детали попытки...
        </div>
      ) : null}

      {error ? <div className="font-ibm text-sm text-[var(--color-danger)]">{error}</div> : null}

      {!isLoading && !error && details ? (
        <div className="space-y-5">
          <section className="space-y-3">
            <SectionTitle>Тесты</SectionTitle>
            {details.testResults.length > 0 ? (
              <div className="space-y-2">
                {details.testResults.map((test) => (
                  <div
                    key={`${submission.attemptId}-${test.orderNum}`}
                      className="grid gap-2 border border-[var(--color-border-subtle)] px-3 py-3 md:grid-cols-[56px_120px_1fr_90px_110px]"
                  >
                    <div className="font-jetbrains text-[13px] tracking-[0.04em] text-[var(--color-text)]">
                      {test.orderNum}
                    </div>
                    <div
                      className={[
                        'font-ibm text-[14px]',
                        test.passed ? 'text-[var(--color-accent)]' : 'text-[var(--color-danger)]',
                      ].join(' ')}
                    >
                      {test.passed ? 'Пройден' : 'Не пройден'}
                    </div>
                    <div className={['font-ibm text-[14px]', getVerdictClassName(test.verdict)].join(' ')}>
                      {formatCompactVerdict(test.verdict)}
                    </div>
                    <div className="font-ibm text-[14px] text-[var(--color-text-muted)]">
                      {test.timeMs === null ? '—' : `${test.timeMs} мс`}
                    </div>
                    <div className="font-ibm text-[14px] text-[var(--color-text-muted)]">
                      {formatMemoryBytes(test.memoryBytes)}
                    </div>
                    {test.reason && formatCompactVerdict(test.verdict) !== 'AC' ? (
                      <div className="md:col-span-5 font-ibm text-[14px] text-[var(--color-text-muted)]">
                        {test.reason}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <div className="font-ibm text-sm text-[var(--color-text-muted)]">
                Детали по тестам пока отсутствуют.
              </div>
            )}
          </section>

          <section className="space-y-2">
            <SectionTitle>Исходный код</SectionTitle>
            <pre className="overflow-x-auto border border-[var(--color-border-subtle)] bg-[var(--color-surface-soft)] px-4 py-4 font-jetbrains text-[14px] leading-[1.45] text-[var(--color-text)]">
              {submission.solution || '// исходный код недоступен'}
            </pre>
          </section>
        </div>
      ) : null}
    </div>
  )
}

export function CompetitionTaskStatement({
  task,
  submissions,
  activeSubmissionId,
  submissionDetails,
  activeTab,
  onTabChange,
  onSubmissionSelect,
  formatInputText,
  formatOutputText,
  isLoading = false,
  error = null,
  isSubmissionsLoading = false,
  submissionsError = null,
  isSubmissionDetailsLoading = false,
  submissionDetailsError = null,
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
            <div className="grid grid-cols-[90px_1fr_1fr_110px_24px] gap-3 border-b border-[var(--color-border)] pb-2 font-jetbrains text-[13px] tracking-[0.04em] text-[var(--color-accent)]">
              <span>Время</span>
              <span>Вердикт</span>
              <span>Язык</span>
              <span>Тесты</span>
              <span aria-hidden="true" />
            </div>

            {isSubmissionsLoading ? (
              <div className="font-ibm text-sm text-[var(--color-text-muted)]">
                Загружаем отправки...
              </div>
            ) : null}

            {submissionsError ? (
              <div className="font-ibm text-sm text-[var(--color-danger)]">{submissionsError}</div>
            ) : null}

            {!isSubmissionsLoading && !submissionsError && submissions.length > 0 ? (
              submissions.map((submission) => {
                const isActive = submission.attemptId === activeSubmissionId

                return (
                  <article
                    key={submission.attemptId}
                    className="border-b border-[var(--color-border-subtle)] py-3"
                  >
                    <button
                      type="button"
                      onClick={() => onSubmissionSelect(submission.attemptId)}
                      className="grid w-full grid-cols-[90px_1fr_1fr_110px_24px] items-center gap-3 text-left font-ibm text-[15px] text-[var(--color-text)] transition hover:text-[var(--color-text-muted)]"
                    >
                      <span>{formatSubmissionTime(submission.submissionTime)}</span>
                      <span className={getVerdictClassName(submission.verdict)}>
                        {formatCompactVerdict(submission.verdict)}
                      </span>
                      <span>{getProgrammingLanguageLabel(submission.language)}</span>
                      <span>{submission.passedTestsCount}</span>
                      <span
                        className={[
                          'font-jetbrains text-lg transition-transform duration-200',
                          isActive ? 'rotate-90' : '',
                        ].join(' ')}
                        aria-hidden="true"
                      >
                        ›
                      </span>
                    </button>

                    {isActive ? (
                      <SubmissionDetailsPanel
                        submission={submission}
                        details={submissionDetails}
                        isLoading={isSubmissionDetailsLoading}
                        error={submissionDetailsError}
                      />
                    ) : null}
                  </article>
                )
              })
            ) : null}

            {!isSubmissionsLoading && !submissionsError && submissions.length === 0 ? (
              <div className="font-ibm text-sm text-[var(--color-text)]">
                У вас пока нет отправок по этой задаче.
              </div>
            ) : null}
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

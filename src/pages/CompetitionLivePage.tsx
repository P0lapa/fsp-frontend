import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  getContestById,
  getContestParticipantStatus,
  getContestParticipantTaskDetails,
  getContestParticipantTasks,
  submitContestTaskSolution,
  type ContestFullResponseDto,
  type ContestParticipantStatusDto,
  type ContestParticipantTaskDetailsDto,
  type ContestParticipantTaskListItemDto,
  type ProgrammingLanguage,
  type SubmissionResponseDto,
} from '../api/contests'
import { useAuth } from '../auth/AuthContext'
import { CompetitionLiveHeader } from '../components/competition-live/CompetitionLiveHeader'
import { LiveNavigation } from '../components/competition-live/LiveNavigation'
import { CompetitionSubmissionPanel } from '../components/competition-live/CompetitionSubmissionPanel'
import {
  CompetitionTaskStatement,
  type CompetitionTaskStatementTab,
} from '../components/competition-live/CompetitionTaskStatement'
import { CompetitionTaskSidebar } from '../components/competition-live/CompetitionTaskSidebar'
import {
  formatElapsedTime,
  getContestProgress,
  getContestTimerColor,
} from '../components/competition-live/competitionLiveUtils'
import { useTheme } from '../theme/useTheme'

type ContestState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; contest: ContestFullResponseDto }

type TaskListState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; tasks: ContestParticipantTaskListItemDto[] }

type TaskDetailsState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; task: ContestParticipantTaskDetailsDto }

const FORMAT_INPUT_FALLBACK = 'Стандартный ввод через stdin или input.txt.'
const FORMAT_OUTPUT_FALLBACK = 'Стандартный вывод через stdout или output.txt.'

function getStatusCodeFromError(error: unknown) {
  if (!(error instanceof Error)) {
    return null
  }

  const match = error.message.match(/status (\d+)/)
  return match ? Number(match[1]) : null
}

function getAccessMessage(statusCode: number | null) {
  if (statusCode === 403) {
    return 'Сейчас у вас нет доступа к live-режиму этого соревнования.'
  }

  if (statusCode === 404) {
    return 'Live-режим пока недоступен для этого соревнования.'
  }

  return 'Не удалось загрузить данные live-режима соревнования.'
}

function getTaskDetailsErrorMessage(statusCode: number | null) {
  if (statusCode === 403) {
    return 'Нет доступа к выбранной задаче.'
  }

  if (statusCode === 404) {
    return 'Задача не найдена или больше недоступна.'
  }

  return 'Не удалось загрузить условие выбранной задачи.'
}

function getDefaultLanguage(
  task: ContestParticipantTaskDetailsDto | null,
  contest: ContestFullResponseDto | null,
  currentLanguage: ProgrammingLanguage | null,
) {
  const nextOptions = task?.allowedLanguages.length
    ? task.allowedLanguages
    : (contest?.supportedLanguages ?? [])

  if (nextOptions.length === 0) {
    return null
  }

  if (currentLanguage && nextOptions.includes(currentLanguage)) {
    return currentLanguage
  }

  return nextOptions[0] ?? null
}

function getCursorPosition(value: string) {
  const lines = value.split('\n')
  const lastLine = lines.at(-1) ?? ''

  return {
    line: Math.max(1, lines.length),
    column: lastLine.length + 1,
  }
}

export function CompetitionLivePage() {
  const { contestId } = useParams()
  return <CompetitionLivePageContent key={contestId ?? 'invalid'} contestIdParam={contestId} />
}

function CompetitionLivePageContent({ contestIdParam }: { contestIdParam: string | undefined }) {
  const { isAuthenticated, isInitialized, login } = useAuth()
  const { toggleTheme } = useTheme()
  const parsedContestId = Number(contestIdParam)
  const hasInvalidContestId = !Number.isFinite(parsedContestId)

  const [contestState, setContestState] = useState<ContestState>({ status: 'loading' })
  const [taskListState, setTaskListState] = useState<TaskListState>({ status: 'idle' })
  const [taskDetailsState, setTaskDetailsState] = useState<TaskDetailsState>({ status: 'idle' })
  const [participantStatus, setParticipantStatus] = useState<ContestParticipantStatusDto | null>(
    null,
  )
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<CompetitionTaskStatementTab>('statement')
  const [selectedLanguage, setSelectedLanguage] = useState<ProgrammingLanguage | null>(null)
  const [draftsByTaskId, setDraftsByTaskId] = useState<Record<number, string>>({})
  const [cursor, setCursor] = useState({ line: 1, column: 1 })
  const [isTimerBlurred, setIsTimerBlurred] = useState(false)
  const [localSubmissions, setLocalSubmissions] = useState<SubmissionResponseDto[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [pageNotice, setPageNotice] = useState<string | null>(null)
  const [nowMs, setNowMs] = useState(() => Date.now())

  const contest = contestState.status === 'ready' ? contestState.contest : null
  const tasks = taskListState.status === 'ready' ? taskListState.tasks : []
  const selectedTask = taskDetailsState.status === 'ready' ? taskDetailsState.task : null
  const currentSourceCode =
    selectedTaskId === null ? '' : (draftsByTaskId[selectedTaskId] ?? '')

  const formatInputText = FORMAT_INPUT_FALLBACK
  const formatOutputText = FORMAT_OUTPUT_FALLBACK

  useEffect(() => {
    if (contestState.status !== 'ready') {
      return
    }

    const timerId = window.setInterval(() => {
      setNowMs(Date.now())
    }, 1000)

    return () => {
      window.clearInterval(timerId)
    }
  }, [contestState.status])

  useEffect(() => {
    if (hasInvalidContestId) {
      return
    }

    let isMounted = true

    getContestById(parsedContestId)
      .then((contestResponse) => {
        if (isMounted) {
          setContestState({ status: 'ready', contest: contestResponse })
          setSelectedLanguage((current) =>
            getDefaultLanguage(null, contestResponse, current),
          )
        }
      })
      .catch(() => {
        if (isMounted) {
          setContestState({
            status: 'error',
            message: 'Не удалось загрузить данные соревнования.',
          })
        }
      })

    return () => {
      isMounted = false
    }
  }, [hasInvalidContestId, parsedContestId])

  useEffect(() => {
    if (
      hasInvalidContestId ||
      !isInitialized ||
      !isAuthenticated ||
      contestState.status !== 'ready'
    ) {
      return
    }

    let isMounted = true

    Promise.all([
      getContestParticipantStatus(parsedContestId, { silentErrorStatuses: [403, 404] }),
      getContestParticipantTasks(parsedContestId, { silentErrorStatuses: [403, 404] }),
    ])
      .then(([participantResponse, taskResponse]) => {
        if (isMounted) {
          setParticipantStatus(participantResponse)
          setTaskListState({ status: 'ready', tasks: taskResponse })
          setSelectedTaskId((current) => {
            if (current && taskResponse.some((task) => task.id === current)) {
              return current
            }

            return taskResponse[0]?.id ?? null
          })
        }
      })
      .catch((error) => {
        if (isMounted) {
          setParticipantStatus(null)
          setTaskListState({
            status: 'error',
            message: getAccessMessage(getStatusCodeFromError(error)),
          })
        }
      })

    return () => {
      isMounted = false
    }
  }, [contestState.status, hasInvalidContestId, isAuthenticated, isInitialized, parsedContestId])

  useEffect(() => {
    if (
      contestState.status !== 'ready' ||
      taskListState.status !== 'ready' ||
      selectedTaskId === null ||
      !isInitialized ||
      !isAuthenticated
    ) {
      return
    }

    let isMounted = true

    getContestParticipantTaskDetails(parsedContestId, selectedTaskId, {
      silentErrorStatuses: [403, 404],
    })
      .then((taskResponse) => {
        if (isMounted) {
          setTaskDetailsState({ status: 'ready', task: taskResponse })
          setSelectedLanguage((current) =>
            getDefaultLanguage(taskResponse, contestState.contest, current),
          )
        }
      })
      .catch((error) => {
        if (isMounted) {
          setTaskDetailsState({
            status: 'error',
            message: getTaskDetailsErrorMessage(getStatusCodeFromError(error)),
          })
        }
      })

    return () => {
      isMounted = false
    }
  }, [
    contestState,
    isAuthenticated,
    isInitialized,
    parsedContestId,
    selectedTaskId,
    taskListState.status,
  ])

  const timerState = useMemo(() => {
    if (!contest) {
      return {
        progress: 0,
        elapsedSeconds: 0,
        timerText: '00.00.00',
        durationText: '00.00.00',
        timerColor: getContestTimerColor(0),
      }
    }

    const startMs = Date.parse(contest.startAt)
    const endMs = Date.parse(contest.endAt)
    const durationSeconds = Math.max(0, Math.floor((endMs - startMs) / 1000))
    const progress = getContestProgress({
      nowMs,
      startMs,
      endMs,
    })
    const elapsedMs = Math.max(0, Math.min(nowMs - startMs, Math.max(endMs - startMs, 0)))
    const elapsedSeconds = Math.floor(elapsedMs / 1000)

    return {
      progress,
      elapsedSeconds,
      timerText: formatElapsedTime(elapsedSeconds),
      durationText: formatElapsedTime(durationSeconds),
      timerColor: getContestTimerColor(progress),
    }
  }, [contest, nowMs])

  async function reloadTaskDetails() {
    if (selectedTaskId === null) {
      return
    }

    setTaskDetailsState({ status: 'loading' })

    try {
      const task = await getContestParticipantTaskDetails(parsedContestId, selectedTaskId, {
        silentErrorStatuses: [403, 404],
      })
      setTaskDetailsState({ status: 'ready', task })
    } catch (error) {
      setTaskDetailsState({
        status: 'error',
        message: getTaskDetailsErrorMessage(getStatusCodeFromError(error)),
      })
    }
  }

  function handleSourceCodeChange(nextValue: string) {
    if (selectedTaskId === null) {
      return
    }

    setDraftsByTaskId((current) => ({
      ...current,
      [selectedTaskId]: nextValue,
    }))
  }

  async function handleSubmit() {
    if (isSubmitting || selectedTaskId === null || !selectedLanguage || !participantStatus?.canSubmit) {
      return
    }

    const solution = currentSourceCode.trim()

    if (!solution) {
      setSubmitError('Введите код решения перед отправкой.')
      return
    }

    try {
      setIsSubmitting(true)
      setSubmitError(null)
      const submission = await submitContestTaskSolution(
        parsedContestId,
        selectedTaskId,
        {
          language: selectedLanguage,
          solution: currentSourceCode,
        },
        { silentErrorStatuses: [400, 403, 404, 409] },
      )

      setLocalSubmissions((current) => [submission, ...current])
      setTaskListState((current) => {
        if (current.status !== 'ready') {
          return current
        }

        return {
          status: 'ready',
          tasks: current.tasks.map((task) => {
            if (task.id !== selectedTaskId) {
              return task
            }

            return {
              ...task,
              bestVerdict: submission.verdict,
            }
          }),
        }
      })
      setTaskDetailsState((current) => {
        if (current.status !== 'ready' || current.task.id !== selectedTaskId) {
          return current
        }

        return {
          status: 'ready',
          task: {
            ...current.task,
            myStats: {
              attemptCount: current.task.myStats.attemptCount + 1,
              solved: current.task.myStats.solved || submission.success,
              bestVerdict: submission.verdict,
            },
          },
        }
      })
      setActiveTab('submissions')
    } catch (error) {
      const statusCode = getStatusCodeFromError(error)

      if (statusCode === 400) {
        setSubmitError('Сервер отклонил отправку. Проверьте язык и код решения.')
      } else if (statusCode === 403) {
        setSubmitError('Сейчас нельзя отправлять решения в этом соревновании.')
      } else if (statusCode === 404) {
        setSubmitError('Выбранная задача больше недоступна для отправки.')
      } else if (statusCode === 409) {
        setSubmitError('Отправка решения сейчас невозможна из-за конфликта состояния.')
      } else {
        setSubmitError('Не удалось отправить решение. Попробуйте ещё раз.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (hasInvalidContestId) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:px-8 lg:px-12">
        <div className="rounded-[12px] border border-[var(--color-danger)] bg-[color:color-mix(in_srgb,var(--color-surface)_82%,var(--color-danger)_18%)] px-6 py-5 font-ibm text-base text-[var(--color-danger)]">
          Некорректный идентификатор соревнования.
        </div>
      </div>
    )
  }

  const isContestPending =
    contestState.status === 'loading' ||
    (contestState.status === 'ready' && contestState.contest.id !== parsedContestId)

  if (!isInitialized || isContestPending) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 font-ibm text-[var(--color-text-muted)] sm:px-6 md:px-8 lg:px-12">
        Загружаем live-режим соревнования...
      </div>
    )
  }

  if (contestState.status === 'error') {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:px-8 lg:px-12">
        <div className="rounded-[12px] border border-[var(--color-danger)] bg-[color:color-mix(in_srgb,var(--color-surface)_82%,var(--color-danger)_18%)] px-6 py-5 font-ibm text-base text-[var(--color-danger)]">
          {contestState.message}
        </div>
      </div>
    )
  }

  const readyContest = contestState.contest

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:px-8 lg:px-12">
        <div className="rounded-[12px] border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-6 py-8">
          <div className="mb-3 font-jetbrains text-xs uppercase tracking-[0.18em] text-[var(--color-folder-label)]">
            Live Access
          </div>
          <h1 className="font-8bits text-2xl text-[var(--color-text)]">{readyContest.title}</h1>
          <p className="mt-4 max-w-2xl font-ibm text-base leading-[1.7] text-[var(--color-text-muted)]">
            Для участия в live-режиме нужно войти в аккаунт и иметь доступ к задачам соревнования.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void login()}
              className="inline-flex min-h-11 items-center justify-center rounded-[8px] border border-[var(--color-button-active-border)] bg-[var(--color-button-active-bg)] px-5 font-jetbrains text-xs uppercase tracking-[0.16em] text-[var(--color-button-active-text)] transition hover:bg-[var(--color-button-active-hover-bg)]"
            >
              Войти
            </button>
            <Link
              to={`/competitions/${readyContest.id}`}
              className="inline-flex min-h-11 items-center justify-center rounded-[8px] border border-[var(--color-border-muted)] bg-[var(--color-surface)] px-5 font-jetbrains text-xs uppercase tracking-[0.16em] text-[var(--color-text)] transition hover:border-[var(--color-accent)] hover:shadow-[var(--shadow-info-ring)]"
            >
              Назад к описанию
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const canSubmit =
    selectedTask !== null &&
    selectedLanguage !== null &&
    selectedTask.allowedLanguages.includes(selectedLanguage) &&
    Boolean(participantStatus?.canSubmit)
  const isTaskListLoading =
    isAuthenticated &&
    contestState.status === 'ready' &&
    (taskListState.status === 'idle' || taskListState.status === 'loading')
  const isTaskDetailsLoading =
    selectedTaskId !== null &&
    (taskDetailsState.status === 'idle' || taskDetailsState.status === 'loading')

  return (
    <div>
      <LiveNavigation />

      <div className="mx-auto max-w-[1600px] px-4 py-3 sm:px-6 md:px-8 lg:px-10 lg:py-4">
        {pageNotice ? (
          <div className="mb-4 rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-surface)] px-4 py-3 font-ibm text-sm text-[var(--color-text-muted)]">
            {pageNotice}
          </div>
        ) : null}

        {submitError ? (
          <div className="mb-4 rounded-[10px] border border-[var(--color-danger)] bg-[color:color-mix(in_srgb,var(--color-surface)_84%,var(--color-danger)_16%)] px-4 py-3 font-ibm text-sm text-[var(--color-danger)]">
            {submitError}
          </div>
        ) : null}

        <div className="space-y-3">
          <CompetitionLiveHeader
            title={readyContest.title}
            timerText={timerState.timerText}
            durationText={timerState.durationText}
            timerColor={timerState.timerColor}
            isTimerBlurred={isTimerBlurred}
            onToggleTimerBlur={() => setIsTimerBlurred((current) => !current)}
            onToggleTheme={toggleTheme}
            onTerminate={() =>
              setPageNotice('Кнопка завершения турнира пока работает как визуальная заглушка.')
            }
          />

          <div className="grid gap-x-4 gap-y-3 xl:grid-cols-[86px_minmax(0,1fr)_minmax(0,1fr)]">
            <div className="pt-[58px]">
              <CompetitionTaskSidebar
                tasks={tasks}
                activeTaskId={selectedTaskId}
                onTaskSelect={(taskId) => {
                  if (taskId === selectedTaskId) {
                    return
                  }

                  setSelectedTaskId(taskId)
                  setTaskDetailsState({ status: 'idle' })
                  setActiveTab('statement')
                  setSubmitError(null)
                  setCursor(getCursorPosition(draftsByTaskId[taskId] ?? ''))
                }}
              />
            </div>

            <CompetitionTaskStatement
              task={selectedTask}
              submissions={localSubmissions}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              formatInputText={formatInputText}
              formatOutputText={formatOutputText}
              isLoading={isTaskDetailsLoading}
              error={taskDetailsState.status === 'error' ? taskDetailsState.message : null}
              onRetry={() => void reloadTaskDetails()}
              isBlurred={false}
            />

            <CompetitionSubmissionPanel
              allowedLanguages={
                selectedTask?.allowedLanguages.length
                  ? selectedTask.allowedLanguages
                  : readyContest.supportedLanguages
              }
              selectedLanguage={selectedLanguage}
              onLanguageChange={(language) => {
                setSelectedLanguage(language)
                setSubmitError(null)
              }}
              sourceCode={currentSourceCode}
              onSourceCodeChange={handleSourceCodeChange}
              cursorLine={cursor.line}
              cursorColumn={cursor.column}
              onCursorChange={setCursor}
              onSubmit={() => void handleSubmit()}
              onAttachFile={() =>
                setPageNotice('Загрузка файла скоро появится отдельной модалкой.')
              }
              attachedFileLabel={null}
              isSubmitting={isSubmitting}
              canSubmit={canSubmit}
            />
          </div>

          {isTaskListLoading ? (
            <div className="rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-surface)] px-4 py-3 font-ibm text-sm text-[var(--color-text-muted)]">
              Загружаем список задач...
            </div>
          ) : null}

          {taskListState.status === 'error' ? (
            <div className="rounded-[10px] border border-[var(--color-danger)] bg-[color:color-mix(in_srgb,var(--color-surface)_84%,var(--color-danger)_16%)] px-4 py-4 font-ibm text-sm text-[var(--color-danger)]">
              <div>{taskListState.message}</div>
              <div className="mt-3">
                <Link
                  to={`/competitions/${readyContest.id}`}
                  className="font-jetbrains text-xs uppercase tracking-[0.16em] text-[var(--color-danger)] underline underline-offset-4"
                >
                  Вернуться к соревнованию
                </Link>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

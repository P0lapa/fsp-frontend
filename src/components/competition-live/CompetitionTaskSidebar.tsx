import type { ContestParticipantTaskListItemDto } from '../../api/contests'
import { getTaskVisualState } from './competitionLiveUtils'

type CompetitionTaskSidebarProps = {
  tasks: ContestParticipantTaskListItemDto[]
  activeTaskId: number | null
  onTaskSelect: (taskId: number) => void
}

function getTaskLabelClassName(task: ContestParticipantTaskListItemDto) {
  const state = getTaskVisualState({
    bestVerdict: task.bestVerdict,
  })

  if (state === 'solved') {
    return 'text-[var(--color-accent)]'
  }

  if (state === 'failed') {
    return 'text-[var(--color-danger)]'
  }

  return 'text-[var(--color-text)]'
}

export function CompetitionTaskSidebar({
  tasks,
  activeTaskId,
  onTaskSelect,
}: CompetitionTaskSidebarProps) {
  return (
    <aside>
      <div className="flex flex-wrap gap-4 lg:flex-col">
        {tasks.map((task) => {
          const isActive = task.id === activeTaskId

          return (
            <button
              key={task.id}
              type="button"
              onClick={() => onTaskSelect(task.id)}
              aria-current={isActive ? 'page' : undefined}
              aria-label={`Задача ${task.label}`}
              className={[
                'flex h-14 w-14 items-center justify-center border bg-[var(--color-surface)] font-8bit text-[30px] leading-none transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface)] sm:h-16 sm:w-16',
                isActive
                  ? 'border-[var(--color-accent)] shadow-[var(--shadow-info-ring)]'
                  : 'border-[var(--color-border-subtle)] hover:border-[var(--color-border)]',
              ].join(' ')}
            >
              <span className={getTaskLabelClassName(task)}>{task.label}</span>
            </button>
          )
        })}

        {tasks.length === 0 ? (
          <div className="rounded-[5px] border border-dashed border-[var(--color-border-subtle)] bg-[var(--color-surface)] px-4 py-5 font-ibm text-sm text-[var(--color-text-muted)]">
            Задачи пока не загружены.
          </div>
        ) : null}
      </div>
    </aside>
  )
}

import { useEffect, useId, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import type { ContestLevel, ContestStatus } from '../../api/contests'
import {
  COMPETITION_LANGUAGE_GROUPS,
  getContestLevelLabel,
  getContestStatusLabel,
} from './competitionPresentation'

type CompetitionsFiltersProps = {
  search: string
  selectedStack: string
  selectedLevel: ContestLevel | 'ALL'
  selectedStatus: ContestStatus | 'ALL'
  onSearchChange: (value: string) => void
  onStackChange: (value: string) => void
  onLevelChange: (value: ContestLevel | 'ALL') => void
  onStatusChange: (value: ContestStatus | 'ALL') => void
}

const contestLevels: Array<ContestLevel | 'ALL'> = ['ALL', 'LITE', 'MEDIUM', 'HARD']
const contestStatuses: Array<ContestStatus | 'ALL'> = [
  'ALL',
  'REGISTRATION_OPEN',
  'REGISTRATION_CLOSED',
  'RUNNING',
  'FINISHED',
  'CANCELLED',
  'DRAFT',
]

function FilterSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: Array<{ value: string; label: string }>
  placeholder: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([])
  const listboxId = useId()
  const selectedOption = options.find((option) => option.value === value)
  const selectedIndex = Math.max(
    options.findIndex((option) => option.value === value),
    0,
  )

  useEffect(() => {
    if (isOpen) {
      optionRefs.current[selectedIndex]?.focus()
    }
  }, [isOpen, selectedIndex])

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
    }
  }, [])

  function handleSelect(nextValue: string) {
    onChange(nextValue)
    setIsOpen(false)
    triggerRef.current?.focus()
  }

  function focusOption(nextIndex: number) {
    const totalOptions = options.length

    if (totalOptions === 0) {
      return
    }

    const normalizedIndex = (nextIndex + totalOptions) % totalOptions
    optionRefs.current[normalizedIndex]?.focus()
  }

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      setIsOpen(true)
      return
    }

    if (event.key === 'Escape') {
      setIsOpen(false)
    }
  }

  function handleOptionKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      focusOption(index + 1)
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      focusOption(index - 1)
      return
    }

    if (event.key === 'Home') {
      event.preventDefault()
      focusOption(0)
      return
    }

    if (event.key === 'End') {
      event.preventDefault()
      focusOption(options.length - 1)
      return
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      setIsOpen(false)
      triggerRef.current?.focus()
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        onClick={() => setIsOpen((current) => !current)}
        onKeyDown={handleTriggerKeyDown}
        className={[
          'flex h-12 w-full items-center justify-between rounded-[6px] border border-[var(--color-border-muted)] bg-[var(--color-surface)] px-4 font-jetbrains text-[16px] text-[var(--color-text-muted)] outline-none transition',
          isOpen
            ? 'border-[var(--color-accent)] shadow-[var(--shadow-info-ring)]'
            : 'hover:border-[var(--color-border)]',
        ].join(' ')}
      >
        <span>{selectedOption?.label ?? placeholder}</span>
        <span
          className={[
            'font-jetbrains text-[24px] leading-none text-[var(--color-text-muted)] transition-transform duration-200',
            isOpen ? 'rotate-90' : '',
          ].join(' ')}
        >
          ›
        </span>
      </button>

      {isOpen ? (
        <div
          id={listboxId}
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+12px)] z-20 space-y-2 px-1"
        >
          {options.map((option, index) => {
            const isSelected = option.value === value

            return (
              <button
                key={option.value}
                ref={(element) => {
                  optionRefs.current[index] = element
                }}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(option.value)}
                onKeyDown={(event) => handleOptionKeyDown(event, index)}
                className={[
                  'flex min-h-[24px] w-full items-center rounded-[4px] border border-[var(--color-border-muted)] bg-[var(--color-surface)] px-5 py-2 text-left font-jetbrains text-[16px] leading-none tracking-[0.04em] transition',
                  isSelected
                    ? 'border-[var(--color-border)] text-[var(--color-text)]'
                    : 'text-[var(--color-text-muted)] hover:border-[var(--color-accent)]',
                ].join(' ')}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

export function CompetitionsFilters({
  search,
  selectedStack,
  selectedLevel,
  selectedStatus,
  onSearchChange,
  onStackChange,
  onLevelChange,
  onStatusChange,
}: CompetitionsFiltersProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr_1fr_1.15fr]">
      <label className="relative block">
        <span className="sr-only">Поиск соревнований</span>
        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Поиск"
          className="h-12 w-full rounded-[6px] border border-[var(--color-border-muted)] bg-[var(--color-surface)] px-4 pr-12 font-jetbrains text-[16px] text-[var(--color-text-muted)] outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)] focus:shadow-[var(--shadow-info-ring)]"
        />
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20L16.65 16.65" />
          </svg>
        </span>
      </label>

      <FilterSelect
        label="Стек"
        value={selectedStack}
        onChange={onStackChange}
        placeholder="Стек"
        options={[
          { value: '', label: 'Все стеки' },
          ...COMPETITION_LANGUAGE_GROUPS.map((group) => ({
            value: group.key,
            label: group.label,
          })),
        ]}
      />

      <FilterSelect
        label="Уровень"
        value={selectedLevel}
        onChange={(nextValue) => onLevelChange(nextValue as ContestLevel | 'ALL')}
        placeholder="Уровень"
        options={contestLevels.map((option) => ({
          value: option,
          label: option === 'ALL' ? 'Все уровни' : getContestLevelLabel(option),
        }))}
      />

      <FilterSelect
        label="Статус соревнования"
        value={selectedStatus}
        onChange={(nextValue) => onStatusChange(nextValue as ContestStatus | 'ALL')}
        placeholder="Статус соревнования"
        options={contestStatuses.map((option) => ({
          value: option,
          label: option === 'ALL' ? 'Все статусы' : getContestStatusLabel(option),
        }))}
      />
    </div>
  )
}

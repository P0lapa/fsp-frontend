import { useEffect, useId, useRef, useState } from 'react'
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
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string
  onChange: (value: string) => void
  options: Array<{ value: string; label: string }>
  placeholder: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const listboxId = useId()
  const selectedOption = options.find((option) => option.value === value)

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
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        onClick={() => setIsOpen((current) => !current)}
        className={[
          'flex h-12 w-full items-center justify-between rounded-[6px] border bg-[#0A0A0A] px-4 font-jetbrains text-[16px] text-[#B7D0D8] outline-none transition',
          isOpen
            ? 'border-[#05D9F6] shadow-[0_0_0_1px_rgba(5,217,246,0.1)]'
            : 'border-[#29312D] hover:border-[#3C4842]',
        ].join(' ')}
      >
        <span>{selectedOption?.label ?? placeholder}</span>
        <span
          className={[
            'font-jetbrains text-[24px] leading-none text-[#B7D0D8] transition-transform duration-200',
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
          {options.map((option) => {
            const isSelected = option.value === value

            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(option.value)}
                className={[
                  'flex min-h-[24px] w-full items-center rounded-[4px] border bg-[#0A0A0A] px-5 py-2 text-left font-jetbrains text-[16px] leading-none tracking-[0.04em] transition',
                  isSelected
                    ? 'border-[#3C4842] text-[#D8F1F7]'
                    : 'border-[#29312D] text-[#B7D0D8] hover:border-[#05D9F6]',
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
          className="h-12 w-full rounded-[6px] border border-[#29312D] bg-[#0A0A0A] px-4 pr-12 font-jetbrains text-[16px] text-[#B7D0D8] outline-none transition placeholder:text-[#8AA6B0] focus:border-[#05D9F6]"
        />
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#B7D0D8]">
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
        value={selectedStack}
        onChange={onStackChange}
        placeholder="Стек"
        options={COMPETITION_LANGUAGE_GROUPS.map((group) => ({
          value: group.key,
          label: group.label,
        }))}
      />

      <FilterSelect
        value={selectedLevel}
        onChange={(nextValue) => onLevelChange(nextValue as ContestLevel | 'ALL')}
        placeholder="Уровень"
        options={contestLevels
          .filter((option) => option !== 'ALL')
          .map((option) => ({
            value: option,
            label: getContestLevelLabel(option),
          }))}
      />

      <FilterSelect
        value={selectedStatus}
        onChange={(nextValue) => onStatusChange(nextValue as ContestStatus | 'ALL')}
        placeholder="Статус соревнования"
        options={contestStatuses
          .filter((option) => option !== 'ALL')
          .map((option) => ({
            value: option,
            label: getContestStatusLabel(option),
          }))}
      />
    </div>
  )
}

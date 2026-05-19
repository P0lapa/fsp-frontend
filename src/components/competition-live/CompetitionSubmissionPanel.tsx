import { useEffect, useId, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import addFileIcon from '../../assets/add-file.svg'
import type { ProgrammingLanguage } from '../../api/contests'
import { getProgrammingLanguageLabel } from './competitionLiveUtils'

type CompetitionSubmissionPanelProps = {
  allowedLanguages: ProgrammingLanguage[]
  selectedLanguage: ProgrammingLanguage | null
  onLanguageChange: (language: ProgrammingLanguage) => void
  sourceCode: string
  onSourceCodeChange: (value: string) => void
  cursorLine: number
  cursorColumn: number
  onCursorChange: (cursor: { line: number; column: number }) => void
  onSubmit: () => void
  onAttachFile?: () => void
  attachedFileLabel?: string | null
  isSubmitting?: boolean
  canSubmit?: boolean
}

function LanguageSelect({
  value,
  allowedLanguages,
  onChange,
}: {
  value: ProgrammingLanguage | null
  allowedLanguages: ProgrammingLanguage[]
  onChange: (language: ProgrammingLanguage) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([])
  const listboxId = useId()

  const options = useMemo(
    () =>
      allowedLanguages.map((language) => ({
        value: language,
        label: getProgrammingLanguageLabel(language),
      })),
    [allowedLanguages],
  )

  const selectedIndex = Math.max(
    options.findIndex((option) => option.value === value),
    0,
  )
  const hasOptions = options.length > 0

  useEffect(() => {
    if (isOpen && hasOptions) {
      optionRefs.current[selectedIndex]?.focus()
    }
  }, [hasOptions, isOpen, selectedIndex])

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

  function handleSelect(language: ProgrammingLanguage) {
    onChange(language)
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
    if (!hasOptions) {
      return
    }

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
    <div ref={containerRef} className="relative w-full max-w-[240px]">
      <button
        ref={triggerRef}
        type="button"
        aria-label="Выбрать язык программирования"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        onClick={() => {
          if (!hasOptions) {
            return
          }

          setIsOpen((current) => !current)
        }}
        onKeyDown={handleTriggerKeyDown}
        disabled={!hasOptions}
        className={[
          'flex h-11 w-full items-center justify-between rounded-[6px] border border-[var(--color-border-muted)] bg-[var(--color-surface)] px-4 font-jetbrains text-[16px] text-[var(--color-text-muted)] outline-none transition',
          isOpen
            ? 'border-[var(--color-accent)] shadow-[var(--shadow-info-ring)]'
            : 'hover:border-[var(--color-border)] disabled:cursor-not-allowed disabled:opacity-60',
        ].join(' ')}
      >
        <span className="truncate">
          {hasOptions
            ? options.find((option) => option.value === value)?.label ?? 'Выберите язык'
            : 'Нет доступных языков'}
        </span>
        <span
          className={[
            'font-jetbrains text-[24px] leading-none text-[var(--color-text-muted)] transition-transform duration-200',
            isOpen ? 'rotate-90' : '',
          ].join(' ')}
          aria-hidden="true"
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

function getCursorPosition(value: string, caretIndex: number) {
  const normalizedCaret = Math.max(0, Math.min(caretIndex, value.length))
  const beforeCaret = value.slice(0, normalizedCaret)
  const lines = beforeCaret.split('\n')

  return {
    line: lines.length,
    column: (lines.at(-1)?.length ?? 0) + 1,
  }
}

export function CompetitionSubmissionPanel({
  allowedLanguages,
  selectedLanguage,
  onLanguageChange,
  sourceCode,
  onSourceCodeChange,
  cursorLine,
  cursorColumn,
  onCursorChange,
  onSubmit,
  onAttachFile,
  // attachedFileLabel = null,
  isSubmitting = false,
  canSubmit = true,
}: CompetitionSubmissionPanelProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const gutterRef = useRef<HTMLDivElement | null>(null)

  const lineNumbers = useMemo(() => {
    const totalLines = Math.max(1, sourceCode.split('\n').length)
    return Array.from({ length: totalLines }, (_, index) => index + 1)
  }, [sourceCode])

  const isSubmitDisabled =
    !canSubmit || isSubmitting || !selectedLanguage || sourceCode.trim().length === 0

  function updateCursorPosition() {
    const textarea = textareaRef.current

    if (!textarea) {
      return
    }

    onCursorChange(getCursorPosition(textarea.value, textarea.selectionStart))
  }

  function syncGutterScroll() {
    if (!textareaRef.current || !gutterRef.current) {
      return
    }

    gutterRef.current.scrollTop = textareaRef.current.scrollTop
  }

  return (
    <section className="px-4 pt-1">
      <div className="flex min-h-11 items-center justify-between gap-4">
        <div className="flex text-[18px] tracking-[0.04em] text-[var(--color-accent)]">
          <div className="font-jetbrains">Код</div>
          <div className="font-8bit">{'</>'}</div>
        </div>


        <LanguageSelect
          value={selectedLanguage}
          allowedLanguages={allowedLanguages}
          onChange={onLanguageChange}
        />
      </div>

      <div className="mt-5 overflow-hidden border border-[var(--color-border-subtle)] bg-[var(--color-surface)]">
        <div className="grid min-h-[300px] grid-cols-[40px_minmax(0,1fr)]">
          <div
            ref={gutterRef}
            className="overflow-hidden border-r border-[var(--color-border-subtle)] px-2 py-3 text-right font-jetbrains text-[14px] leading-7 text-[var(--color-text)]"
          >
            {lineNumbers.map((lineNumber) => (
              <div key={lineNumber}>{lineNumber}</div>
            ))}
          </div>

          <textarea
            ref={textareaRef}
            aria-label="Редактор решения"
            value={sourceCode}
            onChange={(event) => {
              onSourceCodeChange(event.target.value)
              onCursorChange(
                getCursorPosition(event.target.value, event.target.selectionStart),
              )
            }}
            onClick={updateCursorPosition}
            onKeyUp={updateCursorPosition}
            onSelect={updateCursorPosition}
            onScroll={syncGutterScroll}
            spellCheck={false}
            wrap="off"
            placeholder="// напиши своё решение тут"
            className="
              min-h-[300px] w-full resize-y
              overflow-auto whitespace-pre
              bg-[var(--color-surface)]
              px-3 py-3
              font-jetbrains text-[16px] leading-7
              text-[var(--color-text)]
              outline-none
              placeholder:text-[var(--color-text-muted)]
            "
          />
        </div>
      </div>

      <div className="mt-5 flex items-stretch justify-between gap-4">
        <div className="flex min-h-11 items-center font-ibm text-[16px] text-[var(--color-text)]">
          строка {cursorLine}, столбец {cursorColumn}
        </div>

        <div className="flex items-stretch">
          <button
            type="button"
            onClick={onAttachFile}
            className="inline-flex min-h-11 items-center gap-3 border border-r-0 border-[var(--color-button-active-border)] px-4 text-[var(--color-text-muted)] transition hover:text-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!onAttachFile}
          >
            <img src={addFileIcon} alt="" aria-hidden="true" className="h-6 w-6 object-contain" />
            {/* <span className="font-ibm text-[18px]">{attachedFileLabel ?? 'file.mp'}</span> */}
          </button>

          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitDisabled}
            className="inline-flex min-h-11 items-center justify-center border border-[var(--color-button-active-border)] bg-[var(--color-button-active-bg)] px-7 font-jetbrains text-[16px] tracking-[0.02em] text-[var(--color-button-active-text)] transition hover:bg-[var(--color-button-active-hover-bg)] hover:shadow-[var(--shadow-acid)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            [{isSubmitting ? 'Отправка...' : 'Отправить'}]
          </button>
        </div>
      </div>
    </section>
  )
}

export type TaskVisualState = 'idle' | 'failed' | 'solved'

export type ExampleBlock = {
  input: string
  output: string
}

export type CompetitionLiveLanguage = 'CPP' | 'JAVA' | 'PYTHON' | 'KOTLIN'

type ContestProgressInput = {
  nowMs: number
  startMs: number
  endMs: number
}

type TaskVisualStateInput = {
  bestVerdict: string | null
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function interpolateChannel(start: number, end: number, progress: number) {
  return Math.round(start + (end - start) * progress)
}

function splitExampleSections(value: string | null) {
  return (value ?? '')
    .split(/\n\s*\n/)
    .filter((section, index, sections) => {
      if (section.length > 0) {
        return true
      }

      return index !== 0 && index !== sections.length - 1
    })
}

export function formatElapsedTime(totalSeconds: number) {
  const clampedSeconds = Math.max(0, Math.floor(totalSeconds))
  const hours = Math.floor(clampedSeconds / 3600)
  const minutes = Math.floor((clampedSeconds % 3600) / 60)
  const seconds = clampedSeconds % 60

  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, '0'))
    .join('.')
}

export function getContestProgress(input: ContestProgressInput) {
  const durationMs = Math.max(0, input.endMs - input.startMs)

  if (durationMs === 0) {
    return input.nowMs >= input.endMs ? 1 : 0
  }

  const elapsedMs = clamp(input.nowMs - input.startMs, 0, durationMs)
  return elapsedMs / durationMs
}

export function getContestTimerColor(progress: number) {
  const clampedProgress = clamp(progress, 0, 1)
  const green = [34, 197, 94]
  const yellow = [250, 204, 21]
  const red = [239, 68, 68]

  const [startColor, endColor, segmentProgress] =
    clampedProgress <= 0.5
      ? [green, yellow, clampedProgress / 0.5]
      : [yellow, red, (clampedProgress - 0.5) / 0.5]

  const [redChannel, greenChannel, blueChannel] = startColor.map((channel, index) =>
    interpolateChannel(channel, endColor[index], segmentProgress),
  )

  return `rgb(${redChannel} ${greenChannel} ${blueChannel})`
}

export function getTaskVisualState(input: TaskVisualStateInput): TaskVisualState {
  const normalizedVerdict = input.bestVerdict?.trim().toUpperCase()

  if (
    normalizedVerdict === 'OK' ||
    normalizedVerdict === 'ACCEPTED' ||
    normalizedVerdict === 'AC' ||
    normalizedVerdict === 'TEST_STATUS_AC' ||
    normalizedVerdict === 'PASSED' ||
    normalizedVerdict === 'SUCCESS' ||
    normalizedVerdict === 'РЕШЕНО' ||
    normalizedVerdict === 'ЗАЧТЕНО'
  ) {
    return 'solved'
  }

  if (normalizedVerdict) {
    return 'failed'
  }

  return 'idle'
}

export function getProgrammingLanguageLabel(language: CompetitionLiveLanguage | null | undefined) {
  switch (language) {
    case 'CPP':
      return 'C++'
    case 'JAVA':
      return 'Java'
    case 'PYTHON':
      return 'Python'
    case 'KOTLIN':
      return 'Kotlin'
    default:
      return language ?? 'Unknown language'
  }
}

export function parseExampleBlocks(
  exampleInput: string | null,
  exampleOutput: string | null,
): ExampleBlock[] {
  const inputs = splitExampleSections(exampleInput)
  const outputs = splitExampleSections(exampleOutput)
  const rawInput = exampleInput ?? ''
  const rawOutput = exampleOutput ?? ''

  if (inputs.length === 0 && outputs.length === 0) {
    return []
  }

  if (inputs.length !== outputs.length) {
    return [
      {
        input: rawInput,
        output: rawOutput,
      },
    ]
  }

  return Array.from({ length: inputs.length }, (_, index) => ({
    input: inputs[index] ?? '',
    output: outputs[index] ?? '',
  }))
}

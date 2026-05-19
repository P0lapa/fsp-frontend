# Competition Live Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the participant live contest page with contest timer, task navigation, task statement view, local submissions tab, code editor, language selection, and real solution submission to the contest backend.

**Architecture:** `CompetitionLivePage` will orchestrate route parsing, data fetching, selection state, timer state, and submit flow. The page UI will be split into small colocated presentational components under `src/components/competition-live/`, while contest participant task and submission helpers will be added to `src/api/contests.ts`. Small pure helper functions will hold timer formatting, task status, and sample parsing logic so they can be tested independently.

**Tech Stack:** React 19, TypeScript, React Router, existing auth fetch helpers, Tailwind utility classes, ESLint, Vite build.

---

## File Structure

- Modify: `C:/Users/Vladimir/Desktop/SPS/fsp-reactjs/src/api/contests.ts`
  Responsibility: add participant live contest DTOs and authenticated API helpers for tasks and submissions.
- Create: `C:/Users/Vladimir/Desktop/SPS/fsp-reactjs/src/components/competition-live/competitionLiveUtils.ts`
  Responsibility: pure helper functions for timer formatting, timer color progress, task visual state, language labels, and sample parsing.
- Create: `C:/Users/Vladimir/Desktop/SPS/fsp-reactjs/src/components/competition-live/CompetitionLiveHeader.tsx`
  Responsibility: contest title, timer, blur toggle, theme toggle, terminate button.
- Create: `C:/Users/Vladimir/Desktop/SPS/fsp-reactjs/src/components/competition-live/CompetitionTaskSidebar.tsx`
  Responsibility: task letter list, active state, solved/unsolved coloring.
- Create: `C:/Users/Vladimir/Desktop/SPS/fsp-reactjs/src/components/competition-live/CompetitionTaskStatement.tsx`
  Responsibility: description/submissions tabs, task metadata, statement sections, sample blocks, temporary submissions list.
- Create: `C:/Users/Vladimir/Desktop/SPS/fsp-reactjs/src/components/competition-live/CompetitionSubmissionPanel.tsx`
  Responsibility: language select, line-numbered textarea editor, cursor footer, placeholder file button, submit action UI.
- Modify: `C:/Users/Vladimir/Desktop/SPS/fsp-reactjs/src/pages/CompetitionLivePage.tsx`
  Responsibility: wire all page state, lifecycle effects, data fetching, submit flow, and layout.
- Create: `C:/Users/Vladimir/Desktop/SPS/fsp-reactjs/src/components/competition-live/competitionLiveUtils.test.ts`
  Responsibility: cover helper logic with test-first checks if a test runner is available.

## Task 1: Establish testability for helper logic

**Files:**
- Create: `C:/Users/Vladimir/Desktop/SPS/fsp-reactjs/src/components/competition-live/competitionLiveUtils.test.ts`
- Create: `C:/Users/Vladimir/Desktop/SPS/fsp-reactjs/src/components/competition-live/competitionLiveUtils.ts`
- Modify: `C:/Users/Vladimir/Desktop/SPS/fsp-reactjs/package.json` only if a lightweight test script is absolutely required for existing tooling

- [ ] **Step 1: Write the failing helper tests**

```typescript
import { describe, expect, it } from 'vitest'
import {
  formatElapsedTime,
  getContestProgress,
  getTaskVisualState,
  parseExampleBlocks,
} from './competitionLiveUtils'

describe('formatElapsedTime', () => {
  it('formats elapsed seconds as dot-separated timer text', () => {
    expect(formatElapsedTime(1235)).toBe('00.20.35')
  })
})

describe('getContestProgress', () => {
  it('clamps progress to 0 before contest start and 1 after contest end', () => {
    expect(
      getContestProgress({
        nowMs: 100,
        startMs: 200,
        endMs: 400,
      }),
    ).toBe(0)

    expect(
      getContestProgress({
        nowMs: 500,
        startMs: 200,
        endMs: 400,
      }),
    ).toBe(1)
  })
})

describe('getTaskVisualState', () => {
  it('marks solved tasks as solved even when attempts exist', () => {
    expect(
      getTaskVisualState({
        attemptCount: 3,
        solved: true,
        bestVerdict: 'OK',
      }),
    ).toBe('solved')
  })
})

describe('parseExampleBlocks', () => {
  it('returns paired example blocks from text', () => {
    expect(parseExampleBlocks('1 2\n\n3 4', '3\n\n7')).toEqual([
      { input: '1 2', output: '3' },
      { input: '3 4', output: '7' },
    ])
  })
})
```

- [ ] **Step 2: Run the helper tests to verify they fail**

Run: `npm test -- src/components/competition-live/competitionLiveUtils.test.ts`
Expected: FAIL because the helper module or exported functions do not exist yet.

- [ ] **Step 3: Write the minimal helper implementation**

```typescript
export type TaskVisualState = 'idle' | 'failed' | 'solved'

export function formatElapsedTime(totalSeconds: number) {
  const clampedSeconds = Math.max(0, totalSeconds)
  const hours = Math.floor(clampedSeconds / 3600)
  const minutes = Math.floor((clampedSeconds % 3600) / 60)
  const seconds = clampedSeconds % 60

  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, '0'))
    .join('.')
}

export function getContestProgress(input: {
  nowMs: number
  startMs: number
  endMs: number
}) {
  const durationMs = Math.max(0, input.endMs - input.startMs)

  if (durationMs === 0) {
    return 1
  }

  const elapsedMs = Math.min(Math.max(input.nowMs - input.startMs, 0), durationMs)
  return elapsedMs / durationMs
}

export function getTaskVisualState(input: {
  attemptCount: number
  solved: boolean
  bestVerdict: string | null
}): TaskVisualState {
  if (input.solved) {
    return 'solved'
  }

  if (input.attemptCount > 0 || input.bestVerdict) {
    return 'failed'
  }

  return 'idle'
}

export function parseExampleBlocks(exampleInput: string | null, exampleOutput: string | null) {
  const inputs = (exampleInput ?? '')
    .split(/\n\s*\n/)
    .map((value) => value.trim())
    .filter(Boolean)
  const outputs = (exampleOutput ?? '')
    .split(/\n\s*\n/)
    .map((value) => value.trim())
    .filter(Boolean)

  const total = Math.max(inputs.length, outputs.length, 1)

  return Array.from({ length: total }, (_, index) => ({
    input: inputs[index] ?? '',
    output: outputs[index] ?? '',
  }))
}
```

- [ ] **Step 4: Run the helper tests to verify they pass**

Run: `npm test -- src/components/competition-live/competitionLiveUtils.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/competition-live/competitionLiveUtils.ts src/components/competition-live/competitionLiveUtils.test.ts
git commit -m "test: add competition live helper coverage"
```

## Task 2: Extend contest API helpers for live participant flows

**Files:**
- Modify: `C:/Users/Vladimir/Desktop/SPS/fsp-reactjs/src/api/contests.ts`
- Reference: `C:/Users/Vladimir/Desktop/SPS/fsp-reactjs/frontend-api.md`

- [ ] **Step 1: Write the failing helper test or type usage expectation**

```typescript
import type {
  ContestParticipantTaskDetailsDto,
  ContestParticipantTaskListItemDto,
  SubmissionRequestDto,
} from '../../api/contests'

const taskListShape: ContestParticipantTaskListItemDto = {
  id: 1,
  label: 'A',
  title: 'Task',
  shortName: 'task-a',
  score: 100,
  solved: false,
  attemptCount: 0,
  bestVerdict: null,
}

const submissionPayload: SubmissionRequestDto = {
  language: 'CPP',
  solution: 'int main() {}',
}

const taskDetailsShape: ContestParticipantTaskDetailsDto = {
  id: 1,
  label: 'A',
  title: 'Task',
  statement: 'Body',
  inputDescription: 'Input',
  outputDescription: 'Output',
  notes: null,
  exampleInput: '1',
  exampleOutput: '2',
  constraintsText: null,
  timeLimitMs: 1000,
  memoryLimitMb: 64,
  allowedLanguages: ['CPP'],
  myStats: {
    attemptCount: 0,
    bestVerdict: null,
    solved: false,
  },
}
```

- [ ] **Step 2: Run TypeScript or build check to verify it fails before implementation**

Run: `npm run build`
Expected: FAIL because the new exported contest participant live types and helpers do not exist yet.

- [ ] **Step 3: Add minimal API DTOs and helper functions**

```typescript
export type ContestParticipantTaskListItemDto = {
  id: number
  label: string
  title: string
  shortName: string
  score: number
  solved: boolean
  attemptCount: number
  bestVerdict: string | null
}

export type ContestParticipantTaskDetailsDto = {
  id: number
  label: string
  title: string
  statement: string
  inputDescription: string
  outputDescription: string
  notes: string | null
  exampleInput: string | null
  exampleOutput: string | null
  constraintsText: string | null
  timeLimitMs: number
  memoryLimitMb: number
  allowedLanguages: ProgrammingLanguage[]
  myStats: {
    attemptCount: number
    bestVerdict: string | null
    solved: boolean
  }
}

export type SubmissionRequestDto = {
  language: ProgrammingLanguage
  solution: string
}

export type SubmissionResponseDto = {
  attemptId: number
  contestId: number
  taskId: number
  attemptNumber: number
  language: ProgrammingLanguage
  submissionTime: string
  verdict: string
  success: boolean
  passedTestsCount: number
  totalTestsCount: number
  maxTimeMs: number | null
  maxMemoryBytes: number | null
  compileOutput: string | null
  checkerOutput: string | null
  judgeMessage: string | null
  testResults: Array<{
    testId: number
    orderNum: number
    passed: boolean
    verdict: string
    reason: string | null
    timeMs: number | null
    memoryBytes: number | null
  }>
}

export function getContestParticipantTasks(contestId: number) {
  return apiAuthGet<ContestParticipantTaskListItemDto[]>(`/contests/${contestId}/tasks`)
}

export function getContestParticipantTaskDetails(contestId: number, taskId: number) {
  return apiAuthGet<ContestParticipantTaskDetailsDto>(`/contests/${contestId}/tasks/${taskId}`)
}

export function submitContestTaskSolution(
  contestId: number,
  taskId: number,
  body: SubmissionRequestDto,
) {
  return apiAuthPost<SubmissionResponseDto>(
    `/contests/${contestId}/tasks/${taskId}/submissions`,
    body,
  )
}
```

- [ ] **Step 4: Run TypeScript or build check to verify the API layer passes**

Run: `npm run build`
Expected: PASS for the new contest live API exports.

- [ ] **Step 5: Commit**

```bash
git add src/api/contests.ts
git commit -m "feat: add contest live api helpers"
```

## Task 3: Build the live page presentational components

**Files:**
- Create: `C:/Users/Vladimir/Desktop/SPS/fsp-reactjs/src/components/competition-live/CompetitionLiveHeader.tsx`
- Create: `C:/Users/Vladimir/Desktop/SPS/fsp-reactjs/src/components/competition-live/CompetitionTaskSidebar.tsx`
- Create: `C:/Users/Vladimir/Desktop/SPS/fsp-reactjs/src/components/competition-live/CompetitionTaskStatement.tsx`
- Create: `C:/Users/Vladimir/Desktop/SPS/fsp-reactjs/src/components/competition-live/CompetitionSubmissionPanel.tsx`
- Reference: `C:/Users/Vladimir/Desktop/SPS/fsp-reactjs/src/components/competitions/CompetitionsFilters.tsx`
- Reference: `C:/Users/Vladimir/Desktop/SPS/fsp-reactjs/src/assets/eye.svg`
- Reference: `C:/Users/Vladimir/Desktop/SPS/fsp-reactjs/src/assets/eye-closed.svg`
- Reference: `C:/Users/Vladimir/Desktop/SPS/fsp-reactjs/src/assets/change-theme.svg`
- Reference: `C:/Users/Vladimir/Desktop/SPS/fsp-reactjs/src/assets/add-file.svg`

- [ ] **Step 1: Write the failing UI integration expectation**

```typescript
import {
  CompetitionLiveHeader,
  CompetitionSubmissionPanel,
  CompetitionTaskSidebar,
  CompetitionTaskStatement,
} from '../components/competition-live'
```

Expected failure: these modules do not exist yet.

- [ ] **Step 2: Run the build to verify the component imports fail before implementation**

Run: `npm run build`
Expected: FAIL because the live page component files have not been created yet.

- [ ] **Step 3: Create the minimal presentational components**

Key implementation requirements:

- `CompetitionLiveHeader.tsx`
  - accept title, timer text, timer blur flag, timer color style, handlers for blur and theme
  - render icon-only buttons with `aria-label`
  - render the terminate button as presentational only
- `CompetitionTaskSidebar.tsx`
  - accept tasks, selected task id, and click handler
  - render button tiles using `getTaskVisualState`
- `CompetitionTaskStatement.tsx`
  - accept task details, tab state, local submissions, loading, error, and retry handler
  - render `Описание` and `Решения` tabs
  - render sample input/output cards from `parseExampleBlocks`
- `CompetitionSubmissionPanel.tsx`
  - implement a local dropdown patterned after `FilterSelect`
  - render line numbers beside a textarea
  - expose `onSourceChange`, `onCursorChange`, `onSubmit`, and placeholder file handler

- [ ] **Step 4: Run the build to verify the new components compile**

Run: `npm run build`
Expected: PASS for the presentational layer.

- [ ] **Step 5: Commit**

```bash
git add src/components/competition-live
git commit -m "feat: add competition live page components"
```

## Task 4: Integrate the full live page container

**Files:**
- Modify: `C:/Users/Vladimir/Desktop/SPS/fsp-reactjs/src/pages/CompetitionLivePage.tsx`
- Modify: `C:/Users/Vladimir/Desktop/SPS/fsp-reactjs/src/App.tsx` only if route wiring needs adjustment

- [ ] **Step 1: Write the failing page integration usage**

```typescript
<CompetitionLivePage />
```

Expected failure conditions before implementation:

- page does not fetch live contest task data
- timer and editor behavior are absent
- page layout does not match the approved structure

- [ ] **Step 2: Run the build to verify the current page is incomplete relative to the new imports/state**

Run: `npm run build`
Expected: FAIL once the new integration references are introduced but not fully wired.

- [ ] **Step 3: Implement the page container minimally**

Key implementation requirements:

- parse `contestId` from route params
- fetch contest details and task list on load
- auto-select the first task
- fetch task details when selection changes
- keep `selectedLanguage` in sync with task or contest allowed languages
- maintain `sourceCode`, `cursorLine`, `cursorColumn`, `detailsTab`, `isTimerBlurred`, `localSubmissions`
- compute elapsed timer text and progress color from `startAt`, `endAt`, and a one-second interval
- submit source code via `submitContestTaskSolution`
- prepend returned submission to local submissions state
- switch to `submissions` tab after a successful submit
- show compact loading, invalid contest id, and retryable error states

- [ ] **Step 4: Run the build to verify the integrated page compiles**

Run: `npm run build`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/pages/CompetitionLivePage.tsx src/App.tsx
git commit -m "feat: implement competition live page"
```

## Task 5: End-to-end verification of the implemented page

**Files:**
- Verify only

- [ ] **Step 1: Run lint**

Run: `npm run lint`
Expected: PASS with no errors.

- [ ] **Step 2: Run production build**

Run: `npm run build`
Expected: PASS with generated production bundle.

- [ ] **Step 3: Check spec coverage against the implementation**

Checklist:

- header shows title, timer, blur toggle, theme toggle, terminate button
- timer progresses from green to yellow to red by contest progress
- sidebar shows selectable task letters with visual status
- statement panel shows description and temporary submissions tabs
- editor panel supports language choice, line numbers, cursor position, placeholder file action, submit button
- submit action posts to contest submission endpoint and stores returned result locally

- [ ] **Step 4: Commit final polish if verification required fixes**

```bash
git add src/api/contests.ts src/components/competition-live src/pages/CompetitionLivePage.tsx
git commit -m "chore: verify competition live page"
```

## Self-Review

Spec coverage check:

- timer, blur mode, theme control, terminate placeholder: covered in Tasks 3 and 4
- task sidebar selection and status: covered in Tasks 1, 3, and 4
- description/submissions tabs: covered in Tasks 1, 3, and 4
- editor language selection, cursor info, file placeholder, submit flow: covered in Tasks 3 and 4
- API integration for task list, task details, and submissions: covered in Task 2 and Task 4
- verification expectations: covered in Task 5

Placeholder scan:

- no unresolved TODO/TBD markers remain
- all touched files are named explicitly
- every run step has a concrete command

Type consistency check:

- uses `ContestParticipantTaskListItemDto`, `ContestParticipantTaskDetailsDto`, `SubmissionRequestDto`, and `SubmissionResponseDto` consistently
- page tab state uses `statement | submissions` consistently


# Competition Live Page Design

## Goal

Build the participant live contest page in [CompetitionLivePage.tsx](/C:/Users/Vladimir/Desktop/SPS/fsp-reactjs/src/pages/CompetitionLivePage.tsx) so it matches the provided visual direction and supports the core participant flow:

- see contest name and elapsed contest time
- understand time pressure from timer color even when digits are blurred
- switch between contest tasks
- read the current task statement
- draft code inside the page
- choose a programming language
- submit a solution to the backend judge
- inspect a temporary local list of submissions until a dedicated backend endpoint exists

## Scope

This design covers:

- page layout and styling
- client-side state model
- API integration for contest tasks and submissions
- temporary local submissions history behavior
- interaction behavior for timer, task selection, editor, and submit flow

This design does not cover:

- real backend-powered submissions history
- file upload modal behavior
- organizer-only contest termination behavior
- standings or scoreboard
- rich code editor dependencies such as Monaco

## Existing Context

- The page currently exists only as a placeholder in [CompetitionLivePage.tsx](/C:/Users/Vladimir/Desktop/SPS/fsp-reactjs/src/pages/CompetitionLivePage.tsx).
- Contest API helpers already live in [src/api/contests.ts](/C:/Users/Vladimir/Desktop/SPS/fsp-reactjs/src/api/contests.ts).
- Theme switching already exists through [src/theme/useTheme.ts](/C:/Users/Vladimir/Desktop/SPS/fsp-reactjs/src/theme/useTheme.ts).
- A reusable custom select pattern already exists in [src/components/competitions/CompetitionsFilters.tsx](/C:/Users/Vladimir/Desktop/SPS/fsp-reactjs/src/components/competitions/CompetitionsFilters.tsx).
- Backend API documentation defines the required participant endpoints in [frontend-api.md](/C:/Users/Vladimir/Desktop/SPS/fsp-reactjs/frontend-api.md).

## Recommended Approach

Use `CompetitionLivePage` as a data-and-state container and split the UI into small focused components colocated under `src/components/competition-live/`.

Recommended components:

- `CompetitionLiveHeader`
- `CompetitionTaskSidebar`
- `CompetitionTaskStatement`
- `CompetitionSubmissionPanel`

This keeps async logic centralized in the page while preventing a single oversized JSX file.

## Alternatives Considered

### Option 1: Single large page component

Fastest to start, but the file would grow quickly because it must own async fetching, timer behavior, tabs, editor behavior, submit flow, and responsive layout.

### Option 2: Colocated presentational components with page orchestration

Recommended. It keeps the surface area small, follows the current project scale, and leaves a clean path for future backend-driven submissions history.

### Option 3: Full module with hooks, services, and richer editor abstraction

Cleanest long term, but too heavy for the current milestone and unnecessary before the backend offers the full submissions history API.

## Data Model

Extend [src/api/contests.ts](/C:/Users/Vladimir/Desktop/SPS/fsp-reactjs/src/api/contests.ts) with participant live-page types and helpers.

### New API response types

- `ContestParticipantTaskListItemDto`
- `ContestParticipantTaskDetailsDto`
- `SubmissionRequestDto`
- `SubmissionResponseDto`

### New API helpers

- `getContestParticipantTasks(contestId: number)`
- `getContestParticipantTaskDetails(contestId: number, taskId: number)`
- `submitContestTaskSolution(contestId: number, taskId: number, body: SubmissionRequestDto)`

## Page State

`CompetitionLivePage` owns:

- parsed `contestId`
- contest details
- participant task list
- selected task id
- selected task details
- active details tab: `statement | submissions`
- selected language
- editor source text
- current cursor position: line and column
- timer blur flag
- temporary local submissions array
- loading and submit-in-progress flags
- recoverable request error state

## Layout

Desktop-first three-column working area under a compact header strip.

### Header row

Contains:

- contest title
- elapsed timer in `HH.MM.SS`-style formatting
- eye toggle button using [eye.svg](/C:/Users/Vladimir/Desktop/SPS/fsp-reactjs/src/assets/eye.svg) and [eye-closed.svg](/C:/Users/Vladimir/Desktop/SPS/fsp-reactjs/src/assets/eye-closed.svg)
- theme switch button using [change-theme.svg](/C:/Users/Vladimir/Desktop/SPS/fsp-reactjs/src/assets/change-theme.svg)
- red terminate button as visual placeholder

### Main area

Three columns:

- narrow task sidebar
- large task statement panel
- submission/editor panel

On narrower screens, columns stack vertically in this order:

1. sidebar
2. statement
3. editor

## Timer Behavior

The timer represents elapsed contest time from `0` to contest duration derived from `startAt` and `endAt`.

Rules:

- If current time is before contest start, show `00.00.00`.
- If current time is after contest end, clamp to full duration.
- Update every second.
- Color reflects contest progress, not absolute time value.

Color interpolation:

- first half: green to yellow
- second half: yellow to red

When blur mode is enabled:

- digits remain present but blurred enough to hide precise remaining time
- timer container color remains visible
- layout must not shift when toggled

## Task Sidebar Behavior

Each task tile shows the contest label, such as `A`, `B`, `C`.

Visual state:

- selected task gets the active border
- no attempts: neutral gray text
- attempted but unsolved: red text
- solved: green text

Status is derived from task list fields:

- `attemptCount`
- `solved`
- `bestVerdict`

Default selection behavior:

- select the first task after task list load
- preserve current selection if the task list refreshes and the task still exists

## Statement Panel

Top row:

- tabs: `Описание` and `Решения`
- current task solve state on the right: `Решено` in green or `Не решено` in neutral styling

### Description tab

Render:

- task title
- time limit
- memory limit
- input description
- output description
- statement
- optional notes if present
- format input section
- format output section
- examples block

Examples should support multiple samples by splitting backend text values into pairs when possible. If backend provides only single `exampleInput` and `exampleOutput`, show one sample block.

### Submissions tab

Until backend support exists, render a local in-memory list populated from successful submit responses returned during the current page session.

Each row shows:

- submission time
- verdict
- language label
- score or passed tests summary placeholder
- chevron affordance as non-functional UI

If there are no local submissions yet, show a compact empty state.

## Submission Panel

Top controls:

- panel title
- language select based on the existing competitions filter select pattern

Editor area:

- plain `textarea` with monospace styling
- separate line-number gutter generated from line count
- synchronized scrolling between gutter and text area
- current cursor line and column displayed in footer

Footer actions:

- add-file button with [add-file.svg](/C:/Users/Vladimir/Desktop/SPS/fsp-reactjs/src/assets/add-file.svg) as a placeholder only
- submit button

## Language Selection

Available options come from the selected task detail `allowedLanguages` when present.

Fallback order:

1. task `allowedLanguages`
2. contest `supportedLanguages`

The first available language becomes the default if the current selection is missing from the new options.

## Submit Flow

Clicking submit:

1. validate that a task is selected
2. validate that a language is selected
3. validate that source code is not empty after trim
4. `POST /api/contests/{contestId}/tasks/{taskId}/submissions`
5. prepend the returned submission to the local submissions list
6. update visible task status optimistically from the returned verdict when reasonable
7. switch the statement panel to the `Решения` tab so the user sees the result

While submitting:

- disable submit button
- keep editor content intact
- show a sending state label

On error:

- preserve editor content
- show an inline error message inside the panel

## Error and Loading States

Loading:

- page-level loading state while core contest/task data is bootstrapping
- task-details loading state when switching tasks

Error:

- invalid `contestId` route shows a compact invalid-page state
- contest or tasks fetch failure shows a retryable inline message
- task details failure keeps sidebar available and shows statement-panel error

## Accessibility

- all icon-only buttons need `aria-label`
- custom select must preserve keyboard navigation behavior from the existing filter select
- timer blur toggle must be announced as pressed/not pressed
- task list items must be buttons, not decorative divs

## Testing Strategy

Add component or page-level tests for the highest-risk logic:

- timer formatting and progress color mapping
- default task selection after task list load
- language fallback when task changes
- submit request payload generation
- local submissions list update after successful submit

If the repository has no established React testing setup yet, add small pure helper tests first for the timer and status mapping logic, then rely on lint and manual verification for the initial UI integration.

## Implementation Notes

- Keep the first version dependency-free beyond current project packages.
- Prefer helper functions for timer math, task status mapping, and sample parsing to keep JSX readable.
- Temporary submissions data should be explicitly isolated so it can later be replaced by a backend endpoint without rewriting the tab UI.

## Open Decisions Resolved

- The `Решения` tab will be temporary and local-only for now.
- The terminate button is presentational only in this milestone.
- File upload remains a placeholder trigger without modal behavior in this milestone.
- The editor will be a styled textarea rather than a third-party code editor.

# Frontend API

Актуально для backend-проекта `fsp-sevastopol` на 2026-05-15.

## База

- Base URL: `/`
- Основной API-префикс: `/api`
- Формат запросов и ответов: `application/json`, кроме `POST /api/tasks/{id}/tests/generate-preview`, где используется `multipart/form-data`

## Авторизация

Используется Bearer JWT:

```http
Authorization: Bearer <access_token>
```

Публичные endpoint'ы:

- `GET /api/contests`
- `GET /api/contests/{id}`

Все остальные `/api/**` endpoint'ы требуют авторизацию.

## Ошибки

Обычная ошибка:

```json
{
  "timestamp": "2026-05-15T12:00:00",
  "status": 404,
  "error": "Not Found",
  "message": "Описание ошибки",
  "path": "/api/..."
}
```

Ошибка валидации:

```json
{
  "timestamp": "2026-05-15T12:00:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Ошибка валидации данных",
  "path": "/api/...",
  "fieldErrors": {
    "title": "Название обязательно"
  }
}
```

Типовые статусы:

- `200 OK` - успешный `GET` или `PUT`
- `201 Created` - успешный `POST`
- `204 No Content` - успешный `DELETE`
- `400 Bad Request` - не прошла валидация
- `401 Unauthorized` - нет токена
- `403 Forbidden` - нет прав на сущность или операцию
- `404 Not Found` - сущность не найдена
- `409 Conflict` - конфликт бизнес-правил или целостности данных
- `500 Internal Server Error` - непойманная ошибка сервера

## Основные enum'ы

### `ContestFormatEnum`

- `ICPC`
- `IOI`
- `HACKATHON`
- `CUSTOM`

### `ContestLevelEnum`

- `LITE`
- `MEDIUM`
- `HARD`

### `ContestStatusEnum`

- `DRAFT`
- `REGISTRATION_OPEN`
- `REGISTRATION_CLOSED`
- `RUNNING`
- `FINISHED`
- `CANCELLED`

### `ParticipationTypeEnum`

- `INDIVIDUAL`
- `TEAM`

### `ParticipationStatusEnum`

- `PENDING`
- `CONFIRMED`
- `REJECTED`
- `DISQUALIFIED`

### `ProgrammingLanguageEnum`

- `CPP`
- `JAVA`
- `PYTHON`
- `KOTLIN`

### `TaskComparisonModeEnum`

- `EXACT`
- `TRIMMED_EXACT`
- `IGNORE_TRAILING_SPACES`

### `TeamStatusEnum`

- `PENDING`
- `CONFIRMED`
- `REJECTED`

## 1. Auth

### `GET /api/auth/me`

Требует авторизацию.

Возвращает текущего пользователя:

- `userId: number`
- `subjectId: string`
- `username: string`
- `email: string`
- `avatarUrl: string | null`
- `currentRating: number | null`
- `roles: string[]`

Подходит для:

- инициализации фронта после логина
- определения ролей пользователя
- показа профиля в header/sidebar

## 2. Contests

### `POST /api/contests`

Требует авторизацию.

Создаёт соревнование.

Тело запроса:

- `title: string`
- `description: string | null`
- `format: ContestFormatEnum`
- `participationType: ParticipationTypeEnum`
- `level: ContestLevelEnum`
- `supportedLanguages: ProgrammingLanguageEnum[]`
- `isPublic: boolean`
- `status: ContestStatusEnum`
- `registrationStartAt: string | null`
- `registrationEndAt: string | null`
- `startAt: string`
- `endAt: string`
- `maxTeamSize: number | null`
- `problemSetId: number | null`

Ответ: `ContestFullResponseDto`

- `id`
- `title`
- `description`
- `format`
- `participationType`
- `level`
- `supportedLanguages`
- `isPublic`
- `status`
- `registrationStartAt`
- `registrationEndAt`
- `startAt`
- `endAt`
- `maxTeamSize`
- `createdByUserId`
- `createdAt`
- `updatedAt`
- `problemSet`

`problemSet`:

- `id`
- `title`
- `description`
- `taskCount`

### `GET /api/contests`

Публичный endpoint.

Возвращает список соревнований: `ContestShortResponseDto[]`

Поля:

- `id`
- `title`
- `startAt`
- `registrationEndAt`
- `level`
- `supportedLanguages`

Практически для фронта:

- этого хватает для списка карточек, но не хватает `status`, `isPublic` и `endAt`

### `GET /api/contests/{id}`

Публичный endpoint.

Возвращает `ContestFullResponseDto`.

Подходит для:

- публичной страницы соревнования
- pre-login просмотра информации о контесте

### `PUT /api/contests/{id}`

Требует авторизацию.

Тело запроса такое же, как у `POST /api/contests`.

Ответ: `ContestFullResponseDto`.

### `DELETE /api/contests/{id}`

Требует роль `ADMIN`.

Ответа нет, статус `204`.

## 3. Participant API

Это лучший слой для обычного фронта участника.

### `GET /api/contests/{contestId}/me`

Требует авторизацию.

Возвращает `ContestParticipantStatusDto`:

- `registered: boolean`
- `status: ParticipationStatusEnum | null`
- `participantType: ParticipationTypeEnum | null`
- `teamId: number | null`
- `teamName: string | null`
- `isCaptain: boolean | null`
- `canRegister: boolean`
- `canSubmit: boolean`

`status` для участника может быть:

- `PENDING`
- `CONFIRMED`
- `ENDED`
- `REJECTED`
- `DISQUALIFIED`

Для фронта важно:

- если `status = ENDED`, пользователь уже завершил соревнование
- в этом случае `canSubmit = false`
- после этого кнопку отправки решения и кнопку завершения лучше скрывать или дизейблить

Подходит для:

- кнопки регистрации
- определения, может ли пользователь отправлять решения
- показа режима участия: индивидуально или команда

### `GET /api/contests/{contestId}/tasks`

Требует авторизацию.

Возвращает `ContestParticipantTaskListItemDto[]`:

- `id`
- `label`
- `title`
- `bestVerdict`

Подходит для:

- списка задач контеста
- боковой панели задач
- отображения статуса по каждой задаче

### `GET /api/contests/{contestId}/tasks/{taskId}`

Требует авторизацию.

Возвращает `ContestParticipantTaskDetailsDto`:

- `id`
- `label`
- `title`
- `statement`
- `inputDescription`
- `outputDescription`
- `notes`
- `exampleInput`
- `exampleOutput`
- `constraintsText`
- `timeLimitMs`
- `memoryLimitMb`
- `allowedLanguages: ProgrammingLanguageEnum[]`
- `myStats`

`myStats`:

- `attemptCount`
- `bestVerdict`
- `solved`

Подходит для:

- страницы задачи участника
- выбора языка программирования
- показа пользовательского прогресса по задаче

### `POST /api/contests/{contestId}/finish`

Требует авторизацию.

Помечает текущего пользователя как завершившего соревнование.

Тело запроса не требуется.

Ответа нет, статус `204 No Content`.

После успешного вызова фронту стоит заново запросить:

- `GET /api/contests/{contestId}/me`

Ожидаемый результат после finish:

- `status = ENDED`
- `canSubmit = false`

Пример:

```http
POST /api/contests/15/finish
Authorization: Bearer <token>
```

### `GET /api/contests/{contestId}/tasks/{taskId}/submissions`

Требует авторизацию.

Возвращает попытки текущего участника по конкретной задаче внутри конкретного соревнования.

Важно:

- выборка идет именно внутри `contestId + taskId`
- если одна и та же задача потом появится в тренировках, тренировочные попытки сюда не попадут
- для командного соревнования возвращаются попытки текущей команды пользователя в рамках этого соревнования

Ответ: `ContestParticipantSubmissionListItemDto[]`

- `attemptId`
- `attemptNumber`
- `submissionTime`
- `verdict`
- `language`
- `passedTestsCount`
- `solution`

Подходит для:

- истории отправок на странице задачи
- списка прошлых попыток
- повторного открытия и просмотра ранее отправленного кода

Пример:

```http
GET /api/contests/15/tasks/42/submissions
Authorization: Bearer <token>
```

### `GET /api/contests/{contestId}/tasks/{taskId}/submissions/{attemptId}`

Требует авторизацию.

Возвращает детали тестов конкретной попытки текущего участника по задаче внутри соревнования.

Ответ: `ContestParticipantSubmissionDetailsDto`

- `testResults`

`testResults[]`:

- `orderNum`
- `passed`
- `verdict`
- `reason`
- `timeMs`
- `memoryBytes`

Подходит для:

- раскрытия деталей конкретной отправки
- экрана результата одной попытки
- таблицы прохождения тестов по сабмиту

Пример:

```http
GET /api/contests/15/tasks/42/submissions/77
Authorization: Bearer <token>
```

## 4. Registration / Teams

### `POST /api/contests/{contestId}/register`

Требует авторизацию.

Регистрирует пользователя на индивидуальный контест.

Тело запроса не требуется.

Ответ: `ContestRegistrationResponseDto`

- `team: TeamResponseDto | null`
- `participation: ParticipationResponseDto`
- `role: ContestUserRoleResponseDto | null`
- `invite: TeamInviteResponseDto | null`

### `POST /api/contests/{contestId}/teams`

Требует авторизацию.

Создаёт команду и регистрирует капитана.

Тело запроса: `TeamCreateRequestDto`

- `name: string`
- `contactEmail: string | null`

Ответ: `ContestRegistrationResponseDto`

### `POST /api/contests/{contestId}/teams/join`

Требует авторизацию.

Вход в команду по инвайт-токену.

Тело запроса: `TeamJoinByTokenRequestDto`

- `token: string`

Ответ: `ContestRegistrationResponseDto`

### `GET /api/contests/{contestId}/teams/join?token=...`

Требует авторизацию.

Проверяет токен приглашения без вступления в команду.

Ответ: `TeamInviteResponseDto`

- `inviteToken`
- `inviteLink`
- `enabled`

### `POST /api/contests/{contestId}/teams/{teamId}/regenerate-invite`

Требует авторизацию.

Регенерирует командный инвайт.

Ответ: `TeamInviteResponseDto`

### `GET /api/contests/{contestId}/participants`

Требует авторизацию.

Возвращает `ContestParticipantListItemDto[]`:

- `participationId`
- `contestId`
- `teamId`
- `teamName`
- `userId`
- `participantType`
- `isCaptain`
- `status`
- `registeredAt`

Это скорее organizer/admin endpoint, не основной для participant UI.

### `GET /api/contests/{contestId}/teams`

Требует авторизацию.

Возвращает `ContestTeamListItemDto[]`:

- `teamId`
- `contestId`
- `name`
- `contactEmail`
- `captainUserId`
- `status`
- `memberCount`
- `createdAt`

### `GET /api/contests/{contestId}/my-participation`

Требует авторизацию.

Возвращает `ParticipationResponseDto`:

- `id`
- `contestId`
- `teamId`
- `userId`
- `participantType`
- `isCaptain`
- `status`
- `registeredAt`

Подходит для:

- проверки, зарегистрирован ли пользователь
- отрисовки состояния участия

### `DELETE /api/contests/{contestId}/register`

Требует авторизацию.

Снимает участие текущего пользователя.

Ответа нет, статус `204`.

## 5. Contest Problem Set Binding

Это backend-ручки для привязки набора задач к соревнованию.

### `PUT /api/contests/{contestId}/problem-set`

Требует авторизацию.

Тело запроса: `BindProblemSetToContestRequestDto`

- `problemSetId: number`

Ответ: `ProblemSetShortResponseDto`

- `id`
- `title`
- `description`
- `taskCount`

### `GET /api/contests/{contestId}/problem-set`

Требует авторизацию.

Ответ: `ProblemSetShortResponseDto`

### `DELETE /api/contests/{contestId}/problem-set`

Требует авторизацию.

Ответа нет, статус `204`.

## 6. Problem Sets

Это больше authoring/admin API, чем participant API.

### `POST /api/problem-sets`

Требует авторизацию.

Тело запроса: `ProblemSetRequestDto`

- `title: string`
- `description: string | null`
- `isPublic: boolean`

Ответ: `ProblemSetResponseDto`

- `id`
- `title`
- `description`
- `createdByUserId`
- `isPublic`
- `createdAt`
- `updatedAt`
- `tasks: ProblemSetTaskResponseDto[]`

### `GET /api/problem-sets`

Требует авторизацию.

Возвращает `ProblemSetShortResponseDto[]`.

### `GET /api/problem-sets/{id}`

Требует авторизацию.

Возвращает `ProblemSetResponseDto`.

### `PUT /api/problem-sets/{id}`

Требует авторизацию.

Тело запроса: `ProblemSetRequestDto`.

Ответ: `ProblemSetResponseDto`.

### `DELETE /api/problem-sets/{id}`

Требует авторизацию.

Ответа нет, статус `204`.

## 7. Problem Set Tasks

### `POST /api/problem-sets/{problemSetId}/tasks`

Требует авторизацию.

Тело запроса: `ProblemSetTaskRequestDto`

- `taskId: number`
- `orderNum: number`
- `contestLabel: string`
- `score: number`

Ответ: `ProblemSetTaskResponseDto`

- `id`
- `problemSetId`
- `taskId`
- `orderNum`
- `contestLabel`
- `score`
- `task`

`task`:

- `id`
- `title`
- `shortName`
- `timeLimitMs`
- `memoryLimitMb`

### `PUT /api/problem-sets/{problemSetId}/tasks/{linkId}`

Требует авторизацию.

Тело запроса: `ProblemSetTaskRequestDto`.

Ответ: `ProblemSetTaskResponseDto`.

### `DELETE /api/problem-sets/{problemSetId}/tasks/{linkId}`

Требует авторизацию.

Ответа нет, статус `204`.

## 8. Tasks

Это API библиотеки задач. Для participant-фронта напрямую чаще не нужен, кроме тестов/sample или внутренних экранов.

### `POST /api/tasks`

Требует авторизацию.

Тело запроса: `TaskRequestDto`

- `title`
- `shortName`
- `statement`
- `inputDescription`
- `outputDescription`
- `notes`
- `exampleInput`
- `exampleOutput`
- `constraintsText`
- `timeLimitMs`
- `memoryLimitMb`
- `source`
- `referenceSolution`
- `referenceLanguage`
- `isPublic`

Ответ: `TaskResponseDto`

- `id`
- `title`
- `shortName`
- `statement`
- `inputDescription`
- `outputDescription`
- `notes`
- `exampleInput`
- `exampleOutput`
- `constraintsText`
- `timeLimitMs`
- `memoryLimitMb`
- `source`
- `hasReferenceSolution`
- `referenceLanguage`
- `authorUserId`
- `isPublic`
- `createdAt`
- `updatedAt`

### `GET /api/tasks`

Требует авторизацию.

Возвращает `TaskResponseDto[]`.

### `GET /api/tasks/{id}`

Требует авторизацию.

Возвращает `TaskResponseDto`.

### `PUT /api/tasks/{id}`

Требует авторизацию.

Тело запроса: `TaskRequestDto`.

Ответ: `TaskResponseDto`.

### `DELETE /api/tasks/{id}`

Требует авторизацию.

Ответа нет, статус `204`.

## 9. Task Tests

### `POST /api/tasks/{id}/tests/generate-preview`

Требует авторизацию.

`multipart/form-data`:

- `inputsArchive: file` - zip с входными тестами
- `referenceSolutionFile: file`
- `referenceLanguage: string`

Ответ: `TaskTestsPreviewResponseDto`

- `taskId`
- `referenceLanguage`
- `totalTests`
- `generatedTests`

`generatedTests[]`:

- `orderNum`
- `sourceFileName`
- `inputData`
- `generatedOutput`
- `status`
- `stderr`
- `timeMs`
- `memoryBytes`
- `exitCode`
- `generationSucceeded`

### `POST /api/tasks/{id}/tests`

Требует авторизацию.

Сохраняет подтверждённые тесты задачи.

Тело запроса: `TaskTestsSaveRequestDto`

- `referenceSolution: string`
- `referenceLanguage: string`
- `comparisonMode: TaskComparisonModeEnum`
- `tests: TaskTestDraftDto[]`

`tests[]`:

- `inputData: string`
- `expectedOutput: string`
- `isSample: boolean`
- `orderNum: number`
- `points: number`

Ответ: `TaskTestsResponseDto`

- `taskId`
- `referenceLanguage`
- `comparisonMode`
- `totalTests`
- `tests`

`tests[]`:

- `id`
- `inputData`
- `expectedOutput`
- `isSample`
- `orderNum`
- `points`

Важное ограничение:

- если по задаче уже есть отправки решений, backend может запретить менять тесты и вернуть `409`

### `GET /api/tasks/{id}/tests`

Требует авторизацию.

Возвращает `TaskTestsResponseDto`.

Поведение:

- автор задачи получает все тесты
- не автор получает только sample-тесты

## 10. Submissions

### `POST /api/contests/{contestId}/tasks/{taskId}/submissions`

Требует авторизацию.

Отправляет решение в judge.

Поддерживает два формата запроса:

1. `application/json`
2. `multipart/form-data`

Если у пользователя `status = ENDED`, после завершения соревнования этот endpoint использовать нельзя.

#### JSON-вариант

Тело запроса: `SubmissionRequestDto`

- `language: ProgrammingLanguageEnum`
- `solution: string`

Пример:

```http
POST /api/contests/15/tasks/42/submissions
Authorization: Bearer <token>
Content-Type: application/json

{
  "language": "JAVA",
  "solution": "public class Main { public static void main(String[] args) {} }"
}
```

#### Multipart-вариант

`Content-Type: multipart/form-data`

Поля формы:

- `language: ProgrammingLanguageEnum`
- `file: File`

Пример на фронте:

```ts
const formData = new FormData();
formData.append("language", "JAVA");
formData.append("file", selectedFile);

await fetch(`/api/contests/${contestId}/tasks/${taskId}/submissions`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
  },
  body: formData,
});
```

Ответ: `SubmissionResponseDto`

- `attemptId`
- `contestId`
- `taskId`
- `attemptNumber`
- `language`
- `submissionTime`
- `verdict`
- `success`
- `passedTestsCount`
- `totalTestsCount`
- `maxTimeMs`
- `maxMemoryBytes`
- `compileOutput`
- `checkerOutput`
- `judgeMessage`
- `testResults`

`testResults[]`:

- `testId`
- `orderNum`
- `passed`
- `verdict`
- `reason`
- `timeMs`
- `memoryBytes`

Подходит для:

- экрана отправки решения
- моментального показа результата после сабмита

## 11. Что уже можно строить на фронте

### Для неавторизованного пользователя

Можно построить:

- список контестов
- публичную страницу конкретного контеста

Нужные ручки:

- `GET /api/contests`
- `GET /api/contests/{id}`

### Для обычного участника после логина

Можно построить:

- профиль текущего пользователя
- регистрацию на контест
- создание/вступление в команду
- страницу контеста с participant-state
- список задач контеста
- страницу конкретной задачи
- историю попыток по задаче
- просмотр деталей конкретной попытки
- отправку решения

Нужные ручки:

- `GET /api/auth/me`
- `GET /api/contests/{contestId}/me`
- `GET /api/contests/{contestId}/my-participation`
- `POST /api/contests/{contestId}/register`
- `POST /api/contests/{contestId}/teams`
- `POST /api/contests/{contestId}/teams/join`
- `GET /api/contests/{contestId}/tasks`
- `GET /api/contests/{contestId}/tasks/{taskId}`
- `GET /api/contests/{contestId}/tasks/{taskId}/submissions`
- `GET /api/contests/{contestId}/tasks/{taskId}/submissions/{attemptId}`
- `POST /api/contests/{contestId}/finish`
- `POST /api/contests/{contestId}/tasks/{taskId}/submissions`

## 12. Чего пока не хватает для полноценного participant UI

Сейчас в API нет participant-friendly endpoint'ов для:

- списка моих отправок по всему контесту без привязки к конкретной задаче
- таблицы результатов `standings`
- live scoreboard

То есть для полноценного соревновательного интерфейса ещё полезно добавить:

- `GET /api/contests/{contestId}/my-submissions`
- `GET /api/contests/{contestId}/standings`

## 13. Рекомендуемый фронтенд flow

### Гость

1. `GET /api/contests`
2. `GET /api/contests/{id}`
3. После логина перейти к participant flow

### Авторизованный участник

1. `GET /api/auth/me`
2. `GET /api/contests/{contestId}`
3. `GET /api/contests/{contestId}/me`
4. Если не зарегистрирован:
   - `POST /api/contests/{contestId}/register`, либо
   - `POST /api/contests/{contestId}/teams`, либо
   - `POST /api/contests/{contestId}/teams/join`
5. `GET /api/contests/{contestId}/tasks`
6. `GET /api/contests/{contestId}/tasks/{taskId}`
7. `GET /api/contests/{contestId}/tasks/{taskId}/submissions`
8. По клику на конкретную попытку: `GET /api/contests/{contestId}/tasks/{taskId}/submissions/{attemptId}`
9. `POST /api/contests/{contestId}/tasks/{taskId}/submissions`
10. По кнопке "Завершить": `POST /api/contests/{contestId}/finish`
11. После finish перечитать `GET /api/contests/{contestId}/me`

## 14. Файлы backend, на которые опирается эта документация

- [AuthController.java](/C:/Users/Vladimir/Desktop/SPS/fsp-sevastopol/src/main/java/ru/tournament/fsp_sevastopol/controller/AuthController.java)
- [ContestController.java](/C:/Users/Vladimir/Desktop/SPS/fsp-sevastopol/src/main/java/ru/tournament/fsp_sevastopol/controller/ContestController.java)
- [ContestParticipantController.java](/C:/Users/Vladimir/Desktop/SPS/fsp-sevastopol/src/main/java/ru/tournament/fsp_sevastopol/controller/ContestParticipantController.java)
- [ContestRegistrationController.java](/C:/Users/Vladimir/Desktop/SPS/fsp-sevastopol/src/main/java/ru/tournament/fsp_sevastopol/controller/ContestRegistrationController.java)
- [ContestProblemSetController.java](/C:/Users/Vladimir/Desktop/SPS/fsp-sevastopol/src/main/java/ru/tournament/fsp_sevastopol/controller/ContestProblemSetController.java)
- [ProblemSetController.java](/C:/Users/Vladimir/Desktop/SPS/fsp-sevastopol/src/main/java/ru/tournament/fsp_sevastopol/controller/ProblemSetController.java)
- [ProblemSetTaskController.java](/C:/Users/Vladimir/Desktop/SPS/fsp-sevastopol/src/main/java/ru/tournament/fsp_sevastopol/controller/ProblemSetTaskController.java)
- [TaskController.java](/C:/Users/Vladimir/Desktop/SPS/fsp-sevastopol/src/main/java/ru/tournament/fsp_sevastopol/controller/TaskController.java)
- [SubmissionController.java](/C:/Users/Vladimir/Desktop/SPS/fsp-sevastopol/src/main/java/ru/tournament/fsp_sevastopol/controller/SubmissionController.java)
- [SecurityConfig.java](/C:/Users/Vladimir/Desktop/SPS/fsp-sevastopol/src/main/java/ru/tournament/fsp_sevastopol/config/SecurityConfig.java)
- [GlobalExceptionHandler.java](/C:/Users/Vladimir/Desktop/SPS/fsp-sevastopol/src/main/java/ru/tournament/fsp_sevastopol/exception/GlobalExceptionHandler.java)

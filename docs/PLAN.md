# DSCubed Recruitment Website: Developer Work Plan (2027 S1)

Nov 14, 2026 · @Steven

## How to use this plan

Two developers build the site in five phases (0 to 4), over about five weeks of part-time work. Each developer does a similar share of frontend and backend work. **Dev A is Steven and owns every step that touches the Notion API.** **Dev B** is the second developer. The architecture, schemas and diagrams this plan refers to are in the [design document](https://claude.ai/artifact/56TYBDnoawQywrnXT9uRWm) (also saved as `docs/DESIGN.md`). Section numbers such as "design §6.2" point there.

- **Step format.** Each step has an ID (for example 2.7), an owner, the steps it depends on, the files it touches, what to build, and a "Done when" test. A step counts as finished only when its "Done when" test passes.
- **Working in parallel.** Phase 1 fixes the shared types, interfaces and an in-memory fake of the Notion repository first. After that, Dev B builds and tests the whole submission flow against the fake while Dev A builds the real Notion code. Neither has to wait for the other.
- **Contract files.** `src/lib/domain/*` and `src/lib/server/ports.ts` define the interfaces between the two developers' work. Any change to them needs both developers to approve the PR.
- **Tracking.** Update the Status column in the overview table below as you go.
- **Open question:** who is Dev B? Put their name in the overview table once confirmed.

## Ground rules

Both developers follow the same tooling, git workflow and definition of done. That keeps either person's code easy for the other to review and take over.

**Tooling**

| Concern          | Choice                                                     |
| ---------------- | ---------------------------------------------------------- |
| Framework        | SvelteKit with Svelte 5 (runes), TypeScript in strict mode |
| Package manager  | pnpm, on the current Node.js LTS version                   |
| Validation       | Zod                                                        |
| Unit tests       | Vitest                                                     |
| End-to-end tests | Playwright                                                 |
| Lint and format  | ESLint + Prettier; `svelte-check` for types                |
| Notion           | `@notionhq/client` (Dev A only)                            |
| Hosting          | Vercel (`@sveltejs/adapter-vercel`)                        |

**Git workflow**

1. `main` is protected. Changes reach it only through pull requests, and CI must pass first.
2. Name each branch after its step: `feat/2.7-application-service` or `fix/3.6-error-messages`.
3. Keep each PR to one step, or part of one. Small PRs get reviewed the same day.
4. The _other_ developer reviews every PR. Changes to the contract files need both of you.
5. Squash-merge. The commit title is the step ID plus a summary, for example `2.7: ApplicationService.submit with unit tests`.

**Definition of done** (applies to every step)

- `pnpm lint`, `pnpm check` and `pnpm test` pass locally and in CI.
- Logic has unit tests; UI has been checked in the browser at mobile and desktop widths.
- The step's own "Done when" test passes.
- The other developer has reviewed the PR.
- If the behaviour differs from the design document, the design document is updated in the same PR.
- Secrets never appear in the repository. `.env.example` lists the variable names only.

## Work split overview

There are 33 steps: Dev A owns 17, Dev B owns 14 and both share 2 at launch. The effort is roughly even, because several of Dev A's Notion steps are small while Dev B owns the larger orchestration and testing steps (2.7, 2.8, 4.2). Dev A's backend work is mostly the Notion integration. To balance that, Dev B owns the submission service, CAPTCHA, form action and CI, and the frontend work is split evenly between you.&#32;

| ID   | Step                                             | Owner | Area             | Depends on    | Status      |
| ---- | ------------------------------------------------ | ----- | ---------------- | ------------- | ----------- |
| 0.1  | Scaffold repository and tooling                  | Dev A | Setup            | none          | Done (awaiting review) |
| 0.2  | CI and branch protection                         | Dev A | Setup            | 0.1           | Not started |
| 0.3  | Notion databases and integration                 | Dev A | Backend (Notion) | none          | Not started |
| 0.4  | Vercel project, Turnstile keys, env template     | Dev B | Setup            | 0.1           | Not started |
| 1.1  | Config types and draft 2027 S1 config            | Dev B | Backend          | 0.1           | Not started |
| 1.2  | Word count and Zod schema                        | Dev B | Backend          | 1.1           | Not started |
| 1.3  | Domain types and ports (contract)                | Dev A | Backend          | 0.1           | Not started |
| 1.4  | Fake applicant repository                        | Dev A | Backend          | 1.3           | Not started |
| 1.5  | App shell and base styles                        | Dev A | Frontend         | 0.1           | Not started |
| 1.6  | Form field primitives                            | Dev B | Frontend         | 1.5           | Not started |
| 2.1  | Notion page builder                              | Dev A | Backend (Notion) | 0.3, 1.1, 1.3 | Not started |
| 2.2  | Duplicate email query                            | Dev A | Backend (Notion) | 0.3, 1.3      | Not started |
| 2.3  | Resume upload to Notion                          | Dev A | Backend (Notion) | 0.3, 1.3      | Not started |
| 2.4  | Create applicant page + integration test         | Dev A | Backend (Notion) | 2.1, 2.2, 2.3 | Not started |
| 2.5  | Notion retry policy                              | Dev A | Backend (Notion) | 2.4           | Not started |
| 2.6  | Turnstile verifier and honeypot check            | Dev B | Backend          | 0.4, 1.3      | Not started |
| 2.7  | `ApplicationService.submit`                      | Dev B | Backend          | 1.2, 1.4, 2.6 | Not started |
| 2.8  | `/apply` load, form action, composition root     | Dev B | Backend          | 2.7           | Not started |
| 2.9  | Logging helper                                   | Dev A | Backend          | 1.3           | Not started |
| 3.1  | Personal details section                         | Dev B | Frontend         | 1.6, 2.8      | Not started |
| 3.2  | Role preferences and dynamic questions           | Dev B | Frontend         | 3.1, 3.3      | Not started |
| 3.3  | Question field with word counter                 | Dev A | Frontend         | 1.2, 1.6      | Not started |
| 3.4  | Resume input                                     | Dev A | Frontend         | 1.6           | Not started |
| 3.5  | Draft autosave                                   | Dev A | Frontend         | 3.1, 3.2      | Not started |
| 3.6  | Submission states and messages                   | Dev B | Frontend         | 2.8, 3.2      | Not started |
| 3.7  | Turnstile widget and honeypot field              | Dev B | Frontend         | 2.6           | Not started |
| 3.8  | Landing page                                     | Dev A | Frontend         | 1.5           | Not started |
| 3.9  | Role cards                                       | Dev B | Frontend         | 1.1, 1.5      | Not started |
| 3.10 | Collection notice and accessibility pass         | Dev A | Frontend         | 3.6           | Not started |
| 4.1  | Real Notion repository on preview                | Dev A | Backend (Notion) | 2.5, 2.8      | Not started |
| 4.2  | Playwright end-to-end tests                      | Dev B | Testing          | 3.6           | Not started |
| 4.3  | Committee test, final content, production config | Both  | Launch           | 4.1, 4.2      | Not started |
| 4.4  | Launch and monitor                               | Both  | Launch           | 4.3           | Not started |

## Phase 0: Setup (week 1)

Phase 0 gives both developers a repository that builds, a CI pipeline, a test Notion database and a preview deployment for every PR. Steps 0.1 and 0.3 can start on the same day.

### 0.1 Scaffold repository and tooling (Dev A)

- **Depends on:** none.
- **Do:**
  1. Run `pnpm dlx sv create` with the minimal template and the TypeScript, ESLint, Prettier, Vitest and Playwright add-ons.
  2. Replace the default adapter with `@sveltejs/adapter-vercel`.
  3. Create the folder layout from design §12 with empty placeholder files.
  4. Add the design document as `docs/DESIGN.md`.
  5. Add the scripts `dev`, `build`, `check`, `lint`, `format`, `test`, `test:e2e`, and a `test:notion` script that Dev A fills in at step 2.4.
- **Done when:** on a fresh clone, `pnpm install && pnpm dev` serves a page, and `pnpm check`, `pnpm lint` and `pnpm test` all pass.

### 0.2 CI and branch protection (Dev A)

- **Depends on:** 0.1.
- **Do:** add a GitHub Actions workflow that runs on every PR: install with a pnpm cache, then `lint`, `check` and `test`. Protect `main` so that a PR needs one approval and green CI before it can merge.
- **Done when:** a test PR containing a failing unit test cannot be merged.

### 0.3 Notion databases and integration (Dev A, Notion)

- **Depends on:** none.
- **Do:**
  1. Create `TEST Applications` and `2027 S1 Applications`, using the property names, types and options in design §7.1 exactly.
  2. Create an internal integration named "DSCubed Recruitment Site" with read, insert and update content capabilities. Connect it to those two databases and nothing else.
  3. Record each database's data source ID. Keep the token and the IDs in the committee password manager, never in the repository.
- **Done when:** a throwaway script creates a page in `TEST Applications` and then archives it.

### 0.4 Vercel project, Turnstile keys and env template (Dev B)

- **Depends on:** 0.1.
- **Do:**
  1. Import the repository into Vercel (Hobby). `main` deploys to production, and each PR gets a preview deployment.
  2. Create a Cloudflare Turnstile widget for the production hostname and `localhost`. For local development and CI, use Cloudflare's published dummy test keys (one pair always passes, one always fails), and record them in the README.
  3. Write `.env.example` listing `NOTION_TOKEN`, `NOTION_DATA_SOURCE_ID`, `TURNSTILE_SECRET_KEY`, `PUBLIC_TURNSTILE_SITE_KEY`, `APPLICANT_REPO` (`fake` or `notion`) and `FAKE_NOW` (an ISO time used only outside production).
  4. Set Vercel's preview variables to the TEST database and its production variables to the real one. Dev A supplies the Notion values.
- **Done when:** a PR shows a working preview URL, and both environments have every variable set.

## Phase 1: Foundations and shared contracts (weeks 1 to 2)

Phase 1 fixes the code that both developers build on: the config, the validation schema, the domain types, the ports and a fake repository. **Merge 1.3 and 1.4 as early as possible.** Until they land, Dev B cannot start the submission service.

### 1.1 Config types and draft 2027 S1 config (Dev B)

- **Depends on:** 0.1.
- **Files:** `src/lib/config/types.ts`, `src/lib/config/recruitment.ts`.
- **Do:** implement the types in design §7.4, with exactly one `question` per role. Write a draft config with three placeholder roles, so that the form and the landing page have realistic data. Leave dates and questions as `"TBD"` until the directors send them. Add a unit test that fails if role IDs are duplicated, if role names are duplicated, or if there are fewer than two roles.
- **Done when:** the config compiles with `satisfies RecruitmentConfig`, and the test passes.

### 1.2 Word count and Zod schema (Dev B)

- **Depends on:** 1.1.
- **Files:** `src/lib/domain/words.ts`, `src/lib/domain/schema.ts`.
- **Do:** implement `countWords` and `applicationSchema`, following design §7.5 and §7.6. The schema must work in the browser as well as on the server, so it must not import anything server-only.
- **Done when:** unit tests cover every rule in the §7.5 table, including:
  - exactly 200 words passes and 201 fails
  - one 2,001-character "word" fails
  - identical first and second preferences fail
  - email is lowercased and trimmed
  - `"yes"` and `"no"` become booleans

### 1.3 Domain types and ports, the contract (Dev A)

- **Depends on:** 0.1.
- **Files:** `src/lib/domain/application.ts`, `src/lib/server/ports.ts`.
- **Do:**
  - Define `Application`, `ResumeFile` and the `SubmitResult` union (`ok`, `closed`, `captcha`, `invalid`, `duplicate`, `upstream`).
  - Define the interfaces `ApplicantRepository` (`existsByEmail`, `uploadResume`, `create`), `CaptchaVerifier` and `Clock`, as in design §5.2.
  - Add JSDoc to each method stating what it returns and which errors it throws. In particular, `UpstreamError` means "Notion failed after retries".
- **Done when:** Dev B has reviewed and approved the PR. From then on, changes need both developers.

### 1.4 Fake applicant repository (Dev A)

- **Depends on:** 1.3.
- **Files:** `src/lib/server/fakeRepository.ts`.
- **Do:**
  - Write an in-memory `ApplicantRepository` that stores applications in a `Map` keyed by email.
  - Its options make it fail on demand (`duplicate`, `upstreamOnCreate`, `upstreamOnUpload`).
  - It logs a readable summary of each application it "creates".
  - It is used in unit tests, and in local development when `APPLICANT_REPO=fake`.
- **Done when:** its own tests pass, and Dev B confirms it covers every branch of the submission flow.

### 1.5 App shell and base styles (Dev A)

- **Depends on:** 0.1.
- **Files:** `src/routes/+layout.svelte`, `src/app.css`.
- **Do:** build the root layout with a header (DSCubed name and logo) and a footer with contact details. Define base CSS custom properties for colour, spacing, radius and type scale, and a centred, readable content width. Keep the visual design minimal, since styling decisions are deferred.
- **Done when:** both routes render inside the shell and look correct at 375 px and 1280 px wide.

### 1.6 Form field primitives (Dev B)

- **Depends on:** 1.5.
- **Files:** `src/lib/components/form/TextField.svelte`, `SelectField.svelte`, `RadioGroup.svelte`, `FieldError.svelte`.
- **Do:** build labelled inputs that accept `name`, `label`, `helpText`, `required`, `value` (bindable) and `error`. Errors are linked to their input through `aria-describedby`. These are the shared building blocks for every form section in Phase 3.
- **Done when:** a test route shows each primitive in its normal, filled and error states, and keyboard navigation works.

## Phase 2: Backend (weeks 2 to 3)

Phase 2 runs in two parallel tracks. Dev A builds the real Notion repository (2.1 to 2.5). Dev B builds CAPTCHA verification, the submission service and the form action against the fake repository (2.6 to 2.8). At the end, the real repository drops in behind the same interface.

### Dev A track: Notion repository

### 2.1 Notion page builder (Dev A, Notion)

- **Depends on:** 0.3, 1.1, 1.3.
- **Files:** `src/lib/server/notion/properties.ts` (property name constants), `src/lib/server/notion/pageBuilder.ts`.
- **Do:**
  - Write pure functions `properties(app, fileUploadId)` and `children(app, config)`. They produce the property payload in design §7.1 and the block layout in §7.3.
  - Role IDs are converted to role names for the select properties. `Submitted at` uses the Melbourne offset.
  - Text longer than 2,000 characters is split into several rich-text objects.
  - Applicant text is always sent as plain text.
- **Done when:** snapshot tests match the expected payload, and a 2,500-character input produces two rich-text chunks.

### 2.2 Duplicate email query (Dev A, Notion)

- **Depends on:** 0.3, 1.3.
- **Files:** `src/lib/server/notion/repository.ts`.
- **Do:** implement `existsByEmail` as a query on the data source, filtered on the `Email` property equal to the normalised email, with `page_size: 1`. Check that the SDK targets the data-source API version.
- **Done when:** against TEST, the method returns `true` for a seeded email and `false` for a new one.

### 2.3 Resume upload to Notion (Dev A, Notion)

- **Depends on:** 0.3, 1.3.
- **Files:** `src/lib/server/notion/repository.ts`.
- **Do:** implement `uploadResume` as a single-part file upload. Create the upload object, send the PDF bytes, and return the upload ID once its status is `uploaded`.
- **Done when:** a 3.9 MB test PDF uploads successfully and the method returns an ID.

### 2.4 Create applicant page and integration test (Dev A, Notion)

- **Depends on:** 2.1, 2.2, 2.3.
- **Files:** `src/lib/server/notion/repository.ts`, `tests/integration/notion.test.ts`.
- **Do:** implement `create`. It posts a page whose parent is the data source, with the builder's properties, the resume attached to `Resume`, and the builder's children. Wire up `pnpm test:notion`, which runs this test against TEST using a local `.env`. CI does not run it.
- **Done when:** the integration test runs check, upload and create, and the resulting page in TEST matches design §7.3 when opened in Notion. The test cleans up after itself by archiving the page.

### 2.5 Notion retry policy (Dev A, Notion)

- **Depends on:** 2.4.
- **Files:** `src/lib/server/notion/retry.ts`.
- **Do:** follow design §6.4.
  - Retry reads and uploads up to 2 times, honouring `Retry-After`.
  - Retry `create` immediately only after a `429`.
  - After a timeout or a `5xx` on `create`, re-run `existsByEmail`. Return the page as created if it now exists; otherwise throw `UpstreamError`.
- **Done when:** unit tests with a mocked client cover a `429` followed by success, a `5xx` where the page actually exists, and a `5xx` where it does not.

### 2.9 Logging helper (Dev A)

- **Depends on:** 1.3.
- **Files:** `src/lib/server/log.ts`.
- **Do:** write `logSubmission({ submissionId, outcome, durationMs, step? })`, which writes one JSON line per request. It must have no parameters for names, emails, answers or files.
- **Done when:** Dev B is using it in 2.7, and a review confirms no personal data can be logged.

### Dev B track: submission flow

### 2.6 Turnstile verifier and honeypot check (Dev B)

- **Depends on:** 0.4, 1.3.
- **Files:** `src/lib/server/turnstile.ts`.
- **Do:** implement `TurnstileVerifier`, which posts the token, the secret key and the client IP to Cloudflare's `siteverify` endpoint. Treat a network error as a failed check. Add `isHoneypotFilled(formData)`.
- **Done when:** tests pass using the always-pass and always-fail dummy secret keys.

### 2.7 `ApplicationService.submit` (Dev B)

- **Depends on:** 1.2, 1.4, 2.6.
- **Files:** `src/lib/server/applicationService.ts`.
- **Do:** implement the steps of design §6.2 and §6.3, in this order:
  1. check the open window
  2. check the honeypot
  3. verify the CAPTCHA
  4. parse with Zod
  5. check the `%PDF-` signature
  6. check for a duplicate email
  7. upload the resume
  8. create the page

  Return a `SubmitResult` and never throw to the caller. Assign a `submissionId` (`crypto.randomUUID()`), and log the outcome with 2.9.

- **Done when:** unit tests using the fake repository, a fake CAPTCHA verifier and a fixed `Clock` produce each of the six results. Also test that nothing is uploaded when the email is a duplicate.

### 2.8 `/apply` load, form action and composition root (Dev B)

- **Depends on:** 2.7.
- **Files:** `src/routes/apply/+page.server.ts`, `src/lib/server/container.ts`.
- **Do:**
  - `container.ts` builds the service. It uses the Notion repository when `APPLICANT_REPO=notion`, otherwise the fake. It honours `FAKE_NOW` only when `VERCEL_ENV` is not `production`.
  - `load` returns whether the form is open, plus the role list and questions for the form.
  - The default action maps each `SubmitResult` to the status codes and action data in design §8.
- **Done when:** submitting with `curl -F` against the dev server returns each status, and a successful submission prints the fake repository's summary.

## Phase 3: Frontend (weeks 3 to 4)

Phase 3 builds the application form and the landing page. Each developer owns half of the steps.

All form components read roles, questions, the word limit and interview dates from the config. Nothing about the recruitment content is hard-coded in components. The form is one page, in this order:

1. personal details
2. role preferences
3. the three questions
4. resume
5. collection notice
6. CAPTCHA and the Submit button

### Form

### 3.1 Personal details section (Dev B)

- **Depends on:** 1.6, 2.8.
- **Files:** `src/routes/apply/+page.svelte`, `src/lib/components/apply/PersonalDetails.svelte`.
- **Do:** build the fields for full name, student email, degree and expected graduation. Student email shows the helper text "Please use your university student email". Expected graduation is a dropdown built from `graduationOptions`. Add the two required Yes/No radio groups for interview availability. Their labels include the dates from `interviews` ("TBD" for now).
- **Done when:** the fields post with the names in design §7.5, and the server's field errors appear beside the correct inputs.

### 3.2 Role preferences and dynamic questions (Dev B)

- **Depends on:** 3.1, 3.3.
- **Files:** `src/lib/components/apply/RolePreferences.svelte`, `Questions.svelte`.
- **Do:**
  - Build the first and second preference dropdowns. The second hides the role chosen first. If the first preference changes to the current second choice, clear the second.
  - Always show the general question.
  - Once a role is chosen for a preference, show that role's question under the heading "First preference: \<role name>" or "Second preference: \<role name>".
  - Use `$derived` for the visible questions.
- **Done when:** every combination of roles shows the correct three questions, and the same role cannot be chosen twice.

### 3.3 Question field with word counter (Dev A)

- **Depends on:** 1.2, 1.6.
- **Files:** `src/lib/components/apply/QuestionField.svelte`.
- **Do:** build a textarea with a live counter ("143 / 200 words") that uses the shared `countWords`. Over the limit, the counter changes to a warning style and an error is announced through `aria-live`. Don't block typing, so that applicants can paste text and then trim it.
- **Done when:** the counter agrees with the server at 200 and 201 words, and screen readers announce the warning once.

### 3.4 Resume input (Dev A)

- **Depends on:** 1.6.
- **Files:** `src/lib/components/apply/ResumeInput.svelte`.
- **Do:** build a file input with `accept="application/pdf"`. On selection, check the type and the 4 MB limit and show the file name and size. After a failed submission, show "Please re-attach your resume", because browsers cannot keep the selected file.
- **Done when:** a non-PDF file and a 5 MB file are both rejected in the browser, and a 3 MB PDF is accepted.

### 3.5 Draft autosave (Dev A)

- **Depends on:** 3.1, 3.2.
- **Files:** `src/lib/apply/draft.svelte.ts`.
- **Do:** save every text, select and radio value to `localStorage` under the key `dscubed-2027s1-draft`. Debounce the saves to every 500 ms, and wrap every read and write in `try/catch`. Restore the draft when the page loads. Clear it only after a successful submission. Provide a small "Clear form" button.
- **Done when:** after a refresh, or a simulated `upstream` failure, every answer reappears, and after a successful submission the form is empty.

### 3.6 Submission states and messages (Dev B)

- **Depends on:** 2.8, 3.2.
- **Files:** `src/routes/apply/+page.svelte`, `src/lib/components/apply/SubmitStatus.svelte`.
- **Do:** use `use:enhance`. While a submission is in progress, disable Submit and show "Submitting…". Map each outcome to the UI behaviour in design §8:
  - success screen showing the submission time
  - duplicate message
  - closed screen
  - CAPTCHA retry
  - field errors, with focus moved to the first one
  - general upstream error
- **Done when:** each outcome can be triggered with the fake repository and `FAKE_NOW`, and each renders correctly.

### 3.7 Turnstile widget and honeypot field (Dev B)

- **Depends on:** 2.6.
- **Files:** `src/lib/components/apply/Turnstile.svelte`.
- **Do:** load Cloudflare's widget script with `PUBLIC_TURNSTILE_SITE_KEY` and reset the widget after a failed submission. Add a visually hidden `website` input with `tabindex="-1"` and `autocomplete="off"`, which is also hidden from screen readers.
- **Done when:** with the dummy keys, the always-pass key lets the form submit and the always-fail key produces the CAPTCHA message.

### Landing page

### 3.8 Landing page (Dev A)

- **Depends on:** 1.5.
- **Files:** `src/routes/+page.svelte`, `src/routes/+page.ts` (`prerender = true`).
- **Do:** build these sections in order:
  1. hero
  2. about DSCubed
  3. roles (the cards from 3.9)
  4. a three-round timeline: application, group interview, individual interview
  5. "Apply now" at the bottom, linking to `/apply`

  Show "Applications open on \<date>" or "Applications are closed" outside the open window. Because the page is prerendered, this check runs in the browser, from the config dates. Write placeholder copy, which the committee replaces at step 4.3.

- **Done when:** the page is prerendered in `pnpm build`, and all three window states display correctly.

### 3.9 Role cards (Dev B)

- **Depends on:** 1.1, 1.5.
- **Files:** `src/lib/components/RoleCard.svelte`, `RolesSection.svelte`.
- **Do:** build one card per role from the config: name, description and responsibilities. Optionally, a card can expand to show the question that role asks, so applicants can prepare.
- **Done when:** adding a role to the config adds a card with no other code change.

### 3.10 Collection notice and accessibility pass (Dev A)

- **Depends on:** 3.6.
- **Files:** `src/lib/components/apply/CollectionNotice.svelte`, plus fixes across the components.
- **Do:** add the collection notice above Submit: what is collected, why, who sees it, how long it is kept, and how to request deletion. The committee confirms the wording. Then check the whole form with the keyboard alone and with a screen reader (VoiceOver or NVDA), and run an automated accessibility checker (for example axe in Playwright, in 4.2).
- **Done when:** the form can be completed with the keyboard alone, and the automated checker reports no serious issues.

## Phase 4: Integration, testing and launch (week 5)

Phase 4 swaps the fake repository for the real one, tests the whole flow on a preview deployment, and launches with the final content. In the shared steps, each sub-task names its owner, and all Notion work stays with Dev A.

### 4.1 Real Notion repository on preview (Dev A, Notion)

- **Depends on:** 2.5, 2.8.
- **Do:** set `APPLICANT_REPO=notion` in Vercel's preview environment, pointing at `TEST Applications`. Submit through a preview URL and check the page in Notion: the properties, the body layout, the resume, and `Stage` set to Applied. Submit the same email again and confirm the duplicate message. Then temporarily use an invalid token on one preview and confirm the upstream message, with the applicant's draft still kept.
- **Done when:** all three checks pass on a preview deployment.

### 4.2 Playwright end-to-end tests (Dev B)

- **Depends on:** 3.6.
- **Files:** `tests/e2e/apply.spec.ts`, `tests/e2e/landing.spec.ts`.
- **Do:** run the tests against `pnpm build && pnpm preview`, with `APPLICANT_REPO=fake` and the dummy Turnstile keys. Cover:
  - the happy path
  - field errors (a 201-word answer, the same role twice, a non-PDF)
  - a duplicate email
  - the closed state (with `FAKE_NOW` set after closing)
  - draft restore after a reload
  - an axe accessibility scan of both pages

  Add the suite to CI.

- **Done when:** the suite passes in CI, and a deliberately broken word limit makes it fail.

### 4.3 Committee test, final content and production configuration (both)

- **Depends on:** 4.1, 4.2.
- **Do:**
  1. **Both:** ask 5 to 10 committee members to apply on a preview deployment, including from phones. Collect their feedback in one list and fix the issues it raises.
  2. **Dev A:** put the directors' role names, descriptions, responsibilities and questions, the general question, the dates and the interview dates into `recruitment.ts`. Create the production `First preference` and `Second preference` options, with names that match the config exactly.
  3. **Dev B:** set the production environment variables, the production Turnstile keys and the domain. Replace the placeholder copy on the landing page and the collection notice with the approved wording.
  4. **Both:** run a production smoke test. Temporarily set `opensAt` earlier, or deploy with the real dates if the window is already open, submit one real application, check it in Notion, and then delete that page.
- **Done when:** the committee's feedback is resolved, and the production smoke test produces a correct Notion page.

### 4.4 Launch and monitor (both)

- **Depends on:** 4.3.
- **Do:** check that the deployed site opens automatically at `opensAt`. During the application window, **Dev B** checks the Vercel function logs each day for `upstream` and `captcha` outcomes. **Dev A** checks that the number of Notion pages matches the number of `ok` outcomes in the logs. After `closesAt`, confirm that the form shows the closed state and that a late request through `curl` gets `403`.
- **Done when:** the window has closed, every logged `ok` outcome has a Notion page, and directors have started reviewing in Notion.

## Hand-overs and launch checklist

The two tracks touch at only three points. When a hand-over is late, the receiving developer is blocked, so merge hand-over PRs first and tell the other developer when they land.

&#91;embedded content: developer tracks by phase · 3 hand-overs\]

Dev B builds against the fake repository until step 4.1, when Dev A's real Notion repository plugs into the form action. Dev A's word counter (3.3) is used in Dev B's question UI (3.2). Both tracks meet at the committee test.

**Before applications open**

- [ ] Directors' role names, descriptions, responsibilities and questions are in `recruitment.ts` (Dev A)
- [ ] Open and close times and interview dates are set in the config (Dev A)
- [ ] Production `First preference` and `Second preference` options match the role names exactly (Dev A)
- [ ] The Notion database is shared only with committee members involved in recruitment (Dev A)
- [ ] Production environment variables and Turnstile keys are set, and previews still point at TEST (Dev B)
- [ ] Landing page copy and the collection notice use the approved wording (Dev B)
- [ ] The end-to-end suite is green on `main` (Dev B)
- [ ] The production smoke test page was created, checked and deleted (both)

**While applications are open**

- [ ] Vercel logs checked daily for `upstream` and `captcha` outcomes (Dev B)
- [ ] The number of Notion pages matches the number of `ok` outcomes in the logs (Dev A)

**After applications close**

- [ ] The form shows the closed state, and a late `curl` request gets `403` (Dev B)
- [ ] A deletion date for unsuccessful applicants' data is agreed with the committee (Dev A)

**Additional stuff**
- DO NOT COMMIT ANYTHING. EVERY CHANGE SHOULD BE COMMUNICATED TO A DEVELOPER AND THEY WILL MANUALLY COMMIT!

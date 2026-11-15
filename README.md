# DSCubed Recruitment Website

DSCubed's own recruitment website! Applicants read about the teams and apply online, and each application goes straight into a Notion database for directors to review.

Built with SvelteKit and TypeScript, and hosted on Vercel.

## Getting started

You need Node.js (LTS) and pnpm.

```sh
pnpm install
cp .env.example .env
pnpm dev
```

The defaults in `.env.example` run the site without Notion: applications are kept in memory and printed in the terminal, and Cloudflare's test keys make the CAPTCHA always pass.

To see the form open, set real `opensAt` and `closesAt` dates in `src/lib/config/recruitment.ts`. While they're `"TBD"`, applications are closed.

## Scripts

| Command            | What it does                                                      |
| ------------------ | ----------------------------------------------------------------- |
| `pnpm dev`         | Start the dev server                                              |
| `pnpm build`       | Build for production                                              |
| `pnpm check`       | Type-check                                                        |
| `pnpm lint`        | Check formatting and lint                                         |
| `pnpm format`      | Format the code                                                   |
| `pnpm test`        | Run the unit tests                                                |
| `pnpm test:e2e`    | Run the browser tests                                             |
| `pnpm test:notion` | Run the tests against the TEST Notion database (needs Notion env) |

## Editing the content

- **Roles, questions and dates:** `src/lib/config/recruitment.ts`
- **Landing page text:** `src/lib/config/landing.ts`
- **Collection notice:** `src/lib/config/notice.ts`

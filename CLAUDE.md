# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

`@doshi-experiments/design-system` is the source of truth for shared UI across Rishabh Doshi's sites: tokens, React components, the static site header, theming and the Felt identity. `README.md` is authoritative for the contract and release history; `docs/identity.md` holds the palette, type, shape and **copy rules**; `docs/rollout.md` covers releases. Author commits as `doshi-experiments <311927837+doshi-experiments@users.noreply.github.com>`; GitHub rejects pushes that carry a private email.

## Never publish PII or sensitive information

Nothing personal or sensitive goes to GitHub, under any circumstances, without Rishabh's direct approval of that specific content. That covers files, commit messages, branch names, pull requests, issues, comments, release notes, screenshots and test fixtures, and it applies even while a repository is private: every repository on this account is public or will be.

- Personal data: names other than Rishabh's public name (household members, pets, friends), email addresses, phone numbers, home addresses, the city or neighbourhood the household lives in, dates of birth, health or care providers.
- Financial data: account or card numbers, balances, real transactions, statements, payees and merchant strings, amounts and dates from real data, which banks or cards are held, anything from bank exports or Actual Budget.
- Secrets and infrastructure: `.env` contents, API keys, tokens, passwords, private hostnames and IP addresses, Tailscale names, Home Assistant entity names and user ids, chat ids.
- Anything copied from a real export, inbox, database or log. A file named "example" or "sample" must be invented, not trimmed from real data.

Commit identity: author and commit only as `doshi-experiments <311927837+doshi-experiments@users.noreply.github.com>`. Run `git config user.email` before the first commit in any checkout, and never put a personal address in a `Co-authored-by` trailer.

Commit messages and pull request text are as public as the code. Describe what changed and why, not the real data that prompted it: no real merchants, amounts, transaction dates, account names or people, even as examples.

Use synthetic fixtures instead. Before every commit and push, check the staged diff, any new untracked files and the message itself for this kind of content. If something looks sensitive, or you are unsure, stop and ask; do not commit it, push it or open a pull request with it. Earlier approval of a different change does not cover this one. Git history is permanent: a leak can only be removed by rewriting history and recreating the repository.

## Commands

```sh
npm run build              # writes dist/ (committed)
npm test                   # node --test: tokens, appearance, rollout
node --test tests/tokens.test.mjs
npm run test:components    # Playwright; needs `npx playwright install --with-deps chromium`
node scripts/check-tailwind.mjs   # just the 0.10 Button parity check (part of test:components)
npm run preview            # builds preview/build/, then http://localhost:4174/preview/ (tailwind.html compares buttons)
npm run rollout -- --workspace <dir> [--apply] [--only a,b]
node scripts/ds-usage.mjs <checkout>…  # ds-* classes and /react imports an app still has
```

CI (`.github/workflows/checks.yml`) runs the build and fails on `git diff --exit-code -- dist`, so always commit a rebuilt `dist/`. It then runs `npm test`, the Playwright component checks and `npm pack --dry-run`.

The cross-app browser checks (`test:browser`, `test:calculator`, `test:identity`, plus `scripts/check-game-privacy.mjs` and `check-visualizations.mjs`) need `DESIGN_WORKSPACE` pointing at a folder that holds this repo as `design-system/` and the six consumer checkouts under `design-system-rollout/<repo>`, with the two React apps built. `test:identity` also needs `FINANCE_PREVIEW_URL` (a running `preview_design.py --review-fixtures`). The checks start servers on ports 4180–4220: kill stale `http.server` processes there first, or they serve directory listings and everything fails.

## Releasing

1. Edit `src/`, bump the version in `package.json` and `package-lock.json` (never reuse a version number), run `npm run build && npm test`, and commit `dist/`.
2. Prepare consumer upgrades with `npm run rollout -- --workspace <dir>`, then `--apply`. The workspace must hold clean checkouts named as in `rollout.json`. It writes snapshots and tarballs only; it never commits, pushes or deploys.
3. In each consumer, check text drawn on `--ds-action-primary`, `--accent` or `--on-accent` (now white), and any service worker that precaches font or texture files. Then open one PR per consumer, design system first.

## Architecture

- `src/tokens.js` is the single source. `foundation` holds type, space, radii, motion and the signal gradients; `appearances.light/dark` hold colours; `projectAppearanceOverrides` is empty, so every project resolves to one palette ("one look for everything"). `resolveTokens()` adds `focus` (= `action-link`) and amount colours. `scripts/build.mjs` turns it into `tokens.css` (one rule per project × appearance), `tokens.json` and the font faces.
- `src/components.css` styles the React components (`src/react.js`, `src/table.js`) and static classes. `src/legacy.css` maps older site variable names onto tokens. `src/site.js` mounts the static header; `src/theme.js` is the appearance controller; `src/prepaint.js` must load synchronously in `<head>` before styles.
- Tailwind CSS v4 (0.10): `src/tailwind-theme.js` maps Tailwind theme names onto `--ds-*` tokens; `scripts/tailwind.mjs` writes `dist/tailwind.css` from it (theme, `@custom-variant`s, `@utility` surfaces). `src/ui/` holds components in shadcn's shape (cva over Base UI, `data-slot`, `cn()`), compiled by esbuild into `dist/ui.js`. `docs/tailwind-migration.md` is the plan. Never define shadcn's colour names (`primary`, `muted`, `foreground`…) or a signal text colour; `tests/tailwind.test.mjs` fails on them.
- Porting a shadcn component: `npx shadcn@4.23.0 add <name>` (`components.json`: base-nova, JSX). The registry imports `cn` from the `cn` npm package and the CLI installs it; uninstall it and import from `@/ui/cn` instead. Restyle every class to Felt, keep `forwardRef` while a consumer runs React 18, export it from `src/ui/index.js`, and add a parity check against the `ds-*` version.
- Consumers never take a live dependency: each commits an `npm pack` tarball, which `npm ci` checks against its lockfile. The portfolio's `/versions/` still commits a snapshot with `release.json` hashes. The calculator and Mr. Shake build with the Tailwind CLI and copy fonts and `felt/` from the tarball; experiments-landing and visualizations build with Vite into `dist/`, which the browser checks serve.

## Invariants that are easy to break

- Runtime contract on the root element: `data-project`, `data-theme` (`light`|`dark`, omitted for System), `data-density` (`comfortable`|`compact`|`game`).
- Public sites share the `sheet-theme` cookie scoped to `.rishabhdoshi.com`. Renaming it or changing its scope breaks cross-site sync silently and only in production. Finance uses a private storage key and no cookie.
- The signal (0.7): `action-gradient` `#D2386B` → `#C8312F` under white `action-text`; `action-primary` `#CD354D` is its solid midpoint. Hover and press **deepen**; lightening drops white below 4.5:1. Text in the signal colour always uses `action-link`. `npm test` checks every gradient stop and every text/surface pair, including on `selection`.
- Error text must never equal the signal. Status colours keep their meaning across apps.
- Targets: 44px minimum, 60px at game density.
- Copy follows `docs/identity.md`: sentence case, literal action names, fixed project descriptions, the exact Mr. Shake headline, and never invented clients, case studies or outcomes.

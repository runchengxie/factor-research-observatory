# Alpha 810 Observatory Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a static Alpha 810 research view to the existing factor observatory and document its public snapshot contract, while keeping raw computation outside the frontend repository.

**Architecture:** The site will load a versioned `alpha810-snapshot.json` beside the existing public snapshots. TypeScript validation will normalize the provider contract into frontend types, and a new overview/detail flow will display aggregate factor evidence only. Existing Vite/React Pages deployment remains the interactive site; stable methodology and schema documentation remain in the provider's MkDocs site.

**Tech Stack:** React 18, TypeScript, Vite, ECharts, GitHub Pages Actions, Vitest/Jest-style existing test setup.

**Spec:** Provider design: `money-trees/docs/superpowers/specs/2026-09-28-alpha-research-boundary-design.md`; provider plan: `money-trees/docs/superpowers/plans/2026-09-28-alpha-evidence-export.md`.

## Global Constraints

- Consume only checked-in static public snapshots; never read local paths or invoke Python/research code in the browser build.
- Do not display or commit ticker-level values, portfolio weights, raw input fields, credentials, or private model parameters.
- Accept only the documented snapshot schema version; show a clear data-contract error for unsupported versions.
- Preserve existing factor, fundamental, jump, Hermite, and study routes.
- Keep Pages deployment static and compatible with the existing `BASE_PATH` behavior.
- Provider and consumer releases are merged in order: provider snapshot contract first, frontend consumer second.

## Review Focus

- Missing or unsupported `schema_version` must render a visible error state rather than a blank page; test in data loader tests.
- Empty factor evidence and null metrics must render as “暂无数据” rather than `NaN` or an exception; test in detail page tests.
- A factor with a negative RankIC must preserve sign and not be presented as a positive score; test in metric rendering tests.
- Snapshot metadata must show sample range, data version, generated time, and public limitations; test in overview page tests.
- Direct route loads under a repository-specific Pages base path must continue to work; test the existing build/route contract after adding routes.

### Task 1: Add the Alpha 810 TypeScript contract and loader

**Files:**
- Modify: `site/src/types.ts`
- Modify: `site/src/data.ts`
- Create: `site/public/data/alpha810-snapshot.json` using synthetic, non-production data
- Create or modify: `tests/test_alpha810_data_contract.py` or the repository's existing frontend test location

**Interfaces:**
- Consumes: `alpha810-snapshot.json` with `kind="moneytree_factor_evidence_snapshot"` and `schema_version=1`.
- Produces: `Alpha810Snapshot`, `Alpha810FactorEvidence`, `loadAlpha810Snapshot()`, and a validation error for missing/unsupported contract fields.

- [ ] **Step 1: Write failing loader tests** for required fields, supported schema version, null metrics, and forbidden ticker-level shapes.
- [ ] **Step 2: Run the focused frontend/data tests** and verify failure before the loader exists.
- [ ] **Step 3: Add the minimal TypeScript types and loader** with explicit runtime checks; do not use an unchecked cast as the only validation.
- [ ] **Step 4: Add a small synthetic snapshot** containing at least two factors, one null metric, dataset metadata, and aggregate group-return points.
- [ ] **Step 5: Run the focused tests and `npm run build --prefix site`**.
- [ ] **Step 6: Commit** with `feat: add Alpha 810 snapshot contract`.

### Task 2: Add the Alpha 810 overview and factor detail views

**Files:**
- Modify: `site/src/App.tsx`
- Create: `site/src/pages/Alpha810OverviewPage.tsx`
- Create: `site/src/pages/Alpha810FactorPage.tsx`
- Modify: `site/src/components/MetricCard.tsx` only if existing cards cannot represent null values
- Modify: `site/src/styles.css`
- Create or modify: `tests/test_alpha810_pages.*`

**Interfaces:**
- Consumes: `loadAlpha810Snapshot()` from Task 1.
- Produces: a route for Alpha 810 overview, a route for one factor by URL-safe ID, searchable/sortable aggregate factor list, metric cards, and group-return chart.

- [ ] **Step 1: Write failing page tests** for overview metadata, factor sorting/search, null metric display, negative metric sign, and factor detail fallback.
- [ ] **Step 2: Run the focused page tests** and verify failure before the pages exist.
- [ ] **Step 3: Implement the overview page** with dataset context, factor counts by family, coverage/status summary, and a table linking to factor details.
- [ ] **Step 4: Implement the detail page** with definition, IC/RankIC, positive-rate/coverage metrics, aggregate grouped return series, methodology caveats, and version metadata.
- [ ] **Step 5: Add navigation and route parsing** without changing existing routes or the app's base-path assumptions.
- [ ] **Step 6: Run focused tests and build**; commit with `feat: add Alpha 810 observatory views`.

### Task 3: Add documentation links and release checks

**Files:**
- Modify: `README.md`
- Modify: `site/src/pages/OverviewPage.tsx` or shared navigation component, whichever owns site-level links
- Create: `docs/alpha810-public-contract.md`
- Create or modify: `tests/test_public_research_contract.py`

**Interfaces:**
- Consumes: provider MkDocs URL and the accepted Alpha 810 snapshot schema.
- Produces: visible methodology/schema links from the site and automated checks that public data remains aggregate-only.

- [ ] **Step 1: Add failing public-release tests** for required metadata and rejection of ticker-level/portfolio fields.
- [ ] **Step 2: Implement the contract page or repository documentation** with provider URL, data freshness fields, limitations, and update procedure.
- [ ] **Step 3: Add site links** to the evidence contract and provider documentation without hardcoding a local worktree path.
- [ ] **Step 4: Run all existing Python tests, frontend tests, and `npm run build --prefix site`**.
- [ ] **Step 5: Commit** with `docs: document Alpha 810 public evidence`.

### Task 4: Verify GitHub Pages delivery

**Files:**
- Modify: `.github/workflows/deploy-pages.yml` only if the current build does not include the new static data/routes
- Modify: `README.md` with the final Alpha 810 route and docs links

**Interfaces:**
- Consumes: the Vite build output and checked-in synthetic/public snapshot.
- Produces: a Pages artifact that builds with the existing `BASE_PATH` and direct-route fallback.

- [ ] **Step 1: Run the repository's existing Pages/build audit** and capture the baseline.
- [ ] **Step 2: Make only necessary workflow changes**; do not add a workflow that accesses private hardware or secrets.
- [ ] **Step 3: Run `npm run build --prefix site` and all public contract tests**.
- [ ] **Step 4: Commit** with `ci: verify Alpha 810 Pages build`.

## Cross-repository handoff

The synthetic snapshot in this repository is a frontend fixture, not a production result. A later release process may replace it with a reviewed provider-generated snapshot through a separate PR. The provider snapshot schema and MkDocs documentation must be merged before changing the fixture to real aggregate evidence.


# Virtual Office Comparison MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the English-language Next.js MVP that compares Virtual Office providers across five Florida cities using verified structured data, three intent-specific rankings, transparent affiliate redirects, and privacy-minimal analytics.

**Architecture:** The App Router renders editorial pages and city comparisons from versioned JSON and Markdown. Pure TypeScript domain modules validate catalog data, normalize prices, build eligible offers, calculate rankings, and explain results; commercial affiliate configuration is isolated behind a separate import boundary. The initial catalog is curated manually, while n8n automation remains a separate final-phase plan after the schemas and publication workflow stabilize.

**Tech Stack:** Node.js 20.9 or newer, npm, Next.js App Router, React, TypeScript strict mode, Zod, Markdown through gray-matter/remark/remark-html, CSS Modules plus global CSS, Vitest, Testing Library, Playwright, axe-core, ESLint, Vercel Web Analytics, GitHub, and Vercel deployment.

**Spec:** `docs/superpowers/specs/2026-08-19-virtual-office-comparison-platform-design.md`

## Global Constraints

- The public MVP is English-only.
- Initial geography is Orlando, Tampa, Fort Lauderdale, Miami, and Boca Raton, Florida.
- Initial providers are Regus, Opus Virtual Offices, Alliance Virtual Offices, and Davinci Virtual.
- The three ranking tracks are `address-mail`, `receptionist-phone`, and `full-office`.
- Registered agent service remains distinct from business address.
- Feature states are exactly `included`, `paid_add_on`, `usage_based`, `not_available`, and `not_confirmed`.
- Unknown data never becomes unavailable and never earns ranking points.
- Affiliate availability, commission, conversion, and revenue are inaccessible to ranking code.
- The product captures no names, email addresses, phone numbers, accounts, leads, or checkout data.
- All public copy, disclosures, privacy language, and sensitive address-use claims require human editorial review before launch.
- No executable n8n workflow is part of this plan.
- Every task ends with tests and a focused commit.

---

## Planned File Structure

```text
.
├── content/
│   ├── catalog/
│   │   ├── providers.json
│   │   ├── locations.json
│   │   ├── plans.json
│   │   ├── evidence.json
│   │   └── assessments.json
│   ├── editorial/
│   │   ├── guides/*.md
│   │   ├── providers/*.md
│   │   └── cities/*.md
│   └── methodology/ranking-v1.json
├── config/affiliate-links.json
├── src/
│   ├── app/
│   │   ├── cities/[city]/page.tsx
│   │   ├── guides/[slug]/page.tsx
│   │   ├── providers/[slug]/page.tsx
│   │   ├── go/[providerId]/route.ts
│   │   ├── methodology/page.tsx
│   │   ├── affiliate-disclosure/page.tsx
│   │   ├── privacy/page.tsx
│   │   ├── corrections/page.tsx
│   │   ├── sitemap.ts
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── analytics/
│   │   ├── events.ts
│   │   └── track-event.ts
│   ├── commercial/
│   │   ├── affiliate-link-schema.ts
│   │   └── resolve-outbound-url.ts
│   ├── components/
│   │   ├── comparison/*.tsx
│   │   ├── content/*.tsx
│   │   ├── disclosure/*.tsx
│   │   ├── layout/*.tsx
│   │   └── ui/*.tsx
│   ├── content/
│   │   ├── load-editorial-page.ts
│   │   └── types.ts
│   └── domain/
│       ├── catalog/{load-catalog,schemas,types,validate-integrity}.ts
│       ├── pricing/{normalize-price,types}.ts
│       ├── ranking/{build-candidates,eligibility,explain,overall,rank,score-track,types}.ts
│       └── questionnaire/{resolve-track,types}.ts
├── tests/
│   ├── architecture/*.test.ts
│   ├── content/*.test.ts
│   ├── domain/*.test.ts
│   ├── integration/*.test.tsx
│   └── fixtures/catalog.ts
├── e2e/comparison.spec.ts
├── eslint.config.mjs
├── next.config.ts
├── playwright.config.ts
├── tsconfig.json
└── vitest.config.ts
```

Each domain file owns one operation. Pages compose those operations but do not recalculate prices or scores. The `src/domain` tree must not import from `src/commercial`, `config`, UI components, or analytics.

---

### Task 1: Bootstrap the repository and verification toolchain

**Files:**
- Create: `.gitignore`
- Create: `package.json` and `package-lock.json` through npm
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `eslint.config.mjs`
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Create: `playwright.config.ts`
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `src/app/globals.css`
- Test: `tests/integration/home-smoke.test.tsx`

**Interfaces:**
- Consumes: the approved spec and Node.js 20.9 or newer.
- Produces: npm scripts `dev`, `build`, `start`, `lint`, `typecheck`, `test`, and `test:e2e`; path alias `@/* -> src/*`.

- [ ] **Step 1: Initialize Git without overwriting the existing documents**

Run:

```bash
git init
git branch -M main
```

Expected: an empty `main` branch with both existing Markdown documents still present.

- [ ] **Step 2: Install runtime and test dependencies**

Run:

```bash
npm init -y
npm install next@latest react@latest react-dom@latest zod gray-matter remark remark-html @vercel/analytics
npm install --save-dev typescript @types/node @types/react @types/react-dom eslint eslint-config-next vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event @playwright/test @axe-core/playwright
npm pkg set private=true
npm pkg set scripts.dev="next dev"
npm pkg set scripts.build="next build"
npm pkg set scripts.start="next start"
npm pkg set scripts.lint="eslint ."
npm pkg set scripts.typecheck="tsc --noEmit"
npm pkg set scripts.test="vitest run"
npm pkg set scripts.test:e2e="playwright test"
```

Expected: npm pins the resolved dependency versions in `package-lock.json`.

- [ ] **Step 3: Create strict configuration files**

Create `tsconfig.json` with strict type checking, `noUncheckedIndexedAccess: true`, JSON imports, and the `@/*` alias. Configure Vitest for `jsdom`, load `vitest.setup.ts`, and include `src/**/*.test.*` plus `tests/**/*.test.*`. Configure Playwright to run against `npm run dev` on port 3000 and test Chromium plus a mobile viewport.

The essential Vitest setup is:

```ts
import '@testing-library/jest-dom/vitest'
```

Add `.next/`, `node_modules/`, `playwright-report/`, `test-results/`, `.env*`, and `.superpowers/` to `.gitignore`.

- [ ] **Step 4: Write the failing home smoke test**

```tsx
import { render, screen } from '@testing-library/react'
import HomePage from '@/app/page'

it('introduces the Florida virtual office comparison', () => {
  render(<HomePage />)
  expect(
    screen.getByRole('heading', { name: /compare virtual offices in florida/i }),
  ).toBeInTheDocument()
})
```

- [ ] **Step 5: Run the test to verify failure**

Run: `npm test -- tests/integration/home-smoke.test.tsx`

Expected: FAIL because `src/app/page.tsx` does not exist.

- [ ] **Step 6: Add the minimal App Router shell**

Create a root layout with English metadata and a home page containing the tested heading. Import `globals.css` only from the root layout. Use semantic `header`, `main`, and `footer` elements.

- [ ] **Step 7: Run the complete bootstrap checks**

Run:

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

Expected: all commands pass.

- [ ] **Step 8: Commit**

```bash
git add .gitignore package.json package-lock.json tsconfig.json next.config.ts eslint.config.mjs vitest.config.ts vitest.setup.ts playwright.config.ts src/app tests/integration docs
git commit -m "chore: bootstrap virtual office comparison app"
```

---

### Task 2: Define and validate the catalog contract

**Files:**
- Create: `src/domain/catalog/types.ts`
- Create: `src/domain/catalog/schemas.ts`
- Create: `tests/domain/catalog-schemas.test.ts`
- Create: `tests/fixtures/catalog.ts`

**Interfaces:**
- Consumes: Zod.
- Produces: `Catalog`, `Provider`, `Location`, `Plan`, `PlanFeature`, `Evidence`, `EditorialAssessment`, `FeatureKey`, `FeatureState`, `Track`, and `catalogSchema`.

- [ ] **Step 1: Write fixtures and failing schema tests**

Define `validCatalogFixture` with one Miami provider, one location, one address/mail plan, evidence, and assessment. Test that it parses, that `paid_add_on` without a price or quote marker fails, and that an unsupported feature state fails.

```ts
expect(() => catalogSchema.parse(validCatalogFixture)).not.toThrow()

const invalid = structuredClone(validCatalogFixture)
invalid.plans[0].features[0].state = 'sometimes'
expect(() => catalogSchema.parse(invalid)).toThrow()
```

- [ ] **Step 2: Run the tests to verify failure**

Run: `npm test -- tests/domain/catalog-schemas.test.ts`

Expected: FAIL because `catalogSchema` and catalog types do not exist.

- [ ] **Step 3: Define exact catalog types**

Use these unions:

```ts
export type Track = 'address-mail' | 'receptionist-phone' | 'full-office'
export type FeatureState =
  | 'included'
  | 'paid_add_on'
  | 'usage_based'
  | 'not_available'
  | 'not_confirmed'

export type FeatureKey =
  | 'business_address'
  | 'mail_receiving'
  | 'mail_forwarding'
  | 'mail_scanning'
  | 'local_mail_pickup'
  | 'live_receptionist'
  | 'business_phone_number'
  | 'call_forwarding'
  | 'appointment_scheduling'
  | 'business_email'
  | 'administrative_support'
  | 'meeting_rooms'
  | 'coworking_access'
  | 'private_office_access'
  | 'guest_reception'
  | 'registered_agent'
  | 'company_formation_assistance'
```

Money uses integer cents, currency `USD`, and billing periods `month`, `year`, `one_time`, or `usage`. A `PlanFeature` with `paid_add_on` must contain either `price` or `quoteRequired: true`. Evidence confidence is `high`, `medium`, or `low`.

- [ ] **Step 4: Implement Zod schemas and inferred compatibility checks**

Export `catalogSchema` and named entity schemas. Add refinements for the add-on rule, non-negative money, ISO timestamps, HTTPS source URLs, and at least one evidence reference per ranked factual plan.

- [ ] **Step 5: Run tests and type checking**

Run:

```bash
npm test -- tests/domain/catalog-schemas.test.ts
npm run typecheck
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/domain/catalog tests/domain/catalog-schemas.test.ts tests/fixtures/catalog.ts
git commit -m "feat: define verified catalog schema"
```

---

### Task 3: Load catalog files and enforce cross-entity integrity

**Files:**
- Create: `content/catalog/providers.json`
- Create: `content/catalog/locations.json`
- Create: `content/catalog/plans.json`
- Create: `content/catalog/evidence.json`
- Create: `content/catalog/assessments.json`
- Create: `content/methodology/ranking-v1.json`
- Create: `src/domain/catalog/load-catalog.ts`
- Create: `src/domain/catalog/validate-integrity.ts`
- Test: `tests/domain/catalog-integrity.test.ts`

**Interfaces:**
- Consumes: `catalogSchema` and entity types from Task 2.
- Produces: `loadCatalog(): Catalog` and `validateCatalogIntegrity(catalog: Catalog): string[]`.

- [ ] **Step 1: Write failing integrity tests**

Cover duplicate IDs, a location referencing an unknown provider, a plan referencing an unknown location, an assessment referencing an unknown plan, an evidence ID that does not exist, and a valid fixture returning no errors.

```ts
expect(validateCatalogIntegrity(validCatalogFixture)).toEqual([])
expect(validateCatalogIntegrity(catalogWithUnknownProvider)).toContain(
  'Location miami-example references unknown provider missing-provider',
)
```

- [ ] **Step 2: Run the tests to verify failure**

Run: `npm test -- tests/domain/catalog-integrity.test.ts`

Expected: FAIL because the integrity validator does not exist.

- [ ] **Step 3: Implement integrity validation**

Build sets for every entity ID, report all errors in deterministic sorted order, and never silently discard invalid entities. Make `loadCatalog()` parse the five JSON documents as one catalog, call the integrity validator, and throw one error containing every failure.

- [ ] **Step 4: Seed syntactically valid empty catalog arrays and ranking configuration**

Each catalog file initially contains `[]`. `ranking-v1.json` contains the exact approved percentages for the three tracks and overall rating, with `version: "1.0.0"` and `effectiveDate: "2026-08-19"`.

- [ ] **Step 5: Add a validation script**

Create `scripts/validate-content.ts` that calls `loadCatalog()` and exits non-zero on failure. Add `"validate:content": "tsx scripts/validate-content.ts"` and install `tsx` as a development dependency.

- [ ] **Step 6: Run focused and global checks**

Run:

```bash
npm test -- tests/domain/catalog-integrity.test.ts
npm run validate:content
npm run typecheck
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add content src/domain/catalog scripts package.json package-lock.json tests/domain/catalog-integrity.test.ts
git commit -m "feat: load and validate versioned catalog data"
```

---

### Task 4: Normalize plan costs without inventing estimates

**Files:**
- Create: `src/domain/pricing/types.ts`
- Create: `src/domain/pricing/normalize-price.ts`
- Test: `tests/domain/normalize-price.test.ts`

**Interfaces:**
- Consumes: `Plan` and integer-cent money values.
- Produces: `NormalizedPrice` and `normalizePlanPrice(plan: Plan): NormalizedPrice`.

- [ ] **Step 1: Write failing pricing tests**

Test monthly price, annual price converted to a monthly equivalent, mandatory setup fee, recurring mandatory fee, a temporary promotion preserved separately, and quote-required output.

```ts
expect(normalizePlanPrice(monthlyPlan)).toMatchObject({
  advertisedMonthlyCents: 9900,
  firstMonthCents: 12800,
  recurringMonthlyCents: 10900,
  isComplete: true,
})
```

Also assert that usage-based charges do not enter the fixed monthly estimate.

- [ ] **Step 2: Run tests to verify failure**

Run: `npm test -- tests/domain/normalize-price.test.ts`

Expected: FAIL because pricing normalization does not exist.

- [ ] **Step 3: Define the output type**

```ts
export interface NormalizedPrice {
  advertisedMonthlyCents: number | null
  firstMonthCents: number | null
  recurringMonthlyCents: number | null
  mandatoryUpfrontCents: number
  optionalAddOns: Array<{ feature: FeatureKey; amountCents: number | null }>
  usageBasedFeatures: FeatureKey[]
  promotion: Plan['promotion'] | null
  isComplete: boolean
  explanation: string
}
```

- [ ] **Step 4: Implement minimal deterministic arithmetic**

Use integer cents throughout. Divide annual costs by 12 only for the displayed monthly equivalent and retain the original billing period in the plan. Set fixed totals to `null` when a required amount is quote-only or usage-based.

- [ ] **Step 5: Run tests**

Run:

```bash
npm test -- tests/domain/normalize-price.test.ts
npm run typecheck
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/domain/pricing tests/domain/normalize-price.test.ts
git commit -m "feat: normalize comparable virtual office costs"
```

---

### Task 5: Resolve questionnaire intent and build eligible offer candidates

**Files:**
- Create: `src/domain/questionnaire/types.ts`
- Create: `src/domain/questionnaire/resolve-track.ts`
- Create: `src/domain/ranking/types.ts`
- Create: `src/domain/ranking/eligibility.ts`
- Create: `src/domain/ranking/build-candidates.ts`
- Test: `tests/domain/questionnaire.test.ts`
- Test: `tests/domain/eligibility.test.ts`

**Interfaces:**
- Consumes: `Catalog`, `Plan`, `Track`, and `normalizePlanPrice`.
- Produces: `resolveTrack(answers: QuestionnaireAnswers): Track`, `getPlanEligibility(plan: Plan, track: Track): Eligibility`, and `buildOfferCandidates(catalog: Catalog, citySlug: string, track: Track): OfferCandidate[]`.

- [ ] **Step 1: Write failing questionnaire tests**

Test direct track selection and the unsure path:

```ts
expect(resolveTrack({ selected: 'unsure', needsAddress: true, needsHumanAnswering: false })).toBe('address-mail')
expect(resolveTrack({ selected: 'unsure', needsAddress: false, needsHumanAnswering: true })).toBe('receptionist-phone')
expect(resolveTrack({ selected: 'unsure', needsAddress: true, needsHumanAnswering: true })).toBe('full-office')
```

If both answers are false, default to `address-mail` and return an explanation that the user can change the choice.

- [ ] **Step 2: Write failing eligibility and candidate tests**

Test the exact requirements:

- Address/mail requires included business address and mail receiving.
- Receptionist/phone requires included live receptionist plus included business phone number or call forwarding.
- Full office requires both sets in one plan or in plans from the same provider that are explicitly marked `canCombineWith` each other.
- Plans outside the city cannot form address candidates.
- A national receptionist plan may combine with a local address plan from the same provider.

- [ ] **Step 3: Run tests to verify failure**

Run: `npm test -- tests/domain/questionnaire.test.ts tests/domain/eligibility.test.ts`

Expected: FAIL because the functions do not exist.

- [ ] **Step 4: Implement questionnaire resolution and eligibility**

Return reasons alongside eligibility:

```ts
export interface Eligibility {
  eligible: boolean
  reasons: string[]
}
```

An add-on does not satisfy an included requirement unless the candidate explicitly includes that add-on and its cost can be represented.

- [ ] **Step 5: Implement candidate composition**

```ts
export interface OfferCandidate {
  providerId: string
  planIds: string[]
  locationId: string | null
  track: Track
  normalizedPrice: NormalizedPrice
  features: PlanFeature[]
  evidenceIds: string[]
}
```

Deduplicate identical plan compositions and sort candidate IDs before returning them.

- [ ] **Step 6: Run tests**

Run:

```bash
npm test -- tests/domain/questionnaire.test.ts tests/domain/eligibility.test.ts
npm run typecheck
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/domain/questionnaire src/domain/ranking tests/domain/questionnaire.test.ts tests/domain/eligibility.test.ts
git commit -m "feat: resolve user intent and eligible offers"
```

---

### Task 6: Score and rank the three intent tracks

**Files:**
- Create: `src/domain/ranking/score-track.ts`
- Create: `src/domain/ranking/rank.ts`
- Test: `tests/domain/track-ranking.test.ts`

**Interfaces:**
- Consumes: `OfferCandidate`, catalog context, preferences, and `ranking-v1.json`.
- Produces: `scoreTrackOffer(candidate, context, preferences): RankedOffer | null` and `rankOffers(catalog, citySlug, track, preferences): RankingResult`.

- [ ] **Step 1: Write failing ranking tests**

Create two candidates per track and assert:

- Exact approved weights total 100.
- Lower complete recurring cost wins the cost dimension.
- Included features score above paid add-ons.
- `not_confirmed` earns zero feature points but is not described as unavailable.
- A candidate with incomplete essential pricing returns `null` and appears in an unranked collection.
- Sorting is deterministic for equal scores.
- Preferences only adjust factors inside the selected track and never introduce commercial data.

```ts
const result = rankOffers(catalog, 'miami', 'address-mail', {
  needsMailForwarding: true,
  prefersMonthToMonth: true,
})
expect(result.ranked[0]?.providerId).toBe('provider-a')
expect(
  result.ranked[0]?.breakdown.reduce((sum, item) => sum + item.points, 0),
).toBe(result.ranked[0]?.score)
```

- [ ] **Step 2: Run tests to verify failure**

Run: `npm test -- tests/domain/track-ranking.test.ts`

Expected: FAIL because scoring is not implemented.

- [ ] **Step 3: Implement dimension scoring**

Each dimension returns points, maximum points, and a factual reason:

```ts
export interface ScoreBreakdownItem {
  dimension: string
  points: number
  maxPoints: number
  reason: string
}

export interface RankingResult {
  ranked: RankedOffer[]
  unranked: Array<{
    candidate: OfferCandidate
    reason: 'insufficient_verified_data'
  }>
}
```

Normalize competitive numeric values within the city and track. When all eligible candidates have the same numeric value, award the same full dimension score rather than dividing by zero.

- [ ] **Step 4: Implement deterministic ranking**

Sort by descending score, then descending evidence confidence, then ascending recurring price, then provider ID. Mark results within two points of the leader as `closeAlternative: true`.

- [ ] **Step 5: Run tests**

Run:

```bash
npm test -- tests/domain/track-ranking.test.ts
npm run validate:content
npm run typecheck
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/domain/ranking content/methodology tests/domain/track-ranking.test.ts
git commit -m "feat: rank offers across three user intents"
```

---

### Task 7: Add overall provider ratings and recommendation explanations

**Files:**
- Create: `src/domain/ranking/overall.ts`
- Create: `src/domain/ranking/explain.ts`
- Test: `tests/domain/overall-ranking.test.ts`
- Test: `tests/domain/explanations.test.ts`

**Interfaces:**
- Consumes: ranked track results, catalog, and versioned methodology.
- Produces: `rankOverallProviders(catalog, citySlug): OverallProviderResult[]` and `explainRecommendation(result, catalog): RecommendationExplanation`.

- [ ] **Step 1: Write failing overall-rating tests**

Assert the approved 25/20/15/15/25 weights, city-specific local presence, exclusion of providers with insufficient verified data, and no dependency on affiliate configuration.

- [ ] **Step 2: Write failing explanation tests**

```ts
expect(explainRecommendation(result, catalog)).toEqual({
  headline: 'Best verified value for address and mail',
  strengths: expect.arrayContaining(['Mail receiving is included']),
  limitation: 'Mail forwarding costs extra',
  priceSummary: '$99/month plus a $29 setup fee',
  verifiedAt: '2026-08-19T12:00:00Z',
})
```

Test that the explanation never says an unknown feature is unavailable.

- [ ] **Step 3: Run tests to verify failure**

Run: `npm test -- tests/domain/overall-ranking.test.ts tests/domain/explanations.test.ts`

Expected: FAIL because overall ranking and explanations do not exist.

- [ ] **Step 4: Implement overall rating**

Calculate value, track coverage, flexibility, local presence, and transparency from editorial inputs only. Do not reuse national review language as city-specific evidence.

- [ ] **Step 5: Implement structured explanations**

Choose strengths from the highest scoring factual dimensions and the limitation from the lowest material dimension. Return structured text fields so UI components do not reconstruct ranking logic.

- [ ] **Step 6: Run tests and commit**

```bash
npm test -- tests/domain/overall-ranking.test.ts tests/domain/explanations.test.ts
npm run typecheck
git add src/domain/ranking tests/domain/overall-ranking.test.ts tests/domain/explanations.test.ts
git commit -m "feat: explain overall and intent-specific recommendations"
```

---

### Task 8: Enforce editorial-commercial isolation and build outbound redirects

**Files:**
- Create: `config/affiliate-links.json`
- Create: `src/commercial/affiliate-link-schema.ts`
- Create: `src/commercial/resolve-outbound-url.ts`
- Create: `src/app/go/[providerId]/route.ts`
- Create: `tests/architecture/editorial-commercial-boundary.test.ts`
- Create: `tests/domain/outbound-url.test.ts`
- Modify: `eslint.config.mjs`

**Interfaces:**
- Consumes: public provider URL, provider ID, and isolated affiliate config.
- Produces: `resolveOutboundUrl(providerId: string, fallbackUrl: string): URL` and `GET /go/:providerId` returning a validated redirect.

- [ ] **Step 1: Write the failing architecture test**

Scan every `.ts` and `.tsx` file under `src/domain` and reject imports containing `/commercial/`, `affiliate-links`, `/analytics/`, or `/components/`.

```ts
expect(forbiddenImports).toEqual([])
```

- [ ] **Step 2: Write failing redirect tests**

Test active affiliate resolution, inactive fallback, missing-provider 404, only HTTPS destinations, and rejection of arbitrary redirect query parameters.

- [ ] **Step 3: Run tests to verify failure**

Run: `npm test -- tests/architecture/editorial-commercial-boundary.test.ts tests/domain/outbound-url.test.ts`

Expected: FAIL because commercial resolution does not exist.

- [ ] **Step 4: Implement affiliate schema and resolver**

Use this shape:

```ts
interface AffiliateLink {
  providerId: string
  destinationUrl: string
  trackingParameters: Record<string, string>
  active: boolean
  disclosureLabel: string
}
```

The empty initial config is `[]`. The fallback URL always comes from the validated Provider entity, never from request input.

- [ ] **Step 5: Implement the route handler**

Accept only allowlisted `city`, `track`, `plan`, `position`, and `context` query values for analytics context. Resolve the provider from the catalog, then redirect with status 302. Set `Referrer-Policy: strict-origin-when-cross-origin`.

- [ ] **Step 6: Add ESLint restricted-import rules**

Apply `no-restricted-imports` to `src/domain/**/*` for `@/commercial/*`, `@/analytics/*`, and `@/components/*`.

- [ ] **Step 7: Run tests and commit**

```bash
npm test -- tests/architecture/editorial-commercial-boundary.test.ts tests/domain/outbound-url.test.ts
npm run lint
git add config src/commercial src/app/go tests/architecture tests/domain/outbound-url.test.ts eslint.config.mjs
git commit -m "feat: isolate affiliate redirects from editorial ranking"
```

---

### Task 9: Build the accessible visual system and shared layout

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`
- Create: `src/components/layout/site-header.tsx`
- Create: `src/components/layout/site-footer.tsx`
- Create: `src/components/ui/button-link.tsx`
- Create: `src/components/ui/status-badge.tsx`
- Create: `src/components/disclosure/affiliate-disclosure.tsx`
- Test: `tests/integration/site-layout.test.tsx`

**Interfaces:**
- Consumes: Next.js `Link` and semantic HTML.
- Produces: shared header, footer, link/button, evidence status, and disclosure components.

- [ ] **Step 1: Write failing layout tests**

Assert a skip link, unique navigation label, Cities/Providers/Guides/Methodology links, visible affiliate disclosure text, and keyboard-focusable controls.

- [ ] **Step 2: Run tests to verify failure**

Run: `npm test -- tests/integration/site-layout.test.tsx`

Expected: FAIL because shared components do not exist.

- [ ] **Step 3: Implement design tokens and responsive primitives**

Define CSS custom properties for color, type scale, spacing, radius, border, shadow, content width, focus ring, success, warning, and muted text. Respect `prefers-reduced-motion`. Keep text contrast at WCAG AA levels and never use color alone for status.

- [ ] **Step 4: Implement shared components**

Use native links for navigation and external destinations. The disclosure copy is:

> We may earn a commission if you purchase through a link on this page. This never affects our rankings or recommendations.

- [ ] **Step 5: Run tests and commit**

```bash
npm test -- tests/integration/site-layout.test.tsx
npm run lint
npm run typecheck
git add src/app src/components tests/integration/site-layout.test.tsx
git commit -m "feat: add accessible site layout and trust components"
```

---

### Task 10: Implement home, Florida hub, and city comparison experience

**Files:**
- Modify: `src/app/page.tsx`
- Create: `src/app/florida/page.tsx`
- Create: `src/app/cities/[city]/page.tsx`
- Create: `src/components/comparison/need-selector.tsx`
- Create: `src/components/comparison/refinement-filters.tsx`
- Create: `src/components/comparison/ranking-tabs.tsx`
- Create: `src/components/comparison/ranking-results.tsx`
- Create: `src/components/comparison/comparison-table.tsx`
- Create: `src/components/comparison/location-list.tsx`
- Test: `tests/integration/city-page.test.tsx`

**Interfaces:**
- Consumes: `loadCatalog`, `resolveTrack`, `rankOffers`, `rankOverallProviders`, and `explainRecommendation`.
- Produces: static city routes and a client-side comparator whose serializable input is precomputed server data.

- [ ] **Step 1: Write failing city-page integration tests**

Test that Miami shows the four need choices, defaults to address/mail, changes tabs, filters results, shows included versus add-on status, displays price verification date, renders unranked offers separately, and creates `/go/` links with city/track/position context.

- [ ] **Step 2: Run tests to verify failure**

Run: `npm test -- tests/integration/city-page.test.tsx`

Expected: FAIL because the city experience does not exist.

- [ ] **Step 3: Implement server-rendered routes**

Generate static parameters from the five city slugs. Unknown slugs call `notFound()`. Server components load and rank catalog data; only the selector, filters, and tabs cross the client boundary.

- [ ] **Step 4: Implement the selector and URL state**

Use query parameters `need`, `mailForwarding`, `mailScanning`, `callVolume`, `workspace`, and `monthToMonth`. Accept only allowlisted values. Updating a preference replaces the URL without creating a user record.

- [ ] **Step 5: Implement results and table**

Every result includes provider, qualifying plan or composition, normalized cost, three strengths, one limitation, included/add-on labels, verification date, methodology link, and outbound action. Use a semantic table on desktop and labeled cards on narrow screens without hiding data.

- [ ] **Step 6: Implement home and Florida hub**

The home heading remains “Compare virtual offices in Florida.” Provide five city links, the three-product explanation, trust statement, and links to the methodology and core guide. The Florida hub summarizes city coverage without making unsupported market claims.

- [ ] **Step 7: Run tests and commit**

```bash
npm test -- tests/integration/city-page.test.tsx tests/integration/home-smoke.test.tsx
npm run typecheck
npm run lint
git add src/app src/components/comparison tests/integration
git commit -m "feat: build city-first virtual office comparator"
```

---

### Task 11: Add Markdown editorial loading and public trust pages

**Files:**
- Create: `src/content/types.ts`
- Create: `src/content/load-editorial-page.ts`
- Create: `src/components/content/article-layout.tsx`
- Create: `src/app/guides/[slug]/page.tsx`
- Create: `src/app/providers/[slug]/page.tsx`
- Create: `src/app/methodology/page.tsx`
- Create: `src/app/affiliate-disclosure/page.tsx`
- Create: `src/app/privacy/page.tsx`
- Create: `src/app/corrections/page.tsx`
- Create: `tests/content/editorial-loader.test.ts`
- Create: `tests/integration/trust-pages.test.tsx`

**Interfaces:**
- Consumes: trusted repository Markdown with validated frontmatter.
- Produces: `loadEditorialPage(kind, slug): Promise<EditorialPage>` and static guide/provider routes.

- [ ] **Step 1: Write failing loader tests**

Require frontmatter fields `title`, `description`, `slug`, `publishedAt`, `reviewedAt`, `reviewer`, and `status`. Reject duplicate slugs, invalid dates, missing descriptions, and body HTML containing script tags.

- [ ] **Step 2: Run tests to verify failure**

Run: `npm test -- tests/content/editorial-loader.test.ts`

Expected: FAIL because the loader does not exist.

- [ ] **Step 3: Implement Markdown loading**

Use `gray-matter`, `remark`, and `remark-html`. Read only from the allowlisted `content/editorial/guides`, `providers`, and `cities` directories; user input never becomes a filesystem path. Return rendered HTML and validated metadata.

- [ ] **Step 4: Write failing trust-page tests**

Assert methodology version and weights, affiliate disclosure near plain-language explanation, privacy statements matching the actual no-account flow, and a corrections contact method that does not collect information inside this app.

- [ ] **Step 5: Implement route templates and trust pages**

The corrections page links to a dedicated external contact channel configured by `NEXT_PUBLIC_CORRECTIONS_URL`; when absent, it displays a mailto link from `NEXT_PUBLIC_EDITORIAL_EMAIL`. Neither value enters domain code.

- [ ] **Step 6: Run tests and commit**

```bash
npm test -- tests/content/editorial-loader.test.ts tests/integration/trust-pages.test.tsx
npm run typecheck
npm run lint
git add src/content src/components/content src/app content/editorial tests/content tests/integration/trust-pages.test.tsx
git commit -m "feat: add editorial and transparency pages"
```

---

### Task 12: Instrument privacy-minimal funnel analytics

**Files:**
- Create: `src/analytics/events.ts`
- Create: `src/analytics/track-event.ts`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/go/[providerId]/route.ts`
- Modify: comparison components from Task 10
- Test: `tests/domain/analytics-events.test.ts`
- Test: `tests/integration/analytics-flow.test.tsx`

**Interfaces:**
- Consumes: allowlisted product context only.
- Produces: `trackProductEvent(event: ProductEvent): void` and server-side affiliate click tracking.

- [ ] **Step 1: Write failing event-contract tests**

Use an exact discriminated union for the eight approved events. Reject arbitrary keys and values longer than 255 characters. Ensure no property can be named `email`, `name`, `phone`, `userId`, `address`, or `query`.

```ts
const event: ProductEvent = {
  name: 'need_selected',
  properties: { city: 'miami', journey: 'address-mail' },
}
expect(validateProductEvent(event)).toEqual(event)
```

- [ ] **Step 2: Run tests to verify failure**

Run: `npm test -- tests/domain/analytics-events.test.ts`

Expected: FAIL because the analytics contract does not exist.

- [ ] **Step 3: Implement the analytics adapter**

Use `@vercel/analytics` with no custom identity and at most two primitive properties per event. Mount `<Analytics />` in the root layout. Client tracking calls `track(event.name, event.properties)` only after validation.

- [ ] **Step 4: Track the funnel at completed actions**

Emit events after city render, confirmed need selection, ranking render, explicit comparison expansion, location expansion, methodology navigation, guide-to-city navigation, and outbound redirect. Encode affiliate context as `{ provider, journey: "miami|address-mail|1" }` so the payload remains within two properties.

- [ ] **Step 5: Define qualified clicks**

The `/go/` route emits `affiliate_link_clicked`. A click is qualified when validated `city`, `track`, and `position` are all present; encode this in the `journey` value. Missing context still redirects but uses `journey: "unqualified"`.

- [ ] **Step 6: Run tests and commit**

```bash
npm test -- tests/domain/analytics-events.test.ts tests/integration/analytics-flow.test.tsx
npm run typecheck
npm run lint
git add src/analytics src/app src/components tests/domain/analytics-events.test.ts tests/integration/analytics-flow.test.tsx
git commit -m "feat: measure anonymous comparison funnel"
```

---

### Task 13: Curate the launch catalog and editorial content

**Files:**
- Modify: `content/catalog/providers.json`
- Modify: `content/catalog/locations.json`
- Modify: `content/catalog/plans.json`
- Modify: `content/catalog/evidence.json`
- Modify: `content/catalog/assessments.json`
- Create: `content/editorial/cities/{miami,orlando,tampa,fort-lauderdale,boca-raton}.md`
- Create: `content/editorial/providers/{regus,opus-virtual-offices,alliance-virtual-offices,davinci-virtual}.md`
- Create: eight approved files under `content/editorial/guides/`
- Test: `tests/content/launch-coverage.test.ts`

**Interfaces:**
- Consumes: current official provider pages, official terms, authoritative government sources for sensitive claims, and the schemas from Tasks 2–3.
- Produces: the complete manually reviewed launch dataset and editorial corpus.

- [ ] **Step 1: Write the failing launch-coverage test**

Require exactly five launch cities, all four provider identities, at least one evidence record for every factual plan field used in ranking, four provider reviews, five city pages, eight guides, and no published article with `status` other than `reviewed`.

- [ ] **Step 2: Run the test to verify failure**

Run: `npm test -- tests/content/launch-coverage.test.ts`

Expected: FAIL because the launch catalog and articles are not populated.

- [ ] **Step 3: Research one provider at a time**

For Regus, Opus, Alliance, and Davinci:

1. Record the current official product-definition page.
2. Record every confirmed location in the five cities.
3. Record purchasable plans, mandatory fees, billing periods, contract terms, feature states, limits, and promotions.
4. Save one evidence record per material value.
5. Use `not_confirmed` when the official material does not answer a field.
6. Do not use search-result snippets as final evidence.
7. Do not infer suitability for registration, banking, licensing, Google Business Profile, or registered agent use.

- [ ] **Step 4: Review and normalize each provider before starting the next**

Run after each provider:

```bash
npm run validate:content
npm test -- tests/domain tests/content/editorial-loader.test.ts
```

Expected: PASS. Inspect the generated city rankings and confirm that every result identifies a real plan or valid composition.

- [ ] **Step 5: Draft the five city pages**

Each page contains: verified coverage summary, a neutral local introduction, explanation of the three tracks, city-specific limitations, links to provider reviews, methodology, and related guides. Do not repeat paragraphs across cities except standardized disclosure text.

- [ ] **Step 6: Draft the four provider reviews**

Each review contains: product model, address/mail offering, phone/receptionist offering, full-office path, pricing structure, contract observations, verified strengths, verified limitations, and city links. Avoid unsupported service-quality claims.

- [ ] **Step 7: Draft the eight approved guides**

Each guide answers its title directly, distinguishes facts from context, cites authoritative sources for sensitive claims, includes a review date, and links to the relevant comparator entry point. The legal reviewer must approve business-registration and registered-agent language before `status` becomes `reviewed`.

- [ ] **Step 8: Perform editorial and factual review**

Review every changed evidence item against its source, confirm disclosures, confirm that affiliate relationships are absent from assessments, and change frontmatter to `status: reviewed` only after the named reviewer completes the check.

- [ ] **Step 9: Run launch coverage and full validation**

Run:

```bash
npm run validate:content
npm test -- tests/content tests/domain
npm run build
```

Expected: PASS with all five cities generated and no insufficient launch page.

- [ ] **Step 10: Commit provider data separately, then editorial content**

```bash
git add content/catalog
git commit -m "content: add verified Florida provider catalog"
git add content/editorial
git commit -m "content: add launch comparisons reviews and guides"
```

---

### Task 14: Add SEO metadata, accessibility checks, and end-to-end acceptance tests

**Files:**
- Create: `src/app/sitemap.ts`
- Create: `src/app/robots.ts`
- Modify: public page files to export metadata
- Create: `e2e/comparison.spec.ts`
- Create: `e2e/content.spec.ts`
- Create: `tests/integration/metadata.test.ts`

**Interfaces:**
- Consumes: the complete public route inventory and launch catalog.
- Produces: discoverable metadata, sitemap, robots rules, and executable acceptance coverage.

- [ ] **Step 1: Write failing metadata tests**

Assert unique titles/descriptions, canonical city paths, `noindex` for `/go/`, and sitemap entries for all five cities, four reviews, eight guides, and trust pages.

- [ ] **Step 2: Implement metadata, sitemap, and robots rules**

Use factual titles and descriptions. Do not put price claims in metadata. Read `NEXT_PUBLIC_SITE_URL`, validate it as HTTPS in production, and use `http://localhost:3000` only in development/test.

- [ ] **Step 3: Write the end-to-end comparison test**

The Playwright flow:

1. Open `/cities/miami`.
2. Select “Live receptionist & phone”.
3. Confirm the URL and heading reflect that track.
4. Open one result and verify included/add-on labels.
5. Confirm affiliate disclosure is visible before the outbound action.
6. Intercept `/go/` and verify city, track, plan, and position context.
7. Run axe and fail on serious or critical violations.

- [ ] **Step 4: Write the mobile and editorial flows**

On the mobile project, confirm the comparison cards retain prices, limitations, evidence dates, and actions. Navigate guide → city and provider review → city. Verify keyboard focus order on the need selector and ranking tabs.

- [ ] **Step 5: Run the full quality gate**

Run:

```bash
npx playwright install chromium
npm run validate:content
npm test
npm run typecheck
npm run lint
npm run build
npm run test:e2e
```

Expected: every command passes.

- [ ] **Step 6: Commit**

```bash
git add src/app e2e tests/integration/metadata.test.ts
git commit -m "test: verify launch SEO accessibility and user journeys"
```

---

### Task 15: Configure protected publishing and document operations

**Files:**
- Create: `.github/workflows/quality.yml`
- Create: `.github/pull_request_template.md`
- Create: `docs/operations/content-update-runbook.md`
- Create: `docs/operations/release-checklist.md`
- Create: `.env.example`
- Modify: `README.md`

**Interfaces:**
- Consumes: npm quality scripts and the GitHub/Vercel deployment model.
- Produces: required CI status, review ownership, update checklist, deployment configuration, and operational handoff.

- [ ] **Step 1: Add CI that reproduces the quality gate**

On pull requests and pushes to `main`, use Node.js 20, `npm ci`, content validation, unit tests, type checking, lint, build, and Playwright Chromium. Cache npm and Playwright browser dependencies without caching build output as a source of truth.

- [ ] **Step 2: Add the pull request template**

Require source URLs, prior/new values, affected cities, affected rankings, evidence confidence, disclosure impact, validation output, and human-review confirmation.

- [ ] **Step 3: Write the manual update runbook**

Document: create branch, update evidence first, update catalog, run validation, inspect ranking diff, preview pages, request review, merge only after approval, verify deployment, and revert by Git commit if necessary.

- [ ] **Step 4: Document environment and Vercel setup**

`.env.example` contains only:

```dotenv
NEXT_PUBLIC_SITE_URL=https://example.com
NEXT_PUBLIC_EDITORIAL_EMAIL=editor@example.com
NEXT_PUBLIC_CORRECTIONS_URL=https://example.com/corrections
```

Document that Vercel Web Analytics page views are enabled in the project and that custom funnel events require a Vercel plan supporting custom events. If that plan is unavailable, keep the typed analytics adapter disabled rather than sending data to an unreviewed provider.

- [ ] **Step 5: Configure repository rules in GitHub**

After the repository is pushed, protect `main`: require pull requests, one human approval, required `quality` checks, resolved conversations, dismissal of stale approvals, approval of the latest push by someone other than the pusher, and no bypass for automation credentials. Add a real `CODEOWNERS` file only after the repository owner or editorial-team GitHub handle is known; branch protection remains mandatory without it.

- [ ] **Step 6: Run the release checklist**

Confirm production build, five city routes, four reviews, eight guides, trust pages, disclosures, legal review, analytics configuration, redirect fallbacks, responsive layouts, and rollback procedure.

- [ ] **Step 7: Commit**

```bash
git add .github .env.example README.md docs/operations
git commit -m "docs: add protected publishing and release operations"
```

---

## Final Verification

- [ ] Run `npm run validate:content` and confirm zero schema or integrity errors.
- [ ] Run `npm test` and confirm all domain, architecture, content, and integration tests pass.
- [ ] Run `npm run typecheck` and confirm zero TypeScript errors.
- [ ] Run `npm run lint` and confirm zero lint errors.
- [ ] Run `npm run build` and confirm every launch route is generated successfully.
- [ ] Run `npm run test:e2e` and confirm desktop, mobile, navigation, disclosure, and accessibility flows pass.
- [ ] Inspect one result in each city and each track against its evidence.
- [ ] Confirm `src/domain` has no affiliate, analytics, UI, or commercial imports.
- [ ] Confirm a provider without an affiliate link still appears and redirects to its public URL.
- [ ] Confirm no page, event, URL, or log contains personal data.
- [ ] Confirm human legal/editorial review of disclosures and sensitive address-use claims.
- [ ] Confirm the deployed `main` commit matches the approved commit.

## Deferred Final Phase

After this plan is complete and the catalog contract has remained stable through manual updates, create a separate n8n implementation plan based on `docs/n8n-comparison-automation-concept.md`. That plan must automate collection, normalization, validation, and pull-request creation only; approval, merge, and publication remain human-controlled outside n8n.

## Implementation References

- [Next.js App Router](https://nextjs.org/docs/app)
- [Next.js installation and Node.js requirements](https://nextjs.org/docs/pages/getting-started/installation)
- [Vercel Web Analytics custom events](https://vercel.com/docs/analytics/custom-events)
- [Vercel Web Analytics privacy and compliance](https://vercel.com/docs/analytics/privacy-policy)
- [GitHub protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)

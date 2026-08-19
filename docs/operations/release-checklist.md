# Release checklist

Use this checklist for an approved `main` commit. Check an item only with the related evidence attached to the release or pull request.

## Current content state (August 19, 2026)

- [x] Five city routes are implemented: Orlando, Tampa, Fort Lauderdale, Miami, and Boca Raton.
- [x] Four provider reviews are reviewed and available.
- [x] Six guides are reviewed and public.
- [ ] **BLOCKING — legal review pending:** `Business Address vs. Registered Agent` remains a non-public draft; do not publish it until legal review approves its sensitive claims.
- [ ] **BLOCKING — legal review pending:** `Can You Use a Virtual Office Address for Your Business?` remains a non-public draft; do not publish it until legal review approves its sensitive claims.

The initial editorial inventory contains eight guides, but this is not an eight-guide public launch. Public launch status is six reviewed guides plus two non-public legal drafts.

## Pre-release verification

- [ ] `npm run validate:content` completed with zero schema or integrity errors.
- [ ] `npm test` completed successfully.
- [ ] `npm run typecheck` completed with zero TypeScript errors.
- [ ] `npm run lint` completed with zero lint errors.
- [ ] `npm run build` completed and generated the launch routes.
- [ ] `npm run test:e2e` completed for desktop, mobile, navigation, disclosure, and accessibility flows.
- [ ] One result in every city and comparison track was checked against its cited evidence.
- [ ] The five city routes, four reviews, six public reviewed guides, methodology, affiliate disclosure, privacy, and corrections pages were previewed.
- [ ] Affiliate disclosure appears before or with the first commercial results and beside outbound actions.
- [ ] A provider without an affiliate link remains listed and its redirect resolves to the provider's public URL.
- [ ] Responsive layouts and redirect fallbacks were checked in preview.
- [ ] No page, event, URL, or log contains personal data.

## Approval and operations

- [ ] Editorial review approved the facts, ranking impact, and release copy.
- [ ] Legal review approved disclosures, privacy language, and all sensitive address-use claims that will be public.
- [ ] The two named legal drafts above remain unpublished unless their individual legal-review blockers are resolved.
- [ ] Vercel Web Analytics page views are enabled in the project.
- [ ] Custom funnel events are enabled only on a Vercel plan that supports custom events; otherwise the typed adapter remains disabled.
- [ ] The repository owner configured `main` protection: pull requests, one human approval, required `quality`, resolved conversations, stale-approval dismissal, latest-push approval by another person, and no automation bypass.
- [ ] The deployment corresponds to the approved `main` commit.
- [ ] The rollback owner and the prior approved Git commit are recorded; a revert can be made with `git revert <commit>` and pass the same quality gate.

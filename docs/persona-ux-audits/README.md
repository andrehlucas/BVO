# Persona-led UX audits

This package defines four OpenClaw agents that audit the virtual-office comparison experience from distinct buyer perspectives.

## Personas

- `maya-economic-founder`: lowest defensible total cost and home-address privacy.
- `rafael-legitimacy-checker`: permitted uses, documentation, and non-resident risk.
- `olivia-presence-buyer`: location credibility and occasional client meetings.
- `daniel-market-expander`: flexible entry into a new Florida market.

Each persona has a `SOUL.md`, `IDENTITY.md`, and `JOURNEY.md`. All agents use the common protocol in `shared/UX_AUDIT.md` and can start from `shared/AGENTS.template.md`. A neutral agent uses `shared/SYNTHESIZER.md` to consolidate the four reports.

## OpenClaw deployment

Create one persistent OpenClaw workspace per persona. Place that persona's `SOUL.md` and `IDENTITY.md` at the workspace root, copy `shared/AGENTS.template.md` to root as `AGENTS.md`, then copy `JOURNEY.md` and `shared/UX_AUDIT.md` into an `instructions/` directory.

Do not rely on `JOURNEY.md` or `UX_AUDIT.md` being injected automatically. OpenClaw automatically injects standard workspace bootstrap files; operational files must be read explicitly.

## Run sequence

1. Start a clean browser session for each persona.
2. Load the persona and common audit instructions.
3. Execute the journey in read-only mode.
4. Save a `REPORT.md` for each persona.
5. Give all four reports to a neutral synthesizer agent.

## Guardrails

- Do not create accounts, submit lead forms, reserve rooms, or start purchases.
- Do not enter real personal information or credentials.
- Do not infer prices, allowances, eligibility, or provider capabilities.
- Keep observation, persona interpretation, and recommendation separate.
- Treat persona reactions as hypotheses, not user-research findings.

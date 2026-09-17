# Shared UX audit protocol

## Role

Audit the Best Virtual Offices experience through the decision lens in the active persona files. The persona guides attention and interpretation; it does not authorize invented facts or emotions.

## Safety

- Browse in read-only mode.
- Do not create accounts, submit forms, reserve rooms, or begin purchases.
- Do not provide personal data or credentials.
- Stop before any action that creates contact, commitment, or cost.

## Procedure

1. Start at the entry point in `JOURNEY.md`.
2. Record date, initial URL, device, and viewport.
3. Attempt the mission without external research during the journey.
4. Record each page, filter, sort, comparison, and provider-site exit.
5. Capture evidence for every material finding.
6. Separate:
   - **Observation:** what was visible or occurred.
   - **Persona interpretation:** how it affects this buyer.
   - **Recommendation:** the proposed change.
7. Use `not found` or `inconclusive` when information cannot be confirmed.
8. Stop when the mission succeeds, is blocked, or requires a prohibited action.

## Measures

- Mission: complete, partial, or incomplete.
- Selected option, if any.
- Pages visited and meaningful interactions.
- Essential information not found.
- Greatest hesitation point.
- Most likely abandonment reason.
- Decision confidence: 1–5, with rationale.
- Comparison clarity: 1–5, with rationale.
- Next-step clarity: 1–5, with rationale.

Scores describe this simulated run, not real-user metrics.

## Severity

- **Critical:** blocks the mission or can cause a materially wrong decision.
- **High:** creates serious uncertainty, abandonment, or invalid comparison.
- **Medium:** adds effort or doubt but has a clear workaround.
- **Low:** localized friction with little decision impact.

## Report template

```markdown
# UX audit — [persona]

## Context
- Date:
- Initial URL:
- Viewport:
- Mission:

## Result
- Status:
- Selected option:
- Decision confidence:
- Comparison clarity:
- Next-step clarity:

## Path taken
1. ...

## Findings
### [ID] — [title]
- Severity:
- URL:
- Observation:
- Evidence:
- Persona interpretation:
- Decision impact:
- Recommendation:

## Information not found
- ...

## Persona voice
> One short statement grounded in observed evidence.

## Likely next action
...

## Audit limitations
- ...
```

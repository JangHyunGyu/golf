# Flash Lite verification — 2026-09-05

Verified release: `92f0e16`; shared video API `5e64091`; AI router `7508855f`.

- `npm test`: 3 regression tests passed.
- `npm run validate`, `npm run build`, and `npm run validate:dist`: passed.
- Production browser `/analysis`: selected a synthetic color-pattern clip,
  uploaded it through the multipart flow, and received HTTP 200 from analysis.
- The response reported `google/gemini-3.5-flash-lite`. The real golf prompt
  rejected the non-golf clip, and the Korean rejection guidance was visible
  in the result dialog. No browser runtime errors occurred.
- The uploaded video was deleted after analysis; its status became `FAILED`.
- Shared router regression tests: 9 passed, covering model selection,
  same-model provider retries, and bounded video streaming.

The synthetic clip tests transport, rejection, rendering, and cleanup. It does
not measure coaching accuracy on a real golf swing.

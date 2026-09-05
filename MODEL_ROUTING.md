# Golf AI routing

Golf video analysis calls `https://latindance-api.yama5993.workers.dev` with
the `https://golf.archerlab.dev` origin. That shared Worker selects the `golf`
app scope and calls `openrouter-api` through its `OPENROUTER_MEDIA` binding.

All Golf AI analysis uses OpenRouter `google/gemini-3.5-flash-lite`. The
`GOLF_MEDIA_MODEL`, `GOLF_MEDIA_PROVIDER`, and `GOLF_VIDEO_PROVIDER` settings in
`harem/wrangler.openrouter.toml` control the route. Retries use Google AI Studio
or Google Vertex Global with the same model, without another model fallback.

The upload limit remains 100 MB. The router streams the temporary R2 video as
base64 for Gemini compatibility; the LatinDance Worker handles upload checks,
localized results, and temporary-file cleanup.

Run `npm run validate`, `npm test`, `npm run build`, and `npm run validate:dist`
before release. Golf Pages deploys from git; model changes deploy through the
shared OpenRouter Worker, and upload/API changes through the LatinDance Worker.

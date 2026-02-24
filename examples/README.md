# Examples

Working code snippets for [search-ai-core](../README.md). These mirror the [SearchAI Python examples](https://github.com/jpjacobpadilla/SearchAI/tree/main/examples).

Examples use top-level `await` and import from the local source (`../src`). Run them with [Bun](https://bun.sh) from the repository root after `npm install`:

```bash
bun examples/<script>.ts
```

If you use the published package, write your own scripts and `import { search, Filters } from 'search-ai-core'`.

| Example | Description |
|--------|-------------|
| [basic-search.ts](basic-search.ts) | Simple search and print result titles |
| [filters.ts](filters.ts) | Using filters (inTitle, tlds, httpsOnly, excludeSites, excludeFiletypes) |
| [regional.ts](regional.ts) | Regional targeting (e.g. `Regions.JAPAN`) |
| [json-example.ts](json-example.ts) | Get results as JSON with `extend: true` (fetch page content) |
| [markdown-example.ts](markdown-example.ts) | Get results as markdown with `extend: true` (fetch page content) |
| [async-search.ts](async-search.ts) | Use `asyncSearch` and `results.json({ extend: true })` |
| [proxy.ts](proxy.ts) | Route requests through a proxy |

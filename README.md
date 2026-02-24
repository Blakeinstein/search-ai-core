# search-ai-core

Search the web with advanced filters and LLM-friendly output formats!

TypeScript port of [SearchAI](https://github.com/jpjacobpadilla/SearchAI).

```ts
import { search } from 'search-ai-core';

const results = await search({ query: 'What is the best LLM in 2025?', count: 10 });

for (const result of results) {
  console.log(result.title);
}
```

Example output:

```
LLM Leaderboard 2025 - Verified AI Rankings
Best LLM Models 2025: Top 10 AI Models Ranked & Compared
Top 7 LLMs Ranked in 2025: GPT-4o, Gemini, Claude & More
10 Best Large Language Models (LLMs) in 2025 - Beebom
Best Large Language Models (LLMs) of 2025 - TechRadar
...
```

## Install

```bash
npm install search-ai-core
```

**Requires Node.js 18+** (uses global `fetch`).

## Examples

The [examples/](examples/) folder has runnable snippets (mirrors the [reference repo’s examples](https://github.com/jpjacobpadilla/SearchAI/tree/main/examples)). From the repo root:

```bash
npx ts-node examples/basic-search.ts
npx ts-node examples/json-example.ts
npx ts-node examples/markdown-example.ts
```

See [examples/README.md](examples/README.md) for the full list.

## Using filters

```ts
import { search, Filters } from 'search-ai-core';

const searchFilters = new Filters({
  inTitle: 'python',              // Only include results with "python" in the title
  tlds: ['.edu', '.org'],         // Restrict results to .edu and .org domains
  httpsOnly: true,                // Only include websites that support HTTPS
  excludeSites: 'quora.com',      // Exclude results from quora.com
  excludeFiletypes: 'pdf',        // Exclude PDF documents from results
});

const results = await search({ filters: searchFilters, count: 10 });

for (const result of results) {
  console.log(result.title);
}
```

Example output:

```
Welcome to Python.org
Python Tutorial - W3Schools
Python (programming language) - Wikipedia
Learn Python - Free Interactive Python Tutorial
CS50's Introduction to Programming with Python | Harvard University
Real Python: Python Tutorials
Python for Everybody Specialization - Coursera
scikit-learn: machine learning in Python — scikit-learn 1.6.1 ...
Table Of Contents - Learn Python the Hard Way
Python Institute - PROGRAM YOUR FUTURE
```

## Regional targeting

```ts
import { search, Filters, Regions } from 'search-ai-core';

const searchFilters = new Filters({ region: Regions.JAPAN });

const results = await search({ query: 'Python', filters: searchFilters });

for (const result of results) {
  console.log(result.title);
}
```

Example output:

```
Welcome to Python.org
python.jp: プログラミング言語 Python 総合情報サイト
【入門】Pythonとは｜活用事例やメリット、できること、学習方法 ...
ゼロからのPython入門講座 - python.jp
Pythonの開発環境を用意しよう！（Windows） - Progate
Python - Wikipedia
...
```

## Markdown & JSON formats

Once you have results, you can get them as Markdown or JSON for further processing.

If `extend` is set to `true`, the content of each result’s page is fetched and included in the output. This port uses `fetch` to load and extract content (no Playwright). It also extracts metadata when possible (e.g. author, twitter handle).

**Markdown:**

```ts
const results = await search({ query: 'TypeScript', count: 5 });

await results.markdown({
  extend: false,           // Set to true to fetch and include page content
  contentLength: 1000,      // Limit the length of extracted content
  ignoreLinks: false,      // Exclude hyperlinks in the content
  ignoreImages: true,      // Exclude images from the content
  onlyPageContent: false,  // If true, omits metadata from the output
});
```

**JSON:**

```ts
await results.json({
  extend: false,           // Set to true to fetch and include page content
  contentLength: 1000,      // Limit the length of extracted content
  ignoreLinks: false,      // Exclude hyperlinks in the content
  ignoreImages: true,      // Exclude images from the content
});
```

## Using proxies

Create a `Proxy` instance and pass it to `search` or `asyncSearch`:

```ts
import { Proxy, search } from 'search-ai-core';

const proxy = new Proxy({
  protocol: 'http',         // or 'https', 'socks4', 'socks5'
  host: '[host]',
  port: 9999,
  username: 'optional username',
  password: 'optional password',
});

const results = await search({ query: 'query', proxy });
```

## Async support

Use `asyncSearch` for the async API. It returns `SearchResults` (same as `search`); `markdown()` and `json()` are async on the results.

```ts
import { asyncSearch } from 'search-ai-core';

const results = await asyncSearch({
  query: 'Node.js',
  filters: new Filters({ inTitle: 'guide' }),
  count: 10,
});

await results.json({ extend: true });
```

## All filters

You can narrow searches with a `Filters` object:

```ts
new Filters({
  sites: 'example.com',
  tlds: ['.edu', '.gov'],
  filetype: 'pdf',
  excludeSites: ['facebook.com', 'twitter.com'],
  inTitle: 'python',
  notInUrl: ['login', 'signup'],
});
```

| Filter | Description | Example (one) | Example (many) |
| ------ | ----------- | ------------- | -------------- |
| `region` | Only show results from specific regions | `Regions.US_ENGLISH` | |
| `timeSpan` | Timespan for the search | `Timespans.PAST_WEEK` | |
| `sites` | Only show results from specific domains | `'example.com'` | `['example.com', 'another.com']` |
| `tlds` | Only show results from specific TLDs (e.g. `.gov`, `.edu`) | `'.edu'` | `['.edu', '.gov']` |
| `filetype` | Only show documents of a specific file type (one only) | `'pdf'` | |
| `httpsOnly` | Only show websites that support HTTPS | `true` | |
| `excludeSites` | Exclude results from specific domains | `'facebook.com'` | `['facebook.com', 'twitter.com']` |
| `excludeTlds` | Exclude results from specific TLDs | `'.xyz'` | `['.xyz', '.ru']` |
| `excludeFiletypes` | Exclude documents with specific file types | `'doc'` | `['doc', 'xls']` |
| `excludeHttps` | Exclude HTTPS pages | `true` | |
| `anyKeywords` | Require at least one word anywhere in the page | `'python'` | `['python', 'django']` |
| `allKeywords` | Require all of these words somewhere in the page | `'ai'` | `['ai', 'ml', 'nlp']` |
| `exactPhrases` | Include results with exact phrases | `'machine learning'` | `['deep learning', 'language model']` |
| `excludeAllKeywords` | Exclude pages containing certain words | `'ads'` | `['ads', 'tracking']` |
| `excludeExactPhrases` | Exclude results with exact phrases | `'click here'` | `['click here', 'buy now']` |
| `inTitle` | Require specific words in the title | `'resume'` | `['resume', 'portfolio']` |
| `inUrl` | Require specific words in the URL | `'blog'` | `['blog', 'tutorial']` |
| `inText` | Require specific words in the page text | `'case study'` | `['case study', 'example']` |
| `notInTitle` | Exclude pages with specific words in the title | `'login'` | `['login', 'signup']` |
| `notInUrl` | Exclude pages with specific words in the URL | `'register'` | `['register', 'checkout']` |
| `notInText` | Exclude pages with specific words in the page text | `'error'` | `['error', '404']` |

## Search configuration options

`search` and `asyncSearch` accept an options object with:

| Parameter | Type | Description | Default |
| --------- | ---- | ----------- | ------- |
| `query` | `string` | The search query. | `''` |
| `filters` | `Filters \| null` | Optional filters to narrow results. | `null` |
| `count` | `number` | Number of results to return. | `10` |
| `offset` | `number` | Number of results to skip at the start. | `0` |
| `proxy` | `Proxy \| null` | Optional proxy for requests. | `null` |

## License

MIT

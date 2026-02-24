/**
 * Async search: use asyncSearch and get JSON with extended content.
 * Mirrors the reference repo's async support example.
 *
 * Run from repo root: npx ts-node examples/async-search.ts
 */

import { asyncSearch, Filters } from '../src';

const results = await asyncSearch({
  query: 'Node.js',
  filters: new Filters({ inTitle: 'guide' }),
  count: 5,
});

const data = await results.json({ extend: true, contentLength: 500 });

console.log(JSON.stringify(data, null, 2));

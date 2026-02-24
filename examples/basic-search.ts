/**
 * Basic search: query and print result titles.
 * Run from repo root: npx ts-node examples/basic-search.ts
 */

import { search } from '../src';

const results = await search({
  query: 'What is the best LLM in 2025?',
  count: 10,
});

for (const result of results) {
  console.log(result.title);
}

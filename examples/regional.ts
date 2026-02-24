/**
 * Regional targeting: limit results to a region (e.g. Japan).
 * Run from repo root: npx ts-node examples/regional.ts
 */

import { search, Filters, Regions } from '../src';

const searchFilters = new Filters({ region: Regions.JAPAN });

const results = await search({
  query: 'Python',
  filters: searchFilters,
  count: 10,
});

for (const result of results) {
  console.log(result.title);
}

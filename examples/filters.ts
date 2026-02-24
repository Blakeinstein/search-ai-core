/**
 * Using filters: restrict to sites, TLDs, HTTPS, exclude sites/file types.
 * Run from repo root: npx ts-node examples/filters.ts
 */

import { search, Filters } from '../src';

const searchFilters = new Filters({
  inTitle: 'python',
  tlds: ['.edu', '.org'],
  httpsOnly: true,
  excludeSites: 'quora.com',
  excludeFiletypes: 'pdf',
});

const results = await search({
  filters: searchFilters,
  count: 10,
});

for (const result of results) {
  console.log(result.title);
}

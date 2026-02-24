/**
 * Get results as JSON with optional page content (extend=true).
 * Mirrors the reference repo examples/json_example.py (which uses site:jacobpadilla.com).
 * This version uses a plain query so it returns results out of the box.
 *
 * Run from repo root: bun examples/json-example.ts
 */

import { search } from '../src';

const results = await search({
  query: 'Python',
  count: 3,
});

const data = await results.json({
  extend: true,
  contentLength: 500,
});

console.log(JSON.stringify(data, null, 2));

/*
Example output (structure):

[
  {
    "title": "The Inner Workings of Python Dataclasses Explained",
    "link": "https://jacobpadilla.com/articles/python-dataclass-internals",
    "description": "Discover how Python dataclasses work internally! ...",
    "author": "Jacob Padilla",
    "twitter": "@jpjacobpadilla",
    "page_preview": "[Jacob Padilla](/)\n\n * [Github](...)\n ..."
  },
  ...
]
*/

/**
 * Get results as a single markdown string with optional page content (extend=true).
 * Mirrors the reference repo examples/markdown_example.py (which uses site:jacobpadilla.com).
 * This version uses a plain query so it returns results even when that site filter does not.
 *
 * Run from repo root: bun examples/markdown-example.ts
 */

import { search } from '../src';

const results = await search({
  query: 'Python',
  count: 3,
});

const markdown = await results.markdown({
  extend: true,
  contentLength: 1500,
});

console.log(markdown);

/*
Example output (structure):

# Search Results

**Title:** The Inner Workings of Python Dataclasses Explained
**Link:** https://jacobpadilla.com/articles/python-dataclass-internals
**Description:** Discover how Python dataclasses work internally! ...
**Author:** Jacob Padilla
**Twitter:** @jpjacobpadilla

## Page Preview:

[Jacob Padilla](/)
 * [Github](...)
 ...

----------
**Title:** A Deep Dive Into Python's functools.wraps Decorator
...
*/

/**
 * Search the web with advanced filters and LLM-friendly output formats.
 * Port of SearchAI (Python) to TypeScript.
 * @see https://github.com/jpjacobpadilla/SearchAI
 */

import { search, asyncSearch } from './searcher';
import { Filters, Regions, Timespans } from './filters';
import { Proxy } from './proxy';
import { SearchResult, SearchResults } from './search-result';

export { search, asyncSearch };
export { Filters, Regions, Timespans };
export { Proxy };
export { SearchResult, SearchResults };

export type { SearchOptions } from './searcher';
export type { ProxyOptions, FiltersOptions, ExtendOptions, ParsedResult } from './types';

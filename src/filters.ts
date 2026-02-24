import type { FiltersOptions } from './types';
import { Regions, Timespans } from './types';

function toList(val: string | string[] | null | undefined): string[] {
  if (val == null) return [];
  return typeof val === 'string' ? val.split(/\s+/) : val;
}

function groupIncludes(values: string[], op?: string): string {
  if (values.length === 0) return '';
  if (values.length === 1) return op ? `${op}:${values[0]}` : `"${values[0]}"`;
  if (op) return values.map((v) => `${op}:${v}`).join(' ');
  return values.map((v) => `"${v}"`).join(' ');
}

function groupExcludes(op: string, values: string[]): string[] {
  return values.map((v) => `-${op}:${v}`);
}

/**
 * Search filters. Options are compiled into DuckDuckGo query operators
 * (site:, filetype:, intitle:, etc.) and appended to the query.
 */
export class Filters implements FiltersOptions {
  region?: Regions;
  timeSpan?: Timespans;
  tlds?: string | string[];
  sites?: string | string[];
  filetype?: string;
  httpsOnly?: boolean;
  excludeTlds?: string | string[];
  excludeSites?: string | string[];
  excludeFiletypes?: string | string[];
  excludeHttps?: boolean;
  anyKeywords?: string | string[];
  allKeywords?: string | string[];
  exactPhrases?: string | string[];
  excludeAllKeywords?: string | string[];
  excludeExactPhrases?: string | string[];
  inTitle?: string | string[];
  inUrl?: string | string[];
  inText?: string | string[];
  notInTitle?: string | string[];
  notInUrl?: string | string[];
  notInText?: string | string[];

  constructor(options: FiltersOptions = {}) {
    Object.assign(this, options);
  }

  /**
   * Compile filter options into a single query string to append to the search query.
   */
  compileFilters(): string {
    const parts: string[] = [];

    parts.push(groupIncludes(toList(this.sites), 'site'));
    parts.push(groupIncludes(toList(this.tlds), 'site'));
    parts.push(groupIncludes(toList(this.filetype ? [this.filetype] : []), 'filetype'));
    parts.push(groupIncludes(toList(this.anyKeywords)));
    toList(this.allKeywords).forEach((w) => parts.push(`"${w}"`));

    const exactPhrases = this.exactPhrases
      ? Array.isArray(this.exactPhrases)
        ? this.exactPhrases
        : [this.exactPhrases]
      : [];
    exactPhrases.forEach((phrase) => parts.push(`"${phrase}"`));

    if (this.httpsOnly) parts.push('inurl:https');

    toList(this.inTitle).forEach((w) => parts.push(`intitle:${w}`));
    toList(this.inUrl).forEach((w) => parts.push(`inurl:${w}`));
    toList(this.inText).forEach((w) => parts.push(`intext:${w}`));

    // Negative filters
    const excludeExactPhrases = this.excludeExactPhrases
      ? Array.isArray(this.excludeExactPhrases)
        ? this.excludeExactPhrases
        : [this.excludeExactPhrases]
      : [];
    excludeExactPhrases.forEach((phrase) => parts.push(`-"${phrase}"`));

    parts.push(...groupExcludes('site', toList(this.excludeSites)));
    parts.push(...groupExcludes('site', toList(this.excludeTlds)));

    if (this.excludeHttps) parts.push('-inurl:https');

    const excludeFiletypes = this.excludeFiletypes
      ? Array.isArray(this.excludeFiletypes)
        ? this.excludeFiletypes
        : [this.excludeFiletypes]
      : [];
    parts.push(...groupExcludes('filetype', excludeFiletypes));
    toList(this.excludeAllKeywords).forEach((w) => parts.push(`-${w}`));

    toList(this.notInUrl).forEach((w) => parts.push(`-inurl:${w}`));
    toList(this.notInTitle).forEach((w) => parts.push(`-intitle:${w}`));
    toList(this.notInText).forEach((w) => parts.push(`-intext:${w}`));

    return parts.filter(Boolean).join(' ');
  }
}

export { Regions, Timespans };

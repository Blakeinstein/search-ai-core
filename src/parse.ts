import { parse } from 'node-html-parser';
import type { ParsedResult } from './types';

/**
 * Extract the real URL from a DuckDuckGo redirect link.
 * Links come in the form: //duckduckgo.com/l/?uddg=ENCODED_URL&rut=...
 */
function extractUrl(href: string): string | null {
  try {
    const normalized = href.startsWith('//') ? `https:${href}` : href;
    const url = new URL(normalized);
    const uddg = url.searchParams.get('uddg');
    if (uddg) return uddg;
  } catch {
    // not a redirect link, use as-is
  }
  if (href.startsWith('http')) return href;
  return null;
}

/**
 * Parse DuckDuckGo HTML search response into an array of { title, link, description }.
 */
export function parseSearch(html: string): ParsedResult[] {
  const root = parse(html);
  const results: ParsedResult[] = [];
  const resultDivs = root.querySelectorAll('.result');

  for (const div of resultDivs) {
    if (div.classList?.contains('result--ad')) continue;

    const linkEl = div.querySelector('a.result__a');
    if (!linkEl) continue;

    const rawHref = linkEl.getAttribute('href');
    if (!rawHref) continue;

    const link = extractUrl(rawHref);
    if (!link) continue;

    const title = (linkEl.textContent || linkEl.text || '').trim();
    const snippetEl = div.querySelector('.result__snippet');
    const description = (snippetEl?.textContent || snippetEl?.text || '').trim();

    if (title) {
      results.push({ title, link, description: description || '' });
    }
  }

  return results;
}

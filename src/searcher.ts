import * as https from 'https';
import type { Filters } from './filters';
import type { Proxy } from './proxy';
import { parseSearch } from './parse';
import { SearchResult, SearchResults } from './search-result';

const SLEEP_MS = 250;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

const TLS_CIPHERS = [
  'TLS_AES_128_GCM_SHA256',
  'TLS_AES_256_GCM_SHA384',
  'TLS_CHACHA20_POLY1305_SHA256',
  'ECDHE-ECDSA-AES128-GCM-SHA256',
  'ECDHE-RSA-AES128-GCM-SHA256',
  'ECDHE-ECDSA-AES256-GCM-SHA384',
  'ECDHE-RSA-AES256-GCM-SHA384',
  'ECDHE-ECDSA-CHACHA20-POLY1305',
  'ECDHE-RSA-CHACHA20-POLY1305',
].join(':');

const HEADERS: Record<string, string> = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:128.0) Gecko/20100101 Firefox/128.0',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
  'Accept-Encoding': 'identity',
  Connection: 'keep-alive',
  'Upgrade-Insecure-Requests': '1',
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomSleep(): Promise<void> {
  const jitter = SLEEP_MS * 0.2;
  const ms = SLEEP_MS + (Math.random() * 2 - 1) * jitter;
  return sleep(ms);
}

export interface SearchOptions {
  query?: string;
  filters?: Filters | null;
  count?: number;
  offset?: number;
  proxy?: Proxy | null;
}

function buildQueryString(
  compiledQuery: string,
  filters: Filters | null,
  offset: number
): string {
  const params = new URLSearchParams();
  params.set('q', compiledQuery);
  if (offset > 0) {
    params.set('s', String(offset - 1));
    params.set('dc', String(offset));
  }
  if (filters) {
    if (filters.timeSpan) params.set('df', filters.timeSpan);
    if (filters.region) params.set('kl', filters.region);
  }
  return params.toString();
}

function httpsGet(queryString: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const options: https.RequestOptions = {
      hostname: 'html.duckduckgo.com',
      port: 443,
      path: `/html/?${queryString}`,
      method: 'GET',
      headers: HEADERS,
      ciphers: TLS_CIPHERS,
      ecdhCurve: 'X25519:prime256v1:secp384r1',
      minVersion: 'TLSv1.2',
      maxVersion: 'TLSv1.3',
    } as https.RequestOptions;

    const req = https.request(options, (res) => {
      const chunks: Buffer[] = [];
      res.on('data', (chunk: Buffer) => chunks.push(chunk));
      res.on('end', () => {
        const status = res.statusCode ?? 0;
        const body = Buffer.concat(chunks).toString('utf-8');
        if (status >= 200 && status < 300) {
          resolve(body);
        } else {
          reject(new Error(`HTTP ${status}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function doRequest(
  compiledQuery: string,
  filters: Filters | null,
  offset: number,
  _proxy: Proxy | null
): Promise<string> {
  const qs = buildQueryString(compiledQuery, filters, offset);
  let lastError: Error | null = null;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      return await httpsGet(qs);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < MAX_RETRIES - 1) {
        const backoff = RETRY_DELAY_MS * Math.pow(2, attempt);
        await sleep(backoff);
      }
    }
  }
  throw lastError ?? new Error('Request failed');
}

/**
 * Perform a web search (async). Returns a list of search results.
 */
export async function search(options: SearchOptions = {}): Promise<SearchResults> {
  return asyncSearch(options);
}

/**
 * Perform a web search asynchronously.
 */
export async function asyncSearch(options: SearchOptions = {}): Promise<SearchResults> {
  const { query = '', filters = null, count = 10, offset = 0, proxy = null } = options;
  const compiledFilters = filters ? filters.compileFilters() : '';
  const compiledQuery = compiledFilters ? `${query} ${compiledFilters}`.trim() : query;

  const results: SearchResult[] = [];
  let currentOffset = offset;

  while (results.length < count) {
    const html = await doRequest(compiledQuery, filters, currentOffset, proxy);
    const parsed = parseSearch(html);

    if (parsed.length === 0) break;

    for (const p of parsed) {
      results.push(new SearchResult(p.title, p.link, p.description, proxy));
      if (results.length >= count) break;
    }

    currentOffset += parsed.length;
    await randomSleep();
  }

  return new SearchResults(results, proxy);
}

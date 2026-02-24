import * as https from 'https';
import * as zlib from 'zlib';
import { convert } from 'html-to-text';
import { parse } from 'node-html-parser';
import type { Proxy } from './proxy';
import type { ExtendOptions } from './types';
import { validContentType } from './utils';

const DEFAULT_CONTENT_LENGTH = 1000;

function extractMetadata(html: string): Record<string, string> {
  const out: Record<string, string> = {};
  try {
    const root = parse(html);
    const titleEl = root.querySelector('head title');
    if (titleEl) {
      const title = (titleEl.textContent || titleEl.text || '').trim();
      if (title) out.title = title;
    }
    const descEl = root.querySelector('head meta[name="description"]');
    const desc = descEl?.getAttribute('content');
    if (desc && !/<[^>]+>/.test(desc)) out.description = desc;
    const authorEl = root.querySelector('head meta[name="author"]');
    const author = authorEl?.getAttribute('content');
    if (author) out.author = author;
    const twitterEl = root.querySelector('head meta[name="twitter:site"]');
    const twitter = twitterEl?.getAttribute('content');
    if (twitter) out.twitter = twitter;
  } catch {
    // ignore
  }
  return out;
}

function htmlToMarkdown(html: string, ignoreLinks: boolean, ignoreImages: boolean): string {
  const selectors: Array<{ selector: string; format: string; options?: Record<string, unknown> }> = [
    { selector: 'a', format: 'anchor', options: { ignoreHref: ignoreLinks, linkBrackets: !ignoreLinks } },
  ];
  if (ignoreImages) selectors.push({ selector: 'img', format: 'skip' });
  return convert(html, {
    wordwrap: 0,
    selectors,
  } as Parameters<typeof convert>[1]).trim();
}

function fetchPage(url: string, _proxy: Proxy | null): Promise<string> {
  return new Promise((resolve) => {
    try {
      const parsed = new URL(url);
      const options: https.RequestOptions = {
        hostname: parsed.hostname,
        port: parsed.port || 443,
        path: parsed.pathname + parsed.search,
        method: 'GET',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:128.0) Gecko/20100101 Firefox/128.0',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Encoding': 'identity',
        },
        timeout: 8000,
      };
      const req = https.request(options, (res) => {
        const ct = res.headers['content-type'] ?? '';
        if (!/text\/html|text\/plain|application\/xhtml\+xml/i.test(ct)) {
          res.resume();
          return resolve('');
        }
        const encoding = (res.headers['content-encoding'] ?? '').toLowerCase();
        let stream: NodeJS.ReadableStream = res;
        if (encoding === 'gzip') {
          stream = res.pipe(zlib.createGunzip());
        } else if (encoding === 'deflate') {
          stream = res.pipe(zlib.createInflate());
        } else if (encoding === 'br') {
          stream = res.pipe(zlib.createBrotliDecompress());
        }
        const chunks: Buffer[] = [];
        stream.on('data', (chunk: Buffer) => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
        stream.on('error', () => resolve(''));
      });
      req.on('error', () => resolve(''));
      req.on('timeout', () => { req.destroy(); resolve(''); });
      req.end();
    } catch {
      resolve('');
    }
  });
}

export class SearchResult {
  readonly title: string;
  readonly link: string;
  readonly description: string;
  readonly _proxy: Proxy | null;

  constructor(
    title: string,
    link: string,
    description: string,
    _proxy: Proxy | null = null
  ) {
    this.title = title;
    this.link = link;
    this.description = description;
    this._proxy = _proxy;
  }

  /** @internal */
  basicMarkdown(): string {
    const parts = [`**Title:** ${this.title}`, `**Link:** ${this.link}`];
    if (this.description) parts.push(`**Description:** ${this.description}`);
    return parts.join('\n');
  }

  /** @internal */
  extendedMarkdown(
    pageSource: string,
    contentLength: number,
    opts: { onlyPageContent?: boolean; ignoreLinks?: boolean; ignoreImages?: boolean }
  ): string {
    const md = htmlToMarkdown(
      pageSource,
      opts.ignoreLinks ?? false,
      opts.ignoreImages ?? true
    ).slice(0, contentLength);
    const meta = extractMetadata(pageSource);
    if (opts.onlyPageContent) return md;
    const parts = [
      `**Title:** ${meta.title ?? this.title}`,
      `**Link:** ${this.link}`,
    ];
    if (meta.description) parts.push(`**Description:** ${meta.description}`);
    else if (this.description) parts.push(`**Description:** ${this.description}`);
    if (meta.author) parts.push(`**Author:** ${meta.author}`);
    if (meta.twitter) parts.push(`**Twitter:** ${meta.twitter}`);
    if (md) {
      parts.push('');
      parts.push('## Page Preview:\n');
      parts.push(md);
    }
    return parts.join('\n');
  }

  /** @internal */
  extendedJson(
    pageSource: string,
    contentLength: number,
    opts: { ignoreLinks?: boolean; ignoreImages?: boolean }
  ): Record<string, unknown> {
    const meta = extractMetadata(pageSource);
    const md = htmlToMarkdown(
      pageSource,
      opts.ignoreLinks ?? false,
      opts.ignoreImages ?? true
    ).slice(0, contentLength);
    const out: Record<string, unknown> = {
      title: meta.title ?? this.title,
      link: this.link,
    };
    if (meta.description) out.description = meta.description;
    else if (this.description) out.description = this.description;
    if (meta.author) out.author = meta.author;
    if (meta.twitter) out.twitter = meta.twitter;
    if (md) out.page_preview = md;
    return out;
  }

  /**
   * Get this result as a markdown string. If extend is true, fetches the page and includes content.
   */
  async markdown(opts: ExtendOptions & { extend?: boolean } = {}): Promise<string> {
    const extend = opts.extend ?? false;
    const contentLength = opts.contentLength ?? DEFAULT_CONTENT_LENGTH;
    if (!extend || !validContentType(this.link)) return this.basicMarkdown();
    const pageSource = await fetchPage(this.link, this._proxy);
    if (!pageSource) return this.basicMarkdown();
    return this.extendedMarkdown(pageSource, contentLength, {
      onlyPageContent: opts.onlyPageContent,
      ignoreLinks: opts.ignoreLinks,
      ignoreImages: opts.ignoreImages,
    });
  }

  /**
   * Get this result as a plain object. If extend is true, fetches the page and includes page_preview etc.
   */
  async json(opts: ExtendOptions & { extend?: boolean } = {}): Promise<Record<string, unknown>> {
    const extend = opts.extend ?? false;
    const contentLength = opts.contentLength ?? DEFAULT_CONTENT_LENGTH;
    if (!extend || !validContentType(this.link)) {
      return { title: this.title, link: this.link, description: this.description };
    }
    const pageSource = await fetchPage(this.link, this._proxy);
    if (!pageSource) {
      return { title: this.title, link: this.link, description: this.description };
    }
    return this.extendedJson(pageSource, contentLength, {
      ignoreLinks: opts.ignoreLinks,
      ignoreImages: opts.ignoreImages,
    });
  }
}

export class SearchResults extends Array<SearchResult> {
  readonly _proxy: Proxy | null;

  constructor(results: SearchResult[] = [], _proxy: Proxy | null = null) {
    super();
    for (const r of results) this.push(r);
    this._proxy = _proxy;
  }

  /**
   * Return all results as a single markdown string. If extend is true, fetches each page.
   */
  async markdown(opts: ExtendOptions & { extend?: boolean } = {}): Promise<string> {
    const extend = opts.extend ?? false;
    const contentLength = opts.contentLength ?? DEFAULT_CONTENT_LENGTH;
    if (this.length === 0) return '';
    const items = Array.from(this);
    if (!extend) {
      const parts = items.map((r) => r.basicMarkdown());
      return '# Search Results\n\n' + parts.join('\n----------\n');
    }
    const parts = await Promise.all(
      items.map(async (r) => {
        if (!validContentType(r.link)) return r.basicMarkdown();
        const pageSource = await fetchPage(r.link, this._proxy);
        if (!pageSource) return r.basicMarkdown();
        return r.extendedMarkdown(pageSource, contentLength, {
          onlyPageContent: opts.onlyPageContent,
          ignoreLinks: opts.ignoreLinks,
          ignoreImages: opts.ignoreImages,
        });
      })
    );
    return '# Search Results\n\n' + parts.join('\n----------\n');
  }

  /**
   * Return all results as an array of objects. If extend is true, fetches each page.
   */
  async json(opts: ExtendOptions & { extend?: boolean } = {}): Promise<Record<string, unknown>[]> {
    const extend = opts.extend ?? false;
    const contentLength = opts.contentLength ?? DEFAULT_CONTENT_LENGTH;
    const items = Array.from(this);
    if (!extend) {
      return items.map((r) => ({
        title: r.title,
        link: r.link,
        description: r.description,
      }));
    }
    return Promise.all(
      items.map(async (r) => {
        if (!validContentType(r.link))
          return { title: r.title, link: r.link, description: r.description };
        const pageSource = await fetchPage(r.link, this._proxy);
        if (!pageSource) return { title: r.title, link: r.link, description: r.description };
        return r.extendedJson(pageSource, contentLength, {
          ignoreLinks: opts.ignoreLinks,
          ignoreImages: opts.ignoreImages,
        });
      })
    );
  }
}

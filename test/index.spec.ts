import { search, Filters, Regions, Timespans, Proxy, SearchResults } from '../src';

describe('search-ai-core', () => {
  describe('search', () => {
    it('returns SearchResults for a query', async () => {
      const results = await search({ query: 'TypeScript', count: 3 });
      expect(results).toBeInstanceOf(SearchResults);
      expect(results.length).toBeLessThanOrEqual(3);
      if (results.length > 0) {
        const first = results[0];
        expect(first.title).toBeDefined();
        expect(first.link).toBeDefined();
        expect(typeof first.link).toBe('string');
        expect(first.description).toBeDefined();
      }
    });

    it('respects count option', async () => {
      const results = await search({ query: 'jest', count: 5 });
      expect(results.length).toBeLessThanOrEqual(5);
    });
  });

  describe('Filters', () => {
    it('compiles empty filters to empty string', () => {
      const f = new Filters();
      expect(f.compileFilters()).toBe('');
    });

    it('compiles inTitle to intitle: operator', () => {
      const f = new Filters({ inTitle: 'python' });
      expect(f.compileFilters()).toContain('intitle:python');
    });

    it('compiles region and timeSpan (stored for request params)', () => {
      const f = new Filters({ region: Regions.JAPAN, timeSpan: Timespans.PAST_WEEK });
      expect(f.region).toBe(Regions.JAPAN);
      expect(f.timeSpan).toBe(Timespans.PAST_WEEK);
    });

    it('compiles multiple filters', () => {
      const f = new Filters({
        sites: 'example.com',
        inTitle: 'test',
        httpsOnly: true,
      });
      const str = f.compileFilters();
      expect(str).toContain('site:example.com');
      expect(str).toContain('intitle:test');
      expect(str).toContain('inurl:https');
    });
  });

  describe('SearchResults', () => {
    it('markdown() returns string without extend', async () => {
      const results = await search({ query: 'node', count: 2 });
      const md = await results.markdown();
      if (results.length > 0) {
        expect(md).toContain('# Search Results');
        expect(md).toContain('**Title:**');
        expect(md).toContain('**Link:**');
      } else {
        expect(md).toBe('');
      }
    });

    it('json() returns array of objects without extend', async () => {
      const results = await search({ query: 'npm', count: 2 });
      const arr = await results.json();
      expect(Array.isArray(arr)).toBe(true);
      expect(arr.length).toBe(results.length);
      if (arr.length > 0) {
        expect(arr[0]).toHaveProperty('title');
        expect(arr[0]).toHaveProperty('link');
        expect(arr[0]).toHaveProperty('description');
      }
    });
  });

  describe('Proxy', () => {
    it('toUrl() includes auth when username and password set', () => {
      const p = new Proxy({
        protocol: 'http',
        host: 'proxy.example.com',
        port: 8080,
        username: 'user',
        password: 'pass',
      });
      const url = p.toUrl();
      expect(url).toMatch(/^http:\/\//);
      expect(url).toContain('proxy.example.com:8080');
      expect(url).toContain('user');
      expect(url).toContain('pass');
    });

    it('toUrl() omits auth when not set', () => {
      const p = new Proxy({
        protocol: 'https',
        host: 'host',
        port: 3128,
      });
      expect(p.toUrl()).toBe('https://host:3128');
    });
  });
});

/**
 * Using a proxy for search requests.
 * Run from repo root: npx ts-node examples/proxy.ts
 *
 * Replace protocol, host, port (and optionally username/password) with your proxy.
 */

import { search, Proxy } from '../src';

const proxy = new Proxy({
  protocol: 'http',
  host: '[host]',
  port: 9999,
  username: 'optional username',
  password: 'optional password',
});

const results = await search({
  query: 'TypeScript',
  proxy,
  count: 5,
});

for (const result of results) {
  console.log(result.title);
}

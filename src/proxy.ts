import type { ProxyOptions } from './types';

/**
 * Proxy configuration for routing search and (optional) page fetch requests.
 */
export class Proxy {
  readonly protocol: ProxyOptions['protocol'];
  readonly host: string;
  readonly port: number;
  readonly username?: string;
  readonly password?: string;

  constructor(options: ProxyOptions) {
    this.protocol = options.protocol;
    this.host = options.host;
    this.port = options.port;
    this.username = options.username;
    this.password = options.password;
  }

  /**
   * Returns a URL suitable for fetch/axios proxy (e.g. http://user:pass@host:port).
   */
  toUrl(): string {
    const auth =
      this.username != null && this.password != null
        ? `${encodeURIComponent(this.username)}:${encodeURIComponent(this.password)}@`
        : '';
    return `${this.protocol}://${auth}${this.host}:${this.port}`;
  }

  /**
   * Returns a config object for Playwright-style proxy (for optional extend with browser).
   */
  toPlaywright(): { server: string; username?: string; password?: string } {
    const proxy: { server: string; username?: string; password?: string } = {
      server: `${this.protocol}://${this.host}:${this.port}`,
    };
    if (this.username != null) proxy.username = this.username;
    if (this.password != null) proxy.password = this.password;
    return proxy;
  }
}

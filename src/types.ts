/**
 * Region codes for DuckDuckGo Lite search (kl parameter).
 * @see https://duckduckgo.com/params
 */
export enum Regions {
  ARGENTINA = 'ar-es',
  AUSTRALIA = 'au-en',
  AUSTRIA = 'at-de',
  BELGIUM_FR = 'be-fr',
  BELGIUM_NL = 'be-nl',
  BRAZIL = 'br-pt',
  BULGARIA = 'bg-bg',
  CANADA_EN = 'ca-en',
  CANADA_FR = 'ca-fr',
  CATALONIA = 'ct-ca',
  CHILE = 'cl-es',
  CHINA = 'cn-zh',
  COLOMBIA = 'co-es',
  CROATIA = 'hr-hr',
  CZECH_REPUBLIC = 'cz-cs',
  DENMARK = 'dk-da',
  ESTONIA = 'ee-et',
  FINLAND = 'fi-fi',
  FRANCE = 'fr-fr',
  GERMANY = 'de-de',
  GREECE = 'gr-el',
  HONG_KONG = 'hk-tzh',
  HUNGARY = 'hu-hu',
  ICELAND = 'is-is',
  INDIA_EN = 'in-en',
  INDONESIA_EN = 'id-en',
  IRELAND = 'ie-en',
  ISRAEL_EN = 'il-en',
  ITALY = 'it-it',
  JAPAN = 'jp-jp',
  KOREA = 'kr-kr',
  LATVIA = 'lv-lv',
  LITHUANIA = 'lt-lt',
  MALAYSIA_EN = 'my-en',
  MEXICO = 'mx-es',
  NETHERLANDS = 'nl-nl',
  NEW_ZEALAND = 'nz-en',
  NORWAY = 'no-no',
  PAKISTAN_EN = 'pk-en',
  PERU = 'pe-es',
  PHILIPPINES_EN = 'ph-en',
  POLAND = 'pl-pl',
  PORTUGAL = 'pt-pt',
  ROMANIA = 'ro-ro',
  RUSSIA = 'ru-ru',
  SAUDI_ARABIA = 'xa-ar',
  SINGAPORE = 'sg-en',
  SLOVAKIA = 'sk-sk',
  SLOVENIA = 'sl-sl',
  SOUTH_AFRICA = 'za-en',
  SPAIN_CA = 'es-ca',
  SPAIN_ES = 'es-es',
  SWEDEN = 'se-sv',
  SWITZERLAND_DE = 'ch-de',
  SWITZERLAND_FR = 'ch-fr',
  TAIWAN = 'tw-tzh',
  THAILAND_EN = 'th-en',
  TURKEY = 'tr-tr',
  US_ENGLISH = 'us-en',
  US_SPANISH = 'us-es',
  UKRAINE = 'ua-uk',
  UNITED_KINGDOM = 'uk-en',
  VIETNAM_EN = 'vn-en',
}

/**
 * Time range for search results (df parameter).
 */
export enum Timespans {
  PAST_DAY = 'd',
  PAST_WEEK = 'w',
  PAST_MONTH = 'm',
  PAST_YEAR = 'y',
}

export type ProxyProtocol = 'http' | 'https' | 'socks4' | 'socks5';

/**
 * Proxy configuration for requests.
 */
export interface ProxyOptions {
  protocol: ProxyProtocol;
  host: string;
  port: number;
  username?: string;
  password?: string;
}

/**
 * Filter options compiled into the search query string.
 * All fields are optional; only set ones are applied.
 */
export interface FiltersOptions {
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
}

/**
 * Raw parsed result from HTML (before wrapping in SearchResult).
 */
export interface ParsedResult {
  title: string;
  link: string;
  description: string;
}

/**
 * Options for markdown/json output (extend mode).
 */
export interface ExtendOptions {
  contentLength?: number;
  ignoreLinks?: boolean;
  ignoreImages?: boolean;
  onlyPageContent?: boolean;
}

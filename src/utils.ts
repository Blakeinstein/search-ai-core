/**
 * Check if URL is likely to return HTML (for extended content fetch).
 * Only text/html and similar are supported for content extraction.
 */
export function validContentType(url: string): boolean {
  try {
    const pathname = new URL(url).pathname.toLowerCase();
    if (pathname.endsWith('.pdf') || pathname.endsWith('.doc') || pathname.endsWith('.xls')) return false;
    if (/\.(pdf|doc|xls|xlsx|docx|zip|rar|exe|dmg)(\?|$)/i.test(pathname)) return false;
    return true;
  } catch {
    return false;
  }
}

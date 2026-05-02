/**
 * Runtime compatibility patch for React Native 0.76 New Architecture (Expo SDK 52).
 *
 * ROOT CAUSE (confirmed via Metro logs):
 *   @supabase/realtime-js@2.103.3 — lib/transformers.js:224-238
 *   `httpEndpointURL` reads & writes url.protocol / url.pathname / url.href.
 *   All three throw "not implemented" in Hermes JSI (New Architecture).
 *
 * PRIMARY FIX (metro.config.js):
 *   Metro's resolveRequest intercepts realtime-js's internal `require('./transformers')`
 *   and redirects it to patches/realtime-transformers.js — a pure-string version.
 *
 * SECONDARY FIX (this file):
 *   Patch URL.prototype getters+setters so that any remaining code that reads OR
 *   writes url.protocol etc. doesn't crash with "not implemented" or "not writable".
 *
 * IMPORT THIS FILE AS THE VERY FIRST IMPORT IN app/_layout.tsx.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
(function applyURLPolyfillFirst() {
  /**
   * In bridgeless RN 0.76, the built-in `URL` implementation can throw:
   * - "URL.protocol is not implemented"
   * and Expo Go can also mark global properties as non-writable, so
   * `react-native-url-polyfill/auto` may crash with "property is not writable".
   *
   * We therefore install the polyfill defensively using `defineProperty`,
   * and fall back to the prototype patch below if we can't replace globals.
   */
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const urlMod = require('react-native-url-polyfill');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const URLImpl = require('react-native-url-polyfill/js/URL').URL;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const URLSearchParamsImpl = require('react-native-url-polyfill/js/URLSearchParams').URLSearchParams;

    // Mark that we attempted installation (useful for debugging in device logs)
    try {
      Object.defineProperty(globalThis, 'REACT_NATIVE_URL_POLYFILL', {
        value: `react-native-url-polyfill@${urlMod?.version ?? 'unknown'}`,
        configurable: true,
      });
    } catch {}

    try {
      Object.defineProperty(globalThis, 'URL', { value: URLImpl, writable: true, configurable: true });
      Object.defineProperty(globalThis, 'URLSearchParams', { value: URLSearchParamsImpl, writable: true, configurable: true });
    } catch {
      // If globals are sealed, don't crash — the prototype patch below may still help.
    }
  } catch {
    // Polyfill not available; fall back to prototype patch below.
  }
})();

(function patchURLPrototype() {
  // Quick bail-out: if protocol already works, nothing to do.
  try {
    new URL('https://bail-check.example.com').protocol;
    return;
  } catch (e: any) {
    if (!String(e).includes('not implemented')) return;
  }

  console.log('[FlickPatch] URL.prototype broken — patching getters+setters…');

  /** Minimal RFC-3986 parser — zero dependencies */
  function parseHref(href: string): Record<string, string> {
    const m =
      (href || '').match(/^(([^:/?#]+):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/) ?? [];
    const scheme    = m[2] ?? '';
    const authority = m[4] ?? '';
    const atIdx     = authority.lastIndexOf('@');
    const hostPort  = atIdx >= 0 ? authority.slice(atIdx + 1) : authority;
    const isIPv6    = hostPort.startsWith('[');
    const colonIdx  = isIPv6 ? -1 : hostPort.lastIndexOf(':');
    const hostname  = colonIdx >= 0 ? hostPort.slice(0, colonIdx) : hostPort;
    const port      = colonIdx >= 0 ? hostPort.slice(colonIdx + 1) : '';
    const pathname  = m[5] || '/';
    const search    = m[6] ?? '';
    const hash      = m[8] ?? '';
    const protocol  = scheme ? scheme + ':' : '';
    const host      = hostPort;
    const origin    = protocol && hostname ? `${protocol}//${host}` : 'null';
    return { protocol, hostname, port, pathname, search, hash, host, origin };
  }

  /** Read href without hitting a broken getter (avoids infinite loops) */
  function rawHref(instance: URL): string {
    try {
      const desc = Object.getOwnPropertyDescriptor(URL.prototype, 'href');
      if (desc?.get) return (desc.get as Function).call(instance) as string;
    } catch (_) {}
    try { return (instance as any)._href ?? ''; } catch (_) {}
    return '';
  }

  let patched = 0;
  const PROPS = ['protocol', 'hostname', 'port', 'pathname', 'search', 'hash', 'host', 'origin'] as const;

  PROPS.forEach((prop) => {
    try {
      Object.defineProperty(URL.prototype, prop, {
        // GETTER: parse href and return the requested component
        get(this: URL) {
          try {
            const href = rawHref(this);
            return href ? parseHref(href)[prop] : '';
          } catch { return ''; }
        },
        // SETTER: silently accept writes so code like `url.protocol = 'https:'`
        //         doesn't crash with "property is not writable".
        //         Metro's realtime-js patch (resolveRequest) is the real fix;
        //         this setter is a silent safety net for any other callers.
        set(_value: string) { /* intentional no-op */ },
        configurable: true,
        enumerable: true,
      });
      patched++;
    } catch {
      /* silently skip if this specific property is fully sealed */
    }
  });

  if (patched > 0) {
    console.log(`[FlickPatch] ✅ URL.prototype: patched ${patched}/${PROPS.length} properties (getter + setter)`);
  } else {
    console.warn('[FlickPatch] ⚠️  URL.prototype is completely sealed — relying on Metro patch only');
  }
})();

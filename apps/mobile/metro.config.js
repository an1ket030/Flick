const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Monorepo root
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Watch all files in the monorepo
config.watchFolders = [workspaceRoot];

// 2. Let Metro know where to resolve packages, and prioritise the app's own node_modules
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// 3. Ensure consistent module resolution across the monorepo
config.resolver.unstable_enableSymlinks = true;

// 4. Intercept @supabase/realtime-js's internal `require('./transformers')` call.
//    The original file uses URL.protocol / URL.pathname / URL.href which all
//    throw "not implemented" in React Native 0.76 New Architecture (Hermes JSI).
//    We redirect that single import to our patched version in /patches/.
const PATCHED_TRANSFORMERS = path.resolve(projectRoot, 'patches/realtime-transformers.js');

// Keep a reference to Metro's default resolver so our fallback is correct.
const defaultResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  /**
   * Supabase Realtime v2.103.x can end up resolving transformers in a few ways:
   * - internal relative imports (./transformers or ../lib/transformers)
   * - external deep imports from other packages (e.g. "@supabase/realtime-js/dist/module/lib/transformers")
   *
   * In RN 0.76 bridgeless, the stock transformers mutates URL fields (protocol/pathname/href),
   * which throws. We redirect *all* transformers resolutions from realtime-js to our patched file.
   */
  const normalized = String(moduleName).replace(/\\/g, '/');

  const isRealtimeJsPath =
    normalized.startsWith('@supabase/realtime-js') ||
    normalized.includes('/@supabase/realtime-js/') ||
    (context.originModulePath &&
      String(context.originModulePath).replace(/\\/g, '/').includes('/@supabase/realtime-js/'));

  const isTransformersRequest =
    normalized === './transformers' ||
    normalized === '../lib/transformers' ||
    normalized.endsWith('/transformers') ||
    normalized.endsWith('/transformers.js') ||
    normalized.includes('/transformers');

  if (isRealtimeJsPath && isTransformersRequest) {
    return { type: 'sourceFile', filePath: PATCHED_TRANSFORMERS };
  }

  // Fall through to default resolution for everything else
  if (typeof defaultResolveRequest === 'function') {
    return defaultResolveRequest(context, moduleName, platform);
  }
  // If Expo/Metro didn't provide a default resolver for some reason, use Metro's built-in one.
  return require('metro-resolver').resolve(context, moduleName, platform);
};

module.exports = config;

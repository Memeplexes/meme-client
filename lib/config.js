let DEFAULT_MEME_CONFIG = {
  apiOrigin: "https://meme-server.cloudflare1973.workers.dev",
  apiPath: "/api/meme",
  filesBaseUrl: "https://m.marak.com/"
};

// check if origin is localhost and override defaults for local testing
if (typeof window !== "undefined" && window.location && window.location.origin.includes("localhost")) {
  DEFAULT_MEME_CONFIG.apiOrigin = "http://localhost:8888";
  DEFAULT_MEME_CONFIG.apiPath = "/api/meme";
  DEFAULT_MEME_CONFIG.filesBaseUrl = "https://m.marak.com/";
}

function trimTrailingSlash(value = "") {
  return String(value).replace(/\/+$/, "");
}

function ensureLeadingSlash(value = "") {
  const normalized = String(value).trim();
  if (!normalized) {
    return "";
  }
  return normalized.startsWith("/") ? normalized : `/${normalized}`;
}

function getWindowConfig() {
  if (typeof window === "undefined" || typeof window.__MEME__ !== "object" || window.__MEME__ === null) {
    return {};
  }

  return window.__MEME__;
}

export function resolveMemeConfig() {
  const overrides = getWindowConfig();
  const apiOrigin = trimTrailingSlash(overrides.apiOrigin ?? DEFAULT_MEME_CONFIG.apiOrigin);
  const apiPath = ensureLeadingSlash(overrides.apiPath ?? DEFAULT_MEME_CONFIG.apiPath);
  const apiUrl = trimTrailingSlash(
    overrides.apiUrl ?? new URL(apiPath, `${apiOrigin}/`).toString()
  );
  const config = {
    apiOrigin,
    apiPath,
    apiUrl,
    uploadsEndpoint: trimTrailingSlash(overrides.uploadsEndpoint ?? `${apiUrl}/uploads`),
    filesBaseUrl: trimTrailingSlash(overrides.filesBaseUrl ?? DEFAULT_MEME_CONFIG.filesBaseUrl),
    authUrl: overrides.authUrl ?? `${apiUrl}/login`
  };

  if (typeof window !== "undefined") {
    window.__MEME__ = {
      ...DEFAULT_MEME_CONFIG,
      ...overrides,
      ...config
    };
  }

  return config;
}

export const MEME_CONFIG = resolveMemeConfig();

import "./lib/web-components/SearchBarTags.js";
import "./lib/web-components/MemeCard.js";
import "./lib/web-components/FloatingOctocat.js";
import { filterFiles } from "./lib/filterFiles.js";
import { ejectMedia } from "./lib/ejectMedia.js";
import { injectMedia } from "./lib/injectMedia.js";
import { initializeMemeFeed } from "./lib/initializeMemeFeed.js";
import { searchMemes, getRandomMemes, getTopMemes, castMemeVote } from "./lib/api.js";
import { createAttachInfiniteScrollObserver } from "./attachInfiniteScrollObserver.js";
import { loadDefaultFeed } from "./lib/loadDefaultFeed.js";
import { loadMenuFeed } from "./lib/loadMenuFeed.js";

const $feed = document.querySelector("#feed");
const sideMenu = document.querySelector("#side-menu");
const searchParams = new URLSearchParams(window.location.search);
const initialCreator = searchParams.get("c") || "";
const initialQuery = initialCreator || searchParams.get("q") || "";
const GITHUB_URL = "https://github.com/buddypond/meme-client";
const API_ORIGIN = "http://localhost:8888";
const SIDEBAR_HIDDEN_CLASS = "sidebar-hidden";
const SIDEBAR_HIDDEN_STORAGE_KEY = "meme-feed-sidebar-hidden";
const SIDEBAR_FLAG_ENABLED =
  window.location.search.includes("immersive=1") ||
  window.location.search.includes("sidebar=hidden") ||
  window.MEME_CLIENT_HIDE_SIDEBAR === true;

const focusSearchInput = () => document.querySelector("#search-input")?.focus();
const isDesktopViewport = () => window.innerWidth >= 768;

const readStoredSidebarHidden = () => {
  try {
    return window.localStorage.getItem(SIDEBAR_HIDDEN_STORAGE_KEY);
  } catch {
    return null;
  }
};

const persistSidebarHidden = isHidden => {
  try {
    window.localStorage.setItem(SIDEBAR_HIDDEN_STORAGE_KEY, String(isHidden));
  } catch {
    // Ignore storage failures in private browsing or restricted contexts.
  }
};

const getInitialSidebarHiddenState = () => {
  const storedValue = readStoredSidebarHidden();
  if (storedValue !== null) {
    return storedValue === "true";
  }

  return SIDEBAR_FLAG_ENABLED;
};

(() => {
  if (!sideMenu) {
    return null;
  }

  const style = document.createElement("style");
  style.textContent = `
    @media (min-width: 768px) {
      side-menu {
        transition: transform 180ms ease, opacity 180ms ease;
      }

      body.${SIDEBAR_HIDDEN_CLASS} {
        padding-left: 0;
      }

      body.${SIDEBAR_HIDDEN_CLASS} .search-shell {
        left: 0;
      }

      body.${SIDEBAR_HIDDEN_CLASS} side-menu {
        transform: translateX(calc(var(--side-menu-width, 250px) * -1));
        opacity: 0;
        pointer-events: none;
      }

      .sidebar-visibility-toggle {
        position: fixed;
        top: 16px;
        left: 16px;
        z-index: 1002;
        border: 1px solid rgba(255, 255, 255, 0.16);
        border-radius: 999px;
        background: rgba(24, 24, 24, 0.94);
        color: white;
        padding: 12px 16px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
      }
    }

    @media (max-width: 767px) {
      .sidebar-visibility-toggle {
        display: none;
      }
    }
  `;
  document.head.appendChild(style);

  const button = document.createElement("button");
  button.type = "button";
  button.className = "sidebar-visibility-toggle";
  button.setAttribute("aria-controls", "side-menu");
  document.body.appendChild(button);

  const syncButton = isHidden => {
    button.textContent = isHidden ? "Show Menu" : "Hide Menu";
    button.setAttribute("aria-label", isHidden ? "Show sidebar" : "Hide sidebar");
    button.setAttribute("aria-pressed", String(!isHidden));
  };

  const setSidebarHidden = isHidden => {
    const shouldHide = isDesktopViewport() && isHidden;
    document.body.classList.toggle(SIDEBAR_HIDDEN_CLASS, shouldHide);
    if (shouldHide) {
      sideMenu.open = false;
      document.body.classList.remove("menu-open");
    }
    syncButton(shouldHide);
    persistSidebarHidden(isHidden);
  };

  button.addEventListener("click", () => {
    const nextHidden = !document.body.classList.contains(SIDEBAR_HIDDEN_CLASS);
    setSidebarHidden(nextHidden);
  });

  window.addEventListener("resize", () => {
    setSidebarHidden(getInitialSidebarHiddenState());
  });

  setSidebarHidden(getInitialSidebarHiddenState());
  return { setSidebarHidden };
})();

document.querySelector("floating-octocat")?.setAttribute("href", GITHUB_URL);

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", focusSearchInput, { once: true });
} else {
  focusSearchInput();
}

let searchInput = document.querySelector("search-bar-tags#search-input");
searchInput?.setAttribute("initial-query", initialQuery);

const SEARCH_PAGE_SIZE = 10;
const SEARCH_RESULTS_LIMIT = 100;
let searchOffset = SEARCH_PAGE_SIZE;
let activeQuery = initialQuery;
let activeCreator = initialCreator;
let activeFeedMode = "hot";
let isLoadingMore = false;
let hasMoreMemes = true;
let memeFeedInstance = null;
let defaultHotFiles = [];
let infiniteScrollObserver = null;
const feedState = {
  get activeCreator() {
    return activeCreator;
  },
  get activeFeedMode() {
    return activeFeedMode;
  },
  get activeQuery() {
    return activeQuery;
  },
  get defaultHotFiles() {
    return defaultHotFiles;
  },
  get hasMoreMemes() {
    return hasMoreMemes;
  },
  get isLoadingMore() {
    return isLoadingMore;
  },
  get searchOffset() {
    return searchOffset;
  },
  set activeCreator(value) {
    activeCreator = value;
  },
  set activeFeedMode(value) {
    activeFeedMode = value;
  },
  set activeQuery(value) {
    activeQuery = value;
  },
  set defaultHotFiles(value) {
    defaultHotFiles = value;
  },
  set hasMoreMemes(value) {
    hasMoreMemes = value;
  },
  set isLoadingMore(value) {
    isLoadingMore = value;
  },
  set searchOffset(value) {
    searchOffset = value;
  }
};

const resetRenderedFeed = () => {
  Array.from($feed.children).forEach(child => window.cleanupMemeState?.(child));
  $feed.replaceChildren();
};

const initializeFeed = ({ files, initialQueryValue = initialQuery }) => {
  memeFeedInstance?.destroy?.();
  resetRenderedFeed();

  memeFeedInstance = initializeMemeFeed({
    files,
    feed: $feed,
    initialQuery: initialQueryValue,
    searchMemes,
    castMemeVote,
    filterFiles,
    ejectMedia,
    injectMedia
  });

  return memeFeedInstance;
};

const updateActiveNavItem = item => {
  sideMenu?.querySelectorAll("[data-side-menu-item]").forEach(link => {
    link.toggleAttribute("data-active", link === item);
  });
};

const handleLoadMenuFeed = item => loadMenuFeed(item, {
  apiOrigin: API_ORIGIN,
  initializeFeed,
  loadDefaultFeed,
  searchInput,
  searchPageSize: SEARCH_PAGE_SIZE,
  updateSearchQueryParam,
  state: feedState
});

const getActiveFilters = () => {
  const params = new URLSearchParams(window.location.search);
  const creator = params.get("c") || "";
  const query = creator ? "" : (params.get("q") || "");
  return { query, creator };
};

const updateSearchQueryParam = query => {
  const url = new URL(window.location.href);
  const trimmedQuery = query.trim();

  url.searchParams.delete("q");

  if (trimmedQuery) {
    url.searchParams.set("q", trimmedQuery);
  } else {
    url.searchParams.delete("q");
  }

  url.searchParams.delete("c");

  window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
};

const runSearch = async query => {
  console.log("Running search with query:", query);
  activeQuery = query.trim();
  activeCreator = "";
  hasMoreMemes = true;
  isLoadingMore = false;
  updateSearchQueryParam(activeQuery);

  const files = await searchMemes({
    query: activeQuery,
    creator: "",
    limit: SEARCH_PAGE_SIZE,
    offset: 0
  });

  activeFeedMode = "hot";
  searchOffset = files.length;
  hasMoreMemes = files.length === SEARCH_PAGE_SIZE;

  /*
  initializeFeed({
    files,
    initialQueryValue: activeQuery
  });
  */
  // attachInfiniteScrollObserver();
};

searchInput?.addEventListener("change", event => {
  console.log("Search input changed:", event);
  if (event?.detail?.value !== undefined) {
    // get the current value of the search input and update the URL query parameter, this will allow users to share the URL with the current search query and also allows us to keep the search state in sync with the URL
    let currentValue = searchInput.value;
    console.log("Current search input value:", currentValue);
    runSearch(currentValue);
  //}
    //runSearch(event.detail.value);
  }
});

searchInput?.addEventListener("submit", event => {
  console.log("Search input submitted:", event);
  if (event?.detail?.value !== undefined) {
    runSearch(event.detail.value);
  }
});

const loadMoreMemes = async () => {
  if (activeFeedMode !== "hot" || isLoadingMore || !hasMoreMemes) return;

  isLoadingMore = true;

  try {
    const { query, creator } = getActiveFilters();
    const nextFiles = await searchMemes({
      query,
      creator,
      limit: SEARCH_PAGE_SIZE,
      offset: searchOffset
    });

    const appendedCount = memeFeedInstance?.appendFiles?.(nextFiles) ?? 0;
    searchOffset += appendedCount;
    hasMoreMemes = nextFiles.length === SEARCH_PAGE_SIZE;
  } finally {
    isLoadingMore = false;
  }
};

const attachInfiniteScrollObserver = createAttachInfiniteScrollObserver({
  getObserver: () => infiniteScrollObserver,
  loadMoreMemes,
  setObserver: observer => {
    infiniteScrollObserver = observer;
  }
});

sideMenu?.addEventListener("click", async event => {
  return;
  const item = event.target.closest("[data-side-menu-item]");
  if (!item) {
    return;
  }

  const hash = item.getAttribute("href");
  if (hash?.startsWith("#")) {
    window.history.replaceState({}, "", `${window.location.pathname}${window.location.search}${hash}`);
  }

  event.preventDefault();
  const loaded = await handleLoadMenuFeed(item);
  if (loaded) {
    updateActiveNavItem(item);
  }
});

loadDefaultFeed({
  attachInfiniteScrollObserver,
  getTopMemes,
  initialCreator,
  initialQuery,
  initializeFeed,
  searchMemes,
  searchPageSize: SEARCH_PAGE_SIZE,
  state: feedState
});

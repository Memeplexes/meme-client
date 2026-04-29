import "./lib/web-components/SearchBarTags.js";
import "./lib/web-components/MemeCard.js";
import "./lib/web-components/FloatingOctocat.js";
import { filterFiles } from "./lib/filterFiles.js";
import { ejectMedia } from "./lib/ejectMedia.js";
import { injectMedia } from "./lib/injectMedia.js";
import { initializeMemeFeed } from "./lib/initializeMemeFeed.js";
import { searchMemes, getTopMemes, castMemeVote } from "./lib/api.js";
import { createAttachInfiniteScrollObserver } from "./attachInfiniteScrollObserver.js";
import { loadDefaultFeed } from "./lib/loadDefaultFeed.js";

const GITHUB_URL = "https://github.com/buddypond/meme-client";
const API_ORIGIN = "http://localhost:8888";
const SEARCH_PAGE_SIZE = 10;
const SIDEBAR_HIDDEN_CLASS = "sidebar-hidden";
const SIDEBAR_HIDDEN_STORAGE_KEY = "meme-feed-sidebar-hidden";

class MemeApiClient {
  constructor(api) {
    this.api = api;
  }

  search({ query = "", creator = "", limit = SEARCH_PAGE_SIZE, offset = 0 }) {
    return this.api.searchMemes({ query, creator, limit, offset });
  }

  getTopMemes(...args) {
    return this.api.getTopMemes(...args);
  }

  vote(...args) {
    return this.api.castMemeVote(...args);
  }
}

class MemeClientStore {
  constructor(initialState) {
    this.state = { ...initialState };
  }

  get(key) {
    return this.state[key];
  }

  set(updates) {
    Object.assign(this.state, updates);
  }

  toLegacyState() {
    return new Proxy(
      {},
      {
        get: (_, key) => this.state[key],
        set: (_, key, value) => {
          this.state[key] = value;
          return true;
        }
      }
    );
  }
}

class MemeClient {
  constructor({
    feed,
    sideMenu,
    searchInput,
    floatingOctocat,
    searchPageSize = SEARCH_PAGE_SIZE,
    apiOrigin = API_ORIGIN,
    githubUrl = GITHUB_URL
  }) {
    this.feed = feed;
    this.sideMenu = sideMenu;
    this.searchInput = searchInput;
    this.floatingOctocat = floatingOctocat;
    this.searchPageSize = searchPageSize;
    this.apiOrigin = apiOrigin;
    this.githubUrl = githubUrl;
    this.api = new MemeApiClient({ searchMemes, getTopMemes, castMemeVote });
    this.memeFeedInstance = null;
    this.infiniteScrollObserver = null;
    this.attachInfiniteScrollObserver = null;

    const { initialCreator, initialQuery } = this.getInitialFilters();
    this.initialCreator = initialCreator;
    this.initialQuery = initialQuery;

    this.store = new MemeClientStore({
      activeCreator: initialCreator,
      activeFeedMode: "hot",
      activeQuery: initialQuery,
      defaultHotFiles: [],
      hasMoreMemes: true,
      isLoadingMore: false,
      searchOffset: searchPageSize
    });
  }

  init() {
    this.configureExternalLinks();
    this.configureSearchInput();
    this.configureSidebar();
    this.configureInfiniteScroll();
    this.bindEvents();
    this.loadInitialFeed();
  }

  getInitialFilters() {
    const searchParams = new URLSearchParams(window.location.search);
    const initialCreator = searchParams.get("c") || "";
    const initialQuery = initialCreator || searchParams.get("q") || "";
    return { initialCreator, initialQuery };
  }

  configureExternalLinks() {
    this.floatingOctocat?.setAttribute("href", this.githubUrl);
  }

  configureSearchInput() {
    if (!this.searchInput) {
      return;
    }

    this.searchInput.setAttribute("initial-query", this.initialQuery);

    const focusSearchInput = () => this.searchInput?.focus?.();
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", focusSearchInput, { once: true });
      return;
    }

    focusSearchInput();
  }

  configureSidebar() {
    if (!this.sideMenu) {
      return;
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

    const applySidebarHidden = isHidden => {
      const shouldHide = window.innerWidth >= 768 && isHidden;
      document.body.classList.toggle(SIDEBAR_HIDDEN_CLASS, shouldHide);

      if (shouldHide) {
        this.sideMenu.open = false;
        document.body.classList.remove("menu-open");
      }

      syncButton(shouldHide);
      this.persistSidebarHidden(isHidden);
    };

    button.addEventListener("click", () => {
      const nextHidden = !document.body.classList.contains(SIDEBAR_HIDDEN_CLASS);
      applySidebarHidden(nextHidden);
    });

    window.addEventListener("resize", () => {
      applySidebarHidden(this.getInitialSidebarHiddenState());
    });

    applySidebarHidden(this.getInitialSidebarHiddenState());
  }

  bindEvents() {
    this.searchInput?.addEventListener("change", event => {
      if (event?.detail?.value === undefined) {
        return;
      }

      this.runSearch(this.searchInput.value);
    });

    this.searchInput?.addEventListener("submit", event => {
      if (event?.detail?.value === undefined) {
        return;
      }

      this.runSearch(event.detail.value);
    });
  }

  configureInfiniteScroll() {
    this.attachInfiniteScrollObserver = createAttachInfiniteScrollObserver({
      getObserver: () => this.infiniteScrollObserver,
      loadMoreMemes: () => this.loadMoreMemes(),
      setObserver: observer => {
        this.infiniteScrollObserver = observer;
      }
    });
  }

  loadInitialFeed() {
    loadDefaultFeed({
      attachInfiniteScrollObserver: this.attachInfiniteScrollObserver,
      getTopMemes: (...args) => this.api.getTopMemes(...args),
      initialCreator: this.initialCreator,
      initialQuery: this.initialQuery,
      initializeFeed: ({ files, initialQueryValue }) => this.initializeFeed({ files, initialQueryValue }),
      searchMemes: params => this.api.search(params),
      searchPageSize: this.searchPageSize,
      state: this.store.toLegacyState()
    });
  }

  resetRenderedFeed() {
    Array.from(this.feed?.children || []).forEach(child => window.cleanupMemeState?.(child));
    this.feed?.replaceChildren();
  }

  initializeFeed({ files, initialQueryValue = this.initialQuery }) {
    this.memeFeedInstance?.destroy?.();
    this.resetRenderedFeed();

    this.memeFeedInstance = initializeMemeFeed({
      files,
      feed: this.feed,
      initialQuery: initialQueryValue,
      searchMemes: params => this.api.search(params),
      castMemeVote: (...args) => this.api.vote(...args),
      filterFiles,
      ejectMedia,
      injectMedia
    });

    return this.memeFeedInstance;
  }

  getActiveFilters() {
    const params = new URLSearchParams(window.location.search);
    const creator = params.get("c") || "";
    const query = creator ? "" : params.get("q") || "";
    return { query, creator };
  }

  updateSearchQueryParam(query) {
    const url = new URL(window.location.href);
    const trimmedQuery = query.trim();

    url.searchParams.delete("q");
    url.searchParams.delete("c");

    if (trimmedQuery) {
      url.searchParams.set("q", trimmedQuery);
    }

    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  }

  async runSearch(query) {
    const activeQuery = query.trim();

    this.store.set({
      activeCreator: "",
      activeFeedMode: "hot",
      activeQuery,
      hasMoreMemes: true,
      isLoadingMore: false
    });

    this.updateSearchQueryParam(activeQuery);

    const files = await this.api.search({
      query: activeQuery,
      creator: "",
      limit: this.searchPageSize,
      offset: 0
    });

    this.store.set({
      hasMoreMemes: files.length === this.searchPageSize,
      searchOffset: files.length
    });

    this.initializeFeed({
      files,
      initialQueryValue: activeQuery
    });

    this.attachInfiniteScrollObserver?.();
  }

  async loadMoreMemes() {
    if (
      this.store.get("activeFeedMode") !== "hot" ||
      this.store.get("isLoadingMore") ||
      !this.store.get("hasMoreMemes")
    ) {
      return;
    }

    this.store.set({ isLoadingMore: true });

    try {
      const { query, creator } = this.getActiveFilters();
      const nextFiles = await this.api.search({
        query,
        creator,
        limit: this.searchPageSize,
        offset: this.store.get("searchOffset")
      });

      const appendedCount = this.memeFeedInstance?.appendFiles?.(nextFiles) ?? 0;
      this.store.set({
        hasMoreMemes: nextFiles.length === this.searchPageSize,
        searchOffset: this.store.get("searchOffset") + appendedCount
      });
    } finally {
      this.store.set({ isLoadingMore: false });
    }
  }

  readStoredSidebarHidden() {
    try {
      return window.localStorage.getItem(SIDEBAR_HIDDEN_STORAGE_KEY);
    } catch {
      return null;
    }
  }

  persistSidebarHidden(isHidden) {
    try {
      window.localStorage.setItem(SIDEBAR_HIDDEN_STORAGE_KEY, String(isHidden));
    } catch {
      // Ignore storage failures in restricted contexts.
    }
  }

  getInitialSidebarHiddenState() {
    const storedValue = this.readStoredSidebarHidden();
    if (storedValue !== null) {
      return storedValue === "true";
    }

    return (
      window.location.search.includes("immersive=1") ||
      window.location.search.includes("sidebar=hidden") ||
      window.MEME_CLIENT_HIDE_SIDEBAR === true
    );
  }
}

const memeClient = new MemeClient({
  feed: document.querySelector("#feed"),
  sideMenu: document.querySelector("#side-menu"),
  searchInput: document.querySelector("search-bar-tags#search-input"),
  floatingOctocat: document.querySelector("floating-octocat")
});

memeClient.init();

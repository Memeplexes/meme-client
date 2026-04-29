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
const SEARCH_LOCATION_CHANGE_EVENT = "meme-client:search-location-change";

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

export class MemeClient {
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
    this.lastAppliedLocationKey = null;
    this.activeSearchRequest = 0;

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
    this.applySearchFromLocation({ force: true });
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
    this.searchInput.value = this.initialQuery;

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

        .sidebar-controls {
          position: fixed;
          top: 16px;
          left: 16px;
          z-index: 1002;
          display: inline-flex;
          align-items: stretch;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.16);
          border-radius: 999px;
          background: rgba(24, 24, 24, 0.94);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

        .sidebar-home-button,
        .sidebar-visibility-toggle {
          border: 0;
          background: transparent;
          color: white;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }

        .sidebar-home-button {
          padding: 12px 16px;
        }

        .sidebar-home-button:hover,
        .sidebar-visibility-toggle:hover {
          background: rgba(255, 255, 255, 0.08);
        }

        .sidebar-visibility-toggle {
          position: relative;
          width: 46px;
          border-left: 1px solid rgba(255, 255, 255, 0.12);
        }

        .sidebar-visibility-toggle::before,
        .sidebar-visibility-toggle::after {
          content: "";
          position: absolute;
          top: 14px;
          bottom: 14px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.9);
        }

        .sidebar-visibility-toggle::before {
          left: 12px;
          width: 8px;
        }

        .sidebar-visibility-toggle::after {
          left: 24px;
          width: 10px;
          opacity: 0.5;
        }
      }

      @media (max-width: 767px) {
        .sidebar-controls {
          display: none;
        }
      }
    `;
    document.head.appendChild(style);

    const controls = document.createElement("div");
    controls.className = "sidebar-controls";

    const homeButton = document.createElement("button");
    homeButton.type = "button";
    homeButton.className = "sidebar-home-button";
    homeButton.textContent = "Home";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "sidebar-visibility-toggle";
    button.setAttribute("aria-controls", "side-menu");
    controls.append(homeButton, button);
    document.body.appendChild(controls);

    const syncButton = isHidden => {
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

    homeButton.addEventListener("click", () => {
      this.updateSearchLocation({ query: "", creator: "" });
    });

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
    const navigateFromSearchInput = value => {
      this.updateSearchLocation({ query: value, creator: "" });
    };

    this.searchInput?.addEventListener("change", event => {
      if (event?.detail?.value === undefined) {
        return;
      }

      navigateFromSearchInput(event.detail.value);
    });

    this.searchInput?.addEventListener("submit", event => {
      if (event?.detail?.value === undefined) {
        return;
      }

      navigateFromSearchInput(event.detail.value);
    });

    this.feed?.addEventListener("meme-client:navigate-search", event => {
      this.updateSearchLocation(event.detail || {});
    });

    window.addEventListener("popstate", () => {
      this.applySearchFromLocation({ force: true });
    });

    window.addEventListener(SEARCH_LOCATION_CHANGE_EVENT, () => {
      this.applySearchFromLocation();
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

  loadInitialFeed({ query = "", creator = "" } = {}) {
    const requestId = ++this.activeSearchRequest;

    loadDefaultFeed({
      attachInfiniteScrollObserver: this.attachInfiniteScrollObserver,
      getTopMemes: (...args) => this.api.getTopMemes(...args),
      initialCreator: creator,
      initialQuery: creator ? creator : query,
      initializeFeed: ({ files, initialQueryValue }) => {
        if (requestId !== this.activeSearchRequest) {
          return;
        }

        this.initializeFeed({ files, initialQueryValue });
      },
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
      onRequestSearch: params => this.updateSearchLocation(params),
      searchMemes: params => this.api.search(params),
      castMemeVote: (...args) => this.api.vote(...args),
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
    this.updateSearchLocation({ query, creator: "" });
  }

  getLocationKey({ query, creator }) {
    return JSON.stringify({ query: query || "", creator: creator || "" });
  }

  syncSearchInputValue(value) {
    if (!this.searchInput || this.searchInput.value === value) {
      return;
    }

    this.searchInput.value = value;
  }

  updateSearchLocation({ query = "", creator = "" }) {
    const trimmedQuery = query.trim();
    const trimmedCreator = creator.trim();
    const url = new URL(window.location.href);
    const previousSearch = url.search;

    if (trimmedQuery) {
      url.searchParams.set("q", trimmedQuery);
    } else {
      url.searchParams.delete("q");
    }

    if (trimmedCreator) {
      url.searchParams.set("c", trimmedCreator);
    } else {
      url.searchParams.delete("c");
    }

    const nextSearch = url.search;
    if (nextSearch === previousSearch) {
      this.applySearchFromLocation();
      return;
    }

    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
    window.dispatchEvent(new CustomEvent(SEARCH_LOCATION_CHANGE_EVENT));
  }

  async runSearch(query) {
    const requestId = ++this.activeSearchRequest;
    const activeQuery = query.trim();

    this.store.set({
      activeCreator: "",
      activeFeedMode: "hot",
      activeQuery,
      hasMoreMemes: true,
      isLoadingMore: false
    });

    const files = await this.api.search({
      query: activeQuery,
      creator: "",
      limit: this.searchPageSize,
      offset: 0
    });

    if (requestId !== this.activeSearchRequest) {
      return;
    }

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

  async runCreatorSearch(creator) {
    const requestId = ++this.activeSearchRequest;
    const activeCreator = creator.trim();

    this.store.set({
      activeCreator,
      activeFeedMode: "hot",
      activeQuery: "",
      hasMoreMemes: true,
      isLoadingMore: false
    });

    const files = await this.api.search({
      query: "",
      creator: activeCreator,
      limit: this.searchPageSize,
      offset: 0
    });

    if (requestId !== this.activeSearchRequest) {
      return;
    }

    this.store.set({
      hasMoreMemes: files.length === this.searchPageSize,
      searchOffset: files.length
    });

    this.initializeFeed({
      files,
      initialQueryValue: activeCreator
    });

    this.attachInfiniteScrollObserver?.();
  }

  applySearchFromLocation({ force = false } = {}) {
    const filters = this.getActiveFilters();
    const locationKey = this.getLocationKey(filters);

    if (!force && locationKey === this.lastAppliedLocationKey) {
      return;
    }

    this.lastAppliedLocationKey = locationKey;
    this.syncSearchInputValue(filters.creator || filters.query);

    if (filters.creator) {
      this.runCreatorSearch(filters.creator);
      return;
    }

    if (filters.query) {
      this.runSearch(filters.query);
      return;
    }

    this.loadInitialFeed(filters);
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

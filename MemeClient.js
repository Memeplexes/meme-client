import { ejectMedia } from "./lib/ejectMedia.js";
import { injectMedia } from "./lib/injectMedia.js";
import { initializeMemeFeed } from "./lib/initializeMemeFeed.js";
import { searchMemes, getTopMemes, castMemeVote, getMemeByFilename } from "./lib/api/api.js";
import { createAttachInfiniteScrollObserver } from "./attachInfiniteScrollObserver.js";
import { MEME_CONFIG } from "./lib/config.js";
import { loadDefaultFeed } from "./lib/loadDefaultFeed.js";

const GITHUB_URL = "https://github.com/buddypond/meme-client";
const API_ORIGIN = MEME_CONFIG.apiOrigin;
const SEARCH_PAGE_SIZE = 32;
const SIDEBAR_HIDDEN_CLASS = "sidebar-hidden";
const SIDEBAR_HIDDEN_STORAGE_KEY = "meme-feed-sidebar-hidden";
const SEARCH_LOCATION_CHANGE_EVENT = "meme-client:search-location-change";
const CLIENT_READY_EVENT = "meme-client:ready";

class MemeApiClient {
  constructor(api) {
    this.api = api;
  }

  search({
    query = "",
    creator = "",
    filter = "",
    dateRange = "",
    limit = SEARCH_PAGE_SIZE,
    offset = 0
  }) {
    return this.api.searchMemes({ query, creator, filter, dateRange, limit, offset });
  }

  getTopMemes(...args) {
    return this.api.getTopMemes(...args);
  }

  vote(...args) {
    return this.api.castMemeVote(...args);
  }

  getMemeByFilename(...args) {
    return this.api.getMemeByFilename(...args);
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
    this.api = new MemeApiClient({ searchMemes, getTopMemes, castMemeVote, getMemeByFilename });
    this.memeFeedInstance = null;
    this.infiniteScrollObserver = null;
    this.attachInfiniteScrollObserver = null;
    this.lastAppliedLocationKey = null;
    this.activeSearchRequest = 0;
    this.hasDispatchedReady = false;

    const { initialCreator, initialQuery, initialFilter, initialDateRange, initialMemeFilename } =
      this.getInitialFilters();
    this.initialCreator = initialCreator;
    this.initialQuery = initialQuery;
    this.initialFilter = initialFilter;
    this.initialDateRange = initialDateRange;
    this.initialMemeFilename = initialMemeFilename;

    this.store = new MemeClientStore({
      activeCreator: initialCreator,
      activeDateRange: initialDateRange,
      activeFeedMode: "hot",
      activeQuery: initialQuery,
      activeFilter: initialFilter,
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
    void this.openInitialMemeModal();
  }

  syncRenderedElements() {
    this.feed = document.querySelector("#feed");
    this.searchInput = document.querySelector("page-topbar")?.searchInput || this.searchInput;
  }

  getInitialFilters() {
    const searchParams = new URLSearchParams(window.location.search);
    const initialCreator = searchParams.get("c") || "";
    const initialQuery = initialCreator || searchParams.get("q") || "";
    const initialFilter = searchParams.get("s") || searchParams.get("filter") || "top";
    const initialDateRange = searchParams.get("d") || "";
    const initialMemeFilename = searchParams.get("m") || "";
    return { initialCreator, initialQuery, initialFilter, initialDateRange, initialMemeFilename };
  }

  async openInitialMemeModal() {
    if (!this.initialMemeFilename) {
      return;
    }

    const memeFilename = this.initialMemeFilename;
    this.initialMemeFilename = "";

    try {
      const meme = await this.api.getMemeByFilename(memeFilename);
      const modalClass = customElements.get("meme-modal");
      const getFeedCard = () => Array.from(document.querySelectorAll("meme-card"))
        .find(card => card?._metadata?.filename === memeFilename);

      let feedCard = getFeedCard();
      if (!feedCard && !this.hasDispatchedReady) {
        await new Promise(resolve => {
          window.addEventListener(CLIENT_READY_EVENT, resolve, { once: true });
        });
        feedCard = getFeedCard();
      }

      const modal = modalClass?.ensure?.();
      modal?.open?.({ meme: feedCard ? {
        ...feedCard._metadata,
        _voteState: feedCard._state,
        _voteForMeme: feedCard._options?.voteForMeme
      } : meme });
    } catch (error) {
      console.error("[meme-client] Failed to open initial meme modal", { memeFilename, error });
    }
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
      }
    `;
    document.head.appendChild(style);

    const pageTopbar = document.querySelector("page-topbar");
    const homeButton = pageTopbar?.homeButton;
    const button = pageTopbar?.sidebarToggleButton;

    if (!homeButton || !button) {
      return;
    }

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
      const query = Array.isArray(value) ? value.join(" ") : String(value || "");
      this.updateSearchLocation({ query, creator: "" });
    };

    this.searchInput?.addEventListener("change", event => {
      if (event?.detail?.value === undefined) {
        return;
      }
      navigateFromSearchInput(event.detail.words);
    });

    this.searchInput?.addEventListener("submit", event => {
      if (event?.detail?.value === undefined) {
        return;
      }
      navigateFromSearchInput(event.detail.value);
    });

    document.addEventListener("meme-client:navigate-search", event => {
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

  loadInitialFeed({ query = "", creator = "", filter = "", dateRange = "" } = {}) {
    const requestId = ++this.activeSearchRequest;

    this.store.set({
      activeCreator: creator,
      activeDateRange: dateRange,
      activeFeedMode: "hot",
      activeFilter: filter,
      activeQuery: query,
      hasMoreMemes: true,
      isLoadingMore: false
    });

    loadDefaultFeed({
      attachInfiniteScrollObserver: this.attachInfiniteScrollObserver,
      getTopMemes: (...args) => this.api.getTopMemes(...args),
      initialCreator: creator,
      initialDateRange: dateRange,
      initialFilter: filter,
      initialQuery: creator ? creator : query,
      initializeFeed: ({ files, initialQueryValue }) => {
        if (requestId !== this.activeSearchRequest) {
          return;
        }
        // if initialFilter is set up the feed title should reflect that
        const feedTitleElement =
          document.querySelector("feed-navbar")?.shadowRoot?.getElementById("feed-title");

        if (feedTitleElement) {
          const filterLabel = filter ? filter.charAt(0).toUpperCase() + filter.slice(1) : "Hot";
          feedTitleElement.textContent = `${filterLabel} Memes`;
        }

        this.initializeFeed({ files, initialQueryValue });
      },
      searchMemes: params => this.api.search(params),
      searchPageSize: this.searchPageSize,
      state: this.store.toLegacyState()
    });
  }

  resetRenderedFeed() {
    this.syncRenderedElements();
    Array.from(this.feed?.children || []).forEach(child => window.cleanupMemeState?.(child));
    this.feed?.replaceChildren();
  }

  initializeFeed({ files, initialQueryValue = this.initialQuery }) {
    this.syncRenderedElements();
    this.memeFeedInstance?.destroy?.();
    this.resetRenderedFeed();
    // console.log("[meme-client] Initializing feed with files", { count: files.length, initialQueryValue });
    this.memeFeedInstance = initializeMemeFeed({
      files,
      feed: this.feed,
      initialQuery: initialQueryValue,
      onRequestSearch: params => this.updateSearchLocation(params),
      onRequestMore: () => this.loadMoreMemes(),
      searchMemes: params => this.api.search(params),
      castMemeVote: (...args) => this.api.vote(...args),
      ejectMedia,
      injectMedia
    });

    if (!this.hasDispatchedReady) {
      this.hasDispatchedReady = true;
      window.dispatchEvent(new CustomEvent(CLIENT_READY_EVENT));
    }

    return this.memeFeedInstance;
  }

  getActiveFilters() {
    const params = new URLSearchParams(window.location.search);
    const creator = params.get("c") || "";
    const query = creator ? "" : params.get("q") || "";
    const filter = params.get("s") || params.get("filter") || "top";
    const dateRange = params.get("d") || "";
    return { query, creator, filter, dateRange };
  }

  updateSearchQueryParam(query) {
    this.updateSearchLocation({ query, creator: "" });
  }

  getLocationKey({ query, creator, filter, dateRange }) {
    return JSON.stringify({
      query: query || "",
      creator: creator || "",
      filter: filter || "",
      dateRange: dateRange || ""
    });
  }

  syncSearchInputValue(value) {
    if (!this.searchInput || this.searchInput.value === value) {
      return;
    }

    this.searchInput.value = value;
  }

  updateSearchLocation(nextState = {}) {
    const hasQuery = Object.prototype.hasOwnProperty.call(nextState, "query");
    const hasCreator = Object.prototype.hasOwnProperty.call(nextState, "creator");
    const hasFilter = Object.prototype.hasOwnProperty.call(nextState, "filter");
    const hasDateRange = Object.prototype.hasOwnProperty.call(nextState, "dateRange");
    const trimmedQuery = hasQuery ? String(nextState.query || "").trim() : null;
    const trimmedCreator = hasCreator ? String(nextState.creator || "").trim() : null;
    const trimmedFilter = hasFilter && typeof nextState.filter === "string"
      ? nextState.filter.trim()
      : hasFilter
        ? ""
        : null;
    const trimmedDateRange = hasDateRange && typeof nextState.dateRange === "string"
      ? nextState.dateRange.trim()
      : hasDateRange
        ? ""
        : null;
    const url = new URL(window.location.href);
    const previousSearch = url.search;

    if (hasQuery) {
      url.searchParams.delete("query");
      if (trimmedQuery) {
        url.searchParams.set("q", trimmedQuery);
      } else {
        url.searchParams.delete("q");
      }
    }

    if (hasCreator) {
      if (trimmedCreator) {
        url.searchParams.set("c", trimmedCreator);
      } else {
        url.searchParams.delete("c");
      }
    }

    if (hasFilter) {
      url.searchParams.delete("filter");
      if (trimmedFilter) {
        url.searchParams.set("s", trimmedFilter);
        const feedTitleElement =
          document.querySelector("feed-navbar")?.shadowRoot?.getElementById("feed-title");
        if (feedTitleElement) {
          const filterLabel = trimmedFilter.charAt(0).toUpperCase() + trimmedFilter.slice(1);
          feedTitleElement.textContent = `${filterLabel} Memes`;
        }
      } else {
        url.searchParams.delete("s");
      }
    }

    if (hasDateRange) {
      url.searchParams.delete("dateRange");
      if (trimmedDateRange) {
        url.searchParams.set("d", trimmedDateRange);
      } else {
        url.searchParams.delete("d");
      }
    }

    if (!hasQuery && url.searchParams.has("query") && !url.searchParams.has("q")) {
      url.searchParams.set("q", url.searchParams.get("query"));
      url.searchParams.delete("query");
    }

    if (!hasFilter && url.searchParams.has("filter") && !url.searchParams.has("s")) {
      url.searchParams.set("s", url.searchParams.get("filter"));
      url.searchParams.delete("filter");
    }

    if (!hasDateRange && url.searchParams.has("dateRange") && !url.searchParams.has("d")) {
      url.searchParams.set("d", url.searchParams.get("dateRange"));
      url.searchParams.delete("dateRange");
    }

    const nextSearch = url.search;
    if (nextSearch === previousSearch) {
      this.applySearchFromLocation();
      return;
    }

    // TODO: this should be shared data with the frontend SPA router
    let staticPages = ["/trending-tags", "/top-creators", "/contests"];

    // if the current url is any of the static pages, we do need to navigate to /hot? with the search params, otherwise the feed won't update and the url will be out of sync with the displayed content
    if (staticPages.includes(window.location.pathname)) {
      window.location.href = `/hot?${url.searchParams.toString()}`;
      return;
    }

    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
    window.dispatchEvent(new CustomEvent(SEARCH_LOCATION_CHANGE_EVENT));
  }

  async runSearch(query, filter = "", dateRange = "") {
    const requestId = ++this.activeSearchRequest;
    const activeQuery = query.trim();
    const activeFilter = filter.trim();
    const activeDateRange = dateRange.trim();
    // console.log("[meme-client] Running search with query and filter", { activeQuery, activeFilter });
    this.store.set({
      activeCreator: "",
      activeDateRange,
      activeFeedMode: "hot",
      activeFilter: activeFilter,
      activeQuery,
      hasMoreMemes: true,
      isLoadingMore: false
    });

    const files = await this.api.search({
      query: activeQuery,
      creator: "",
      filter: activeFilter,
      dateRange: activeDateRange,
      limit: this.searchPageSize,
      offset: 0
    });
    // console.log("[meme-client] Search returned files", { count: files.length, query: activeQuery, filter: activeFilter });
    // console.log(files)
    if (requestId !== this.activeSearchRequest) {
      // alert("Search results arrived out of order, discarding");
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

  async runCreatorSearch(creator, filter = "", dateRange = "") {
    const requestId = ++this.activeSearchRequest;
    const activeCreator = creator.trim();
    const activeFilter = filter.trim();
    const activeDateRange = dateRange.trim();

    this.store.set({
      activeCreator,
      activeDateRange,
      activeFeedMode: "hot",
      activeFilter: activeFilter,
      activeQuery: "",
      hasMoreMemes: true,
      isLoadingMore: false
    });

    const files = await this.api.search({
      query: "",
      creator: activeCreator,
      filter: activeFilter,
      dateRange: activeDateRange,
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
    this.syncRenderedElements();
    const filters = this.getActiveFilters();
    const locationKey = this.getLocationKey(filters);

    if (!force && locationKey === this.lastAppliedLocationKey) {
      // console.log("[meme-client] Search location unchanged, skipping apply", { filters });
      return;
    }

    this.lastAppliedLocationKey = locationKey;
    this.syncSearchInputValue(filters.creator || filters.query);
    // console.log("[meme-client] Applying search from location", { filters });
    if (filters.creator) {
      this.runCreatorSearch(filters.creator, filters.filter, filters.dateRange);
      return;
    }

    if (filters.query) {
      this.runSearch(filters.query, filters.filter, filters.dateRange);
      return;
    }

    if (filters.filter || filters.dateRange) {
      this.runSearch("", filters.filter, filters.dateRange);
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
      const { query, creator, filter, dateRange } = this.getActiveFilters();
      const currentOffset = this.store.get("searchOffset");
      console.log("[meme-client] loadMoreMemes requesting page", {
        query,
        creator,
        dateRange,
        filter,
        limit: this.searchPageSize,
        offset: currentOffset
      });

      const nextFiles = await this.api.search({
        query,
        creator,
        filter,
        dateRange,
        limit: this.searchPageSize,
        offset: currentOffset
      });

      const appendedCount = this.memeFeedInstance?.appendFiles?.(nextFiles) ?? 0;
      const nextOffset = currentOffset + appendedCount;
      console.log("[meme-client] loadMoreMemes received page", {
        requestedOffset: currentOffset,
        receivedCount: nextFiles.length,
        appendedCount,
        nextOffset
      });

      this.store.set({
        hasMoreMemes: nextFiles.length === this.searchPageSize,
        searchOffset: nextOffset
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

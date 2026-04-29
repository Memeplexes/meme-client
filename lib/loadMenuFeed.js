import { fetchMenuFeed } from "./api.js";

export async function loadMenuFeed(item, {
  apiOrigin,
  initializeFeed,
  loadDefaultFeed,
  searchInput,
  searchPageSize,
  updateSearchQueryParam,
  state
}) {
  const endpoint = item?.dataset?.navEndpoint;
  if (!endpoint) {
    await loadDefaultFeed();
    return true;
  }

  try {
    const files = await fetchMenuFeed(endpoint, apiOrigin);

    state.activeFeedMode = "custom";
    state.activeQuery = "";
    state.activeCreator = "";
    state.searchOffset = searchPageSize;
    state.hasMoreMemes = false;
    state.isLoadingMore = false;
    if (searchInput) {
      searchInput.value = "";
    }
    updateSearchQueryParam("");
    initializeFeed({ files, initialQueryValue: "" });
    return true;
  } catch (error) {
    console.error("Failed to load menu feed:", { endpoint, error });
    return false;
  }
}

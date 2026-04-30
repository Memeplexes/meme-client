import Uploads from "../api/uploads.js";

let API_URL = "http://localhost:8888/api/meme";
API_URL = "https://meme-server.cloudflare1973.workers.dev/api/meme"; // override for testing against prod server, make sure to set this in your worker's environment variables as well if you want to test admin routes

function logApiResponse(action, data) {
  console.log(`[api] ${action} response:`, data);
}

function logApiError(action, error, details) {
  console.error(`[api] ${action} failed:`, { error, ...details });
}

async function parseJsonResponse(response, action) {
  if (!response.ok) {
    throw new Error(`${action} request failed with status ${response.status}`);
  }
  return response.json();
}

async function fetchMemes(url, action) {
  try {
    const response = await fetch(url);
    const data = await parseJsonResponse(response, action);
    logApiResponse(action, data);

    if (!data?.success || !Array.isArray(data.memes)) {
      throw new Error(`${action} returned an invalid payload`);
    }

    return data.memes;
  } catch (error) {
    logApiError(action, error, { url });
    return [];
  }
}

async function fetchTags(url, action) {
  try {
    const response = await fetch(url);
    const data = await parseJsonResponse(response, action);
    logApiResponse(action, data);

    if (!data?.success || !Array.isArray(data.tags)) {
      throw new Error(`${action} returned an invalid payload`);
    }
    // remove certain keywords from tags array if they exist ( for now just
    // "the", "this", "of", "my", "is", 
    // console.log('ddd', data.tags);
    data.tags = data.tags.filter(tag => !["the", "this", "of", "my", "is", "you"].includes(tag.name.toLowerCase()));
    return data.tags;
  } catch (error) {
    logApiError(action, error, { url });
    throw error;
  }
}

async function fetchCreators(url, action) {
  try {
    const response = await fetch(url);
    const data = await parseJsonResponse(response, action);
    logApiResponse(action, data);

    if (!data?.success || !Array.isArray(data.creators)) {
      throw new Error(`${action} returned an invalid payload`);
    }

    return data.creators;
  } catch (error) {
    logApiError(action, error, { url });
    throw error;
  }
}

export function fetchMemesByCreator(creator) {
  return fetchMemes(`${API_URL}/search?c=${encodeURIComponent(creator)}`, "fetchMemesByCreator");
}

// create new function fetchMemesByTag that takes a tag name and fetches memes with that tag
export function fetchMemesByTag(tag) {
  return fetchMemes(`${API_URL}/search?tag=${encodeURIComponent(tag)}`, "fetchMemesByTag");
}

export function searchMemes({ query = "", creator = "", limit = 10, offset = 0 }) {
  // alert('searchMemes called with query: ' + query + ', creator: ' + creator + ', limit: ' + limit + ', offset: ' + offset);
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset)
  });

  if (query) {
    params.set("q", query);
  }

  if (creator) {
    params.set("c", creator);
  }

  return fetchMemes(`${API_URL}/search?${params.toString()}`, "searchMemes");
}

export function getRandomMemes() {
  return fetchMemes(`${API_URL}/random`, "getRandomMemes");
}

export function getTopMemes() {
  return fetchMemes(`${API_URL}/top`, "getTopMemes");
}

export function getTrendingTags({ limit = 10, window = "24h" } = {}) {
  return fetchTags(
    `${API_URL}/trending-tags?limit=${encodeURIComponent(limit)}&window=${encodeURIComponent(window)}`,
    "getTrendingTags"
  );
}

export function getTopCreators({ limit = 10 } = {}) {
  return fetchCreators(
    `${API_URL}/creators/top?limit=${encodeURIComponent(limit)}`,
    "getTopCreators"
  );
}

async function fetchTotal(url, action, key) {
  try {
    const response = await fetch(url);
    const data = await parseJsonResponse(response, action);
    console.log(`[api] ${action} response:`, data);
    // logApiResponse(action, data);

    const value = data?.[key] ?? data?.total ?? data?.count;

    if (!data?.success || typeof value !== "number") {
      throw new Error(`${action} returned an invalid payload`);
    }

    return value;
  } catch (error) {
    logApiError(action, error, { url });
    return null;
  }
}

export function getTotalMemes() {
  return fetchTotal(`${API_URL}/total`, "getTotalMemes", "memes");
}

export function getTotalCreators() {
  return fetchTotal(`${API_URL}/creators/total`, "getTotalCreators", "creators");
}

export function getDailyVotes() {
  return fetchTotal(`${API_URL}/votes/daily`, "getDailyVotes", "votes");
}

export function getActiveVoters() {
  return fetchTotal(`${API_URL}/voters/active`, "getActiveVoters", "active");
}

export { Uploads };

export async function fetchMenuFeed(endpoint, apiOrigin = window.location.origin) {
  const requestUrl = endpoint.startsWith("/api/")
    ? new URL(endpoint, apiOrigin)
    : new URL(endpoint, window.location.href);

  try {
    const response = await fetch(requestUrl);
    const data = await parseJsonResponse(response, "fetchMenuFeed");

    logApiResponse("fetchMenuFeed", data);

    if (Array.isArray(data?.memes)) {
      return data.memes;
    }

    if (Array.isArray(data?.tags)) {
      return data.tags;
    }

    if (Array.isArray(data?.creators)) {
      return data.creators;
    }

    throw new Error("fetchMenuFeed returned an invalid payload");
  } catch (error) {
    logApiError("fetchMenuFeed", error, { endpoint, apiOrigin });
    throw error;
  }
}

export async function castMemeVote(state, value) {
  const url = `${API_URL}/vote`;
  const payload = { hash: state?.checksum, value };

  console.log("[api] castMemeVote request:", payload);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await parseJsonResponse(response, "castMemeVote");

    logApiResponse("castMemeVote", data);

    if (!data?.success) {
      throw new Error("castMemeVote returned an unsuccessful response");
    }

    return data;
  } catch (error) {
    logApiError("castMemeVote", error, { url, payload });
    return null;
  }
}

export async function updateMeme({
  checksum,
  filename,
  title = "",
  description = "",
  tags = []
} = {}) {
  const url = `${API_URL}`;
  const payload = {
    checksum,
    filename,
    title,
    description,
    tags
  };

  console.log("[api] updateMeme request:", payload);

  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await parseJsonResponse(response, "updateMeme");

    logApiResponse("updateMeme", data);

    if (!data?.success) {
      throw new Error("updateMeme returned an unsuccessful response");
    }

    return data.meme ?? {
      checksum,
      filename,
      title,
      description,
      tags
    };
  } catch (error) {
    logApiError("updateMeme", error, { url, payload });
    throw error;
  }
}

export default {
  Uploads,
  searchMemes,
  getRandomMemes,
  getTopMemes,
  getTrendingTags,
  getTopCreators,
  getTotalMemes,
  getTotalCreators,
  getDailyVotes,
  getActiveVoters,
  castMemeVote,
  updateMeme
};

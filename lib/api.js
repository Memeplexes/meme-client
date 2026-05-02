import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';

const notyf = new Notyf({
  duration: 3000,
  position: { x: 'right', y: 'top' },
  dismissible: true
});


import Uploads from "../api/uploads.js";
import { MEME_CONFIG } from "./config.js";

let token = localStorage.getItem("access_token");
if (token) {
  console.log("Using stored access token:", token);
} else {
  console.log("No access token found in localStorage");
}

export async function getMemeByFilename(filename) {
  if (!filename) {
    throw new Error("A meme filename is required");
  }
  console.log("Fetching meme by filename:", filename);
  const url = new URL(`/api/meme/${encodeURIComponent(filename)}`, API_URL).toString();
  const data = await apiRequest(url, "getMemeByFilename");

  if (!data?.success || !data?.meme) {
    throw new Error("getMemeByFilename returned an invalid payload");
  }

  return data.meme;
}

const API_URL = MEME_CONFIG.apiUrl;

function logApiResponse(action, data) {
  console.log(`[api] ${action} response:`, data);
}

function logApiError(action, error, details) {
  console.error(`[api] ${action} failed:`, { error, ...details });
}

function getAccessToken() {
  token = localStorage.getItem("access_token");
  return token;
}

async function apiRequest(url, action, options = {}) {
  const accessToken = getAccessToken();
  const headers = new Headers(options.headers || {});

  if (accessToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    if (!response.ok) {
      throw new Error(`${action} request failed with status ${response.status}`);
    }

    const data = await response.json();
    logApiResponse(action, data);
    return data;
  } catch (error) {
    const details = { url };
    if (options.body !== undefined) {
      details.payload = options.body;
    }
    logApiError(action, error, details);
    throw error;
  }
}

export async function updateAccountAlias(alias) {
  const url = new URL("/api/account/updateAccountAlias", API_URL).toString();
  const payload = { alias };

  console.log("[api] updateAccountAlias request:", payload);

  const data = await apiRequest(url, "updateAccountAlias", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
  });

  if (!data?.success) {
    throw new Error("updateAccountAlias returned an unsuccessful response");
  }

  return data;
}

export async function fetchAccountAvatar() {
  const avatarUrl = localStorage.getItem("memeplexes-avatar-url") || "";
  return { success: true, avatarUrl };
}

export async function uploadAccountAvatar(file) {
  if (!(file instanceof File)) {
    throw new Error("A valid image file is required.");
  }

  const avatarUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(new Error("Unable to read avatar file."));
    reader.readAsDataURL(file);
  });

  if (!avatarUrl) {
    throw new Error("Unable to prepare avatar preview.");
  }

  localStorage.setItem("memeplexes-avatar-url", avatarUrl);
  return { success: true, avatarUrl };
}

// TODO: add api method for GET /api/meme/user-votes, getUserVote(), which returns the user's votes

async function getUserVotes() {
  const url = new URL("/api/meme/user-votes", API_URL).toString();

  try {
    const data = await apiRequest(url, "getUserVotes");

    if (!data?.success || !Array.isArray(data.votes)) {
      throw new Error("getUserVotes returned an invalid payload");
    }

    return data.votes;
  } catch (error) {
    logApiError("getUserVotes", error, { url });
    return [];
  }
}

async function fetchMemes(url, action) {
  try {
    const data = await apiRequest(url, action);

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
    const data = await apiRequest(url, action);

    if (!data?.success || !Array.isArray(data.tags)) {
      throw new Error(`${action} returned an invalid payload`);
    }
    data.tags = data.tags.filter(tag => !["the", "this", "of", "my", "is", "you"].includes(tag.name.toLowerCase()));
    return data.tags;
  } catch (error) {
    logApiError(action, error, { url });
    throw error;
  }
}

async function fetchCreators(url, action) {
  try {
    const data = await apiRequest(url, action);

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

export function fetchMemesByTag(tag) {
  return fetchMemes(`${API_URL}/search?tag=${encodeURIComponent(tag)}`, "fetchMemesByTag");
}

export function searchMemes({ query = "", creator = "", filter = "", limit = 10, offset = 0 }) {
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

  if (filter) {
    params.set("filter", filter);
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
    const data = await apiRequest(url, action);

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
    const data = await apiRequest(requestUrl, "fetchMenuFeed");

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
    const data = await apiRequest(url, "castMemeVote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!data?.success) {
      throw new Error("castMemeVote returned an unsuccessful response");
    }

    const username = localStorage.getItem("memeplexes-username");
    if (!username || username.toLowerCase() === "guest") {
      notyf.success("Voting as a Guest. Sign Up to track Liked Memes and Upload Memes.");
    } else {
      notyf.success('Saved successfully');
    }
    // notyf.error('Something went wrong');


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

  const data = await apiRequest(url, "updateMeme", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
  });

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
  updateAccountAlias,
  updateMeme
};

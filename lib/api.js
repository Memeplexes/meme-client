const API_URL = "http://localhost:8888/api/meme";

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

export function searchMemes({query, limit = 10, offset = 0}) {
  return fetchMemes(`${API_URL}/search?q=${encodeURIComponent(query)}&limit=${limit}&offset=${offset}`, "searchMemes");
}

export function getRandomMemes() {
  return fetchMemes(`${API_URL}/random`, "getRandomMemes");
}

export function getTopMemes() {
  return fetchMemes(`${API_URL}/top`, "getTopMemes");
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

export default {
  searchMemes,
  getRandomMemes,
  getTopMemes,
  castMemeVote
};

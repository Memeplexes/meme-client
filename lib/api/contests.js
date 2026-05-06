import { MEME_CONFIG } from "../config.js";
import { apiRequest } from "./api.js";

const CONTEST_API_URL = new URL("/api/contest", `${MEME_CONFIG.apiOrigin}/`).toString().replace(/\/$/, "");

function createContestUrl(path = "", query = {}) {
  const url = new URL(`${CONTEST_API_URL}${path}`);

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
}

function ensureContest(data, action) {
  if (!data?.success || !data?.contest) {
    throw new Error(`${action} returned an invalid payload`);
  }

  return data.contest;
}

function ensureContests(data, action) {
  if (!data?.success || !Array.isArray(data.contests)) {
    throw new Error(`${action} returned an invalid payload`);
  }

  return data.contests;
}

function ensureSubmissions(data, action) {
  if (!data?.success || !Array.isArray(data.submissions)) {
    throw new Error(`${action} returned an invalid payload`);
  }

  return data.submissions;
}

export async function createContest({
  title,
  description,
  rules = "",
  startTime,
  endTime,
  themeTags = []
} = {}) {
  const data = await apiRequest(createContestUrl(), "createContest", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title,
      description,
      rules,
      startTime,
      endTime,
      themeTags
    })
  });

  return ensureContest(data, "createContest");
}

export async function getContest(id) {
  if (!id) {
    throw new Error("A contest id is required");
  }

  const data = await apiRequest(createContestUrl("", { id }), "getContest");
  return ensureContest(data, "getContest");
}

export async function updateContest(
  id,
  {
    title,
    description,
    rules = "",
    themeTags = []
  } = {}
) {
  if (!id) {
    throw new Error("A contest id is required");
  }

  const data = await apiRequest(
    createContestUrl(`/${encodeURIComponent(id)}`),
    "updateContest",
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        rules,
        themeTags
      })
    }
  );

  return ensureContest(data, "updateContest");
}

export async function listContests({
  creator = "",
  status = "",
  limit,
  offset
} = {}) {
  const data = await apiRequest(
    createContestUrl("", { creator, status, limit, offset }),
    "listContests"
  );

  return ensureContests(data, "listContests");
}

export async function publishContest(id) {
  if (!id) {
    throw new Error("A contest id is required");
  }

  const data = await apiRequest(createContestUrl(`/${encodeURIComponent(id)}/publish`), "publishContest", {
    method: "POST",
    headers: { "Content-Type": "application/json" }
  });

  return ensureContest(data, "publishContest");
}

export async function submitContestEntry(contestId, { memeChecksum } = {}) {
  if (!contestId) {
    throw new Error("A contest id is required");
  }

  if (!memeChecksum) {
    throw new Error("A meme checksum is required");
  }

  const data = await apiRequest(
    createContestUrl(`/${encodeURIComponent(contestId)}/submissions`),
    "submitContestEntry",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memeChecksum })
    }
  );

  return ensureSubmissions(data, "submitContestEntry");
}

export async function getContestSubmissions(contestId) {
  if (!contestId) {
    throw new Error("A contest id is required");
  }

  const data = await apiRequest(
    createContestUrl(`/${encodeURIComponent(contestId)}/submissions`),
    "getContestSubmissions"
  );

  return ensureSubmissions(data, "getContestSubmissions");
}

export async function updateContestWinner(
  contestId,
  {
    submissionId,
    winner = true,
    prize = ""
  } = {}
) {
  if (!contestId) {
    throw new Error("A contest id is required");
  }

  if (!submissionId) {
    throw new Error("A submission id is required");
  }

  const data = await apiRequest(
    createContestUrl(`/${encodeURIComponent(contestId)}/winners`),
    "updateContestWinner",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ submissionId, winner, prize })
    }
  );

  return ensureSubmissions(data, "updateContestWinner");
}

export default {
  createContest,
  getContest,
  updateContest,
  listContests,
  publishContest,
  submitContestEntry,
  getContestSubmissions,
  updateContestWinner
};

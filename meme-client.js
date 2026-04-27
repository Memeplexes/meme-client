import "./lib/SearchBarTags.js";
import { createContainer } from "./lib/createContainer.js";
import { filterFiles } from "./lib/filterFiles.js";
import { ejectMedia } from "./lib/ejectMedia.js";
import { injectMedia } from "./lib/injectMedia.js";
import { initializeMemeFeed } from "./lib/initializeMemeFeed.js";
import { searchMemes, getRandomMemes, getTopMemes, castMemeVote } from "./lib/api.js";

const $feed = document.querySelector("#feed");
const floatingOctocat = document.querySelector("#floating-octocat");
const initialQuery = new URLSearchParams(window.location.search).get("q") || "";
const GITHUB_URL = "https://github.com/buddypond/meme-client";

const focusSearchInput = () => document.querySelector("#search-input")?.focus();
const openGitHubRepo = () => window.open(GITHUB_URL, "_blank", "noopener,noreferrer");

if (floatingOctocat) {
  floatingOctocat.classList.add("is-interactive");
  floatingOctocat.addEventListener("mouseenter", () => {
    floatingOctocat.classList.add("is-hovered");
  });
  floatingOctocat.addEventListener("mouseleave", () => {
    floatingOctocat.classList.remove("is-hovered");
  });
  floatingOctocat.addEventListener("click", openGitHubRepo);
  floatingOctocat.addEventListener("keydown", event => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openGitHubRepo();
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", focusSearchInput, { once: true });
} else {
  focusSearchInput();
}

let searchInput = document.querySelector("search-bar-tags#search-input");
searchInput?.setAttribute("initial-query", initialQuery);
console.log('Search input element:', searchInput);

Promise.all([
  searchMemes({ query: initialQuery, limit: 100, offset: 0 }),
  getTopMemes()
  //getRandomMemes()
])
  .then(([files, memes]) => {
    const votesByHash = new Map(memes.map(({ hash, votes }) => [hash, votes]));

    files.sort((a, b) => {
      const aVotes = votesByHash.get(a.checksum ?? a.filename);
      const bVotes = votesByHash.get(b.checksum ?? b.filename);

      if (aVotes === undefined) return bVotes === undefined ? 0 : 1;
      if (bVotes === undefined) return -1;
      return bVotes - aVotes;
    });

    // this will randomize the order of memes with the same vote count to make it more interesting for users and prevent the same memes from always being in the same order, we can optimize this later if needed but it should be fine for now since we don't have that many memes
    for (let start = 0; start < files.length;) {
      const voteCount = votesByHash.get(files[start].checksum ?? files[start].filename);
      let end = start + 1;

      while (end < files.length && votesByHash.get(files[end].checksum ?? files[end].filename) === voteCount) {
        end += 1;
      }

      for (let i = end - 1; i > start; i -= 1) {
        const j = start + Math.floor(Math.random() * (i - start + 1));
        const temp = files[i];
        files[i] = files[j];
        files[j] = temp;
      }

      start = end;
    }

    initializeMemeFeed({
      files,
      feed: $feed,
      initialQuery,
      searchMemes,
      castMemeVote,
      createContainer,
      filterFiles,
      ejectMedia,
      injectMedia
    });
  });

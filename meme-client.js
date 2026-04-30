import "./lib/web-components/SearchBarTags.js";
import "./lib/web-components/CreatorCard.js";
import "./lib/web-components/MemeCard.js";
import "./lib/web-components/FloatingOctocat.js";
import { MemeClient } from "./MemeClient.js";

const memeClient = new MemeClient({
  feed: document.querySelector("#feed"),
  sideMenu: document.querySelector("#side-menu"),
  searchInput: document.querySelector("page-topbar")?.searchInput,
  floatingOctocat: document.querySelector("floating-octocat")
});

memeClient.init();

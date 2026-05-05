import "./lib/web-components/SearchBarTags.js";
import "./lib/web-components/CreatorCard.js";
import "./lib/web-components/MemeCard.js";
import "./lib/web-components/FloatingOctocat.js";
import { MemeClient } from "./MemeClient.js";

const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get("token");
const accountName = urlParams.get("accountName");
let me = null;
let access_token = null;
if (accountName) {
  localStorage.setItem("memeplexes-username", accountName);
  me = accountName;
}
if (token) {
  localStorage.setItem("access_token", token);
  access_token = token;
  console.log("Logged in with token:", token);

  //alert("Login successful! You can now close this window.");
  // hard-reload the page to trigger layout.js?
  // without this reload, we end up getting in a "guest" state
  // window.location.href = "/dashboard";
  // goto("/dashboard"); // Remark: does not properly load account session
}

// check to see if the incoming url started with /auth/callback, if so we wish to reload the root page to trigger the new authenticated state in the client
if (window.location.pathname.startsWith("/auth/callback")) {
  window.location.href = "/";
}

const memeClient = new MemeClient({
  feed: document.querySelector("#feed"),
  sideMenu: document.querySelector("#side-menu"),
  searchInput: document.querySelector("page-topbar")?.searchInput,
  floatingOctocat: document.querySelector("floating-octocat")
});

memeClient.init();

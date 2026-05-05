import { getTopMemes } from "../../api/api.js";

function avatarUrlFromCreator(creator) {
  const explicitAvatar = creator.avatarUrl
    ?? creator.avatar_url
    ?? creator.profileImage
    ?? creator.profile_image;

  if (explicitAvatar) {
    return explicitAvatar;
  }

  const seed = String(
    creator.email
    ?? creator.emailAddress
    ?? creator.username
    ?? creator.handle
    ?? creator.name
    ?? ""
  ).trim().toLowerCase();

  if (!seed) {
    return "";
  }

  return `https://www.gravatar.com/avatar/${encodeURIComponent(seed)}?d=identicon&s=96`;
}

function initialsFromName(name) {
  return String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part.charAt(0).toUpperCase())
    .join("") || "?";
}

function profileHref(username) {
  const url = new URL(window.location.href);
  url.searchParams.set("c", username);
  return `/${url.search}${url.hash}`;
}

function normalizeCreator(meme) {
  const username = String(
    meme?.creator
    ?? meme?.username
    ?? meme?.handle
    ?? meme?.uploader
    ?? meme?.uploadedBy
    ?? ""
  ).trim();

  if (!username) {
    return null;
  }

  return {
    username,
    avatarUrl: meme?.avatarUrl ?? meme?.avatar_url ?? meme?.profileImage ?? meme?.profile_image ?? "",
    email: meme?.email ?? meme?.emailAddress ?? ""
  };
}

class TopCreators extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    if (this.shadowRoot.children.length === 0) {
      this.render("Loading top creators...");
      this.load();
    }
  }

  async load() {
    try {
      const memes = await getTopMemes();
      const limit = Number(this.getAttribute("limit")) || 8;
      const creators = this.buildTopCreators(memes).slice(0, limit);

      if (!creators.length) {
        this.render("No top creators yet.");
        return;
      }

      this.renderList(creators);
    } catch (error) {
      console.error("[top-creators] failed to load creators", error);
      this.render("Unable to load top creators right now.");
    }
  }

  buildTopCreators(memes) {
    const creatorsByName = new Map();

    for (const meme of Array.isArray(memes) ? memes : []) {
      const creator = normalizeCreator(meme);
      if (!creator) {
        continue;
      }

      const key = creator.username.toLowerCase();
      const current = creatorsByName.get(key) ?? {
        username: creator.username,
        avatarUrl: creator.avatarUrl,
        email: creator.email,
        count: 0
      };

      current.count += 1;

      if (!current.avatarUrl && creator.avatarUrl) {
        current.avatarUrl = creator.avatarUrl;
      }

      if (!current.email && creator.email) {
        current.email = creator.email;
      }

      creatorsByName.set(key, current);
    }

    return Array.from(creatorsByName.values()).sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count;
      }

      return a.username.localeCompare(b.username);
    });
  }

  render(message) {
    const title = this.getAttribute("title") || "Top creators";

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          color: inherit;
          font-family: inherit;
        }

        .card {
          display: grid;
          gap: 12px;
          padding: 16px;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        h2 {
          margin: 0;
          font-size: 14px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        p {
          margin: 0;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.72);
        }

        ul {
          list-style: none;
          margin: 0;
          padding: 0;
          display: grid;
          gap: 10px;
        }

        a {
          display: flex;
          align-items: center;
          gap: 10px;
          color: inherit;
          text-decoration: none;
        }

        a:hover .name {
          color: #7ee787;
        }

        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 999px;
          overflow: hidden;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex: 0 0 40px;
          background: rgba(255, 255, 255, 0.12);
          color: white;
          font-size: 14px;
          font-weight: 700;
        }

        .avatar img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
        }

        .meta {
          min-width: 0;
          display: grid;
          gap: 2px;
        }

        .name,
        .count {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .name {
          font-size: 14px;
          font-weight: 600;
        }

        .count {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.64);
        }
      </style>
      <section class="card">
        <h2>${title}</h2>
        <p>${message}</p>
      </section>
    `;
  }

  renderList(creators) {
    const title = this.getAttribute("title") || "Top creators";

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          color: inherit;
          font-family: inherit;
        }

        .card {
          display: grid;
          gap: 12px;
          padding: 16px;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        h2 {
          margin: 0;
          font-size: 14px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        ul {
          list-style: none;
          margin: 0;
          padding: 0;
          display: grid;
          gap: 10px;
        }

        a {
          display: flex;
          align-items: center;
          gap: 10px;
          color: inherit;
          text-decoration: none;
        }

        a:hover .name {
          color: #7ee787;
        }

        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 999px;
          overflow: hidden;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex: 0 0 40px;
          background: rgba(255, 255, 255, 0.12);
          color: white;
          font-size: 14px;
          font-weight: 700;
        }

        .avatar img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
        }

        .meta {
          min-width: 0;
          display: grid;
          gap: 2px;
        }

        .name,
        .count {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .name {
          font-size: 14px;
          font-weight: 600;
        }

        .count {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.64);
        }
      </style>
      <section class="card">
        <h2>${title}</h2>
        <ul></ul>
      </section>
    `;

    const list = this.shadowRoot.querySelector("ul");

    for (const creator of creators) {
      const item = document.createElement("li");
      const link = document.createElement("a");
      const avatar = document.createElement("span");
      const meta = document.createElement("span");
      const name = document.createElement("span");
      const count = document.createElement("span");

      link.href = profileHref(creator.username);

      avatar.className = "avatar";
      const src = avatarUrlFromCreator(creator);
      if (src) {
        const image = document.createElement("img");
        image.src = src;
        image.alt = `${creator.username} profile picture`;
        image.addEventListener("error", () => {
          avatar.replaceChildren(initialsFromName(creator.username));
        }, { once: true });
        avatar.appendChild(image);
      } else {
        avatar.textContent = initialsFromName(creator.username);
      }

      meta.className = "meta";
      name.className = "name";
      count.className = "count";
      name.textContent = creator.username;
      count.textContent = `${creator.count} top meme${creator.count === 1 ? "" : "s"}`;

      meta.append(name, count);
      link.append(avatar, meta);
      item.appendChild(link);
      list.appendChild(item);
    }
  }
}

if (!customElements.get("top-creators")) {
  customElements.define("top-creators", TopCreators);
}

function hashCreatorSeed(seed) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
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

function creatorAvatarUrl(creator) {
  const explicitAvatar = creator.avatarUrl ?? creator.avatar_url ?? creator.profileImage ?? creator.profile_image;
  if (explicitAvatar) return explicitAvatar;

  const rawSeed = creator.email ?? creator.emailAddress ?? creator.username ?? creator.handle ?? creator.name ?? "";
  const seed = String(rawSeed).trim().toLowerCase();
  if (!seed) return "";

  return `https://www.gravatar.com/avatar/${encodeURIComponent(seed)}?d=robohash&s=80`;
}

class CreatorCard extends HTMLElement {
  constructor() {
    super();
    this._cleanup = [];
  }

  disconnectedCallback() {
    for (const cleanup of this._cleanup.splice(0)) {
      cleanup();
    }
  }

  setup(creator) {
    const name = creator?.name ?? "Unknown author";
    const avatarUrl = creatorAvatarUrl(creator ?? {});
    const initials = initialsFromName(name);
    const accentHue = hashCreatorSeed(String(name)) % 360;

    this.replaceChildren();
    Object.assign(this.style, {
      display: "inline-flex",
      alignItems: "center",
      minWidth: "0"
    });

    const button = document.createElement("button");
    button.type = "button";
    Object.assign(button.style, {
      display: "inline-flex",
      alignItems: "baseline",
      gap: "8px",
      minWidth: "0",
      padding: "0",
      border: "0",
      background: "transparent",
      color: "inherit",
      cursor: "pointer",
      textAlign: "left"
    });

    const avatar = document.createElement("span");
    Object.assign(avatar.style, {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: "24px",
      height: "24px",
      flex: "0 0 24px",
      borderRadius: "999px",
      overflow: "hidden",
      background: `hsl(${accentHue} 48% 38%)`,
      color: "#fff",
      fontSize: "10px",
      fontWeight: "700"
    });

    if (avatarUrl) {
      const image = document.createElement("img");
      image.src = avatarUrl;
      image.alt = `${name} avatar`;
      Object.assign(image.style, {
        width: "100%",
        height: "100%",
        display: "block",
        objectFit: "cover"
      });
      image.addEventListener("error", () => {
        avatar.replaceChildren();
        avatar.textContent = initials;
      }, { once: true });
      avatar.appendChild(image);
    } else {
      avatar.textContent = initials;
    }

    const label = document.createElement("span");
    label.textContent = name;
    Object.assign(label.style, {
      minWidth: "0",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis"
    });

    button.appendChild(avatar);
    button.appendChild(label);

    const onClick = event => {
      event.stopPropagation();
      this.dispatchEvent(new CustomEvent("creator-card:filter", {
        bubbles: true,
        composed: true,
        detail: { author: name, creator: name }
      }));
    };

    button.addEventListener("click", onClick);
    this._cleanup.push(() => button.removeEventListener("click", onClick));

    this.appendChild(button);
    return this;
  }
}

if (!customElements.get("creator-card")) {
  customElements.define("creator-card", CreatorCard);
}

const MEME_CARD_TAGS_STYLE_ID = "meme-card-tags-styles";

function ensureMemeCardTagsStyles() {
  if (document.getElementById(MEME_CARD_TAGS_STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = MEME_CARD_TAGS_STYLE_ID;
  style.textContent = `
    .meme-card-tags-row {
      display: flex;
      flex-wrap: nowrap;
      gap: 0;
      overflow-x: auto;
      scrollbar-width: none;
      margin-left: -4px;
    }

    .meme-card-tag {
      border: none;
      background: none;
      color: var(--theme-text-primary);
      cursor: pointer;
      line-height: 1.2;
      flex: 0 0 auto;
    }

    .meme-card-tag:hover {
      color: var(--theme-accent);
      text-decoration: none;
    }

    .meme-card-tag-initial {
      font-size: 14px;
      align-items: flex-start;
    }

    .meme-card-tag-rendered {
      border-radius: 999px;
      font-size: 12px;
    }
  `;

  document.head.appendChild(style);
}

export function createMemeCardTags({ tags, searchInput, requestSearch, cleanup = [] }) {
  ensureMemeCardTagsStyles();

  const tagsRow = document.createElement("div");
  tagsRow.className = "meme-card-tags-row";

  const bindTag = (tagButton, tag) => {
    const onTagClick = () => {
      const currentTags = searchInput.value.trim().split(/\s+/).filter(Boolean);
      if (!currentTags.includes(tag)) currentTags.push(tag);
      requestSearch?.({ query: currentTags.join(" ") });
    };

    tagButton.addEventListener("click", onTagClick);
    cleanup.push(() => tagButton.removeEventListener("click", onTagClick));
  };

  const renderInitialTags = nextTags => {
    for (const tag of nextTags) {
      const tagButton = document.createElement("button");
      tagButton.type = "button";
      tagButton.className = "meme-card-tag meme-card-tag-initial";
      tagButton.textContent = "#" + tag;

      bindTag(tagButton, tag);
      tagsRow.appendChild(tagButton);
    }
  };

  const renderTags = nextTags => {
    tagsRow.replaceChildren();
    for (const tag of Array.isArray(nextTags) ? nextTags : []) {
      const tagButton = document.createElement("button");
      tagButton.type = "button";
      tagButton.className = "meme-card-tag meme-card-tag-rendered";

      tagButton.textContent = "#" + tag;

      bindTag(tagButton, tag);
      tagsRow.appendChild(tagButton);
    }
  };

  renderInitialTags(Array.isArray(tags) ? tags : []);

  return { tagsRow, renderTags };
}

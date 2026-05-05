export function createMemeCardTags({ tags, searchInput, requestSearch, cleanup = [] }) {
  const tagsRow = document.createElement("div");
  Object.assign(tagsRow.style, {
    display: "flex",
    flexWrap: "nowrap",
    gap: "0px",
    overflowX: "auto",
    scrollbarWidth: "none",
    marginLeft: "-4px"
  });

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
      tagButton.textContent = "#" + tag;
      Object.assign(tagButton.style, {
        border: "none",
        background: "none",
        color: "var(--theme-text-primary)",
        cursor: "pointer",
        fontSize: "14px",
        lineHeight: "1.2",
        flex: "0 0 auto",
        alignItems: "flex-start"
      });

      const onTagMouseEnter = () => {
        tagButton.style.color = "var(--theme-accent)";
      };
      const onTagMouseLeave = () => {
        tagButton.style.color = "var(--theme-text-primary)";
        tagButton.style.textDecoration = "none";
      };

      tagButton.addEventListener("mouseenter", onTagMouseEnter);
      tagButton.addEventListener("mouseleave", onTagMouseLeave);
      cleanup.push(() => tagButton.removeEventListener("mouseenter", onTagMouseEnter));
      cleanup.push(() => tagButton.removeEventListener("mouseleave", onTagMouseLeave));

      bindTag(tagButton, tag);
      tagsRow.appendChild(tagButton);
    }
  };

  const renderTags = nextTags => {
    tagsRow.replaceChildren();
    for (const tag of Array.isArray(nextTags) ? nextTags : []) {
      const tagButton = document.createElement("button");
      tagButton.type = "button";
      tagButton.textContent = "#" + tag;
      Object.assign(tagButton.style, {
        border: "1px solid var(--theme-border-medium-strong)",
        borderRadius: "999px",
        background: "var(--theme-surface-glass)",
        color: "var(--theme-text-primary)",
        cursor: "pointer",
        fontSize: "12px",
        lineHeight: "1.2",
        flex: "0 0 auto"
      });

      bindTag(tagButton, tag);
      tagsRow.appendChild(tagButton);
    }
  };

  renderInitialTags(Array.isArray(tags) ? tags : []);

  return { tagsRow, renderTags };
}

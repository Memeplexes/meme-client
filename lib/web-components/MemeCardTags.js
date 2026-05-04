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
        color: "white",
        cursor: "pointer",
        fontSize: "14px",
        lineHeight: "1.2",
        flex: "0 0 auto",
        alignItems: "flex-start"
      });

      const onTagMouseEnter = () => {
        tagButton.style.color = "#1eab55";
      };
      const onTagMouseLeave = () => {
        tagButton.style.color = "white";
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
        border: "1px solid rgba(255, 255, 255, 0.16)",
        borderRadius: "999px",
        background: "rgba(255, 255, 255, 0.06)",
        color: "white",
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

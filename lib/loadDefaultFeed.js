export const loadDefaultFeed = ({
  attachInfiniteScrollObserver,
  getTopMemes,
  initialCreator,
  initialQuery,
  initializeFeed,
  searchMemes,
  searchPageSize,
  state
}) => Promise.all([
  searchMemes({
    query: state.activeCreator ? "" : initialQuery,
    creator: state.activeCreator,
    limit: searchPageSize,
    offset: 0
  }),
  getTopMemes()
  //getRandomMemes()
])
  .then(([files, memes]) => {
    console.log("Initial search results:", files);
    console.log("Top memes:", memes);
    const votesByHash = new Map(memes.map(({ hash, votes }) => [hash, votes]));

    state.activeFeedMode = "hot";
    state.activeQuery = initialQuery;
    state.activeCreator = initialCreator;
    state.searchOffset = searchPageSize;
    state.isLoadingMore = false;

    files.sort((a, b) => {
      const aVotes = votesByHash.get(a.checksum ?? a.filename);
      const bVotes = votesByHash.get(b.checksum ?? b.filename);

      if (aVotes === undefined) return bVotes === undefined ? 0 : 1;
      if (bVotes === undefined) return -1;
      return bVotes - aVotes;
    });

    // Randomize equal-vote groups so the feed order is less repetitive.
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

    state.hasMoreMemes = files.length === searchPageSize;
    state.defaultHotFiles = [...files];
    console.log("Sorted and randomized search results:", files);
    initializeFeed({ files });
    attachInfiniteScrollObserver();
  });

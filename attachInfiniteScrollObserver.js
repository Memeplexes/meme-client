export const createAttachInfiniteScrollObserver = ({
  getObserver,
  loadMoreMemes,
  setObserver
}) => {
  const attachInfiniteScrollObserver = () => {
    const sentinel = document.querySelector("#infinite-scroll-sentinel");
    if (!sentinel) {
      requestAnimationFrame(attachInfiniteScrollObserver);
      return;
    }

    getObserver()?.disconnect();

    const observer = new IntersectionObserver(entries => {
      if (entries[0]?.isIntersecting) {
        loadMoreMemes();
      }
    }, {
      rootMargin: "1000px 0px 1200px 0px",
      threshold: 0
    });

    setObserver(observer);
    observer.observe(sentinel);
  };

  return attachInfiniteScrollObserver;
};

export function resetTouchGesture(modal) {
  modal._touchTracking = false;
  modal._touchStartX = 0;
  modal._touchStartY = 0;
}

export function handleTouchStart(modal, event, { isOpen }) {
  if (!isOpen() || event.touches.length !== 1) {
    resetTouchGesture(modal);
    return;
  }

  const touch = event.touches[0];
  modal._touchStartX = touch.clientX;
  modal._touchStartY = touch.clientY;
  modal._touchTracking = true;
}

export function handleTouchEnd(modal, event, { close, navigateMeme }) {
  if (!modal._touchTracking || event.changedTouches.length !== 1) {
    resetTouchGesture(modal);
    return;
  }

  const touch = event.changedTouches[0];
  const deltaX = touch.clientX - modal._touchStartX;
  const deltaY = touch.clientY - modal._touchStartY;
  const absX = Math.abs(deltaX);
  const absY = Math.abs(deltaY);
  // Require a minimum swipe distance so taps and slight drags do not trigger actions.
  const threshold = 60;

  resetTouchGesture(modal);

  // Treat the gesture as vertical only when Y movement is stronger than X movement.
  if (absY >= threshold && absY > absX) {
    // if this is a swipe up (negative deltaY), close the modal; if it's a swipe down, do nothing.
    if (deltaY > 0) {
      close();
    }
    return;
  }

  if (absX < threshold || absX <= absY) {
    return;
  }
  // Negative deltaX means the finger moved left, so advance forward; positive means go back.
  navigateMeme(deltaX < 0 ? -1 : 1);
}

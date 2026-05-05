const AXIS_LOCK_THRESHOLD = 8;
const SWIPE_DISTANCE_THRESHOLD = 72;
const SWIPE_VELOCITY_THRESHOLD = 0.45;
const WHEEL_DISTANCE_THRESHOLD = 88;
const WHEEL_VELOCITY_THRESHOLD = 0.55;
const WHEEL_GESTURE_GAP_MS = 180;
const WHEEL_RESET_DELAY_MS = 140;
const CLICK_GESTURE_GAP_MS = 450;


function canElementScrollInDirection(element, direction) {
  if (!(element instanceof HTMLElement)) return false;

  const style = window.getComputedStyle(element);
  if (!/(auto|scroll|overlay)/.test(style.overflowY)) return false;

  const maxScrollTop = element.scrollHeight - element.clientHeight;
  if (maxScrollTop <= 0) return false;

  if (direction > 0) {
    return element.scrollTop < maxScrollTop;
  }

  return element.scrollTop > 0;
}

function shouldIgnoreWheelGesture(modal, event) {
  const path = event.composedPath?.() || [];

  for (const node of path) {
    if (node === modal) return false;
    if (!(node instanceof HTMLElement)) continue;
    if (canElementScrollInDirection(node, event.deltaY > 0 ? 1 : -1)) {
      return true;
    }
  }

  return false;
}

function getGestureTarget(modal) {
  return modal._mediaContent?.firstElementChild || modal._mediaContent || modal._mediaFrame || null;
}

function setTouchFeedback(modal, offsetY, { immediate = false } = {}) {
  const target = getGestureTarget(modal);
  if (!target) return;
  target.style.transition = immediate ? "none" : "transform 180ms ease-out";
  target.style.transform = offsetY ? `translateY(${Math.round(offsetY)}px)` : "";
}

function resetTouchFeedback(modal) {
  const target = getGestureTarget(modal);
  if (!target) return;
  target.style.transition = "transform 180ms ease-out";
  target.style.transform = "";
}

function getResistedOffset(deltaY, canNavigate) {
  if (canNavigate) return deltaY * 0.35;
  return Math.sign(deltaY) * Math.pow(Math.abs(deltaY), 0.82) * 0.22;
}

function clearPointerGesture(modal) {
  modal._touchTracking = false;
  modal._touchStartX = 0;
  modal._touchStartY = 0;
  modal._touchStartTime = 0;
  modal._touchAxis = "";
  modal._activePointerId = null;
}

function clearRecentGesture(modal) {
  modal._lastGestureDeltaX = 0;
  modal._lastGestureDeltaY = 0;
  modal._lastGestureTime = 0;
}

function clearWheelGesture(modal) {
  modal._wheelDeltaY = 0;
  modal._wheelStartTime = 0;
  modal._wheelLastTime = 0;
  modal._wheelLocked = false;
  if (modal._wheelResetTimer) {
    clearTimeout(modal._wheelResetTimer);
    modal._wheelResetTimer = null;
  }
}

function scheduleWheelReset(modal) {
  if (modal._wheelResetTimer) {
    clearTimeout(modal._wheelResetTimer);
  }
  modal._wheelResetTimer = setTimeout(() => {
    clearWheelGesture(modal);
    resetTouchFeedback(modal);
  }, WHEEL_RESET_DELAY_MS);
}

function beginGesture(modal, x, y) {
  clearRecentGesture(modal);
  modal._touchStartX = x;
  modal._touchStartY = y;
  modal._touchStartTime = performance.now();
  modal._touchAxis = "";
  modal._touchTracking = true;
  setTouchFeedback(modal, 0, { immediate: true });
}

function updateGesture(modal, x, y, { canNavigate }) {
  if (!modal._touchTracking) return;

  const deltaX = x - modal._touchStartX;
  const deltaY = y - modal._touchStartY;
  const absX = Math.abs(deltaX);
  const absY = Math.abs(deltaY);

  if (!modal._touchAxis) {
    if (absX < AXIS_LOCK_THRESHOLD && absY < AXIS_LOCK_THRESHOLD) return;
    modal._touchAxis = absY > absX ? "y" : "x";
  }

  if (modal._touchAxis !== "y") return;

  const direction = deltaY > 0 ? 1 : -1;
  setTouchFeedback(modal, getResistedOffset(deltaY, canNavigate(direction)), { immediate: true });
}

function endGesture(modal, x, y, { navigateMeme, canNavigate }) {
  if (!modal._touchTracking) {
    resetTouchGesture(modal);
    return;
  }

  const deltaX = x - modal._touchStartX;
  const deltaY = y - modal._touchStartY;
  const absX = Math.abs(deltaX);
  const absY = Math.abs(deltaY);
  const elapsed = Math.max(performance.now() - modal._touchStartTime, 1);
  const velocityY = absY / elapsed;
  const direction = deltaY > 0 ? 1 : -1;
  const canMove = canNavigate(direction);
  modal._lastGestureDeltaX = deltaX;
  modal._lastGestureDeltaY = deltaY;
  modal._lastGestureTime = performance.now();
  const shouldNavigate = modal._touchAxis === "y"
    && absY > absX
    && absY >= SWIPE_DISTANCE_THRESHOLD
    && velocityY >= SWIPE_VELOCITY_THRESHOLD
    && canMove;

  if (shouldNavigate) {
    clearRecentGesture(modal);
    setTouchFeedback(modal, Math.sign(deltaY) * 28);
    clearPointerGesture(modal);
    navigateMeme(direction);
    return;
  }

  resetTouchGesture(modal);
}

export function resetTouchGesture(modal) {
  clearPointerGesture(modal);
  clearWheelGesture(modal);
  resetTouchFeedback(modal);
}

export function handleTouchStart(modal, event, { isOpen }) {
  if (!isOpen() || event.touches.length !== 1) {
    resetTouchGesture(modal);
    return;
  }

  const touch = event.touches[0];
  beginGesture(modal, touch.clientX, touch.clientY);
}

export function handleTouchMove(modal, event, { canNavigate }) {
  if (event.touches.length !== 1) return;
  const touch = event.touches[0];
  updateGesture(modal, touch.clientX, touch.clientY, { canNavigate });
}

export function handleTouchEnd(modal, event, { navigateMeme, canNavigate }) {
  if (event.changedTouches.length !== 1) {
    resetTouchGesture(modal);
    return;
  }

  const touch = event.changedTouches[0];
  endGesture(modal, touch.clientX, touch.clientY, { navigateMeme, canNavigate });
}

export function handleMediaClick(modal, event, { navigateMeme, canNavigate }) {
  const media = modal._mediaContent?.firstElementChild;
  if (!media || media.tagName === "VIDEO" || event.target !== media) return;
  alert('hi')
  const elapsed = performance.now() - (modal._lastGestureTime || 0);
  const deltaX = modal._lastGestureDeltaX || 0;
  const deltaY = modal._lastGestureDeltaY || 0;
  const absX = Math.abs(deltaX);
  const absY = Math.abs(deltaY);
  const direction = deltaY > 0 ? 1 : -1;

  if (
    elapsed > CLICK_GESTURE_GAP_MS
    || absY <= absX
    || absY < SWIPE_DISTANCE_THRESHOLD
    || !canNavigate(direction)
  ) {
    return;
  }

  clearRecentGesture(modal);
  event.preventDefault();
  navigateMeme(direction);
}

export function handlePointerDown(modal, event, { isOpen }) {
  if (!isOpen() || event.pointerType === "touch" || event.button !== 0) {
    return;
  }

  modal._activePointerId = event.pointerId;
  event.currentTarget?.setPointerCapture?.(event.pointerId);
  beginGesture(modal, event.clientX, event.clientY);
}

export function handlePointerMove(modal, event, { canNavigate }) {
  if (event.pointerType === "touch" || event.pointerId !== modal._activePointerId) {
    return;
  }

  updateGesture(modal, event.clientX, event.clientY, { canNavigate });
}

export function handlePointerUp(modal, event, { navigateMeme, canNavigate }) {
  if (event.pointerType === "touch" || event.pointerId !== modal._activePointerId) {
    return;
  }

  event.currentTarget?.releasePointerCapture?.(event.pointerId);
  endGesture(modal, event.clientX, event.clientY, { navigateMeme, canNavigate });
}

export function handlePointerCancel(modal, event) {
  if (event.pointerType === "touch" || event.pointerId !== modal._activePointerId) {
    return;
  }

  event.currentTarget?.releasePointerCapture?.(event.pointerId);
  resetTouchGesture(modal);
}

export function handleWheelGesture(modal, event, { isOpen, navigateMeme, canNavigate }) {
  if (!isOpen()) return;
  if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
  if (shouldIgnoreWheelGesture(modal, event)) return;

  const now = performance.now();
  if (!modal._wheelStartTime || now - modal._wheelLastTime > WHEEL_GESTURE_GAP_MS) {
    clearWheelGesture(modal);
    modal._wheelStartTime = now;
  }

  if (modal._wheelLocked) {
    modal._wheelLastTime = now;
    event.preventDefault();
    scheduleWheelReset(modal);
    return;
  }

  modal._wheelLastTime = now;
  modal._wheelDeltaY += event.deltaY;

  const direction = modal._wheelDeltaY > 0 ? 1 : -1;
  const canMove = canNavigate(direction);
  setTouchFeedback(modal, getResistedOffset(modal._wheelDeltaY, canMove), { immediate: true });

  const elapsed = Math.max(now - modal._wheelStartTime, 1);
  const velocityY = Math.abs(modal._wheelDeltaY) / elapsed;
  const shouldNavigate = Math.abs(modal._wheelDeltaY) >= WHEEL_DISTANCE_THRESHOLD
    && velocityY >= WHEEL_VELOCITY_THRESHOLD
    && canMove;

  if (shouldNavigate) {
    event.preventDefault();
    setTouchFeedback(modal, Math.sign(modal._wheelDeltaY) * 28);
    modal._wheelLocked = true;
    modal._wheelDeltaY = 0;
    modal._wheelStartTime = now;
    modal._wheelLastTime = now;
    scheduleWheelReset(modal);
    navigateMeme(direction);
    return;
  }

  if (!canMove || Math.abs(modal._wheelDeltaY) >= 16) {
    event.preventDefault();
  }

  scheduleWheelReset(modal);
}

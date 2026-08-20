const STORAGE_KEY_PREFIX = 'appliedPrize:';

export function saveAppliedPrize(promotionId, prize) {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(`${STORAGE_KEY_PREFIX}${promotionId}`, JSON.stringify(prize));
}

export function loadAppliedPrize(promotionId) {
  if (typeof localStorage === 'undefined') return null;
  const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${promotionId}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearAppliedPrize(promotionId) {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(`${STORAGE_KEY_PREFIX}${promotionId}`);
}

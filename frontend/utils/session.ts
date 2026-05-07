const SESSION_KEY = 'catalog_session_id';
const COMPARE_KEY = 'catalog_compare_ids';

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = generateUUID();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function getCompareIds(): number[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(COMPARE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function addToCompare(productId: number): boolean {
  const ids = getCompareIds();
  if (ids.includes(productId)) return false;
  if (ids.length >= 4) return false;
  ids.push(productId);
  localStorage.setItem(COMPARE_KEY, JSON.stringify(ids));
  window.dispatchEvent(new CustomEvent('compareUpdated'));
  return true;
}

export function removeFromCompare(productId: number): void {
  const ids = getCompareIds().filter((id) => id !== productId);
  localStorage.setItem(COMPARE_KEY, JSON.stringify(ids));
  window.dispatchEvent(new CustomEvent('compareUpdated'));
}

export function isInCompare(productId: number): boolean {
  return getCompareIds().includes(productId);
}

export function clearCompare(): void {
  localStorage.setItem(COMPARE_KEY, '[]');
  window.dispatchEvent(new CustomEvent('compareUpdated'));
}

export function dispatchCartUpdate(): void {
  window.dispatchEvent(new CustomEvent('cartUpdated'));
}

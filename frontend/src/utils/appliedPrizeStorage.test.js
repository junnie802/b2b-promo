import { describe, it, expect, afterEach, vi } from 'vitest';
import { saveAppliedPrize, loadAppliedPrize, clearAppliedPrize } from './appliedPrizeStorage.js';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('appliedPrizeStorage', () => {
  it('localStorage가 없는 환경(node)에서도 saveAppliedPrize는 에러 없이 동작한다', () => {
    expect(typeof globalThis.localStorage).toBe('undefined');

    expect(() => saveAppliedPrize(5, { prizeName: '경품A' })).not.toThrow();
  });

  it('localStorage가 없는 환경(node)에서 loadAppliedPrize는 null을 반환한다', () => {
    expect(typeof globalThis.localStorage).toBe('undefined');

    expect(loadAppliedPrize(5)).toBeNull();
  });

  describe('localStorage가 있는 환경', () => {
    function stubLocalStorage() {
      const store = new Map();
      const fakeLocalStorage = {
        getItem: vi.fn((key) => (store.has(key) ? store.get(key) : null)),
        setItem: vi.fn((key, value) => {
          store.set(key, value);
        }),
      };
      vi.stubGlobal('localStorage', fakeLocalStorage);
      return fakeLocalStorage;
    }

    it('saveAppliedPrize로 저장한 값을 loadAppliedPrize가 그대로 반환한다', () => {
      stubLocalStorage();

      saveAppliedPrize(5, { prizeName: '경품A' });

      expect(loadAppliedPrize(5)).toEqual({ prizeName: '경품A' });
    });

    it('저장된 적 없는 promotionId는 null을 반환한다', () => {
      stubLocalStorage();

      expect(loadAppliedPrize(999)).toBeNull();
    });

    it('손상된 JSON 값이 저장되어 있으면 에러 없이 null을 반환한다', () => {
      const fakeLocalStorage = stubLocalStorage();
      fakeLocalStorage.getItem.mockReturnValue('{invalid');

      expect(() => loadAppliedPrize(5)).not.toThrow();
      expect(loadAppliedPrize(5)).toBeNull();
    });

    it('clearAppliedPrize(5) 호출 시 removeItem이 해당 키로 호출된다', () => {
      const fakeLocalStorage = stubLocalStorage();
      fakeLocalStorage.removeItem = vi.fn();

      clearAppliedPrize(5);

      expect(fakeLocalStorage.removeItem).toHaveBeenCalledWith('appliedPrize:5');
    });
  });

  it('localStorage가 없는 환경(node)에서 clearAppliedPrize는 에러 없이 동작한다', () => {
    expect(typeof globalThis.localStorage).toBe('undefined');

    expect(() => clearAppliedPrize(5)).not.toThrow();
  });
});

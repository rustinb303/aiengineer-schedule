import { renderHook, act } from '@testing-library/react';
import { useBookmarksAndStars } from '../useBookmarksAndStars';
import { BookmarkData, StarredData } from '../../utils/localStorage'; // Assuming this is where BOOKMARKS_KEY is defined or used

// Define keys directly in test for clarity with mock
const BOOKMARKS_KEY = 'conference-bookmarks';
const STARRED_KEY = 'conference-starred';

// Mock localStorage
let store: { [key: string]: string } = {};
const mockLocalStorage = {
  getItem: (key: string): string | null => store[key] || null,
  setItem: (key: string, value: string): void => {
    store[key] = value.toString();
  },
  removeItem: (key: string): void => {
    delete store[key];
  },
  clear: (): void => {
    store = {};
  },
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true, // Important for clearing and re-assigning in tests if needed
});

// Helper to get bookmarks directly from mock localStorage for verification
const getStoredBookmarks = (): BookmarkData[] => {
  const stored = store[BOOKMARKS_KEY];
  return stored ? JSON.parse(stored) : [];
};

const getStoredStarred = (): StarredData[] => {
  const stored = store[STARRED_KEY];
  return stored ? JSON.parse(stored) : [];
}

describe('useBookmarksAndStars', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    // If you were spying on localStorageUtils methods, clear spies here:
    // jest.clearAllMocks();
  });

  it('should initialize with no bookmarks or stars if localStorage is empty', () => {
    const { result } = renderHook(() => useBookmarksAndStars());
    expect(result.current.bookmarks).toEqual([]);
    expect(result.current.starred).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it('should load initial bookmarks and stars from localStorage', () => {
    const initialBookmarks: BookmarkData[] = [
      { sessionId: 's1', timestamp: Date.now() },
      { sessionId: 's2', timestamp: Date.now() },
    ];
    const initialStarred: StarredData[] = [
      { sessionId: 's3', timestamp: Date.now() },
    ]
    mockLocalStorage.setItem(BOOKMARKS_KEY, JSON.stringify(initialBookmarks));
    mockLocalStorage.setItem(STARRED_KEY, JSON.stringify(initialStarred));

    const { result } = renderHook(() => useBookmarksAndStars());

    expect(result.current.loading).toBe(false);
    expect(result.current.bookmarks).toEqual(['s1', 's2']);
    expect(result.current.starred).toEqual(['s3']);
  });

  describe('Bookmarks', () => {
    it('should add a bookmark and update localStorage', async () => {
      const { result } = renderHook(() => useBookmarksAndStars());

      await act(async () => {
        result.current.addBookmark('s1');
      });

      expect(result.current.bookmarks).toEqual(['s1']);
      expect(result.current.isBookmarked('s1')).toBe(true);
      const stored = getStoredBookmarks();
      expect(stored.some(b => b.sessionId === 's1')).toBe(true);
    });

    it('should not add a duplicate bookmark to state or localStorage', async () => {
      const { result } = renderHook(() => useBookmarksAndStars());

      await act(async () => { result.current.addBookmark('s1'); });
      await act(async () => { result.current.addBookmark('s1'); }); // Try adding again

      expect(result.current.bookmarks).toEqual(['s1']);
      const stored = getStoredBookmarks();
      expect(stored.filter(b => b.sessionId === 's1').length).toBe(1);
    });

    it('should remove a bookmark and update localStorage', async () => {
      const { result } = renderHook(() => useBookmarksAndStars());
      await act(async () => { result.current.addBookmark('s1'); }); // Add first

      await act(async () => { result.current.removeBookmark('s1'); }); // Then remove

      expect(result.current.bookmarks).toEqual([]);
      expect(result.current.isBookmarked('s1')).toBe(false);
      const stored = getStoredBookmarks();
      expect(stored.some(b => b.sessionId === 's1')).toBe(false);
    });

    it('isBookmarked should return false for a non-existent bookmark', () => {
      const { result } = renderHook(() => useBookmarksAndStars());
      expect(result.current.isBookmarked('s_nonexistent')).toBe(false);
    });
  });

  describe('Stars', () => {
    it('should add a starred session and update localStorage', async () => {
      const { result } = renderHook(() => useBookmarksAndStars());
      await act(async () => {
        result.current.addStarred('star1');
      });
      expect(result.current.starred).toEqual(['star1']);
      expect(result.current.isStarred('star1')).toBe(true);
      const stored = getStoredStarred();
      expect(stored.some(s => s.sessionId === 'star1')).toBe(true); // Added assertion
    });

    it('should not add a duplicate starred session to state or localStorage', async () => {
      const { result } = renderHook(() => useBookmarksAndStars());

      await act(async () => { result.current.addStarred('star1'); });
      await act(async () => { result.current.addStarred('star1'); }); // Try adding again

      expect(result.current.starred).toEqual(['star1']);
      const stored = getStoredStarred();
      expect(stored.filter(s => s.sessionId === 'star1').length).toBe(1);
    });

    it('should remove a starred session and update localStorage', async () => {
      const { result } = renderHook(() => useBookmarksAndStars());
      await act(async () => { result.current.addStarred('star1'); });
      await act(async () => { result.current.removeStarred('star1'); });
      expect(result.current.starred).toEqual([]);
      expect(result.current.isStarred('star1')).toBe(false);
      const stored = getStoredStarred();
      expect(stored.some(s => s.sessionId === 'star1')).toBe(false);
    });

    it('isStarred should return false for a non-existent starred session', () => {
      const { result } = renderHook(() => useBookmarksAndStars());
      expect(result.current.isStarred('s_nonexistent_star')).toBe(false);
    });
  });

  it('refresh function should reload data from localStorage', async () => {
    const { result } = renderHook(() => useBookmarksAndStars());
    expect(result.current.bookmarks).toEqual([]);
    expect(result.current.starred).toEqual([]);

    // Simulate external change to localStorage
    const externalBookmarks: BookmarkData[] = [{ sessionId: 's_ext_bookmark', timestamp: Date.now() }];
    const externalStarred: StarredData[] = [{ sessionId: 's_ext_star', timestamp: Date.now() }];
    mockLocalStorage.setItem(BOOKMARKS_KEY, JSON.stringify(externalBookmarks));
    mockLocalStorage.setItem(STARRED_KEY, JSON.stringify(externalStarred));

    await act(async () => {
      result.current.refresh();
    });

    expect(result.current.bookmarks).toEqual(['s_ext_bookmark']);
    expect(result.current.starred).toEqual(['s_ext_star']);
  });
});

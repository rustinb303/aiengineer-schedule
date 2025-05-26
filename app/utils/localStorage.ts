export interface BookmarkData {
  sessionId: string;
  timestamp: number;
}

export interface StarredData {
  sessionId: string;
  timestamp: number;
}

const BOOKMARKS_KEY = 'conference-bookmarks';
const STARRED_KEY = 'conference-starred';

export const localStorageUtils = {
  // Bookmarks
  getBookmarks: (): BookmarkData[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(BOOKMARKS_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  addBookmark: (sessionId: string): void => {
    const bookmarks = localStorageUtils.getBookmarks();
    if (!bookmarks.some(b => b.sessionId === sessionId)) {
      bookmarks.push({ sessionId, timestamp: Date.now() });
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
    }
  },

  removeBookmark: (sessionId: string): void => {
    const bookmarks = localStorageUtils.getBookmarks();
    const filtered = bookmarks.filter(b => b.sessionId !== sessionId);
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(filtered));
  },

  isBookmarked: (sessionId: string): boolean => {
    const bookmarks = localStorageUtils.getBookmarks();
    return bookmarks.some(b => b.sessionId === sessionId);
  },

  // Starred
  getStarred: (): StarredData[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STARRED_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  addStarred: (sessionId: string): void => {
    const starred = localStorageUtils.getStarred();
    if (!starred.some(s => s.sessionId === sessionId)) {
      starred.push({ sessionId, timestamp: Date.now() });
      localStorage.setItem(STARRED_KEY, JSON.stringify(starred));
    }
  },

  removeStarred: (sessionId: string): void => {
    const starred = localStorageUtils.getStarred();
    const filtered = starred.filter(s => s.sessionId !== sessionId);
    localStorage.setItem(STARRED_KEY, JSON.stringify(filtered));
  },

  isStarred: (sessionId: string): boolean => {
    const starred = localStorageUtils.getStarred();
    return starred.some(s => s.sessionId === sessionId);
  },

  // Clear all data
  clearAll: (): void => {
    localStorage.removeItem(BOOKMARKS_KEY);
    localStorage.removeItem(STARRED_KEY);
  }
};
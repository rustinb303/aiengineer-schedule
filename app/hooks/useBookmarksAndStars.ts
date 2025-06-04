'use client';

import { useState, useEffect, useCallback } from 'react';
import { localStorageUtils } from '@/app/utils/localStorage';

export function useBookmarksAndStars() {
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [starred, setStarred] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Load bookmarks and stars
  const loadData = useCallback(() => {
    setLoading(true);
    setBookmarks(localStorageUtils.getBookmarks().map(b => b.sessionId));
    setStarred(localStorageUtils.getStarred().map(s => s.sessionId));
    setLoading(false);
  }, [setBookmarks, setStarred, setLoading]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Bookmark operations
  const addBookmark = useCallback(async (sessionId: string, sessionTitle?: string) => {
    setBookmarks(prev => [...prev, sessionId]);
    localStorageUtils.addBookmark(sessionId);
  }, [setBookmarks]);

  const removeBookmark = useCallback(async (sessionId: string) => {
    setBookmarks(prev => prev.filter(id => id !== sessionId));
    localStorageUtils.removeBookmark(sessionId);
  }, [setBookmarks]);

  const isBookmarked = useCallback((sessionId: string) => {
    return bookmarks.includes(sessionId);
  }, [bookmarks]);

  // Star operations
  const addStarred = useCallback(async (sessionId: string, sessionTitle?: string) => {
    setStarred(prev => [...prev, sessionId]);
    localStorageUtils.addStarred(sessionId);
  }, [setStarred]);

  const removeStarred = useCallback(async (sessionId: string) => {
    setStarred(prev => prev.filter(id => id !== sessionId));
    localStorageUtils.removeStarred(sessionId);
  }, [setStarred]);

  const isStarred = useCallback((sessionId: string) => {
    return starred.includes(sessionId);
  }, [starred]);

  return {
    bookmarks,
    starred,
    loading,
    addBookmark,
    removeBookmark,
    isBookmarked,
    addStarred,
    removeStarred,
    isStarred,
    refresh: loadData
  };
}
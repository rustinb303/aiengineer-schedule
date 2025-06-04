'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useFirebaseAuth } from '@/app/contexts/FirebaseAuthContext';
import { firestoreService } from '@/app/services/firestoreService';
import { localStorageUtils } from '@/app/utils/localStorage';
import { useUser } from '@clerk/nextjs';

const SYNC_FLAG_KEY = 'aiengineer_initial_sync_completed';

export function useBookmarksAndStars() {
  const { firebaseUser, loading: firebaseLoading } = useFirebaseAuth();
  const { user } = useUser();
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [starred, setStarred] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const previousUserIdRef = useRef<string | null>(null);

  // Load bookmarks and stars
  const loadData = useCallback(async () => {
    if (firebaseUser && user) {
      try {
        // Ensure user profile exists
        await firestoreService.ensureUserProfile(firebaseUser.uid, user.emailAddresses[0]?.emailAddress);
        
        // Check if this is a new login (user ID changed)
        const isNewLogin = previousUserIdRef.current !== firebaseUser.uid;
        previousUserIdRef.current = firebaseUser.uid;
        
        // Check if initial sync has been completed for this user
        const syncFlagKey = `${SYNC_FLAG_KEY}_${firebaseUser.uid}`;
        const hasCompletedInitialSync = localStorage.getItem(syncFlagKey) === 'true';
        
        const [firestoreBookmarks, firestoreStarred] = await Promise.all([
          firestoreService.getBookmarks(firebaseUser.uid),
          firestoreService.getStarred(firebaseUser.uid)
        ]);
        
        // Only merge localStorage data on first login or if switching users
        if (isNewLogin && !hasCompletedInitialSync) {
          // Get data from localStorage for merging
          const localBookmarks = localStorageUtils.getBookmarks();
          const localStarred = localStorageUtils.getStarred();
          
          // Create sets for efficient merging
          const bookmarkSet = new Set(firestoreBookmarks.map(b => b.sessionId));
          const starredSet = new Set(firestoreStarred.map(s => s.sessionId));
          
          // Merge localStorage data into Firestore (only add, don't remove)
          const bookmarksToAdd = localBookmarks.filter(b => !bookmarkSet.has(b.sessionId));
          const starredToAdd = localStarred.filter(s => !starredSet.has(s.sessionId));
          
          // Add missing localStorage items to Firestore
          const syncPromises: Promise<void>[] = [];
          
          bookmarksToAdd.forEach(bookmark => {
            bookmarkSet.add(bookmark.sessionId);
            syncPromises.push(
              firestoreService.addBookmark(firebaseUser.uid, bookmark.sessionId)
                .catch(err => console.error('Error syncing bookmark to Firestore:', err))
            );
          });
          
          starredToAdd.forEach(star => {
            starredSet.add(star.sessionId);
            syncPromises.push(
              firestoreService.addStarred(firebaseUser.uid, star.sessionId)
                .catch(err => console.error('Error syncing star to Firestore:', err))
            );
          });
          
          // Wait for all sync operations to complete
          await Promise.all(syncPromises);
          
          // Mark initial sync as completed
          localStorage.setItem(syncFlagKey, 'true');
          
          // Update state with merged data
          const mergedBookmarks = Array.from(bookmarkSet);
          const mergedStarred = Array.from(starredSet);
          
          setBookmarks(mergedBookmarks);
          setStarred(mergedStarred);
          
          // Update localStorage with the merged data
          localStorageUtils.clearAll();
          mergedBookmarks.forEach(id => localStorageUtils.addBookmark(id));
          mergedStarred.forEach(id => localStorageUtils.addStarred(id));
        } else {
          // Not first login, just use Firestore data
          const firestoreBookmarkIds = firestoreBookmarks.map(b => b.sessionId);
          const firestoreStarredIds = firestoreStarred.map(s => s.sessionId);
          
          setBookmarks(firestoreBookmarkIds);
          setStarred(firestoreStarredIds);
          
          // Update localStorage to match Firestore (Firestore is source of truth)
          localStorageUtils.clearAll();
          firestoreBookmarkIds.forEach(id => localStorageUtils.addBookmark(id));
          firestoreStarredIds.forEach(id => localStorageUtils.addStarred(id));
        }
        
      } catch (error) {
        console.error('Error loading from Firestore:', error);
        // Fall back to localStorage
        setBookmarks(localStorageUtils.getBookmarks().map(b => b.sessionId));
        setStarred(localStorageUtils.getStarred().map(s => s.sessionId));
      }
    } else {
      // Not authenticated, use localStorage only
      setBookmarks(localStorageUtils.getBookmarks().map(b => b.sessionId));
      setStarred(localStorageUtils.getStarred().map(s => s.sessionId));
    }
    setLoading(false);
  }, [firebaseUser, user]);

  useEffect(() => {
    if (!firebaseLoading) {
      loadData();
    }
  }, [firebaseLoading, loadData]);

  // Bookmark operations
  const addBookmark = useCallback(async (sessionId: string, sessionTitle?: string) => {
    // Update local state immediately
    setBookmarks(prev => [...prev, sessionId]);
    localStorageUtils.addBookmark(sessionId);

    // Sync to Firestore if authenticated
    if (firebaseUser) {
      try {
        await firestoreService.addBookmark(firebaseUser.uid, sessionId, sessionTitle);
      } catch (error) {
        console.error('Error syncing bookmark to Firestore:', error);
        // Revert on error
        setBookmarks(prev => prev.filter(id => id !== sessionId));
        localStorageUtils.removeBookmark(sessionId);
      }
    }
  }, [firebaseUser]);

  const removeBookmark = useCallback(async (sessionId: string) => {
    // Update local state immediately
    setBookmarks(prev => prev.filter(id => id !== sessionId));
    localStorageUtils.removeBookmark(sessionId);

    // Sync to Firestore if authenticated
    if (firebaseUser) {
      try {
        await firestoreService.removeBookmark(firebaseUser.uid, sessionId);
      } catch (error) {
        console.error('Error removing bookmark from Firestore:', error);
        // Revert on error
        setBookmarks(prev => [...prev, sessionId]);
        localStorageUtils.addBookmark(sessionId);
      }
    }
  }, [firebaseUser]);

  const isBookmarked = useCallback((sessionId: string) => {
    return bookmarks.includes(sessionId);
  }, [bookmarks]);

  // Star operations
  const addStarred = useCallback(async (sessionId: string, sessionTitle?: string) => {
    // Update local state immediately
    setStarred(prev => [...prev, sessionId]);
    localStorageUtils.addStarred(sessionId);

    // Sync to Firestore if authenticated
    if (firebaseUser) {
      try {
        await firestoreService.addStarred(firebaseUser.uid, sessionId, sessionTitle);
      } catch (error) {
        console.error('Error syncing star to Firestore:', error);
        // Revert on error
        setStarred(prev => prev.filter(id => id !== sessionId));
        localStorageUtils.removeStarred(sessionId);
      }
    }
  }, [firebaseUser]);

  const removeStarred = useCallback(async (sessionId: string) => {
    // Update local state immediately
    setStarred(prev => prev.filter(id => id !== sessionId));
    localStorageUtils.removeStarred(sessionId);

    // Sync to Firestore if authenticated
    if (firebaseUser) {
      try {
        await firestoreService.removeStarred(firebaseUser.uid, sessionId);
      } catch (error) {
        console.error('Error removing star from Firestore:', error);
        // Revert on error
        setStarred(prev => [...prev, sessionId]);
        localStorageUtils.addStarred(sessionId);
      }
    }
  }, [firebaseUser]);

  const isStarred = useCallback((sessionId: string) => {
    return starred.includes(sessionId);
  }, [starred]);

  return {
    bookmarks,
    starred,
    loading,
    isAuthenticated: !!firebaseUser,
    addBookmark,
    removeBookmark,
    isBookmarked,
    addStarred,
    removeStarred,
    isStarred,
    refresh: loadData
  };
}
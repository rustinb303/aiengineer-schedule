import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/firebaseConfig";

export interface BookmarkData {
  sessionId: string;
  sessionTitle?: string;
  timestamp: Timestamp;
}

export interface StarredData {
  sessionId: string;
  sessionTitle?: string;
  timestamp: Timestamp;
}

export const firestoreService = {
  // Bookmarks
  async getBookmarks(userId: string): Promise<BookmarkData[]> {
    try {
      const bookmarksRef = collection(db, "users", userId, "bookmarks");
      const snapshot = await getDocs(query(bookmarksRef));

      return snapshot.docs.map(
        (doc) =>
          ({
            sessionId: doc.id,
            ...doc.data(),
          } as BookmarkData)
      );
    } catch (error) {
      console.error("Error getting bookmarks:", error);
      return [];
    }
  },

  async addBookmark(
    userId: string,
    sessionId: string,
    sessionTitle?: string
  ): Promise<void> {
    try {
      const bookmarkRef = doc(db, "users", userId, "bookmarks", sessionId);
      await setDoc(bookmarkRef, {
        sessionId,
        sessionTitle: sessionTitle || "",
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error adding bookmark:", error);
      throw error;
    }
  },

  async removeBookmark(userId: string, sessionId: string): Promise<void> {
    try {
      const bookmarkRef = doc(db, "users", userId, "bookmarks", sessionId);
      await deleteDoc(bookmarkRef);
    } catch (error) {
      console.error("Error removing bookmark:", error);
      throw error;
    }
  },

  async isBookmarked(userId: string, sessionId: string): Promise<boolean> {
    const bookmarks = await this.getBookmarks(userId);
    return bookmarks.some((b) => b.sessionId === sessionId);
  },

  // Starred
  async getStarred(userId: string): Promise<StarredData[]> {
    try {
      const starredRef = collection(db, "users", userId, "starred");
      const snapshot = await getDocs(query(starredRef));

      return snapshot.docs.map(
        (doc) =>
          ({
            sessionId: doc.id,
            ...doc.data(),
          } as StarredData)
      );
    } catch (error) {
      console.error("Error getting starred:", error);
      return [];
    }
  },

  async addStarred(
    userId: string,
    sessionId: string,
    sessionTitle?: string
  ): Promise<void> {
    try {
      const starredRef = doc(db, "users", userId, "starred", sessionId);
      await setDoc(starredRef, {
        sessionId,
        sessionTitle: sessionTitle || "",
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error adding starred:", error);
      throw error;
    }
  },

  async removeStarred(userId: string, sessionId: string): Promise<void> {
    try {
      const starredRef = doc(db, "users", userId, "starred", sessionId);
      await deleteDoc(starredRef);
    } catch (error) {
      console.error("Error removing starred:", error);
      throw error;
    }
  },

  async isStarred(userId: string, sessionId: string): Promise<boolean> {
    const starred = await this.getStarred(userId);
    return starred.some((s) => s.sessionId === sessionId);
  },

  // Create user profile if it doesn't exist
  async ensureUserProfile(userId: string, email?: string): Promise<void> {
    try {
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);

      // Only create the document if it doesn't exist
      if (!userDoc.exists()) {
        await setDoc(userRef, {
          email: email || "",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error("Error creating user profile:", error);
    }
  },
};

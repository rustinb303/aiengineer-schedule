'use client';

import { createContext, useContext } from 'react';
import { useBookmarksAndStars } from '@/app/hooks/useBookmarksAndStars';

interface BookmarksAndStarsContextType {
  bookmarks: string[];
  starred: string[];
  loading: boolean;
  addBookmark: (sessionId: string, sessionTitle?: string) => Promise<void>;
  removeBookmark: (sessionId: string) => Promise<void>;
  isBookmarked: (sessionId: string) => boolean;
  addStarred: (sessionId: string, sessionTitle?: string) => Promise<void>;
  removeStarred: (sessionId: string) => Promise<void>;
  isStarred: (sessionId: string) => boolean;
  refresh: () => void;
}

const BookmarksAndStarsContext = createContext<BookmarksAndStarsContextType | null>(null);

export const useBookmarksAndStarsContext = () => {
  const context = useContext(BookmarksAndStarsContext);
  if (!context) {
    throw new Error('useBookmarksAndStarsContext must be used within BookmarksAndStarsProvider');
  }
  return context;
};

export function BookmarksAndStarsProvider({ children }: { children: React.ReactNode }) {
  const bookmarksAndStars = useBookmarksAndStars();

  return (
    <BookmarksAndStarsContext.Provider value={bookmarksAndStars}>
      {children}
    </BookmarksAndStarsContext.Provider>
  );
}
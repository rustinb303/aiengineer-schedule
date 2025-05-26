'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth as useClerkAuth } from '@clerk/nextjs';
import { signInWithCustomToken, onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/firebaseConfig';

interface FirebaseAuthContextType {
  firebaseUser: User | null;
  loading: boolean;
  error: string | null;
}

const FirebaseAuthContext = createContext<FirebaseAuthContextType>({
  firebaseUser: null,
  loading: true,
  error: null,
});

export const useFirebaseAuth = () => {
  const context = useContext(FirebaseAuthContext);
  if (!context) {
    throw new Error('useFirebaseAuth must be used within FirebaseAuthProvider');
  }
  return context;
};

export function FirebaseAuthProvider({ children }: { children: React.ReactNode }) {
  const { getToken, userId } = useClerkAuth();
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe: () => void;

    const signInToFirebase = async () => {
      try {
        if (!userId) {
          setFirebaseUser(null);
          setLoading(false);
          return;
        }

        // Get the Firebase token from Clerk using the integration
        const token = await getToken({ template: 'integration_firebase' });
        
        if (!token) {
          throw new Error('Failed to get Firebase token from Clerk. Make sure Firebase integration is enabled in Clerk Dashboard.');
        }

        // Sign into Firebase with the Clerk token
        await signInWithCustomToken(auth, token);
        
        // Listen to Firebase auth state changes
        unsubscribe = onAuthStateChanged(auth, (user) => {
          setFirebaseUser(user);
          setLoading(false);
        });
      } catch (err) {
        console.error('Firebase auth error:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
        setLoading(false);
      }
    };

    signInToFirebase();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [getToken, userId]);

  return (
    <FirebaseAuthContext.Provider value={{ firebaseUser, loading, error }}>
      {children}
    </FirebaseAuthContext.Provider>
  );
}
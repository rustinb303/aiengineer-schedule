# Firebase & Clerk Setup Guide

## Overview
This app uses Clerk for authentication and Firebase Firestore for storing user bookmarks and stars.

## Firestore Collection Structure
```
users/{userId}/
  ├── profile (document)
  │   └── fields: email, createdAt, updatedAt
  │
  ├── bookmarks/{sessionId} (subcollection)
  │   └── fields: sessionId, sessionTitle, timestamp
  │
  └── starred/{sessionId} (subcollection)
      └── fields: sessionId, sessionTitle, timestamp
```

## Setup Steps

### 1. Clerk Configuration
1. In Clerk Dashboard, go to **Integrations** page
2. Toggle the **Firebase** integration ON
3. Configure it using either:
   - **Automatic** (Recommended): Upload Firebase service account key
   - **Manual**: Enter service account details
4. Add your Clerk API keys to `.env.local`:
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
```

### 2. Firebase Configuration
1. The Firebase config is already in `firebaseConfig.ts`
2. Deploy Firestore rules: `firebase deploy --only firestore:rules`
3. Make sure the `users` collection exists in Firestore

### 3. How It Works
- **Without authentication**: Bookmarks/stars are stored in localStorage only
- **When signing in**: 
  - Existing localStorage bookmarks/stars are merged with Firestore data
  - No data is lost - we only add missing items from localStorage to Firestore
  - Perfect for users who started using the app before signing in
- **While authenticated**: 
  - Data syncs to Firestore automatically
  - localStorage is used as a cache for offline access
  - Data persists across devices

## Features
- ✅ Automatic sync between localStorage and Firestore
- ✅ Works offline with localStorage fallback
- ✅ User data isolation (users can only access their own data)
- ✅ Real-time updates across tabs/windows
- ✅ Graceful degradation when not authenticated
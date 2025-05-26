"use client";

import { useState, useEffect, useMemo } from "react";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import SessionCard from "./components/SessionCard";
import CalendarView from "./components/CalendarView";
import SpeakersView from "./components/SpeakersView";
import SessionDetailModal from "./components/SessionDetailModal";
import FilterBar from "./components/FilterBar";
import { ScheduleData, SessionMoreInfo, Session } from "./types/schedule";
import { useBookmarksAndStarsContext } from "./contexts/BookmarksAndStarsContext";
import { getSessionDay } from "./utils/dateTime";
import scheduleData from "../schedule.json";
import scheduleMoreInfo from "../schedule-more-info.json";
import { SpeakerIcon, TalkIcon } from "./utils/svgs";

export default function Home() {
  const [data, setData] = useState<ScheduleData>({
    sessions: [],
    speakers: [],
    rooms: [],
    questions: [],
    categories: [],
  });
  const [mainView, setMainView] = useState<"speakers" | "talks">("talks");
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedTrack, setSelectedTrack] = useState("");
  const [showBookmarked, setShowBookmarked] = useState(false);
  const [showStarred, setShowStarred] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    bookmarks: bookmarkedIds,
    starred: starredIds,
    addBookmark,
    removeBookmark,
    isBookmarked,
    addStarred,
    removeStarred,
    isStarred,
    loading: bookmarksLoading,
    isAuthenticated,
  } = useBookmarksAndStarsContext();

  useEffect(() => {
    // Merge schedule data with additional info
    const moreInfoMap = new Map<string, SessionMoreInfo>();
    (scheduleMoreInfo as SessionMoreInfo[]).forEach((info) => {
      moreInfoMap.set(info["Session ID"], info);
    });

    const mergedSessions = (scheduleData as ScheduleData).sessions.map(
      (session) => {
        const moreInfo = moreInfoMap.get(session.id);
        if (moreInfo) {
          return {
            ...session,
            level: moreInfo.Level || undefined,
            scope: moreInfo.Scope || undefined,
            assignedTrack: moreInfo["Assigned Track"] || undefined,
            companies: moreInfo.Companies || undefined,
          };
        }
        return session;
      }
    );

    setData({
      ...(scheduleData as ScheduleData),
      sessions: mergedSessions,
    });
  }, []);

  // Get unique tracks from sessions
  const availableTracks = useMemo(() => {
    const tracks = new Set<string>();
    data.sessions.forEach((session) => {
      if (session.assignedTrack && session.assignedTrack.trim()) {
        tracks.add(session.assignedTrack);
      }
    });
    return Array.from(tracks).sort();
  }, [data.sessions]);

  const filteredSessions = useMemo(() => {
    let filtered = data.sessions;

    // Filter by day
    if (selectedDay !== 0) {
      filtered = filtered.filter(
        (session) => getSessionDay(session.startsAt) === selectedDay
      );
    }

    // Filter by track
    if (selectedTrack) {
      filtered = filtered.filter(
        (session) => session.assignedTrack === selectedTrack
      );
    }

    // Filter by bookmarked/starred
    if (showBookmarked) {
      filtered = filtered.filter((session) =>
        bookmarkedIds.includes(session.id)
      );
    }

    if (showStarred) {
      filtered = filtered.filter((session) => starredIds.includes(session.id));
    }

    // Sort by start time
    return filtered.sort(
      (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
    );
  }, [
    data.sessions,
    selectedDay,
    selectedTrack,
    showBookmarked,
    showStarred,
    bookmarkedIds,
    starredIds,
  ]);

  const handleSessionClick = (session: Session) => {
    setSelectedSession(session);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSession(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-dark-bg border-b border-gray-200 dark:border-dark-border shadow-subtle dark:shadow-dark-subtle">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          {/* Top Header Row - Repeated for maximum customizability */}
          <div className="py-4 lg:py-6">
            {/* Mobile View */}
            <div className="sm:hidden">
              <SignedIn>
                {/* Mobile Signed In: Title left, UserButton right */}
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary">
                      AI Engineer World's Fair 2025
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-dark-text-secondary">
                      June 3-5, 2025 • San Francisco •{" "}
                      <a
                        href="https://x.com/pallavmac"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 dark:text-blue-400 hover:underline"
                      >
                        👨‍💻 @pallavmac
                      </a>
                    </p>
                  </div>
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox: "w-8 h-8", // Mobile specific size
                      },
                    }}
                  />
                </div>
              </SignedIn>
              <SignedOut>
                {/* Mobile Signed Out: Title top, Buttons bottom */}
                <div className="flex flex-col">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">
                      AI Engineer World's Fair 2025
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-dark-text-secondary">
                      June 3-5, 2025 • San Francisco •{" "}
                      <a
                        href="https://x.com/pallavmac"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 dark:text-blue-400 hover:underline"
                      >
                        👨‍💻 @pallavmac
                      </a>
                    </p>
                  </div>
                  <div className="mt-3">
                    <div className="flex flex-row items-center gap-2">
                      <div className="flex gap-2">
                        <SignInButton mode="modal">
                          <button className="px-4 py-1.5 text-sm bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200 rounded-lg border border-gray-900 dark:border-gray-100 transition-all duration-200 shadow-subtle hover:shadow-card">
                            Sign In
                          </button>
                        </SignInButton>
                        <SignUpButton mode="modal">
                          <button className="px-4 py-1.5 text-sm bg-gray-100 dark:bg-dark-hover text-gray-900 dark:text-dark-text-primary hover:bg-gray-200 dark:hover:bg-dark-border rounded-lg border border-gray-200 dark:border-dark-border transition-all duration-200 shadow-subtle hover:shadow-card">
                            Sign Up
                          </button>
                        </SignUpButton>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-dark-text-muted">
                        (To sync data)
                      </p>
                    </div>
                  </div>
                </div>
              </SignedOut>
            </div>

            {/* Desktop View (sm and larger) - Replicates original layout */}
            <div className="hidden sm:flex sm:items-center sm:justify-between gap-3">
              {/* Title Block (Left) */}
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-dark-text-primary">
                  AI Engineer World's Fair 2025 Schedule
                </h1>
                <p className="mt-1 text-base text-gray-600 dark:text-dark-text-secondary">
                  June 3-5, 2025 • San Francisco •{" "}
                  <a
                    href="https://x.com/pallavmac"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 dark:text-blue-400 hover:underline"
                  >
                    👨‍💻 @pallavmac
                  </a>
                </p>
              </div>
              {/* Auth Block (Right) */}
              <div className="flex items-center">
                <SignedOut>
                  <div className="flex flex-row sm:flex-col gap-2 sm:gap-1 items-center">
                    <div className="flex gap-2">
                      <SignInButton mode="modal">
                        <button className="px-3 py-1.5 sm:px-6 sm:py-2 text-sm bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200 rounded-lg border border-gray-900 dark:border-gray-100 transition-all duration-200 shadow-subtle hover:shadow-card">
                          Sign In
                        </button>
                      </SignInButton>
                      <SignUpButton mode="modal">
                        <button className="px-3 py-1.5 sm:px-6 sm:py-2 text-sm bg-gray-100 dark:bg-dark-hover text-gray-900 dark:text-dark-text-primary hover:bg-gray-200 dark:hover:bg-dark-border rounded-lg border border-gray-200 dark:border-dark-border transition-all duration-200 shadow-subtle hover:shadow-card">
                          Sign Up
                        </button>
                      </SignUpButton>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-dark-text-muted">
                      To sync data
                    </p>
                  </div>
                </SignedOut>
                <SignedIn>
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox: "w-8 h-8 sm:w-9 sm:h-9", // Original responsive sizes
                      },
                    }}
                  />
                </SignedIn>
              </div>
            </div>
          </div>

          {/* Navigation Row */}
          <div className="border-t border-gray-100 dark:border-dark-border">
            <div className="py-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-4">
                <div className="flex items-center gap-4">
                  {/* Main View Toggle */}
                  <div className="flex gap-1 bg-gray-100 dark:bg-dark-hover rounded-lg p-1 shadow-subtle dark:shadow-dark-subtle">
                    <button
                      onClick={() => setMainView("talks")}
                      className={`flex-1 sm:flex-initial px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center justify-center sm:justify-start gap-1.5 ${
                        mainView === "talks"
                          ? "bg-white dark:bg-dark-option text-gray-900 dark:text-dark-text-primary shadow-card dark:shadow-dark-card"
                          : "text-gray-600 dark:text-dark-text-secondary hover:text-gray-900 dark:hover:text-dark-text-primary"
                      }`}
                    >
                      <TalkIcon />
                      Talks
                    </button>
                    <button
                      onClick={() => setMainView("speakers")}
                      className={`flex-1 sm:flex-initial px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center justify-center sm:justify-start gap-1.5 ${
                        mainView === "speakers"
                          ? "bg-white dark:bg-dark-option text-gray-900 dark:text-dark-text-primary shadow-card dark:shadow-dark-card"
                          : "text-gray-600 dark:text-dark-text-secondary hover:text-gray-900 dark:hover:text-dark-text-primary"
                      }`}
                    >
                      <SpeakerIcon />
                      Speakers
                    </button>
                  </div>

                  <div className="w-px h-8 bg-gray-200 dark:bg-dark-border" />

                  {/* Track Filter */}
                  <div className="relative">
                    <select
                      value={selectedTrack}
                      onChange={(e) => setSelectedTrack(e.target.value)}
                      className="h-9 sm:h-auto w-full px-3 sm:px-4 py-1.5 sm:py-2 pr-8 text-sm bg-white dark:bg-dark-card text-gray-900 dark:text-dark-text-primary border border-gray-300 dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600 appearance-none shadow-subtle dark:shadow-dark-subtle transition-all duration-200 hover:border-gray-400 dark:hover:border-dark-text-muted"
                      style={{
                        fontSize: "14px", // Prevents iOS zoom on focus
                        lineHeight: "1.3",
                      }}
                    >
                      <option value="">All Tracks</option>
                      {availableTracks.map((track) => (
                        <option key={track} value={track}>
                          {track}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <svg
                        className="w-4 h-4 text-gray-500 dark:text-dark-text-muted"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {mainView === "talks" ? (
        <>
          {/* Filter Bar */}
          <FilterBar
            selectedDay={selectedDay}
            setSelectedDay={setSelectedDay}
            showBookmarked={showBookmarked}
            setShowBookmarked={setShowBookmarked}
            showStarred={showStarred}
            setShowStarred={setShowStarred}
            viewMode={viewMode}
            setViewMode={setViewMode}
          />

          {/* Main Content - Talks */}
          <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
            {filteredSessions.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <p className="text-gray-500 dark:text-dark-text-muted text-base sm:text-lg">
                  No sessions found matching your filters.
                </p>
              </div>
            ) : viewMode === "calendar" ? (
              <CalendarView
                sessions={filteredSessions}
                speakers={data.speakers}
                rooms={data.rooms}
                selectedDay={selectedDay}
                showBookmarked={showBookmarked}
                showStarred={showStarred}
                onSessionClick={handleSessionClick}
                bookmarkedIds={bookmarkedIds}
                starredIds={starredIds}
                onBookmarkToggle={() => {
                  // Not used in CalendarView
                }}
                onStarToggle={() => {
                  // Not used in CalendarView
                }}
              />
            ) : (
              <div>
                {/* Disclaimer that June 3 workshops are for people with the 'Conference + Workshop Pass' only */}
                {selectedDay === 3 && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 dark:border-blue-600 text-blue-700 dark:text-blue-400 p-3 mb-4 rounded-lg max-w-xl shadow-subtle dark:shadow-dark-subtle">
                    <p className="font-medium text-sm">
                      Note: June 3rd workshops are for attendees with the{" "}
                      <i>Conference + Workshop Pass</i>
                    </p>
                  </div>
                )}

                {/* Session Cards */}
                <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                  {filteredSessions.map((session) => {
                    const speaker = data.speakers.find((s) =>
                      session.speakers.includes(s.id)
                    );
                    const room = data.rooms.find(
                      (r) => r.id === session.roomId
                    );
                    return (
                      <SessionCard
                        key={session.id}
                        session={session}
                        speaker={speaker}
                        room={room}
                        onClick={() => handleSessionClick(session)}
                        isBookmarked={bookmarkedIds.includes(session.id)}
                        isStarred={starredIds.includes(session.id)}
                        onBookmarkToggle={async () => {
                          if (isBookmarked(session.id)) {
                            await removeBookmark(session.id);
                          } else {
                            await addBookmark(session.id, session.title);
                          }
                        }}
                        onStarToggle={async () => {
                          if (isStarred(session.id)) {
                            await removeStarred(session.id);
                          } else {
                            await addStarred(session.id, session.title);
                          }
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </main>
        </>
      ) : (
        /* Speakers View */
        <SpeakersView
          speakers={data.speakers}
          sessions={data.sessions}
          selectedTrack={selectedTrack}
          onSessionClick={handleSessionClick}
        />
      )}

      {/* Session Detail Modal */}
      <SessionDetailModal
        session={selectedSession}
        speaker={
          selectedSession
            ? data.speakers.find((s) => selectedSession.speakers.includes(s.id))
            : undefined
        }
        room={
          selectedSession
            ? data.rooms.find((r) => r.id === selectedSession.roomId)
            : undefined
        }
        isOpen={isModalOpen}
        onClose={closeModal}
        isBookmarked={
          selectedSession ? bookmarkedIds.includes(selectedSession.id) : false
        }
        isStarred={
          selectedSession ? starredIds.includes(selectedSession.id) : false
        }
        onBookmarkToggle={async () => {
          if (selectedSession) {
            if (isBookmarked(selectedSession.id)) {
              await removeBookmark(selectedSession.id);
            } else {
              await addBookmark(selectedSession.id, selectedSession.title);
            }
          }
        }}
        onStarToggle={async () => {
          if (selectedSession) {
            if (isStarred(selectedSession.id)) {
              await removeStarred(selectedSession.id);
            } else {
              await addStarred(selectedSession.id, selectedSession.title);
            }
          }
        }}
      />
    </div>
  );
}

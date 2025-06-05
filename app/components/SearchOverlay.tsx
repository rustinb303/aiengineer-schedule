"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Session, Speaker, Room } from "../types/schedule";
import { formatTime, getDuration } from "../utils/dateTime";

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: Session[];
  speakers: Speaker[];
  rooms: Room[];
  onSessionClick: (session: Session) => void;
}

interface SearchResult {
  session: Session;
  speaker?: Speaker;
  room?: Room;
  matchedIn: ("title" | "speaker" | "description")[];
  titleMatches: number[];
  speakerMatches: number[];
  descriptionMatches: number[];
}

function highlightText(
  text: string,
  searchTerm: string,
  matches: number[]
): React.ReactElement {
  if (!searchTerm || matches.length === 0) {
    return <>{text}</>;
  }

  const elements: React.ReactElement[] = [];
  let lastIndex = 0;

  matches.forEach((index, i) => {
    // Add text before match
    if (index > lastIndex) {
      elements.push(
        <span key={`text-${i}`}>{text.substring(lastIndex, index)}</span>
      );
    }
    // Add highlighted match
    elements.push(
      <mark
        key={`match-${i}`}
        className="bg-yellow-200 dark:bg-yellow-700 text-inherit rounded px-0.5"
      >
        {text.substring(index, index + searchTerm.length)}
      </mark>
    );
    lastIndex = index + searchTerm.length;
  });

  // Add remaining text
  if (lastIndex < text.length) {
    elements.push(<span key="remaining">{text.substring(lastIndex)}</span>);
  }

  return <>{elements}</>;
}

function findMatches(text: string, searchTerm: string): number[] {
  const matches: number[] = [];
  const lowerText = text.toLowerCase();
  const lowerSearch = searchTerm.toLowerCase();

  let index = 0;
  while ((index = lowerText.indexOf(lowerSearch, index)) !== -1) {
    matches.push(index);
    index += searchTerm.length;
  }

  return matches;
}

export default function SearchOverlay({
  isOpen,
  onClose,
  sessions,
  speakers,
  rooms,
  onSessionClick,
}: SearchOverlayProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 100);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Create speaker lookup map
  const speakerMap = useMemo(() => {
    const map = new Map<string, Speaker>();
    speakers.forEach((speaker) => {
      map.set(speaker.id, speaker);
    });
    return map;
  }, [speakers]);

  // Search logic
  const searchResults = useMemo((): SearchResult[] => {
    if (!debouncedSearchTerm || debouncedSearchTerm.length < 2) {
      return [];
    }

    const results: SearchResult[] = [];
    const lowerSearch = debouncedSearchTerm.toLowerCase();

    sessions.forEach((session) => {
      const matchedIn: ("title" | "speaker" | "description")[] = [];
      const titleMatches = findMatches(session.title, debouncedSearchTerm);
      const descriptionMatches = session.description
        ? findMatches(session.description, debouncedSearchTerm)
        : [];
      let speakerMatches: number[] = [];

      // Check title
      if (titleMatches.length > 0) {
        matchedIn.push("title");
      }

      // Check description
      if (descriptionMatches.length > 0) {
        matchedIn.push("description");
      }

      // Check speakers
      let matchedSpeaker: Speaker | undefined;
      // Ensure session.speakerIds exists and is an array before iterating
      if (session.speakerIds && Array.isArray(session.speakerIds)) {
        for (const speakerId of session.speakerIds) {
          const speaker = speakerMap.get(speakerId);
          if (speaker && speaker.fullName) { // Check speaker and fullName
            const matches = findMatches(speaker.fullName, debouncedSearchTerm);
            if (matches.length > 0) {
              matchedIn.push("speaker");
              matchedSpeaker = speaker;
              speakerMatches = matches;
              break; // Use first matching speaker
            }
          }
        }
      }

      if (matchedIn.length > 0) {
        const room = rooms.find((r) => r.id === session.roomId);
        let finalSpeaker = matchedSpeaker;
        // If no speaker matched directly via search term, but session has speakers,
        // assign the first speaker for display purposes (as per original logic before modifications).
        if (!finalSpeaker && session.speakerIds && session.speakerIds.length > 0) {
          finalSpeaker = speakerMap.get(session.speakerIds[0]);
        }
        results.push({
          session,
          speaker: finalSpeaker,
          room,
          matchedIn,
          titleMatches,
          speakerMatches,
          descriptionMatches,
        });
      }
    });

    return results;
  }, [debouncedSearchTerm, sessions, speakers, rooms, speakerMap]);

  const handleSessionClick = (result: SearchResult) => {
    onSessionClick(result.session);
    onClose();
    // Don't clear search term - keep it for when user returns
  };

  const handleClose = () => {
    onClose();
    // Clear search when explicitly closing the overlay
    setSearchTerm("");
    setDebouncedSearchTerm("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Search Panel */}
      <div className="absolute inset-x-0 top-0 max-h-[90vh] bg-white dark:bg-dark-card shadow-xl dark:shadow-dark-card-hover overflow-hidden flex flex-col">
        {/* Search Header */}
        <div className="flex items-center gap-4 p-4 border-b border-gray-200 dark:border-dark-border">
          <svg
            className="w-5 h-5 text-gray-400 dark:text-dark-text-muted"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search sessions, speakers, descriptions..."
            className="flex-1 text-lg bg-transparent outline-none text-gray-900 dark:text-dark-text-primary placeholder-gray-400 dark:placeholder-dark-text-muted"
            autoFocus
          />
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-dark-hover rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5 text-gray-500 dark:text-dark-text-secondary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Search Results */}
        <div className="flex-1 overflow-y-auto">
          {searchTerm && debouncedSearchTerm === searchTerm ? (
            searchResults.length > 0 ? (
              <div className="divide-y divide-gray-200 dark:divide-dark-border">
                {searchResults.map((result) => (
                  <div
                    key={result.session.id}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-dark-hover cursor-pointer transition-colors"
                    onClick={() => handleSessionClick(result)}
                  >
                    {/* Time and Duration */}
                    <div className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-dark-text-muted mb-1">
                      <span>{formatTime(result.session.startsAt)}</span>
                      <span>•</span>
                      <span>
                        {getDuration(
                          result.session.startsAt,
                          result.session.endsAt
                        )}{" "}
                        mins
                      </span>
                      {result.room && (
                        <>
                          <span>•</span>
                          <span>{result.room.name}</span>
                        </>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-semibold text-gray-900 dark:text-dark-text-primary mb-1">
                      {highlightText(
                        result.session.title,
                        debouncedSearchTerm,
                        result.titleMatches
                      )}
                    </h3>

                    {/* Speaker */}
                    {result.speaker && (
                      <p className="text-sm text-gray-600 dark:text-dark-text-secondary mb-2">
                        {highlightText(
                          result.speaker.fullName,
                          debouncedSearchTerm,
                          result.speakerMatches
                        )}
                        {result.speaker.tagLine && (
                          <span className="text-gray-500 dark:text-dark-text-muted">
                            {" "}
                            • {result.speaker.tagLine}
                          </span>
                        )}
                      </p>
                    )}

                    {/* Description (show full) */}
                    {result.session.description &&
                      result.descriptionMatches.length > 0 && (
                        <p className="text-sm text-gray-600 dark:text-dark-text-secondary line-clamp-5">
                          {highlightText(
                            result.session.description,
                            debouncedSearchTerm,
                            result.descriptionMatches
                          )}
                        </p>
                      )}

                    {/* Match indicators */}
                    <div className="flex gap-2 mt-2">
                      {result.matchedIn.map((field) => (
                        <span
                          key={field}
                          className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-dark-hover text-gray-600 dark:text-dark-text-secondary rounded-full"
                        >
                          {field}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500 dark:text-dark-text-muted">
                No results found for "{debouncedSearchTerm}"
              </div>
            )
          ) : searchTerm ? (
            <div className="p-8 text-center text-gray-400 dark:text-dark-text-muted">
              Searching...
            </div>
          ) : (
            <div className="p-8 text-center text-gray-400 dark:text-dark-text-muted">
              Start typing to search sessions
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

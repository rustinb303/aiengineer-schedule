"use client";

import { useState } from "react";
import { Speaker, Session } from "../types/schedule";

interface SpeakerCardProps {
  speaker: Speaker;
  sessions: Session[];
  onSessionClick?: (session: Session) => void;
}

export default function SpeakerCard({
  speaker,
  sessions,
  onSessionClick,
}: SpeakerCardProps) {
  const [expanded, setExpanded] = useState(false);

  const speakerSessions = sessions.filter((session) =>
    session.speakers.includes(speaker.id)
  );

  return (
    <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-lg p-4 sm:p-6 shadow-card dark:shadow-dark-card hover:shadow-card-hover dark:hover:shadow-dark-card-hover transition-all duration-200">
      <div className="flex items-start gap-3 sm:gap-4">
        {speaker.profilePicture && (
          <img
            src={speaker.profilePicture}
            alt={speaker.fullName}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover flex-shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-dark-text-primary">
            {speaker.fullName}
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-dark-text-secondary mb-1 sm:mb-2">
            {speaker.tagLine}
          </p>
          {speaker.bio && (
            <p className="text-xs sm:text-sm text-gray-500 dark:text-dark-text-muted line-clamp-2 sm:line-clamp-3 mb-2 sm:mb-3">
              {speaker.bio}
            </p>
          )}

          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-dark-text-secondary">
            <svg
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            <span>
              {speakerSessions.length}{" "}
              {speakerSessions.length === 1 ? "talk" : "talks"}
            </span>
          </div>

          {speakerSessions.length > 0 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-2 sm:mt-3 text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium min-h-[44px] flex items-center transition-colors duration-200"
              aria-expanded={expanded}
            >
              {expanded ? "Hide talks" : "Show talks"}
            </button>
          )}
        </div>
      </div>

      {expanded && speakerSessions.length > 0 && (
        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200 dark:border-dark-border">
          <div className="space-y-2">
            {speakerSessions.map((session) => (
              <div
                key={session.id}
                className="p-2.5 sm:p-3 bg-gray-50 dark:bg-dark-hover rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-border transition-colors duration-200 border border-gray-100 dark:border-dark-border"
                onClick={() => onSessionClick?.(session)}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    onSessionClick?.(session);
                  }
                }}
              >
                <h4 className="font-medium text-gray-900 dark:text-dark-text-primary text-xs sm:text-sm mb-1">
                  {session.title}
                </h4>
                <div className="flex flex-wrap gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-gray-500 dark:text-dark-text-muted">
                  {session.assignedTrack && (
                    <span className="px-1.5 py-0.5 sm:px-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded border border-blue-200 dark:border-blue-700">
                      {session.assignedTrack}
                    </span>
                  )}
                  {session.level && (
                    <span className="px-1.5 py-0.5 sm:px-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded border border-purple-200 dark:border-purple-700">
                      {session.level}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

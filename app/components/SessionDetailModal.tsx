"use client";

import { useEffect } from "react";
import { Session, Speaker, Room } from "../types/schedule";
import { localStorageUtils } from "../utils/localStorage";
import { formatTime, formatDate, getDuration } from "../utils/dateTime";
import { getSessionTrack, requiresAILeadersPass } from "../utils/trackUtils";
import { ShareIcon } from "../utils/svgs";

interface SessionDetailModalProps {
  session: Session | null;
  speakers?: Speaker[];
  room?: Room;
  isOpen: boolean;
  onClose: () => void;
  isBookmarked?: boolean;
  isStarred?: boolean;
  onBookmarkToggle?: () => void;
  onStarToggle?: () => void;
}

export default function SessionDetailModal({
  session,
  speakers,
  room,
  isOpen,
  onClose,
  isBookmarked = false,
  isStarred = false,
  onBookmarkToggle,
  onStarToggle,
}: SessionDetailModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !session) return null;

  const toggleBookmark = () => {
    // if (session) { // session check can remain if needed for other logic, but localStorage part goes
    //   if (isBookmarked) {
    //     localStorageUtils.removeBookmark(session.id);
    //   } else {
    //     localStorageUtils.addBookmark(session.id);
    //   }
    // }
    onBookmarkToggle?.();
  };

  const toggleStar = () => {
    // if (session) { // session check can remain
    //   if (isStarred) {
    //     localStorageUtils.removeStarred(session.id);
    //   } else {
    //     localStorageUtils.addStarred(session.id);
    //   }
    // }
    onStarToggle?.();
  };

  const handleShare = async () => {
    if (!session) return;

    const shareUrl = `${window.location.origin}/?session=${session.id}`;

    // Try to use native share API if available (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: session.title,
          text: `Check out this session at AI Engineer World's Fair 2025: ${session.title}`,
          url: shareUrl,
        });
      } catch (err) {}
    } else {
      // Fallback to copying to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert("Link copied to clipboard");
      } catch (err) {}
    }
  };

  const duration = getDuration(session.startsAt, session.endsAt);

  return (
    <div
      className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-end sm:items-center justify-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-dark-card rounded-t-lg sm:rounded-lg w-full sm:max-w-3xl h-[90vh] sm:max-h-[90vh] flex flex-col shadow-xl dark:shadow-2xl border border-gray-200 dark:border-dark-border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gray-50 dark:bg-dark-hover px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-dark-border rounded-tl-lg rounded-tr-lg">
          <div className="flex justify-between items-start">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-dark-text-primary pr-4">
              {session.title}
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-200 dark:hover:bg-dark-border rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500 dark:text-dark-text-muted"
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
        </div>

        {/* Content */}
        <div className="px-4 sm:px-6 py-4 sm:py-6 overflow-y-auto flex-1">
          {/* Time and Location */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 mb-4 sm:mb-6 text-xs sm:text-sm">
            <div className="flex items-center gap-2 text-gray-600 dark:text-dark-text-secondary">
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>{formatDate(session.startsAt)}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-dark-text-secondary">
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>
                {formatTime(session.startsAt)} - {formatTime(session.endsAt)} (
                {duration} min)
              </span>
            </div>
            {room && (
              <div className="flex items-center gap-2 text-gray-600 dark:text-dark-text-secondary">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span>{room.name}</span>
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 sm:mb-6">
            {session.level && (
              <span className="px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full border border-purple-200 dark:border-purple-700">
                {session.level}
              </span>
            )}
            {session.scope && (
              <span className="px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full border border-green-200 dark:border-green-700">
                {session.scope}
              </span>
            )}
            {session.assignedTrack && (
              <span className="px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full border border-blue-200 dark:border-blue-700">
                {session.assignedTrack}
              </span>
            )}
          </div>

          {/* AI Leaders Pass Disclaimer */}
          {(() => {
            const sessionTrack = getSessionTrack(
              session.assignedTrack,
              room?.name
            );
            return (
              requiresAILeadersPass(sessionTrack) && (
                <div className="mb-4 sm:mb-6 bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-400 dark:border-purple-600 text-purple-700 dark:text-purple-400 p-3 rounded-lg">
                  <p className="text-xs sm:text-sm font-medium">
                    Note: This session is part of a track available for those
                    with the <i>AI Leaders</i> pass
                  </p>
                </div>
              )
            );
          })()}

          {/* Description */}
          <div className="mb-4 sm:mb-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-dark-text-primary mb-2">
              Description
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-dark-text-secondary whitespace-pre-wrap">
              {session.description}
            </p>
          </div>

          {/* Speakers */}
          {speakers && speakers.length > 0 && (
            <div className="mb-4 sm:mb-6">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-dark-text-primary mb-2 sm:mb-3">
                {speakers.length === 1 ? "Speaker" : "Speakers"}
              </h3>
              <div className="space-y-3">
                {speakers.map((speaker) => (
                  <div
                    key={speaker.id}
                    className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 dark:bg-dark-hover rounded-lg border border-gray-100 dark:border-dark-border"
                  >
                    {speaker.profilePicture && (
                      <img
                        src={speaker.profilePicture}
                        alt={speaker.fullName}
                        className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 dark:text-dark-text-primary text-sm sm:text-base">
                        {speaker.fullName}
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-dark-text-secondary mb-1 sm:mb-2">
                        {speaker.tagLine}
                      </p>
                      {speaker.bio && (
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-dark-text-muted">
                          {speaker.bio}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Company */}
          {session.companies && (
            <div className="mb-4 sm:mb-6">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-dark-text-primary mb-2">
                Company
              </h3>
              <div className="flex items-center gap-2 text-gray-600 dark:text-dark-text-secondary">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                <span className="text-xs sm:text-sm">{session.companies}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-dark-hover px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 dark:border-dark-border flex-shrink-0 rounded-bl-lg rounded-br-lg">
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">
            <div className="flex gap-2">
              <button
                onClick={toggleBookmark}
                className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base min-h-[44px] shadow-subtle dark:shadow-dark-subtle border ${
                  isBookmarked
                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/40 border-blue-200 dark:border-blue-700"
                    : "bg-gray-100 dark:bg-dark-option text-gray-700 dark:text-dark-text-secondary hover:bg-gray-200 dark:hover:bg-dark-option/50 border-gray-200 dark:border-dark-border"
                }`}
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  fill={isBookmarked ? "currentColor" : "none"}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                  />
                </svg>
                <span className="sm:inline">
                  {isBookmarked ? "Bookmarked" : "Bookmark"}
                </span>
              </button>
              <button
                onClick={toggleStar}
                className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base min-h-[44px] shadow-subtle dark:shadow-dark-subtle border ${
                  isStarred
                    ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/40 border-green-200 dark:border-green-700"
                    : "bg-gray-100 dark:bg-dark-option text-gray-700 dark:text-dark-text-secondary hover:bg-gray-200 dark:hover:bg-dark-option/50 border-gray-200 dark:border-dark-border"
                }`}
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="hidden sm:inline">
                  {isStarred ? "Going" : "Mark as Going"}
                </span>
                <span className="sm:hidden">Going</span>
              </button>
              <button
                onClick={handleShare}
                className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base min-h-[44px] shadow-subtle dark:shadow-dark-subtle border-2 bg-gray-100 dark:bg-dark-option text-gray-700 dark:text-dark-text-secondary hover:bg-gray-200 dark:hover:bg-dark-option/50 border-gray-200 dark:border-white/20"
              >
                <ShareIcon />
                <span>Share</span>
              </button>
            </div>
            <button
              onClick={onClose}
              className="hidden sm:block px-4 py-2 bg-gray-200 dark:bg-dark-option text-gray-700 dark:text-dark-text-primary rounded-lg hover:bg-gray-300 dark:hover:bg-dark-hover transition-all duration-200 text-sm sm:text-base min-h-[44px] shadow-subtle dark:shadow-dark-subtle border border-gray-300 dark:border-dark-border"
            >
              Close
            </button>
          </div>

          {/* Mobile close button - full width at bottom */}
          <button
            onClick={onClose}
            className="sm:hidden mt-3 px-4 py-2 bg-gray-200 dark:bg-dark-option text-gray-700 dark:text-dark-text-primary rounded-lg hover:bg-gray-300 dark:hover:bg-dark-hover transition-all duration-200 text-sm w-full min-h-[44px] shadow-subtle dark:shadow-dark-subtle border border-gray-300 dark:border-dark-border"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

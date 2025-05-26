"use client";
import { Session, Speaker, Room } from "../types/schedule";
import { localStorageUtils } from "../utils/localStorage";
import { formatTime, formatDate, getDuration } from "../utils/dateTime";
import { CompanyIcon, RoomIcon, StarIcon } from "../utils/svgs";

interface SessionCardProps {
  session: Session;
  speaker?: Speaker;
  room?: Room;
  onClick?: () => void;
  isBookmarked?: boolean;
  isStarred?: boolean;
  onBookmarkToggle?: () => void;
  onStarToggle?: () => void;
}

export default function SessionCard({
  session,
  speaker,
  room,
  onClick,
  isBookmarked = false,
  isStarred = false,
  onBookmarkToggle,
  onStarToggle,
}: SessionCardProps) {
  const toggleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isBookmarked) {
      localStorageUtils.removeBookmark(session.id);
    } else {
      localStorageUtils.addBookmark(session.id);
    }
    onBookmarkToggle?.();
  };

  const toggleStar = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isStarred) {
      localStorageUtils.removeStarred(session.id);
    } else {
      localStorageUtils.addStarred(session.id);
    }
    onStarToggle?.();
  };

  const duration = getDuration(session.startsAt, session.endsAt);

  return (
    <div
      className="bg-white dark:bg-dark-card border-[1.5px] border-gray-200 dark:border-dark-border rounded-xl p-4 sm:p-6 shadow-card dark:shadow-dark-card hover:shadow-card-hover dark:hover:shadow-dark-card-hover transition-all duration-200 cursor-pointer flex flex-col h-full"
      onClick={onClick}
    >
      {/* Top section - fixed height content */}
      <div>
        <div className="flex justify-between items-start mb-0">
          <div className="flex-1">
            {/* Session date and time */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2">
              <span className="px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium bg-gray-100 dark:bg-gray-300/10 text-gray-700 dark:text-dark-text-secondary rounded-md border border-gray-200 dark:border-dark-border">
                {formatDate(session.startsAt)}
              </span>
              <span className="px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium bg-gray-100 dark:bg-gray-300/10 text-gray-700 dark:text-dark-text-secondary rounded-md border border-gray-200 dark:border-dark-border">
                {formatTime(session.startsAt)} - {formatTime(session.endsAt)}
              </span>
              <span className="px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium bg-gray-100 dark:bg-gray-300/10 text-gray-700 dark:text-dark-text-secondary rounded-md border border-gray-200 dark:border-dark-border">
                {duration} min
              </span>
            </div>
          </div>
        </div>

        {/* Session title and description */}
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-dark-text-primary mb-1">
          {session.title}
        </h3>
        <p className="text-gray-600 dark:text-dark-text-secondary text-xs sm:text-sm line-clamp-2 sm:line-clamp-3 mb-3">
          {session.description || "<No description provided>"}
        </p>
      </div>

      {/* Middle section - grows to fill space */}
      <div className="flex-1" />

      {/* Bottom section - fixed position content */}
      <div>
        {speaker && (
          <div className="flex items-center gap-2 mb-3">
            {speaker.profilePicture && (
              <img
                src={speaker.profilePicture}
                alt={speaker.fullName}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-700 dark:text-dark-text-primary truncate">
                {speaker.fullName}
              </p>
              <div className="flex flex-col gap-0 text-xs sm:text-sm">
                {/* Company details */}
                <div className="flex flex-wrap gap-2 sm:gap-3 text-gray-500 dark:text-dark-text-muted pr-2">
                  {session.companies && (
                    <div className="flex items-center gap-1">
                      <CompanyIcon />
                      <span className="text-xs sm:text-sm truncate">
                        {session.companies}
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-[10px] sm:text-xs text-gray-500 dark:text-dark-text-muted line-clamp-2">
                  {speaker.tagLine}
                </p>
              </div>
            </div>

            {/* Bookmark and Star buttons */}
            <div className="flex gap-1 sm:gap-2 flex-shrink-0">
              <button
                onClick={(e) => toggleBookmark(e)}
                className={`px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg transition-all duration-200 min-h-[32px] sm:min-h-[36px] flex items-center justify-center shadow-subtle border-[1.5px] ${
                  isBookmarked
                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/40 border-blue-200 dark:border-blue-700"
                    : "bg-gray-100 dark:bg-gray-400/10 text-gray-400 dark:text-dark-text-muted hover:bg-gray-200 dark:hover:bg-dark-border border-gray-200 dark:border-white/10"
                }`}
                aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
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
              </button>
              <button
                onClick={(e) => toggleStar(e)}
                className={`px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg transition-all duration-200 min-h-[32px] sm:min-h-[36px] flex items-center justify-center shadow-subtle border-[1.5px] ${
                  isStarred
                    ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/40 border-green-200 dark:border-green-700"
                    : "bg-gray-100 dark:bg-gray-400/10 text-gray-400 dark:text-dark-text-muted hover:bg-gray-200 dark:hover:bg-dark-border border-gray-200 dark:border-white/10"
                }`}
                aria-label={isStarred ? "Not going" : "Mark as going"}
              >
                <StarIcon />
              </button>
            </div>
          </div>
        )}

        {/* Additional info tags */}
        <div className="flex flex-row gap-1.5 sm:gap-2 overflow-x-auto scrollbar-hide">
          {session.level && (
            <span className="px-1.5 py-0.5 sm:px-2 sm:py-1 text-[9.9px] font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full border border-purple-200 dark:border-purple-700 whitespace-nowrap">
              {session.level}
            </span>
          )}
          {session.scope && (
            <span className="px-1.5 py-0.5 sm:px-2 sm:py-1 text-[9.9px] font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full border border-green-200 dark:border-green-700 whitespace-nowrap">
              {session.scope}
            </span>
          )}
          {session.assignedTrack && (
            <span className="px-1.5 py-0.5 sm:px-2 sm:py-1 text-[9.9px] font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full border border-blue-200 dark:border-blue-700 whitespace-nowrap">
              {session.assignedTrack}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

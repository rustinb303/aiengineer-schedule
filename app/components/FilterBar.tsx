"use client";

import { useEffect } from "react";

interface FilterBarProps {
  selectedDay: number;
  setSelectedDay: (day: number) => void;
  showBookmarked: boolean;
  setShowBookmarked: (show: boolean) => void;
  showStarred: boolean;
  setShowStarred: (show: boolean) => void;
  viewMode: "list" | "calendar";
  setViewMode: (mode: "list" | "calendar") => void;
}

export default function FilterBar({
  selectedDay,
  setSelectedDay,
  showBookmarked,
  setShowBookmarked,
  showStarred,
  setShowStarred,
  viewMode,
  setViewMode,
}: FilterBarProps) {
  const allDays = [
    { value: 0, label: "All Days", shortLabel: "All" },
    { value: 3, label: "Tuesday June 3", shortLabel: "June 3" },
    { value: 1, label: "Wednesday June 4", shortLabel: "June 4" },
    { value: 2, label: "Thursday June 5", shortLabel: "June 5" },
  ];

  // Filter out 'All Days' option when in calendar view
  const days =
    viewMode === "calendar"
      ? allDays.filter((day) => day.value !== 0)
      : allDays;

  // When switching to calendar view, if 'All Days' is selected, default to Tuesday
  useEffect(() => {
    if (viewMode === "calendar" && selectedDay === 0) {
      setSelectedDay(3); // Tuesday
    }
  }, [viewMode, selectedDay, setSelectedDay]);

  return (
    <div className="bg-white dark:bg-dark-bg border-b border-gray-200 dark:border-dark-border top-0 z-10 lg:sticky shadow-subtle dark:shadow-dark-subtle">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Left side - Days and View Mode */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex gap-1 bg-gray-100 dark:bg-dark-hover rounded-lg p-1 shadow-subtle dark:shadow-dark-subtle">
              <button
                onClick={() => setViewMode("list")}
                className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 flex items-center justify-center gap-1.5 ${
                  viewMode === "list"
                    ? "bg-white dark:bg-dark-option text-gray-900 dark:text-dark-text-primary shadow-card dark:shadow-dark-card "
                    : "text-gray-600 dark:text-dark-text-secondary hover:text-gray-900 dark:hover:text-dark-text-primary"
                }`}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
                <span>List</span>
              </button>
              <button
                onClick={() => setViewMode("calendar")}
                className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 flex items-center justify-center gap-1.5 ${
                  viewMode === "calendar"
                    ? "bg-white dark:bg-dark-option text-gray-900 dark:text-dark-text-primary shadow-card dark:shadow-dark-card"
                    : "text-gray-600 dark:text-dark-text-secondary hover:text-gray-900 dark:hover:text-dark-text-primary"
                }`}
              >
                <svg
                  className="w-4 h-4"
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
                <span>Calendar</span>
              </button>
            </div>

            {/* Divider - hidden on mobile */}
            <div className="hidden sm:block w-px h-8 bg-gray-200 dark:bg-dark-border" />

            {/* Day Filter */}
            <div className="flex gap-2 w-full sm:overflow-x-auto sm:scrollbar-hide sm:pb-0">
              {days.map((day) => (
                <button
                  key={day.value}
                  onClick={() => setSelectedDay(day.value)}
                  className={`flex-1 sm:flex-initial px-2 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium transition-all duration-200 text-sm flex items-center justify-center shadow-subtle dark:shadow-dark-subtle border-[2px] ${
                    selectedDay === day.value
                      ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-gray-900 dark:border-white"
                      : "bg-gray-100 dark:bg-dark-hover text-gray-700 dark:text-dark-text-secondary hover:bg-gray-200 dark:hover:bg-dark-border border-gray-200 dark:border-gray-400/10"
                  }`}
                >
                  <span className="xl:hidden">{day.shortLabel}</span>
                  <span className="hidden xl:inline">{day.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Right side - Bookmark/Going Filters */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowBookmarked(!showBookmarked)}
              className={`flex-1 md:flex-initial px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 text-sm min-h-[40px] border-[1.5px] shadow-subtle hover:shadow-card dark:shadow-dark-subtle dark:hover:shadow-dark-card ${
                showBookmarked
                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-700"
                  : "bg-gray-100 dark:bg-dark-hover text-gray-700 dark:text-dark-text-secondary hover:bg-gray-200 dark:hover:bg-dark-border border-gray-200 dark:border-dark-border"
              }`}
            >
              <svg
                className="w-4 h-4"
                fill={showBookmarked ? "currentColor" : "none"}
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
              <span>Bookmarked</span>
            </button>
            <button
              onClick={() => setShowStarred(!showStarred)}
              className={`flex-1 md:flex-initial px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 text-sm min-h-[40px] border-[1.5px] shadow-subtle hover:shadow-card dark:shadow-dark-subtle dark:hover:shadow-dark-card ${
                showStarred
                  ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-700"
                  : "bg-gray-100 dark:bg-dark-hover text-gray-700 dark:text-dark-text-secondary hover:bg-gray-200 dark:hover:bg-dark-border border-gray-200 dark:border-dark-border"
              }`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={showStarred ? 3 : 2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>Going</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

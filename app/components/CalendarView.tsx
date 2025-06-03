"use client";

import { useState, useMemo, useEffect } from "react";
import { Session, Room, Speaker } from "../types/schedule";
import { localStorageUtils } from "../utils/localStorage";
import {
  formatTime,
  getDuration,
  getSessionDay,
  generateTimeSlots,
} from "../utils/dateTime";

interface CalendarViewProps {
  sessions: Session[];
  speakers: Speaker[];
  rooms: Room[];
  selectedDay: number;
  showBookmarked: boolean;
  showStarred: boolean;
  onSessionClick?: (session: Session) => void;
  bookmarkedIds?: string[];
  starredIds?: string[];
  onBookmarkToggle?: () => void;
  onStarToggle?: () => void;
}

interface CalendarSession extends Session {
  speaker?: Speaker;
  room?: Room;
}

export default function CalendarView({
  sessions,
  speakers,
  rooms,
  selectedDay,
  showBookmarked,
  showStarred,
  onSessionClick,
  bookmarkedIds = [],
  starredIds = [],
  onBookmarkToggle,
  onStarToggle,
}: CalendarViewProps) {
  const [hoveredSession, setHoveredSession] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const timeSlots = generateTimeSlots();

  // Get unique rooms for the selected day
  const dayRooms = useMemo(() => {
    const daySessions = sessions.filter((session) => {
      const sessionDay = getSessionDay(session.startsAt);
      return selectedDay === 0 || sessionDay === selectedDay;
    });

    const roomIds = [...new Set(daySessions.map((s) => s.roomId))];
    return rooms
      .filter((room) => roomIds.includes(room.id))
      .sort((a, b) => a.sort - b.sort);
  }, [sessions, rooms, selectedDay]);

  // Filter and enhance sessions with speaker and room data
  const filteredSessions = useMemo(() => {
    let filtered = sessions;

    // Filter by day
    if (selectedDay !== 0) {
      filtered = filtered.filter(
        (session) => getSessionDay(session.startsAt) === selectedDay
      );
    }

    // Filter by bookmarked/starred
    if (showBookmarked) {
      const bookmarkedIds = localStorageUtils
        .getBookmarks()
        .map((b) => b.sessionId);
      filtered = filtered.filter((session) =>
        bookmarkedIds.includes(session.id)
      );
    }

    if (showStarred) {
      const starredIds = localStorageUtils.getStarred().map((s) => s.sessionId);
      filtered = filtered.filter((session) => starredIds.includes(session.id));
    }

    // Enhance with speaker and room data
    return filtered.map((session) => ({
      ...session,
      speaker: speakers.find((s) => session.speakers.includes(s.id)),
      room: rooms.find((r) => r.id === session.roomId),
    })) as CalendarSession[];
  }, [sessions, speakers, rooms, selectedDay, showBookmarked, showStarred]);

  const getSessionPosition = (session: CalendarSession, isMobile: boolean) => {
    const startTime = new Date(session.startsAt);
    const startHour = startTime.getHours();
    const startMinute = startTime.getMinutes();
    const duration = getDuration(session.startsAt, session.endsAt);

    // Mobile: 180px per hour (90px per 30 minutes)
    // Desktop: 270px per hour (135px per 30 minutes)
    const pixelsPerMinute = isMobile ? 3 : 4.5;
    const topOffset = ((startHour - 9) * 60 + startMinute) * pixelsPerMinute;
    const height = duration * pixelsPerMinute;

    return { top: topOffset, height };
  };

  return (
    <div className="bg-white dark:bg-dark-card rounded-lg border sm:border-2 border-gray-200 dark:border-dark-border shadow-card dark:shadow-dark-card relative">
      <div className="overflow-x-auto scrollbar-hide rounded-lg bg-zinc-100 dark:bg-dark-bg">
        {/* min width should be 2000 on all screen sizes */}
        <table className="min-w-[2000px] table-fixed">
          {/* Header with room names */}
          <thead>
            <tr className="border-b border-gray-200 dark:border-dark-border">
              <th className="w-14 sm:w-20 p-1 sm:p-2 bg-zinc-50 dark:bg-dark-hover border-r border-gray-200 dark:border-dark-border"></th>
              {dayRooms.map((room, index) => (
                <th
                  key={room.id}
                  className={`p-2 sm:p-3 text-xs sm:text-sm font-medium text-gray-700 dark:text-dark-text-primary bg-gray-50 dark:bg-dark-hover text-left ${
                    index < dayRooms.length - 1
                      ? "border-r border-gray-200 dark:border-dark-border"
                      : ""
                  }`}
                  style={{ width: `${(100 - 5) / dayRooms.length}%` }}
                >
                  {room.name}
                </th>
              ))}
            </tr>
          </thead>

          {/* Time slots and sessions */}
          <tbody>
            <tr>
              {/* Time column */}
              <td className="align-top border-r border-gray-200 dark:border-dark-border p-0 bg-zinc-50 dark:bg-dark-hover">
                <div>
                  {timeSlots.map((slot, index) => (
                    <div
                      key={slot}
                      className={`h-[90px] sm:h-[135px] px-1 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs text-gray-500 dark:text-dark-text-muted ${
                        index % 2 === 0
                          ? "border-t border-gray-200 dark:border-dark-border"
                          : ""
                      }`}
                    >
                      {slot.includes(":00") ? slot : ""}
                    </div>
                  ))}
                </div>
              </td>

              {/* Room columns with sessions */}
              {dayRooms.map((room, roomIndex) => (
                <td
                  key={room.id}
                  className={`align-top p-0 relative ${
                    roomIndex < dayRooms.length - 1
                      ? "border-r border-gray-200 dark:border-dark-border"
                      : ""
                  }`}
                  style={{ width: `${(100 - 5) / dayRooms.length}%` }}
                >
                  {/* Grid lines */}
                  <div>
                    {timeSlots.map((slot, index) => (
                      <div
                        key={`${room.id}-${slot}`}
                        className={`h-[90px] sm:h-[135px] ${
                          index % 2 === 0
                            ? "border-t border-gray-200 dark:border-dark-border/50"
                            : "border-t border-gray-100 dark:border-gray-800/50"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Sessions positioned absolutely */}
                  <div className="absolute inset-[1px] px-1">
                    {filteredSessions
                      .filter((session) => session.roomId === room.id)
                      .map((session) => {
                        const { top, height } = getSessionPosition(
                          session,
                          isMobile
                        );
                        const isBookmarked = bookmarkedIds.includes(session.id);
                        const isStarred = starredIds.includes(session.id);

                        return (
                          <div
                            key={session.id}
                            className={`absolute left-0.5 right-0.5 sm:left-1 sm:right-1 p-1 sm:p-2 rounded transition-all cursor-pointer overflow-hidden ${
                              session.isPlenumSession
                                ? "border-2 border-orange-400 dark:border-orange-500"
                                : "border"
                            } ${
                              hoveredSession === session.id
                                ? "shadow-lg dark:shadow-dark-card-hover z-20 border-gray-400 dark:border-gray-600"
                                : session.isPlenumSession
                                ? ""
                                : "border-gray-300 dark:border-dark-border hover:shadow-md dark:hover:shadow-dark-card"
                            } ${
                              isStarred
                                ? "bg-green-100 dark:bg-green-900/80"
                                : isBookmarked
                                ? "bg-blue-100 dark:bg-blue-900/80"
                                : session.isPlenumSession
                                ? "bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-800/10"
                                : "bg-white dark:bg-dark-card"
                            }`}
                            style={{ top: `${top}px`, height: `${height}px` }}
                            onMouseEnter={() => setHoveredSession(session.id)}
                            onMouseLeave={() => setHoveredSession(null)}
                            onClick={() => onSessionClick?.(session)}
                          >
                            <div className="flex flex-col h-full">
                              {/* Time */}
                              <div className="text-[7px] sm:text-[8px] text-gray-500 dark:text-dark-text-muted mb-0.5 sm:mb-1">
                                {formatTime(session.startsAt)} -{" "}
                                {formatTime(session.endsAt)}
                              </div>

                              {/* Title */}
                              <h4 className="text-[9px] sm:text-[11px] leading-tight font-semibold text-gray-900 dark:text-dark-text-primary line-clamp-3 sm:line-clamp-4 mb-0">
                                {session.title}
                              </h4>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

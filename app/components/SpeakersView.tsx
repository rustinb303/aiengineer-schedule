"use client";

import { useMemo } from "react";
import { Speaker, Session, Room } from "../types/schedule";
import SpeakerCard from "./SpeakerCard";
import { getSessionTrack } from "../utils/trackUtils";

interface SpeakersViewProps {
  speakers: Speaker[];
  sessions: Session[];
  rooms: Room[];
  selectedTrack: string;
  onSessionClick?: (session: Session) => void;
}

export default function SpeakersView({
  speakers,
  sessions,
  rooms,
  selectedTrack,
  onSessionClick,
}: SpeakersViewProps) {
  // Filter speakers based on selected track
  const filteredSpeakers = useMemo(() => {
    if (!selectedTrack) {
      return speakers;
    }

    // Get speakers who have sessions in the selected track
    const speakerIdsInTrack = new Set<string>();
    sessions.forEach((session) => {
      // Get room name for this session
      const room = rooms.find((r) => r.id === session.roomId);
      const sessionTrack = getSessionTrack(session.assignedTrack, room?.name);
      
      // Check if this session matches the selected track
      if (sessionTrack === selectedTrack) {
        session.speakers.forEach((speakerId) => {
          speakerIdsInTrack.add(speakerId);
        });
      }
    });

    return speakers.filter((speaker) => speakerIdsInTrack.has(speaker.id));
  }, [speakers, sessions, rooms, selectedTrack]);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-200">
          Speakers
        </h2>
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          {filteredSpeakers.length} speakers
          {selectedTrack && ` in ${selectedTrack}`}
        </p>
      </div>

      {filteredSpeakers.length === 0 ? (
        <div className="text-center py-8 sm:py-12">
          <p className="text-gray-500 text-base sm:text-lg">
            No speakers found matching your filters.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
          {filteredSpeakers.map((speaker) => (
            <SpeakerCard
              key={speaker.id}
              speaker={speaker}
              sessions={sessions}
              onSessionClick={onSessionClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Utility functions for track extraction and normalization

/**
 * Extracts the track name from an assigned track string
 * Example: "Evals (12)" -> "Evals"
 * Example: "Research (AB)" -> "Research"
 */
export function extractTrackFromAssigned(
  assignedTrack: string | undefined
): string | null {
  if (!assignedTrack || !assignedTrack.trim()) return null;

  // Remove anything in parentheses (numbers, letters, etc.)
  const cleaned = assignedTrack.replace(/\s*\([^)]*\)\s*/g, "");
  return cleaned.trim() || null;
}

/**
 * Extracts the track name from a room name
 * Example: "Golden Gate Ballroom B: Evals" -> "Evals"
 */
export function extractTrackFromRoom(
  roomName: string | undefined
): string | null {
  if (!roomName || !roomName.trim()) return null;

  // Split by the last colon and take the part after it
  const parts = roomName.split(":");
  if (parts.length > 1) {
    return parts[parts.length - 1].trim();
  }

  return null;
}

/**
 * Gets the effective track for a session, considering both assigned track and room name
 */
export function getSessionTrack(
  assignedTrack: string | undefined,
  roomName: string | undefined
): string | null {
  // First try to get track from assignedTrack
  const trackFromAssigned = extractTrackFromAssigned(assignedTrack);
  if (trackFromAssigned) return trackFromAssigned;

  // Fall back to extracting from room name
  return (
    extractTrackFromRoom(roomName)?.replaceAll("Workshops", "Workshop") || null
  );
}

/**
 * Normalizes a track name for comparison
 */
export function normalizeTrackName(track: string): string {
  return track.trim().toLowerCase();
}

/**
 * Checks if two track names match (case-insensitive)
 */
export function tracksMatch(
  track1: string | null,
  track2: string | null
): boolean {
  if (!track1 || !track2) return false;
  return normalizeTrackName(track1) === normalizeTrackName(track2);
}

/**
 * Checks if a track requires the AI Leaders pass
 */
export function requiresAILeadersPass(
  track: string | null | undefined
): boolean {
  if (!track) return false;
  const normalizedTrack = track.toLowerCase();
  return (
    normalizedTrack.includes("ai in the fortune 500") ||
    normalizedTrack.includes("ai architects")
  );
}

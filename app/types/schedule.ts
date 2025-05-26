export interface SessionMoreInfo {
  "Session ID": string;
  Title: string;
  Description: string;
  "Session Format": string;
  Level: string;
  Scope: string;
  "Assigned Track": string;
  Room: string;
  "Scheduled At": string;
  Speakers: string;
  Companies: string;
  "Company Domains": string;
  Titles: string;
}

export interface Session {
  id: string;
  title: string;
  description: string;
  startsAt: string;
  endsAt: string;
  isServiceSession: boolean;
  isPlenumSession: boolean;
  speakers: string[]; // Array of speaker IDs
  categoryItems: any[];
  questionAnswers: any[];
  roomId: number;
  liveUrl: string | null;
  recordingUrl: string | null;
  status: string;
  isInformed: boolean;
  isConfirmed: boolean;
  // Additional fields from schedule-more-info.json
  level?: string;
  scope?: string;
  assignedTrack?: string;
  companies?: string;
}

export interface Speaker {
  id: string;
  firstName: string;
  lastName: string;
  bio: string;
  tagLine: string;
  profilePicture: string;
  isTopSpeaker: boolean;
  links: any[];
  sessions: number[];
  fullName: string;
  categoryItems: any[];
  questionAnswers: any[];
}

export interface Room {
  id: number;
  name: string;
  sort: number;
}

export interface ScheduleData {
  sessions: Session[];
  speakers: Speaker[];
  questions: any[];
  categories: any[];
  rooms: Room[];
}


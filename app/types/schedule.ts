import { Session } from './session';

export interface Speaker {
  id: string;
  name: string;
  bio?: string | null;
  tagLine?: string | null;
  profilePicture?: string | null;
  [key: string]: any;
}

export interface Room {
  id: number; // Assuming room IDs are numbers based on schedule.json
  name: string;
  [key: string]: any;
}

// Represents the structure of schedule.json
export interface Schedule {
  sessions: Session[];
  speakers: Speaker[];
  rooms?: Room[];
  questions?: any[]; // Define further if needed
  categories?: any[]; // Define further if needed
  [key: string]: any;
}

// Represents the combined data structure returned by fetchScheduleData()
export interface ScheduleData {
  schedule: Schedule;
  moreInfo: any[]; // Define a more specific type for items in moreInfo if structure is known
}

export interface Session {
  id: string; // From schedule.json, id is string
  title: string;
  description?: string | null;
  speakers: string[]; // From schedule.json, speakers is array of speaker ID strings
  roomId?: number; // From schedule.json, roomId is number
  startsAt?: string;
  endsAt?: string;
  [key: string]: any;
}
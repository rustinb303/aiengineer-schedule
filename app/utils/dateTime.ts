export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function getSessionDay(dateString: string): number {
  const date = new Date(dateString);
  const day = date.getDate();

  if (day === 3) return 3; // June 3
  if (day === 4) return 1; // June 4
  if (day === 5) return 2; // June 5

  return -1;
}

export function getDuration(startTime: string, endTime: string): number {
  const start = new Date(startTime);
  const end = new Date(endTime);
  return (end.getTime() - start.getTime()) / (1000 * 60); // Duration in minutes
}

export function getTimeSlot(dateString: string): string {
  const date = new Date(dateString);
  const hours = date.getHours();
  const minutes = date.getMinutes();

  // Round to nearest 30 minutes for calendar slots
  const roundedMinutes = minutes < 30 ? "00" : "30";
  return `${hours}:${roundedMinutes}`;
}

export function generateTimeSlots(): string[] {
  const slots: string[] = [];
  for (let hour = 9; hour <= 18; hour++) {
    const displayHour = hour > 12 ? hour - 12 : hour;
    const period = hour >= 12 ? "PM" : "AM";
    slots.push(`${displayHour}:00 ${period}`);
    slots.push(`${displayHour}:30 ${period}`);
  }
  return slots;
}

export function getSessionsForTimeSlot(
  sessions: any[],
  day: number,
  timeSlot: string
): any[] {
  return sessions.filter((session) => {
    const sessionDay = getSessionDay(session.startsAt);
    if (sessionDay !== day) return false;

    const sessionTime = new Date(session.startsAt);
    const slotHour = parseInt(timeSlot.split(":")[0]);
    const slotMinute = parseInt(timeSlot.split(":")[1]);

    return (
      sessionTime.getHours() === slotHour &&
      sessionTime.getMinutes() === slotMinute
    );
  });
}

export function formatToGoogleCalendarDate(dateString: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  // Format: YYYYMMDDTHHMMSSZ
  // Example: 20240720T100000Z
  return (
    date.getUTCFullYear() +
    ("0" + (date.getUTCMonth() + 1)).slice(-2) +
    ("0" + date.getUTCDate()).slice(-2) +
    "T" +
    ("0" + date.getUTCHours()).slice(-2) +
    ("0" + date.getUTCMinutes()).slice(-2) +
    ("0" + date.getUTCSeconds()).slice(-2) +
    "Z"
  );
}

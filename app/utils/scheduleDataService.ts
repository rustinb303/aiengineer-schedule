import scheduleDataFallback from "../../schedule.json";
import scheduleMoreInfoFallback from "../../schedule-more-info.json";
import { ScheduleData } from "../types/schedule";

const CACHE_KEY_SCHEDULE = "schedule_data_cache";
const CACHE_KEY_MORE_INFO = "schedule_more_info_cache";
const CACHE_TIMESTAMP_KEY = "schedule_cache_timestamp";
const CACHE_DURATION = (parseInt(process.env.NEXT_PUBLIC_CACHE_DURATION_MINUTES || "10") || 10) * 60 * 1000; // Convert minutes to milliseconds, default 10 minutes

const SCHEDULE_URL = "https://sessionize.com/api/v2/w3hd2z8a/view/All";
const MORE_INFO_URL = "https://www.ai.engineer/sessions-speakers-details.json";

interface CacheData {
  schedule: ScheduleData | null;
  moreInfo: any[] | null;
  timestamp: number;
}

class ScheduleDataService {
  private static instance: ScheduleDataService;
  private cache: CacheData = {
    schedule: null,
    moreInfo: null,
    timestamp: 0,
  };

  private constructor() {
    this.loadFromLocalStorage();
  }

  static getInstance(): ScheduleDataService {
    if (!ScheduleDataService.instance) {
      ScheduleDataService.instance = new ScheduleDataService();
    }
    return ScheduleDataService.instance;
  }

  private loadFromLocalStorage(): void {
    try {
      const cachedSchedule = localStorage.getItem(CACHE_KEY_SCHEDULE);
      const cachedMoreInfo = localStorage.getItem(CACHE_KEY_MORE_INFO);
      const cachedTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);

      if (cachedSchedule && cachedMoreInfo && cachedTimestamp) {
        this.cache = {
          schedule: JSON.parse(cachedSchedule),
          moreInfo: JSON.parse(cachedMoreInfo),
          timestamp: parseInt(cachedTimestamp, 10),
        };
      }
    } catch (error) {
      console.error("Error loading from localStorage:", error);
    }
  }

  private saveToLocalStorage(): void {
    try {
      localStorage.setItem(
        CACHE_KEY_SCHEDULE,
        JSON.stringify(this.cache.schedule)
      );
      localStorage.setItem(
        CACHE_KEY_MORE_INFO,
        JSON.stringify(this.cache.moreInfo)
      );
      localStorage.setItem(
        CACHE_TIMESTAMP_KEY,
        this.cache.timestamp.toString()
      );
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  }

  private isCacheValid(): boolean {
    const now = Date.now();
    return (
      now - this.cache.timestamp < CACHE_DURATION &&
      this.cache.schedule !== null &&
      this.cache.moreInfo !== null
    );
  }

  async fetchScheduleData(): Promise<{
    schedule: ScheduleData;
    moreInfo: any[];
  }> {
    // Check if cache is valid
    if (this.isCacheValid()) {
      const timeRemaining = Math.ceil(
        (CACHE_DURATION - (Date.now() - this.cache.timestamp)) / 60000
      );
      console.log(
        `Using cached scheduling data. Will re-fetch in ${timeRemaining} minutes`
      );
      return {
        schedule: this.cache.schedule!,
        moreInfo: this.cache.moreInfo!,
      };
    }

    try {
      // Fetch both data sources in parallel
      const [scheduleResponse, moreInfoResponse] = await Promise.all([
        fetch(SCHEDULE_URL),
        fetch(MORE_INFO_URL),
      ]);

      if (!scheduleResponse.ok || !moreInfoResponse.ok) {
        throw new Error("Failed to fetch data");
      }

      // Get text responses and apply cleanup
      const scheduleText = await scheduleResponse.text();
      const cleanedScheduleText = jsonCleanupSchedule(scheduleText);
      const scheduleData: ScheduleData = JSON.parse(cleanedScheduleText);

      // Handle potential JSON syntax errors in the more info data
      const moreInfoText = await moreInfoResponse.text();
      const cleanedMoreInfoText = jsonCleanupScheduleMoreInfo(moreInfoText);

      let moreInfoData: any[];
      try {
        moreInfoData = JSON.parse(cleanedMoreInfoText);
      } catch (error) {
        // Try to fix common JSON errors like trailing commas
        const fixedText = cleanedMoreInfoText
          .replace(/,\s*]/, "]") // Remove trailing comma before closing bracket
          .replace(/,\s*}/, "}"); // Remove trailing comma before closing brace
        moreInfoData = JSON.parse(fixedText);
      }

      // Update cache
      this.cache = {
        schedule: scheduleData,
        moreInfo: moreInfoData,
        timestamp: Date.now(),
      };

      // Save to localStorage
      this.saveToLocalStorage();

      console.log("Fetched latest scheduling data from json");

      return {
        schedule: scheduleData,
        moreInfo: moreInfoData,
      };
    } catch (error) {
      console.error("Error fetching schedule data:", error);

      // If we have cached data, use it regardless of age
      if (this.cache.schedule && this.cache.moreInfo) {
        console.log("Error fetching scheduling data, using fallback cache");
        return {
          schedule: this.cache.schedule,
          moreInfo: this.cache.moreInfo,
        };
      }

      // Fall back to local JSON files
      console.log("Error fetching scheduling data, using fallback json files");
      return {
        schedule: scheduleDataFallback as ScheduleData,
        moreInfo: scheduleMoreInfoFallback,
      };
    }
  }

  clearCache(): void {
    this.cache = {
      schedule: null,
      moreInfo: null,
      timestamp: 0,
    };
    try {
      localStorage.removeItem(CACHE_KEY_SCHEDULE);
      localStorage.removeItem(CACHE_KEY_MORE_INFO);
      localStorage.removeItem(CACHE_TIMESTAMP_KEY);
    } catch (error) {
      console.error("Error clearing cache:", error);
    }
  }
}

export default ScheduleDataService;

// Small utility functions to clean up malformed JSON data
function jsonCleanupSchedule(jsonText: string): string {
  return jsonText.replaceAll("N/A", "");
}

function jsonCleanupScheduleMoreInfo(jsonText: string): string {
  return jsonText.replaceAll("N/A", "");
}

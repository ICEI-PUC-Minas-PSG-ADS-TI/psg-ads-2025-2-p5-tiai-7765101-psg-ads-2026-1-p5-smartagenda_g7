export type USettings = {
  EnableLocalAI?: boolean,
  UseBackup?: boolean,
  EnableDailyNotify?: boolean,
  EnableScheduledNotify?: boolean,
  EnableDayOfTheWeekNotify?: boolean,
  ActiveDailyNotifications?: string[],
  ActiveDayOfTheWeekNotifications?: Record<string, string[]>,
  DailyNotificationTime?: HourMinute[],
  DayOfTheWeekNotificationSets?: Record<string, HourMinute[]>,
  ScheduledWarningDays?: number[]
}

export type HourMinute = {
  hour: number;
  minute: number;
}
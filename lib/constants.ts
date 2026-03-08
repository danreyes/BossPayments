export const QUICK_AMOUNTS = [250, 495, 750, 1200];

export const ANALYTICS_FILTERS = [
  "today",
  "last7",
  "thisMonth",
  "lastMonth",
  "last3Months"
] as const;

export type AnalyticsFilter = (typeof ANALYTICS_FILTERS)[number];

export const PAYTO_TARGET = 0.65;
export const ACTIVE_MERCHANTS_TARGET = 10;
export const JOBS_TARGET = 80;
export const WILLINGNESS_TARGET = 7;
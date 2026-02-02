/**
 * Converts an ISO date string (YYYY-MM-DD) to a Date object
 * @param isoString - ISO date string in format YYYY-MM-DD
 * @returns Date object or null if input is empty
 */
export const isoToDate = (isoString: string): Date | null => {
  if (!isoString) return null;
  return new Date(isoString + "T00:00:00");
};

/**
 * Converts a Date object to an ISO date string (YYYY-MM-DD)
 * @param date - Date object to convert
 * @returns ISO date string in format YYYY-MM-DD or empty string if date is null
 */
export const dateToIso = (date: Date | null): string => {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Formats an ISO date string (YYYY-MM-DD) to DD/MM/YYYY format
 * @param isoDate - ISO date string in format YYYY-MM-DD
 * @returns Formatted date string in DD/MM/YYYY format or empty string if input is empty
 */
export const formatDateToDisplay = (isoDate: string): string => {
  if (!isoDate) return "";
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
};

/**
 * Formats an ISO date string (YYYY-MM-DD) to "Day, DD/MM/YYYY" format
 * @param isoDate - ISO date string in format YYYY-MM-DD
 * @returns Formatted date string in "Day, DD/MM/YYYY" format or empty string if input is empty
 */
export const formatDateToDisplayWithDay = (isoDate: string): string => {
  if (!isoDate) return "";
  const date = isoToDate(isoDate);
  if (!date) return "";

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dayName = days[date.getDay()];
  const formattedDate = formatDateToDisplay(isoDate);
  return `${dayName}, ${formattedDate}`;
};

export const getTodayDate = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Gets the date range for the last N days
 * @param days - Number of days to go back
 * @returns Object with startDate and endDate as ISO strings
 */
export const getLastNDays = (days: number): { startDate: string; endDate: string } => {
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - (days - 1)); // Include today, so - (days - 1)

  return {
    startDate: dateToIso(startDate),
    endDate: getTodayDate(),
  };
};

/** Returns the previous day as ISO (YYYY-MM-DD) for a given ISO date. */
export const getYesterdayIso = (isoDate: string): string => {
  const d = isoToDate(isoDate);
  if (!d) return "";
  d.setDate(d.getDate() - 1);
  return dateToIso(d);
};

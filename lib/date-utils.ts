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

export const getTodayDate = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

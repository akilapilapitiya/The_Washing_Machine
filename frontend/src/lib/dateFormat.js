/**
 * Date formatting utilities for Sri Lankan locale
 * Formats: DD/MM/YYYY or DD Month YYYY
 */

/**
 * Format date to Sri Lankan format: DD/MM/YYYY
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDateSL = (date) => {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  return `${day}/${month}/${year}`;
};

/**
 * Format date to Sri Lankan format with full month name: DD Month YYYY
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDateLongSL = (date) => {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";

  const day = d.getDate();
  const month = d.toLocaleDateString("en-GB", { month: "long" });
  const year = d.getFullYear();

  return `${day} ${month} ${year}`;
};

/**
 * Format date to Sri Lankan format with short month name: DD Mon YYYY
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDateShortSL = (date) => {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";

  const day = d.getDate();
  const month = d.toLocaleDateString("en-GB", { month: "short" });
  const year = d.getFullYear();

  return `${day} ${month} ${year}`;
};

/**
 * Format date and time to Sri Lankan format: DD/MM/YYYY, HH:MM AM/PM
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date and time string
 */
export const formatDateTimeSL = (date) => {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";

  const dateStr = formatDateSL(date);
  const timeStr = d.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return `${dateStr}, ${timeStr}`;
};

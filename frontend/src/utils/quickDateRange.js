const toDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
};

const startOfDay = (value) => {
  const date = toDate(value);
  if (!date) return null;
  date.setHours(0, 0, 0, 0);
  return date;
};

const endOfDay = (value) => {
  const date = toDate(value);
  if (!date) return null;
  date.setHours(23, 59, 59, 999);
  return date;
};

const getWeekStart = (today) => {
  const start = new Date(today);
  const day = start.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + diff);
  start.setHours(0, 0, 0, 0);
  return start;
};

const getWeekEnd = (today) => {
  const end = getWeekStart(today);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
};

const getMonthStart = (today) =>
  new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0, 0);

const getMonthEnd = (today) =>
  new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

const getRangeBounds = (range) => {
  const today = new Date();
  const todayStart = startOfDay(today);
  const todayEnd = endOfDay(today);

  switch (range) {
    case "today":
      return { start: todayStart, end: todayEnd };
    case "week":
      return { start: getWeekStart(today), end: getWeekEnd(today) };
    case "month":
      return { start: getMonthStart(today), end: getMonthEnd(today) };
    default:
      return null;
  }
};

export const matchesQuickDateRange = (value, range = "all") => {
  if (range === "all") return true;

  const date = toDate(value);
  if (!date) return false;

  if (range === "upcoming") {
    const today = startOfDay(new Date());
    return date >= today;
  }

  const bounds = getRangeBounds(range);
  if (!bounds) return true;

  return date >= bounds.start && date <= bounds.end;
};

export const intervalMatchesQuickDateRange = (
  startValue,
  endValue,
  range = "all",
) => {
  if (range === "all") return true;

  const start = startOfDay(startValue);
  const end = endOfDay(endValue || startValue);

  if (!start || !end) return false;

  if (range === "upcoming") {
    const today = startOfDay(new Date());
    return end >= today;
  }

  const bounds = getRangeBounds(range);
  if (!bounds) return true;

  return start <= bounds.end && end >= bounds.start;
};

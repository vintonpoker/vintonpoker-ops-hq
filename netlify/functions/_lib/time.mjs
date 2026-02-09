export function startOfDayMs(tzOffsetMinutes = null, date = new Date()) {
  // Simple UTC midnight default. If tzOffsetMinutes provided, compute local midnight.
  const d = new Date(date);
  if (tzOffsetMinutes === null) {
    d.setUTCHours(0, 0, 0, 0);
    return d.getTime();
  }
  // Shift to local, truncate, shift back.
  const ms = d.getTime();
  const localMs = ms + tzOffsetMinutes * 60_000;
  const local = new Date(localMs);
  local.setUTCHours(0, 0, 0, 0);
  return local.getTime() - tzOffsetMinutes * 60_000;
}

export function rangeUnixSeconds({ startMs, endMs }) {
  return {
    start: Math.floor(startMs / 1000),
    end: Math.floor(endMs / 1000),
  };
}

export function getTodayRangeInTZ(tz: string): { startUtc: Date; endUtc: Date } {
  const now = new Date();
  const tzNow = new Date(now.toLocaleString('en-US', { timeZone: tz }));
  const diff = now.getTime() - tzNow.getTime();

  const startLocal = new Date(tzNow);
  startLocal.setHours(0, 0, 0, 0);
  const endLocal = new Date(tzNow);
  endLocal.setHours(23, 59, 59, 999);

  const startUtc = new Date(startLocal.getTime() + diff);
  const endUtc = new Date(endLocal.getTime() + diff);

  return { startUtc, endUtc };
}

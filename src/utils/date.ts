export function startOfDayUTC(d: Date | string) {
  const x = new Date(d);
  return new Date(Date.UTC(x.getUTCFullYear(), x.getUTCMonth(), x.getUTCDate(), 0, 0, 0, 0));
}

export function nextDayUTC(d: Date | string) {
  const s = startOfDayUTC(d);
  return new Date(Date.UTC(s.getUTCFullYear(), s.getUTCMonth(), s.getUTCDate() + 1, 0, 0, 0, 0));
}

export function todayStartUTC() {
  return startOfDayUTC(new Date());
}

export function todayNextUTC() {
  return nextDayUTC(new Date());
}

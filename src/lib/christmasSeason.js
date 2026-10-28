export function isChristmasSeason(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en', { timeZone: 'Europe/Paris', month: 'numeric', day: 'numeric' }).formatToParts(date);
  const month = Number(parts.find(p => p.type === 'month')?.value);
  const day = Number(parts.find(p => p.type === 'day')?.value);
  return month === 12 || (month === 1 && day <= 5);
}

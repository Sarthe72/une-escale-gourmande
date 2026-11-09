export function isChristmasSeason(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en', { timeZone: 'Europe/Paris', month: 'numeric', day: 'numeric',hour:'numeric',minute:'numeric',hourCycle:'h23' }).formatToParts(date);
  const month = Number(parts.find(p => p.type === 'month')?.value);
  const day = Number(parts.find(p => p.type === 'day')?.value);
  const hour=Number(parts.find(p=>p.type==='hour')?.value);
  const minute=Number(parts.find(p=>p.type==='minute')?.value);
  return (month === 12 && !(day===1&&hour===0&&minute===0)) || (month === 1 && day <= 5);
}

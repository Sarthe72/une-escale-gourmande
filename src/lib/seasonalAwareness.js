/** Recurring calendar dates in France, independent of the visitor's timezone. */
export function awarenessCampaign(date = new Date()) {
  const month = new Intl.DateTimeFormat('en', { timeZone: 'Europe/Paris', month: 'numeric' }).format(date);
  return month === '10' ? 'octobre-rose' : month === '11' ? 'movember' : null;
}

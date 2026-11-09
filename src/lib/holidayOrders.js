import {scheduledFlag} from './holidaySchedule.js';
export const dishes = [
  { id: 'tartelette', name: 'Tartelette périgourdine', price: 1000 },
  { id: 'truite', name: 'Truite de Borrèze en gravlax', price: 900 },
  { id: 'volaille', name: 'Suprême de volaille farcie', price: 1400 },
  { id: 'poisson', name: 'Lotte à l’américaine', price: 1500 },
  { id: 'chocolat', name: 'Royal chocolat', price: 550 },
  { id: 'ananas', name: 'Entremets ananas et yuzu', price: 550 },
];
export const pickups = [
  { id: '2026-12-24', label: '24 décembre · 14 h–18 h', group: 'CHRISTMAS' },
  { id: '2026-12-26', label: '26 décembre · 9 h–12 h', group: 'CHRISTMAS' },
  { id: '2026-12-31', label: '31 décembre · 14 h–19 h', group: 'NEWYEAR' },
  { id: '2027-01-01', label: '1er janvier · 9 h–12 h', group: 'NEWYEAR' },
  { id: '2027-01-02', label: '2 janvier · 9 h–12 h', group: 'NEWYEAR' },
];
export function validateOrder(input, config, now = Date.now()) {
  if (!scheduledFlag(config.HOLIDAY_ORDERS_OPEN,config.HOLIDAY_LAUNCH_AT,now)) throw new Error('Les commandes ne sont pas encore ouvertes.');
  const pickup = pickups.find(p => p.id === input.pickup);
  const deadline = pickup && Date.parse(config[`HOLIDAY_DEADLINE_${pickup.group}`]);
  if (!Number.isFinite(deadline) || now >= deadline) throw new Error('Ce retrait n’est plus disponible.');
  const name = String(input.name || '').trim();
  const firstName = String(input.firstName || '').trim();
  const phone = String(input.phone || '').replace(/[\s().-]/g, '');
  const email = String(input.email || '').trim().toLowerCase();
  const notes = String(input.notes || '').trim();
  if (notes.length > 1000) throw new Error('Les informations complémentaires sont limitées à 1 000 caractères.');
  if (!name || name.length > 100 || !firstName || firstName.length > 100 || !/^\+?[0-9]{10,15}$/.test(phone) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) throw new Error('Renseignez votre nom, votre prénom, un téléphone et une adresse e-mail valides.');
  if (!['cheque', 'cash', 'instant_transfer'].includes(input.payment)) throw new Error('Choisissez un mode de paiement.');
  if (!Array.isArray(input.items) || !input.items.length || input.items.length > dishes.length) throw new Error('Choisissez vos plats.');
  const seen = new Set();
  const items = input.items.map(item => {
    const dish = dishes.find(d => d.id === item.id);
    if (!dish || dish.price === null || seen.has(item.id) || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 100) throw new Error('Quantité ou plat indisponible.');
    seen.add(item.id);
    return { id: dish.id, name: dish.name, price: dish.price, quantity: item.quantity };
  });
  return { name, firstName, phone, email, notes, pickup: pickup.id, payment: input.payment, items, total: items.reduce((sum, i) => sum + i.price * i.quantity, 0) };
}

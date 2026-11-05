export const questions = [
  { id: 'minimum', section: 'Commandes', label: 'Quel minimum de commande souhaites-tu ?', hint: 'Par exemple : 2 menus, un montant minimum, ou aucun minimum.' },
  { id: 'composition', section: 'Commandes', label: 'Menu complet obligatoire ou plats à la carte ?', hint: 'Peut-on commander uniquement une entrée, un plat ou un dessert ?' },
  { id: 'retraits', section: 'Retraits', label: 'Quels jours et horaires de retrait proposes-tu ?', hint: 'Précise chaque date et son créneau. La période envisagée est du 23 décembre au 2 janvier.' },
  { id: 'adresse', section: 'Retraits', label: 'Quelle adresse et quelles indications pour le retrait ?' },
  { id: 'livraison', section: 'Retraits', label: 'Confirmes-tu le retrait uniquement, sans livraison ?', hint: 'C’est le scénario envisagé, mais pas encore confirmé.' },
  { id: 'cloture', section: 'Retraits', label: 'Quelle date limite pour commander avant chaque retrait ?' },
  { id: 'capacite', section: 'Retraits', label: 'Quel maximum de portions ou de commandes peux-tu accepter ?', hint: 'Tu peux préciser une limite par jour ou par plat.' },
  { id: 'encaissement', section: 'Paiement et confirmation', label: 'Quand souhaites-tu encaisser ?', hint: 'Chèque, espèces et virement immédiat sont retenus. Règlement au retrait, à l’avance, ou acompte ?' },
  { id: 'virement', section: 'Paiement et confirmation', label: 'Comment souhaites-tu organiser le virement immédiat ?', hint: 'À l’avance ou au retrait ? N’inscris pas de coordonnées bancaires dans ce formulaire.' },
  { id: 'confirmation', section: 'Paiement et confirmation', label: 'La commande est-elle confirmée automatiquement ou après ton accord ?' },
  { id: 'modification', section: 'Paiement et confirmation', label: 'Jusqu’à quand un client peut-il modifier ou annuler ?' },
  { id: 'temperature', section: 'En cuisine', label: 'Les plats sont-ils remis froids à réchauffer, ou chauds ?' },
  { id: 'consignes', section: 'En cuisine', label: 'Quelles consignes de conservation et de réchauffage fournir ?' },
  { id: 'allergenes', section: 'En cuisine', label: 'Quels allergènes et quelles adaptations pour chaque plat ?', hint: 'La composition ne suffit pas à garantir la liste des allergènes : précise aussi les ingrédients des sauces et préparations.' },
  { id: 'emballages', section: 'En cuisine', label: 'Les emballages sont-ils inclus ? Y a-t-il une consigne ?' },
  { id: 'notifications', section: 'Organisation', label: 'Comment veux-tu être averti des nouvelles commandes ?', hint: 'Par mail, dans Escale Pro, ou autre ?' },
  { id: 'publication', section: 'Organisation', label: 'Quand souhaites-tu publier le menu et ouvrir les commandes ?' },
  { id: 'notes', section: 'Organisation', label: 'Autres précisions ou besoins pour ton outil ?', hint: 'Par exemple : récapitulatif par retrait, quantités de chaque plat, liste des règlements.' },
];

export function isAnswered(value) {
  const normalized = value.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[.!?]+$/g, '').trim();
  return normalized.length > 0 && normalized !== 'a decider';
}

export function validateAnswers(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return null;
  const answers = {};
  for (const { id } of questions) {
    if (typeof input[id] !== 'string' || input[id].length > 2000) return null;
    if (id !== 'notes' && !isAnswered(input[id])) return null;
    answers[id] = input[id].trim();
  }
  return answers;
}

export function authorizedToken(token, expected) {
  return typeof expected === 'string' && expected.length >= 32 && token === expected;
}

export const APP_NAME = 'Produits Locaux';
export const DEFAULT_CURRENCY = 'XOF';


export const SHIPPING_METHODS = {
  local: { label: 'Livraison standard (24-72h)', price: 3000 },
  international: { label: 'Expédition express (5-10 jours)', price: 5000 },
  diaspora: { label: 'Retrait / point relais', price: 0 },
};

export const PAYMENT_METHODS = {
  wave: { label: 'Wave', icon: '💳' },
  orange_money: { label: 'Orange Money', icon: '💰' },
  visa: { label: 'Carte Visa', icon: '💳' },
};

export const ORDER_STATUS = {
  pending: { label: 'En attente', color: 'warning' },
  processing: { label: 'En cours', color: 'info' },
  shipped: { label: 'Expédiée', color: 'primary' },
  delivered: { label: 'Livrée', color: 'success' },
  cancelled: { label: 'Annulée', color: 'danger' },
};

import {
  Boxes,
  LayoutDashboard,
  Package,
  Settings,
  Store,
  Truck,
} from 'lucide-react';

export function buildVendorMenuSections(pendingOrders = 0) {
  return [
    {
      title: 'Principal',
      items: [
        { key: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard, path: '/vendeur/dashboard' },
        { key: 'orders', label: 'Commandes', icon: Package, path: '/vendeur/orders', badge: pendingOrders },
        { key: 'products', label: 'Produits', icon: Boxes, path: '/vendeur/products' },
        { key: 'shipping', label: 'Expéditions', icon: Truck, path: '/vendeur/shipments' },
      ],
    },
    {
      title: 'Compte',
      items: [
        { key: 'shop', label: 'Profil boutique', icon: Store, path: '/vendeur/shop-profile' },
        { key: 'settings', label: 'Paramètres', icon: Settings, path: '/vendeur/settings' },
      ],
    },
  ];
}

import { createContext, useContext, useMemo, useState } from 'react';

const MESSAGES = {
  fr: {
    loading: 'Chargement...',
    cart_title: 'Panier',
    checkout_title: 'Finaliser la commande',
    login_title: 'Connexion',
    register_title: 'Inscription',
    products_title: 'Le meilleur du Senegal, livre partout dans le monde',
    products_overline: 'Produits locaux africains',
    products_tagline: 'Commandez directement aupres des producteurs. Livraison locale ou expedition internationale pour la diaspora.',
    checkout_delivery: 'Livraison',
    checkout_payment: 'Paiement',
    checkout_confirmation: 'Confirmation',
  },
  en: {
    loading: 'Loading...',
    cart_title: 'Cart',
    checkout_title: 'Checkout',
    login_title: 'Login',
    register_title: 'Register',
    products_title: 'The best of Senegal, delivered worldwide',
    products_overline: 'African local products',
    products_tagline: 'Order directly from producers. Local delivery or international shipping for the diaspora.',
    checkout_delivery: 'Delivery',
    checkout_payment: 'Payment',
    checkout_confirmation: 'Confirmation',
  },
};

const I18nContext = createContext({
  locale: 'fr',
  setLocale: () => {},
  t: (key) => key,
});

export function I18nProvider({ children }) {
  const [locale, setLocale] = useState('fr');

  const value = useMemo(() => {
    return {
      locale,
      setLocale,
      t: (key) => MESSAGES[locale]?.[key] || key,
    };
  }, [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}

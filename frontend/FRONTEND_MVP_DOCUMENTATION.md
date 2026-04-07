# 🚀 Frontend MVP - Documentation Complète

## 📊 Résumé du Projet

Frontend React complet pour une application e-commerce de produits locaux avec :
- ✅ Authentification (Login/Register)
- ✅ Catalogue de produits
- ✅ Recherche et filtrage
- ✅ Gestion du panier
- ✅ Checkout multi-étapes
- ✅ Gestion des commandes
- ✅ Profil utilisateur
- ✅ Responsive design avec Tailwind CSS

---

## 📁 Architecture & Structure

```
src/
├── components/
│   ├── common/
│   │   ├── Navbar.jsx              # Navigation principale
│   │   ├── ProductCard.jsx         # Carte produit réutilisable
│   │   ├── CartItem.jsx            # Item du panier
│   │   ├── Button.jsx              # Bouton réutilisable
│   │   ├── Loading.jsx             # Loader
│   │   ├── ErrorMessage.jsx        # Afficheur d'erreurs
│   │   └── PriceTag.jsx            # Afficheur de prix
│   ├── products/                   # (À développer)
│   ├── cart/                       # (À développer)
│   └── orders/                     # (À développer)
├── context/
│   ├── AuthContext.js              # Gestion authentification
│   └── CartContext.js              # Gestion panier
├── hooks/
│   └── index.js                    # Hooks personnalisés
├── pages/
│   ├── Login.jsx                   # Page connexion
│   ├── Register.jsx                # Page inscription
│   ├── Home.jsx                    # Accueil
│   ├── Products.jsx                # Catalogue
│   ├── ProductDetail.jsx           # Détail produit
│   ├── Cart.jsx                    # Panier
│   ├── Checkout.jsx                # Commande (3 étapes)
│   ├── Orders.jsx                  # Mes commandes
│   ├── OrderDetail.jsx             # Détail commande
│   ├── OrderConfirmation.jsx       # Confirmation commande
│   └── Profile.jsx                 # Profil utilisateur
├── services/
│   ├── api.js                      # Config axios
│   ├── authService.js              # Services auth
│   ├── productService.js           # Services produits
│   ├── orderService.js             # Services commandes
│   ├── userService.js              # Services utilisateur
│   └── cartService.js              # Services panier (localStorage)
├── App.js                          # Configuration app
├── App.css                         # Styles globaux
└── index.js                        # Entry point
```

---

## 🔑 Fonctionnalités Principales

### 1. **Authentification** 
- Login avec email/password
- Inscription avec validation
- Token Bearer stocké en localStorage
- Contexte Auth avec hooks

```javascript
// Utilisation
const { user, isAuthenticated, login, logout } = useAuth();
```

### 2. **Gestion du Panier**
- Ajout/Suppression de produits
- Modification de quantités
- Stockage localStorage
- Contexte Cart avec hooks

```javascript
// Utilisation
const { cartItems, addToCart, removeFromCart, cartTotal } = useCart();
```

### 3. **Catalogue de Produits**
- Liste avec recherche
- Filtrage par catégorie
- Pagination
- Détail produit complet

### 4. **Checkout 3 Étapes**
- Étape 1: Livraison (adresse, téléphone)
- Étape 2: Paiement (carte, virement)
- Étape 3: Vérification & confirmation

### 5. **Gestion des Commandes**
- Liste avec filtres
- Détails complets
- Suivi en temps réel
- Statuts multiples

### 6. **Profil Utilisateur**
- Infos personnelles
- Gestion adresses
- Changement mot de passe
- Historique

---

## 🎨 Design & Styling

### Couleurs Tailwind
```javascript
primary:    '#E67E22'   // Orange
secondary:  '#8B4513'   // Marron
success:    '#27AE60'   // Vert
danger:     '#E74C3C'   // Rouge
```

### Breakpoints
- Mobile:   < 640px
- Tablet:   640px - 1024px
- Desktop:  > 1024px

### Components Réutilisables
- `<Button>` - Bouton avec variants
- `<Loading>` - Loader avec message
- `<ErrorMessage>` - Afficheur erreurs
- `<PriceTag>` - Formatage prix
- `<ProductCard>` - Carte produit
- `<CartItem>` - Item panier
- `<Navbar>` - Navigation

---

## 🔌 Services API

### authService
```javascript
authService.login(email, password)
authService.register(userData)
authService.logout()
authService.getCurrentUser()
authService.isAuthenticated()
```

### productService
```javascript
productService.getAll(params)
productService.getById(id)
productService.search(query)
productService.getByCategory(category)
productService.getFeatured()
productService.getDiscounted()
```

### orderService
```javascript
orderService.create(orderData)
orderService.getAll(params)
orderService.getById(id)
orderService.cancel(id)
orderService.updateStatus(id, status)
orderService.getTrackingInfo(id)
```

### userService
```javascript
userService.getProfile()
userService.updateProfile(data)
userService.changePassword(current, new)
userService.getAddresses()
userService.addAddress(data)
userService.updateAddress(id, data)
userService.deleteAddress(id)
```

### cartService
```javascript
cartService.getCart()
cartService.addToCart(product, quantity)
cartService.removeFromCart(productId)
cartService.updateQuantity(productId, quantity)
cartService.clearCart()
cartService.getCartTotal()
cartService.getCartCount()
```

---

## 🪝 Hooks Personnalisés

### useAuth()
```javascript
const { user, isAuthenticated, isLoading, login, register, logout } = useAuth();
```

### useCart()
```javascript
const { 
  cartItems, 
  cartTotal, 
  cartCount, 
  addToCart, 
  removeFromCart, 
  updateQuantity, 
  clearCart 
} = useCart();
```

### useAsync()
```javascript
const { data, isLoading, error, execute, reset } = useAsync(asyncFunction);
```

### usePagination()
```javascript
const { 
  currentItems, 
  totalPages, 
  currentPage, 
  goToPage, 
  nextPage, 
  prevPage 
} = usePagination(items, itemsPerPage);
```

### useForm()
```javascript
const { values, handleChange, handleSubmit, reset } = useForm(
  initialValues,
  onSubmit
);
```

### useLocalStorage()
```javascript
const [value, setValue] = useLocalStorage(key, initialValue);
```

---

## 🌍 Routes

```
Publiques:
  /login                    - Connexion
  /register                 - Inscription

Protégées:
  /                         - Accueil
  /products                 - Catalogue
  /products/:id             - Détail produit
  /cart                     - Panier
  /checkout                 - Commande
  /orders                   - Mes commandes
  /orders/:id               - Détail commande
  /orders/:id/confirmation  - Confirmation
  /profile                  - Profil
```

---

## 📦 Dépendances

```json
{
  "react": "^19.2.4",
  "react-dom": "^19.2.4",
  "react-router-dom": "^7.13.2",
  "axios": "^1.14.0",
  "tailwindcss": "^3.4.19",
  "postcss": "^8.5.8",
  "autoprefixer": "^10.4.27"
}
```

---

## 🚀 Démarrage

```bash
# Installation
npm install

# Développement
npm start

# Build
npm run build

# Test
npm test
```

---

## ✅ Checkliste MVP

### Jour 1-2 : Setup
- [x] Structure React + Vite
- [x] Tailwind configuré
- [x] Services API
- [x] Auth (Login/Register)

### Jour 3-5 : Pages Client
- [x] Page Accueil
- [x] Catalogue Produits
- [x] Détail Produit
- [x] Panier
- [x] Checkout (3 étapes)

### Jour 6-7 : Commandes & Profil
- [x] Liste Commandes
- [x] Détail Commande
- [x] Confirmation Commande
- [x] Profil Utilisateur

### Bonus
- [x] Contextes (Auth, Cart)
- [x] Composants réutilisables
- [x] Hooks personnalisés
- [x] Responsive design

---

## 🔄 Workflow Utilisateur

```
1. Usager non authentifié
   ↓
2. Login/Register
   ↓
3. Accueil (feed produits)
   ↓
4. Parcourir produits/recherche
   ↓
5. Voir détail produit
   ↓
6. Ajouter au panier
   ↓
7. Modifier panier
   ↓
8. Checkout (3 étapes)
   ↓
9. Confirmation commande
   ↓
10. Historique commandes
    ↓
11. Profil utilisateur
```

---

## 🐛 Gestion Erreurs

### Intercepteur Axios
```javascript
// Ajout token automatique
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Try-Catch Pattern
```javascript
try {
  // Requête
} catch (err) {
  // Affichage erreur
  setError(err.response?.data?.message || 'Erreur');
}
```

---

## 📱 Responsive Design

```
Mobile First Approach:
- 1 colonne par défaut
- md: 2-3 colonnes
- lg: 3-4 colonnes
- xl: 4 colonnes
```

---

## 🎯 Performance

- [x] Lazy loading images
- [x] Code splitting (React Router)
- [x] Memoization (useCallback, useMemo)
- [x] Local state management
- [x] Optimistic updates

---

## 📝 Conventions de Code

### Nommage
- Components: `PascalCase` (ProductCard.jsx)
- Hooks: `camelCase` (useCart.js)
- Services: `camelCase` (productService.js)
- Variables: `camelCase`
- Constants: `UPPER_SNAKE_CASE`

### Fichiers
- Components: `.jsx`
- Services: `.js`
- Styles: Tailwind inline ou `.css`

### Imports
```javascript
// React
import { useState, useEffect } from 'react';

// Routing
import { useNavigate, Link } from 'react-router-dom';

// Services
import { productService } from '../services/productService';

// Contexts
import { useCart } from '../context/CartContext';

// Components
import Button from '../components/common/Button';
```

---

## 🔮 Prochaines Améliorations

- [ ] Notifications toast
- [ ] Récupération mot de passe
- [ ] Wishlist/Favoris
- [ ] Avis produits
- [ ] Coupons/Codes promo
- [ ] Notifications push
- [ ] Intégration paiement réel
- [ ] Analytics
- [ ] Tests unitaires
- [ ] E2E tests

---

## 📞 Support

Pour toute question, consultez la documentation du backend ou les fichiers d'aide dans le dossier `/docs`.

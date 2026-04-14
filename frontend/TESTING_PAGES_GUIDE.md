# 🧪 GUIDE: Comment Tester Toutes les Pages

## 🚀 Option 1: DÉMARRAGE RAPIDE (Recommandée pour les tests)

### 1️⃣ Démarrer le serveur
```bash
cd frontend
npm start
```
✅ Serveur démarre sur http://localhost:3000

### 2️⃣ Tests des Pages

#### **Routes PUBLIQUES** (Sans connexion)
```
http://localhost:3000/              → Home (Accueil)
http://localhost:3000/login         → Page login
http://localhost:3000/register      → Page inscription
```

#### **Routes PROTÉGÉES** (Nécessite connexion)
Après connexion, vous pouvez accéder à:
```
http://localhost:3000/products      → Catalogue des produits
http://localhost:3000/products/1    → Détail produit #1
http://localhost:3000/cart          → Panier
http://localhost:3000/checkout      → Checkout
http://localhost:3000/orders        → Mes commandes
http://localhost:3000/orders/1      → Détail commande #1
http://localhost:3000/profile       → Mon profil
```

---

## 🎯 Option 2: WORKFLOW DE TEST COMPLET

**NOTE**: La page d'accueil `/` est maintenant accessible sans connexion. Vous pouvez consulter les produits publiquement!

### Étape 1: Se Connecter (Optionnel pour la Home)

1. Accédez à http://localhost:3000/login
2. Utilisez les credentials de test:
   ```
   Email: test@example.com
   Password: password123
   ```
3. Cliquez "Se Connecter"

**Résultat**: Vous êtes redirigé vers `/` (Home)

### Étape 2: Naviguer via la Navbar

Une fois connecté:
- ✅ **Logo/Accueil**: Cliquez pour aller à `/`
- ✅ **Produits**: Cliquez pour aller à `/products`
- ✅ **Panier** (🛒): Cliquez pour aller à `/cart`
- ✅ **Compte**: Menu dropdown avec "Commandes", "Profil", "Déconnexion"

### Étape 3: Tester Chaque Page

#### 📱 **HOME** - http://localhost:3000/
```
✅ Affiche: Bienvenue, Produits en vedette, Produits en solde
✅ Boutons: Voir tous les produits, Voir tous les soldés
✅ Stats: Affichage des statistiques
```

#### 🛍️ **PRODUCTS** - http://localhost:3000/products
```
✅ Recherche par nom
✅ Filtre par catégorie
✅ Affichage grille de produits
✅ Clic sur produit → détail
```

#### 🔍 **PRODUCT DETAIL** - http://localhost:3000/products/1
```
✅ Image produit grande taille
✅ Description complète
✅ Prix et discount
✅ Évaluations
✅ Sélecteur quantité
✅ Bouton "Ajouter au Panier"
```

#### 🛒 **CART** - http://localhost:3000/cart
```
✅ Liste des articles ajoutés
✅ Modifier quantité (+/-)
✅ Supprimer article
✅ Total calculé
✅ Bouton "Passer la commande"
```

#### 💳 **CHECKOUT** - http://localhost:3000/checkout
```
✅ Étape 1: Informations livraison
✅ Étape 2: Informations paiement
✅ Étape 3: Vérification commande
✅ Bouton "Confirmer commande"
```

#### 📦 **ORDERS** - http://localhost:3000/orders
```
✅ Liste des commandes de l'utilisateur
✅ Filtrage par statut
✅ Clic sur commande → détail
```

#### 📋 **ORDER DETAIL** - http://localhost:3000/orders/1
```
✅ Numéro de commande
✅ Articles commandés
✅ Adresse de livraison
✅ Statut et suivi
```

#### 👤 **PROFILE** - http://localhost:3000/profile
```
✅ Infos personnelles (modifier)
✅ Adresses (ajouter/modifier)
✅ Sécurité (changer mot de passe)
```

---

## 🛠️ Option 3: CRÉER UNE PAGE DE TEST (Page Dashboard)

Si vous voulez une page avec **tous les liens** pour naviguer rapidement:

### Créer `src/pages/TestDashboard.jsx`:

```jsx
import { useNavigate } from 'react-router-dom';

export default function TestDashboard() {
  const navigate = useNavigate();

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-center">🧪 Dashboard de Test</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <button
          onClick={() => navigate('/')}
          className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded"
        >
          🏠 Home
        </button>
        
        <button
          onClick={() => navigate('/products')}
          className="bg-green-500 hover:bg-green-600 text-white p-4 rounded"
        >
          🛍️ Products
        </button>
        
        <button
          onClick={() => navigate('/products/1')}
          className="bg-purple-500 hover:bg-purple-600 text-white p-4 rounded"
        >
          🔍 Product Detail
        </button>
        
        <button
          onClick={() => navigate('/cart')}
          className="bg-orange-500 hover:bg-orange-600 text-white p-4 rounded"
        >
          🛒 Cart
        </button>
        
        <button
          onClick={() => navigate('/checkout')}
          className="bg-red-500 hover:bg-red-600 text-white p-4 rounded"
        >
          💳 Checkout
        </button>
        
        <button
          onClick={() => navigate('/orders')}
          className="bg-indigo-500 hover:bg-indigo-600 text-white p-4 rounded"
        >
          📦 Orders
        </button>
        
        <button
          onClick={() => navigate('/orders/1')}
          className="bg-cyan-500 hover:bg-cyan-600 text-white p-4 rounded"
        >
          📋 Order Detail
        </button>
        
        <button
          onClick={() => navigate('/profile')}
          className="bg-pink-500 hover:bg-pink-600 text-white p-4 rounded"
        >
          👤 Profile
        </button>
      </div>
    </div>
  );
}
```

### Puis ajouter dans `App.js` (après les autres routes protégées):

```javascript
<Route
  path="/test-dashboard"
  element={
    <ProtectedRoute>
      <TestDashboard />
    </ProtectedRoute>
  }
/>
```

Accédez à: http://localhost:3000/test-dashboard

---

## 📊 Tableau Récapitulatif des URLs

| Page | URL | Status | Accès |
|------|-----|--------|-------|
| Login | `/login` | ✅ | Public |
| Register | `/register` | ✅ | Public |
| Home | `/` | ✅ | Authentifié |
| Products | `/products` | ✅ | Authentifié |
| Product Detail | `/products/:id` | ✅ | Authentifié |
| Cart | `/cart` | ✅ | Authentifié |
| Checkout | `/checkout` | ✅ | Authentifié |
| Orders | `/orders` | ✅ | Authentifié |
| Order Detail | `/orders/:id` | ✅ | Authentifié |
| Profile | `/profile` | ✅ | Authentifié |
| Test Dashboard | `/test-dashboard` | ✅✨ | Authentifié (Optionnel) |

---

## 🔧 Vérifier dans la Console

Ouvrez la console DevTools (F12) dans le navigateur pour voir:

### Erreurs réseau
```javascript
// Les appels API vers le backend
GET /api/products
POST /api/auth/login
GET /api/orders
```

### Logs personnalisés
```javascript
console.log('Utilisateur connecté:', user);
console.log('Articles du panier:', cartItems);
```

---

## ✅ Checklist de Test

- [ ] Accédez à `/login`
- [ ] Connectez-vous
- [ ] Naviguez vers `/` (Home)
- [ ] Cliquez "Voir tous les produits" → `/products`
- [ ] Cliquez sur un produit → `/products/:id`
- [ ] Cliquez "Ajouter au panier"
- [ ] Naviguez vers `/cart`
- [ ] Modifiez quantités
- [ ] Cliquez "Passer la commande" → `/checkout`
- [ ] Complétez les 3 étapes
- [ ] Confirmez → `/orders/:id/confirmation`
- [ ] Naviguez vers `/orders`
- [ ] Cliquez sur une commande → `/orders/:id`
- [ ] Cliquez sur compte → `/profile`
- [ ] Modifiez profil
- [ ] Déconnectez-vous

---

## 🐛 Troubleshooting

### ❌ Page blanche après connexion?
```
✅ Vérifiez la console pour les erreurs
✅ Vérifiez que /api/products répond
✅ Vérifiez le token dans localStorage
```

### ❌ Redirigé vers login sans fin?
```
✅ Vérifiez authService.getCurrentUser()
✅ Vérifiez le token stocké
✅ Vérifiez le contexte Auth
```

### ❌ Produits ne s'affichent pas?
```
✅ Vérifiez le backend répond sur /api/products
✅ Vérifiez les données retournées
✅ Vérifiez le format des données
```

---

## 🎯 Commandes Utiles

```bash
# Démarrer le serveur
npm start

# Construire pour production
npm run build

# Lancer les tests
npm test

# Checker les erreurs
npm run lint
```

---

**Status**: ✅ Prêt pour les tests!

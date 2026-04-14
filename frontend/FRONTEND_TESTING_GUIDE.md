# 🧪 Frontend MVP - Guide de Test Rapide

## ✅ Vérification Rapide

### 1. **Serveur est-il accessible?**
```
✅ http://localhost:3000 - ONLINE
```

### 2. **Accès au Frontend**
- [ ] Ouvrir http://localhost:3000
- [ ] Devrait rediriger vers /login (non authentifié)

---

## 🧪 Scénarios de Test

### Scénario 1: Authentification
```
1. Accéder à http://localhost:3000
2. Voir page Login
3. Cliquer "S'inscrire"
4. Voir page Register
5. Remplir formulaire (email fictif)
   - Nom: Test User
   - Email: test@example.com
   - Password: Password123
6. Soumettre
7. ✅ Devrait créer utilisateur (si backend OK)
```

### Scénario 2: Navigation
```
1. Après login, voir la Navbar
2. Logo "Produits Locaux" clic → Accueil
3. Bouton "Catalogue" → Page Produits
4. Bouton "Mes Commandes" → Historique
5. Bouton "Profil" → Profil utilisateur
6. Badge Panier affiche nombre d'articles
```

### Scénario 3: Catalogue & Recherche
```
1. Aller à /products
2. Voir liste produits (si API OK)
3. Entrer recherche → filtrer résultats
4. Sélectionner catégorie → filtrer
5. Cliquer "Détails" sur produit
6. Voir page détail avec image, prix, description
```

### Scénario 4: Panier
```
1. Sur page produit, cliquer "Ajouter"
2. Badge panier augmente (+1)
3. Aller à /cart
4. Voir produit dans panier
5. Modifier quantité (+/-)
6. Voir total mis à jour
7. Cliquer "Vider" → confirmation
8. Après confirmation → panier vide
```

### Scénario 5: Checkout
```
1. Sur panier, cliquer "Procéder au paiement"
2. Étape 1: Livraison
   - Remplir adresse, téléphone, ville
   - Cliquer "Continuer"
3. Étape 2: Paiement
   - Sélectionner méthode (Carte/Virement)
   - Si Carte → remplir champs
   - Cliquer "Continuer"
4. Étape 3: Vérification
   - Voir résumé complet
   - Cliquer "Confirmer la commande"
5. ✅ Redirection vers confirmation
```

### Scénario 6: Commandes
```
1. Aller à /orders
2. Voir liste de commandes (si backend OK)
3. Filtrer par statut
4. Cliquer "Détails"
5. Voir infos complètes, produits, suivi
```

### Scénario 7: Profil
```
1. Aller à /profile
2. Onglet "Profil":
   - Voir infos utilisateur
   - Modifier et sauvegarder
3. Onglet "Adresses":
   - Ajouter adresse
   - Voir liste
   - Supprimer
4. Onglet "Paramètres":
   - Changer mot de passe
   - Voir messages de succès/erreur
```

---

## 🔍 Points de Vérification

### Performance
- [ ] Page home charge en < 2s
- [ ] Produits affichent avec images
- [ ] Pas de lag lors du scroll
- [ ] Boutons réactifs

### Responsive
- [ ] Desktop (1920x1080): OK
- [ ] Tablette (768x1024): OK
- [ ] Mobile (375x667): OK
- [ ] Éléments bien espacés

### Fonctionnalités
- [ ] Authentification marche
- [ ] Token stocké en localStorage
- [ ] Recherche produits marche
- [ ] Panier persiste (localStorage)
- [ ] Checkout complet
- [ ] Navigation correcte

### Erreurs
- [ ] Messages d'erreur affichés
- [ ] Pas d'erreur console (sauf warnings)
- [ ] Gestion 404 correct
- [ ] Fallback vs erreur API

---

## 🐛 Problèmes Courants

### "Module not found"
```
→ Vérifier chemin d'import
→ Vérifier le fichier existe
→ npm install
→ Redémarrer npm start
```

### "Cannot read property 'X' of undefined"
```
→ Vérifier API response
→ Ajouter null check
→ Vérifier structure de données
```

### "Token not sending"
```
→ Vérifier localStorage
→ Ouvrir DevTools > Application > localStorage
→ Token doit être présent
→ Vérifier intercepteur axios
```

### "Page blanche"
```
→ Ouvrir DevTools (F12)
→ Vérifier console errors
→ Vérifier Network tab
→ Vérifier app.js imports
```

---

## 📊 Checklist Complète

- [ ] Frontend accessible (http://localhost:3000)
- [ ] Page login affichée
- [ ] Inscription marche
- [ ] Login marche
- [ ] Token en localStorage
- [ ] Navigation marche
- [ ] Accueil affiche produits (si API OK)
- [ ] Recherche marche
- [ ] Détail produit marche
- [ ] Ajouter panier marche
- [ ] Panier affiche articles
- [ ] Checkout marche (3 étapes)
- [ ] Commande créée (si API OK)
- [ ] Historique commandes affiche
- [ ] Profil marche
- [ ] Adresses marche
- [ ] Paramètres marche
- [ ] Logout marche
- [ ] Pas d'erreurs console
- [ ] Responsive sur mobile

---

## 🚀 Commandes Utiles

```bash
# Démarrer
npm start

# Build
npm run build

# Tests
npm test

# Linter
npm run lint

# Clear cache
npm cache clean --force
```

---

## 📱 URLs à Tester

```
Publiques:
- http://localhost:3000/login
- http://localhost:3000/register

Protégées (après login):
- http://localhost:3000/
- http://localhost:3000/products
- http://localhost:3000/products/1 (ou id valide)
- http://localhost:3000/cart
- http://localhost:3000/checkout
- http://localhost:3000/orders
- http://localhost:3000/orders/1 (ou id valide)
- http://localhost:3000/profile
```

---

## 🎓 Pour Les Développeurs

### Ajouter une page
```javascript
// 1. Créer src/pages/NewPage.jsx
// 2. Ajouter route dans App.js
// 3. Ajouter lien dans Navbar si nécessaire
```

### Ajouter un nouveau service
```javascript
// 1. Créer src/services/newService.js
// 2. Exporter fonctions
// 3. Importer et utiliser dans pages/components
```

### Ajouter un hook
```javascript
// 1. Créer dans src/hooks/index.js
// 2. Exporter fonction
// 3. Importer et utiliser
```

### Style custom
```javascript
// 1. Utiliser classes Tailwind
// 2. Ou ajouter CSS dans src/App.css
// 3. Importer en haut du fichier
```

---

## 📞 FAQ

**Q: Pourquoi page reste blanche?**
A: Vérifier console (F12), vérifier si Backend OK, redémarrer npm start

**Q: Token disparu après refresh?**
A: Normal, React recharge, AuthContext le récupère de localStorage

**Q: Panier vide après refresh?**
A: Normal, CartContext le recréé depuis localStorage

**Q: Produits ne s'affichent pas?**
A: Backend doit bêter en cours d'exécution (:8000), vérifier API calls

**Q: Erreur "Cannot POST /api/..."?**
A: Backend non lancé, lancer: php artisan serve

---

## ✅ Status Final

```
Frontend MVP: READY FOR TESTING ✅
├── Code:         Compiled ✅
├── Server:       Running ✅
├── Pages:        All Done ✅
├── Components:   All Done ✅
├── Services:     All Done ✅
├── Routing:      All Done ✅
└── Docs:         Complete ✅
```

**Date**: 31 Mars 2026  
**Version**: 1.0 MVP  
**Status**: ✅ READY

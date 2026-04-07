# 🚀 QUICK START - Test des Notifications Brevo

## 📋 Fichiers de Test Créés

| Fichier | Description | Usage |
|---------|-------------|-------|
| `postman_collection.json` | Collection Postman complète | Importer dans Postman |
| `POSTMAN_TESTING_GUIDE.md` | Guide détaillé Postman | Lire avant les tests |
| `test_all_endpoints.sh` | Script Bash de test automatique | `bash test_all_endpoints.sh` |

---

## ✨ Option 1: Test Rapide avec le Script Bash

### Étape par étape:

```bash
# 1. S'assurer que le backend est actif
cd backend
php artisan serve  # Terminal 1

# 2. Démarrer le queue worker (important pour les notifications!)
php artisan queue:work  # Terminal 2

# 3. Exécuter le script de test
# Dans un nouveau terminal, à la racine du projet:
bash test_all_endpoints.sh
```

### Résultat:
```
✅ TEST COMPLET RÉUSSI!
✅ 3 utilisateurs créés
✅ 3 tokens Bearer obtenus
✅ 1 produit trouvé/créé
✅ 1 article ajouté au panier
✅ 1 commande créée
✅ 3 notifications envoyées via Brevo

📧 Vérifier les notifications:
  1. Dashboard Brevo: https://app.brevo.com/campaigns/logs
  2. Logs Laravel: tail -f backend/storage/logs/laravel.log
```

---

## 🔔 Option 2: Test Détaillé avec Postman

### Étape 1: Importer la Collection

1. Ouvrir Postman
2. **File** → **Import**
3. Choisir: `postman_collection.json`
4. Cliquer **Import**

### Étape 2: Configurer les Variables

- `base_url`: `http://localhost:8000/api`
- Les autres vont se remplir automatiquement

### Étape 3: Exécuter dans l'Ordre

**Dossier: 🔐 AUTHENTIFICATION**
1. Register - Créer un client ✅
2. Register - Créer un vendeur ✅
3. Register - Créer un admin ✅
4. Login - Client ✅
5. Login - Vendeur ✅
6. Login - Admin ✅

**Dossier: 📦 PRODUITS**
7. List - Tous les produits ✅
8. Create - Produit (Vendeur) ✅

**Dossier: 🛒 PANIER**
9. Add - Ajouter au panier ✅
10. Get - Mon panier ✅

**Dossier: 📋 COMMANDES** ← 🔔 NOTIFICATIONS ICI
11. **Create - Créer une commande** 🔔 📧 DÉCLENCHE 3 EMAILS

**Dossier: 👨‍💼 ADMIN**
12. Dashboard - Stats ✅

---

## 📞 Vérifier les Notifications

### Dashboard Brevo (Meilleure Méthode)

```
https://app.brevo.com/campaigns/logs
```

Vous verrez:
- ✉️ Date/heure d'envoi
- 👤 Destinataire (client@example.com, vendor@example.com, admin@example.com)
- 📊 Statut: Envoyé / Livré / Ouvert / Cliqué
- 📈 Taux d'engagement

### Logs Laravel

```bash
# Dans terminal du backend:
tail -f storage/logs/laravel.log

# Chercher:
# [INFO] Mail sent: OrderConfirmation
# [INFO] Mail sent: VendorNewOrder
# [INFO] Mail sent: VendorVerificationRequest
```

### Base de Données

```bash
# Voir les jobs en queue:
sqlite3 database/database.sqlite "SELECT id, queue FROM jobs LIMIT 5"

# Voir les jobs échoués:
sqlite3 database/database.sqlite "SELECT * FROM failed_jobs LIMIT 5"
```

---

## 🎯 Checklist Avant de Démarrer

- [ ] Backend API actif (`php artisan serve`)
- [ ] Queue worker actif (`php artisan queue:work`)
- [ ] Migrations exécutées (`php artisan migrate`)
- [ ] Brevo configuré dans `.env`:
  ```env
  MAIL_MAILER=smtp
  MAIL_HOST=smtp-relay.brevo.com
  MAIL_PORT=587
  MAIL_USERNAME=a6a28f001@smtp-brevo.com
  MAIL_PASSWORD=xsmtpsib-...
  ```
- [ ] Postman installé (ou Insomnia, etc.)
- [ ] Connexion internet (pour Brevo)

---

## 🧪 Tests Disponibles

### ✅ Tests Inclus

| Test | Description | Notifications |
|------|-------------|----------------|
| Auth | Register, Login, Profile | ❌ Aucune |
| Products | Create, Read, Update | ❌ Aucune |
| Cart | Add, Update, Delete | ❌ Aucune |
| **Orders** | **Create** | **✅ 3 emails** |
| Admin | Stats, Vendors | ❌ Aucune |

### 📧 3 Notifications Envoyées

1. **OrderConfirmation**
   - À: Client
   - Sujet: Confirmation de votre commande
   - Contient: Produits, total, shipping address

2. **VendorNewOrder**
   - À: Vendeur
   - Sujet: Nouvelle commande pour vos produits
   - Contient: Produits du vendeur, client info

3. **VendorVerificationRequest**
   - À: Admin
   - Sujet: Demande de vérification vendeur
   - Contient: Vendeur info, lien d'approbation

---

## 🚀 Commandes Rapides

### Démarrer le backend
```bash
cd backend
php artisan serve
```

### Démarrer le queue worker
```bash
cd backend
php artisan queue:work
```

### Exécuter les migrations
```bash
cd backend
php artisan migrate
```

### Tester les notifications via CLI
```bash
cd backend

# Tous les types
php artisan email:test

# Ou un type spécifique
php artisan email:test order       # OrderConfirmation
php artisan email:test vendor      # VendorNewOrder
php artisan email:test verification # VendorVerificationRequest
```

### Exécuter le script de test complet
```bash
# À la racine du projet
bash test_all_endpoints.sh
```

---

## 🐛 Troubleshooting

### Q: Les emails ne s'envoient pas!

**A:** Vérifier que le queue worker est actif:
```bash
# Terminal 1: Backend
php artisan serve

# Terminal 2: Queue Worker ← IMPORTANT!
php artisan queue:work

# Terminal 3: Tests
bash test_all_endpoints.sh
```

### Q: Erreur 401 Unauthorized sur Postman

**A:** 
1. Exécuter d'abord le "Login" correspondant
2. Vérifier que le token est bien défini
3. Recharger les variables: `Ctrl+K` → Chercher variable

### Q: Les utilisateurs existent déjà!

**A:**
1. Modifier les emails dans le script: `client@example.com` → `client2@example.com`
2. Ou vider la base de données:
   ```bash
   php artisan migrate:reset
   php artisan migrate
   ```

### Q: Comment vérifier que c'est vraiment Brevo?

**A:** Aller sur https://app.brevo.com/campaigns/logs et vous verrez:
- Les emails envoyés
- Via: smtp-relay.brevo.com
- Status: Livré

---

## 📚 Documentation Complète

Pour plus de détails, consultez:

1. **[POSTMAN_TESTING_GUIDE.md](POSTMAN_TESTING_GUIDE.md)**
   - Guide détaillé Postman
   - Scénarios de test
   - Troubleshooting

2. **[backend/BREVO_CONFIGURATION.md](backend/BREVO_CONFIGURATION.md)**
   - Configuration Brevo
   - Dashboard Brevo
   - FAQ

3. **[backend/NOTIFICATIONS_GUIDE.md](backend/NOTIFICATIONS_GUIDE.md)**
   - Architecture des notifications
   - Flux d'exécution
   - Détails techniques

---

## ✨ Example d'Exécution

```bash
$ bash test_all_endpoints.sh

🚀 TEST COMPLET - API AfriShop + Brevo
==========================================

Phase 1️⃣: Enregistrement & Authentification
==========================================

ℹ️  Création d'un CLIENT...
✅ Client créé: client@example.com (ID: 1)

ℹ️  Création d'un VENDEUR...
✅ Vendeur créé: vendor@example.com (ID: 2)

ℹ️  Création d'un ADMIN...
✅ Admin créé: admin@example.com (ID: 3)

ℹ️  Login CLIENT...
✅ Token CLIENT obtenu

ℹ️  Login VENDEUR...
✅ Token VENDEUR obtenu

ℹ️  Login ADMIN...
✅ Token ADMIN obtenu

Phase 4️⃣: 🔔 CRÉATION COMMANDE
(Déclenche les notifications Brevo)
==========================================

ℹ️  Création d'une commande...
✅ 📦 Commande créée avec succès!
   Numéro: CMD-2026-000001
   ID: 1

✅ 📧 3 NOTIFICATIONS ENVOYÉES VIA BREVO:
   1️⃣ OrderConfirmation → CLIENT (client@example.com)
   2️⃣ VendorNewOrder → VENDEUR (vendor@example.com)
   3️⃣ VendorVerificationRequest → ADMIN (admin@example.com)

✅ TEST COMPLET RÉUSSI!
==========================================

✅ 3 utilisateurs créés (CLIENT, VENDEUR, ADMIN)
✅ 3 tokens Bearer obtenus
✅ 1 produit trouvé/créé
✅ 1 article ajouté au panier
✅ 1 commande créée
✅ 3 notifications envoyées via Brevo

📧 Vérifier les notifications:
  1. Dashboard Brevo: https://app.brevo.com/campaigns/logs
  2. Logs Laravel: tail -f backend/storage/logs/laravel.log

✨ Test terminé avec succès!
```

---

## 🎓 Résumé

| Élément | Fichier/Outil | Lien |
|--------|--------------|------|
| **Test Automatisé** | `test_all_endpoints.sh` | Script Bash |
| **Test Manuel** | `postman_collection.json` | Collection Postman |
| **Guide Détaillé** | `POSTMAN_TESTING_GUIDE.md` | Documentation |
| **Configuration** | `.env` + `backend/BREVO_CONFIGURATION.md` | Brevo SMTP |
| **Vérification** | https://app.brevo.com/campaigns/logs | Dashboard Brevo |

---

**Créé**: 31 mars 2026  
**Status**: ✅ Prêt à l'emploi  
**Provider**: Brevo SMTP  
**Queue Driver**: Database

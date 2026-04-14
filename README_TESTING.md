# 🧪 INDEX COMPLET - Testing et Notifications Brevo

## 📦 Fichiers de Test Créés

Tous les fichiers pour tester les notifications avec Postman et CLI:

```
app-produits-locaux/
├── postman_collection.json              ← Collection Postman complète
├── QUICK_START.md                       ← Guide de démarrage rapide ⭐
├── POSTMAN_TESTING_GUIDE.md             ← Guide détaillé Postman
├── test_all_endpoints.sh                ← Script Bash automatisé
├── README_TESTING.md                    ← Ce fichier
│
└── backend/
    ├── .env                             ← Variables Brevo configurées
    ├── .env.mail.example                ← Exemple configuration Brevo
    ├── BREVO_CONFIGURATION.md           ← Dashboard Brevo complet
    ├── BREVO_MIGRATION_SUMMARY.md       ← Résumé des changements
    ├── NOTIFICATIONS_README.md          ← Résumé notifications (updated)
    ├── NOTIFICATIONS_GUIDE.md           ← Guide notifications (updated)
    ├── NOTIFICATIONS_SETUP.md           ← Setup Brevo (updated)
    ├── NOTIFICATIONS_EXAMPLES.md        ← Exemples d'utilisation
    ├── NOTIFICATIONS_COMPLETE.md        ← Vérification complète
    ├── config/mail.php                  ← Configuration Mail (updated)
    └── app/Notifications/
        ├── OrderConfirmation.php        ← Email client (updated)
        ├── VendorNewOrder.php           ← Email vendeur (updated)
        └── VendorVerificationRequest.php ← Email admin (updated)
```

---

## 🚀 3 Façons de Tester

### ✨ Option 1: Script Bash Automatisé (Recommandé)

**Fichier**: `test_all_endpoints.sh`

**Avantages**:
- ✅ Automatisé et complet
- ✅ Crée tous les utilisateurs
- ✅ Teste tous les endpoints
- ✅ Déclenche les notifications
- ✅ Affiche les résultats en couleur

**Usage**:
```bash
# À la racine du projet
bash test_all_endpoints.sh
```

**Résultat**:
- ✅ 1 Client créé
- ✅ 1 Vendeur créé
- ✅ 1 Admin créé
- ✅ 1 Produit trouvé/créé
- ✅ 1 Panier rempli
- ✅ 1 Commande créée
- ✅ 3 Notifications envoyées

---

### 📮 Option 2: Postman (Recommandé pour le détail)

**Fichier**: `postman_collection.json`

**Guide**: `POSTMAN_TESTING_GUIDE.md`

**Avantages**:
- ✅ Interface graphique
- ✅ Sauvegarde des données
- ✅ Historique des requêtes
- ✅ Tests granulaires
- ✅ Variables dynamiques

**Étapes**:
1. Ouvrir Postman
2. File → Import → Choisir `postman_collection.json`
3. Exécuter les dossiers en ordre
4. Vérifier les réponses

---

### 📝 Option 3: Commandes Manuelles CLI

**Commandes Artisan**:
```bash
cd backend

# Tester une email
php artisan email:test

# Ou un type spécifique
php artisan email:test order
php artisan email:test vendor
php artisan email:test verification
```

---

## 🔧 Setup Requis

Avant de tester, s'assurer que:

### 1️⃣ Backend API

```bash
cd backend
php artisan serve
# Accès: http://localhost:8000
```

### 2️⃣ Queue Worker (IMPORTANT!)

```bash
# Dans terminal séparé:
cd backend
php artisan queue:work
```

### 3️⃣ Migrations

```bash
cd backend
php artisan migrate
```

### 4️⃣ Brevo dans .env

```env
MAIL_MAILER=smtp
MAIL_SCHEME=tls
MAIL_HOST=smtp-relay.brevo.com
MAIL_PORT=587
MAIL_USERNAME=a6a28f001@smtp-brevo.com
MAIL_PASSWORD=xsmtpsib-[REDACTED]
QUEUE_CONNECTION=database
```

---

## 📋 Liste Complete des Endpoints

### 🔐 Authentification

| Endpoint | Méthode | Auth | Notifications |
|----------|---------|------|-----------------|
| `/auth/register` | POST | ❌ | ❌ |
| `/auth/login` | POST | ❌ | ❌ |
| `/auth/logout` | POST | 🔐 | ❌ |
| `/auth/me` | GET | 🔐 | ❌ |

### 📦 Produits

| Endpoint | Méthode | Auth | Notifications |
|----------|---------|------|-----------------|
| `/products` | GET | ❌ | ❌ |
| `/products/{id}` | GET | ❌ | ❌ |
| `/products` | POST | 🟡 Vendeur | ❌ |
| `/vendor/products` | GET | 🟡 Vendeur | ❌ |

### 🛒 Panier

| Endpoint | Méthode | Auth | Notifications |
|----------|---------|------|-----------------|
| `/cart` | GET | 🔐 | ❌ |
| `/cart` | POST | 🔐 | ❌ |
| `/cart/{id}` | PATCH | 🔐 | ❌ |
| `/cart/{id}` | DELETE | 🔐 | ❌ |
| `/cart` | DELETE | 🔐 | ❌ |

### 📋 Commandes (🔔 NOTIFICATIONS)

| Endpoint | Méthode | Auth | Notifications |
|----------|---------|------|-----------------|
| `/orders` | GET | 🔐 | ❌ |
| `/orders` | POST | 🔐 | ✅ **3 EMAILS** |
| `/orders/{id}` | GET | 🔐 | ❌ |
| `/orders/{id}/cancel` | PATCH | 🔐 | ❌ |

### 👨‍💼 Admin

| Endpoint | Méthode | Auth | Notifications |
|----------|---------|------|-----------------|
| `/admin/dashboard/stats` | GET | 🔴 Admin | ❌ |
| `/admin/pending-vendors` | GET | 🔴 Admin | ❌ |
| `/admin/vendors/{id}/approve` | POST | 🔴 Admin | ❌ |
| `/admin/vendors/{id}/reject` | POST | 🔴 Admin | ❌ |

---

## 📧 Les 3 Notifications Envoyées

### 1️⃣ OrderConfirmation (Client)

**Quand**: Création de commande

**Destinataire**: `client@example.com`

**Sujet**: Confirmation de votre commande

**Contient**:
- Numéro de commande
- Produits commandés
- Total
- Adresse de livraison

**Fichier**: `backend/app/Notifications/OrderConfirmation.php`

---

### 2️⃣ VendorNewOrder (Vendeur)

**Quand**: Création de commande avec produits du vendeur

**Destinataire**: `vendor@example.com`

**Sujet**: Nouvelle commande pour vos produits

**Contient**:
- Produits du vendeur
- Client info
- Total
- Détails de livraison

**Fichier**: `backend/app/Notifications/VendorNewOrder.php`

---

### 3️⃣ VendorVerificationRequest (Admin)

**Quand**: Création d'un nouveau vendeur

**Destinataire**: `admin@example.com`

**Sujet**: Demande de vérification vendeur

**Contient**:
- Vendeur info
- Lien d'approbation
- Lien de rejet

**Fichier**: `backend/app/Notifications/VendorVerificationRequest.php`

---

## ✅ Checklist de Test

### Avant de corriger (Setup)

- [ ] Backend API running: `php artisan serve`
- [ ] Queue worker running: `php artisan queue:work`
- [ ] Migrations exécutées: `php artisan migrate`
- [ ] Brevo configuré dans `.env`
- [ ] Postman importée (optionnel)

### Pendant le test

- [ ] Client créé et loggé
- [ ] Vendeur créé et loggé
- [ ] Admin créé et loggé
- [ ] Produit disponible
- [ ] Panier rempli avec produit
- [ ] Commande créée avec succès

### Après le test

- [ ] 3 emails dans Brevo dashboard
- [ ] Client reçoit confirmation
- [ ] Vendeur reçoit notification
- [ ] Admin reçoit vérification vendeur
- [ ] Logs affichent succès
- [ ] Status en base de données correct

---

## 🔍 Vérifier les Notifications

### Dashboard Brevo

```
https://app.brevo.com/campaigns/logs
```

Vous verrez:
```
Date       | Destinataire           | Sujet                      | Status
-----------|------------------------|---------------------------|--------
14:30:45   | client@example.com     | Confirmation de commande   | Livré
14:30:46   | vendor@example.com     | Nouvelle commande...       | Livré
14:30:47   | admin@example.com      | Demande de vérification... | Livré
```

### Logs Laravel

```bash
tail -f backend/storage/logs/laravel.log | grep -i "mail\|notification"
```

### Base de Données

```bash
# Jobs en queue
sqlite3 backend/database/database.sqlite "SELECT id, command FROM jobs LIMIT 5"

# Jobs échoués
sqlite3 backend/database/database.sqlite "SELECT * FROM failed_jobs LIMIT 5"
```

---

## 🐛 Troubleshooting

### Q: "Got a packet bigger than 'max_allowed_packet'"

**A**: Ce n'est pas un problème Brevo, mais de base de données

### Q: "SMTP Error"

**A**: Vérifier:
1. Brevo credentials dans `.env`
2. Connexion internet active
3. Queue worker actif

### Q: "Emails enregistrés mais pas envoyés"

**A**: S'assurer que `php artisan queue:work` est actif!

### Q: "401 Unauthorized"

**A**: Vérifier que vous avez

 un token Bearer valide

---

## 📞 Ressources

| Ressource | URL/Fichier |
|-----------|-----------|
| **Brevo Dashboard** | https://app.brevo.com |
| **Brevo Logs** | https://app.brevo.com/campaigns/logs |
| **Guide Postman** | `POSTMAN_TESTING_GUIDE.md` |
| **Configuration Brevo** | `backend/BREVO_CONFIGURATION.md` |
| **Notifications Guide** | `backend/NOTIFICATIONS_GUIDE.md` |

---

## 🎯 Quick Reference

```bash
# Démarrer le développement
cd backend && php artisan serve               # Terminal 1
cd backend && php artisan queue:work          # Terminal 2
cd app-produits-locaux && bash test_all_endpoints.sh  # Terminal 3

# Tester une notification seule
php artisan email:test order

# Vérifier les logs
tail -f backend/storage/logs/laravel.log

# Vérifier les jobs
sqlite3 backend/database/database.sqlite "SELECT * FROM jobs"

# Vider le cache
php artisan cache:clear && php artisan config:clear
```

---

## 📚 Documentation

1. **QUICK_START.md** ← Lire d'abord!
2. **POSTMAN_TESTING_GUIDE.md** - Test détaillé avec Postman
3. **backend/BREVO_CONFIGURATION.md** - Configuration complète
4. **backend/NOTIFICATIONS_GUIDE.md** - Détails techniques

---

## ✨ Exemple de Test Réussi

```
✅ TEST COMPLET RÉUSSI!

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

**Créé**: 31 mars 2026
**Status**: ✅ Complet et Prêt à l'Emploi
**Provider**: Brevo SMTP
**Queue Driver**: Database

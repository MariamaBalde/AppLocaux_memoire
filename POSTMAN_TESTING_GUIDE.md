# 🚀 Guide Complet - Test des Notifications Brevo avec Postman

## 📋 Vue d'ensemble

Cette collection Postman vous permet de tester **tous les endpoints** de l'API AfriShop et de **déclencher les notifications email** via Brevo.

---

## 📥 Installation de la Collection

### 1. Importer la collection dans Postman

**Option A: Fichier JSON**
```bash
# Le fichier est localisé à:
/home/mariama-balde/Documents/Projet Soutenance/app-produits-locaux/postman_collection.json

# Dans Postman:
# 1. File → Import
# 2. Choisir le fichier JSON
# 3. Importer
```

**Option B: Via VS Code**
```bash
# Copier la collection JSON et l'ouvrir dans Postman
```

### 2. Configurer les variables d'environnement

**Variables automatiquement définies:**
- `base_url` = `http://localhost:8000/api`
- `token`, `client_token`, `vendor_token`, `admin_token`
- `user_id`, `vendor_id`, `product_id`, `order_id`

---

## 🧪 Scénario Complet de Test

### Phase 1️⃣: Enregistrement et Authentification

Suivez cet ordre pour créer les utilisateurs:

#### Étape 1: Créer un CLIENT
```
🔐 AUTHENTIFICATION → Register - Créer un client
```
- Email: `client@example.com`
- Password: `password123`
- Role: `client`

**Résultat attendu:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "client@example.com",
      "role": "client"
    }
  }
}
```

#### Étape 2: Créer un VENDEUR
```
🔐 AUTHENTIFICATION → Register - Créer un vendeur
```
- Email: `vendor@example.com`
- Role: `vendeur`

#### Étape 3: Créer un ADMIN
```
🔐 AUTHENTIFICATION → Register - Créer un admin
```
- Email: `admin@example.com`
- Role: `admin`

#### Étape 4: Login CLIENT
```
🔐 AUTHENTIFICATION → Login - Client
```
- Variable `client_token` est automatiquement définie

#### Étape 5: Login VENDEUR
```
🔐 AUTHENTIFICATION → Login - Vendeur
```
- Variable `vendor_token` est automatiquement définie

#### Étape 6: Login ADMIN
```
🔐 AUTHENTIFICATION → Login - Admin
```
- Variable `admin_token` est automatiquement définie

---

### Phase 2️⃣: Créer des Produits

En tant que VENDEUR, créer des produits:

```
📦 PRODUITS → Create - Produit (Vendeur)
```

**Body:**
```json
{
  "name": "Arachides Bio 500g",
  "description": "Arachides biologiques de qualité supérieure",
  "price": 15000,
  "category_id": 1,
  "stock": 100
}
```

- La variable `product_id` est automatiquement définie

---

### Phase 3️⃣: Ajouter au Panier

Avec le token CLIENT:

```
🛒 PANIER → Add - Ajouter au panier
```

**Body:**
```json
{
  "product_id": 1,
  "quantity": 2
}
```

- Vérifier le panier avec `🛒 PANIER → Get - Mon panier`

---

### Phase 4️⃣: 🔔 CRÉER UNE COMMANDE (DÉCLENCHE NOTIFICATIONS)

**ÉTAPE CRITIQUE - Ceci déclenche les notifications:**

```
📋 COMMANDES → Create - Créer une commande (📧 DÉCLENCHE NOTIFICATIONS)
```

**Body:**
```json
{
  "shipping_address": "123 Rue de Dakar, Senegal",
  "phone": "+221771234567",
  "shipping_method": "standard",
  "payment_method": "wave",
  "notes": "Livrer en fin d'après-midi"
}
```

**📧 Ceci déclenche 3 notifications:**

1. ✅ **OrderConfirmation** → Email CLIENT
   - À: `client@example.com`
   - Sujet: Confirmation de commande
   
2. ✅ **VendorNewOrder** → Email VENDEUR
   - À: `vendor@example.com`
   - Sujet: Nouvelle commande pour vos produits
   
3. ✅ **VendorVerificationRequest** → Email ADMIN (si nouveau vendeur)
   - À: `admin@example.com`
   - Sujet: Demande de vérification vendeur

---

## 📧 Vérifier les Notifications Envoyées

### Option 1: Dashboard Brevo (Recommandé)

1. 🌐 Allez sur: https://app.brevo.com/campaigns/logs
2. 📊 Vérifiez les emails envoyés
3. 📈 Consultez les statistiques:
   - Taux de livraison
   - Taux d'ouverture
   - Taux de clic

### Option 2: Logs Laravel

```bash
# Terminal dans /backend
tail -f storage/logs/laravel.log

# Chercher les messages:
# - "OrderConfirmation sent"
# - "VendorNewOrder sent"
# - "VendorVerificationRequest sent"
```

### Option 3: Base de Données (Table jobs)

```bash
# Vérifier les jobs en queue
sqlite3 database/database.sqlite "SELECT * FROM jobs LIMIT 5"

# Vérifier les jobs échoués
sqlite3 database/database.sqlite "SELECT * FROM failed_jobs LIMIT 5"
```

---

## ⚙️ Configuration Brevo Requise

Avant de tester, assurez-vous que:

✅ `.env` a les bonnes variables:
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp-relay.brevo.com
MAIL_PORT=587
MAIL_USERNAME=a6a28f001@smtp-brevo.com
MAIL_PASSWORD=xsmtpsib-[REDACTED]
QUEUE_CONNECTION=database
```

✅ Queue worker est actif:
```bash
php artisan queue:work
```

✅ Migrations sont exécutées:
```bash
php artisan migrate
```

---

## 🧪 Tests Supplémentaires

### Test: Annuler une Commande

```
📋 COMMANDES → Cancel - Annuler une commande
```

### Test: Approuver un Vendeur (Admin)

```
👨‍💼 ADMIN → Approve Vendor (📧 DÉCLENCHE NOTIFICATION VENDEUR)
```

### Test: Dashboard Admin

```
👨‍💼 ADMIN → Dashboard - Stats
```

---

## 🚨 Troubleshooting

### Les emails n'arrivent pas?

1. **Vérifier le queue worker**
   ```bash
   # S'assurer que c'est en cours d'exécution
   ps aux | grep "artisan queue:work"
   
   # Sinon le démarrer:
   php artisan queue:work
   ```

2. **Vérifier les logs**
   ```bash
   tail -f storage/logs/laravel.log | grep -i mail
   ```

3. **Vérifier la connexion SMTP**
   ```bash
   php artisan tinker
   > Mail::raw('Test', function($message) { 
       $message->to('test@example.com')->subject('Test'); 
     });
   // Doit afficher: true ou false
   ```

4. **Vérifier Brevo**
   - Aller sur https://app.brevo.com
   - Vérifier que la clé SMTP est correcte
   - Vérifier les statistiques d'envoi

### Variables Postman non définies?

- Exécuter les endpoints d'authentification dans l'ordre
- Vérifier que les tests scripts sont exécutés:
  ```javascript
  pm.environment.set('token', ...);
  ```

### Erreur 401 Unauthorized?

- Vérifier le token Bearer
- Se reconnecter (Login)
- Vérifier le role utilisateur

---

## 📝 Résumé des Endpoints

| Groupe | Endpoint | Authentification | Notation |
|--------|----------|-----------------|----------|
| Auth | POST /register | ❌ | Créer utilisateurs |
| Auth | POST /login | ❌ | Récupérer token |
| Auth | GET /me | 🔐 | Profile utilisateur |
| Products | GET /products | ❌ | Lister produits |
| Products | POST /products | 🟡 Vendeur | Créer produit |
| Cart | GET /cart | 🔐 | Mon panier |
| Cart | POST /cart | 🔐 | Ajouter au panier |
| **Orders** | **POST /orders** | **🔐** | **🔔 NOTIFICATIONS** |
| Orders | GET /orders | 🔐 | Mes commandes |
| Admin | GET /admin/stats | 🔴 Admin | Dashboard |
| Admin | POST /vendors/{id}/approve | 🔴 Admin | Approuver vendeur |

---

## 💡 Tips & Tricks

### 1. Exécuter une suite de requêtes

1. Dans Postman: Cliquer sur le "Play" button à côté du dossier
2. Sélectionner l'ordre d'exécution
3. Regarder les résultats

### 2. Utiliser les Pre-request Scripts

```javascript
// Pour ajouter un produit automatiquement avant de créer une commande
pm.sendRequest({
    url: "{{base_url}}/cart",
    method: "POST",
    header: {
        "Authorization": "Bearer " + pm.environment.get('client_token')
    },
    body: {
        mode: 'raw',
        raw: JSON.stringify({product_id: 1, quantity: 2})
    }
}, function(err, response) {
    console.log(response);
});
```

### 3. Monitorer les Notifications

```bash
# Terminal 1: Queue worker
php artisan queue:work --verbose

# Terminal 2: Watch logs
tail -f storage/logs/laravel.log

# Terminal 3: Tester les commandes
# (exécuter Postman requêtes)
```

---

## 📊 Exemple de Réponse - Création Commande

```json
{
  "success": true,
  "message": "Commande créée avec succès",
  "data": {
    "order": {
      "id": 1,
      "order_number": "CMD-2026-000001",
      "user_id": 1,
      "total": 30000,
      "status": "pending",
      "shipping_address": "123 Rue de Dakar, Senegal",
      "items": [
        {
          "id": 1,
          "product_id": 1,
          "product_name": "Arachides Bio 500g",
          "quantity": 2,
          "price": 15000,
          "subtotal": 30000
        }
      ]
    },
    "payment": {
      "id": 1,
      "status": "pending",
      "method": "wave"
    }
  }
}
```

---

## 🎯 Checklist de Vérification

- [ ] Postman collection importée
- [ ] Variables d'environnement configurées
- [ ] Backend API running (`php artisan serve`)
- [ ] Queue worker running (`php artisan queue:work`)
- [ ] Brevo SMTP configuré dans `.env`
- [ ] Client créé et authentifié
- [ ] Vendeur créé et authentifié
- [ ] Admin créé et authentifié
- [ ] Produit créé par vendeur
- [ ] Produit ajouté au panier client
- [ ] Commande créée
- [ ] Notifications vérifiées dans Brevo dashboard

---

## 📞 Ressources

- **Collection Postman**: `/postman_collection.json`
- **Brevo Dashboard**: https://app.brevo.com
- **API Logs**: https://app.brevo.com/campaigns/logs
- **Documentation**: `/backend/BREVO_CONFIGURATION.md`
- **Notifications Guide**: `/backend/NOTIFICATIONS_GUIDE.md`

---

**Créé**: 31 mars 2026  
**Status**: ✅ Complet  
**Provider**: Brevo SMTP  
**Queue Driver**: Database

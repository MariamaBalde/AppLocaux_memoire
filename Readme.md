# Plateforme de Commande et d'Exportation de Produits Locaux Africains

## Technologies

- **Backend**: Laravel 11
- **Frontend**: React 18
- **Mobile**: Flutter 3.x
- **Base de données**: pgSQL

##  Installation

### Prérequis
- PHP 8.1+
- Composer
- Node.js 18+
- Flutter SDK 3.x
- Docker (optionnel)

### Installation avec Docker
```bash
# Cloner le projet
git clone [url-du-projet]
cd plateforme-produits-locaux

# Lancer les containers
docker-compose up -d

# Accéder au backend
docker exec -it app_locaux_backend bash
composer install
php artisan migrate --seed

# Services accessibles :
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
# pgAdmin: http://localhost:5050
```

#### Accès pgAdmin
- **URL**: http://localhost:5050
- **Email**: admin@admin.com
- **Mot de passe**: admin

Puis ajouter une connexion serveur avec :
- **Hostname**: postgres
- **Port**: 5432
- **Username**: app_user
- **Password**: secret
- **Database**: app_locaux_db

### Installation manuelle

#### Backend
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
php artisan serve
```

#### Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm start
```

#### Mobile
```bash
cd mobile
flutter pub get
flutter run
```

##  Documentation

Voir le dossier `docs/` pour plus d'informations.

##  Équipe

- Développeur Backend
- Développeur Frontend  
- Développeur Mobile
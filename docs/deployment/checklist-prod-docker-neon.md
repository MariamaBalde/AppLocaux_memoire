# Checklist Deploiement Prod (Docker + Neon)

Cette checklist est adaptee a ton infra actuelle:
- `docker-compose.yml` avec services `backend`, `queue`, `frontend`
- base PostgreSQL externe sur Neon (pas de conteneur DB local)

## 1. Pre-requis serveur

- [ ] VPS Linux avec Docker + Docker Compose plugin installes
- [ ] DNS configure:
  - `api.ton-domaine.com` -> VPS
  - `ton-domaine.com` -> VPS
- [ ] HTTPS prevu via reverse proxy (Nginx/Caddy/Traefik)

## 2. Variables d'environnement

### 2.1 Racine projet (`.env` a la racine)

- [ ] Creer/mettre a jour `.env` racine avec:
  - `DB_URL`, `DB_HOST`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`
  - `FRONTEND_URL=https://ton-domaine.com`
  - `CORS_ALLOWED_ORIGINS=https://ton-domaine.com`
  - `REACT_APP_API_URL=https://api.ton-domaine.com/api`
  - `PAYMENT_CALLBACK_SECRET=<secret-fort>`

### 2.2 Backend (`backend/.env`)

- [ ] Mettre les valeurs prod:
  - `APP_ENV=production`
  - `APP_DEBUG=false`
  - `APP_URL=https://api.ton-domaine.com`
  - `FRONTEND_URL=https://ton-domaine.com`
  - `CORS_ALLOWED_ORIGINS=https://ton-domaine.com`
  - `DB_*` vers Neon
  - `DB_SSLMODE=require`
  - `QUEUE_CONNECTION=database`
  - `L5_SWAGGER_GENERATE_ALWAYS=false`
- [ ] Verifier secrets OAuth Passport:
  - `PASSPORT_PRIVATE_KEY`
  - `PASSPORT_PUBLIC_KEY`
  - `PASSPORT_PASSWORD_GRANT_CLIENT_ID`
  - `PASSPORT_PASSWORD_GRANT_CLIENT_SECRET`

## 3. Build + demarrage containers

Depuis la racine du projet:

```bash
docker compose pull
docker compose build --no-cache backend queue frontend
docker compose up -d
docker compose ps
```

## 4. Init backend apres deploiement

```bash
docker compose exec backend php artisan key:generate --force
docker compose exec backend php artisan migrate --force
docker compose exec backend php artisan config:cache
docker compose exec backend php artisan route:cache
docker compose exec backend php artisan l5-swagger:generate
```

## 5. Verifications backend

- [ ] API ping:
```bash
curl -I http://127.0.0.1:8000/api/products
```
- [ ] Swagger JSON present:
```bash
docker compose exec backend ls -la storage/api-docs
```
- [ ] Swagger UI:
  - `https://api.ton-domaine.com/api/documentation`
- [ ] Queue worker actif:
```bash
docker compose logs -f queue
```

## 6. Reverse proxy (obligatoire en prod)

- [ ] Router:
  - `api.ton-domaine.com` -> `backend:8000`
  - `ton-domaine.com` -> `frontend:3000`
- [ ] Forcer HTTPS
- [ ] Ajouter headers proxy standards (`X-Forwarded-*`)

## 7. Durcissement production

- [ ] Ne pas laisser Swagger public sans restriction si API sensible:
  - soit IP allowlist
  - soit Basic Auth
  - soit middleware auth sur route doc
- [ ] Rotation immediate des secrets deja exposes (`DB_PASSWORD`, `MAIL_PASSWORD`, etc.)
- [ ] Logs et supervision:
  - `docker compose logs -f backend`
  - `docker compose logs -f queue`
  - alerte en cas d'erreurs 5xx

## 8. Commandes utiles post-deploiement

```bash
docker compose restart backend queue frontend
docker compose exec backend php artisan optimize:clear
docker compose exec backend php artisan queue:restart
docker compose logs --tail=200 backend
docker compose logs --tail=200 queue
```


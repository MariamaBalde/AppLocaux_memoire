# Security Rotation Checklist (J3)

## 1) Rotate compromised secrets immediately
- Database credentials (hosted DB user/password)
- SMTP/Brevo username/password or API key
- Laravel `APP_KEY`

## 2) Regenerate application key (backend)
```bash
cd backend
php artisan key:generate
```

## 3) Ensure secret files are not committed
- `.env` files are ignored in Git:
  - root `.env`
  - `backend/.env`
  - `frontend/.env`

If a `.env` was previously committed, remove it from git history/index:
```bash
git rm --cached .env
git commit -m "chore(security): stop tracking root .env"
```

## 4) Store production secrets securely
- GitHub Actions Secrets / deployment platform secret manager
- Never hardcode credentials in source files

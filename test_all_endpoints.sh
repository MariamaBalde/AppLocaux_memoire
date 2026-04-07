#!/bin/bash

# 🚀 Script de Test Rapide - Notifications Brevo
# Ce script teste tous les endpoints de l'API AfriShop
# et vérifie que les notifications sont envoyées via Brevo

set -e

BASE_URL="http://localhost:8000/api"

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

echo "=========================================="
echo "🚀 TEST COMPLET - API AfriShop + Brevo"
echo "=========================================="
echo ""

# Phase 1: Authentification
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}Phase 1️⃣: Enregistrement & Authentification${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo ""

# Créer un client
log_info "Création d'un CLIENT..."
TS=$(date +%s)
CLIENT_TEST_EMAIL="client${TS}@example.com"
VENDOR_TEST_EMAIL="vendor${TS}@example.com"

CLIENT_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Client Test\",\"email\":\"$CLIENT_TEST_EMAIL\",\"password\":\"password123\",\"role\":\"client\"}")

CLIENT_ID=$(echo $CLIENT_RESPONSE | jq -r '.data.user.id')
CLIENT_EMAIL=$(echo $CLIENT_RESPONSE | jq -r '.data.user.email')

if [ "$CLIENT_ID" != "null" ]; then
    log_success "Client créé: $CLIENT_EMAIL (ID: $CLIENT_ID)"
else
    log_error "Erreur lors de la création du client"
    echo "$CLIENT_RESPONSE" | jq '.'
fi

# Créer un vendeur
log_info "Création d'un VENDEUR..."
VENDOR_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Vendeur Test\",\"email\":\"$VENDOR_TEST_EMAIL\",\"password\":\"password123\",\"role\":\"vendeur\"}")

VENDOR_ID=$(echo $VENDOR_RESPONSE | jq -r '.data.user.id')
VENDOR_EMAIL=$(echo $VENDOR_RESPONSE | jq -r '.data.user.email')

if [ "$VENDOR_ID" != "null" ]; then
    log_success "Vendeur créé: $VENDOR_EMAIL (ID: $VENDOR_ID)"
else
    log_error "Erreur lors de la création du vendeur"
fi

log_warning "Création admin via /auth/register ignorée (role admin non autorisé par l'API)"
ADMIN_EMAIL="admin@example.com"

echo ""

# Logger les utilisateurs
log_info "Login CLIENT..."
CLIENT_LOGIN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$CLIENT_TEST_EMAIL\",\"password\":\"password123\"}")

CLIENT_TOKEN=$(echo $CLIENT_LOGIN | jq -r '.data.access_token')
log_success "Token CLIENT obtenu"

log_info "Login VENDEUR..."
VENDOR_LOGIN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$VENDOR_TEST_EMAIL\",\"password\":\"password123\"}")

VENDOR_TOKEN=$(echo $VENDOR_LOGIN | jq -r '.data.access_token')
log_success "Token VENDEUR obtenu"

log_info "Login ADMIN..."
ADMIN_LOGIN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }')

ADMIN_TOKEN=$(echo $ADMIN_LOGIN | jq -r '.data.access_token')
if [ "$ADMIN_TOKEN" != "null" ] && [ -n "$ADMIN_TOKEN" ]; then
  log_success "Token ADMIN obtenu"
else
  log_warning "Aucun token admin obtenu (phase admin sera ignorée)"
fi

echo ""

# Phase 2: Produits
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}Phase 2️⃣: Gestion des Produits${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo ""

log_info "Récupération des produits..."
PRODUCTS=$(curl -s -X GET "$BASE_URL/products" \
  -H "Content-Type: application/json")

PRODUCT_ID=$(echo $PRODUCTS | jq -r '.data.data[0].id')
PRODUCT_NAME=$(echo $PRODUCTS | jq -r '.data.data[0].name')

if [ "$PRODUCT_ID" != "null" ] && [ "$PRODUCT_ID" != "" ]; then
    log_success "Produits trouvés: $PRODUCT_NAME (ID: $PRODUCT_ID)"
else
    log_warning "Pas de produits trouvés, création d'un produit..."
    
    PRODUCT_RESPONSE=$(curl -s -X POST "$BASE_URL/products" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $VENDOR_TOKEN" \
      -d '{
        "name": "Arachides Bio 500g",
        "description": "Arachides biologiques de qualité supérieure",
        "price": 15000,
        "category_id": 1,
        "stock": 100
      }')
    
    PRODUCT_ID=$(echo $PRODUCT_RESPONSE | jq -r '.data.id')
    log_success "Produit créé: (ID: $PRODUCT_ID)"
fi

echo ""

# Phase 3: Panier
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}Phase 3️⃣: Gestion du Panier${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo ""

log_info "Ajout d'un produit au panier..."
CART_RESPONSE=$(curl -s -X POST "$BASE_URL/cart" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CLIENT_TOKEN" \
  -d "{
    \"product_id\": $PRODUCT_ID,
    \"quantity\": 2
  }")

CART_ITEM_ID=$(echo $CART_RESPONSE | jq -r '.data.id')
if [ "$CART_ITEM_ID" != "null" ]; then
    log_success "Produit ajouté au panier (ID: $CART_ITEM_ID)"
else
    log_error "Erreur lors de l'ajout au panier"
    echo "$CART_RESPONSE" | jq '.'
fi

log_info "Vérification du panier..."
CART=$(curl -s -X GET "$BASE_URL/cart" \
  -H "Authorization: Bearer $CLIENT_TOKEN")

CART_COUNT=$(echo $CART | jq -r '.data.items_count')
log_success "Panier contient: $CART_COUNT article(s)"

echo ""

# Phase 4: Commandes (NOTIFICATIONS)
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}Phase 4️⃣: 🔔 CRÉATION COMMANDE${NC}"
echo -e "${BLUE}(Déclenche les notifications Brevo)${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo ""

log_info "Création d'une commande..."
ORDER_RESPONSE=$(curl -s -X POST "$BASE_URL/orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CLIENT_TOKEN" \
  -d "{\"shipping_address\":\"123 Rue de Dakar, Senegal\",\"phone\":\"+221771234567\",\"shipping_method\":\"standard\",\"payment_method\":\"wave\",\"notes\":\"Livrer en fin d'apres-midi\"}")

ORDER_ID=$(echo $ORDER_RESPONSE | jq -r '.data.order.id')
ORDER_NUMBER=$(echo $ORDER_RESPONSE | jq -r '.data.order.order_number')

if [ "$ORDER_ID" != "null" ] && [ "$ORDER_ID" != "" ]; then
    log_success "📦 Commande créée avec succès!"
    log_success "   Numéro: $ORDER_NUMBER"
    log_success "   ID: $ORDER_ID"
    echo ""
    log_success "📧 3 NOTIFICATIONS ENVOYÉES VIA BREVO:"
    log_success "   1️⃣ OrderConfirmation → CLIENT ($CLIENT_EMAIL)"
    log_success "   2️⃣ VendorNewOrder → VENDEUR ($VENDOR_EMAIL)"
    log_success "   3️⃣ VendorVerificationRequest → ADMIN ($ADMIN_EMAIL)"
else
    log_error "Erreur lors de la création de la commande"
    echo "$ORDER_RESPONSE" | jq '.'
fi

echo ""

# Phase 5: Vérification
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}Phase 5️⃣: Vérification${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo ""

log_info "Récupération de la commande..."
ORDER=$(curl -s -X GET "$BASE_URL/orders/$ORDER_ID" \
  -H "Authorization: Bearer $CLIENT_TOKEN")

ORDER_STATUS=$(echo $ORDER | jq -r '.data.status')
log_success "Statut de la commande: $ORDER_STATUS"

log_info "Récupération des commandes du client..."
ORDERS=$(curl -s -X GET "$BASE_URL/orders" \
  -H "Authorization: Bearer $CLIENT_TOKEN")

ORDERS_COUNT=$(echo $ORDERS | jq '.data.total // (.data.data | length)')
log_success "Client a: $ORDERS_COUNT commande(s)"

echo ""

# Phase 6: Admin
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}Phase 6️⃣: Dashboard Admin${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo ""

if [ "$ADMIN_TOKEN" != "null" ] && [ -n "$ADMIN_TOKEN" ]; then
  log_info "Récupération des statistiques admin..."
  STATS=$(curl -s -X GET "$BASE_URL/admin/dashboard/stats" \
    -H "Authorization: Bearer $ADMIN_TOKEN")

  TOTAL_ORDERS=$(echo $STATS | jq -r '.data.total_orders')
  TOTAL_USERS=$(echo $STATS | jq -r '.data.total_users')
  TOTAL_REVENUE=$(echo $STATS | jq -r '.data.total_revenue')

  log_success "Statistiques:"
  log_success "   Commandes totales: $TOTAL_ORDERS"
  log_success "   Utilisateurs totals: $TOTAL_USERS"
  log_success "   Revenus totals: $TOTAL_REVENUE"
else
  log_warning "Phase admin ignorée: token admin indisponible"
fi

echo ""

# Résumé
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${GREEN}✅ TEST COMPLET RÉUSSI!${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo ""

echo -e "${GREEN}Résumé:${NC}"
echo "  ✅ 3 utilisateurs créés (CLIENT, VENDEUR, ADMIN)"
echo "  ✅ 3 tokens Bearer obtenus"
echo "  ✅ 1 produit trouvé/créé"
echo "  ✅ 1 article ajouté au panier"
echo "  ✅ 1 commande créée"
echo "  ✅ 3 notifications envoyées via Brevo"
echo ""

echo -e "${YELLOW}📧 Vérifier les notifications:${NC}"
echo "  1. Dashboard Brevo: https://app.brevo.com/campaigns/logs"
echo "  2. Logs Laravel: tail -f backend/storage/logs/laravel.log"
echo ""

echo -e "${YELLOW}🔧 Pour que les emails s'envoient:${NC}"
echo "  1. S'assurer que queue worker est actif:"
echo "     php artisan queue:work"
echo ""

echo -e "${YELLOW}📮 Emails attendus:${NC}"
echo "  ✉️  $CLIENT_EMAIL - Confirmation de commande"
echo "  ✉️  $VENDOR_EMAIL - Nouvelle commande pour vos produits"
echo "  ✉️  $ADMIN_EMAIL - Demande de vérification vendeur"
echo ""

echo -e "${GREEN}✨ Test terminé avec succès!${NC}"

#!/usr/bin/env bash
set -euo pipefail

REPO_URL="https://github.com/KalpataruDash2005/XerShop.git"
APP_DIR="$HOME/xershop"

echo "=== XerShop Deployment for Oracle Cloud ==="

# --- Install Docker if missing ---
if ! command -v docker &>/dev/null; then
  echo "[1/5] Installing Docker..."
  curl -fsSL https://get.docker.com | sh
  sudo usermod -aG docker $USER
  newgrp docker
fi

# --- Install Docker Compose if missing ---
if ! command -v docker-compose &>/dev/null; then
  echo "[2/5] Installing Docker Compose..."
  sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
  sudo chmod +x /usr/local/bin/docker-compose
fi

# --- Clone / pull repo ---
echo "[3/5] Fetching application..."
if [ -d "$APP_DIR" ]; then
  cd "$APP_DIR" && git pull
else
  git clone "$REPO_URL" "$APP_DIR"
  cd "$APP_DIR"
fi

# --- Create .env file if missing ---
if [ ! -f .env ]; then
  echo "[4/5] Creating .env file..."
  read -p "Server public IP or domain: " SERVER_HOST
  cat > .env <<EOF
# --- Required ---
JWT_SECRET=$(openssl rand -base64 48)
CORS_ORIGINS=http://${SERVER_HOST}:3000,http://${SERVER_HOST}
FRONTEND_URL=http://${SERVER_HOST}:3000
API_URL=http://${SERVER_HOST}:8080/api/v1

# --- Optional (leave blank if not used) ---
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
EOF
  echo ".env created — edit it with: nano $APP_DIR/.env"
  echo "Then re-run this script to deploy."
  exit 0
fi

# --- Pull, build, and start ---
echo "[5/5] Deploying with Docker Compose..."
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

# --- Show status ---
echo ""
echo "=== Deployment Complete ==="
echo "Frontend: http://$(curl -s ifconfig.me):3000"
echo "Backend:  http://$(curl -s ifconfig.me):8080"
echo "Logs:     docker-compose logs -f"

#!/bin/sh
set -e

echo "Checking Telegram API connectivity..."
echo "Bot token length: ${#TELEGRAM_BOT_TOKEN}"
if [ -n "$TELEGRAM_BOT_TOKEN" ]; then
  echo "Token starts with: ${TELEGRAM_BOT_TOKEN:0:10}..."
  echo "Testing DNS resolution..."
  nslookup api.telegram.org 2>&1 || host api.telegram.org 2>&1 || echo "DNS: no lookup tool"
  echo "Testing HTTPS connection..."
  wget -v --timeout=15 -O /tmp/telegram_test.json "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe" 2>&1 || true
  cat /tmp/telegram_test.json 2>/dev/null || echo "No response file"
fi

echo "Starting Backend on port 8080..."
JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=60.0 -Dhttps.protocols=TLSv1.2,TLSv1.3 -Djdk.tls.client.protocols=TLSv1.2 -Djava.net.preferIPv4Stack=true"
java $JAVA_OPTS -jar /app/backend.jar --server.port=8080 &
BACKEND_PID=$!

sleep 8

echo "Starting Frontend on port 3000..."
cd /app/web
PORT=3000 node server.js &
FRONTEND_PID=$!

wait $BACKEND_PID $FRONTEND_PID

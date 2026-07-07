#!/bin/sh
set -e

echo "Checking Telegram API connectivity..."
if [ -n "$TELEGRAM_BOT_TOKEN" ]; then
  wget -q --timeout=5 -O /dev/null "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe" && echo "Telegram API: OK" || echo "Telegram API: UNREACHABLE"
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

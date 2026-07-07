#!/bin/sh
set -e

echo "Checking Telegram API connectivity..."
if [ -n "$TELEGRAM_BOT_TOKEN" ]; then
  echo "Testing SSL connection with curl..."
  curl -v --connect-timeout 10 --max-time 15 -s "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe" 2>&1 || echo "curl failed"
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

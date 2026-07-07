#!/bin/sh
set -e

echo "Checking notification channels..."
if [ -n "$TELEGRAM_BOT_TOKEN" ]; then
  echo "Testing Telegram..."
  curl -s --connect-timeout 8 --max-time 12 "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe" > /dev/null && echo "Telegram: OK" || echo "Telegram: BLOCKED"
fi
echo "Testing ntfy.sh..."
curl -s --connect-timeout 8 --max-time 12 "https://ntfy.sh" > /dev/null && echo "ntfy.sh: OK" || echo "ntfy.sh: UNREACHABLE"

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

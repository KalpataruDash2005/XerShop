# === Stage 1: Build Backend JAR ===
FROM eclipse-temurin:21-jdk-alpine AS backend-build
WORKDIR /app
RUN apk add --no-cache maven
COPY printhub-backend/pom.xml .
RUN mvn dependency:go-offline -B
COPY printhub-backend/src ./src
RUN mvn package -DskipTests -B

# === Stage 2: Build Frontend ===
FROM node:20-alpine AS frontend-build
WORKDIR /app
COPY printhub-web/package*.json ./
RUN npm ci
COPY printhub-web/ .
ENV NEXT_PUBLIC_API_URL=/api/v1
RUN npm run build

# === Stage 3: Runtime ===
FROM eclipse-temurin:21-jre-alpine

RUN apk add --no-cache wget nodejs ca-certificates openssl curl && update-ca-certificates

WORKDIR /app

# Copy backend JAR
COPY --from=backend-build /app/target/*.jar backend.jar

# Copy frontend standalone build
COPY --from=frontend-build /app/.next/standalone ./web
COPY --from=frontend-build /app/.next/static ./web/.next/static
COPY --from=frontend-build /app/public ./web/public

# Uploads directory
RUN mkdir -p /app/uploads

# Entrypoint script
RUN printf '#!/bin/sh\n\
set -e\n\
echo "Checking Telegram API connectivity..."\n\
if [ -n "$TELEGRAM_BOT_TOKEN" ]; then\n\
  wget -q --timeout=5 -O /dev/null "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe" && echo "Telegram API: OK" || echo "Telegram API: UNREACHABLE"\n\
fi\n\
echo "Starting Backend on port 8080..."\n\
JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=60.0 -Dhttps.protocols=TLSv1.2,TLSv1.3 -Djdk.tls.client.protocols=TLSv1.2 -Djava.net.preferIPv4Stack=true"\n\
java $JAVA_OPTS -jar /app/backend.jar --server.port=8080 &\n\
BACKEND_PID=$!\n\
sleep 8\n\
echo "Starting Frontend on port 3000..."\n\
cd /app/web\n\
PORT=3000 node server.js &\n\
FRONTEND_PID=$!\n\
wait $BACKEND_PID $FRONTEND_PID\n' > /entrypoint.sh && chmod +x /entrypoint.sh

EXPOSE 3000 8080

ENV SPRING_PROFILES_ACTIVE=prod
ENV JWT_SECRET=change-this-in-production-must-be-32-chars-min
ENV SHOW_SQL=false
ENV TELEGRAM_BOT_TOKEN=
ENV TELEGRAM_CHAT_ID=
ENV CORS_ORIGINS=http://localhost:3000,http://localhost:7860,https://devloperpaglu-xeroxbooking.hf.space
ENV SPRING_DATASOURCE_URL=jdbc:h2:file:/app/db/printhub;AUTO_RECONNECT=TRUE;DB_CLOSE_ON_EXIT=FALSE;MODE=MySQL

ENTRYPOINT ["/entrypoint.sh"]

# === Stage 1: Build Backend JAR ===
FROM eclipse-temurin:21-jdk-alpine AS backend-build
WORKDIR /app
RUN apk add --no-cache maven
ENV MAVEN_OPTS="-Xmx512m -XX:+UseContainerSupport -XX:MaxRAMPercentage=50.0"
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

ENV APP_BASE_URL=https://devloperpaglu-xershop.hf.space
# Notifications via ntfy.sh

# Entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 3000 8080

ENV SPRING_PROFILES_ACTIVE=prod
ENV JWT_SECRET=change-this-in-production-must-be-32-chars-min
ENV SHOW_SQL=false
ENV CORS_ORIGINS=http://localhost:3000,http://localhost:7860,https://devloperpaglu-xershop.hf.space
ENV SPRING_DATASOURCE_URL=jdbc:h2:file:/app/db/printhub;AUTO_RECONNECT=TRUE;DB_CLOSE_ON_EXIT=FALSE;MODE=MySQL

ENTRYPOINT ["/entrypoint.sh"]

FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
COPY printhub-backend/pom.xml .
COPY printhub-backend/.mvn ./.mvn
RUN apk add --no-cache maven && mvn dependency:go-offline -B
COPY printhub-backend/src ./src
RUN mvn package -DskipTests -B

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar backend.jar
RUN mkdir -p /tmp/uploads
EXPOSE 8080
ENV SPRING_PROFILES_ACTIVE=prod
ENV SHOW_SQL=false
CMD ["java", "-jar", "backend.jar"]

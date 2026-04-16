# Этап 1 - сборка
FROM maven:3.9.6-eclipse-temurin-17 AS builder

WORKDIR /app

# Копируем pom.xml
COPY pom.xml .

# Копируем checks.xml (нужен для checkstyle плагина)
COPY checks.xml .

# Скачиваем зависимости (кэширование)
RUN mvn dependency:go-offline -B

# Копируем исходники
COPY src ./src

# Собираем JAR
# -DskipTests - пропускаем тесты
# -Dcheckstyle.skip - пропускаем checkstyle при сборке образа
RUN mvn clean package -DskipTests -Dcheckstyle.skip -B

# Этап 2 - запуск
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Копируем JAR
COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8080

# Healthcheck - путь /api/actuator/health потому что context-path=/api
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget -q --spider http://localhost:8080/api/actuator/health || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]
# ---- Build Stage ----
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -q
COPY src ./src
RUN mvn clean package -DskipTests -q

# ---- Run Stage ----
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
RUN addgroup -S taskflow && adduser -S taskflow -G taskflow
COPY --from=build /app/target/*.jar app.jar
RUN chown taskflow:taskflow app.jar
USER taskflow
EXPOSE 8080
ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-jar", "app.jar"]

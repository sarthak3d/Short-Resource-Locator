FROM eclipse-temurin:25-jdk-alpine AS build
WORKDIR /app
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .
RUN sed -i 's/\r$//' mvnw
RUN chmod +x mvnw
RUN ./mvnw dependency:go-offline -q
COPY src src
RUN ./mvnw package -DskipTests -q

FROM eclipse-temurin:25-jre-alpine
LABEL authors="SARTHAK DARSHAN"
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-Dspring.aot.enabled=true", "-jar", "app.jar"]

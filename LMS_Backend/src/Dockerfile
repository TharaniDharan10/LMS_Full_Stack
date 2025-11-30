# 1. Use an official OpenJDK image as the base for building the application
# This image contains the tools needed to compile and run Maven.
FROM maven:3.9.5-eclipse-temurin-21-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy the entire backend source code to the container
COPY . .

# Build the project, running tests (with the previously fixed logic)
RUN mvn clean install -DskipTests=false

# 2. Use a smaller, secure JRE image for the final runtime (much faster startup)
FROM eclipse-temurin:21-jre-alpine

# Copy the built JAR file from the builder stage
# You must verify this JAR name: Minor_Project-0.0.1-SNAPSHOT.jar
COPY --from=builder /app/target/Minor_Project-0.0.1-SNAPSHOT.jar /app/app.jar

# Define the entry point to run the executable JAR
ENTRYPOINT ["java", "-jar", "/app/app.jar"]

# The application will listen on port 8080 by default (Spring Boot)
EXPOSE 8080
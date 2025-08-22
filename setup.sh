
#!/bin/bash

# Create unique database name from request ID
DATABASE_NAME="a0eed849_cedb_4564_84a8_96bdf65687f9"

# Project output directory
OUTPUT_DIR="/home/coder/project/workspace/question_generation_service/solutions/a0eed849-cedb-4564-84a8-96bdf65687f9/springapp"

# Create database
mysql -u root -pexamly -e "CREATE DATABASE IF NOT EXISTS ${DATABASE_NAME};" 2>/dev/null || echo "Database creation failed, will use default"

# Generate Spring Boot project using Spring CLI
spring init \
  --type=maven-project \
  --language=java \
  --boot-version=3.4.0 \
  --packaging=jar \
  --java-version=17 \
  --groupId=com.examly \
  --artifactId=springapp \
  --name="Hotel Room Booking System" \
  --description="Hotel Room Booking System with Spring Boot" \
  --package-name=com.examly.springapp \
  --dependencies=web,data-jpa,validation,mysql,lombok \
  --build=maven \
  ${OUTPUT_DIR}

# Wait for project generation to complete
sleep 2

# Create application.properties with database configuration
cat > "${OUTPUT_DIR}/src/main/resources/application.properties" << EOL
spring.datasource.url=jdbc:mysql://localhost:3306/${DATABASE_NAME}?createDatabaseIfNotExist=true
spring.datasource.username=root
spring.datasource.password=examly
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.jpa.hibernate.ddl-auto=create
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect
EOL

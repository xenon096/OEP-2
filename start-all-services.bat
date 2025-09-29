@echo off
echo Starting Exam Portal Services...

echo Starting Eureka Server...
start "Eureka Server" cmd /k "cd eureka-server && mvn spring-boot:run"
timeout /t 15

echo Starting API Gateway...
start "API Gateway" cmd /k "cd api-gateway && mvn spring-boot:run"
timeout /t 10

echo Starting User Service...
start "User Service" cmd /k "cd user-service && mvn spring-boot:run"
timeout /t 10

echo Starting Exam Service...
start "Exam Service" cmd /k "cd exam-service && mvn spring-boot:run"
timeout /t 10

echo Starting Question Service...
start "Question Service" cmd /k "cd question-service && mvn spring-boot:run"
timeout /t 10

echo Starting Exam Session Service...
start "Exam Session Service" cmd /k "cd exam-session-service && mvn spring-boot:run"
timeout /t 10

echo Starting Result Service...
start "Result Service" cmd /k "cd result-service && mvn spring-boot:run"
timeout /t 10

echo Starting Notification Service...
start "Notification Service" cmd /k "cd notification-service && mvn spring-boot:run"
timeout /t 10

echo Starting Frontend...
start "Frontend" cmd /k "cd frontend && npm run dev"

echo All services started!
pause
# Online Exam Portal - Microservices Architecture

Optimized microservices-based online exam portal with Spring Boot, Eureka Server, and React frontend.

## Architecture

- **Eureka Server**: Service discovery (Port: 8761)
- **API Gateway**: Request routing (Port: 8080)
- **User Service**: User management (Port: 8081)
- **Exam Service**: Exam management (Port: 8082)
- **Question Service**: Question management (Port: 8083)
- **Exam Session Service**: Session management (Port: 8084)
- **Result Service**: Result management (Port: 8085)
- **Notification Service**: Notifications (Port: 8086)
- **React Frontend**: Web interface (Port: 3000)

## Prerequisites

- Java 17 or higher
- Maven 3.6 or higher
- MySQL 8.0 or higher
- Node.js 16 or higher
- npm 8 or higher

## Database Setup

1. Create MySQL database:
```sql
CREATE DATABASE exam_portal;
```

2. Update credentials in `user-service/src/main/resources/application.yml`:
```yaml
spring:
  datasource:
    username: your_username
    password: your_password
```

## Quick Start

**Windows:**
```bash
start-all-services.bat
```

**Linux/Mac:**
```bash
chmod +x start-services.sh && ./start-services.sh
```

**Manual:**
```bash
cd eureka-server && mvn spring-boot:run
cd api-gateway && mvn spring-boot:run
cd user-service && mvn spring-boot:run
```

## URLs

- **Application**: http://localhost:3000
- **Eureka**: http://localhost:8761
- **API Gateway**: http://localhost:8080

## Usage

1. Visit http://localhost:3000
2. Register with role (STUDENT/TEACHER/ADMIN)
3. Login and access dashboard
4. Default admin: username=`admin`, password=`Admin123!`

## Structure

```
├── eureka-server/          # Service Discovery
├── api-gateway/            # API Gateway
├── user-service/           # User Management
├── exam-service/           # Exam Management
├── question-service/       # Question Management
├── exam-session-service/   # Session Management
├── result-service/         # Result Management
├── notification-service/   # Notifications
├── frontend/               # React App
└── start-all-services.bat  # Startup Script
```

## Features

- JWT Authentication & Role-based Access
- Interactive Exam Interface with Timer
- Real-time Notifications
- CSV Question Import
- Responsive Design
- Microservices Architecture

## Roles

- **STUDENT**: Take exams, view results
- **TEACHER**: Create/manage exams and questions
- **ADMIN**: Full system access

## Requirements

- Java 17+, Maven 3.6+, MySQL 8.0+, Node.js 16+
- Ports 8761, 8080, 8081-8086, 3000 available

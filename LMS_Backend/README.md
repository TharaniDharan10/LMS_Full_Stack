# 📚 Library Management System

A comprehensive Spring Boot backend application for managing library operations including book management, user registration, and transaction handling with secure authentication and caching capabilities.

## 🚀 Features

- **User Management**: Student and Admin registration with role-based access
- **Book Management**: Add books, search by title/type with filtering capabilities
- **Transaction System**: Issue and return books with fine calculations
- **Security**: Spring Security with authentication and authorization
- **Caching**: Redis integration for improved performance
- **Validation**: Input validation with custom error handling
- **Logging**: Comprehensive logging with custom annotations
- **Database**: MySQL integration with JPA/Hibernate

## 🛠️ Tech Stack

- **Backend**: Spring Boot 3.x
- **Security**: Spring Security
- **Database**: MySQL
- **Caching**: Redis
- **ORM**: Spring Data JPA, Hibernate
- **Validation**: Bean Validation (JSR-303)
- **Logging**: SLF4J with Logback
- **Build Tool**: Maven
- **Java Version**: 17+

## 🏗️ Architecture

- **Controller Layer**: RESTful API endpoints
- **Service Layer**: Business logic implementation
- **Repository Layer**: Data access with custom queries
- **Entity Layer**: JPA entities with relationships
- **Security Layer**: Authentication and authorization
- **Exception Handling**: Global exception handling with @ControllerAdvice

## 📊 System Configuration

- **Server Port**: 8081
- **Book Maximum Validity**: 14 days
- **Fine Per Day**: ₹1
- **Database**: `Secure_Minor_Project` (auto-created)
- **Redis**: Cloud-based caching

## 🔌 API Endpoints

### Base URL: `http://localhost:8081`

## 👤 User Management APIs

### Register Student
```
POST /user/student
```
**Request Body**:
```json
{
    "userName" : "user1",
    "email" : "user1@example.com",
    "phoneNo" : "123",
    "address" : "Kolkata",
    "password" : "user1"
}
```
**Response**: User object with STUDENT role

### Register Admin
```
POST /user/admin
```
**Request Body**:
```json
{
    "userName" : "admin1",
    "email" : "admin1@example.com",
    "phoneNo" : "1234",
    "address" : "Mumbai",
    "password" : "admin1"
}
```
**Response**: User object with ADMIN role

## 📖 Book Management APIs

### Add Book (Admin Only)
```
POST /book
```
**Request Body**:
```json
{
    "bookTitle" : "C++Advanced",
    "bookNo" : "1",
    "securityAmount" : 200,
    "bookType" : "PROGRAMMING",
    "authorName" : "Author1",
    "authorEmail" : "Author1@example.com"
}
```
**Response**: Created book object

### Get All Books with Filtering
```
GET /book/all
```
**Query Parameters**:
- `title` (optional): Filter by book title
- `type` (optional): Filter by book type (PROGRAMMING, HISTORY, ENGLISH)

**Examples**:
- `GET /book/all?title=C++Advanced` - Filter by title containing "Spring"
- `GET /book/all?type=PROGRAMMING` - Filter by book type
- `GET /book/all?title=Java&type=PROGRAMMING` - Combined filtering

**Response**: List of books matching criteria

## 👨‍💼 Author Management APIs

### Get Author by Email
```
GET /author?email={authorEmail}
```
**Parameters**:
- `email`: Author's email address

**Example**: `GET /author?email=author1@example.com`
**Response**: Author object with details

## 📋 Transaction Management APIs

### Issue Book with User Authority
```
POST /transaction/issue
```
**Request Body**:
```json
{
  "userEmail": "user1@example.com",
  "bookNo": "1"
}
```
**Security**: User can only issue books to themselves
**Response**: Transaction object with issue details

### Return Book  with Admin Authority
```
PUT /transaction/return
```
**Request Body**:
```json
{
  "userEmail": "user1@example.com",
  "bookNo": "1"
}
```
**Response**: Settlement amount (fine if applicable)

## 🔒 Security Features

### Authentication
- **Method**: Username/Password based authentication
- **Roles**: STUDENT, ADMIN
- **Protection**: All endpoints require authentication

### Authorization
- **Book Management**: Admin access required
- **Issue Books**: Users can only issue books to themselves
- **Transaction History**: Role-based access

### Security Headers
- CSRF protection
- Session management

## ⚠️ Error Handling

### Common HTTP Status Codes

| Status Code | Description | Example |
|-------------|-------------|---------|
| 200 | Success | Successful book retrieval |
| 201 | Created | Book/User created successfully |
| 400 | Bad Request | Validation errors, trying to issue already issued book |
| 401 | Unauthorized | Invalid credentials |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Book/User not found |
| 500 | Internal Server Error | Database connection issues |

## 🚀 Getting Started

### Prerequisites
- Java 17 or higher
- Maven 3.6+
- MySQL 8.0+
- Redis (cloud or local)

### Installation & Setup

1. **Clone the repository**
```bash
git clone https://github.com/TharaniDharan10/Library_Management_System.git
cd Library_Management_System
```

2. **Configure Database**
Update `application.properties`:
```properties
spring.datasource.username=your_mysql_username
spring.datasource.password=your_mysql_password
spring.datasource.url=jdbc:mysql://localhost:3306/Secure_Minor_Project?createDatabaseIfNotExist=true
```

3. **Configure Redis**
Update Redis credentials in `application.properties`:
```properties
redis.host=your_redis_host
redis.port=your_redis_port
redis.password=your_redis_password
```

4. **Build the project**
```bash
mvn clean install
```

5. **Run the application**
```bash
mvn spring-boot:run
```

6. **Access the application**
- API Base URL: `http://localhost:8081`
- Database will be auto-created on first run

### Default Port
The application runs on port **8081** instead of the default 8080.

## 🧪 Testing the APIs

## 📋 Business Rules

### Book Issue Rules
- Users can only issue books to themselves
- Books cannot be issued if already issued to someone else
- Maximum validity period: 14 days
- Security amount is held during issue period

### Fine Calculation
- Fine: ₹1 per day after due date
- Settlement amount = Fine amount (if any)
- No fine if returned within validity period

### User Roles
- **STUDENT**: Can issue/return books assigned to them
- **ADMIN**: Full access to all operations including adding books

## 🔧 Configuration Options

### Application Properties
```properties
# Database Configuration
spring.datasource.username=root
spring.datasource.password=rootroot
spring.datasource.url=jdbc:mysql://localhost:3306/Secure_Minor_Project?createDatabaseIfNotExist=true

# JPA Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

# Business Rules
book.maximum.validity=14
book.fine.per.day=1

# Redis Configuration
redis.host=your-redis-host
redis.port=your-redis-port
redis.password=your-redis-password

# Server Configuration
server.port=8081
```

### Logging Configuration
- **Log File**: `test.log`
- **Log Level**: INFO
- **Custom Logging**: Available via `@LogAnnotation`

## 🛠️ Advanced Features

### Custom Annotations
- `@LogAnnotation`: Custom logging for method execution

### Custom Repositories
- Custom query implementations using Criteria API
- EntityManager integration for complex queries

### Caching Strategy
- Redis integration for improved performance
- Configurable cache settings

### Validation
- Bean validation for request DTOs
- Custom validation messages
- Global exception handling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🙏 Acknowledgments

- Built with Spring Boot ecosystem
- Inspired by real-world library management needs
- Designed for scalability and security

---

**Happy Reading! 📖**

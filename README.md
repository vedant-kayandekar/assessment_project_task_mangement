# Project & Task Management API

RESTful API built with **Node.js, Express, MySQL, and MongoDB (Mongoose)** for managing users, projects, and tasks with JWT authentication, input validation, pagination, and filtering.

---

## Tech Stack

* **Runtime:** Node.js (v18+)
* **Framework:** Express.js
* **Databases:**
  * **MySQL** – Used for relational data: User authentication & Projects.
  * **MongoDB** (via Mongoose) – Used for dynamic document data: Tasks.
* **Authentication:** JWT (`jsonwebtoken`) & password hashing with `bcryptjs`.
* **Testing:** VS Code REST Client (`api-test.rest`) / Thunder Client / Postman.

---

## Project Structure

```text
assessment_project_task_mangement/
├── database/
│   └── schema.sql            # MySQL schema for users & projects
├── src/
│   ├── config/
│   │   ├── mysql.js          # MySQL connection pool & auto-table setup
│   │   └── mongodb.js        # MongoDB Mongoose connection
│   ├── controllers/
│   │   ├── authController.js    # Register, login, profile management
│   │   ├── projectController.js # Projects CRUD (MySQL)
│   │   └── taskController.js    # Tasks CRUD, filter & pagination (MongoDB)
│   ├── middleware/
│   │   ├── authMiddleware.js    # JWT verification & req.user extraction
│   │   └── errorMiddleware.js   # Centralized error handler & custom projectError
│   ├── models/
│   │   └── Task.js              # Mongoose task schema with compound indexes
│   ├── routes/
│   │   ├── authRoutes.js        # /api/auth/*
│   │   ├── projectRoutes.js     # /api/projects/*
│   │   └── taskRoutes.js        # /api/tasks/*
│   ├── app.js                   # Express app setup & route mounting
│   └── server.js                # Server entry point & DB initialization
├── .env.example
├── api-test.rest             # Executable API test requests
└── package.json
```

---

## Setup & Installation

### 1. Prerequisites
Make sure you have running instances of:
* **Node.js** (v18 or higher)
* **MySQL Server** (running on port `3306`)
* **MongoDB Community Server** (running on port `27017`)

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root folder (or copy from `.env.example`):

```env
PORT=5000
NODE_ENV=development

JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=24h

MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=assessment

MONGO_URL=mongodb://127.0.0.1:27017/assessment
```

### 4. Database Setup
* **MySQL:** The application includes auto-initialization in `src/config/mysql.js`. On server start, it automatically runs `CREATE DATABASE IF NOT EXISTS assessment` and creates the `users` and `projects` tables. You can also manually inspect `database/schema.sql`.
* **MongoDB:** Collections are created automatically by Mongoose upon creating documents.

### 5. Start the Server
```bash
# Development mode (with auto reload)
npm run dev

# Production start
npm start
```

Server starts at: `http://localhost:5000`  
Health check endpoint: `http://localhost:5000/health`

---

## API Documentation

All protected routes require an `Authorization` header:
```text
Authorization: Bearer <your_jwt_token>
```

---

### 1. Authentication APIs (`/api/auth`)

#### `POST /api/auth/register`
Creates a new user in MySQL with hashed password.

* **Request Body:**
```json
{
  "name": "Vedant Kandekar",
  "email": "vedant@example.com",
  "password": "Password123"
}
```
* **Response (201 Created):**
```json
{
  "success": true,
  "message": "User account created successfully.",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "Vedant Kandekar",
      "email": "vedant@example.com"
    }
  }
}
```

#### `POST /api/auth/login`
Validates user credentials against MySQL and returns JWT token.

* **Request Body:**
```json
{
  "email": "vedant@example.com",
  "password": "Password123"
}
```
* **Response (200 OK):**
```json
{
  "success": true,
  "message": "User logged in successfully.",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "Vedant Kandekar",
      "email": "vedant@example.com"
    }
  }
}
```

#### `GET /api/auth/me` *(Protected)*
Returns the logged-in user profile.

#### `PUT /api/auth/profile` *(Protected)*
Updates the user's name or email.

---

### 2. Project Management APIs (`/api/projects` - MySQL)

Projects are stored in MySQL and restricted to the authenticated user. Supported statuses: `active`, `completed`, `archived`.

#### `POST /api/projects` *(Protected)*
* **Request Body:**
```json
{
  "name": "Music Creator Portal",
  "description": "Creator studio web platform",
  "status": "active"
}
```
* **Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "project": {
      "id": 1,
      "user_id": 1,
      "name": "Music Creator Portal",
      "description": "Creator studio web platform",
      "status": "active",
      "created_at": "2026-10-20T17:00:00.000Z"
    }
  }
}
```

#### `GET /api/projects` *(Protected)*
Returns all projects belonging to the logged-in user.

#### `GET /api/projects/:id` *(Protected)*
Returns single project by ID (returns 404 if not found or unauthorized).

#### `PUT /api/projects/:id` *(Protected)*
Updates project name, description, or status.

#### `DELETE /api/projects/:id` *(Protected)*
Deletes the project belonging to the user.

---

### 3. Task Management APIs (`/api/tasks` - MongoDB)

Tasks are stored in MongoDB using Mongoose and linked to MySQL projects and users.
* Supported statuses: `todo`, `in_progress`, `completed`
* Supported priorities: `low`, `medium`, `high`

#### `POST /api/tasks` *(Protected)*
Creates a task in MongoDB. **Validates that `projectId` exists in MySQL and belongs to the authenticated user.**

* **Request Body:**
```json
{
  "projectId": 1,
  "title": "Setup Audio Ingestion Pipeline",
  "description": "Process incoming audio streams",
  "status": "todo",
  "priority": "high",
  "dueDate": "2026-10-30T18:30:00.000Z"
}
```
* **Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "task": {
      "_id": "671542f7c04e28...",
      "userId": 1,
      "projectId": 1,
      "title": "Setup Audio Ingestion Pipeline",
      "description": "Process incoming audio streams",
      "status": "todo",
      "priority": "high",
      "dueDate": "2026-10-30T18:30:00.000Z",
      "createdAt": "2026-10-20T18:00:00.000Z"
    }
  }
}
```

#### `GET /api/tasks` *(Protected - with Pagination & Filtering)*
Supports query parameters:
* `page` (default: 1)
* `limit` (default: 10)
* `status` (`todo`, `in_progress`, `completed`)
* `priority` (`low`, `medium`, `high`)
* `projectId` (numeric ID)

**Example Request:**
```http
GET /api/tasks?page=1&limit=10&status=todo&priority=high
```

**Response (200 OK):**
```json
{
  "success": true,
  "pagination": {
    "totalRecords": 1,
    "totalPages": 1,
    "page": 1,
    "limit": 10
  },
  "data": {
    "tasks": [
      {
        "_id": "671542f7c04e28...",
        "userId": 1,
        "projectId": 1,
        "title": "Setup Audio Ingestion Pipeline",
        "status": "todo",
        "priority": "high"
      }
    ]
  }
}
```

#### `GET /api/tasks/:id` *(Protected)*
Returns single task by MongoDB ObjectId.

#### `PUT /api/tasks/:id` *(Protected)*
Updates task status, priority, title, etc.

#### `DELETE /api/tasks/:id` *(Protected)*
Deletes task by ID.

---

## Testing with VS Code REST Client (`api-test.rest`)

A complete testing file is provided in [`api-test.rest`](./api-test.rest).

### Step-by-Step Testing Flow:
1. Open VS Code and install the **REST Client** (or Thunder Client) extension.
2. Open `api-test.rest`.
3. Click **"Send Request"** above **1.1 Register New User**.
4. Click **"Send Request"** above **1.4 Login User** — the JWT token is automatically captured into the `@token` variable.
5. Run the requests in Section 2 (Projects):
   * Create project, get all projects, update project status.
6. Run the requests in Section 3 & 4 (Tasks):
   * Create tasks, test project ownership validation (try `projectId: 99999` $\rightarrow$ returns 404).
   * Test pagination and filtering: `GET /api/tasks?page=1&limit=10&status=todo&priority=high`.
7. Test negative/security cases in Section 6:
   * Unauthorized request without token $\rightarrow$ returns 401.
   * Invalid route $\rightarrow$ returns 404.

---

## Error Handling

Centralized error handling middleware intercepts all errors and returns consistent responses:
```json
{
  "success": false,
  "message": "Error description here"
}
```
* **400 Bad Request:** Missing required fields, invalid validation.
* **401 Unauthorized:** Missing or expired JWT token.
* **404 Not Found:** Resource not found or not owned by user.
* **409 Conflict:** Duplicate email address in MySQL.
* **500 Internal Server Error:** Unhandled database or system errors.

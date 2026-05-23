# Project Management System - Backend API

This is the robust RESTful API that powers the Project Management and Employee Tracking System. Built with **Node.js**, **Express**, and **PostgreSQL**, it follows a modular architecture for high scalability and maintainability.

---

## 🛠 Tech Stack

*   **Runtime:** Node.js (ES Modules)
*   **Framework:** Express.js (v5.1.0)
*   **Database:** PostgreSQL
*   **ORM:** Sequelize
*   **Security:** 
    *   JWT (JSON Web Tokens) for authentication
    *   Bcrypt for password hashing
    *   Express Rate Limit for DDoS protection
    *   CORS enabled
*   **Documentation:** Swagger UI (OpenAPI 3.0)

---

## 🚀 Key Features

### 🔐 Authentication & Security
*   **JWT Authentication:** Secure API access via bearer tokens.
*   **Role Management:** Middleware-based access control for Admins and Employees.
*   **Rate Limiting:** Protects the server from brute-force attacks.

### 📁 Business Modules
*   **User Management:** Registration, login, and profile management.
*   **Project Management:** Create, update, and track project lifecycles.
*   **Project Membership:** Assign and remove team members from specific projects.
*   **Task System:** Detailed task creation with status tracking.
*   **Time Logging:** Precise tracking of work hours (calculates total seconds for accurate reporting).
*   **Leave Management:** Employee leave request and approval workflow.
*   **Client Management:** Manage client status (including 'deleted' status logic).

### 📖 API Documentation
Integrated **Swagger UI** for easy testing of endpoints. 
- **URL:** `http://localhost:8000/api-docs` (default)

---

## 📁 Project Structure

```text
├── config/              # Swagger and Database configuration
├── middleware/          # Auth guards and request validators
├── modules/             # Domain-driven business logic
│   ├── clients/         # Client status & data management
│   ├── leaves/          # HR & Leave workflow
│   ├── project/         # Project services & logic
│   ├── projectMember/   # Membership & team assignments
│   ├── task/            # Task models and controllers
│   ├── taskTimeLog/     # Time calculation logic
│   └── user/            # Identity management
├── routes/              # API route definitions (userRoutes.js, etc.)
├── server.js            # Application entry point
└── .env                 # Environment variables

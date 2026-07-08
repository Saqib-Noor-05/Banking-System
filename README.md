# 🏦 Advanced Backend Banking System

<p align="center">
A production-inspired backend banking application built with <strong>Node.js</strong>, <strong>Express.js</strong>, and <strong>MongoDB</strong>.
<br>
It demonstrates secure authentication, ledger-based accounting, atomic fund transfers, real-time balance computation, and production-level backend development practices.
</p>

---
## ✨ Overview

This project simulates the backend of a modern banking system by implementing secure user authentication, account management, ledger-based accounting, and transactional fund transfers.

Instead of storing balances directly inside an account document, the application calculates balances dynamically using MongoDB Aggregation Pipelines over ledger entries. Every transfer is executed inside a MongoDB Transaction to guarantee atomicity and data consistency.

The project focuses on building scalable, secure, and maintainable REST APIs following industry-standard backend architecture.

---

# 🚀 Features

## 🔐 Authentication

Secure authentication is implemented using **JWT (JSON Web Tokens)** along with password hashing using **bcrypt**.

### Includes

- User Registration
- User Login
- Secure Logout
- JWT Authentication
- Cookie-Based Authentication
- Protected Routes
- Token Blacklisting after Logout

---

## 👤 User Management

Users can securely register and access the banking system.

### Features

- Register New Users
- Login using Email or Username
- Password Encryption with bcrypt
- JWT Token Generation
- Authentication Middleware

---

## 🏦 Account Management

Every authenticated user can create and manage multiple bank accounts.

### Features

- Create Bank Account
- Retrieve User Accounts
- Multiple Account Support
- Account Status Validation
- Secure Account Access

---

## 💸 Money Transfer

The application supports secure money transfers between users while maintaining ACID properties.

### Transfer Workflow

- Validate Request
- Verify Sender & Receiver
- Validate Idempotency Key
- Check Account Status
- Calculate Sender Balance
- Create Transaction
- Create Debit Ledger Entry
- Create Credit Ledger Entry
- Commit MongoDB Transaction
- Send Email Notification

---

## 📒 Ledger-Based Accounting

Instead of updating balances directly, this project follows a **Ledger-Based Accounting System**.

Every successful transfer generates:

- Debit Ledger Entry
- Credit Ledger Entry

Current account balance is calculated dynamically from ledger entries.

This approach closely resembles how modern banking systems maintain financial records.

---

## 📊 Real-Time Balance Tracking

The current balance is calculated using **MongoDB Aggregation Pipelines**.

This provides:

- Accurate balances
- Complete transaction history
- Better auditing
- No redundant balance storage

---

## 🔄 MongoDB Transactions

Money transfers execute inside MongoDB Sessions.

If any step fails:

- Debit is rolled back
- Credit is rolled back
- Transaction is aborted

This guarantees **atomic financial transactions**.

---

## 🛡 Idempotency Support

Every transaction requires an **Idempotency Key**.

This prevents duplicate transactions caused by repeated client requests or network retries.

---

## 📧 Email Notifications

Integrated **Nodemailer** to automatically send email notifications when:

- A new user registers successfully
- A transaction completes successfully

---

# 🏗 Project Architecture

```text
Client
      │
      ▼
 Express API
      │
 ┌────┴────────────┐
 │                 │
 ▼                 ▼
Authentication   Banking APIs
 │                 │
 ▼                 ▼
Controllers → Services
 │
 ▼
MongoDB
```

---

# 📂 Project Structure

```text
Banking-System
│
├── src
│   ├── config
│   ├── controllers
│   ├── middlewares
│   ├── models
│   ├── routes
│   ├── services
│   └── app.js
│
├── server.js
├── package.json
└── README.md
```

---

# ⚙️ Tech Stack

| Technology | Purpose |
|------------|----------|
| Node.js | Runtime Environment |
| Express.js | Backend Framework |
| MongoDB | Database |
| Mongoose | ODM |
| JWT | Authentication |
| bcrypt | Password Hashing |
| Cookie Parser | Cookie Authentication |
| Nodemailer | Email Notifications |

---

# 📡 API Endpoints

## Authentication

| Method | Endpoint |
|---------|----------|
| POST | /api/auth/register |
| POST | /api/auth/login |
| POST | /api/auth/logout |

---

## Account

| Method | Endpoint |
|---------|----------|
| POST | /api/account/create-account |
| GET | /api/account/getAllAccounts |
| GET | /api/account/getBalance/:accountID |

---

## Transaction

| Method | Endpoint |
|---------|----------|
| POST | /api/transaction |
| POST | /api/transaction/system/initial-funds |

---

# 🔐 Security Features

- JWT Authentication
- Password Hashing
- Cookie Authentication
- Token Blacklisting
- Protected Routes
- MongoDB Transactions
- Idempotency Keys
- Input Validation

---

# 📚 Concepts Demonstrated

- REST API Development
- MVC Architecture
- Authentication & Authorization
- MongoDB Transactions
- Aggregation Pipeline
- Ledger-Based Accounting
- Atomic Money Transfer
- Middleware
- Error Handling
- Secure Backend Development

---

# 🚀 Getting Started

## Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/Banking-System.git
```

## Install Dependencies

```bash
npm install
```

## Create Environment File

```env
PORT=

MONGO_URI=

JWT_SECRET=

EMAIL=

EMAIL_PASSWORD=
```

## Run the Server

```bash
npm start
```

# 👨‍💻 Author

**Noor Saqib**

If you found this project interesting, feel free to ⭐ the repository and share your feedback!

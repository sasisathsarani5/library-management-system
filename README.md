# 📚 Library Management System

A full-stack web application built with **Flask**, **MySQL**, and **React (TypeScript + Vite)** for managing library book inventory, member registration, and book borrowing/returning transactions with fine calculations.

---

## 🛠️ Tech Stack

- **Backend:** Python (Flask), PyMySQL, CORS
- **Frontend:** React (TypeScript), Vite, Axios
- **Database:** MySQL (Relational Schema with ACID Transactions)

---

## 🚀 Features

- **Book Management:** Add, list, and monitor total vs. available book copies in real-time.
- **Member Management:** Register new members and admins with role-based attributes.
- **Transaction Engine:**
  - Issue books to registered members with automated availability check.
  - Return books with atomic MySQL transactions and automated late fine calculation ($1.00/day).

---

## ⚙️ Setup & Installation

### 1. Database Setup
Execute `database/database.sql` in your MySQL instance to create `library_db` and all required tables.

### 2. Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
python app.py
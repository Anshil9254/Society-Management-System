# Society Management System

A production-ready society management platform designed to automate and streamline residential society operations. Built with modern web technologies, this system handles everything from resident onboarding and complaint tracking to automated maintenance billing and role-based access control (RBAC).

## 🚀 Features

*   **Role-Based Access Control (RBAC):** Distinct roles and permissions for Admin, Committee Members, and Residents. Ensures users can only access endpoints and UI elements meant for their role.
*   **User Authentication & Security:** Secure JWT-based authentication with short-lived access tokens and Redis-backed refresh tokens. Includes brute-force protection via rate limiting.
*   **Resident & Flat Management:** Manage residents, their profiles, flat occupancies, and vehicle/emergency contact details seamlessly.
*   **Automated Maintenance Billing:** Automated monthly bill generation using background jobs (BullMQ). Supports multi-month tracking and varying statuses (`pending`, `partially_paid`, `paid`, `overdue`).
*   **Payment Tracking with Idempotency:** Record and track maintenance payments. Uses Redis-backed idempotency keys to safely process payments and prevent duplicate charges even on flaky network connections.
*   **Complaint & Service Request Management:** Residents can raise complaints (with image uploads) and request services (plumbing, electrical, etc.). Committee members can assign, track, and resolve them with a full, immutable status audit trail.
*   **Announcements & Notices:** Society-wide or targeted announcements (all, residents, committee) with optional pinning and automatic expiration.
*   **Comprehensive Audit Logs:** Immutable trail of sensitive actions (e.g., bill creation, status changes) for accountability and transparency. Captures the user, action, IP, and before/after JSON snapshots.
*   **Real-time Notifications:** In-app notification feed to keep residents and committee members informed about bills, complaints, and announcements.
*   **Dashboard & Reports:** Aggregated real-time metrics and complaint trend reports, heavily cached in Redis for optimal performance on load.

## 🔄 Flow of Functionality

The system is designed around clear, automated workflows tailored to specific user roles:

1.  **Resident Onboarding Flow:**
    *   An Admin or Committee Member registers a new resident and assigns them to a specific flat (linking `users` to `flats` and `blocks`).
    *   The resident receives their credentials, logs in (receiving JWT tokens), and manages their profile via their dedicated dashboard.
2.  **Maintenance & Billing Flow:**
    *   **Generation:** On the 1st of every month, a background job (`BullMQ`) automatically processes all occupied flats and generates maintenance bills.
    *   **Notification:** Residents are notified and view their pending bills on their dashboard.
    *   **Payment:** When a resident makes a payment (cash, UPI, netbanking), the system safely records it (using an idempotency key to prevent double-charging on retry) and updates the bill status.
3.  **Complaint Resolution Lifecycle:**
    *   A resident raises a complaint (e.g., plumbing issue) and optionally attaches photos.
    *   The complaint appears in the Committee dashboard. An admin assigns it to a committee member for oversight.
    *   As work progresses, the committee member updates the status (`open` ➔ `in_progress` ➔ `resolved`). Every change is recorded in the `complaint_status_logs`.
4.  **Security & Audit Flow:**
    *   Every sensitive mutation (like editing a notice or updating a bill) passes through the `auditLogger` middleware.
    *   It automatically takes a before/after snapshot of the affected row and logs the IP and User ID to the `audit_logs` table, ensuring no action goes untracked.

## 🛠️ Technology Stack & Benefits

### Backend
*   **Node.js (v20 LTS) & Express.js:** Fast, non-blocking runtime perfect for REST APIs. Provides a massive ecosystem of middleware for security, validation, and routing.
*   **PostgreSQL 15+:** A robust relational database ideal for highly normalized data (users, flats, bills, payments). Ensures data integrity through strict foreign key constraints and ACID transactions.
*   **Prisma ORM (or Sequelize):** Provides schema-as-code, automatic type-safe migrations, and built-in protection against SQL injection.
*   **Redis 7+:** High-performance in-memory store used strategically for:
    *   *Security:* Storing JWT refresh token blacklists (instant session revocation) and API rate limiting (brute-force protection).
    *   *Performance:* Caching read-heavy endpoints like dashboard stats and announcements, preventing expensive DB queries on every load.
    *   *Reliability:* Payment idempotency keys.
*   **BullMQ:** Redis-backed job queue for offloading heavy tasks (monthly bill generation, email notifications) from the main request/response cycle, ensuring the API remains highly responsive.
*   **Zod / Joi:** Centralized schema validation ensuring clean, strictly typed data enters the controllers.

### Frontend
*   **React.js (Vite):** Blazing fast build tool and modern component-based UI library for a highly responsive single-page application (SPA).
*   **Tailwind CSS & Shadcn UI:** Utility-first CSS framework combined with accessible, pre-built components for a clean, modern, and highly responsive design without the bloat of traditional CSS frameworks.
*   **React Router:** Handles client-side, role-aware routing (e.g., blocking standard residents from accessing admin pages).
*   **Axios API Client:** Configured with global interceptors to automatically inject JWT access tokens and seamlessly handle token refreshes on 401 errors behind the scenes.

## 🗄️ Database Schema & Relationships

The database is fully normalized to 3NF to prevent data duplication.
*   **Core:** `roles`, `users`, `societies`, `blocks`, `flats`, `resident_profiles`, `committee_members`
*   **Operations:** `maintenance_bills`, `payments`, `announcements`
*   **Requests:** `complaints`, `complaint_images`, `complaint_status_logs`, `service_requests`
*   **System:** `audit_logs`, `notifications`

*At the core of the ER diagram is the `users` table (handling RBAC) and the `flats` table (representing physical units). Almost all operational tables link back to these two entities.*

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18+)
*   PostgreSQL (v15+)
*   Redis Server

### Backend Setup
1.  Navigate to the backend directory: `cd backend`
2.  Install dependencies: `npm install`
3.  Create a `.env` file from the example: `cp .env.example .env`
4.  Update `.env` with your PostgreSQL and Redis credentials.
5.  Run database migrations and seed initial roles:
    ```bash
    npx prisma migrate dev
    npx prisma db seed
    ```
6.  Start the development server: `npm run dev`

### Frontend Setup
1.  Navigate to the frontend directory: `cd frontend`
2.  Install dependencies: `npm install`
3.  Start the Vite server: `npm run dev`

## ⚙️ Environment Variables

Copy the `backend/.env.example` file to `backend/.env` and update the values appropriately.

| Variable | Description | Example Value |
| :--- | :--- | :--- |
| `NODE_ENV` | Application environment | `development` |
| `PORT` | API Server port | `5000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/db` |
| `REDIS_URL` | Redis connection string | `redis://default:pass@localhost:6379` |
| `JWT_ACCESS_SECRET` | Secret for short-lived access tokens | `your_access_secret_...` |
| `JWT_REFRESH_SECRET` | Secret for long-lived refresh tokens| `your_refresh_secret_...` |
| `JWT_ACCESS_EXPIRY` | Access token lifetime | `15m` |
| `CORS_ORIGIN` | Allowed frontend URL | `http://localhost:5173` |

## 📚 API Documentation

*   **Swagger UI:** Interactive API documentation is available at `/api-docs` when the backend is running.
*   **Postman Collection:** An exportable collection is located in `backend/docs/API-collection.postman_collection.json`.

## 🖼️ Screenshots

*(Add screenshots of Admin Dashboard, Complaint Management, Billing screens, etc. here)*
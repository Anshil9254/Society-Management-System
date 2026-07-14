# Society Management System - Frontend

This is the frontend application for the Society Management System, built with modern web technologies to provide a fast, responsive, and beautiful user interface.

## Tech Stack
- **Framework:** React + Vite
- **Styling:** Tailwind CSS
- **UI Components:** Shadcn UI (Radix UI primitives)
- **Routing:** React Router DOM
- **Forms & Validation:** React Hook Form + Zod
- **API Client:** Axios (with JWT interceptors)

## Directory Structure
- `src/components/ui`: Shadcn reusable UI components
- `src/contexts`: React Contexts (e.g., AuthContext)
- `src/lib`: Utilities (e.g., api.js, utils.js)
- `src/pages`: Page components (Login, AdminDashboard, ResidentDashboard)

## Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

## Architecture Notes
- The app uses `AuthContext` to manage the global authentication state.
- `ProtectedRoute` is a wrapper that enforces role-based access control to specific routes (e.g., only `admin` can access `/admin`).
- API requests automatically attach the Bearer token using Axios interceptors defined in `src/lib/api.js`.

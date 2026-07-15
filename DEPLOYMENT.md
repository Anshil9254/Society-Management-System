# Society Management System - Deployment Guide

This project is currently deployed and optimized for production on Vercel. Because of specific production configurations, running this project locally may not work properly out-of-the-box. 

## Live Links
* **Frontend Application:** [https://society-management-system-iota.vercel.app](https://society-management-system-iota.vercel.app)
* **Backend API:** [https://society-management-system-kcmh.vercel.app](https://society-management-system-kcmh.vercel.app)

## Why Local Development is Affected

If you clone this repository and try to run `npm run dev` locally, you might encounter issues such as CORS errors, 404 API routes, or file system errors. This is due to the following production-specific changes:

### 1. CORS Configuration
The backend (`backend/src/app.js`) is configured to only allow requests from the specific Vercel frontend domain (`https://society-management-system-iota.vercel.app`). 
* If you run the frontend locally on `localhost:5173`, requests to the backend will be blocked by CORS policy.

### 2. Frontend Environment Variables
The frontend is built using Vite and currently relies on `.env.production` which hardcodes `VITE_API_URL` to point to the deployed Vercel backend (`https://society-management-system-kcmh.vercel.app`).
* Running the frontend locally might inadvertently make API requests to the production backend instead of your local backend, which will result in CORS failures because the production backend does not accept requests from `localhost`.

### 3. Vercel File System Limitations
Vercel's serverless environment has a read-only file system (except for `/tmp`). We updated the backend logger (`logger.js`) to disable writing to the `logs/` directory when running in Vercel to prevent `ENOENT: mkdir` crashes. 

### 4. Cookie Settings (`sameSite: 'None'`)
Authentication relies on HTTP-only cookies. In production, we use `secure: true` and `sameSite: 'None'` to allow cross-origin cookies between the Vercel frontend and Vercel backend domains. 
* Browsers will reject `secure: true` cookies on non-HTTPS origins, meaning local development on `http://localhost` will fail to store the authentication cookie properly unless you disable these settings.

---

## How to Run Locally Again

If you need to do local development, you will need to temporarily revert or override these production settings.

**1. Update Backend `.env`**
In your `backend/.env` file, ensure you have:
```env
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

**2. Modify Backend Cookie Settings**
In your backend auth controller (`backend/src/modules/auth/auth.controller.js`), ensure cookies are set dynamically based on the environment, or manually revert them for local testing:
```javascript
res.cookie('refreshToken', refreshToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
});
```

**3. Set Frontend `.env.local`**
In your `frontend` directory, create a `.env.local` file (Vite automatically prioritizes this over other `.env` files for local dev):
```env
VITE_API_URL=http://localhost:5000/api/v1
```

By making these changes on your local machine (without committing them to the main branch), you can continue local development while keeping the production environment stable.

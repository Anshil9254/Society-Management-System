# API Documentation

This document outlines the REST API endpoints available in the Society Management System backend, extracted from the OpenAPI specifications.

**Base URL:** `http://localhost:5000/api/v1`  
**Authentication:** JWT Bearer Token (Pass via `Authorization: Bearer <token>` header)

## 1. Authentication (`/auth`)
*   **`POST /auth/register`**: Register a new resident. (No Auth)
*   **`POST /auth/login`**: Authenticate and receive an access token + `httpOnly` refresh token. (No Auth)
*   **`POST /auth/refresh`**: Get a new access token using the `httpOnly` refresh token cookie.
*   **`POST /auth/logout`**: Invalidate session and revoke refresh tokens.

## 2. Users (`/users`)
*   **`GET /users`**: Retrieve a paginated list of all users. (Admin/Committee)
*   **`GET /users/me`**: Get the profile of the currently authenticated user.
*   **`PATCH /users/me`**: Update personal profile (phone, full name).
*   **`GET /users/{id}`**: Get specific user details by ID. (Admin)
*   **`PATCH /users/{id}`**: Update a user's role or status. (Admin)
*   **`DELETE /users/{id}`**: Delete a user. (Admin)

## 3. Complaints (`/complaints`)
*   **`GET /complaints`**: Get complaints (Residents see their own; Admin/Committee see all). Supports filtering by status and category.
*   **`POST /complaints`**: Create a new complaint. Supports image upload via `multipart/form-data`.
*   **`GET /complaints/{id}`**: Get specific complaint details.
*   **`PATCH /complaints/{id}/status`**: Update the status of a complaint. (Admin/Committee)

## 4. Billing (`/billing`)
*   **`GET /billing`**: Get paginated list of maintenance bills.
*   **`POST /billing/single`**: Generate a maintenance bill for a specific flat. (Admin)
*   **`POST /billing/bulk`**: Generate bills for all occupied flats in bulk. (Admin)
*   **`GET /billing/{id}`**: Retrieve specific bill details.
*   **`DELETE /billing/{id}`**: Delete a bill. (Admin)
*   **`POST /billing/{id}/pay`**: Record a payment against a maintenance bill.

## 5. Payments (`/payments`)
*   **`GET /payments`**: Retrieve payment history.
*   **`POST /payments`**: Submit a new payment record.

## 6. Announcements (`/announcements`)
*   **`GET /announcements`**: Fetch active announcements based on user role.
*   **`POST /announcements`**: Create a new announcement. (Admin/Committee)
*   **`GET /announcements/{id}`**: View a specific announcement.
*   **`PUT /announcements/{id}`**: Edit an announcement. (Admin/Committee)
*   **`DELETE /announcements/{id}`**: Delete an announcement. (Admin/Committee)

## 7. Service Requests (`/service-requests`)
*   **`GET /service-requests`**: List service requests.
*   **`POST /service-requests`**: Submit a new service request.
*   **`PATCH /service-requests/{id}/status`**: Approve, reject, or complete a service request. (Admin/Committee)

## 8. Dashboard (`/dashboard`)
*   **`GET /dashboard/stats`**: Retrieve high-level statistics (total users, open complaints, pending payments).
*   **`GET /dashboard/complaints-trend`**: Get report data for complaint resolution trends.

## 9. Notifications (`/notifications`)
*   **`GET /notifications`**: List user's notifications.
*   **`PATCH /notifications/{id}/read`**: Mark a notification as read.
*   **`PATCH /notifications/read-all`**: Mark all notifications as read.

## 10. Audit Logs (`/audit-logs`)
*   **`GET /audit-logs`**: Fetch system audit logs for sensitive operations. (Admin only)

## 11. Blocks & Flats (`/blocks`)
*   **`GET /blocks`**: Retrieve all blocks and their flats.
*   **`POST /blocks`**: Add a new block. (Admin)
*   **`POST /blocks/{blockId}/flats`**: Add a flat to a block. (Admin)

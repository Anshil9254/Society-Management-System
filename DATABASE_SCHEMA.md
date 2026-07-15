# Database Schema Documentation

This document describes the database schema for the Society Management System, built using PostgreSQL and Prisma ORM.

## 1. Core Auth & Users

### `users`
Central entity for Role-Based Access Control (RBAC) and user authentication.
*   **id** (UUID, Primary Key)
*   **email** (String, Unique)
*   **password_hash** (String)
*   **phone** (String, Optional)
*   **role** (String) - `admin`, `committee_member`, `resident` (Default: `resident`)
*   **status** (String) - `active`, `inactive`, `suspended` (Default: `active`)
*   **last_login_at** (DateTime, Optional)
*   **created_at** / **updated_at** (DateTime)

## 2. Society Structure (Blocks & Flats)

### `blocks`
Represents physical building blocks within the society.
*   **id** (UUID, Primary Key)
*   **name** (String, Unique) - e.g., "Block A"
*   **floor_count** (Int)
*   **created_at** / **updated_at** (DateTime)

### `flats`
Represents individual units within a block.
*   **id** (UUID, Primary Key)
*   **block_id** (UUID, Foreign Key) -> `blocks.id`
*   **flat_number** (String) - e.g., "A-101"
*   **type** (String) - e.g., "2BHK", "3BHK"
*   **square_feet** (Int, Optional)
*   **created_at** / **updated_at** (DateTime)

## 3. Resident Data

### `resident_profiles`
Details of residents mapped to flats and users.
*   **id** (UUID, Primary Key)
*   **user_id** (UUID, Unique, Foreign Key) -> `users.id`
*   **flat_id** (UUID, Foreign Key) -> `flats.id`
*   **full_name** (String)
*   **move_in_date** (DateTime)
*   **is_owner** (Boolean) - Default: `true`
*   **created_at** / **updated_at** (DateTime)

### `family_members`
Dependents living with the primary resident.
*   **id** (UUID, Primary Key)
*   **flat_id** (UUID, Foreign Key) -> `flats.id`
*   **full_name** (String)
*   **relation** (String)
*   **age** (Int, Optional)
*   **created_at** / **updated_at** (DateTime)

### `vehicles`
Registered vehicles for a flat.
*   **id** (UUID, Primary Key)
*   **flat_id** (UUID, Foreign Key) -> `flats.id`
*   **vehicle_number** (String, Unique)
*   **type** (String) - `2-wheeler`, `4-wheeler`
*   **make_model** (String, Optional)
*   **created_at** / **updated_at** (DateTime)

## 4. Visitors & Helpers

### `visitors`
Visitor entry and exit logs.
*   **id** (UUID, Primary Key)
*   **flat_id** (UUID, Foreign Key) -> `flats.id`
*   **full_name** (String)
*   **phone** (String, Optional)
*   **purpose** (String)
*   **entry_time** (DateTime)
*   **exit_time** (DateTime, Optional)

### `domestic_helpers`
Staff working in specific flats (maids, drivers, etc.).
*   **id** (UUID, Primary Key)
*   **flat_id** (UUID, Foreign Key) -> `flats.id`
*   **full_name** (String)
*   **role** (String)
*   **phone** (String, Optional)
*   **id_proof_number** (String, Optional)
*   **is_active** (Boolean) - Default: `true`
*   **created_at** / **updated_at** (DateTime)

## 5. Complaints & Service Requests

### `complaints`
Tickets raised by residents.
*   **id** (UUID, Primary Key)
*   **user_id** (UUID, Foreign Key) -> `users.id`
*   **title** (String)
*   **description** (String)
*   **category** (String)
*   **priority** (String) - `low`, `medium`, `high`
*   **status** (String) - `open`, `in_progress`, `resolved`, `closed`
*   **image_url** (String, Optional)
*   **created_at** / **updated_at** (DateTime)

### `complaint_status_logs`
Audit trail of complaint status changes.
*   **id** (UUID, Primary Key)
*   **complaint_id** (UUID, Foreign Key) -> `complaints.id`
*   **status** (String)
*   **comment** (String, Optional)
*   **created_at** (DateTime)

### `service_requests`
Requests for society services.
*   **id** (UUID, Primary Key)
*   **user_id** (UUID, Foreign Key) -> `users.id`
*   **service_type** (String)
*   **preferred_date** (DateTime)
*   **status** (String) - `pending`, `approved`, `rejected`, `completed`
*   **notes** / **image_url** (String, Optional)
*   **created_at** / **updated_at** (DateTime)

## 6. Billing & Payments

### `maintenance_bills`
Monthly maintenance dues per flat.
*   **id** (UUID, Primary Key)
*   **flat_id** (UUID, Foreign Key) -> `flats.id`
*   **billing_month** / **billing_year** (Int)
*   **amount** (Decimal)
*   **due_date** (DateTime)
*   **status** (String) - `pending`, `paid`, `partially_paid`, `overdue`
*   **created_at** / **updated_at** (DateTime)

### `payments`
Transactions against maintenance bills.
*   **id** (UUID, Primary Key)
*   **bill_id** (UUID, Foreign Key) -> `maintenance_bills.id`
*   **user_id** (UUID, Foreign Key) -> `users.id`
*   **amount** (Decimal)
*   **payment_mode** (String)
*   **transaction_id** (String, Unique, Optional)
*   **status** (String) - `pending`, `success`, `failed`
*   **paid_at** (DateTime)

## 7. Communication & Announcements

### `announcements`
Broadcast messages for residents.
*   **id** (UUID, Primary Key)
*   **title** / **content** (String)
*   **target_audience** (String) - `all`, `residents`, `committee`
*   **is_pinned** (Boolean)
*   **created_at** / **updated_at** (DateTime)

### `notifications`
In-app notifications for users.
*   **id** (UUID, Primary Key)
*   **user_id** (UUID, Foreign Key) -> `users.id`
*   **title** / **message** / **type** (String)
*   **is_read** (Boolean)
*   **created_at** (DateTime)

## 8. Security & Audit

### `audit_logs`
Immutable tracking for sensitive operations.
*   **id** (UUID, Primary Key)
*   **user_id** (UUID, Optional, Foreign Key) -> `users.id`
*   **action** (String)
*   **entity_type** / **entity_id** (String)
*   **details** (Json, Optional)
*   **ip_address** (String, Optional)
*   **created_at** (DateTime)

## 9. Events

### `events`
Society events and gatherings.
*   **id** (UUID, Primary Key)
*   **title** / **description** (String)
*   **event_date** (DateTime)
*   **location** / **organizer** (String, Optional)
*   **created_at** / **updated_at** (DateTime)

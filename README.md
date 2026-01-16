# Procurement Management System

A robust, containerized backend system for managing procurement processes, orders, checklists, and user roles. Built with Node.js, TypeScript, PostgreSQL, and Prisma.

## Table of Contents
- [Tech Stack](#tech-stack)
- [Modules & Features](#modules--features)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
    - [Docker (Recommended)](#docker-recommended)
    - [Local Development](#local-development)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)

## Tech Stack
-   **Runtime**: [Node.js](https://nodejs.org/) (v20+ recommended)
-   **Framework**: [Express.js](https://expressjs.com/)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Database**: [PostgreSQL](https://www.postgresql.org/)
-   **ORM**: [Prisma](https://www.prisma.io/) (v7.2.0)
-   **Validation**: [Zod](https://zod.dev/)
-   **Authentication**: JWT & bcrypt
-   **Documentation**: Swagger / OpenAPI 3.0
-   **Containerization**: Docker & Docker Compose
-   **Logging**: Winston
-   **File Handling**: Multer

## Modules & Features

### 1. Auth Module (`/src/modules/auth`)
-   **Secure Login**: Supports login via Email or Phone number.
-   **Token Management**: Issues JWT access tokens for session management.
-   **Password Security**: Uses bcrypt for strict password hashing.

### 2. Users Module (`/src/modules/users`)
-   **Role-Based Access Control (RBAC)**:
    -   **ADMIN**: Full system access.
    -   **PROCUREMENT_MANAGER (PM)**: Manages orders and assigns Inspection Managers.
    -   **INSPECTION_MANAGER (IM)**: Conducts inspections and submits checklists.
    -   **CLIENT**: Views orders and reports assigned to them.
-   **User Management**: Registration and hierarchical user assignment (e.g., Admin assigns PMs).

### 3. Orders Module (`/src/modules/orders`)
-   **Order Lifecycle**: Create, update, and track procurement orders.
-   **Assignment**: Link orders to specific Clients and Procurement Managers.
-   **Checklist Integration**: Associate checklist templates with orders for inspections.

### 4. Checklists Module (`/src/modules/checklists`)
-   **Dynamic Templates**: Create flexible JSON-based checklist templates (questions, types, options).
-   **Submissions**: Inspection Managers submit responses (including images) against templates.
-   **Versioning**: Tracks template versions.

### 5. Uploads Module (`/src/modules/uploads`)
-   **File Storage**: Handles local file uploads for inspection images and documents.
-   **Management**: API endpoints to upload, retrieve (by URL), and delete files.
-   **Validation**: Configurable file size limits (Default: 5MB).

## Prerequisites
-   **Docker Engine** & **Docker Compose**
-   **Node.js** v20+ (for local dev)
-   **Git**

## Installation & Setup

### Docker (Recommended)
This approach sets up the entire stack (App + Database) automatically.

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd procurement_management
    ```

2.  **Configure Environment**:
    The `docker-compose.dev.yml` file comes pre-configured with environment variables. You can verify them in the `environment` section.

3.  **Build and Start**:
    ```bash
    docker-compose -f docker-compose.dev.yml up --build
    ```
    *This command will:*
    -   Build the Node.js application image.
    -   Start the PostgreSQL database container.
    -   Run database migrations automatically.
    -   Seed the database with an initial Admin user.
    -   Start the API server on port `8000`.

4.  **Access the Application**:
    -   **API Root**: `http://localhost:8000/api`
    -   **Swagger Docs**: `http://localhost:8000/api/docs`

### Local Development
If you prefer running without Docker (except for the DB):

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Setup Database**:
    -   Ensure you have a PostgreSQL instance running.
    -   Create a `.env` file in the root directory:
        ```env
        DATABASE_URL="postgresql://user:password@localhost:5432/procurement_db?schema=public"
        JWT_SECRET="your_secret_key"
        PORT=3000
        ```

3.  **Run Migrations**:
    ```bash
    npx prisma migrate dev --name init
    ```

4.  **Seed Database**:
    ```bash
    npx ts-node prisma/seed.ts
    ```

5.  **Start Development Server**:
    ```bash
    npm run dev
    ```


### Kubernetes (Minikube)
To run the service and database on a local Minikube cluster:

1.  **Start Minikube**:
    ```bash
    minikube start
    ```

2.  **Build Docker Image**:
    Build the image inside Minikube's Docker environment so it's accessible to the cluster:
    ```bash
    eval $(minikube docker-env)
    docker build -t procurement-service:latest .
    ```

3.  **Apply Manifests**:
    Deploy the database and service:
    ```bash
    kubectl apply -f deployments/db-deployment.yaml
    kubectl apply -f deployments/db-service.yaml
    kubectl apply -f deployments/procurement-deployment.yaml
    kubectl apply -f deployments/procurement-service.yaml
    ```

4.  **Access the Service**:
    Get the service URL:
    ```bash
    minikube service procurement-service --url
    ```

## Environment Variables
| Variable | Description | Default (Docker) |
|----------|-------------|------------------|
| `PORT` | API Server Port | `8000` |
| `DATABASE_URL` | PostgreSQL Connection String | `postgresql://postgres:postgres@postgres:5432/postgres...` |
| `JWT_SECRET` | Secret key for signing tokens | `supersecretjwtkey` |

## API Documentation
The application includes auto-generated Swagger documentation.

-   **URL**: `http://localhost:8000/api/docs`
-   **Format**: OpenAPI 3.0
-   **Features**: Interactive API exploration and testing.

### Key Endpoints
-   `POST /auth/login`: Authenticate user.
-   `POST /users/register`: Register new users (Role protected).
-   `POST /orders`: Create new procurement orders.
-   `GET /checklists`: Fetch available checklist templates.
-   `POST /uploads`: Upload files.

## Project Structure
```
procurement_management/
├── prisma/                 # Database schema, migrations, and seeds
│   ├── migrations/
│   ├── schema.prisma
│   └── seed.ts
├── prisma.config.ts        # Prisma configuration
├── src/
│   ├── config/             # App configuration (Swagger, Env)
│   ├── middlewares/        # Auth, Validation, Upload middleware
│   ├── modules/            # Domain modules (Controller, Service, Route, Schema)
│   │   ├── auth/
│   │   ├── checklists/
│   │   ├── orders/
│   │   ├── uploads/
│   │   └── users/
│   ├── utils/              # Helper functions, Logger
│   ├── app.ts              # App Setup
│   ├── routes.ts           # Central Route Definition
│   └── server.ts           # Entry Point
├── Dockerfile              # Docker build instructions
├── deployments/            # Kubernetes manifests
│   ├── db-deployment.yaml
│   ├── db-service.yaml
│   ├── procurement-deployment.yaml
│   └── procurement-service.yaml
├── docker-compose.dev.yml  # Docker Compose service definition
└── package.json            # Dependencies and scripts
```
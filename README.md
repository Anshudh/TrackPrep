# TrackPrep

TrackPrep is a full-stack student dashboard platform to track practice coding problems, recruitment job pipelines, and study schedules.

---

## Architecture & Extensibility

TrackPrep is designed with a decoupled **MVC architecture**:
*   **Database**: PostgreSQL manages relations for users, problems, applications, and tasks.
*   **Backend (Node/Express)**: Uses separate Routes, Controllers, Services, and Middlewares. Caching libraries (like Redis) can be plugged directly into the Services layer without changing the Controllers. Real-time events (Socket.io) can be triggered from service-layer event emitters.
*   **Frontend (Vite/React)**: Built using React Router, Axios, and custom Glassmorphism components layered over Bootstrap 5 styling.

---

## Folder Structure

```
TrackPrep/
├── client/                 # React Frontend (Vite)
│   ├── src/
│   │   ├── components/     # Reusable UI Components & Modals
│   │   ├── context/        # Auth Session State Context
│   │   ├── pages/          # Login, Dashboard, Problems, Applications, Planner Pages
│   │   ├── services/       # Axios API integrations
│   │   ├── App.jsx         # Routes Configuration
│   │   └── index.css       # Custom Glassmorphic CSS Theme
│   └── index.html
├── server/                 # Express REST API Backend
│   ├── src/
│   │   ├── config/         # Passport OAuth & DB Connections
│   │   ├── controllers/    # API Controllers
│   │   ├── middleware/     # Rate limits, Helmet, Auth check
│   │   ├── routes/         # Express Router Mappings
│   │   ├── services/       # Database SQL queries (Decoupled Services)
│   │   └── app.js          # Express app configurations
│   └── .env.example
├── database/
│   └── schema.sql          # PostgreSQL table schemas
├── docker-compose.yml      # Docker Multi-Container orchestration
├── Dockerfile.client       # Vite client Docker builder
├── Dockerfile.server       # Node API Docker builder
└── README.md
```

---

## Environment Variables

Create a `server/.env` file with the following variables (see `server/.env.example`):

```env
PORT=5000
NODE_ENV=development
SESSION_SECRET=a_secure_session_secret_key
FRONTEND_URL=http://localhost:5173

# Database Configurations
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=trackprep

# Google OAuth Credentials (optional if DEV_MOCK_AUTH is true)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Developer Mock Authentication (Set to true to skip Google login setup)
DEV_MOCK_AUTH=true
```

---

## Setup Instructions

You can start the project either with **Docker** (recommended) or **locally (Node.js & Postgres)**.

### Option 1: Quick Start with Docker (Recommended)

Docker Compose automatically spins up PostgreSQL, the REST API, and the React frontend. It also runs `schema.sql` automatically to configure the database tables.

1. Make sure you have Docker Desktop running.
2. Run the following command from the root directory:
   ```bash
   docker-compose up --build
   ```
3. Once containers are running, open your browser:
   * **Frontend Dashboard**: [http://localhost:5173](http://localhost:5173)
   * **Backend REST API**: [http://localhost:5000](http://localhost:5000)

---

### Option 2: Local Native Execution

#### 1. Database Setup
1. Open PostgreSQL CLI or pgAdmin.
2. Create a new database named `trackprep`:
   ```sql
   CREATE DATABASE trackprep;
   ```
3. Run the SQL commands in `database/schema.sql` inside the `trackprep` database to create the required tables.

#### 2. Backend API Setup
1. Navigate to the `server/` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and fill out your PostgreSQL credentials.
4. Start the backend developer server:
   ```bash
   npm run dev
   ```

#### 3. Frontend Client Setup
1. Open a new terminal and navigate to the `client/` directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Access the web interface at [http://localhost:5173](http://localhost:5173).

---

## Verification & Features Testing
1. **Mock Login**: Clicking **Developer Mock Login** on the login page bypasses Google authentication. This logs you in with a mock profile immediately for testing.
2. **Problem Log**: Add a solved question from LeetCode. Verify it is listed in the search table, and updates your Dashboard metric counts and Topic/Difficulty charts.
3. **Recruitment Board**: Add a new job application. Change its status using the "Move Status" dropdown on the card to watch it transition columns.
4. **Planner**: Create a task. Click the checkbox next to the task to mark it complete. Click the "Completed Tasks" tab to view completed milestones.

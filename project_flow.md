# TrackPrep: System Architecture & Project Flow Guide

This document maps out the directory layout, database interactions, authentication sequences, and cache configurations of the TrackPrep web application.

---

## 📂 Directory Layout

```
TrackPrep/
├── client/                     # Vite + React Frontend
│   ├── src/
│   │   ├── components/         # Modals & Sidebar UI components
│   │   ├── context/            # AuthContext (Handles auth state)
│   │   ├── pages/              # Views (Dashboard, Problems, Applications, Study Planner)
│   │   ├── services/           # API fetching (axios) & Socket.io service
│   │   ├── App.jsx             # React router structure & layouts
│   │   └── index.css           # Premium Glassmorphism & Gold/Espresso Theme styles
│   └── vite.config.js          # Proxy and rollup configurations
├── server/                     # Express.js REST API Backend
│   ├── src/
│   │   ├── config/             # DB Pool connection, Passport, & Socket.io server configs
│   │   ├── controllers/        # Request/Response handlers
│   │   ├── middleware/         # Auth checkers, session cookies, rate-limiters
│   │   ├── routes/             # REST endpoints (/api/problems, /api/auth...)
│   │   ├── services/           # SQL queries, dynamic Redis cache layers, cron schedulers
│   │   └── app.js              # Express app setup, middlewares, and routing bindings
│   └── .env                    # Local environmental secrets
└── docker-compose.yml          # Container configuration (Client, Server, Postgres, Redis)
```

---

## 🔄 Core Architectural Flows

### 1. Authentication Pipeline (Google OAuth & Developer Mock)

```mermaid
sequenceDiagram
    actor User as Browser (Frontend)
    participant Client as React Client
    participant Server as Express Server
    participant Google as Google OAuth Server
    participant DB as PostgreSQL Database

    User->>Client: Clicks "Continue with Google"
    Client->>Server: HTTP Redirect to /api/auth/google
    Server->>Google: Redirects to Google consent screen
    Google-->>User: Renders Google Login Consent
    User->>Google: Approves Permissions
    Google-->>Server: Callback code to /api/auth/google/callback
    Server->>DB: Query for existing google_id
    alt User is new
        Server->>DB: Insert new user record
    end
    Server-->>Client: Sets encrypted session cookie & redirects to /dashboard
    Client->>Server: GET /api/auth/status (Verify Session)
    Server-->>Client: Returns JSON { success: true, user }
    Client-->>User: Renders Authorized Dashboard
```

*   **Mock Fallback Strategy**: If `DEV_MOCK_AUTH=true` is enabled in your configuration, you can use the **Developer Mock Login** button. This bypasses the Google OAuth redirection completely and creates a mock developer session (`id: 9999`) on the server instantly.

---

### 2. Live Activity & Event-Driven Notification Pipeline

When you log a new resolved problem, submit an application, or complete a planner task, a sequence of database writes, cache updates, and real-time socket events occurs:

```mermaid
graph TD
    User[Browser Frontend] -->|1. POST /api/problems| Express[Express backend API]
    Express -->|2. SQL Write| PG[(PostgreSQL Database)]
    Express -->|3. cacheService.clearUserCache| Redis[(Redis / Memory Cache)]
    Express -->|4. eventService.emitActivity| EventSys[Node.js EventEmitter]
    EventSys -->|5. Broadcast live_activity| SocketIO[Socket.io Server]
    SocketIO -->|6. Real-time push| ConnectedPeers[Connected Peer Frontends]
```

1.  **Write Phase**: The API inserts the new record into PostgreSQL.
2.  **Invalidation Phase**: The backend clears any cached dashboard metrics for the user in Redis, ensuring subsequent reports fetch fresh results.
3.  **Broadcasting Phase**: An internal server event is emitted. The Socket.io container picks up this event and broadcasts a `live_activity` message (e.g. *"Alice solved Two Sum on LeetCode"*) to all active client web sockets.

---

### 3. Smart Caching Layer (PostgreSQL & Redis Cache)

To maintain sub-millisecond response times, database queries for dashboard metrics are cached:

```mermaid
flowchart TD
    Req[GET /api/stats Request] --> Check{Is result in cache?}
    Check -- Yes (Cache Hit) --> Return[Return cached JSON immediately]
    Check -- No (Cache Miss) --> DB[Query PostgreSQL database]
    DB --> Store[Store result in Cache with TTL expiration]
    Store --> Return
```

*   **Robust Fallback**: The `cacheService` is built to be resilient. If the `redis` npm package is missing or the Redis server goes offline, the system automatically prints a warning and falls back to a **local, in-memory `Map` data structure** supporting TTL limits. The application continues running smoothly.

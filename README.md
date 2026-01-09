# Poll System

A real-time classroom polling and chat system for teachers and students. Built with a TypeScript/Node.js backend and a modern React frontend.

## Features

- **Live Polls:** Teachers can create, launch, and end polls. Students vote in real time.
- **Automatic Poll End:** Polls end automatically when all online students have voted.
- **Live Results:** Both teachers and students see live poll results as votes come in.
- **Chat:** Real-time chat for classroom interaction.
- **Presence:** See which students are online.
- **State Recovery:** Handles reconnections and restores poll/chat state.
- **Error Handling:** Graceful handling of server/database errors with user feedback.

## Tech Stack

- **Backend:** Node.js, TypeScript, Express, Socket.IO, PostgreSQL
- **Frontend:** React, TypeScript, Vite, Tailwind CSS, react-hot-toast
- **Database:** PostgreSQL

## Project Structure

```
Poll_System/
├── backend/
│   ├── src/
│   │   ├── app.ts           # Express app setup
│   │   ├── server.ts        # HTTP & Socket.IO server
│   │   ├── config/          # DB, CORS, Swagger configs
│   │   ├── controllers/     # REST API controllers
│   │   ├── database/        # SQL schema
│   │   ├── docs/            # Swagger docs
│   │   ├── middleware/      # Error, validation, rate limiting
│   │   ├── models/          # DB models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── sockets/         # Socket.IO event handlers
│   │   ├── types/           # TypeScript types
│   │   └── utils/           # Utility functions
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/      # React UI components
│   │   ├── contexts/        # React context providers
│   │   ├── hooks/           # Custom hooks
│   │   ├── pages/           # Main app pages
│   │   ├── services/        # API/socket services
│   │   ├── types/           # TypeScript types
│   │   └── utils/           # Utility functions
│   ├── public/
│   ├── index.html
│   ├── package.json
│   └── tsconfig.json
├── BACKEND_PLAN.md
├── FRONTEND_PLAN.md
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- PostgreSQL

### Backend Setup
1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```
2. **Configure environment:**
   - Copy `.env.example` to `.env` and set DB credentials.
3. **Setup database:**
   - Create a PostgreSQL database.
   - Run the SQL in `backend/src/database/schema.sql` to initialize tables.
4. **Run the backend:**
   ```bash
   npm run dev
   ```
   The backend runs on `http://localhost:4000` by default.

### Frontend Setup
1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```
2. **Configure environment:**
   - Copy `.env.example` to `.env` and set the backend API/socket URL if needed.
3. **Run the frontend:**
   ```bash
   npm run dev
   ```
   The frontend runs on `http://localhost:5173` by default.

## Usage
- **Teacher:** Open the app, create a poll, and monitor live results.
- **Student:** Join with your name/session, vote in polls, and chat.
- **Polls end automatically** when all online students have voted, or the teacher ends it manually.

## Error Handling
- If the database or server is unreachable, users see clear error toasts/alerts.
- The app does not crash on backend errors; all errors are logged and surfaced to users.

## Development
- **Backend:**
  - TypeScript, Express, Socket.IO
  - Hot reload with `nodemon`
- **Frontend:**
  - React, Vite, Tailwind CSS
  - Toast notifications for feedback

## Scripts
- **Backend:**
  - `npm run dev` — Start backend in dev mode
  - `npm run build` — Build backend
- **Frontend:**
  - `npm run dev` — Start frontend in dev mode
  - `npm run build` — Build frontend

## License
MIT

---

For detailed backend and frontend plans, see `BACKEND_PLAN.md` and `FRONTEND_PLAN.md`.

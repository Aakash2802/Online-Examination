# Online Examination System

A full-stack online examination system with real-time proctoring, auto-grading, and anti-cheat features.

## Tech Stack

**Frontend:**
- React 18 + Vite
- Tailwind CSS
- Socket.IO Client
- React Router DOM
- Axios

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- Socket.IO
- JWT Authentication
- Redis (optional)

## Features

### MVP Features
- **Authentication:** JWT-based signup/login with refresh tokens
- **Exam Management:** Admin can create, edit, delete exams with multiple question types (MCQ, text, coding)
- **Real-time Exam:** Timer sync via Socket.IO, auto-submit on timeout
- **Anti-cheat:** Tab-switch and visibility-change detection with violation tracking
- **Auto-grading:** Instant grading for MCQ questions
- **Results:** View detailed results with feedback

### PRO Features (Planned)
- Sandboxed code execution (judge0/Docker)
- Webcam proctoring with recording
- Plagiarism detection
- Advanced analytics

## Project Structure

```
online-exam-system/
├── client/                 # React frontend
│   ├── src/
│   │   ├── api/           # Axios instance
│   │   ├── contexts/      # Auth & Socket contexts
│   │   ├── hooks/         # Custom hooks (autosave)
│   │   ├── pages/         # React pages
│   │   └── utils/         # Helper functions
│   └── package.json
├── server/                # Node.js backend
│   ├── config/            # Database config
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Auth & rate limiting
│   ├── models/           # Mongoose schemas
│   ├── routes/           # Express routes
│   ├── services/         # Business logic
│   ├── sockets/          # Socket.IO handlers
│   └── server.js
└── docker-compose.yml
```

## Installation & Setup

### Prerequisites
- Node.js >= 18
- MongoDB >= 5
- npm or yarn

### Development Setup

1. **Clone the repository**
```bash
cd "e:\Online Examination System"
```

2. **Install backend dependencies**
```bash
cd server
npm install
```

3. **Install frontend dependencies**
```bash
cd ../client
npm install
```

4. **Configure environment variables**

Backend (server/.env):
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/exam_system
JWT_SECRET=your_jwt_secret
REFRESH_TOKEN_SECRET=your_refresh_secret
CLIENT_URL=http://localhost:5173
```

Frontend (client/.env.local):
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

5. **Start MongoDB**
```bash
# If using Docker
docker run -d -p 27017:27017 --name mongo mongo:5

# Or use local MongoDB installation
mongod
```

6. **Run the application**

Backend:
```bash
cd server
npm run dev
```

Frontend:
```bash
cd client
npm run dev
```

The app will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

### Docker Setup

```bash
# Build and run all services
docker-compose up --build

# Access the app at http://localhost:3000
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout

### Exams
- `GET /api/exams` - List all exams (filtered by role)
- `GET /api/exams/:examId` - Get exam details
- `POST /api/exams` - Create exam (admin/instructor)
- `PATCH /api/exams/:examId` - Update exam
- `DELETE /api/exams/:examId` - Delete exam

### Attempts
- `POST /api/attempts/start` - Start exam attempt
- `POST /api/attempts/:attemptId/answers` - Save answer (autosave)
- `POST /api/attempts/:attemptId/submit` - Submit exam
- `GET /api/attempts/:attemptId` - Get attempt results
- `POST /api/attempts/:attemptId/grade` - Manual grading (admin)

## Socket.IO Events

### Client → Server
- `join_attempt` - Join exam room
- `leave_attempt` - Leave exam room
- `autosave_request` - Save answer in real-time
- `proctor_alert` - Report anti-cheat violation

### Server → Client
- `exam_timer_sync` - Sync timer every 10s
- `force_submit` - Force submit on timeout/violations
- `autosave_ack` - Autosave acknowledgment
- `proctor_enforcement` - Violation warning/lock

## Testing

```bash
# Backend tests
cd server
npm test

# Frontend tests (to be implemented)
cd client
npm test
```

## Deployment

### Production Checklist
- [ ] Change JWT secrets in .env
- [ ] Enable HTTPS (use nginx + Let's Encrypt)
- [ ] Set up MongoDB Atlas or hosted MongoDB
- [ ] Configure CORS for production domain
- [ ] Set up Redis for session storage (optional)
- [ ] Enable rate limiting
- [ ] Set up monitoring (PM2, CloudWatch, etc.)

### Docker Production Deploy
```bash
# Build production images
docker-compose -f docker-compose.yml build

# Run in production
docker-compose up -d
```

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## License

MIT License

## Support

For issues and questions, please open an issue on GitHub.

## Timeline (6-10 Weeks)

- **Week 1-2:** Setup + Auth + Basic Models
- **Week 3-4:** Exam Flow (List → Start → Runner → Submit)
- **Week 5:** Anti-cheat + Socket.IO integration
- **Week 6:** Admin grading + CSV export
- **Week 7-8:** Testing + Bug fixes
- **Week 9:** Deployment
- **Week 10+:** PRO features (optional)

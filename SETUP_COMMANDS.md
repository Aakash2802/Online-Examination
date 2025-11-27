# 🚀 Setup Commands - Copy & Paste Ready

## Quick Setup (Copy these commands in order)

### 1. Install All Dependencies

```bash
# Navigate to project root
cd "e:\Online Examination System"

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install

# Return to root
cd ..
```

### 2. Start MongoDB (Choose One Option)

**Option A: Using Docker (Recommended)**
```bash
docker run -d -p 27017:27017 --name exam_mongo -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=admin123 mongo:5
```

**Option B: Using Docker Compose (Full Stack)**
```bash
cd "e:\Online Examination System"
docker-compose up -d mongo redis
```

**Option C: Local MongoDB**
```bash
# Just start your local MongoDB service
# Windows: Start MongoDB service from Services
# Mac/Linux: mongod
```

### 3. Verify MongoDB is Running

```bash
# Check if MongoDB container is running
docker ps | grep mongo

# Or connect to MongoDB
mongosh mongodb://localhost:27017
```

### 4. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd "e:\Online Examination System\server"
npm run dev
```

Expected output:
```
Server running on port 5000
MongoDB Connected: localhost
```

**Terminal 2 - Frontend:**
```bash
cd "e:\Online Examination System\client"
npm run dev
```

Expected output:
```
VITE v5.0.8  ready in 500 ms
➜  Local:   http://localhost:5173/
```

### 5. Create Test Users via API

**Create Admin User:**
```bash
curl -X POST http://localhost:5000/api/auth/signup -H "Content-Type: application/json" -d "{\"email\":\"admin@test.com\",\"password\":\"Admin123!\",\"firstName\":\"Admin\",\"lastName\":\"User\",\"role\":\"admin\"}"
```

**Create Student User:**
```bash
curl -X POST http://localhost:5000/api/auth/signup -H "Content-Type: application/json" -d "{\"email\":\"student@test.com\",\"password\":\"Student123!\",\"firstName\":\"John\",\"lastName\":\"Doe\",\"role\":\"student\"}"
```

**Create Instructor User:**
```bash
curl -X POST http://localhost:5000/api/auth/signup -H "Content-Type: application/json" -d "{\"email\":\"instructor@test.com\",\"password\":\"Instructor123!\",\"firstName\":\"Jane\",\"lastName\":\"Smith\",\"role\":\"instructor\"}"
```

### 6. Test Login

```bash
curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"student@test.com\",\"password\":\"Student123!\"}"
```

You should get a response with `accessToken` and `refreshToken`.

---

## Create Sample Exam Data

### Connect to MongoDB

```bash
# Using mongosh
mongosh mongodb://localhost:27017/exam_system
```

### Create Questions

```javascript
// In mongosh, run these commands:

// Get your admin user ID first
const adminUser = db.users.findOne({role: "admin"})
const adminId = adminUser._id

// Create Question 1 - MCQ Single
db.questions.insertOne({
  type: "mcq_single",
  prompt: "What is the capital of France?",
  points: 5,
  negativeMarking: 1,
  options: [
    { text: "London", isCorrect: false },
    { text: "Paris", isCorrect: true },
    { text: "Berlin", isCorrect: false },
    { text: "Madrid", isCorrect: false }
  ],
  correctAnswers: ["Paris"],
  tags: ["geography", "europe"],
  difficulty: "easy",
  createdBy: adminId,
  createdAt: new Date()
})

// Create Question 2 - MCQ Single
db.questions.insertOne({
  type: "mcq_single",
  prompt: "What is 2 + 2?",
  points: 3,
  negativeMarking: 0.5,
  options: [
    { text: "3", isCorrect: false },
    { text: "4", isCorrect: true },
    { text: "5", isCorrect: false },
    { text: "22", isCorrect: false }
  ],
  correctAnswers: ["4"],
  tags: ["math", "basic"],
  difficulty: "easy",
  createdBy: adminId,
  createdAt: new Date()
})

// Create Question 3 - Short Text
db.questions.insertOne({
  type: "short_text",
  prompt: "What is the largest planet in our solar system?",
  points: 4,
  negativeMarking: 0,
  correctAnswers: ["Jupiter", "jupiter"],
  tags: ["science", "astronomy"],
  difficulty: "easy",
  createdBy: adminId,
  createdAt: new Date()
})

// Create Question 4 - Long Text
db.questions.insertOne({
  type: "long_text",
  prompt: "Explain the concept of photosynthesis in plants.",
  points: 10,
  negativeMarking: 0,
  tags: ["biology", "science"],
  difficulty: "medium",
  createdBy: adminId,
  createdAt: new Date()
})

// Create Question 5 - MCQ Single
db.questions.insertOne({
  type: "mcq_single",
  prompt: "Which programming language is this project built with?",
  points: 3,
  negativeMarking: 0,
  options: [
    { text: "Python", isCorrect: false },
    { text: "Java", isCorrect: false },
    { text: "JavaScript", isCorrect: true },
    { text: "C++", isCorrect: false }
  ],
  correctAnswers: ["JavaScript"],
  tags: ["programming", "general"],
  difficulty: "easy",
  createdBy: adminId,
  createdAt: new Date()
})
```

### Get Question IDs

```javascript
// Get all question IDs you just created
const questions = db.questions.find({createdBy: adminId}).toArray()
const questionIds = questions.map(q => q._id)

// Print them (you'll use these in the exam)
print("Question IDs:", JSON.stringify(questionIds))
```

### Create Sample Exam

```javascript
// Create a sample exam with the questions
db.exams.insertOne({
  title: "General Knowledge Quiz",
  description: "Test your knowledge across multiple subjects",
  createdBy: adminId,
  status: "published",
  startWindow: new Date("2024-01-01T00:00:00Z"),
  endWindow: new Date("2026-12-31T23:59:59Z"),
  maxAttempts: 3,
  totalDuration: 20,
  passingScore: 60,
  sections: [
    {
      title: "General Questions",
      instructions: "Answer all questions to the best of your ability",
      duration: 20,
      questions: questionIds,
      order: 0
    }
  ],
  settings: {
    shuffleQuestions: false,
    showResults: true,
    allowReview: false,
    proctorEnabled: true,
    antiCheat: {
      tabSwitchLimit: 3,
      fullscreenRequired: false,
      lockdownBrowser: false
    }
  },
  createdAt: new Date(),
  updatedAt: new Date()
})

// Verify exam was created
db.exams.find({createdBy: adminId}).pretty()
```

---

## Verify Everything is Working

### 1. Check Backend Health
```bash
curl http://localhost:5000/health
```

Expected: `{"status":"OK","timestamp":"..."}`

### 2. Check Exams API
```bash
# First login to get token
TOKEN=$(curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"student@test.com\",\"password\":\"Student123!\"}" | jq -r '.data.accessToken')

# Then get exams
curl http://localhost:5000/api/exams -H "Authorization: Bearer $TOKEN"
```

### 3. Check Frontend
Open browser: http://localhost:5173

You should see:
- Login page
- Can navigate to Signup
- After login, see exam list

---

## Quick Test Flow

1. **Open Browser:** http://localhost:5173
2. **Login:** student@test.com / Student123!
3. **View Exams:** Should see "General Knowledge Quiz"
4. **Start Exam:** Click "Start Exam"
5. **Take Exam:**
   - Answer questions
   - Watch console for autosave logs
   - Switch tabs (check violations increment)
   - Wait for timer to sync (every 10s)
6. **Submit:** Click "Submit Exam"
7. **View Results:** See your score

---

## Docker Full Stack Setup (Alternative)

If you want to run everything in Docker:

```bash
cd "e:\Online Examination System"

# Build and start all services
docker-compose up --build

# Access at:
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
# MongoDB: mongodb://localhost:27017
```

To stop:
```bash
docker-compose down
```

To remove volumes (delete data):
```bash
docker-compose down -v
```

---

## Common Commands Reference

### MongoDB Commands
```bash
# Connect to MongoDB
mongosh mongodb://localhost:27017/exam_system

# Show all databases
show dbs

# Use exam database
use exam_system

# Show collections
show collections

# Find all users
db.users.find().pretty()

# Find all exams
db.exams.find().pretty()

# Count documents
db.attempts.countDocuments()

# Delete all attempts (for testing)
db.attempts.deleteMany({})
```

### Docker Commands
```bash
# List running containers
docker ps

# View container logs
docker logs exam_mongo
docker logs exam_backend

# Stop a container
docker stop exam_mongo

# Remove a container
docker rm exam_mongo

# View all containers (including stopped)
docker ps -a
```

### NPM Commands
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start

# Run tests
npm test

# Build frontend
npm run build
```

---

## Environment Variables Reference

### Backend (server/.env)
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/exam_system
JWT_SECRET=super_secret_jwt_key_change_in_production
REFRESH_TOKEN_SECRET=super_secret_refresh_key_change_in_production
JWT_EXPIRES_IN=15m
REFRESH_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

### Frontend (client/.env.local)
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

---

## Troubleshooting Commands

### Port Already in Use
```bash
# Windows - Find process on port 5000
netstat -ano | findstr :5000

# Windows - Kill process
taskkill /PID <PID> /F

# Linux/Mac - Find and kill
lsof -ti:5000 | xargs kill -9
```

### MongoDB Connection Issues
```bash
# Test MongoDB connection
mongosh mongodb://localhost:27017

# Check if MongoDB is running
docker ps | grep mongo

# View MongoDB logs
docker logs exam_mongo
```

### Clear Browser Data
```javascript
// In browser console
localStorage.clear()
sessionStorage.clear()
location.reload()
```

---

## Next Steps After Setup

✅ **You're Done!** Now you can:

1. Test the complete student flow
2. Start building the admin dashboard
3. Add more question types
4. Implement additional features

Refer to **DEVELOPMENT_ROADMAP.md** for next features to implement.

---

**Pro Tip:** Keep this file open in a separate terminal for quick reference! 🚀

# Quick Start Guide

## Step-by-Step Setup (Development)

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
cd ..
```

### 2. Start MongoDB

**Option A: Using Docker**
```bash
docker run -d -p 27017:27017 --name exam_mongo mongo:5
```

**Option B: Local MongoDB**
```bash
# Make sure MongoDB is installed and running
mongod
```

### 3. Configure Environment Variables

The `.env` files are already created. Just verify them:

**server/.env** - Already configured for local development
**client/.env.local** - Already configured for local development

### 4. Start the Application

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```
You should see: `Server running on port 5000` and `MongoDB Connected`

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```
You should see: `Local: http://localhost:5173`

### 5. Open the Application

Navigate to **http://localhost:5173** in your browser

### 6. Create Test Data

**Create Admin User (via API):**
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "Admin123!",
    "firstName": "Admin",
    "lastName": "User",
    "role": "admin"
  }'
```

**Create Student User:**
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@test.com",
    "password": "Student123!",
    "firstName": "John",
    "lastName": "Doe",
    "role": "student"
  }'
```

### 7. Test Login

1. Go to http://localhost:5173/login
2. Login with:
   - Email: `student@test.com`
   - Password: `Student123!`

---

## Docker Setup (Recommended for Production Testing)

### 1. Build and Run All Services

```bash
docker-compose up --build
```

This will start:
- MongoDB on port 27017
- Redis on port 6379
- Backend on port 5000
- Frontend on port 3000

### 2. Access the Application

Open **http://localhost:3000** in your browser

### 3. Stop Services

```bash
docker-compose down
```

To remove volumes (database data):
```bash
docker-compose down -v
```

---

## Common Issues & Solutions

### Issue: MongoDB Connection Error
**Solution:** Make sure MongoDB is running on port 27017
```bash
# Check if MongoDB is running
docker ps | grep mongo
# Or for local MongoDB
ps aux | grep mongod
```

### Issue: Port Already in Use
**Solution:** Change ports in configuration files
- Backend: server/.env (PORT=5000)
- Frontend: client/vite.config.js (server.port: 5173)

### Issue: CORS Error
**Solution:** Verify CLIENT_URL in server/.env matches frontend URL

### Issue: Socket.IO Not Connecting
**Solution:** Check that VITE_SOCKET_URL in client/.env.local matches backend URL

---

## Creating Your First Exam (Manual via MongoDB)

Since admin UI is not yet built, create a test exam via MongoDB:

```javascript
// Connect to MongoDB
mongosh exam_system

// Create a question
db.questions.insertOne({
  type: "mcq_single",
  prompt: "What is 2 + 2?",
  points: 5,
  negativeMarking: 0,
  options: [
    { text: "3", isCorrect: false },
    { text: "4", isCorrect: true },
    { text: "5", isCorrect: false }
  ],
  correctAnswers: ["4"],
  tags: ["math"],
  difficulty: "easy",
  createdBy: ObjectId("YOUR_ADMIN_USER_ID"), // Replace with actual admin user ID
  createdAt: new Date()
})

// Note the question _id from the output

// Create an exam
db.exams.insertOne({
  title: "Sample Math Quiz",
  description: "Test your math skills",
  createdBy: ObjectId("YOUR_ADMIN_USER_ID"), // Replace with actual admin user ID
  status: "published",
  startWindow: new Date("2025-01-01"),
  endWindow: new Date("2025-12-31"),
  maxAttempts: 3,
  totalDuration: 30,
  passingScore: 70,
  sections: [
    {
      title: "Math Section",
      instructions: "Answer all questions",
      duration: 30,
      questions: [ObjectId("YOUR_QUESTION_ID")], // Replace with actual question ID
      order: 0
    }
  ],
  settings: {
    shuffleQuestions: false,
    showResults: true,
    allowReview: false,
    proctorEnabled: false,
    antiCheat: {
      tabSwitchLimit: 3,
      fullscreenRequired: false,
      lockdownBrowser: false
    }
  },
  createdAt: new Date(),
  updatedAt: new Date()
})
```

Now you can login as a student and see the exam in the list!

---

## API Testing with curl

### Signup
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!","firstName":"Test","lastName":"User"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!"}'
```

### List Exams (requires token)
```bash
curl -X GET http://localhost:5000/api/exams \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Next Steps

1. ✅ Complete MVP features (auth, exams, attempts working)
2. Build admin dashboard for exam creation
3. Add more question types (coding, file upload)
4. Implement PRO features (judge0, webcam proctoring)
5. Add comprehensive testing
6. Deploy to production

---

## Development Tips

- Use **MongoDB Compass** to view database: `mongodb://localhost:27017`
- Use **Postman** for API testing
- Check browser console for Socket.IO events
- Enable React DevTools for debugging
- Use `console.log` liberally in development

---

## Production Deployment Checklist

- [ ] Change all secrets in .env files
- [ ] Set up MongoDB Atlas
- [ ] Configure Redis (optional but recommended)
- [ ] Enable HTTPS (nginx + certbot)
- [ ] Set up monitoring (PM2, DataDog, etc.)
- [ ] Configure backups
- [ ] Set up CI/CD pipeline
- [ ] Load testing
- [ ] Security audit

Good luck! 🚀

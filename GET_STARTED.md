# 🎯 GET STARTED - 5 Minute Setup

This is your **fastest path** to getting the Online Examination System running.

---

## ⚡ Super Quick Start (5 Commands)

```bash
# 1. Navigate to server folder
cd "e:\Online Examination System\server"

# 2. Install dependencies
npm install

# 3. Start MongoDB (Docker)
docker run -d -p 27017:27017 --name exam_mongo mongo:5

# 4. Seed the database with sample data
npm run seed

# 5. Start the backend server
npm run dev
```

**Open a new terminal:**

```bash
# 6. Navigate to client folder
cd "e:\Online Examination System\client"

# 7. Install dependencies
npm install

# 8. Start the frontend
npm run dev
```

---

## 🎉 You're Done!

**Open your browser:** http://localhost:5173

**Login with:**
- Email: `student@test.com`
- Password: `Student123!`

You should see **3 available exams** ready to take!

---

## 📋 What Just Happened?

### Backend Started (Port 5000)
- ✅ Express server running
- ✅ MongoDB connected
- ✅ Socket.IO ready for real-time features
- ✅ JWT authentication active

### Frontend Started (Port 5173)
- ✅ React app with Vite
- ✅ Tailwind CSS styling
- ✅ Socket.IO client connected

### Database Seeded
- ✅ 4 Users (admin, instructor, 2 students)
- ✅ 7 Questions (MCQ, text, multiple choice)
- ✅ 3 Exams (ready to take)

---

## 🧪 Test the System (2 Minutes)

### 1. Take an Exam
1. Login at http://localhost:5173
2. Click "Start Exam" on "General Knowledge Quiz"
3. Answer some questions
4. Watch the timer count down
5. Try switching tabs (you'll see violation warnings!)
6. Submit the exam
7. View your results

### 2. Watch Real-Time Features
Open browser DevTools (F12) → Network → WS tab:
- See `exam_timer_sync` events every 10 seconds
- See `autosave_ack` when you answer questions
- See `proctor_alert` when you switch tabs

---

## 👥 Test Users Created

| Email | Password | Role |
|-------|----------|------|
| admin@test.com | Admin123! | Admin |
| instructor@test.com | Instructor123! | Instructor |
| student@test.com | Student123! | Student |
| alice@test.com | Student123! | Student |

---

## 📚 Sample Exams Created

### 1. General Knowledge Quiz
- **Duration:** 20 minutes
- **Questions:** 4 (Geography, Math, Science, Technology)
- **Passing Score:** 60%
- **Max Attempts:** 3

### 2. Science & Technology Assessment
- **Duration:** 30 minutes
- **Questions:** 5 (Biology, Programming, Web Tech)
- **Passing Score:** 70%
- **Max Attempts:** 2

### 3. Quick Math Quiz
- **Duration:** 5 minutes
- **Questions:** 1 (Basic Math)
- **Passing Score:** 50%
- **Max Attempts:** 5

---

## 🔍 Explore the Features

### Student Features
✅ Signup & Login
✅ View available exams
✅ Start exam with confirmation
✅ Real-time timer sync
✅ Auto-save answers (every 3s)
✅ Tab-switch detection (anti-cheat)
✅ Auto-submit on timeout
✅ View detailed results

### Anti-Cheat Testing
1. Start an exam
2. Switch to another tab → See violation count increase
3. Switch 3 times → Get warning message
4. Continue violations → Exam gets locked

### Socket.IO Testing
1. Open DevTools → Console
2. Start an exam
3. Type answers and watch autosave logs
4. See timer sync every 10 seconds
5. Try disconnecting internet → Answers saved to localStorage

---

## 🛠️ Development Tools

### MongoDB GUI
Install MongoDB Compass:
- URL: `mongodb://localhost:27017`
- Database: `exam_system`
- Collections: users, exams, questions, attempts, auditlogs

### API Testing
Use Postman or Thunder Client VSCode extension:
- Import collection from SETUP_COMMANDS.md
- Test all endpoints
- See JWT tokens in action

### Browser Extensions
Recommended:
- React Developer Tools
- Redux DevTools (if you add Redux later)
- Socket.IO Client (for debugging)

---

## 📊 Check Everything is Working

### ✅ Backend Checklist
```bash
# Health check
curl http://localhost:5000/health

# Should return: {"status":"OK","timestamp":"..."}
```

### ✅ Database Checklist
```bash
# Connect to MongoDB
mongosh mongodb://localhost:27017/exam_system

# Check users
db.users.countDocuments()  # Should be 4

# Check exams
db.exams.countDocuments()  # Should be 3

# Check questions
db.questions.countDocuments()  # Should be 7
```

### ✅ Frontend Checklist
- [ ] Can access http://localhost:5173
- [ ] Can see login page
- [ ] Can navigate to signup
- [ ] Can login with test credentials
- [ ] Can see exam list (3 exams)

---

## 🚨 Troubleshooting

### MongoDB Not Starting?
```bash
# Check if port 27017 is already in use
netstat -ano | findstr :27017

# Remove existing container and try again
docker rm -f exam_mongo
docker run -d -p 27017:27017 --name exam_mongo mongo:5
```

### Backend Won't Start?
```bash
# Check if port 5000 is in use
netstat -ano | findstr :5000

# Check MongoDB connection in logs
# Should see: "MongoDB Connected: localhost"
```

### Frontend Won't Start?
```bash
# Make sure you're in the client folder
cd "e:\Online Examination System\client"

# Try removing node_modules and reinstalling
rm -rf node_modules
npm install
npm run dev
```

### Seed Script Failed?
```bash
# Make sure MongoDB is running first
docker ps | grep exam_mongo

# Check .env file exists in server folder
ls server/.env

# Try seeding again
cd server
npm run seed
```

---

## 📖 Next Steps

Now that everything is running:

### 1. **Understand the Code** (30 min)
Read these key files:
- `server/sockets/index.js` - Real-time logic
- `client/src/pages/ExamRunner.jsx` - Exam UI
- `server/services/attemptService.js` - Grading logic

### 2. **Customize the Exam** (15 min)
- Add more questions via MongoDB or seeding script
- Change exam duration, passing score
- Adjust anti-cheat rules

### 3. **Build Admin Dashboard** (Week 3-4)
Follow the roadmap in DEVELOPMENT_ROADMAP.md:
- Create exam builder UI
- Add question creation form
- Implement grading interface

### 4. **Add Tests** (Week 7-8)
- Write unit tests for services
- Add integration tests for API
- Create E2E tests with Playwright

---

## 🎯 Your First Development Task

**Challenge:** Add a new question type

1. **Update the Question model** (server/models/Question.js)
   - Add a new type to the enum (e.g., 'true_false')

2. **Update ExamRunner** (client/src/pages/ExamRunner.jsx)
   - Add a new conditional block to render True/False UI

3. **Update Grading Logic** (server/services/attemptService.js)
   - Add grading logic for the new question type

4. **Test It!**
   - Add a true/false question via MongoDB
   - Add it to an exam
   - Take the exam and verify grading works

---

## 📚 Documentation Reference

| File | What it Contains | Read Time |
|------|------------------|-----------|
| [GET_STARTED.md](GET_STARTED.md) | This file - Quick setup | 5 min |
| [SETUP_COMMANDS.md](SETUP_COMMANDS.md) | All commands copy-paste ready | 10 min |
| [README.md](README.md) | Project overview & features | 10 min |
| [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) | Complete system overview | 5 min |
| [DEVELOPMENT_ROADMAP.md](DEVELOPMENT_ROADMAP.md) | 10-week implementation plan | 15 min |

---

## 💡 Pro Tips

1. **Use Two Monitors**
   - Left: VSCode with code
   - Right: Browser with app + DevTools

2. **Keep Terminals Organized**
   - Terminal 1: Backend (server)
   - Terminal 2: Frontend (client)
   - Terminal 3: MongoDB commands

3. **Watch the Logs**
   - Backend logs show API calls
   - Frontend console shows Socket.IO events
   - Network tab shows autosave requests

4. **Learn by Experimenting**
   - Change the timer interval (sockets/index.js)
   - Adjust autosave delay (hooks/useAutosave.js)
   - Modify violation limits (anti-cheat settings)

---

## 🎉 Success!

If you've made it here and everything is working:

✅ You have a **fully functional** online exam system
✅ Real-time features are working
✅ Anti-cheat is detecting violations
✅ Auto-grading is working
✅ You understand the architecture

**Now you're ready to build amazing features!** 🚀

---

## 📞 Need Help?

1. Check the [README.md](README.md) troubleshooting section
2. Review the [SETUP_COMMANDS.md](SETUP_COMMANDS.md) reference
3. Read the code comments - everything is well documented
4. Open GitHub issues for bugs or questions

---

**Happy Coding!** 💻✨

---

*Last Updated: November 2024*
*Status: ✅ All Systems Go!*

// Initial seed data for the Online Examination System
const mongoose = require('mongoose');

const users = [
  {
    "_id": "691ff5639fc890a58ae4438f",
    "email": "aakash@gmail.com",
    "password": "$2b$10$rKd.YqJ8QJzJVQJzJVQJzOVQJzJVQJzJVQJzJVQJzJVQJzJVQJzJV", // password123
    "firstName": "Aakash",
    "lastName": "B",
    "role": "student"
  },
  {
    "_id": "691ad2ea27884c69cd95f172",
    "email": "admin@test.com",
    "password": "$2b$10$rKd.YqJ8QJzJVQJzJVQJzOVQJzJVQJzJVQJzJVQJzJVQJzJVQJzJV",
    "firstName": "Admin",
    "lastName": "User",
    "role": "admin"
  },
  {
    "_id": "691ad2ea27884c69cd95f174",
    "email": "instructor@test.com",
    "password": "$2b$10$rKd.YqJ8QJzJVQJzJVQJzOVQJzJVQJzJVQJzJVQJzJVQJzJVQJzJV",
    "firstName": "Jane",
    "lastName": "Smith",
    "role": "instructor"
  },
  {
    "_id": "691ad2ea27884c69cd95f176",
    "email": "student@test.com",
    "password": "$2b$10$rKd.YqJ8QJzJVQJzJVQJzOVQJzJVQJzJVQJzJVQJzJVQJzJVQJzJV",
    "firstName": "John",
    "lastName": "Doe",
    "role": "student"
  },
  {
    "_id": "691ad2ea27884c69cd95f178",
    "email": "alice@test.com",
    "password": "$2b$10$rKd.YqJ8QJzJVQJzJVQJzOVQJzJVQJzJVQJzJVQJzJVQJzJVQJzJV",
    "firstName": "Alice",
    "lastName": "Johnson",
    "role": "student"
  }
];

const questions = [
  // JavaScript Questions
  { _id: "692178cad337622b49d0a073", prompt: "What is the output of: console.log(typeof null)?", type: "multiple-choice", options: ["null", "undefined", "object", "string"], correctAnswers: ["object"], points: 5, difficulty: "medium", category: "JavaScript", createdBy: "691ad2ea27884c69cd95f174" },
  { _id: "692178cad337622b49d0a078", prompt: "Which method is used to add elements to the end of an array?", type: "multiple-choice", options: ["push()", "pop()", "shift()", "unshift()"], correctAnswers: ["push()"], points: 5, difficulty: "easy", category: "JavaScript", createdBy: "691ad2ea27884c69cd95f174" },
  { _id: "692178cad337622b49d0a07d", prompt: "Which of the following are falsy values in JavaScript? (Select all that apply)", type: "multiple-select", options: ["0", "\"\"", "null", "undefined", "\"false\""], correctAnswers: ["0", "\"\"", "null", "undefined"], points: 10, difficulty: "medium", category: "JavaScript", createdBy: "691ad2ea27884c69cd95f174" },
  { _id: "692178cad337622b49d0a084", prompt: "What does the 'strict mode' directive do in JavaScript?", type: "multiple-choice", options: ["Enables stricter parsing and error handling", "Makes code run faster", "Enables new ES6 features", "Disables console.log"], correctAnswers: ["Enables stricter parsing and error handling"], points: 5, difficulty: "medium", category: "JavaScript", createdBy: "691ad2ea27884c69cd95f174" },
  { _id: "692178cad337622b49d0a089", prompt: "What keyword is used to declare a block-scoped variable in JavaScript?", type: "multiple-choice", options: ["var", "let", "const", "Both let and const"], correctAnswers: ["Both let and const"], points: 5, difficulty: "easy", category: "JavaScript", createdBy: "691ad2ea27884c69cd95f174" },

  // Database Questions
  { _id: "692178d5d337622b49d0a0e5", prompt: "Which SQL statement is used to extract data from a database?", type: "multiple-choice", options: ["GET", "SELECT", "EXTRACT", "PULL"], correctAnswers: ["SELECT"], points: 5, difficulty: "easy", category: "Database", createdBy: "691ad2ea27884c69cd95f174" },
  { _id: "692178d5d337622b49d0a0ea", prompt: "What does ACID stand for in database transactions?", type: "multiple-choice", options: ["Atomicity, Consistency, Isolation, Durability", "Association, Consistency, Isolation, Data", "Atomicity, Concurrency, Isolation, Durability", "Association, Concurrency, Integration, Data"], correctAnswers: ["Atomicity, Consistency, Isolation, Durability"], points: 5, difficulty: "medium", category: "Database", createdBy: "691ad2ea27884c69cd95f174" },
  { _id: "692178d5d337622b49d0a0ef", prompt: "In a relational database, what is a primary key?", type: "multiple-choice", options: ["A unique identifier for each record", "The first column in a table", "A foreign key reference", "An index on the table"], correctAnswers: ["A unique identifier for each record"], points: 5, difficulty: "easy", category: "Database", createdBy: "691ad2ea27884c69cd95f174" },
  { _id: "692178d5d337622b49d0a0f4", prompt: "Which JOIN returns all records when there is a match in either left or right table?", type: "multiple-choice", options: ["INNER JOIN", "LEFT JOIN", "FULL OUTER JOIN", "CROSS JOIN"], correctAnswers: ["FULL OUTER JOIN"], points: 5, difficulty: "hard", category: "Database", createdBy: "691ad2ea27884c69cd95f174" },
  { _id: "692178d5d337622b49d0a0f9", prompt: "What is normalization in database design?", type: "multiple-choice", options: ["Organizing data to reduce redundancy", "Making data faster to query", "Encrypting sensitive data", "Creating backup copies"], correctAnswers: ["Organizing data to reduce redundancy"], points: 5, difficulty: "medium", category: "Database", createdBy: "691ad2ea27884c69cd95f174" },

  // Web Development Questions
  { _id: "692178e0d337622b49d0a15d", prompt: "Which HTTP method is idempotent and safe?", type: "multiple-choice", options: ["GET", "POST", "PUT", "DELETE"], correctAnswers: ["GET"], points: 5, difficulty: "medium", category: "Web Development", createdBy: "691ad2ea27884c69cd95f174" },
  { _id: "692178e0d337622b49d0a162", prompt: "Which of the following are valid HTTP status codes? (Select all that apply)", type: "multiple-select", options: ["200 OK", "404 Not Found", "500 Internal Server Error", "600 Gateway Error"], correctAnswers: ["200 OK", "404 Not Found", "500 Internal Server Error"], points: 10, difficulty: "easy", category: "Web Development", createdBy: "691ad2ea27884c69cd95f174" },
  { _id: "692178e0d337622b49d0a168", prompt: "What is CORS (Cross-Origin Resource Sharing)?", type: "multiple-choice", options: ["A security feature that restricts cross-origin requests", "A CSS framework", "A JavaScript library", "A database protocol"], correctAnswers: ["A security feature that restricts cross-origin requests"], points: 5, difficulty: "medium", category: "Web Development", createdBy: "691ad2ea27884c69cd95f174" },
  { _id: "692178e0d337622b49d0a16d", prompt: "Which HTML5 element is used for semantic navigation?", type: "multiple-choice", options: ["<div>", "<nav>", "<menu>", "<navigation>"], correctAnswers: ["<nav>"], points: 5, difficulty: "easy", category: "Web Development", createdBy: "691ad2ea27884c69cd95f174" },
  { _id: "692178e0d337622b49d0a172", prompt: "What does REST stand for in RESTful APIs?", type: "multiple-choice", options: ["Representational State Transfer", "Remote Execution State Transfer", "Resource State Transfer", "Request State Transfer"], correctAnswers: ["Representational State Transfer"], points: 5, difficulty: "medium", category: "Web Development", createdBy: "691ad2ea27884c69cd95f174" },

  // React Questions
  { _id: "692178ecd337622b49d0a1d7", prompt: "What is the primary purpose of React hooks?", type: "multiple-choice", options: ["To use state and lifecycle features in functional components", "To create class components", "To style components", "To handle routing"], correctAnswers: ["To use state and lifecycle features in functional components"], points: 5, difficulty: "easy", category: "React", createdBy: "691ad2ea27884c69cd95f174" },
  { _id: "692178ecd337622b49d0a1dc", prompt: "Which hook is used to manage state in React functional components?", type: "multiple-choice", options: ["useEffect()", "useState()", "useContext()", "useReducer()"], correctAnswers: ["useState()"], points: 5, difficulty: "easy", category: "React", createdBy: "691ad2ea27884c69cd95f174" },
  { _id: "692178ecd337622b49d0a1e1", prompt: "Which of the following are built-in React hooks? (Select all that apply)", type: "multiple-select", options: ["useState", "useEffect", "useContext", "useQuery"], correctAnswers: ["useState", "useEffect", "useContext"], points: 10, difficulty: "medium", category: "React", createdBy: "691ad2ea27884c69cd95f174" },
  { _id: "692178ecd337622b49d0a1e7", prompt: "What does JSX stand for?", type: "multiple-choice", options: ["JavaScript XML", "Java Syntax Extension", "JavaScript Extended", "JSON XML"], correctAnswers: ["JavaScript XML"], points: 5, difficulty: "easy", category: "React", createdBy: "691ad2ea27884c69cd95f174" },
  { _id: "692178ecd337622b49d0a1ec", prompt: "Which lifecycle method is equivalent to useEffect with an empty dependency array?", type: "multiple-choice", options: ["componentDidMount", "componentDidUpdate", "componentWillUnmount", "shouldComponentUpdate"], correctAnswers: ["componentDidMount"], points: 5, difficulty: "medium", category: "React", createdBy: "691ad2ea27884c69cd95f174" },

  // Aptitude Questions
  { _id: "692178aed337622b49d09f85", prompt: "If A is twice as old as B, and B is 15 years old, how old is A?", type: "multiple-choice", options: ["25", "30", "35", "40"], correctAnswers: ["30"], points: 5, difficulty: "easy", category: "Aptitude", createdBy: "691ad2ea27884c69cd95f174" },
  { _id: "692178aed337622b49d09f8a", prompt: "What comes next in the series: 2, 6, 12, 20, 30, ?", type: "multiple-choice", options: ["40", "42", "44", "46"], correctAnswers: ["42"], points: 5, difficulty: "medium", category: "Aptitude", createdBy: "691ad2ea27884c69cd95f174" },
  { _id: "692178aed337622b49d09f8f", prompt: "A train travels 120 km in 2 hours. What is its average speed?", type: "multiple-choice", options: ["50 km/h", "55 km/h", "60 km/h", "65 km/h"], correctAnswers: ["60 km/h"], points: 5, difficulty: "easy", category: "Aptitude", createdBy: "691ad2ea27884c69cd95f174" },
  { _id: "692178aed337622b49d09f94", prompt: "Pointing to a photograph, John said, 'She is the daughter of my grandfather's only son.' How is the woman related to John?", type: "multiple-choice", options: ["Sister", "Cousin", "Aunt", "Mother"], correctAnswers: ["Sister"], points: 5, difficulty: "hard", category: "Aptitude", createdBy: "691ad2ea27884c69cd95f174" },
  { _id: "692178aed337622b49d09f99", prompt: "What is 15% of 200?", type: "multiple-choice", options: ["25", "30", "35", "40"], correctAnswers: ["30"], points: 5, difficulty: "easy", category: "Aptitude", createdBy: "691ad2ea27884c69cd95f174" }
];

const exams = [
  {
    _id: "691ad2f027884c69cd95f217",
    title: "JavaScript Fundamentals Exam",
    description: "Test your JavaScript knowledge",
    createdBy: "691ad2ea27884c69cd95f174",
    status: "published",
    passingScore: 60,
    sections: [{
      title: "Main Section",
      instructions: "Answer all questions",
      duration: 30,
      questions: ["692178cad337622b49d0a073", "692178cad337622b49d0a078", "692178cad337622b49d0a07d", "692178cad337622b49d0a084", "692178cad337622b49d0a089"],
      order: 0
    }],
    settings: { shuffleQuestions: true, showResults: true, autoReset: { enabled: false } }
  },
  {
    _id: "691ad2f027884c69cd95f21a",
    title: "Database Fundamentals Exam",
    description: "Test your database knowledge",
    createdBy: "691ad2ea27884c69cd95f174",
    status: "published",
    passingScore: 70,
    sections: [{
      title: "Main Section",
      instructions: "Answer all questions",
      duration: 30,
      questions: ["692178d5d337622b49d0a0e5", "692178d5d337622b49d0a0ea", "692178d5d337622b49d0a0ef", "692178d5d337622b49d0a0f4", "692178d5d337622b49d0a0f9"],
      order: 0
    }],
    settings: { shuffleQuestions: true, showResults: true, autoReset: { enabled: false } }
  },
  {
    _id: "691ad2f027884c69cd95f21e",
    title: "Web Development Exam",
    description: "Test your web development knowledge",
    createdBy: "691ad2ea27884c69cd95f174",
    status: "published",
    passingScore: 50,
    sections: [{
      title: "Main Section",
      instructions: "Answer all questions",
      duration: 30,
      questions: ["692178e0d337622b49d0a15d", "692178e0d337622b49d0a162", "692178e0d337622b49d0a168", "692178e0d337622b49d0a16d", "692178e0d337622b49d0a172"],
      order: 0
    }],
    settings: { shuffleQuestions: true, showResults: true, autoReset: { enabled: false } }
  },
  {
    _id: "691af6b98963480bb3f0b1da",
    title: "React Fundamentals Exam",
    description: "Test your React knowledge",
    createdBy: "691ad2ea27884c69cd95f174",
    status: "published",
    passingScore: 70,
    sections: [{
      title: "Main Section",
      instructions: "Answer all questions",
      duration: 30,
      questions: ["692178ecd337622b49d0a1d7", "692178ecd337622b49d0a1dc", "692178ecd337622b49d0a1e1", "692178ecd337622b49d0a1e7", "692178ecd337622b49d0a1ec"],
      order: 0
    }],
    settings: { shuffleQuestions: true, showResults: true, autoReset: { enabled: false } }
  },
  {
    _id: "691ad2f027884c69cd95f222",
    title: "Aptitude Test",
    description: "Test your logical reasoning and aptitude",
    createdBy: "691ad2ea27884c69cd95f174",
    status: "published",
    passingScore: 10,
    sections: [{
      title: "Main Section",
      instructions: "Answer all questions",
      duration: 20,
      questions: ["692178aed337622b49d09f85", "692178aed337622b49d09f8a", "692178aed337622b49d09f8f", "692178aed337622b49d09f94", "692178aed337622b49d09f99"],
      order: 0
    }],
    settings: { shuffleQuestions: true, showResults: true, autoReset: { enabled: false } }
  }
];

async function seedDatabase(force = false) {
  const db = mongoose.connection.db;

  // Check if database already has data
  const examCount = await db.collection('exams').countDocuments();
  if (examCount > 0 && !force) {
    console.log('[Seed] Database already has data, skipping seed');
    return { skipped: true, message: 'Database already has data' };
  }

  // If force mode, clear all data first
  if (force) {
    console.log('[Seed] Force mode - clearing all data...');
    await db.collection('users').deleteMany({});
    await db.collection('questions').deleteMany({});
    await db.collection('exams').deleteMany({});
    await db.collection('attempts').deleteMany({});
    await db.collection('proctoringlogs').deleteMany({});
    await db.collection('auditlogs').deleteMany({});
    console.log('[Seed] All data cleared');
  }

  console.log('[Seed] Seeding database with initial data...');

  // Seed users
  const bcrypt = require('bcrypt');
  const hashedPassword = await bcrypt.hash('password123', 10);

  for (const user of users) {
    user._id = new mongoose.Types.ObjectId(user._id);
    user.password = hashedPassword;
  }
  await db.collection('users').insertMany(users);
  console.log('[Seed] Created ' + users.length + ' users');

  // Seed questions
  for (const q of questions) {
    q._id = new mongoose.Types.ObjectId(q._id);
    q.createdBy = new mongoose.Types.ObjectId(q.createdBy);
  }
  await db.collection('questions').insertMany(questions);
  console.log('[Seed] Created ' + questions.length + ' questions');

  // Seed exams
  for (const exam of exams) {
    exam._id = new mongoose.Types.ObjectId(exam._id);
    exam.createdBy = new mongoose.Types.ObjectId(exam.createdBy);
    exam.sections = exam.sections.map(s => ({
      ...s,
      _id: new mongoose.Types.ObjectId(),
      questions: s.questions.map(q => new mongoose.Types.ObjectId(q))
    }));
  }
  await db.collection('exams').insertMany(exams);
  console.log('[Seed] Created ' + exams.length + ' exams');

  // Create sample attempts for demo user
  const userId = new mongoose.Types.ObjectId("691ff5639fc890a58ae4438f");
  const now = new Date();
  const scores = [83, 90, 75, 88, 95];

  for (let i = 0; i < exams.length; i++) {
    const exam = exams[i];
    const hoursAgo = new Date(now - (i + 1) * 60 * 60 * 1000);
    const score = scores[i];

    await db.collection('attempts').insertOne({
      examId: exam._id,
      userId: userId,
      attemptNumber: 1,
      status: 'submitted',
      startedAt: hoursAgo,
      submittedAt: new Date(hoursAgo.getTime() + 25 * 60 * 1000),
      timeSpentSeconds: 1500,
      score: Math.round(score * 0.3),
      maxScore: 30,
      percentageScore: score,
      violations: { tabSwitches: 0, visibilityChanges: 0, fullscreenExits: 0, totalViolations: 0 },
      answers: [],
      createdAt: hoursAgo,
      updatedAt: new Date(hoursAgo.getTime() + 25 * 60 * 1000)
    });
  }
  console.log('[Seed] Created ' + exams.length + ' demo attempts');

  console.log('[Seed] Database seeded successfully!');

  return {
    success: true,
    message: 'Database seeded successfully',
    data: {
      users: users.length,
      questions: questions.length,
      exams: exams.length,
      attempts: exams.length
    }
  };
}

module.exports = { seedDatabase };

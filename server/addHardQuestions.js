const mongoose = require('mongoose');
const Question = require('./models/Question');
const Exam = require('./models/Exam');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');

    // Get admin user
    const admin = await User.findOne({ email: 'admin@test.com' });
    if (!admin) {
      console.log('Admin user not found!');
      process.exit(1);
    }

    const hardQuestions = [];

    // Advanced Programming Questions
    hardQuestions.push(await Question.create({
      type: 'mcq_single',
      prompt: 'What is the time complexity of the following code?\n\nfor(int i=0; i<n; i++) {\n  for(int j=i; j<n; j++) {\n    console.log(i+j);\n  }\n}',
      points: 10,
      negativeMarking: 3,
      options: [
        { text: 'O(n)', isCorrect: false },
        { text: 'O(n log n)', isCorrect: false },
        { text: 'O(n²)', isCorrect: true },
        { text: 'O(2^n)', isCorrect: false }
      ],
      correctAnswers: ['O(n²)'],
      tags: ['programming', 'algorithms'],
      difficulty: 'hard',
      createdBy: admin._id
    }));

    hardQuestions.push(await Question.create({
      type: 'mcq_single',
      prompt: 'In a B-tree of order 5, what is the maximum number of keys in a node?',
      points: 10,
      negativeMarking: 3,
      options: [
        { text: '4', isCorrect: true },
        { text: '5', isCorrect: false },
        { text: '6', isCorrect: false },
        { text: '3', isCorrect: false }
      ],
      correctAnswers: ['4'],
      tags: ['data-structures', 'algorithms'],
      difficulty: 'hard',
      createdBy: admin._id
    }));

    hardQuestions.push(await Question.create({
      type: 'mcq_single',
      prompt: 'Which sorting algorithm has the best average-case time complexity for sorting a nearly sorted array?',
      points: 8,
      negativeMarking: 2,
      options: [
        { text: 'Quick Sort', isCorrect: false },
        { text: 'Merge Sort', isCorrect: false },
        { text: 'Insertion Sort', isCorrect: true },
        { text: 'Heap Sort', isCorrect: false }
      ],
      correctAnswers: ['Insertion Sort'],
      tags: ['algorithms', 'sorting'],
      difficulty: 'hard',
      createdBy: admin._id
    }));

    hardQuestions.push(await Question.create({
      type: 'mcq_single',
      prompt: 'What is the output of: console.log(0.1 + 0.2 === 0.3) in JavaScript?',
      points: 8,
      negativeMarking: 2,
      options: [
        { text: 'true', isCorrect: false },
        { text: 'false', isCorrect: true },
        { text: 'undefined', isCorrect: false },
        { text: 'NaN', isCorrect: false }
      ],
      correctAnswers: ['false'],
      tags: ['javascript', 'programming'],
      difficulty: 'medium',
      createdBy: admin._id
    }));

    hardQuestions.push(await Question.create({
      type: 'mcq_single',
      prompt: 'In SQL, which isolation level prevents dirty reads but allows non-repeatable reads?',
      points: 10,
      negativeMarking: 3,
      options: [
        { text: 'Read Uncommitted', isCorrect: false },
        { text: 'Read Committed', isCorrect: true },
        { text: 'Repeatable Read', isCorrect: false },
        { text: 'Serializable', isCorrect: false }
      ],
      correctAnswers: ['Read Committed'],
      tags: ['database', 'sql'],
      difficulty: 'hard',
      createdBy: admin._id
    }));

    hardQuestions.push(await Question.create({
      type: 'mcq_single',
      prompt: 'What is the space complexity of Merge Sort algorithm?',
      points: 8,
      negativeMarking: 2,
      options: [
        { text: 'O(1)', isCorrect: false },
        { text: 'O(log n)', isCorrect: false },
        { text: 'O(n)', isCorrect: true },
        { text: 'O(n²)', isCorrect: false }
      ],
      correctAnswers: ['O(n)'],
      tags: ['algorithms', 'complexity'],
      difficulty: 'medium',
      createdBy: admin._id
    }));

    hardQuestions.push(await Question.create({
      type: 'mcq_single',
      prompt: 'In React, what is the purpose of the useCallback hook?',
      points: 8,
      negativeMarking: 2,
      options: [
        { text: 'To memoize component instances', isCorrect: false },
        { text: 'To memoize function references', isCorrect: true },
        { text: 'To handle side effects', isCorrect: false },
        { text: 'To manage component state', isCorrect: false }
      ],
      correctAnswers: ['To memoize function references'],
      tags: ['react', 'javascript'],
      difficulty: 'medium',
      createdBy: admin._id
    }));

    hardQuestions.push(await Question.create({
      type: 'mcq_single',
      prompt: 'Which HTTP status code indicates that the server understood the request but refuses to authorize it?',
      points: 6,
      negativeMarking: 2,
      options: [
        { text: '401 Unauthorized', isCorrect: false },
        { text: '403 Forbidden', isCorrect: true },
        { text: '404 Not Found', isCorrect: false },
        { text: '405 Method Not Allowed', isCorrect: false }
      ],
      correctAnswers: ['403 Forbidden'],
      tags: ['http', 'web'],
      difficulty: 'medium',
      createdBy: admin._id
    }));

    hardQuestions.push(await Question.create({
      type: 'mcq_single',
      prompt: 'What design pattern is used when you want to ensure a class has only one instance?',
      points: 6,
      negativeMarking: 2,
      options: [
        { text: 'Factory Pattern', isCorrect: false },
        { text: 'Observer Pattern', isCorrect: false },
        { text: 'Singleton Pattern', isCorrect: true },
        { text: 'Strategy Pattern', isCorrect: false }
      ],
      correctAnswers: ['Singleton Pattern'],
      tags: ['design-patterns', 'programming'],
      difficulty: 'medium',
      createdBy: admin._id
    }));

    hardQuestions.push(await Question.create({
      type: 'mcq_single',
      prompt: 'In a hash table with chaining, what is the worst-case time complexity for search?',
      points: 10,
      negativeMarking: 3,
      options: [
        { text: 'O(1)', isCorrect: false },
        { text: 'O(log n)', isCorrect: false },
        { text: 'O(n)', isCorrect: true },
        { text: 'O(n²)', isCorrect: false }
      ],
      correctAnswers: ['O(n)'],
      tags: ['data-structures', 'hashing'],
      difficulty: 'hard',
      createdBy: admin._id
    }));

    console.log(`✅ Created ${hardQuestions.length} hard questions`);

    // Create a new challenging exam
    const hardExam = await Exam.create({
      title: 'Advanced Programming Challenge',
      description: 'A challenging exam covering advanced algorithms, data structures, and programming concepts. Recommended for experienced developers.',
      createdBy: admin._id,
      status: 'published',
      startWindow: new Date('2024-01-01T00:00:00Z'),
      endWindow: new Date('2026-12-31T23:59:59Z'),
      maxAttempts: 3,
      totalDuration: 30,
      passingScore: 70,
      sections: [
        {
          title: 'Advanced Concepts',
          instructions: 'Answer the following challenging questions carefully. Each question carries higher marks and negative marking.',
          duration: 30,
          questions: hardQuestions.map(q => q._id),
          order: 0
        }
      ],
      settings: {
        shuffleQuestions: true,
        showResults: true,
        allowReview: true,
        proctorEnabled: false,
        antiCheat: {
          tabSwitchLimit: 5,
          fullscreenRequired: false,
          lockdownBrowser: false
        }
      }
    });

    console.log('✅ Created hard exam:', hardExam.title);
    console.log('\n🎯 Summary:');
    console.log(`- Added ${hardQuestions.length} challenging questions`);
    console.log(`- Created new exam: "${hardExam.title}"`);
    console.log(`- Duration: ${hardExam.totalDuration} minutes`);
    console.log(`- Passing Score: ${hardExam.passingScore}%`);
    console.log(`- Proctoring: ${hardExam.settings.proctorEnabled ? 'Enabled' : 'Disabled'}`);

    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });

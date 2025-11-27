const mongoose = require('mongoose');
const Exam = require('./models/Exam');
const Question = require('./models/Question');
const User = require('./models/User');

// Professional exam questions by subject
const professionalQuestions = {
  'JavaScript Fundamentals': [
    {
      type: 'mcq_single',
      prompt: 'What is the output of: console.log(typeof null)?',
      points: 5,
      options: [
        { text: 'object', isCorrect: true },
        { text: 'null', isCorrect: false },
        { text: 'undefined', isCorrect: false },
        { text: 'number', isCorrect: false }
      ],
      correctAnswers: ['object']
    },
    {
      type: 'mcq_single',
      prompt: 'Which method is used to add elements to the end of an array?',
      points: 5,
      options: [
        { text: 'push()', isCorrect: true },
        { text: 'pop()', isCorrect: false },
        { text: 'shift()', isCorrect: false },
        { text: 'unshift()', isCorrect: false }
      ],
      correctAnswers: ['push()']
    },
    {
      type: 'mcq_multiple',
      prompt: 'Which of the following are falsy values in JavaScript? (Select all that apply)',
      points: 10,
      options: [
        { text: '0', isCorrect: true },
        { text: 'false', isCorrect: true },
        { text: 'null', isCorrect: true },
        { text: '[]', isCorrect: false },
        { text: '{}', isCorrect: false },
        { text: '""', isCorrect: true }
      ],
      correctAnswers: ['0', 'false', 'null', '""']
    },
    {
      type: 'mcq_single',
      prompt: 'What does the "strict mode" directive do in JavaScript?',
      points: 5,
      options: [
        { text: 'Enables stricter parsing and error handling', isCorrect: true },
        { text: 'Makes code run faster', isCorrect: false },
        { text: 'Prevents variable declaration', isCorrect: false },
        { text: 'Disables console.log', isCorrect: false }
      ],
      correctAnswers: ['Enables stricter parsing and error handling']
    },
    {
      type: 'short_text',
      prompt: 'What keyword is used to declare a block-scoped variable in JavaScript?',
      points: 5,
      correctAnswers: ['let']
    }
  ],
  'Database Fundamentals': [
    {
      type: 'mcq_single',
      prompt: 'Which SQL statement is used to extract data from a database?',
      points: 5,
      options: [
        { text: 'SELECT', isCorrect: true },
        { text: 'EXTRACT', isCorrect: false },
        { text: 'GET', isCorrect: false },
        { text: 'FETCH', isCorrect: false }
      ],
      correctAnswers: ['SELECT']
    },
    {
      type: 'mcq_single',
      prompt: 'What does ACID stand for in database transactions?',
      points: 10,
      options: [
        { text: 'Atomicity, Consistency, Isolation, Durability', isCorrect: true },
        { text: 'Authentication, Consistency, Integrity, Durability', isCorrect: false },
        { text: 'Atomicity, Compliance, Isolation, Distribution', isCorrect: false },
        { text: 'Access, Control, Identity, Data', isCorrect: false }
      ],
      correctAnswers: ['Atomicity, Consistency, Isolation, Durability']
    },
    {
      type: 'mcq_single',
      prompt: 'In a relational database, what is a primary key?',
      points: 5,
      options: [
        { text: 'A unique identifier for each record in a table', isCorrect: true },
        { text: 'The first column in a table', isCorrect: false },
        { text: 'A foreign key reference', isCorrect: false },
        { text: 'An encrypted password field', isCorrect: false }
      ],
      correctAnswers: ['A unique identifier for each record in a table']
    },
    {
      type: 'mcq_single',
      prompt: 'Which JOIN returns all records when there is a match in either left or right table?',
      points: 5,
      options: [
        { text: 'FULL OUTER JOIN', isCorrect: true },
        { text: 'INNER JOIN', isCorrect: false },
        { text: 'LEFT JOIN', isCorrect: false },
        { text: 'RIGHT JOIN', isCorrect: false }
      ],
      correctAnswers: ['FULL OUTER JOIN']
    },
    {
      type: 'mcq_single',
      prompt: 'What is normalization in database design?',
      points: 5,
      options: [
        { text: 'Organizing data to reduce redundancy', isCorrect: true },
        { text: 'Converting data to normal distribution', isCorrect: false },
        { text: 'Encrypting sensitive data', isCorrect: false },
        { text: 'Backing up the database', isCorrect: false }
      ],
      correctAnswers: ['Organizing data to reduce redundancy']
    }
  ],
  'Web Development': [
    {
      type: 'mcq_single',
      prompt: 'Which HTTP method is idempotent and safe?',
      points: 5,
      options: [
        { text: 'GET', isCorrect: true },
        { text: 'POST', isCorrect: false },
        { text: 'DELETE', isCorrect: false },
        { text: 'PATCH', isCorrect: false }
      ],
      correctAnswers: ['GET']
    },
    {
      type: 'mcq_multiple',
      prompt: 'Which of the following are valid HTTP status codes? (Select all that apply)',
      points: 10,
      options: [
        { text: '200 OK', isCorrect: true },
        { text: '404 Not Found', isCorrect: true },
        { text: '500 Internal Server Error', isCorrect: true },
        { text: '999 Unknown Error', isCorrect: false },
        { text: '301 Moved Permanently', isCorrect: true }
      ],
      correctAnswers: ['200 OK', '404 Not Found', '500 Internal Server Error', '301 Moved Permanently']
    },
    {
      type: 'mcq_single',
      prompt: 'What is CORS (Cross-Origin Resource Sharing)?',
      points: 5,
      options: [
        { text: 'A security mechanism that allows or restricts resources from different origins', isCorrect: true },
        { text: 'A method to compress CSS files', isCorrect: false },
        { text: 'A JavaScript framework', isCorrect: false },
        { text: 'A database query language', isCorrect: false }
      ],
      correctAnswers: ['A security mechanism that allows or restricts resources from different origins']
    },
    {
      type: 'mcq_single',
      prompt: 'Which HTML5 element is used for semantic navigation?',
      points: 5,
      options: [
        { text: '<nav>', isCorrect: true },
        { text: '<menu>', isCorrect: false },
        { text: '<navigation>', isCorrect: false },
        { text: '<header>', isCorrect: false }
      ],
      correctAnswers: ['<nav>']
    },
    {
      type: 'mcq_single',
      prompt: 'What does REST stand for in RESTful APIs?',
      points: 5,
      options: [
        { text: 'Representational State Transfer', isCorrect: true },
        { text: 'Remote Execution Service Transfer', isCorrect: false },
        { text: 'Reliable Endpoint State Transmission', isCorrect: false },
        { text: 'Request-Response State Transfer', isCorrect: false }
      ],
      correctAnswers: ['Representational State Transfer']
    }
  ]
};

mongoose.connect('mongodb://localhost:27017/exam_system', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log('Connected to MongoDB - Updating questions');

  try {
    // Get all exams
    const exams = await Exam.find().populate('createdBy');
    console.log(`Found ${exams.length} exams`);

    let examIndex = 0;
    const subjects = Object.keys(professionalQuestions);

    for (const exam of exams) {
      // Select questions based on exam index
      const subject = subjects[examIndex % subjects.length];
      const questions = professionalQuestions[subject];

      console.log(`\nUpdating exam: ${exam.title}`);
      console.log(`Assigning subject: ${subject}`);

      // Delete old questions
      if (exam.sections && exam.sections.length > 0) {
        const oldQuestionIds = exam.sections[0].questions;
        await Question.deleteMany({ _id: { $in: oldQuestionIds } });
        console.log(`Deleted ${oldQuestionIds.length} old questions`);
      }

      // Create new questions
      const createdQuestions = await Question.insertMany(
        questions.map(q => ({
          ...q,
          createdBy: exam.createdBy._id
        }))
      );

      console.log(`Created ${createdQuestions.length} new questions`);

      // Update exam
      exam.title = `${subject} Exam`;
      exam.description = `Professional examination covering ${subject.toLowerCase()} concepts`;
      exam.sections = [{
        title: 'Main Section',
        instructions: 'Answer all questions carefully. Some questions have multiple correct answers.',
        duration: exam.totalDuration,
        questions: createdQuestions.map(q => q._id),
        order: 0
      }];

      // Enable shuffling for anti-cheating
      if (!exam.settings) {
        exam.settings = {};
      }
      exam.settings.shuffleQuestions = true;
      exam.settings.shuffleOptions = true;

      await exam.save();
      console.log(`Updated exam successfully`);

      examIndex++;
    }

    console.log('\n✅ All exams updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating exams:', error);
    process.exit(1);
  }
}).catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

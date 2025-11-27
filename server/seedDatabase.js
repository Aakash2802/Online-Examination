/**
 * Database Seeding Script
 * Run this to populate your database with sample data for testing
 *
 * Usage: node seedDatabase.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Question = require('./models/Question');
const Exam = require('./models/Exam');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    console.log('\n🌱 Starting database seeding...\n');

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({ email: { $in: ['admin@test.com', 'student@test.com', 'instructor@test.com', 'alice@test.com'] } });
    await Question.deleteMany({});
    await Exam.deleteMany({});
    console.log('✅ Cleared existing test data\n');

    // Create Users
    console.log('👥 Creating users...');

    const admin = await User.create({
      email: 'admin@test.com',
      password: 'Admin123!',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin'
    });
    console.log('✅ Created admin:', admin.email);

    const instructor = await User.create({
      email: 'instructor@test.com',
      password: 'Instructor123!',
      firstName: 'Jane',
      lastName: 'Smith',
      role: 'instructor'
    });
    console.log('✅ Created instructor:', instructor.email);

    const student = await User.create({
      email: 'student@test.com',
      password: 'Student123!',
      firstName: 'John',
      lastName: 'Doe',
      role: 'student'
    });
    console.log('✅ Created student:', student.email);

    const student2 = await User.create({
      email: 'alice@test.com',
      password: 'Student123!',
      firstName: 'Alice',
      lastName: 'Johnson',
      role: 'student'
    });
    console.log('✅ Created student:', student2.email);

    // Create Questions (50 questions total)
    console.log('\n📝 Creating questions...');

    const questions = [];

    // Geography Questions (1-10)
    questions.push(await Question.create({
      type: 'mcq_single',
      prompt: 'What is the capital of France?',
      points: 5,
      negativeMarking: 1,
      options: [
        { text: 'London', isCorrect: false },
        { text: 'Paris', isCorrect: true },
        { text: 'Berlin', isCorrect: false },
        { text: 'Madrid', isCorrect: false }
      ],
      correctAnswers: ['Paris'],
      tags: ['geography'],
      difficulty: 'easy',
      createdBy: admin._id
    }));

    questions.push(await Question.create({
      type: 'mcq_single',
      prompt: 'Which is the largest ocean on Earth?',
      points: 5,
      negativeMarking: 1,
      options: [
        { text: 'Atlantic Ocean', isCorrect: false },
        { text: 'Indian Ocean', isCorrect: false },
        { text: 'Pacific Ocean', isCorrect: true },
        { text: 'Arctic Ocean', isCorrect: false }
      ],
      correctAnswers: ['Pacific Ocean'],
      tags: ['geography'],
      difficulty: 'easy',
      createdBy: admin._id
    }));

    questions.push(await Question.create({
      type: 'mcq_single',
      prompt: 'What is the capital of Japan?',
      points: 5,
      negativeMarking: 1,
      options: [
        { text: 'Seoul', isCorrect: false },
        { text: 'Beijing', isCorrect: false },
        { text: 'Tokyo', isCorrect: true },
        { text: 'Bangkok', isCorrect: false }
      ],
      correctAnswers: ['Tokyo'],
      tags: ['geography'],
      difficulty: 'easy',
      createdBy: admin._id
    }));

    questions.push(await Question.create({
      type: 'mcq_single',
      prompt: 'Which continent is known as the "Dark Continent"?',
      points: 5,
      negativeMarking: 1,
      options: [
        { text: 'Asia', isCorrect: false },
        { text: 'Africa', isCorrect: true },
        { text: 'South America', isCorrect: false },
        { text: 'Australia', isCorrect: false }
      ],
      correctAnswers: ['Africa'],
      tags: ['geography'],
      difficulty: 'easy',
      createdBy: admin._id
    }));

    questions.push(await Question.create({
      type: 'mcq_single',
      prompt: 'What is the longest river in the world?',
      points: 5,
      negativeMarking: 1,
      options: [
        { text: 'Amazon River', isCorrect: false },
        { text: 'Nile River', isCorrect: true },
        { text: 'Yangtze River', isCorrect: false },
        { text: 'Mississippi River', isCorrect: false }
      ],
      correctAnswers: ['Nile River'],
      tags: ['geography'],
      difficulty: 'medium',
      createdBy: admin._id
    }));

    // Math Questions (6-15)
    questions.push(await Question.create({
      type: 'mcq_single',
      prompt: 'What is 2 + 2?',
      points: 3,
      negativeMarking: 0.5,
      options: [
        { text: '3', isCorrect: false },
        { text: '4', isCorrect: true },
        { text: '5', isCorrect: false },
        { text: '22', isCorrect: false }
      ],
      correctAnswers: ['4'],
      tags: ['math'],
      difficulty: 'easy',
      createdBy: admin._id
    }));

    questions.push(await Question.create({
      type: 'mcq_single',
      prompt: 'What is 15 × 3?',
      points: 3,
      negativeMarking: 0.5,
      options: [
        { text: '35', isCorrect: false },
        { text: '45', isCorrect: true },
        { text: '55', isCorrect: false },
        { text: '40', isCorrect: false }
      ],
      correctAnswers: ['45'],
      tags: ['math'],
      difficulty: 'easy',
      createdBy: admin._id
    }));

    questions.push(await Question.create({
      type: 'mcq_single',
      prompt: 'What is the square root of 144?',
      points: 4,
      negativeMarking: 1,
      options: [
        { text: '10', isCorrect: false },
        { text: '11', isCorrect: false },
        { text: '12', isCorrect: true },
        { text: '13', isCorrect: false }
      ],
      correctAnswers: ['12'],
      tags: ['math'],
      difficulty: 'easy',
      createdBy: admin._id
    }));

    questions.push(await Question.create({
      type: 'mcq_single',
      prompt: 'What is 20% of 200?',
      points: 4,
      negativeMarking: 1,
      options: [
        { text: '20', isCorrect: false },
        { text: '30', isCorrect: false },
        { text: '40', isCorrect: true },
        { text: '50', isCorrect: false }
      ],
      correctAnswers: ['40'],
      tags: ['math'],
      difficulty: 'easy',
      createdBy: admin._id
    }));

    questions.push(await Question.create({
      type: 'mcq_single',
      prompt: 'If a triangle has angles of 60°, 60°, and 60°, what type of triangle is it?',
      points: 5,
      negativeMarking: 1,
      options: [
        { text: 'Right Triangle', isCorrect: false },
        { text: 'Scalene Triangle', isCorrect: false },
        { text: 'Equilateral Triangle', isCorrect: true },
        { text: 'Isosceles Triangle', isCorrect: false }
      ],
      correctAnswers: ['Equilateral Triangle'],
      tags: ['math'],
      difficulty: 'medium',
      createdBy: admin._id
    }));

    // Science Questions (11-25)
    questions.push(await Question.create({
      type: 'mcq_single',
      prompt: 'What is the largest planet in our solar system?',
      points: 4,
      negativeMarking: 1,
      options: [
        { text: 'Saturn', isCorrect: false },
        { text: 'Jupiter', isCorrect: true },
        { text: 'Neptune', isCorrect: false },
        { text: 'Earth', isCorrect: false }
      ],
      correctAnswers: ['Jupiter'],
      tags: ['science'],
      difficulty: 'easy',
      createdBy: admin._id
    }));

    questions.push(await Question.create({
      type: 'mcq_single',
      prompt: 'What is the chemical symbol for water?',
      points: 3,
      negativeMarking: 0.5,
      options: [
        { text: 'O2', isCorrect: false },
        { text: 'H2O', isCorrect: true },
        { text: 'CO2', isCorrect: false },
        { text: 'HO', isCorrect: false }
      ],
      correctAnswers: ['H2O'],
      tags: ['science'],
      difficulty: 'easy',
      createdBy: admin._id
    }));

    questions.push(await Question.create({
      type: 'mcq_single',
      prompt: 'What force keeps us on the ground?',
      points: 4,
      negativeMarking: 1,
      options: [
        { text: 'Magnetism', isCorrect: false },
        { text: 'Gravity', isCorrect: true },
        { text: 'Friction', isCorrect: false },
        { text: 'Inertia', isCorrect: false }
      ],
      correctAnswers: ['Gravity'],
      tags: ['science'],
      difficulty: 'easy',
      createdBy: admin._id
    }));

    questions.push(await Question.create({
      type: 'mcq_single',
      prompt: 'How many bones are in the adult human body?',
      points: 5,
      negativeMarking: 1,
      options: [
        { text: '186', isCorrect: false },
        { text: '206', isCorrect: true },
        { text: '226', isCorrect: false },
        { text: '246', isCorrect: false }
      ],
      correctAnswers: ['206'],
      tags: ['science'],
      difficulty: 'medium',
      createdBy: admin._id
    }));

    questions.push(await Question.create({
      type: 'mcq_single',
      prompt: 'What is the speed of light in vacuum?',
      points: 5,
      negativeMarking: 1,
      options: [
        { text: '300,000 km/s', isCorrect: true },
        { text: '150,000 km/s', isCorrect: false },
        { text: '500,000 km/s', isCorrect: false },
        { text: '200,000 km/s', isCorrect: false }
      ],
      correctAnswers: ['300,000 km/s'],
      tags: ['science'],
      difficulty: 'medium',
      createdBy: admin._id
    }));

    questions.push(await Question.create({
      type: 'mcq_single',
      prompt: 'What gas do plants absorb from the atmosphere?',
      points: 4,
      negativeMarking: 1,
      options: [
        { text: 'Oxygen', isCorrect: false },
        { text: 'Nitrogen', isCorrect: false },
        { text: 'Carbon Dioxide', isCorrect: true },
        { text: 'Hydrogen', isCorrect: false }
      ],
      correctAnswers: ['Carbon Dioxide'],
      tags: ['science'],
      difficulty: 'easy',
      createdBy: admin._id
    }));

    questions.push(await Question.create({
      type: 'mcq_single',
      prompt: 'What is the hardest natural substance on Earth?',
      points: 5,
      negativeMarking: 1,
      options: [
        { text: 'Gold', isCorrect: false },
        { text: 'Iron', isCorrect: false },
        { text: 'Diamond', isCorrect: true },
        { text: 'Platinum', isCorrect: false }
      ],
      correctAnswers: ['Diamond'],
      tags: ['science'],
      difficulty: 'easy',
      createdBy: admin._id
    }));

    questions.push(await Question.create({
      type: 'mcq_single',
      prompt: 'What is the boiling point of water at sea level?',
      points: 4,
      negativeMarking: 1,
      options: [
        { text: '90°C', isCorrect: false },
        { text: '100°C', isCorrect: true },
        { text: '110°C', isCorrect: false },
        { text: '120°C', isCorrect: false }
      ],
      correctAnswers: ['100°C'],
      tags: ['science'],
      difficulty: 'easy',
      createdBy: admin._id
    }));

    questions.push(await Question.create({
      type: 'mcq_single',
      prompt: 'What organ in the human body filters blood?',
      points: 5,
      negativeMarking: 1,
      options: [
        { text: 'Heart', isCorrect: false },
        { text: 'Liver', isCorrect: false },
        { text: 'Kidneys', isCorrect: true },
        { text: 'Lungs', isCorrect: false }
      ],
      correctAnswers: ['Kidneys'],
      tags: ['science'],
      difficulty: 'easy',
      createdBy: admin._id
    }));

    questions.push(await Question.create({
      type: 'mcq_single',
      prompt: 'What is the most abundant gas in Earth\'s atmosphere?',
      points: 5,
      negativeMarking: 1,
      options: [
        { text: 'Oxygen', isCorrect: false },
        { text: 'Carbon Dioxide', isCorrect: false },
        { text: 'Nitrogen', isCorrect: true },
        { text: 'Hydrogen', isCorrect: false }
      ],
      correctAnswers: ['Nitrogen'],
      tags: ['science'],
      difficulty: 'medium',
      createdBy: admin._id
    }));

    questions.push(await Question.create({
      type: 'mcq_single',
      prompt: 'How many chambers does a human heart have?',
      points: 4,
      negativeMarking: 1,
      options: [
        { text: '2', isCorrect: false },
        { text: '3', isCorrect: false },
        { text: '4', isCorrect: true },
        { text: '5', isCorrect: false }
      ],
      correctAnswers: ['4'],
      tags: ['science'],
      difficulty: 'easy',
      createdBy: admin._id
    }));

    questions.push(await Question.create({
      type: 'mcq_single',
      prompt: 'What is the center of an atom called?',
      points: 5,
      negativeMarking: 1,
      options: [
        { text: 'Electron', isCorrect: false },
        { text: 'Proton', isCorrect: false },
        { text: 'Nucleus', isCorrect: true },
        { text: 'Neutron', isCorrect: false }
      ],
      correctAnswers: ['Nucleus'],
      tags: ['science'],
      difficulty: 'easy',
      createdBy: admin._id
    }));

    questions.push(await Question.create({
      type: 'mcq_single',
      prompt: 'What type of energy does a moving object have?',
      points: 5,
      negativeMarking: 1,
      options: [
        { text: 'Potential Energy', isCorrect: false },
        { text: 'Kinetic Energy', isCorrect: true },
        { text: 'Thermal Energy', isCorrect: false },
        { text: 'Chemical Energy', isCorrect: false }
      ],
      correctAnswers: ['Kinetic Energy'],
      tags: ['science'],
      difficulty: 'medium',
      createdBy: admin._id
    }));

    questions.push(await Question.create({
      type: 'mcq_single',
      prompt: 'What is the smallest unit of life?',
      points: 4,
      negativeMarking: 1,
      options: [
        { text: 'Atom', isCorrect: false },
        { text: 'Molecule', isCorrect: false },
        { text: 'Cell', isCorrect: true },
        { text: 'Tissue', isCorrect: false }
      ],
      correctAnswers: ['Cell'],
      tags: ['science'],
      difficulty: 'easy',
      createdBy: admin._id
    }));

    questions.push(await Question.create({
      type: 'mcq_single',
      prompt: 'What is the process by which plants make food?',
      points: 5,
      negativeMarking: 1,
      options: [
        { text: 'Respiration', isCorrect: false },
        { text: 'Photosynthesis', isCorrect: true },
        { text: 'Digestion', isCorrect: false },
        { text: 'Fermentation', isCorrect: false }
      ],
      correctAnswers: ['Photosynthesis'],
      tags: ['science'],
      difficulty: 'easy',
      createdBy: admin._id
    }));

    // Technology & Programming Questions (26-40)
    questions.push(await Question.create({
      type: 'mcq_single',
      prompt: 'What does HTTP stand for?',
      points: 4,
      negativeMarking: 1,
      options: [
        { text: 'HyperText Transfer Protocol', isCorrect: true },
        { text: 'High Transfer Text Protocol', isCorrect: false },
        { text: 'HyperText Transmission Protocol', isCorrect: false },
        { text: 'Home Tool Transfer Protocol', isCorrect: false }
      ],
      correctAnswers: ['HyperText Transfer Protocol'],
      tags: ['technology'],
      difficulty: 'easy',
      createdBy: admin._id
    }));

    questions.push(await Question.create({
      type: 'mcq_single',
      prompt: 'Which programming language is this project built with on the backend?',
      points: 3,
      negativeMarking: 0,
      options: [
        { text: 'Python', isCorrect: false },
        { text: 'Java', isCorrect: false },
        { text: 'JavaScript (Node.js)', isCorrect: true },
        { text: 'C++', isCorrect: false }
      ],
      correctAnswers: ['JavaScript (Node.js)'],
      tags: ['programming'],
      difficulty: 'easy',
      createdBy: admin._id
    }));

    questions.push(await Question.create({
      type: 'mcq_single',
      prompt: 'What does CPU stand for?',
      points: 4,
      negativeMarking: 1,
      options: [
        { text: 'Central Processing Unit', isCorrect: true },
        { text: 'Computer Personal Unit', isCorrect: false },
        { text: 'Central Processor Unit', isCorrect: false },
        { text: 'Central Program Utility', isCorrect: false }
      ],
      correctAnswers: ['Central Processing Unit'],
      tags: ['technology'],
      difficulty: 'easy',
      createdBy: admin._id
    }));

    questions.push(await Question.create({
      type: 'mcq_single',
      prompt: 'What is the primary purpose of RAM in a computer?',
      points: 5,
      negativeMarking: 1,
      options: [
        { text: 'Long-term storage', isCorrect: false },
        { text: 'Temporary storage for running programs', isCorrect: true },
        { text: 'Processing calculations', isCorrect: false },
        { text: 'Display graphics', isCorrect: false }
      ],
      correctAnswers: ['Temporary storage for running programs'],
      tags: ['technology'],
      difficulty: 'medium',
      createdBy: admin._id
    }));

    questions.push(await Question.create({
      type: 'mcq_single',
      prompt: 'Which of these is NOT a programming language?',
      points: 4,
      negativeMarking: 1,
      options: [
        { text: 'Python', isCorrect: false },
        { text: 'HTML', isCorrect: true },
        { text: 'Java', isCorrect: false },
        { text: 'C++', isCorrect: false }
      ],
      correctAnswers: ['HTML'],
      tags: ['programming'],
      difficulty: 'medium',
      createdBy: admin._id
    }));

    questions.push(await Question.create({
      type: 'mcq_single',
      prompt: 'What does SQL stand for?',
      points: 4,
      negativeMarking: 1,
      options: [
        { text: 'Structured Query Language', isCorrect: true },
        { text: 'Simple Query Language', isCorrect: false },
        { text: 'Standard Question Language', isCorrect: false },
        { text: 'System Query Logic', isCorrect: false }
      ],
      correctAnswers: ['Structured Query Language'],
      tags: ['technology'],
      difficulty: 'easy',
      createdBy: admin._id
    }));

    questions.push(await Question.create({
      type: 'mcq_single',
      prompt: 'What is the main purpose of an operating system?',
      points: 5,
      negativeMarking: 1,
      options: [
        { text: 'Browse the internet', isCorrect: false },
        { text: 'Manage computer hardware and software', isCorrect: true },
        { text: 'Create documents', isCorrect: false },
        { text: 'Play games', isCorrect: false }
      ],
      correctAnswers: ['Manage computer hardware and software'],
      tags: ['technology'],
      difficulty: 'easy',
      createdBy: admin._id
    }));

    questions.push(await Question.create({
      type: 'mcq_single',
      prompt: 'What does API stand for?',
      points: 4,
      negativeMarking: 1,
      options: [
        { text: 'Application Programming Interface', isCorrect: true },
        { text: 'Advanced Program Integration', isCorrect: false },
        { text: 'Application Process Integration', isCorrect: false },
        { text: 'Automated Programming Interface', isCorrect: false }
      ],
      correctAnswers: ['Application Programming Interface'],
      tags: ['technology'],
      difficulty: 'easy',
      createdBy: admin._id
    }));

    questions.push(await Question.create({
      type: 'mcq_single',
      prompt: 'Which data structure uses LIFO (Last In First Out)?',
      points: 5,
      negativeMarking: 1,
      options: [
        { text: 'Queue', isCorrect: false },
        { text: 'Stack', isCorrect: true },
        { text: 'Array', isCorrect: false },
        { text: 'Tree', isCorrect: false }
      ],
      correctAnswers: ['Stack'],
      tags: ['programming'],
      difficulty: 'medium',
      createdBy: admin._id
    }));

    questions.push(await Question.create({
      type: 'mcq_single',
      prompt: 'What is the binary representation of decimal 10?',
      points: 5,
      negativeMarking: 1,
      options: [
        { text: '1000', isCorrect: false },
        { text: '1001', isCorrect: false },
        { text: '1010', isCorrect: true },
        { text: '1011', isCorrect: false }
      ],
      correctAnswers: ['1010'],
      tags: ['programming'],
      difficulty: 'medium',
      createdBy: admin._id
    }));

    questions.push(await Question.create({
      type: 'mcq_multiple',
      prompt: 'Which of the following are programming languages? (Select all that apply)',
      points: 6,
      negativeMarking: 2,
      options: [
        { text: 'Python', isCorrect: true },
        { text: 'HTML', isCorrect: false },
        { text: 'Java', isCorrect: true },
        { text: 'CSS', isCorrect: false },
        { text: 'JavaScript', isCorrect: true }
      ],
      correctAnswers: ['Python', 'Java', 'JavaScript'],
      tags: ['programming'],
      difficulty: 'medium',
      createdBy: admin._id
    }));

    questions.push(await Question.create({
      type: 'mcq_single',
      prompt: 'What does CSS stand for?',
      points: 4,
      negativeMarking: 1,
      options: [
        { text: 'Computer Style Sheets', isCorrect: false },
        { text: 'Cascading Style Sheets', isCorrect: true },
        { text: 'Creative Style System', isCorrect: false },
        { text: 'Colorful Style Sheets', isCorrect: false }
      ],
      correctAnswers: ['Cascading Style Sheets'],
      tags: ['technology'],
      difficulty: 'easy',
      createdBy: admin._id
    }));

    questions.push(await Question.create({
      type: 'mcq_single',
      prompt: 'Which company developed the Java programming language?',
      points: 5,
      negativeMarking: 1,
      options: [
        { text: 'Microsoft', isCorrect: false },
        { text: 'Sun Microsystems', isCorrect: true },
        { text: 'Apple', isCorrect: false },
        { text: 'Google', isCorrect: false }
      ],
      correctAnswers: ['Sun Microsystems'],
      tags: ['programming'],
      difficulty: 'medium',
      createdBy: admin._id
    }));

    questions.push(await Question.create({
      type: 'mcq_single',
      prompt: 'What is the time complexity of binary search?',
      points: 6,
      negativeMarking: 2,
      options: [
        { text: 'O(n)', isCorrect: false },
        { text: 'O(log n)', isCorrect: true },
        { text: 'O(n²)', isCorrect: false },
        { text: 'O(1)', isCorrect: false }
      ],
      correctAnswers: ['O(log n)'],
      tags: ['programming'],
      difficulty: 'hard',
      createdBy: admin._id
    }));

    questions.push(await Question.create({
      type: 'mcq_single',
      prompt: 'What does GPU stand for?',
      points: 4,
      negativeMarking: 1,
      options: [
        { text: 'General Processing Unit', isCorrect: false },
        { text: 'Graphics Processing Unit', isCorrect: true },
        { text: 'Graphical Program Utility', isCorrect: false },
        { text: 'Game Processing Unit', isCorrect: false }
      ],
      correctAnswers: ['Graphics Processing Unit'],
      tags: ['technology'],
      difficulty: 'easy',
      createdBy: admin._id
    }));

    // History & General Knowledge Questions (41-50)
    questions.push(await Question.create({
      type: 'mcq_single',
      prompt: 'Who painted the Mona Lisa?',
      points: 5,
      negativeMarking: 1,
      options: [
        { text: 'Vincent van Gogh', isCorrect: false },
        { text: 'Pablo Picasso', isCorrect: false },
        { text: 'Leonardo da Vinci', isCorrect: true },
        { text: 'Michelangelo', isCorrect: false }
      ],
      correctAnswers: ['Leonardo da Vinci'],
      tags: ['history'],
      difficulty: 'easy',
      createdBy: admin._id
    }));

    questions.push(await Question.create({
      type: 'mcq_single',
      prompt: 'In which year did World War II end?',
      points: 5,
      negativeMarking: 1,
      options: [
        { text: '1943', isCorrect: false },
        { text: '1944', isCorrect: false },
        { text: '1945', isCorrect: true },
        { text: '1946', isCorrect: false }
      ],
      correctAnswers: ['1945'],
      tags: ['history'],
      difficulty: 'easy',
      createdBy: admin._id
    }));

    questions.push(await Question.create({
      type: 'mcq_single',
      prompt: 'Who was the first president of the United States?',
      points: 5,
      negativeMarking: 1,
      options: [
        { text: 'Thomas Jefferson', isCorrect: false },
        { text: 'Abraham Lincoln', isCorrect: false },
        { text: 'George Washington', isCorrect: true },
        { text: 'John Adams', isCorrect: false }
      ],
      correctAnswers: ['George Washington'],
      tags: ['history'],
      difficulty: 'easy',
      createdBy: admin._id
    }));

    questions.push(await Question.create({
      type: 'mcq_single',
      prompt: 'What is the currency of the United Kingdom?',
      points: 4,
      negativeMarking: 1,
      options: [
        { text: 'Euro', isCorrect: false },
        { text: 'Pound Sterling', isCorrect: true },
        { text: 'Dollar', isCorrect: false },
        { text: 'Franc', isCorrect: false }
      ],
      correctAnswers: ['Pound Sterling'],
      tags: ['general'],
      difficulty: 'easy',
      createdBy: admin._id
    }));

    questions.push(await Question.create({
      type: 'mcq_single',
      prompt: 'How many continents are there on Earth?',
      points: 3,
      negativeMarking: 0.5,
      options: [
        { text: '5', isCorrect: false },
        { text: '6', isCorrect: false },
        { text: '7', isCorrect: true },
        { text: '8', isCorrect: false }
      ],
      correctAnswers: ['7'],
      tags: ['geography'],
      difficulty: 'easy',
      createdBy: admin._id
    }));

    questions.push(await Question.create({
      type: 'mcq_single',
      prompt: 'What is the tallest mountain in the world?',
      points: 5,
      negativeMarking: 1,
      options: [
        { text: 'K2', isCorrect: false },
        { text: 'Mount Everest', isCorrect: true },
        { text: 'Kilimanjaro', isCorrect: false },
        { text: 'Mount Fuji', isCorrect: false }
      ],
      correctAnswers: ['Mount Everest'],
      tags: ['geography'],
      difficulty: 'easy',
      createdBy: admin._id
    }));

    questions.push(await Question.create({
      type: 'mcq_single',
      prompt: 'What is the smallest country in the world?',
      points: 5,
      negativeMarking: 1,
      options: [
        { text: 'Monaco', isCorrect: false },
        { text: 'Vatican City', isCorrect: true },
        { text: 'San Marino', isCorrect: false },
        { text: 'Liechtenstein', isCorrect: false }
      ],
      correctAnswers: ['Vatican City'],
      tags: ['geography'],
      difficulty: 'medium',
      createdBy: admin._id
    }));

    questions.push(await Question.create({
      type: 'mcq_single',
      prompt: 'How many colors are in a rainbow?',
      points: 3,
      negativeMarking: 0.5,
      options: [
        { text: '5', isCorrect: false },
        { text: '6', isCorrect: false },
        { text: '7', isCorrect: true },
        { text: '8', isCorrect: false }
      ],
      correctAnswers: ['7'],
      tags: ['general'],
      difficulty: 'easy',
      createdBy: admin._id
    }));

    questions.push(await Question.create({
      type: 'mcq_single',
      prompt: 'What is the largest mammal in the world?',
      points: 5,
      negativeMarking: 1,
      options: [
        { text: 'African Elephant', isCorrect: false },
        { text: 'Blue Whale', isCorrect: true },
        { text: 'Giraffe', isCorrect: false },
        { text: 'Polar Bear', isCorrect: false }
      ],
      correctAnswers: ['Blue Whale'],
      tags: ['science'],
      difficulty: 'easy',
      createdBy: admin._id
    }));

    questions.push(await Question.create({
      type: 'mcq_single',
      prompt: 'How many days are in a leap year?',
      points: 3,
      negativeMarking: 0.5,
      options: [
        { text: '364', isCorrect: false },
        { text: '365', isCorrect: false },
        { text: '366', isCorrect: true },
        { text: '367', isCorrect: false }
      ],
      correctAnswers: ['366'],
      tags: ['general'],
      difficulty: 'easy',
      createdBy: admin._id
    }));

    console.log(`✅ Created ${questions.length} questions`);

    // Create Exams
    console.log('\n📚 Creating exams...');

    // Exam 1: General Knowledge Quiz (20 questions)
    // Using questions from index 0-19 (Geography, Math, some Science)
    const exam1 = await Exam.create({
      title: 'General Knowledge Quiz',
      description: 'Test your knowledge across multiple subjects including geography, math, and science.',
      createdBy: admin._id,
      status: 'published',
      startWindow: new Date('2024-01-01T00:00:00Z'),
      endWindow: new Date('2026-12-31T23:59:59Z'),
      maxAttempts: 3,
      totalDuration: 20,
      passingScore: 60,
      sections: [
        {
          title: 'General Questions',
          instructions: 'Answer all questions to the best of your ability. Each question has different point values.',
          duration: 20,
          questions: [
            questions[0]._id,  // Geography 1
            questions[1]._id,  // Geography 2
            questions[2]._id,  // Geography 3
            questions[3]._id,  // Geography 4
            questions[4]._id,  // Geography 5
            questions[5]._id,  // Math 1
            questions[6]._id,  // Math 2
            questions[7]._id,  // Math 3
            questions[8]._id,  // Math 4
            questions[9]._id,  // Math 5
            questions[10]._id, // Science 1
            questions[11]._id, // Science 2
            questions[12]._id, // Science 3
            questions[13]._id, // Science 4
            questions[14]._id, // Science 5
            questions[40]._id, // History 1
            questions[41]._id, // History 2
            questions[42]._id, // History 3
            questions[43]._id, // General 1
            questions[44]._id  // General 2
          ],
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
      }
    });
    console.log('✅ Created exam 1:', exam1.title, '(20 questions)');

    // Exam 2: Science & Technology Assessment (30 questions)
    // Using questions from index 15-24 (Science) and 25-39 (Technology) and remaining general
    const exam2 = await Exam.create({
      title: 'Science & Technology Assessment',
      description: 'A comprehensive test covering science, biology, technology, and programming concepts.',
      createdBy: instructor._id,
      status: 'published',
      startWindow: new Date('2024-01-01T00:00:00Z'),
      endWindow: new Date('2026-12-31T23:59:59Z'),
      maxAttempts: 2,
      totalDuration: 30,
      passingScore: 70,
      sections: [
        {
          title: 'Science Section',
          instructions: 'Answer the following science questions.',
          duration: 15,
          questions: [
            questions[15]._id, // Science 6
            questions[16]._id, // Science 7
            questions[17]._id, // Science 8
            questions[18]._id, // Science 9
            questions[19]._id, // Science 10
            questions[20]._id, // Science 11
            questions[21]._id, // Science 12
            questions[22]._id, // Science 13
            questions[23]._id, // Science 14
            questions[24]._id, // Science 15
            questions[45]._id, // General 3
            questions[46]._id, // General 4
            questions[47]._id, // General 5
            questions[48]._id, // General 6
            questions[49]._id  // General 7
          ],
          order: 0
        },
        {
          title: 'Technology & Programming Section',
          instructions: 'Test your technology and programming knowledge.',
          duration: 15,
          questions: [
            questions[25]._id, // Technology 1
            questions[26]._id, // Programming 1
            questions[27]._id, // Technology 2
            questions[28]._id, // Technology 3
            questions[29]._id, // Programming 2
            questions[30]._id, // Technology 4
            questions[31]._id, // Technology 5
            questions[32]._id, // Technology 6
            questions[33]._id, // Programming 3
            questions[34]._id, // Programming 4
            questions[35]._id, // Programming 5
            questions[36]._id, // Technology 7
            questions[37]._id, // Programming 6
            questions[38]._id, // Programming 7
            questions[39]._id  // Technology 8
          ],
          order: 1
        }
      ],
      settings: {
        shuffleQuestions: true,
        showResults: true,
        allowReview: true,
        proctorEnabled: true,
        antiCheat: {
          tabSwitchLimit: 5,
          fullscreenRequired: false,
          lockdownBrowser: false
        }
      }
    });
    console.log('✅ Created exam 2:', exam2.title, '(30 questions)');

    const exam3 = await Exam.create({
      title: 'Quick Math Quiz',
      description: 'A short 10-minute quiz testing basic math skills.',
      createdBy: admin._id,
      status: 'published',
      startWindow: new Date('2024-01-01T00:00:00Z'),
      endWindow: new Date('2026-12-31T23:59:59Z'),
      maxAttempts: 5,
      totalDuration: 10,
      passingScore: 50,
      sections: [
        {
          title: 'Math Problems',
          instructions: 'Solve the following problems quickly!',
          duration: 10,
          questions: [questions[5]._id, questions[6]._id, questions[7]._id, questions[8]._id, questions[9]._id],
          order: 0
        }
      ],
      settings: {
        shuffleQuestions: false,
        showResults: true,
        allowReview: false,
        proctorEnabled: false,
        antiCheat: {
          tabSwitchLimit: 10,
          fullscreenRequired: false,
          lockdownBrowser: false
        }
      }
    });
    console.log('✅ Created exam 3:', exam3.title, '(5 questions)');

    // Summary
    console.log('\n📊 Seeding Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`👥 Users Created: 4`);
    console.log(`   - admin@test.com (Admin)`);
    console.log(`   - instructor@test.com (Instructor)`);
    console.log(`   - student@test.com (Student)`);
    console.log(`   - alice@test.com (Student)`);
    console.log(`\n📝 Questions Created: 50`);
    console.log(`   - 48 MCQ Single Choice`);
    console.log(`   - 1 MCQ Multiple Choice`);
    console.log(`   - Covering Geography, Math, Science, Technology, Programming, History`);
    console.log(`\n📚 Exams Created: 3`);
    console.log(`   - General Knowledge Quiz (20 min, 20 questions)`);
    console.log(`   - Science & Technology Assessment (30 min, 30 questions)`);
    console.log(`   - Quick Math Quiz (10 min, 5 questions)`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('🎉 Database seeding completed successfully!\n');
    console.log('📌 Next Steps:');
    console.log('   1. Start the backend: cd server && npm run dev');
    console.log('   2. Start the frontend: cd client && npm run dev');
    console.log('   3. Login at http://localhost:5173');
    console.log('   4. Use: student@test.com / Student123!\n');

  } catch (error) {
    console.error('❌ Seeding Error:', error);
    process.exit(1);
  }
};

const run = async () => {
  await connectDB();
  await seedData();
  await mongoose.connection.close();
  console.log('✅ MongoDB connection closed');
  console.log('👋 Goodbye!\n');
  process.exit(0);
};

run();

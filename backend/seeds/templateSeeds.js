const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Template = require('../models/Template');
const connectDB = require('../config/db');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Template seed data
const templateData = [
  {
    _id:1,
    name: 'ModernTemplate',
    description: 'A clean, contemporary design with a focus on skills and experience.',
    previewImage: '/images/templates/modern.jpg',
    isPremium: false
  },
  {
    _id:2,
    name: 'ClassicTemplate',
    description: 'Traditional resume layout perfect for conservative industries.',
    previewImage: '/images/templates/classic.jpg',
    isPremium: false
  },
  {
    _id:3,
    name: 'MinimalistTemplate',
    description: 'Simple, elegant design with plenty of white space.',
    previewImage: '/images/templates/minimalist.jpg',
    isPremium: false
  }
];

// Function to seed templates

const seedTemplates = async () => {
  try {
    console.log('Deleting existing templates...');
    await Template.deleteMany({});

    console.log('Seeding new templates...');
    const insertedTemplates = await Template.insertMany(templateData);

    console.log('Templates seeded successfully:', insertedTemplates);
    process.exit(0);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
};

// Run the seeder
seedTemplates();
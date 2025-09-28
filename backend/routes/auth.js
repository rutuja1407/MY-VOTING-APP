const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Voter = require('../models/Voter');
const router = express.Router();

// Euclidean distance function for face descriptor comparison
function euclidean(a, b) {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += Math.pow(a[i] - b[i], 2);
  }
  return Math.sqrt(sum);
}

// Register user (stores faceDescriptor)
router.post('/register', async (req, res) => {
  try {
    const { aadhaar, name, phone, email, password, faceDescriptor } = req.body;
    console.log('📝 Registration attempt for:', name, 'Aadhaar:', aadhaar);

    // Check if Aadhaar exists in voter list
    const voter = await Voter.findOne({ aadhaar });
    if (!voter) {
      console.log('❌ Aadhaar not found in voter list:', aadhaar);
      return res.status(400).json({ error: "Aadhaar is not in voter list." });
    }
    console.log('✅ Aadhaar found in voter list');

    // Check if already registered
    const existingUser = await User.findOne({ aadhaar });
    if (existingUser) {
      console.log('❌ Aadhaar already registered:', aadhaar);
      return res.status(400).json({ error: "Aadhaar already registered." });
    }

    // Check for duplicate email
    const duplicateEmail = await User.findOne({ email });
    if (duplicateEmail) {
      console.log('❌ Email already exists:', email);
      return res.status(400).json({ error: "Email already registered." });
    }

    // Check for duplicate phone
    const duplicatePhone = await User.findOne({ phone });
    if (duplicatePhone) {
      console.log('❌ Phone already exists:', phone);
      return res.status(400).json({ error: "Phone number already registered." });
    }

    // Hash password securely
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user and save faceDescriptor array
    const newUser = new User({
      aadhaar,
      name,
      phone,
      email,
      password: hashedPassword,
      hasVoted: false,
      faceDescriptor,
      registrationDate: new Date()
    });

    const savedUser = await newUser.save();
    console.log('✅ User registered successfully in confirmed_voters:', name);
    console.log('📊 User ID:', savedUser._id);

    res.status(201).json({
      message: "User registered successfully in confirmed_voters collection!",
      userId: savedUser._id,
      name: savedUser.name
    });

  } catch (error) {
    console.error('❌ Registration error:', error);
    // Handle MongoDB duplicate key errors nicely
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0];
      return res.status(400).json({
        error: `${field} already exists. Please use a different ${field}.`
      });
    }
    res.status(500).json({ error: error.message });
  }
});

// Login user with faceDescriptor check
router.post('/login', async (req, res) => {
  try {
    const { userId, password, loginDescriptor } = req.body;
    console.log('🔐 Login attempt for:', userId);

    // Find user by aadhaar or email
    const user = await User.findOne({
      $or: [{ aadhaar: userId }, { email: userId }]
    });

    if (!user) {
      console.log('❌ User not found:', userId);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      console.log('❌ Invalid password for:', userId);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Euclidean distance between stored and login face descriptor
    const distance = euclidean(user.faceDescriptor, loginDescriptor);
    const threshold = 0.6; // Typical threshold for face-api.js face descriptors
    const match = distance < threshold;

    console.log(`Distance: ${distance}, face match? ${match}`);

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        aadhaar: user.aadhaar,
        name: user.name,
        email: user.email,
        hasVoted: user.hasVoted,
        phone: user.phone,
        match
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ error: error.message });
  }
});

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  aadhaar: {
    type: String,
    required: [true, 'Aadhaar number is required'],
    unique: true,
    validate: {
      validator: function(v) {
        return /^\d{12}$/.test(v);
      },
      message: 'Aadhaar number must be exactly 12 digits'
    },
    index: true
  },
  
  name: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    validate: {
      validator: function(v) {
        return /^[6-9]\d{9}$/.test(v);
      },
      message: 'Phone number must be a valid 10-digit Indian mobile number starting with 6-9'
    },
    index: true
  },
  
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Please enter a valid email address'
    },
    index: true
  },
  
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long']
  },
  
  hasVoted: {
    type: Boolean,
    default: false,
    index: true
  },
  
  userType: {
    type: String,
    enum: ['voter', 'admin'],
    default: 'voter'
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  registrationDate: {
    type: Date,
    default: Date.now
  },
  
  votingDate: {
    type: Date,
    default: null
  },
  faceDescriptor: 
  { type: [Number], required: true }
  ,
}, {
  timestamps: true,
  collection: 'confirmed_voters' // This specifies the collection name
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Ensure password is never included in JSON output
userSchema.set('toJSON', {
  transform: function(doc, ret) {
    delete ret.password;
    delete ret.__v;
    return ret;
  }
});

console.log('Stored faceDescriptor length:', user.faceDescriptor.length);
console.log('Login faceDescriptor length:', loginDescriptor.length);
console.log('Euclidean distance:', distance);


module.exports = router;

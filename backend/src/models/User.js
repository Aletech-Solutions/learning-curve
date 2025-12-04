const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 2,
    maxlength: 30,
  },
  xp: {
    type: Number,
    default: 0,
    min: 0,
  },
  level: {
    type: Number,
    default: 1,
    min: 1,
  },
  completedTasks: [{
    type: String,
  }],
  taskHistory: [{
    taskId: String,
    completedAt: { type: Date, default: Date.now },
    xpEarned: Number,
    attempts: { type: Number, default: 1 },
  }],
  streak: {
    current: { type: Number, default: 0 },
    longest: { type: Number, default: 0 },
    lastActivity: { type: Date, default: Date.now },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Calculate level based on XP
userSchema.methods.calculateLevel = function() {
  return Math.floor(this.xp / 500) + 1;
};

// Update streak
userSchema.methods.updateStreak = function() {
  const now = new Date();
  const lastActivity = new Date(this.streak.lastActivity);
  const diffDays = Math.floor((now - lastActivity) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) {
    this.streak.current += 1;
    if (this.streak.current > this.streak.longest) {
      this.streak.longest = this.streak.current;
    }
  } else if (diffDays > 1) {
    this.streak.current = 1;
  }
  
  this.streak.lastActivity = now;
};

const User = mongoose.model('User', userSchema);

module.exports = User;


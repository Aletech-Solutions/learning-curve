const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Get or create user
router.post('/', async (req, res) => {
  try {
    const { username } = req.body;
    
    if (!username || username.trim().length < 2) {
      return res.status(400).json({ error: 'Username must be at least 2 characters' });
    }

    let user = await User.findOne({ username: username.trim() });
    
    if (!user) {
      user = new User({ username: username.trim() });
      await user.save();
      console.log(`New user created: ${username}`);
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error creating/finding user:', error);
    res.status(500).json({ error: 'Failed to create/find user' });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update user progress
router.post('/:id/progress', async (req, res) => {
  try {
    const { taskId, xpEarned } = req.body;
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if task already completed
    if (user.completedTasks.includes(taskId)) {
      return res.json(user);
    }

    // Add XP and update completed tasks
    user.xp += xpEarned;
    user.level = user.calculateLevel();
    user.completedTasks.push(taskId);
    user.taskHistory.push({
      taskId,
      xpEarned,
      completedAt: new Date(),
    });
    
    // Update streak
    user.updateStreak();
    
    await user.save();
    
    console.log(`User ${user.username} completed task ${taskId}, earned ${xpEarned} XP`);
    res.json(user);
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

// Get leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const users = await User.find()
      .sort({ xp: -1 })
      .limit(100)
      .select('username xp level completedTasks');
    
    res.json(users);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

module.exports = router;


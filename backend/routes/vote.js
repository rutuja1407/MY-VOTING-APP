const express = require('express');
const User = require('../models/User');
const router = express.Router();

// Option 1: Update by user ID (recommended)

router.patch("/", async (req, res) => { 
  const { aadhaar } = req.body;
  try {
    // Find user by ID and update hasVoted to true
    const updatedUser = await User.findOneAndUpdate(
      {
        aadhaar
      },
      { 
        hasVoted: true,
        votingDate: new Date() // Also record when they voted
      },
      { 
        new: true, // Return updated document
        runValidators: true // Run schema validation
      }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    console.log('✅ Vote recorded for user:', updatedUser.name);
    res.status(200).json({ 
      message: "Vote recorded successfully",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        hasVoted: updatedUser.hasVoted,
        votingDate: updatedUser.votingDate
      }
    });

  } catch (error) {
    console.error('❌ Error recording vote:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

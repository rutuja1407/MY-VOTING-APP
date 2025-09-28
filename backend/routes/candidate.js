const express = require('express');
const Candidate = require('../models/Candidate');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
      const candidates = await Candidate.find({});
      console.log('candidates',candidates);
      res.status(200).json({
        success: true,
         candidates,
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch candidates' });
    }
});
router.post('/', async (req, res) => {
    const { name, party, age, position,description } = req.body;
    try {
      const candidate = new Candidate({ name, party, position,description,experience: age });
      await candidate.save();
      res.status(201).json({
        success: true,
        candidate,
      });
    } catch (error) {
      res.status(400).json({ error: 'Could not add candidate' });
    }
  });

router.put('/:id', async (req, res) => {
    try {
      const candidate = await Candidate.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.status(200).json(candidate);
    } catch (error) {
      res.status(400).json({ error: 'Could not update candidate' });
    }
  });
  
  // Delete candidate by id
router.delete('/:id', async (req, res) => {
    try {
      await Candidate.findByIdAndDelete(req.params.id);
      res.status(200).json({ message: "Deleted",success:true });
    } catch (error) {
      res.status(400).json({ error: 'Could not delete candidate' });
    }
});
  
  
  module.exports = router;
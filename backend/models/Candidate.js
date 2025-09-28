const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  party: { type: String, required: true },
  position: { type: String, required: true },
  imageUrl: { type: String, required: false },
  description: { type: String, required: true }, 
  experience: { type: String, required: false }   
});

module.exports = mongoose.model('Candidate', candidateSchema);

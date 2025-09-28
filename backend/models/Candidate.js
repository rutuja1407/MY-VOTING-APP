const mongoose = require('mongoose');
const candidateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  party: { type: String, required: true },
  position: { type: String, required: true },
  imageUrl: { type: String },
  description: { type: String, required: true }
});
module.exports = mongoose.model('Candidate', candidateSchema);

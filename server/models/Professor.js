const mongoose = require('mongoose');

const ProfessorSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  palavraPasse: {
    type: String,
    required: true
  },
  nome: {
    type: String,
    default: ''
  },
  instituicao: {
    type: String,
    default: ''
  },
  disciplinas: {
    type: [String],
    default: []
  },
  criadoEm: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Professor', ProfessorSchema);
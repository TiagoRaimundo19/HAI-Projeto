const mongoose = require('mongoose');

const FeedbackProfessorSchema = new mongoose.Schema({
  professor: { type: mongoose.Schema.Types.ObjectId, ref: 'Professor', required: true },
  aluno: { type: mongoose.Schema.Types.ObjectId, ref: 'Aluno', required: true },
  disciplina: { type: String, required: true },
  mensagem: { type: String, required: true },
  dataAula: { type: String, required: true }, // Carimbo YYYY-MM-DD até quando este feedback é válido
  criadoEm: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FeedbackProfessor', FeedbackProfessorSchema, 'feedback_professor');
const mongoose = require('mongoose');

const TentativaDebunkingSchema = new mongoose.Schema({
  aluno: { type: mongoose.Schema.Types.ObjectId, ref: 'Aluno', required: true },
  professor: { type: mongoose.Schema.Types.ObjectId, ref: 'Professor', required: true },
  disciplina: { type: String, required: true },
  anoEscolar: { type: String, required: true },
  tema: { type: String, required: true },
  errorsFound: { type: Number, required: true },  // Quantos erros o aluno apanhou
  totalErrors: { type: Number, default: 3 },      // Total de rasteiras geradas pela IA
  success: { type: Boolean, required: true },     // true se encontrou todos (3/3)
  criadoEm: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TentativaDebunking', TentativaDebunkingSchema, 'tentativas_debunking');
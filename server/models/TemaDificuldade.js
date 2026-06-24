const mongoose = require('mongoose');

const TemaDificuldadeSchema = new mongoose.Schema({
  aluno: { type: mongoose.Schema.Types.ObjectId, ref: 'Aluno' },
  professor: { type: mongoose.Schema.Types.ObjectId, ref: 'Professor' },
  tema: { type: String, required: true },
  disciplina: { type: String, required: true },
  dataAula: { type: String, required: true },
  criadoEm: { type: Date, default: Date.now }
}, { timestamps: true });

// Guardado de forma limpa na coleção 'temas_dificuldade'
module.exports = mongoose.model('TemaDificuldade', TemaDificuldadeSchema, 'temas_dificuldade');
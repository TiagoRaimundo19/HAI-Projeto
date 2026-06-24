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
  // --- NOVOS CAMPOS DINÂMICOS ---
  anosEscolares: {
    type: [String], // Ex: ['10º Ano', '12º Ano']
    default: []
  },
  turmas: {
    type: [String], // Ex: ['Turma A', 'Turma C', 'Turma Engenharia'] (Sem limites!)
    default: []
  },
  // ------------------------------
  criadoEm: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Professor', ProfessorSchema, 'professors');
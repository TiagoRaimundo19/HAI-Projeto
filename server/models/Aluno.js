const mongoose = require('mongoose');

const AlunoSchema = new mongoose.Schema({
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
  anoEscolar: {
    type: String, 
    default: ''
  },
  instituicao: {
    type: String,
    default: ''
  },
  turma: {
    type: String, // O aluno apenas sabe a sua turma global
    default: ''
  },

  disciplinas: {
    type: [String], 
    default: []
  },
  criadoEm: {
    type: Date,
    default: Date.now
  },
  professores: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Professor' }]
}, { timestamps: true });

module.exports = mongoose.model('Aluno', AlunoSchema);
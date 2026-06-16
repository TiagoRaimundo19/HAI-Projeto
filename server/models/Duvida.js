const mongoose = require('mongoose');

const DuvidaSchema = new mongoose.Schema({
  pergunta: {
    type: String,
    required: true
  },
  respostaGemini: {
    type: String,
    default: ''
  },
  utilizador: {
    type: String, 
    default: 'Aluno' // Mais tarde podes ligar ao ID do aluno se quiseres
  },
  criadoEm: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Duvida', DuvidaSchema);
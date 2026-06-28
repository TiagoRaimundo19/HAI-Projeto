const mongoose = require('mongoose');

const ConversaSchema = new mongoose.Schema({
  aluno: { type: mongoose.Schema.Types.ObjectId, ref: 'Aluno', required: true },
  titulo: { type: String, default: 'Nova Conversa' },
  criadoEm: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Conversa', ConversaSchema, 'conversas');
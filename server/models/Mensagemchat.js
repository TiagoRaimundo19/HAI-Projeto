const mongoose = require('mongoose');

const MensagemChatSchema = new mongoose.Schema({
  conversa: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversa', required: true },
  sender: { type: String, enum: ['user', 'ai'], required: true },
  text: { type: String, required: true },
  criadoEm: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MensagemChat', MensagemChatSchema, 'mensagens_chat');
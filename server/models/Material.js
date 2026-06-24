const mongoose = require('mongoose');

const MaterialSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  tipo: { type: String, required: true },       // Ex: "PDF", "Áudio", "PPT"
  disciplina: { type: String, required: true },
  anoEscolar: { type: String },
  professor: { type: mongoose.Schema.Types.ObjectId, ref: 'Professor', required: true },
  criadoEm: { type: Date, default: Date.now },
  conteudoTexto: { type: String }    // Guarda o texto limpo extraído do PDF para o Gemini ler
});

module.exports = mongoose.model('Material', MaterialSchema, 'materiais');
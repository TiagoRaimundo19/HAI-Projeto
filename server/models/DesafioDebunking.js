const mongoose = require('mongoose');

const DesafioDebunkingSchema = new mongoose.Schema({
  professor: { type: mongoose.Schema.Types.ObjectId, ref: 'Professor', required: true },
  disciplina: { type: String, required: true },   // Ex: "MATEMATICA"
  anoEscolar: { type: String, required: true },   // Ex: "10º Ano"
  tema: { type: String, required: true },         // Ex: "Derivadas"
  ativo: { type: Boolean, default: true },
  criadoEm: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DesafioDebunking', DesafioDebunkingSchema, 'desafios_debunking');
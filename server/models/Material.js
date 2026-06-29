const mongoose = require('mongoose');

const MaterialSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  tipo: { type: String, required: true },       // Ex: "PDF", "Áudio", "PPT"
  disciplina: { type: String, required: true },
  anoEscolar: { type: String },
  professor: { type: mongoose.Schema.Types.ObjectId, ref: 'Professor', required: true },
  criadoEm: { type: Date, default: Date.now },
  conteudoTexto: { type: String },    // OLD SYSTEM: texto extraído do ficheiro

  // NEW SYSTEM: Cloudinary + Gemini File API
  publicUrl: { type: String, default: null },           // Link público para download
  cloudinaryPublicId: { type: String, default: null },  // ID para apagar do Cloudinary
  geminiFileUri: { type: String, default: null },        // URI para passar ao Gemini directamente
  geminiFileMimeType: { type: String, default: null },   // MIME type necessário com o URI
});

module.exports = mongoose.model('Material', MaterialSchema, 'materiais');
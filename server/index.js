const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const JSZip = require('jszip');
const multer = require('multer');
const pdfParse = require('pdf-parse/lib/pdf-parse.js'); 
const { GoogleGenAI } = require('@google/genai');

// CARREGA AS VARIÁVEIS DE AMBIENTE (.env) PRIMEIRO COISA DO FICHEIRO
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// =========================================================================
// 🗄️ MODELOS DA BASE DE DADOS
// =========================================================================
const Duvida = require('./models/Duvida'); 
const Professor = require('./models/Professor');
const Aluno = require('./models/Aluno');
const Material = require('./models/Material');
const TemaDificuldade = require('./models/TemaDificuldade');
const DesafioDebunking = require('./models/DesafioDebunking');
const TentativaDebunking = require('./models/TentativaDebunking');
const MensagemChat = require('./models/MensagemChat');
const FeedbackProfessor = require('./models/FeedbackProfessor');

// =========================================================================
// ⚙️ CONFIGURAÇÕES E INICIALIZAÇÃO DO SERVIDOR (CORRIGIDO!)
// =========================================================================
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// 🚀 RESTAURADO: Ativa o servidor para ouvir os pedidos na porta 5000
app.listen(PORT, () => {
  console.log(`🚀 Servidor a bombar na porta ${PORT}!`);
  console.log(`🌍 Testar no browser: http://localhost:${PORT}`);
});

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Conexão ao Banco de Dados Mongoose
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Conectado com sucesso ao MongoDB Atlas!'))
  .catch(err => console.error('❌ Erro ao ligar ao MongoDB:', err));

// =========================================================================
// 🛠️ FUNÇÕES HELPER E ARMAZENAMENTO DE FICHEIROS (MULTER)
// =========================================================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir); 
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = file.originalname.substring(file.originalname.lastIndexOf('.')).toLowerCase();
    const allowed = ['.pdf', '.pptx', '.mp3', '.wav'];
    if (!allowed.includes(ext)) {
      return cb(new Error('Tipo de ficheiro não suportado'), false);
    }
    cb(null, true);
  }
});

async function extrairTextoPPTX(filePath) {
  const data = fs.readFileSync(filePath);
  const zip = await JSZip.loadAsync(data);
  let texto = '';

  const slides = Object.keys(zip.files).filter(name =>
    name.startsWith('ppt/slides/slide') && name.endsWith('.xml')
  );

  for (const slide of slides) {
    const xml = await zip.files[slide].async('string');
    const matches = xml.match(/<a:t>(.*?)<\/a:t>/g);
    if (matches) {
      texto += matches.map(t => t.replace(/<[^>]+>/g, '')).join(' ');
      texto += '\n';
    }
  }
  return texto;
}

function calcularDataProximaAula(diaSemanaExtenso) {
  const dias = {
    "domingo": 0, "segunda-feira": 1, "terça-feira": 2,
    "quarta-feira": 3, "quinta-feira": 4, "sexta-feira": 5, "sábado": 6
  };
  
  const targetDay = dias[diaSemanaExtenso.toLowerCase()];
  if (targetDay === undefined) return new Date().toISOString().split('T')[0];

  const hoje = new Date();
  const resultado = new Date();
  let diasAteLa = (targetDay - hoje.getDay() + 7) % 7;
  resultado.setDate(hoje.getDate() + diasAteLa);
  
  return resultado.toISOString().split('T')[0]; 
}

// Rota raíz para teste rápido
app.get('/', (req, res) => {
  res.send('O servidor do projeto HAI está a correr!');
});

// =========================================================================
// 👨‍🏫 ROTAS: PROFESSOR (LOGIN, SIGNUP E GESTÃO)
// =========================================================================

app.post('/api/professores/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ erro: 'Email e palavra-passe são obrigatórios!' });

    const professor = await Professor.findOne({ email: email.toLowerCase() }).lean();
    if (!professor) return res.status(401).json({ erro: 'Esta conta de professor não existe!' });

    if (professor.palavraPasse !== password) return res.status(401).json({ erro: 'Palavra-passe incorreta!' });

    const estaConfigurado = !!(professor.disciplinas && professor.disciplinas.length > 0);
    res.status(200).json({
      mensagem: 'Autenticação feita com sucesso!',
      configurado: estaConfigurado, 
      professor: { id: professor._id, email: professor.email }
    });
  } catch (error) {
    res.status(500).json({ erro: 'Erro interno ao processar a autenticação.' });
  }
});

app.put('/api/professores/configurar/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, instituicao, disciplinas, anosEscolares, turmas } = req.body; 

    const professorAtualizado = await Professor.findByIdAndUpdate(id, { nome, instituicao, disciplinas, anosEscolares, turmas }, { new: true });
    if (!professorAtualizado) return res.status(404).json({ erro: 'Professor não encontrado!' });

    res.status(200).json({ mensagem: 'Perfil configurado com sucesso!', professor: professorAtualizado });
  } catch (error) {
    res.status(500).json({ erro: 'Erro interno ao salvar a configuração.' });
  }
});

app.get('/api/professores/perfil/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const professor = await Professor.findById(id);
    if (!professor) return res.status(404).json({ mensagem: 'Professor não encontrado' });
    res.json({ professor });
  } catch (error) {
    res.status(500).json({ mensagem: 'Erro interno do servidor' });
  }
});

app.get('/api/professores/:teacherId/alunos', async (req, res) => {
  try {
    const { teacherId } = req.params;
    const limparString = (str) => {
      if (!str || typeof str !== 'string') return '';
      return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
    };

    const professor = await Professor.findById(teacherId).lean();
    if (!professor) return res.status(404).json({ erro: 'Professor não encontrado!' });

    const disciplinasProfLimpas = (professor.disciplinas || []).map(d => limparString(d));
    const alunosDoProfessor = await Aluno.find({ professores: teacherId }).lean();

    const alunosFiltrados = alunosDoProfessor.map(aluno => {
      const apenasDisciplinasEmComum = (aluno.disciplinas || []).filter(discAluno => disciplinasProfLimpas.includes(limparString(discAluno)));
      return { ...aluno, disciplinas: apenasDisciplinasEmComum };
    });

    res.status(200).json({ students: alunosFiltrados });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao carregar lista de alunos filtrada.' });
  }
});

// =========================================================================
// 🎓 ROTAS: ALUNO (AUTENTICAÇÃO E PERFIL)
// =========================================================================

app.post('/api/alunos/registar', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ erro: 'Email e palavra-passe são obrigatórios!' });

    const alunoExiste = await Aluno.findOne({ email: email.toLowerCase() });
    if (alunoExiste) return res.status(400).json({ erro: 'Este email já está registado!' });

    const novoAluno = new Aluno({ email: email.toLowerCase(), palavraPasse: password });
    await novoAluno.save();

    res.status(201).json({ mensagem: 'Conta criada!', aluno: { id: novoAluno._id, email: novoAluno.email } });
  } catch (error) {
    res.status(500).json({ erro: 'Erro interno ao criar conta.' });
  }
});

app.post('/api/alunos/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ erro: 'Email e palavra-passe são obrigatórios!' });

    const aluno = await Aluno.findOne({ email: email.toLowerCase() }).lean();
    if (!aluno) return res.status(401).json({ erro: 'Esta conta de aluno não existe!' });

    if (aluno.palavraPasse !== password) return res.status(401).json({ erro: 'Palavra-passe incorreta!' });

    const estaConfigurado = !!(aluno.disciplinas && aluno.disciplinas.length > 0);
    res.status(200).json({ mensagem: 'Autenticação feita!', configurado: estaConfigurado, aluno: { id: aluno._id, email: aluno.email } });
  } catch (error) {
    res.status(500).json({ erro: 'Erro interno.' });
  }
});

app.put('/api/alunos/configurar/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, anoEscolar, instituicao, disciplinas } = req.body;

    const professoresCompativeis = await Professor.find({ instituicao: { $regex: instituicao, $options: 'i' }, anosEscolares: anoEscolar }).lean();

    let turmasExistentes = [];
    professoresCompativeis.forEach(prof => {
      if (prof.turmas && prof.turmas.length > 0) turmasExistentes.push(...prof.turmas);
    });
    turmasExistentes = [...new Set(turmasExistentes)];

    let turmaSorteada = turmasExistentes.length > 0 
      ? turmasExistentes[Math.floor(Math.random() * turmasExistentes.length)]
      : ['Turma A', 'Turma B'][Math.floor(Math.random() * 2)];

    const professoresDaTurma = professoresCompativeis.filter(prof => prof.turmas && prof.turmas.includes(turmaSorteada)).map(prof => prof._id);

    const alunoAtualizado = await Aluno.findByIdAndUpdate(id, { nome, anoEscolar, instituicao, disciplinas, turma: turmaSorteada, professores: professoresDaTurma }, { new: true }).lean();
    if (!alunoAtualizado) return res.status(404).json({ erro: 'Aluno não encontrado!' });

    res.status(200).json({ mensagem: `Configurado na ${turmaSorteada}.`, aluno: alunoAtualizado });
  } catch (error) {
    res.status(500).json({ erro: 'Erro interno.' });
  }
});

app.get('/api/alunos/perfil/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const aluno = await Aluno.findById(id).lean();
    if (!aluno) return res.status(404).json({ erro: 'Aluno não encontrado!' });
    res.status(200).json({ aluno });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao obter dados do perfil.' });
  }
});

// =========================================================================
// 📚 ROTAS: KNOWLEDGE VAULT (VAULT DO PROFESSOR & COFRE DOS SLIDES)
// =========================================================================

app.get('/api/professores/:teacherId/materiais', async (req, res) => {
  try {
    const { teacherId } = req.params;
    const materiais = await Material.find({ professor: teacherId }).sort({ criadoEm: -1 }).lean();
    res.status(200).json({ materiais });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao carregar o Knowledge Vault.' });
  }
});

app.post('/api/professores/:teacherId/materiais/upload', upload.single('pdf'), async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { nome, disciplina, anoEscolar } = req.body; 

    if (!req.file) return res.status(400).json({ erro: 'Por favor, seleciona um ficheiro aceitável!' });

    const ext = req.file.originalname.substring(req.file.originalname.lastIndexOf('.')).toLowerCase();
    let textoExtraido = '';
    let tipo = '';

    if (ext === '.pdf') {
      const dataBuffer = fs.readFileSync(req.file.path);
      const dadosPdf = await pdfParse(dataBuffer);
      textoExtraido = dadosPdf.text;
      tipo = 'PDF';
    } else if (ext === '.pptx') {
      textoExtraido = await extrairTextoPPTX(req.file.path);
      tipo = 'PPTX';
    } else if (ext === '.mp3' || ext === '.wav') {
      textoExtraido = 'Ficheiro de áudio multimédia registado.';
      tipo = 'Áudio';
    }

    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

    if ((ext === '.pdf' || ext === '.pptx') && (!textoExtraido || textoExtraido.trim().length < 20)) {
      return res.status(400).json({ erro: 'Não foi possível extrair texto do ficheiro.' });
    }

    const novoMaterial = new Material({ nome: nome || req.file.originalname, tipo, disciplina: disciplina ? disciplina.toUpperCase() : 'GERAL', anoEscolar, professor: teacherId, conteudoTexto: textoExtraido });
    novoMaterial.set('conteudoTexto', textoExtraido, { strict: false });
    novoMaterial.set('tipo', tipo, { strict: false });

    await novoMaterial.save();
    res.status(201).json({ mensagem: 'Material registado com sucesso!', material: novoMaterial });
  } catch (error) {
    res.status(500).json({ erro: 'Erro interno ao processar e guardar o ficheiro PDF.' });
  }
});

app.delete('/api/materiais/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Material.findByIdAndDelete(id);
    res.status(200).json({ mensagem: 'Material removido com sucesso!' });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao remover material.' });
  }
});

// =========================================================================
// 🔥 ROTAS: PRÉ-AULA (SINALIZAÇÃO DE DÚVIDAS E HEATMAP TÉRMICO)
// =========================================================================

app.post('/api/alunos/:studentId/sinalizar-dificuldade', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { tema, disciplina, diaSemana } = req.body; 

    if (!tema || !tema.trim()) return res.status(400).json({ erro: 'O tema não pode estar vazio!' });

    const dataAula = calcularDataProximaAula(diaSemana);
    const promptModeracao = `
      És um moderador de conteúdo académico extremamente estrito e intolerante a comportamentos infantis numa plataforma universitária.
      Analisa o seguinte tópico de dúvida submetido por um aluno:
      - Disciplina: "${disciplina}"
      - Tópico Submetido: "${tema}"

      REGRAS DE VALIDAÇÃO OBRIGATÓRIAS:
      1. Se o tópico contiver QUALQUER tipo de asneira, palavrão, insulto, calão vulgar ou referências sexuais/anatómicas explícitas, tens de marcar obrigatoriamente como "valido": false.
      2. Se o tópico for uma piada, spam, caracteres aleatórios (ex: "asdasd", "12345") ou completamente sem sentido para o contexto universitário de ${disciplina}, marca como "valido": false.
      3. Só deves marcar como "valido": true se o texto for um conceito de estudo real, uma dúvida legítima, um capítulo da matéria ou um termo técnico sério.

      Responde RIGOROSAMENTE apenas com um objeto JSON limpo (sem blocos de código markdown \`\`\`json):
      {
        "valido": false,
        "motivo": "Rejeitado: O termo inserido contém calão, linguagem ofensiva ou inadequada para o ambiente universitário."
      }
    `;

    let avaliacao;
    try {
      const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: promptModeracao });
      let textoResposta = response.text ? response.text.trim() : "{\"valido\":true}";
      textoResposta = textoResposta.replace(/```json/g, '').replace(/```/g, '').trim();
      avaliacao = JSON.parse(textoResposta);
    } catch (aiError) {
      avaliacao = { valido: true, motivo: "Filtro em fallback." };
    }

    if (avaliacao.valido === false || avaliacao.valido === "false") {
      return res.status(400).json({ erro: 'Tópico inválido!', detalhe: avaliacao.motivo });
    }

    const aluno = await Aluno.findById(studentId).lean();
    if (!aluno) return res.status(404).json({ erro: 'Aluno não encontrado!' });

    const professorId = aluno.professores && aluno.professores.length > 0 ? aluno.professores[0] : null;
    if (!professorId) return res.status(400).json({ erro: 'Ainda não tens um professor associado!' });

    const novoRegisto = new TemaDificuldade({ aluno: studentId, professor: professorId, tema: tema.trim(), disciplina, dataAula });
    await novoRegisto.save();
    
    return res.status(201).json({ mensagem: 'Dificuldade sinalizada!' });
  } catch (error) {
    return res.status(500).json({ erro: 'Erro interno.' });
  }
});

app.get('/api/alunos/:studentId/dificuldades-sinalizadas', async (req, res) => {
  try {
    const { studentId } = req.params;
    const registos = await TemaDificuldade.find({ aluno: studentId }).lean();
    return res.status(200).json({ registos });
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao carregar dúvidas.' });
  }
});

app.get('/api/professores/:teacherId/heatmap', async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { disciplina, anoEscolar, dataAula } = req.query;

    if (!disciplina || !anoEscolar || !dataAula) return res.status(400).json({ erro: 'Filtros incompletos!' });

    const registos = await TemaDificuldade.find({ professor: teacherId, disciplina: disciplina.toUpperCase(), dataAula }).populate('aluno').lean();
    const registosFiltrados = registos.filter(reg => reg.aluno && reg.aluno.anoEscolar === anoEscolar);

    const contagemPorTema = registosFiltrados.reduce((acc, curr) => {
      const temaNome = curr.tema || "Geral";
      acc[temaNome] = (acc[temaNome] || 0) + 1;
      return acc;
    }, {});

    const heatmapData = Object.keys(contagemPorTema).map(temaName => {
      const qts = contagemPorTema[temaName];
      let nivelCalculado = 1;
      if (qts > 15) nivelCalculado = 5;
      else if (qts > 10) nivelCalculado = 4;
      else if (qts > 5) nivelCalculado = 3;
      else if (qts > 2) nivelCalculado = 2;

      return { name: temaName, questions: qts, level: nivelCalculado };
    });

    heatmapData.sort((a, b) => b.questions - a.questions);
    return res.status(200).json({ heatmap: heatmapData });
  } catch (error) {
    return res.status(500).json({ erro: 'Erro interno.' });
  }
});

// =========================================================================
// 🎯 ROTAS: DEBUNKING (ARENA DE DESAFIOS LANÇADOS PELO PROFESSOR)
// =========================================================================

app.post('/api/professores/:teacherId/debunking/lancar', async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { disciplina, anoEscolar, tema } = req.body;

    if (!disciplina || !anoEscolar || !tema || !tema.trim()) return res.status(400).json({ erro: 'Campos em falta!' });

    await DesafioDebunking.updateMany({ professor: teacherId, disciplina: disciplina.toUpperCase(), anoEscolar }, { ativo: false });

    const novoDesafio = new DesafioDebunking({ professor: teacherId, disciplina: disciplina.toUpperCase(), anoEscolar, tema: tema.trim(), ativo: true });
    await novoDesafio.save();
    
    return res.status(201).json({ mensagem: 'Desafio ativo!', desafio: novoDesafio });
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao registar o desafio.' });
  }
});

app.get('/api/professores/:teacherId/debunking/relatorio', async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { disciplina, anoEscolar } = req.query;

    const desafioAtivo = await DesafioDebunking.findOne({ professor: teacherId, disciplina: disciplina.toUpperCase(), anoEscolar, ativo: true }).lean();
    const temaAlvo = desafioAtivo ? desafioAtivo.tema : null;

    if (!temaAlvo) return res.status(200).json({ temaAtivo: null, summary: { totalSucesso: 0, totalReforco: 0, taxa: 0 }, results: [] });

    const tentativas = await TentativaDebunking.find({ professor: teacherId, disciplina: disciplina.toUpperCase(), anoEscolar, tema: temaAlvo }).populate('aluno', 'nome email').sort({ criadoEm: -1 }).lean();

    const totalSucesso = tentativas.filter(t => t.success).length;
    const totalReforco = tentativas.filter(t => !t.success).length;
    const taxaSucesso = tentativas.length > 0 ? Math.round((totalSucesso / tentativas.length) * 100) : 0;

    const resultadosFormatados = tentativas.map(t => ({ id: t._id, student: t.aluno ? t.aluno.nome : "Estudante Anónimo", topic: t.tema, errorsFound: t.errorsFound, totalErrors: t.totalErrors, success: t.success }));

    return res.status(200).json({ temaAtivo: temaAlvo, summary: { totalSucesso, totalReforco, taxa: taxaSucesso }, results: resultadosFormatados });
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao compilar dados do relatório.' });
  }
});

app.get('/api/alunos/:studentId/debunking/desafio', async (req, res) => {
  try {
    const { studentId } = req.params;
    const aluno = await Aluno.findById(studentId).lean();
    if (!aluno) return res.status(404).json({ erro: 'Aluno não encontrado.' });

    const desafio = await DesafioDebunking.findOne({ anoEscolar: aluno.anoEscolar, ativo: true }).sort({ criadoEm: -1 }).lean();
    if (!desafio) return res.status(200).json({ desafio: null });

    const bibliotecaDeTemas = {
      "DERIVADAS": [
        { id: 1, texto: "A derivada de uma função f(x) = x² é 2x.", incorreta: false },
        { id: 2, texto: "Isto acontece porque quando aplicamos a regra da potência, multiplicamos o expoente pela base e subtraímos 1 ao expoente.", incorreta: false },
        { id: 3, texto: "Portanto, temos 2 × x²⁻¹ = 2x.", incorreta: false },
        { id: 4, texto: "A derivada também pode ser interpretada como a área sob a curva da função original.", incorreta: true }, 
        { id: 5, texto: "Se uma função possui uma descontinuidade num ponto isolado, ela é obrigatoriamente derivável nesse ponto.", incorreta: true }, 
        { id: 6, texto: "A derivada de uma constante isolada resulta sempre no valor da própria constante original.", incorreta: true } 
      ]
    };

    let frasesCompletas = bibliotecaDeTemas[desafio.tema.toUpperCase()] || [
      { id: 1, texto: `O cálculo de ${desafio.tema} serve para inverter matrizes nulas.`, incorreta: true },
      { id: 2, texto: `É possível aplicar os teoremas fundamentais de ${desafio.tema} em problemas científicos.`, incorreta: false },
      { id: 3, texto: "Todos os limites laterais tendem ao infinito por definição padrão.", incorreta: true }
    ];

    return res.status(200).json({ desafioId: desafio._id, tema: desafio.tema, disciplina: desafio.disciplina, frases: frasesCompletas.map(f => ({ id: f.id, texto: f.texto })) });
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao carregar o desafio.' });
  }
});

app.post('/api/alunos/:studentId/debunking/submeter', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { desafioId, respostasSelecionadas } = req.body;

    const aluno = await Aluno.findById(studentId).lean();
    const desafio = await DesafioDebunking.findById(desafioId).lean();
    if (!aluno || !desafio) return res.status(404).json({ erro: 'Dados não localizados.' });

    let idsFalsosReais = desafio.tema.toUpperCase() === "DERIVADAS" ? [4, 5, 6] : [1, 3, 4];
    const errosApanhados = respostasSelecionadas.filter(id => idsFalsosReais.includes(id)).length;
    const sucessoTotal = errosApanhados === idsFalsosReais.length;

    const novaTentativa = new TentativaDebunking({ aluno: studentId, professor: desafio.professor, disciplina: desafio.disciplina, anoEscolar: aluno.anoEscolar, tema: desafio.tema, errorsFound: errosApanhados, totalErrors: idsFalsosReais.length, success: sucessoTotal });
    await novaTentativa.save();

    return res.status(200).json({ errorsFound: errosApanhados, totalErrors: idsFalsosReais.length, success: sucessoTotal });
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao computar resposta.' });
  }
});

// =========================================================================
// 🤖 ROTAS: BOT DE ESTUDO CONTEXTUAL (ÚNICAS E COM HISTÓRICO EM BASE DE DADOS)
// =========================================================================

// 🔄 ROTA GET: Carrega o rolo histórico antigo para preencher a janela do Chat do Aluno
app.get('/api/alunos/:studentId/chat/historico', async (req, res) => {
  try {
    const { studentId } = req.params;
    const historico = await MensagemChat.find({ aluno: studentId }).sort({ criadoEm: 1 }).lean();
    return res.status(200).json({ historico });
  } catch (error) {
    console.error('Erro ao carregar histórico de chat:', error);
    return res.status(500).json({ erro: 'Erro ao carregar o histórico de mensagens.' });
  }
});

// 🚀 ROTA POST ÚNICA: Trata da pergunta, consulta o Vault do professor (RAG) e PERSISTE na BD!
app.post('/api/alunos/:studentId/chat', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { message, mensagem } = req.body;
    
    // Suporta ambos os formatos de body para evitar quebras no Postman ou Frontend
    const perguntaTexto = mensagem || message;

    if (!perguntaTexto || !perguntaTexto.trim()) {
      return res.status(400).json({ erro: 'A mensagem enviada está vazia.' });
    }

    // 1. Localiza o aluno e as suas disciplinas inscritas
    const aluno = await Aluno.findById(studentId).lean();
    if (!aluno) return res.status(404).json({ erro: 'Estudante não localizado.' });

    // 💾 2. GUARDA IMEDIATAMENTE A PERGUNTA REAL DO ALUNO NO HISTÓRICO
    const novaMsgUser = new MensagemChat({ aluno: studentId, sender: 'user', text: perguntaTexto.trim() });
    await novaMsgUser.save();

    // 3. PIPELINE RAG: Puxa todos os materiais do ano letivo que pertençam às disciplinas do aluno
    const disciplinasALunoMaiusculas = (aluno.disciplinas || []).map(d => d.toUpperCase());
    const materiaisDisponiveis = await Material.find({
      anoEscolar: aluno.anoEscolar,
      disciplina: { $in: disciplinasALunoMaiusculas }
    }).lean();

    // Juntar o texto de todos os PDFs/PPTXs num bloco de contexto para a IA ler
    let contextoFicheiros = "";
    let fontesUtilizadas = [];

    materiaisDisponiveis.forEach(mat => {
      contextoFicheiros += `--- FICHEIRO: "${mat.nome}" | DISCIPLINA: ${mat.disciplina} ---\n`;
      contextoFicheiros += `${mat.conteudoTexto}\n`;
      contextoFicheiros += `--------------------------------------------------\n\n`;
      fontesUtilizadas.push(mat.nome);
    });

    // 4. CONFIGURAÇÃO DAS INSTRUÇÕES DO SISTEMA PARA O GEMINI
    const promptSistema = `
      És o Co-Piloto de Estudo Contextual do aluno ${aluno.nome}, que frequenta o ${aluno.anoEscolar}.
      As disciplinas oficiais que ele frequenta são: ${aluno.disciplinas.join(', ')}.

      Aqui tens o conteúdo textual extraído do Knowledge Vault (ficheiros que o professor carregou para este aluno):
      ${contextoFicheiros || "NENHUM DOCUMENTO CARREGADO ATÉ AO MOMENTO."}

      REGRAS DE RESPOSTA ESTRITAS:
      1. Responde de forma clara, amigável e direta em Português de Portugal.
      2. Mapeamento Semântico: Se o aluno perguntar sobre um conceito (ex: "programação", "código", "loops"), tu deves associar isso inteligentemente à disciplina correspondente (INFORMATICA).
      3. Se existirem materiais sobre esse tema no Knowledge Vault acima, responde à dúvida baseando-te estritamente neles e cita amigavelmente o nome do ficheiro que usaste.
      4. Se o aluno perguntar por um tema de uma cadeira que ele está inscrito (ex: MATEMATICA ou INFORMATICA) mas NÃO houver qualquer documento carregado ou informação útil sobre isso no texto fornecido, deves responder EXATAMENTE com esta estrutura:
         "Olá! Analisei o Knowledge Vault, mas ainda não tenho os documentos para a cadeira de [NOME_DA_CADEIRA] referente ao [ANO_ESCOLAR]."
         (Substitui [NOME_DA_CADEIRA] pela cadeira em maiúsculas e [ANO_ESCOLAR] por ${aluno.anoEscolar}).
      5. Se for uma pergunta vaga ou sobre algo fora das suas cadeiras e não houver materiais, responde exatamente:
         "Olá! Analisei o Knowledge Vault, mas ainda não tenho os documentos para tal referente ao ${aluno.anoEscolar}."
    `;

    console.log(`🤖 [GEMINI RAG] A enviar contexto ao Gemini 2.5 Flash para o aluno ${aluno.nome}...`);

    // 5. CHAMADA REAL À API DO GEMINI
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: perguntaTexto.trim(),
      config: {
        systemInstruction: promptSistema
      }
    });

    const respostaIA = response.text ? response.text.trim() : `Olá! Analisei o Knowledge Vault, mas ainda não tenho os documentos para tal referente ao ${aluno.anoEscolar}.`;

    // 💾 6. PERSISTE A RESPOSTA GERADA PELA IA REAL NO HISTÓRICO DA BD
    const novaMsgAI = new MensagemChat({ aluno: studentId, sender: 'ai', text: respostaIA });
    await novaMsgAI.save();

    return res.status(200).json({ resposta: respostaIA, fontes: fontesUtilizadas });

  } catch (error) {
    console.error('❌ Erro no processamento do Chat com Gemini:', error);
    return res.status(500).json({ erro: 'Erro interno no motor do assistente virtual.' });
  }
});
// =========================================================================
// ANTIGO ENDPOINT META 3 (COMPATIBILIDADE GERAL DE TESTE SIMPLES)
// =========================================================================
app.post('/api/duvidas', async (req, res) => {
  try {
    const { pergunta } = req.body;
    if (!pergunta) return res.status(400).json({ erro: 'A pergunta não pode estar vazia!' });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: pergunta,
      config: { systemInstruction: "Responde de forma clara, amigável e direta em português de Portugal." }
    });

    const novaDuvida = new Duvida({ pergunta, respostaGemini: response.text });
    await novaDuvida.save();
    res.status(201).json(novaDuvida);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao processar com a IA.' });
  }
});


// =========================================================================
// 📢 MÓDULO: CENTRO DE FEEDBACK (PAINEL DO STOR -> ECOSSISTEMA DO ALUNO)
// =========================================================================

// ROTA POST: O professor submete o feedback direcionado para a próxima aula de uma disciplina
app.post('/api/professores/:teacherId/feedback/enviar', async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { alunoId, disciplina, mensagem, diaSemana } = req.body;

    // Validação de segurança básica dos dados do formulário da image_3cd3fe.png
    if (!alunoId || !disciplina || !mensagem || !mensagem.trim() || !diaSemana) {
      return res.status(400).json({ erro: 'Campos obrigatórios em falta (Aluno, Disciplina, Mensagem ou Dia da Aula).' });
    }

    // Calcula a data exata da próxima aula (ex: "2026-06-29") para servir de deadline ao feedback
    const dataAulaAlvo = calcularDataProximaAula(diaSemana);

    const novoFeedback = new FeedbackProfessor({
      professor: teacherId,
      aluno: alunoId,
      disciplina: disciplina.toUpperCase(),
      mensagem: mensagem.trim(),
      dataAula: dataAulaAlvo
    });

    await novoFeedback.save();
    console.log(`📢 [FEEDBACK CRUCIAL] Stor ${teacherId} enviou nota pedagógica a ${alunoId} para a aula de ${dataAulaAlvo}`);

    return res.status(201).json({ mensagem: 'Feedback pedagógico enviado com sucesso!', feedback: novoFeedback });
  } catch (error) {
    console.error('❌ Erro ao submeter feedback do professor:', error);
    return res.status(500).json({ erro: 'Erro interno ao processar e salvar o feedback.' });
  }
});

// ROTA GET: O aluno vai buscar todos os conselhos deixados pelos seus professores para a próxima aula
app.get('/api/alunos/:studentId/feedback/listar', async (req, res) => {
  try {
    const { studentId } = req.params;
    const hoje = new Date().toISOString().split('T')[0];

    // Procura os feedbacks válidos cujo dia da aula associado ainda seja igual ou superior à data de hoje
    const feedbacksAtivos = await FeedbackProfessor.find({
      aluno: studentId,
      dataAula: { $gte: hoje }
    })
    .populate('professor', 'nome')
    .sort({ criadoEm: -1 })
    .lean();

    return res.status(200).json({ feedbacks: feedbacksAtivos });
  } catch (error) {
    console.error('❌ Erro ao listar feedbacks para o aluno:', error);
    return res.status(500).json({ erro: 'Erro ao carregar o seu dossiê de feedbacks.' });
  }
});
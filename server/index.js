const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// OBJETOS DA BASE DE DADOS DEFINIDOS
const Duvida = require('./models/Duvida'); 
const Professor = require('./models/Professor');
const Aluno = require('./models/Aluno');
const Material = require('./models/Material');
const TemaDificuldade = require('./models/TemaDificuldade');
const DesafioDebunking = require('./models/DesafioDebunking');
const TentativaDebunking = require('./models/TentativaDebunking');

const { GoogleGenAI } = require('@google/genai');

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor a bombar na porta ${PORT}!`);
  console.log(`🌍 Testar no browser: http://localhost:${PORT}`);
});

app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Conectado com sucesso ao MongoDB Atlas!'))
  .catch(err => console.error('❌ Erro ao ligar ao MongoDB:', err));

app.get('/', (req, res) => {
  res.send('O servidor do projeto HAI está a correr!');
});



// ==========================================
// Meta 3: Rota com Integração do Gemini e BD
// ==========================================


// ==========================================
// DÚVIDAS
// ==========================================
app.post('/api/duvidas', async (req, res) => {
  try {
    const { pergunta } = req.body;

    if (!pergunta) {
      return res.status(400).json({ erro: 'A pergunta não pode estar vazia!' });
    }

    console.log(`🤖 A enviar pergunta ao Gemini: "${pergunta}"`);

    // Chamar a API do Gemini 
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: pergunta,
      // Opcional: Podes dar instruções ao modelo para ele agir como um tutor académico
      config: {
        systemInstruction: "Responde de forma clara, amigável e direta em português de Portugal. Não te alargues muito na resposta."
      }
    });

    // Extrair o texto da resposta gerada pela IA
    const textoResposta = response.text;

    // Criar o documento para o MongoDB com a pergunta real e a resposta da IA
    const novaDuvida = new Duvida({
      pergunta: pergunta,
      respostaGemini: textoResposta
    });

    // Gravar tudo no MongoDB Atlas
    const duvidaGuardada = await novaDuvida.save();

    // Devolve o resultado final para quem fez o pedido
    res.status(201).json(duvidaGuardada);

  } catch (error) {
    console.error('❌ Erro no processo do Gemini/BD:', error);
    res.status(500).json({ erro: 'Erro ao processar a tua dúvida com a IA.' });
  }
});



// ==========================================
// PROFESSOR
// ==========================================

app.post('/api/professores/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ erro: 'Email e palavra-passe são obrigatórios!' });
    }

    // O .lean() garante que o 'professor' vem como um objeto JS puro e limpo
    const professor = await Professor.findOne({ email: email.toLowerCase() }).lean();

    // Se não existir, dá ERRO. Não cria nada!
    if (!professor) {
      return res.status(401).json({ erro: 'Esta conta de professor não existe!' });
    }

    // Valida se a password coincide
    if (professor.palavraPasse !== password) {
      return res.status(401).json({ erro: 'Palavra-passe incorreta!' });
    }

    // Se o array existir e tiver elementos, dá true. Caso contrário, dá false.
    const estaConfigurado = !!(professor.disciplinas && professor.disciplinas.length > 0);

    console.log(`📊 Professor: ${email} | Está configurado? ${estaConfigurado}`);

    res.status(200).json({
      mensagem: 'Autenticação feita com sucesso!',
      configurado: estaConfigurado, 
      professor: {
        id: professor._id,
        email: professor.email
      }
    });

  } catch (error) {
    console.error('❌ Erro na autenticação do professor:', error);
    res.status(500).json({ erro: 'Erro interno ao processar a autenticação.' });
  }
});

app.put('/api/professores/configurar/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Extrai também os anos escolares e as turmas dinâmicas vindas do frontend
    const { nome, instituicao, disciplinas, anosEscolares, turmas } = req.body; 

    const professorAtualizado = await Professor.findByIdAndUpdate(
      id,
      { 
        nome: nome, 
        instituicao: instituicao, 
        disciplinas: disciplinas,
        anosEscolares: anosEscolares, // Atualiza na BD
        turmas: turmas                 // Atualiza na BD
      },
      { new: true }
    );

    if (!professorAtualizado) {
      return res.status(404).json({ erro: 'Professor não encontrado!' });
    }

    res.status(200).json({
      mensagem: 'Perfil e turmas configurados com sucesso!',
      professor: professorAtualizado
    });

  } catch (error) {
    console.error('❌ Erro ao configurar professor:', error);
    res.status(500).json({ erro: 'Erro interno ao salvar a configuração.' });
  }
});


app.get('/api/professores/perfil/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const professor = await Professor.findById(id);

    // Se o professor não existir na base de dados
    if (!professor) {
      return res.status(404).json({ mensagem: 'Professor não encontrado' });
    }

    // Envia a resposta no formato exato que o frontend vai ler: data.professor
    res.json({ professor });

  } catch (error) {
    console.error('Erro ao ir buscar perfil do professor:', error);
    res.status(500).json({ mensagem: 'Erro interno do servidor' });
  }
});


// Rota para o professor ver apenas os alunos que o têm na lista de professores
app.get('/api/professores/:teacherId/alunos', async (req, res) => {
  try {
    const { teacherId } = req.params;

    // 💡 Função de limpeza isolada dentro da rota para evitar erros de referência
    const limparString = (str) => {
      if (!str || typeof str !== 'string') return '';
      return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
    };

    // 1. Vai buscar o perfil do professor logado
    const professor = await Professor.findById(teacherId).lean();
    if (!professor) {
      return res.status(404).json({ erro: 'Professor não encontrado!' });
    }

    // Normaliza as disciplinas do professor
    const disciplinasProfLimpas = (professor.disciplinas || []).map(d => limparString(d));

    // 2. Procura os alunos associados a este professor
    const alunosDoProfessor = await Aluno.find({ professores: teacherId }).lean();

    // 3. Cruza as disciplinas
    const alunosFiltrados = alunosDoProfessor.map(aluno => {
      const apenasDisciplinasEmComum = (aluno.disciplinas || []).filter(discAluno => {
        return disciplinasProfLimpas.includes(limparString(discAluno));
      });

      return {
        ...aluno,
        disciplinas: apenasDisciplinasEmComum
      };
    });

    res.status(200).json({ students: alunosFiltrados });

  } catch (error) {
    // Isto vai imprimir o culpado exato no terminal do teu VS Code/Node
    console.error('❌ Erro real no processamento:', error);
    res.status(500).json({ erro: 'Erro ao carregar lista de alunos filtrada.' });
  }
});


// ==========================================
// ALUNO
// ==========================================

app.post('/api/alunos/registar', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ erro: 'Email e palavra-passe são obrigatórios!' });
    }

    // Verifica se já existe um aluno com este email
    const alunoExiste = await Aluno.findOne({ email: email.toLowerCase() });
    if (alunoExiste) {
      return res.status(400).json({ erro: 'Este email já está registado!' });
    }

    // Cria o aluno apenas com as credenciais base
    // Os restantes campos (nome, disciplinas) assumem os defaults ('', []) do Schema
    const novoAluno = new Aluno({
      email: email.toLowerCase(),
      palavraPasse: password
    });

    await novoAluno.save();

    console.log(`✨ Nova conta base de aluno criada para teste: ${email}`);

    res.status(201).json({
      mensagem: 'Conta de aluno criada com sucesso! Pronta para ser configurada no primeiro login.',
      aluno: {
        id: novoAluno._id,
        email: novoAluno.email
      }
    });

  } catch (error) {
    console.error('❌ Erro ao registar aluno:', error);
    res.status(500).json({ erro: 'Erro interno ao criar conta de aluno.' });
  }
});


app.post('/api/alunos/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ erro: 'Email e palavra-passe são obrigatórios!' });
    }

    const aluno = await Aluno.findOne({ email: email.toLowerCase() }).lean();

    // Se não existir na BD, dá erro!
    if (!aluno) {
      return res.status(401).json({ erro: 'Esta conta de aluno não existe!' });
    }

    // Valida a password
    if (aluno.palavraPasse !== password) {
      return res.status(401).json({ erro: 'Palavra-passe incorreta!' });
    }

    // Verifica se já fez o setup (se tem disciplinas)
    const estaConfigurado = !!(aluno.disciplinas && aluno.disciplinas.length > 0);

    console.log(`📊 Aluno: ${email} | Está configurado? ${estaConfigurado}`);

    res.status(200).json({
      mensagem: 'Autenticação feita com sucesso!',
      configurado: estaConfigurado,
      aluno: {
        id: aluno._id,
        email: aluno.email
      }
    });

  } catch (error) {
    console.error('❌ Erro na autenticação do aluno:', error);
    res.status(500).json({ erro: 'Erro interno ao processar a autenticação.' });
  }
});


app.put('/api/alunos/configurar/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, anoEscolar, instituicao, disciplinas } = req.body;

    console.log("\n================🕵️‍♂️ DETETIVE DE BUG 🕵️‍♂️================");
    
    // TESTE 1: O Mongoose consegue ler QUALQUER professor?
    const todosOsProfessores = await Professor.find({}).lean();
    console.log(`1. Total de professores registados na BD: ${todosOsProfessores.length}`);
    if (todosOsProfessores.length > 0) {
      console.log("-> Dados do primeiro professor encontrado:", {
        instituicao: todosOsProfessores[0].instituicao,
        anosEscolares: todosOsProfessores[0].anosEscolares
      });
    }

    // 2. Query otimizada (filtros diretos sem a rigidez dos âncoras do Regex)
    const professoresCompativeis = await Professor.find({
      instituicao: { $regex: instituicao, $options: 'i' }, // Mais flexível com acentuação/maiusculas
      anosEscolares: anoEscolar // O Mongo procura automaticamente dentro do array
    }).lean();

    console.log(`2. Professores que passaram no filtro da rota: ${professoresCompativeis.length}`);
    console.log("==================================================\n");

    // --- Daqui para baixo o teu código corre igual ---
    let turmasExistentes = [];
    professoresCompativeis.forEach(prof => {
      if (prof.turmas && prof.turmas.length > 0) {
        turmasExistentes.push(...prof.turmas);
      }
    });
    turmasExistentes = [...new Set(turmasExistentes)];

    let turmaSorteada = '';
    if (turmasExistentes.length > 0) {
      turmaSorteada = turmasExistentes[Math.floor(Math.random() * turmasExistentes.length)];
    } else {
      const fallbacks = ['Turma A', 'Turma B'];
      turmaSorteada = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }

    const professoresDaTurma = professoresCompativeis
      .filter(prof => prof.turmas && prof.turmas.includes(turmaSorteada))
      .map(prof => prof._id);

    const alunoAtualizado = await Aluno.findByIdAndUpdate(
      id,
      { 
        nome, anoEscolar, instituicao, disciplinas,
        turma: turmaSorteada,
        professores: professoresDaTurma 
      },
      { new: true }
    ).lean();

    if (!alunoAtualizado) return res.status(404).json({ erro: 'Aluno não encontrado!' });

    res.status(200).json({
      mensagem: `Perfil configurado com sucesso! Ficaste na ${turmaSorteada}.`,
      aluno: alunoAtualizado
    });

  } catch (error) {
    console.error('❌ Erro:', error);
    res.status(500).json({ erro: 'Erro interno.' });
  }
});


app.get('/api/alunos/perfil/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Procura o aluno na BD de forma leve 
    const aluno = await Aluno.findById(id).lean();

    if (!aluno) {
      return res.status(404).json({ erro: 'Aluno não encontrado!' });
    }

    // Devolve os dados do aluno (incluindo o nome e a turma)
    res.status(200).json({ aluno });

  } catch (error) {
    console.error('❌ Erro ao obter perfil do aluno:', error);
    res.status(500).json({ erro: 'Erro interno ao obter dados do perfil.' });
  }
});


// ==========================================
// MATERIAL
// ==========================================

// Rota para listar materiais de um professor específico
app.get('/api/professores/:teacherId/materiais', async (req, res) => {
  try {
    const { teacherId } = req.params;
    const materiais = await Material.find({ professor: teacherId }).sort({ criadoEm: -1 }).lean();
    res.status(200).json({ materiais });
  } catch (error) {
    console.error('Erro ao buscar materiais:', error);
    res.status(500).json({ erro: 'Erro ao carregar o Knowledge Vault.' });
  }
});

// Rota para registar um novo material (Upload)
app.post('/api/professores/:teacherId/materiais', async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { nome, tipo, disciplina } = req.body;

    const novoMaterial = new Material({
      nome,
      tipo,
      disciplina,
      professor: teacherId
    });

    await novoMaterial.save();
    res.status(201).json({ mensagem: 'Material registado com sucesso!', material: novoMaterial });
  } catch (error) {
    console.error('Erro ao registar material:', error);
    res.status(500).json({ erro: 'Erro ao guardar material.' });
  }
});

// Rota para apagar um material
app.delete('/api/materiais/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Material.findByIdAndDelete(id);
    res.status(200).json({ mensagem: 'Material removido com sucesso!' });
  } catch (error) {
    console.error('Erro ao apagar material:', error);
    res.status(500).json({ erro: 'Erro ao remover material.' });
  }
});




// =========================================================================
// 🗓️ 1. FUNÇÃO HELPER: CALCULA A DATA DA PRÓXIMA AULA (YYYY-MM-DD)
// =========================================================================
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
  
  return resultado.toISOString().split('T')[0]; // Retorna "2026-06-29"
}

// =========================================================================
// 🚀 2. ROTA POST: COM FILTRO GEMINI + CARIMBO DE DATA DA AULA
// =========================================================================
app.post('/api/alunos/:studentId/sinalizar-dificuldade', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { tema, disciplina, diaSemana } = req.body; 

    if (!tema || !tema.trim()) {
      return res.status(400).json({ erro: 'O tema não pode estar vazio!' });
    }

    // Calcula a data da aula alvo para esta dúvida
    const dataAula = calcularDataProximaAula(diaSemana);

    const promptModeracao = `
      Analisa o seguinte tópico de dúvida submetido por um estudante.
      Disciplina: "${disciplina}"
      Tópico Submetido: "${tema}"

      O teu objetivo é avaliar se este tópico é um assunto académico legítimo, sério e aceitável para o contexto escolar/universitário da disciplina indicada. 
      Se for uma piada, asneira, spam, algo ofensivo ou totalmente sem sentido, deves marcar como inválido.

      Responde RIGOROSAMENTE apenas com um objeto JSON no seguinte formato:
      {
        "valido": true,
        "motivo": "Breve frase justificando a decisão em português de Portugal"
      }
      
      Não adiciones blocos de código markdown como \`\`\`json. Devolve apenas o texto puro do objeto JSON.
    `;

    let avaliacao;

    try {
      console.log(`🤖 A enviar tema ao filtro do Gemini: "${tema}" (${disciplina})`);

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: promptModeracao,
      });

      let textoResposta = response.text ? response.text.trim() : "";
      textoResposta = textoResposta.replace(/```json/g, '').replace(/```/g, '').trim();
      
      avaliacao = JSON.parse(textoResposta);

    } catch (aiError) {
      console.error('⚠️ Gemini indisponível temporariamente. Modo Fallback Ativado.');
      avaliacao = { valido: true, motivo: "Filtro temporariamente desativado por instabilidade externa." };
    }

    if (avaliacao.valido === false || avaliacao.valido === "false") {
      console.log(`🛑 Filtro IA: Bloqueado por ser brincadeira: "${tema}". Motivo: ${avaliacao.motivo}`);
      return res.status(400).json({ 
        erro: 'Tópico inválido!', 
        detalhe: avaliacao.motivo || 'Por favor, insere um tema académico sério.' 
      });
    }

    const aluno = await Aluno.findById(studentId).lean();
    if (!aluno) return res.status(404).json({ erro: 'Aluno não encontrado!' });

    const professorId = aluno.professores && aluno.professores.length > 0 ? aluno.professores[0] : null;
    if (!professorId) {
      return res.status(400).json({ erro: 'Ainda não tens um professor associado para reportar dúvidas!' });
    }

    const novoRegisto = new TemaDificuldade({
      aluno: studentId,
      professor: professorId,
      tema: tema.trim(),
      disciplina: disciplina,
      dataAula: dataAula // Gravado com o dia da aula!
    });

    console.log("🔮 OBJETO ANTES DE GRAVAR NO MONGO:", novoRegisto.toObject());

    await novoRegisto.save();
    
    console.log(`✅ Tema "${tema}" processado com sucesso para a aula de ${dataAula}!`);
    return res.status(201).json({ mensagem: 'Dificuldade sinalizada com sucesso!' });

  } catch (error) {
    console.error('❌ Erro crítico fatal na rota POST:', error);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
});

// =========================================================================
// 🔄 3. ROTA GET: CARREGA O HISTÓRICO GUARDADO DO ALUNO
// =========================================================================
app.get('/api/alunos/:studentId/dificuldades-sinalizadas', async (req, res) => {
  try {
    const { studentId } = req.params;

    // Vai buscar todas as sinalizações antigas deste aluno no MongoDB
    const registos = await TemaDificuldade.find({ aluno: studentId }).lean();
    
    return res.status(200).json({ registos });
  } catch (error) {
    console.error('❌ Erro na rota GET de dificuldades:', error);
    return res.status(500).json({ erro: 'Erro ao carregar estado das dúvidas.' });
  }
});





// =========================================================================
// 📚 MATERIAL (COM SUPORTE A UPLOAD REAL E EXTRAÇÃO DE PDF)
// =========================================================================
const JSZip = require('jszip');
const xml2js = require('xml2js');

async function extrairTextoPPTX(filePath) {
  const data = fs.readFileSync(filePath);
  const zip = await JSZip.loadAsync(data);
  let texto = '';

  const slides = Object.keys(zip.files)
    .filter(name =>
      name.startsWith('ppt/slides/slide') &&
      name.endsWith('.xml')
    );

  for (const slide of slides) {
    const xml = await zip.files[slide].async('string');
    const matches = xml.match(/<a:t>(.*?)<\/a:t>/g);

    if (matches) {
      texto += matches
        .map(t => t.replace(/<[^>]+>/g, ''))
        .join(' ');
      texto += '\n';
    }
  }
  return texto;
}

const multer = require('multer');
const fs = require('fs');
// Usamos o caminho direto para evitar o conflito de funções da v2 do pdf-parse
const pdfParse = require('pdf-parse/lib/pdf-parse.js'); 

// 1. Configurar o armazenamento dos ficheiros PDF em disco
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir); // Cria a pasta uploads se não existir
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // Captura a extensão de forma síncrona e segura
    const ext = file.originalname.substring(file.originalname.lastIndexOf('.')).toLowerCase();
    const allowed = ['.pdf', '.pptx', '.mp3', '.wav'];

    if (!allowed.includes(ext)) {
      return cb(new Error('Tipo de ficheiro não suportado'), false);
    }

    cb(null, true);
  }
});

// Rota para listar materiais de um professor específico (Knowledge Vault)
app.get('/api/professores/:teacherId/materiais', async (req, res) => {
  try {
    const { teacherId } = req.params;
    const materiais = await Material.find({ professor: teacherId }).sort({ criadoEm: -1 }).lean();
    res.status(200).json({ materiais });
  } catch (error) {
    console.error('Erro ao buscar materiais:', error);
    res.status(500).json({ erro: 'Erro ao carregar o Knowledge Vault.' });
  }
});

// 🚀 Rota POST Unificada: Alinhada para 'pdf' para evitar o Unexpected field
app.post('/api/professores/:teacherId/materiais/upload', upload.single('pdf'), async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { nome, disciplina, anoEscolar } = req.body; 

    if (!req.file) {
      return res.status(400).json({ erro: 'Por favor, seleciona um ficheiro aceitável!' });
    }

    console.log(`📂 Ficheiro recebido do Professor ${teacherId}: ${req.file.originalname}. A extrair texto...`);

    // Captura a extensão aqui dentro onde o ambiente é 100% Async
    const ext = req.file.originalname.substring(req.file.originalname.lastIndexOf('.')).toLowerCase();
    let textoExtraido = '';
    let tipo = '';

    // A tua lógica original de extração foi movida para aqui com toda a segurança
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

    // Apaga o ficheiro do disco temporário após a leitura conforme tinhas definido
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    // Criar o documento respeitando RIGOROSAMENTE as regras e campos do teu Schema
    const novoMaterial = new Material({
      nome: nome || req.file.originalname,
      tipo: tipo,
      disciplina: disciplina ? disciplina.toUpperCase() : 'GERAL',
      anoEscolar: anoEscolar,
      professor: teacherId,
      conteudoTexto: textoExtraido
    });

    // Forçar os campos dinâmicos contornando travas estritas de cache do Mongoose
    novoMaterial.set('conteudoTexto', textoExtraido, { strict: false });
    novoMaterial.set('tipo', tipo, { strict: false });

    if ((ext === '.pdf' || ext === '.pptx') && (!textoExtraido || textoExtraido.trim().length < 20)) {
      return res.status(400).json({
        erro: 'Não foi possível extrair texto do ficheiro.'
      });
    }

    await novoMaterial.save();

    console.log(`✅ Material "${novoMaterial.nome}" indexado com sucesso na coleção 'materiais'!`);
    res.status(201).json({ mensagem: 'Material registado e lido pela IA com sucesso!', material: novoMaterial });

  } catch (error) {
    console.error('❌ Erro no upload/processamento do PDF:', error);
    res.status(500).json({ erro: 'Erro interno ao processar e guardar o ficheiro PDF.' });
  }
});

// Rota para apagar um material
app.delete('/api/materiais/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Material.findByIdAndDelete(id);
    res.status(200).json({ mensagem: 'Material removido com sucesso!' });
  } catch (error) {
    console.error('Erro ao apagar material:', error);
    res.status(500).json({ erro: 'Erro ao remover material.' });
  }
});


// =========================================================================
// 🔥 HEATMAP DINÂMICO REAL FILTRADO POR DISCIPLINA, ANO E DATA DA AULA
// =========================================================================
app.get('/api/professores/:teacherId/heatmap', async (req, res) => {
  try {
    const { teacherId } = req.params;
    // 🗓️ Recebemos a disciplina, o ano letivo E a data exata da aula vindos do front
    const { disciplina, anoEscolar, dataAula } = req.query;

    if (!disciplina || !anoEscolar || !dataAula) {
      return res.status(400).json({ erro: 'Disciplina, Ano Escolar e Data da Aula são obrigatórios!' });
    }

    // 1. Procura na BD cruzando o Professor, a Disciplina e a Data desta semana
    const registos = await TemaDificuldade.find({ 
      professor: teacherId,
      disciplina: disciplina.toUpperCase(),
      dataAula: dataAula // 🎯 Só puxa as dúvidas destinadas a esta aula específica!
    })
    .populate('aluno') // Puxa o objeto do aluno para inspecionar o Ano Escolar
    .lean();

    // 2. Filtra em memória pelo Ano Escolar do aluno populado
    const registosFiltrados = registos.filter(reg => {
      return reg.aluno && reg.aluno.anoEscolar === anoEscolar;
    });

    // 3. Agrupa e conta os votos por tema
    const contagemPorTema = registosFiltrados.reduce((acc, curr) => {
      const temaNome = curr.tema || "Geral";
      acc[temaNome] = (acc[temaNome] || 0) + 1;
      return acc;
    }, {});

    // 4. Monta a estrutura térmica das chamas
    const heatmapData = Object.keys(contagemPorTema).map(temaName => {
      const qts = contagemPorTema[temaName];
      
      let nivelCalculado = 1;
      if (qts > 15) nivelCalculado = 5;      // Crítico
      else if (qts > 10) nivelCalculado = 4;  // Muito Elevado
      else if (qts > 5) nivelCalculado = 3;   // Elevado
      else if (qts > 2) nivelCalculado = 2;   // Moderado

      return {
        name: temaName,
        questions: qts,
        level: nivelCalculado
      };
    });

    heatmapData.sort((a, b) => b.questions - a.questions);
    return res.status(200).json({ heatmap: heatmapData });

  } catch (error) {
    console.error('❌ Erro ao processar o heatmap térmico:', error);
    return res.status(500).json({ erro: 'Erro interno ao processar o mapa de calor.' });
  }
});



// =========================================================================
// 🎯 CONTROLADORES DE DEBUNKING (CAÇA ÀS ALUCINAÇÕES)
// =========================================================================

// ROTA POST: Professor lança um novo desafio para uma turma
app.post('/api/professores/:teacherId/debunking/lancar', async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { disciplina, anoEscolar, tema } = req.body;

    if (!disciplina || !anoEscolar || !tema || !tema.trim()) {
      return res.status(400).json({ erro: 'Todos os campos são obrigatórios para lançar o desafio!' });
    }

    // Desativa desafios anteriores desta disciplina e ano para este professor
    await DesafioDebunking.updateMany(
      { professor: teacherId, disciplina: disciplina.toUpperCase(), anoEscolar: anoEscolar },
      { ativo: false }
    );

    // Cria o novo desafio ativo
    const novoDesafio = new DesafioDebunking({
      professor: teacherId,
      disciplina: disciplina.toUpperCase(),
      anoEscolar: anoEscolar,
      tema: tema.trim(),
      ativo: true
    });

    await novoDesafio.save();
    console.log(`🔥 [DEBUNKING] Desafio lançado: "${tema.trim()}" para o ${anoEscolar} de ${disciplina.toUpperCase()}`);
    
    return res.status(201).json({ mensagem: 'Desafio lançado com sucesso!', desafio: novoDesafio });
  } catch (error) {
    console.error('Erro ao lançar desafio:', error);
    return res.status(500).json({ erro: 'Erro ao registar o desafio no servidor.' });
  }
});

// ROTA GET: Carrega o tema ativo e o relatório real de progresso dos alunos
app.get('/api/professores/:teacherId/debunking/relatorio', async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { disciplina, anoEscolar } = req.query;

    if (!disciplina || !anoEscolar) {
      return res.status(400).json({ erro: 'Filtros de disciplina e ano letivo são obrigatórios.' });
    }

    // 1. Procura o tema ativo
    const desafioAtivo = await DesafioDebunking.findOne({
      professor: teacherId,
      disciplina: disciplina.toUpperCase(),
      anoEscolar: anoEscolar,
      ativo: true
    }).lean();

    const temaAlvo = desafioAtivo ? desafioAtivo.tema : null;

    if (!temaAlvo) {
      return res.status(200).json({ temaAtivo: null, summary: { totalSucesso: 0, totalReforco: 0, taxa: 0 }, results: [] });
    }

    // 2. Procura as tentativas dos alunos associadas a esse tema ativo
    const tentativas = await TentativaDebunking.find({
      professor: teacherId,
      disciplina: disciplina.toUpperCase(),
      anoEscolar: anoEscolar,
      tema: temaAlvo
    })
    .populate('aluno', 'nome email')
    .sort({ criadoEm: -1 })
    .lean();

    // 3. Compila as métricas para os painéis
    const totalSucesso = tentativas.filter(t => t.success).length;
    const totalReforco = tentativas.filter(t => !t.success).length;
    const totalTentativas = tentativas.length;
    const taxaSucesso = totalTentativas > 0 ? Math.round((totalSucesso / totalTentativas) * 100) : 0;

    const resultadosFormatados = tentativas.map(t => ({
      id: t._id,
      student: t.aluno ? t.aluno.nome : "Estudante Anónimo",
      topic: t.tema,
      errorsFound: t.errorsFound,
      totalErrors: t.totalErrors,
      success: t.success
    }));

    return res.status(200).json({
      temaAtivo: temaAlvo,
      summary: { totalSucesso, totalReforco, taxa: taxaSucesso },
      results: resultadosFormatados
    });

  } catch (error) {
    console.error('Erro ao gerar relatório de debunking:', error);
    return res.status(500).json({ erro: 'Erro interno ao compilar os dados do relatório.' });
  }
});



// 🔄 ROTA GET: Busca o desafio em curso para o ano escolar deste aluno
app.get('/api/alunos/:studentId/debunking/desafio', async (req, res) => {
  try {
    const { studentId } = req.params;

    // 1. Localiza o aluno para saber o seu ano escolar
    const aluno = await Aluno.findById(studentId).lean();
    if (!aluno) return res.status(404).json({ erro: 'Aluno não encontrado.' });

    // 2. Procura um desafio ativo do professor correspondente a este Ano Escolar
    const desafio = await DesafioDebunking.findOne({
      anoEscolar: aluno.anoEscolar,
      ativo: true
    }).sort({ criadoEm: -1 }).lean();

    if (!desafio) {
      return res.status(200).json({ desafio: null, mensagem: 'Não há nenhum desafio ativo para a tua turma.' });
    }

    // 3. Banco de dados de afirmações (Simula o motor de IA gerando as alucinações controladas)
    const bibliotecaDeTemas = {
      "DERIVADAS": [
        { id: 1, texto: "A derivada de uma função f(x) = x² é 2x.", incorreta: false },
        { id: 2, texto: "Isto acontece porque quando aplicamos a regra da potência, multiplicamos o expoente pela base e subtraímos 1 ao expoente.", incorreta: false },
        { id: 3, texto: "Portanto, temos 2 × x²⁻¹ = 2x.", incorreta: false },
        { id: 4, texto: "A derivada também pode ser interpretada como a área sob a curva da função original.", incorreta: true }, // ❌ Erro (Isto é o integral)
        { id: 5, texto: "Se uma função possui uma descontinuidade num ponto isolado, ela é obrigatoriamente derivável nesse ponto.", incorreta: true }, // ❌ Erro
        { id: 6, texto: "A derivada de uma constante isolada resulta sempre no valor da própria constante original.", incorreta: true } // ❌ Erro (Resulta em 0)
      ]
    };

    const temaKey = desafio.tema.toUpperCase();
    let frasesCompletas = bibliotecaDeTemas[temaKey] || [
      { id: 1, texto: `O cálculo de ${desafio.tema} serve para inverter matrizes nulas.`, incorreta: true },
      { id: 2, texto: `É possível aplicar os teoremas fundamentais de ${desafio.tema} em problemas científicos.`, incorreta: false },
      { id: 3, texto: "Todos os limites laterais tendem ao infinito por definição padrão.", incorreta: true },
      { id: 4, texto: "A constante multiplicativa acumula-se ao expoente quadrático.", incorreta: true }
    ];

    // ⚠️ SEGURANÇA: Removemos a propriedade 'incorreta' antes de enviar para o cliente!
    // Isto impede que o aluno descubra as respostas certas espreitando o Network no Inspecionar Elemento.
    const frasesHigienizadas = frasesCompletas.map(f => ({ id: f.id, texto: f.texto }));

    return res.status(200).json({
      desafioId: desafio._id,
      tema: desafio.tema,
      disciplina: desafio.disciplina,
      frases: frasesHigienizadas
    });

  } catch (error) {
    console.error('Erro ao servir desafio ao aluno:', error);
    return res.status(500).json({ erro: 'Erro ao carregar o desafio.' });
  }
});

// 🚀 ROTA POST: Processa a submissão da caçada a erros do aluno e grava na BD
app.post('/api/alunos/:studentId/debunking/submeter', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { desafioId, respostasSelecionadas } = req.body; // Array de IDs selecionados pelo estudante

    const aluno = await Aluno.findById(studentId).lean();
    const desafio = await DesafioDebunking.findById(desafioId).lean();

    if (!aluno || !desafio) return res.status(404).json({ erro: 'Dados não localizados.' });

    // Mapeamento dos IDs falsos reais para validação segura server-side
    let idsFalsosReais = [4, 5, 6]; // Padrão para derivadas
    if (desafio.tema.toUpperCase() !== "DERIVADAS") {
      idsFalsosReais = [1, 3, 4];
    }

    // 🎯 Conta quantos erros reais o aluno conseguiu caçar com sucesso
    const errosApanhados = respostasSelecionadas.filter(id => idsFalsosReais.includes(id)).length;
    const totalErrosDesafio = idsFalsosReais.length;

    // Sucesso total significa ter apanhado TODOS os erros (3 de 3)
    const sucessoTotal = errosApanhados === totalErrosDesafio;

    // Grava a tentativa para alimentar o ecrã do professor instantaneamente
    const novaTentativa = new TentativaDebunking({
      aluno: studentId,
      professor: desafio.professor,
      disciplina: desafio.disciplina,
      anoEscolar: aluno.anoEscolar,
      tema: desafio.tema,
      errorsFound: errosApanhados,
      totalErrors: totalErrosDesafio,
      success: sucessoTotal
    });

    await novaTentativa.save();

    return res.status(200).json({
      mensagem: 'Desafio concluído com sucesso!',
      errorsFound: errosApanhados,
      totalErrors: totalErrosDesafio,
      success: sucessoTotal
    });

  } catch (error) {
    console.error('Erro ao validar submissão de debunking:', error);
    return res.status(500).json({ erro: 'Erro interno ao computar resposta.' });
  }
});
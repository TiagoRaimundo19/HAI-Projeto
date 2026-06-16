const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// OBJETOS DA BASE DE DADOS DEFINIDOS
const Duvida = require('./models/Duvida'); 
const Professor = require('./models/Professor');



const { GoogleGenAI } = require('@google/genai');

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

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
    const { id } = req.params; // Apanha o ID do professor que vem no URL
    const { nome, instituicao, disciplinas } = req.body; // Apanha os dados do novo ecrã

    // Procura o professor pelo ID e atualiza os campos dele no MongoDB
    const professorAtualizado = await Professor.findByIdAndUpdate(
      id,
      { 
        nome: nome, 
        instituicao: instituicao, 
        disciplinas: disciplinas 
      },
      { new: true } // Garante que a BD devolve o professor já com as alterações aplicadas
    );

    if (!professorAtualizado) {
      return res.status(404).json({ erro: 'Professor não encontrado!' });
    }

    res.status(200).json({
      mensagem: 'Perfil configurado com sucesso!',
      professor: professorAtualizado
    });

  } catch (error) {
    console.error('❌ Erro ao configurar professor:', error);
    res.status(500).json({ erro: 'Erro interno ao salvar a configuração.' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor a funcionar na porta ${PORT}`);
});
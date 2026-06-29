import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Sidebar } from "../components/Sidebar";
import PreClassView from "./PreClassView"; 
import {
  MessageSquare,
  Shield,
  Inbox,
  Send,
  Lightbulb,
  AlertTriangle,
  Flame,
  Plus, 
} from "lucide-react";

type View = "chat" | "debunking" | "feedback" | "duvidas";

export function StudentDashboard() {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<View>("chat");
  const [studentName, setStudentName] = useState("A carregar...");

  useEffect(() => {
    const studentId = localStorage.getItem("studentId");
    if (!studentId) return;

    fetch(`http://localhost:5000/api/alunos/perfil/${studentId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.aluno?.nome) {
          setStudentName(data.aluno.nome);
        }
      })
      .catch(() => setStudentName("Aluno"));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("studentId");
    navigate("/student/login");
  };

  const sidebarItems = [
    {
      icon: <MessageSquare className="w-5 h-5" />,
      label: "Bot de Estudo",
      active: activeView === "chat",
      onClick: () => setActiveView("chat"),
    },
    {
      icon: <Shield className="w-5 h-5" />,
      label: "Arena Debunking",
      active: activeView === "debunking",
      onClick: () => setActiveView("debunking"),
    },
    {
      icon: <Flame className="w-5 h-5" />,
      label: "Sinalizar Dúvidas",
      active: activeView === "duvidas",
      onClick: () => setActiveView("duvidas"),
    },
    {
      icon: <MessageSquare className="w-5 h-5" />,
      label: "Caixa de Feedback",
      active: activeView === "feedback",
      onClick: () => setActiveView("feedback"),
    },
  ];

  return (
    <div className="relative flex h-screen bg-[#f5f5f7]">
      
      {/* MÁSCARA DO TOPO */}
      <div className="absolute top-[16px] left-[16px] w-[224px] h-[76px] bg-[#1e3a5f] z-50 flex items-center gap-3 p-3 rounded-xl border border-white/10 select-none cursor-default">
        <div className="w-10 h-10 bg-[#ff6b35] rounded-xl flex items-center justify-center shadow-md shrink-0">
          <span className="text-white text-lg">🎓</span>
        </div>
        <div className="overflow-hidden pr-1 flex flex-col justify-center h-full">
          <h3 className="font-semibold text-sm text-white leading-tight break-words" title={studentName}>
            {studentName}
          </h3>
        </div>
      </div>

      {/* MÁSCARA DO FUNDO (INVISÍVEL) PARA O LOGOUT */}
      <div 
        onClick={handleLogout}
        className="absolute bottom-0 left-0 w-[256px] h-[64px] z-50 cursor-pointer bg-transparent"
        title="Terminar Sessão"
      />

      <Sidebar items={sidebarItems} userType="student" />

      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {activeView === "chat" && <ChatView />}
          {activeView === "debunking" && <DebunkingArenaView />}
          {activeView === "feedback" && <FeedbackInboxView />}
          
          {activeView === "duvidas" && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <PreClassView />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// =========================================================================
// BOT DE ESTUDO (CHAT VIEW)
// =========================================================================
function ChatView() {
  const [conversas, setConversas] = useState<any[]>([]);
  const [activeConversaId, setActiveConversaId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  
  // Estados de carregamento (Loaders visuais)
  const [loadingConversas, setLoadingConversas] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  const studentId = localStorage.getItem("studentId");

  // 1. Carrega a lista de conversas recentes da barra lateral
  const carregarConversasRecentes = (selecionarPrimeira = false) => {
    if (!studentId) return;
    
    fetch(`http://localhost:5000/api/alunos/${studentId}/conversas`)
      .then((res) => res.json())
      .then((data) => {
        if (data.conversas) {
          setConversas(data.conversas);
          // Se for o primeiro carregamento e existirem chats, abre o mais recente
          if (selecionarPrimeira && data.conversas.length > 0) {
            handleSelectConversa(data.conversas[0]._id || data.conversas[0].id);
          }
        }
        setLoadingConversas(false);
      })
      .catch((err) => {
        console.error("Erro ao ir buscar conversas:", err);
        setLoadingConversas(false);
      });
  };

  useEffect(() => {
    carregarConversasRecentes(true);
  }, [studentId]);

  // 2. Carrega as mensagens de uma conversa específica ao clicar nela
  const handleSelectConversa = (conversaId: string) => {
    setActiveConversaId(conversaId);
    setLoadingMessages(true);
    setMessages([]); // Limpa o ecrã enquanto carrega

    fetch(`http://localhost:5000/api/conversas/${conversaId}/mensagens`)
      .then((res) => res.json())
      .then((data) => {
        if (data.historico) {
          const formatadas = data.historico.map((m: any, idx: number) => ({
            id: m._id || idx,
            sender: m.sender,
            text: m.text
          }));
          setMessages(formatadas);
        }
        setLoadingMessages(false);
      })
      .catch((err) => {
        console.error("Erro ao carregar mensagens:", err);
        setLoadingMessages(false);
      });
  };

  // 3. Cria uma nova sessão limpa de chat ("+ Novo Chat")
  const handleCriarNovaConversa = () => {
    if (!studentId) return;

    fetch(`http://localhost:5000/api/alunos/${studentId}/conversas/criar`, {
      method: "POST"
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.conversa) {
          const cId = data.conversa._id || data.conversa.id;
          // Adiciona ao topo da lista local
          setConversas([data.conversa, ...conversas]);
          // Define como conversa ativa e limpa as mensagens
          setActiveConversaId(cId);
          setMessages([
            {
              id: "welcome",
              sender: "ai",
              text: "Nova sessão iniciada! Posso ajudar-te com qualquer dúvida sobre as matérias fornecidas pelo professor. Em que posso ajudar?",
            }
          ]);
        }
      })
      .catch((err) => console.error("Erro ao abrir nova conversa:", err));
  };

  // 4. Envia a mensagem dentro da thread ativa
  const handleSend = async () => {
  if (!input.trim() || !activeConversaId) return;

  const userMessage = input.trim();
  
  // Imprime imediatamente o balão do utilizador no ecrã
  const currentMessages = [
    ...messages,
    { id: Date.now(), sender: "user", text: userMessage }
  ];
  
  setMessages(currentMessages);
  setInput("");
  setSending(true);

  try {
    const response = await fetch(`http://localhost:5000/api/conversas/${activeConversaId}/mensagens`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mensagem: userMessage })
    });

    const data = await response.json();

    // Imprime o balão de resposta da IA
    setMessages([
      ...currentMessages,
      {
        id: Date.now() + 1,
        sender: "ai",
        text: data.resposta
      }
    ]);

    // 🔄 SE A IA GEROU UM TÍTULO NOVO, ATUALIZA A BARRA LATERAL INSTANTANEAMENTE
    if (data.tituloAtualizado) {
      // Re-executa a função que faz o fetch da lista de "Recentes"
      carregarConversasRecentes(false); 
    }

  } catch (error) {
    console.error("Erro ao enviar mensagem:", error);
  } finally {
    setSending(false);
  }
};

  return (
    <div>
      <h1 className="text-[#1e3a5f] mb-6">Bot de Estudo Contextual</h1>

      {/* FRAME PRINCIPAL DIVIDIDO EM 2 COLUNAS */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden flex h-[calc(100vh-200px)] border border-[#e9ebef]">
        
        {/* =========================================================================
            COLUNA 1 (ESQUERDA): BARRA LATERAL DOS CHATS RECENTES (ESTILO GEMINI)
            ========================================================================= */}
        <div className="w-64 bg-[#f8f9fa] border-r border-[#e9ebef] flex flex-col p-4 justify-between shrink-0">
          <div>
            {/* Botão Novo Chat */}
            <button
              onClick={handleCriarNovaConversa}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-gray-50 text-[#1e3a5f] font-semibold text-xs rounded-xl border border-[#e9ebef] transition-all shadow-xs mb-6 active:scale-[0.99]"
            >
              <Plus className="w-4 h-4 text-[#ff6b35]" />
              Novo chat
            </button>

            {/* Cabeçalho da Lista */}
            <div className="text-[11px] font-bold text-[#717182] uppercase tracking-wider mb-3 px-2">
              Recentes
            </div>

            {/* Lista Cronológica */}
            <div className="space-y-1 overflow-y-auto max-h-[calc(100vh-380px)] pr-1">
              {loadingConversas ? (
                <div className="text-center py-4 text-xs text-[#717182] animate-pulse">A alinhar histórico...</div>
              ) : conversas.length === 0 ? (
                <div className="text-center py-4 text-xs text-[#717182] italic px-2">Sem chats criados.</div>
              ) : (
                conversas.map((c) => {
                  const cId = c._id || c.id;
                  const isSelected = activeConversaId === cId;
                  return (
                    <button
                      key={cId}
                      onClick={() => handleSelectConversa(cId)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-medium transition-all truncate block ${
                        isSelected 
                          ? "bg-[#1e3a5f]/10 text-[#1e3a5f] font-bold border-l-4 border-l-[#ff6b35] pl-2" 
                          : "text-[#717182] hover:bg-gray-200/60 hover:text-[#1e3a5f]"
                      }`}
                    >
                      💬 {c.titulo}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <p className="text-[10px] text-[#717182] text-center font-medium border-t border-[#e9ebef] pt-3">
            🤖 Inteligência Co-Piloto HAI
          </p>
        </div>

        {/* =========================================================================
            COLUNA 2 (DIREITA): ESPAÇO ATIVO DE DIÁLOGO
            ========================================================================= */}
        <div className="flex-1 flex flex-col justify-between bg-white">
          
          {/* Header Interno do Chat */}
          <div className="bg-[#1e3a5f] p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#ff6b35] rounded-full flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-white font-semibold text-sm">Assistente IA</div>
                <div className="text-white/60 text-xs">Conectado ao cofre de conhecimento</div>
              </div>
            </div>
          </div>

          {/* Rolo de Mensagens Dinâmico */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/30">
            {loadingMessages ? (
              <div className="h-full flex items-center justify-center text-xs text-[#717182] animate-pulse">
                🤖 A recuperar o rolo de mensagens desta thread...
              </div>
            ) : !activeConversaId ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="text-3xl mb-2">👋</div>
                <div className="text-[#1e3a5f] font-bold text-sm">Bem-vindo ao teu Espaço de Estudo!</div>
                <div className="text-xs text-[#717182] mt-1 max-w-xs">
                  Cria um novo chat ou seleciona uma sessão recente na barra lateral para começares a interrogar os teus manuais.
                </div>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] p-4 rounded-xl text-xs leading-relaxed shadow-xs ${
                        message.sender === "user"
                          ? "bg-[#ff6b35] text-white rounded-br-none font-medium"
                          : "bg-white text-[#1e3a5f] rounded-bl-none border border-[#e9ebef]"
                      }`}
                    >
                      {message.text}
                    </div>
                  </div>
                ))}
                
                {sending && (
                  <div className="flex justify-start">
                    <div className="bg-white text-[#717182] text-xs p-3 rounded-xl border border-[#e9ebef] animate-pulse">
                      🤖 O assistente está a ler os teus PDFs e a formular a resposta...
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Caixa de Input e Rodapé */}
          <div className="border-t border-[#e9ebef] p-4 bg-white">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && !sending && handleSend()}
                className="flex-1 px-4 py-3 bg-[#f8f9fa] border border-[#e9ebef] rounded-xl text-xs text-[#1e3a5f] placeholder-[#717182] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#ff6b35]"
                placeholder={activeConversaId ? "Faz a tua pergunta sobre os materiais..." : "Seleciona ou cria um chat primeiro..."}
                disabled={sending || !activeConversaId || loadingMessages}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || sending || !activeConversaId || loadingMessages}
                className="px-5 py-3 bg-[#ff6b35] text-white rounded-xl hover:bg-[#ff5722] transition-all shadow-md disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[11px] text-[#717182] mt-2 font-medium">
              💡 Dica: O tutor cruza os dados semanticamente. Podes perguntar por tópicos genéricos das tuas cadeiras.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}


// =========================================================================
// 🎯 ARENA DE DESAFIO - MODE DEBUNKING (CONECTADA À BD REAL)
// =========================================================================
function DebunkingArenaView() {
  const [desafio, setDesafio] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedText, setSelectedText] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resultData, setResultData] = useState<any>(null);

  const studentId = localStorage.getItem("studentId");

  // 1. Faz o Fetch dinâmico do desafio ativo lançado pelo professor para a turma deste aluno
  useEffect(() => {
    if (!studentId) {
      setLoading(false);
      return;
    }

    fetch(`http://localhost:5000/api/alunos/${studentId}/debunking/desafio`)
      .then((res) => res.json())
      .then((data) => {
        if (data.desafioId) {
          setDesafio(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erro ao sincronizar arena de desafio:", err);
        setLoading(false);
      });
  }, [studentId]);

  const toggleSelection = (text: string) => {
    if (submitted) return; // Bloqueia cliques após submeter
    setSelectedText((prev) =>
      prev.includes(text) ? prev.filter((t) => t !== text) : [...prev, text]
    );
  };

  // 2. Envia os IDs das frases selecionadas para validação no Backend
  const handleSubmit = () => {
    if (selectedText.length === 0 || !desafio) return;

    setSubmitting(true);

    // Mapeia o texto selecionado de volta para os IDs reais gerados pelo backend
    const idsSelecionados = desafio.frases
      .filter((f: any) => selectedText.includes(f.texto))
      .map((f: any) => f.id);

    fetch(`http://localhost:5000/api/alunos/${studentId}/debunking/submeter`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        desafioId: desafio.desafioId,
        respostasSelecionadas: idsSelecionados,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setResultData(data);
        setSubmitted(true); // Ativa o modo de visualização de resultados
      })
      .catch((err) => console.error("Erro ao computar submissão:", err))
      .finally(() => setSubmitting(false));
  };

  if (loading) {
    return <div className="text-center py-12 text-[#717182] animate-pulse font-medium">🤖 A carregar o desafio ativo da tua turma...</div>;
  }

  // Se o professor não tiver nenhum desafio ativo para este ano letivo
  if (!desafio) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 text-center text-[#717182] italic border border-dashed">
        Não há nenhum desafio de Arena ativo para o teu ano letivo neste momento. Relaxa! ☕
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-[#1e3a5f] mb-6">Arena de Desafio - Mode Debunking</h1>

      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-[#ff6b35] rounded-full flex items-center justify-center">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-[#1e3a5f]">Desafio Atual</h3>
            <p className="text-sm text-[#717182]">
              Tópico: <span className="text-[#ff6b35] font-bold uppercase tracking-wide">{desafio.tema}</span>
            </p>
          </div>
        </div>

        <div className="bg-[#fef3c7] border-l-4 border-[#fbbf24] p-4 rounded mb-6">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-[#f97316] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-[#1e3a5f]">
                <span className="font-medium">Atenção:</span> A explicação abaixo contém{" "}
                <span className="font-medium">erros deliberados</span>. O teu objetivo é
                identificar as afirmações incorretas clicando nelas.
              </p>
            </div>
          </div>
        </div>

        {/* CONTAINER DINÂMICO DAS FRASES DA IA */}
        <div className="bg-[#f3f3f5] p-6 rounded-xl mb-6">
          <h4 className="text-[#1e3a5f] mb-4">Explicação da IA:</h4>
          <div className="space-y-3">
            {desafio.frases.map((frase: any, index: number) => {
              const isSelected = selectedText.includes(frase.texto);

              return (
                <div
                  key={index}
                  onClick={() => toggleSelection(frase.texto)}
                  className={`p-4 rounded-lg cursor-pointer transition-all ${
                    isSelected && !submitted
                      ? "bg-[#ff6b35] text-white shadow-lg font-medium"
                      : isSelected && submitted
                      ? "bg-[#1e3a5f] text-white shadow-sm opacity-70"
                      : "bg-white hover:bg-[#e9ebef]"
                  } ${submitted ? "cursor-default" : ""}`}
                >
                  <p className={isSelected && !submitted ? "text-white" : "text-[#1e3a5f]"}>
                    {frase.texto}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* BOTÃO OU BANNER DE FEEDBACK DINÂMICO DE ACORDO COM A RESPOSTA */}
        {!submitted ? (
          <button
            onClick={handleSubmit}
            disabled={selectedText.length === 0 || submitting}
            className="flex items-center gap-2 px-6 py-3 bg-[#ff6b35] text-white rounded-lg hover:bg-[#ff5722] transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-bold"
          >
            <Send className="w-5 h-5" />
            {submitting ? "A enviar análise..." : "Submeter Resposta"}
          </button>
        ) : (
          <div className={`border-l-4 p-4 rounded transition-all ${
            resultData?.success ? "bg-green-500/10 border-green-500" : "bg-amber-500/10 border-amber-500"
          }`}>
            <p className="text-[#1e3a5f] font-medium">
              <span className="font-bold">{resultData?.success ? "✓ Desafio concluído com Sucesso Total!" : "○ Desafio concluído!"}</span> Encontraste{" "}
              <span className="font-bold text-[#ff6b35] text-lg">{resultData?.errorsFound}</span> de {resultData?.totalErrors} erros na explicação da IA.
            </p>
          </div>
        )}
      </div>

      {/* ⚠️ O BLOCO EXIGIDO "COMO FUNCIONA" FOI MANTIDO COMPLETAMENTE IGUAL E INTEGRAL */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-[#1e3a5f] mb-4">Como Funciona</h3>
        <ul className="space-y-2 text-[#717182]">
          <li className="flex gap-2">
            <span className="text-[#ff6b35]">•</span>
            <span>A IA apresenta uma explicação sobre um tópico definido pelo professor</span>
          </li>
          <li className="flex gap-2">
            <span className="text-[#ff6b35]">•</span>
            <span>A explicação contém erros deliberados (alucinações controladas)</span>
          </li>
          <li className="flex gap-2">
            <span className="text-[#ff6b35]">•</span>
            <span>Clica nas frases que achas que estão incorretas</span>
          </li>
          <li className="flex gap-2">
            <span className="text-[#ff6b35]">•</span>
            <span>Submete a tua resposta e recebe feedback imediato</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

// =========================================================================
// CAIXA DE INBOX DE FEEDBACK
// =========================================================================
function FeedbackInboxView() {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const studentId = localStorage.getItem("studentId");

  // 1. Carrega os feedbacks pedagógicos ativos da base de dados
  useEffect(() => {
    if (!studentId) {
      setLoading(false);
      return;
    }

    fetch(`http://localhost:5000/api/alunos/${studentId}/feedback/listar`)
      .then((res) => res.json())
      .then((data) => {
        if (data.feedbacks) {
          setFeedbacks(data.feedbacks);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erro ao ir buscar a caixa de feedback:", err);
        setLoading(false);
      });
  }, [studentId]);

  // Helper para formatar a data exatamente como vês na imagem (DD/MM/YYYY às HH:MM)
  const formatarDataVisual = (isoString: string) => {
    try {
      const d = new Date(isoString);
      const dia = String(d.getDate()).padStart(2, "0");
      const mes = String(d.getMonth() + 1).padStart(2, "0");
      const ano = d.getFullYear();
      const horas = String(d.getHours()).padStart(2, "0");
      const minutos = String(d.getMinutes()).padStart(2, "0");
      return `${dia}/${mes}/${ano} às ${horas}:${minutos}`;
    } catch {
      return "Data indisponível";
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-[#717182] font-medium animate-pulse">
        🤖 A abrir o seu dossiê de feedback pedagógico...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Título Principal */}
      <div className="mb-6">
        <h1 className="text-[#1e3a5f] text-2xl font-bold">Caixa de Entrada de Feedback</h1>
        <p className="text-sm text-[#717182] mt-1">
          Conselhos e direções exclusivas partilhadas pelos teus professores para te preparares para as próximas aulas.
        </p>
      </div>

      {/* Lista de Mensagens */}
      <div className="space-y-4">
        {feedbacks.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center text-[#717182] italic border border-gray-100">
            A tua caixa de entrada está limpa. Nenhum feedback registado para as próximas aulas! 🌟
          </div>
        ) : (
          feedbacks.map((item, index) => {
            // O primeiro item (índice 0) ganha o destaque de "Novo" tal como na imagem_3e474a.png
            const isNew = index === 0;
            const profName = item.professor?.nome || "Professor";
            const primeiraLetra = profName.charAt(0).toUpperCase();

            return (
              <div
                key={item._id || index}
                className={`bg-white rounded-xl shadow-md p-5 transition-all hover:scale-[1.005] border border-gray-100/80 relative overflow-hidden ${
                  isNew ? "border-l-4 border-l-[#ff6b35]" : ""
                }`}
              >
                
                {/* Cabeçalho do Card: Informações do Stor e Data */}
                <div className="flex items-center gap-4 mb-3">
                  {/* Avatar do Professor */}
                  <div className="w-10 h-10 bg-[#1e3a5f] text-white rounded-full flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                    {primeiraLetra}
                  </div>

                  {/* Nome, Badge e Data */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[#1e3a5f] font-semibold text-sm">
                        Prof. {profName}
                      </span>
                      
                      {/* 🎯 BADGE DA DISCIPLINA INSERIDA EXPLICITAMENTE AQUI */}
                      <span className="text-[10px] bg-[#1e3a5f]/10 text-[#1e3a5f] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider border border-[#1e3a5f]/10">
                        {item.disciplina || "GERAL"}
                      </span>

                      {/* Tag Novo (Apenas para a última mensagem recebida) */}
                      {isNew && (
                        <span className="bg-[#ff6b35] text-white text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wide">
                          Novo
                        </span>
                      )}
                    </div>
                    
                    {/* Data de Envio formatada */}
                    <div className="text-xs text-gray-400 mt-0.5">
                      {formatarDataVisual(item.criadoEm)}
                    </div>
                  </div>
                </div>

                {/* Bloco de Mensagem Pedagógica */}
                <div className="bg-[#f3f3f5] rounded-xl p-4 text-[#1e3a5f] text-sm leading-relaxed border border-black/5">
                  {item.mensagem}
                </div>

              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
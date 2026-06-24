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
      icon: <Inbox className="w-5 h-5" />,
      label: "Feedback do Professor",
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
  const [messages, setMessages] = useState([
    { id: 1, sender: "ai", text: "Olá! Sou o teu assistente de estudo. Posso ajudar-te com questões sobre os materiais fornecidos pelo professor. Em que posso ajudar?" },
    { id: 2, sender: "user", text: "Podes explicar-me o conceito de derivadas?" },
    { id: 3, sender: "ai", text: "Com base nos slides do professor, a derivada representa a taxa de variação instantânea de uma função. No slide 12, o professor explica que geometricamente, a derivada num ponto é o declive da reta tangente à curva nesse ponto. Queres que aprofunde algum aspeto específico?" },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    setMessages([...messages, { id: messages.length + 1, sender: "user", text: input }]);
    setInput("");

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: prev.length + 1, sender: "ai", text: "Baseado nos materiais do professor, posso ajudar-te com essa questão. Qual é o contexto específico que gostarias de explorar?" },
      ]);
    }, 1000);
  };

  return (
    <div>
      <h1 className="text-[#1e3a5f] mb-6">Bot de Estudo Contextual</h1>
      <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col h-[calc(100vh-200px)]">
        <div className="bg-[#1e3a5f] p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#ff6b35] rounded-full flex items-center justify-center">
              <Lightbulb className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-white">Assistente IA</div>
              <div className="text-white/60 text-sm">Baseado nos materiais do professor</div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[70%] p-4 rounded-xl ${message.sender === "user" ? "bg-[#ff6b35] text-white" : "bg-[#f3f3f5] text-[#1e3a5f]"}`}>
                {message.text}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-[#e9ebef] p-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              className="flex-1 px-4 py-3 bg-[#f3f3f5] border border-[#e9ebef] rounded-lg text-[#1e3a5f] placeholder-[#717182] focus:outline-none"
              placeholder="Faz a tua pergunta sobre os materiais..."
            />
            <button onClick={handleSend} disabled={!input.trim()} className="px-6 py-3 bg-[#ff6b35] text-white rounded-lg hover:bg-[#ff5722] transition-colors shadow-lg disabled:opacity-50">
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-[#717182] mt-2">💡 As respostas são baseadas exclusivamente nos slides e materiais do teu professor</p>
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
  const feedbacks = [
    { id: 1, from: "Prof. Carlos Silva", message: "Excelente progresso esta semana! Continue assim.", date: "05/05/2026", time: "14:30", read: false },
    { id: 2, from: "Prof. Carlos Silva", message: "Sugiro rever o material sobre derivadas antes do próximo teste.", date: "03/05/2026", time: "10:15", read: true },
    { id: 3, from: "Prof. Carlos Silva", message: "Bom trabalho no desafio de debunking! Identificaste todos os erros corretamente.", date: "01/05/2026", time: "16:45", read: true },
  ];

  return (
    <div>
      <h1 className="text-[#1e3a5f] mb-6">Caixa de Entrada de Feedback</h1>
      <div className="grid gap-4">
        {feedbacks.map((feedback) => (
          <div key={feedback.id} className={`bg-white rounded-xl shadow-md p-6 transition-all hover:shadow-lg ${!feedback.read ? "border-l-4 border-[#ff6b35]" : ""}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#1e3a5f] text-white rounded-full flex items-center justify-center">
                  {feedback.from.split(" ")[1].charAt(0)}
                </div>
                <div>
                  <div className="text-[#1e3a5f] flex items-center gap-2">
                    {feedback.from}
                    {!feedback.read && <span className="px-2 py-0.5 bg-[#ff6b35] text-white text-xs rounded-full">Novo</span>}
                  </div>
                  <div className="text-sm text-[#717182]">{feedback.date} às {feedback.time}</div>
                </div>
              </div>
            </div>
            <div className="bg-[#f3f3f5] p-4 rounded-lg">
              <p className="text-[#1e3a5f]">{feedback.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
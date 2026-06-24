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
      icon: <Flame className="w-5 h-5" />, // Novo Botão
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

      {/* Aqui é renderizada a Nav Barra Lateral */}
      <Sidebar items={sidebarItems} userType="student" />

      {/* Área de conteúdo principal */}
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
// As tuas visualizações internas (ChatView, Debunking, Feedback) continuam IGUAIS
// =========================================================================

function ChatView() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "ai",
      text: "Olá! Sou o teu assistente de estudo. Posso ajudar-te com questões sobre os materiais fornecidos pelo professor. Em que posso ajudar?",
    },
    {
      id: 2,
      sender: "user",
      text: "Podes explicar-me o conceito de derivadas?",
    },
    {
      id: 3,
      sender: "ai",
      text: "Com base nos slides do professor, a derivada representa a taxa de variação instantânea de uma função. No slide 12, o professor explica que geometricamente, a derivada num ponto é o declive da reta tangente à curva nesse ponto. Queres que aprofunde algum aspeto específico?",
    },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    setMessages([
      ...messages,
      {
        id: messages.length + 1,
        sender: "user",
        text: input,
      },
    ]);
    setInput("");

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          sender: "ai",
          text: "Baseado nos materiais do professor, posso ajudar-te com essa questão. Qual é o contexto específico que gostarias de explorar?",
        },
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
              <div className="text-white/60 text-sm">
                Baseado nos materiais do professor
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] p-4 rounded-xl ${
                  message.sender === "user"
                    ? "bg-[#ff6b35] text-white"
                    : "bg-[#f3f3f5] text-[#1e3a5f]"
                }`}
              >
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
              className="flex-1 px-4 py-3 bg-[#f3f3f5] border border-[#e9ebef] rounded-lg text-[#1e3a5f] placeholder-[#717182] focus:outline-none focus:ring-2 focus:ring-[#ff6b35]"
              placeholder="Faz a tua pergunta sobre os materiais..."
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="px-6 py-3 bg-[#ff6b35] text-white rounded-lg hover:bg-[#ff5722] transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-[#717182] mt-2">
            💡 As respostas são baseadas exclusivamente nos slides e materiais do teu
            professor
          </p>
        </div>
      </div>
    </div>
  );
}

function DebunkingArenaView() {
  const [currentChallenge] = useState({
    topic: "Derivadas",
    explanation:
      "A derivada de uma função f(x) = x² é 2x. Isto acontece porque quando aplicamos a regra da potência, multiplicamos o expoente pela base e subtraímos 1 ao expoente. Portanto, temos 2 × x²⁻¹ = 2x. A derivada também pode ser interpretada como a área sob a curva da função original.",
    errors: [
      {
        text: "A derivada também pode ser interpretada como a área sob a curva",
        reason:
          "Incorreto - a área sob a curva é o INTEGRAL, não a derivada. A derivada é a taxa de variação/declive.",
      },
    ],
  });

  const [selectedText, setSelectedText] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const highlightableTexts = [
    "A derivada de uma função f(x) = x² é 2x.",
    "Isto acontece porque quando aplicamos a regra da potência, multiplicamos o expoente pela base e subtraímos 1 ao expoente.",
    "Portanto, temos 2 × x²⁻¹ = 2x.",
    "A derivada também pode ser interpretada como a área sob a curva da função original.",
  ];

  const toggleSelection = (text: string) => {
    if (submitted) return;
    setSelectedText((prev) =>
      prev.includes(text) ? prev.filter((t) => t !== text) : [...prev, text]
    );
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

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
              Tópico: <span className="text-[#ff6b35]">{currentChallenge.topic}</span>
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

        <div className="bg-[#f3f3f5] p-6 rounded-xl mb-6">
          <h4 className="text-[#1e3a5f] mb-4">Explicação da IA:</h4>
          <div className="space-y-3">
            {highlightableTexts.map((text, index) => {
              const isSelected = selectedText.includes(text);
              const isError = currentChallenge.errors.some((e) =>
                text.includes(e.text)
              );
              const showResult = submitted && isError;

              return (
                <div
                  key={index}
                  onClick={() => toggleSelection(text)}
                  className={`p-4 rounded-lg cursor-pointer transition-all ${
                    isSelected && !submitted
                      ? "bg-[#ff6b35] text-white shadow-lg"
                      : showResult
                      ? "bg-[#dc2626] text-white shadow-lg"
                      : "bg-white hover:bg-[#e9ebef]"
                  } ${submitted ? "cursor-default" : ""}`}
                >
                  <p className={isSelected && !submitted ? "text-white" : "text-[#1e3a5f]"}>
                    {text}
                  </p>
                  {showResult && (
                    <div className="mt-3 pt-3 border-t border-white/20">
                      <p className="text-sm text-white/90">
                        <span className="font-medium">❌ Erro identificado:</span>{" "}
                        {
                          currentChallenge.errors.find((e) => text.includes(e.text))
                            ?.reason
                        }
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {!submitted ? (
          <button
            onClick={handleSubmit}
            disabled={selectedText.length === 0}
            className="flex items-center gap-2 px-6 py-3 bg-[#ff6b35] text-white rounded-lg hover:bg-[#ff5722] transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
            Submeter Resposta
          </button>
        ) : (
          <div className="bg-[#4ade80]/10 border-l-4 border-[#4ade80] p-4 rounded">
            <p className="text-[#1e3a5f]">
              <span className="font-medium">✓ Desafio concluído!</span> Encontraste{" "}
              {selectedText.filter((text) =>
                currentChallenge.errors.some((e) => text.includes(e.text))
              ).length}{" "}
              de {currentChallenge.errors.length} erros.
            </p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-[#1e3a5f] mb-4">Como Funciona</h3>
        <ul className="space-y-2 text-[#717182]">
          <li className="flex gap-2">
            <span className="text-[#ff6b35]">•</span>
            <span>
              A IA apresenta uma explicação sobre um tópico definido pelo professor
            </span>
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

function FeedbackInboxView() {
  const feedbacks = [
    {
      id: 1,
      from: "Prof. Carlos Silva",
      message: "Excelente progresso esta semana! Continue assim.",
      date: "05/05/2026",
      time: "14:30",
      read: false,
    },
    {
      id: 2,
      from: "Prof. Carlos Silva",
      message: "Sugiro rever o material sobre derivadas antes do próximo teste.",
      date: "03/05/2026",
      time: "10:15",
      read: true,
    },
    {
      id: 3,
      from: "Prof. Carlos Silva",
      message:
        "Bom trabalho no desafio de debunking! Identificaste todos os erros corretamente.",
      date: "01/05/2026",
      time: "16:45",
      read: true,
    },
  ];

  return (
    <div>
      <h1 className="text-[#1e3a5f] mb-6">Caixa de Entrada de Feedback</h1>

      <div className="grid gap-4">
        {feedbacks.map((feedback) => (
          <div
            key={feedback.id}
            className={`bg-white rounded-xl shadow-md p-6 transition-all hover:shadow-lg ${
              !feedback.read ? "border-l-4 border-[#ff6b35]" : ""
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#1e3a5f] text-white rounded-full flex items-center justify-center">
                  {feedback.from.split(" ")[1].charAt(0)}
                </div>
                <div>
                  <div className="text-[#1e3a5f] flex items-center gap-2">
                    {feedback.from}
                    {!feedback.read && (
                      <span className="px-2 py-0.5 bg-[#ff6b35] text-white text-xs rounded-full">
                        Novo
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-[#717182]">
                    {feedback.date} às {feedback.time}
                  </div>
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
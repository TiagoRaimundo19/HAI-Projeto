import { useState } from "react";
import { Sidebar } from "../components/Sidebar";
import {
  Users,
  Upload,
  Flame,
  CheckCircle,
  MessageSquare,
  Plus,
  Trash2,
  Send,
} from "lucide-react";

type View = "students" | "vault" | "heatmap" | "debunking" | "feedback";

export function TeacherDashboard() {
  const [activeView, setActiveView] = useState<View>("students");

  const sidebarItems = [
    {
      icon: <Users className="w-5 h-5" />,
      label: "Gestão de Alunos",
      active: activeView === "students",
      onClick: () => setActiveView("students"),
    },
    {
      icon: <Upload className="w-5 h-5" />,
      label: "Knowledge Vault",
      active: activeView === "vault",
      onClick: () => setActiveView("vault"),
    },
    {
      icon: <Flame className="w-5 h-5" />,
      label: "Heatmap de Dúvidas",
      active: activeView === "heatmap",
      onClick: () => setActiveView("heatmap"),
    },
    {
      icon: <CheckCircle className="w-5 h-5" />,
      label: "Relatório Debunking",
      active: activeView === "debunking",
      onClick: () => setActiveView("debunking"),
    },
    {
      icon: <MessageSquare className="w-5 h-5" />,
      label: "Centro de Feedback",
      active: activeView === "feedback",
      onClick: () => setActiveView("feedback"),
    },
  ];

  return (
    <div className="flex h-screen bg-[#f5f5f7]">
      <Sidebar items={sidebarItems} userType="teacher" />

      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {activeView === "students" && <StudentsView />}
          {activeView === "vault" && <VaultView />}
          {activeView === "heatmap" && <HeatmapView />}
          {activeView === "debunking" && <DebunkingView />}
          {activeView === "feedback" && <FeedbackView />}
        </div>
      </main>
    </div>
  );
}

function StudentsView() {
  const students = [
    { id: 1, name: "Ana Silva", turma: "Turma A", email: "ana.silva@email.com" },
    { id: 2, name: "João Costa", turma: "Turma A", email: "joao.costa@email.com" },
    { id: 3, name: "Maria Santos", turma: "Turma B", email: "maria.santos@email.com" },
    { id: 4, name: "Pedro Oliveira", turma: "Turma B", email: "pedro.oliveira@email.com" },
    { id: 5, name: "Sofia Rodrigues", turma: "Turma A", email: "sofia.rodrigues@email.com" },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-[#1e3a5f]">Gestão de Alunos</h1>
        <button className="flex items-center gap-2 px-6 py-3 bg-[#ff6b35] text-white rounded-lg hover:bg-[#ff5722] transition-colors shadow-lg">
          <Plus className="w-5 h-5" />
          Adicionar Aluno
        </button>
      </div>

      <div className="grid gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-[#1e3a5f] mb-4">Turma A</h3>
          <div className="space-y-3">
            {students
              .filter((s) => s.turma === "Turma A")
              .map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-4 bg-[#f3f3f5] rounded-lg hover:bg-[#e9ebef] transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#1e3a5f] text-white rounded-full flex items-center justify-center">
                      {student.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-[#1e3a5f]">{student.name}</div>
                      <div className="text-sm text-[#717182]">{student.email}</div>
                    </div>
                  </div>
                  <button className="text-[#d4183d] hover:bg-[#d4183d]/10 p-2 rounded-lg transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-[#1e3a5f] mb-4">Turma B</h3>
          <div className="space-y-3">
            {students
              .filter((s) => s.turma === "Turma B")
              .map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-4 bg-[#f3f3f5] rounded-lg hover:bg-[#e9ebef] transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#1e3a5f] text-white rounded-full flex items-center justify-center">
                      {student.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-[#1e3a5f]">{student.name}</div>
                      <div className="text-sm text-[#717182]">{student.email}</div>
                    </div>
                  </div>
                  <button className="text-[#d4183d] hover:bg-[#d4183d]/10 p-2 rounded-lg transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function VaultView() {
  const materials = [
    { id: 1, name: "Slides - Derivadas.pdf", type: "PDF", date: "01/05/2026" },
    { id: 2, name: "Nota de Voz - Introdução.mp3", type: "Áudio", date: "28/04/2026" },
    { id: 3, name: "Critérios Avaliação - Teste 1.pdf", type: "PDF", date: "25/04/2026" },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-[#1e3a5f]">Knowledge Vault</h1>
        <button className="flex items-center gap-2 px-6 py-3 bg-[#ff6b35] text-white rounded-lg hover:bg-[#ff5722] transition-colors shadow-lg">
          <Upload className="w-5 h-5" />
          Upload Material
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="mb-6 p-6 bg-[#1e3a5f]/5 border-2 border-dashed border-[#1e3a5f]/20 rounded-xl text-center">
          <Upload className="w-12 h-12 text-[#1e3a5f] mx-auto mb-3" />
          <p className="text-[#1e3a5f] mb-2">
            Arraste ficheiros ou clique para fazer upload
          </p>
          <p className="text-sm text-[#717182]">
            Suporta: PDF, PPT, PPTX, MP3, WAV, DOC, DOCX
          </p>
        </div>

        <h3 className="text-[#1e3a5f] mb-4">Materiais Carregados</h3>
        <div className="space-y-3">
          {materials.map((material) => (
            <div
              key={material.id}
              className="flex items-center justify-between p-4 bg-[#f3f3f5] rounded-lg hover:bg-[#e9ebef] transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#ff6b35] text-white rounded-lg flex items-center justify-center">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[#1e3a5f]">{material.name}</div>
                  <div className="text-sm text-[#717182]">
                    {material.type} • {material.date}
                  </div>
                </div>
              </div>
              <button className="text-[#d4183d] hover:bg-[#d4183d]/10 p-2 rounded-lg transition-colors">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HeatmapView() {
  const topics = [
    { name: "Derivadas", level: 4, questions: 28 },
    { name: "Integrais", level: 3, questions: 19 },
    { name: "Limites", level: 2, questions: 12 },
    { name: "Funções Trigonométricas", level: 3, questions: 21 },
    { name: "Matrizes", level: 1, questions: 7 },
    { name: "Vetores", level: 2, questions: 10 },
  ];

  const getHeatColor = (level: number) => {
    const colors = [
      "bg-[#fef3c7]",
      "bg-[#fde68a]",
      "bg-[#fbbf24]",
      "bg-[#f97316]",
      "bg-[#dc2626]",
    ];
    return colors[level - 1] || colors[0];
  };

  const getTextColor = (level: number) => {
    return level >= 3 ? "text-white" : "text-[#1e3a5f]";
  };

  return (
    <div>
      <h1 className="text-[#1e3a5f] mb-6">Heatmap de Dúvidas (Pré-Aula)</h1>

      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <Flame className="w-6 h-6 text-[#ff6b35]" />
          <div>
            <h3 className="text-[#1e3a5f]">Análise de Dificuldades da Turma</h3>
            <p className="text-sm text-[#717182]">
              Tópicos com maior número de perguntas antes da aula
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {topics.map((topic) => (
            <div
              key={topic.name}
              className={`${getHeatColor(topic.level)} ${getTextColor(
                topic.level
              )} p-6 rounded-xl shadow-md transition-transform hover:scale-105 cursor-pointer`}
            >
              <div className="flex justify-between items-start mb-2">
                <h4>{topic.name}</h4>
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Flame
                      key={i}
                      className={`w-4 h-4 ${
                        i < topic.level
                          ? topic.level >= 3
                            ? "fill-white"
                            : "fill-[#ff6b35]"
                          : "opacity-20"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm opacity-90">
                {topic.questions} perguntas registadas
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-[#1e3a5f] mb-4">Legenda</h3>
        <div className="flex flex-wrap gap-4">
          {[
            { level: 1, label: "Baixo" },
            { level: 2, label: "Moderado" },
            { level: 3, label: "Elevado" },
            { level: 4, label: "Muito Elevado" },
            { level: 5, label: "Crítico" },
          ].map((item) => (
            <div key={item.level} className="flex items-center gap-2">
              <div className={`w-6 h-6 ${getHeatColor(item.level)} rounded`} />
              <span className="text-sm text-[#717182]">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DebunkingView() {
  const results = [
    {
      id: 1,
      student: "Ana Silva",
      topic: "Derivadas",
      errorsFound: 3,
      totalErrors: 3,
      success: true,
    },
    {
      id: 2,
      student: "João Costa",
      topic: "Derivadas",
      errorsFound: 2,
      totalErrors: 3,
      success: false,
    },
    {
      id: 3,
      student: "Maria Santos",
      topic: "Integrais",
      errorsFound: 3,
      totalErrors: 3,
      success: true,
    },
    {
      id: 4,
      student: "Pedro Oliveira",
      topic: "Integrais",
      errorsFound: 1,
      totalErrors: 3,
      success: false,
    },
    {
      id: 5,
      student: "Sofia Rodrigues",
      topic: "Derivadas",
      errorsFound: 3,
      totalErrors: 3,
      success: true,
    },
  ];

  return (
    <div>
      <h1 className="text-[#1e3a5f] mb-6">Relatório de Debunking</h1>

      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <CheckCircle className="w-6 h-6 text-[#ff6b35]" />
          <div>
            <h3 className="text-[#1e3a5f]">Desafio de Alucinação Controlada</h3>
            <p className="text-sm text-[#717182]">
              Alunos que conseguiram identificar erros deliberados na explicação da IA
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-[#1e3a5f]/5 p-6 rounded-xl">
            <div className="text-3xl text-[#1e3a5f] mb-1">
              {results.filter((r) => r.success).length}
            </div>
            <div className="text-sm text-[#717182]">Alunos com Sucesso Total</div>
          </div>
          <div className="bg-[#ff6b35]/5 p-6 rounded-xl">
            <div className="text-3xl text-[#ff6b35] mb-1">
              {results.filter((r) => !r.success).length}
            </div>
            <div className="text-sm text-[#717182]">Necessitam Reforço</div>
          </div>
          <div className="bg-[#2c4f7c]/5 p-6 rounded-xl">
            <div className="text-3xl text-[#2c4f7c] mb-1">
              {Math.round(
                (results.filter((r) => r.success).length / results.length) * 100
              )}
              %
            </div>
            <div className="text-sm text-[#717182]">Taxa de Sucesso</div>
          </div>
        </div>

        <div className="space-y-3">
          {results.map((result) => (
            <div
              key={result.id}
              className={`flex items-center justify-between p-4 rounded-lg ${
                result.success ? "bg-[#4ade80]/10" : "bg-[#fbbf24]/10"
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 ${
                    result.success ? "bg-[#4ade80]" : "bg-[#fbbf24]"
                  } text-white rounded-full flex items-center justify-center`}
                >
                  {result.student.charAt(0)}
                </div>
                <div>
                  <div className="text-[#1e3a5f]">{result.student}</div>
                  <div className="text-sm text-[#717182]">{result.topic}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[#1e3a5f]">
                  {result.errorsFound}/{result.totalErrors} erros detetados
                </div>
                <div
                  className={`text-sm ${
                    result.success ? "text-[#4ade80]" : "text-[#fbbf24]"
                  }`}
                >
                  {result.success ? "✓ Sucesso" : "○ Parcial"}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FeedbackView() {
  const students = [
    { id: 1, name: "Ana Silva", turma: "Turma A" },
    { id: 2, name: "João Costa", turma: "Turma A" },
    { id: 3, name: "Maria Santos", turma: "Turma B" },
    { id: 4, name: "Pedro Oliveira", turma: "Turma B" },
    { id: 5, name: "Sofia Rodrigues", turma: "Turma A" },
  ];

  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  const quickMessages = [
    "Bom trabalho! Continue assim.",
    "Atenção ao detalhe nos próximos exercícios.",
    "Excelente progresso esta semana!",
    "Sugiro rever o material sobre derivadas.",
  ];

  return (
    <div>
      <h1 className="text-[#1e3a5f] mb-6">Centro de Feedback</h1>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-white rounded-xl shadow-md p-6">
          <h3 className="text-[#1e3a5f] mb-4">Selecionar Aluno</h3>
          <div className="space-y-2">
            {students.map((student) => (
              <button
                key={student.id}
                onClick={() => setSelectedStudent(student.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  selectedStudent === student.id
                    ? "bg-[#ff6b35] text-white"
                    : "bg-[#f3f3f5] text-[#1e3a5f] hover:bg-[#e9ebef]"
                }`}
              >
                <div
                  className={`w-8 h-8 ${
                    selectedStudent === student.id
                      ? "bg-white text-[#ff6b35]"
                      : "bg-[#1e3a5f] text-white"
                  } rounded-full flex items-center justify-center text-sm`}
                >
                  {student.name.charAt(0)}
                </div>
                <div className="text-left flex-1">
                  <div className="text-sm">{student.name}</div>
                  <div
                    className={`text-xs ${
                      selectedStudent === student.id
                        ? "text-white/80"
                        : "text-[#717182]"
                    }`}
                  >
                    {student.turma}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="md:col-span-2 bg-white rounded-xl shadow-md p-6">
          {selectedStudent ? (
            <>
              <h3 className="text-[#1e3a5f] mb-4">
                Enviar Feedback para{" "}
                {students.find((s) => s.id === selectedStudent)?.name}
              </h3>

              <div className="mb-6">
                <label className="text-[#1e3a5f] block mb-3">
                  Mensagens Rápidas
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {quickMessages.map((msg, index) => (
                    <button
                      key={index}
                      onClick={() => setMessage(msg)}
                      className="text-left p-3 bg-[#1e3a5f]/5 text-[#1e3a5f] rounded-lg hover:bg-[#1e3a5f]/10 transition-colors text-sm"
                    >
                      {msg}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="text-[#1e3a5f] block mb-3">
                  Mensagem Personalizada
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full h-32 p-4 bg-[#f3f3f5] border border-[#e9ebef] rounded-lg text-[#1e3a5f] placeholder-[#717182] focus:outline-none focus:ring-2 focus:ring-[#ff6b35] resize-none"
                  placeholder="Escreva o seu feedback..."
                />
              </div>

              <button
                disabled={!message.trim()}
                className="flex items-center gap-2 px-6 py-3 bg-[#ff6b35] text-white rounded-lg hover:bg-[#ff5722] transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
                Enviar Feedback
              </button>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-[#717182]">
              Selecione um aluno para enviar feedback
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

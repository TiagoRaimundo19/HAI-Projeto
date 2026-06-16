import { useState } from "react";
import { useNavigate } from "react-router";
import { User, Check, ArrowRight } from "lucide-react";

export function StudentSetup() {
  const navigate = useNavigate();
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("");
  const [school, setSchool] = useState("");

  const availableSubjects = [
    { id: "matematica", name: "Matemática", icon: "∑", color: "bg-blue-500" },
    { id: "fisica", name: "Física", icon: "⚛", color: "bg-purple-500" },
    { id: "quimica", name: "Química", icon: "⚗", color: "bg-green-500" },
    { id: "biologia", name: "Biologia", icon: "🧬", color: "bg-teal-500" },
    { id: "portugues", name: "Português", icon: "📖", color: "bg-red-500" },
    { id: "ingles", name: "Inglês", icon: "🌍", color: "bg-indigo-500" },
    { id: "historia", name: "História", icon: "📜", color: "bg-amber-500" },
    { id: "geografia", name: "Geografia", icon: "🗺", color: "bg-cyan-500" },
    { id: "filosofia", name: "Filosofia", icon: "🤔", color: "bg-violet-500" },
    { id: "informatica", name: "Informática", icon: "💻", color: "bg-slate-500" },
    { id: "economia", name: "Economia", icon: "💰", color: "bg-emerald-500" },
    { id: "educacao-fisica", name: "Ed. Física", icon: "⚽", color: "bg-orange-500" },
  ];

  const grades = [
    "7º Ano",
    "8º Ano",
    "9º Ano",
    "10º Ano",
    "11º Ano",
    "12º Ano",
    "Universidade",
  ];

  const toggleSubject = (subjectId: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subjectId)
        ? prev.filter((id) => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  const handleComplete = () => {
    // Simulação de configuração completa
    navigate("/student");
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-[#ff6b35] rounded-xl flex items-center justify-center">
              <User className="w-9 h-9 text-white" />
            </div>
            <div>
              <h1 className="text-3xl text-[#1e3a5f]">Configuração do Aluno</h1>
              <p className="text-[#717182]">
                Configure o seu perfil e disciplinas que estuda
              </p>
            </div>
          </div>

          <div className="space-y-6 mb-8">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-[#1e3a5f] block mb-2">Nome Completo</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-[#f3f3f5] border border-[#e9ebef] rounded-lg text-[#1e3a5f] placeholder-[#717182] focus:outline-none focus:ring-2 focus:ring-[#ff6b35]"
                  placeholder="Ex: Ana Silva"
                />
              </div>

              <div>
                <label className="text-[#1e3a5f] block mb-2">Ano Escolar</label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full px-4 py-3 bg-[#f3f3f5] border border-[#e9ebef] rounded-lg text-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-[#ff6b35]"
                >
                  <option value="">Selecione o ano</option>
                  {grades.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-[#1e3a5f] block mb-2">
                Escola / Instituição
              </label>
              <input
                type="text"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                className="w-full px-4 py-3 bg-[#f3f3f5] border border-[#e9ebef] rounded-lg text-[#1e3a5f] placeholder-[#717182] focus:outline-none focus:ring-2 focus:ring-[#ff6b35]"
                placeholder="Ex: Escola Secundária de Lisboa"
              />
            </div>
          </div>

          <div className="mb-8">
            <label className="text-[#1e3a5f] block mb-4">
              Selecione as disciplinas que estuda
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {availableSubjects.map((subject) => {
                const isSelected = selectedSubjects.includes(subject.id);
                return (
                  <button
                    key={subject.id}
                    onClick={() => toggleSubject(subject.id)}
                    className={`relative p-4 rounded-xl border-2 transition-all ${
                      isSelected
                        ? "border-[#ff6b35] bg-[#ff6b35]/5 scale-105"
                        : "border-[#e9ebef] bg-white hover:border-[#ff6b35]/30 hover:scale-105"
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-3xl mb-2">{subject.icon}</div>
                      <div className="text-sm text-[#1e3a5f]">{subject.name}</div>
                    </div>
                    {isSelected && (
                      <div className="absolute -top-2 -right-2 w-7 h-7 bg-[#ff6b35] rounded-full flex items-center justify-center shadow-lg">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            {selectedSubjects.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {selectedSubjects.map((subjectId) => {
                  const subject = availableSubjects.find((s) => s.id === subjectId);
                  return (
                    <div
                      key={subjectId}
                      className="px-3 py-1 bg-[#ff6b35] text-white text-sm rounded-full flex items-center gap-2"
                    >
                      <span>{subject?.icon}</span>
                      <span>{subject?.name}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex justify-between items-center pt-6 border-t border-[#e9ebef]">
            <button
              onClick={() => navigate("/student/login")}
              className="px-6 py-3 text-[#717182] hover:text-[#1e3a5f] transition-colors"
            >
              Voltar
            </button>
            <button
              onClick={handleComplete}
              disabled={selectedSubjects.length === 0 || !name || !grade || !school}
              className="flex items-center gap-2 px-8 py-3 bg-[#ff6b35] text-white rounded-lg hover:bg-[#ff5722] transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Começar a Estudar
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-[#1e3a5f]/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">🤖</span>
            </div>
            <h4 className="text-[#1e3a5f] mb-2">IA Personalizada</h4>
            <p className="text-sm text-[#717182]">
              Respostas adaptadas aos seus materiais
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-[#ff6b35]/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">🎯</span>
            </div>
            <h4 className="text-[#1e3a5f] mb-2">Desafios Práticos</h4>
            <p className="text-sm text-[#717182]">
              Aprenda identificando erros da IA
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-[#2c4f7c]/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">📊</span>
            </div>
            <h4 className="text-[#1e3a5f] mb-2">Feedback Direto</h4>
            <p className="text-sm text-[#717182]">
              Receba orientações dos professores
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

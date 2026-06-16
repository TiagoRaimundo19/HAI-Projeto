import { useState } from "react";
import { useNavigate } from "react-router";
import { GraduationCap, Check, ArrowRight } from "lucide-react";

export function TeacherSetup() {
  const navigate = useNavigate();
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [school, setSchool] = useState("");

  const availableSubjects = [
    { id: "matematica", name: "Matemática", icon: "∑" },
    { id: "fisica", name: "Física", icon: "⚛" },
    { id: "quimica", name: "Química", icon: "⚗" },
    { id: "biologia", name: "Biologia", icon: "🧬" },
    { id: "portugues", name: "Português", icon: "📖" },
    { id: "ingles", name: "Inglês", icon: "🌍" },
    { id: "historia", name: "História", icon: "📜" },
    { id: "geografia", name: "Geografia", icon: "🗺" },
    { id: "filosofia", name: "Filosofia", icon: "🤔" },
    { id: "informatica", name: "Informática", icon: "💻" },
    { id: "economia", name: "Economia", icon: "💰" },
    { id: "educacao-fisica", name: "Educação Física", icon: "⚽" },
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
    navigate("/teacher");
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-[#1e3a5f] rounded-xl flex items-center justify-center">
              <GraduationCap className="w-9 h-9 text-white" />
            </div>
            <div>
              <h1 className="text-3xl text-[#1e3a5f]">Configuração do Professor</h1>
              <p className="text-[#717182]">
                Configure o seu perfil e disciplinas que leciona
              </p>
            </div>
          </div>

          <div className="space-y-6 mb-8">
            <div>
              <label className="text-[#1e3a5f] block mb-2">Nome Completo</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-[#f3f3f5] border border-[#e9ebef] rounded-lg text-[#1e3a5f] placeholder-[#717182] focus:outline-none focus:ring-2 focus:ring-[#ff6b35]"
                placeholder="Ex: Carlos Silva"
              />
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
              Selecione as disciplinas que leciona
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
                        ? "border-[#ff6b35] bg-[#ff6b35]/5"
                        : "border-[#e9ebef] bg-white hover:border-[#ff6b35]/30"
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-3xl mb-2">{subject.icon}</div>
                      <div className="text-sm text-[#1e3a5f]">{subject.name}</div>
                    </div>
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-[#ff6b35] rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            {selectedSubjects.length > 0 && (
              <p className="mt-3 text-sm text-[#ff6b35]">
                {selectedSubjects.length} disciplina(s) selecionada(s)
              </p>
            )}
          </div>

          <div className="flex justify-between items-center pt-6 border-t border-[#e9ebef]">
            <button
              onClick={() => navigate("/teacher/login")}
              className="px-6 py-3 text-[#717182] hover:text-[#1e3a5f] transition-colors"
            >
              Voltar
            </button>
            <button
              onClick={handleComplete}
              disabled={selectedSubjects.length === 0 || !name || !school}
              className="flex items-center gap-2 px-8 py-3 bg-[#ff6b35] text-white rounded-lg hover:bg-[#ff5722] transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Concluir Configuração
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="bg-[#1e3a5f]/5 rounded-xl p-6">
          <h3 className="text-[#1e3a5f] mb-3">💡 Dica</h3>
          <p className="text-[#717182] text-sm">
            Poderá adicionar ou remover disciplinas a qualquer momento nas
            configurações do seu perfil. As disciplinas selecionadas ajudarão a IA a
            personalizar o conteúdo para os seus alunos.
          </p>
        </div>
      </div>
    </div>
  );
}

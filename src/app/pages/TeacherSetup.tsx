import { useState } from "react";
import { useNavigate } from "react-router";
import { GraduationCap, Check, ArrowRight, Plus, X } from "lucide-react";

export function TeacherSetup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [school, setSchool] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  
  // --- NOVOS ESTADOS ---
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
  const [turmas, setTurmas] = useState<string[]>([]);
  const [novaTurmaInput, setNovaTurmaInput] = useState("");
  const [error, setError] = useState<string | null>(null);

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

  // Anos escolares idênticos aos do aluno para haver correspondência perfeita
  const availableGrades = [
    "7º Ano", "8º Ano", "9º Ano", "10º Ano", "11º Ano", "12º Ano", "Universidade"
  ];

  const toggleSubject = (subjectId: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subjectId) ? prev.filter((id) => id !== subjectId) : [...prev, subjectId]
    );
  };

  const toggleGrade = (grade: string) => {
    setSelectedGrades((prev) =>
      prev.includes(grade) ? prev.filter((g) => g !== grade) : [...prev, grade]
    );
  };

  // Adiciona uma nova turma à lista local
  const handleAddTurma = (e: React.FormEvent) => {
    e.preventDefault();
    const nomeLimpo = novaTurmaInput.trim();
    if (!nomeLimpo) return;

    if (turmas.includes(nomeLimpo)) {
      alert("Esta turma já foi adicionada!");
      return;
    }

    setTurmas([...turmas, nomeLimpo]);
    setNovaTurmaInput("");
  };

  // Remove uma turma da lista local
  const handleRemoveTurma = (turmaParaRemover: string) => {
    setTurmas(turmas.filter((t) => t !== turmaParaRemover));
  };

  const handleComplete = async () => {
    setError(null);
    const teacherId = localStorage.getItem("teacherId");

    if (!teacherId) {
      setError("ID do professor não encontrado. Por favor, faça login novamente.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/professores/configurar/${teacherId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome: name,
          instituicao: school,
          disciplinas: selectedSubjects,
          anosEscolares: selectedGrades, // Envia para o backend
          turmas: turmas                 // Envia para o backend
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.erro || "Erro ao salvar a configuração.");
        return;
      }

      console.log("Sucesso:", data.mensagem);
      navigate("/teacher");

    } catch (err) {
      console.error("Erro ao ligar ao servidor:", err);
      setError("Não foi possível ligar ao servidor. Verifique se o backend está ativo.");
    }
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
              <p className="text-[#717182]">Configure o seu perfil, anos letivos e turmas</p>
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
                  className="w-full px-4 py-3 bg-[#f3f3f5] border border-[#e9ebef] rounded-lg text-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-[#ff6b35]"
                  placeholder="Ex: Carlos Silva"
                />
              </div>

              <div>
                <label className="text-[#1e3a5f] block mb-2">Escola / Instituição</label>
                <input
                  type="text"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  className="w-full px-4 py-3 bg-[#f3f3f5] border border-[#e9ebef] rounded-lg text-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-[#ff6b35]"
                  placeholder="Ex: Escola Secundária de Lisboa"
                />
              </div>
            </div>
          </div>

          {/* NOVO BLOCO: SELECIONAR ANOS ESCOLARES */}
          <div className="mb-8">
            <label className="text-[#1e3a5f] block mb-3 font-medium">Anos Escolares que Leciona</label>
            <div className="flex flex-wrap gap-2">
              {availableGrades.map((grade) => {
                const isSelected = selectedGrades.includes(grade);
                return (
                  <button
                    key={grade}
                    type="button"
                    onClick={() => toggleGrade(grade)}
                    className={`px-4 py-2 rounded-full border text-sm transition-all ${
                      isSelected
                        ? "bg-[#1e3a5f] text-white border-[#1e3a5f]"
                        : "bg-white text-[#717182] border-[#e9ebef] hover:border-[#1e3a5f]/40"
                    }`}
                  >
                    {grade} {isSelected && "✓"}
                  </button>
                );
              })}
            </div>
          </div>

          {/* NOVO BLOCO: ADICIONAR TURMAS DINÂMICAS */}
          <div className="mb-8 bg-[#f8f9fa] p-5 rounded-xl border border-[#e9ebef]">
            <label className="text-[#1e3a5f] block mb-2 font-medium">Gestão de Turmas</label>
            <p className="text-xs text-[#717182] mb-3">Adicione todas as turmas que acompanha este ano (Ex: Turma A, Turma C)</p>
            
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={novaTurmaInput}
                onChange={(e) => setNovaTurmaInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddTurma(e)}
                className="flex-1 px-4 py-2 bg-white border border-[#e9ebef] rounded-lg text-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-[#ff6b35]"
                placeholder="Nome da turma"
              />
              <button
                type="button"
                onClick={handleAddTurma}
                className="px-4 py-2 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#2c4f7c] flex items-center gap-1 text-sm"
              >
                <Plus className="w-4 h-4" /> Adicionar
              </button>
            </div>

            {/* Listagem das turmas criadas */}
            <div className="flex flex-wrap gap-2">
              {turmas.map((turma) => (
                <span
                  key={turma}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#ff6b35]/40 text-[#ff6b35] text-sm font-medium rounded-lg shadow-sm"
                >
                  {turma}
                  <button
                    type="button"
                    onClick={() => handleRemoveTurma(turma)}
                    className="text-[#717182] hover:text-red-500 rounded-full transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
              {turmas.length === 0 && (
                <span className="text-sm text-[#717182] italic">Nenhuma turma adicionada ainda.</span>
              )}
            </div>
          </div>

          {/* SELEÇÃO DE DISCIPLINAS */}
          <div className="mb-8">
            <label className="text-[#1e3a5f] block mb-4 font-medium">Selecione as disciplinas que leciona</label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {availableSubjects.map((subject) => {
                const isSelected = selectedSubjects.includes(subject.id);
                return (
                  <button
                    key={subject.id}
                    type="button"
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
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-center">
              <p className="text-sm font-medium text-red-600">⚠️ {error}</p>
            </div>
          )}

          <div className="flex justify-between items-center pt-6 border-t border-[#e9ebef]">
            <button
              type="button"
              onClick={() => navigate("/teacher/login")}
              className="px-6 py-3 text-[#717182] hover:text-[#1e3a5f] transition-colors"
            >
              Voltar
            </button>
            <button
              type="button"
              onClick={handleComplete}
              // O botão só ativa se tiver preenchido tudo, incluindo pelo menos 1 ano escolar e 1 turma!
              disabled={selectedSubjects.length === 0 || !name || !school || selectedGrades.length === 0 || turmas.length === 0}
              className="flex items-center gap-2 px-8 py-3 bg-[#ff6b35] text-white rounded-lg hover:bg-[#ff5722] transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Concluir Configuração
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
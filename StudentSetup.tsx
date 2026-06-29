import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { User, Check, ArrowRight } from "lucide-react";

export function StudentSetup() {
  const navigate = useNavigate();
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("");
  const [school, setSchool] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [schools, setSchools] = useState<string[]>([]);
  
  const [assignedTurma, setAssignedTurma] = useState<string | null>(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/escolas")
      .then(res => res.json())
      .then(data => setSchools(data.escolas || []))
      .catch(() => setSchools([]));
  }, []);

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
    { id: "educacao-fisica", name: "Ed. Física", icon: "⚽" },
  ];

  const grades = [
    "7º Ano", "8º Ano", "9º Ano", "10º Ano", "11º Ano", "12º Ano", "Universidade"
  ];

  const toggleSubject = (subjectId: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subjectId) ? prev.filter((id) => id !== subjectId) : [...prev, subjectId]
    );
  };

  const handleComplete = async () => {
    setError(null);
    const studentId = localStorage.getItem("studentId");

    if (!studentId) {
      setError("ID do aluno não encontrado. Por favor, volte a fazer login.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/alunos/configurar/${studentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome: name,
          anoEscolar: grade,
          instituicao: school,
          disciplinas: selectedSubjects,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.erro || "Erro ao salvar o perfil do aluno.");
        return;
      }

      setAssignedTurma(data.aluno.turma);

    } catch (err) {
      console.error("Erro ao comunicar com o servidor:", err);
      setError("Não foi possível ligar ao servidor. Verifique se o backend está ativo.");
    }
  };

  if (assignedTurma) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center p-6 animate-fade-in">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center border border-[#e9ebef]">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <Check className="w-10 h-10 text-green-600 animate-bounce" />
          </div>
          
          <h1 className="text-3xl font-bold text-[#1e3a5f] mb-2">Inscrição Concluída!</h1>
          <p className="text-[#717182] mb-6">O teu perfil foi processado e configurado com sucesso.</p>
          
          <div className="bg-[#ff6b35]/5 border border-[#ff6b35]/20 rounded-2xl p-6 mb-8">
            <span className="text-xs font-semibold text-[#ff6b35] uppercase tracking-wider block mb-1">Turma Atribuída</span>
            <div className="text-4xl font-extrabold text-[#1e3a5f] tracking-tight">{assignedTurma}</div>
          </div>

          <button
            onClick={() => navigate("/student")}
            className="w-full flex items-center justify-center gap-2 py-4 bg-[#ff6b35] text-white font-medium rounded-xl hover:bg-[#ff5722] transition-all shadow-lg transform hover:-translate-y-0.5"
          >
            Entrar no Bot de Estudo
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

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
              <p className="text-[#717182]">Configure o seu perfil e disciplinas que estuda</p>
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
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-[#1e3a5f] block mb-2">Escola / Instituição</label>
              <select
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                className="w-full px-4 py-3 bg-[#f3f3f5] border border-[#e9ebef] rounded-lg text-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-[#ff6b35]"
              >
                <option value="">Selecione a escola</option>
                {schools.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              {schools.length === 0 && (
                <p className="text-xs text-[#717182] mt-1">
                  Nenhuma escola disponível — um professor tem de se registar primeiro.
                </p>
              )}
            </div>
          </div>

          <div className="mb-8">
            <label className="text-[#1e3a5f] block mb-4">Selecione as disciplinas que estuda</label>
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
                        ? "border-[#ff6b35] bg-[#ff6b35]/5 scale-105"
                        : "border-[#e9ebef] bg-white hover:border-[#ff6b35]/30 hover:scale-105"
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

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-center">
              <p className="text-sm font-medium text-red-600">⚠️ {error}</p>
            </div>
          )}

          <div className="flex justify-between items-center pt-6 border-t border-[#e9ebef]">
            <button
              type="button"
              onClick={() => navigate("/student/login")}
              className="px-6 py-3 text-[#717182] hover:text-[#1e3a5f] transition-colors"
            >
              Voltar
            </button>
            <button
              type="button"
              onClick={handleComplete}
              disabled={selectedSubjects.length === 0 || !name || !grade || !school}
              className="flex items-center gap-2 px-8 py-3 bg-[#ff6b35] text-white rounded-lg hover:bg-[#ff5722] transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Começar a Estudar
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
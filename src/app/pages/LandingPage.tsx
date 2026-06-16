import { useNavigate } from "react-router";
import { GraduationCap, User } from "lucide-react";

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e3a5f] to-[#2c4f7c] flex items-center justify-center p-6">
      <div className="max-w-5xl w-full">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 rounded-2xl mb-6 backdrop-blur-sm">
            <GraduationCap className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl text-white mb-4">AI-Assistant Teacher</h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Plataforma de educação inteligente que conecta professores e alunos através de IA contextual
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <button
            onClick={() => navigate("/teacher/login")}
            className="group relative bg-white rounded-2xl p-10 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-2"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-[#1e3a5f] rounded-full flex items-center justify-center mb-6 group-hover:bg-[#ff6b35] transition-colors duration-300">
                <GraduationCap className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-3xl text-[#1e3a5f] mb-3">Sou Professor</h2>
              <p className="text-[#717182]">
                Gerir alunos, criar conteúdo educativo e acompanhar o progresso da turma
              </p>
            </div>
            <div className="absolute inset-0 border-4 border-transparent group-hover:border-[#ff6b35] rounded-2xl transition-colors duration-300" />
          </button>

          <button
            onClick={() => navigate("/student/login")}
            className="group relative bg-white rounded-2xl p-10 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-2"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-[#1e3a5f] rounded-full flex items-center justify-center mb-6 group-hover:bg-[#ff6b35] transition-colors duration-300">
                <User className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-3xl text-[#1e3a5f] mb-3">Sou Aluno</h2>
              <p className="text-[#717182]">
                Estudar com IA personalizada, resolver desafios e receber feedback dos professores
              </p>
            </div>
            <div className="absolute inset-0 border-4 border-transparent group-hover:border-[#ff6b35] rounded-2xl transition-colors duration-300" />
          </button>
        </div>

        <div className="mt-12 text-center">
          <p className="text-white/60 text-sm">
            Uma plataforma que transforma a educação através de inteligência artificial contextual
          </p>
        </div>
      </div>
    </div>
  );
}

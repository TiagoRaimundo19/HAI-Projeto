import { useState } from "react";
import { useNavigate } from "react-router";
import { User, Mail, Lock, ArrowLeft } from "lucide-react";

export function StudentLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulação de login - redireciona para configuração
    navigate("/student/setup");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ff6b35] to-[#ff5722] flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar
        </button>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 rounded-2xl mb-6 backdrop-blur-sm">
            <User className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl text-white mb-2">Portal do Aluno</h1>
          <p className="text-white/90">Inicie sessão para começar a estudar</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="text-[#1e3a5f] block mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#717182]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-[#f3f3f5] border border-[#e9ebef] rounded-lg text-[#1e3a5f] placeholder-[#717182] focus:outline-none focus:ring-2 focus:ring-[#ff6b35]"
                  placeholder="aluno@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[#1e3a5f] block mb-2">Palavra-passe</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#717182]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-[#f3f3f5] border border-[#e9ebef] rounded-lg text-[#1e3a5f] placeholder-[#717182] focus:outline-none focus:ring-2 focus:ring-[#ff6b35]"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-[#717182] cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-[#e9ebef] text-[#ff6b35] focus:ring-[#ff6b35]"
                />
                Lembrar-me
              </label>
              <button
                type="button"
                className="text-[#ff6b35] hover:text-[#ff5722] transition-colors"
              >
                Esqueci a palavra-passe
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#ff6b35] text-white rounded-lg hover:bg-[#ff5722] transition-colors shadow-lg"
            >
              Entrar como Aluno
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#e9ebef] text-center">
            <p className="text-[#717182] text-sm">
              Primeira vez aqui?{" "}
              <button className="text-[#ff6b35] hover:text-[#ff5722] transition-colors">
                Criar conta
              </button>
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
            <div className="text-2xl mb-1">📚</div>
            <p className="text-white/80 text-xs">Estude melhor</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
            <div className="text-2xl mb-1">🤖</div>
            <p className="text-white/80 text-xs">IA Contextual</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
            <div className="text-2xl mb-1">🎯</div>
            <p className="text-white/80 text-xs">Desafios</p>
          </div>
        </div>
      </div>
    </div>
  );
}

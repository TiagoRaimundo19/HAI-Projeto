import { useState } from "react";
import { useNavigate } from "react-router";
import { GraduationCap, Mail, Lock, ArrowLeft } from "lucide-react";

export function TeacherLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulação de login - redireciona para configuração
    navigate("/teacher/setup");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e3a5f] to-[#2c4f7c] flex items-center justify-center p-6">
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
            <GraduationCap className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl text-white mb-2">Portal do Professor</h1>
          <p className="text-white/70">Inicie sessão para gerir as suas turmas</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="text-[#1e3a5f] block mb-2">Email Institucional</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#717182]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-[#f3f3f5] border border-[#e9ebef] rounded-lg text-[#1e3a5f] placeholder-[#717182] focus:outline-none focus:ring-2 focus:ring-[#ff6b35]"
                  placeholder="professor@escola.edu"
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
                Recuperar palavra-passe
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#ff6b35] text-white rounded-lg hover:bg-[#ff5722] transition-colors shadow-lg"
            >
              Entrar como Professor
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#e9ebef] text-center">
            <p className="text-[#717182] text-sm">
              Não tem conta de professor?{" "}
              <button className="text-[#ff6b35] hover:text-[#ff5722] transition-colors">
                Solicitar acesso
              </button>
            </p>
          </div>
        </div>

        <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-xl p-4">
          <p className="text-white/80 text-sm text-center">
            🔒 Acesso seguro com autenticação institucional
          </p>
        </div>
      </div>
    </div>
  );
}

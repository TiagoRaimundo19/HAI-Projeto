import { useState } from "react";
import { useNavigate } from "react-router";
import { GraduationCap, Mail, Lock } from "lucide-react";

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulação de login - redireciona para seleção de tipo
    navigate("/select-type");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e3a5f] to-[#2c4f7c] flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 rounded-2xl mb-6 backdrop-blur-sm">
            <GraduationCap className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl text-white mb-2">AI-Assistant Teacher</h1>
          <p className="text-white/70">Inicia sessão para continuar</p>
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
                  placeholder="seu.email@exemplo.com"
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
              Entrar
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#e9ebef] text-center">
            <p className="text-[#717182] text-sm">
              Não tens conta?{" "}
              <button className="text-[#ff6b35] hover:text-[#ff5722] transition-colors">
                Regista-te aqui
              </button>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-white/60 text-sm">
            Plataforma segura de educação com IA
          </p>
        </div>
      </div>
    </div>
  );
}

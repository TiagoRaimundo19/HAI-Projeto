import { useState } from "react";
import { useNavigate } from "react-router";
import { GraduationCap, Mail, Lock, ArrowLeft } from "lucide-react";

export function TeacherLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Limpa erros anteriores ao submeter outra vez
    
    try {
      const response = await fetch("http://localhost:5000/api/professores/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

     const data = await response.json();

      if (!response.ok) {
        setError(data.erro || "Erro ao efetuar login");
        return;
      }

      localStorage.setItem("teacherId", data.professor.id);
      
      console.log("Sucesso:", data.configurado);
      
      // LOGICA DE REDIRECIONAMENTO INTELIGENTE:
      if (data.configurado) {
        // Se já configurou o perfil antes, vai direto para a página main (Dashboard)
        navigate("/teacher");
      } else {
        // Se for conta nova ou incompleta, vai para o setup
        navigate("/teacher/setup");
      } 
    } catch (error) {
      console.error("Erro ao ligar ao servidor:", error);
      setError("Não foi possível ligar ao servidor. Garante que o backend está ativo!");
    }
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

            

            <button
              type="submit"
              className="w-full py-3 bg-[#ff6b35] text-white rounded-lg hover:bg-[#ff5722] transition-colors shadow-lg"
            >
              Entrar como Professor
            </button>

            {/* O aviso bonito em vermelho caso o estado 'error' tenha algum texto */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-center animate-fade-in">
                <p className="text-sm font-medium text-red-600">⚠️ {error}</p>
              </div>
            )}
          </form>

          
        </div>

        <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-xl p-4">
          <p className="text-white/80 text-sm text-center">
            🔒 Acesso seguro com autenticação institutional
          </p>
        </div>
      </div>
    </div>
  );
}
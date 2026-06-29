import { useState, useEffect } from "react";
import { Shield, AlertTriangle, Send } from "lucide-react";

export function StudentDebunkingArena() {
  const [desafio, setDesafio] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [feedbackResult, setFeedbackResult] = useState<any>(null);

  // Simula o ID do aluno logado recuperado da sessão
  const studentId = localStorage.getItem("studentId") || "6a315cdf3f54c631a908f56a"; 

  useEffect(() => {
    fetch(`http://localhost:5000/api/alunos/${studentId}/debunking/desafio`)
      .then((res) => res.json())
      .then((data) => {
        if (data.desafioId) {
          setDesafio(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erro ao carregar desafio:", err);
        setLoading(false);
      });
  }, [studentId]);

  // Alterna a seleção de uma frase (Caçar / Desmarcar Erro)
  const handleToggleFrase = (id: number) => {
    if (feedbackResult) return; // Bloqueia interações após submetido
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSubmeterRespostas = () => {
    if (selectedIds.length === 0) {
      alert("Seleciona pelo menos uma frase que aches que contém um erro!");
      return;
    }

    setSubmitting(true);

    fetch(`http://localhost:5000/api/alunos/${studentId}/debunking/submeter`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        desafioId: desafio.desafioId,
        respostasSelecionadas: selectedIds,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setFeedbackResult(data);
      })
      .catch((err) => console.error("Erro ao submeter caçada:", err))
      .finally(() => setSubmitting(false));
  };

  if (loading) {
    return <div className="text-center py-12 text-[#717182] animate-pulse">🤖 A carregar a Arena de Desafio...</div>;
  }

  if (!desafio) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 text-center text-[#717182] italic border border-dashed">
        Não há nenhum desafio de Arena ativo para o teu ano letivo neste momento. Relaxa! ☕
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-4">
      
      {/* CARD PRINCIPAL DA ARENA */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        
        {/* Tópico do Desafio Atual */}
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-[#ff6b35]/10 rounded-xl flex items-center justify-center text-[#ff6b35]">
            <Shield className="w-6 h-6 fill-[#ff6b35]/10" />
          </div>
          <div>
            <h2 className="text-[#1e3a5f] font-bold text-lg leading-tight">Arena de Desafio - Mode Debunking</h2>
            <p className="text-xs text-[#717182] font-semibold mt-0.5">
              Desafio Atual / Tópico: <span className="text-[#ff6b35] font-bold uppercase">{desafio.tema}</span>
            </p>
          </div>
        </div>

        {/* Alerta de Erros Deliberados */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3 mb-6">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800 font-medium">
            <span className="font-bold">Atenção:</span> A explicação abaixo contém <span className="font-bold underline">erros deliberados</span>. O teu objetivo é identificar as afirmações incorretas clicando nelas.
          </p>
        </div>

        {/* CONTAINER DA EXPLICAÇÃO DA IA */}
        <div className="bg-[#f5f6f8] rounded-xl p-5 space-y-3">
          <h4 className="text-[#1e3a5f] font-bold text-sm mb-1 tracking-wide uppercase">Explicação da IA:</h4>
          
          {desafio.frases.map((frase: any) => {
            const isSelected = selectedIds.includes(frase.id);
            return (
              <div
                key={frase.id}
                onClick={() => handleToggleFrase(frase.id)}
                className={`p-4 rounded-lg select-none text-sm transition-all duration-150 ${
                  feedbackResult
                    ? "bg-gray-100 text-gray-500 cursor-default border"
                    : isSelected
                      ? "bg-orange-50 border-2 border-[#ff6b35] text-[#1e3a5f] font-medium shadow-xs cursor-pointer transform scale-[1.005]"
                      : "bg-white border border-[#e9ebef] text-[#1e3a5f] cursor-pointer hover:bg-gray-50 hover:border-gray-300"
                }`}
              >
                {frase.texto}
              </div>
            );
          })}
        </div>

        {/* PAINEL DE FEEDBACK PÓS-SUBMISSÃO */}
        {feedbackResult && (
          <div className={`mt-6 p-4 rounded-lg border text-sm font-semibold ${
            feedbackResult.success ? "bg-green-50 border-green-200 text-green-800" : "bg-amber-50 border-amber-200 text-amber-800"
          }`}>
            {feedbackResult.success 
              ? `🎉 Excelente! Conseguiste detetar todos os erros conceituais (${feedbackResult.errorsFound}/${feedbackResult.totalErrors})!` 
              : `A caçada terminou! Encontraste ${feedbackResult.errorsFound} de ${feedbackResult.totalErrors} alucinações. Revê a matéria para apanhares todos na próxima!`}
          </div>
        )}

        {/* BOTÃO SUBMETER */}
        {!feedbackResult && (
          <div className="mt-6">
            <button
              onClick={handleSubmeterRespostas}
              disabled={selectedIds.length === 0 || submitting}
              className="flex items-center gap-2 px-6 py-3 bg-[#ff6b35] text-white text-sm font-bold rounded-lg hover:bg-[#ff5722] transition-colors shadow-md disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
              {submitting ? "A enviar análise..." : "Submeter Resposta"}
            </button>
          </div>
        )}

      </div>

      {/* BLOCO "COMO FUNCIONA" MANTIDO A 100% INTEGRAL E VERBATIM */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-[#1e3a5f] font-bold text-base mb-4">Como Funciona</h3>
        <ul className="list-disc list-inside space-y-2 text-sm text-[#717182] font-medium">
          <li>A IA apresenta uma explicação sobre um tópico definido pelo professor</li>
          <li>A explicação contém erros deliberados (alucinações controladas)</li>
          <li>Clica nas frases que achas que estão incorretas</li>
        </ul>
      </div>

    </div>
  );
}
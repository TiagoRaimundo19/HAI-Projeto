import { useState, useEffect } from "react";
import { Flame, CheckCircle, Plus, AlertCircle, Calendar } from "lucide-react";

interface ParsedDisciplina {
  diaSemana: string;
  dataCalculada: string;
  topicos: string[];
}

export default function PreClassView() {
  const [loading, setLoading] = useState(true);
  const [dadosDisciplinas, setDadosDisciplinas] = useState<{ [key: string]: ParsedDisciplina }>({});
  const [inputsTexto, setInputsTexto] = useState<{ [key: string]: string }>({});
  const [sinalizados, setSinalizados] = useState<string[]>([]);
  const [emAprovacao, setEmAprovacao] = useState<{ [key: string]: boolean }>({});
  const [erroFeedback, setErroFeedback] = useState<{ [key: string]: string | null }>({});

  const studentId = localStorage.getItem("studentId");

  // Calcula a data YYYY-MM-DD localmente para alinhar perfeitamente com o Backend
  const calcularDataFront = (diaSemana: string) => {
    const dias = { 
      "domingo": 0, "segunda-feira": 1, "terça-feira": 2, 
      "quarta-feira": 3, "quinta-feira": 4, "sexta-feira": 5, "sábado": 6 
    };
    const target = dias[diaSemana.toLowerCase() as keyof typeof dias] ?? 0;
    const hoje = new Date();
    const res = new Date();
    res.setDate(hoje.getDate() + ((target - hoje.getDay() + 7) % 7));
    return res.toISOString().split('T')[0];
  };

  useEffect(() => {
    if (!studentId) {
      setLoading(false);
      return;
    }

    const estruturaEstatica = {
      "MATEMATICA": "Segunda-feira",
      "PORTUGUES": "Terça-feira",
      "INGLES": "Quarta-feira",
      "ECONOMIA": "Sexta-feira"
    };

    Promise.all([
      fetch(`http://localhost:5000/api/alunos/perfil/${studentId}`).then(res => res.json()),
      fetch(`http://localhost:5000/api/alunos/${studentId}/dificuldades-sinalizadas`).then(res => res.json())
    ])
      .then(([perfilData, historicoData]) => {
        console.log("🔍 [FRONT LOG 1] Dados brutos do histórico recebidos do GET:", historicoData);

        const estruturaFinal: { [key: string]: ParsedDisciplina } = {};
        const listaOrigem = perfilData.aluno?.disciplinas && perfilData.aluno.disciplinas.length > 0 
          ? perfilData.aluno.disciplinas.map((d: string) => d.toUpperCase())
          : Object.keys(estruturaEstatica);

        const diasPadrao = ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira"];
        
        listaOrigem.forEach((disc: string, index: number) => {
          const dia = estruturaEstatica[disc as keyof typeof estruturaEstatica] || diasPadrao[index % diasPadrao.length];
          estruturaFinal[disc] = {
            diaSemana: dia,
            dataCalculada: calcularDataFront(dia),
            topicos: ["Introdução Geral", "Exercícios de Revisão"]
          };
        });

        console.log("🔍 [FRONT LOG 2] Datas planeadas para esta semana no Front:", 
          Object.keys(estruturaFinal).map(k => `${k}: ${estruturaFinal[k].dataCalculada}`)
        );

        if (historicoData.registos && historicoData.registos.length > 0) {
          const chavesAtivas: string[] = [];

          historicoData.registos.forEach((registo: any, i: number) => {
            const discChave = registo.disciplina.toUpperCase();
            const targetConfig = estruturaFinal[discChave];

            console.log(` Graham [FILTRO VOTO ${i}] A comparar Registo: "${registo.tema}" | Data na BD: "${registo.dataAula}" com Data Alvo no Front: "${targetConfig?.dataCalculada}"`);

            if (targetConfig && registo.dataAula === targetConfig.dataCalculada) {
              console.log(`🎯 [SUCESSO] Match de data para ${registo.tema}! A ativar botão laranja.`);
              const chaveVoto = `${discChave}-${registo.tema.toLowerCase()}`;
              chavesAtivas.push(chaveVoto);

              if (!targetConfig.topicos.includes(registo.tema)) {
                targetConfig.topicos.push(registo.tema);
              }
            }
          });
          setSinalizados(chavesAtivas);
        }

        setDadosDisciplinas(estruturaFinal);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erro ao sincronizar estados:", err);
        setLoading(false);
      });
  }, [studentId]);

  const handleSinalizarTema = (tema: string, disciplina: string, diaSemana: string, deFormularioCustomizado = false) => {
    if (!studentId || !tema || !tema.trim()) return;
    const chaveUnica = `${disciplina}-${tema.toLowerCase()}`;
    if (sinalizados.includes(chaveUnica)) return;

    if (deFormularioCustomizado) {
      setEmAprovacao(prev => ({ ...prev, [disciplina]: true }));
      setErroFeedback(prev => ({ ...prev, [disciplina]: null }));
    }

    fetch(`http://localhost:5000/api/alunos/${studentId}/sinalizar-dificuldade`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        tema: tema.trim(), 
        disciplina, 
        diaSemana // Envia o dia da semana para o cálculo de data do back
      })
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setSinalizados(prev => [...prev, chaveUnica]);
          if (deFormularioCustomizado) {
            setDadosDisciplinas(prev => ({
              ...prev,
              [disciplina]: { ...prev[disciplina], topicos: [...prev[disciplina].topicos, tema.trim()] }
            }));
            setInputsTexto(prev => ({ ...prev, [disciplina]: "" }));
          }
        } else if (deFormularioCustomizado) {
          setErroFeedback(prev => ({ ...prev, [disciplina]: data.detalhe || data.erro }));
        }
      })
      .catch(() => {
        if (deFormularioCustomizado) setErroFeedback(prev => ({ ...prev, [disciplina]: "Erro de ligação." }));
      })
      .finally(() => {
        if (deFormularioCustomizado) setEmAprovacao(prev => ({ ...prev, [disciplina]: false }));
      });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 text-[#717182] animate-pulse font-medium">
        🤖 A sincronizar calendário letivo com o servidor...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-[#1e3a5f] text-2xl font-bold">Preparação de Aula • Sinalizar Dúvidas</h1>
        <p className="text-sm text-[#717182] mt-1">
          Seleciona os tópicos onde sentes mais dúvidas nas matérias desta semana. O teu professor vai focar-se neles na próxima aula!
        </p>
      </div>

      {Object.keys(dadosDisciplinas).map((disciplina) => {
        const info = dadosDisciplinas[disciplina];
        const [ano, mes, dia] = info.dataCalculada.split("-");
        const dataFormatada = `${dia}/${mes}`;

        return (
          <div key={disciplina} className="bg-white rounded-xl shadow-md p-6 border-l-4 border-[#ff6b35]">
            
            {/* Cabeçalho do Bloco com Dia e Data Real da Aula */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <h2 className="text-[#1e3a5f] font-bold text-base uppercase tracking-wide flex items-center gap-2">
                <span>📚</span> {disciplina}
              </h2>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-[#1e3a5f]/5 text-[#1e3a5f] text-xs font-semibold rounded-full border border-[#1e3a5f]/10">
                <Calendar className="w-3.5 h-3.5 text-[#ff6b35]" />
                <span>Aula: {info.diaSemana} ({dataFormatada})</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              
              {/* Renderização dos botões/tópicos da disciplina */}
              {info.topicos.map((tema) => {
                const chaveUnica = `${disciplina}-${tema.toLowerCase()}`;
                const jaSinalizado = sinalizados.includes(chaveUnica);

                return (
                  <button
                    key={tema}
                    disabled={jaSinalizado}
                    onClick={() => handleSinalizarTema(tema, disciplina, info.diaSemana, false)}
                    className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between h-28 ${
                      jaSinalizado 
                        ? "bg-[#ff6b35]/5 border-[#ff6b35] text-[#ff6b35] cursor-default" 
                        : "bg-white border-[#ff6b35]/20 text-[#ff6b35] hover:bg-[#ff6b35]/5 hover:scale-[1.01]"
                    }`}
                  >
                    <span className="font-medium text-sm leading-snug">{tema}</span>
                    <div className="flex items-center gap-1.5 mt-2 self-end text-xs font-semibold">
                      {jaSinalizado ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          <span>Sinalizado p/ a Aula</span>
                        </>
                      ) : (
                        <>
                          <Flame className="w-4 h-4 opacity-40" />
                          <span className="opacity-60">Marcar Dúvida</span>
                        </>
                      )}
                    </div>
                  </button>
                );
              })}

              {/* Máquina de Estados do Bloco de Input */}
              {emAprovacao[disciplina] ? (
                <div className="p-4 rounded-xl border-2 border-[#ff6b35] bg-[#ff6b35]/5 flex flex-col justify-center items-center h-28 animate-pulse text-center">
                  <Flame className="w-5 h-5 text-[#ff6b35] animate-bounce mb-1" />
                  <span className="text-xs font-bold text-[#ff6b35]">Em aprovação...</span>
                </div>
              ) : erroFeedback[disciplina] ? (
                <div className="p-4 rounded-xl border-2 border-red-500 bg-red-50 flex flex-col justify-between h-28 text-left shadow-sm">
                  <div className="overflow-y-auto max-h-[55px] pr-1">
                    <span className="text-xs font-bold text-red-600 flex items-center gap-1 mb-0.5">
                      <AlertCircle className="w-3.5 h-3.5" /> Recusado
                    </span>
                    <p className="text-[11px] text-red-700 leading-tight font-medium">{erroFeedback[disciplina]}</p>
                  </div>
                  <button 
                    onClick={() => setErroFeedback(prev => ({ ...prev, [disciplina]: null }))} 
                    className="text-[10px] font-bold text-red-600 bg-red-100 hover:bg-red-200 px-2 py-1 rounded-lg self-end transition-colors"
                  >
                    Tentar de novo
                  </button>
                </div>
              ) : (
                <div className="p-4 rounded-xl border-2 border-dashed border-[#ff6b35]/30 bg-[#f5f5f7]/40 flex flex-col justify-between h-28 transition-all hover:border-[#ff6b35]/60 focus-within:border-[#ff6b35]">
                  <input
                    type="text"
                    placeholder="Escreve outro tema..."
                    value={inputsTexto[disciplina] || ""}
                    onChange={(e) => setInputsTexto({ ...inputsTexto, [disciplina]: e.target.value })}
                    onKeyDown={(e) => e.key === "Enter" && handleSinalizarTema(inputsTexto[disciplina], disciplina, info.diaSemana, true)}
                    className="w-full bg-transparent text-sm text-[#1e3a5f] placeholder-[#717182] font-medium focus:outline-none"
                  />
                  <button
                    onClick={() => handleSinalizarTema(inputsTexto[disciplina], disciplina, info.diaSemana, true)}
                    disabled={!inputsTexto[disciplina]?.trim()}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#ff6b35] text-white text-xs font-bold rounded-lg self-end shadow-sm disabled:opacity-40"
                  >
                    <Plus className="w-3.5 h-3.5" /> Sinalizar
                  </button>
                </div>
              )}

            </div>
          </div>
        );
      })}
    </div>
  );
}
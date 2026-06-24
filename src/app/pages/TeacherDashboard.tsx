import { useState, useEffect, useRef } from "react"; 
import { useNavigate } from "react-router"; 
import { Sidebar } from "../components/Sidebar";
import {
  Users,
  Upload,
  Flame,
  CheckCircle,
  MessageSquare,
  Plus,
  Trash2,
  Send,
  Folder,
  BookOpen,
} from "lucide-react";

type View = "students" | "vault" | "heatmap" | "debunking" | "feedback";

export function TeacherDashboard() {
  const navigate = useNavigate(); 
  const [activeView, setActiveView] = useState<View>("students");
  const [teacherName, setTeacherName] = useState("A carregar...");

  useEffect(() => {
    const teacherId = localStorage.getItem("teacherId");
    if (!teacherId) return;

    fetch(`http://localhost:5000/api/professores/perfil/${teacherId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.professor?.nome) {
          setTeacherName(data.professor.nome);
        }
      })
      .catch(() => setTeacherName("Professor"));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("teacherId"); 
    navigate("/teacher/login"); 
  };

  const sidebarItems = [
    {
      icon: <Users className="w-5 h-5" />,
      label: "Gestão de Alunos",
      active: activeView === "students",
      onClick: () => setActiveView("students"),
    },
    {
      icon: <Upload className="w-5 h-5" />,
      label: "Knowledge Vault",
      active: activeView === "vault",
      onClick: () => setActiveView("vault"),
    },
    {
      icon: <Flame className="w-5 h-5" />,
      label: "Heatmap de Dúvidas",
      active: activeView === "heatmap",
      onClick: () => setActiveView("heatmap"),
    },
    {
      icon: <CheckCircle className="w-5 h-5" />,
      label: "Relatório Debunking",
      active: activeView === "debunking",
      onClick: () => setActiveView("debunking"),
    },
    {
      icon: <MessageSquare className="w-5 h-5" />,
      label: "Centro de Feedback",
      active: activeView === "feedback",
      onClick: () => setActiveView("feedback"),
    },
  ];

  return (
    <div className="relative flex h-screen bg-[#f5f5f7]">
      
      <div className="absolute top-[16px] left-[16px] w-[224px] h-[76px] bg-[#1e3a5f] z-50 flex items-center gap-3 p-3 rounded-xl border border-white/10 select-none cursor-default">
        <div className="w-10 h-10 bg-[#ff6b35] rounded-xl flex items-center justify-center shadow-md shrink-0">
          <span className="text-white text-lg">👨‍🏫</span>
        </div>
        <div className="overflow-hidden pr-1 flex flex-col justify-center h-full">
          <h3 className="font-semibold text-sm text-white leading-tight break-words" title={teacherName}>
            {teacherName}
          </h3>
        </div>
      </div>

      <div 
        onClick={handleLogout}
        className="absolute bottom-0 left-0 w-[256px] h-[64px] z-50 cursor-pointer bg-transparent"
        title="Terminar Sessão"
      />

      <Sidebar items={sidebarItems} userType="teacher" />

      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {activeView === "students" && <StudentsView />}
          {activeView === "vault" && <VaultView />}
          {activeView === "heatmap" && <HeatmapView />}
          {activeView === "debunking" && <DebunkingView />}
          {activeView === "feedback" && <FeedbackView />}
        </div>
      </main>
    </div>
  );
}

// =========================================================================
// STUDENTS VIEW
// =========================================================================
function StudentsView() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const teacherId = localStorage.getItem("teacherId");
    if (!teacherId) {
      setLoading(false);
      return;
    }

    fetch(`http://localhost:5000/api/professores/${teacherId}/alunos`)
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao carregar alunos");
        return res.json();
      })
      .then((data) => {
        if (data.students) {
          setStudents(data.students);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Erro ao ligar à API de alunos:", err);
        setLoading(false);
      });
  }, []);

  const groupedStudents = students.reduce((acc: any, student) => {
    const ano = student.anoEscolar || "Ano por Definir";
    const turma = student.turma || "Sem Turma";
    const key = `${ano} • ${turma}`;

    if (!acc[key]) acc[key] = [];
    acc[key].push(student);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 text-[#717182] font-medium animate-pulse">
        🤖 Sistema a organizar as pastas de alunos...
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[#1e3a5f]">Gestão de Alunos</h1>
        <p className="text-sm text-[#717182] mt-1">
          Lista de alunos lecionados por si nesta instituição, organizados por ano e turma.
        </p>
      </div>

      <div className="grid gap-8">
        {students.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center text-[#717182] italic">
            Nenhum aluno associado a este professor atualmente.
          </div>
        ) : (
          Object.keys(groupedStudents).map((folderName) => (
            <div key={folderName} className="bg-white rounded-xl shadow-md p-6 border-l-4 border-[#ff6b35]">
              <div className="flex items-center gap-3 mb-4 pb-2 border-b border-[#f3f3f5]">
                <Folder className="w-6 h-6 text-[#ff6b35] fill-[#ff6b35]/10" />
                <h3 className="text-[#1e3a5f] font-bold text-lg">{folderName}</h3>
                <span className="text-xs bg-[#1e3a5f]/10 text-[#1e3a5f] px-2 py-1 rounded-full font-semibold">
                  {groupedStudents[folderName].length} {groupedStudents[folderName].length === 1 ? 'aluno' : 'alunos'}
                </span>
              </div>

              <div className="space-y-3">
                {groupedStudents[folderName].map((student: any) => {
                  const studentId = student._id || student.id;
                  const studentName = student.nome || student.name;
                  
                  return (
                    <div
                      key={studentId}
                      className="flex items-center p-4 bg-[#f3f3f5] rounded-lg hover:bg-[#e9ebef] transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#1e3a5f] text-white rounded-full flex items-center justify-center font-bold shrink-0">
                          {studentName ? studentName.charAt(0).toUpperCase() : "?"}
                        </div>
                        
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[#1e3a5f] font-semibold">{studentName}</span>
                            {student.disciplinas && student.disciplinas.map((disc: string, idx: number) => (
                              <span 
                                key={idx} 
                                className="flex items-center gap-1 text-[11px] bg-[#ff6b35]/10 text-[#ff5722] font-bold px-2 py-0.5 rounded border border-[#ff6b35]/20 uppercase tracking-wide"
                              >
                                <BookOpen className="w-3 h-3" />
                                {disc}
                              </span>
                            ))}
                          </div>
                          <div className="text-sm text-[#717182] mt-0.5">{student.email}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// =========================================================================
// 📂 KNOWLEDGE VAULT (MODIFICADO COM O MULTIPART FORM-DATA REAL)
// =========================================================================
function VaultView() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false); 
  const [uploading, setUploading] = useState(false);
  
  const [selectedDisciplina, setSelectedDisciplina] = useState("");
  const [teacherDisciplinas, setTeacherDisciplinas] = useState<string[]>([]);
  
  // 🎯 NOVOS ESTADOS PARA O ANO ESCOLAR
  const [selectedAnoEscolar, setSelectedAnoEscolar] = useState("");
  const [teacherAnosEscolares, setTeacherAnosEscolares] = useState<string[]>([]);

  const teacherId = localStorage.getItem("teacherId");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!teacherId) return;

    fetch(`http://localhost:5000/api/professores/${teacherId}/materiais`)
      .then((res) => res.json())
      .then((data) => {
        if (data.materiais) setMaterials(data.materiais);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erro ao carregar materiais:", err);
        setLoading(false);
      });

    fetch(`http://localhost:5000/api/professores/perfil/${teacherId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.professor?.disciplinas) {
          setTeacherDisciplinas(data.professor.disciplinas);
          if (data.professor.disciplinas.length > 0) {
            setSelectedDisciplina(data.professor.disciplinas[0]);
          }
        }
        // 🎯 CAPTURA OS ANOS ESCOLARES DO PERFIL DO PROFESSOR
        if (data.professor?.anosEscolares) {
          setTeacherAnosEscolares(data.professor.anosEscolares);
          if (data.professor.anosEscolares.length > 0) {
            setSelectedAnoEscolar(data.professor.anosEscolares[0]);
          }
        }
      })
      .catch((err) => console.error("Erro:", err));
  }, [teacherId]);

  const uploadRealFile = (file: File) => {
    if (!selectedDisciplina || !selectedAnoEscolar) {
      alert("Por favor, selecione a disciplina e o ano escolar no topo!");
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append("pdf", file); 
    formData.append("nome", file.name);
    formData.append("disciplina", selectedDisciplina);
    formData.append("anoEscolar", selectedAnoEscolar); // 🎯 ENVIA O ANO ESCOLAR

    fetch(`http://localhost:5000/api/professores/${teacherId}/materiais/upload`, {
      method: "POST",
      body: formData 
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.material) {
          setMaterials([data.material, ...materials]); 
          alert("🎉 Material indexado com sucesso!");
        } else {
          alert(`Erro: ${data.erro}`);
        }
      })
      .catch(() => alert("Erro na ligação."))
      .finally(() => setUploading(false));
  };

  const handleZoneClick = () => {
    if (!uploading) fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadRealFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!uploading) setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (uploading) return;
    const file = e.dataTransfer.files?.[0]; 
    if (file) uploadRealFile(file);
  };

  const handleDeleteMaterial = (id: string) => {
    fetch(`http://localhost:5000/api/materiais/${id}`, { method: "DELETE" })
      .then((res) => {
        if (res.ok) setMaterials(materials.filter((m) => (m._id || m.id) !== id));
      })
      .catch((err) => console.error(err));
  };

  const groupedMaterials = materials.reduce((acc: any, material) => {
    const pasta = material.disciplina || "Geral";
    if (!acc[pasta]) acc[pasta] = [];
    acc[pasta].push(material);
    return acc;
  }, {});

  if (loading) {
    return <div className="text-center py-12 text-[#717182] animate-pulse">🤖 A aceder ao Knowledge Vault...</div>;
  }

  return (
    <div>
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf,.pptx,.mp3,.wav" />

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-[#1e3a5f]">Knowledge Vault</h1>
        
        <div className="flex items-center gap-3">
          {/* Dropdown Disciplina */}
          <select
            value={selectedDisciplina}
            onChange={(e) => setSelectedDisciplina(e.target.value)}
            className="bg-white border border-[#e9ebef] text-[#1e3a5f] text-sm rounded-lg p-3 focus:outline-none"
          >
            {teacherDisciplinas.map((disc, idx) => (
              <option key={idx} value={disc}>Pasta: {disc.toUpperCase()}</option>
            ))}
          </select>

          {/* 🎯 NOVO DROPDOWN: Ano Escolar */}
          <select
            value={selectedAnoEscolar}
            onChange={(e) => setSelectedAnoEscolar(e.target.value)}
            className="bg-white border border-[#e9ebef] text-[#1e3a5f] text-sm rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#ff6b35]"
          >
            {teacherAnosEscolares.map((ano, idx) => (
              <option key={idx} value={ano}>Ano: {ano}</option>
            ))}
          </select>

          <button 
            onClick={handleZoneClick}
            disabled={uploading}
            className="flex items-center gap-2 px-6 py-3 bg-[#ff6b35] text-white rounded-lg hover:bg-[#ff5722] transition-colors shadow-lg disabled:opacity-50"
          >
            <Upload className="w-5 h-5" />
            {uploading ? "A processar..." : "Upload Material"}
          </button>
        </div>
      </div>

      <div className="mb-8">
        <div 
          onClick={handleZoneClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`p-8 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all ${
            uploading ? "bg-gray-100 border-gray-300 cursor-wait animate-pulse" : isDragging ? "bg-[#ff6b35]/10 border-[#ff6b35] scale-[1.01]" : "bg-[#1e3a5f]/5 border-[#1e3a5f]/20 hover:bg-[#1e3a5f]/10"
          }`}
        >
          <Upload className={`w-12 h-12 mx-auto mb-3 ${isDragging ? "text-[#ff6b35]" : "text-[#1e3a5f]"}`} />
          <p className="text-[#1e3a5f] mb-2 font-medium">
            {uploading ? `🤖 A extrair texto para o ${selectedAnoEscolar}...` : isDragging ? "Podes largar o ficheiro aqui! 🚀" : `Arraste ficheiros para ${selectedDisciplina.toUpperCase()} (${selectedAnoEscolar})`}
          </p>
          <p className="text-sm text-[#717182]">Formatos suportados: PDF, PPTX, MP3, WAV</p>
        </div>
      </div>

      <div className="space-y-8">
        {materials.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center text-[#717182] italic">O seu cofre está vazio.</div>
        ) : (
          Object.keys(groupedMaterials).map((folderName) => (
            <div key={folderName} className="bg-white rounded-xl shadow-md p-6 border-t-4 border-[#1e3a5f]">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#f3f3f5]">
                <span className="text-2xl">📂</span>
                <h3 className="text-[#1e3a5f] font-bold text-lg uppercase tracking-wide">Pasta: {folderName}</h3>
                <span className="text-xs bg-[#1e3a5f]/10 text-[#1e3a5f] px-2 py-0.5 rounded-full font-bold">{groupedMaterials[folderName].length} un.</span>
              </div>

              <div className="space-y-3">
                {groupedMaterials[folderName].map((material: any) => {
                  const matId = material._id || material.id;
                  const dataFormatada = new Date(material.criatedAt || material.criadoEm).toLocaleDateString("pt-PT");
                  
                  return (
                    <div key={matId} className="flex items-center justify-between p-4 bg-[#f3f3f5] rounded-lg hover:bg-[#e9ebef] transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#ff6b35] text-white rounded-lg flex items-center justify-center font-bold text-xs shadow-sm">
                          {material.tipo === "Áudio" ? "🎵" : "📄"}
                        </div>
                        <div>
                          <div className="text-[#1e3a5f] font-medium">{material.nome}</div>
                          {/* Label visual do Ano Escolar adicionada abaixo */}
                          <div className="text-sm text-[#717182]">
                            {material.tipo} • <span className="font-semibold text-[#ff6b35]">{material.anoEscolar || "Geral"}</span> • {dataFormatada} {material.conteudoTexto ? "• 🤖 Indexado" : ""}
                          </div>
                        </div>
                      </div>
                      <button onClick={() => handleDeleteMaterial(matId)} className="text-[#d4183d] hover:bg-[#d4183d]/10 p-2 rounded-lg"><Trash2 className="w-5 h-5" /></button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// =========================================================================
// HEATMAP VIEW
// =========================================================================
function HeatmapView() {
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedDisciplina, setSelectedDisciplina] = useState("");
  const [teacherDisciplinas, setTeacherDisciplinas] = useState<string[]>([]);
  const [selectedAnoEscolar, setSelectedAnoEscolar] = useState("");
  const [teacherAnosEscolares, setTeacherAnosEscolares] = useState<string[]>([]);

  const teacherId = localStorage.getItem("teacherId");

  // 🗓️ Função Helper local para calcular a data YYYY-MM-DD da aula com base no dia da semana
  const calcularDataAula = (disciplinaNome: string) => {
    const estruturaDias = {
      "MATEMATICA": "Segunda-feira",
      "PORTUGUES": "Terça-feira",
      "INGLES": "Quarta-feira",
      "ECONOMIA": "Sexta-feira"
    };
    
    const diaSemana = estruturaDias[disciplinaNome.toUpperCase() as keyof typeof estruturaDias] || "Segunda-feira";
    
    const dias = { "domingo": 0, "segunda-feira": 1, "terça-feira": 2, "quarta-feira": 3, "quinta-feira": 4, "sexta-feira": 5, "sábado": 6 };
    const target = dias[diaSemana.toLowerCase() as keyof typeof dias] ?? 1;
    const hoje = new Date();
    const res = new Date();
    res.setDate(hoje.getDate() + ((target - hoje.getDay() + 7) % 7));
    return res.toISOString().split('T')[0];
  };

  // 1. Carrega as configurações iniciais de filtros do perfil do professor
  useEffect(() => {
    if (!teacherId) return;

    fetch(`http://localhost:5000/api/professores/perfil/${teacherId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.professor) {
          if (data.professor.disciplinas && data.professor.disciplinas.length > 0) {
            setTeacherDisciplinas(data.professor.disciplinas);
            setSelectedDisciplina(data.professor.disciplinas[0]);
          }
          if (data.professor.anosEscolares && data.professor.anosEscolares.length > 0) {
            setTeacherAnosEscolares(data.professor.anosEscolares);
            setSelectedAnoEscolar(data.professor.anosEscolares[0]);
          }
        }
      })
      .catch((err) => console.error("Erro ao ler perfil do professor:", err));
  }, [teacherId]);

  // 2. ⚡ DISPARO REATIVO AUTOMÁTICO: Roda instantaneamente sempre que muda a disciplina ou o ano!
  useEffect(() => {
    if (!teacherId || !selectedDisciplina || !selectedAnoEscolar) return;

    setLoading(true);
    
    // Calcula a data real da aula que estamos a analisar esta semana
    const dataAlvoAula = calcularDataAula(selectedDisciplina);

    // Envia os 3 filtros por Query Parameters para o Express
    fetch(`http://localhost:5000/api/professores/${teacherId}/heatmap?disciplina=${selectedDisciplina}&anoEscolar=${selectedAnoEscolar}&dataAula=${dataAlvoAula}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.heatmap) {
          setTopics(data.heatmap);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erro ao sincronizar dados térmicos:", err);
        setLoading(false);
      });
  }, [teacherId, selectedDisciplina, selectedAnoEscolar]); // Escuta as mudanças de estado dos dropdowns

  const getHeatColor = (level: number) => {
    const colors = ["bg-[#fef3c7]", "bg-[#fde68a]", "bg-[#fbbf24]", "bg-[#f97316]", "bg-[#dc2626]"];
    return colors[level - 1] || colors[0];
  };

  const getTextColor = (level: number) => {
    return level >= 4 ? "text-white" : "text-[#1e3a5f]";
  };

  // Renderiza a data de forma amigável no subtítulo (ex: 2026-06-29 -> 29/06)
  const obterDataFormatada = () => {
    if (!selectedDisciplina) return "";
    const dataCalculada = calcularDataAula(selectedDisciplina);
    const [ano, mes, dia] = dataCalculada.split("-");
    return `${dia}/${mes}`;
  };

  return (
    <div>
      {/* SELETORES DINÂMICOS NO TOPO */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h1 className="text-[#1e3a5f]">Heatmap de Dúvidas (Pré-Aula)</h1>
          <p className="text-sm text-[#717182] mt-0.5">
            Métricas de retenção calculadas em tempo real para a aula que aí vem.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={selectedDisciplina}
            onChange={(e) => setSelectedDisciplina(e.target.value)}
            className="bg-white border border-[#e9ebef] text-[#1e3a5f] text-sm rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#ff6b35]"
          >
            {teacherDisciplinas.map((disc, idx) => (
              <option key={idx} value={disc}>Pasta: {disc.toUpperCase()}</option>
            ))}
          </select>

          <select
            value={selectedAnoEscolar}
            onChange={(e) => setSelectedAnoEscolar(e.target.value)}
            className="bg-white border border-[#e9ebef] text-[#1e3a5f] text-sm rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#ff6b35]"
          >
            {teacherAnosEscolares.map((ano, idx) => (
              <option key={idx} value={ano}>Ano: {ano}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <Flame className="w-6 h-6 text-[#ff6b35]" />
          <div>
            <h3 className="text-[#1e3a5f]">Análise de Dificuldades da Turma</h3>
            <p className="text-sm text-[#717182]">
              Focos de retenção para <span className="font-semibold">{selectedDisciplina.toUpperCase()}</span> ({selectedAnoEscolar}) • 🗓️ Próxima Aula: <span className="font-bold text-[#ff6b35]">{obterDataFormatada()}</span>
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-[#717182] animate-pulse font-medium">
            🤖 A analisar a volumetria de votos para a aula de {obterDataFormatada()}...
          </div>
        ) : topics.length === 0 ? (
          <div className="text-center py-12 text-[#717182] italic bg-[#f8f9fa] rounded-xl border border-dashed p-6">
            Nenhuma dúvida registada para esta turma na aula de {obterDataFormatada()}. Alunos preparados! 🥳
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topics.map((topic) => (
              <div
                key={topic.name}
                className={`${getHeatColor(topic.level)} ${getTextColor(topic.level)} p-6 rounded-xl shadow-md transition-all hover:scale-[1.01] cursor-default`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-lg leading-tight">{topic.name}</h4>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Flame
                        key={i}
                        className={`w-4 h-4 ${i < topic.level ? (topic.level >= 4 ? "fill-white text-white" : "fill-[#ff6b35] text-[#ff6b35]") : "opacity-20"}`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm opacity-90 font-medium">
                  {topic.questions} {topic.questions === 1 ? 'aluno assinalou' : 'alunos assinalaram'} este tema
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* LEGENDA */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-[#1e3a5f] mb-4 font-semibold">Legenda de Urgência</h3>
        <div className="flex flex-wrap gap-6">
          {[{ level: 1, label: "Baixo" }, { level: 2, label: "Moderado" }, { level: 3, label: "Elevado" }, { level: 4, label: "Muito Elevado" }, { level: 5, label: "Crítico" }].map((item) => (
            <div key={item.level} className="flex items-center gap-2">
              <div className={`w-6 h-6 ${getHeatColor(item.level)} rounded border border-black/5`} />
              <span className="text-sm font-medium text-[#717182]">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


// =========================================================================
// DEBUNKING VIEW
// =========================================================================
function DebunkingView() {
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<any[]>([]);
  const [temaAtivo, setTemaAtivo] = useState<string | null>(null);
  const [novoTemaInput, setNovoTemaInput] = useState("");
  const [lancando, setLancando] = useState(false);

  // Cards de sumário estatístico
  const [summary, setSummary] = useState({ totalSucesso: 0, totalReforco: 0, taxa: 0 });

  // Listas de filtros obtidas do perfil do professor
  const [selectedDisciplina, setSelectedDisciplina] = useState("");
  const [teacherDisciplinas, setTeacherDisciplinas] = useState<string[]>([]);
  const [selectedAnoEscolar, setSelectedAnoEscolar] = useState("");
  const [teacherAnosEscolares, setTeacherAnosEscolares] = useState<string[]>([]);

  const teacherId = localStorage.getItem("teacherId");

  // 1. Carrega os filtros (disciplinas e anos) do perfil do docente ao montar o ecrã
  useEffect(() => {
    if (!teacherId) return;

    fetch(`http://localhost:5000/api/professores/perfil/${teacherId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.professor) {
          if (data.professor.disciplinas && data.professor.disciplinas.length > 0) {
            setTeacherDisciplinas(data.professor.disciplinas);
            setSelectedDisciplina(data.professor.disciplinas[0]);
          }
          if (data.professor.anosEscolares && data.professor.anosEscolares.length > 0) {
            setTeacherAnosEscolares(data.professor.anosEscolares);
            setSelectedAnoEscolar(data.professor.anosEscolares[0]);
          }
        }
      })
      .catch((err) => console.error("Erro ao carregar perfil para filtros:", err));
  }, [teacherId]);

  // 2. Procura o relatório real e o tema ativo com base nos dropdowns selecionados
  const carregarRelatorioReal = () => {
    if (!teacherId || !selectedDisciplina || !selectedAnoEscolar) return;

    setLoading(true);
    fetch(`http://localhost:5000/api/professores/${teacherId}/debunking/relatorio?disciplina=${selectedDisciplina}&anoEscolar=${selectedAnoEscolar}`)
      .then((res) => res.json())
      .then((data) => {
        setTemaAtivo(data.temaAtivo);
        if (data.summary) setSummary(data.summary);
        if (data.results) setResults(data.results);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erro ao puxar relatório de debunking:", err);
        setLoading(false);
      });
  };

  // Dispara sempre que o professor muda a disciplina ou o ano
  useEffect(() => {
  carregarRelatorioReal(); 
}, [teacherId, selectedDisciplina, selectedAnoEscolar]);

  // 3. Submete o novo tema para criar o desafio ativo na BD
  const handleLancarDesafio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoTemaInput.trim() || !selectedDisciplina || !selectedAnoEscolar) return;

    setLancando(true);

    fetch(`http://localhost:5000/api/professores/${teacherId}/debunking/lancar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        disciplina: selectedDisciplina,
        anoEscolar: selectedAnoEscolar,
        tema: novoTemaInput.trim()
      })
    })
      .then((res) => {
        if (res.ok) {
          alert(`🚀 Desafio sobre "${novoTemaInput.trim()}" lançado com sucesso!`);
          setNovoTemaInput("");
          carregarRelatorioReal(); // Atualiza os painéis na hora
        } else {
          alert("Erro ao lançar desafio.");
        }
      })
      .catch(() => alert("Erro na ligação ao servidor."))
      .finally(() => setLancando(false));
  };

  return (
    <div className="space-y-6">
      
      {/* CABEÇALHO DA VIEW COM OS SELETORES */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-[#1e3a5f]">Relatório de Debunking</h1>
          <p className="text-sm text-[#717182] mt-0.5">Gestão de desafios de caça às alucinações e controlo crítico da turma.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={selectedDisciplina}
            onChange={(e) => setSelectedDisciplina(e.target.value)}
            className="bg-white border border-[#e9ebef] text-[#1e3a5f] text-sm rounded-lg p-3 focus:outline-none"
          >
            {teacherDisciplinas.map((disc, idx) => (
              <option key={idx} value={disc}>Pasta: {disc.toUpperCase()}</option>
            ))}
          </select>

          <select
            value={selectedAnoEscolar}
            onChange={(e) => setSelectedAnoEscolar(e.target.value)}
            className="bg-white border border-[#e9ebef] text-[#1e3a5f] text-sm rounded-lg p-3 focus:outline-none"
          >
            {teacherAnosEscolares.map((ano, idx) => (
              <option key={idx} value={ano}>Ano: {ano}</option>
            ))}
          </select>
        </div>
      </div>

      {/* PAINEL DE CONTROLO ATIVO (LANÇADOR DE DESAFIOS) */}
      <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-[#ff6b35]">
        <h3 className="text-[#1e3a5f] font-bold text-base mb-2 flex items-center gap-2">
          <span>🎯</span> Lançar Novo Desafio para esta Turma
        </h3>
        <p className="text-xs text-[#717182] mb-4">
          Escreva o tema da aula. O Gemini irá gerar um resumo para o aluno contendo 3 erros conceituais propositados para ele caçar.
        </p>

        <form onSubmit={handleLancarDesafio} className="flex gap-3 max-w-xl">
          <input
            type="text"
            placeholder="Ex: Derivadas, Matrizes, Limites..."
            value={novoTemaInput}
            onChange={(e) => setNovoTemaInput(e.target.value)}
            className="flex-1 p-3 bg-[#f3f3f5] border border-[#e9ebef] rounded-lg text-sm text-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-[#ff6b35]"
            disabled={lancando}
          />
          <button
            type="submit"
            disabled={!novoTemaInput.trim() || lancando}
            className="px-6 py-3 bg-[#ff6b35] text-white text-sm font-bold rounded-lg hover:bg-[#ff5722] transition-colors shadow-md disabled:opacity-40"
          >
            {lancando ? "A ativar..." : "Lançar Desafio"}
          </button>
        </form>

        {temaAtivo && (
          <div className="mt-4 text-xs font-semibold text-[#1e3a5f] bg-[#1e3a5f]/5 px-3 py-2 rounded-lg inline-flex items-center gap-1.5 border border-[#1e3a5f]/10">
            <span className="animate-ping w-1.5 h-1.5 rounded-full bg-green-500 mr-2" />
            Desafio em curso nesta turma: <span className="text-[#ff6b35] uppercase font-bold">{temaAtivo}</span>
          </div>
        )}
      </div>

      {/* BLOCO DE RELATÓRIO E CARDS VISUAIS */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center gap-4 mb-6">
          <CheckCircle className="w-6 h-6 text-[#ff6b35]" />
          <div>
            <h3 className="text-[#1e3a5f]">Desafio de Alucinação Controlada</h3>
            <p className="text-sm text-[#717182]">
              Histórico de submissões para o tema <span className="font-bold uppercase text-[#1e3a5f]">{temaAtivo || "Nenhum lançado"}</span>
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-[#717182] animate-pulse font-medium">🤖 A aceder às tentativas na base de dados...</div>
        ) : !temaAtivo ? (
          <div className="text-center py-12 text-[#717182] italic bg-[#f8f9fa] rounded-xl border border-dashed p-6">
            Não existem dados disponíveis porque ainda não ativou nenhum desafio de debunking para esta combinação de turma.
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Grelha de Sumários (Cards de Progresso Reativos) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#1e3a5f]/5 p-6 rounded-xl border border-[#1e3a5f]/10">
                <div className="text-3xl font-bold text-[#1e3a5f] mb-1">{summary.totalSucesso}</div>
                <div className="text-sm font-medium text-[#717182]">Alunos com Sucesso Total</div>
              </div>
              <div className="bg-[#ff6b35]/5 p-6 rounded-xl border border-[#ff6b35]/10">
                <div className="text-3xl font-bold text-[#ff6b35] mb-1">{summary.totalReforco}</div>
                <div className="text-sm font-medium text-[#717182]">Necessitam Reforço</div>
              </div>
              <div className="bg-green-50/50 p-6 rounded-xl border border-green-200">
                <div className="text-3xl font-bold text-green-600 mb-1">{summary.taxa}%</div>
                <div className="text-sm font-medium text-[#717182]">Taxa de Sucesso da Turma</div>
              </div>
            </div>

            {/* LISTA REAL DOS ALUNOS DO GRUPO */}
            <div className="space-y-3">
              {results.length === 0 ? (
                <div className="text-center py-6 text-xs text-[#717182] bg-gray-50 rounded-lg border border-dashed">
                  O desafio está ativo para a turma, mas nenhum estudante enviou a sua resposta até ao momento.
                </div>
              ) : (
                results.map((result) => (
                  <div
                    key={result.id}
                    className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                      result.success ? "bg-green-50/60 border-green-200" : "bg-amber-50/40 border-amber-200"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 ${result.success ? "bg-green-500" : "bg-amber-500"} text-white rounded-full flex items-center justify-center font-bold shadow-xs uppercase`}>
                        {result.student.charAt(0)}
                      </div>
                      <div>
                        <div className="text-[#1e3a5f] font-semibold">{result.student}</div>
                        <div className="text-xs text-[#717182] font-semibold uppercase tracking-wider">{result.topic}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[#1e3a5f] font-semibold text-sm">
                        {result.errorsFound}/{result.totalErrors} erros detetados
                      </div>
                      <div className={`text-xs font-bold mt-0.5 ${result.success ? "text-green-600" : "text-amber-600"}`}>
                        {result.success ? "✓ Sucesso Total" : "○ Resolução Parcial"}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
// =========================================================================
// FEEDBACK VIEW
// =========================================================================
function FeedbackView() {
  const students = [
    { id: 1, name: "Ana Silva", turma: "Turma A" },
    { id: 2, name: "João Costa", turma: "Turma A" },
    { id: 3, name: "Maria Santos", turma: "Turma B" },
    { id: 4, name: "Pedro Oliveira", turma: "Turma B" },
    { id: 5, name: "Sofia Rodrigues", turma: "Turma A" },
  ];

  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  const quickMessages = [
    "Bom trabalho! Continue assim.",
    "Atenção ao detalhe nos próximos exercícios.",
    "Excelente progresso esta semana!",
    "Sugiro rever o material sobre derivadas.",
  ];

  return (
    <div>
      <h1 className="text-[#1e3a5f] mb-6">Centro de Feedback</h1>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-white rounded-xl shadow-md p-6">
          <h3 className="text-[#1e3a5f] mb-4">Selecionar Aluno</h3>
          <div className="space-y-2">
            {students.map((student) => (
              <button
                key={student.id}
                onClick={() => setSelectedStudent(student.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  selectedStudent === student.id ? "bg-[#ff6b35] text-white" : "bg-[#f3f3f5] text-[#1e3a5f] hover:bg-[#e9ebef]"
                }`}
              >
                <div className={`w-8 h-8 ${selectedStudent === student.id ? "bg-white text-[#ff6b35]" : "bg-[#1e3a5f] text-white"} rounded-full flex items-center justify-center text-sm`}>
                  {student.name.charAt(0)}
                </div>
                <div className="text-left flex-1">
                  <div className="text-sm">{student.name}</div>
                  <div className={`text-xs ${selectedStudent === student.id ? "text-white/80" : "text-[#717182]"}`}>{student.turma}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="md:col-span-2 bg-white rounded-xl shadow-md p-6">
          {selectedStudent ? (
            <>
              <h3 className="text-[#1e3a5f] mb-4">Enviar Feedback para {students.find((s) => s.id === selectedStudent)?.name}</h3>
              <div className="mb-6">
                <label className="text-[#1e3a5f] block mb-3">Mensagens Rápidas</label>
                <div className="grid grid-cols-1 gap-2">
                  {quickMessages.map((msg, index) => (
                    <button
                      key={index}
                      onClick={() => setMessage(msg)}
                      className="text-left p-3 bg-[#1e3a5f]/5 text-[#1e3a5f] rounded-lg hover:bg-[#1e3a5f]/10 transition-colors text-sm"
                    >
                      {msg}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="text-[#1e3a5f] block mb-3">Mensagem Personalizada</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full h-32 p-4 bg-[#f3f3f5] border border-[#e9ebef] rounded-lg text-[#1e3a5f] placeholder-[#717182] focus:outline-none focus:ring-2 focus:ring-[#ff6b35] resize-none"
                  placeholder="Escreva o seu feedback..."
                />
              </div>

              <button
                disabled={!message.trim()}
                className="flex items-center gap-2 px-6 py-3 bg-[#ff6b35] text-white rounded-lg hover:bg-[#ff5722] transition-colors shadow-lg disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
                Enviar Feedback
              </button>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-[#717182]">Selecione um aluno para enviar feedback</div>
          )}
        </div>
      </div>
    </div>
  );
}
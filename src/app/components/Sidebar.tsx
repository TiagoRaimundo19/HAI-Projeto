import { ReactNode } from "react";
import { GraduationCap } from "lucide-react";
import { useNavigate } from "react-router";

interface SidebarProps {
  items: {
    icon: ReactNode;
    label: string;
    active?: boolean;
    onClick?: () => void;
  }[];
  userType: "teacher" | "student";
}

export function Sidebar({ items, userType }: SidebarProps) {
  const navigate = useNavigate();

  return (
    <div className="w-72 bg-[#1e3a5f] h-screen flex flex-col">
      <div className="p-6 border-b border-[#2c4f7c]">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <div className="w-12 h-12 bg-[#ff6b35] rounded-lg flex items-center justify-center">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <div className="text-left">
            <div className="text-white font-medium">AI-Assistant</div>
            <div className="text-white/60 text-sm">
              {userType === "teacher" ? "Professor" : "Aluno"}
            </div>
          </div>
        </button>
      </div>

      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {items.map((item, index) => (
            <button
              key={index}
              onClick={item.onClick}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                item.active
                  ? "bg-[#ff6b35] text-white shadow-lg"
                  : "text-white/80 hover:bg-[#2c4f7c] hover:text-white"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <div className="p-4 border-t border-[#2c4f7c]">
        <button
          onClick={() => navigate("/")}
          className="w-full px-4 py-3 text-white/80 hover:text-white hover:bg-[#2c4f7c] rounded-lg transition-all text-left"
        >
          Terminar Sessão
        </button>
      </div>
    </div>
  );
}

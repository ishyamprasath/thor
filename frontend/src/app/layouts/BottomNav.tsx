import { NavLink } from "react-router";
import { Camera, Home, MessageSquare, Mic, Users } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function BottomNav() {
    const { user } = useAuth();

    const navItems = [
        { label: "Home", icon: Home, path: "/dashboard" },
        { label: "Community", icon: Users, path: "/community" },
        { label: "Memory", icon: Camera, path: "/memory-completion", action: true },
        { label: "AI Chat", icon: MessageSquare, path: "/chat", action: true },
        { label: "Voice AI", icon: Mic, path: "/voice", action: true },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 h-20 border-t border-zinc-800 z-50 px-4 pb-safe flex items-center justify-around drop-shadow-2xl"
            style={{ background: "var(--thor-bg)", borderColor: "var(--thor-border)" }}>
            {navItems.map((item) => {
                const Icon = item.icon;

                // Highlight AI actions
                if (item.action) {
                    const getActionColor = () => {
                        if (item.label === "Voice AI") return { bg: "bg-red-500/20", text: "text-red-500", shadow: "239,68,68" };
                        if (item.label === "Memory") return { bg: "bg-amber-500/20", text: "text-amber-500", shadow: "245,158,11" };
                        return { bg: "bg-blue-500/20", text: "text-blue-500", shadow: "59,130,246" };
                    };
                    const colors = getActionColor();

                    return (
                        <NavLink
                            key={item.label}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex flex-col items-center justify-center gap-1 min-w-[64px] transition-all duration-300 ${isActive ? `${colors.text} scale-110` : ""}`
                            }
                            style={({ isActive }) => (!isActive ? { color: "var(--thor-text-secondary)" } : {})}
                        >
                            <div className={`p-3 rounded-full ${colors.bg} ${colors.text} shadow-[0_0_15px_rgba(${colors.shadow},0.2)]`}>
                                <Icon className="w-6 h-6" />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider mt-1">{item.label}</span>
                        </NavLink>
                    );
                }

                return (
                    <NavLink
                        key={item.label}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex flex-col items-center justify-center gap-1 min-w-[64px] transition-all duration-300`
                        }
                        style={({ isActive }) => ({ color: isActive ? "var(--thor-text)" : "var(--thor-text-secondary)" })}
                    >
                        <Icon className={`w-6 h-6 ${item.label === "Home" ? "mt-1" : ""}`} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">
                            {item.label}
                        </span>
                    </NavLink>
                );
            })}
        </div>
    );
}

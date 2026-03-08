import { NavLink } from "react-router";
import { Home, MessageSquare, Mic, Users } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function BottomNav() {
    const { user } = useAuth();

    const navItems = [
        { label: "Home", icon: Home, path: "/dashboard" },
        { label: "Community", icon: Users, path: "/community" },
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
                    return (
                        <NavLink
                            key={item.label}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex flex-col items-center justify-center gap-1 min-w-[64px] transition-all duration-300 ${isActive ? (item.label === "Voice AI" ? "text-red-500 scale-110" : "text-blue-500 scale-110") : ""}`
                            }
                            style={({ isActive }) => (!isActive ? { color: "var(--thor-text-secondary)" } : {})}
                        >
                            <div className={`p-3 rounded-full ${item.label === "Voice AI" ? "bg-red-500/20 text-red-500" : "bg-blue-500/20 text-blue-500"} shadow-[0_0_15px_rgba(${item.label === 'Voice AI' ? '239,68,68' : '59,130,246'},0.2)]`}>
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

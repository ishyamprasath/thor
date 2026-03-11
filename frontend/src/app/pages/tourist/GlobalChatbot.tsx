import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, Zap, User, MessageSquare, Loader2, MapPin, Navigation, Map, AlertTriangle, Users, Settings, LayoutDashboard } from "lucide-react";
import { useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "../../context/TranslationContext";
import { API_URL } from "../../config/api";

// ─── Types ─────────────────────────────────────────────────────────────────
interface Message {
    role: "user" | "ai";
    content: string;
    timestamp: Date;
    command?: { type: string;[key: string]: any };
    isExecuting?: boolean;
}

// ─── Quick-action suggestions ───────────────────────────────────────────────
const SUGGESTIONS = [
    { text: "I want to go to Paris", icon: <MapPin className="w-3 h-3" /> },
    { text: "Plan a trip to Tokyo for 5 days", icon: <Navigation className="w-3 h-3" /> },
    { text: "Open the safety map", icon: <Map className="w-3 h-3" /> },
    { text: "I need emergency help", icon: <AlertTriangle className="w-3 h-3" /> },
];

// ─── Command to Icon mapping for UI feedback ─────────────────────────────────
function CommandChip({ cmd }: { cmd: any }) {
    const icons: Record<string, React.ReactElement> = {
        navigate: <Navigation className="w-3.5 h-3.5" />,
        auto_plan: <MapPin className="w-3.5 h-3.5" />,
        open_planner: <MapPin className="w-3.5 h-3.5" />,
    };
    const labels: Record<string, string> = {
        navigate: `Navigating to ${cmd.path}`,
        auto_plan: `Planning trip to ${cmd.destination}`,
        open_planner: `Opening planner for ${cmd.destination}`,
    };
    return (
        <div className="mt-2 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-2.5 py-1 rounded-full">
            <Zap className="w-3 h-3 animate-pulse" />
            {labels[cmd.type] || "Executing..."}
        </div>
    );
}

export default function GlobalChatbot() {
    const { token } = useAuth();
    const navigate = useNavigate();
    const { language, translate } = useTranslation();

    const [messages, setMessages] = useState<Message[]>([
        {
            role: "ai",
            content: "I am THOR AI — your fully automated travel companion. Tell me where you want to go and I'll plan your entire trip: hotels, restaurants, and attractions — automatically. Just say the word!",
            timestamp: new Date()
        },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, [messages]);

    // ─── Auto-plan: generate full itinerary via backend ──────────────────────
    const autoPlan = useCallback(async (destination: string, days: number) => {
        // Show an executing message in the chat
        setMessages(prev => [...prev, {
            role: "ai",
            content: `🗺️ Building your **${days}-day ${destination}** itinerary now — hotels, meals, and top attractions are being selected by THOR AI...`,
            timestamp: new Date(),
            isExecuting: true,
        }]);

        const start = new Date();
        const end = new Date(); end.setDate(start.getDate() + days);
        const fmt = (d: Date) => d.toISOString().split("T")[0];

        try {
            const res = await fetch(`${API_URL}/trip/generate`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ destination, start_date: fmt(start), end_date: fmt(end), traveler_name: "Traveler" }),
            });
            const data = await res.json();

            if (data.status === "success" && data.plan) {
                localStorage.setItem("thor_active_plan", JSON.stringify(data.plan));
                setMessages(prev => [...prev, {
                    role: "ai",
                    content: `✅ Your **${days}-day ${destination}** itinerary is ready! I've selected your hotel, all meals, and the best attractions. Opening your trip now...`,
                    timestamp: new Date(),
                }]);
                setTimeout(() => navigate("/planner/active"), 1800);
            } else {
                throw new Error("Plan generation failed");
            }
        } catch {
            setMessages(prev => [...prev, {
                role: "ai",
                content: `❌ I couldn't generate the plan for ${destination} right now. Please try again or visit the Trip Planner manually.`,
                timestamp: new Date(),
            }]);
        }
    }, [token, navigate]);

    // ─── Execute command returned by Gemini backend ──────────────────────────
    const execCommand = useCallback((cmd: any) => {
        if (!cmd) return;
        switch (cmd.type) {
            case "auto_plan":
                setTimeout(() => autoPlan(cmd.destination || "your destination", Number(cmd.days) || 3), 600);
                break;
            case "navigate":
                setTimeout(() => navigate(cmd.path), 1500);
                break;
            case "open_planner":
                if (cmd.destination) localStorage.setItem("thor-voice-destination", cmd.destination);
                setTimeout(() => navigate("/planner"), 1500);
                break;
            case "create_trip":
                localStorage.setItem("thor-active-trip", JSON.stringify({
                    destination: cmd.dest, startDate: cmd.start, endDate: cmd.end,
                    created_at: new Date().toISOString()
                }));
                setTimeout(() => navigate("/planner/active"), 1500);
                break;
        }
    }, [navigate, autoPlan]);

    // ─── Send message to Gemini backend ──────────────────────────────────────
    const sendMessage = async (text?: string) => {
        const msg = text || input.trim();
        if (!msg || loading) return;
        setInput("");

        const userMsg: Message = { role: "user", content: msg, timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setLoading(true);

        try {
            const flatHistory = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }));

            const res = await fetch(`${API_URL}/trip/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    message: msg,
                    history: flatHistory.slice(0, -1),
                    language,
                    context: "global",
                }),
            });
            const data = await res.json();

            const reply = (res.ok && data.reply) ? data.reply : "I am experiencing network interference. Please try again.";

            const aiMsg: Message = {
                role: "ai",
                content: reply,
                timestamp: new Date(),
                command: data.command || undefined,
            };
            setMessages(prev => [...prev, aiMsg]);

            // Execute any command
            if (data.command) {
                execCommand(data.command);
            }

        } catch {
            setMessages(prev => [...prev, {
                role: "ai",
                content: "I'm having trouble connecting to the THOR network. Please check your connection.",
                timestamp: new Date(),
            }]);
        }
        setLoading(false);
    };

    // ─── UI ──────────────────────────────────────────────────────────────────
    return (
        <div className="h-full flex flex-col" style={{ minHeight: 0, background: "var(--thor-bg)" }}>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 shrink-0 border-b" 
                 style={{ background: "var(--thor-surface)", borderColor: "var(--thor-border)" }}>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-600 to-cyan-500 shadow-[0_0_15px_rgba(59,130,246,0.4)]">
                        <MessageSquare className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-base font-black tracking-tight" style={{ color: "var(--thor-text)" }}>{translate("THOR AI")}</h1>
                        <p className="text-[10px]" style={{ color: "var(--thor-text-muted)" }}>gemini-3.1-flash-lite-preview · {translate("Fully Automated")}</p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full"
                     style={{ color: "#22c55e", background: "rgba(34, 197, 94, 0.1)", borderColor: "rgba(34, 197, 94, 0.2)", border: "1px solid" }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    {translate("Online")}
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 pb-24" ref={scrollRef}>
                <AnimatePresence initial={false}>
                    {messages.map((msg, i) => (
                        <motion.div key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>

                            {/* Avatar */}
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${msg.role === "ai"
                                ? "bg-gradient-to-br from-blue-600 to-cyan-500 text-white"
                                : ""
                                }`}
                                style={msg.role === "user" ? {
                                    background: "var(--thor-surface-2)", 
                                    borderColor: "var(--thor-border)", 
                                    color: "var(--thor-text-muted)",
                                    border: "1px solid"
                                } : {}}>
                                {msg.role === "ai" ? <Zap className="w-4 h-4" fill="currentColor" /> : <User className="w-4 h-4" />}
                            </div>

                            {/* Bubble */}
                            <div className={`max-w-[78%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col`}>
                                <div className={`rounded-2xl px-4 py-3 shadow-lg ${msg.role === "user"
                                    ? "bg-blue-600 text-white rounded-br-sm"
                                    : msg.isExecuting
                                        ? "rounded-bl-sm"
                                        : "rounded-bl-sm"
                                    }`}
                                    style={msg.role === "user" ? {} : msg.isExecuting ? {
                                        background: "rgba(234, 179, 8, 0.1)",
                                        borderColor: "rgba(234, 179, 8, 0.3)",
                                        color: "#fef3c7",
                                        border: "1px solid"
                                    } : {
                                        background: "var(--thor-surface-2)",
                                        borderColor: "var(--thor-border)",
                                        color: "var(--thor-text)",
                                        border: "1px solid"
                                    }}>
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                    {msg.command && <CommandChip cmd={msg.command} />}
                                </div>
                                <p className="text-[10px] mt-1 px-1" style={{ color: "var(--thor-text-muted)" }}>
                                    {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Typing indicator */}
                {loading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-600 to-cyan-500 text-white">
                            <Loader2 className="w-4 h-4 animate-spin" />
                        </div>
                        <div className="rounded-2xl rounded-bl-sm px-4 py-3"
                             style={{ background: "var(--thor-surface-2)", borderColor: "var(--thor-border)", border: "1px solid" }}>
                            <div className="flex gap-1">
                                {[0, 1, 2].map(i => (
                                    <div key={i} className="w-1.5 h-1.5 rounded-full animate-bounce" 
                                         style={{ 
                                             background: "var(--thor-text-muted)",
                                             animationDelay: `${i * 0.15}s` 
                                         }} />
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Quick suggestions */}
            {messages.length <= 1 && (
                <div className="px-4 pb-3 shrink-0">
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "var(--thor-text-muted)" }}>{translate("Try asking:")}</p>
                    <div className="flex flex-wrap gap-2">
                        {SUGGESTIONS.map((s, i) => (
                            <button key={i} onClick={() => sendMessage(s.text)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all border"
                                style={{
                                    background: "var(--thor-surface-2)",
                                    borderColor: "var(--thor-border)",
                                    color: "var(--thor-text-muted)"
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = "var(--thor-surface-3)";
                                    e.currentTarget.style.color = "var(--thor-text)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = "var(--thor-surface-2)";
                                    e.currentTarget.style.color = "var(--thor-text-muted)";
                                }}>
                                {s.icon} {s.text}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Input bar */}
            <div className="px-4 py-3 shrink-0 border-t" 
                 style={{ background: "var(--thor-surface)", borderColor: "var(--thor-border)" }}>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && sendMessage()}
                        placeholder={translate("Tell THOR where you want to go...")}
                        className="flex-1 rounded-xl px-4 py-2.5 text-sm transition-all border"
                        style={{
                            background: "var(--thor-surface-2)",
                            borderColor: "var(--thor-border)",
                            color: "var(--thor-text)"
                        }}
                    />
                    <button
                        onClick={() => sendMessage()}
                        disabled={!input.trim() || loading}
                        className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white p-2.5 rounded-xl transition-all flex items-center justify-center"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}

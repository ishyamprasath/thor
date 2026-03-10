import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, Zap, User, MessageSquare, Loader2 } from "lucide-react";
import { useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "../../context/TranslationContext";
import { API_URL } from "../../config/api";

interface Message {
    role: "user" | "ai";
    content: string;
    timestamp: Date;
    command?: any;
    isExecuting?: boolean;
}

const SUGGESTIONS = [
    "Run diagnostics on all active trips",
    "Show me tourists with low battery",
    "Which tourists are currently in danger zones?",
    "Generate an activity summary report",
];

export default function EnterpriseChat() {
    const { token } = useAuth();
    const navigate = useNavigate();
    const { language, translate } = useTranslation();

    const [messages, setMessages] = useState<Message[]>([
        {
            role: "ai",
            content: "THOR Enterprise AI initialized. I can assist with fleet monitoring, real-time analytics, and executing command protocols. How can I assist you today?",
            timestamp: new Date()
        },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, [messages]);

    const execCommand = useCallback((cmd: any) => {
        if (!cmd) return;
        switch (cmd.type) {
            case "navigate":
                setTimeout(() => navigate(cmd.path), 1500);
                break;
            // Add other enterprise-specific commands if the backend supports them
        }
    }, [navigate]);

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
                    context: "enterprise",
                }),
            });
            const data = await res.json();

            const reply = (res.ok && data.reply) ? data.reply : "Enterprise link degraded. Please verify your connection.";

            const aiMsg: Message = {
                role: "ai",
                content: reply,
                timestamp: new Date(),
                command: data.command || undefined,
            };
            setMessages(prev => [...prev, aiMsg]);

            if (data.command) {
                execCommand(data.command);
            }

        } catch {
            setMessages(prev => [...prev, {
                role: "ai",
                content: "System connection failure. Check network integrity.",
                timestamp: new Date(),
            }]);
        }
        setLoading(false);
    };

    return (
        <div className="h-full flex flex-col max-w-5xl mx-auto rounded-3xl border overflow-hidden shadow-2xl"
            style={{ background: "var(--thor-surface-2)", borderColor: "var(--thor-border)" }}>

            {/* Desktop Header */}
            <div className="flex items-center justify-between px-8 py-5 border-b shrink-0"
                style={{ background: "var(--thor-surface)", borderColor: "var(--thor-border)" }}>
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-500/10 text-blue-500 shadow-inner">
                        <MessageSquare className="w-6 h-6 text-current" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight" style={{ color: "var(--thor-text)" }}>
                            Enterprise Command Copilot
                        </h1>
                        <p className="text-xs" style={{ color: "var(--thor-text-muted)" }}>
                            Automated Analytics & Fleet Control · {translate("Online")}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 border rounded-lg"
                    style={{ background: "var(--thor-safe)", borderColor: "var(--thor-border)", color: "#000" }}>
                    <span className="w-2 h-2 rounded-full bg-current animate-pulse opacity-70" />
                    <span className="text-xs font-bold uppercase tracking-widest">Connected</span>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6" ref={scrollRef}>
                <AnimatePresence initial={false}>
                    {messages.map((msg, i) => (
                        <motion.div key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>

                            {/* Avatar */}
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${msg.role === "ai"
                                    ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                                    : "bg-black/20 text-zinc-400 border border-black/30"
                                }`}>
                                {msg.role === "ai" ? <Zap className="w-5 h-5" /> : <User className="w-5 h-5" />}
                            </div>

                            {/* Bubble */}
                            <div className={`max-w-[70%] flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                                <div className={`rounded-2xl px-5 py-4 ${msg.role === "user"
                                        ? "bg-blue-600 text-white rounded-tr-sm shadow-md"
                                        : "border shadow-sm rounded-tl-sm"
                                    }`} style={msg.role === "ai" ? { background: "var(--thor-surface)", borderColor: "var(--thor-border)", color: "var(--thor-text)" } : {}}>
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                </div>
                                <span className="text-[10px] mt-1.5 opacity-60 px-1" style={{ color: "var(--thor-text-muted)" }}>
                                    {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {loading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-600/20 text-blue-400 border border-blue-500/30">
                            <Loader2 className="w-5 h-5 animate-spin" />
                        </div>
                        <div className="rounded-2xl rounded-tl-sm px-5 py-4 border flex items-center gap-1"
                            style={{ background: "var(--thor-surface)", borderColor: "var(--thor-border)" }}>
                            {[0, 1, 2].map(i => (
                                <div key={i} className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-6 border-t shrink-0" style={{ background: "var(--thor-surface)", borderColor: "var(--thor-border)" }}>
                {messages.length <= 1 && (
                    <div className="mb-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {SUGGESTIONS.map((s, i) => (
                            <button key={i} onClick={() => sendMessage(s)}
                                className="whitespace-nowrap px-4 py-2 border rounded-full text-xs font-medium transition-colors hover:border-blue-500 hover:text-blue-400"
                                style={{ background: "var(--thor-surface-2)", borderColor: "var(--thor-border)", color: "var(--thor-text-secondary)" }}>
                                {s}
                            </button>
                        ))}
                    </div>
                )}

                <div className="flex gap-3">
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && sendMessage()}
                        placeholder="Log command for Enterprise AI..."
                        className="flex-1 px-5 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:border-blue-500"
                        style={{ background: "var(--thor-surface-2)", borderColor: "var(--thor-border)", color: "var(--thor-text)" }}
                    />
                    <button
                        onClick={() => sendMessage()}
                        disabled={!input.trim() || loading}
                        className="btn btn-brand px-6 disabled:opacity-50"
                    >
                        <Send className="w-4 h-4" /> Send Request
                    </button>
                </div>
            </div>
        </div>
    );
}

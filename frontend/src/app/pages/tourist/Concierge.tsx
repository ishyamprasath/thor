import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { Send, Zap, User, Sparkles, MapPin } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "../../context/TranslationContext";

import { API_URL } from "../../config/api";

interface Message {
  role: "user" | "ai";
  content: string;
  timestamp: Date;
}

const SUGGESTIONS = [
  "What's the safest area to stay around here?",
  "Emergency phrases in the local language",
  "Common tourist scams to watch out for",
  "Safe food and water recommendations",
  "Local customs I should know about",
];

export default function Concierge() {
  const { token } = useAuth();
  const { language, translate } = useTranslation();

  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", content: "Hello! I'm your THOR AI Concierge. I can help with safety tips, cultural guidance, emergency translations, and local recommendations. How can I assist you?", timestamp: new Date() },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput("");

    const newHistory = [...messages, { role: "user" as const, content: msg, timestamp: new Date() }];
    setMessages(newHistory);
    setLoading(true);

    try {
      const activePlan = JSON.parse(localStorage.getItem("thor_active_plan") || "null");

      const flatHistory = newHistory.map(m => ({ role: m.role, content: m.content }));

      const res = await fetch(`${API_URL}/trip/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          message: msg,
          history: flatHistory.slice(0, -1), // Don't include the current message in history array
          language,
          context: "concierge",
          active_plan: activePlan
        }),
      });
      const data = await res.json();

      let reply = "I am experiencing network interference. Please try again.";
      if (res.ok && data.reply) reply = data.reply;

      setMessages((prev) => [...prev, { role: "ai", content: reply, timestamp: new Date() }]);
    } catch {
      setMessages((prev) => [...prev, { role: "ai", content: "I'm having trouble connecting to the THOR network. Please check your connection and try again.", timestamp: new Date() }]);
    }
    setLoading(false);
  };

  return (
    <div className="h-full flex flex-col pb-20 bg-black">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-zinc-800 bg-zinc-950 shrink-0">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-yellow-500/10 border border-yellow-500/20">
          <Sparkles className="w-5 h-5 text-yellow-500" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">{translate("Cultural Concierge")}</h1>
          <p className="text-xs text-zinc-500 flex items-center gap-1">
            <MapPin className="w-3 h-3" /> {translate("Context-Aware Local AI")}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-1.5 bg-green-500/10 text-green-500 px-2.5 py-1 rounded-full text-xs font-bold border border-green-500/20 uppercase tracking-widest">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          {translate("Online")}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6" ref={scrollRef}>
        {messages.map((msg, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>

            <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${msg.role === "ai" ? "bg-yellow-500/10 border border-yellow-500/20 text-yellow-500" : "bg-blue-500/10 border border-blue-500/20 text-blue-500"}`}>
              {msg.role === "ai" ? <Zap className="w-4 h-4" fill="currentColor" /> : <User className="w-4 h-4" />}
            </div>

            <div className={`max-w-[75%] rounded-2xl px-5 py-3 shadow-lg ${msg.role === "user" ? "bg-blue-600 text-white rounded-br-sm" : "bg-zinc-900 border border-zinc-800 text-gray-200 rounded-bl-sm"}`}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              <p className={`text-[10px] mt-2 font-medium ${msg.role === "user" ? "text-blue-200" : "text-zinc-600"}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </motion.div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-yellow-500/10 border border-yellow-500/20 text-yellow-500">
              <Zap className="w-4 h-4 animate-pulse" fill="currentColor" />
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl rounded-bl-sm px-5 py-4">
              <div className="flex gap-1.5">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-zinc-600 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="px-6 pb-4 shrink-0">
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">{translate("Try asking:")}</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s, i) => (
              <button key={i} onClick={() => sendMessage(s)}
                className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 px-3 py-1.5 rounded-lg text-xs transition-colors">
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 bg-zinc-950 border-t border-zinc-800 shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder={translate("Ask about safety, culture, emergency phrases...")}
            className="flex-1 bg-black border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-yellow-500 transition-colors"
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="bg-yellow-500 hover:bg-yellow-400 text-black p-3 rounded-xl disabled:opacity-50 transition-colors flex items-center justify-center"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

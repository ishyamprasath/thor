import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mic, MicOff, Zap, Loader2, Activity } from "lucide-react";
import { useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../config/api";

type Phase = "permission" | "listening" | "processing" | "speaking" | "error";
const SILENCE_MS = 1200;

export default function EnterpriseVoice() {
    const { token } = useAuth();
    const navigate = useNavigate();

    const [phase, setPhase] = useState<Phase>("permission");
    const [liveText, setLiveText] = useState("");
    const [aiText, setAiText] = useState("");
    const [statusMsg, setStatusMsg] = useState("System standby. Authorize audio input.");

    const finalRef = useRef("");
    const interimRef = useRef("");
    const silenceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const recRef = useRef<any>(null);
    const activeRef = useRef(false);

    const speak = useCallback((text: string): Promise<void> => {
        return new Promise((resolve) => {
            if (!("speechSynthesis" in window)) { resolve(); return; }
            window.speechSynthesis.cancel();
            const u = new SpeechSynthesisUtterance(text);
            u.lang = "en-US"; u.rate = 1.05; // Slightly slower, more authoritative for Enterprise
            u.onend = () => resolve();
            u.onerror = () => resolve();
            window.speechSynthesis.speak(u);
        });
    }, []);

    const execCommand = useCallback((cmd: any) => {
        if (!cmd) return;
        switch (cmd.type) {
            case "navigate": navigate(cmd.path); break;
            // Additional enterprise navigation could go here
        }
    }, [navigate]);

    const processCommand = useCallback(async (text: string) => {
        if (!text.trim()) return;
        setPhase("processing");
        setLiveText("");
        setAiText("");
        setStatusMsg("Analyzing voice input...");

        try {
            const res = await fetch(`${API_URL}/trip/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ message: text, language: "English", context: "enterprise" }),
            });
            const data = await res.json();
            const reply = data.reply || "Command acknowledged.";

            setAiText(reply);
            setPhase("speaking");
            setStatusMsg("Broadcasting response...");

            await speak(reply);
            execCommand(data.command);

            if (!data.command) {
                setPhase("listening");
                setAiText("");
                setStatusMsg("Awaiting next vocal command...");
                startRecognition();
            }
        } catch {
            const err = "Uplink failure. Please verify connection to THOR servers.";
            setAiText(err);
            setPhase("error");
            await speak(err);
            setTimeout(() => {
                setPhase("listening");
                setAiText("");
                setStatusMsg("Awaiting vocal command...");
                startRecognition();
            }, 2000);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token, speak, execCommand]);

    const scheduleSilenceCheck = useCallback(() => {
        if (silenceTimer.current) clearTimeout(silenceTimer.current);
        silenceTimer.current = setTimeout(() => {
            const heard = finalRef.current.trim() || interimRef.current.trim();
            if (heard && recRef.current && activeRef.current) {
                recRef.current.stop();
                activeRef.current = false;
            }
        }, SILENCE_MS);
    }, []);

    const startRecognition = useCallback(() => {
        if (!recRef.current || activeRef.current) return;
        finalRef.current = "";
        interimRef.current = "";
        try {
            recRef.current.start();
            activeRef.current = true;
        } catch { }
    }, []);

    useEffect(() => {
        const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SR) {
            setPhase("error");
            setStatusMsg("Voice Uplink unsupported on this browser node.");
            return;
        }

        const rec = new SR();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = "en-US";

        rec.onstart = () => {
            setPhase("listening");
            setStatusMsg("Listening. Uplink active.");
        };

        rec.onresult = (event: any) => {
            let interim = "";
            let final = "";
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const t = event.results[i][0].transcript;
                if (event.results[i].isFinal) final += t + " ";
                else interim = t;
            }
            if (final) finalRef.current += final;
            interimRef.current = interim;

            setLiveText(finalRef.current + interim);
            scheduleSilenceCheck();
        };

        rec.onerror = (e: any) => {
            activeRef.current = false;
            if (e.error === "no-speech") {
                startRecognition();
            } else if (e.error !== "aborted") {
                setPhase("error");
                setStatusMsg("Microphone array fault: " + e.error);
            }
        };

        rec.onend = () => {
            activeRef.current = false;
            const heard = (finalRef.current + interimRef.current).trim();
            if (heard && (phase === "listening" || phase === "permission")) {
                processCommand(heard);
            }
        };

        recRef.current = rec;

        navigator.mediaDevices?.getUserMedia({ audio: true })
            .then(() => {
                setStatusMsg("Uplink active.");
                startRecognition();
            })
            .catch(() => {
                setPhase("error");
                setStatusMsg("Microphone permission denied by system.");
            });

        return () => {
            if (silenceTimer.current) clearTimeout(silenceTimer.current);
            rec.stop();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!recRef.current) return;
        recRef.current.onend = () => {
            activeRef.current = false;
            const heard = (finalRef.current + interimRef.current).trim();
            if (heard) processCommand(heard);
        };
    }, [processCommand]);

    return (
        <div className="h-full flex items-center justify-center p-8">
            <div className="w-full max-w-4xl border rounded-3xl p-12 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl"
                style={{ background: "var(--thor-surface)", borderColor: "var(--thor-border)" }}>

                {/* Techy background grids */}
                <div className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{
                        backgroundImage: "linear-gradient(var(--thor-border) 1px, transparent 1px), linear-gradient(90deg, var(--thor-border) 1px, transparent 1px)",
                        backgroundSize: "40px 40px"
                    }}
                />

                <div className="absolute top-6 left-6 flex items-center gap-2">
                    <Activity className="w-5 h-5" style={{ color: phase === 'listening' ? "var(--thor-danger)" : "var(--thor-brand)" }} />
                    <span className="font-mono text-xs tracking-widest uppercase" style={{ color: "var(--thor-text-muted)" }}>Voice Copilot</span>
                </div>

                <div className="relative z-10 flex flex-col items-center text-center">

                    {/* Visualizer Orb */}
                    <div className="relative mb-12 mt-6">
                        {/* Hardware ring */}
                        <div className="absolute inset-0 rounded-full border-4 opacity-20" style={{ borderColor: "var(--thor-brand)", transform: "scale(1.4)" }} />

                        {(phase === "listening" || phase === "speaking") && [1, 2, 3].map((i) => (
                            <motion.div key={i}
                                initial={{ scale: 1, opacity: 0.5 }}
                                animate={{ scale: 2.2, opacity: 0 }}
                                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.4 }}
                                className="absolute inset-0 rounded-full"
                                style={{ background: phase === "listening" ? "var(--thor-danger)" : "var(--thor-brand)", opacity: 0.2 }}
                            />
                        ))}

                        <motion.div
                            animate={{ scale: phase === "listening" ? [1, 1.1, 1] : 1 }}
                            transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
                            className="w-32 h-32 rounded-full border-2 flex flex-col items-center justify-center shadow-2xl z-10 relative"
                            style={{
                                background: "var(--thor-surface-2)",
                                borderColor: phase === "listening" ? "var(--thor-danger)" : "var(--thor-border-glow)",
                                boxShadow: phase === "speaking" ? "0 0 40px var(--thor-brand)" : (phase === "listening" ? "0 0 40px var(--thor-danger)" : "none")
                            }}
                        >
                            {phase === "processing" ? (
                                <Loader2 className="w-12 h-12 text-yellow-500 animate-spin" />
                            ) : phase === "listening" ? (
                                <Mic className="w-12 h-12" style={{ color: "var(--thor-danger)" }} />
                            ) : (
                                <MicOff className="w-12 h-12" style={{ color: "var(--thor-text-muted)" }} />
                            )}
                        </motion.div>
                    </div>

                    <h2 className="text-3xl font-bold tracking-tight mb-2" style={{ color: "var(--thor-text)" }}>
                        {phase === "listening" ? "Acoustic Sensors Active" :
                            phase === "processing" ? "Parsing Command" :
                                phase === "speaking" ? "AI Transmission" : "Agent Standby"}
                    </h2>
                    <p className="text-sm font-mono tracking-wider mb-10" style={{ color: "var(--thor-text-secondary)" }}>
                        [{statusMsg.toUpperCase()}]
                    </p>

                    {/* Transcripts box */}
                    <div className="w-full max-w-xl min-h-[140px] border rounded-2xl p-6 flex flex-col items-center justify-center bg-black/5"
                        style={{ borderColor: "var(--thor-border)" }}>
                        <AnimatePresence mode="wait">
                            {liveText && phase === "listening" ? (
                                <motion.div key="live" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
                                    <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "var(--thor-danger)" }}>User Input</p>
                                    <p className="text-lg" style={{ color: "var(--thor-text)" }}>"{liveText}"</p>
                                </motion.div>
                            ) : aiText && (phase === "speaking" || phase === "processing") ? (
                                <motion.div key="ai" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
                                    <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "var(--thor-brand)" }}>Enterprise Response</p>
                                    <p className="text-lg" style={{ color: "var(--thor-text)" }}>{aiText}</p>
                                </motion.div>
                            ) : (
                                <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center opacity-50">
                                    <p className="text-lg" style={{ color: "var(--thor-text-muted)" }}>Speak to execute commands.</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                </div>
            </div>
        </div>
    );
}

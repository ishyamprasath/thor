import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mic, MicOff, Zap, Loader2 } from "lucide-react";
import { useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../config/api";

/**
 * AUTONOMOUS VOICE AGENT
 * ─────────────────────────────────────────────────────────────────────────────
 * Flow:
 *   1. User grants mic permission once (on page load)
 *   2. Recognition runs CONTINUOUSLY
 *   3. A 1.2-second silence timer fires after each speech burst → auto-processes
 *   4. AI speaks reply (TTS), executes app command
 *   5. Returns to Listening automatically — no user action ever needed
 */

type Phase = "permission" | "listening" | "processing" | "speaking" | "error";

const SILENCE_MS = 1200; // ms of silence before auto-processing
const GEMINI_MODEL = "gemini-3.1-flash-lite-preview";  // for display only; backend uses this model

export default function VoiceAI() {
    const { token } = useAuth();
    const navigate = useNavigate();

    const [phase, setPhase] = useState<Phase>("permission");
    const [started, setStarted] = useState(false); // require tap to unlock audio
    const [liveText, setLiveText] = useState("");         // what the user is saying right now (interim)
    const [aiText, setAiText] = useState("");         // what the AI replied
    const [statusMsg, setStatusMsg] = useState("");

    const finalRef = useRef("");   // final transcript accumulator
    const interimRef = useRef("");   // live interim text
    const silenceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const recRef = useRef<any>(null);
    const activeRef = useRef(false); // is recognition currently running?

    useEffect(() => {
        if ("speechSynthesis" in window) {
            window.speechSynthesis.getVoices();
            window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
        }
    }, []);

    // ─── TTS helper ─────────────────────────────────────────────────────────
    const speak = useCallback((text: string): Promise<void> => {
        return new Promise((resolve) => {
            if (!("speechSynthesis" in window)) { resolve(); return; }
            window.speechSynthesis.cancel();

            const cleanText = text.replace(/[*#_]/g, '');
            const u = new SpeechSynthesisUtterance(cleanText);

            const voices = window.speechSynthesis.getVoices();
            const femaleVoice = voices.find(v =>
                v.name.includes("Female") ||
                v.name.includes("Samantha") ||
                v.name.includes("Zira") ||
                v.name.includes("Victoria") ||
                v.name.includes("Google UK English Female")
            );

            if (femaleVoice) {
                u.voice = femaleVoice;
            }
            u.lang = "en-US";
            u.pitch = 1.1;
            u.rate = 1.0;

            u.onend = () => resolve();
            u.onerror = () => resolve();
            window.speechSynthesis.speak(u);
        });
    }, []);

    // ─── Fully automated trip generation (voice → plan → itinerary) ────────────
    const autoPlan = useCallback(async (destination: string, days: number) => {
        setPhase("processing");
        setStatusMsg(`Planning ${days}-day trip to ${destination}...`);
        setAiText(`Generating itinerary with hotels, restaurants & top spots...`);
        speak(`Perfect! I'm now building your complete ${days}-day trip to ${destination}, with hotels, restaurants, and top attractions. Give me just a moment.`);

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
                setAiText(`✅ Your ${destination} itinerary is ready!`);
                setStatusMsg("Opening your trip now...");
                setPhase("speaking");
                await speak(`Your ${days}-day itinerary for ${destination} is ready! I've selected a great hotel and planned all your meals and sightseeing. Opening your trip now!`);
                navigate("/planner/active");
            } else { throw new Error("failed"); }
        } catch {
            const msg = `I couldn't generate the ${destination} plan. Please try again.`;
            setAiText(msg); setPhase("error"); setStatusMsg("Plan generation failed");
            await speak(msg);
            setTimeout(() => { setPhase("listening"); setAiText(""); setStatusMsg("Listening..."); startRecognition(); }, 2000);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token, navigate, speak]);

    // ─── Execute command returned by backend ─────────────────────────────────
    const execCommand = useCallback((cmd: any) => {
        if (!cmd) return;
        switch (cmd.type) {
            case "navigate": navigate(cmd.path); break;
            case "auto_plan":
                autoPlan(cmd.destination || "your destination", Number(cmd.days) || 3);
                break;
            case "open_planner":
                if (cmd.destination) localStorage.setItem("thor-voice-destination", cmd.destination);
                navigate("/planner");
                break;
            case "create_trip":
                localStorage.setItem("thor-active-trip", JSON.stringify({
                    destination: cmd.dest, startDate: cmd.start, endDate: cmd.end,
                    created_at: new Date().toISOString(),
                }));
                navigate("/planner/active");
                break;
        }
    }, [navigate, autoPlan]);


    // ─── Send transcript to Gemini backend ──────────────────────────────────
    const processCommand = useCallback(async (text: string) => {
        if (!text.trim()) return;
        setPhase("processing");
        setLiveText("");
        setAiText("");
        setStatusMsg("Processing...");

        try {
            const res = await fetch(`${API_URL}/trip/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ message: text, language: "English", context: "voice" }),
            });
            const data = await res.json();
            const reply = data.reply || "Got it.";
            setAiText(reply);
            setPhase("speaking");
            setStatusMsg("Speaking...");
            await speak(reply);
            execCommand(data.command);

            if (!data.command) {
                // No navigation — keep listening
                setPhase("listening");
                setAiText("");
                setStatusMsg("Listening for your next command...");
                startRecognition();
            }
        } catch {
            const err = "Network error. Please try again.";
            setAiText(err);
            setPhase("error");
            await speak(err);
            setTimeout(() => {
                setPhase("listening");
                setAiText("");
                setStatusMsg("Listening...");
                startRecognition();
            }, 1500);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token, speak, execCommand]);

    // ─── Silence-based auto-fire ─────────────────────────────────────────────
    const scheduleSilenceCheck = useCallback(() => {
        if (silenceTimer.current) clearTimeout(silenceTimer.current);
        silenceTimer.current = setTimeout(() => {
            const heard = finalRef.current.trim() || interimRef.current.trim();
            if (heard && recRef.current && activeRef.current) {
                recRef.current.stop();            // onend → will call processCommand
                activeRef.current = false;
            }
        }, SILENCE_MS);
    }, []);

    // ─── Start recognition ───────────────────────────────────────────────────
    const startRecognition = useCallback(() => {
        if (!recRef.current || activeRef.current) return;
        finalRef.current = "";
        interimRef.current = "";
        try {
            recRef.current.start();
            activeRef.current = true;
        } catch { /* recognition already running */ }
    }, []);

    // ─── Initialize SpeechRecognition ────────────────────────────────────────
    useEffect(() => {
        const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SR) {
            setPhase("error");
            setStatusMsg("Voice AI requires Chrome or Edge browser.");
            return;
        }

        const rec = new SR();
        rec.continuous = true;          // keep listening until .stop() is called
        rec.interimResults = true;
        rec.lang = "en-US";

        rec.onstart = () => {
            setPhase("listening");
            setStatusMsg("Listening...");
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

            // Show live text
            setLiveText(finalRef.current + interim);
            scheduleSilenceCheck();
        };

        rec.onerror = (e: any) => {
            activeRef.current = false;
            if (e.error === "no-speech") {
                // Nothing heard, restart passively
                startRecognition();
            } else if (e.error !== "aborted") {
                setPhase("error");
                setStatusMsg("Mic error: " + e.error);
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

        // DO NOT start automatically. Wait for user tap.
        return () => {
            if (silenceTimer.current) clearTimeout(silenceTimer.current);
            rec.stop();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleStart = () => {
        setStarted(true);
        navigator.mediaDevices?.getUserMedia({ audio: true })
            .then(() => {
                setStatusMsg("Listening...");
                startRecognition();
            })
            .catch(() => {
                setPhase("error");
                setStatusMsg("Microphone permission denied.");
            });
    };

    // Update onend when processCommand changes (to avoid stale closures)
    useEffect(() => {
        if (!recRef.current) return;
        recRef.current.onend = () => {
            activeRef.current = false;
            const heard = (finalRef.current + interimRef.current).trim();
            if (heard) processCommand(heard);
        };
    }, [processCommand]);

    // ─── Phase colours ───────────────────────────────────────────────────────
    const orbColor =
        phase === "listening" ? "from-red-600 to-pink-600" :
            phase === "processing" ? "from-yellow-500 to-amber-600" :
                phase === "speaking" ? "from-blue-500 to-cyan-600" : "from-zinc-700 to-zinc-800";

    const glowColor =
        phase === "listening" ? "rgba(239,68,68,0.55)" :
            phase === "processing" ? "rgba(234,179,8,0.45)" :
                phase === "speaking" ? "rgba(59,130,246,0.45)" : "transparent";

    const pulseColor =
        phase === "listening" ? "bg-red-500/25" :
            phase === "processing" ? "bg-yellow-500/20" :
                phase === "speaking" ? "bg-blue-500/25" : "bg-transparent";

    return (
        <div className="w-full h-full min-h-[80vh] flex flex-col items-center justify-center relative p-6 overflow-hidden" 
             style={{ background: "var(--thor-bg)" }}>

            {!started && (
                <div className="absolute inset-0 z-50 backdrop-blur-md flex flex-col items-center justify-center" 
                     style={{ background: "rgba(0,0,0,0.8)" }}>
                    <button
                        onClick={handleStart}
                        className="w-48 h-48 rounded-full bg-blue-500 hover:bg-blue-600 shadow-[0_0_50px_rgba(59,130,246,0.5)] flex flex-col items-center justify-center text-white transition-all transform hover:scale-105 active:scale-95 duration-200"
                    >
                        <Mic className="w-12 h-12 mb-3" />
                        <span className="font-bold text-lg">Tap to Start</span>
                        <span className="text-xs text-blue-200 font-medium">THOR Voice Agent</span>
                    </button>
                    <p className="mt-24 text-sm max-w-xs text-center" style={{ color: "var(--thor-text-muted)" }}>
                        Interaction requires manual activation to enable live AI speech synthesis.
                    </p>
                </div>
            )}

            {/* Orb */}
            <div className="relative flex items-center justify-center mb-10 mt-14">
                {/* Pulse rings */}
                {(phase === "listening" || phase === "speaking") && [0, 0.4, 0.8].map((delay, i) => (
                    <motion.div key={i}
                        initial={{ scale: 1, opacity: 0.6 }}
                        animate={{ scale: 2.8, opacity: 0 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay }}
                        className={`absolute w-36 h-36 rounded-full ${pulseColor}`}
                    />
                ))}

                {/* Main orb */}
                <motion.div
                    animate={{ scale: phase === "listening" ? [1, 1.06, 1] : 1 }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                    className={`w-36 h-36 rounded-full bg-gradient-to-br ${orbColor} flex items-center justify-center shadow-2xl transition-all duration-500`}
                    style={{ boxShadow: `0 0 60px ${glowColor}` }}
                >
                    {phase === "processing" ? (
                        <Loader2 className="w-14 h-14 text-white animate-spin" />
                    ) : phase === "listening" ? (
                        <Mic className="w-14 h-14 text-white drop-shadow" />
                    ) : (
                        <MicOff className="w-14 h-14 text-white/60" />
                    )}
                </motion.div>
            </div>

            {/* Phase label */}
            <h2 className="text-2xl font-black tracking-tight mb-6" style={{ color: "var(--thor-text)" }}>
                {phase === "listening" ? "Listening..." :
                    phase === "processing" ? "Processing" :
                        phase === "speaking" ? "THOR Speaking" : "Voice Agent"}
            </h2>

            {/* Live transcript bubble */}
            <AnimatePresence>
                {liveText && phase === "listening" && (
                    <motion.div
                        key="live"
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="max-w-sm w-full rounded-2xl px-5 py-3 mb-4 border"
                        style={{ background: "var(--thor-surface-2)", borderColor: "var(--thor-border)" }}
                    >
                        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "var(--thor-text-muted)" }}>You said</p>
                        <p className="text-sm leading-relaxed" style={{ color: "var(--thor-text)" }}>{liveText}</p>
                    </motion.div>
                )}

                {/* AI reply bubble */}
                {aiText && (phase === "speaking" || phase === "processing") && (
                    <motion.div
                        key="ai"
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="max-w-sm w-full rounded-2xl px-5 py-3 mb-4 border"
                        style={{ background: "rgba(59,130,246,0.1)", borderColor: "rgba(59,130,246,0.2)" }}
                    >
                        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#60a5fa" }}>THOR AI</p>
                        <p className="text-sm leading-relaxed" style={{ color: "#dbeafe" }}>{aiText}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Waveform (listening only) */}
            {phase === "listening" && (
                <div className="flex items-center gap-1 h-10 mt-2">
                    {[1.0, 0.7, 1.4, 0.9, 1.2, 0.6, 1.3].map((spd, i) => (
                        <motion.div key={i}
                            animate={{ height: [4, 22 + i * 3, 4] }}
                            transition={{ duration: spd, repeat: Infinity, ease: "easeInOut", delay: i * 0.09 }}
                            className="w-1.5 bg-red-500 rounded-full"
                        />
                    ))}
                </div>
            )}

            {/* Manual suggestion pills (always visible when idle/listening) */}
            {(phase === "listening" || phase === "error") && !liveText && (
                <div className="mt-8 w-full max-w-sm space-y-2">
                    <p className="text-[10px] font-bold tracking-widest uppercase text-center mb-3" style={{ color: "var(--thor-text-muted)" }}>
                        Or tap a command
                    </p>
                    {[
                        "I would like to go to Paris",
                        "Open the safety map",
                        "Plan a trip to London next week",
                        "I need emergency help",
                    ].map((s, i) => (
                        <button key={i} onClick={() => processCommand(s)}
                            className="w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all border"
                            style={{
                                background: "var(--thor-surface-2)",
                                borderColor: "var(--thor-border)",
                                color: "var(--thor-text-muted)"
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = "var(--thor-text)";
                                e.currentTarget.style.color = "var(--thor-text)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = "var(--thor-border)";
                                e.currentTarget.style.color = "var(--thor-text-muted)";
                            }}>
                            "{s}"
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

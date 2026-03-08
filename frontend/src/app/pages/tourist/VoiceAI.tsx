import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Mic, MicOff, Settings, Zap, X } from "lucide-react";
import { useTranslation } from "../../context/TranslationContext";
import { useNavigate } from "react-router";

export default function VoiceAI() {
    const { translate } = useTranslation();
    const navigate = useNavigate();
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState("Listening for your command...");

    // Simulate voice assistant greeting
    useEffect(() => {
        if (isListening) {
            setTranscript("Listening...");
            const timer = setTimeout(() => {
                setTranscript("How can THOR assist your journey today?");
            }, 2000);
            return () => clearTimeout(timer);
        } else {
            setTranscript("Tap the microphone to speak");
        }
    }, [isListening]);

    return (
        <div className="w-full h-full min-h-[80vh] flex flex-col items-center justify-center relative p-8">
            {/* Header elements */}
            <div className="absolute top-6 left-0 right-0 flex justify-between items-center px-4 w-full">
                <button onClick={() => navigate(-1)} className="p-2 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-1.5 bg-red-500/10 text-red-500 px-3 py-1.5 rounded-full border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                    <Zap className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Live Audio</span>
                </div>
                <button className="p-2 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors">
                    <Settings className="w-5 h-5" />
                </button>
            </div>

            {/* Glowing Orb Container */}
            <div className="relative mb-16 mt-8 flex items-center justify-center">
                {/* Outer animated rings */}
                {isListening && (
                    <>
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0.8 }}
                            animate={{ scale: 2, opacity: 0 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                            className="absolute w-40 h-40 bg-red-500/30 rounded-full"
                        />
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0.8 }}
                            animate={{ scale: 2.5, opacity: 0 }}
                            transition={{ duration: 2, delay: 0.5, repeat: Infinity, ease: "easeOut" }}
                            className="absolute w-40 h-40 bg-red-500/20 rounded-full"
                        />
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0.8 }}
                            animate={{ scale: 3, opacity: 0 }}
                            transition={{ duration: 2, delay: 1, repeat: Infinity, ease: "easeOut" }}
                            className="absolute w-40 h-40 bg-yellow-500/10 rounded-full"
                        />
                    </>
                )}

                {/* Core Button */}
                <button
                    onClick={() => setIsListening(!isListening)}
                    className={`relative z-10 w-40 h-40 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl ${isListening
                            ? 'bg-gradient-to-br from-red-500 to-pink-600 shadow-[0_0_50px_rgba(239,68,68,0.6)] scale-110'
                            : 'bg-zinc-900 border-2 border-zinc-800 hover:border-red-500/50 hover:bg-zinc-800'
                        }`}
                >
                    {isListening ? (
                        <Mic className="w-16 h-16 text-white drop-shadow-md" />
                    ) : (
                        <MicOff className="w-16 h-16 text-zinc-600" />
                    )}
                </button>
            </div>

            {/* Transcription / Status Text */}
            <h2 className="text-3xl font-bold tracking-tight text-white mb-4 text-center">
                {isListening ? translate("THOR Guardian AI") : translate("Voice Assistant")}
            </h2>

            <motion.p
                key={transcript}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`text-center max-w-[280px] text-lg font-medium ${isListening ? 'text-zinc-300' : 'text-zinc-600'}`}
            >
                {translate(transcript)}
            </motion.p>

            {/* Visualizer bars */}
            {isListening && (
                <div className="flex items-center justify-center gap-1 mt-12 h-16">
                    {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                        <motion.div
                            key={i}
                            animate={{
                                height: [10, Math.random() * 50 + 20, 10]
                            }}
                            transition={{
                                duration: 0.5,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: i * 0.1
                            }}
                            className="w-1.5 bg-red-500 rounded-full"
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

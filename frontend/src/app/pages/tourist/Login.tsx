import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Zap, Eye, EyeOff, Mail, Lock, ArrowRight, UserPlus } from "lucide-react";
import { useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";

import { API_URL } from "../../config/api";

export default function TouristLogin() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPwd, setShowPwd] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || "Login failed");
            login(data.access_token, data.user);
            navigate("/tourist/permissions");
        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Thunder BG effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl"
                    animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 6, repeat: Infinity }} />
                <motion.div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"
                    animate={{ scale: [1.3, 1, 1.3], opacity: [0.5, 0.2, 0.5] }}
                    transition={{ duration: 8, repeat: Infinity }} />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative z-10"
            >
                {/* Brand */}
                <div className="text-center mb-8">
                    <motion.div className="flex items-center justify-center gap-3 mb-3"
                        animate={{ y: [0, -4, 0] }} transition={{ duration: 3, repeat: Infinity }}>
                        <Zap className="w-9 h-9 text-yellow-400" fill="currentColor" />
                        <h1 className="text-5xl font-black tracking-widest bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                            THOR
                        </h1>
                        <Zap className="w-9 h-9 text-yellow-400" fill="currentColor" />
                    </motion.div>
                    <p className="text-blue-300 text-sm tracking-widest uppercase">Guard of Tourism</p>
                </div>

                {/* Card */}
                <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl p-8">
                    <h2 className="text-2xl font-bold text-white mb-1">Welcome back</h2>
                    <p className="text-slate-400 text-sm mb-8">Sign in to continue your journey</p>

                    <form onSubmit={handleLogin} className="space-y-5">
                        {/* Email */}
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email address"
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400/50 focus:bg-white/10 transition-all text-sm"
                            />
                        </div>

                        {/* Password */}
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type={showPwd ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-12 text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400/50 focus:bg-white/10 transition-all text-sm"
                            />
                            <button type="button" onClick={() => setShowPwd(!showPwd)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                                {showPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>

                        <AnimatePresence>
                            {error && (
                                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                    className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <motion.button
                            type="submit"
                            disabled={loading}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 hover:from-yellow-400 hover:via-orange-400 hover:to-red-400 text-white font-bold py-4 rounded-xl shadow-lg transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}>
                                    <Zap className="w-5 h-5" />
                                </motion.div>
                            ) : (
                                <>Sign In <ArrowRight className="w-5 h-5" /></>
                            )}
                        </motion.button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-white/10 text-center">
                        <p className="text-slate-400 text-sm">
                            Don't have an account?{" "}
                            <button onClick={() => navigate("/tourist/register")}
                                className="text-yellow-400 hover:text-yellow-300 font-semibold transition-colors inline-flex items-center gap-1">
                                Register <UserPlus className="w-4 h-4" />
                            </button>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Zap, User, Mail, Lock, Heart, Phone, ChevronRight, ChevronLeft, Check, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";

import { API_URL } from "../../config/api";

const steps = ["Basic Info", "Medical Details", "Emergency Contacts"];

export default function TouristRegister() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPwd, setShowPwd] = useState(false);

    // Form data
    const [form, setForm] = useState({
        name: "", email: "", password: "", confirmPassword: "",
        blood_group: "", allergies: "", conditions: "", medications: "",
        ec1_name: "", ec1_phone: "", ec1_relation: "",
        ec2_name: "", ec2_phone: "", ec2_relation: "",
        ec3_name: "", ec3_phone: "", ec3_relation: "",
    });

    const set = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }));

    const validateStep = () => {
        if (step === 0) {
            if (!form.name.trim()) return "Name is required";
            if (!form.email.trim()) return "Email is required";
            if (form.password.length < 8) return "Password must be at least 8 characters";
            if (form.password !== form.confirmPassword) return "Passwords do not match";
        }
        if (step === 2) {
            if (!form.ec1_name.trim() || !form.ec1_phone.trim()) return "At least one emergency contact is required";
        }
        return null;
    };

    const nextStep = () => {
        const err = validateStep();
        if (err) { setError(err); return; }
        setError("");
        setStep((s) => s + 1);
    };

    const handleSubmit = async () => {
        const err = validateStep();
        if (err) { setError(err); return; }
        setLoading(true);
        setError("");

        // Pure frontend auth — no backend call
        setTimeout(() => {
            login("thor_session_" + Date.now(), {
                id: "user_" + Date.now(),
                name: form.name,
                email: form.email,
            });
            navigate("/tourist/permissions");
            setLoading(false);
        }, 600);
    };

    const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400/50 focus:bg-white/10 transition-all text-sm";

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div className="absolute top-1/3 left-1/3 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl"
                    animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 7, repeat: Infinity }} />
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-lg relative z-10">

                {/* Brand */}
                <div className="text-center mb-6">
                    <div className="flex items-center justify-center gap-3 mb-2">
                        <Zap className="w-8 h-8 text-yellow-400" fill="currentColor" />
                        <h1 className="text-4xl font-black tracking-widest bg-gradient-to-r from-yellow-400 to-red-400 bg-clip-text text-transparent">THOR</h1>
                        <Zap className="w-8 h-8 text-yellow-400" fill="currentColor" />
                    </div>
                    <p className="text-blue-300 text-xs tracking-widest uppercase">Guard of Tourism</p>
                </div>

                {/* Step Indicator */}
                <div className="flex items-center justify-center gap-2 mb-6">
                    {steps.map((s, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <motion.div animate={{ scale: i === step ? 1.1 : 1 }}
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i < step ? "bg-green-500 text-white" :
                                    i === step ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white" :
                                        "bg-white/10 text-slate-500"
                                    }`}>
                                {i < step ? <Check className="w-4 h-4" /> : i + 1}
                            </motion.div>
                            {i < steps.length - 1 && (
                                <div className={`w-12 h-0.5 transition-all ${i < step ? "bg-green-500" : "bg-white/10"}`} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Card */}
                <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl p-8">
                    <h2 className="text-xl font-bold text-white mb-1">{steps[step]}</h2>
                    <p className="text-slate-400 text-sm mb-6">
                        {step === 0 ? "Create your THOR account" :
                            step === 1 ? "Medical info helps in emergencies (optional)" :
                                "Who should we contact in case of emergency?"}
                    </p>

                    <AnimatePresence mode="wait">
                        {/* Step 0 — Basic Info */}
                        {step === 0 && (
                            <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                className="space-y-4">
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input className={`${inputClass} pl-11`} placeholder="Full Name" value={form.name}
                                        onChange={(e) => set("name", e.target.value)} />
                                </div>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input type="email" className={`${inputClass} pl-11`} placeholder="Email address" value={form.email}
                                        onChange={(e) => set("email", e.target.value)} />
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input type={showPwd ? "text" : "password"} className={`${inputClass} pl-11 pr-11`}
                                        placeholder="Password (min 8 chars)" value={form.password}
                                        onChange={(e) => set("password", e.target.value)} />
                                    <button type="button" onClick={() => setShowPwd(!showPwd)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                                        {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input type="password" className={`${inputClass} pl-11`} placeholder="Confirm Password"
                                        value={form.confirmPassword} onChange={(e) => set("confirmPassword", e.target.value)} />
                                </div>
                            </motion.div>
                        )}

                        {/* Step 1 — Medical */}
                        {step === 1 && (
                            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                className="space-y-4">
                                <div className="relative">
                                    <Heart className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input className={`${inputClass} pl-11`} placeholder="Blood Group (e.g. O+)" value={form.blood_group}
                                        onChange={(e) => set("blood_group", e.target.value)} />
                                </div>
                                <textarea className={`${inputClass} resize-none`} rows={2} placeholder="Allergies (optional)"
                                    value={form.allergies} onChange={(e) => set("allergies", e.target.value)} />
                                <textarea className={`${inputClass} resize-none`} rows={2} placeholder="Medical conditions (optional)"
                                    value={form.conditions} onChange={(e) => set("conditions", e.target.value)} />
                                <textarea className={`${inputClass} resize-none`} rows={2} placeholder="Current medications (optional)"
                                    value={form.medications} onChange={(e) => set("medications", e.target.value)} />
                            </motion.div>
                        )}

                        {/* Step 2 — Emergency Contacts */}
                        {step === 2 && (
                            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                className="space-y-5">
                                {[1, 2, 3].map((n) => (
                                    <div key={n} className={`space-y-3 ${n > 1 ? "pt-4 border-t border-white/10" : ""}`}>
                                        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                                            Contact {n} {n === 1 ? "(Required)" : "(Optional)"}
                                        </p>
                                        <div className="grid grid-cols-2 gap-3">
                                            <input className={inputClass} placeholder="Full Name"
                                                value={form[`ec${n}_name` as keyof typeof form]}
                                                onChange={(e) => set(`ec${n}_name`, e.target.value)} />
                                            <input className={inputClass} placeholder="Relation"
                                                value={form[`ec${n}_relation` as keyof typeof form]}
                                                onChange={(e) => set(`ec${n}_relation`, e.target.value)} />
                                        </div>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input className={`${inputClass} pl-11`} placeholder="Phone number"
                                                value={form[`ec${n}_phone` as keyof typeof form]}
                                                onChange={(e) => set(`ec${n}_phone`, e.target.value)} />
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <AnimatePresence>
                        {error && (
                            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                className="mt-4 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Navigation Buttons */}
                    <div className="flex gap-3 mt-6">
                        {step > 0 && (
                            <motion.button whileTap={{ scale: 0.97 }} onClick={() => { setError(""); setStep((s) => s - 1); }}
                                className="flex-1 border border-white/20 text-white font-semibold py-4 rounded-xl hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                                <ChevronLeft className="w-5 h-5" /> Back
                            </motion.button>
                        )}
                        {step < 2 ? (
                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={nextStep}
                                className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2">
                                Next <ChevronRight className="w-5 h-5" />
                            </motion.button>
                        ) : (
                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSubmit} disabled={loading}
                                className="flex-1 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                                {loading ? (
                                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}>
                                        <Zap className="w-5 h-5" />
                                    </motion.div>
                                ) : (<><Check className="w-5 h-5" /> Create Account</>)}
                            </motion.button>
                        )}
                    </div>

                    <p className="text-center text-slate-400 text-sm mt-6">
                        Already have an account?{" "}
                        <button onClick={() => navigate("/tourist/login")} className="text-yellow-400 hover:text-yellow-300 font-semibold transition-colors">
                            Sign in
                        </button>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}

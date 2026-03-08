import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
    Zap, Mail, Lock, Eye, EyeOff, User, Phone, Heart,
    ArrowRight, ArrowLeft, AlertCircle, Check, Droplets, Pill, Shield, Globe
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useMode } from "../../context/ModeContext";
import { useTranslation } from "../../context/TranslationContext";

import { API_URL } from "../../config/api";
const STEPS = [
    { id: "role", label: "Role" },
    { id: "basic", label: "Account" },
    { id: "medical", label: "Medical" },
    { id: "emergency", label: "Emergency" },
];

export default function Register() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { setMode } = useMode();
    const { language, setLanguage, supportedLanguages } = useTranslation();
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Form state
    const [role, setRole] = useState<"tourist" | "enterprise" | "">("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [bloodGroup, setBloodGroup] = useState("");
    const [allergies, setAllergies] = useState("");
    const [conditions, setConditions] = useState("");
    const [emergencyName, setEmergencyName] = useState("");
    const [emergencyPhone, setEmergencyPhone] = useState("");
    const [emergencyRelation, setEmergencyRelation] = useState("");

    const canNext = () => {
        if (step === 0) return !!role;
        if (step === 1) return name.trim() && email.trim() && password.length >= 6;
        return true; // medical & emergency are optional
    };

    const handleSubmit = async () => {
        setLoading(true); setError("");
        try {
            const body: any = { name, email, password };
            if (bloodGroup || allergies || conditions) {
                body.medical_details = { blood_group: bloodGroup, allergies, conditions };
            }
            if (emergencyName && emergencyPhone) {
                body.emergency_contacts = [{ name: emergencyName, phone: emergencyPhone, relation: emergencyRelation }];
            }
            const res = await fetch(`${API_URL}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || "Registration failed");

            // --- STRICT PERMISSION ENFORCEMENT ---
            try {
                if (!("geolocation" in navigator)) throw new Error("Geolocation not supported by this browser.");

                await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(
                        resolve,
                        () => reject(new Error("Location permission denied. THOR requires GPS access.")),
                        { enableHighAccuracy: true }
                    );
                });

                if ("Notification" in window) {
                    const perm = await Notification.requestPermission();
                    if (perm === "denied") {
                        throw new Error("Notification permission denied. THOR requires Alerts to keep you safe.");
                    }
                }
            } catch (permError: any) {
                throw new Error(`Permission Denied: ${permError.message}`);
            }
            // ------------------------------------

            login(data.access_token, data.user);
            setMode(role as "tourist" | "enterprise");
            navigate(role === "enterprise" ? "/enterprise" : "/dashboard");
        } catch (err: any) { setError(err.message); }
        finally { setLoading(false); }
    };

    const next = () => {
        if (step === STEPS.length - 1) { handleSubmit(); return; }
        // Enterprise skips medical/emergency steps
        if (role === "enterprise" && step === 1) { handleSubmit(); return; }
        setStep(step + 1);
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Mobile brand */}
            <div className="flex items-center gap-2 mb-6 lg:hidden">
                <Zap className="w-7 h-7" style={{ color: "var(--thor-brand)" }} fill="currentColor" />
                <span className="text-heading" style={{ fontWeight: 900, letterSpacing: "0.15em", background: "linear-gradient(135deg, var(--thor-brand), #ef4444)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>THOR</span>
            </div>

            <h2 className="text-display mb-2" style={{ color: "var(--thor-text)" }}>Create account</h2>
            <p className="text-body mb-6" style={{ color: "var(--thor-text-muted)" }}>
                {step === 0 ? "Choose how you'll use THOR" : STEPS[step].label}
            </p>

            {/* Progress */}
            {step > 0 && (
                <div className="flex gap-1.5 mb-6">
                    {STEPS.slice(0, role === "enterprise" ? 2 : STEPS.length).map((s, i) => (
                        <div key={s.id} className="flex-1 h-1 rounded-full" style={{ background: i <= step ? "var(--thor-brand)" : "var(--thor-surface-3)" }} />
                    ))}
                </div>
            )}

            {error && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-lg mb-5"
                    style={{ background: "var(--thor-danger-muted)", color: "var(--thor-danger)" }}>
                    <AlertCircle className="w-4 h-4 flex-shrink-0" /><span className="text-caption">{error}</span>
                </div>
            )}

            <AnimatePresence mode="wait">
                <motion.div key={step} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.2 }}>

                    {/* Step 0: Role */}
                    {step === 0 && (
                        <div className="space-y-3">
                            {[
                                { id: "tourist", icon: User, title: "Tourist", desc: "Personal safety, travel planning, emergency response", color: "var(--thor-safe)" },
                                { id: "enterprise", icon: Shield, title: "Enterprise", desc: "Manage teams, monitor tourists, command center", color: "var(--thor-info)" },
                            ].map((r) => {
                                const Icon = r.icon;
                                const isSelected = role === r.id;
                                return (
                                    <button key={r.id} onClick={() => setRole(r.id as any)}
                                        className="card w-full p-5 text-left flex items-center gap-4 transition-all"
                                        style={{ borderColor: isSelected ? r.color : undefined, background: isSelected ? `${r.color}10` : undefined }}>
                                        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${r.color}18`, color: r.color }}>
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-subheading" style={{ color: "var(--thor-text)" }}>{r.title}</p>
                                            <p className="text-caption" style={{ color: "var(--thor-text-muted)" }}>{r.desc}</p>
                                        </div>
                                        {isSelected && <Check className="w-5 h-5" style={{ color: r.color }} />}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* Step 1: Basic info */}
                    {step === 1 && (
                        <div className="space-y-4">
                            <div>
                                <label className="text-caption block mb-2" style={{ color: "var(--thor-text-secondary)" }}>Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--thor-text-disabled)" }} />
                                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" className="input" style={{ paddingLeft: "2.5rem" }} />
                                </div>
                            </div>
                            <div>
                                <label className="text-caption block mb-2" style={{ color: "var(--thor-text-secondary)" }}>Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--thor-text-disabled)" }} />
                                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" className="input" style={{ paddingLeft: "2.5rem" }} />
                                </div>
                            </div>
                            <div>
                                <label className="text-caption block mb-2" style={{ color: "var(--thor-text-secondary)" }}>Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--thor-text-disabled)" }} />
                                    <input type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 6 characters" className="input" style={{ paddingLeft: "2.5rem", paddingRight: "2.5rem" }} />
                                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--thor-text-disabled)" }}>
                                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="text-caption block mb-2" style={{ color: "var(--thor-text-secondary)" }}>Preferred Language</label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--thor-text-disabled)" }} />
                                    <select
                                        value={language}
                                        onChange={(e) => setLanguage(e.target.value)}
                                        className="input appearance-none bg-black"
                                        style={{ paddingLeft: "2.5rem" }}
                                    >
                                        {supportedLanguages.map(lang => (
                                            <option key={lang} value={lang}>{lang}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Medical (Tourist only) */}
                    {step === 2 && (
                        <div className="space-y-4">
                            <p className="text-caption mb-2" style={{ color: "var(--thor-text-muted)" }}>Optional — helps emergency responders</p>
                            <div>
                                <label className="text-caption block mb-2" style={{ color: "var(--thor-text-secondary)" }}>Blood Group</label>
                                <div className="relative">
                                    <Droplets className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--thor-danger)" }} />
                                    <input type="text" value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)} placeholder="e.g. O+" className="input" style={{ paddingLeft: "2.5rem" }} />
                                </div>
                            </div>
                            <div>
                                <label className="text-caption block mb-2" style={{ color: "var(--thor-text-secondary)" }}>Allergies</label>
                                <div className="relative">
                                    <Pill className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--thor-warn)" }} />
                                    <input type="text" value={allergies} onChange={(e) => setAllergies(e.target.value)} placeholder="e.g. Peanuts, Penicillin" className="input" style={{ paddingLeft: "2.5rem" }} />
                                </div>
                            </div>
                            <div>
                                <label className="text-caption block mb-2" style={{ color: "var(--thor-text-secondary)" }}>Medical Conditions</label>
                                <div className="relative">
                                    <Heart className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--thor-safe)" }} />
                                    <input type="text" value={conditions} onChange={(e) => setConditions(e.target.value)} placeholder="e.g. Asthma, Diabetes" className="input" style={{ paddingLeft: "2.5rem" }} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Emergency contact */}
                    {step === 3 && (
                        <div className="space-y-4">
                            <p className="text-caption mb-2" style={{ color: "var(--thor-text-muted)" }}>Optional — contacted during emergencies</p>
                            <div>
                                <label className="text-caption block mb-2" style={{ color: "var(--thor-text-secondary)" }}>Contact Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--thor-text-disabled)" }} />
                                    <input type="text" value={emergencyName} onChange={(e) => setEmergencyName(e.target.value)} placeholder="Full name" className="input" style={{ paddingLeft: "2.5rem" }} />
                                </div>
                            </div>
                            <div>
                                <label className="text-caption block mb-2" style={{ color: "var(--thor-text-secondary)" }}>Phone Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--thor-text-disabled)" }} />
                                    <input type="tel" value={emergencyPhone} onChange={(e) => setEmergencyPhone(e.target.value)} placeholder="+91 9876543210" className="input" style={{ paddingLeft: "2.5rem" }} />
                                </div>
                            </div>
                            <div>
                                <label className="text-caption block mb-2" style={{ color: "var(--thor-text-secondary)" }}>Relation</label>
                                <input type="text" value={emergencyRelation} onChange={(e) => setEmergencyRelation(e.target.value)} placeholder="e.g. Mother, Spouse" className="input" />
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Navigation buttons */}
            <div className="flex gap-3 mt-8">
                {step > 0 && (
                    <button onClick={() => setStep(step - 1)} className="btn btn-ghost flex-shrink-0">
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                )}
                <button onClick={next} disabled={!canNext() || loading} className="btn btn-brand btn-lg flex-1">
                    {loading ? (
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                            <Zap className="w-5 h-5" fill="currentColor" />
                        </motion.div>
                    ) : step === (role === "enterprise" ? 1 : STEPS.length - 1) ? (
                        <>Create Account <Zap className="w-4 h-4" fill="currentColor" /></>
                    ) : (
                        <>Continue <ArrowRight className="w-4 h-4" /></>
                    )}
                </button>
            </div>

            <p className="text-body text-center mt-6" style={{ color: "var(--thor-text-muted)" }}>
                Already have an account?{" "}
                <Link to="/login" className="font-semibold" style={{ color: "var(--thor-brand)" }}>Sign in</Link>
            </p>
        </motion.div>
    );
}

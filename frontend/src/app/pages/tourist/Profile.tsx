import { useState } from "react";
import { motion } from "motion/react";
import { User, Mail, Phone, Heart, Droplets, Pill, Shield, Save, AlertCircle, Check } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Profile() {
    const { user } = useAuth();
    const [saved, setSaved] = useState(false);
    const [name, setName] = useState(user?.name || "");
    const [email] = useState(user?.email || "");
    const [bloodGroup, setBloodGroup] = useState(user?.medical_details?.blood_group || "");
    const [allergies, setAllergies] = useState(user?.medical_details?.allergies || "");
    const [conditions, setConditions] = useState(user?.medical_details?.conditions || "");
    const [ecName, setEcName] = useState(user?.emergency_contacts?.[0]?.name || "");
    const [ecPhone, setEcPhone] = useState(user?.emergency_contacts?.[0]?.phone || "");
    const [ecRelation, setEcRelation] = useState(user?.emergency_contacts?.[0]?.relation || "");

    const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

    return (
        <div className="p-6 space-y-6 max-w-2xl mx-auto">
            <div>
                <h1 className="text-heading" style={{ color: "var(--thor-text)" }}>Profile</h1>
                <p className="text-body mt-1" style={{ color: "var(--thor-text-muted)" }}>Manage your personal and medical information</p>
            </div>

            {/* Avatar */}
            <div className="card p-6 flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-display" style={{ background: "var(--thor-brand-muted)", color: "var(--thor-brand)" }}>
                    {name.charAt(0)?.toUpperCase() || "T"}
                </div>
                <div>
                    <p className="text-heading" style={{ color: "var(--thor-text)" }}>{name || "Traveler"}</p>
                    <p className="text-caption" style={{ color: "var(--thor-text-muted)" }}>{email}</p>
                </div>
            </div>

            {/* Personal */}
            <div className="card p-5">
                <h2 className="text-subheading mb-4 flex items-center gap-2" style={{ color: "var(--thor-text)" }}><User className="w-4 h-4" style={{ color: "var(--thor-info)" }} />Personal</h2>
                <div className="space-y-4">
                    <div>
                        <label className="text-caption block mb-2" style={{ color: "var(--thor-text-secondary)" }}>Full Name</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input" />
                    </div>
                    <div>
                        <label className="text-caption block mb-2" style={{ color: "var(--thor-text-secondary)" }}>Email</label>
                        <input type="email" value={email} disabled className="input" style={{ opacity: 0.6 }} />
                    </div>
                </div>
            </div>

            {/* Medical */}
            <div className="card p-5">
                <h2 className="text-subheading mb-4 flex items-center gap-2" style={{ color: "var(--thor-text)" }}><Heart className="w-4 h-4" style={{ color: "var(--thor-danger)" }} />Medical Profile</h2>
                <div className="space-y-4">
                    <div>
                        <label className="text-caption block mb-2" style={{ color: "var(--thor-text-secondary)" }}>Blood Group</label>
                        <input type="text" value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)} placeholder="e.g. O+" className="input" />
                    </div>
                    <div>
                        <label className="text-caption block mb-2" style={{ color: "var(--thor-text-secondary)" }}>Allergies</label>
                        <input type="text" value={allergies} onChange={(e) => setAllergies(e.target.value)} placeholder="Comma separated" className="input" />
                    </div>
                    <div>
                        <label className="text-caption block mb-2" style={{ color: "var(--thor-text-secondary)" }}>Medical Conditions</label>
                        <input type="text" value={conditions} onChange={(e) => setConditions(e.target.value)} placeholder="e.g. Asthma" className="input" />
                    </div>
                </div>
            </div>

            {/* Emergency Contacts */}
            <div className="card p-5">
                <h2 className="text-subheading mb-4 flex items-center gap-2" style={{ color: "var(--thor-text)" }}><Phone className="w-4 h-4" style={{ color: "var(--thor-safe)" }} />Emergency Contact</h2>
                <div className="space-y-4">
                    <div><label className="text-caption block mb-2" style={{ color: "var(--thor-text-secondary)" }}>Name</label><input type="text" value={ecName} onChange={(e) => setEcName(e.target.value)} className="input" /></div>
                    <div><label className="text-caption block mb-2" style={{ color: "var(--thor-text-secondary)" }}>Phone</label><input type="tel" value={ecPhone} onChange={(e) => setEcPhone(e.target.value)} className="input" /></div>
                    <div><label className="text-caption block mb-2" style={{ color: "var(--thor-text-secondary)" }}>Relation</label><input type="text" value={ecRelation} onChange={(e) => setEcRelation(e.target.value)} className="input" /></div>
                </div>
            </div>

            <button onClick={handleSave} className={`btn ${saved ? "btn-ghost" : "btn-brand"} btn-lg w-full`}>
                {saved ? <><Check className="w-5 h-5" /> Saved!</> : <><Save className="w-5 h-5" /> Save Changes</>}
            </button>
        </div>
    );
}

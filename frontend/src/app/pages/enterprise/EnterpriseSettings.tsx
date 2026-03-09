import { useState } from "react";
import { motion } from "motion/react";
import {
    Shield, Bell, Monitor, Globe, Database, Key, Users,
    ToggleLeft, ToggleRight, Zap, RefreshCw, Save,
    AlertTriangle, Clock, Wifi, Lock, Eye, EyeOff
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";

const Toggle = ({ on, toggle }: { on: boolean; toggle: () => void }) => (
    <button onClick={toggle} className="transition-colors" style={{ color: on ? "var(--thor-safe)" : "var(--thor-text-disabled)" }}>
        {on ? <ToggleRight className="w-7 h-7" /> : <ToggleLeft className="w-7 h-7" />}
    </button>
);

const SettingRow = ({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) => (
    <div className="flex items-center justify-between py-3.5 border-b last:border-0" style={{ borderColor: "var(--thor-border)" }}>
        <div>
            <p className="text-sm font-semibold" style={{ color: "var(--thor-text)" }}>{label}</p>
            {desc && <p className="text-xs mt-0.5" style={{ color: "var(--thor-text-muted)" }}>{desc}</p>}
        </div>
        <div className="ml-6 flex-shrink-0">{children}</div>
    </div>
);

export default function EnterpriseSettings() {
    const { theme, toggleTheme } = useTheme();
    const { user } = useAuth();

    // Notification settings
    const [sosAlerts, setSosAlerts] = useState(true);
    const [offlineAlerts, setOfflineAlerts] = useState(true);
    const [batteryAlerts, setBatteryAlerts] = useState(true);
    const [pulseAlerts, setPulseAlerts] = useState(false);

    // Monitoring settings
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [refreshInterval, setRefreshInterval] = useState("30");
    const [liveTracking, setLiveTracking] = useState(true);
    const [showOffline, setShowOffline] = useState(true);

    // Security settings
    const [twoFactor, setTwoFactor] = useState(false);
    const [sessionTimeout, setSessionTimeout] = useState("480");
    const [showApiKey, setShowApiKey] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const Section = ({ icon: Icon, title, color, children }: { icon: any; title: string; color: string; children: React.ReactNode }) => (
        <div className="card p-6">
            <h2 className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color }}>
                <Icon className="w-4 h-4" /> {title}
            </h2>
            {children}
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black tracking-tight" style={{ color: "var(--thor-text)" }}>
                        Enterprise Settings
                    </h1>
                    <p className="text-sm mt-1" style={{ color: "var(--thor-text-muted)" }}>
                        System configuration for THOR Enterprise Command Platform
                    </p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={handleSave}
                    className="btn btn-brand px-6 py-2.5"
                    style={{ background: saved ? "var(--thor-safe)" : undefined }}
                >
                    {saved ? <><RefreshCw className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> Save Changes</>}
                </motion.button>
            </div>

            {/* Two-column grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

                {/* Left Column */}
                <div className="space-y-6">

                    {/* Alert Notifications */}
                    <Section icon={Bell} title="Alert Notifications" color="var(--thor-info)">
                        <SettingRow label="SOS Activations" desc="Immediate alert when any tourist triggers SOS">
                            <Toggle on={sosAlerts} toggle={() => setSosAlerts(!sosAlerts)} />
                        </SettingRow>
                        <SettingRow label="Offline Tourists" desc="Alert when a tracked tourist goes offline">
                            <Toggle on={offlineAlerts} toggle={() => setOfflineAlerts(!offlineAlerts)} />
                        </SettingRow>
                        <SettingRow label="Low Battery Warnings" desc="Notify when tourist battery drops below 15%">
                            <Toggle on={batteryAlerts} toggle={() => setBatteryAlerts(!batteryAlerts)} />
                        </SettingRow>
                        <SettingRow label="Pulse Check-in Missed" desc="Alert if tourist misses their scheduled pulse">
                            <Toggle on={pulseAlerts} toggle={() => setPulseAlerts(!pulseAlerts)} />
                        </SettingRow>
                    </Section>

                    {/* Live Monitoring */}
                    <Section icon={Wifi} title="Live Monitoring" color="var(--thor-safe)">
                        <SettingRow label="Auto-Refresh Dashboard" desc="Automatically refresh tourist data">
                            <Toggle on={autoRefresh} toggle={() => setAutoRefresh(!autoRefresh)} />
                        </SettingRow>
                        <SettingRow label="Refresh Interval" desc="How often to poll for updates">
                            <select value={refreshInterval} onChange={e => setRefreshInterval(e.target.value)}
                                className="input text-sm" style={{ width: "auto", minWidth: 120 }}>
                                <option value="10">10 seconds</option>
                                <option value="30">30 seconds</option>
                                <option value="60">1 minute</option>
                                <option value="300">5 minutes</option>
                            </select>
                        </SettingRow>
                        <SettingRow label="GPS Live Tracking" desc="Real-time location updates on map">
                            <Toggle on={liveTracking} toggle={() => setLiveTracking(!liveTracking)} />
                        </SettingRow>
                        <SettingRow label="Show Offline Tourists" desc="Display offline tourists on the map">
                            <Toggle on={showOffline} toggle={() => setShowOffline(!showOffline)} />
                        </SettingRow>
                    </Section>

                </div>

                {/* Right Column */}
                <div className="space-y-6">

                    {/* Security */}
                    <Section icon={Lock} title="Security & Access" color="var(--thor-warn)">
                        <SettingRow label="Two-Factor Authentication" desc="Extra verification on login">
                            <Toggle on={twoFactor} toggle={() => setTwoFactor(!twoFactor)} />
                        </SettingRow>
                        <SettingRow label="Session Timeout" desc="Auto sign-out after inactivity">
                            <select value={sessionTimeout} onChange={e => setSessionTimeout(e.target.value)}
                                className="input text-sm" style={{ width: "auto", minWidth: 140 }}>
                                <option value="60">1 hour</option>
                                <option value="240">4 hours</option>
                                <option value="480">8 hours</option>
                                <option value="1440">24 hours</option>
                                <option value="0">Never</option>
                            </select>
                        </SettingRow>
                        <SettingRow label="API Key" desc="Your enterprise API access key">
                            <div className="flex items-center gap-2">
                                <code className="text-xs px-2 py-1 rounded" style={{ background: "var(--thor-surface-3)", color: "var(--thor-text-muted)" }}>
                                    {showApiKey ? "thor-ent-xxxx-xxxx-xxxx" : "••••••••••••••••"}
                                </code>
                                <button onClick={() => setShowApiKey(!showApiKey)} className="p-1.5 rounded hover:bg-white/5" style={{ color: "var(--thor-text-muted)" }}>
                                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </SettingRow>
                    </Section>

                    {/* Appearance */}
                    <Section icon={Monitor} title="Appearance" color="var(--thor-purple)">
                        <SettingRow label="Dark Mode" desc="Toggle system-wide dark/light theme">
                            <Toggle on={theme === "dark"} toggle={toggleTheme} />
                        </SettingRow>
                    </Section>

                    {/* Account Info */}
                    <Section icon={Users} title="Enterprise Account" color="var(--thor-brand)">
                        <SettingRow label="Account Name">
                            <span className="text-sm font-bold" style={{ color: "var(--thor-text)" }}>{user?.name || "Enterprise Admin"}</span>
                        </SettingRow>
                        <SettingRow label="Email">
                            <span className="text-sm" style={{ color: "var(--thor-text-muted)" }}>{user?.email || "—"}</span>
                        </SettingRow>
                        <SettingRow label="Plan">
                            <span className="badge" style={{ background: "var(--thor-brand)", color: "#000", fontWeight: 700 }}>
                                Enterprise
                            </span>
                        </SettingRow>
                    </Section>

                    {/* System */}
                    <div className="card p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Zap className="w-5 h-5" style={{ color: "var(--thor-brand)" }} fill="currentColor" />
                            <div>
                                <p className="text-sm font-bold" style={{ color: "var(--thor-text)" }}>THOR Enterprise Platform</p>
                                <p className="text-xs" style={{ color: "var(--thor-text-disabled)" }}>v1.0.0 · All systems operational</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: "var(--thor-safe)" }}>
                            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                            Online
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

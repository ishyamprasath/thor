import { useState } from "react";
import { Settings, Bell, Shield, Globe, Moon, Sun, Monitor, ChevronRight, ToggleLeft, ToggleRight } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function SettingsPage() {
    const { theme, toggleTheme } = useTheme();
    const [notifications, setNotifications] = useState(true);
    const [pulseInterval, setPulseInterval] = useState("30");
    const [gpsAccuracy, setGpsAccuracy] = useState("high");

    const Toggle = ({ on, toggle }: { on: boolean; toggle: () => void }) => (
        <button onClick={toggle} style={{ color: on ? "var(--thor-safe)" : "var(--thor-text-disabled)" }}>
            {on ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
        </button>
    );

    return (
        <div className="p-6 space-y-6 max-w-2xl mx-auto">
            <div>
                <h1 className="text-heading" style={{ color: "var(--thor-text)" }}>Settings</h1>
                <p className="text-body mt-1" style={{ color: "var(--thor-text-muted)" }}>Configure app behavior and safety preferences</p>
            </div>

            <div className="card p-5">
                <h2 className="text-subheading mb-4 flex items-center gap-2" style={{ color: "var(--thor-text)" }}><Shield className="w-4 h-4" style={{ color: "var(--thor-brand)" }} />Safety</h2>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div><p className="text-body" style={{ color: "var(--thor-text)" }}>Safety Pulse Interval</p><p className="text-caption" style={{ color: "var(--thor-text-muted)" }}>How often to check in</p></div>
                        <select value={pulseInterval} onChange={(e) => setPulseInterval(e.target.value)} className="input" style={{ width: "auto" }}>
                            <option value="15">15 min</option><option value="30">30 min</option><option value="60">1 hour</option>
                        </select>
                    </div>
                    <div className="flex items-center justify-between">
                        <div><p className="text-body" style={{ color: "var(--thor-text)" }}>GPS Accuracy</p><p className="text-caption" style={{ color: "var(--thor-text-muted)" }}>Higher accuracy uses more battery</p></div>
                        <select value={gpsAccuracy} onChange={(e) => setGpsAccuracy(e.target.value)} className="input" style={{ width: "auto" }}>
                            <option value="high">High</option><option value="balanced">Balanced</option><option value="low">Low</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="card p-5">
                <h2 className="text-subheading mb-4 flex items-center gap-2" style={{ color: "var(--thor-text)" }}><Bell className="w-4 h-4" style={{ color: "var(--thor-info)" }} />Notifications</h2>
                <div className="flex items-center justify-between">
                    <div><p className="text-body" style={{ color: "var(--thor-text)" }}>Push Notifications</p><p className="text-caption" style={{ color: "var(--thor-text-muted)" }}>Alerts for hazards and check-ins</p></div>
                    <Toggle on={notifications} toggle={() => setNotifications(!notifications)} />
                </div>
            </div>

            <div className="card p-5">
                <h2 className="text-subheading mb-4 flex items-center gap-2" style={{ color: "var(--thor-text)" }}><Monitor className="w-4 h-4" style={{ color: "var(--thor-purple)" }} />Appearance</h2>
                <div className="flex items-center justify-between">
                    <div><p className="text-body" style={{ color: "var(--thor-text)" }}>Dark Mode</p></div>
                    <Toggle on={theme === "dark"} toggle={toggleTheme} />
                </div>
            </div>

            <div className="card p-4 text-center">
                <p className="text-caption" style={{ color: "var(--thor-text-disabled)" }}>THOR Safety Platform v1.0.0</p>
            </div>
        </div>
    );
}

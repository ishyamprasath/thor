import { useState } from "react";
import { motion } from "motion/react";
import {
  Shield,
  MapPin,
  Battery,
  Wifi,
  Heart,
  Phone,
  AlertTriangle,
  Navigation,
  Clock,
  Activity,
  ArrowLeft,
  MessageSquare,
} from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { Button } from "../../components/ui/button";

export default function EnterpriseTouristView() {
  const navigate = useNavigate();
  const { id } = useParams();

  // Mock tourist data
  const tourist = {
    id: Number(id),
    name: "Sarah Johnson",
    email: "sarah.j@email.com",
    phone: "+1 555-0123",
    country: "USA",
    destination: "Paris, France",
    tripName: "Paris Summer Tour 2026",
    status: "online",
    safetyScore: 96,
    battery: 78,
    lastSeen: "Active now",
    currentLocation: "Eiffel Tower, Paris",
    tripDuration: "Mar 7 - Mar 14, 2026",
  };

  const [locationHistory] = useState([
    { time: "14:30", location: "Eiffel Tower", safety: 95, activity: "Sightseeing" },
    { time: "12:45", location: "Louvre Museum", safety: 98, activity: "Museum visit" },
    { time: "10:15", location: "Hotel Le Marais", safety: 99, activity: "Check-in" },
    { time: "09:00", location: "Charles de Gaulle Airport", safety: 92, activity: "Arrival" },
  ]);

  const [medicalInfo] = useState({
    bloodType: "O+",
    allergies: "Penicillin",
    emergencyContact: "John Johnson (+1 555-0199)",
    insurance: "Global Health Insurance #12345",
  });

  const [recentAlerts] = useState([
    { id: 1, type: "info", message: "Check-in confirmed at 14:25", time: "5 min ago" },
    { id: 2, type: "success", message: "Entered safe zone: Eiffel Tower area", time: "15 min ago" },
    { id: 3, type: "warning", message: "Battery below 80%", time: "1 hour ago" },
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-xl border-b border-white/20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button onClick={() => navigate("/enterprise/dashboard")} className="p-2 hover:bg-slate-100 rounded-lg">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <Shield className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Tourist Monitoring
                </h1>
                <p className="text-sm text-slate-600">{tourist.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full">
                <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-green-700">Online</span>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl">
                <MessageSquare className="w-4 h-4 mr-2" />
                Contact
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tourist Profile */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl"
            >
              <div className="flex items-start gap-6 mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                  {tourist.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-slate-800 mb-2">{tourist.name}</h2>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone className="w-4 h-4" />
                      {tourist.email}
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <MapPin className="w-4 h-4" />
                      {tourist.destination}
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Clock className="w-4 h-4" />
                      {tourist.tripDuration}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-600 mb-2">Safety Score</div>
                  <div className="text-5xl font-bold text-green-600">{tourist.safetyScore}%</div>
                  <div className="text-sm text-green-700 mt-1">Excellent</div>
                </div>
              </div>

              {/* Status Cards */}
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { label: "Battery", value: `${tourist.battery}%`, icon: Battery, color: "green" },
                  { label: "Connectivity", value: "Strong", icon: Wifi, color: "blue" },
                  { label: "Last Active", value: tourist.lastSeen, icon: Activity, color: "violet" },
                ].map((stat, idx) => (
                  <div key={idx} className={`p-4 bg-${stat.color}-50 rounded-xl`}>
                    <div className="flex items-center gap-2 mb-2">
                      <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
                      <span className="text-sm font-medium text-slate-700">{stat.label}</span>
                    </div>
                    <div className={`text-2xl font-bold text-${stat.color}-700`}>{stat.value}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Live Tracking Map */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-slate-800">Live GPS Tracking</h3>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 rounded-full">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">{tourist.currentLocation}</span>
                </div>
              </div>

              {/* Mock Map */}
              <div className="relative h-96 bg-gradient-to-br from-blue-100 to-violet-100 rounded-xl overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                  <svg width="100%" height="100%">
                    <pattern id="map-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#94a3b8" strokeWidth="1" />
                    </pattern>
                    <rect width="100%" height="100%" fill="url(#map-grid)" />
                  </svg>
                </div>

                {/* Current location marker */}
                <motion.div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="relative">
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center shadow-xl">
                      <Navigation className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white animate-pulse" />
                  </div>
                </motion.div>

                {/* Movement trail */}
                {[
                  { top: "30%", left: "40%" },
                  { top: "45%", left: "35%" },
                  { top: "60%", left: "45%" },
                ].map((point, idx) => (
                  <div
                    key={idx}
                    className="absolute w-3 h-3 bg-blue-400 rounded-full opacity-50"
                    style={{ top: point.top, left: point.left }}
                  />
                ))}

                {/* Safe zones */}
                <motion.div
                  className="absolute top-1/3 right-1/4 w-32 h-32 bg-green-400/20 rounded-full border-2 border-green-400/40"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
              </div>
            </motion.div>

            {/* Movement History */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg"
            >
              <h3 className="text-xl font-semibold text-slate-800 mb-6">Movement History</h3>
              <div className="space-y-4">
                {locationHistory.map((entry, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                    <div className="w-16 text-center">
                      <div className="text-sm font-semibold text-slate-800">{entry.time}</div>
                    </div>
                    <div className="w-1 h-12 bg-blue-600 rounded-full" />
                    <div className="flex-1">
                      <div className="font-semibold text-slate-800">{entry.location}</div>
                      <div className="text-sm text-slate-600">{entry.activity}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-600">{entry.safety}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Medical Information */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg"
            >
              <div className="flex items-center gap-2 mb-6">
                <Heart className="w-6 h-6 text-red-600" />
                <h3 className="text-lg font-semibold text-slate-800">Medical Profile</h3>
              </div>
              <div className="space-y-4">
                {Object.entries(medicalInfo).map(([key, value], idx) => (
                  <div key={idx} className="pb-4 border-b border-slate-200 last:border-0 last:pb-0">
                    <div className="text-xs text-slate-500 mb-1 capitalize">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </div>
                    <div className="text-sm font-medium text-slate-800">{value}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg"
            >
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl justify-start">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Send Check-in Request
                </Button>
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl justify-start">
                  <Navigation className="w-4 h-4 mr-2" />
                  Send Safe Route
                </Button>
                <Button className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl justify-start">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Trigger Emergency Alert
                </Button>
              </div>
            </motion.div>

            {/* Recent Alerts */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg"
            >
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Recent Alerts</h3>
              <div className="space-y-3">
                {recentAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-xl ${
                      alert.type === "warning"
                        ? "bg-yellow-50 border border-yellow-200"
                        : alert.type === "success"
                        ? "bg-green-50 border border-green-200"
                        : "bg-blue-50 border border-blue-200"
                    }`}
                  >
                    <div className="text-sm font-medium text-slate-800">{alert.message}</div>
                    <div className="text-xs text-slate-500 mt-1">{alert.time}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Safety Pulse */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl"
            >
              <div className="flex items-center gap-2 mb-4">
                <Heart className="w-6 h-6" />
                <h3 className="text-lg font-semibold">Safety Pulse Status</h3>
              </div>
              <div className="text-sm opacity-90 mb-2">Last check-in</div>
              <div className="text-2xl font-bold mb-4">5 minutes ago</div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span>All systems normal</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

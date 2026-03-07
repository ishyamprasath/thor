import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Shield,
  MapPin,
  AlertTriangle,
  Wifi,
  WifiOff,
  Battery,
  Navigation,
  Phone,
  MessageSquare,
  Heart,
  Menu,
  Bell,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router";
import { Button } from "../../components/ui/button";

export default function TouristMonitoring() {
  const navigate = useNavigate();
  const location = useLocation();
  const destination = location.state?.destination || "Paris, France";
  const places = location.state?.places || [];

  const [batteryLevel, setBatteryLevel] = useState(85);
  const [isOnline, setIsOnline] = useState(true);
  const [safetyScore, setSafetyScore] = useState(94);
  const [lastCheckIn, setLastCheckIn] = useState("2 min ago");
  const [showSOSDialog, setShowSOSDialog] = useState(false);

  const [alerts] = useState([
    {
      id: 1,
      type: "info",
      title: "Safe zone detected",
      message: "You're in a well-monitored tourist area",
      time: "Just now",
    },
    {
      id: 2,
      type: "warning",
      title: "Weather alert",
      message: "Light rain expected in 2 hours",
      time: "10 min ago",
    },
  ]);

  const [nearbyLocations] = useState([
    { type: "police", name: "Central Police Station", distance: "0.3 km" },
    { type: "hospital", name: "City General Hospital", distance: "0.8 km" },
    { type: "embassy", name: "Tourist Embassy", distance: "1.2 km" },
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50">
      {/* Top Navigation Bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-xl border-b border-white/20 sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                onClick={() => navigate("/tourist/dashboard")}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <Menu className="w-5 h-5" />
              </Button>
              <Shield className="w-7 h-7 text-green-600" />
              <div>
                <h1 className="text-xl font-bold text-slate-800">GuardianAI Active</h1>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <MapPin className="w-3 h-3" />
                  {destination}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 rounded-full">
                {isOnline ? <Wifi className="w-4 h-4 text-green-600" /> : <WifiOff className="w-4 h-4 text-orange-600" />}
                <span className="text-sm font-medium text-green-700">
                  {isOnline ? "Online" : "Offline"}
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full">
                <Battery className="w-4 h-4 text-slate-600" />
                <span className="text-sm font-medium text-slate-700">{batteryLevel}%</span>
              </div>
              <Button className="p-2 hover:bg-slate-100 rounded-lg relative">
                <Bell className="w-5 h-5" />
                <div className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Map Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Safety Score Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-8 text-white shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-sm opacity-90 mb-1">Current Safety Score</div>
                  <div className="text-6xl font-bold">{safetyScore}%</div>
                  <div className="text-sm opacity-90 mt-2">Excellent - All systems active</div>
                </div>
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Shield className="w-20 h-20 opacity-20" />
                </motion.div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/20">
                {[
                  { label: "Location", value: "Tracked", icon: MapPin },
                  { label: "Monitoring", value: "Active", icon: Heart },
                  { label: "Last Check", value: lastCheckIn, icon: MessageSquare },
                ].map((item, idx) => (
                  <div key={idx} className="text-center">
                    <item.icon className="w-5 h-5 mx-auto mb-1 opacity-75" />
                    <div className="text-xs opacity-75">{item.label}</div>
                    <div className="font-semibold text-sm mt-1">{item.value}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Live Safety Map */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-slate-800">Live Safety Map</h2>
                <Button
                  onClick={() => navigate("/tourist/concierge")}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm"
                >
                  AI Assistant
                </Button>
              </div>

              {/* Mock Map */}
              <div className="relative h-96 bg-gradient-to-br from-blue-100 to-teal-100 rounded-2xl overflow-hidden">
                {/* Grid pattern */}
                <div className="absolute inset-0 opacity-20">
                  <svg width="100%" height="100%">
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#94a3b8" strokeWidth="1" />
                    </pattern>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                  </svg>
                </div>

                {/* User location */}
                <motion.div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="relative">
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                      <Navigation className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
                  </div>
                </motion.div>

                {/* Safe zones */}
                <motion.div
                  className="absolute top-1/4 right-1/4 w-24 h-24 bg-green-400/30 rounded-full"
                  animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
                <motion.div
                  className="absolute bottom-1/3 left-1/4 w-32 h-32 bg-green-400/30 rounded-full"
                  animate={{ scale: [1.1, 1, 1.1], opacity: [0.5, 0.3, 0.5] }}
                  transition={{ duration: 4, repeat: Infinity }}
                />

                {/* Emergency markers */}
                {[
                  { top: "20%", left: "70%", icon: Phone, color: "red" },
                  { top: "60%", left: "30%", icon: Heart, color: "blue" },
                ].map((marker, idx) => (
                  <motion.div
                    key={idx}
                    className={`absolute w-10 h-10 bg-${marker.color}-600 rounded-full flex items-center justify-center shadow-lg`}
                    style={{ top: marker.top, left: marker.left }}
                    whileHover={{ scale: 1.2 }}
                  >
                    <marker.icon className="w-5 h-5 text-white" />
                  </motion.div>
                ))}

                {/* Current route overlay */}
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-lg">
                  <div className="text-xs text-slate-600 mb-1">Your Route</div>
                  <div className="font-semibold text-slate-800">{places.length} stops</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Emergency SOS Button */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl"
            >
              <h3 className="font-semibold text-slate-800 mb-4 text-center">Emergency Control</h3>
              <Button
                onClick={() => navigate("/tourist/emergency")}
                className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white py-8 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
              >
                <Shield className="w-6 h-6 mr-2" />
                ACTIVATE SOS
              </Button>
              <p className="text-xs text-slate-500 text-center mt-3">
                Press to send emergency alert with your location
              </p>
            </motion.div>

            {/* Safety Pulse */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg"
            >
              <h3 className="font-semibold text-slate-800 mb-4">Safety Pulse</h3>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-slate-600">Last check-in</span>
                <span className="text-sm font-medium text-green-600">{lastCheckIn}</span>
              </div>
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl">
                <Heart className="w-4 h-4 mr-2" />
                I'm Safe
              </Button>
            </motion.div>

            {/* Nearby Emergency Facilities */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg"
            >
              <h3 className="font-semibold text-slate-800 mb-4">Nearby Help</h3>
              <div className="space-y-3">
                {nearbyLocations.map((loc, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      loc.type === "police" ? "bg-blue-100" :
                      loc.type === "hospital" ? "bg-red-100" : "bg-purple-100"
                    }`}>
                      {loc.type === "police" ? <Phone className="w-5 h-5 text-blue-600" /> :
                       loc.type === "hospital" ? <Heart className="w-5 h-5 text-red-600" /> :
                       <Shield className="w-5 h-5 text-purple-600" />}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-slate-800">{loc.name}</div>
                      <div className="text-xs text-slate-500">{loc.distance}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Recent Alerts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg"
            >
              <h3 className="font-semibold text-slate-800 mb-4">Recent Alerts</h3>
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-xl ${
                      alert.type === "warning"
                        ? "bg-yellow-50 border border-yellow-200"
                        : "bg-blue-50 border border-blue-200"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <AlertTriangle
                        className={`w-4 h-4 mt-0.5 ${
                          alert.type === "warning" ? "text-yellow-600" : "text-blue-600"
                        }`}
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm text-slate-800">{alert.title}</div>
                        <div className="text-xs text-slate-600 mt-1">{alert.message}</div>
                        <div className="text-xs text-slate-400 mt-1">{alert.time}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

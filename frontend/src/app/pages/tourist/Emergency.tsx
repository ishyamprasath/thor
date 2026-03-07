import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Shield, Phone, MapPin, Heart, AlertTriangle, Navigation, WifiOff, ArrowLeft, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "../../components/ui/button";

export default function TouristEmergency() {
  const navigate = useNavigate();
  const [sosActivated, setSosActivated] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    if (sosActivated && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [sosActivated, countdown]);

  const activateSOS = () => {
    setSosActivated(true);
  };

  const cancelSOS = () => {
    setSosActivated(false);
    setCountdown(5);
  };

  const emergencyContacts = [
    { name: "Police", number: "17 / 112", icon: Phone, color: "blue" },
    { name: "Ambulance", number: "15", icon: Heart, color: "red" },
    { name: "Fire Department", number: "18", icon: AlertTriangle, color: "orange" },
    { name: "Tourist Embassy", number: "+33-1-43-12-22-22", icon: Shield, color: "purple" },
  ];

  const nearbyHelp = [
    { type: "Police Station", name: "Central Police", distance: "0.3 km", eta: "4 min walk" },
    { type: "Hospital", name: "City General Hospital", distance: "0.8 km", eta: "11 min walk" },
    { type: "Embassy", name: "Tourist Embassy Office", distance: "1.2 km", eta: "16 min walk" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-rose-900 text-white">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-black/30 backdrop-blur-xl border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-lg">
                <ArrowLeft className="w-5 h-5 text-white" />
              </Button>
              <Shield className="w-8 h-8 text-red-400" />
              <div>
                <h1 className="text-xl font-bold">Emergency Control Center</h1>
                <p className="text-xs text-red-200">Immediate assistance available</p>
              </div>
            </div>
            {isOffline && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-500/20 border border-orange-500/30 rounded-full">
                <WifiOff className="w-4 h-4 text-orange-300" />
                <span className="text-xs font-medium text-orange-200">Offline Mode</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* SOS Activation */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20"
            >
              <h2 className="text-2xl font-bold mb-6 text-center">Intelligent SOS System</h2>

              <AnimatePresence mode="wait">
                {!sosActivated ? (
                  <motion.div
                    key="sos-button"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="text-center"
                  >
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={activateSOS}
                      className="relative w-64 h-64 mx-auto mb-6"
                    >
                      <motion.div
                        className="absolute inset-0 bg-red-600 rounded-full opacity-20"
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.2, 0.4, 0.2],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center shadow-2xl">
                        <div className="text-center">
                          <Shield className="w-20 h-20 mx-auto mb-3" />
                          <div className="text-3xl font-bold">SOS</div>
                        </div>
                      </div>
                    </motion.button>
                    <p className="text-lg mb-2">Press to activate emergency alert</p>
                    <p className="text-sm text-white/70">
                      Your location and emergency profile will be sent
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="sos-countdown"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="text-center"
                  >
                    <motion.div
                      className="relative w-64 h-64 mx-auto mb-6"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 5, ease: "linear" }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center shadow-2xl">
                        <div className="text-center">
                          <div className="text-7xl font-bold">{countdown}</div>
                          <div className="text-lg">Activating...</div>
                        </div>
                      </div>
                      <motion.div
                        className="absolute inset-0 border-8 border-white rounded-full"
                        initial={{ scale: 1, opacity: 1 }}
                        animate={{ scale: 1.3, opacity: 0 }}
                        transition={{ duration: 1, repeat: Infinity }}
                      />
                    </motion.div>

                    {countdown === 0 ? (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                      >
                        <div className="text-2xl font-bold text-green-400">✓ SOS ACTIVATED</div>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-center gap-2">
                            <MapPin className="w-4 h-4" />
                            GPS location transmitted
                          </div>
                          <div className="flex items-center justify-center gap-2">
                            <Phone className="w-4 h-4" />
                            Authorities notified
                          </div>
                          <div className="flex items-center justify-center gap-2">
                            <MessageSquare className="w-4 h-4" />
                            SMS fallback active
                          </div>
                          <div className="flex items-center justify-center gap-2">
                            <Shield className="w-4 h-4" />
                            Community alerted
                          </div>
                        </div>
                        <Button
                          onClick={cancelSOS}
                          className="mt-6 bg-white text-slate-900 hover:bg-slate-100 px-8 py-3 rounded-xl"
                        >
                          Cancel Alert
                        </Button>
                      </motion.div>
                    ) : (
                      <Button
                        onClick={cancelSOS}
                        className="bg-white/20 hover:bg-white/30 px-8 py-3 rounded-xl"
                      >
                        Cancel
                      </Button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Offline Sentinel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
            >
              <div className="flex items-center gap-3 mb-4">
                <WifiOff className="w-6 h-6 text-orange-400" />
                <h3 className="text-xl font-semibold">Offline Sentinel Mode</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between py-2 border-b border-white/10">
                  <span className="text-white/70">Offline Maps</span>
                  <span className="text-green-400 font-medium">Active</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-white/10">
                  <span className="text-white/70">GPS Tracking</span>
                  <span className="text-green-400 font-medium">Enabled</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-white/10">
                  <span className="text-white/70">SMS Fallback</span>
                  <span className="text-green-400 font-medium">Ready</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-white/70">Last Sync</span>
                  <span className="font-medium">2 min ago</span>
                </div>
              </div>
              <Button
                onClick={() => setIsOffline(!isOffline)}
                className="w-full mt-4 bg-orange-600 hover:bg-orange-700 py-3 rounded-xl"
              >
                {isOffline ? "Exit Offline Mode" : "Test Offline Mode"}
              </Button>
            </motion.div>
          </div>

          {/* Emergency Resources */}
          <div className="space-y-6">
            {/* Emergency Contacts */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
            >
              <h3 className="text-xl font-semibold mb-6">Emergency Contacts</h3>
              <div className="space-y-3">
                {emergencyContacts.map((contact, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + idx * 0.1 }}
                    className="flex items-center gap-4 p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-all cursor-pointer"
                  >
                    <div className={`w-12 h-12 rounded-full bg-${contact.color}-500/20 flex items-center justify-center`}>
                      <contact.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">{contact.name}</div>
                      <div className="text-sm text-white/70">{contact.number}</div>
                    </div>
                    <Phone className="w-5 h-5 text-white/50" />
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Nearby Emergency Facilities */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
            >
              <h3 className="text-xl font-semibold mb-6">Nearest Emergency Facilities</h3>
              <div className="space-y-3">
                {nearbyHelp.map((location, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + idx * 0.1 }}
                    className="p-4 bg-white/10 rounded-xl"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-semibold">{location.name}</div>
                        <div className="text-sm text-white/70">{location.type}</div>
                      </div>
                      <Navigation className="w-5 h-5 text-green-400" />
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-white/70">{location.distance}</span>
                      <span className="text-green-400">{location.eta}</span>
                    </div>
                    <Button className="w-full mt-3 bg-white/20 hover:bg-white/30 py-2 rounded-lg text-sm">
                      Get Directions
                    </Button>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Safety Pulse */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30"
            >
              <div className="flex items-center gap-3 mb-4">
                <Heart className="w-6 h-6 text-green-400" />
                <h3 className="text-xl font-semibold">Safety Pulse Check-In</h3>
              </div>
              <p className="text-sm text-white/70 mb-4">
                Regular check-ins ensure your safety. If you miss a check-in, we'll alert your emergency contacts and local authorities.
              </p>
              <Button className="w-full bg-green-600 hover:bg-green-700 py-4 rounded-xl font-semibold">
                <Heart className="w-5 h-5 mr-2" />
                I'm Safe - Check In Now
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { motion } from "motion/react";
import { MapPin, Search, Sparkles, ArrowRight, Shield } from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

export default function TouristDestination() {
  const navigate = useNavigate();
  const [destination, setDestination] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = () => {
    if (destination.trim()) {
      setIsSearching(true);
      setTimeout(() => {
        navigate("/tourist/route-planner", { state: { destination } });
      }, 1500);
    }
  };

  const popularDestinations = [
    { name: "Paris, France", safety: 92 },
    { name: "Tokyo, Japan", safety: 98 },
    { name: "Dubai, UAE", safety: 95 },
    { name: "New York, USA", safety: 88 },
    { name: "Singapore", safety: 99 },
    { name: "Barcelona, Spain", safety: 90 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl"
          animate={{ scale: [1.3, 1, 1.3], opacity: [0.5, 0.3, 0.5] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="w-10 h-10 text-blue-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              GuardianAI
            </h1>
          </div>
          <h2 className="text-2xl font-semibold text-slate-800 mb-2">
            Where are you traveling?
          </h2>
          <p className="text-slate-600">
            Enter your destination and we'll create a safe journey for you
          </p>
        </motion.div>

        {/* Search Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="max-w-3xl mx-auto mb-12"
        >
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="w-6 h-6 text-cyan-600" />
              <h3 className="text-xl font-semibold text-slate-800">AI-Powered Safe Travel</h3>
            </div>

            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                type="text"
                placeholder="Enter destination (e.g., Paris, France)"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-12 pr-4 py-7 text-lg rounded-2xl border-2 border-slate-200 focus:border-blue-500 transition-all"
              />
            </div>

            <Button
              onClick={handleSearch}
              disabled={!destination.trim() || isSearching}
              className="w-full mt-6 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-7 rounded-2xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            >
              {isSearching ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Search className="w-5 h-5" />
                </motion.div>
              ) : (
                <>
                  Find Safe Routes
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>

            {isSearching && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 text-center"
              >
                <div className="flex items-center justify-center gap-2 text-blue-600">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  <span>AI analyzing safety data...</span>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Popular Destinations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="max-w-5xl mx-auto"
        >
          <h3 className="text-xl font-semibold text-slate-800 mb-6 text-center">
            Popular Safe Destinations
          </h3>

          <div className="grid md:grid-cols-3 gap-4">
            {popularDestinations.map((dest, idx) => (
              <motion.button
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + idx * 0.1 }}
                whileHover={{ scale: 1.03, y: -2 }}
                onClick={() => {
                  setDestination(dest.name);
                  setTimeout(() => handleSearch(), 300);
                }}
                className="bg-white/70 backdrop-blur-xl rounded-xl p-4 border border-white/20 shadow-lg hover:shadow-xl transition-all text-left"
              >
                <div className="flex items-center justify-between mb-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <div className="flex items-center gap-1">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-semibold text-green-600">
                      {dest.safety}%
                    </span>
                  </div>
                </div>
                <div className="font-semibold text-slate-800">{dest.name}</div>
                <div className="text-xs text-slate-500 mt-1">High Safety Score</div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-16 text-center"
        >
          <div className="flex justify-center gap-12 flex-wrap">
            {[
              { icon: Shield, label: "24/7 Protection" },
              { icon: Sparkles, label: "AI Powered" },
              { icon: MapPin, label: "Live Tracking" },
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <item.icon className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-sm text-slate-600">{item.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

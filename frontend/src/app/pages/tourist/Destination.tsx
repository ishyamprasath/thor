import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Zap, MapPin, Calendar, ArrowRight, Sparkles, Search } from "lucide-react";
import { useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { useJsApiLoader, Autocomplete } from "@react-google-maps/api";

const MAPS_KEY = import.meta.env.VITE_PUBLIC_GOOGLE_MAPS_API_KEY;
const LIBS: ("places")[] = ["places"];

const popularDestinations = [
  { name: "Paris, France", emoji: "🗼" },
  { name: "Tokyo, Japan", emoji: "⛩️" },
  { name: "Dubai, UAE", emoji: "🏙️" },
  { name: "New York, USA", emoji: "🗽" },
  { name: "Singapore", emoji: "🦁" },
  { name: "Bali, Indonesia", emoji: "🌴" },
];

export default function TouristDestination() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: MAPS_KEY,
    libraries: LIBS,
  });

  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place.formatted_address) {
        setDestination(place.formatted_address);
      } else if (place.name) {
        setDestination(place.name);
      }
    }
  };

  const handlePlan = () => {
    if (!destination.trim()) return;
    setLoading(true);
    setTimeout(() => {
      navigate("/tourist/trip-planner", { state: { destination, startDate, endDate } });
    }, 900);
  };

  const inputClass =
    "w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400/60 focus:bg-white/10 transition-all text-sm";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 relative overflow-hidden">
      {/* BG */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 8, repeat: Infinity }} />
        <motion.div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-yellow-500/5 rounded-full blur-3xl"
          animate={{ scale: [1.3, 1, 1.3] }} transition={{ duration: 6, repeat: Infinity }} />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-12">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <Zap className="w-8 h-8 text-yellow-400" fill="currentColor" />
            <span className="text-2xl font-black tracking-widest bg-gradient-to-r from-yellow-400 to-red-400 bg-clip-text text-transparent">THOR</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-3">
            Where are you{" "}
            <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">heading?</span>
          </h2>
          <p className="text-slate-400">
            {user ? `Welcome, ${user.name}! ` : ""}Let THOR plan your perfect journey ⚡
          </p>
        </motion.div>

        {/* Search Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl p-8 mb-8">

          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            <span className="text-yellow-400 font-semibold text-sm">AI-Powered Trip Planner</span>
          </div>

          <div className="space-y-4">
            {/* Destination with Google Autocomplete */}
            <div className="relative">
              <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 z-10 pointer-events-none" />
              {isLoaded ? (
                <Autocomplete
                  onLoad={(ac) => (autocompleteRef.current = ac)}
                  onPlaceChanged={onPlaceChanged}
                  options={{ types: ["(cities)"] }}
                >
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handlePlan()}
                    placeholder="Search destination (e.g. Paris, France)"
                    className={`${inputClass} pl-14 text-base`}
                  />
                </Autocomplete>
              ) : (
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Search destination..."
                  className={`${inputClass} pl-14 text-base`}
                />
              )}
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
                <input type="date" value={startDate} min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={`${inputClass} pl-11 [color-scheme:dark]`} />
              </div>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
                <input type="date" value={endDate} min={startDate || new Date().toISOString().split("T")[0]}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={`${inputClass} pl-11 [color-scheme:dark]`} />
              </div>
            </div>

            {/* CTA */}
            <motion.button
              onClick={handlePlan}
              disabled={!destination.trim() || loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 hover:from-yellow-400 hover:to-red-400 text-white font-bold py-5 rounded-2xl shadow-2xl transition-all disabled:opacity-40 flex items-center justify-center gap-3 text-lg"
            >
              {loading ? (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}>
                    <Sparkles className="w-6 h-6" />
                  </motion.div>
                  Generating your AI plan...
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6" />
                  Plan My Trip with AI
                  <ArrowRight className="w-6 h-6" />
                </>
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Popular Destinations */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-widest flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400" /> Popular Destinations
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {popularDestinations.map((dest, i) => (
              <motion.button key={i}
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.05 }}
                whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}
                onClick={() => setDestination(dest.name)}
                className={`bg-white/5 hover:bg-white/10 border rounded-2xl p-4 text-left transition-all ${destination === dest.name ? "border-yellow-400/50 bg-yellow-400/5" : "border-white/10"
                  }`}>
                <div className="text-2xl mb-2">{dest.emoji}</div>
                <div className="text-white font-semibold text-sm">{dest.name}</div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { motion } from "motion/react";
import { MapPin, Plus, Check, Navigation, Sparkles, Shield, Clock, ArrowRight } from "lucide-react";
import { useNavigate, useLocation } from "react-router";
import { Button } from "../../components/ui/button";

interface Place {
  id: number;
  name: string;
  category: string;
  safetyScore: number;
  estimatedTime: string;
  description: string;
  added: boolean;
}

export default function TouristRoutePlanner() {
  const navigate = useNavigate();
  const location = useLocation();
  const destination = location.state?.destination || "Paris, France";

  const [places, setPlaces] = useState<Place[]>([
    {
      id: 1,
      name: "Eiffel Tower",
      category: "Landmark",
      safetyScore: 95,
      estimatedTime: "2-3 hours",
      description: "Iconic iron lattice tower with panoramic views",
      added: false,
    },
    {
      id: 2,
      name: "Louvre Museum",
      category: "Museum",
      safetyScore: 98,
      estimatedTime: "3-4 hours",
      description: "World's largest art museum and historic monument",
      added: false,
    },
    {
      id: 3,
      name: "Notre-Dame Cathedral",
      category: "Historic Site",
      safetyScore: 92,
      estimatedTime: "1-2 hours",
      description: "Medieval Catholic cathedral with Gothic architecture",
      added: false,
    },
    {
      id: 4,
      name: "Sacré-Cœur Basilica",
      category: "Religious Site",
      safetyScore: 90,
      estimatedTime: "1-2 hours",
      description: "White-domed basilica atop Montmartre hill",
      added: false,
    },
    {
      id: 5,
      name: "Champs-Élysées",
      category: "Shopping",
      safetyScore: 88,
      estimatedTime: "2-3 hours",
      description: "Famous avenue with shops, cafés, and theaters",
      added: false,
    },
    {
      id: 6,
      name: "Versailles Palace",
      category: "Palace",
      safetyScore: 96,
      estimatedTime: "4-5 hours",
      description: "Opulent 17th-century palace with stunning gardens",
      added: false,
    },
  ]);

  const togglePlace = (id: number) => {
    setPlaces(places.map(p => p.id === id ? { ...p, added: !p.added } : p));
  };

  const addedPlaces = places.filter(p => p.added);

  const startMonitoring = () => {
    navigate("/tourist/monitoring", { state: { destination, places: addedPlaces } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 right-20 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 7, repeat: Infinity }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              GuardianAI Route Planner
            </h1>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <MapPin className="w-5 h-5" />
            <span className="text-lg">{destination}</span>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* AI Suggestions */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-6 h-6 text-indigo-600" />
                <h2 className="text-2xl font-semibold text-slate-800">
                  AI Suggested Safe Places
                </h2>
              </div>

              <div className="space-y-4">
                {places.map((place, idx) => (
                  <motion.div
                    key={place.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + idx * 0.1 }}
                    className={`bg-white/80 backdrop-blur-xl rounded-2xl p-6 border-2 transition-all ${
                      place.added
                        ? "border-indigo-500 shadow-lg shadow-indigo-100"
                        : "border-white/20 shadow-lg"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-slate-800">
                            {place.name}
                          </h3>
                          <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">
                            {place.category}
                          </span>
                        </div>
                        <p className="text-slate-600 text-sm mb-4">{place.description}</p>
                        
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2">
                            <Shield className={`w-4 h-4 ${
                              place.safetyScore >= 95 ? "text-green-600" :
                              place.safetyScore >= 90 ? "text-blue-600" : "text-yellow-600"
                            }`} />
                            <span className="text-sm font-medium text-slate-700">
                              Safety: {place.safetyScore}%
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-slate-400" />
                            <span className="text-sm text-slate-600">
                              {place.estimatedTime}
                            </span>
                          </div>
                        </div>
                      </div>

                      <Button
                        onClick={() => togglePlace(place.id)}
                        className={`${
                          place.added
                            ? "bg-indigo-600 hover:bg-indigo-700"
                            : "bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-200"
                        } px-6 py-2 rounded-xl font-medium transition-all`}
                      >
                        {place.added ? (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            Added
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-2" />
                            Add
                          </>
                        )}
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Route Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="sticky top-8"
            >
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-2xl">
                <div className="flex items-center gap-2 mb-6">
                  <Navigation className="w-6 h-6 text-indigo-600" />
                  <h3 className="text-xl font-semibold text-slate-800">Your Route</h3>
                </div>

                {addedPlaces.length === 0 ? (
                  <div className="text-center py-12">
                    <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 text-sm">
                      Add places to build your safe route
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3 mb-6">
                      {addedPlaces.map((place, idx) => (
                        <motion.div
                          key={place.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center gap-3 p-3 bg-indigo-50/50 rounded-xl"
                        >
                          <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                            {idx + 1}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-slate-800 text-sm">
                              {place.name}
                            </div>
                            <div className="text-xs text-slate-500">{place.estimatedTime}</div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 mb-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="w-5 h-5 text-green-600" />
                        <span className="font-semibold text-green-800">Overall Safety</span>
                      </div>
                      <div className="text-3xl font-bold text-green-600">
                        {Math.round(
                          addedPlaces.reduce((sum, p) => sum + p.safetyScore, 0) /
                            addedPlaces.length
                        )}%
                      </div>
                      <div className="text-xs text-green-700 mt-1">Excellent</div>
                    </div>

                    <Button
                      onClick={startMonitoring}
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                    >
                      Start Safe Journey
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </>
                )}
              </div>

              {/* Safety Features */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-6 bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg"
              >
                <h4 className="font-semibold text-slate-800 mb-4">Active Protection</h4>
                <div className="space-y-3">
                  {[
                    "Real-time location tracking",
                    "Emergency SOS access",
                    "Safe zone monitoring",
                    "Offline protection",
                  ].map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                      <div className="w-1.5 h-1.5 bg-green-600 rounded-full" />
                      {feature}
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

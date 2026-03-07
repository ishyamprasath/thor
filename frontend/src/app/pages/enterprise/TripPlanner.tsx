import { useState } from "react";
import { motion } from "motion/react";
import { Calendar, MapPin, Users, Shield, ArrowLeft, Plus, X } from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

export default function EnterpriseTripPlanner() {
  const navigate = useNavigate();
  const [tripName, setTripName] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedTourists, setSelectedTourists] = useState<number[]>([]);

  const availableTourists = [
    { id: 1, name: "Sarah Johnson", email: "sarah.j@email.com" },
    { id: 2, name: "Michael Chen", email: "m.chen@email.com" },
    { id: 3, name: "Emma Williams", email: "emma.w@email.com" },
    { id: 4, name: "James Rodriguez", email: "j.rodriguez@email.com" },
    { id: 6, name: "David Kim", email: "d.kim@email.com" },
    { id: 7, name: "Sophie Martin", email: "s.martin@email.com" },
  ];

  const toggleTourist = (id: number) => {
    setSelectedTourists(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const handleCreateTrip = () => {
    // In a real app, this would save the trip
    navigate("/enterprise/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50 to-indigo-50">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-xl border-b border-white/20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <Button onClick={() => navigate("/enterprise/dashboard")} className="p-2 hover:bg-slate-100 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Shield className="w-8 h-8 text-violet-600" />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                Trip Planner
              </h1>
              <p className="text-sm text-slate-600">Create and manage tourist trips</p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Trip Details Form */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl"
            >
              <h2 className="text-2xl font-bold text-slate-800 mb-8">Trip Details</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Trip Name *
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., Paris Summer Tour 2026"
                    value={tripName}
                    onChange={(e) => setTripName(e.target.value)}
                    className="w-full px-4 py-6 rounded-xl border-2 border-slate-200 focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Destination *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="e.g., Paris, France"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="w-full pl-12 pr-4 py-6 rounded-xl border-2 border-slate-200 focus:border-violet-500"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Start Date *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full pl-12 pr-4 py-6 rounded-xl border-2 border-slate-200 focus:border-violet-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      End Date *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <Input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full pl-12 pr-4 py-6 rounded-xl border-2 border-slate-200 focus:border-violet-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Tourist Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-4">
                    Assign Tourists
                  </label>
                  <div className="grid md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                    {availableTourists.map((tourist) => (
                      <motion.button
                        key={tourist.id}
                        onClick={() => toggleTourist(tourist.id)}
                        whileHover={{ scale: 1.02 }}
                        className={`p-4 rounded-xl border-2 transition-all text-left ${
                          selectedTourists.includes(tourist.id)
                            ? "bg-violet-50 border-violet-500"
                            : "bg-white border-slate-200 hover:border-violet-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                              selectedTourists.includes(tourist.id)
                                ? "bg-gradient-to-br from-violet-500 to-purple-600 text-white"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {tourist.name.split(" ").map((n) => n[0]).join("")}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-slate-800">{tourist.name}</div>
                            <div className="text-xs text-slate-500">{tourist.email}</div>
                          </div>
                          {selectedTourists.includes(tourist.id) && (
                            <div className="w-6 h-6 bg-violet-600 rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Trip Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="sticky top-8 space-y-6"
            >
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-2xl">
                <h3 className="text-xl font-semibold text-slate-800 mb-6">Trip Summary</h3>

                <div className="space-y-4">
                  {tripName && (
                    <div className="p-4 bg-violet-50 rounded-xl">
                      <div className="text-xs text-slate-600 mb-1">Trip Name</div>
                      <div className="font-semibold text-slate-800">{tripName}</div>
                    </div>
                  )}

                  {destination && (
                    <div className="p-4 bg-blue-50 rounded-xl">
                      <div className="text-xs text-slate-600 mb-1">Destination</div>
                      <div className="font-semibold text-slate-800 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {destination}
                      </div>
                    </div>
                  )}

                  {(startDate || endDate) && (
                    <div className="p-4 bg-green-50 rounded-xl">
                      <div className="text-xs text-slate-600 mb-1">Duration</div>
                      <div className="font-semibold text-slate-800">
                        {startDate && new Date(startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        {startDate && endDate && " - "}
                        {endDate && new Date(endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </div>
                    </div>
                  )}

                  <div className="p-4 bg-purple-50 rounded-xl">
                    <div className="text-xs text-slate-600 mb-1">Assigned Tourists</div>
                    <div className="font-semibold text-slate-800 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      {selectedTourists.length} tourists
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleCreateTrip}
                  disabled={!tripName || !destination || !startDate || !endDate || selectedTourists.length === 0}
                  className="w-full mt-6 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white py-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                >
                  Create Trip & Start Monitoring
                </Button>
              </div>

              {/* Safety Features */}
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg">
                <h4 className="font-semibold text-slate-800 mb-4">Included Features</h4>
                <div className="space-y-3">
                  {[
                    "Real-time GPS tracking",
                    "24/7 safety monitoring",
                    "Emergency SOS system",
                    "Offline protection",
                    "Community support",
                    "Authority integration",
                  ].map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                      <div className="w-1.5 h-1.5 bg-green-600 rounded-full" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { motion } from "motion/react";
import { Building2, Globe, Zap } from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          {/* THOR Brand */}
          <div className="flex items-center justify-center gap-4 mb-3">
            <motion.div
              animate={{ scale: [1, 1.15, 1], rotate: [0, 8, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <Zap className="w-14 h-14 text-yellow-500 drop-shadow-lg" fill="currentColor" />
            </motion.div>
            <h1 className="text-7xl font-black tracking-widest bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent drop-shadow-sm">
              THOR
            </h1>
            <motion.div
              animate={{ scale: [1, 1.15, 1], rotate: [0, -8, 8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
            >
              <Zap className="w-14 h-14 text-yellow-500 drop-shadow-lg" fill="currentColor" />
            </motion.div>
          </div>

          {/* "god of thunder" — small, struck through */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-sm text-slate-400 line-through tracking-widest uppercase mb-4"
          >
            god of thunder
          </motion.p>

          {/* Big Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent max-w-xl mx-auto leading-tight"
          >
            Guard of Tourism
          </motion.p>

        </motion.div>

        {/* Mode Selection */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="max-w-5xl mx-auto"
        >
          <h2 className="text-3xl font-bold text-center mb-8 text-slate-800">
            Choose Your Mode
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Tourist Mode */}
            <motion.div
              whileHover={{ scale: 1.02, y: -5 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
              <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                    <Globe className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800">Tourist Mode</h3>
                    <p className="text-slate-600 text-sm">For individual travelers</p>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {[
                    "Real-time safety monitoring",
                    "Emergency SOS system",
                    "AI travel assistant",
                    "Safe route planning",
                    "Offline protection",
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-slate-700">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                      {item}
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => navigate("/tourist/login")}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-6 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  Start as Tourist
                </Button>
              </div>
            </motion.div>

            {/* Enterprise Mode */}
            <motion.div
              whileHover={{ scale: 1.02, y: -5 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-purple-600 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
              <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl">
                    <Building2 className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800">Enterprise Mode</h3>
                    <p className="text-slate-600 text-sm">For travel companies</p>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {[
                    "Multi-tourist monitoring",
                    "Trip planning dashboard",
                    "Real-time command center",
                    "Authority integration",
                    "Analytics & reports",
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-slate-700">
                      <div className="w-1.5 h-1.5 bg-violet-600 rounded-full" />
                      {item}
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => navigate("/enterprise/onboarding")}
                  className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white py-6 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  Start as Enterprise
                </Button>
              </div>
            </motion.div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}

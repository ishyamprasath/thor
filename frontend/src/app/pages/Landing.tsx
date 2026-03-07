import { motion } from "motion/react";
import { Shield, Building2, MapPin, Brain, Users, Globe } from "lucide-react";
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
          <div className="flex items-center justify-center gap-3 mb-4">
            <motion.div
              animate={{
                rotate: [0, 360],
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Shield className="w-12 h-12 text-blue-600" />
            </motion.div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              GuardianAI
            </h1>
          </div>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Next-generation tourist safety platform powered by artificial intelligence
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-3 gap-6 mb-16"
        >
          {[
            { icon: MapPin, title: "Smart Navigation", desc: "AI-powered safe routes" },
            { icon: Brain, title: "AI Concierge", desc: "24/7 intelligent assistance" },
            { icon: Users, title: "Community Support", desc: "Global safety network" },
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + idx * 0.1 }}
              className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all"
            >
              <feature.icon className="w-8 h-8 text-blue-600 mb-3" />
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-slate-600 text-sm">{feature.desc}</p>
            </motion.div>
          ))}
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
                  onClick={() => navigate("/tourist/destination")}
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

        {/* Footer Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-16 text-center"
        >
          <div className="flex justify-center gap-12 flex-wrap">
            {[
              { label: "Active Users", value: "250K+" },
              { label: "Countries", value: "180+" },
              { label: "Lives Protected", value: "1M+" },
            ].map((stat, idx) => (
              <div key={idx}>
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-slate-600 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

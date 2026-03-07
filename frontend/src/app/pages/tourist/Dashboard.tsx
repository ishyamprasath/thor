import { motion } from "motion/react";
import { Shield, MapPin, MessageSquare, AlertTriangle, Heart, Settings, User, LogOut, Navigation } from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "../../components/ui/button";

export default function TouristDashboard() {
  const navigate = useNavigate();

  const quickActions = [
    { icon: MapPin, label: "New Journey", path: "/tourist/destination", color: "blue" },
    { icon: MessageSquare, label: "AI Concierge", path: "/tourist/concierge", color: "teal" },
    { icon: AlertTriangle, label: "Emergency", path: "/tourist/emergency", color: "red" },
    { icon: Navigation, label: "Active Trip", path: "/tourist/monitoring", color: "green" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-xl border-b border-white/20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-10 h-10 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  GuardianAI
                </h1>
                <p className="text-sm text-slate-600">Tourist Dashboard</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button className="p-2 hover:bg-slate-100 rounded-lg">
                <Settings className="w-5 h-5" />
              </Button>
              <Button onClick={() => navigate("/")} className="p-2 hover:bg-slate-100 rounded-lg">
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h2 className="text-4xl font-bold text-slate-800 mb-3">Welcome back, Traveler</h2>
          <p className="text-lg text-slate-600">Your safety is our priority. Start your protected journey today.</p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          {quickActions.map((action, idx) => (
            <motion.button
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + idx * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              onClick={() => navigate(action.path)}
              className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-2xl transition-all text-left"
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br from-${action.color}-500 to-${action.color}-600 flex items-center justify-center mb-4`}>
                <action.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800">{action.label}</h3>
            </motion.button>
          ))}
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Safety Status */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-8 text-white shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-sm opacity-90 mb-1">Safety Status</div>
                <div className="text-5xl font-bold">All Clear</div>
              </div>
              <Shield className="w-16 h-16 opacity-30" />
            </div>
            <div className="space-y-3">
              {[
                { label: "Protection Level", value: "Maximum" },
                { label: "Monitoring", value: "24/7 Active" },
                { label: "Emergency Response", value: "Ready" },
              ].map((item, idx) => (
                <div key={idx} className="flex justify-between items-center py-2 border-b border-white/20">
                  <span className="opacity-90">{item.label}</span>
                  <span className="font-semibold">{item.value}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Features Overview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl"
          >
            <h3 className="text-2xl font-bold text-slate-800 mb-6">Your Protection Features</h3>
            <div className="space-y-4">
              {[
                {
                  icon: Shield,
                  title: "Real-Time Monitoring",
                  desc: "Continuous safety tracking with AI",
                  color: "blue",
                },
                {
                  icon: Heart,
                  title: "Safety Pulse Check",
                  desc: "Regular well-being confirmations",
                  color: "red",
                },
                {
                  icon: MapPin,
                  title: "Smart Route Planning",
                  desc: "AI-optimized safe navigation",
                  color: "green",
                },
                {
                  icon: MessageSquare,
                  title: "24/7 AI Assistant",
                  desc: "Instant help and guidance",
                  color: "teal",
                },
              ].map((feature, idx) => (
                <div key={idx} className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
                  <div className={`w-12 h-12 rounded-lg bg-${feature.color}-100 flex items-center justify-center flex-shrink-0`}>
                    <feature.icon className={`w-6 h-6 text-${feature.color}-600`} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-1">{feature.title}</h4>
                    <p className="text-sm text-slate-600">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-12 text-center"
        >
          <Button
            onClick={() => navigate("/tourist/destination")}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-12 py-6 rounded-2xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            Start New Journey
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

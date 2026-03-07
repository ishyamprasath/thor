import { useState } from "react";
import { motion } from "motion/react";
import { Building2, Users, Mail, Globe, ArrowRight, Shield } from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

export default function EnterpriseOnboarding() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    companyName: "",
    industry: "",
    email: "",
    phone: "",
    touristCount: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/enterprise/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50 to-purple-50 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-400/20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-12 h-12 text-violet-600" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              GuardianAI Enterprise
            </h1>
          </div>
          <p className="text-xl text-slate-600">
            Welcome to the command center for tourist safety
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Onboarding Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Company Registration</h2>
                  <p className="text-sm text-slate-600">Setup your enterprise account</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Company Name *
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="Acme Travel Co."
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      required
                      className="pl-12 pr-4 py-6 rounded-xl border-2 border-slate-200 focus:border-violet-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Industry Type
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="Tourism, Travel Agency, etc."
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      className="pl-12 pr-4 py-6 rounded-xl border-2 border-slate-200 focus:border-violet-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Business Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      type="email"
                      placeholder="contact@acmetravel.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="pl-12 pr-4 py-6 rounded-xl border-2 border-slate-200 focus:border-violet-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Expected Tourist Count
                  </label>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      type="number"
                      placeholder="50"
                      value={formData.touristCount}
                      onChange={(e) => setFormData({ ...formData, touristCount: e.target.value })}
                      className="pl-12 pr-4 py-6 rounded-xl border-2 border-slate-200 focus:border-violet-500"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white py-6 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  Create Enterprise Account
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </form>
            </div>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            <h3 className="text-2xl font-bold text-slate-800 mb-6">
              Enterprise Features
            </h3>

            {[
              {
                icon: Users,
                title: "Multi-Tourist Monitoring",
                desc: "Track all your tourists in real-time with live location updates and safety scores",
                color: "blue",
              },
              {
                icon: Shield,
                title: "Advanced Safety Analytics",
                desc: "Get detailed insights into tourist safety patterns and risk assessments",
                color: "green",
              },
              {
                icon: Globe,
                title: "Global Coverage",
                desc: "Monitor tourists across 180+ countries with 24/7 protection",
                color: "violet",
              },
              {
                icon: Building2,
                title: "Command Center Dashboard",
                desc: "Professional interface for managing trips, tourists, and emergency responses",
                color: "purple",
              },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + idx * 0.1 }}
                className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br from-${feature.color}-500 to-${feature.color}-600 flex items-center justify-center flex-shrink-0`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-slate-800 mb-2">
                      {feature.title}
                    </h4>
                    <p className="text-slate-600 text-sm">{feature.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="bg-gradient-to-br from-violet-600 to-purple-600 rounded-2xl p-8 text-white shadow-2xl"
            >
              <h4 className="text-lg font-semibold mb-6">Trusted by Leading Companies</h4>
              <div className="grid grid-cols-3 gap-6">
                {[
                  { value: "500+", label: "Companies" },
                  { value: "50K+", label: "Tourists" },
                  { value: "180+", label: "Countries" },
                ].map((stat, idx) => (
                  <div key={idx} className="text-center">
                    <div className="text-3xl font-bold mb-1">{stat.value}</div>
                    <div className="text-sm opacity-90">{stat.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

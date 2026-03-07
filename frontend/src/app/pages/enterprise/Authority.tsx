import { motion } from "motion/react";
import { Shield, Phone, MapPin, Users, AlertTriangle, Activity, ArrowLeft, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "../../components/ui/button";

export default function EnterpriseAuthority() {
  const navigate = useNavigate();

  const connectedAuthorities = [
    {
      id: 1,
      name: "Paris Central Police Department",
      type: "Police",
      coverage: "Central Paris",
      contactNumber: "+33 1 53 71 53 71",
      responseTime: "< 5 min",
      status: "active",
      incidents: 0,
    },
    {
      id: 2,
      name: "Paris Emergency Medical Services",
      type: "Medical",
      coverage: "Île-de-France",
      contactNumber: "+33 15",
      responseTime: "< 8 min",
      status: "active",
      incidents: 0,
    },
    {
      id: 3,
      name: "Tourist Protection Bureau",
      type: "Government",
      coverage: "Nationwide",
      contactNumber: "+33 1 42 60 33 22",
      responseTime: "< 15 min",
      status: "active",
      incidents: 0,
    },
  ];

  const communityMembers = [
    {
      id: 1,
      name: "Marie Dubois",
      role: "Verified Local Guide",
      location: "Latin Quarter, Paris",
      availability: "Available",
      rating: 4.9,
      verified: true,
    },
    {
      id: 2,
      name: "Jean-Pierre Laurent",
      role: "First Responder",
      location: "Champs-Élysées, Paris",
      availability: "Available",
      rating: 5.0,
      verified: true,
    },
    {
      id: 3,
      name: "Sophie Martin",
      role: "Community Safety Volunteer",
      location: "Montmartre, Paris",
      availability: "On duty",
      rating: 4.8,
      verified: true,
    },
    {
      id: 4,
      name: "Antoine Bernard",
      role: "Cultural Navigator",
      location: "Le Marais, Paris",
      availability: "Available",
      rating: 4.7,
      verified: true,
    },
  ];

  const recentIncidents = [
    {
      id: 1,
      type: "Resolved",
      tourist: "Sarah Johnson",
      issue: "Minor navigation help requested",
      authority: "Marie Dubois (Local Guide)",
      time: "2 hours ago",
      status: "resolved",
    },
    {
      id: 2,
      type: "Resolved",
      tourist: "Michael Chen",
      issue: "Translation assistance",
      authority: "Sophie Martin (Volunteer)",
      time: "Yesterday",
      status: "resolved",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
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
            <Shield className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Authority & Community Integration
              </h1>
              <p className="text-sm text-slate-600">Emergency response network and community support</p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid md:grid-cols-4 gap-6 mb-8"
        >
          {[
            { label: "Connected Authorities", value: "3", icon: Shield, color: "blue" },
            { label: "Community Members", value: communityMembers.length, icon: Users, color: "green" },
            { label: "Active Incidents", value: "0", icon: AlertTriangle, color: "orange" },
            { label: "Resolved Today", value: "2", icon: CheckCircle, color: "violet" },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + idx * 0.1 }}
              className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-${stat.color}-500 to-${stat.color}-600 flex items-center justify-center mb-4`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-slate-800 mb-1">{stat.value}</div>
              <div className="text-sm text-slate-600">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Connected Authorities */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-slate-800">Emergency Authorities</h2>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 rounded-full">
                  <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-green-700">All Systems Active</span>
                </div>
              </div>

              <div className="space-y-4">
                {connectedAuthorities.map((authority, idx) => (
                  <motion.div
                    key={authority.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + idx * 0.1 }}
                    className="p-5 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center">
                          <Shield className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-800 mb-1">{authority.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                              {authority.type}
                            </span>
                            <span>• {authority.coverage}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1 bg-green-100 rounded-full">
                        <div className="w-1.5 h-1.5 bg-green-600 rounded-full" />
                        <span className="text-xs font-medium text-green-700">Active</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Contact</div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-slate-800">{authority.contactNumber}</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Response Time</div>
                        <span className="text-sm font-semibold text-green-600">{authority.responseTime}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-blue-200">
                      <div className="text-sm text-slate-600">
                        Active Incidents: <span className="font-semibold text-slate-800">{authority.incidents}</span>
                      </div>
                      <Button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm">
                        Contact Now
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Recent Incidents */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg"
            >
              <h3 className="text-xl font-semibold text-slate-800 mb-6">Recent Incidents</h3>
              <div className="space-y-4">
                {recentIncidents.map((incident, idx) => (
                  <div key={incident.id} className="p-4 bg-green-50 rounded-xl border border-green-200">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="font-semibold text-slate-800">{incident.tourist}</span>
                      </div>
                      <span className="text-xs text-slate-500">{incident.time}</span>
                    </div>
                    <div className="text-sm text-slate-700 mb-2">{incident.issue}</div>
                    <div className="text-xs text-slate-600">Handled by: {incident.authority}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Community Network */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-slate-800">Community Support Network</h2>
                <Button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm">
                  <Users className="w-4 h-4 mr-2" />
                  View All
                </Button>
              </div>

              <div className="space-y-4 max-h-[700px] overflow-y-auto">
                {communityMembers.map((member, idx) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + idx * 0.1 }}
                    className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="relative">
                        <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                          {member.name.split(" ").map((n) => n[0]).join("")}
                        </div>
                        {member.verified && (
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center border-2 border-white">
                            <CheckCircle className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-slate-800">{member.name}</h3>
                          <div className="flex items-center gap-0.5">
                            <span className="text-yellow-500">★</span>
                            <span className="text-sm font-medium text-slate-700">{member.rating}</span>
                          </div>
                        </div>
                        <div className="text-sm text-slate-600 mb-2">{member.role}</div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <MapPin className="w-3 h-3" />
                          {member.location}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-green-200">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 ${member.availability === "Available" ? "bg-green-600" : "bg-blue-600"} rounded-full`} />
                        <span className="text-sm font-medium text-slate-700">{member.availability}</span>
                      </div>
                      <Button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm">
                        Contact
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Network Info */}
              <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-start gap-3">
                  <Activity className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-2">Community Coverage</h4>
                    <p className="text-sm text-slate-600 mb-3">
                      Our verified community network includes local guides, first responders, and safety volunteers across all major tourist areas.
                    </p>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">24/7</div>
                        <div className="text-xs text-slate-600">Coverage</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600">&lt;10min</div>
                        <div className="text-xs text-slate-600">Avg Response</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600">98%</div>
                        <div className="text-xs text-slate-600">Success Rate</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

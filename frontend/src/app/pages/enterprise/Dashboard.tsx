import { useState } from "react";
import { motion } from "motion/react";
import {
  Shield,
  Users,
  AlertTriangle,
  MapPin,
  Battery,
  Wifi,
  WifiOff,
  Search,
  Filter,
  Eye,
  TrendingUp,
  Activity,
  Menu,
  Bell,
  Settings,
  LogOut,
  Plus,
} from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

interface Tourist {
  id: number;
  name: string;
  email: string;
  country: string;
  destination: string;
  status: "online" | "offline" | "sos";
  safetyScore: number;
  battery: number;
  lastSeen: string;
  tripStatus: "active" | "completed" | "planned";
}

export default function EnterpriseDashboard() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "online" | "offline" | "sos">("all");

  const [tourists] = useState<Tourist[]>([
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah.j@email.com",
      country: "USA",
      destination: "Paris, France",
      status: "online",
      safetyScore: 96,
      battery: 78,
      lastSeen: "Active now",
      tripStatus: "active",
    },
    {
      id: 2,
      name: "Michael Chen",
      email: "m.chen@email.com",
      country: "Canada",
      destination: "Tokyo, Japan",
      status: "online",
      safetyScore: 98,
      battery: 92,
      lastSeen: "2 min ago",
      tripStatus: "active",
    },
    {
      id: 3,
      name: "Emma Williams",
      email: "emma.w@email.com",
      country: "UK",
      destination: "Dubai, UAE",
      status: "offline",
      safetyScore: 94,
      battery: 12,
      lastSeen: "15 min ago",
      tripStatus: "active",
    },
    {
      id: 4,
      name: "James Rodriguez",
      email: "j.rodriguez@email.com",
      country: "Spain",
      destination: "New York, USA",
      status: "online",
      safetyScore: 91,
      battery: 65,
      lastSeen: "Active now",
      tripStatus: "active",
    },
    {
      id: 5,
      name: "Lisa Anderson",
      email: "lisa.a@email.com",
      country: "Australia",
      destination: "Singapore",
      status: "sos",
      safetyScore: 45,
      battery: 23,
      lastSeen: "Just now",
      tripStatus: "active",
    },
  ]);

  const filteredTourists = tourists.filter((tourist) => {
    const matchesSearch =
      tourist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tourist.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tourist.destination.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterStatus === "all" || tourist.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: tourists.length,
    online: tourists.filter((t) => t.status === "online").length,
    offline: tourists.filter((t) => t.status === "offline").length,
    sos: tourists.filter((t) => t.status === "sos").length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50 to-purple-50">
      {/* Top Navigation */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-xl border-b border-white/20 sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Shield className="w-8 h-8 text-violet-600" />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                  Enterprise Command Center
                </h1>
                <p className="text-sm text-slate-600">Acme Travel Co.</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button
                onClick={() => navigate("/enterprise/trip-planner")}
                className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-2 rounded-xl"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Trip
              </Button>
              <Button className="p-2 hover:bg-slate-100 rounded-lg relative">
                <Bell className="w-5 h-5" />
                {stats.sos > 0 && (
                  <div className="absolute top-1 right-1 w-3 h-3 bg-red-600 rounded-full animate-pulse" />
                )}
              </Button>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid md:grid-cols-4 gap-6 mb-8"
        >
          {[
            { label: "Total Tourists", value: stats.total, icon: Users, color: "violet", trend: "+12%" },
            { label: "Online", value: stats.online, icon: Wifi, color: "green", trend: "↑" },
            { label: "Offline", value: stats.offline, icon: WifiOff, color: "orange", trend: "↓" },
            { label: "SOS Alerts", value: stats.sos, icon: AlertTriangle, color: "red", trend: stats.sos > 0 ? "!" : "0" },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + idx * 0.1 }}
              className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-${stat.color}-500 to-${stat.color}-600 flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <span className={`text-sm font-medium ${
                  stat.color === "red" ? "text-red-600" :
                  stat.color === "green" ? "text-green-600" :
                  stat.color === "orange" ? "text-orange-600" : "text-violet-600"
                }`}>
                  {stat.trend}
                </span>
              </div>
              <div className="text-3xl font-bold text-slate-800 mb-1">{stat.value}</div>
              <div className="text-sm text-slate-600">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Tourist List */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-slate-800">Active Tourists</h2>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 rounded-xl border-2 border-slate-200 w-64"
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="px-4 py-2 rounded-xl border-2 border-slate-200 bg-white"
                  >
                    <option value="all">All Status</option>
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                    <option value="sos">SOS</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {filteredTourists.map((tourist, idx) => (
                  <motion.div
                    key={tourist.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + idx * 0.05 }}
                    className={`p-4 rounded-xl border-2 transition-all hover:shadow-lg cursor-pointer ${
                      tourist.status === "sos"
                        ? "bg-red-50 border-red-200"
                        : tourist.status === "offline"
                        ? "bg-orange-50 border-orange-200"
                        : "bg-green-50 border-green-200"
                    }`}
                    onClick={() => navigate(`/enterprise/tourist/${tourist.id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {tourist.name.split(" ").map((n) => n[0]).join("")}
                          </div>
                          <div
                            className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                              tourist.status === "online" ? "bg-green-500" :
                              tourist.status === "offline" ? "bg-orange-500" : "bg-red-500 animate-pulse"
                            }`}
                          />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-slate-800">{tourist.name}</div>
                          <div className="text-sm text-slate-600">{tourist.email}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <div className="text-xs text-slate-500 mb-1">Destination</div>
                          <div className="text-sm font-medium text-slate-700 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {tourist.destination.split(",")[0]}
                          </div>
                        </div>

                        <div className="text-center">
                          <div className="text-xs text-slate-500 mb-1">Safety</div>
                          <div
                            className={`text-sm font-bold ${
                              tourist.safetyScore >= 90 ? "text-green-600" :
                              tourist.safetyScore >= 70 ? "text-yellow-600" : "text-red-600"
                            }`}
                          >
                            {tourist.safetyScore}%
                          </div>
                        </div>

                        <div className="text-center">
                          <div className="text-xs text-slate-500 mb-1">Battery</div>
                          <div className="flex items-center gap-1">
                            <Battery
                              className={`w-4 h-4 ${
                                tourist.battery > 50 ? "text-green-600" :
                                tourist.battery > 20 ? "text-yellow-600" : "text-red-600"
                              }`}
                            />
                            <span className="text-sm font-medium text-slate-700">{tourist.battery}%</span>
                          </div>
                        </div>

                        <div className="text-center">
                          <div className="text-xs text-slate-500 mb-1">Last Seen</div>
                          <div className="text-sm text-slate-700">{tourist.lastSeen}</div>
                        </div>

                        <Button className="p-2 hover:bg-white/50 rounded-lg">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {tourist.status === "sos" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-3 pt-3 border-t border-red-200"
                      >
                        <div className="flex items-center gap-2 text-red-600 font-medium">
                          <AlertTriangle className="w-4 h-4 animate-pulse" />
                          <span className="text-sm">EMERGENCY SOS ACTIVATED - Immediate response required</span>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Live Map Overview */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg"
            >
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Global Coverage Map</h3>
              <div className="relative h-64 bg-gradient-to-br from-blue-100 to-violet-100 rounded-xl overflow-hidden">
                {/* Mock world map visualization */}
                <div className="absolute inset-0 opacity-20">
                  <svg width="100%" height="100%">
                    <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse">
                      <circle cx="10" cy="10" r="2" fill="#6366f1" />
                    </pattern>
                    <rect width="100%" height="100%" fill="url(#dots)" />
                  </svg>
                </div>
                {/* Tourist markers */}
                {[
                  { top: "30%", left: "20%", color: "green" },
                  { top: "40%", left: "70%", color: "green" },
                  { top: "60%", left: "85%", color: "orange" },
                  { top: "50%", left: "15%", color: "green" },
                  { top: "35%", left: "50%", color: "red" },
                ].map((marker, idx) => (
                  <motion.div
                    key={idx}
                    className={`absolute w-3 h-3 bg-${marker.color}-500 rounded-full`}
                    style={{ top: marker.top, left: marker.left }}
                    animate={{
                      scale: marker.color === "red" ? [1, 1.5, 1] : 1,
                      opacity: marker.color === "red" ? [1, 0.5, 1] : 1,
                    }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                ))}
              </div>
              <div className="flex items-center justify-between mt-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-slate-600">Online</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full" />
                  <span className="text-slate-600">Offline</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  <span className="text-slate-600">SOS</span>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg"
            >
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button
                  onClick={() => navigate("/enterprise/trip-planner")}
                  className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-xl justify-start"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Trip
                </Button>
                <Button
                  onClick={() => navigate("/enterprise/authority")}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl justify-start"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Authority Integration
                </Button>
              </div>
            </motion.div>

            {/* Activity Feed */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg"
            >
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Recent Activity</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {[
                  { type: "sos", message: "Lisa Anderson activated SOS", time: "Just now", urgent: true },
                  { type: "offline", message: "Emma Williams went offline", time: "15 min ago", urgent: false },
                  { type: "checkin", message: "Michael Chen checked in", time: "22 min ago", urgent: false },
                  { type: "online", message: "Sarah Johnson is online", time: "1 hour ago", urgent: false },
                ].map((activity, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl ${
                      activity.urgent
                        ? "bg-red-50 border border-red-200"
                        : "bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <Activity className={`w-4 h-4 mt-0.5 ${activity.urgent ? "text-red-600" : "text-slate-400"}`} />
                      <div className="flex-1">
                        <div className={`text-sm ${activity.urgent ? "font-medium text-red-800" : "text-slate-800"}`}>
                          {activity.message}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">{activity.time}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

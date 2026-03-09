import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { MapPin, Calendar, Plus, ChevronRight, Zap, Target, Users, Star, ExternalLink, Phone, Search } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "../../context/TranslationContext";
import { Check, X, ShieldAlert } from "lucide-react";

import { API_URL } from "../../config/api";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { translate } = useTranslation();
  const [activePlans, setActivePlans] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [guides, setGuides] = useState<any[]>([]);
  const [loadingGuides, setLoadingGuides] = useState(false);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);

      if (user?.email) {
        try {
          const invRes = await fetch(`${API_URL}/enterprise/invitations/${user.email}`).then(r => r.json());
          setInvitations(invRes.invitations || []);
        } catch (e) {
          console.error("Failed to load invitations", e);
        }
      }

      const saved = localStorage.getItem("thor_active_plan");
      if (saved) {
        const plan = JSON.parse(saved);
        setActivePlans([plan]);

        // Fetch local guides for the active plan's destination
        if (plan.destination) {
          setLoadingGuides(true);
          fetch(`${API_URL}/trip/guides?destination=${encodeURIComponent(plan.destination)}`, {
            headers: { "Authorization": `Bearer ${localStorage.getItem("thor_token")}` }
          })
            .then(r => r.json())
            .then(data => {
              if (data.guides) setGuides(data.guides);
              setLoadingGuides(false);
            })
            .catch(() => setLoadingGuides(false));
        }
      }

      setLoading(false);
    };

    fetchDashboard();
  }, [user]);

  const acceptInvite = async (inviteId: string) => {
    try {
      await fetch(`${API_URL}/enterprise/invitations/${inviteId}/accept`, { method: "POST" });
      setInvitations(invitations.filter(i => i.id !== inviteId));
    } catch (e) {
      console.error("Failed to accept", e);
    }
  };

  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto pb-32">
      {/* Header */}
      <div>
        <h1 className="text-display gradient-text mb-2 tracking-tight">
          {translate("Hello")}, {user?.name?.split(" ")[0] || translate("Traveler")}
        </h1>
        <p className="text-body text-zinc-400">
          {translate("Where are we going today? Let's map your safe journey.")}
        </p>
      </div>

      {/* Primary Action */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate("/planner")}
        className="w-full relative overflow-hidden rounded-3xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6 border border-zinc-800 shadow-[0_20px_40px_-15px_rgba(0,0,0,1)] group"
        style={{ cursor: "pointer", background: "var(--thor-surface-2)" }}
      >
        <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 scale-150 transition-transform duration-700 group-hover:rotate-45 group-hover:scale-110 pointer-events-none">
          <Target className="w-64 h-64 text-yellow-500" />
        </div>

        <div className="relative z-10 text-left flex-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 text-xs font-bold tracking-wider uppercase">
            <Zap className="w-3.5 h-3.5" fill="currentColor" /> {translate("AI Powered")}
          </div>
          <h2 className="text-3xl font-bold mb-2 tracking-tight" style={{ color: "var(--thor-text)" }}>{translate("Create a New Plan")}</h2>
          <p className="text-zinc-400 max-w-md text-sm leading-relaxed">
            {translate("Pick your destination, get AI suggestions for hotels, restaurants & spots, then build your custom route.")}
          </p>
        </div>

        <div className="relative z-10 w-16 h-16 rounded-2xl flex items-center justify-center bg-yellow-500 text-black flex-shrink-0 shadow-[0_0_30px_rgba(234,179,8,0.4)] transition-transform group-hover:scale-110">
          <Plus className="w-8 h-8" />
        </div>
      </motion.button>

      {/* Tracking Requests */}
      {invitations.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold tracking-tight flex items-center gap-2" style={{ color: "var(--thor-text)" }}>
            <ShieldAlert className="w-5 h-5" style={{ color: "var(--thor-warn)" }} /> Tracking Requests
          </h3>
          <div className="space-y-3">
            {invitations.map((inv) => (
              <motion.div key={inv.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="card p-5 border shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4"
                style={{ background: "var(--thor-surface-3)", borderColor: "var(--thor-warn)" }}>
                <div>
                  <h4 className="font-bold text-lg" style={{ color: "var(--thor-text)" }}>{inv.enterprise_name}</h4>
                  <p className="text-sm mt-1" style={{ color: "var(--thor-text-muted)" }}>
                    This organization is requesting to monitor your live location and safety telemetry during your trip.
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => setInvitations(invitations.filter(i => i.id !== inv.id))} className="btn btn-ghost">
                    <X className="w-4 h-4" /> Decline
                  </button>
                  <button onClick={() => acceptInvite(inv.id)} className="btn btn-brand" style={{ background: "var(--thor-safe)", color: "#000" }}>
                    <Check className="w-4 h-4" /> Accept Tracking
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Active Plans List */}
      <div>
        <h3 className="text-lg font-bold mb-4 tracking-tight flex items-center gap-2" style={{ color: "var(--thor-text)" }}>
          {translate("Your Journeys")}
        </h3>

        {loading ? (
          <div className="animate-pulse flex gap-4 overflow-x-auto pb-4">
            {[1, 2].map(i => (
              <div key={i} className="min-w-[300px] h-40 rounded-2xl border" style={{ background: "var(--thor-surface-2)", borderColor: "var(--thor-border)" }} />
            ))}
          </div>
        ) : activePlans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activePlans.map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => navigate(`/planner/active`)}
                className="border rounded-2xl p-5 transition-colors cursor-pointer group shadow-xl"
                style={{ background: "var(--thor-surface-2)", borderColor: "var(--thor-border)" }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md bg-zinc-800 text-zinc-400">
                    {translate("Active")}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-xl font-bold mb-1 truncate block" title={plan.destination} style={{ color: "var(--thor-text)" }}>
                    {plan.destination}
                  </h4>
                  <div className="flex items-center gap-4 text-xs text-zinc-500 mt-2">
                    <span className="flex items-center gap-1.5 whitespace-nowrap"><Calendar className="w-3.5 h-3.5 flex-shrink-0" /> <span className="truncate">{plan.days?.length || 1} {translate("Days")}</span></span>
                    <span className="flex items-center gap-1.5 whitespace-nowrap"><MapPin className="w-3.5 h-3.5 flex-shrink-0" /> <span className="truncate">
                      {plan.days?.reduce((acc: number, d: any) => acc + (d.route_spots?.length || 0), 0) || 0} {translate("Spots")}
                    </span></span>
                  </div>
                  {plan.hotel_recommendation && (
                    <p className="text-xs text-zinc-500 mt-1 truncate">🏨 {plan.hotel_recommendation.name}</p>
                  )}
                </div>

                <div className="mt-5 pt-4 border-t border-zinc-800 flex items-center justify-between text-yellow-500 font-semibold text-sm group-hover:text-white transition-colors">
                  {translate("View Dashboard")}
                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-4 rounded-3xl border border-dashed" style={{ background: "var(--thor-surface)", borderColor: "var(--thor-border)" }}>
            <MapPin className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--thor-text-muted)" }} />
            <h3 className="text-lg font-semibold text-zinc-300 mb-2">{translate("No active plans")}</h3>
            <p className="text-zinc-500 text-sm">{translate("Create a new plan to start your journey.")}</p>
          </div>
        )}
      </div>

      {/* Local Guides for active plan destination */}
      {activePlans.length > 0 && (
        <div>
          <h3 className="text-lg font-bold mb-4 tracking-tight flex items-center gap-2" style={{ color: "var(--thor-text)" }}>
            <Users className="w-5 h-5 text-yellow-500" />
            {translate("Local Guides")}
            <span className="text-sm text-zinc-500 font-normal">— {activePlans[0].destination}</span>
          </h3>

          {loadingGuides ? (
            <div className="flex gap-4 overflow-x-auto pb-4 noscrollbar">
              {[1, 2, 3].map(i => (
                <div key={i} className="min-w-[280px] h-36 bg-zinc-900 border border-zinc-800 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : guides.length > 0 ? (
            <div className="flex gap-4 overflow-x-auto pb-4 noscrollbar">
              {guides.map((g, i) => (
                <div key={i} className="min-w-[280px] bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-white text-[15px] truncate max-w-[170px]">{g.name}</h4>
                      <span className="flex items-center gap-1 text-xs text-yellow-500 font-bold bg-yellow-500/10 px-2 py-0.5 rounded-md shrink-0">
                        <Star className="w-3 h-3 fill-yellow-500" /> {g.rating}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mb-2 line-clamp-2">{g.role}</p>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {g.languages?.map((l: string, idx: number) => (
                        <span key={idx} className="text-[10px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded border border-zinc-700">{l}</span>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-zinc-800 flex justify-between items-center">
                    <span className="text-[11px] font-semibold text-green-400 max-w-[100px] truncate">{g.price}</span>
                    <div className="flex gap-2">
                      <a href={`https://www.google.com/maps/place/?q=place_id:${g.id}`} target="_blank" rel="noreferrer"
                        className="flex items-center gap-1.5 text-xs text-black bg-white hover:bg-zinc-200 px-3 py-1.5 rounded-lg font-bold transition-colors">
                        <MapPin className="w-3.5 h-3.5" /> Map
                      </a>
                      {g.website ? (
                        <a href={g.website} target="_blank" rel="noreferrer"
                          className="flex items-center gap-1.5 text-xs text-black bg-white hover:bg-zinc-200 px-3 py-1.5 rounded-lg font-bold transition-colors">
                          <ExternalLink className="w-3.5 h-3.5" /> Site
                        </a>
                      ) : (
                        <a href={`https://www.google.com/search?q=${encodeURIComponent(g.name + ' tour guide ' + activePlans[0].destination)}`} target="_blank" rel="noreferrer"
                          className="flex items-center gap-1.5 text-xs text-black bg-white hover:bg-zinc-200 px-3 py-1.5 rounded-lg font-bold transition-colors">
                          <Search className="w-3.5 h-3.5" /> Search
                        </a>
                      )}
                      {g.phone && (
                        <a href={`tel:${g.phone}`}
                          className="flex items-center gap-1.5 text-xs text-black bg-white hover:bg-zinc-200 px-3 py-1.5 rounded-lg font-bold transition-colors">
                          <Phone className="w-3.5 h-3.5" /> Call
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-zinc-500 text-sm italic">{translate("No local guides found for this destination yet.")}</p>
          )}
        </div>
      )}
    </div>
  );
}

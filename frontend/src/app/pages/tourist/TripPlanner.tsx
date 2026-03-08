import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
    MapPin, Calendar, ArrowRight, ArrowLeft, Zap, Target, Hotel, Coffee, Sun, Moon, Check
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useJsApiLoader, Autocomplete } from "@react-google-maps/api";
import { useNavigate } from "react-router";
import { useTranslation } from "../../context/TranslationContext";

import { API_URL } from "../../config/api";
const GOOGLE_MAPS_KEY = import.meta.env.VITE_PUBLIC_GOOGLE_MAPS_API_KEY;
const LIBS: ("places")[] = ["places"];

export default function TripPlanner() {
    const navigate = useNavigate();
    const { token } = useAuth();
    const { translate } = useTranslation();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Form fields
    const [destination, setDestination] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // Generated Plan
    const [plan, setPlan] = useState<any>(null);

    // Maps Autocomplete
    const { isLoaded } = useJsApiLoader({
        id: "google-map-script",
        googleMapsApiKey: GOOGLE_MAPS_KEY,
        libraries: LIBS,
    });

    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

    const onLoad = (autocomplete: google.maps.places.Autocomplete) => {
        autocompleteRef.current = autocomplete;
    };

    const onPlaceChanged = () => {
        if (autocompleteRef.current !== null) {
            const place = autocompleteRef.current.getPlace();
            if (place.formatted_address) {
                setDestination(place.formatted_address);
            } else if (place.name) {
                setDestination(place.name);
            }
        }
    };

    const handleGenerate = async () => {
        if (!destination || !startDate || !endDate) return;
        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/trip/generate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    destination,
                    start_date: startDate,
                    end_date: endDate
                })
            });
            const data = await res.json();
            if (res.ok && data.status === "success") {
                setPlan(data.plan);
                setStep(3);
            } else {
                alert(translate("Failed to generate plan."));
            }
        } catch (e) {
            console.error(e);
            alert(translate("Network error generating plan."));
        } finally {
            setLoading(false);
        }
    };

    const handleStartJourney = () => {
        // Save to active journey state
        localStorage.setItem("thor_active_plan", JSON.stringify(plan));
        navigate("/planner/active");
    };

    return (
        <div className="p-6 max-w-2xl mx-auto pb-32">
            {/* Header */}
            <div className="mb-10 text-center">
                <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto mb-4 border border-yellow-500/20 shadow-[0_0_30px_rgba(234,179,8,0.15)]">
                    <Target className="w-8 h-8 text-yellow-500" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-white">{translate("Plan Your Journey")}</h1>
                <p className="text-zinc-400 mt-2">{translate("Powered by Gemini Intelligence")}</p>
            </div>

            {/* Stepper Content */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
                <AnimatePresence mode="wait">

                    {/* step 1 */}
                    {step === 1 && (
                        <motion.div key="1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <h2 className="text-xl font-bold text-white mb-6">1. {translate("Where to?")}</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 block">{translate("Destination")}</label>
                                    <div className="relative z-50">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 z-10" />
                                        {isLoaded ? (
                                            <Autocomplete
                                                onLoad={onLoad}
                                                onPlaceChanged={onPlaceChanged}
                                            >
                                                <input
                                                    type="text"
                                                    value={destination}
                                                    onChange={(e) => setDestination(e.target.value)}
                                                    placeholder={translate("e.g. Kyoto, Japan")}
                                                    className="w-full bg-black border border-zinc-800 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-yellow-500 transition-colors relative z-0"
                                                />
                                            </Autocomplete>
                                        ) : (
                                            <input
                                                type="text"
                                                value={destination}
                                                onChange={(e) => setDestination(e.target.value)}
                                                placeholder={translate("Loading maps...")}
                                                className="w-full bg-black border border-zinc-800 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none transition-colors opacity-50"
                                                disabled
                                            />
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => { if (destination) setStep(2); }}
                                    disabled={!destination}
                                    className="w-full bg-white text-black font-bold py-4 rounded-xl mt-6 flex flex-row items-center justify-center gap-2 hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {translate("Next Step")} <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* step 2 */}
                    {step === 2 && (
                        <motion.div key="2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <h2 className="text-xl font-bold text-white mb-6">2. {translate("When?")}</h2>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 block">{translate("Start Date")}</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                            <input
                                                type="date"
                                                value={startDate}
                                                onChange={(e) => setStartDate(e.target.value)}
                                                className="w-full bg-black border border-zinc-800 rounded-xl py-3 pl-10 pr-3 text-white focus:outline-none focus:border-yellow-500 [color-scheme:dark]"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 block">{translate("End Date")}</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                            <input
                                                type="date"
                                                value={endDate}
                                                onChange={(e) => setEndDate(e.target.value)}
                                                className="w-full bg-black border border-zinc-800 rounded-xl py-3 pl-10 pr-3 text-white focus:outline-none focus:border-yellow-500 [color-scheme:dark]"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-8">
                                    <button onClick={() => setStep(1)} className="p-4 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800">
                                        <ArrowLeft className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={handleGenerate}
                                        disabled={!startDate || !endDate || loading}
                                        className="flex-1 bg-yellow-500 text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-yellow-400 disabled:opacity-50"
                                    >
                                        {loading ? (
                                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                                                <Zap className="w-5 h-5" fill="currentColor" />
                                            </motion.div>
                                        ) : (
                                            <>{translate("Generate Safe Route")} <Zap className="w-4 h-4" fill="currentColor" /></>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* step 3 */}
                    {step === 3 && plan && (
                        <motion.div key="3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center">
                                    <Check className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white tracking-tight">{translate("Plan Generated")}</h2>
                                    <p className="text-zinc-500 text-sm">{plan.destination} • {plan.days?.length} {translate("Days")}</p>
                                </div>
                            </div>

                            <div className="space-y-4 mb-8">
                                {/* Hotel */}
                                {plan.hotel_recommendation && (
                                    <div className="bg-black border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg"><Hotel className="w-5 h-5" /></div>
                                            <div>
                                                <p className="text-xs font-bold text-zinc-500 uppercase">{translate("Basecamp")}</p>
                                                <p className="text-white font-medium">{plan.hotel_recommendation.name}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Preview Days */}
                                <div className="border border-zinc-800 rounded-xl overflow-hidden">
                                    <div className="bg-zinc-800 border-b border-zinc-800 px-4 py-2 text-xs font-bold text-zinc-400 uppercase">
                                        {translate("Itinerary Overview")}
                                    </div>
                                    <div className="p-4 bg-black max-h-[300px] overflow-y-auto space-y-4">
                                        {plan.days?.map((day: any) => (
                                            <div key={day.day}>
                                                <div className="text-sm font-bold text-yellow-500 mb-2">{translate("Day")} {day.day}</div>
                                                <div className="grid grid-cols-1 gap-2 pl-2 border-l-2 border-zinc-800 ml-2">
                                                    {day.breakfast && <div className="flex items-center text-xs text-zinc-300 gap-2"><Coffee className="w-3 h-3 text-zinc-500" /> {day.breakfast.name}</div>}
                                                    {day.route_spots?.map((s: any, i: number) => (
                                                        <div key={i} className="flex items-center text-xs text-white gap-2 font-medium">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 shrink-0" /> {s.name}
                                                        </div>
                                                    ))}
                                                    {day.dinner && <div className="flex items-center text-xs text-zinc-300 gap-2"><Moon className="w-3 h-3 text-zinc-500" /> {day.dinner.name}</div>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleStartJourney}
                                className="w-full bg-white text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors"
                            >
                                {translate("Start My Journey!")} <ArrowRight className="w-4 h-4" />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

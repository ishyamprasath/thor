import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
    MapPin, Calendar, ArrowRight, ArrowLeft, Zap, Target, Hotel, Coffee, Sun, Moon, Check,
    UtensilsCrossed, Star, ChevronRight, Sparkles
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useJsApiLoader, Autocomplete } from "@react-google-maps/api";
import { useNavigate } from "react-router";
import { useTranslation } from "../../context/TranslationContext";
import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = import.meta.env.VITE_PUBLIC_GEMINI_API_KEY;
const GOOGLE_MAPS_KEY = (import.meta as any).env.VITE_PUBLIC_GOOGLE_MAPS_API_KEY;
const LIBS: ("places")[] = ["places"];

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

function cleanJSON(text: string): string {
    let t = text.trim();
    if (t.startsWith("```")) {
        const parts = t.split("```");
        t = parts[1] || t;
        if (t.startsWith("json")) t = t.slice(4);
    }
    if (t.endsWith("```")) t = t.slice(0, -3);
    return t.trim();
}

interface PlaceOption {
    name: string;
    lat: number;
    lng: number;
    description?: string;
    price_range?: string;
    type?: string;
}

interface DaySuggestions {
    day: number;
    breakfast_options: PlaceOption[];
    lunch_options: PlaceOption[];
    dinner_options: PlaceOption[];
    spot_options: PlaceOption[];
}

interface Suggestions {
    destination: string;
    accommodation_options: PlaceOption[];
    days: DaySuggestions[];
}

// ---- Mahabalipuram demo suggestions ----
const MAHABALIPURAM_SUGGESTIONS: Suggestions = {
    destination: "Mahabalipuram, Tamil Nadu, India",
    accommodation_options: [
        { name: "Radisson Blu Resort Temple Bay", lat: 12.6172, lng: 80.1927, description: "5-star beachfront resort with ocean views & pool", price_range: "$$$" },
        { name: "GRT Temple Bay Resort", lat: 12.6180, lng: 80.1935, description: "Luxury cottages next to UNESCO temples", price_range: "$$$" },
        { name: "Thamizhagam Beach Resort", lat: 12.6202, lng: 80.1948, description: "Budget-friendly with private beach access", price_range: "$" },
    ],
    days: [
        {
            day: 1,
            breakfast_options: [
                { name: "Burger Zone - Mahabalipuram", lat: 12.6269, lng: 80.1930, description: "Local favourite with South Indian breakfast" },
                { name: "Santana Beach Restaurant", lat: 12.6218, lng: 80.1952, description: "Beachside café with fresh coconut & idlis" },
            ],
            lunch_options: [
                { name: "Moonrakers Restaurant", lat: 12.6194, lng: 80.1936, description: "Famous for seafood thali & local crab curry" },
                { name: "Gecko Cafe", lat: 12.6205, lng: 80.1943, description: "Cozy café with veg & non-veg options" },
            ],
            dinner_options: [
                { name: "Le Yogi Restaurant", lat: 12.6206, lng: 80.1948, description: "International cuisine with rooftop seating" },
                { name: "Wharf Restaurant - Radisson Blu", lat: 12.6172, lng: 80.1930, description: "Award-winning oceanfront fine dining" },
            ],
            spot_options: [
                { name: "Shore Temple", lat: 12.6168, lng: 80.1993, description: "UNESCO World Heritage — 8th century Pallava temple overlooking the Bay of Bengal" },
                { name: "Pancha Rathas (Five Rathas)", lat: 12.6095, lng: 80.1927, description: "Five monolithic rock-cut chariots dating to 7th century Pallava dynasty" },
                { name: "Arjuna's Penance", lat: 12.6194, lng: 80.1927, description: "World's largest open-air rock relief — 27m-wide carved granite cliff" },
                { name: "Krishna's Butterball", lat: 12.6191, lng: 80.1935, description: "250-ton boulder mysteriously balanced on a slippery slope" },
                { name: "Tiger Cave", lat: 12.5713, lng: 80.1889, description: "Rock-cut Shiva shrine with dramatic carved tiger heads" },
                { name: "Mahabalipuram Lighthouse", lat: 12.6166, lng: 80.1965, description: "Panoramic aerial views of the entire coastline and ancient temple ruins" },
            ]
        }
    ]
};

// ---- SelectableCard component ----
function SelectableCard({
    selected, onToggle, icon, title, subtitle, badge
}: {
    selected: boolean;
    onToggle: () => void;
    icon?: React.ReactNode;
    title: string;
    subtitle?: string;
    badge?: string;
}) {
    return (
        <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onToggle}
            className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 flex items-start gap-3 ${selected
                ? "border-yellow-500 bg-yellow-500/10 shadow-[0_0_20px_rgba(234,179,8,0.12)]"
                : "border-zinc-800 bg-black hover:border-zinc-600"
                }`}
        >
            <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${selected ? "border-yellow-500 bg-yellow-500" : "border-zinc-600"}`}>
                {selected && <Check className="w-3 h-3 text-black" strokeWidth={3} />}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                    <span className={`font-semibold text-sm truncate ${selected ? "text-white" : "text-zinc-200"}`}>{title}</span>
                    {badge && (
                        <span className="text-[10px] font-bold text-green-400 bg-green-400/10 border border-green-400/20 px-1.5 py-0.5 rounded shrink-0">{badge}</span>
                    )}
                </div>
                {subtitle && <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">{subtitle}</p>}
            </div>
            {icon && <div className="shrink-0 text-zinc-600 mt-0.5">{icon}</div>}
        </motion.button>
    );
}

// ---- Radio Card (pick one) ----
function RadioCard({
    selected, onSelect, title, subtitle, badge
}: {
    selected: boolean;
    onSelect: () => void;
    title: string;
    subtitle?: string;
    badge?: string;
}) {
    return (
        <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onSelect}
            className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 flex items-start gap-3 ${selected
                ? "border-yellow-500 bg-yellow-500/10 shadow-[0_0_20px_rgba(234,179,8,0.12)]"
                : "border-zinc-800 bg-black hover:border-zinc-600"
                }`}
        >
            <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${selected ? "border-yellow-500" : "border-zinc-600"}`}>
                {selected && <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                    <span className={`font-semibold text-sm truncate ${selected ? "text-white" : "text-zinc-200"}`}>{title}</span>
                    {badge && (
                        <span className="text-[10px] font-bold text-green-400 bg-green-400/10 border border-green-400/20 px-1.5 py-0.5 rounded shrink-0">{badge}</span>
                    )}
                </div>
                {subtitle && <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">{subtitle}</p>}
            </div>
        </motion.button>
    );
}

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

    // Suggestions from Gemini
    const [suggestions, setSuggestions] = useState<Suggestions | null>(null);

    // User selections
    const [selectedHotel, setSelectedHotel] = useState<PlaceOption | null>(null);
    const [selectedBreakfasts, setSelectedBreakfasts] = useState<Record<number, PlaceOption | null>>({});
    const [selectedLunches, setSelectedLunches] = useState<Record<number, PlaceOption | null>>({});
    const [selectedDinners, setSelectedDinners] = useState<Record<number, PlaceOption | null>>({});
    const [selectedSpots, setSelectedSpots] = useState<Record<string, boolean>>({});

    // Maps Autocomplete
    const { isLoaded } = useJsApiLoader({
        id: "google-map-script",
        googleMapsApiKey: GOOGLE_MAPS_KEY,
        libraries: LIBS,
    });

    // Read voice-injected destination from VoiceAI and auto-fill
    const [voiceDestinationLoaded, setVoiceDestinationLoaded] = useState(false);
    useEffect(() => {
        if (voiceDestinationLoaded) return;
        const voiceDest = localStorage.getItem("thor-voice-destination");
        if (voiceDest) {
            setDestination(voiceDest);
            localStorage.removeItem("thor-voice-destination"); // consume it once
            // Small delay so the UI renders first, then advance past destination step
            setTimeout(() => setStep(2), 400);
        }
        setVoiceDestinationLoaded(true);
    }, [voiceDestinationLoaded]);

    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
    const onLoad = (autocomplete: google.maps.places.Autocomplete) => {
        autocompleteRef.current = autocomplete;
    };
    const onPlaceChanged = () => {
        if (autocompleteRef.current !== null) {
            const place = autocompleteRef.current.getPlace();
            if (place.formatted_address) setDestination(place.formatted_address);
            else if (place.name) setDestination(place.name);
        }
    };

    const toggleSpot = (key: string) => {
        setSelectedSpots(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleFetchSuggestions = async () => {
        if (!destination || !startDate || !endDate) return;
        setLoading(true);

        const isMahabs = destination.toLowerCase().includes("mahabalipuram") || destination.toLowerCase().includes("mamallapuram");
        if (isMahabs) {
            setTimeout(() => {
                setSuggestions({ ...MAHABALIPURAM_SUGGESTIONS, destination });
                setStep(3);
                setLoading(false);
            }, 900);
            return;
        }

        const numDays = Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)));
        const daysArr = Array.from({ length: numDays }, (_, i) => i + 1);

        const prompt = `You are an elite travel concierge. The traveler is going to ${destination} from ${startDate} to ${endDate} (${numDays} days).

Generate multiple REAL, SPECIFIC options for each category. Return ONLY valid JSON with this exact structure:
{
  "destination": "${destination}",
  "accommodation_options": [
    { "name": "Hotel Name", "lat": 0.0, "lng": 0.0, "description": "One sentence about it", "price_range": "$$$" },
    { "name": "Hotel Name 2", "lat": 0.0, "lng": 0.0, "description": "One sentence about it", "price_range": "$$" },
    { "name": "Hotel Name 3", "lat": 0.0, "lng": 0.0, "description": "One sentence about it", "price_range": "$" }
  ],
  "days": [
    ${daysArr.map(d => `{
      "day": ${d},
      "breakfast_options": [
        { "name": "Real Cafe", "lat": 0.0, "lng": 0.0, "description": "short detail" },
        { "name": "Real Cafe 2", "lat": 0.0, "lng": 0.0, "description": "short detail" }
      ],
      "lunch_options": [
        { "name": "Real Restaurant", "lat": 0.0, "lng": 0.0, "description": "short detail" },
        { "name": "Real Restaurant 2", "lat": 0.0, "lng": 0.0, "description": "short detail" }
      ],
      "dinner_options": [
        { "name": "Real Restaurant", "lat": 0.0, "lng": 0.0, "description": "short detail" },
        { "name": "Real Restaurant 2", "lat": 0.0, "lng": 0.0, "description": "short detail" }
      ],
      "spot_options": [
        { "name": "Real Attraction", "lat": 0.0, "lng": 0.0, "description": "Exciting description in one sentence" },
        { "name": "Real Attraction 2", "lat": 0.0, "lng": 0.0, "description": "Exciting description in one sentence" },
        { "name": "Real Attraction 3", "lat": 0.0, "lng": 0.0, "description": "Exciting description in one sentence" },
        { "name": "Real Attraction 4", "lat": 0.0, "lng": 0.0, "description": "Exciting description in one sentence" }
      ]
    }`).join(",\n    ")}
  ]
}

Use REAL, SPECIFIC place names and ROUGHLY ACCURATE coordinates for ${destination}. No other text.`;

        try {
            const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite-preview" });
            const result = await model.generateContent(prompt);
            const text = result.response.text();
            const jsonStr = cleanJSON(text);
            const data = JSON.parse(jsonStr);
            setSuggestions(data);
            setStep(3);
        } catch (e: any) {
            console.error("Gemini suggestion error:", e?.message || e);
            alert(`Failed to fetch suggestions: ${e?.message || "Unknown error. Check console."}`);

        } finally {
            setLoading(false);
        }
    };

    const handleConfirmPlan = () => {
        if (!suggestions) return;

        // Build the finalized plan from selections
        const days = suggestions.days.map((d) => {
            const spots = d.spot_options.filter(s => selectedSpots[`${d.day}-${s.name}`]);
            return {
                day: d.day,
                breakfast: selectedBreakfasts[d.day] || null,
                lunch: selectedLunches[d.day] || null,
                dinner: selectedDinners[d.day] || null,
                route_spots: spots,
            };
        });

        const plan = {
            destination: suggestions.destination,
            start_date: startDate,
            end_date: endDate,
            hotel_recommendation: selectedHotel
                ? { name: selectedHotel.name, latitude: selectedHotel.lat, longitude: selectedHotel.lng }
                : null,
            days,
        };

        localStorage.setItem("thor_active_plan", JSON.stringify(plan));
        navigate("/planner/active");
    };

    const canConfirm = selectedHotel !== null;
    const activeDayIndex = 0; // For now, show Day 1 selections (scroll through days)
    const [viewDay, setViewDay] = useState(0);
    const currentDay = suggestions?.days[viewDay];

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

            {/* Progress dots */}
            <div className="flex items-center justify-center gap-2 mb-8">
                {[1, 2, 3, 4].map(s => (
                    <div key={s} className={`h-2 rounded-full transition-all duration-300 ${step === s ? "w-8 bg-yellow-500" : step > s ? "w-2 bg-yellow-500/50" : "w-2 bg-zinc-700"}`} />
                ))}
            </div>

            {/* Stepper Content */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
                <AnimatePresence mode="wait">

                    {/* Step 1 — Destination */}
                    {step === 1 && (
                        <motion.div key="1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <h2 className="text-xl font-bold text-white mb-6">1. {translate("Where to?")}</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 block">{translate("Destination")}</label>
                                    <div className="relative z-50">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 z-10" />
                                        {isLoaded ? (
                                            <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
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

                    {/* Step 2 — Dates */}
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
                                        onClick={handleFetchSuggestions}
                                        disabled={!startDate || !endDate || loading}
                                        className="flex-1 bg-yellow-500 text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-yellow-400 disabled:opacity-50"
                                    >
                                        {loading ? (
                                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                                                <Sparkles className="w-5 h-5" />
                                            </motion.div>
                                        ) : (
                                            <>{translate("Get AI Suggestions")} <Sparkles className="w-4 h-4" /></>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 3 — Pick your preferences */}
                    {step === 3 && suggestions && (
                        <motion.div key="3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-xl font-bold text-white">3. {translate("Build Your Plan")}</h2>
                                    <p className="text-xs text-zinc-500 mt-0.5">{translate("Select what you want — we'll build the route!")}</p>
                                </div>
                                <button onClick={() => setStep(2)} className="p-2 rounded-lg border border-zinc-800 text-zinc-400 hover:text-white">
                                    <ArrowLeft className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-1 noscrollbar">

                                {/* Accommodation */}
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <Hotel className="w-4 h-4 text-blue-400" />
                                        <span className="text-sm font-bold text-white uppercase tracking-wider">{translate("Accommodation")}</span>
                                        <span className="text-xs text-zinc-500">(pick one)</span>
                                    </div>
                                    <div className="space-y-2">
                                        {suggestions.accommodation_options.map((opt, i) => (
                                            <RadioCard
                                                key={i}
                                                selected={selectedHotel?.name === opt.name}
                                                onSelect={() => setSelectedHotel(opt)}
                                                title={opt.name}
                                                subtitle={opt.description}
                                                badge={opt.price_range}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Day tabs for multi-day trips */}
                                {suggestions.days.length > 1 && (
                                    <div className="flex gap-2 overflow-x-auto noscrollbar">
                                        {suggestions.days.map((d, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setViewDay(i)}
                                                className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all ${viewDay === i ? "bg-yellow-500 text-black" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}
                                            >
                                                Day {d.day}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Current day options */}
                                {currentDay && (
                                    <>
                                        {/* Breakfast */}
                                        <div>
                                            <div className="flex items-center gap-2 mb-3">
                                                <Coffee className="w-4 h-4 text-amber-400" />
                                                <span className="text-sm font-bold text-white uppercase tracking-wider">{translate("Breakfast")} — Day {currentDay.day}</span>
                                                <span className="text-xs text-zinc-500">(pick one)</span>
                                            </div>
                                            <div className="space-y-2">
                                                {currentDay.breakfast_options.map((opt, i) => (
                                                    <RadioCard
                                                        key={i}
                                                        selected={selectedBreakfasts[currentDay.day]?.name === opt.name}
                                                        onSelect={() => setSelectedBreakfasts(prev => ({ ...prev, [currentDay.day]: opt }))}
                                                        title={opt.name}
                                                        subtitle={opt.description}
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        {/* Spots */}
                                        <div>
                                            <div className="flex items-center gap-2 mb-3">
                                                <MapPin className="w-4 h-4 text-yellow-500" />
                                                <span className="text-sm font-bold text-white uppercase tracking-wider">{translate("Places to Visit")} — Day {currentDay.day}</span>
                                                <span className="text-xs text-zinc-500">(pick multiple)</span>
                                            </div>
                                            <div className="space-y-2">
                                                {currentDay.spot_options.map((opt, i) => {
                                                    const key = `${currentDay.day}-${opt.name}`;
                                                    return (
                                                        <SelectableCard
                                                            key={i}
                                                            selected={!!selectedSpots[key]}
                                                            onToggle={() => toggleSpot(key)}
                                                            title={opt.name}
                                                            subtitle={opt.description}
                                                        />
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Lunch */}
                                        <div>
                                            <div className="flex items-center gap-2 mb-3">
                                                <Sun className="w-4 h-4 text-orange-400" />
                                                <span className="text-sm font-bold text-white uppercase tracking-wider">{translate("Lunch")} — Day {currentDay.day}</span>
                                                <span className="text-xs text-zinc-500">(pick one)</span>
                                            </div>
                                            <div className="space-y-2">
                                                {currentDay.lunch_options.map((opt, i) => (
                                                    <RadioCard
                                                        key={i}
                                                        selected={selectedLunches[currentDay.day]?.name === opt.name}
                                                        onSelect={() => setSelectedLunches(prev => ({ ...prev, [currentDay.day]: opt }))}
                                                        title={opt.name}
                                                        subtitle={opt.description}
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        {/* Dinner */}
                                        <div>
                                            <div className="flex items-center gap-2 mb-3">
                                                <Moon className="w-4 h-4 text-purple-400" />
                                                <span className="text-sm font-bold text-white uppercase tracking-wider">{translate("Dinner")} — Day {currentDay.day}</span>
                                                <span className="text-xs text-zinc-500">(pick one)</span>
                                            </div>
                                            <div className="space-y-2">
                                                {currentDay.dinner_options.map((opt, i) => (
                                                    <RadioCard
                                                        key={i}
                                                        selected={selectedDinners[currentDay.day]?.name === opt.name}
                                                        onSelect={() => setSelectedDinners(prev => ({ ...prev, [currentDay.day]: opt }))}
                                                        title={opt.name}
                                                        subtitle={opt.description}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Confirm button */}
                            <div className="mt-6 pt-4 border-t border-zinc-800">
                                {!canConfirm && (
                                    <p className="text-xs text-zinc-500 text-center mb-3">⚡ Select an accommodation to continue</p>
                                )}
                                <button
                                    onClick={() => setStep(4)}
                                    disabled={!canConfirm}
                                    className="w-full bg-yellow-500 text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-yellow-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                >
                                    {translate("Review & Confirm")} <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 4 — Summary & Confirm */}
                    {step === 4 && suggestions && (
                        <motion.div key="4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center">
                                        <Check className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white">{translate("Your Custom Plan")}</h2>
                                        <p className="text-zinc-500 text-sm">{suggestions.destination}</p>
                                    </div>
                                </div>
                                <button onClick={() => setStep(3)} className="p-2 rounded-lg border border-zinc-800 text-zinc-400 hover:text-white">
                                    <ArrowLeft className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-3 max-h-[55vh] overflow-y-auto noscrollbar">
                                {/* Hotel */}
                                {selectedHotel && (
                                    <div className="bg-black border border-blue-500/20 rounded-xl p-4 flex items-center gap-3">
                                        <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg"><Hotel className="w-4 h-4" /></div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Accommodation</p>
                                            <p className="text-white font-semibold text-sm truncate">{selectedHotel.name}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Per-day summary */}
                                {suggestions.days.map((d) => {
                                    const spots = d.spot_options.filter(s => selectedSpots[`${d.day}-${s.name}`]);
                                    const bk = selectedBreakfasts[d.day];
                                    const lk = selectedLunches[d.day];
                                    const dk = selectedDinners[d.day];

                                    return (
                                        <div key={d.day} className="bg-black border border-zinc-800 rounded-xl overflow-hidden">
                                            <div className="bg-zinc-800/60 px-4 py-2 text-xs font-bold text-yellow-500 uppercase tracking-wider">Day {d.day}</div>
                                            <div className="p-4 space-y-2">
                                                {bk && (
                                                    <div className="flex items-center gap-2 text-xs text-zinc-300">
                                                        <Coffee className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                                        <span className="truncate">{bk.name}</span>
                                                    </div>
                                                )}
                                                {spots.map((s, i) => (
                                                    <div key={i} className="flex items-center gap-2 text-xs text-white font-medium">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 shrink-0" />
                                                        <span className="truncate">{s.name}</span>
                                                    </div>
                                                ))}
                                                {lk && (
                                                    <div className="flex items-center gap-2 text-xs text-zinc-300">
                                                        <UtensilsCrossed className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                                                        <span className="truncate">{lk.name}</span>
                                                    </div>
                                                )}
                                                {dk && (
                                                    <div className="flex items-center gap-2 text-xs text-zinc-300">
                                                        <Moon className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                                                        <span className="truncate">{dk.name}</span>
                                                    </div>
                                                )}
                                                {!bk && !lk && !dk && spots.length === 0 && (
                                                    <p className="text-xs text-zinc-600 italic">Nothing selected for this day</p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <button
                                onClick={handleConfirmPlan}
                                className="mt-6 w-full bg-white text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors"
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

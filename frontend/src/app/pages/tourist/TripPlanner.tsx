import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
    MapPin, Calendar, ArrowRight, ArrowLeft, Zap, Target, Hotel, Coffee, Sun, Moon, Check,
    UtensilsCrossed, Star, ChevronRight, Sparkles
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useJsApiLoader, Autocomplete } from "@react-google-maps/api";
import { useNavigate } from "react-router";
import { useTranslation } from "../../context/TranslationContext";
import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = (import.meta as any).env.VITE_PUBLIC_GEMINI_API_KEY;
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
                : "border-[var(--thor-border)] bg-[var(--thor-surface-2)] hover:border-[var(--thor-border-hover)]"
                }`}
        >
            <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${selected ? "border-yellow-500 bg-yellow-500" : "border-[var(--thor-border)]"}`}>
                {selected && <Check className="w-3 h-3 text-black" strokeWidth={3} />}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                    <span className={`font-semibold text-sm truncate ${selected ? "text-white" : "text-[var(--thor-text-secondary)]"}`}>{title}</span>
                    {badge && (
                        <span className="text-[10px] font-bold text-green-400 bg-green-400/10 border border-green-400/20 px-1.5 py-0.5 rounded shrink-0">{badge}</span>
                    )}
                </div>
                {subtitle && <p className="text-xs text-[var(--thor-text-muted)] mt-0.5 line-clamp-2">{subtitle}</p>}
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
                : "border-[var(--thor-border)] bg-[var(--thor-surface-2)] hover:border-[var(--thor-border-hover)]"
                }`}
        >
            <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${selected ? "border-yellow-500" : "border-[var(--thor-border)]"}`}>
                {selected && <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                    <span className={`font-semibold text-sm truncate ${selected ? "text-white" : "text-[var(--thor-text-secondary)]"}`}>{title}</span>
                    {badge && (
                        <span className="text-[10px] font-bold text-green-400 bg-green-400/10 border border-green-400/20 px-1.5 py-0.5 rounded shrink-0">{badge}</span>
                    )}
                </div>
                {subtitle && <p className="text-xs text-[var(--thor-text-muted)] mt-0.5 line-clamp-2">{subtitle}</p>}
            </div>
        </motion.button>
    );
}

export default function TripPlanner() {
    const navigate = useNavigate();
    const { token } = useAuth();
    const { theme } = useTheme();
    const { translate } = useTranslation();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Form fields
    const [destination, setDestination] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    
    // Additional traveler factors
    const [travelerAge, setTravelerAge] = useState("");
    const [travelerGroup, setTravelerGroup] = useState("solo");
    const [budgetLevel, setBudgetLevel] = useState("moderate");
    const [travelInterests, setTravelInterests] = useState<string[]>([]);
    const [travelPace, setTravelPace] = useState("balanced");
    const [dietaryPreference, setDietaryPreference] = useState("none");

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

Traveler Profile:
- Age: ${travelerAge || 'Not specified'}
- Group Type: ${travelerGroup}
- Budget Level: ${budgetLevel}
- Interests: ${travelInterests.length > 0 ? travelInterests.join(', ') : 'Not specified'}
- Travel Pace: ${travelPace}
- Dietary Preference: ${dietaryPreference !== 'none' ? dietaryPreference : 'Not specified'}

Generate recommendations based on this profile:
${budgetLevel === 'budget' ? 'Focus on value-for-money options and local experiences.' : ''}
${budgetLevel === 'luxury' ? 'Include premium experiences and high-end recommendations.' : ''}
${travelerGroup === 'family' ? 'Ensure family-friendly options and activities suitable for all ages.' : ''}
${travelerAge && parseInt(travelerAge) < 30 ? 'Include adventurous and social experiences.' : ''}
${travelerAge && parseInt(travelerAge) > 50 ? 'Prioritize comfort, accessibility, and cultural experiences.' : ''}
${travelPace === 'relaxed' ? 'Focus on fewer activities with more time to enjoy each location.' : ''}
${travelPace === 'fast-paced' ? 'Pack each day with multiple activities and experiences.' : ''}
${dietaryPreference !== 'none' ? `Ensure all food recommendations cater to ${dietaryPreference} dietary requirements.` : ''}
${travelInterests.includes('Food') ? 'Include food tours, cooking classes, and local culinary experiences.' : ''}
${travelInterests.includes('Culture') ? 'Focus on museums, historical sites, and cultural activities.' : ''}
${travelInterests.includes('Nature') ? 'Include parks, hiking, outdoor activities, and natural attractions.' : ''}
${travelInterests.includes('Nightlife') ? 'Include bars, clubs, and evening entertainment options.' : ''}
${travelInterests.includes('Shopping') ? 'Include markets, malls, and local shopping experiences.' : ''}
${travelInterests.includes('Adventure') ? 'Include adventure sports, thrilling activities, and extreme experiences.' : ''}
${travelInterests.includes('Photography') ? 'Include scenic viewpoints, photogenic locations, and photography spots.' : ''}

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
                <h1 className="text-3xl font-bold tracking-tight" style={{ color: "var(--thor-text)" }}>{translate("Plan Your Journey")}</h1>
                <p className="mt-2" style={{ color: "var(--thor-text-secondary)" }}>{translate("Powered by Gemini Intelligence")}</p>
            </div>

            {/* Progress dots */}
            <div className="flex items-center justify-center gap-2 mb-8">
                {[1, 2, 3, 4].map(s => (
                    <div key={s} className={`h-2 rounded-full transition-all duration-300 ${step === s ? "w-8 bg-yellow-500" : step > s ? "w-2 bg-yellow-500/50" : "w-2"}`} style={{ backgroundColor: step > s ? "var(--thor-border)" : "var(--thor-border)" }} />
                ))}
            </div>

            {/* Stepper Content */}
            <div className="rounded-3xl p-6 shadow-2xl relative overflow-hidden border"
                 style={{ background: "var(--thor-surface)", borderColor: "var(--thor-border)" }}>
                <AnimatePresence mode="wait">

                    {/* Step 1 — Destination */}
                    {step === 1 && (
                        <motion.div key="1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <h2 className="text-xl font-bold mb-6" style={{ color: "var(--thor-text)" }}>1. {translate("Where to?")}</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-widest mb-2 block" style={{ color: "var(--thor-text-muted)" }}>{translate("Destination")}</label>
                                    <div className="relative z-50">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 z-10" style={{ color: "var(--thor-text-muted)" }} />
                                        {isLoaded ? (
                                            <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
                                                <input
                                                    type="text"
                                                    value={destination}
                                                    onChange={(e) => setDestination(e.target.value)}
                                                    placeholder={translate("e.g. Kyoto, Japan")}
                                                    className="w-full rounded-xl py-4 pl-12 pr-4 focus:outline-none transition-colors relative z-0 border"
                                                    style={{
                                                        background: "var(--thor-surface-2)",
                                                        borderColor: "var(--thor-border)",
                                                        color: "var(--thor-text)"
                                                    }}
                                                />
                                            </Autocomplete>
                                        ) : (
                                            <input
                                                type="text"
                                                value={destination}
                                                onChange={(e) => setDestination(e.target.value)}
                                                placeholder={translate("Loading maps...")}
                                                className="w-full rounded-xl py-4 pl-12 pr-4 focus:outline-none transition-colors opacity-50 border"
                                                style={{
                                                    background: "var(--thor-surface-2)",
                                                    borderColor: "var(--thor-border)",
                                                    color: "var(--thor-text)"
                                                }}
                                                disabled
                                            />
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => { if (destination) setStep(2); }}
                                    disabled={!destination}
                                    className="w-full font-bold py-4 rounded-xl mt-6 flex flex-row items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border"
                                    style={{
                                        background: "var(--thor-text)",
                                        color: "var(--thor-bg)",
                                        borderColor: "var(--thor-border)"
                                    }}
                                >
                                    {translate("Next Step")} <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 2 — Dates */}
                    {step === 2 && (
                        <motion.div key="2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <h2 className="text-xl font-bold mb-6" style={{ color: "var(--thor-text)" }}>2. {translate("When?")}</h2>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold uppercase tracking-widest mb-2 block" style={{ color: "var(--thor-text-muted)" }}>{translate("Start Date")}</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--thor-text-muted)" }} />
                                            <input
                                                type="date"
                                                value={startDate}
                                                onChange={(e) => setStartDate(e.target.value)}
                                                className="w-full rounded-xl py-3 pl-10 pr-3 focus:outline-none border"
                                                style={{
                                                    background: "var(--thor-surface-2)",
                                                    borderColor: "var(--thor-border)",
                                                    color: "var(--thor-text)"
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold uppercase tracking-widest mb-2 block" style={{ color: "var(--thor-text-muted)" }}>{translate("End Date")}</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--thor-text-muted)" }} />
                                            <input
                                                type="date"
                                                value={endDate}
                                                onChange={(e) => setEndDate(e.target.value)}
                                                className="w-full rounded-xl py-3 pl-10 pr-3 focus:outline-none border"
                                                style={{
                                                    background: "var(--thor-surface-2)",
                                                    borderColor: "var(--thor-border)",
                                                    color: "var(--thor-text)"
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Additional Traveler Information */}
                                <div className="space-y-4 mt-6">
                                    <div>
                                        <label className="text-xs font-bold uppercase tracking-widest mb-2 block" style={{ color: "var(--thor-text-muted)" }}>Traveler Age</label>
                                        <input
                                            type="number"
                                            value={travelerAge}
                                            onChange={(e) => setTravelerAge(e.target.value)}
                                            placeholder="e.g., 25"
                                            className="w-full rounded-xl py-3 px-3 focus:outline-none border"
                                            style={{
                                                background: "var(--thor-surface-2)",
                                                borderColor: "var(--thor-border)",
                                                color: "var(--thor-text)"
                                            }}
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold uppercase tracking-widest mb-2 block" style={{ color: "var(--thor-text-muted)" }}>Group Type</label>
                                        <select
                                            value={travelerGroup}
                                            onChange={(e) => setTravelerGroup(e.target.value)}
                                            className="w-full rounded-xl py-3 px-3 focus:outline-none border"
                                            style={{
                                                background: "var(--thor-surface-2)",
                                                borderColor: "var(--thor-border)",
                                                color: "var(--thor-text)"
                                            }}
                                        >
                                            <option value="solo">Solo Traveler</option>
                                            <option value="couple">Couple</option>
                                            <option value="family">Family</option>
                                            <option value="friends">Group of Friends</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold uppercase tracking-widest mb-2 block" style={{ color: "var(--thor-text-muted)" }}>Budget Level</label>
                                        <select
                                            value={budgetLevel}
                                            onChange={(e) => setBudgetLevel(e.target.value)}
                                            className="w-full rounded-xl py-3 px-3 focus:outline-none border"
                                            style={{
                                                background: "var(--thor-surface-2)",
                                                borderColor: "var(--thor-border)",
                                                color: "var(--thor-text)"
                                            }}
                                        >
                                            <option value="budget">Budget ($)</option>
                                            <option value="moderate">Moderate ($$)</option>
                                            <option value="luxury">Luxury ($$$)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold uppercase tracking-widest mb-2 block" style={{ color: "var(--thor-text-muted)" }}>Travel Interests (Select multiple)</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {['Food', 'Culture', 'Nature', 'Nightlife', 'Shopping', 'Adventure', 'Photography'].map((interest) => (
                                                <label key={interest} className="flex items-center gap-2 p-2 rounded-lg cursor-pointer border hover:border-yellow-500" style={{ borderColor: "var(--thor-border)" }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={travelInterests.includes(interest)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setTravelInterests([...travelInterests, interest]);
                                                            } else {
                                                                setTravelInterests(travelInterests.filter(i => i !== interest));
                                                            }
                                                        }}
                                                        className="w-4 h-4 rounded focus:ring-2 focus:ring-yellow-500"
                                                        style={{
                                                            background: "var(--thor-surface-2)",
                                                            borderColor: "var(--thor-border)",
                                                            color: "var(--thor-text)"
                                                        }}
                                                    />
                                                    <span className="text-sm" style={{ color: "var(--thor-text)" }}>{interest}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold uppercase tracking-widest mb-2 block" style={{ color: "var(--thor-text-muted)" }}>Travel Pace</label>
                                        <select
                                            value={travelPace}
                                            onChange={(e) => setTravelPace(e.target.value)}
                                            className="w-full rounded-xl py-3 px-3 focus:outline-none border"
                                            style={{
                                                background: "var(--thor-surface-2)",
                                                borderColor: "var(--thor-border)",
                                                color: "var(--thor-text)"
                                            }}
                                        >
                                            <option value="relaxed">Relaxed (Fewer activities, more time to enjoy)</option>
                                            <option value="balanced">Balanced (Good mix of activities and free time)</option>
                                            <option value="fast-paced">Fast-paced (Packed with activities)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold uppercase tracking-widest mb-2 block" style={{ color: "var(--thor-text-muted)" }}>Dietary Preference</label>
                                        <select
                                            value={dietaryPreference}
                                            onChange={(e) => setDietaryPreference(e.target.value)}
                                            className="w-full rounded-xl py-3 px-3 focus:outline-none border"
                                            style={{
                                                background: "var(--thor-surface-2)",
                                                borderColor: "var(--thor-border)",
                                                color: "var(--thor-text)"
                                            }}
                                        >
                                            <option value="none">No restrictions</option>
                                            <option value="vegetarian">Vegetarian</option>
                                            <option value="vegan">Vegan</option>
                                            <option value="halal">Halal</option>
                                            <option value="kosher">Kosher</option>
                                            <option value="gluten-free">Gluten-free</option>
                                            <option value="dairy-free">Dairy-free</option>
                                            <option value="nut-free">Nut-free</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-8">
                                    <button 
                                        onClick={() => setStep(1)} 
                                        className="p-4 rounded-xl border transition-colors"
                                        style={{
                                            borderColor: "var(--thor-border)",
                                            color: "var(--thor-text-muted)"
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.color = "var(--thor-text)";
                                            e.currentTarget.style.backgroundColor = "var(--thor-surface-3)";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.color = "var(--thor-text-muted)";
                                            e.currentTarget.style.backgroundColor = "transparent";
                                        }}
                                    >
                                        <ArrowLeft className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={handleFetchSuggestions}
                                        disabled={!startDate || !endDate || loading}
                                        className="flex-1 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                                        style={{
                                            background: "var(--thor-brand)",
                                            color: "#000000"
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!e.currentTarget.disabled) {
                                                e.currentTarget.style.background = "var(--thor-brand-light)";
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!e.currentTarget.disabled) {
                                                e.currentTarget.style.background = "var(--thor-brand)";
                                            }
                                        }}
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
                                    <h2 className="text-xl font-bold" style={{ color: "var(--thor-text)" }}>3. {translate("Build Your Plan")}</h2>
                                    <p className="text-xs mt-0.5" style={{ color: "var(--thor-text-muted)" }}>{translate("Select what you want — we'll build the route!")}</p>
                                </div>
                                <button 
                                    onClick={() => setStep(2)} 
                                    className="p-2 rounded-lg border transition-colors"
                                    style={{
                                        borderColor: "var(--thor-border)",
                                        color: "var(--thor-text-muted)"
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.color = "var(--thor-text)";
                                        e.currentTarget.style.backgroundColor = "var(--thor-surface-3)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.color = "var(--thor-text-muted)";
                                        e.currentTarget.style.backgroundColor = "transparent";
                                    }}
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-1 noscrollbar">

                                {/* Accommodation */}
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <Hotel className="w-4 h-4 text-blue-400" />
                                        <span className="text-sm font-bold uppercase tracking-wider" style={{ color: "var(--thor-text)" }}>{translate("Accommodation")}</span>
                                        <span className="text-xs" style={{ color: "var(--thor-text-muted)" }}>(pick one)</span>
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
                                                className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                                    viewDay === i 
                                                        ? "" 
                                                        : ""
                                                }`}
                                                style={{
                                                    background: viewDay === i ? "var(--thor-brand)" : "var(--thor-surface-2)",
                                                    color: viewDay === i ? "#000000" : "var(--thor-text-muted)"
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (viewDay !== i) {
                                                        e.currentTarget.style.backgroundColor = "var(--thor-surface-3)";
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (viewDay !== i) {
                                                        e.currentTarget.style.backgroundColor = "var(--thor-surface-2)";
                                                    }
                                                }}
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
                                                <span className="text-sm font-bold uppercase tracking-wider" style={{ color: "var(--thor-text)" }}>{translate("Breakfast")} — Day {currentDay.day}</span>
                                                <span className="text-xs" style={{ color: "var(--thor-text-muted)" }}>(pick one)</span>
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
                                                <span className="text-sm font-bold uppercase tracking-wider" style={{ color: "var(--thor-text)" }}>{translate("Places to Visit")} — Day {currentDay.day}</span>
                                                <span className="text-xs" style={{ color: "var(--thor-text-muted)" }}>(pick multiple)</span>
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
                                                <span className="text-sm font-bold uppercase tracking-wider" style={{ color: "var(--thor-text)" }}>{translate("Lunch")} — Day {currentDay.day}</span>
                                                <span className="text-xs" style={{ color: "var(--thor-text-muted)" }}>(pick one)</span>
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
                                                <span className="text-sm font-bold uppercase tracking-wider" style={{ color: "var(--thor-text)" }}>{translate("Dinner")} — Day {currentDay.day}</span>
                                                <span className="text-xs" style={{ color: "var(--thor-text-muted)" }}>(pick one)</span>
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
                            <div className="mt-6 pt-4 border-t" style={{ borderColor: "var(--thor-border)" }}>
                                {!canConfirm && (
                                    <p className="text-xs text-center mb-3" style={{ color: "var(--thor-text-muted)" }}>⚡ Select an accommodation to continue</p>
                                )}
                                <button
                                    onClick={() => setStep(4)}
                                    disabled={!canConfirm}
                                    className="w-full font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                    style={{
                                        background: "var(--thor-brand)",
                                        color: "#000000"
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!e.currentTarget.disabled) {
                                            e.currentTarget.style.background = "var(--thor-brand-light)";
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!e.currentTarget.disabled) {
                                            e.currentTarget.style.background = "var(--thor-brand)";
                                        }
                                    }}
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
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(16, 185, 129, 0.2)", color: "var(--thor-safe)" }}>
                                        <Check className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold" style={{ color: "var(--thor-text)" }}>{translate("Your Custom Plan")}</h2>
                                        <p className="text-sm" style={{ color: "var(--thor-text-secondary)" }}>{suggestions.destination}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setStep(3)} 
                                    className="p-2 rounded-lg border transition-colors"
                                    style={{
                                        borderColor: "var(--thor-border)",
                                        color: "var(--thor-text-muted)"
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.color = "var(--thor-text)";
                                        e.currentTarget.style.backgroundColor = "var(--thor-surface-3)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.color = "var(--thor-text-muted)";
                                        e.currentTarget.style.backgroundColor = "transparent";
                                    }}
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-3 max-h-[55vh] overflow-y-auto noscrollbar">
                                {/* Hotel */}
                                {selectedHotel && (
                                    <div className="rounded-xl p-4 flex items-center gap-3 border" style={{ background: "var(--thor-surface-2)", borderColor: "rgba(59, 130, 246, 0.2)" }}>
                                        <div className="p-2 rounded-lg" style={{ background: "rgba(59, 130, 246, 0.1)", color: "#3B82F6" }}><Hotel className="w-4 h-4" /></div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] uppercase tracking-widest font-bold" style={{ color: "var(--thor-text-muted)" }}>Accommodation</p>
                                            <p className="font-semibold text-sm truncate" style={{ color: "var(--thor-text)" }}>{selectedHotel.name}</p>
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
                                        <div key={d.day} className="rounded-xl overflow-hidden border" style={{ background: "var(--thor-surface-2)", borderColor: "var(--thor-border)" }}>
                                            <div className="px-4 py-2 text-xs font-bold uppercase tracking-wider" style={{ background: "rgba(234, 179, 8, 0.1)", color: "var(--thor-brand)" }}>Day {d.day}</div>
                                            <div className="p-4 space-y-2">
                                                {bk && (
                                                    <div className="flex items-center gap-2 text-xs" style={{ color: "var(--thor-text-secondary)" }}>
                                                        <Coffee className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                                        <span className="truncate">{bk.name}</span>
                                                    </div>
                                                )}
                                                {spots.map((s, i) => (
                                                    <div key={i} className="flex items-center gap-2 text-xs font-medium" style={{ color: "var(--thor-text)" }}>
                                                        <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "var(--thor-brand)" }} />
                                                        <span className="truncate">{s.name}</span>
                                                    </div>
                                                ))}
                                                {lk && (
                                                    <div className="flex items-center gap-2 text-xs" style={{ color: "var(--thor-text-secondary)" }}>
                                                        <UtensilsCrossed className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                                                        <span className="truncate">{lk.name}</span>
                                                    </div>
                                                )}
                                                {dk && (
                                                    <div className="flex items-center gap-2 text-xs" style={{ color: "var(--thor-text-secondary)" }}>
                                                        <Moon className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                                                        <span className="truncate">{dk.name}</span>
                                                    </div>
                                                )}
                                                {!bk && !lk && !dk && spots.length === 0 && (
                                                    <p className="text-xs italic" style={{ color: "var(--thor-text-muted)" }}>Nothing selected for this day</p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <button
                                onClick={handleConfirmPlan}
                                className="mt-6 w-full font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors border"
                                style={{
                                    background: "var(--thor-text)",
                                    color: "var(--thor-bg)",
                                    borderColor: "var(--thor-border)"
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = "var(--thor-text-secondary)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = "var(--thor-text)";
                                }}
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

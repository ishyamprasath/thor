import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Camera, Upload, Sparkles, AlertCircle, ChevronLeft, Heart, Info, Lightbulb, MapPin } from "lucide-react";
import { useNavigate } from "react-router";
import { useTranslation } from "../../context/TranslationContext";
import { API_URL } from "../../config/api";

interface CulturalAnalysis {
  place_type: string;
  description: string;
  respectful_tips: string[];
  cultural_significance: string;
}

export default function CulturalScanner() {
  const navigate = useNavigate();
  const { translate } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<CulturalAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError(translate("Image size must be less than 10MB"));
        return;
      }
      setError(null);
      setResult(null);
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
      analyzeImage(file);
    }
  };

  const analyzeImage = async (file: File) => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const token = localStorage.getItem("thor_token");
      const response = await fetch(`${API_URL}/cultural-scanner/analyze`, {
        method: "POST",
        headers: {
          "Authorization": token ? `Bearer ${token}` : "",
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to analyze image");
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Failed to analyze image. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetScanner = () => {
    setSelectedImage(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-full pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate("/dashboard")}
          className="p-2 rounded-full hover:bg-zinc-800 transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--thor-text)" }}>
            {translate("Cultural Scanner")}
          </h1>
          <p className="text-sm text-zinc-400">
            {translate("Scan cultural & religious places for respectful guidance")}
          </p>
        </div>
      </div>

      {/* Upload Section */}
      <AnimatePresence mode="wait">
        {!selectedImage ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Main Upload Area */}
            <div className="border-2 border-dashed border-zinc-700 rounded-3xl p-8 text-center hover:border-yellow-500/50 transition-colors">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-2xl flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-yellow-500" />
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: "var(--thor-text)" }}>
                {translate("Scan a Cultural Place")}
              </h3>
              <p className="text-zinc-400 text-sm mb-6 max-w-xs mx-auto">
                {translate("Take a photo or upload an image of a temple, mosque, church, or any cultural site to get respectful guidance")}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {/* Camera Button */}
                <button
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-yellow-500 text-black font-bold rounded-xl hover:bg-yellow-400 transition-colors"
                >
                  <Camera className="w-5 h-5" />
                  {translate("Take Photo")}
                </button>
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {/* Upload Button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-zinc-800 text-white font-bold rounded-xl hover:bg-zinc-700 transition-colors border border-zinc-700"
                >
                  <Upload className="w-5 h-5" />
                  {translate("Upload Image")}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </div>

            {/* Supported Types */}
            <div className="flex flex-wrap justify-center gap-2">
              <span className="px-3 py-1 bg-zinc-800/50 rounded-full text-xs text-zinc-400">{translate("Temples")}</span>
              <span className="px-3 py-1 bg-zinc-800/50 rounded-full text-xs text-zinc-400">{translate("Mosques")}</span>
              <span className="px-3 py-1 bg-zinc-800/50 rounded-full text-xs text-zinc-400">{translate("Churches")}</span>
              <span className="px-3 py-1 bg-zinc-800/50 rounded-full text-xs text-zinc-400">{translate("Shrines")}</span>
              <span className="px-3 py-1 bg-zinc-800/50 rounded-full text-xs text-zinc-400">{translate("Gurdwaras")}</span>
              <span className="px-3 py-1 bg-zinc-800/50 rounded-full text-xs text-zinc-400">{translate("Synagogues")}</span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-4"
          >
            {/* Image Preview */}
            <div className="relative rounded-2xl overflow-hidden bg-zinc-900">
              <img
                src={selectedImage}
                alt="Selected cultural place"
                className="w-full max-h-[300px] object-cover"
              />
              {isAnalyzing && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full mb-4"
                  />
                  <p className="text-white font-medium">{translate("Analyzing...")}</p>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-400 font-medium">{translate("Analysis Failed")}</p>
                  <p className="text-red-400/70 text-sm">{error}</p>
                </div>
              </motion.div>
            )}

            {/* Analysis Results */}
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-4"
              >
                {/* Place Type Header */}
                <div className="p-6 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-2xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-yellow-500/20 rounded-lg">
                      <MapPin className="w-6 h-6 text-yellow-500" />
                    </div>
                    <span className="px-3 py-1 bg-yellow-500 text-black text-xs font-bold uppercase tracking-wider rounded-full">
                      {translate("Identified")}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--thor-text)" }}>
                    {result.place_type}
                  </h2>
                  <p className="text-zinc-400 leading-relaxed">
                    {result.description}
                  </p>
                </div>

                {/* Cultural Significance */}
                <div className="p-5 bg-white rounded-2xl border border-zinc-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <Info className="w-5 h-5 text-blue-500" />
                    <h3 className="font-bold text-lg text-black">
                      {translate("Cultural Significance")}
                    </h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    {result.cultural_significance}
                  </p>
                </div>

                {/* Respectful Tips */}
                <div className="p-5 bg-white rounded-2xl border border-zinc-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <Heart className="w-5 h-5 text-red-500" />
                    <h3 className="font-bold text-lg text-black">
                      {translate("Respectful Guidelines")}
                    </h3>
                  </div>
                  <ul className="space-y-3">
                    {result.respectful_tips.map((tip, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        className="flex items-start gap-3"
                      >
                        <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Lightbulb className="w-3.5 h-3.5 text-yellow-600" />
                        </div>
                        <span className="text-gray-700 text-sm leading-relaxed">{tip}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}

            {/* Reset Button */}
            <button
              onClick={resetScanner}
              disabled={isAnalyzing}
              className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl transition-colors border border-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {translate("Scan Another Place")}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

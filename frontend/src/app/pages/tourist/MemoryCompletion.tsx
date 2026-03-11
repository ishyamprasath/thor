import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Camera, Upload, Sparkles, Image as ImageIcon, Heart, ArrowRight } from "lucide-react";
import { useTranslation } from "../../context/TranslationContext";
import { API_URL } from "../../config/api";

type Step = "base" | "person" | "processing" | "result";

export default function MemoryCompletion() {
  const { translate } = useTranslation();

  const [step, setStep] = useState<Step>("base");
  const [baseImage, setBaseImage] = useState<string | null>(null);
  const [personImage, setPersonImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const baseInputRef = useRef<HTMLInputElement>(null);
  const personInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: "base" | "person") => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (type === "base") {
        setBaseImage(result);
        setStep("person");
      } else {
        setPersonImage(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleMergeMemories = async () => {
    if (!baseImage || !personImage) return;

    setStep("processing");
    setError(null);

    try {
      // Split off the "data:image/jpeg;base64," part
      const base64Base = baseImage.split(",")[1];
      const base64Person = personImage.split(",")[1];

      const res = await fetch(`${API_URL}/api/memory/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          base_image: base64Base,
          person_image: base64Person,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Failed to generate memory");
      }

      setResultImage(`data:image/jpeg;base64,${data.result}`);
      setStep("result");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong.");
      setStep("person"); // go back so they can try again
    }
  };

  const reset = () => {
    setBaseImage(null);
    setPersonImage(null);
    setResultImage(null);
    setError(null);
    setStep("base");
  };

  return (
    <div className="min-h-screen flex flex-col pb-24" style={{ background: "#050505" }}>
      {/* Premium Dark Header */}
      <div className="pt-safe px-6 pb-6 border-b border-zinc-800/80 bg-black/60 backdrop-blur-2xl sticky top-0 z-40">
        <h1 className="text-2xl font-black mt-4 tracking-tight flex items-center gap-2 text-white">
          <Sparkles className="w-5 h-5 text-amber-500" />
          {translate("Cinematic Memory")}
        </h1>
        <p className="text-zinc-500 text-sm mt-1 font-medium">
          {translate("Fuse two photos instantly into a complete travel memory using AI.")}
        </p>
      </div>

      <div className="flex-1 p-6 flex flex-col items-center justify-center relative">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />

        <input ref={baseInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, "base")} />
        <input ref={personInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, "person")} />

        <AnimatePresence mode="wait">
          {/* STEP 1: BASE IMAGE */}
          {step === "base" && (
            <motion.div key="base" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-sm flex flex-col items-center gap-8 relative z-10">
              
              <div className="w-24 h-24 rounded-[32px] bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-2xl">
                <ImageIcon className="w-10 h-10 text-zinc-400" />
              </div>
              
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-black text-white tracking-tight">Stage 1</h2>
                <p className="text-zinc-400 text-sm">Upload the primary scenic travel photo.</p>
              </div>

              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => baseInputRef.current?.click()}
                className="w-full h-56 rounded-[32px] border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800/50 transition-colors flex flex-col items-center justify-center gap-4 text-zinc-400 overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
                <Camera className="w-8 h-8 group-hover:text-white transition-colors z-10" />
                <span className="font-semibold text-sm tracking-wide z-10">{translate("Tap to capture or upload")}</span>
              </motion.button>
            </motion.div>
          )}

          {/* STEP 2: PERSON IMAGE */}
          {step === "person" && (
            <motion.div key="person" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="w-full max-w-sm flex flex-col items-center gap-8 relative z-10">
              
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-black text-white tracking-tight">Stage 2</h2>
                <p className="text-zinc-400 text-sm">Upload a portrait of the missing traveler.</p>
              </div>

              {!personImage ? (
                <div className="w-full flex flex-col items-center gap-4">
                    {/* Tiny Base Image Reference */}
                    <div className="flex w-full items-center justify-between px-4">
                        <span className="text-xs text-zinc-600 font-bold tracking-wider uppercase">Base Scene</span>
                        <div onClick={() => setStep("base")} className="w-16 h-16 rounded-xl overflow-hidden border border-zinc-800 cursor-pointer hover:border-zinc-600 transition-colors">
                            <img src={baseImage!} alt="Base" className="w-full h-full object-cover" />
                        </div>
                    </div>

                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => personInputRef.current?.click()}
                    className="w-full h-56 rounded-[32px] border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 transition-colors flex flex-col items-center justify-center gap-4 text-amber-500/70 overflow-hidden group">
                    <Upload className="w-8 h-8 group-hover:text-amber-400 transition-colors" />
                    <span className="font-semibold text-sm tracking-wide">{translate("Upload Portrait")}</span>
                    </motion.button>
                </div>
              ) : (
                <div className="w-full space-y-8">
                  <div className="flex gap-4 items-center justify-center">
                    <div className="w-32 h-40 rounded-2xl overflow-hidden border border-zinc-800 opacity-60">
                        <img src={baseImage!} className="w-full h-full object-cover" />
                    </div>
                    <div className="w-32 h-40 rounded-2xl overflow-hidden border-2 border-amber-500">
                        <img src={personImage} className="w-full h-full object-cover" />
                    </div>
                  </div>
                  
                  {error && (
                    <div className="bg-red-950/50 border border-red-900/50 rounded-2xl p-4 text-sm text-red-400 text-center">
                      {error}
                    </div>
                  )}

                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleMergeMemories}
                    className="w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(245,158,11,0.15)] bg-white text-black hover:bg-zinc-200 transition-colors">
                    <Sparkles className="w-5 h-5 fill-black" />
                    {translate("Initialize Fusion")}
                  </motion.button>
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 3: PROCESSING */}
          {step === "processing" && (
            <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="w-full max-w-sm flex flex-col items-center justify-center gap-12 py-10 relative z-10">
              
              <div className="relative flex items-center justify-center">
                <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 2, repeat: Infinity }}
                  className="absolute w-32 h-32 bg-amber-500/20 rounded-full blur-2xl" />
                
                <div className="relative z-10 w-24 h-24 rounded-full border border-amber-500/30 bg-black/50 backdrop-blur-xl flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-amber-500 animate-pulse" />
                </div>
              </div>

              <div className="text-center space-y-3">
                <h2 className="text-lg font-bold text-white tracking-widest uppercase">
                  Rendering Sequence
                </h2>
                <p className="text-zinc-500 text-sm font-medium">
                  Applying neural compositing and ambient light matching.
                </p>
              </div>
            </motion.div>
          )}

          {/* STEP 4: RESULT */}
          {step === "result" && resultImage && (
            <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-md flex flex-col items-center gap-8 relative z-10">
              
              <div className="w-full aspect-[4/5] rounded-[32px] overflow-hidden border border-zinc-800 shadow-[0_0_80px_rgba(245,158,11,0.08)] relative group bg-zinc-900">
                <img src={resultImage} alt="Completed Memory" className="w-full h-full object-contain" />
              </div>

              <div className="flex w-full gap-4">
                <button onClick={reset} className="flex-[0.3] py-4 rounded-2xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-white transition-colors flex items-center justify-center">
                  <Camera className="w-5 h-5" />
                </button>
                <button className="flex-1 py-4 rounded-2xl font-bold bg-white text-black hover:bg-zinc-200 transition-colors shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                  Save to Camera Roll
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

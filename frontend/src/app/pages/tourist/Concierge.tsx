import { useState } from "react";
import { motion } from "motion/react";
import { MessageSquare, Send, Bot, User, Sparkles, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

interface Message {
  id: number;
  sender: "user" | "ai";
  text: string;
  time: string;
}

export default function TouristConcierge() {
  const navigate = useNavigate();
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "ai",
      text: "Hello! I'm your GuardianAI assistant. I can help you with local recommendations, safety tips, translations, and emergency guidance. How can I assist you today?",
      time: "Just now",
    },
  ]);

  const quickSuggestions = [
    "Where are the safest restaurants nearby?",
    "Translate 'Where is the hospital?' to French",
    "What are local safety customs?",
    "Show me emergency contacts",
  ];

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      sender: "user",
      text: inputMessage,
      time: "Now",
    };

    setMessages([...messages, userMessage]);
    setInputMessage("");

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: messages.length + 2,
        sender: "ai",
        text: getAIResponse(inputMessage),
        time: "Now",
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 1000);
  };

  const getAIResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes("restaurant") || lowerQuery.includes("food")) {
      return "I recommend 'Le Bistrot Parisien' (0.5km away) - Safety Score: 96%. They serve authentic French cuisine in a well-monitored tourist area. Open until 11 PM. Would you like directions?";
    } else if (lowerQuery.includes("translate")) {
      return "In French: 'Où est l'hôpital?' (pronounced: oo eh loh-pee-tal). I can also provide voice pronunciation if needed. Stay safe!";
    } else if (lowerQuery.includes("safety") || lowerQuery.includes("custom")) {
      return "Key safety customs in Paris: 1) Keep bags in front in crowded areas 2) Avoid dark alleys at night 3) Tourist areas are well-policed 4) Emergency number is 112. Your current area has a 94% safety score.";
    } else if (lowerQuery.includes("emergency")) {
      return "Emergency Contacts:\n🚨 Police: 17 or 112\n🏥 Ambulance: 15\n🔥 Fire: 18\n📞 Your Embassy: +33-1-43-12-22-22\n\nNearest hospital: City General (0.8km). Would you like me to activate emergency navigation?";
    }
    
    return "I understand you're asking about travel guidance. I can help with safety tips, local recommendations, translations, and emergency assistance. What specific information would you like?";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-cyan-50 flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-xl border-b border-white/20"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-lg">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">AI Concierge</h1>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
                  Online & Ready
                </div>
              </div>
            </div>
            <Sparkles className="w-6 h-6 text-teal-600" />
          </div>
        </div>
      </motion.div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            {messages.map((message, idx) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`flex gap-3 max-w-[80%] ${message.sender === "user" ? "flex-row-reverse" : ""}`}>
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.sender === "ai"
                        ? "bg-gradient-to-br from-teal-500 to-cyan-600"
                        : "bg-gradient-to-br from-blue-500 to-indigo-600"
                    }`}
                  >
                    {message.sender === "ai" ? (
                      <Bot className="w-6 h-6 text-white" />
                    ) : (
                      <User className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div
                    className={`rounded-2xl p-4 ${
                      message.sender === "ai"
                        ? "bg-white/80 backdrop-blur-xl border border-white/20 shadow-lg"
                        : "bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg"
                    }`}
                  >
                    <p className={`${message.sender === "ai" ? "text-slate-800" : "text-white"} whitespace-pre-line`}>
                      {message.text}
                    </p>
                    <div className={`text-xs mt-2 ${message.sender === "ai" ? "text-slate-400" : "text-blue-100"}`}>
                      {message.time}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Quick Suggestions */}
          {messages.length === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-8"
            >
              <h3 className="text-sm font-medium text-slate-600 mb-4 text-center">
                Quick suggestions:
              </h3>
              <div className="grid md:grid-cols-2 gap-3">
                {quickSuggestions.map((suggestion, idx) => (
                  <motion.button
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + idx * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => {
                      setInputMessage(suggestion);
                      setTimeout(() => handleSendMessage(), 100);
                    }}
                    className="bg-white/80 backdrop-blur-xl rounded-xl p-4 border border-white/20 shadow-lg hover:shadow-xl transition-all text-left text-sm text-slate-700"
                  >
                    {suggestion}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-xl border-t border-white/20 sticky bottom-0"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex gap-3">
            <Input
              type="text"
              placeholder="Ask me anything about safety, places, translations..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              className="flex-1 px-6 py-6 rounded-2xl border-2 border-slate-200 focus:border-teal-500 text-base"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim()}
              className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white px-8 py-6 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

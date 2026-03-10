import { useState, useRef } from "react";
import { motion } from "motion/react";
import { MessageCircle, Repeat2, Heart, Share, BadgeCheck, Image as ImageIcon, MapPin, X, AlertTriangle, TrendingUp, Activity, Filter } from "lucide-react";

// Reuse similar mock posts but adapted for Enterprise context
const MOCK_POSTS = [
    {
        id: 1,
        author: { name: "Global Operations", handle: "@enterprise_sys", verified: true, avatar: "⚡" },
        content: "🚨 CRITICAL ADVISORY: High-risk weather patterns detected over the Western Ghats region. All active tourist tracking cohorts in this sector have been flagged. Local guide agencies have been notified.",
        location: "Kerala Command",
        time: "10m ago",
        likes: 245, replies: 12, reposts: 89, isLiked: false,
        isAlert: true
    },
    {
        id: 2,
        author: { name: "Rajesh Kumar", handle: "@rajesh_safari", verified: true, avatar: "R" },
        content: "Just finished a 3-day guided tour across Mahabalipuram! The new safety zones established by the tourism board made the night-walk completely stress-free. Logs uploaded to enterprise database.",
        image: "https://images.unsplash.com/photo-1582510003544-4d00b7f7415e?auto=format&fit=crop&q=80&w=800",
        location: "Tamil Nadu, India",
        time: "2h ago",
        likes: 124, replies: 12, reposts: 5, isLiked: false
    },
    {
        id: 3,
        author: { name: "Sarah Jenkins", handle: "@sarahj_travels", verified: false, avatar: "S" },
        content: "Reporting minor trail blockages near Ooty Point. Sent coordinates via my THOR app. Other tourists should route around sector section 4B.",
        location: "Ooty, Kerala",
        time: "5h ago",
        likes: 42, replies: 8, reposts: 2, isLiked: true
    }
];

export default function EnterpriseCommunity() {
    const [posts, setPosts] = useState<any[]>(MOCK_POSTS);
    const [composeText, setComposeText] = useState("");
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePost = () => {
        if (!composeText.trim() && !selectedImage) return;

        const newPost = {
            id: Date.now(),
            author: { name: "Enterprise Command", handle: "@admin", verified: true, avatar: "E" },
            content: composeText,
            image: selectedImage || undefined,
            location: "Global Dashboard",
            time: "Just now",
            likes: 0, replies: 0, reposts: 0, isLiked: false
        };

        setPosts([newPost, ...posts]);
        setComposeText("");
        setSelectedImage(null);
    };

    const handleLike = (id: number) => {
        setPosts(posts.map(p => p.id === id ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 } : p));
    }

    return (
        <div className="h-full flex gap-6 max-w-7xl mx-auto">
            {/* Left Column: Feed */}
            <div className="flex-1 flex flex-col border rounded-3xl overflow-hidden shadow-sm" style={{ background: "var(--thor-surface)", borderColor: "var(--thor-border)" }}>
                {/* Header */}
                <div className="px-6 py-4 border-b flex items-center justify-between shrink-0" style={{ background: "var(--thor-surface)", borderColor: "var(--thor-border)" }}>
                    <div className="flex items-center gap-3">
                        <Activity className="w-5 h-5 text-blue-500" />
                        <h1 className="text-xl font-bold tracking-tight" style={{ color: "var(--thor-text)" }}>Global Activity Feed</h1>
                    </div>
                    <button className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors" style={{ color: "var(--thor-text-secondary)" }}>
                        <Filter className="w-5 h-5" />
                    </button>
                </div>

                {/* Compose Form */}
                <div className="p-6 border-b shrink-0" style={{ background: "var(--thor-surface-2)", borderColor: "var(--thor-border)" }}>
                    <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center font-bold text-blue-500 shrink-0 border border-blue-500/20">
                            E
                        </div>
                        <div className="flex-1">
                            <textarea
                                value={composeText}
                                onChange={(e) => setComposeText(e.target.value)}
                                placeholder="Broadcast an advisory or update to all tourists..."
                                className="w-full bg-transparent text-sm resize-none outline-none min-h-[60px]"
                                style={{ color: "var(--thor-text)" }}
                            />

                            {selectedImage && (
                                <div className="relative mt-3 mb-2 rounded-xl overflow-hidden border w-fit" style={{ borderColor: "var(--thor-border)" }}>
                                    <img src={selectedImage} alt="Preview" className="max-h-[200px] w-auto object-cover" />
                                    <button
                                        onClick={() => setSelectedImage(null)}
                                        className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white p-1 rounded-full backdrop-blur-md transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )}

                            <div className="flex items-center justify-between pt-3 border-t mt-2" style={{ borderColor: "var(--thor-border)" }}>
                                <div className="flex gap-2">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        ref={fileInputRef}
                                        onChange={handleImageSelect}
                                    />
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="p-2 rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                                        style={{ color: "var(--thor-brand)" }}
                                    >
                                        <ImageIcon className="w-5 h-5" />
                                    </button>
                                </div>
                                <button
                                    onClick={handlePost}
                                    disabled={!composeText.trim() && !selectedImage}
                                    className="btn btn-brand px-6 disabled:opacity-50 text-sm"
                                >
                                    Broadcast
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Feed Scroll */}
                <div className="flex-1 overflow-y-auto">
                    {posts.map((post) => (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            key={post.id}
                            className={`p-6 border-b transition-colors cursor-pointer flex gap-4 hover:bg-black/5 dark:hover:bg-white/5`}
                            style={{
                                borderColor: "var(--thor-border)",
                                background: post.isAlert ? "var(--thor-danger-10)" : "transparent"
                            }}
                        >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 border ${post.isAlert ? "bg-red-500/20 text-red-500 border-red-500/30" : "bg-zinc-500/10 text-zinc-500 border-zinc-500/20"
                                }`}>
                                {post.author.avatar}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 text-sm mb-2">
                                    <span className="font-bold truncate" style={{ color: "var(--thor-text)" }}>{post.author.name}</span>
                                    {post.author.verified && <BadgeCheck className={`w-4 h-4 shrink-0 ${post.isAlert ? 'text-red-500' : 'text-blue-500'}`} />}
                                    <span className="text-xs truncate" style={{ color: "var(--thor-text-muted)" }}>{post.author.handle}</span>
                                    <span style={{ color: "var(--thor-text-muted)" }}>·</span>
                                    <span className="text-xs" style={{ color: "var(--thor-text-muted)" }}>{post.time}</span>
                                </div>

                                <p className="text-sm leading-relaxed mb-4 whitespace-pre-wrap" style={{ color: "var(--thor-text)" }}>
                                    {post.content}
                                </p>

                                {post.image && (
                                    <div className="mb-4 rounded-xl overflow-hidden border" style={{ borderColor: "var(--thor-border)" }}>
                                        <img src={post.image} alt="Attachment" className="w-full max-h-[300px] object-cover" />
                                    </div>
                                )}

                                {post.location && (
                                    <div className="flex items-center gap-1.5 text-xs font-medium mb-4" style={{ color: "var(--thor-brand)" }}>
                                        <MapPin className="w-3.5 h-3.5" />
                                        {post.location}
                                    </div>
                                )}

                                <div className="flex items-center justify-between max-w-sm" style={{ color: "var(--thor-text-secondary)" }}>
                                    <button className="flex items-center gap-2 hover:text-blue-500 transition-colors group">
                                        <MessageCircle className="w-4 h-4" />
                                        <span className="text-xs">{post.replies}</span>
                                    </button>
                                    <button className="flex items-center gap-2 hover:text-green-500 transition-colors group">
                                        <Repeat2 className="w-4 h-4" />
                                        <span className="text-xs">{post.reposts}</span>
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleLike(post.id); }}
                                        className={`flex items-center gap-2 transition-colors ${post.isLiked ? 'text-pink-500' : 'hover:text-pink-500'}`}
                                    >
                                        <Heart className="w-4 h-4" fill={post.isLiked ? "currentColor" : "none"} />
                                        <span className="text-xs">{post.likes}</span>
                                    </button>
                                    <button className="flex items-center gap-2 hover:text-blue-500 transition-colors">
                                        <Share className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Right Column: Analytics / Trending */}
            <div className="hidden lg:flex flex-col gap-6 w-80 shrink-0">
                <div className="p-6 rounded-3xl border" style={{ background: "var(--thor-surface)", borderColor: "var(--thor-border)" }}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-sm tracking-widest uppercase" style={{ color: "var(--thor-text-secondary)" }}>Network Alerts</h3>
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                    </div>
                    <div className="space-y-4">
                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                            <strong>High Risk:</strong> Weather anomaly detected in Sector 7. 43 tourists notified.
                        </div>
                        <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 dark:text-yellow-500 text-sm">
                            <strong>Warning:</strong> Crowd density exceeding optimal limits at City Center.
                        </div>
                    </div>
                </div>

                <div className="p-6 rounded-3xl border flex-1" style={{ background: "var(--thor-surface)", borderColor: "var(--thor-border)" }}>
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-sm tracking-widest uppercase" style={{ color: "var(--thor-text-secondary)" }}>Trending Zones</h3>
                        <TrendingUp className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className="space-y-4">
                        {[
                            { name: "Kerala Backwaters", count: "1,204 active tags", trend: "+12%" },
                            { name: "Ooty Peak", count: "856 active tags", trend: "+5%" },
                            { name: "Sector 4 Safe Zone", count: "340 active tags", trend: "-2%" },
                        ].map((zone, i) => (
                            <div key={i} className="flex flex-col gap-1 pb-4 border-b last:border-0" style={{ borderColor: "var(--thor-border)" }}>
                                <div className="flex items-center justify-between text-base" style={{ color: "var(--thor-text)" }}>
                                    <span className="font-semibold">{zone.name}</span>
                                    <span className="text-xs font-bold text-green-500">{zone.trend}</span>
                                </div>
                                <span className="text-xs" style={{ color: "var(--thor-text-muted)" }}>{zone.count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

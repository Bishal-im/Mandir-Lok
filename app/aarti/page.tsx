"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getSettings } from "@/lib/actions/admin";

const DEFAULT_DEITIES = [
    { id: "shiva", name: "Shiv ji", image: "/images/aarti/shiva.png", color: "from-blue-500 to-indigo-800" },
    { id: "vishnu", name: "Vishnu ji", image: "/images/aarti/vishnu.png", color: "from-yellow-400 to-orange-600" },
    { id: "ganesha", name: "Ganesh ji", image: "/images/aarti/ganesha.png", color: "from-red-500 to-orange-500" },
    { id: "devi", name: "Durga Maa", image: "/images/aarti/durga.png", color: "from-rose-500 to-red-700" },
];

export default function AartiPage() {
    const [deities, setDeities] = useState(DEFAULT_DEITIES);
    const [selectedDeity, setSelectedDeity] = useState(DEFAULT_DEITIES[0]);
    const [counts, setCounts] = useState({ deep: 0, pushpa: 0, shankh: 0 });
    const [flowers, setFlowers] = useState<any[]>([]);
    const [isLampGlowing, setIsLampGlowing] = useState(false);
    const [conchPlaying, setConchPlaying] = useState(false);
    const [isAartiPerforming, setIsAartiPerforming] = useState(false);

    useEffect(() => {
        async function fetchSettings() {
            const res = await getSettings("aarti_settings");
            if (res && res.value && res.value.deities && res.value.deities.length > 0) {
                setDeities(res.value.deities);
                setSelectedDeity(res.value.deities[0]);
            }
        }
        fetchSettings();
    }, []);

    // Deity specific settings (placeholder for dynamic platter if removed)

    const handleDeepClick = () => {
        setCounts((prev) => ({ ...prev, deep: prev.deep + 1 }));
        setIsLampGlowing(true);
        setIsAartiPerforming(true);
        setTimeout(() => {
            setIsLampGlowing(false);
            setIsAartiPerforming(false);
        }, 12000);
    };

    const handlePushpaClick = () => {
        setCounts((prev) => ({ ...prev, pushpa: prev.pushpa + 1 }));

        // Spawn flowers periodically for 5 seconds
        const startTime = Date.now();
        const interval = setInterval(() => {
            if (Date.now() - startTime > 5000) {
                clearInterval(interval);
                return;
            }

            const batch = Array.from({ length: 5 }).map((_, i) => ({
                id: Math.random() + Date.now(),
                x: 10 + Math.random() * 80, // Keep within frame bounds
                delay: Math.random() * 0.5,
                rotate: Math.random() * 360,
                duration: 2 + Math.random() * 2
            }));

            setFlowers((prev) => [...prev, ...batch]);

            // Remove this batch after they've fallen
            setTimeout(() => {
                setFlowers((prev) => prev.filter((f) => !batch.find(b => b.id === f.id)));
            }, 4000);
        }, 200);
    };

    const handleShankhClick = () => {
        setCounts((prev) => ({ ...prev, shankh: prev.shankh + 1 }));
        setConchPlaying(true);

        // Play Shankh Sound
        const audio = new Audio("/sounds/shankh.mp3");
        audio.play().catch(err => console.log("Audio play failed:", err));

        setTimeout(() => setConchPlaying(false), 5000); // Sync with sound duration roughly
    };

    return (
        <div className="min-h-screen bg-[#0f0a05] text-white flex flex-col">
            <Navbar />

            <main className="flex-1 relative flex flex-col items-center pt-8 pb-16 overflow-hidden">
                {/* Background Atmosphere */}
                <div className={`absolute inset-0 bg-gradient-to-b ${selectedDeity.color} opacity-10 pointer-events-none transition-colors duration-1000`} />

                {/* Deity Selection Header */}
                <div className="flex gap-4 mb-8 z-10 overflow-x-auto px-4 max-w-full no-scrollbar">
                    {deities.map((deity) => (
                        <button
                            key={deity.id}
                            onClick={() => setSelectedDeity(deity)}
                            className={`flex items-center gap-2 px-6 py-2 rounded-full border-2 transition-all duration-300 whitespace-nowrap ${selectedDeity.id === deity.id
                                ? "bg-orange-600 border-orange-400 shadow-[0_0_15px_rgba(234,88,12,0.5)]"
                                : "bg-white/5 border-white/20 hover:bg-white/10"
                                }`}
                        >
                            <span className="text-xl">🕉️</span>
                            <span className="font-bold">{deity.name}</span>
                        </button>
                    ))}
                </div>

                {/* Main Aarti Frame Container */}
                <div className="relative w-[95%] max-w-[600px] aspect-[4/5] bg-[#1a0f05] rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-yellow-900/30">

                    {/* Frame Image (First Picture) */}
                    <img
                        src="/images/aarti/frame.png"
                        alt="Sacred Frame"
                        className="absolute inset-0 w-full h-full object-fill z-20 pointer-events-none"
                    />

                    {/* Deity Image Content */}
                    <div className="absolute inset-0 z-10 overflow-hidden">
                        <AnimatePresence mode="wait">
                            <motion.img
                                key={selectedDeity.id}
                                src={selectedDeity.image}
                                alt={selectedDeity.name}
                                className="w-full h-full object-cover"
                                initial={{ opacity: 0, scale: 1.1 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.8 }}
                            />
                        </AnimatePresence>

                        {/* Static/Animating Aarti Image at Bottom Center */}
                        <div className="absolute inset-x-0 bottom-4 flex justify-center z-50 pointer-events-none">
                            <motion.img
                                src="/images/aarti/aarti.png"
                                alt="Aarti"
                                className="w-64 h-auto drop-shadow-[0_0_25px_rgba(255,255,255,0.7)]"
                                animate={isAartiPerforming ? {
                                    x: [0, 120, 180, 120, 0, -120, -180, -120, 0],
                                    y: [0, -60, -180, -300, -360, -300, -180, -60, 0],
                                    rotate: [0, 5, 0, -5, 0],
                                    scale: [1, 1.05, 1.1, 1.05, 1],
                                } : {
                                    x: 0,
                                    y: 0,
                                    rotate: 0,
                                    scale: 1
                                }}
                                transition={isAartiPerforming ? {
                                    duration: 4,
                                    repeat: Infinity,
                                    ease: "linear"
                                } : {
                                    duration: 0.5
                                }}
                            />
                        </div>

                        {/* Falling Flowers Animation */}
                        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
                            <AnimatePresence>
                                {flowers.map((f) => (
                                    <motion.div
                                        key={f.id}
                                        className="absolute top-[-40px]"
                                        style={{ left: `${f.x}%` }}
                                        initial={{ y: -50, opacity: 0, rotate: f.rotate }}
                                        animate={{ y: 900, opacity: [0, 1, 1, 0], rotate: f.rotate + 360 }}
                                        transition={{ duration: f.duration, ease: "linear", delay: f.delay }}
                                    >
                                        <img
                                            src="/images/aarti/flower.png"
                                            alt="flower"
                                            className="w-14 h-14 object-contain"
                                        />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {/* Glowing Aura Effect when Lamp is clicked */}
                        {isLampGlowing && (
                            <motion.div
                                className="absolute inset-0 bg-orange-500/10 mix-blend-color-dodge pointer-events-none"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            />
                        )}
                    </div>

                    {/* Interaction Overlay (Floating Buttons) */}
                    <div className="absolute left-6 bottom-32 flex flex-col gap-6 z-30">
                        {/* Lamp Button */}
                        <button onClick={handleDeepClick} className="group flex flex-col items-center gap-1">
                            <div className="w-16 h-16 rounded-full bg-black/40 backdrop-blur-md border-2 border-orange-400/50 flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 active:scale-95 transition-all">
                                🪔
                            </div>
                            <span className="text-[14px] font-bold bg-black/40 px-2 py-0.5 rounded-full">{(counts.deep / 1000).toFixed(1)}K</span>
                        </button>

                        {/* Flower Button */}
                        <button onClick={handlePushpaClick} className="group flex flex-col items-center gap-1">
                            <div className="w-16 h-16 rounded-full bg-black/40 backdrop-blur-md border-2 border-rose-400/50 flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 active:scale-95 transition-all">
                                🌸
                            </div>
                            <span className="text-[14px] font-bold bg-black/40 px-2 py-0.5 rounded-full">{(counts.pushpa / 1000).toFixed(1)}K</span>
                        </button>

                        {/* Shankh Button */}
                        <button onClick={handleShankhClick} className="group flex flex-col items-center gap-1">
                            <div className="w-16 h-16 rounded-full bg-black/40 backdrop-blur-md border-2 border-blue-400/50 flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 active:scale-95 transition-all">
                                🐚
                            </div>
                            <span className="text-[14px] font-bold bg-black/40 px-2 py-0.5 rounded-full">{(counts.shankh / 1000).toFixed(1)}K</span>
                        </button>
                    </div>



                    {/* Bottom Controls (Front of Frame) */}
                    <div className="absolute inset-x-0 bottom-0 p-6 z-40">
                        {/* Footer Icon Bar */}
                        <div className="w-full flex justify-between items-center">
                            <a href="https://wa.me/919876543210" target="_blank" className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-3xl shadow-lg hover:bg-green-600 transition-colors">
                                <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                            </a>

                            <div className="flex flex-col items-center">
                                <button className="w-12 h-12 rounded-full bg-rose-600 flex items-center justify-center text-xl shadow-lg hover:bg-rose-700 transition-colors">
                                    🎵
                                </button>
                                <span className="text-[10px] font-bold mt-1">Music</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Informational Text */}
                <div className="mt-12 text-center px-6 max-w-2xl">
                    <h2 className="text-2xl font-bold mb-4 text-orange-400">Digital Aarti Seva</h2>
                    <p className="text-gray-400 leading-relaxed">
                        Experience the divine connection through our virtual Aarti. Select your deity, offer flowers,
                        and light the sacred lamp from anywhere in the world. May the divine blessings be with you always.
                    </p>
                </div>
            </main>

            <Footer />

            <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
        </div>
    );
}

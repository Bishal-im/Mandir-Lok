"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getSettings } from "@/lib/actions/admin";
import { useMusicPlayer } from "@/context/MusicContext";
import { Play, Pause } from "lucide-react";

const DEFAULT_DEITIES = [
    { id: "shiva", name: "Shiv ji", image: "/images/aarti/shiva.png", color: "from-blue-500 to-indigo-800" },
    { id: "vishnu", name: "Vishnu ji", image: "/images/aarti/vishnu.png", color: "from-yellow-400 to-orange-600" },
    { id: "ganesha", name: "Ganesh ji", image: "/images/aarti/ganesha.png", color: "from-red-500 to-orange-500" },
    { id: "durga", name: "Durga Maa", image: "/images/aarti/durga.png", color: "from-rose-500 to-red-700" },
];

function formatTime(time: number) {
    if (!time || isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function AartiPage() {
    const [deities, setDeities] = useState(DEFAULT_DEITIES);
    const [selectedDeity, setSelectedDeity] = useState(DEFAULT_DEITIES[0]);
    const [counts, setCounts] = useState({ deep: 0, pushpa: 0, shankh: 0 });
    const [flowers, setFlowers] = useState<any[]>([]);
    const [isLampGlowing, setIsLampGlowing] = useState(false);
    const [conchPlaying, setConchPlaying] = useState(false);
    const [isAartiPerforming, setIsAartiPerforming] = useState(false);

    // Music context
    const { setIsOpen, loadDeity, currentTime, isPlaying, currentSong } = useMusicPlayer();

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

    // Load songs for the selected deity whenever it changes
    useEffect(() => {
        loadDeity(selectedDeity.id, selectedDeity.name);
    }, [selectedDeity.id]);

    const handleDeepClick = () => {
        setIsAartiPerforming(true);
        handlePushpaClick(15000);
        setTimeout(() => setIsAartiPerforming(false), 15000);
        setCounts(prev => ({ ...prev, deep: prev.deep + 1 }));
        setIsLampGlowing(true);
        setTimeout(() => setIsLampGlowing(false), 15000);
    };

    const handlePushpaClick = (customDuration?: number) => {
        const duration = customDuration || 5000;
        setCounts((prev) => ({ ...prev, pushpa: prev.pushpa + 1 }));

        const startTime = Date.now();
        const interval = setInterval(() => {
            if (Date.now() - startTime > duration) {
                clearInterval(interval);
                return;
            }
            const batch = Array.from({ length: 5 }).map((_, i) => ({
                id: Math.random() + Date.now(),
                x: 10 + Math.random() * 80,
                delay: Math.random() * 0.5,
                rotate: Math.random() * 360,
                duration: 2 + Math.random() * 2
            }));
            setFlowers((prev) => [...prev, ...batch]);
            setTimeout(() => {
                setFlowers((prev) => prev.filter((f) => !batch.find(b => b.id === f.id)));
            }, 4000);
        }, 200);
    };

    const handleShankhClick = () => {
        setCounts((prev) => ({ ...prev, shankh: prev.shankh + 1 }));
        setConchPlaying(true);
        const audio = new Audio("/sounds/shankh.mp3");
        audio.play().catch(err => console.log("Audio play failed:", err));
        setTimeout(() => setConchPlaying(false), 5000);
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
                <div className="relative w-[95%] sm:w-[500px] aspect-[3/4] sm:aspect-[4/5] bg-[#1a0f05] rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-yellow-900/30">

                    {/* Frame Image */}
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

                        {/* Aarti Image */}
                        <div className="absolute inset-x-0 bottom-2 sm:bottom-4 flex justify-center z-50 pointer-events-none">
                            <motion.div
                                animate={isAartiPerforming ? { rotate: 360 } : { rotate: 0 }}
                                transition={isAartiPerforming ? { duration: 5, repeat: 2, ease: "linear" } : { duration: 0 }}
                                style={{ originX: "50%", originY: "-80px" }}
                                className="flex justify-center"
                            >
                                <motion.img
                                    src="/images/aarti/aarti.png"
                                    alt="Aarti"
                                    className="w-32 sm:w-44 h-auto drop-shadow-[0_0_20px_rgba(255,255,255,0.6)]"
                                    animate={isAartiPerforming ? { rotate: -360, scale: [1, 1.05, 1] } : { rotate: 0, scale: 1 }}
                                    transition={isAartiPerforming ? { duration: 5, repeat: 2, ease: "linear" } : { duration: 0 }}
                                />
                            </motion.div>
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

                        {/* Glowing Aura Effect */}
                        {isLampGlowing && (
                            <motion.div
                                className="absolute inset-0 bg-orange-500/10 mix-blend-color-dodge pointer-events-none"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            />
                        )}
                    </div>

                    {/* Left Interaction Buttons */}
                    <div className="absolute left-4 sm:left-6 bottom-24 sm:bottom-32 flex flex-col gap-4 sm:gap-6 z-30">
                        <button onClick={handleDeepClick} className="group flex flex-col items-center gap-1">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-black/40 backdrop-blur-md border-2 border-orange-400/50 flex items-center justify-center text-2xl sm:text-3xl shadow-lg group-hover:scale-110 active:scale-95 transition-all">
                                🪔
                            </div>
                        </button>

                        <button onClick={() => handlePushpaClick()} className="group flex flex-col items-center gap-1">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-black/40 backdrop-blur-md border-2 border-rose-400/50 flex items-center justify-center text-2xl sm:text-3xl shadow-lg group-hover:scale-110 active:scale-95 transition-all">
                                🌸
                            </div>
                        </button>

                        <button onClick={handleShankhClick} className="group flex flex-col items-center gap-1">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-black/40 backdrop-blur-md border-2 border-blue-400/50 flex items-center justify-center text-2xl sm:text-3xl shadow-lg group-hover:scale-110 active:scale-95 transition-all">
                                🐚
                            </div>
                        </button>
                    </div>

                    {/* Bottom Controls */}
                    <div className="absolute inset-x-0 bottom-0 p-6 z-40">
                        <div className="w-full flex justify-end items-center">
                            <div className="flex flex-col items-center">
                                <button
                                    onClick={() => setIsOpen(true)}
                                    className={`w-14 h-14 rounded-full flex flex-col items-center justify-center text-white shadow-lg transition-all hover:scale-105 active:scale-95 ${isPlaying ? "bg-orange-500 shadow-orange-500/40" : "bg-rose-600"}`}
                                >
                                    <span className="text-xl leading-none">🎵</span>
                                    {currentTime > 0 && (
                                        <span className="text-[9px] font-bold mt-0.5 leading-none">
                                            {formatTime(currentTime)}
                                        </span>
                                    )}
                                </button>
                                <span className="text-[10px] font-bold mt-1 text-white">
                                    {isPlaying ? "Playing" : "Music"}
                                </span>
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
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
}

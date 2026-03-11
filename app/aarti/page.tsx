"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getSettings } from "@/lib/actions/admin";
import { useMusicPlayer } from "@/context/MusicContext";
import { Play, Pause, Search, User, CircleUser, X, ChevronLeft, ChevronRight } from "lucide-react";

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
    const [isFlowerActive, setIsFlowerActive] = useState(false);
    const [direction, setDirection] = useState(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const shankhAudioRef = useRef<HTMLAudioElement | null>(null);
    const aartiTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const flowerIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const shankhTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const { setIsOpen, loadDeity, currentTime, isPlaying, currentSong, isOpen } = useMusicPlayer();

    const stopAllAartiEffects = () => {
        // Stop Bell/Aarti
        setIsAartiPerforming(false);
        setIsLampGlowing(false);
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        if (aartiTimeoutRef.current) {
            clearTimeout(aartiTimeoutRef.current);
            aartiTimeoutRef.current = null;
        }

        // Stop flowers
        setIsFlowerActive(false);
        if (flowerIntervalRef.current) {
            clearInterval(flowerIntervalRef.current);
            flowerIntervalRef.current = null;
        }
        setFlowers([]);

        // Stop Shankh
        setConchPlaying(false);
        if (shankhAudioRef.current) {
            shankhAudioRef.current.pause();
            shankhAudioRef.current.currentTime = 0;
        }
        if (shankhTimeoutRef.current) {
            clearTimeout(shankhTimeoutRef.current);
            shankhTimeoutRef.current = null;
        }
    };

    // Effect to stop all Aarti sounds when music player is opened
    useEffect(() => {
        if (isOpen) {
            stopAllAartiEffects();
        }
    }, [isOpen]);

    // Effect to stop all Aarti effects when deity is changed
    useEffect(() => {
        stopAllAartiEffects();
        loadDeity(selectedDeity.id, selectedDeity.name);
    }, [selectedDeity.id]);

    const handleNext = () => {
        const currentIndex = deities.findIndex(d => d.id === selectedDeity.id);
        const nextIndex = (currentIndex + 1) % deities.length;
        setDirection(1);
        setSelectedDeity(deities[nextIndex]);
    };

    const handlePrev = () => {
        const currentIndex = deities.findIndex(d => d.id === selectedDeity.id);
        const prevIndex = (currentIndex - 1 + deities.length) % deities.length;
        setDirection(-1);
        setSelectedDeity(deities[prevIndex]);
    };

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

    const handleDeepClick = () => {
        // Clear existing timeout if any
        if (aartiTimeoutRef.current) {
            clearTimeout(aartiTimeoutRef.current);
        }

        setIsAartiPerforming(true);
        handlePushpaClick(15000);

        // Setup sound
        if (!audioRef.current) {
            audioRef.current = new Audio("/sounds/bell.mp3");
            audioRef.current.loop = true;
        }

        // Start playing from beginning if not playing
        audioRef.current.currentTime = 0;
        audioRef.current.volume = isPlaying ? 0.2 : 1.0;
        audioRef.current.play().catch(err => console.log("Audio play failed:", err));

        aartiTimeoutRef.current = setTimeout(() => {
            setIsAartiPerforming(false);
            setIsLampGlowing(false);
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
        }, 15000);

        setCounts(prev => ({ ...prev, deep: prev.deep + 1 }));
        setIsLampGlowing(true);
    };

    const handlePushpaClick = (customDuration?: number) => {
        setIsFlowerActive(true);
        // Clear existing interval if any
        if (flowerIntervalRef.current) {
            clearInterval(flowerIntervalRef.current);
        }

        const duration = customDuration || 5000;
        setCounts((prev) => ({ ...prev, pushpa: prev.pushpa + 1 }));

        const startTime = Date.now();
        const interval = setInterval(() => {
            if (Date.now() - startTime > duration) {
                clearInterval(interval);
                flowerIntervalRef.current = null;
                setIsFlowerActive(false);
                return;
            }
            const batch = Array.from({ length: 8 }).map((_, i) => {
                const isOriginalFlower = Math.random() > 0.4;
                const image = isOriginalFlower ? "/images/aarti/flower.png" : "/images/aarti/rose.png";
                // Original flower gets a larger size range, Rose stays smaller/consistent
                const size = isOriginalFlower 
                    ? 35 + Math.random() * 20  // 35px to 55px
                    : 15 + Math.random() * 15; // 15px to 30px
                
                return {
                    id: Math.random() + Date.now(),
                    x: 10 + Math.random() * 80,
                    delay: Math.random() * 0.5,
                    rotate: Math.random() * 720,
                    duration: 1.5 + Math.random() * 2.5,
                    size,
                    image
                };
            });
            setFlowers((prev) => [...prev, ...batch]);
            setTimeout(() => {
                setFlowers((prev) => prev.filter((f) => !batch.find(b => b.id === f.id)));
            }, 4000);
        }, 150);

        flowerIntervalRef.current = interval;
    };

    const handleShankhClick = () => {
        // Clear previous timeout if it exists
        if (shankhTimeoutRef.current) {
            clearTimeout(shankhTimeoutRef.current);
        }

        setCounts((prev) => ({ ...prev, shankh: prev.shankh + 1 }));
        setConchPlaying(true);

        if (!shankhAudioRef.current) {
            shankhAudioRef.current = new Audio("/sounds/shankh.mp3");
        }

        // Stop and restart to prevent overlap and fix repetition
        shankhAudioRef.current.pause();
        shankhAudioRef.current.currentTime = 0;
        shankhAudioRef.current.volume = isPlaying ? 0.2 : 1.0;
        shankhAudioRef.current.play().catch(err => console.log("Audio play failed:", err));

        // Auto-stop after 5 seconds (one full blast)
        shankhTimeoutRef.current = setTimeout(() => {
            setConchPlaying(false);
            if (shankhAudioRef.current) {
                shankhAudioRef.current.pause();
                shankhAudioRef.current.currentTime = 0;
            }
            shankhTimeoutRef.current = null;
        }, 5000);
    };

    // Keyboard Navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Don't trigger if user is typing in search
            if (isSearchOpen) return;

            if (e.key === "ArrowRight") {
                handleNext();
            } else if (e.key === "ArrowLeft") {
                handlePrev();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isSearchOpen, selectedDeity.id]);

    // Cleanup audio on unmount
    useEffect(() => {
        return () => {
            stopAllAartiEffects();
            if (audioRef.current) audioRef.current = null;
            if (shankhAudioRef.current) shankhAudioRef.current = null;
        };
    }, []);

    return (
        <div className="min-h-screen bg-[#0f0a05] text-white flex flex-col">
            <Navbar />

            <main className="flex-1 relative flex flex-col items-center pb-16 overflow-hidden">
                {/* Background Atmosphere */}
                <div className={`absolute inset-0 bg-gradient-to-b ${selectedDeity.color} opacity-10 pointer-events-none transition-colors duration-1000`} />

                {/* --- New Premium Top Bar (Refined Phase 3 - Ultra Compact) --- */}
                <div className="w-full bg-gradient-to-b from-[#fcd34d] to-[#f4b400] pt-1 pb-4 px-4 relative z-[60] shadow-xl">
                    <div className="max-w-4xl mx-auto flex items-center gap-3">
                        {/* Search Button (Left) */}
                        <div className="flex items-center shrink-0">
                            <button
                                onClick={() => setIsSearchOpen(true)}
                                className="w-9 h-9 rounded-full bg-black/10 flex items-center justify-center text-white hover:bg-black/20 transition-all border border-white/20 shadow-sm"
                            >
                                <Search size={18} />
                            </button>
                        </div>

                        {/* Round Deity Icons Scroll Area (Centered with Fix) */}
                        <div className="flex-1 overflow-x-auto no-scrollbar py-1 px-2 scroll-smooth">
                            <div className="flex gap-4 min-w-max mx-auto px-2">
                                {deities.map((deity) => (
                                    <button
                                        key={deity.id}
                                        onClick={() => {
                                            const newIndex = deities.findIndex(d => d.id === deity.id);
                                            const currentIndex = deities.findIndex(d => d.id === selectedDeity.id);
                                            setDirection(newIndex > currentIndex ? 1 : -1);
                                            setSelectedDeity(deity);
                                        }}
                                        className={`relative shrink-0 w-10 h-10 rounded-full border-2 transition-all duration-500 overflow-hidden shadow-md active:scale-95 ${selectedDeity.id === deity.id
                                            ? "border-white scale-110 z-10 shadow-[0_0_15px_rgba(255,255,255,0.6)]"
                                            : "border-white/40 opacity-80 hover:opacity-100 hover:scale-105"
                                            }`}
                                    >
                                        <img
                                            src={deity.image}
                                            alt={deity.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Search button balance - hidden */}
                        <div className="w-9 h-9 pointer-events-none opacity-0" />
                    </div>

                    {/* Decorative Header Frame Border (Simplified) */}
                    <div className="absolute bottom-0 left-0 right-0 h-4 translate-y-full pointer-events-none z-[61]">
                        <svg className="w-full h-full text-[#f4b400] drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]" viewBox="0 0 1440 16" fill="currentColor" preserveAspectRatio="none">
                            <path d="M0,0 L1440,0 L1440,6 C1440,6 1080,16 720,16 C360,16 0,6 0,6 L0,0 Z" />
                        </svg>
                        {/* Subtle pattern overlay */}
                        <div className="absolute inset-0 top-[-10px] opacity-15 mix-blend-overlay" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #fff 1px, transparent 0)', backgroundSize: '16px 16px' }} />
                    </div>
                </div>

                {/* --- Search Modal Overlay --- */}
                <AnimatePresence>
                    {isSearchOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col p-6 overflow-y-auto"
                        >
                            <div className="max-w-2xl mx-auto w-full">
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-2xl font-bold text-orange-400">Search Deity</h2>
                                    <button
                                        onClick={() => setIsSearchOpen(false)}
                                        className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                                    >
                                        <X size={28} />
                                    </button>
                                </div>

                                <div className="relative mb-10">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                                    <input
                                        type="text"
                                        placeholder="Find your god..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all text-lg"
                                        autoFocus
                                    />
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                                    {deities.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase())).map((deity) => (
                                        <button
                                            key={deity.id}
                                            onClick={() => {
                                                const newIndex = deities.findIndex(d => d.id === deity.id);
                                                const currentIndex = deities.findIndex(d => d.id === selectedDeity.id);
                                                setDirection(newIndex > currentIndex ? 1 : -1);
                                                setSelectedDeity(deity);
                                                setIsSearchOpen(false);
                                                setSearchQuery("");
                                            }}
                                            className="group flex flex-col items-center gap-3 p-4 rounded-3xl hover:bg-white/5 transition-all text-center"
                                        >
                                            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white/20 group-hover:border-orange-500 transition-colors shadow-lg">
                                                <img src={deity.image} alt={deity.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            </div>
                                            <span className="font-bold text-white/80 group-hover:text-white group-hover:text-orange-400 transition-colors">
                                                {deity.name}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="mt-6 w-full flex flex-col items-center">
                    {/* Main Aarti Frame Container */}
                    <div className="relative w-[95%] sm:w-[500px] aspect-[3/4] sm:aspect-[4/5] bg-[#1a0f05] rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-yellow-900/30 group">

                        {/* Frame Image */}
                        <img
                            src="/images/aarti/frame.png"
                            alt="Sacred Frame"
                            className="absolute inset-0 w-full h-full object-fill z-20 pointer-events-none"
                        />

                        {/* Deity Image Content */}
                        <div className="absolute inset-0 z-10 overflow-hidden cursor-grab active:cursor-grabbing">
                            <AnimatePresence mode="popLayout" custom={direction}>
                                <motion.img
                                    key={selectedDeity.id}
                                    src={selectedDeity.image}
                                    alt={selectedDeity.name}
                                    className="w-full h-full object-cover"
                                    custom={direction}
                                    variants={{
                                        enter: (direction: number) => ({
                                            x: direction > 0 ? 500 : -500,
                                            opacity: 0,
                                            scale: 1.1
                                        }),
                                        center: {
                                            zIndex: 1,
                                            x: 0,
                                            opacity: 1,
                                            scale: 1
                                        },
                                        exit: (direction: number) => ({
                                            zIndex: 0,
                                            x: direction < 0 ? 500 : -500,
                                            opacity: 0,
                                            scale: 0.9
                                        })
                                    }}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{
                                        x: { type: "spring", stiffness: 300, damping: 30 },
                                        opacity: { duration: 0.2 },
                                        scale: { duration: 0.4 }
                                    }}
                                    drag="x"
                                    dragConstraints={{ left: 0, right: 0 }}
                                    dragElastic={0.2}
                                    onDragEnd={(e, { offset, velocity }) => {
                                        const swipe = Math.abs(offset.x) > 50 && Math.abs(velocity.x) > 500 || Math.abs(offset.x) > 100;
                                        if (swipe) {
                                            if (offset.x > 0) {
                                                handlePrev();
                                            } else {
                                                handleNext();
                                            }
                                        }
                                    }}
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
                                        src="/images/aarti/aarti-thali.png"
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
                                                src={f.image}
                                                alt="flower"
                                                style={{ width: `${f.size}px`, height: `${f.size}px` }}
                                                className="object-contain drop-shadow-md"
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
                                <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-black/40 backdrop-blur-md border-2 flex items-center justify-center shadow-lg group-hover:scale-110 active:scale-95 transition-all ${isLampGlowing ? "border-orange-400 ring-2 ring-orange-400/50 brightness-125 shadow-[0_0_15px_rgba(251,146,60,0.6)]" : "border-orange-400/50"}`}>
                                    <img src="/images/aarti/diya.png" alt="Diya" className="w-8 h-8 sm:w-11 sm:h-11 object-contain" />
                                </div>
                            </button>

                            <button onClick={() => handlePushpaClick()} className="group flex flex-col items-center gap-1">
                                <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-black/40 backdrop-blur-md border-2 flex items-center justify-center shadow-lg group-hover:scale-110 active:scale-95 transition-all ${isFlowerActive ? "border-rose-400 ring-2 ring-rose-400/50 brightness-125 shadow-[0_0_15px_rgba(244,63,94,0.6)]" : "border-rose-400/50"}`}>
                                    <img src="/images/aarti/flower_icon.png" alt="Flower" className="w-8 h-8 sm:w-11 sm:h-11 object-contain" />
                                </div>
                            </button>

                            <button onClick={handleShankhClick} className="group flex flex-col items-center gap-1">
                                <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-black/40 backdrop-blur-md border-2 flex items-center justify-center shadow-lg group-hover:scale-110 active:scale-95 transition-all ${conchPlaying ? "border-blue-400 ring-2 ring-blue-400/50 brightness-125 shadow-[0_0_15px_rgba(96,165,250,0.6)]" : "border-blue-400/50"}`}>
                                    <img src="/images/aarti/shankh_icon.png" alt="Shankh" className="w-8 h-8 sm:w-11 sm:h-11 object-contain" />
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

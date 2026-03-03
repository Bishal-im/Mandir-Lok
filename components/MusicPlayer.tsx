"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Play,
    Pause,
    SkipBack,
    SkipForward,
    X,
    Volume2,
    Music as MusicIcon,
    ChevronDown,
    Share2,
    AlarmClock,
} from "lucide-react";

interface Song {
    _id: string;
    title: string;
    artist: string;
    audioUrl: string;
    imageUrl: string;
    type: "bhajan" | "aarti" | "chalisa";
    deity: string;
}

interface MusicPlayerProps {
    isOpen: boolean;
    onClose: () => void;
    deityId: string;
    deityName: string;
}

export default function MusicPlayer({ isOpen, onClose, deityId, deityName }: MusicPlayerProps) {
    const [songs, setSongs] = useState<Song[]>([]);
    const [currentSongIndex, setCurrentSongIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [activeTab, setActiveTab] = useState<"All" | "Aarti" | "Chalisa" | "Bhajan">("All");

    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchSongs();
        }
    }, [isOpen, deityId]);

    const fetchSongs = async () => {
        try {
            const res = await fetch(`/api/songs?deity=${deityId}`);
            const data = await res.json();
            setSongs(data);
            if (data.length > 0) {
                setCurrentSongIndex(0);
            }
        } catch (error) {
            console.error("Failed to fetch songs", error);
        }
    };

    const currentSong = songs[currentSongIndex];

    const filteredSongs = activeTab === "All"
        ? songs
        : songs.filter(s => s.type.toLowerCase() === activeTab.toLowerCase());

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play().catch(e => console.error("Play failed", e));
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = Number(e.target.value);
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    const formatTime = (time: number) => {
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const nextSong = () => {
        if (songs.length > 0) {
            const nextIndex = (currentSongIndex + 1) % songs.length;
            setCurrentSongIndex(nextIndex);
            setIsPlaying(true);
        }
    };

    const prevSong = () => {
        if (songs.length > 0) {
            const prevIndex = (currentSongIndex - 1 + songs.length) % songs.length;
            setCurrentSongIndex(prevIndex);
            setIsPlaying(true);
        }
    };

    const selectSong = (id: string) => {
        const index = songs.findIndex(s => s._id === id);
        if (index !== -1) {
            setCurrentSongIndex(index);
            setIsPlaying(true);
        }
    };

    useEffect(() => {
        if (isPlaying && audioRef.current) {
            audioRef.current.play().catch(e => console.error("Auto-play failed", e));
        }
    }, [currentSongIndex]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="fixed inset-0 z-[100] bg-[#1a0f05] flex flex-col md:flex-row shadow-2xl overflow-hidden"
                >
                    {/* Header Controls (Mobile) */}
                    <div className="md:hidden flex justify-between items-center p-6 bg-gradient-to-b from-[#3d2109] to-transparent shrink-0">
                        <button onClick={onClose} className="p-2 bg-white/10 rounded-full text-white/80">
                            <ChevronDown size={24} />
                        </button>
                        <button className="p-2 bg-white/10 rounded-full text-white/80">
                            <Share2 size={20} />
                        </button>
                    </div>

                    {/* Left Column: Now Playing (Desktop & Mobile) */}
                    <div className="flex-1 flex flex-col md:w-1/2 md:max-w-[600px] h-full overflow-y-auto no-scrollbar pb-12 md:pb-0 relative">
                        {/* Desktop Header */}
                        <div className="hidden md:flex justify-between items-center p-8 shrink-0">
                            <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-white/80 transition-colors">
                                <ChevronDown size={28} />
                            </button>
                            <h1 className="text-xl font-display font-bold text-white tracking-widest uppercase opacity-40">Divine Player</h1>
                            <button className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-white/80 transition-colors">
                                <Share2 size={24} />
                            </button>
                        </div>

                        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center space-y-8 md:space-y-12">
                            <motion.div
                                key={currentSong?._id}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="relative w-64 h-64 md:w-[400px] md:h-[400px] rounded-[40px] overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.6)] border-4 border-white/5 group"
                            >
                                {currentSong ? (
                                    <img src={currentSong.imageUrl} alt={currentSong.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                ) : (
                                    <div className="w-full h-full bg-[#3d2109] flex items-center justify-center">
                                        <MusicIcon size={80} className="text-white/10" />
                                    </div>
                                )}
                                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent" />
                            </motion.div>

                            <div className="space-y-2 max-w-full">
                                <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight line-clamp-1">
                                    {currentSong?.title || "Select a Song"}
                                </h2>
                                <p className="text-lg md:text-xl text-orange-400 font-medium tracking-wide uppercase">
                                    {currentSong?.artist || "Divine Music"}
                                </p>
                            </div>

                            {/* Progress Bar */}
                            <div className="w-full max-w-md space-y-3 px-4">
                                <input
                                    type="range"
                                    min="0"
                                    max={duration || 0}
                                    value={currentTime}
                                    onChange={handleSeek}
                                    className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#ff7f0a] hover:accent-[#ffbb70] transition-all"
                                />
                                <div className="flex justify-between text-xs font-bold text-white/40 tracking-widest uppercase">
                                    <span>{formatTime(currentTime)}</span>
                                    <span>{formatTime(duration)}</span>
                                </div>
                            </div>

                            {/* Playback Controls */}
                            <div className="flex items-center justify-center gap-12 w-full pb-8 md:pb-12">
                                <button onClick={prevSong} className="p-4 text-white/50 hover:text-white transition-all hover:scale-110 active:scale-90">
                                    <SkipBack size={36} fill="currentColor" />
                                </button>
                                <button
                                    onClick={togglePlay}
                                    className="w-24 h-24 md:w-28 md:h-28 bg-white text-[#1a0f05] rounded-full flex items-center justify-center shadow-[0_20px_40px_rgba(255,127,10,0.3)] hover:scale-110 active:scale-95 transition-all"
                                >
                                    {isPlaying ? <Pause size={48} fill="currentColor" /> : <Play size={48} fill="currentColor" className="ml-2" />}
                                </button>
                                <button onClick={nextSong} className="p-4 text-white/50 hover:text-white transition-all hover:scale-110 active:scale-90">
                                    <SkipForward size={36} fill="currentColor" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Playlist (Desktop & Mobile) */}
                    <div className="flex-1 bg-white md:rounded-l-[60px] flex flex-col h-full shadow-[-40px_0_80px_rgba(0,0,0,0.3)] overflow-hidden lg:max-w-xl">
                        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto my-6 md:hidden shrink-0" />

                        <div className="p-8 md:p-12 space-y-8 flex flex-col h-full">
                            <div className="space-y-4">
                                <h3 className="text-3xl md:text-4xl font-display font-bold text-gray-900 tracking-tight leading-none">
                                    Divine Music of <span className="text-[#ff7f0a]">{deityName}</span>
                                </h3>
                                <p className="text-gray-500 font-medium">Spiritual songs, Aartis and Bhajans for your soul.</p>
                            </div>

                            {/* Filter Tabs */}
                            <div className="flex gap-3 overflow-x-auto no-scrollbar py-2 shrink-0">
                                {["All", "Aarti", "Chalisa", "Bhajan"].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab as any)}
                                        className={`px-8 py-3 rounded-2xl text-sm font-bold transition-all border-2 whitespace-nowrap ${activeTab === tab
                                            ? "bg-[#ff7f0a] text-white border-[#ff7f0a] shadow-xl shadow-orange-100"
                                            : "bg-gray-50 text-gray-400 border-gray-50 hover:border-gray-200 hover:text-gray-600"
                                            }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>

                            {/* Song List */}
                            <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pb-8">
                                {filteredSongs.length > 0 ? (
                                    filteredSongs.map((song) => (
                                        <button
                                            key={song._id}
                                            onClick={() => selectSong(song._id)}
                                            className={`w-full flex items-center gap-5 group text-left p-3 rounded-[24px] transition-all border-2 ${currentSong?._id === song._id
                                                ? "bg-orange-50/50 border-orange-100"
                                                : "bg-white border-transparent hover:bg-gray-50 hover:border-gray-100"
                                                }`}
                                        >
                                            <div className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-md shrink-0">
                                                <img src={song.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                {currentSong?._id === song._id && isPlaying && (
                                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                        <div className="flex gap-1 items-end h-5">
                                                            <div className="w-1.5 bg-white animate-[music-bar_0.8s_ease-in-out_infinite]" style={{ height: '50%' }} />
                                                            <div className="w-1.5 bg-white animate-[music-bar_0.5s_ease-in-out_infinite]" style={{ height: '100%' }} />
                                                            <div className="w-1.5 bg-white animate-[music-bar_0.7s_ease-in-out_infinite]" style={{ height: '70%' }} />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`font-bold text-lg truncate ${currentSong?._id === song._id ? "text-[#ff7f0a]" : "text-gray-900"}`}>
                                                    {song.title}
                                                </p>
                                                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1 opacity-60">
                                                    {song.artist}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-4 pr-3 shrink-0">
                                                <div className="p-3 bg-gray-50 rounded-xl text-gray-400 group-hover:text-orange-400 transition-colors">
                                                    <AlarmClock size={20} />
                                                </div>
                                            </div>
                                        </button>
                                    ))
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center py-12 text-gray-300">
                                        <MusicIcon size={64} className="mb-4 opacity-10" />
                                        <p className="font-bold text-xl">No songs in this category</p>
                                        <p className="text-sm">Try exploring other categories.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Hidden Audio Element */}
                    <audio
                        ref={audioRef}
                        src={currentSong?.audioUrl}
                        onTimeUpdate={handleTimeUpdate}
                        onLoadedMetadata={handleLoadedMetadata}
                        onEnded={nextSong}
                    />

                    <style jsx>{`
                        @keyframes music-bar {
                            0%, 100% { height: 30%; }
                            50% { height: 100%; }
                        }
                        .no-scrollbar::-webkit-scrollbar { display: none; }
                        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                    `}</style>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

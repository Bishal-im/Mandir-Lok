"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Play, Pause, SkipBack, SkipForward,
    Music as MusicIcon, ChevronDown, Share2,
} from "lucide-react";
import { useMusicPlayer } from "@/context/MusicContext";

function formatTime(time: number) {
    if (!time || isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function MusicPlayer() {
    const {
        isOpen, setIsOpen,
        songs, currentSong,
        isPlaying, currentTime, duration,
        activeTab, setActiveTab,
        deityName,
        togglePlay, nextSong, prevSong, selectSong, seekTo,
    } = useMusicPlayer();

    const filteredSongs = activeTab === "All"
        ? songs
        : songs.filter(s => s.type.toLowerCase() === activeTab.toLowerCase());

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="fixed inset-0 z-[100] bg-[#0a0501] flex flex-col md:flex-row overflow-hidden font-sans"
                >
                    {/* ── Dynamic Blurred Background ── */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentSong?.imageUrl}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.4 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1 }}
                            className="absolute inset-0 z-0"
                        >
                            <img src={currentSong?.imageUrl} alt="" className="w-full h-full object-cover blur-3xl scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-b from-[#0a0501]/80 via-transparent to-[#0a0501]" />
                        </motion.div>
                    </AnimatePresence>

                    {/* ── Header ── */}
                    <div className="absolute top-0 left-0 right-0 z-50 flex justify-between items-center p-6 md:p-8">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl text-white transition-all hover:scale-105 active:scale-95"
                        >
                            <ChevronDown size={28} />
                        </button>
                        <div className="text-center">
                            <h1 className="text-[10px] md:text-xs font-bold text-white/40 tracking-[0.3em] uppercase">Now Playing</h1>
                            <p className="text-xs md:text-sm font-medium text-orange-400 mt-1">{deityName} Divine Player</p>
                        </div>
                        <button className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl text-white transition-all hover:scale-105 active:scale-95">
                            <Share2 size={24} />
                        </button>
                    </div>

                    {/* ── Left Column: Now Playing ── */}
                    <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 text-center space-y-8 md:space-y-12">
                        <motion.div
                            key={currentSong?._id}
                            initial={{ scale: 0.9, opacity: 0, rotateY: 45 }}
                            animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                            transition={{ type: "spring", damping: 20 }}
                            className="relative w-72 h-72 md:w-[450px] md:h-[450px] rounded-[60px] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] border border-white/10 group"
                        >
                            {currentSong ? (
                                <img src={currentSong.imageUrl} alt={currentSong.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                            ) : (
                                <div className="w-full h-full bg-[#1a0f05] flex items-center justify-center">
                                    <MusicIcon size={80} className="text-white/10" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
                        </motion.div>

                        <div className="space-y-3 max-w-full">
                            <motion.h2
                                key={`title-${currentSong?._id}`}
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="text-4xl md:text-6xl font-display font-bold text-white tracking-tight line-clamp-1"
                            >
                                {currentSong?.title || "Select a Song"}
                            </motion.h2>
                            <motion.p
                                key={`artist-${currentSong?._id}`}
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                                className="text-lg md:text-2xl text-orange-400 font-medium tracking-wide"
                            >
                                {currentSong?.artist || "Divine Music"}
                            </motion.p>
                        </div>

                        {/* ── Controls ── */}
                        <div className="w-full max-w-xl space-y-10">
                            <div className="space-y-4 px-4">
                                <div className="relative h-2 w-full bg-white/10 rounded-full overflow-hidden cursor-pointer">
                                    <motion.div
                                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-400 to-rose-500 shadow-[0_0_15px_rgba(251,146,60,0.5)]"
                                        style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                                    />
                                    <input
                                        type="range" min="0" max={duration || 0} value={currentTime}
                                        onChange={e => seekTo(Number(e.target.value))}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                </div>
                                <div className="flex justify-between text-[10px] font-bold text-white/30 tracking-widest uppercase">
                                    <span>{formatTime(currentTime)}</span>
                                    <span>{formatTime(duration)}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-center gap-8 md:gap-14">
                                <button onClick={prevSong} className="p-4 text-white/40 hover:text-white transition-all hover:scale-110 active:scale-95">
                                    <SkipBack size={40} fill="currentColor" />
                                </button>
                                <button onClick={togglePlay} className="relative group w-24 h-24 md:w-32 md:h-32 flex items-center justify-center">
                                    <div className="absolute inset-0 bg-white rounded-full transition-transform duration-500 group-hover:scale-110 shadow-[0_0_50px_rgba(255,255,255,0.2)]" />
                                    <div className="relative z-10 text-[#0a0501]">
                                        {isPlaying ? <Pause size={48} fill="currentColor" /> : <Play size={48} fill="currentColor" className="ml-2" />}
                                    </div>
                                    {isPlaying && (
                                        <motion.div
                                            initial={{ scale: 1, opacity: 0.5 }}
                                            animate={{ scale: 1.5, opacity: 0 }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                            className="absolute inset-0 border-2 border-white rounded-full"
                                        />
                                    )}
                                </button>
                                <button onClick={nextSong} className="p-4 text-white/40 hover:text-white transition-all hover:scale-110 active:scale-95">
                                    <SkipForward size={40} fill="currentColor" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ── Right Column / Playlist ── */}
                    <div className="absolute inset-x-0 bottom-0 top-1/2 md:static md:w-[500px] lg:w-[600px] z-50 bg-[#fffdfa] md:bg-white/95 md:backdrop-blur-2xl md:rounded-l-[80px] flex flex-col shadow-[-50px_0_100px_rgba(0,0,0,0.5)] overflow-hidden">
                        <div className="px-8 md:px-16 pt-8 md:pt-16 pb-8 space-y-8 flex flex-col h-full">
                            <div className="space-y-2">
                                <h3 className="text-3xl md:text-5xl font-display font-bold text-gray-900 tracking-tight leading-none">
                                    Spiritual <span className="text-orange-500">PlayList</span>
                                </h3>
                                <p className="text-gray-500 font-medium text-sm">Experience the divine presence of {deityName}.</p>
                            </div>

                            <div className="flex gap-2 overflow-x-auto no-scrollbar py-2 shrink-0">
                                {(["All", "Aarti", "Chalisa", "Bhajan"] as const).map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-6 py-3 rounded-2xl text-[10px] uppercase tracking-[0.2em] font-bold transition-all border-2 whitespace-nowrap ${activeTab === tab
                                            ? "bg-[#ff7f0a] text-white border-[#ff7f0a] shadow-xl shadow-orange-200/50"
                                            : "bg-gray-50 text-gray-400 border-gray-50 hover:border-gray-200 hover:text-gray-600"
                                            }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>

                            <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pb-12">
                                {filteredSongs.length > 0 ? filteredSongs.map((song) => (
                                    <button
                                        key={song._id}
                                        onClick={() => selectSong(song._id)}
                                        className={`w-full flex items-center gap-5 group text-left p-4 rounded-[28px] transition-all border-2 ${currentSong?._id === song._id
                                            ? "bg-orange-50 border-orange-100/50"
                                            : "bg-white border-transparent hover:bg-gray-50 hover:border-gray-100"
                                            }`}
                                    >
                                        <div className="relative w-16 h-16 rounded-[20px] overflow-hidden shadow-lg shrink-0">
                                            <img src={song.imageUrl} alt="" className="w-full h-full object-cover" />
                                            {currentSong?._id === song._id && (
                                                <div className="absolute inset-0 bg-orange-500/80 flex items-center justify-center">
                                                    {isPlaying ? (
                                                        <div className="flex gap-1 items-end h-5">
                                                            <div className="w-1.5 bg-white rounded-sm" style={{ height: '40%', animation: 'music-bar 0.8s ease-in-out infinite' }} />
                                                            <div className="w-1.5 bg-white rounded-sm" style={{ height: '100%', animation: 'music-bar 0.5s ease-in-out infinite' }} />
                                                            <div className="w-1.5 bg-white rounded-sm" style={{ height: '60%', animation: 'music-bar 0.7s ease-in-out infinite' }} />
                                                        </div>
                                                    ) : (
                                                        <Play size={20} fill="white" className="text-white" />
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`font-bold text-base truncate ${currentSong?._id === song._id ? "text-orange-600" : "text-gray-900"}`}>
                                                {song.title}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest bg-orange-50 px-2 py-0.5 rounded-md">
                                                    {song.type}
                                                </span>
                                                <p className="text-[10px] text-gray-400 font-medium truncate">{song.artist}</p>
                                            </div>
                                        </div>
                                    </button>
                                )) : (
                                    <div className="h-full flex flex-col items-center justify-center py-20 text-gray-300">
                                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                                            <MusicIcon size={40} className="opacity-20" />
                                        </div>
                                        <p className="font-bold text-lg text-gray-400">Empty Sanctuary</p>
                                        <p className="text-sm text-gray-400">Try another category</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <style jsx global>{`
                        @keyframes music-bar {
                            0%, 100% { transform: scaleY(0.3); }
                            50% { transform: scaleY(1); }
                        }
                        .no-scrollbar::-webkit-scrollbar { display: none; }
                        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                    `}</style>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

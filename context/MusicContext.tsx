"use client";

import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";

interface Song {
    _id: string;
    title: string;
    artist: string;
    audioUrl: string;
    imageUrl: string;
    type: "bhajan" | "aarti" | "chalisa";
    deity: string;
}

interface MusicContextType {
    // Player state
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    songs: Song[];
    currentSong: Song | null;
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    activeTab: "All" | "Aarti" | "Chalisa" | "Bhajan";
    setActiveTab: (tab: "All" | "Aarti" | "Chalisa" | "Bhajan") => void;
    deityId: string;
    deityName: string;

    // Actions
    loadDeity: (id: string, name: string) => void;
    togglePlay: () => void;
    nextSong: () => void;
    prevSong: () => void;
    selectSong: (id: string) => void;
    seekTo: (time: number) => void;
}

const MusicContext = createContext<MusicContextType | null>(null);

export function useMusicPlayer() {
    const ctx = useContext(MusicContext);
    if (!ctx) throw new Error("useMusicPlayer must be used inside MusicProvider");
    return ctx;
}

export function MusicProvider({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [songs, setSongs] = useState<Song[]>([]);
    const [currentSongIndex, setCurrentSongIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [activeTab, setActiveTab] = useState<"All" | "Aarti" | "Chalisa" | "Bhajan">("All");
    const [deityId, setDeityId] = useState("");
    const [deityName, setDeityName] = useState("");

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const lastDeityRef = useRef<string>("");

    const pathname = usePathname();
    const isOnAartiPage = pathname?.startsWith("/aarti");

    // Pause when leaving /aarti (don't auto-resume on return)
    useEffect(() => {
        if (!isOnAartiPage && isPlaying) {
            setIsPlaying(false);
        }
    }, [isOnAartiPage]);

    const currentSong = songs[currentSongIndex] ?? null;

    // Load deity songs — only fetch if the deity changed
    const loadDeity = useCallback(async (id: string, name: string) => {
        if (lastDeityRef.current === name) return; // already loaded this deity
        lastDeityRef.current = name;
        setDeityId(id);
        setDeityName(name);
        // Stop current playback and reset progress when switching deity
        setIsPlaying(false);
        setCurrentTime(0);
        setDuration(0);
        try {
            const res = await fetch(`/api/songs?deity=${encodeURIComponent(name)}`);
            const data = await res.json();
            setSongs(data);
            setCurrentSongIndex(0);
        } catch (e) {
            console.error("Failed to fetch songs", e);
        }
    }, []);

    // Sync audio src when the song changes
    useEffect(() => {
        if (!audioRef.current || !currentSong) return;
        const audio = audioRef.current;
        const wasPlaying = isPlaying;
        audio.src = currentSong.audioUrl;
        audio.load();
        if (wasPlaying) {
            audio.play().catch(() => setIsPlaying(false));
        }
    }, [currentSong?._id]);

    // Sync play/pause state
    useEffect(() => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.play().catch(() => setIsPlaying(false));
        } else {
            audioRef.current.pause();
        }
    }, [isPlaying]);

    const togglePlay = useCallback(() => {
        setIsPlaying(prev => !prev);
    }, []);

    const nextSong = useCallback(() => {
        if (songs.length === 0) return;
        setCurrentSongIndex(prev => (prev + 1) % songs.length);
        setIsPlaying(true);
    }, [songs.length]);

    const prevSong = useCallback(() => {
        if (songs.length === 0) return;
        setCurrentSongIndex(prev => (prev - 1 + songs.length) % songs.length);
        setIsPlaying(true);
    }, [songs.length]);

    const selectSong = useCallback((id: string) => {
        const idx = songs.findIndex(s => s._id === id);
        if (idx !== -1) {
            setCurrentSongIndex(idx);
            setIsPlaying(true);
        }
    }, [songs]);

    const seekTo = useCallback((time: number) => {
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
        }
    }, []);

    const handleTimeUpdate = () => {
        if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) setDuration(audioRef.current.duration);
    };

    const handleEnded = () => nextSong();

    return (
        <MusicContext.Provider value={{
            isOpen, setIsOpen,
            songs, currentSong,
            isPlaying,
            currentTime, duration,
            activeTab, setActiveTab,
            deityId, deityName,
            loadDeity, togglePlay,
            nextSong, prevSong, selectSong, seekTo,
        }}>
            {children}
            {/* Persistent hidden audio element — never unmounts */}
            <audio
                ref={audioRef}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleEnded}
            />
        </MusicContext.Provider>
    );
}

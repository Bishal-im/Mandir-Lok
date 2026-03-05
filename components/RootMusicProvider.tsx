"use client";

import { MusicProvider } from "@/context/MusicContext";
import MusicPlayer from "@/components/MusicPlayer";

export default function RootMusicProvider({ children }: { children: React.ReactNode }) {
    return (
        <MusicProvider>
            {children}
            {/* MusicPlayer lives here — never unmounted, persists across navigation */}
            <MusicPlayer />
        </MusicProvider>
    );
}

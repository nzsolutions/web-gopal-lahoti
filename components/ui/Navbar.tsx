"use client";

import { useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

export default function Navbar() {
  const [isMuted, setIsMuted] = useState(true);

  return (
    <header className="fixed top-0 left-0 w-full z-40 py-8 px-8 md:px-16 flex items-center justify-between pointer-events-none">
      {/* Brand Monogram */}
      <a
        href="#"
        className="pointer-events-auto flex flex-col items-start group"
        data-cursor="HOME"
      >
        <span className="font-serif text-xl md:text-2xl tracking-[0.2em] text-[#f5f2eb] group-hover:text-[#c5a880] transition-colors uppercase font-light">
          Gopal Lahoti
        </span>
        <span className="text-[9px] uppercase font-mono tracking-[0.3em] text-neutral-400">
          Spatial Walkthrough
        </span>
      </a>

      {/* Sound Toggle */}
      <div className="pointer-events-auto flex items-center space-x-4">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="p-3 rounded-full border border-white/20 hover:border-[#c5a880] text-neutral-300 hover:text-[#c5a880] transition-all bg-black/30 backdrop-blur-md"
          title={isMuted ? "Unmute Sound" : "Mute Sound"}
          data-cursor="SOUND"
        >
          {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
        </button>
      </div>
    </header>
  );
}

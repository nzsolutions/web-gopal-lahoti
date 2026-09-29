"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Sparkles, Eye, Maximize2, ShieldCheck, Layers, ChevronRight, Play, Pause } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

interface Hotspot {
  id: string;
  x: number; // % from left
  y: number; // % from top
  title: string;
  category: string;
  description: string;
  material: string;
  startProgress: number; // 0.0 - 1.0
  endProgress: number;
}

const hotspots: Hotspot[] = [
  {
    id: "wood-panel",
    x: 28,
    y: 42,
    title: "Acoustic Fluted Oak Paneling",
    category: "Wall Architecture",
    description: "Handcrafted vertical fluting integrated with seamless hidden flush doors and warm backlighting.",
    material: "Natural White Oak • Matte Polyurethane Finish",
    startProgress: 0.12,
    endProgress: 0.38,
  },
  {
    id: "marble-surface",
    x: 65,
    y: 72,
    title: "Calacatta Gold Italian Marble",
    category: "Flooring & Surfaces",
    description: "Book-matched large-format porcelain slabs with bespoke brass border inlay.",
    material: "Imported Italian Marble • High-Gloss Mirror Polish",
    startProgress: 0.35,
    endProgress: 0.65,
  },
  {
    id: "lighting-cove",
    x: 48,
    y: 20,
    title: "Continuous Architectural Cove Luminescence",
    category: "Lighting Design",
    description: "2700K warm diffused recessed channel lighting creating an atmospheric floating ceiling effect.",
    material: "Indirect LED Strips • CRI 98+ Tunable White",
    startProgress: 0.58,
    endProgress: 0.85,
  },
  {
    id: "luxury-suite",
    x: 75,
    y: 50,
    title: "Bespoke Leather & Brass Headboard",
    category: "Custom Furniture",
    description: "Tailored burgundy Italian leather headboard paired with brushed champagne brass trims.",
    material: "Full-Grain Italian Hide • Brushed Champagne Brass",
    startProgress: 0.78,
    endProgress: 0.98,
  },
];

const rooms = [
  {
    id: "master-residence",
    name: "Master Residence Walkthrough",
    video: "/assets/videos/gopal_lahoti_designs_video_5_final.mp4",
    poster: "/assets/images/1.jpg",
    location: "South Mumbai Sky Penthouse",
    sqft: "4,800 SQ. FT.",
  },
  {
    id: "living-lounge",
    name: "Grand Living & Dining Sanctuary",
    video: "/assets/videos/video_6_final.mp4",
    poster: "/assets/images/3.jpg",
    location: "Koregaon Park Estate",
    sqft: "6,200 SQ. FT.",
  },
  {
    id: "corporate-suite",
    name: "Laxmi Corporate Headquarters",
    video: "/assets/videos/video_7_final.mp4",
    poster: "/assets/images/5.jpg",
    location: "BKC Business Hub",
    sqft: "3,500 SQ. FT.",
  },
];

export default function InteriorWalkthrough() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [activeRoomIndex, setActiveRoomIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null);
  const [isPlayingManual, setIsPlayingManual] = useState(false);

  const activeRoom = rooms[activeRoomIndex];

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    // Reset video time on room change
    video.currentTime = 0;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: container,
        start: "top top",
        end: "+=2800", // Length of the scrub scroll
        pin: true,
        scrub: 0.8, // Buttery smooth interpolation
        onUpdate: (self) => {
          setScrollProgress(self.progress);
          if (video.duration) {
            // Smoothly scrub video time based on scroll progress
            const targetTime = self.progress * video.duration;
            if (isFinite(targetTime) && !isNaN(targetTime)) {
              video.currentTime = targetTime;
            }
          }
        },
      });
    }, container);

    return () => ctx.revert();
  }, [activeRoomIndex]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlayingManual) {
      video.pause();
      setIsPlayingManual(false);
    } else {
      video.play();
      setIsPlayingManual(true);
    }
  };

  return (
    <section
      id="walkthrough"
      ref={containerRef}
      className="relative w-full h-screen bg-[#060607] overflow-hidden select-none"
    >
      {/* Background Interactive Video Scrub Canvas */}
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          src={activeRoom.video}
          playsInline
          muted
          preload="auto"
          className="w-full h-full object-cover filter brightness-90 contrast-105"
        />

        {/* Ambient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#080809] via-transparent to-[#080809]/60 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#080809]/80 via-transparent to-[#080809]/80 pointer-events-none" />
        <div className="absolute inset-0 bg-grain pointer-events-none opacity-30" />
      </div>

      {/* Floating 3D Spatial Hotspots */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        {hotspots.map((spot) => {
          const isVisible =
            scrollProgress >= spot.startProgress && scrollProgress <= spot.endProgress;

          return (
            <div
              key={spot.id}
              className={`absolute transition-all duration-700 pointer-events-auto transform -translate-x-1/2 -translate-y-1/2 ${
                isVisible
                  ? "opacity-100 scale-100 translate-y-0"
                  : "opacity-0 scale-75 translate-y-4 pointer-events-none"
              }`}
              style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
            >
              <div className="relative group">
                {/* Pulsing Target Ring */}
                <button
                  onClick={() => setActiveHotspot(activeHotspot?.id === spot.id ? null : spot)}
                  className="relative flex items-center justify-center w-10 h-10 rounded-full bg-[#c5a880]/20 border border-[#c5a880] backdrop-blur-md text-[#f5f2eb] hover:scale-125 transition-transform duration-300 shadow-[0_0_30px_rgba(197,168,128,0.5)]"
                  data-cursor="INSPECT"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-[#c5a880] animate-ping absolute" />
                  <span className="w-2 h-2 rounded-full bg-[#f5f2eb] relative z-10" />
                </button>

                {/* Hotspot Floating Card */}
                <div
                  className={`absolute left-12 top-1/2 -translate-y-1/2 w-64 md:w-80 p-4 rounded-xl glass-panel border border-[#c5a880]/30 shadow-2xl transition-all duration-500 ${
                    activeHotspot?.id === spot.id
                      ? "opacity-100 scale-100 pointer-events-auto"
                      : "opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100"
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] uppercase font-mono text-[#c5a880] mb-1">
                    <span>{spot.category}</span>
                    <Sparkles size={12} />
                  </div>
                  <h4 className="font-serif text-base text-[#f5f2eb] font-semibold mb-1">
                    {spot.title}
                  </h4>
                  <p className="text-xs text-neutral-300 font-sans leading-relaxed mb-2">
                    {spot.description}
                  </p>
                  <div className="pt-2 border-t border-white/10 text-[10px] text-neutral-400 font-sans flex items-center justify-between">
                    <span className="truncate">{spot.material}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Top HUD: Title & Room Selector */}
      <div className="relative z-20 max-w-7xl mx-auto px-6 md:px-12 pt-28 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-[10px] uppercase font-sans tracking-ultraLuxury text-[#c5a880] mb-1">
            <Layers size={13} />
            <span>Interactive Spatial Walkthrough</span>
          </div>
          <h2 className="font-serif text-2xl md:text-4xl text-[#f5f2eb] uppercase tracking-wide">
            {activeRoom.name}
          </h2>
          <p className="text-xs font-mono text-neutral-400 mt-1">
            {activeRoom.location} • {activeRoom.sqft}
          </p>
        </div>

        {/* Room Switcher Pills */}
        <div className="flex items-center space-x-2 glass-panel p-1.5 rounded-full border border-white/10">
          {rooms.map((room, idx) => (
            <button
              key={room.id}
              onClick={() => setActiveRoomIndex(idx)}
              className={`px-4 py-2 rounded-full text-[10px] uppercase tracking-wider font-sans transition-all duration-300 ${
                activeRoomIndex === idx
                  ? "bg-[#c5a880] text-[#080809] font-semibold shadow-lg"
                  : "text-neutral-400 hover:text-white"
              }`}
              data-cursor="SWITCH"
            >
              0{idx + 1} • {room.name.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom HUD: Dynamic Scroll Scrub Progress & Controls */}
      <div className="absolute bottom-8 left-0 right-0 z-20 max-w-7xl mx-auto px-6 md:px-12">
        <div className="glass-panel p-4 md:p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Progress Timeline */}
          <div className="w-full md:w-1/2 space-y-2">
            <div className="flex justify-between text-[10px] uppercase font-mono text-neutral-400">
              <span className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#c5a880]" />
                <span>Scroll-Driven Camera Trajectory</span>
              </span>
              <span>{Math.round(scrollProgress * 100)}% Traversed</span>
            </div>
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#c5a880] to-[#f5f2eb] transition-all duration-75"
                style={{ width: `${Math.max(scrollProgress * 100, 2)}%` }}
              />
            </div>
          </div>

          {/* Interaction Guide */}
          <div className="flex items-center space-x-6 text-[11px] text-neutral-300 font-sans">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-[#c5a880]" />
              <span>Scroll down to fly through room</span>
            </div>
            <div className="hidden sm:flex items-center space-x-2 text-neutral-400">
              <Eye size={14} className="text-[#c5a880]" />
              <span>Click glowing pins for material specs</span>
            </div>
            <button
              onClick={togglePlay}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-[#c5a880] transition-colors"
              title={isPlayingManual ? "Pause" : "Play"}
            >
              {isPlayingManual ? <Pause size={14} /> : <Play size={14} />}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

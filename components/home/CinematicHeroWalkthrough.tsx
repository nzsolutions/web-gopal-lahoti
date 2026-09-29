"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Compass, Eye, ChevronDown, Volume2, VolumeX, ArrowUpRight, Layers } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

interface Hotspot {
  id: string;
  x: number;
  y: number;
  title: string;
  category: string;
  description: string;
  material: string;
  start: number;
  end: number;
}

const chapters = [
  {
    id: "chapter-1",
    num: "01",
    badge: "Gopal Lahoti • Spatial Atelier",
    title: "Sculpting",
    subtitle: "Spatial Poetry",
    description: "Step inside an uncompromised world of bespoke luxury, architectural harmony, and sensory craftsmanship.",
    start: 0.0,
    end: 0.22,
    location: "South Mumbai Sky Penthouse",
  },
  {
    id: "chapter-2",
    num: "02",
    badge: "Volume & Materiality",
    title: "The Grand Living",
    subtitle: "Sanctuary",
    description: "Book-matched Calacatta marble surfaces paired with custom acoustic fluted oak and architectural cove luminescence.",
    start: 0.23,
    end: 0.46,
    location: "Koregaon Park Estate, Pune",
  },
  {
    id: "chapter-3",
    num: "03",
    badge: "Intimate Opulence",
    title: "The Bespoke",
    subtitle: "Master Suite",
    description: "Handcrafted Italian leather headboards, fluted timber millwork, and custom drop pendants tuned to circadian warmth.",
    start: 0.47,
    end: 0.70,
    location: "Worli Sea Face, Mumbai",
  },
  {
    id: "chapter-4",
    num: "04",
    badge: "Sacred & Commercial",
    title: "Contemporary",
    subtitle: "Sanctums",
    description: "Laser-etched Gayatri Mantra Sanskrit art and glazed terracotta corporate reception suites.",
    start: 0.71,
    end: 0.92,
    location: "BKC Corporate HQ & Private Residences",
  },
  {
    id: "chapter-5",
    num: "05",
    badge: "Portfolio Archive",
    title: "Traverse",
    subtitle: "The Atelier",
    description: "Continue below to explore the tactile material archive, turnkey design methodology, and commissioned spaces.",
    start: 0.93,
    end: 1.0,
    location: "All Commissions 2024–2026",
  },
];

const spatialHotspots: Hotspot[] = [
  {
    id: "wood-panel",
    x: 25,
    y: 40,
    title: "Acoustic Fluted Oak Paneling",
    category: "Wall Architecture",
    description: "Precision-milled vertical fluting with hidden flush doors and warm grazing backlighting.",
    material: "Natural White Oak • Matte Polyurethane",
    start: 0.18,
    end: 0.38,
  },
  {
    id: "marble-surface",
    x: 68,
    y: 70,
    title: "Calacatta Gold Italian Marble",
    category: "Flooring & Surfaces",
    description: "Monolithic book-matched large-format porcelain slabs with brass border inlay.",
    material: "Imported Italian Marble • High-Gloss Mirror Polish",
    start: 0.30,
    end: 0.52,
  },
  {
    id: "lighting-cove",
    x: 48,
    y: 20,
    title: "Circadian Cove Luminescence",
    category: "Lighting Design",
    description: "2700K warm diffused recessed lighting channel creating a floating ceiling aura.",
    material: "Indirect LED Strips • CRI 98+ Tunable White",
    start: 0.54,
    end: 0.74,
  },
  {
    id: "luxury-suite",
    x: 75,
    y: 48,
    title: "Tailored Leather & Brass Bedstead",
    category: "Custom Millwork",
    description: "Burgundy Italian leather upholstery paired with brushed champagne brass trims.",
    material: "Full-Grain Italian Hide • Brushed Champagne Brass",
    start: 0.72,
    end: 0.90,
  },
];

export default function CinematicHeroWalkthrough() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null);
  const [mouseTilt, setMouseTilt] = useState({ x: 0, y: 0 });

  // Find active chapter based on scroll progress
  const activeChapter =
    chapters.find((c) => scrollProgress >= c.start && scrollProgress <= c.end) || chapters[0];

  // Mouse Parallax 3D Tilt Effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = (clientX / innerWidth - 0.5) * 8; // -4 to +4 deg
    const y = (clientY / innerHeight - 0.5) * -8; // -4 to +4 deg
    setMouseTilt({ x, y });
  };

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    let animationFrameId: number;
    let targetTime = 0;
    let currentTime = 0;

    // Smooth lerp loop for 60fps video scrub
    const updateVideoTime = () => {
      if (video.duration && isFinite(video.duration)) {
        // Linear interpolation for silky inertia
        currentTime += (targetTime - currentTime) * 0.08;
        if (Math.abs(targetTime - currentTime) > 0.001) {
          video.currentTime = currentTime;
        }
      }
      animationFrameId = requestAnimationFrame(updateVideoTime);
    };
    animationFrameId = requestAnimationFrame(updateVideoTime);

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: container,
        start: "top top",
        end: "+=4500", // Long immersive scroll depth
        pin: true,
        scrub: 0.6,
        onUpdate: (self) => {
          setScrollProgress(self.progress);
          if (video.duration && isFinite(video.duration)) {
            targetTime = self.progress * video.duration;
          }
        },
      });
    }, container);

    return () => {
      cancelAnimationFrame(animationFrameId);
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full h-screen bg-[#050506] overflow-hidden select-none"
    >
      {/* 3D Parallax Video Viewport */}
      <div
        className="absolute inset-0 z-0 transition-transform duration-300 ease-out"
        style={{
          transform: `perspective(1000px) rotateX(${mouseTilt.y}deg) rotateY(${mouseTilt.x}deg) scale(1.04)`,
        }}
      >
        <video
          ref={videoRef}
          src="/assets/videos/combine_video_1_final.mp4"
          playsInline
          muted
          preload="auto"
          className="w-full h-full object-cover filter brightness-90 contrast-110"
        />

        {/* Cinematic Vignette & Ambient Light Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#080809] via-transparent to-[#080809]/70 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#080809]/80 via-transparent to-[#080809]/80 pointer-events-none" />
        <div className="absolute inset-0 bg-grain pointer-events-none opacity-30" />
      </div>

      {/* Floating 3D Spatial Hotspots */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        {spatialHotspots.map((spot) => {
          const isVisible =
            scrollProgress >= spot.start && scrollProgress <= spot.end;

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
                <button
                  onClick={() => setActiveHotspot(activeHotspot?.id === spot.id ? null : spot)}
                  className="relative flex items-center justify-center w-11 h-11 rounded-full bg-[#c5a880]/20 border border-[#c5a880] backdrop-blur-md text-[#f5f2eb] hover:scale-125 transition-transform duration-300 shadow-[0_0_30px_rgba(197,168,128,0.5)]"
                  data-cursor="INSPECT"
                >
                  <span className="w-3 h-3 rounded-full bg-[#c5a880] animate-ping absolute" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#f5f2eb] relative z-10" />
                </button>

                {/* Hotspot Popout Card */}
                <div
                  className={`absolute left-14 top-1/2 -translate-y-1/2 w-64 md:w-80 p-5 rounded-2xl glass-panel border border-[#c5a880]/40 shadow-2xl transition-all duration-500 ${
                    activeHotspot?.id === spot.id
                      ? "opacity-100 scale-100 pointer-events-auto"
                      : "opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100"
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] uppercase font-mono text-[#c5a880] mb-1">
                    <span>{spot.category}</span>
                    <Sparkles size={12} />
                  </div>
                  <h4 className="font-serif text-lg text-[#f5f2eb] font-semibold mb-1">
                    {spot.title}
                  </h4>
                  <p className="text-xs text-neutral-300 font-sans leading-relaxed mb-3">
                    {spot.description}
                  </p>
                  <div className="pt-2 border-t border-white/10 text-[10px] text-neutral-400 font-mono">
                    <span>{spot.material}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Top Meta Bar */}
      <div className="absolute top-24 left-0 right-0 z-20 max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between pointer-events-none">
        <div className="glass-pill px-4 py-2 rounded-full flex items-center space-x-2 text-[10px] uppercase font-mono text-neutral-300 pointer-events-auto">
          <span className="w-2 h-2 rounded-full bg-[#c5a880] animate-pulse" />
          <span>Active Experience: {activeChapter.location}</span>
        </div>

        <div className="hidden sm:flex items-center space-x-6 text-[10px] uppercase font-mono text-neutral-400">
          <span>Chapter {activeChapter.num} / 05</span>
          <span>19.0760° N, 72.8777° E</span>
        </div>
      </div>

      {/* Center Cinematic Editorial Overlay */}
      <div className="relative z-10 h-full max-w-7xl mx-auto px-6 md:px-12 flex flex-col justify-center pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeChapter.id}
            initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -30, filter: "blur(8px)" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-4xl space-y-4"
          >
            <span className="text-xs md:text-sm font-sans uppercase tracking-ultraLuxury text-[#c5a880] block font-semibold">
              {activeChapter.badge}
            </span>

            <h1 className="font-serif text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-light uppercase tracking-tight text-[#f5f2eb] leading-[0.92]">
              <span className="block">{activeChapter.title}</span>
              <span className="block italic font-normal text-gold-gradient">
                {activeChapter.subtitle}
              </span>
            </h1>

            <p className="max-w-xl text-sm md:text-lg text-neutral-300 font-sans font-light leading-relaxed tracking-wide pt-2">
              {activeChapter.description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom HUD: Live Timeline & Interactive Scrub Progress */}
      <div className="absolute bottom-8 left-0 right-0 z-20 max-w-7xl mx-auto px-6 md:px-12">
        <div className="glass-panel p-4 md:p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Timeline Bar */}
          <div className="w-full md:w-1/2 space-y-2">
            <div className="flex justify-between text-[10px] uppercase font-mono text-neutral-400">
              <span className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#c5a880]" />
                <span>Interior Trajectory</span>
              </span>
              <span className="text-[#c5a880] font-semibold">
                {Math.round(scrollProgress * 100)}% Traversed
              </span>
            </div>

            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#c5a880] via-[#f5f2eb] to-[#c5a880] transition-all duration-75"
                style={{ width: `${Math.max(scrollProgress * 100, 3)}%` }}
              />
            </div>
          </div>

          {/* Chapter Quick Jumps & Navigation Prompt */}
          <div className="flex items-center space-x-3 text-xs text-neutral-300 font-sans">
            <div className="hidden sm:flex items-center space-x-2 text-neutral-400 text-[11px] font-mono">
              <ChevronDown size={14} className="text-[#c5a880] animate-bounce" />
              <span>Scroll down to navigate through interior chambers</span>
            </div>

            <a
              href="#philosophy"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full bg-white/5 hover:bg-[#c5a880] hover:text-black text-[10px] font-mono uppercase transition-colors"
              data-cursor="SKIP"
            >
              <span>Skip Walkthrough</span>
              <ArrowUpRight size={12} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

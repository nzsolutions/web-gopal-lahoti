"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Sparkles, Volume2, VolumeX, ChevronRight, X, Compass, Layers } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

interface Hotspot {
  id: string;
  x: number; // Percentage from left
  y: number; // Percentage from top
  title: string;
  category: string;
  description: string;
  material: string;
  start: number; // Progress 0-1
  end: number;
}

interface Chamber {
  id: string;
  num: string;
  title: string;
  subtitle: string;
  location: string;
  sqft: string;
  start: number;
  end: number;
  hotspots: Hotspot[];
}

const chambers: Chamber[] = [
  {
    id: "living",
    num: "01",
    title: "The Grand Living Hall",
    subtitle: "Italian Statuario Marble & Ambient Cove Luminescence",
    location: "Koregaon Park Estate, Pune",
    sqft: "5,400 SQ. FT.",
    start: 0.0,
    end: 0.25,
    hotspots: [
      {
        id: "marble",
        x: 58,
        y: 68,
        title: "Calacatta Gold Italian Marble",
        category: "Flooring",
        description: "Monolithic book-matched large-format porcelain slabs with brass border inlay.",
        material: "Natural Imported Marble • High-Gloss Mirror Polish",
        start: 0.06,
        end: 0.22,
      },
      {
        id: "seating",
        x: 32,
        y: 60,
        title: "Bespoke Italian Leather Seating",
        category: "Custom Seating",
        description: "Ergonomically contoured swivel armchair in saddle tan full-grain leather.",
        material: "Full-Grain Italian Hide • Matte Black Steel Base",
        start: 0.12,
        end: 0.24,
      },
    ],
  },
  {
    id: "suite",
    num: "02",
    title: "The Versace Master Suite",
    subtitle: "Acoustic White Oak Paneling & Tailored Leather",
    location: "Worli Sea Face, Mumbai",
    sqft: "850 SQ. FT.",
    start: 0.25,
    end: 0.5,
    hotspots: [
      {
        id: "oak",
        x: 34,
        y: 42,
        title: "Vertical Fluted White Oak Millwork",
        category: "Wall Architecture",
        description: "Precision-milled vertical acoustic fluting with hidden flush doors and warm backlighting.",
        material: "Solid European White Oak • Matte Polyurethane",
        start: 0.28,
        end: 0.46,
      },
      {
        id: "headboard",
        x: 68,
        y: 52,
        title: "Tailored Burgundy Leather Headboard",
        category: "Custom Furniture",
        description: "Hand-stitched leather panels paired with integrated brushed champagne brass dimmers.",
        material: "Supple Italian Hide • Brushed Champagne Brass",
        start: 0.35,
        end: 0.48,
      },
    ],
  },
  {
    id: "mandir",
    num: "03",
    title: "The Sacred Mandir Sanctum",
    subtitle: "Illuminated Onyx Halo & Sanskrit Verses",
    location: "Amanora Park Town, Pune",
    sqft: "450 SQ. FT.",
    start: 0.5,
    end: 0.75,
    hotspots: [
      {
        id: "halo",
        x: 72,
        y: 44,
        title: "Celestial Deity Halo Arch",
        category: "Sacred Feature",
        description: "Backlit translucent circular halo creating radiant ambient light behind sacred idols.",
        material: "Translucent Acrylic Onyx • Diffused LED",
        start: 0.54,
        end: 0.72,
      },
      {
        id: "mantra",
        x: 24,
        y: 32,
        title: "Gayatri Mantra Sanskrit Etching",
        category: "Wall Typography",
        description: "Sacred Vedic verses carved into limestone plaster alongside traditional Mandala motifs.",
        material: "Hand-Etched Mineral Plaster",
        start: 0.58,
        end: 0.74,
      },
    ],
  },
  {
    id: "corporate",
    num: "04",
    title: "Laxmi Corporate Reception",
    subtitle: "Glazed Herringbone Terracotta & Sculptural Bronze",
    location: "BKC Commercial Hub, Mumbai",
    sqft: "3,800 SQ. FT.",
    start: 0.75,
    end: 1.0,
    hotspots: [
      {
        id: "tiles",
        x: 26,
        y: 45,
        title: "Handmade Herringbone Clay Tiles",
        category: "Feature Wall",
        description: "Individually fired ceramic tiles arranged in chevron herringbone pattern.",
        material: "Glazed Architectural Terracotta",
        start: 0.78,
        end: 0.94,
      },
      {
        id: "desk",
        x: 52,
        y: 64,
        title: "Sculptural Bronze Reception Console",
        category: "Custom Joinery",
        description: "Solid brass & bronze fabricated reception counter with integrated LED toe-kick.",
        material: "Antiqued Bronze PVD • Matte Black Core",
        start: 0.82,
        end: 0.98,
      },
    ],
  },
];

export default function PasquaExperience() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [selectedChamberSpec, setSelectedChamberSpec] = useState<Chamber | null>(null);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const pinnedRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Determine current active chamber
  const activeChamber =
    chambers.find(
      (c) => scrollProgress >= c.start && scrollProgress < c.end
    ) || chambers[chambers.length - 1];

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    const pinned = pinnedRef.current;
    if (!video || !canvas || !wrapper || !pinned) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    let animId: number;
    let targetTime = 0;
    let currentTime = 0;

    // Full-bleed responsive canvas sizing (100% of viewport)
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // 60 FPS Render Loop with Physics Lerp
    const render = () => {
      if (video.duration && isFinite(video.duration)) {
        // Smooth inertia interpolation
        currentTime += (targetTime - currentTime) * 0.08;

        if (Math.abs(targetTime - currentTime) > 0.0005) {
          video.currentTime = currentTime;
        }

        if (ctx && video.readyState >= 2) {
          const cWidth = canvas.width;
          const cHeight = canvas.height;
          const vWidth = video.videoWidth || 1920;
          const vHeight = video.videoHeight || 1080;

          // Object-fit: cover logic
          const hRatio = cWidth / vWidth;
          const vRatio = cHeight / vHeight;
          const ratio = Math.max(hRatio, vRatio);

          const centerShiftX = (cWidth - vWidth * ratio) / 2;
          const centerShiftY = (cHeight - vHeight * ratio) / 2;

          ctx.drawImage(
            video,
            0,
            0,
            vWidth,
            vHeight,
            centerShiftX,
            centerShiftY,
            vWidth * ratio,
            vHeight * ratio
          );
        }
      }
      animId = requestAnimationFrame(render);
    };

    if (video.readyState >= 2) {
      animId = requestAnimationFrame(render);
    } else {
      video.addEventListener("loadeddata", () => {
        animId = requestAnimationFrame(render);
      });
    }

    // GSAP ScrollTrigger Pinned Virtual Scroll Length
    const totalScrollPixels = 5000;

    const gsapCtx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: wrapper,
        start: "top top",
        end: `+=${totalScrollPixels}`,
        pin: pinned,
        pinSpacing: true,
        scrub: 0.5,
        onUpdate: (self) => {
          setScrollProgress(self.progress);
          if (video.duration && isFinite(video.duration)) {
            targetTime = self.progress * video.duration;
          }
        },
      });
    }, wrapper);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animId);
      gsapCtx.revert();
    };
  }, []);

  const jumpToChamber = (startProgress: number) => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const targetScroll = wrapper.offsetTop + startProgress * 5000;
    window.scrollTo({ top: targetScroll, behavior: "smooth" });
  };

  return (
    <div ref={wrapperRef} className="relative w-full bg-[#050506]">
      {/* Hidden Video Source for 60fps Canvas Scrubbing */}
      <video
        ref={videoRef}
        src="/assets/videos/combine_video_1_final.mp4"
        playsInline
        muted
        preload="auto"
        className="hidden"
      />

      <section
        ref={pinnedRef}
        className="relative w-full h-screen bg-[#050506] overflow-hidden select-none"
      >
        {/* Full-Bleed Edge-to-Edge Canvas (100vw, 100vh) */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover z-0 block filter brightness-95 contrast-105"
        />

        {/* Minimal Luxury Edge Vignettes */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/40 pointer-events-none z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent pointer-events-none z-10" />

        {/* Top Minimal Luxury Brand Header */}
        <header className="absolute top-0 left-0 w-full z-30 py-8 px-8 md:px-16 flex items-center justify-between pointer-events-none">
          <div className="flex flex-col items-start pointer-events-auto">
            <span className="font-serif text-xl md:text-2xl tracking-[0.2em] text-[#f5f2eb] uppercase font-light">
              Gopal Lahoti
            </span>
            <span className="text-[9px] uppercase font-mono tracking-[0.3em] text-[#c5a880]">
              Spatial Walkthrough
            </span>
          </div>

          <div className="pointer-events-auto flex items-center space-x-4">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-3 rounded-full border border-white/20 hover:border-[#c5a880] text-neutral-300 hover:text-[#c5a880] transition-all bg-black/40 backdrop-blur-md"
              title={isMuted ? "Unmute Audio" : "Mute Audio"}
            >
              {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>
          </div>
        </header>

        {/* Floating 3D Spatial Hotspots */}
        <div className="absolute inset-0 z-20 pointer-events-none">
          {activeChamber.hotspots.map((spot) => {
            const isVisible =
              scrollProgress >= spot.start && scrollProgress <= spot.end;

            return (
              <div
                key={spot.id}
                className={`absolute transition-all duration-500 pointer-events-auto transform -translate-x-1/2 -translate-y-1/2 ${
                  isVisible
                    ? "opacity-100 scale-100 translate-y-0"
                    : "opacity-0 scale-50 translate-y-4 pointer-events-none"
                }`}
                style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
              >
                <button
                  onClick={() => setActiveHotspot(activeHotspot?.id === spot.id ? null : spot)}
                  className="relative flex items-center justify-center w-9 h-9 rounded-full bg-white/20 hover:bg-[#c5a880] border border-white/60 hover:border-[#c5a880] backdrop-blur-md transition-all shadow-[0_0_25px_rgba(255,255,255,0.4)] group"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-white group-hover:bg-black transition-colors" />
                  <span className="w-full h-full rounded-full border border-white/40 animate-ping absolute" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Hotspot Specification Popout Modal */}
        {activeHotspot && (
          <div className="absolute top-28 right-8 md:right-16 z-30 w-80 p-6 rounded-2xl glass-panel border border-white/20 shadow-2xl backdrop-blur-xl animate-fadeIn">
            <div className="flex justify-between items-center text-[10px] font-mono uppercase text-[#c5a880] mb-2">
              <span>{activeHotspot.category}</span>
              <button
                onClick={() => setActiveHotspot(null)}
                className="p-1 rounded-full hover:bg-white/10 text-white transition-colors"
              >
                <X size={14} />
              </button>
            </div>
            <h4 className="font-serif text-lg text-white font-medium mb-1">
              {activeHotspot.title}
            </h4>
            <p className="text-xs text-neutral-300 font-sans leading-relaxed mb-3">
              {activeHotspot.description}
            </p>
            <div className="text-[10px] text-neutral-400 font-mono pt-2 border-t border-white/10">
              {activeHotspot.material}
            </div>
          </div>
        )}

        {/* Pasqua-Style Minimalist Luxury Bottom-Left Chapter Display */}
        <div className="absolute bottom-16 left-8 md:left-16 z-20 pointer-events-none max-w-xl transition-all duration-700">
          <span className="text-[11px] uppercase tracking-ultraLuxury font-mono text-[#c5a880] block mb-1">
            Chamber {activeChamber.num} / 04 • {activeChamber.location}
          </span>
          <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl text-white uppercase font-light tracking-wide leading-tight">
            {activeChamber.title}
          </h1>
          <p className="text-xs md:text-sm text-neutral-300 font-sans font-light tracking-wider mt-1">
            {activeChamber.subtitle}
          </p>

          <div className="pt-3 pointer-events-auto">
            <button
              onClick={() => setSelectedChamberSpec(activeChamber)}
              className="inline-flex items-center space-x-2 text-[10px] uppercase font-mono tracking-widest text-[#c5a880] hover:text-white transition-colors group"
            >
              <span>Inspect Chamber Specifications</span>
              <ChevronRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Right Scroll Indicator Pulse */}
        <div className="hidden md:flex absolute right-12 top-1/2 -translate-y-1/2 z-20 flex-col items-center space-y-4 text-[9px] font-mono uppercase text-neutral-400 tracking-widest pointer-events-none">
          <span className="rotate-90 origin-center mb-6">Scroll to Traverse</span>
          <div className="w-[1px] h-20 bg-white/20 relative overflow-hidden">
            <div
              className="w-full bg-[#c5a880] transition-all duration-150"
              style={{
                height: "25%",
                transform: `translateY(${scrollProgress * 300}%)`,
              }}
            />
          </div>
        </div>

        {/* Pasqua Bottom Persistent HUD */}
        <div className="absolute bottom-6 left-8 right-8 md:left-16 md:right-16 z-20 flex items-center justify-between text-xs font-mono text-neutral-400 pointer-events-none">
          {/* Chapter Quick Jumps */}
          <div className="flex items-center space-x-6 pointer-events-auto">
            {chambers.map((ch) => {
              const isActive = activeChamber.id === ch.id;
              return (
                <button
                  key={ch.id}
                  onClick={() => jumpToChamber(ch.start)}
                  className={`transition-all duration-300 uppercase tracking-widest text-[10px] font-sans ${
                    isActive
                      ? "text-[#c5a880] font-bold border-b border-[#c5a880] pb-0.5"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  {ch.num} • {ch.title.split(" ")[1] || ch.title.split(" ")[0]}
                </button>
              );
            })}
          </div>

          {/* Tour Progress Meter */}
          <div className="flex items-center space-x-3 w-48 md:w-64">
            <span className="text-[10px]">{Math.round(scrollProgress * 100)}%</span>
            <div className="flex-1 h-[2px] bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#c5a880] transition-all duration-100"
                style={{ width: `${scrollProgress * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Chamber Specification Modal */}
        {selectedChamberSpec && (
          <div
            onClick={() => setSelectedChamberSpec(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-lg w-full p-8 rounded-3xl glass-panel border border-[#c5a880]/40 shadow-2xl space-y-6"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#c5a880] tracking-widest block">
                    Chamber {selectedChamberSpec.num} • {selectedChamberSpec.sqft}
                  </span>
                  <h3 className="font-serif text-2xl text-white">
                    {selectedChamberSpec.title}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedChamberSpec(null)}
                  className="p-2 rounded-full bg-white/10 hover:bg-[#c5a880] hover:text-black text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3 pt-2">
                <span className="text-[10px] font-mono uppercase text-[#c5a880] tracking-wider block">
                  Chamber Overview:
                </span>
                <p className="text-xs md:text-sm text-neutral-300 font-sans leading-relaxed">
                  {selectedChamberSpec.subtitle} at {selectedChamberSpec.location}.
                </p>
              </div>

              <div className="pt-4 border-t border-white/10 space-y-2">
                <span className="text-[10px] font-mono uppercase text-[#c5a880] tracking-wider block">
                  Key Architectural Features:
                </span>
                <ul className="space-y-1.5 text-xs text-neutral-300 font-sans">
                  {selectedChamberSpec.hotspots.map((h) => (
                    <li key={h.id} className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#c5a880]" />
                      <span>{h.title} ({h.material})</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

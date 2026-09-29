"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, X, ChevronRight, Sparkles } from "lucide-react";

interface Chamber {
  id: string;
  chapter: string;
  titleLine1: string;
  titleLine2: string;
  subtitle: string;
  location: string;
  sqft: string;
  video: string;
  startTime: number; // Cut out mobile phone intro graphic
  endTime?: number;
  specs: {
    description: string;
    materials: string[];
    details: string[];
  };
}

const CHAMBERS: Chamber[] = [
  {
    id: "living",
    chapter: "CH. I",
    titleLine1: "GRAND",
    titleLine2: "LIVING",
    subtitle: "Italian Statuario Marble & Double-Height Ambient Lounges",
    location: "Koregaon Park Estate, Pune",
    sqft: "5,400 SQ. FT.",
    video: "/assets/videos/video_6_final.mp4",
    startTime: 4.8, // Skips "Rotate your phone" reel graphic
    specs: {
      description:
        "A double-height living sanctuary defined by book-matched Italian Statuario marble floors, monolithic coffee tables, custom beige modular sofa lounges, and layered sheer drapery.",
      materials: ["Calacatta Gold Marble", "Fluted Oak Millwork", "Italian Full-Grain Leather"],
      details: ["Circadian 2700K Cove Lighting", "Concealed HVAC Diffusers", "Acoustic Wall Panels"],
    },
  },
  {
    id: "suite",
    chapter: "CH. II",
    titleLine1: "VERSACE",
    titleLine2: "SUITE",
    subtitle: "Acoustic Oak Paneling & Tailored Leather Headboard",
    location: "Worli Sea Face, Mumbai",
    sqft: "850 SQ. FT.",
    video: "/assets/videos/gopal_lahoti_designs_video_5_final.mp4",
    startTime: 4.5,
    specs: {
      description:
        "An opulent master chamber clad in acoustic vertical fluted natural oak paneling with hidden flush doors, an upholstered burgundy leather headboard, and designer drop pendant spotlights.",
      materials: ["European White Oak", "Burgundy Italian Leather", "Brushed Champagne Brass"],
      details: ["Integrated Bedside Dimmers", "Sound-Absorbing Backing", "Versace Silk Textiles"],
    },
  },
  {
    id: "mandir",
    chapter: "CH. III",
    titleLine1: "SACRED",
    titleLine2: "SANCTUM",
    subtitle: "Illuminated Onyx Halo & Gayatri Mantra Wall Art",
    location: "Amanora Park Town, Pune",
    sqft: "450 SQ. FT.",
    video: "/assets/videos/video_8_final.mp4",
    startTime: 4.2,
    specs: {
      description:
        "A contemporary spiritual sanctum featuring laser-etched Sanskrit Gayatri Mantra wall typography, a glowing backlit halo deity backdrop, and fluted timber ceilings.",
      materials: ["Translucent Acrylic Onyx", "Etched Limestone Plaster", "Fluted Teakwood Ceiling"],
      details: ["Celestial Ambient Backlighting", "Floating Coral Cabinetry", "Mandala Wall Relief"],
    },
  },
  {
    id: "corporate",
    chapter: "CH. IV",
    titleLine1: "CORPORATE",
    titleLine2: "RECEPTION",
    subtitle: "Glazed Herringbone Terracotta & Sculptural Bronze",
    location: "BKC Commercial Hub, Mumbai",
    sqft: "3,800 SQ. FT.",
    video: "/assets/videos/video_7_final.mp4",
    startTime: 4.5,
    specs: {
      description:
        "A commanding corporate entrance featuring handmade terracotta herringbone tiles, a sculptural bronze reception desk, and fluted glass partitions.",
      materials: ["Handmade Glazed Terracotta", "Patinated Bronze Finish", "Calacatta Porcelain"],
      details: ["Sculptural Reception Counter", "Integrated Toe-Kick Glow", "Fluted Privacy Glass"],
    },
  },
  {
    id: "dining",
    chapter: "CH. V",
    titleLine1: "DINING",
    titleLine2: "ATELIER",
    subtitle: "Smoked Bronze Glass & Dark Walnut Millwork",
    location: "Prabhat Road, Pune",
    sqft: "3,200 SQ. FT.",
    video: "/assets/videos/video_9.mp4",
    startTime: 4.2,
    specs: {
      description:
        "An intimate dining and wine showcase fitted with custom glass vitrines, bespoke walnut millwork, and acoustic ceiling treatments.",
      materials: ["Smoked Bronze Glass", "Smoked Walnut Veneer", "Concealed Channel Lighting"],
      details: ["Internal Warm Grazing LEDs", "Marble Service Counters", "Fine Acoustic Joinery"],
    },
  },
];

export default function PasquaExactEngine() {
  const [state, setState] = useState<"intro" | "hall">("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showSpecs, setShowSpecs] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const audioCtxRef = useRef<AudioContext | null>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const currentChamber = CHAMBERS[currentIndex];
  const nextIndex = (currentIndex + 1) % CHAMBERS.length;
  const previousIndex = (currentIndex - 1 + CHAMBERS.length) % CHAMBERS.length;
  const nextChamber = CHAMBERS[nextIndex];
  const prevChamber = CHAMBERS[previousIndex];

  // Synthesize luxury ambient audio tone & transition whoosh
  const playSound = (type: "drone" | "transition") => {
    if (isMuted) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();

      if (type === "transition") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(160, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(55, ctx.currentTime + 0.8);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.8);
      }
    } catch (e) {
      console.warn("Audio unavailable", e);
    }
  };

  // Set initial video time skipping mobile bumpers
  useEffect(() => {
    videoRefs.current.forEach((vid, idx) => {
      if (vid) {
        const ch = CHAMBERS[idx];
        const seekToStart = () => {
          if (vid.currentTime < ch.startTime) {
            vid.currentTime = ch.startTime;
          }
        };
        vid.addEventListener("loadedmetadata", seekToStart);
        vid.addEventListener("timeupdate", () => {
          if (vid.currentTime < ch.startTime) {
            vid.currentTime = ch.startTime;
          }
          if (ch.endTime && vid.currentTime >= ch.endTime) {
            vid.currentTime = ch.startTime;
          }
        });
      }
    });
  }, []);

  // Navigate to target chamber
  const navigate = (toIndex: number) => {
    if (animating || toIndex === currentIndex) return;
    setAnimating(true);
    setIsTransitioning(true);
    setPrevIndex(currentIndex);
    playSound("transition");

    setTimeout(() => {
      setCurrentIndex(toIndex);
      const nextVid = videoRefs.current[toIndex];
      const ch = CHAMBERS[toIndex];
      if (nextVid) {
        nextVid.currentTime = ch.startTime;
        nextVid.play().catch(() => {});
      }
    }, 450);

    setTimeout(() => {
      setIsTransitioning(false);
      setAnimating(false);
    }, 1100);
  };

  const moveNext = () => navigate(nextIndex);
  const movePrev = () => navigate(previousIndex);

  // Mouse tilt parallax for PC / Laptop
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const x = (e.clientX - window.innerWidth / 2) / window.innerWidth;
    const y = (e.clientY - window.innerHeight / 2) / window.innerHeight;
    setTilt({ x: x * -10, y: y * -8 });
  };

  // Scroll wheel capture for room navigation
  useEffect(() => {
    let lastWheelTime = 0;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const now = Date.now();
      if (now - lastWheelTime < 900) return;

      if (state === "intro") {
        setState("hall");
        lastWheelTime = now;
        return;
      }

      if (Math.abs(e.deltaY) > 20) {
        lastWheelTime = now;
        if (e.deltaY > 0) {
          moveNext();
        } else {
          movePrev();
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        moveNext();
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        movePrev();
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [state, currentIndex, animating]);

  return (
    <div
      onMouseMove={handleMouseMove}
      className="relative w-full h-screen bg-[#060608] text-[#bbbbad] overflow-hidden select-none"
    >
      {/* Pasqua Noise Grain Texture Overlay */}
      <div className="webgl__noise" />

      {/* Top Header Bar for PC / Laptop */}
      <header className="fixed top-0 left-0 w-full z-40 py-6 px-8 md:px-16 flex items-center justify-between pointer-events-none">
        <div
          className="pointer-events-auto flex flex-col items-start cursor-pointer group"
          onClick={() => setState("intro")}
        >
          <span className="font-serif text-xl md:text-2xl tracking-[0.25em] text-[#f5f2eb] group-hover:text-[#c5a880] transition-colors uppercase font-light">
            Gopal Lahoti
          </span>
          <span className="text-[9px] uppercase font-mono tracking-[0.35em] text-[#c5a880]">
            House of Interiors
          </span>
        </div>

        <div className="pointer-events-auto flex items-center space-x-6">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-3 rounded-full border border-white/20 hover:border-[#c5a880] text-neutral-300 hover:text-[#c5a880] transition-all bg-black/40 backdrop-blur-md cursor-pointer"
            title={isMuted ? "Unmute Audio" : "Mute Audio"}
          >
            {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>
        </div>
      </header>

      {/* Full-Screen Edge-to-Edge Widescreen Interior Walkthrough Canvases */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {CHAMBERS.map((ch, idx) => {
          const isActive = currentIndex === idx;
          return (
            <div
              key={ch.id}
              className={`absolute inset-0 transition-all duration-1000 ease-out ${
                isActive
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-105 pointer-events-none"
              }`}
              style={{
                transform: `scale(${isTransitioning && isActive ? 1.06 : 1.01}) translate3d(${tilt.x}px, ${tilt.y}px, 0)`,
                filter: isTransitioning && isActive ? "blur(4px) brightness(1.2)" : "none",
                transition: "transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), filter 0.8s ease, opacity 0.9s ease",
              }}
            >
              <video
                ref={(el) => {
                  videoRefs.current[idx] = el;
                }}
                src={ch.video}
                playsInline
                muted
                autoPlay
                loop
                preload="auto"
                className="w-full h-full object-cover filter contrast-105 brightness-95"
              />
            </div>
          );
        })}

        {/* Ambient Vignettes for PC Screens */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/35 pointer-events-none z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/30 pointer-events-none z-10" />
      </div>

      {/* Interactive Screen Left/Right Doors for Clicking */}
      {state === "hall" && !animating && (
        <div className="absolute inset-0 z-20 flex pointer-events-auto">
          <div
            onClick={movePrev}
            className="w-1/2 h-full cursor-w-resize"
            title="Scroll or Click to Fly into Previous Chamber"
          />
          <div
            onClick={moveNext}
            className="w-1/2 h-full cursor-e-resize"
            title="Scroll or Click to Fly into Next Chamber"
          />
        </div>
      )}

      {/* STATE 1: INTRO (Pasqua "START THE EXPERIENCE" Screen for Desktop) */}
      {state === "intro" && (
        <div className="relative z-30 w-full h-full flex flex-col items-center justify-center text-center p-8 animate-fadeIn pointer-events-auto">
          <div className="mb-4">
            <span className="font-serif text-sm md:text-base tracking-[0.35em] uppercase text-[#c5a880]">
              (GOPAL LAHOTI PRESENTS)
            </span>
          </div>

          <h2 className="font-serif text-6xl sm:text-7xl md:text-8xl lg:text-9xl text-[#f5f2eb] font-light uppercase tracking-tight leading-[0.92] mb-12">
            HOUSE OF THE<br />
            <i className="italic font-normal text-gold-gradient font-serif">UNCONVENTIONAL</i>
          </h2>

          <div>
            <button
              onClick={() => {
                setState("hall");
                playSound("transition");
              }}
              className="room-cta group cursor-pointer"
            >
              <span className="font-mono text-xs tracking-[0.3em] font-semibold text-[#f5f2eb] group-hover:text-black">
                START THE EXPERIENCE
              </span>
            </button>
          </div>

          <span className="absolute bottom-10 font-mono text-[10px] tracking-[0.3em] text-neutral-500 uppercase">
            Scroll mouse wheel down to traverse chambers
          </span>
        </div>
      )}

      {/* STATE 2: HALL (Active Chamber View for PC & Laptop) */}
      {state === "hall" && (
        <div className="relative z-30 w-full h-full flex flex-col justify-between p-8 md:p-14 lg:p-16 pointer-events-none">
          {/* Top Eyebrow */}
          <div className="mt-16 md:mt-20">
            <div className="split-line">
              <span className="split-line-inner font-mono text-[10px] md:text-xs uppercase tracking-[0.35em] text-[#c5a880]">
                ({currentChamber.chapter}) {currentChamber.location}
              </span>
            </div>
          </div>

          {/* Left-Aligned Monumental Editorial Typography (Proportioned for PC/Desktop) */}
          <div className="my-auto max-w-2xl lg:max-w-3xl space-y-3 md:space-y-4">
            <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-[#f5f2eb] font-light uppercase tracking-tight leading-[0.92]">
              <span className="split-line">
                <span className="split-line-inner block">{currentChamber.titleLine1}</span>
              </span>
              <span className="split-line">
                <span className="split-line-inner block italic font-normal text-gold-gradient">
                  {currentChamber.titleLine2}
                </span>
              </span>
            </h1>

            <div className="split-line pt-2">
              <p className="split-line-inner max-w-lg text-xs md:text-sm text-neutral-300 font-sans font-light tracking-wider leading-relaxed">
                {currentChamber.subtitle}
              </p>
            </div>

            <div className="pt-4 pointer-events-auto">
              <button
                onClick={() => setShowSpecs(true)}
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full border border-white/20 hover:border-[#c5a880] text-[10px] uppercase font-mono tracking-widest text-[#c5a880] hover:text-white transition-all bg-black/40 backdrop-blur-md cursor-pointer"
              >
                <span>Explore Chamber Details</span>
                <ChevronRight size={13} />
              </button>
            </div>
          </div>

          {/* Bottom Desktop Navigation Bar */}
          <div className="w-full flex items-center justify-between border-t border-white/10 pt-6">
            {/* Previous Chamber Arrow & Label */}
            <button
              onClick={movePrev}
              className="pointer-events-auto group flex items-center space-x-4 text-left cursor-pointer transition-opacity duration-300 hover:opacity-100 opacity-70"
            >
              <div className="w-10 h-10 rounded-full border border-white/20 group-hover:border-[#c5a880] flex items-center justify-center text-white group-hover:text-[#c5a880] transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </div>

              <div className="flex flex-col">
                <span className="text-[10px] font-mono uppercase text-[#c5a880] tracking-widest">
                  ({prevChamber.chapter})
                </span>
                <span className="font-serif text-sm md:text-base text-[#f5f2eb] tracking-wider uppercase">
                  {prevChamber.titleLine1} {prevChamber.titleLine2}
                </span>
              </div>
            </button>

            {/* Center Scroll Hint & Room Dots for PC */}
            <div className="hidden lg:flex flex-col items-center text-center space-y-1.5">
              <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-neutral-400">
                Scroll to Shift Chambers
              </span>
              <div className="flex items-center space-x-2">
                {CHAMBERS.map((ch, idx) => (
                  <button
                    key={ch.id}
                    onClick={() => navigate(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 pointer-events-auto cursor-pointer ${
                      currentIndex === idx ? "w-8 bg-[#c5a880]" : "w-2 bg-white/20 hover:bg-white/40"
                    }`}
                    title={ch.titleLine1}
                  />
                ))}
              </div>
            </div>

            {/* Next Chamber Arrow & Label */}
            <button
              onClick={moveNext}
              className="pointer-events-auto group flex items-center space-x-4 text-right cursor-pointer transition-opacity duration-300 hover:opacity-100 opacity-70"
            >
              <div className="flex flex-col">
                <span className="text-[10px] font-mono uppercase text-[#c5a880] tracking-widest">
                  ({nextChamber.chapter})
                </span>
                <span className="font-serif text-sm md:text-base text-[#f5f2eb] tracking-wider uppercase">
                  {nextChamber.titleLine1} {nextChamber.titleLine2}
                </span>
              </div>

              <div className="w-10 h-10 rounded-full border border-white/20 group-hover:border-[#c5a880] flex items-center justify-center text-white group-hover:text-[#c5a880] transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Chamber Specification Modal */}
      {showSpecs && (
        <div
          onClick={() => setShowSpecs(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/85 backdrop-blur-xl"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-lg w-full p-8 md:p-10 rounded-3xl bg-[#101012] border border-[#c5a880]/40 shadow-2xl space-y-6 animate-fadeIn"
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#c5a880] tracking-widest block">
                  Chamber {currentChamber.chapter} • {currentChamber.sqft}
                </span>
                <h3 className="font-serif text-3xl text-white uppercase">
                  {currentChamber.titleLine1} {currentChamber.titleLine2}
                </h3>
              </div>
              <button
                onClick={() => setShowSpecs(false)}
                className="p-2.5 rounded-full bg-white/10 hover:bg-[#c5a880] hover:text-black text-white transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs md:text-sm text-neutral-300 font-sans leading-relaxed">
              {currentChamber.specs.description}
            </p>

            <div className="pt-4 border-t border-white/10 space-y-2">
              <span className="text-[10px] font-mono uppercase text-[#c5a880] tracking-wider block">
                Primary Materials:
              </span>
              <ul className="space-y-1.5 text-xs text-neutral-300 font-sans">
                {currentChamber.specs.materials.map((m) => (
                  <li key={m} className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#c5a880]" />
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-white/10 space-y-2">
              <span className="text-[10px] font-mono uppercase text-[#c5a880] tracking-wider block">
                Architectural Highlights:
              </span>
              <ul className="space-y-1.5 text-xs text-neutral-300 font-sans">
                {currentChamber.specs.details.map((d) => (
                  <li key={d} className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#c5a880]" />
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

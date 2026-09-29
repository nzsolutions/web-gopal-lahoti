"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Sparkles, Eye, X, Volume2, VolumeX, ArrowDown, ChevronRight } from "lucide-react";

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

interface Chapter {
  id: string;
  num: string;
  title: string;
  subtitle: string;
  location: string;
  startProgress: number;
  endProgress: number;
  hotspots: Hotspot[];
}

const chapters: Chapter[] = [
  {
    id: "entrance-living",
    num: "01",
    title: "The Grand Living Hall",
    subtitle: "Italian Statuario Marble & Ambient Cove Luminescence",
    location: "Koregaon Park Estate, Pune",
    startProgress: 0.0,
    endProgress: 0.25,
    hotspots: [
      {
        id: "marble",
        x: 62,
        y: 70,
        title: "Calacatta Gold Italian Marble",
        category: "Flooring",
        description: "Monolithic mirror-polished bookmatched slabs with brass border inlay.",
        material: "Natural Italian Marble",
        start: 0.08,
        end: 0.22,
      },
    ],
  },
  {
    id: "master-suite",
    num: "02",
    title: "The Versace Master Suite",
    subtitle: "Acoustic White Oak & Tailored Leather",
    location: "Worli Sea Face, Mumbai",
    startProgress: 0.25,
    endProgress: 0.5,
    hotspots: [
      {
        id: "oak",
        x: 35,
        y: 42,
        title: "Acoustic Fluted Oak Wall",
        category: "Millwork",
        description: "Precision-milled vertical fluting with concealed flush doors.",
        material: "European White Oak",
        start: 0.32,
        end: 0.46,
      },
    ],
  },
  {
    id: "sacred-sanctum",
    num: "03",
    title: "The Sacred Mandir Sanctum",
    subtitle: "Illuminated Onyx Halo & Sanskrit Verses",
    location: "Amanora, Pune",
    startProgress: 0.5,
    endProgress: 0.75,
    hotspots: [
      {
        id: "halo",
        x: 72,
        y: 45,
        title: "Celestial Deity Halo",
        category: "Sacred Feature",
        description: "Backlit translucent circular halo creating radiant ambient light.",
        material: "Translucent Onyx Acrylic",
        start: 0.58,
        end: 0.72,
      },
    ],
  },
  {
    id: "corporate-hq",
    num: "04",
    title: "Laxmi Corporate Reception",
    subtitle: "Glazed Herringbone & Sculptural Bronze",
    location: "BKC Commercial Hub, Mumbai",
    startProgress: 0.75,
    endProgress: 1.0,
    hotspots: [
      {
        id: "desk",
        x: 52,
        y: 65,
        title: "Patinated Bronze Console",
        category: "Custom Millwork",
        description: "Sculptural bronze reception counter with integrated warm toe-kick.",
        material: "Patinated Bronze",
        start: 0.82,
        end: 0.96,
      },
    ],
  },
];

export default function MultiRoomWalkthrough() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const pinnedRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Active chapter based on scroll
  const activeChapter =
    chapters.find(
      (c) => scrollProgress >= c.startProgress && scrollProgress < c.endProgress
    ) || chapters[chapters.length - 1];

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    const pinned = pinnedRef.current;
    if (!video || !canvas || !wrapper || !pinned) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    let animationFrameId: number;
    let targetTime = 0;
    let currentTime = 0;

    // Resize canvas to match screen
    const resizeCanvas = () => {
      canvas.width = window.innerWidth * window.devicePixelRatio;
      canvas.height = window.innerHeight * window.devicePixelRatio;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Continuous 60fps render loop with physics lerp
    const render = () => {
      if (video.duration && isFinite(video.duration)) {
        // Smooth lerp damping for buttery inertia
        currentTime += (targetTime - currentTime) * 0.08;

        if (Math.abs(targetTime - currentTime) > 0.0001) {
          video.currentTime = currentTime;
        }

        if (ctx && video.readyState >= 2) {
          // Draw video scaled to cover full screen
          const cWidth = canvas.width;
          const cHeight = canvas.height;
          const vWidth = video.videoWidth || 1920;
          const vHeight = video.videoHeight || 1080;

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
      animationFrameId = requestAnimationFrame(render);
    };

    video.addEventListener("loadeddata", () => {
      setIsVideoLoaded(true);
      animationFrameId = requestAnimationFrame(render);
    });

    // If already loaded
    if (video.readyState >= 2) {
      setIsVideoLoaded(true);
      animationFrameId = requestAnimationFrame(render);
    }

    // GSAP ScrollTrigger pinning across generous scroll length
    const totalScroll = 6000;

    const gsapCtx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: wrapper,
        start: "top top",
        end: `+=${totalScroll}`,
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
      cancelAnimationFrame(animationFrameId);
      gsapCtx.revert();
    };
  }, []);

  const jumpToChapter = (start: number) => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const targetScroll = wrapper.offsetTop + start * 6000;
    window.scrollTo({ top: targetScroll, behavior: "smooth" });
  };

  return (
    <div ref={wrapperRef} className="relative w-full bg-[#050506]">
      {/* Hidden Video Source for Canvas Scrubbing */}
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
        {/* Full-Screen 60FPS Hardware-Accelerated Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover z-0 filter brightness-95 contrast-105"
        />

        {/* Minimal Luxury Edge Vignettes */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent pointer-events-none z-10" />

        {/* Floating 3D Spatial Hotspots */}
        <div className="absolute inset-0 z-20 pointer-events-none">
          {activeChapter.hotspots.map((spot) => {
            const isVisible =
              scrollProgress >= spot.start && scrollProgress <= spot.end;

            return (
              <div
                key={spot.id}
                className={`absolute transition-all duration-500 pointer-events-auto transform -translate-x-1/2 -translate-y-1/2 ${
                  isVisible ? "opacity-100 scale-100" : "opacity-0 scale-50 pointer-events-none"
                }`}
                style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
              >
                <button
                  onClick={() => setActiveHotspot(activeHotspot?.id === spot.id ? null : spot)}
                  className="relative flex items-center justify-center w-8 h-8 rounded-full bg-white/20 hover:bg-[#c5a880] border border-white/60 hover:border-[#c5a880] backdrop-blur-md transition-all shadow-lg group"
                >
                  <span className="w-2 h-2 rounded-full bg-white group-hover:bg-black" />
                  <span className="w-full h-full rounded-full border border-white/40 animate-ping absolute" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Hotspot Popout Modal */}
        {activeHotspot && (
          <div className="absolute top-28 right-8 z-30 w-80 p-5 rounded-2xl glass-panel border border-white/20 shadow-2xl backdrop-blur-xl animate-fadeIn">
            <div className="flex justify-between items-center text-[10px] font-mono uppercase text-[#c5a880] mb-1">
              <span>{activeHotspot.category}</span>
              <button
                onClick={() => setActiveHotspot(null)}
                className="p-1 rounded-full hover:bg-white/10 text-white"
              >
                <X size={14} />
              </button>
            </div>
            <h4 className="font-serif text-lg text-white font-medium mb-1">
              {activeHotspot.title}
            </h4>
            <p className="text-xs text-neutral-300 font-sans leading-relaxed mb-2">
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
            Chamber {activeChapter.num} / 04 • {activeChapter.location}
          </span>
          <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl text-white uppercase font-light tracking-wide leading-tight">
            {activeChapter.title}
          </h1>
          <p className="text-xs md:text-sm text-neutral-300 font-sans font-light tracking-wider mt-1">
            {activeChapter.subtitle}
          </p>
        </div>

        {/* Right Scroll Indicator Pulse */}
        <div className="hidden md:flex absolute right-12 top-1/2 -translate-y-1/2 z-20 flex-col items-center space-y-4 text-[9px] font-mono uppercase text-neutral-400 tracking-widest pointer-events-none">
          <span className="rotate-90 origin-center mb-6">Scroll to Traverse</span>
          <div className="w-[1px] h-16 bg-white/20 relative overflow-hidden">
            <div
              className="w-full bg-[#c5a880] transition-all duration-150"
              style={{
                height: "30%",
                transform: `translateY(${scrollProgress * 200}%)`,
              }}
            />
          </div>
        </div>

        {/* Pasqua Bottom Timeline & Room Jumps */}
        <div className="absolute bottom-6 left-8 right-8 md:left-16 md:right-16 z-20 flex items-center justify-between text-xs font-mono text-neutral-400 pointer-events-none">
          {/* Chapter Quick Jumps */}
          <div className="flex items-center space-x-6 pointer-events-auto">
            {chapters.map((ch) => {
              const isActive = activeChapter.id === ch.id;
              return (
                <button
                  key={ch.id}
                  onClick={() => jumpToChapter(ch.startProgress)}
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
      </section>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { Sparkles, Volume2, VolumeX, ArrowDown, ChevronRight, X } from "lucide-react";

interface ChamberMeta {
  id: string;
  num: string;
  title: string;
  subtitle: string;
  location: string;
  progress: number;
  range: [number, number];
  texture: string;
  specs: {
    materials: string[];
    description: string;
    area: string;
  };
}

const CHAMBERS: ChamberMeta[] = [
  {
    id: "grand-living",
    num: "01",
    title: "The Grand Living Hall",
    subtitle: "Italian Statuario Marble & Ambient Cove Luminescence",
    location: "Koregaon Park Estate, Pune",
    progress: 0.08,
    range: [0.0, 0.22],
    texture: "/assets/images/18.jpg",
    specs: {
      materials: ["Calacatta Gold Marble", "Fluted Oak Paneling", "Italian Saddle Leather"],
      description: "A double-height living sanctuary with book-matched Italian marble floors, monolithic coffee tables, and layered acoustic sheer drapery.",
      area: "5,400 SQ. FT.",
    },
  },
  {
    id: "versace-suite",
    num: "02",
    title: "The Versace Master Suite",
    subtitle: "Acoustic White Oak & Tailored Leather Headboard",
    location: "Worli Sea Face, Mumbai",
    progress: 0.32,
    range: [0.22, 0.48],
    texture: "/assets/images/1.jpg",
    specs: {
      materials: ["Solid European White Oak", "Burgundy Italian Leather", "Brushed Champagne Brass"],
      description: "A master sanctuary clad in acoustic vertical fluted timber with hidden flush doors, drop pendant spotlights, and Versace textiles.",
      area: "850 SQ. FT.",
    },
  },
  {
    id: "sacred-sanctum",
    num: "03",
    title: "The Sacred Mandir Sanctum",
    subtitle: "Illuminated Onyx Halo & Sanskrit Verses",
    location: "Amanora Park Town, Pune",
    progress: 0.58,
    range: [0.48, 0.74],
    texture: "/assets/images/6.jpg",
    specs: {
      materials: ["Translucent Onyx Acrylic", "Sanskrit Wall Engraving", "Fluted Teak Ceiling"],
      description: "A spiritual sanctuary featuring laser-etched Gayatri Mantra verses on limestone plaster and an illuminated celestial deity backdrop.",
      area: "450 SQ. FT.",
    },
  },
  {
    id: "corporate-hq",
    num: "04",
    title: "Laxmi Corporate Reception",
    subtitle: "Glazed Herringbone Terracotta & Sculptural Bronze",
    location: "BKC Commercial Hub, Mumbai",
    progress: 0.82,
    range: [0.74, 0.92],
    texture: "/assets/images/5.jpg",
    specs: {
      materials: ["Handmade Glazed Terracotta", "Patinated Bronze Finish", "Calacatta Porcelain"],
      description: "A commanding corporate entrance with handmade chevron clay tiles, a sculptural bronze reception desk, and fluted glass partitions.",
      area: "3,800 SQ. FT.",
    },
  },
  {
    id: "dining-gallery",
    num: "05",
    title: "The Dining & Vitrine Gallery",
    subtitle: "Smoked Bronze Glass & Dark Walnut Millwork",
    location: "Prabhat Road, Pune",
    progress: 0.98,
    range: [0.92, 1.0],
    texture: "/assets/images/2.jpg",
    specs: {
      materials: ["Smoked Bronze Glass", "Smoked Walnut Veneer", "Concealed Warm LEDs"],
      description: "An intimate dining and wine showcase fitted with custom glass vitrines, bespoke walnut millwork, and acoustic ceiling treatments.",
      area: "3,200 SQ. FT.",
    },
  },
];

export default function ThreeChamberWalkthrough() {
  const [loadProgress, setLoadProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [activeChamberIndex, setActiveChamberIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [selectedSpecChamber, setSelectedSpecChamber] = useState<ChamberMeta | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const targetProgressRef = useRef(0);
  const proxyProgressRef = useRef({ progress: 0 });
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const activeChamber =
    CHAMBERS.find(
      (c) => currentProgress >= c.range[0] && currentProgress <= c.range[1]
    ) || CHAMBERS[0];

  useEffect(() => {
    setActiveChamberIndex(CHAMBERS.indexOf(activeChamber));
  }, [activeChamber]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070709);

    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      500
    );

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: "high-performance",
      alpha: false,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;

    // 2. Chamber Spatial Placement along Z-Axis
    const chamberDistance = 25; // 25 units per chamber
    const chamberZCoords = [0, -25, -50, -75, -100];

    const manager = new THREE.LoadingManager(
      () => {
        setIsLoaded(true);
      },
      (item, loaded, total) => {
        setLoadProgress(Math.round((loaded / total) * 100));
      }
    );

    const textureLoader = new THREE.TextureLoader(manager);

    CHAMBERS.forEach((ch, idx) => {
      const zPos = chamberZCoords[idx];
      const texture = textureLoader.load(ch.texture);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.generateMipmaps = true;

      const group = new THREE.Group();
      group.position.set(0, 0, zPos);

      // Large Scale High-Res Feature Plane (16:10 ratio)
      const width = 16;
      const height = 10;
      const planeGeo = new THREE.PlaneGeometry(width, height);
      const planeMat = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(planeGeo, planeMat);
      mesh.position.set(0, 0, 0);
      group.add(mesh);

      // Architectural Surround Frame
      const frameGeo = new THREE.BoxGeometry(width + 0.4, height + 0.4, 0.2);
      const frameMat = new THREE.MeshBasicMaterial({
        color: 0x111114,
      });
      const frame = new THREE.Mesh(frameGeo, frameMat);
      frame.position.set(0, 0, -0.15);
      group.add(frame);

      scene.add(group);
    });

    // 3. Single Smooth Camera Spline Path through all Chambers
    const cameraKeypoints: THREE.Vector3[] = [];
    const lookAtKeypoints: THREE.Vector3[] = [];

    CHAMBERS.forEach((_, idx) => {
      const z = chamberZCoords[idx];
      // Entry point (wide view)
      cameraKeypoints.push(new THREE.Vector3(0, 0, z + 7.5));
      lookAtKeypoints.push(new THREE.Vector3(0, 0, z));

      // Settle focal point (close immersive view)
      cameraKeypoints.push(new THREE.Vector3(0, 0, z + 3.2));
      lookAtKeypoints.push(new THREE.Vector3(0, 0, z));
    });

    const cameraSpline = new THREE.CatmullRomCurve3(cameraKeypoints, false, "centripetal");
    const lookAtSpline = new THREE.CatmullRomCurve3(lookAtKeypoints, false, "centripetal");

    // Mouse Parallax for subtle 3D depth
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 0.3;
      mouseY = (e.clientY / window.innerHeight - 0.5) * -0.2;
    };
    window.addEventListener("mousemove", handleMouseMove);

    // 4. Scroll Capture & GSAP Proxy Engine (Pasqua Style)
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      const scrollSensitivity = 0.0006;
      targetProgressRef.current = Math.max(
        0,
        Math.min(1, targetProgressRef.current + e.deltaY * scrollSensitivity)
      );

      gsap.to(proxyProgressRef.current, {
        progress: targetProgressRef.current,
        duration: 1.2,
        ease: "power2.out",
        overwrite: "auto",
        onUpdate: () => {
          setCurrentProgress(proxyProgressRef.current.progress);
        },
      });

      // Chamber boundary snap on scroll stop
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        const cur = targetProgressRef.current;
        for (const ch of CHAMBERS) {
          if (Math.abs(cur - ch.progress) < 0.12) {
            targetProgressRef.current = ch.progress;
            gsap.to(proxyProgressRef.current, {
              progress: ch.progress,
              duration: 1.0,
              ease: "power2.out",
              overwrite: "auto",
              onUpdate: () => {
                setCurrentProgress(proxyProgressRef.current.progress);
              },
            });
            break;
          }
        }
      }, 350);
    };

    // Touch Support
    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const deltaY = (touchStartY - e.touches[0].clientY) * 1.8;
      touchStartY = e.touches[0].clientY;

      targetProgressRef.current = Math.max(
        0,
        Math.min(1, targetProgressRef.current + deltaY * 0.0008)
      );

      gsap.to(proxyProgressRef.current, {
        progress: targetProgressRef.current,
        duration: 1.0,
        ease: "power2.out",
        overwrite: "auto",
        onUpdate: () => {
          setCurrentProgress(proxyProgressRef.current.progress);
        },
      });
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("wheel", handleWheel, { passive: false });
      container.addEventListener("touchstart", handleTouchStart, { passive: true });
      container.addEventListener("touchmove", handleTouchMove, { passive: false });
    }

    // 5. Render Loop
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      const t = Math.max(0, Math.min(1, proxyProgressRef.current.progress));
      const pos = cameraSpline.getPointAt(t);
      const lookAt = lookAtSpline.getPointAt(t);

      camera.position.x = pos.x + mouseX;
      camera.position.y = pos.y + mouseY;
      camera.position.z = pos.z;

      camera.lookAt(lookAt.x, lookAt.y, lookAt.z);

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      if (container) {
        container.removeEventListener("wheel", handleWheel);
        container.removeEventListener("touchstart", handleTouchStart);
        container.removeEventListener("touchmove", handleTouchMove);
      }
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animId);
      renderer.dispose();
    };
  }, []);

  const jumpToChamber = (targetP: number) => {
    targetProgressRef.current = targetP;
    gsap.to(proxyProgressRef.current, {
      progress: targetP,
      duration: 1.4,
      ease: "power3.inOut",
      overwrite: "auto",
      onUpdate: () => {
        setCurrentProgress(proxyProgressRef.current.progress);
      },
    });
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen bg-[#070709] overflow-hidden select-none"
    >
      {/* 3D WebGL Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0 block" />

      {/* Upfront Loading Curtain */}
      {!isLoaded && (
        <div className="fixed inset-0 z-50 flex flex-col justify-between p-8 md:p-16 bg-[#070709] text-[#f4f1ea]">
          <div className="flex justify-between items-center text-xs tracking-widestLuxury uppercase font-mono text-neutral-400">
            <span>Gopal Lahoti</span>
            <span>3D Spatial Engine</span>
          </div>

          <div className="text-center space-y-4 my-auto">
            <h2 className="font-serif text-3xl md:text-5xl uppercase tracking-widest text-gold-gradient">
              Gopal Lahoti
            </h2>
            <p className="text-xs uppercase font-mono tracking-ultraLuxury text-neutral-400">
              Loading 3D Chamber Textures & Splines • Please Wait
            </p>
          </div>

          <div className="flex justify-between items-end border-t border-white/10 pt-6">
            <div className="w-48 md:w-80 h-[2px] bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#c5a880] transition-all duration-150"
                style={{ width: `${loadProgress}%` }}
              />
            </div>
            <span className="font-mono text-xl text-[#c5a880]">{loadProgress}%</span>
          </div>
        </div>
      )}

      {/* Vignette & Ambient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none z-10" />

      {/* Top Navbar */}
      <header className="absolute top-0 left-0 w-full z-30 py-8 px-8 md:px-16 flex items-center justify-between pointer-events-none">
        <div className="flex flex-col items-start pointer-events-auto">
          <span className="font-serif text-xl md:text-2xl tracking-[0.2em] text-[#f5f2eb] uppercase font-light">
            Gopal Lahoti
          </span>
          <span className="text-[9px] uppercase font-mono tracking-[0.3em] text-[#c5a880]">
            3D Spatial Walkthrough
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

      {/* Decoupled DOM Editorial Text Overlay */}
      <div className="absolute bottom-16 left-8 md:left-16 z-20 pointer-events-none max-w-xl transition-all duration-500">
        <div className="space-y-2">
          <span className="text-[11px] uppercase tracking-ultraLuxury font-mono text-[#c5a880] block">
            Chamber {activeChamber.num} / 05 • {activeChamber.location}
          </span>

          <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl text-white uppercase font-light tracking-wide leading-tight">
            {activeChamber.title}
          </h1>

          <p className="text-xs md:text-sm text-neutral-300 font-sans font-light tracking-wider leading-relaxed">
            {activeChamber.subtitle}
          </p>

          <div className="pt-3 pointer-events-auto">
            <button
              onClick={() => setSelectedSpecChamber(activeChamber)}
              className="inline-flex items-center space-x-2 text-[10px] uppercase font-mono tracking-widest text-[#c5a880] hover:text-white transition-colors group"
            >
              <span>Inspect Chamber Specifications</span>
              <ChevronRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Right Edge: Vertical Scroll Track */}
      <div className="hidden md:flex absolute right-12 top-1/2 -translate-y-1/2 z-20 flex-col items-center space-y-4 text-[9px] font-mono uppercase text-neutral-400 tracking-widest pointer-events-none">
        <span className="rotate-90 origin-center mb-6">Scroll to Traverse</span>
        <div className="w-[1px] h-20 bg-white/20 relative overflow-hidden">
          <div
            className="w-full bg-[#c5a880] transition-all duration-150"
            style={{
              height: "25%",
              transform: `translateY(${currentProgress * 300}%)`,
            }}
          />
        </div>
      </div>

      {/* Bottom Persistent HUD (Chapter Nav & Progress Meter) */}
      <div className="absolute bottom-6 left-8 right-8 md:left-16 md:right-16 z-20 flex items-center justify-between text-xs font-mono text-neutral-400 pointer-events-none">
        <div className="flex items-center space-x-6 pointer-events-auto">
          {CHAMBERS.map((ch, idx) => {
            const isActive = activeChamberIndex === idx;
            return (
              <button
                key={ch.id}
                onClick={() => jumpToChamber(ch.progress)}
                className={`transition-all duration-300 uppercase tracking-widest text-[10px] font-sans ${
                  isActive
                    ? "text-[#c5a880] font-bold border-b border-[#c5a880] pb-0.5"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                0{idx + 1} {ch.title.split(" ")[1] || ch.title.split(" ")[0]}
              </button>
            );
          })}
        </div>

        <div className="flex items-center space-x-3 w-48 md:w-64">
          <span className="text-[10px]">{Math.round(currentProgress * 100)}%</span>
          <div className="flex-1 h-[2px] bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#c5a880] transition-all duration-100"
              style={{ width: `${currentProgress * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Chamber Specification Modal */}
      {selectedSpecChamber && (
        <div
          onClick={() => setSelectedSpecChamber(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-lg w-full p-8 rounded-3xl glass-panel border border-[#c5a880]/40 shadow-2xl space-y-6"
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#c5a880] tracking-widest block">
                  Chamber {selectedSpecChamber.num} • {selectedSpecChamber.specs.area}
                </span>
                <h3 className="font-serif text-2xl text-white">
                  {selectedSpecChamber.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedSpecChamber(null)}
                className="p-2 rounded-full bg-white/10 hover:bg-[#c5a880] hover:text-black text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs md:text-sm text-neutral-300 font-sans leading-relaxed">
              {selectedSpecChamber.specs.description}
            </p>

            <div className="pt-4 border-t border-white/10 space-y-2">
              <span className="text-[10px] font-mono uppercase text-[#c5a880] tracking-wider block">
                Primary Materials & Craft:
              </span>
              <ul className="space-y-1.5 text-xs text-neutral-300 font-sans">
                {selectedSpecChamber.specs.materials.map((m) => (
                  <li key={m} className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#c5a880]" />
                    <span>{m}</span>
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

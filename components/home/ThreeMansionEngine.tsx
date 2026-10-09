"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { Volume2, VolumeX, ChevronRight, ChevronLeft, X, Compass, Info, Layers, MapPin, Maximize2, DoorClosed, Sparkles } from "lucide-react";
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { EXHIBITION_CATALOG, type ExhibitionArtwork } from "./exhibitionData";

interface ChamberInfo {
  id: string;
  chapterNum: string;
  title1: string;
  title2: string;
  subtitle: string;
  location: string;
  sqft: string;
  heroProgress: number;
  specs: {
    description: string;
    materials: string[];
    details: string[];
  };
}

const CHAMBER_DATA: ChamberInfo[] = [
  {
    id: "grand",
    chapterNum: "CHAMBER I/VI",
    title1: "GRAND",
    title2: "LIVING",
    subtitle: "Italian Black Marble & Double-Height Ambient Lounges",
    location: "Koregaon Park Estate, Pune",
    sqft: "5,400 SQ. FT.",
    heroProgress: 0.15,
    specs: {
      description:
        "A double-height living sanctuary defined by continuous Italian Nero Marquina black marble floors, monolithic coffee tables, bespoke beige modular sofa lounges, and layered sheer drapery.",
      materials: ["Italian Nero Marquina Marble", "Fluted Oak Millwork", "Italian Full-Grain Leather"],
      details: ["Circadian 2700K Cove Lighting", "Concealed HVAC Diffusers", "Acoustic Wall Panels"],
    },
  },
  {
    id: "versace",
    chapterNum: "CHAMBER II/VI",
    title1: "VERSACE",
    title2: "SUITE",
    subtitle: "Acoustic Oak Paneling & Tailored Leather Headboard",
    location: "Worli Sea Face, Mumbai",
    sqft: "850 SQ. FT.",
    heroProgress: 0.32,
    specs: {
      description:
        "An opulent master chamber clad in acoustic vertical fluted natural oak paneling with continuous Italian Nero Marquina black marble floors, an upholstered burgundy leather headboard, and designer drop pendant spotlights.",
      materials: ["Italian Nero Marquina Marble", "European White Oak", "Burgundy Italian Leather"],
      details: ["Integrated Bedside Dimmers", "Sound-Absorbing Backing", "Versace Silk Textiles"],
    },
  },
  {
    id: "sacred",
    chapterNum: "CHAMBER III/VI",
    title1: "SACRED",
    title2: "SANCTUM",
    subtitle: "Illuminated Onyx Halo & Gayatri Mantra Wall Art",
    location: "Amanora Park Town, Pune",
    sqft: "450 SQ. FT.",
    heroProgress: 0.49,
    specs: {
      description:
        "A contemporary spiritual sanctum featuring continuous Italian Nero Marquina black marble floors, laser-etched Sanskrit Gayatri Mantra wall typography, a glowing backlit halo deity backdrop, and fluted timber ceilings.",
      materials: ["Italian Nero Marquina Marble", "Translucent Acrylic Onyx", "Fluted Teakwood Ceiling"],
      details: ["Celestial Ambient Backlighting", "Floating Coral Cabinetry", "Mandala Wall Relief"],
    },
  },
  {
    id: "corporate",
    chapterNum: "CHAMBER IV/VI",
    title1: "EXECUTIVE",
    title2: "BOARDROOM",
    subtitle: "Italian Black Marble & Presidential Executive Suites",
    location: "BKC Commercial Hub, Mumbai",
    sqft: "3,800 SQ. FT.",
    heroProgress: 0.66,
    specs: {
      description:
        "A commanding corporate executive boardroom and managing director suite defined by monolithic Italian Nero Marquina black marble floors, book-matched walnut millwork, ergonomic executive seating, and architectural lighting grids.",
      materials: ["Italian Nero Marquina Marble", "Book-matched Walnut", "Cognac Saddle Leather"],
      details: ["Sculptural Conference Tables", "Integrated Linear Diffusers", "Acoustic Glass Partitions"],
    },
  },
  {
    id: "royal_living",
    chapterNum: "CHAMBER V/VI",
    title1: "ROYAL",
    title2: "SALON",
    subtitle: "Backlit Marble Media Wall & Cantilevered Floating Staircase",
    location: "Koregaon Park Estate, Pune",
    sqft: "4,600 SQ. FT.",
    heroProgress: 0.83,
    specs: {
      description:
        "A dramatic second living salon highlighting a monumental backlit Statuario marble media wall, cantilevered floating steps with warm riser illumination, emerald and ruby velvet lounges, and floor-to-ceiling double-height glazing.",
      materials: ["Backlit Italian Marble", "Smoked Oak Millwork", "Belgian Emerald Velvet"],
      details: ["Floating Cantilever Staircase", "Recessed Riser Lighting", "Architectural Cocktail Tables"],
    },
  },
  {
    id: "corporate_lobby",
    chapterNum: "CHAMBER VI/VI",
    title1: "CORPORATE",
    title2: "RECEPTION",
    subtitle: "Sculptural Brass Concierge & Chevron Timber Foyer",
    location: "BKC Commercial Hub, Mumbai",
    sqft: "3,200 SQ. FT.",
    heroProgress: 0.97,
    specs: {
      description:
        "An opulent corporate reception and hospitality lobby defined by a custom sculptural brushed brass concierge desk, illuminated backlit corporate insignia on handcrafted chevron timber walls, and executive visitor waiting salons.",
      materials: ["Brushed Brass Concierge Counter", "Chevron Oak Paneling", "Fluted Architectural Glass"],
      details: ["Backlit Metallic Insignia", "Integrated Toe-Kick Wash", "Acoustic Meeting Portals"],
    },
  },
];

export default function ThreeMansionEngine() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const progressLineRef = useRef<HTMLDivElement | null>(null);
  const progressTextRef = useRef<HTMLSpanElement | null>(null);
  const hudRef = useRef<HTMLDivElement | null>(null);
  const currentChamberIdRef = useRef<string | null>(null);

  const [activeChamber, setActiveChamber] = useState<ChamberInfo | null>(null);
  const [showSpecs, setShowSpecs] = useState(false);
  const [showExhibition, setShowExhibition] = useState(false);
  const [inspectedArtwork, setInspectedArtwork] = useState<ExhibitionArtwork | null>(null);
  const [activeArtworks, setActiveArtworks] = useState<Record<string, string>>({
    grand: "ch1_living",
    versace: "ch2_woodbed",
    sacred: "ch3_mandir_classic",
    corporate: "ch4_boardroom",
    royal_living: "ch5_living",
    corporate_lobby: "ch6_reception",
  });
  const [isMuted, setIsMuted] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);

  // References for live 3D wall hero canvas meshes & materials
  const heroArtRefs = useRef<
    Record<
      string,
      {
        group: THREE.Group;
        canvasMesh: THREE.Mesh;
        canvasMat: THREE.MeshStandardMaterial;
        plaqueMesh: THREE.Mesh;
      }
    >
  >({});
  const chamberArtworkTexturesRef = useRef<Record<string, THREE.Texture>>({});

  // Grand Entrance Door Opening Sequence State
  const [doorState, setDoorState] = useState<"loading" | "ready" | "opening" | "opened">("loading");
  const [isDoorOpen, setIsDoorOpen] = useState(false);
  const [isLightingSequence, setIsLightingSequence] = useState(false);
  const [doorUIFading, setDoorUIFading] = useState(false);
  const [doorUIHidden, setDoorUIHidden] = useState(false);

  const doorAnimationRef = useRef<{
    leftPivot: THREE.Group | null;
    rightPivot: THREE.Group | null;
    leftHandle: THREE.Group | null;
    rightHandle: THREE.Group | null;
    lightFlood: THREE.Mesh | null;
    crackSlit: THREE.Mesh | null;
    crackGlow: THREE.Mesh | null;
    floorSpill: THREE.Mesh | null;
    doorBacker: THREE.Mesh | null;
    doorGroup: THREE.Group | null;
    doorKeyLight: THREE.SpotLight | null;
    doorUplight: THREE.PointLight | null;
    porticoFill: THREE.SpotLight | null;
    cameraPos: THREE.Vector3;
    cameraLook: THREE.Vector3;
  }>({
    leftPivot: null,
    rightPivot: null,
    leftHandle: null,
    rightHandle: null,
    lightFlood: null,
    crackSlit: null,
    crackGlow: null,
    floorSpill: null,
    doorBacker: null,
    doorGroup: null,
    doorKeyLight: null,
    doorUplight: null,
    porticoFill: null,
    cameraPos: new THREE.Vector3(0, 2.85, 14.5),
    cameraLook: new THREE.Vector3(0, 3.10, 8.2),
  });

  const triggerOpenDoorRef = useRef<() => void>(() => {});
  const triggerSkipDoorRef = useRef<() => void>(() => {});
  const doorTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const lightingTimelineRef = useRef<gsap.core.Timeline | null>(null);

  const handleSelectArtwork = (chamberId: string, artwork: ExhibitionArtwork) => {
    setActiveArtworks((prev) => ({ ...prev, [chamberId]: artwork.id }));
    playSound(380);

    const hero = heroArtRefs.current[chamberId];
    const newTex = chamberArtworkTexturesRef.current[artwork.id];
    if (hero && newTex) {
      gsap.killTweensOf(hero.canvasMat);
      gsap.to(hero.canvasMat, {
        opacity: 0.15,
        duration: 0.14,
        ease: "power2.in",
        onComplete: () => {
          hero.canvasMat.map = newTex;
          hero.canvasMat.emissiveMap = newTex;
          gsap.to(hero.canvasMat, {
            opacity: 1.0,
            duration: 0.22,
            ease: "power2.out",
          });
        },
      });

      if (hero.group) {
        gsap.fromTo(
          hero.group.scale,
          { x: 0.992, y: 0.992, z: 0.992 },
          { x: 1.0, y: 1.0, z: 1.0, duration: 0.35, ease: "back.out(2)" }
        );
      }
    }
  };

  const sceneStateRef = useRef<{
    targetProgress: number;
    currentProgress: number;
    scrollVelocity: number;
    targetVelocity: number;
    lastScrollTime: number;
    isSnapping: boolean;
    tilt: { x: number; y: number };
    targetTilt: { x: number; y: number };
    doorState: "loading" | "ready" | "opening" | "opened";
    isLightingSequence: boolean;
    introComplete: boolean;
  }>({
    targetProgress: 0,
    currentProgress: 0,
    scrollVelocity: 0,
    targetVelocity: 0,
    lastScrollTime: 0,
    isSnapping: false,
    tilt: { x: 0, y: 0 },
    targetTilt: { x: 0, y: 0 },
    doorState: "loading",
    isLightingSequence: false,
    introComplete: false,
  });

  const audioCtxRef = useRef<AudioContext | null>(null);
  const ambientDroneGainRef = useRef<GainNode | null>(null);

  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  };

  const startAmbientDrone = () => {
    try {
      if (ambientDroneGainRef.current) return;
      const ctx = getAudioContext();
      const t = ctx.currentTime;

      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(55, t); // deep resonant 55Hz room tone

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(140, t);

      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(isMuted ? 0.0001 : 0.035, t + 2.0);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      ambientDroneGainRef.current = gain;
    } catch (_) {}
  };

  const playDoorLatchClick = () => {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(540, t);
      osc.frequency.exponentialRampToValueAtTime(80, t + 0.08);

      filter.type = "highpass";
      filter.frequency.setValueAtTime(280, t);

      gain.gain.setValueAtTime(0.20, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.09);
    } catch (e) {
      console.warn("Latch sound failed", e);
    }
  };

  const playDoorOpeningGroan = () => {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      const t = ctx.currentTime;

      // 1. Heavy resonant antique wood timber groan / creak
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const groanFilter = ctx.createBiquadFilter();
      const groanGain = ctx.createGain();

      osc1.type = "sawtooth";
      osc2.type = "sawtooth";
      osc1.frequency.setValueAtTime(72, t);
      osc2.frequency.setValueAtTime(76.5, t);
      osc1.frequency.linearRampToValueAtTime(84, t + 1.1);
      osc1.frequency.linearRampToValueAtTime(58, t + 2.0);

      groanFilter.type = "bandpass";
      groanFilter.frequency.setValueAtTime(240, t);
      groanFilter.frequency.exponentialRampToValueAtTime(420, t + 0.8);
      groanFilter.frequency.exponentialRampToValueAtTime(150, t + 2.0);
      groanFilter.Q.setValueAtTime(3.8, t);

      groanGain.gain.setValueAtTime(0.001, t);
      groanGain.gain.linearRampToValueAtTime(0.16, t + 0.35);
      groanGain.gain.exponentialRampToValueAtTime(0.001, t + 2.2);

      osc1.connect(groanFilter);
      osc2.connect(groanFilter);
      groanFilter.connect(groanGain);
      groanGain.connect(ctx.destination);

      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + 2.2);
      osc2.stop(t + 2.2);

      // 2. Cinematic Golden Orchestral Swell (Warm F-maj9 / C-maj9 luxury chord)
      // Notes: C3 (130.81Hz), G3 (196.00Hz), B3 (246.94Hz), E4 (329.63Hz), G4 (392.00Hz)
      const chordFrequencies = [130.81, 196.00, 246.94, 329.63, 392.00];
      const swellFilter = ctx.createBiquadFilter();
      swellFilter.type = "lowpass";
      swellFilter.frequency.setValueAtTime(260, t + 0.2);
      swellFilter.frequency.exponentialRampToValueAtTime(2600, t + 1.8);
      swellFilter.Q.setValueAtTime(1.1, t);

      const swellGain = ctx.createGain();
      swellGain.gain.setValueAtTime(0.001, t + 0.2);
      swellGain.gain.linearRampToValueAtTime(0.12, t + 1.5);
      swellGain.gain.exponentialRampToValueAtTime(0.001, t + 3.2);

      swellFilter.connect(swellGain);
      swellGain.connect(ctx.destination);

      chordFrequencies.forEach((freq, idx) => {
        const o = ctx.createOscillator();
        o.type = idx % 2 === 0 ? "sine" : "triangle";
        o.frequency.setValueAtTime(freq, t + 0.2);
        o.detune.setValueAtTime((idx - 2) * 5, t + 0.2);
        o.connect(swellFilter);
        o.start(t + 0.2);
        o.stop(t + 3.2);
      });

      // 3. Reveal Chime at peak reveal (t + 1.6s)
      const chimeTimes = [1.6, 1.78];
      const chimeFreqs = [1046.5, 1567.98];
      chimeTimes.forEach((ct, i) => {
        const chimeOsc = ctx.createOscillator();
        const chimeGain = ctx.createGain();
        chimeOsc.type = "sine";
        chimeOsc.frequency.setValueAtTime(chimeFreqs[i], t + ct);
        chimeGain.gain.setValueAtTime(0.08, t + ct);
        chimeGain.gain.exponentialRampToValueAtTime(0.001, t + ct + 2.0);
        chimeOsc.connect(chimeGain);
        chimeGain.connect(ctx.destination);
        chimeOsc.start(t + ct);
        chimeOsc.stop(t + ct + 2.0);
      });
    } catch (e) {
      console.warn("Door sound failed", e);
    }
  };

  // --- ARCHITECTURAL LIGHTING SEQUENCE SYNTHESIZERS ---
  const playRelayClick = (pitch = 1.0, volume = 0.04) => {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      const t = ctx.currentTime;

      // 1. High crisp armature contact tick (ultra-short 12ms impulse)
      const tickOsc = ctx.createOscillator();
      const tickGain = ctx.createGain();
      const tickFilter = ctx.createBiquadFilter();

      tickOsc.type = "sine";
      tickOsc.frequency.setValueAtTime(2200 * pitch, t);
      tickOsc.frequency.exponentialRampToValueAtTime(450 * pitch, t + 0.012);

      tickFilter.type = "highpass";
      tickFilter.frequency.setValueAtTime(800, t);

      tickGain.gain.setValueAtTime(volume * 0.7, t);
      tickGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.012);

      tickOsc.connect(tickFilter);
      tickFilter.connect(tickGain);
      tickGain.connect(ctx.destination);

      tickOsc.start(t);
      tickOsc.stop(t + 0.014);

      // 2. Warm magnetic solenoid coil thud (35ms pulse)
      const coilOsc = ctx.createOscillator();
      const coilGain = ctx.createGain();
      const coilFilter = ctx.createBiquadFilter();

      coilOsc.type = "triangle";
      coilOsc.frequency.setValueAtTime(190 * pitch, t + 0.003);
      coilOsc.frequency.exponentialRampToValueAtTime(65 * pitch, t + 0.038);

      coilFilter.type = "lowpass";
      coilFilter.frequency.setValueAtTime(320 * pitch, t + 0.003);

      coilGain.gain.setValueAtTime(volume, t + 0.003);
      coilGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.038);

      coilOsc.connect(coilFilter);
      coilFilter.connect(coilGain);
      coilGain.connect(ctx.destination);

      coilOsc.start(t + 0.003);
      coilOsc.stop(t + 0.040);
    } catch (_) {}
  };

  const startElectricHum = () => {
    if (isMuted) return { stop: () => {} };
    try {
      const ctx = getAudioContext();
      const t = ctx.currentTime;

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc1.type = "sine";
      osc1.frequency.setValueAtTime(58, t); // 58Hz transformer fundamental

      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(116, t); // 116Hz second harmonic

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(160, t);

      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(0.024, t + 1.1); // subtle swell matching faster sequence

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(t);
      osc2.start(t);

      return {
        stop: () => {
          try {
            const stopT = ctx.currentTime;
            gain.gain.linearRampToValueAtTime(0.0001, stopT + 0.25);
            setTimeout(() => {
              try {
                osc1.stop();
                osc2.stop();
              } catch (_) {}
            }, 280);
          } catch (_) {}
        },
      };
    } catch (_) {
      return { stop: () => {} };
    }
  };

  const playFullResonanceChime = () => {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      const t = ctx.currentTime;

      // Luxurious 5-note architectural resonance chord (C-maj9 / E-maj9)
      // Notes: C5 (523.25Hz), E5 (659.25Hz), G5 (783.99Hz), B5 (987.77Hz), D6 (1174.66Hz)
      const freqs = [523.25, 659.25, 783.99, 987.77, 1174.66];

      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, t + idx * 0.035);
        osc.detune.setValueAtTime((idx - 2) * 4, t);

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(2800, t);

        gain.gain.setValueAtTime(0.0001, t + idx * 0.035);
        gain.gain.linearRampToValueAtTime(0.065 - idx * 0.006, t + idx * 0.035 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + idx * 0.035 + 3.2);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t + idx * 0.035);
        osc.stop(t + idx * 0.035 + 3.3);
      });
    } catch (_) {}
  };

  const playSound = (freq = 110) => {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.75, ctx.currentTime + 0.9);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.9);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.9);
    } catch (e) {
      console.warn("Audio unavailable", e);
    }
  };

  const flyToChamber = (targetP: number) => {
    if (sceneStateRef.current.isLightingSequence) return;
    sceneStateRef.current.isSnapping = true;
    playSound(180);
    gsap.to(sceneStateRef.current, {
      targetProgress: targetP,
      duration: 1.8,
      ease: "power2.inOut",
      onComplete: () => {
        sceneStateRef.current.isSnapping = false;
      },
    });
  };

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // --- 1. THREE.JS SCENE, CAMERA & RENDERER ---
    const scene = new THREE.Scene();
    // Warm champagne ivory ambient sky / background
    scene.background = new THREE.Color("#ede5d9");
    // Soft, luminous sunlit atmospheric mist (starts at 85m, preserving crystal clarity down the 120m corridor)
    scene.fog = new THREE.Fog("#e4d8c8", 85, 185);

    const camera = new THREE.PerspectiveCamera(54, width / height, 0.1, 200);
    camera.position.set(0, 2.85, 14.5);
    camera.lookAt(0, 3.10, 8.2);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
      stencil: false,
      depth: true,
    });
    renderer.setSize(width, height);
    const dpr = Math.min(window.devicePixelRatio || 1, 1.0);
    renderer.setPixelRatio(dpr);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.10; // perfectly calibrated to prevent white blowout on marble floor
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);
    // Crucial for 60FPS: disable synchronous shader validation stalls (eliminates getProgramInfoLog halts)
    renderer.debug.checkShaderErrors = false;

    // --- 2. TEXTURE LOADING MANAGER ---
    let triggerWarmUpGPU = () => {};
    const loadingManager = new THREE.LoadingManager();
    loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
      setLoadProgress(Math.round((itemsLoaded / itemsTotal) * 100));
    };
    loadingManager.onLoad = () => {
      setTimeout(() => {
        setIsLoading(false);
        triggerWarmUpGPU();
        if (sceneStateRef.current.doorState === "loading") {
          sceneStateRef.current.doorState = "ready";
          setDoorState("ready");
        }
      }, 300);
    };
    loadingManager.onError = (url) => {
      console.warn("Texture load failed, continuing:", url);
      setIsLoading(false);
      triggerWarmUpGPU();
      if (sceneStateRef.current.doorState === "loading") {
        sceneStateRef.current.doorState = "ready";
        setDoorState("ready");
      }
    };
    // Fallback safety: ensure preloader is dismissed within 2s under all network conditions
    const safetyTimer = setTimeout(() => {
      setIsLoading(false);
      triggerWarmUpGPU();
      if (sceneStateRef.current.doorState === "loading") {
        sceneStateRef.current.doorState = "ready";
        setDoorState("ready");
      }
    }, 2000);

    const textureLoader = new THREE.TextureLoader(loadingManager);

    // Warm luxury architectural textures
    const calacattaMarbleTex = textureLoader.load("/assets/textures/calacatta_gold_marble.jpg");
    calacattaMarbleTex.wrapS = THREE.RepeatWrapping;
    calacattaMarbleTex.wrapT = THREE.RepeatWrapping;
    calacattaMarbleTex.repeat.set(4, 28);
    calacattaMarbleTex.colorSpace = THREE.SRGBColorSpace;

    // Pure Italian Black Marble (Nero Marquina / Portoro) Texture for Corridor Floor
    const italianBlackMarbleTex = textureLoader.load("/assets/textures/italian_black_marble.jpg");
    italianBlackMarbleTex.wrapS = THREE.MirroredRepeatWrapping;
    italianBlackMarbleTex.wrapT = THREE.MirroredRepeatWrapping;
    italianBlackMarbleTex.repeat.set(4, 34);
    italianBlackMarbleTex.colorSpace = THREE.SRGBColorSpace;

    // Pure Italian Black Marble Texture for All Chambers (Seamlessly Connecting with Hallway Floor)
    const chamberBlackMarbleTex = textureLoader.load("/assets/textures/italian_black_marble.jpg");
    chamberBlackMarbleTex.wrapS = THREE.MirroredRepeatWrapping;
    chamberBlackMarbleTex.wrapT = THREE.MirroredRepeatWrapping;
    chamberBlackMarbleTex.repeat.set(5, 5); // 16m x 16m room = 3.2m bookmatched mega-slabs
    chamberBlackMarbleTex.colorSpace = THREE.SRGBColorSpace;

    const honeyMarbleFloorTex = textureLoader.load("/assets/textures/honey_marble_floor.jpg");
    honeyMarbleFloorTex.wrapS = THREE.RepeatWrapping;
    honeyMarbleFloorTex.wrapT = THREE.RepeatWrapping;
    honeyMarbleFloorTex.repeat.set(5, 5);
    honeyMarbleFloorTex.colorSpace = THREE.SRGBColorSpace;

    const runnerRugTex = textureLoader.load("/assets/textures/runner_rug.jpg");
    runnerRugTex.wrapS = THREE.ClampToEdgeWrapping;
    runnerRugTex.wrapT = THREE.RepeatWrapping;
    runnerRugTex.repeat.set(1, 20); // Stately Persian palmette medallions
    runnerRugTex.colorSpace = THREE.SRGBColorSpace;

    const fineLimestoneTex = textureLoader.load("/assets/textures/fine_limestone.jpg");
    fineLimestoneTex.wrapS = THREE.RepeatWrapping;
    fineLimestoneTex.wrapT = THREE.RepeatWrapping;
    fineLimestoneTex.repeat.set(6, 3);
    fineLimestoneTex.colorSpace = THREE.SRGBColorSpace;

    const honeyFlutedOakTex = textureLoader.load("/assets/textures/honey_fluted_oak.jpg");
    honeyFlutedOakTex.wrapS = THREE.RepeatWrapping;
    honeyFlutedOakTex.wrapT = THREE.RepeatWrapping;
    honeyFlutedOakTex.repeat.set(6, 4);
    honeyFlutedOakTex.colorSpace = THREE.SRGBColorSpace;

    const brassTex = textureLoader.load("/assets/textures/brushed_brass.jpg");
    brassTex.colorSpace = THREE.SRGBColorSpace;

    // Five-Star Hotel Lobby Coffered Ceiling Quilted / Brushed Champagne Gold Textures
    const cofferDiffTex = textureLoader.load("/assets/textures/champagne_gold_coffer.jpg");
    cofferDiffTex.colorSpace = THREE.SRGBColorSpace;
    const cofferNormTex = textureLoader.load("/assets/textures/champagne_gold_coffer_normal.jpg");

    // Curated 4K Grand Hallway Exhibition Murals (from master lahoti content portfolio)
    const maxAniso = Math.min(renderer.capabilities.getMaxAnisotropy(), 4);
    const loadMural = (src: string) => {
      const t = textureLoader.load(src, (loaded) => {
        loaded.colorSpace = THREE.SRGBColorSpace;
        loaded.minFilter = THREE.LinearMipmapLinearFilter;
        loaded.magFilter = THREE.LinearFilter;
        loaded.anisotropy = maxAniso;
        loaded.generateMipmaps = true;
        loaded.needsUpdate = true;
        try {
          renderer.initTexture(loaded);
        } catch (_) {}
      });
      t.colorSpace = THREE.SRGBColorSpace;
      t.minFilter = THREE.LinearMipmapLinearFilter;
      t.magFilter = THREE.LinearFilter;
      t.anisotropy = maxAniso;
      t.generateMipmaps = true;
      return t;
    };

    const muralTex1 = loadMural("/assets/hallway_murals/mural_01.jpg");
    const muralTex2 = loadMural("/assets/hallway_murals/mural_02.jpg");
    const muralTex3 = loadMural("/assets/hallway_murals/mural_03.jpg");
    const muralTex4 = loadMural("/assets/hallway_murals/mural_04.jpg");
    const muralTex5 = loadMural("/assets/hallway_murals/mural_05.jpg");
    const muralTex6 = loadMural("/assets/hallway_murals/mural_06.jpg");
    const muralTex7 = loadMural("/assets/hallway_murals/mural_07.jpg");
    const muralTex8 = loadMural("/assets/hallway_murals/mural_08.jpg");
    const muralTex9 = loadMural("/assets/hallway_murals/mural_09.jpg");
    const muralTex10 = loadMural("/assets/hallway_murals/mural_10.jpg");
    const muralTex11 = loadMural("/assets/hallway_murals/mural_11.jpg");
    const muralTex12 = loadMural("/assets/hallway_murals/mural_12.jpg");
    const muralTex13 = loadMural("/assets/hallway_murals/mural_13.jpg");
    const muralTex14 = loadMural("/assets/hallway_murals/mural_14.jpg");
    const muralTex15 = loadMural("/assets/hallway_murals/mural_15.jpg");
    const muralTex16 = loadMural("/assets/hallway_murals/mural_16.jpg");
    const muralTex17 = loadMural("/assets/hallway_murals/mural_17.jpg");
    const muralTex18 = loadMural("/assets/hallway_murals/mural_18.jpg");
    const muralTex19 = loadMural("/assets/hallway_murals/mural_19.jpg");
    const muralTex20 = loadMural("/assets/hallway_murals/mural_20.jpg");
    const muralTex21 = loadMural("/assets/hallway_murals/mural_21.jpg");
    const muralTex22 = loadMural("/assets/hallway_murals/mural_22.jpg");
    const muralTex23 = loadMural("/assets/hallway_murals/mural_23.jpg");
    const muralTex24 = loadMural("/assets/hallway_murals/mural_24.jpg");

    const allMuralTextures = [
      muralTex1, muralTex2, muralTex3, muralTex4,
      muralTex5, muralTex6, muralTex7, muralTex8,
      muralTex9, muralTex10, muralTex11, muralTex12,
      muralTex13, muralTex14, muralTex15, muralTex16,
      muralTex17, muralTex18, muralTex19, muralTex20,
      muralTex21, muralTex22, muralTex23, muralTex24,
    ];

    // --- HIGH-PERFORMANCE 4K CHAMBER ARTWORK ARCHITECTURE ---
    // Uses LinearFilter & generateMipmaps = false to eliminate synchronous gl.generateMipmap stalls,
    // save 33% GPU VRAM, and provide pristine native 4K texel sampling with zero lag.
    const loadChamberArt = (src: string) => {
      const t = textureLoader.load(src, (loaded) => {
        loaded.colorSpace = THREE.SRGBColorSpace;
        loaded.generateMipmaps = false;
        loaded.minFilter = THREE.LinearFilter;
        loaded.magFilter = THREE.LinearFilter;
        loaded.needsUpdate = true;
        try {
          renderer.initTexture(loaded);
        } catch (_) {}
      });
      t.colorSpace = THREE.SRGBColorSpace;
      t.generateMipmaps = false;
      t.minFilter = THREE.LinearFilter;
      t.magFilter = THREE.LinearFilter;
      return t;
    };

    // Chamber 1: Grand Living
    const texCh1Living = loadChamberArt("/assets/exhibition/ch1_living.jpg");
    const texCh1Dining = loadChamberArt("/assets/exhibition/ch1_dining.jpg");
    const texCh1Parlour = loadChamberArt("/assets/exhibition/ch1_parlour.jpg");
    const texCh1Lounge = loadChamberArt("/assets/exhibition/ch1_lounge.jpg");
    const texCh1Media = loadChamberArt("/assets/exhibition/ch1_media.jpg");

    // Chamber 2: Versace Suite
    const texCh2WoodBed = loadChamberArt("/assets/exhibition/ch2_woodbed.jpg");
    const texCh2Bed1 = loadChamberArt("/assets/exhibition/ch2_bed1.jpg");
    const texCh2Vanity = loadChamberArt("/assets/exhibition/ch2_vanity.jpg");
    const texCh2Emerald = loadChamberArt("/assets/exhibition/ch2_emerald.jpg");
    const texCh2Linear = loadChamberArt("/assets/exhibition/ch2_linear.jpg");

    // Chamber 3: Sacred Sanctum
    const texCh3Classic = loadChamberArt("/assets/exhibition/ch3_mandir_classic.jpg");
    const texCh3Stone = loadChamberArt("/assets/exhibition/ch3_stone_altar.jpg");
    const texCh3Courtyard = loadChamberArt("/assets/exhibition/ch3_courtyard.jpg");
    const texCh3Foyer = loadChamberArt("/assets/exhibition/ch3_foyer.jpg");
    const texCh3Portal = loadChamberArt("/assets/exhibition/ch3_portal.jpg");

    // Chamber 4: Executive Boardroom
    const texCh4Boardroom = loadChamberArt("/assets/exhibition/ch4_boardroom.jpg");
    const texCh4SkyLounge = loadChamberArt("/assets/exhibition/ch4_skylounge.jpg");
    const texCh4Dining = loadChamberArt("/assets/exhibition/ch4_dining.jpg");
    const texCh4Vip = loadChamberArt("/assets/exhibition/ch4_vip.jpg");
    const texCh4Terrace = loadChamberArt("/assets/exhibition/ch4_terrace.jpg");

    // Chamber 5: Royal Salon
    const texCh5Living = loadChamberArt("/assets/exhibition/ch5_living.jpg");
    const texCh5Lounge = loadChamberArt("/assets/exhibition/ch5_lounge.jpg");
    const texCh5Staircase = loadChamberArt("/assets/exhibition/ch5_staircase.jpg");
    const texCh5Minimalist = loadChamberArt("/assets/exhibition/ch5_minimalist.jpg");
    const texCh5Velvet = loadChamberArt("/assets/exhibition/ch5_velvet.jpg");

    // Chamber 6: Corporate Reception
    const texCh6Reception = loadChamberArt("/assets/exhibition/ch6_reception.jpg");
    const texCh6Chevron = loadChamberArt("/assets/exhibition/ch6_chevron.jpg");
    const texCh6Foyer = loadChamberArt("/assets/exhibition/ch6_foyer.jpg");
    const texCh6Lobby = loadChamberArt("/assets/exhibition/ch6_lobby.jpg");
    const texCh6Workstation = loadChamberArt("/assets/exhibition/ch6_workstation.jpg");

    const allExhibitionArtTextures = [
      texCh1Living, texCh1Dining, texCh1Parlour, texCh1Lounge, texCh1Media,
      texCh2WoodBed, texCh2Bed1, texCh2Vanity, texCh2Emerald, texCh2Linear,
      texCh3Classic, texCh3Stone, texCh3Courtyard, texCh3Foyer, texCh3Portal,
      texCh4Boardroom, texCh4SkyLounge, texCh4Dining, texCh4Vip, texCh4Terrace,
      texCh5Living, texCh5Lounge, texCh5Staircase, texCh5Minimalist, texCh5Velvet,
      texCh6Reception, texCh6Chevron, texCh6Foyer, texCh6Lobby, texCh6Workstation,
    ];

    // Live texture lookup dictionary for real-time dynamic wall artwork switching
    chamberArtworkTexturesRef.current = {
      ch1_living: texCh1Living,
      ch1_dining: texCh1Dining,
      ch1_parlour: texCh1Parlour,
      ch1_lounge: texCh1Lounge,
      ch1_media: texCh1Media,

      ch2_woodbed: texCh2WoodBed,
      ch2_bed1: texCh2Bed1,
      ch2_vanity: texCh2Vanity,
      ch2_emerald: texCh2Emerald,
      ch2_linear: texCh2Linear,

      ch3_mandir_classic: texCh3Classic,
      ch3_stone_altar: texCh3Stone,
      ch3_courtyard: texCh3Courtyard,
      ch3_foyer: texCh3Foyer,
      ch3_portal: texCh3Portal,

      ch4_boardroom: texCh4Boardroom,
      ch4_skylounge: texCh4SkyLounge,
      ch4_dining: texCh4Dining,
      ch4_vip: texCh4Vip,
      ch4_terrace: texCh4Terrace,

      ch5_living: texCh5Living,
      ch5_lounge: texCh5Lounge,
      ch5_staircase: texCh5Staircase,
      ch5_minimalist: texCh5Minimalist,
      ch5_velvet: texCh5Velvet,

      ch6_reception: texCh6Reception,
      ch6_chevron: texCh6Chevron,
      ch6_foyer: texCh6Foyer,
      ch6_lobby: texCh6Lobby,
      ch6_workstation: texCh6Workstation,
    };

    // Bespoke Chamber PBR Materials & Textures
    const boucleDiffTex = textureLoader.load("/assets/textures/boucle_fabric.jpg");
    boucleDiffTex.wrapS = THREE.RepeatWrapping;
    boucleDiffTex.wrapT = THREE.RepeatWrapping;
    boucleDiffTex.repeat.set(4, 4);

    const boucleNormTex = textureLoader.load("/assets/textures/boucle_fabric_normal.jpg");
    boucleNormTex.wrapS = THREE.RepeatWrapping;
    boucleNormTex.wrapT = THREE.RepeatWrapping;
    boucleNormTex.repeat.set(4, 4);

    const cognacLeatherDiffTex = textureLoader.load("/assets/textures/cognac_saddle_leather.jpg");
    cognacLeatherDiffTex.wrapS = THREE.RepeatWrapping;
    cognacLeatherDiffTex.wrapT = THREE.RepeatWrapping;
    cognacLeatherDiffTex.repeat.set(3, 3);

    const cognacLeatherNormTex = textureLoader.load("/assets/textures/cognac_saddle_leather_normal.jpg");
    cognacLeatherNormTex.wrapS = THREE.RepeatWrapping;
    cognacLeatherNormTex.wrapT = THREE.RepeatWrapping;
    cognacLeatherNormTex.repeat.set(3, 3);

    const neroMarquinaTex = textureLoader.load("/assets/textures/nero_marquina_marble.jpg");
    neroMarquinaTex.wrapS = THREE.RepeatWrapping;
    neroMarquinaTex.wrapT = THREE.RepeatWrapping;
    neroMarquinaTex.repeat.set(1.5, 1.5);

    const woolRugTex = textureLoader.load("/assets/textures/wool_boucle_rug.jpg");
    woolRugTex.wrapS = THREE.ClampToEdgeWrapping;
    woolRugTex.wrapT = THREE.ClampToEdgeWrapping;

    // Chamber II: Versace Suite Custom Textures
    const cordovanLeatherDiffTex = textureLoader.load("/assets/textures/cordovan_leather.jpg");
    cordovanLeatherDiffTex.wrapS = THREE.RepeatWrapping;
    cordovanLeatherDiffTex.wrapT = THREE.RepeatWrapping;
    cordovanLeatherDiffTex.repeat.set(2, 2);

    const cordovanLeatherNormTex = textureLoader.load("/assets/textures/cordovan_leather_normal.jpg");
    cordovanLeatherNormTex.wrapS = THREE.RepeatWrapping;
    cordovanLeatherNormTex.wrapT = THREE.RepeatWrapping;
    cordovanLeatherNormTex.repeat.set(2, 2);

    const versaceRunnerDiffTex = textureLoader.load("/assets/textures/versace_silk_runner.jpg");
    versaceRunnerDiffTex.wrapS = THREE.ClampToEdgeWrapping;
    versaceRunnerDiffTex.wrapT = THREE.ClampToEdgeWrapping;

    const versaceRunnerNormTex = textureLoader.load("/assets/textures/versace_silk_runner_normal.jpg");
    versaceRunnerNormTex.wrapS = THREE.ClampToEdgeWrapping;
    versaceRunnerNormTex.wrapT = THREE.ClampToEdgeWrapping;

    const versaceRugDiffTex = textureLoader.load("/assets/textures/versace_suite_rug.jpg");
    versaceRugDiffTex.wrapS = THREE.ClampToEdgeWrapping;
    versaceRugDiffTex.wrapT = THREE.ClampToEdgeWrapping;

    // Chamber III: Sacred Sanctum Bespoke Textures
    const gayatriMantraTex = textureLoader.load("/assets/textures/gayatri_mantra_wall.jpg");
    gayatriMantraTex.wrapS = THREE.ClampToEdgeWrapping;
    gayatriMantraTex.wrapT = THREE.ClampToEdgeWrapping;

    const sacredHaloTex = textureLoader.load("/assets/textures/sacred_venkateswara_halo.png");
    sacredHaloTex.wrapS = THREE.ClampToEdgeWrapping;
    sacredHaloTex.wrapT = THREE.ClampToEdgeWrapping;

    const mandirDoorDiffTex = textureLoader.load("/assets/textures/mandir_coral_door.jpg");
    mandirDoorDiffTex.wrapS = THREE.ClampToEdgeWrapping;
    mandirDoorDiffTex.wrapT = THREE.ClampToEdgeWrapping;

    const mandirDoorNormTex = textureLoader.load("/assets/textures/mandir_coral_door_normal.jpg");
    mandirDoorNormTex.wrapS = THREE.ClampToEdgeWrapping;
    mandirDoorNormTex.wrapT = THREE.ClampToEdgeWrapping;

    const sanctumPrayerRugTex = textureLoader.load("/assets/textures/sanctum_prayer_rug.jpg");
    sanctumPrayerRugTex.wrapS = THREE.ClampToEdgeWrapping;
    sanctumPrayerRugTex.wrapT = THREE.ClampToEdgeWrapping;

    const sanctumMarbleFloorTex = textureLoader.load("/assets/textures/sanctum_marble_floor.jpg");
    sanctumMarbleFloorTex.wrapS = THREE.RepeatWrapping;
    sanctumMarbleFloorTex.wrapT = THREE.RepeatWrapping;
    sanctumMarbleFloorTex.repeat.set(3, 3);
    sanctumMarbleFloorTex.colorSpace = THREE.SRGBColorSpace;

    const sanctumPlasterTex = textureLoader.load("/assets/textures/sanctum_plaster_wall.jpg");
    sanctumPlasterTex.wrapS = THREE.RepeatWrapping;
    sanctumPlasterTex.wrapT = THREE.RepeatWrapping;
    sanctumPlasterTex.repeat.set(2, 2);
    sanctumPlasterTex.colorSpace = THREE.SRGBColorSpace;

    // Chamber IV: Corporate Reception Bespoke Textures
    const terracottaHerringboneTex = textureLoader.load("/assets/textures/terracotta_herringbone.jpg");
    terracottaHerringboneTex.wrapS = THREE.RepeatWrapping;
    terracottaHerringboneTex.wrapT = THREE.RepeatWrapping;
    terracottaHerringboneTex.repeat.set(2, 4);
    terracottaHerringboneTex.colorSpace = THREE.SRGBColorSpace;

    const terracottaHerringboneNormTex = textureLoader.load("/assets/textures/terracotta_herringbone_normal.jpg");
    terracottaHerringboneNormTex.wrapS = THREE.RepeatWrapping;
    terracottaHerringboneNormTex.wrapT = THREE.RepeatWrapping;
    terracottaHerringboneNormTex.repeat.set(2, 4);

    const corporateLaxmiInsigniaTex = textureLoader.load("/assets/textures/corporate_laxmi_insignia.png");
    corporateLaxmiInsigniaTex.wrapS = THREE.ClampToEdgeWrapping;
    corporateLaxmiInsigniaTex.wrapT = THREE.ClampToEdgeWrapping;

    const aubergineWallTex = textureLoader.load("/assets/textures/aubergine_fluted_wall.jpg");
    aubergineWallTex.wrapS = THREE.RepeatWrapping;
    aubergineWallTex.wrapT = THREE.RepeatWrapping;
    aubergineWallTex.repeat.set(3, 3);
    aubergineWallTex.colorSpace = THREE.SRGBColorSpace;

    const cognacLeatherTex = textureLoader.load("/assets/textures/cognac_leather_chair.jpg");
    cognacLeatherTex.wrapS = THREE.RepeatWrapping;
    cognacLeatherTex.wrapT = THREE.RepeatWrapping;
    cognacLeatherTex.repeat.set(2, 2);
    cognacLeatherTex.colorSpace = THREE.SRGBColorSpace;

    const plumVelvetRugTex = textureLoader.load("/assets/textures/plum_velvet_rug.jpg");
    plumVelvetRugTex.wrapS = THREE.ClampToEdgeWrapping;
    plumVelvetRugTex.wrapT = THREE.ClampToEdgeWrapping;

    const wengeTimberTex = textureLoader.load("/assets/textures/wenge_timber.jpg");
    wengeTimberTex.wrapS = THREE.RepeatWrapping;
    wengeTimberTex.wrapT = THREE.RepeatWrapping;
    wengeTimberTex.repeat.set(2, 2);
    wengeTimberTex.colorSpace = THREE.SRGBColorSpace;

    const allChamberTextures = [
      cofferDiffTex,
      boucleDiffTex,
      cognacLeatherDiffTex,
      neroMarquinaTex,
      woolRugTex,
      cordovanLeatherDiffTex,
      versaceRunnerDiffTex,
      versaceRugDiffTex,
      gayatriMantraTex,
      sacredHaloTex,
      mandirDoorDiffTex,
      sanctumPrayerRugTex,
    ];
    allChamberTextures.forEach((t) => {
      t.colorSpace = THREE.SRGBColorSpace;
    });

    // --- 3. WARM LUXURY ARCHITECTURAL MATERIALS ---
    // Baked Fake Glow Textures (100% shader-cost free, zero dynamic lights overhead)
    const createScallopGlowTexture = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const grad = ctx.createRadialGradient(128, 30, 8, 128, 128, 120);
        grad.addColorStop(0, "rgba(255, 218, 145, 0.78)");
        grad.addColorStop(0.35, "rgba(255, 192, 102, 0.42)");
        grad.addColorStop(0.70, "rgba(235, 160, 70, 0.12)");
        grad.addColorStop(1, "rgba(200, 140, 50, 0.0)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 256, 256);
      }
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    };
    const scallopGlowTex = createScallopGlowTexture();

    const createFloorSpillTexture = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const grad = ctx.createRadialGradient(128, 128, 10, 128, 128, 125);
        grad.addColorStop(0, "rgba(255, 222, 155, 0.58)");
        grad.addColorStop(0.40, "rgba(255, 195, 110, 0.28)");
        grad.addColorStop(0.80, "rgba(230, 160, 70, 0.08)");
        grad.addColorStop(1, "rgba(200, 140, 50, 0.0)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 256, 256);
      }
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    };
    const floorSpillTex = createFloorSpillTexture();

    // Floor: Pure Italian Black Marble (Nero Marquina / Portoro)
    // Deep obsidian-black mirror-polished stone with authentic white and golden calcite veining
    const corridorFloorMat = new THREE.MeshStandardMaterial({
      map: italianBlackMarbleTex,
      roughness: 0.08, // mirror-gloss polished Italian marble reflecting the coffers & sconce lights
      metalness: 0.18, // luxury specular sheen
      color: 0xffffff, // full white diffuse allows the black stone and crisp white/gold calcite veins to display at 100% photorealistic clarity
      fog: false, // preserves the pristine black marble reflection down the entire corridor
    });

    // Sculpted Calacatta Gold Marble Material for Console Table Slabs & Plinths
    const calacattaConsoleMat = new THREE.MeshStandardMaterial({
      map: calacattaMarbleTex,
      roughness: 0.14,
      metalness: 0.15,
      color: 0xf5eee2,
    });

    // Central Runner Rug: Woven velvet runner with Greek key gold embroidery
    const runnerRugMat = new THREE.MeshStandardMaterial({
      map: runnerRugTex,
      roughness: 0.88,
      metalness: 0.02,
    });

    // Walls: Fine seamless warm limestone plaster with authentic texture scale
    const corridorWallMat = new THREE.MeshStandardMaterial({
      map: fineLimestoneTex,
      roughness: 0.72,
      metalness: 0.04,
      color: 0xf3ebe0,
    });

    // Fluted architectural panels: Warm champagne honey oak
    const flutedOakMat = new THREE.MeshStandardMaterial({
      map: honeyFlutedOakTex,
      roughness: 0.42,
      metalness: 0.08,
      color: 0xd2c0a6,
    });

    // Ceiling: Light warm ivory stone with soft ambient lift
    const corridorCeilingMat = new THREE.MeshStandardMaterial({
      color: 0xfbf6ee,
      emissive: 0x2e2720,
      emissiveIntensity: sceneStateRef.current.introComplete ? 0.20 : 0.0,
      roughness: 0.60,
    });

    // Antique Gold & Brushed Brass Accents (#C9A961 - rich, luminous & warm champagne gold)
    const antiqueGoldMat = new THREE.MeshStandardMaterial({
      color: 0xc9a961,
      roughness: 0.30,
      metalness: 0.65,
    });

    // Five-Star Hotel Lobby Coffered Ceiling Material (Warm Champagne Gold, Quilted Satin Sheen)
    const luxuryCofferMat = new THREE.MeshStandardMaterial({
      map: cofferDiffTex,
      normalMap: cofferNormTex,
      normalScale: new THREE.Vector2(0.40, 0.40),
      color: 0xd4af55, // Warm champagne / brushed antique gold
      emissive: 0x48341a, // Soft cove indirect glow
      emissiveIntensity: sceneStateRef.current.introComplete ? 0.38 : 0.0,
      roughness: 0.42, // Soft satin sheen
      metalness: 0.12, // Refined metallic balance for rich diffuse
    });

    // Dark Architectural Shadow Reveal for coffer recesses
    const cofferShadowMat = new THREE.MeshStandardMaterial({
      color: 0x1a1510,
      roughness: 0.85,
    });

    // Dark Patinated Bronze for hardware and accents
    const darkBronzeMat = new THREE.MeshStandardMaterial({
      roughness: 0.38,
      metalness: 0.72,
      color: 0x423628,
    });

    // Mouldings & Stone Trims: Soft warm ivory limestone
    const stoneTrimMat = new THREE.MeshStandardMaterial({
      color: 0xdfd4c5,
      roughness: 0.55,
      metalness: 0.04,
    });

    // Continuous Cove Light Channels
    const warmEmissiveMat = new THREE.MeshBasicMaterial({
      color: 0xfff0cb,
    });

    // Grounding Contact Shadow Material
    const contactShadowMat = new THREE.MeshBasicMaterial({
      color: 0x140e08,
      transparent: true,
      opacity: 0.38,
      depthWrite: false,
    });

    // Mirror Glass Material for console table mirror
    const mirrorMat = new THREE.MeshStandardMaterial({
      color: 0xeeeeee,
      roughness: 0.05,
      metalness: 0.95,
    });

    // Chamber Floor Material: Pure Italian Black Marble (Nero Marquina / Portoro) matching hallway
    const grandFloorMat = new THREE.MeshStandardMaterial({
      map: chamberBlackMarbleTex,
      roughness: 0.08,
      metalness: 0.18,
      color: 0xffffff,
      fog: false,
    });

    // Chamber I: High-End Furniture PBR Materials (Crisp clarity with fog: false)
    const boucleMat = new THREE.MeshStandardMaterial({
      map: boucleDiffTex,
      normalMap: boucleNormTex,
      normalScale: new THREE.Vector2(0.85, 0.85),
      color: 0xc8bba9, // warm oat / cashmere luxury bouclé
      roughness: 0.80,
      metalness: 0.02,
      fog: false,
    });

    const cognacLeatherMat = new THREE.MeshStandardMaterial({
      map: cognacLeatherDiffTex,
      normalMap: cognacLeatherNormTex,
      normalScale: new THREE.Vector2(0.65, 0.65),
      color: 0xa85422, // rich Italian cognac saddle leather with warm pull-up undertones
      roughness: 0.36,
      metalness: 0.08,
      fog: false,
    });

    const neroMarquinaMat = new THREE.MeshStandardMaterial({
      map: neroMarquinaTex,
      roughness: 0.12,
      metalness: 0.20,
      color: 0xffffff,
      fog: false,
    });

    const woolBoucleRugMat = new THREE.MeshStandardMaterial({
      map: woolRugTex,
      color: 0xb4a48e, // warm sand / taupe woven wool contrasting with the marble floor
      roughness: 0.88,
      metalness: 0.01,
      fog: false,
    });

    const oliveVelvetMat = new THREE.MeshStandardMaterial({
      color: 0x3d462e,
      roughness: 0.85,
      metalness: 0.02,
      fog: false,
    });

    const cashmereThrowMat = new THREE.MeshStandardMaterial({
      color: 0xc2b4a0,
      roughness: 0.90,
      metalness: 0.01,
      fog: false,
    });

    const amberGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0xd68028,
      roughness: 0.06,
      metalness: 0.12,
      transmission: 0.80,
      transparent: true,
      opacity: 0.88,
      ior: 1.52,
      fog: false,
    });

    const darkCeramicMat = new THREE.MeshStandardMaterial({
      color: 0x181716,
      roughness: 0.30,
      metalness: 0.04,
      fog: false,
    });

    const bookTerracottaMat = new THREE.MeshStandardMaterial({
      color: 0x943e2c,
      roughness: 0.65,
      fog: false,
    });

    const bookCharcoalMat = new THREE.MeshStandardMaterial({
      color: 0x1e1e20,
      roughness: 0.60,
      fog: false,
    });

    const bookIvoryMat = new THREE.MeshStandardMaterial({
      color: 0xf2ead6,
      roughness: 0.70,
      fog: false,
    });

    const bookPaperPagesMat = new THREE.MeshStandardMaterial({
      color: 0xfffbf2,
      roughness: 0.88,
      fog: false,
    });

    // Chamber II: Versace Suite Bespoke PBR Materials
    const cordovanLeatherMat = new THREE.MeshStandardMaterial({
      map: cordovanLeatherDiffTex,
      normalMap: cordovanLeatherNormTex,
      normalScale: new THREE.Vector2(0.65, 0.65),
      color: 0x6e2632, // rich Italian cordovan / oxblood leather with warm undertones
      roughness: 0.36,
      metalness: 0.10,
      fog: false,
    });

    const versaceRunnerMat = new THREE.MeshStandardMaterial({
      map: versaceRunnerDiffTex,
      normalMap: versaceRunnerNormTex,
      normalScale: new THREE.Vector2(0.55, 0.55),
      roughness: 0.40,
      metalness: 0.16,
      fog: false,
    });

    const versaceRugMat = new THREE.MeshStandardMaterial({
      map: versaceRugDiffTex,
      roughness: 0.86,
      metalness: 0.02,
      fog: false,
    });

    const champagneSilkMat = new THREE.MeshStandardMaterial({
      color: 0xc4b7a4, // warm oyster / champagne luxury silk with anisotropic sheen
      roughness: 0.42,
      metalness: 0.16,
      fog: false,
    });

    const whiteLinenMat = new THREE.MeshStandardMaterial({
      color: 0xede6da, // soft Egyptian cotton hotel linen (prevents specular blowout)
      roughness: 0.85,
      metalness: 0.01,
      fog: false,
    });

    const emeraldVelvetMat = new THREE.MeshStandardMaterial({
      color: 0x184232, // rich peacock emerald velvet
      roughness: 0.80,
      metalness: 0.03,
      fog: false,
    });

    const smokedOakMat = new THREE.MeshStandardMaterial({
      color: 0x221c17, // deep espresso smoked oak
      roughness: 0.40,
      metalness: 0.06,
      fog: false,
    });

    const frostedGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0xfffcf2,
      roughness: 0.25,
      transmission: 0.84,
      transparent: true,
      opacity: 0.92,
      fog: false,
    });

    const smokedCrystalMat = new THREE.MeshPhysicalMaterial({
      color: 0x6e6862,
      roughness: 0.06,
      metalness: 0.08,
      transmission: 0.88,
      transparent: true,
      opacity: 0.85,
      ior: 1.54,
      fog: false,
    });

    // Chamber III: Sacred Sanctum Bespoke PBR Materials
    const gayatriWallMat = new THREE.MeshStandardMaterial({
      map: gayatriMantraTex,
      roughness: 0.72,
      metalness: 0.04,
      fog: false,
    });

    const sacredHaloMat = new THREE.MeshStandardMaterial({
      map: sacredHaloTex,
      emissiveMap: sacredHaloTex,
      emissive: 0xffd88e,
      emissiveIntensity: 0.35,
      transparent: true,
      roughness: 0.20,
      metalness: 0.06,
      fog: false,
    });

    const mandirCoralDoorMat = new THREE.MeshStandardMaterial({
      map: mandirDoorDiffTex,
      normalMap: mandirDoorNormTex,
      normalScale: new THREE.Vector2(0.85, 0.85),
      roughness: 0.36,
      metalness: 0.06,
      fog: false,
    });

    const sanctumPrayerRugMat = new THREE.MeshStandardMaterial({
      map: sanctumPrayerRugTex,
      roughness: 0.82,
      metalness: 0.03,
      fog: false,
    });

    const sanctumFloorMarbleMat = new THREE.MeshStandardMaterial({
      map: chamberBlackMarbleTex,
      roughness: 0.08,
      metalness: 0.18,
      color: 0xffffff,
      fog: false,
    });

    const sanctumPlasterMat = new THREE.MeshStandardMaterial({
      map: sanctumPlasterTex,
      roughness: 0.88,
      metalness: 0.02,
      fog: false,
    });

    const mandirCountertopMat = new THREE.MeshStandardMaterial({
      color: 0xfffcf7,
      roughness: 0.08,
      metalness: 0.12,
      fog: false,
    });

    const marigoldOrangeMat = new THREE.MeshStandardMaterial({
      color: 0xf57c00, // vibrant auspicious marigold orange
      roughness: 0.85,
      fog: false,
    });

    const marigoldYellowMat = new THREE.MeshStandardMaterial({
      color: 0xfbc02d, // radiant golden yellow marigold
      roughness: 0.85,
      fog: false,
    });

    // Chamber IV: Corporate Reception Bespoke PBR Materials
    const terracottaHerringboneMat = new THREE.MeshStandardMaterial({
      map: terracottaHerringboneTex,
      normalMap: terracottaHerringboneNormTex,
      normalScale: new THREE.Vector2(0.65, 0.65),
      roughness: 0.26, // glazed glossy tile finish
      metalness: 0.08,
      fog: false,
    });

    const laxmiInsigniaMat = new THREE.MeshStandardMaterial({
      map: corporateLaxmiInsigniaTex,
      transparent: true,
      roughness: 0.20,
      metalness: 0.65,
      emissive: 0xffd88e,
      emissiveMap: corporateLaxmiInsigniaTex,
      emissiveIntensity: 0.28,
      fog: false,
    });

    const aubergineWallMat = new THREE.MeshStandardMaterial({
      map: aubergineWallTex,
      roughness: 0.65,
      metalness: 0.04,
      fog: false,
    });

    const plumVelvetRugMat = new THREE.MeshStandardMaterial({
      map: plumVelvetRugTex,
      color: 0x30101e, // intense dark blackberry / royal plum velvet
      roughness: 0.88,
      metalness: 0.04,
      fog: false,
    });

    const wengeTimberMat = new THREE.MeshStandardMaterial({
      map: wengeTimberTex,
      roughness: 0.35,
      metalness: 0.04,
      fog: false,
    });

    const sculpturalBronzeDeskMat = new THREE.MeshStandardMaterial({
      color: 0x8a6e48, // rich luminous warm brushed antique bronze
      roughness: 0.24,
      metalness: 0.82,
    });

    const corporateCognacLeatherMat = new THREE.MeshStandardMaterial({
      map: cognacLeatherDiffTex,
      normalMap: cognacLeatherNormTex,
      normalScale: new THREE.Vector2(0.5, 0.5),
      color: 0xa67648, // refined authentic camel/cognac saddle leather
      roughness: 0.40,
      metalness: 0.04,
      fog: false,
    });

    const powderPinkLacquerMat = new THREE.MeshStandardMaterial({
      color: 0xdfb4ad,
      roughness: 0.28,
      metalness: 0.06,
      fog: false,
    });

    const bearbrickJadeMat = new THREE.MeshPhysicalMaterial({
      color: 0x073523,
      roughness: 0.10,
      metalness: 0.25,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08,
      fog: false,
    });

    const boardroomGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.75,
      opacity: 0.88,
      transparent: true,
      roughness: 0.18,
      ior: 1.52,
      fog: false,
    });

    const frostedManifestationMat = new THREE.MeshPhysicalMaterial({
      color: 0xf8f8f8,
      transmission: 0.45,
      opacity: 0.82,
      transparent: true,
      roughness: 0.48,
      ior: 1.45,
      fog: false,
    });

    const receptionGoldMat = new THREE.MeshStandardMaterial({
      color: 0xc9a961,
      roughness: 0.22,
      metalness: 0.82,
      fog: false,
    });

    const receptionBronzeMat = new THREE.MeshStandardMaterial({
      color: 0x423628,
      roughness: 0.35,
      metalness: 0.75,
      fog: false,
    });

    const neroMarquinaPedestalMat = new THREE.MeshStandardMaterial({
      color: 0x18181a,
      roughness: 0.14,
      metalness: 0.10,
      fog: false,
    });

    // --- 4. SCENE LIGHTING (SYMMETRICALLY BALANCED LUXURY DAYLIGHT) ---
    const hemiLight = new THREE.HemisphereLight(0xfffaee, 0xd8c8b2, 1.45);
    scene.add(hemiLight);

    // Symmetrical balanced sunlight (equal +X and -X angles for identical left/right wall illumination)
    const mainSun = new THREE.DirectionalLight(
      0xfff7e8,
      sceneStateRef.current.introComplete ? 1.10 : 0.0
    );
    mainSun.position.set(8.0, 22.0, -40.0);
    scene.add(mainSun);

    const fillSun = new THREE.DirectionalLight(
      0xfff7e8,
      sceneStateRef.current.introComplete ? 1.10 : 0.0
    );
    fillSun.position.set(-8.0, 22.0, -40.0);
    scene.add(fillSun);

    // Upward architectural fill light illuminating the coffered ceiling tray perfectly on corridor centerline
    const ceilingUpLight = new THREE.DirectionalLight(
      0xfff2da,
      sceneStateRef.current.introComplete ? 1.0 : 0.0
    );
    ceilingUpLight.position.set(0, 1.2, -75.0);
    ceilingUpLight.target.position.set(0, 7.0, -80.0);
    scene.add(ceilingUpLight);
    scene.add(ceilingUpLight.target);

    // --- 5. ENCLOSED CENTRAL CORRIDOR GEOMETRY ---
    const hallWidth = 10;
    const hallHeight = 7.0;
    const hallZStart = 8.0;
    const hallZEnd = -170;
    const hallLength = hallZStart - hallZEnd; // 178m
    const hallZCenter = (hallZStart + hallZEnd) / 2; // -81.0

    // Master Hallway Group (Fully isolated from Door Scene until doors open)
    const hallwayGroup = new THREE.Group();
    hallwayGroup.visible = false; // Isolated by default

    // Dynamic Travelling Wave Light for Progressive Hallway Reveal (Zero dynamic light cost during navigation)
    const waveLight = new THREE.PointLight(0xffe2a4, 0, 36, 1.4);
    waveLight.position.set(0, 5.5, 8.0);
    hallwayGroup.add(waveLight);

    interface BayLightingFixture {
      cz: number;
      lensMat: THREE.MeshStandardMaterial;
      haloMat: THREE.MeshBasicMaterial;
      coveMat: THREE.MeshStandardMaterial;
    }
    const bayLightingFixtures: BayLightingFixture[] = [];
    const archLightingFixtures: { z: number; lensMat: THREE.MeshStandardMaterial }[] = [];
    const sconceLightingFixtures: { z: number; shadeMat: THREE.MeshStandardMaterial; scallopMat: THREE.MeshBasicMaterial }[] = [];
    const muralLightingFixtures: { z: number; lampMat: THREE.MeshStandardMaterial; canvasMat: THREE.MeshStandardMaterial }[] = [];

    // 1. High-Performance Pure Italian Black Marble Floor (Nero Marquina / Portoro)
    const floorGeo = new THREE.PlaneGeometry(hallWidth, hallLength);
    const floorMesh = new THREE.Mesh(floorGeo, corridorFloorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.set(0, 0, hallZCenter);
    hallwayGroup.add(floorMesh);

    // 4. Grounding Contact Shadows along Baseboards
    const leftContactShadow = new THREE.Mesh(
      new THREE.PlaneGeometry(0.4, hallLength),
      contactShadowMat
    );
    leftContactShadow.rotation.x = -Math.PI / 2;
    leftContactShadow.position.set(-hallWidth / 2 + 0.2, 0.004, hallZCenter);

    const rightContactShadow = new THREE.Mesh(
      new THREE.PlaneGeometry(0.4, hallLength),
      contactShadowMat
    );
    rightContactShadow.rotation.x = -Math.PI / 2;
    rightContactShadow.position.set(hallWidth / 2 - 0.2, 0.004, hallZCenter);
    hallwayGroup.add(leftContactShadow, rightContactShadow);

    // 5. Deep 3D Architectural Coffered Ceiling with Recessed Tray & Concealed Cove Lighting
    const ceilGeo = new THREE.PlaneGeometry(hallWidth, hallLength);
    const ceilMesh = new THREE.Mesh(ceilGeo, corridorCeilingMat);
    ceilMesh.rotation.x = Math.PI / 2;
    ceilMesh.position.set(0, hallHeight, hallZCenter);
    hallwayGroup.add(ceilMesh);

    // Deep longitudinal perimeter soffit beams creating recessed central tray
    const soffitWidth = 1.2;
    const soffitDepth = 0.38;
    const leftSoffit = new THREE.Mesh(
      new THREE.BoxGeometry(soffitWidth, soffitDepth, hallLength),
      stoneTrimMat
    );
    leftSoffit.position.set(-hallWidth / 2 + soffitWidth / 2, hallHeight - soffitDepth / 2, hallZCenter);

    const rightSoffit = new THREE.Mesh(
      new THREE.BoxGeometry(soffitWidth, soffitDepth, hallLength),
      stoneTrimMat
    );
    rightSoffit.position.set(hallWidth / 2 - soffitWidth / 2, hallHeight - soffitDepth / 2, hallZCenter);
    hallwayGroup.add(leftSoffit, rightSoffit);

    // Stepped gold reveal molding along inner edge of soffits
    const leftSoffitReveal = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.06, hallLength),
      antiqueGoldMat
    );
    leftSoffitReveal.position.set(-hallWidth / 2 + soffitWidth, hallHeight - soffitDepth, hallZCenter);

    const rightSoffitReveal = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.06, hallLength),
      antiqueGoldMat
    );
    rightSoffitReveal.position.set(hallWidth / 2 - soffitWidth, hallHeight - soffitDepth, hallZCenter);
    hallwayGroup.add(leftSoffitReveal, rightSoffitReveal);

    // --- 5-STAR HOTEL LUXURY COFFERED CEILING SYSTEM ---
    // The central ceiling tray (7.6m wide between soffits) is divided into 12m bays
    // In each bay, a 2 x 3 modular grid of refined coffered cassettes is built with:
    // - Deep stepped architectural moulding (30cm real recess)
    // - Dark shadow reveal perimeter rings creating crisp inner shadow edges
    // - Quilted champagne gold satin panels (#C9A961) with normal map & lighting interaction

    // 1. Primary Transverse Cross Beams every 12 meters
    const baySpanW = hallWidth - soffitWidth * 2; // 7.6m
    for (let cz = hallZStart - 6; cz >= hallZEnd + 6; cz -= 12) {
      // Main cross beam in Ivory Stone Moulding
      const mainBeam = new THREE.Mesh(
        new THREE.BoxGeometry(baySpanW, 0.32, 0.50),
        stoneTrimMat
      );
      mainBeam.position.set(0, hallHeight - 0.16, cz);

      // Fine antique gold reveal bead along center of beam underside
      const mainBeamGold = new THREE.Mesh(
        new THREE.BoxGeometry(baySpanW, 0.015, 0.05),
        antiqueGoldMat
      );
      mainBeamGold.position.set(0, hallHeight - 0.325, cz);
      hallwayGroup.add(mainBeam, mainBeamGold);
    }

    // Modular Coffered Cassettes in Each Bay (2 across X, 3 along Z)
    const numCols = 2; // 2 cassettes across hallway width
    const numRows = 3; // 3 cassettes along length of each 12m bay
    const cassetteW = 3.05; // refined width per cassette
    const cassetteL = 3.10; // refined length per cassette
    const colXPositions = [-1.80, 1.80]; // Left and right cassette centers in X
    const rowZOffsets = [-3.60, 0, 3.60]; // 3 cassette rows per bay

    // Shared geometries for performance
    const panelGeo = new THREE.PlaneGeometry(cassetteW, cassetteL);

    // Bevel frame moulding bars (4 perimeter borders around each cassette, leaving center HOLLOW)
    const borderThick = 0.10; // border moulding width
    const borderDepth = 0.14; // recess depth downward
    const bevelTopBottomGeo = new THREE.BoxGeometry(cassetteW + borderThick * 2, borderDepth, borderThick);
    const bevelLeftRightGeo = new THREE.BoxGeometry(borderThick, borderDepth, cassetteL);

    // Inner gold fillet moulding framing the recessed panel
    const goldFilletTopBottomGeo = new THREE.BoxGeometry(cassetteW, 0.02, 0.035);
    const goldFilletLeftRightGeo = new THREE.BoxGeometry(0.035, 0.02, cassetteL - 0.07);

    // Crisp inner shadow reveal ring
    const shadowTopBottomGeo = new THREE.BoxGeometry(cassetteW, 0.015, 0.02);
    const shadowLeftRightGeo = new THREE.BoxGeometry(0.02, 0.015, cassetteL - 0.04);

    const spineBeamGeo = new THREE.BoxGeometry(0.40, 0.26, 11.2);
    const spineGoldGeo = new THREE.BoxGeometry(0.05, 0.015, 11.2);
    const rowDividerGeo = new THREE.BoxGeometry(baySpanW, 0.22, 0.40);
    const rowDividerGoldGeo = new THREE.BoxGeometry(baySpanW, 0.015, 0.05);

    // Downlight Fixture Shared Geometries (in the center of each coffered square)
    // 1. Toroidal outer gold bezel framing the light
    const downlightOuterTorusGeo = new THREE.TorusGeometry(0.30, 0.038, 12, 24);
    // 2. Inner gold stepped trim ring
    const downlightInnerTorusGeo = new THREE.TorusGeometry(0.20, 0.022, 12, 24);
    // 3. Glowing convex crystal dome projecting downward into the hallway
    const downlightLensDomeGeo = new THREE.SphereGeometry(0.18, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
    // 4. Center sparkling gold rosette jewel
    const downlightJewelGeo = new THREE.OctahedronGeometry(0.045, 0);
    // 5. Radial warm ambient halo wash on ceiling around fixture
    const downlightHaloGeo = new THREE.PlaneGeometry(2.0, 2.0);

    const stoneGeos: THREE.BufferGeometry[] = [];
    const goldGeos: THREE.BufferGeometry[] = [];
    const shadowGeos: THREE.BufferGeometry[] = [];
    const panelGeos: THREE.BufferGeometry[] = [];

    const appendTransformedGeo = (
      targetList: THREE.BufferGeometry[],
      sourceGeo: THREE.BufferGeometry,
      tx: number,
      ty: number,
      tz: number,
      rx = 0,
      ry = 0,
      rz = 0
    ) => {
      let g = sourceGeo.clone();
      if (g.index) {
        g = g.toNonIndexed();
      }
      if (rx !== 0 || ry !== 0 || rz !== 0) {
        g.rotateX(rx);
        g.rotateY(ry);
        g.rotateZ(rz);
      }
      g.translate(tx, ty, tz);
      targetList.push(g);
    };

    for (let cz = hallZStart - 6; cz >= hallZEnd + 6; cz -= 12) {
      appendTransformedGeo(stoneGeos, spineBeamGeo, 0, hallHeight - 0.13, cz);
      appendTransformedGeo(goldGeos, spineGoldGeo, 0, hallHeight - 0.265, cz);

      for (const divZ of [-1.80, 1.80]) {
        appendTransformedGeo(stoneGeos, rowDividerGeo, 0, hallHeight - 0.11, cz + divZ);
        appendTransformedGeo(goldGeos, rowDividerGoldGeo, 0, hallHeight - 0.225, cz + divZ);
      }

      const bayLensGeos: THREE.BufferGeometry[] = [];
      const bayHaloGeos: THREE.BufferGeometry[] = [];

      for (let c = 0; c < numCols; c++) {
        const cx = colXPositions[c];
        for (let r = 0; r < numRows; r++) {
          const rz = cz + rowZOffsets[r];

          // 1. Quilted Champagne Gold Satin Panel
          appendTransformedGeo(panelGeos, panelGeo, cx, hallHeight - 0.01, rz, Math.PI / 2, 0, 0);

          // 2. Stepped Ivory Moulding Border
          appendTransformedGeo(stoneGeos, bevelTopBottomGeo, cx, hallHeight - borderDepth / 2, rz + (cassetteL + borderThick) / 2);
          appendTransformedGeo(stoneGeos, bevelTopBottomGeo, cx, hallHeight - borderDepth / 2, rz - (cassetteL + borderThick) / 2);
          appendTransformedGeo(stoneGeos, bevelLeftRightGeo, cx - (cassetteW + borderThick) / 2, hallHeight - borderDepth / 2, rz);
          appendTransformedGeo(stoneGeos, bevelLeftRightGeo, cx + (cassetteW + borderThick) / 2, hallHeight - borderDepth / 2, rz);

          // 3. Inner Antique Gold Fillet Moulding
          appendTransformedGeo(goldGeos, goldFilletTopBottomGeo, cx, hallHeight - 0.025, rz + (cassetteL - 0.035) / 2);
          appendTransformedGeo(goldGeos, goldFilletTopBottomGeo, cx, hallHeight - 0.025, rz - (cassetteL - 0.035) / 2);
          appendTransformedGeo(goldGeos, goldFilletLeftRightGeo, cx - (cassetteW - 0.035) / 2, hallHeight - 0.025, rz);
          appendTransformedGeo(goldGeos, goldFilletLeftRightGeo, cx + (cassetteW - 0.035) / 2, hallHeight - 0.025, rz);

          // 4. Crisp Dark Shadow Reveal Ring
          appendTransformedGeo(shadowGeos, shadowTopBottomGeo, cx, hallHeight - 0.015, rz + (cassetteL - 0.02) / 2);
          appendTransformedGeo(shadowGeos, shadowTopBottomGeo, cx, hallHeight - 0.015, rz - (cassetteL - 0.02) / 2);
          appendTransformedGeo(shadowGeos, shadowLeftRightGeo, cx - (cassetteW - 0.02) / 2, hallHeight - 0.015, rz);
          appendTransformedGeo(shadowGeos, shadowLeftRightGeo, cx + (cassetteW - 0.02) / 2, hallHeight - 0.015, rz);

          // 5. ARCHITECTURAL DOWNLIGHT IN THE CENTER OF EACH COFFERED SQUARE
          // A. Soft luminous radial glow wash on ceiling around fixture
          appendTransformedGeo(bayHaloGeos, downlightHaloGeo, cx, hallHeight - 0.012, rz, Math.PI / 2, 0, 0);

          // B. Outer Antique Gold Stepped Flange Torus Ring
          appendTransformedGeo(goldGeos, downlightOuterTorusGeo, cx, hallHeight - 0.022, rz, Math.PI / 2, 0, 0);
          appendTransformedGeo(goldGeos, downlightInnerTorusGeo, cx, hallHeight - 0.028, rz, Math.PI / 2, 0, 0);

          // C. Center Sparkling Rosette Jewel
          appendTransformedGeo(goldGeos, downlightJewelGeo, cx, hallHeight - 0.09, rz);

          // D. Radiant Warm Glowing Downlight Lens Dome (faces downwards into room)
          appendTransformedGeo(bayLensGeos, downlightLensDomeGeo, cx, hallHeight - 0.015, rz, Math.PI, 0, 0);
        }
      }

      // Merge and instantiate this bay's downlights and cove lighting
      if (bayLensGeos.length > 0) {
        const mergedBayLenses = BufferGeometryUtils.mergeGeometries(bayLensGeos, false);
        const mergedBayHalos = BufferGeometryUtils.mergeGeometries(bayHaloGeos, false);
        bayLensGeos.forEach((g) => g.dispose());
        bayHaloGeos.forEach((g) => g.dispose());

        const bayLensMat = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          emissive: 0xffe2a4,
          emissiveIntensity: sceneStateRef.current.introComplete ? 3.4 : 0.0,
          roughness: 0.08,
          metalness: 0.02,
          toneMapped: false,
        });

        const bayHaloMat = new THREE.MeshBasicMaterial({
          map: floorSpillTex,
          transparent: true,
          opacity: sceneStateRef.current.introComplete ? 0.70 : 0.0,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });

        const bayCoveMat = new THREE.MeshStandardMaterial({
          color: 0xffe6c2,
          emissive: 0xffc472,
          emissiveIntensity: sceneStateRef.current.introComplete ? 1.5 : 0.0,
          roughness: 0.25,
          metalness: 0.0,
          toneMapped: true,
        });

        const bayLeftCove = new THREE.Mesh(
          new THREE.BoxGeometry(0.12, 0.06, 12),
          bayCoveMat
        );
        bayLeftCove.position.set(-hallWidth / 2 + soffitWidth - 0.06, hallHeight - 0.06, cz);

        const bayRightCove = new THREE.Mesh(
          new THREE.BoxGeometry(0.12, 0.06, 12),
          bayCoveMat
        );
        bayRightCove.position.set(hallWidth / 2 - soffitWidth + 0.06, hallHeight - 0.06, cz);

        hallwayGroup.add(
          new THREE.Mesh(mergedBayLenses, bayLensMat),
          new THREE.Mesh(mergedBayHalos, bayHaloMat),
          bayLeftCove,
          bayRightCove
        );

        bayLightingFixtures.push({
          cz,
          lensMat: bayLensMat,
          haloMat: bayHaloMat,
          coveMat: bayCoveMat,
        });
      }
    }

    if (stoneGeos.length > 0) {
      const mergedStone = BufferGeometryUtils.mergeGeometries(stoneGeos, false);
      const mergedGold = BufferGeometryUtils.mergeGeometries(goldGeos, false);
      const mergedShadow = BufferGeometryUtils.mergeGeometries(shadowGeos, false);
      const mergedPanels = BufferGeometryUtils.mergeGeometries(panelGeos, false);

      stoneGeos.forEach((g) => g.dispose());
      goldGeos.forEach((g) => g.dispose());
      shadowGeos.forEach((g) => g.dispose());
      panelGeos.forEach((g) => g.dispose());

      hallwayGroup.add(
        new THREE.Mesh(mergedStone, stoneTrimMat),
        new THREE.Mesh(mergedGold, antiqueGoldMat),
        new THREE.Mesh(mergedShadow, cofferShadowMat),
        new THREE.Mesh(mergedPanels, luxuryCofferMat)
      );
    }

    // --- 6 TRANSVERSE ARCHES ACROSS THE CORRIDOR (CURATED ARCHITECTURAL SPACING) ---
    const transverseArchZ = [-20, -45, -70, -95, -120, -145];
    const archBeamGeo = new THREE.BoxGeometry(hallWidth, 0.6, 0.8);
    const archRevealGeo = new THREE.BoxGeometry(hallWidth + 0.05, 0.06, 0.85);
    const archPilasterGeo = new THREE.BoxGeometry(0.5, hallHeight, 0.8);
    const archKeystoneGeo = new THREE.BoxGeometry(0.4, 0.75, 0.9);
    const archLensGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.03, 16);

    const archStoneGeos: THREE.BufferGeometry[] = [];
    const archGoldGeos: THREE.BufferGeometry[] = [];
    const archOakGeos: THREE.BufferGeometry[] = [];

    transverseArchZ.forEach((az, i) => {
      // Overhead transverse beam spanning the corridor
      appendTransformedGeo(archStoneGeos, archBeamGeo, 0, hallHeight - 0.3, az);

      // Gold reveal molding along lower beam edge
      appendTransformedGeo(archGoldGeos, archRevealGeo, 0, hallHeight - 0.6, az);

      // Wall pilasters are bracketed symmetrically at the door edges in the portal frame system below (zero entrance-bisecting columns)

      // Center Keystone with Roman Numeral Plaque in Antique Gold
      appendTransformedGeo(archGoldGeos, archKeystoneGeo, 0, hallHeight - 0.32, az);

      // Architectural Emissive Downlight Fixture (zero dynamic light cost)
      const archLensMat = new THREE.MeshStandardMaterial({
        color: 0xffe6c2,
        emissive: 0xffc472,
        emissiveIntensity: sceneStateRef.current.introComplete ? 1.5 : 0.0,
        roughness: 0.25,
        metalness: 0.0,
        toneMapped: true,
      });
      const archLens = new THREE.Mesh(archLensGeo, archLensMat);
      archLens.position.set(0, hallHeight - 0.52, az);
      archLightingFixtures.push({ z: az, lensMat: archLensMat });
      hallwayGroup.add(archLens);
    });

    if (archStoneGeos.length > 0) {
      const mergedArchStone = BufferGeometryUtils.mergeGeometries(archStoneGeos, false);
      archStoneGeos.forEach((g) => g.dispose());
      hallwayGroup.add(new THREE.Mesh(mergedArchStone, stoneTrimMat));
    }
    if (archGoldGeos.length > 0) {
      const mergedArchGold = BufferGeometryUtils.mergeGeometries(archGoldGeos, false);
      archGoldGeos.forEach((g) => g.dispose());
      hallwayGroup.add(new THREE.Mesh(mergedArchGold, antiqueGoldMat));
    }
    if (archOakGeos.length > 0) {
      const mergedArchOak = BufferGeometryUtils.mergeGeometries(archOakGeos, false);
      archOakGeos.forEach((g) => g.dispose());
      hallwayGroup.add(new THREE.Mesh(mergedArchOak, flutedOakMat));
    }

    // Corridor Start Wall at Z = +15
    const startWall = new THREE.Mesh(
      new THREE.PlaneGeometry(hallWidth, hallHeight),
      corridorWallMat
    );
    startWall.position.set(0, hallHeight / 2, hallZStart);
    startWall.rotation.y = Math.PI;
    hallwayGroup.add(startWall);

    // --- GRAND ENTRANCE DOOR OPENING GATE & ENCLOSURE AT Z = 8.2 ---
    const createLuxuryDoorWoodTexture = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1024;
      canvas.height = 1024;
      const ctx = canvas.getContext("2d");
      if (!ctx) return new THREE.CanvasTexture(canvas);

      // Deep rich dark walnut / ebony stained timber background
      const baseGrad = ctx.createLinearGradient(0, 0, 1024, 0);
      baseGrad.addColorStop(0, "#19120c");
      baseGrad.addColorStop(0.25, "#261c14");
      baseGrad.addColorStop(0.5, "#1e150f");
      baseGrad.addColorStop(0.75, "#2a1e16");
      baseGrad.addColorStop(1, "#18110b");
      ctx.fillStyle = baseGrad;
      ctx.fillRect(0, 0, 1024, 1024);

      // Vertical organic wood grain flows with undulating fibers
      for (let x = 0; x < 1024; x += 1.5) {
        ctx.beginPath();
        const baseAlpha = 0.05 + Math.random() * 0.12;
        const isWarmStrand = Math.random() > 0.52;
        ctx.strokeStyle = isWarmStrand
          ? `rgba(78, 50, 32, ${baseAlpha})`
          : `rgba(12, 8, 5, ${baseAlpha * 1.4})`;
        ctx.lineWidth = 0.8 + Math.random() * 1.8;

        let curX = x;
        ctx.moveTo(curX, 0);
        for (let y = 0; y < 1024; y += 32) {
          curX += Math.sin((y + x * 2) * 0.015) * 1.3 + (Math.random() - 0.5) * 0.9;
          ctx.lineTo(curX, y);
        }
        ctx.stroke();
      }

      // Rich burled grain pores and luxury satin lacquer sheen wash
      for (let i = 0; i < 70; i++) {
        const knotY = Math.random() * 1024;
        const knotX = Math.random() * 1024;
        const radX = 8 + Math.random() * 26;
        const radY = 40 + Math.random() * 120;
        const knotGrad = ctx.createRadialGradient(knotX, knotY, 2, knotX, knotY, radY);
        knotGrad.addColorStop(0, "rgba(46, 28, 18, 0.32)");
        knotGrad.addColorStop(0.6, "rgba(24, 15, 10, 0.14)");
        knotGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = knotGrad;
        ctx.beginPath();
        ctx.ellipse(knotX, knotY, radX, radY, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Subtle fine micro-pores and satin luster speckles
      ctx.fillStyle = "rgba(235, 190, 125, 0.018)";
      for (let i = 0; i < 3500; i++) {
        ctx.fillRect(Math.random() * 1024, Math.random() * 1024, 1, 1);
      }

      const tex = new THREE.CanvasTexture(canvas);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    };

    const createDoorWoodNormalTexture = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext("2d");
      if (!ctx) return new THREE.CanvasTexture(canvas);

      // Default tangent flat normal: RGB(128, 128, 255)
      ctx.fillStyle = "rgb(128, 128, 255)";
      ctx.fillRect(0, 0, 512, 512);

      // Fine vertical relief ripples
      for (let x = 0; x < 512; x += 2) {
        const delta = Math.floor((Math.random() - 0.5) * 32);
        const r = 128 + delta;
        const b = 255;
        const g = 128 + Math.floor(delta * 0.4);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.24)`;
        ctx.fillRect(x, 0, 1, 512);
      }

      const tex = new THREE.CanvasTexture(canvas);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      return tex;
    };

    const createPlaqueTexture = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1024;
      canvas.height = 256;
      const ctx = canvas.getContext("2d");
      if (!ctx) return new THREE.CanvasTexture(canvas);

      // Deep brushed patinated bronze gradient background
      const grad = ctx.createLinearGradient(0, 0, 1024, 256);
      grad.addColorStop(0, "#191410");
      grad.addColorStop(0.3, "#271f18");
      grad.addColorStop(0.7, "#221a14");
      grad.addColorStop(1, "#16120e");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1024, 256);

      // Fine brushed metallic horizontal brush streaks
      ctx.fillStyle = "rgba(212, 175, 55, 0.04)";
      for (let i = 0; i < 45; i++) {
        ctx.fillRect(0, Math.random() * 256, 1024, 1 + Math.random() * 2);
      }

      // Outer Gilded Filigree Border
      ctx.strokeStyle = "#c59b48";
      ctx.lineWidth = 6;
      ctx.strokeRect(12, 12, 1000, 232);

      // Inner Gold Inlay Line
      ctx.strokeStyle = "#e5c38c";
      ctx.lineWidth = 2;
      ctx.strokeRect(22, 22, 980, 212);

      // Corner Rosette Accents
      ctx.fillStyle = "#e5c38c";
      [[22, 22], [1002, 22], [22, 234], [1002, 234]].forEach(([cx, cy]) => {
        ctx.beginPath();
        ctx.arc(cx, cy, 5, 0, Math.PI * 2);
        ctx.fill();
      });

      // Typography 1: "GOPAL LAHOTI"
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "bold 56px 'Cinzel', 'Playfair Display', 'Georgia', serif";

      // Chiseled drop shadow
      ctx.fillStyle = "rgba(0, 0, 0, 0.88)";
      ctx.fillText("G O P A L   L A H O T I", 514, 104);

      // Gilded leaf fill
      const textGrad = ctx.createLinearGradient(0, 70, 0, 138);
      textGrad.addColorStop(0, "#fff5d9");
      textGrad.addColorStop(0.4, "#e5c38c");
      textGrad.addColorStop(0.8, "#b8975a");
      textGrad.addColorStop(1, "#8a6c35");
      ctx.fillStyle = textGrad;
      ctx.fillText("G O P A L   L A H O T I", 512, 102);

      // Center Dividing Gold Diamond Rule
      ctx.strokeStyle = "#b8975a";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(330, 146);
      ctx.lineTo(465, 146);
      ctx.moveTo(559, 146);
      ctx.lineTo(694, 146);
      ctx.stroke();

      ctx.fillStyle = "#e5c38c";
      ctx.beginPath();
      ctx.moveTo(512, 141);
      ctx.lineTo(517, 146);
      ctx.lineTo(512, 151);
      ctx.lineTo(507, 146);
      ctx.closePath();
      ctx.fill();

      // Typography 2: "HOUSE OF INTERIORS"
      ctx.font = "600 23px 'Cinzel', 'Playfair Display', 'Georgia', serif";
      ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
      ctx.fillText("H O U S E   O F   I N T E R I O R S", 513, 183);

      const subGrad = ctx.createLinearGradient(0, 170, 0, 198);
      subGrad.addColorStop(0, "#f4ede3");
      subGrad.addColorStop(1, "#c9a961");
      ctx.fillStyle = subGrad;
      ctx.fillText("H O U S E   O F   I N T E R I O R S", 512, 182);

      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    };

    const buildGrandEntranceDoor = () => {
      const doorGroup = new THREE.Group();
      doorGroup.position.set(0, 0, 8.2);

      // 1. Massive Outer Stone Portal Arch & Jambs
      const leftJamb = new THREE.Mesh(
        new THREE.BoxGeometry(0.74, 4.8, 0.45),
        stoneTrimMat
      );
      leftJamb.position.set(-2.15, 2.4, 0);

      const rightJamb = new THREE.Mesh(
        new THREE.BoxGeometry(0.74, 4.8, 0.45),
        stoneTrimMat
      );
      rightJamb.position.set(2.15, 2.4, 0);

      const plinthGeo = new THREE.BoxGeometry(0.85, 0.25, 0.55);
      const leftPlinth = new THREE.Mesh(plinthGeo, antiqueGoldMat);
      leftPlinth.position.set(-2.15, 0.125, 0);
      const rightPlinth = new THREE.Mesh(plinthGeo, antiqueGoldMat);
      rightPlinth.position.set(2.15, 0.125, 0);

      const capGeo = new THREE.BoxGeometry(0.85, 0.22, 0.55);
      const leftCap = new THREE.Mesh(capGeo, antiqueGoldMat);
      leftCap.position.set(-2.15, 4.8, 0);
      const rightCap = new THREE.Mesh(capGeo, antiqueGoldMat);
      rightCap.position.set(2.15, 4.8, 0);

      // Stepped Stone Lintel Header
      const lintel = new THREE.Mesh(
        new THREE.BoxGeometry(5.2, 0.85, 0.52),
        stoneTrimMat
      );
      lintel.position.set(0, 5.25, 0);

      // Thickened Substantial Gilded Arch Molding Trims (3-tier stepped gold profile framing doors)
      const leftGoldReveal = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 4.7, 0.52),
        antiqueGoldMat
      );
      leftGoldReveal.position.set(-1.80, 2.35, 0);

      const rightGoldReveal = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 4.7, 0.52),
        antiqueGoldMat
      );
      rightGoldReveal.position.set(1.80, 2.35, 0);

      const topGoldReveal = new THREE.Mesh(
        new THREE.BoxGeometry(3.72, 0.12, 0.52),
        antiqueGoldMat
      );
      topGoldReveal.position.set(0, 4.75, 0);

      // Center Keystone crowning the arch lintel header
      const keystone = new THREE.Mesh(
        new THREE.BoxGeometry(0.48, 0.28, 0.25),
        antiqueGoldMat
      );
      keystone.position.set(0, 5.80, 0.20);

      // 2. GOPAL LAHOTI — HOUSE OF INTERIORS Architectural Bronze Plaque with Drop Shadow
      const plaqueTex = createPlaqueTexture();
      const plaqueMat = new THREE.MeshStandardMaterial({
        map: plaqueTex,
        roughness: 0.28,
        metalness: 0.55,
        fog: false,
      });
      const plaqueMesh = new THREE.Mesh(
        new THREE.BoxGeometry(3.6, 0.72, 0.04),
        plaqueMat
      );
      plaqueMesh.position.set(0, 5.25, 0.28);

      const plaqueGoldFrame = new THREE.Mesh(
        new THREE.BoxGeometry(3.68, 0.80, 0.02),
        antiqueGoldMat
      );
      plaqueGoldFrame.position.set(0, 5.25, 0.27);

      const plaqueShadow = new THREE.Mesh(
        new THREE.PlaneGeometry(3.76, 0.88),
        contactShadowMat
      );
      plaqueShadow.position.set(0, 5.24, 0.255);

      // 3. Monumental 60m Palace Portico Facade & Exterior Architecture (100% full-span isolation across all viewports)
      const facadeLeft = new THREE.Mesh(
        new THREE.BoxGeometry(28.2, 18.0, 0.45),
        corridorWallMat
      );
      facadeLeft.position.set(-15.9, 9.0, 0);

      const facadeRight = new THREE.Mesh(
        new THREE.BoxGeometry(28.2, 18.0, 0.45),
        corridorWallMat
      );
      facadeRight.position.set(15.9, 9.0, 0);

      const facadeTop = new THREE.Mesh(
        new THREE.BoxGeometry(3.6, 13.3, 0.45),
        corridorWallMat
      );
      facadeTop.position.set(0, 11.35, 0);

      // Classical Entablature & Cornice Banding across entire 60m facade
      const facadeArchitrave = new THREE.Mesh(
        new THREE.BoxGeometry(60.0, 0.35, 0.30),
        stoneTrimMat
      );
      facadeArchitrave.position.set(0, 6.20, 0.20);

      const facadeFriezeGold = new THREE.Mesh(
        new THREE.BoxGeometry(60.0, 0.06, 0.34),
        antiqueGoldMat
      );
      facadeFriezeGold.position.set(0, 6.40, 0.20);

      const facadeCornice = new THREE.Mesh(
        new THREE.BoxGeometry(60.0, 0.45, 0.42),
        stoneTrimMat
      );
      facadeCornice.position.set(0, 6.65, 0.22);

      const facadeTopCornice = new THREE.Mesh(
        new THREE.BoxGeometry(60.0, 0.60, 0.50),
        stoneTrimMat
      );
      facadeTopCornice.position.set(0, 17.7, 0.25);

      // Classical Facade Baseboards
      const facadeBaseLeft = new THREE.Mesh(
        new THREE.BoxGeometry(28.2, 0.35, 0.12),
        stoneTrimMat
      );
      facadeBaseLeft.position.set(-15.9, 0.175, 0.25);

      const facadeBaseRight = new THREE.Mesh(
        new THREE.BoxGeometry(28.2, 0.35, 0.12),
        stoneTrimMat
      );
      facadeBaseRight.position.set(15.9, 0.175, 0.25);

      const facadeBaseGoldLeft = new THREE.Mesh(
        new THREE.BoxGeometry(28.2, 0.04, 0.14),
        antiqueGoldMat
      );
      facadeBaseGoldLeft.position.set(-15.9, 0.37, 0.25);

      const facadeBaseGoldRight = new THREE.Mesh(
        new THREE.BoxGeometry(28.2, 0.04, 0.14),
        antiqueGoldMat
      );
      facadeBaseGoldRight.position.set(15.9, 0.37, 0.25);

      // Flanking Architectural Pilasters & Exterior Bronze Sconces
      const pilasterGroup = new THREE.Group();
      const pilasterXs = [-3.8, 3.8, -8.5, 8.5, -14.5, 14.5, -21.0, 21.0];
      pilasterXs.forEach((px, pIdx) => {
        const pShaft = new THREE.Mesh(
          new THREE.BoxGeometry(0.70, 5.8, 0.18),
          stoneTrimMat
        );
        pShaft.position.set(px, 2.9, 0.28);

        const pBase = new THREE.Mesh(
          new THREE.BoxGeometry(0.82, 0.30, 0.22),
          antiqueGoldMat
        );
        pBase.position.set(px, 0.15, 0.30);

        const pCap = new THREE.Mesh(
          new THREE.BoxGeometry(0.85, 0.28, 0.24),
          antiqueGoldMat
        );
        pCap.position.set(px, 5.95, 0.30);

        pilasterGroup.add(pShaft, pBase, pCap);

        // Exterior Bronze Wall Lanterns on primary flanking pilasters
        if (Math.abs(px) === 3.8 || Math.abs(px) === 8.5) {
          const lanternGroup = new THREE.Group();
          lanternGroup.position.set(px, 3.6, 0.40);

          const lPlate = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.55, 0.04), darkBronzeMat);
          const lArm = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.22), darkBronzeMat);
          lArm.position.set(0, 0, 0.11);

          const lLantern = new THREE.Mesh(
            new THREE.CylinderGeometry(0.07, 0.05, 0.32, 8),
            new THREE.MeshStandardMaterial({
              color: 0xffedd0,
              emissive: 0xffcb70,
              emissiveIntensity: 1.8,
              roughness: 0.2,
            })
          );
          lLantern.position.set(0, 0, 0.22);

          const lCap = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.10, 8), darkBronzeMat);
          lCap.position.set(0, 0.21, 0.22);

          const lScallop = new THREE.Mesh(
            new THREE.PlaneGeometry(1.4, 2.0),
            new THREE.MeshBasicMaterial({
              map: scallopGlowTex,
              transparent: true,
              opacity: 0.55,
              blending: THREE.AdditiveBlending,
              depthWrite: false,
            })
          );
          lScallop.position.set(0, -0.9, 0.01);

          lanternGroup.add(lPlate, lArm, lLantern, lCap, lScallop);
          pilasterGroup.add(lanternGroup);
        }
      });

      // Honed Portico Floor, Coffered Ceiling, and Side Return Walls
      const porticoFloor = new THREE.Mesh(
        new THREE.PlaneGeometry(60.0, 32.0),
        corridorFloorMat
      );
      porticoFloor.rotation.x = -Math.PI / 2;
      porticoFloor.position.set(0, -0.005, 16.0);

      const porticoCeilingMat = new THREE.MeshStandardMaterial({
        color: 0xfbf6ee,
        roughness: 0.60,
      });

      const porticoCeiling = new THREE.Mesh(
        new THREE.PlaneGeometry(60.0, 32.0),
        porticoCeilingMat
      );
      porticoCeiling.rotation.x = Math.PI / 2;
      porticoCeiling.position.set(0, 18.0, 16.0);

      const porticoWallLeft = new THREE.Mesh(
        new THREE.PlaneGeometry(32.0, 18.0),
        corridorWallMat
      );
      porticoWallLeft.rotation.y = Math.PI / 2;
      porticoWallLeft.position.set(-30.0, 9.0, 16.0);

      const porticoWallRight = new THREE.Mesh(
        new THREE.PlaneGeometry(32.0, 18.0),
        corridorWallMat
      );
      porticoWallRight.rotation.y = -Math.PI / 2;
      porticoWallRight.position.set(30.0, 9.0, 16.0);

      // Portico Ambient Fill Key Light (illuminates portico & columns, bounded to exterior)
      const porticoFill = new THREE.SpotLight(0xffecd4, 1.45, 26.0, Math.PI / 3.0, 0.45, 1.2);
      porticoFill.position.set(0, 12.0, 18.0);
      porticoFill.target.position.set(0, 3.0, 0);

      // 4. Bespoke Luxury Dark Walnut Timber Materials & Carved Boiserie
      const doorWoodTex = createLuxuryDoorWoodTexture();
      const doorWoodNormTex = createDoorWoodNormalTexture();

      const doorWoodMat = new THREE.MeshStandardMaterial({
        map: doorWoodTex,
        normalMap: doorWoodNormTex,
        normalScale: new THREE.Vector2(0.35, 0.35),
        color: 0xffffff,
        roughness: 0.24, // satin lacquer polished sheen
        metalness: 0.10, // rich specular response
        fog: false,
      });

      const doorFieldPanelMat = new THREE.MeshStandardMaterial({
        map: doorWoodTex,
        normalMap: doorWoodNormTex,
        normalScale: new THREE.Vector2(0.55, 0.55),
        color: 0xf5ebe0,
        roughness: 0.20,
        metalness: 0.12,
        fog: false,
      });

      const doorBrassHardwareMat = new THREE.MeshStandardMaterial({
        color: 0xe8c488,
        roughness: 0.20, // highly polished cast brass
        metalness: 0.88, // strong metallic highlights
        fog: false,
      });

      const doorRosetteMat = new THREE.MeshStandardMaterial({
        color: 0xf5d398,
        roughness: 0.18,
        metalness: 0.92,
        fog: false,
      });

      const doorShadowBedMat = new THREE.MeshStandardMaterial({
        color: 0x0a0705,
        roughness: 0.95,
        metalness: 0.0,
        fog: false,
      });

      // Helper to build raised boiserie panels, rosettes and gold fillets on a door leaf
      const buildLeafPanels = (parent: THREE.Object3D, leafCenterX: number, isRightLeaf: boolean) => {
        // 1. Structural Stile & Rail Outer Door Core Slab
        const slab = new THREE.Mesh(
          new THREE.BoxGeometry(1.74, 4.65, 0.12),
          doorWoodMat
        );
        slab.position.set(leafCenterX, 2.325, 0);
        parent.add(slab);

        // 2. Heavy Architectural Cast Brass Butt Hinges (3 hinges per leaf mounted on outer edge)
        const hingeX = isRightLeaf ? leafCenterX + 0.87 : leafCenterX - 0.87;
        const hingeFacing = isRightLeaf ? 1 : -1;
        const hingeYs = [0.90, 2.35, 3.90];

        hingeYs.forEach((hy) => {
          const hingeGroup = new THREE.Group();
          hingeGroup.position.set(hingeX, hy, 0.05);

          // Brass Hinge Leaf Plate
          const leafPlate = new THREE.Mesh(
            new THREE.BoxGeometry(0.06, 0.22, 0.015),
            doorBrassHardwareMat
          );
          leafPlate.position.set(-hingeFacing * 0.025, 0, 0);

          // Cylindrical Hinge Barrel / Knuckle
          const barrel = new THREE.Mesh(
            new THREE.CylinderGeometry(0.022, 0.022, 0.24, 16),
            doorBrassHardwareMat
          );
          barrel.position.set(0, 0, 0.01);

          // Top & Bottom Acorn Finials
          const acornTop = new THREE.Mesh(
            new THREE.SphereGeometry(0.022, 12, 12),
            doorBrassHardwareMat
          );
          acornTop.position.set(0, 0.13, 0.01);
          const acornBottom = new THREE.Mesh(
            new THREE.SphereGeometry(0.022, 12, 12),
            doorBrassHardwareMat
          );
          acornBottom.position.set(0, -0.13, 0.01);

          hingeGroup.add(leafPlate, barrel, acornTop, acornBottom);
          parent.add(hingeGroup);
        });

        // 3. 4 Tiers of Real 3D Raised & Recessed Joinery Panels on Front Face (+Z)
        const panelConfigs = [
          { y: 0.55, h: 0.68 },  // Tier 1: Heavy lower kick panel
          { y: 1.62, h: 1.12 },  // Tier 2: Lower grand field panel
          { y: 2.98, h: 1.12 },  // Tier 3: Upper grand field panel
          { y: 4.10, h: 0.62 },  // Tier 4: Classical upper header panel
        ];

        panelConfigs.forEach((cfg) => {
          const pW = 1.34;
          const pH = cfg.h;

          // Layer A: Recessed Dark Shadow Bed (creates deep carved reveal pocket)
          const shadowBed = new THREE.Mesh(
            new THREE.BoxGeometry(pW + 0.06, pH + 0.06, 0.02),
            doorShadowBedMat
          );
          shadowBed.position.set(leafCenterX, cfg.y, 0.062);

          // Layer B: Substantial Outer Antique Gold Stepped Bevel Frame (width 0.045m, depth 0.035m)
          const outerFrameTop = new THREE.Mesh(new THREE.BoxGeometry(pW + 0.06, 0.045, 0.035), antiqueGoldMat);
          outerFrameTop.position.set(leafCenterX, cfg.y + pH / 2, 0.075);
          const outerFrameBottom = new THREE.Mesh(new THREE.BoxGeometry(pW + 0.06, 0.045, 0.035), antiqueGoldMat);
          outerFrameBottom.position.set(leafCenterX, cfg.y - pH / 2, 0.075);
          const outerFrameLeft = new THREE.Mesh(new THREE.BoxGeometry(0.045, pH - 0.04, 0.035), antiqueGoldMat);
          outerFrameLeft.position.set(leafCenterX - pW / 2, cfg.y, 0.075);
          const outerFrameRight = new THREE.Mesh(new THREE.BoxGeometry(0.045, pH - 0.04, 0.035), antiqueGoldMat);
          outerFrameRight.position.set(leafCenterX + pW / 2, cfg.y, 0.075);

          // Layer C: Raised Solid Timber Field Panel (beveled center with prominent tactile relief)
          const raisedField = new THREE.Mesh(
            new THREE.BoxGeometry(pW - 0.06, pH - 0.06, 0.035),
            doorFieldPanelMat
          );
          raisedField.position.set(leafCenterX, cfg.y, 0.082);

          // Layer D: Inner Gilded Fillet Bead
          const innerFilletTop = new THREE.Mesh(new THREE.BoxGeometry(pW - 0.12, 0.022, 0.02), antiqueGoldMat);
          innerFilletTop.position.set(leafCenterX, cfg.y + (pH - 0.16) / 2, 0.098);
          const innerFilletBottom = new THREE.Mesh(new THREE.BoxGeometry(pW - 0.12, 0.022, 0.02), antiqueGoldMat);
          innerFilletBottom.position.set(leafCenterX, cfg.y - (pH - 0.16) / 2, 0.098);
          const innerFilletLeft = new THREE.Mesh(new THREE.BoxGeometry(0.022, pH - 0.18, 0.02), antiqueGoldMat);
          innerFilletLeft.position.set(leafCenterX - (pW - 0.16) / 2, cfg.y, 0.098);
          const innerFilletRight = new THREE.Mesh(new THREE.BoxGeometry(0.022, pH - 0.18, 0.02), antiqueGoldMat);
          innerFilletRight.position.set(leafCenterX + (pW - 0.16) / 2, cfg.y, 0.098);

          // Layer E: 4 Cast Antique Brass Corner Rosettes / Medallions
          const rosetGeo = new THREE.CylinderGeometry(0.028, 0.032, 0.015, 16);
          rosetGeo.rotateX(Math.PI / 2);
          const rosetOffsets = [
            [- (pW - 0.16) / 2, (pH - 0.16) / 2],
            [(pW - 0.16) / 2, (pH - 0.16) / 2],
            [- (pW - 0.16) / 2, - (pH - 0.16) / 2],
            [(pW - 0.16) / 2, - (pH - 0.16) / 2],
          ];
          rosetOffsets.forEach(([rx, ry]) => {
            const roset = new THREE.Mesh(rosetGeo, doorRosetteMat);
            roset.position.set(leafCenterX + rx, cfg.y + ry, 0.105);
            parent.add(roset);
          });

          parent.add(
            shadowBed,
            outerFrameTop, outerFrameBottom, outerFrameLeft, outerFrameRight,
            raisedField,
            innerFilletTop, innerFilletBottom, innerFilletLeft, innerFilletRight
          );
        });
      };

      // Helper to build vertical sculpted heavy brass pull handle
      const buildHandle = (parent: THREE.Object3D, posX: number) => {
        const handleGroup = new THREE.Group();
        handleGroup.position.set(posX, 2.30, 0.07);

        // 1. Heavy Cast Brass Escutcheon Backplate (1.10m tall with beveled profile)
        const escutcheon = new THREE.Mesh(
          new THREE.BoxGeometry(0.15, 1.10, 0.03),
          doorBrassHardwareMat
        );
        escutcheon.position.set(0, 0, 0.015);

        // Stepped backplate gold trim
        const escutcheonTrim = new THREE.Mesh(
          new THREE.BoxGeometry(0.165, 1.115, 0.015),
          antiqueGoldMat
        );
        escutcheonTrim.position.set(0, 0, 0.007);

        // 2. Sculptural Top & Bottom Mounting Posts
        const postTop = new THREE.Mesh(
          new THREE.CylinderGeometry(0.026, 0.034, 0.07, 16),
          doorBrassHardwareMat
        );
        postTop.rotation.x = Math.PI / 2;
        postTop.position.set(0, 0.38, 0.055);

        const postBottom = new THREE.Mesh(
          new THREE.CylinderGeometry(0.026, 0.034, 0.07, 16),
          doorBrassHardwareMat
        );
        postBottom.rotation.x = Math.PI / 2;
        postBottom.position.set(0, -0.38, 0.055);

        // 3. Fluted Cylindrical Pull Bar
        const pullBar = new THREE.Mesh(
          new THREE.CylinderGeometry(0.032, 0.032, 0.92, 24),
          doorBrassHardwareMat
        );
        pullBar.position.set(0, 0, 0.09);

        // Top & Bottom Turned Acorn Finials
        const finialTop = new THREE.Mesh(
          new THREE.ConeGeometry(0.032, 0.08, 16),
          doorBrassHardwareMat
        );
        finialTop.position.set(0, 0.50, 0.09);

        const finialBottom = new THREE.Mesh(
          new THREE.ConeGeometry(0.032, 0.08, 16),
          doorBrassHardwareMat
        );
        finialBottom.rotation.x = Math.PI;
        finialBottom.position.set(0, -0.50, 0.09);

        // 4. Classical Sculpted Lion Head / Gilded Knocker Ring Medallion
        const knockerPlate = new THREE.Mesh(
          new THREE.CylinderGeometry(0.055, 0.055, 0.025, 24),
          doorBrassHardwareMat
        );
        knockerPlate.rotation.x = Math.PI / 2;
        knockerPlate.position.set(0, 0.12, 0.035);

        const knockerRing = new THREE.Mesh(
          new THREE.TorusGeometry(0.075, 0.016, 16, 32),
          doorBrassHardwareMat
        );
        knockerRing.position.set(0, 0.07, 0.06);

        handleGroup.add(
          escutcheonTrim, escutcheon,
          postTop, postBottom,
          pullBar, finialTop, finialBottom,
          knockerPlate, knockerRing
        );
        parent.add(handleGroup);
        return handleGroup;
      };

      // Left Door Pivot (hinge at X = -1.78)
      const leftPivot = new THREE.Group();
      leftPivot.position.set(-1.78, 0, 0);
      buildLeafPanels(leftPivot, 0.87, false);
      const leftHandle = buildHandle(leftPivot, 1.54);

      // Right Door Pivot (hinge at X = +1.78)
      const rightPivot = new THREE.Group();
      rightPivot.position.set(1.78, 0, 0);
      buildLeafPanels(rightPivot, -0.87, true);
      const rightHandle = buildHandle(rightPivot, -1.54);

      // Central Gold Astragal Lip (overlap bead along inner edge of right leaf)
      const astragal = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 4.65, 0.045),
        antiqueGoldMat
      );
      astragal.position.set(-0.025, 2.325, 0.07);
      rightPivot.add(astragal);

      // 5. Ambient Light Slit & Floor Spill (pulsing warm glow hinting at grandeur inside)
      // Core bright light slit
      const crackMat = new THREE.MeshBasicMaterial({
        color: 0xfff4d2,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
      });
      const crackSlit = new THREE.Mesh(
        new THREE.PlaneGeometry(0.03, 4.65),
        crackMat
      );
      crackSlit.position.set(0, 2.325, 0.12);

      // Soft ambient bloom halo bleed along the seam
      const crackGlowMat = new THREE.MeshBasicMaterial({
        color: 0xffb040,
        transparent: true,
        opacity: 0.55,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const crackGlow = new THREE.Mesh(
        new THREE.PlaneGeometry(0.24, 4.65),
        crackGlowMat
      );
      crackGlow.position.set(0, 2.325, 0.11);

      // Floor spill fanning outward
      const floorCrackMat = new THREE.MeshBasicMaterial({
        map: floorSpillTex,
        transparent: true,
        opacity: 0.65,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const floorSpill = new THREE.Mesh(
        new THREE.PlaneGeometry(3.6, 2.4),
        floorCrackMat
      );
      floorSpill.rotation.x = -Math.PI / 2;
      floorSpill.position.set(0, 0.006, 1.2);

      // 6. Volumetric Golden Light Flood Quad (bursts into full radiance on opening)
      const floodMat = new THREE.MeshBasicMaterial({
        color: 0xffe2a4,
        transparent: true,
        opacity: 0.0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const lightFlood = new THREE.Mesh(
        new THREE.PlaneGeometry(3.6, 4.7),
        floodMat
      );
      lightFlood.position.set(0, 2.325, -0.1);

      // 7. Dark Interior Occluder (prevents hallway interior daylight leaking before doors open)
      const doorBackerMat = new THREE.MeshBasicMaterial({
        color: 0x140e0b,
        transparent: true,
        opacity: 1.0,
        depthWrite: false,
      });
      const doorBacker = new THREE.Mesh(
        new THREE.PlaneGeometry(3.56, 4.65),
        doorBackerMat
      );
      doorBacker.position.set(0, 2.325, -0.04);

      // 8. Ground Brass Threshold Plate
      const thresholdPlate = new THREE.Mesh(
        new THREE.BoxGeometry(3.6, 0.015, 0.35),
        antiqueGoldMat
      );
      thresholdPlate.position.set(0, 0.008, 0);

      // 9. DEDICATED ARCHITECTURAL DOOR LIGHTING SYSTEM
      // A. Directional Golden Key Spotlight (angled high-right to rake across panels, bevels and brass, bounded to exterior)
      const doorKeyLight = new THREE.SpotLight(0xffeed2, 3.2, 9.0, Math.PI / 3.0, 0.45, 1.2);
      doorKeyLight.position.set(3.5, 5.2, 5.2);
      doorKeyLight.target.position.set(0, 2.4, 0);
      doorGroup.add(doorKeyLight, doorKeyLight.target);

      // B. Warm Golden Ground Grazing Uplight from Threshold
      const doorUplight = new THREE.PointLight(0xffb84d, 1.8, 6.5, 1.2);
      doorUplight.position.set(0, 0.12, 1.2);
      doorGroup.add(doorUplight);

      // Assembly
      doorGroup.add(
        leftJamb,
        rightJamb,
        leftPlinth,
        rightPlinth,
        leftCap,
        rightCap,
        lintel,
        leftGoldReveal,
        rightGoldReveal,
        topGoldReveal,
        keystone,
        plaqueShadow,
        plaqueMesh,
        plaqueGoldFrame,
        facadeLeft,
        facadeRight,
        facadeTop,
        facadeArchitrave,
        facadeFriezeGold,
        facadeCornice,
        facadeTopCornice,
        facadeBaseLeft,
        facadeBaseRight,
        facadeBaseGoldLeft,
        facadeBaseGoldRight,
        pilasterGroup,
        porticoFloor,
        porticoCeiling,
        porticoWallLeft,
        porticoWallRight,
        porticoFill,
        porticoFill.target,
        leftPivot,
        rightPivot,
        crackGlow,
        crackSlit,
        floorSpill,
        doorBacker,
        lightFlood,
        thresholdPlate
      );
      scene.add(doorGroup);

      return {
        doorGroup,
        leftPivot,
        rightPivot,
        leftHandle,
        rightHandle,
        crackSlit,
        crackGlow,
        floorSpill,
        doorBacker,
        lightFlood,
        doorKeyLight,
        doorUplight,
        porticoFill,
      };
    };

    const entranceDoor = buildGrandEntranceDoor();
    doorAnimationRef.current.doorGroup = entranceDoor.doorGroup;
    doorAnimationRef.current.leftPivot = entranceDoor.leftPivot;
    doorAnimationRef.current.rightPivot = entranceDoor.rightPivot;
    doorAnimationRef.current.leftHandle = entranceDoor.leftHandle;
    doorAnimationRef.current.rightHandle = entranceDoor.rightHandle;
    doorAnimationRef.current.crackSlit = entranceDoor.crackSlit;
    doorAnimationRef.current.crackGlow = entranceDoor.crackGlow;
    doorAnimationRef.current.floorSpill = entranceDoor.floorSpill;
    doorAnimationRef.current.doorBacker = entranceDoor.doorBacker;
    doorAnimationRef.current.lightFlood = entranceDoor.lightFlood;
    doorAnimationRef.current.doorKeyLight = entranceDoor.doorKeyLight;
    doorAnimationRef.current.doorUplight = entranceDoor.doorUplight;
    doorAnimationRef.current.porticoFill = entranceDoor.porticoFill;

    // Corridor End Wall at Z = hallZEnd with Recessed Architectural Niche
    const endWall = new THREE.Mesh(
      new THREE.PlaneGeometry(hallWidth, hallHeight),
      corridorWallMat
    );
    endWall.position.set(0, hallHeight / 2, hallZEnd);
    hallwayGroup.add(endWall);

    // --- FAR-END GRAND ARCHITECTURAL FOCAL POINT (TERMINUS OF THE MANSION) ---
    const focalGroup = new THREE.Group();
    focalGroup.position.set(0, 0, hallZEnd + 1.5);

    // 1. Soaring Palladian Archway Outer Portal Frame (Open aperture with stone jambs & header)
    const archLeftPost = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 6.4, 0.45),
      stoneTrimMat
    );
    archLeftPost.position.set(-2.8, 3.2, 0.1);

    const archRightPost = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 6.4, 0.45),
      stoneTrimMat
    );
    archRightPost.position.set(2.8, 3.2, 0.1);

    const archHeader = new THREE.Mesh(
      new THREE.BoxGeometry(6.4, 0.8, 0.45),
      stoneTrimMat
    );
    archHeader.position.set(0, 6.4, 0.1);

    // Stepped gold inner arch reveal
    const goldLeftTrim = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 6.0, 0.48),
      antiqueGoldMat
    );
    goldLeftTrim.position.set(-2.35, 3.0, 0.12);

    const goldRightTrim = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 6.0, 0.48),
      antiqueGoldMat
    );
    goldRightTrim.position.set(2.35, 3.0, 0.12);

    const goldTopTrim = new THREE.Mesh(
      new THREE.BoxGeometry(4.8, 0.12, 0.48),
      antiqueGoldMat
    );
    goldTopTrim.position.set(0, 6.0, 0.12);

    // Flanking Grand Fluted Columns (Left & Right)
    const columnGeo = new THREE.CylinderGeometry(0.36, 0.40, 6.6, 32);
    const leftCol = new THREE.Mesh(columnGeo, stoneTrimMat);
    leftCol.position.set(-3.2, 3.3, 0.25);
    const rightCol = new THREE.Mesh(columnGeo, stoneTrimMat);
    rightCol.position.set(3.2, 3.3, 0.25);

    const colCapGeo = new THREE.BoxGeometry(0.95, 0.26, 0.95);
    const leftCap = new THREE.Mesh(colCapGeo, antiqueGoldMat);
    leftCap.position.set(-3.2, 6.5, 0.25);
    const rightCap = new THREE.Mesh(colCapGeo, antiqueGoldMat);
    rightCap.position.set(3.2, 6.5, 0.25);

    const leftBase = new THREE.Mesh(colCapGeo, antiqueGoldMat);
    leftBase.position.set(-3.2, 0.13, 0.25);
    const rightBase = new THREE.Mesh(colCapGeo, antiqueGoldMat);
    rightBase.position.set(3.2, 0.13, 0.25);

    // Archway Crown Keystone with Gilded Royal Cartouche
    const keystone = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.85, 0.75),
      antiqueGoldMat
    );
    keystone.position.set(0, 6.4, 0.25);

    // 2. Glowing Honey Onyx / Alabaster Arched Window Screen (Backlit Sanctuary Vista)
    const backlitWindowMat = new THREE.MeshStandardMaterial({
      color: 0xfff0d6,
      emissive: 0xffbe58,
      emissiveIntensity: sceneStateRef.current.introComplete ? 2.2 : 0.0,
      roughness: 0.15,
      metalness: 0.05,
    });
    const backlitWindow = new THREE.Mesh(
      new THREE.PlaneGeometry(4.7, 6.0),
      backlitWindowMat
    );
    backlitWindow.position.set(0, 3.0, 0.02);

    // Intricate Dark Patinated Bronze Geometric Trellis / Tracery Grid
    const traceryGroup = new THREE.Group();
    traceryGroup.position.set(0, 3.0, 0.06);
    // Vertical tracery mullions
    for (let tx = -1.6; tx <= 1.6; tx += 0.8) {
      const mullion = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, 6.0, 0.04),
        darkBronzeMat
      );
      mullion.position.set(tx, 0, 0);
      traceryGroup.add(mullion);
    }
    // Horizontal transom bars
    for (let ty = -2.0; ty <= 2.0; ty += 1.0) {
      const transom = new THREE.Mesh(
        new THREE.BoxGeometry(4.7, 0.04, 0.04),
        darkBronzeMat
      );
      transom.position.set(0, ty, 0);
      traceryGroup.add(transom);
    }

    // 3. Monolithic Curved Calacatta Gold Console Table & Statement Centerpiece Ensemble
    const consoleGroup = new THREE.Group();
    consoleGroup.position.set(0, 0, 1.5); // Z = -117.0

    // Calacatta Marble Console Top (3.4m wide, rounded bullnose edge)
    const consoleTop = new THREE.Mesh(
      new THREE.BoxGeometry(3.4, 0.14, 0.75),
      calacattaConsoleMat
    );
    consoleTop.position.set(0, 1.15, 0);

    // Antique Brass perimeter edge banding under marble slab
    const consoleGoldEdge = new THREE.Mesh(
      new THREE.BoxGeometry(3.42, 0.035, 0.77),
      antiqueGoldMat
    );
    consoleGoldEdge.position.set(0, 1.065, 0);

    // Twin Fluted Antique Bronze Cylindrical Pedestals
    const pedGeo = new THREE.CylinderGeometry(0.28, 0.32, 1.05, 32);
    const leftConsolePed = new THREE.Mesh(pedGeo, sculpturalBronzeDeskMat);
    leftConsolePed.position.set(-1.15, 0.525, 0);
    const rightConsolePed = new THREE.Mesh(pedGeo, sculpturalBronzeDeskMat);
    rightConsolePed.position.set(1.15, 0.525, 0);

    // Plinth bases in Calacatta marble
    const plinthGeo = new THREE.BoxGeometry(0.72, 0.08, 0.72);
    const leftPlinth = new THREE.Mesh(plinthGeo, calacattaConsoleMat);
    leftPlinth.position.set(-1.15, 0.04, 0);
    const rightPlinth = new THREE.Mesh(plinthGeo, calacattaConsoleMat);
    rightPlinth.position.set(1.15, 0.04, 0);

    // Grounding Contact Shadows under Console Plinths
    const leftPlinthShadow = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.9), contactShadowMat);
    leftPlinthShadow.rotation.x = -Math.PI / 2;
    leftPlinthShadow.position.set(-1.15, 0.005, 0);
    const rightPlinthShadow = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.9), contactShadowMat);
    rightPlinthShadow.rotation.x = -Math.PI / 2;
    rightPlinthShadow.position.set(1.15, 0.005, 0);

    // 4. Statement Classical-Modern Sculptural Armillary & Bronze Centerpiece (Silhouetted against backlit window)
    const focalSculptureGroup = new THREE.Group();
    focalSculptureGroup.position.set(0, 1.25, 0);

    const urnBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.30, 0.12, 32),
      antiqueGoldMat
    );
    urnBase.position.set(0, 0.06, 0);

    const urnBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.38, 0.18, 0.65, 32),
      darkBronzeMat
    );
    urnBody.position.set(0, 0.44, 0);

    const outerRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.75, 0.045, 16, 64),
      antiqueGoldMat
    );
    outerRing.position.set(0, 0.95, 0);

    const innerRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.55, 0.04, 16, 64),
      darkBronzeMat
    );
    innerRing.position.set(0, 0.95, 0);
    innerRing.rotation.x = Math.PI / 3;

    const coreJewel = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.32, 0),
      antiqueGoldMat
    );
    coreJewel.position.set(0, 0.95, 0);

    focalSculptureGroup.add(urnBase, urnBody, outerRing, innerRing, coreJewel);

    // 5. Flanking Monumental Bronze Torchères (Left & Right at X = ±2.3)
    const torchereGeo = new THREE.CylinderGeometry(0.08, 0.14, 2.2, 24);
    const torchereUrnGeo = new THREE.CylinderGeometry(0.22, 0.14, 0.35, 24);
    const torchereGlowMat = new THREE.MeshStandardMaterial({
      color: 0xffecc4,
      emissive: 0xffcb6e,
      emissiveIntensity: sceneStateRef.current.introComplete ? 2.2 : 0.0,
      roughness: 0.15,
      metalness: 0.05,
    });

    const leftTorchere = new THREE.Mesh(torchereGeo, darkBronzeMat);
    leftTorchere.position.set(-2.3, 1.1, 0);
    const leftUrn = new THREE.Mesh(torchereUrnGeo, torchereGlowMat);
    leftUrn.position.set(-2.3, 2.35, 0);

    const rightTorchere = new THREE.Mesh(torchereGeo, darkBronzeMat);
    rightTorchere.position.set(2.3, 1.1, 0);
    const rightUrn = new THREE.Mesh(torchereUrnGeo, torchereGlowMat);
    rightUrn.position.set(2.3, 2.35, 0);

    consoleGroup.add(
      consoleTop,
      consoleGoldEdge,
      leftConsolePed,
      rightConsolePed,
      leftPlinth,
      rightPlinth,
      leftPlinthShadow,
      rightPlinthShadow,
      focalSculptureGroup,
      leftTorchere,
      leftUrn,
      rightTorchere,
      rightUrn
    );

    // 6. SINGLE HERO DYNAMIC SPOTLIGHT (Light Spill through Archway across marble floor)
    const focalLightSpill = new THREE.SpotLight(
      0xffe2a4,
      sceneStateRef.current.introComplete ? 4.2 : 0.0,
      52,
      Math.PI / 3.4,
      0.65,
      1.2
    );
    focalLightSpill.position.set(0, 5.8, hallZEnd + 1.5);
    const focalTarget = new THREE.Object3D();
    focalTarget.position.set(0, 0, hallZEnd + 32); // points forward toward Chamber VI
    hallwayGroup.add(focalTarget);
    focalLightSpill.target = focalTarget;
    hallwayGroup.add(focalLightSpill);

    // 7. Ground Light Spill Plane (Additive radial glow carpet leading out from portal)
    const floorSpillMat = new THREE.MeshBasicMaterial({
      map: floorSpillTex,
      transparent: true,
      opacity: sceneStateRef.current.introComplete ? 0.42 : 0.0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const floorSpillMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(6.8, 28),
      floorSpillMat
    );
    floorSpillMesh.rotation.x = -Math.PI / 2;
    floorSpillMesh.position.set(0, 0.009, hallZEnd + 16);
    hallwayGroup.add(floorSpillMesh);

    focalGroup.add(
      archLeftPost,
      archRightPost,
      archHeader,
      goldLeftTrim,
      goldRightTrim,
      goldTopTrim,
      leftCol,
      rightCol,
      leftCap,
      rightCap,
      leftBase,
      rightBase,
      keystone,
      backlitWindow,
      traceryGroup,
      consoleGroup
    );
    hallwayGroup.add(focalGroup);

    // --- 3D LUXURY WALL SCONCE GENERATOR (BAKED SCALLOP GLOW FOR ZERO DYNAMIC LIGHT OVERHEAD) ---
    const sconceDownScallopGeo = new THREE.PlaneGeometry(1.6, 2.4);
    const sconceUpScallopGeo = new THREE.PlaneGeometry(1.2, 1.4);
    const sconceScallopMat = new THREE.MeshBasicMaterial({
      map: scallopGlowTex,
      transparent: true,
      opacity: 0.70,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });

    const sconceBackplateGeo = new THREE.BoxGeometry(0.04, 1.1, 0.18);
    const sconceAoShadowGeo = new THREE.PlaneGeometry(0.32, 1.25);
    const sconceArmGeo = new THREE.BoxGeometry(0.28, 0.045, 0.045);
    const sconceCapGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.08, 20);
    const sconceFinialGeo = new THREE.ConeGeometry(0.05, 0.22, 16);
    const sconceShadeGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.72, 24);

    const sconceGoldGeos: THREE.BufferGeometry[] = [];
    const sconceShadowGeos: THREE.BufferGeometry[] = [];

    const createLuxurySconce = (
      x: number,
      y: number,
      z: number,
      facingDir: number
    ) => {
      // 1. Slim Brushed Antique Brass Backplate mounted flush against wall
      appendTransformedGeo(sconceGoldGeos, sconceBackplateGeo, x + facingDir * 0.02, y, z);

      // Ambient Occlusion Shadow on wall behind backplate
      appendTransformedGeo(sconceShadowGeos, sconceAoShadowGeo, x + facingDir * 0.005, y, z, 0, facingDir * (Math.PI / 2), 0);

      // 2. Horizontal Curved Brass Bracket Arm extending outward into hallway
      appendTransformedGeo(sconceGoldGeos, sconceArmGeo, x + facingDir * 0.16, y, z);

      // 3. Top & Bottom Brass Caps & Decorative Finial
      appendTransformedGeo(sconceGoldGeos, sconceCapGeo, x + facingDir * 0.28, y + 0.38, z);
      appendTransformedGeo(sconceGoldGeos, sconceCapGeo, x + facingDir * 0.28, y - 0.38, z);
      appendTransformedGeo(sconceGoldGeos, sconceFinialGeo, x + facingDir * 0.28, y - 0.52, z, Math.PI, 0, 0);

      // 4. Real 3D Elongated Frosted Alabaster Glass Cylinder Shade (Emissive glow without forward light cost)
      const shadeMat = new THREE.MeshStandardMaterial({
        color: 0xfffaea,
        emissive: 0xffe1aa,
        emissiveIntensity: sceneStateRef.current.introComplete ? 1.8 : 0.0,
        roughness: 0.14,
        metalness: 0.04,
        transparent: true,
        opacity: 0.96,
      });
      const shade = new THREE.Mesh(sconceShadeGeo, shadeMat);
      shade.position.set(x + facingDir * 0.28, y, z);
      hallwayGroup.add(shade);

      // 5. Baked Soft Wall Scallop Glow Wash (Downward & Upward pools combined into single mesh)
      const scallopMat = sconceScallopMat.clone();
      scallopMat.opacity = sceneStateRef.current.introComplete ? 0.70 : 0.0;

      const singleSconceScallopGeos: THREE.BufferGeometry[] = [];
      appendTransformedGeo(singleSconceScallopGeos, sconceDownScallopGeo, x + facingDir * 0.008, y - 1.25, z, 0, facingDir * (Math.PI / 2), 0);
      appendTransformedGeo(singleSconceScallopGeos, sconceUpScallopGeo, x + facingDir * 0.008, y + 1.05, z, 0, facingDir * (Math.PI / 2), Math.PI);
      const mergedScallopGeo = BufferGeometryUtils.mergeGeometries(singleSconceScallopGeos, false);
      singleSconceScallopGeos.forEach((g) => g.dispose());
      const scallopMesh = new THREE.Mesh(mergedScallopGeo, scallopMat);
      hallwayGroup.add(scallopMesh);

      sconceLightingFixtures.push({ z, shadeMat, scallopMat });
    };

    // Instantiate Curated Luxury 3D Sconces at Architectural Piers & Non-Overlapping Bay Gaps
    createLuxurySconce(-hallWidth / 2, 3.8, -0.2, 1);
    createLuxurySconce(hallWidth / 2, 3.8, -0.2, -1);
    createLuxurySconce(-hallWidth / 2, 3.8, -8.2, 1);
    createLuxurySconce(hallWidth / 2, 3.8, -8.2, -1);
    // Chamber 1 flanking sconces (Z = -20, left)
    createLuxurySconce(-hallWidth / 2, 3.8, -16.5, 1);
    createLuxurySconce(-hallWidth / 2, 3.8, -23.5, 1);
    // Chamber 2 flanking sconces (Z = -45, right)
    createLuxurySconce(hallWidth / 2, 3.8, -41.5, -1);
    createLuxurySconce(hallWidth / 2, 3.8, -48.5, -1);
    // Chamber 3 flanking sconces (Z = -70, left)
    createLuxurySconce(-hallWidth / 2, 3.8, -66.5, 1);
    createLuxurySconce(-hallWidth / 2, 3.8, -73.5, 1);
    // Chamber 4 flanking sconces (Z = -95, right)
    createLuxurySconce(hallWidth / 2, 3.8, -91.5, -1);
    createLuxurySconce(hallWidth / 2, 3.8, -98.5, -1);
    // Chamber 5 flanking sconces (Z = -120, left)
    createLuxurySconce(-hallWidth / 2, 3.8, -116.5, 1);
    createLuxurySconce(-hallWidth / 2, 3.8, -123.5, 1);
    // Chamber 6 flanking sconces (Z = -145, right)
    createLuxurySconce(hallWidth / 2, 3.8, -141.5, -1);
    createLuxurySconce(hallWidth / 2, 3.8, -148.5, -1);
    createLuxurySconce(-hallWidth / 2, 3.8, -162.0, 1);
    createLuxurySconce(hallWidth / 2, 3.8, -162.0, -1);

    if (sconceGoldGeos.length > 0) {
      const mergedSconceGold = BufferGeometryUtils.mergeGeometries(sconceGoldGeos, false);
      sconceGoldGeos.forEach((g) => g.dispose());
      hallwayGroup.add(new THREE.Mesh(mergedSconceGold, antiqueGoldMat));
    }
    if (sconceShadowGeos.length > 0) {
      const mergedSconceShadow = BufferGeometryUtils.mergeGeometries(sconceShadowGeos, false);
      sconceShadowGeos.forEach((g) => g.dispose());
      hallwayGroup.add(new THREE.Mesh(mergedSconceShadow, contactShadowMat));
    }

    // --- 3D MONUMENTAL 2-BLOCK WIDE EXHIBITION MURALS & TRIPLE PICTURE LIGHTS ---
    const museumGlassMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.08,
      roughness: 0.04,
      metalness: 0.22,
      depthWrite: false,
    });

    // 2-Block Wide Monumental Dimensions (Spans across 2 whole wall blocks/bays, Extended Full-Height Down to Floor)
    const muralCanvasW = 6.80; // 6.8m wide (2 full wall bays)
    const muralCanvasH = 4.40; // 4.4m high (extends vertically from near skirting Y=0.59 to ceiling Y=5.25)
    const muralRailDepth = 0.12;
    const muralRailWidth = 0.08;
    const muralMatBorder = 0.05;
    const muralOuterWidth = muralCanvasW + muralMatBorder * 2 + muralRailWidth * 2; // 7.06m
    const muralOuterHeight = muralCanvasH + muralMatBorder * 2 + muralRailWidth * 2; // 4.66m
    const muralInnerW = muralOuterWidth - muralRailWidth * 2; // 6.90m
    const muralInnerH = muralOuterHeight - muralRailWidth * 2; // 4.50m
    const muralFilletDepth = 0.04;
    const muralFilletWidth = 0.025;

    const sharedMuralDropShadowGeo = new THREE.PlaneGeometry(muralOuterWidth + 0.40, muralOuterHeight + 0.40);
    const sharedMuralTopBottomRailGeo = new THREE.BoxGeometry(muralRailDepth, muralRailWidth, muralOuterWidth);
    const sharedMuralLeftRightRailGeo = new THREE.BoxGeometry(muralRailDepth, muralOuterHeight - muralRailWidth * 2, muralRailWidth);
    const sharedMuralFrontMoldingGeo = new THREE.BoxGeometry(0.015, muralRailWidth - 0.02, muralOuterWidth);
    const sharedMuralFilletTopBottomGeo = new THREE.BoxGeometry(muralFilletDepth, muralFilletWidth, muralInnerW);
    const sharedMuralFilletLeftRightGeo = new THREE.BoxGeometry(muralFilletDepth, muralInnerH - muralFilletWidth * 2, muralFilletWidth);
    const sharedMuralMatGeo = new THREE.PlaneGeometry(muralInnerW, muralInnerH);
    const sharedMuralCanvasGeo = new THREE.PlaneGeometry(muralCanvasW, muralCanvasH);
    const sharedMuralGlassGeo = new THREE.PlaneGeometry(muralInnerW - 0.01, muralInnerH - 0.01);
    const sharedMuralArmGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.44);
    const sharedMuralHoodGeo = new THREE.CylinderGeometry(0.045, 0.045, 1.80, 20);

    const artLinenMat = new THREE.MeshStandardMaterial({
      color: 0xf3ede3,
      roughness: 0.92,
      metalness: 0.02,
    });
    const artLampHoodMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      emissive: 0xffdf96,
      emissiveIntensity: sceneStateRef.current.introComplete ? 0.75 : 0.0,
      roughness: 0.28,
      metalness: 0.55,
    });

    const muralGoldGeos: THREE.BufferGeometry[] = [];
    const muralBronzeGeos: THREE.BufferGeometry[] = [];
    const muralLinenGeos: THREE.BufferGeometry[] = [];
    const muralGlassGeos: THREE.BufferGeometry[] = [];
    const muralShadowGeos: THREE.BufferGeometry[] = [];

    const createMonumental2BlockMural = (
      x: number,
      y: number,
      z: number,
      facingDir: number,
      tex: THREE.Texture
    ) => {
      // 1. Drop shadow behind monumental frame
      appendTransformedGeo(muralShadowGeos, sharedMuralDropShadowGeo, x + facingDir * 0.002, y, z, 0, facingDir * (Math.PI / 2), 0);

      // 2. Outer Gilded Museum Rails (Antique Gold Bevel Frame)
      appendTransformedGeo(muralGoldGeos, sharedMuralTopBottomRailGeo, x + facingDir * (muralRailDepth / 2), y + (muralOuterHeight - muralRailWidth) / 2, z);
      appendTransformedGeo(muralGoldGeos, sharedMuralTopBottomRailGeo, x + facingDir * (muralRailDepth / 2), y - (muralOuterHeight - muralRailWidth) / 2, z);
      appendTransformedGeo(muralGoldGeos, sharedMuralLeftRightRailGeo, x + facingDir * (muralRailDepth / 2), y, z - (muralOuterWidth - muralRailWidth) / 2);
      appendTransformedGeo(muralGoldGeos, sharedMuralLeftRightRailGeo, x + facingDir * (muralRailDepth / 2), y, z + (muralOuterWidth - muralRailWidth) / 2);

      // Front stepped gold reveal moldings
      appendTransformedGeo(muralGoldGeos, sharedMuralFrontMoldingGeo, x + facingDir * (muralRailDepth + 0.007), y + (muralOuterHeight - muralRailWidth) / 2, z);
      appendTransformedGeo(muralGoldGeos, sharedMuralFrontMoldingGeo, x + facingDir * (muralRailDepth + 0.007), y - (muralOuterHeight - muralRailWidth) / 2, z);

      // 3. Dark Bronze Inner Shadow Fillet
      appendTransformedGeo(muralBronzeGeos, sharedMuralFilletTopBottomGeo, x + facingDir * (muralRailDepth - muralFilletDepth / 2), y + (muralInnerH - muralFilletWidth) / 2, z);
      appendTransformedGeo(muralBronzeGeos, sharedMuralFilletTopBottomGeo, x + facingDir * (muralRailDepth - muralFilletDepth / 2), y - (muralInnerH - muralFilletWidth) / 2, z);
      appendTransformedGeo(muralBronzeGeos, sharedMuralFilletLeftRightGeo, x + facingDir * (muralRailDepth - muralFilletDepth / 2), y, z - (muralInnerW - muralFilletWidth) / 2);
      appendTransformedGeo(muralBronzeGeos, sharedMuralFilletLeftRightGeo, x + facingDir * (muralRailDepth - muralFilletDepth / 2), y, z + (muralInnerW - muralFilletWidth) / 2);

      // 4. Archival Off-White Linen Matting Margin
      appendTransformedGeo(muralLinenGeos, sharedMuralMatGeo, x + facingDir * 0.035, y, z, 0, facingDir * (Math.PI / 2), 0);

      // 5. Crystal-Clear 4K Master Artwork Canvas (with uniform museum illumination)
      const canvasMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: tex,
        emissiveMap: tex,
        emissive: 0xffffff,
        emissiveIntensity: sceneStateRef.current.introComplete ? 0.38 : 0.0,
        roughness: 0.35,
        metalness: 0.02,
        side: THREE.FrontSide,
      });

      const canvasMesh = new THREE.Mesh(sharedMuralCanvasGeo, canvasMat);
      canvasMesh.rotation.y = facingDir * (Math.PI / 2);
      canvasMesh.position.set(x + facingDir * 0.055, y, z);
      hallwayGroup.add(canvasMesh);

      // 6. Protective Museum Glass Pane
      appendTransformedGeo(muralGlassGeos, sharedMuralGlassGeo, x + facingDir * 0.082, y, z, 0, facingDir * (Math.PI / 2), 0);

      // 7. Triple Overhead Brass Gallery Picture Light Fixtures across the 6.8m span
      const lightY = muralOuterHeight / 2 + 0.30;
      const muralHoodGeos: THREE.BufferGeometry[] = [];
      for (const offsetZ of [-2.1, 0, 2.1]) {
        appendTransformedGeo(muralGoldGeos, sharedMuralArmGeo, x + facingDir * 0.22, y + lightY, z + offsetZ - 0.45, 0, 0, facingDir * (Math.PI / 2));
        appendTransformedGeo(muralGoldGeos, sharedMuralArmGeo, x + facingDir * 0.22, y + lightY, z + offsetZ + 0.45, 0, 0, facingDir * (Math.PI / 2));
        appendTransformedGeo(muralHoodGeos, sharedMuralHoodGeo, x + facingDir * 0.44, y + lightY, z + offsetZ, Math.PI / 2, 0, 0);
      }
      const mergedHoodGeo = BufferGeometryUtils.mergeGeometries(muralHoodGeos, false);
      muralHoodGeos.forEach((g) => g.dispose());

      const lampMat = artLampHoodMat.clone();
      lampMat.emissiveIntensity = sceneStateRef.current.introComplete ? 0.75 : 0.0;
      const tripleHoodMesh = new THREE.Mesh(mergedHoodGeo, lampMat);
      hallwayGroup.add(tripleHoodMesh);

      muralLightingFixtures.push({ z, lampMat, canvasMat });
    };

    // Place 2-Block Wide 4K Monumental Exhibition Murals along both walls (Full-Wall Height, Center Y = 2.92)
    // LEFT WALL (facingDir = 1, X = -hallWidth/2) - Curated Non-Overlapping Intervals
    // Section 1: Entry to Chamber 1 (Z = +8.0 to -17.0) - 3 Murals with 0.94m architectural gaps
    createMonumental2BlockMural(-hallWidth / 2, 2.92, 3.8, 1, muralTex1);   // Double-Height Living Suite (Bays 1-2)
    createMonumental2BlockMural(-hallWidth / 2, 2.92, -4.2, 1, muralTex2);  // Royal Velvet Dining Hall (Bays 3-4)
    createMonumental2BlockMural(-hallWidth / 2, 2.92, -12.2, 1, muralTex3); // Master Bedroom Recliner Suite (Bays 5-6)
    // [Portal I at Z = -20: Chamber 1 Entry - 6m portal with gold jambs]
    // Section 2: Between Chamber 1 and Chamber 3 (Z = -23.0 to -67.0) - 6 Continuous Murals
    createMonumental2BlockMural(-hallWidth / 2, 2.92, -26.8, 1, muralTex4); // Grand Living & Chandelier Gallery
    createMonumental2BlockMural(-hallWidth / 2, 2.92, -34.0, 1, muralTex5); // Penthouse Terrace Pavilion
    createMonumental2BlockMural(-hallWidth / 2, 2.92, -41.2, 1, muralTex6); // Calacatta Marble Reception
    createMonumental2BlockMural(-hallWidth / 2, 2.92, -48.4, 1, muralTex7); // Monolithic Stone Bar & Parlour
    createMonumental2BlockMural(-hallWidth / 2, 2.92, -55.6, 1, muralTex8); // Designer Master Bedroom
    createMonumental2BlockMural(-hallWidth / 2, 2.92, -62.8, 1, muralTex9); // Bespoke Italian Kitchen
    // [Portal III at Z = -70: Chamber 3 Entry]
    // Section 3: Between Chamber 3 and Chamber 5 (Z = -73.0 to -117.0) - 6 Murals
    createMonumental2BlockMural(-hallWidth / 2, 2.92, -76.8, 1, muralTex10); // Luxury Walk-in Wardrobe & Vanity
    createMonumental2BlockMural(-hallWidth / 2, 2.92, -84.0, 1, muralTex11); // Executive Media Room & Library
    createMonumental2BlockMural(-hallWidth / 2, 2.92, -91.2, 1, muralTex12); // High-End Modular Suite
    createMonumental2BlockMural(-hallWidth / 2, 2.92, -98.4, 1, muralTex13); // Contemporary Dining Pavilion
    createMonumental2BlockMural(-hallWidth / 2, 2.92, -105.6, 1, muralTex14); // Elegant Master Bathroom Spa
    createMonumental2BlockMural(-hallWidth / 2, 2.92, -112.8, 1, muralTex15); // Coral Pooja Mandir Sanctuary
    // [Portal V at Z = -120: Chamber 5 Entry]
    // Section 4: After Chamber 5 (Z = -123.0 to -167.0) - 6 Murals
    createMonumental2BlockMural(-hallWidth / 2, 2.92, -126.8, 1, muralTex12); // Designer Suite Gallery
    createMonumental2BlockMural(-hallWidth / 2, 2.92, -134.0, 1, muralTex13); // Contemporary Living Art
    createMonumental2BlockMural(-hallWidth / 2, 2.92, -141.2, 1, muralTex14); // Luxury Master Lounge
    createMonumental2BlockMural(-hallWidth / 2, 2.92, -148.4, 1, muralTex15); // Executive Media Atrium
    createMonumental2BlockMural(-hallWidth / 2, 2.92, -155.6, 1, muralTex16); // Fine Classical Millwork
    createMonumental2BlockMural(-hallWidth / 2, 2.92, -162.8, 1, muralTex17); // Terminus Gallery Masterpiece

    // RIGHT WALL (facingDir = -1, X = hallWidth/2) - Curated Non-Overlapping Intervals
    // Section 1: Entry to Chamber 2 (Z = +8.0 to -42.0) - 6 Murals with 0.74m architectural gaps
    createMonumental2BlockMural(hallWidth / 2, 2.92, 3.8, -1, muralTex16);  // Champagne Silk Guest Bedroom
    createMonumental2BlockMural(hallWidth / 2, 2.92, -4.2, -1, muralTex17);  // Architectural Lighting Atrium
    createMonumental2BlockMural(hallWidth / 2, 2.92, -12.2, -1, muralTex18); // Private Cinema Suite
    createMonumental2BlockMural(hallWidth / 2, 2.92, -20.0, -1, muralTex19); // Warm Oak Study & Library
    createMonumental2BlockMural(hallWidth / 2, 2.92, -27.8, -1, muralTex20); // Luxury Penthouse Bedroom Suite
    createMonumental2BlockMural(hallWidth / 2, 2.92, -35.6, -1, muralTex21); // Grand Staircase & Foyer
    // [Portal II at Z = -45: Chamber 2 Entry]
    // Section 2: Between Chamber 2 and Chamber 4 (Z = -48.0 to -92.0) - 6 Murals
    createMonumental2BlockMural(hallWidth / 2, 2.92, -51.8, -1, muralTex22); // Velvet Lounge & Cocktail Bar
    createMonumental2BlockMural(hallWidth / 2, 2.92, -59.0, -1, muralTex23); // Acoustic Home Theatre
    createMonumental2BlockMural(hallWidth / 2, 2.92, -66.2, -1, muralTex24); // Presidential Master Suite
    createMonumental2BlockMural(hallWidth / 2, 2.92, -73.4, -1, muralTex1);  // Double-Height Living Suite
    createMonumental2BlockMural(hallWidth / 2, 2.92, -80.6, -1, muralTex2);  // Royal Velvet Dining Hall
    createMonumental2BlockMural(hallWidth / 2, 2.92, -87.8, -1, muralTex3);  // Master Bedroom Recliner Suite
    // [Portal IV at Z = -95: Chamber 4 Entry]
    // Section 3: Between Chamber 4 and Chamber 6 (Z = -98.0 to -142.0) - 6 Murals
    createMonumental2BlockMural(hallWidth / 2, 2.92, -102.5, -1, muralTex4); // Penthouse Terrace Pavilion
    createMonumental2BlockMural(hallWidth / 2, 2.92, -109.7, -1, muralTex5); // Calacatta Marble Reception Lounge
    createMonumental2BlockMural(hallWidth / 2, 2.92, -116.9, -1, muralTex6); // Bespoke Executive Lounge
    createMonumental2BlockMural(hallWidth / 2, 2.92, -124.1, -1, muralTex7); // Monolithic Stone Bar
    createMonumental2BlockMural(hallWidth / 2, 2.92, -131.3, -1, muralTex8); // Modernist Master Suite
    createMonumental2BlockMural(hallWidth / 2, 2.92, -138.5, -1, muralTex9); // High-Precision Joinery
    // [Portal VI at Z = -145: Chamber 6 Entry]
    // Section 4: After Chamber 6 (Z = -148.0 to -167.0) - 2 Murals
    createMonumental2BlockMural(hallWidth / 2, 2.92, -152.0, -1, muralTex10); // Luxury Walk-in Archive
    createMonumental2BlockMural(hallWidth / 2, 2.92, -159.5, -1, muralTex11); // Executive Reception Hall

    // Merge static monumental mural components into unified batch meshes
    if (muralGoldGeos.length > 0) {
      const mergedMuralGold = BufferGeometryUtils.mergeGeometries(muralGoldGeos, false);
      muralGoldGeos.forEach((g) => g.dispose());
      hallwayGroup.add(new THREE.Mesh(mergedMuralGold, antiqueGoldMat));
    }
    if (muralBronzeGeos.length > 0) {
      const mergedMuralBronze = BufferGeometryUtils.mergeGeometries(muralBronzeGeos, false);
      muralBronzeGeos.forEach((g) => g.dispose());
      hallwayGroup.add(new THREE.Mesh(mergedMuralBronze, darkBronzeMat));
    }
    if (muralLinenGeos.length > 0) {
      const mergedMuralLinen = BufferGeometryUtils.mergeGeometries(muralLinenGeos, false);
      muralLinenGeos.forEach((g) => g.dispose());
      hallwayGroup.add(new THREE.Mesh(mergedMuralLinen, artLinenMat));
    }
    if (muralGlassGeos.length > 0) {
      const mergedMuralGlass = BufferGeometryUtils.mergeGeometries(muralGlassGeos, false);
      muralGlassGeos.forEach((g) => g.dispose());
      hallwayGroup.add(new THREE.Mesh(mergedMuralGlass, museumGlassMat));
    }
    if (muralShadowGeos.length > 0) {
      const mergedMuralShadow = BufferGeometryUtils.mergeGeometries(muralShadowGeos, false);
      muralShadowGeos.forEach((g) => g.dispose());
      hallwayGroup.add(new THREE.Mesh(mergedMuralShadow, contactShadowMat));
    }

    // --- CORRIDOR WALLS & INSTANCED BOISERIE PANEL SYSTEM (2 DRAW CALLS TOTAL) ---
    const unitBoxGeo = new THREE.BoxGeometry(1, 1, 1);
    const maxBoiserieInstances = 1200;
    const stonePanelInstanced = new THREE.InstancedMesh(unitBoxGeo, stoneTrimMat, maxBoiserieInstances);
    const goldPanelInstanced = new THREE.InstancedMesh(unitBoxGeo, antiqueGoldMat, maxBoiserieInstances);
    stonePanelInstanced.instanceMatrix.setUsage(THREE.StaticDrawUsage);
    goldPanelInstanced.instanceMatrix.setUsage(THREE.StaticDrawUsage);

    let stoneBarIdx = 0;
    let goldBarIdx = 0;
    const dummyBar = new THREE.Object3D();

    const addMouldingBar = (
      px: number, py: number, pz: number,
      sx: number, sy: number, sz: number,
      isGold: boolean
    ) => {
      dummyBar.position.set(px, py, pz);
      dummyBar.rotation.set(0, 0, 0);
      dummyBar.scale.set(sx, sy, sz);
      dummyBar.updateMatrix();
      if (isGold) {
        if (goldBarIdx < maxBoiserieInstances) {
          goldPanelInstanced.setMatrixAt(goldBarIdx++, dummyBar.matrix);
        }
      } else {
        if (stoneBarIdx < maxBoiserieInstances) {
          stonePanelInstanced.setMatrixAt(stoneBarIdx++, dummyBar.matrix);
        }
      }
    };

    const buildWallWithDoorways = (
      xPos: number,
      doorZs: number[],
      sideFacing: number
    ) => {
      const wallGroup = new THREE.Group();
      const zDoors = [...doorZs].sort((a, b) => b - a);

      const addWallSegment = (zStart: number, zEnd: number) => {
        const segLen = zStart - zEnd;
        if (segLen <= 0.05) return;
        const segZ = (zStart + zEnd) / 2;

        // 1. Fine Warm Limestone Plaster Wall
        const wallMesh = new THREE.Mesh(
          new THREE.PlaneGeometry(segLen, hallHeight),
          corridorWallMat
        );
        wallMesh.rotation.y = sideFacing * (Math.PI / 2);
        wallMesh.position.set(xPos, hallHeight / 2, segZ);
        wallGroup.add(wallMesh);

        // 2. Double-Deck Baseboard (Stone base + Antique Gold Bead Cap)
        const baseStone = new THREE.Mesh(
          new THREE.BoxGeometry(0.1, 0.32, segLen),
          stoneTrimMat
        );
        baseStone.position.set(xPos - sideFacing * 0.05, 0.16, segZ);

        const baseGoldCap = new THREE.Mesh(
          new THREE.BoxGeometry(0.12, 0.04, segLen),
          antiqueGoldMat
        );
        baseGoldCap.position.set(xPos - sideFacing * 0.06, 0.34, segZ);
        wallGroup.add(baseStone, baseGoldCap);

        // 3. Crown Cornice Molding at Ceiling Junction
        const crownCornice = new THREE.Mesh(
          new THREE.BoxGeometry(0.16, 0.28, segLen),
          stoneTrimMat
        );
        crownCornice.position.set(xPos - sideFacing * 0.08, hallHeight - 0.14, segZ);

        const crownGoldStrip = new THREE.Mesh(
          new THREE.BoxGeometry(0.18, 0.04, segLen),
          antiqueGoldMat
        );
        crownGoldStrip.position.set(xPos - sideFacing * 0.09, hallHeight - 0.26, segZ);
        wallGroup.add(crownCornice, crownGoldStrip);

        // 4. Horizontal Dado Chair Rail at Y = 1.25m
        const dadoRail = new THREE.Mesh(
          new THREE.BoxGeometry(0.05, 0.06, segLen),
          antiqueGoldMat
        );
        dadoRail.position.set(xPos - sideFacing * 0.025, 1.25, segZ);
        wallGroup.add(dadoRail);

        // 5. Classical Boiserie Wainscot & Grand Panel Boxes
        const numBays = Math.max(1, Math.round(segLen / 3.8));
        const bayW = segLen / numBays;
        for (let b = 0; b < numBays; b++) {
          const bz = zStart - (b + 0.5) * bayW;
          const boxW = Math.max(1.8, bayW - 0.7);

          // A. Lower Wainscot Panel Box (Y = 0.78, H = 0.62)
          const lowerH = 0.62;
          const lowerY = 0.78;
          // Outer Stone Frame
          addMouldingBar(xPos + sideFacing * 0.018, lowerY + lowerH / 2, bz, 0.036, 0.045, boxW, false);
          addMouldingBar(xPos + sideFacing * 0.018, lowerY - lowerH / 2, bz, 0.036, 0.045, boxW, false);
          addMouldingBar(xPos + sideFacing * 0.018, lowerY, bz - boxW / 2, 0.036, lowerH, 0.045, false);
          addMouldingBar(xPos + sideFacing * 0.018, lowerY, bz + boxW / 2, 0.036, lowerH, 0.045, false);
          // Inner Gold Fillet Bead (Inset by 6cm)
          const lowerWin = boxW - 0.12;
          const lowerHin = lowerH - 0.12;
          addMouldingBar(xPos + sideFacing * 0.024, lowerY + lowerHin / 2, bz, 0.024, 0.020, lowerWin, true);
          addMouldingBar(xPos + sideFacing * 0.024, lowerY - lowerHin / 2, bz, 0.024, 0.020, lowerWin, true);
          addMouldingBar(xPos + sideFacing * 0.024, lowerY, bz - lowerWin / 2, 0.024, lowerHin, 0.020, true);
          addMouldingBar(xPos + sideFacing * 0.024, lowerY, bz + lowerWin / 2, 0.024, lowerHin, 0.020, true);

          // B. Upper Grand Picture-Frame Panel Box (Y = 3.80, H = 4.40)
          const upperH = 4.40;
          const upperY = 3.80;
          // Outer Stone Frame
          addMouldingBar(xPos + sideFacing * 0.018, upperY + upperH / 2, bz, 0.036, 0.045, boxW, false);
          addMouldingBar(xPos + sideFacing * 0.018, upperY - upperH / 2, bz, 0.036, 0.045, boxW, false);
          addMouldingBar(xPos + sideFacing * 0.018, upperY, bz - boxW / 2, 0.036, upperH, 0.045, false);
          addMouldingBar(xPos + sideFacing * 0.018, upperY, bz + boxW / 2, 0.036, upperH, 0.045, false);
          // Inner Gold Fillet Bead (Inset by 8cm)
          const upperWin = boxW - 0.16;
          const upperHin = upperH - 0.16;
          addMouldingBar(xPos + sideFacing * 0.024, upperY + upperHin / 2, bz, 0.024, 0.020, upperWin, true);
          addMouldingBar(xPos + sideFacing * 0.024, upperY - upperHin / 2, bz, 0.024, 0.020, upperWin, true);
          addMouldingBar(xPos + sideFacing * 0.024, upperY, bz - upperWin / 2, 0.024, upperHin, 0.020, true);
          addMouldingBar(xPos + sideFacing * 0.024, upperY, bz + upperWin / 2, 0.024, upperHin, 0.020, true);
        }
      };

      const doorHalfW = 3.2; // 6.4m wide grand entrance opening

      // Segment 1: from hallZStart to first door
      addWallSegment(hallZStart, zDoors[0] + doorHalfW);

      // Segments between doors
      for (let i = 0; i < zDoors.length - 1; i++) {
        addWallSegment(zDoors[i] - doorHalfW, zDoors[i + 1] + doorHalfW);
      }

      // Segment from last door to hallZEnd
      addWallSegment(zDoors[zDoors.length - 1] - doorHalfW, hallZEnd);

      // Header walls above doorways (elevated to 5.4m for grand proportions)
      zDoors.forEach((dz) => {
        const headerH = hallHeight - 5.4;
        const header = new THREE.Mesh(
          new THREE.PlaneGeometry(doorHalfW * 2, headerH),
          corridorWallMat
        );
        header.rotation.y = sideFacing * (Math.PI / 2);
        header.position.set(xPos, 5.4 + headerH / 2, dz);
        wallGroup.add(header);
      });

      hallwayGroup.add(wallGroup);
    };

    // Build Left (X = -5) and Right (X = +5) Walls
    buildWallWithDoorways(-hallWidth / 2, [-20, -70, -120], 1);
    buildWallWithDoorways(hallWidth / 2, [-45, -95, -145], -1);

    // Finalize instanced boiserie panel meshes
    stonePanelInstanced.count = stoneBarIdx;
    stonePanelInstanced.instanceMatrix.needsUpdate = true;
    goldPanelInstanced.count = goldBarIdx;
    goldPanelInstanced.instanceMatrix.needsUpdate = true;
    hallwayGroup.add(stonePanelInstanced, goldPanelInstanced);

    // --- 6. PHYSICAL 3D DOORWAYS & ARCHWAYS (ANTIQUE GOLD & HONEY OAK TRIM) ---
    const portals = [
      { z: -20, xDoor: -hallWidth / 2, dir: -1, roman: "I" },
      { z: -45, xDoor: hallWidth / 2, dir: 1, roman: "II" },
      { z: -70, xDoor: -hallWidth / 2, dir: -1, roman: "III" },
      { z: -95, xDoor: hallWidth / 2, dir: 1, roman: "IV" },
      { z: -120, xDoor: -hallWidth / 2, dir: -1, roman: "V" },
      { z: -145, xDoor: hallWidth / 2, dir: 1, roman: "VI" },
    ];

    portals.forEach((p) => {
      const archGroup = new THREE.Group();
      archGroup.position.set(p.xDoor, 0, p.z);

      const frameDepth = 0.85;
      const frameWidth = 0.50; // Majestic column width
      const doorOpenWidth = 6.4; // 6.4m wide uninterrupted entrance view
      const doorOpenHeight = 5.4; // Elevated grand opening
      const colZ = doorOpenWidth / 2 + frameWidth / 2; // Exactly 3.45m flanking edge

      // Material tailored per chamber theme
      const colMat = p.roman === "II" ? flutedOakMat : stoneTrimMat;

      // 1. FLANKING PAIR OF CLASSICAL ARCHITECTURAL COLUMNS (LEFT & RIGHT EDGES ONLY)
      [-colZ, colZ].forEach((cz) => {
        // A. Molded Column Plinth Base
        const plinth = new THREE.Mesh(
          new THREE.BoxGeometry(frameDepth + 0.08, 0.42, frameWidth + 0.08),
          colMat
        );
        plinth.position.set(0, 0.21, cz);

        const plinthGoldCollar = new THREE.Mesh(
          new THREE.BoxGeometry(frameDepth + 0.10, 0.05, frameWidth + 0.10),
          antiqueGoldMat
        );
        plinthGoldCollar.position.set(0, 0.445, cz);

        // B. Classical Fluted / Honed Column Shaft
        const shaftH = doorOpenHeight - 0.85;
        const shaft = new THREE.Mesh(
          new THREE.BoxGeometry(frameDepth, shaftH, frameWidth),
          colMat
        );
        shaft.position.set(0, 0.47 + shaftH / 2, cz);

        // Architectural gold bead edge reveals on column shaft face
        const goldBead1 = new THREE.Mesh(
          new THREE.BoxGeometry(0.015, shaftH, 0.02),
          antiqueGoldMat
        );
        goldBead1.position.set(-p.dir * (frameDepth / 2 + 0.008), 0.47 + shaftH / 2, cz - frameWidth / 2 + 0.04);

        const goldBead2 = new THREE.Mesh(
          new THREE.BoxGeometry(0.015, shaftH, 0.02),
          antiqueGoldMat
        );
        goldBead2.position.set(-p.dir * (frameDepth / 2 + 0.008), 0.47 + shaftH / 2, cz + frameWidth / 2 - 0.04);

        // C. Molded Tuscan / Corinthian Capital in Antique Gold
        const capital = new THREE.Mesh(
          new THREE.BoxGeometry(frameDepth + 0.10, 0.38, frameWidth + 0.10),
          antiqueGoldMat
        );
        capital.position.set(0, doorOpenHeight - 0.19, cz);

        archGroup.add(plinth, plinthGoldCollar, shaft, goldBead1, goldBead2, capital);
      });

      // 2. MONUMENTAL ARCHWAY ENTABLATURE & LINTEL (CONNECTING FLANKING COLUMNS OVERHEAD)
      const entablatureLen = doorOpenWidth + frameWidth * 2 + 0.20; // 7.6m continuous span
      const frieze = new THREE.Mesh(
        new THREE.BoxGeometry(frameDepth + 0.04, 0.55, entablatureLen),
        colMat
      );
      frieze.position.set(0, doorOpenHeight + 0.275, 0);

      const cornice = new THREE.Mesh(
        new THREE.BoxGeometry(frameDepth + 0.12, 0.22, entablatureLen + 0.10),
        antiqueGoldMat
      );
      cornice.position.set(0, doorOpenHeight + 0.55 + 0.11, 0);

      const architraveGoldFillet = new THREE.Mesh(
        new THREE.BoxGeometry(frameDepth + 0.06, 0.05, doorOpenWidth),
        antiqueGoldMat
      );
      architraveGoldFillet.position.set(0, doorOpenHeight - 0.025, 0);

      // 3. CENTRAL ROMAN NUMERAL PLAQUE IN BURNISHED ANTIQUE GOLD
      const plaque = new THREE.Mesh(
        new THREE.BoxGeometry(0.14, 0.65, 1.35),
        antiqueGoldMat
      );
      plaque.position.set(-p.dir * 0.44, doorOpenHeight + 0.75, 0);

      // 4. ARCHITECTURAL WARM SOFFIT DOWNLIGHT (WELCOMING CHAMBER ENTRY WASH)
      const soffitDownlight = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.18, 0.03, 16),
        new THREE.MeshStandardMaterial({
          color: 0xffedd2,
          emissive: 0xffcb72,
          emissiveIntensity: 1.6,
          roughness: 0.3,
        })
      );
      soffitDownlight.position.set(0, doorOpenHeight - 0.015, 0);

      // 5. FLUSH ARCHITECTURAL BRASS THRESHOLD INLAY ON FLOOR
      const thresh = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.003, doorOpenWidth),
        antiqueGoldMat
      );
      thresh.position.set(0, 0.0015, 0);

      archGroup.add(frieze, cornice, architraveGoldFillet, plaque, soffitDownlight, thresh);
      hallwayGroup.add(archGroup);
    });

    // =========================================================================
    // --- 7. COMPLETE ENCLOSED CHAMBER ARCHITECTURE & 3D FURNITURE SYSTEMS ---
    // =========================================================================

    // Variables for room-specific ambient animations (culled per active chamber)
    let grandDustPoints: THREE.Points | null = null;
    const grandDustCount = 50;

    let versaceDustPoints: THREE.Points | null = null;
    const versaceDustCount = 40;

    let activeChamberSpot: THREE.SpotLight | null = null;
    let activeChandelierLight: THREE.PointLight | null = null;
    let sanctumDiyaLight: THREE.PointLight | null = null;
    let sanctumFlameMesh: THREE.Mesh | null = null;
    let incenseParticles: THREE.Points | null = null;
    const incenseCount = 35;
    const incenseOrigin = new THREE.Vector3(-6.53, 1.15, 0.42);

    // Architectural Shell Builder: ensures zero void gaps, continuous walls, floors, baseboards, and cornices
    const buildRoomShell = (
      xDoor: number,
      zCenter: number,
      sideDir: number,
      wallColor: number,
      floorMat: THREE.Material
    ) => {
      const roomGroup = new THREE.Group();
      const roomW = 16.0;
      const roomD = 16.0;
      const roomH = 7.2;
      const roomXCenter = xDoor + sideDir * (roomW / 2);
      roomGroup.position.set(roomXCenter, 0, zCenter);

      // 1. FLOOR (Seamless edge-to-edge floor plane meeting hallway doorway threshold)
      const floorMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(roomW, roomD),
        floorMat
      );
      floorMesh.rotation.x = -Math.PI / 2;
      floorMesh.position.set(0, 0, 0);
      roomGroup.add(floorMesh);

      // 2. CEILING (Light warm ivory stone with recessed indirect golden cove light channel)
      const ceilMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(roomW, roomD),
        new THREE.MeshStandardMaterial({
          color: 0xf6efe6,
          roughness: 0.70,
        })
      );
      ceilMesh.rotation.x = Math.PI / 2;
      ceilMesh.position.set(0, roomH, 0);
      roomGroup.add(ceilMesh);

      // 2b. Recessed Perimeter Architectural Golden Cove Light Reveal Channels
      const coveMat = new THREE.MeshStandardMaterial({
        color: 0xffeed0,
        emissive: 0xffd48e,
        emissiveIntensity: 0.85,
        roughness: 0.35,
      });
      const coveN = new THREE.Mesh(new THREE.BoxGeometry(roomW - 1.2, 0.04, 0.12), coveMat);
      coveN.position.set(0, roomH - 0.03, -roomD / 2 + 0.6);
      const coveS = new THREE.Mesh(new THREE.BoxGeometry(roomW - 1.2, 0.04, 0.12), coveMat);
      coveS.position.set(0, roomH - 0.03, roomD / 2 - 0.6);
      const coveW = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.04, roomD - 1.2), coveMat);
      coveW.position.set(-roomW / 2 + 0.6, roomH - 0.03, 0);
      const coveE = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.04, roomD - 1.2), coveMat);
      coveE.position.set(roomW / 2 - 0.6, roomH - 0.03, 0);
      roomGroup.add(coveN, coveS, coveW, coveE);

      // 3. ARCHITECTURAL WALL MATERIAL
      const wallMat = new THREE.MeshStandardMaterial({
        color: wallColor,
        roughness: 0.58,
        metalness: 0.04,
      });

      // 4. ENTRANCE WALL WITH DOORWAY CUTOUT (meeting hallway archway flush)
      const entryWallX = -sideDir * (roomW / 2);
      const doorW = 6.4;
      const doorH = 5.4;
      const flankW = (roomD - doorW) / 2;

      const entryFlank1 = new THREE.Mesh(
        new THREE.PlaneGeometry(flankW, roomH),
        wallMat
      );
      entryFlank1.position.set(entryWallX, roomH / 2, -doorW / 2 - flankW / 2);
      entryFlank1.rotation.y = sideDir > 0 ? Math.PI / 2 : -Math.PI / 2;

      const entryFlank2 = new THREE.Mesh(
        new THREE.PlaneGeometry(flankW, roomH),
        wallMat
      );
      entryFlank2.position.set(entryWallX, roomH / 2, doorW / 2 + flankW / 2);
      entryFlank2.rotation.y = sideDir > 0 ? Math.PI / 2 : -Math.PI / 2;

      const entryTop = new THREE.Mesh(
        new THREE.PlaneGeometry(doorW, roomH - doorH),
        wallMat
      );
      entryTop.position.set(entryWallX, doorH + (roomH - doorH) / 2, 0);
      entryTop.rotation.y = sideDir > 0 ? Math.PI / 2 : -Math.PI / 2;

      roomGroup.add(entryFlank1, entryFlank2, entryTop);

      // 5. PERIMETER BASEBOARDS & CROWN CORNICES (Eliminates raw polygon seams)
      // Side 1 baseboard & crown (Z = -roomD/2)
      const base1 = new THREE.Mesh(new THREE.BoxGeometry(roomW, 0.26, 0.08), stoneTrimMat);
      base1.position.set(0, 0.13, -roomD / 2 + 0.04);
      const crown1 = new THREE.Mesh(new THREE.BoxGeometry(roomW, 0.22, 0.12), stoneTrimMat);
      crown1.position.set(0, roomH - 0.11, -roomD / 2 + 0.06);
      roomGroup.add(base1, crown1);

      // Side 2 baseboard & crown (Z = +roomD/2)
      const base2 = new THREE.Mesh(new THREE.BoxGeometry(roomW, 0.26, 0.08), stoneTrimMat);
      base2.position.set(0, 0.13, roomD / 2 - 0.04);
      const crown2 = new THREE.Mesh(new THREE.BoxGeometry(roomW, 0.22, 0.12), stoneTrimMat);
      crown2.position.set(0, roomH - 0.11, roomD / 2 - 0.06);
      roomGroup.add(base2, crown2);

      // Back baseboard & crown (X = sideDir * (roomW/2))
      const backX = sideDir * (roomW / 2);
      const baseBack = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.26, roomD), stoneTrimMat);
      baseBack.position.set(backX - sideDir * 0.04, 0.13, 0);
      const crownBack = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.22, roomD), stoneTrimMat);
      crownBack.position.set(backX - sideDir * 0.06, roomH - 0.11, 0);
      roomGroup.add(baseBack, crownBack);

      return { roomGroup, roomW, roomD, roomH, wallMat, roomXCenter };
    };

    // Helper to create museum-grade exhibition framed artworks with bevel mat, antique gold profile, picture light, and brass plaque
    const createFramedArtMesh = (
      artTex: THREE.Texture,
      artW: number,
      artH: number,
      frameThick = 0.08,
      hasPictureLight = true,
      matBorder = 0.12
    ) => {
      const artGroup = new THREE.Group();

      const totalW = artW + matBorder * 2 + frameThick * 2;
      const totalH = artH + matBorder * 2 + frameThick * 2;

      // 1. Backing Board (prevents see-through or light leaks)
      const backingMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(totalW, totalH),
        new THREE.MeshStandardMaterial({
          color: 0x1f1b18,
          roughness: 0.95,
          fog: false,
        })
      );
      backingMesh.position.z = 0;

      // 2. Archival Beveled Linen Mat
      const matMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(artW + matBorder * 2, artH + matBorder * 2),
        new THREE.MeshStandardMaterial({
          color: 0xf5f1e8,
          roughness: 0.92,
          fog: false,
        })
      );
      matMesh.position.z = 0.008;

      // 3. Photographic Fine Art Canvas (Direct 4K museum master texture)
      const canvasMat = new THREE.MeshStandardMaterial({
        map: artTex,
        emissiveMap: artTex,
        emissive: 0xffffff,
        emissiveIntensity: 0.35, // Museum picture-light radiance for crystal clarity
        roughness: 0.32,
        metalness: 0.04,
        transparent: true,
        opacity: 1.0,
        fog: false,
      });
      const canvasMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(artW, artH),
        canvasMat
      );
      canvasMesh.position.z = 0.016;

      artGroup.add(backingMesh, matMesh, canvasMesh);

      // 4. Perimeter Raised Gold Moulding Border (Hollow frame rim so canvas is never occluded)
      const mouldThick = 0.045; // depth outward
      const mouldW = frameThick;

      // Top Bar
      const mouldTop = new THREE.Mesh(
        new THREE.BoxGeometry(totalW, mouldW, mouldThick),
        antiqueGoldMat
      );
      mouldTop.position.set(0, (totalH - mouldW) / 2, mouldThick / 2);

      // Bottom Bar
      const mouldBottom = new THREE.Mesh(
        new THREE.BoxGeometry(totalW, mouldW, mouldThick),
        antiqueGoldMat
      );
      mouldBottom.position.set(0, -(totalH - mouldW) / 2, mouldThick / 2);

      // Left Bar
      const mouldLeft = new THREE.Mesh(
        new THREE.BoxGeometry(mouldW, totalH - mouldW * 2, mouldThick),
        antiqueGoldMat
      );
      mouldLeft.position.set(-(totalW - mouldW) / 2, 0, mouldThick / 2);

      // Right Bar
      const mouldRight = new THREE.Mesh(
        new THREE.BoxGeometry(mouldW, totalH - mouldW * 2, mouldThick),
        antiqueGoldMat
      );
      mouldRight.position.set((totalW - mouldW) / 2, 0, mouldThick / 2);

      artGroup.add(mouldTop, mouldBottom, mouldLeft, mouldRight);

      // 5. Architectural Picture Downlight Hoods (Triple for wide frames > 5.5m, Single for standard)
      if (hasPictureLight) {
        const lightOffsets = artW > 5.5 ? [-artW * 0.32, 0, artW * 0.32] : [0];
        const hoodW = artW > 5.5 ? Math.min(2.0, artW * 0.22) : Math.min(2.0, artW * 0.65);

        lightOffsets.forEach((ox) => {
          const lightHood = new THREE.Mesh(
            new THREE.BoxGeometry(hoodW, 0.04, 0.16),
            antiqueGoldMat
          );
          lightHood.position.set(ox, totalH / 2 + 0.14, 0.12);

          const lightStrip = new THREE.Mesh(
            new THREE.BoxGeometry(hoodW - 0.06, 0.014, 0.05),
            new THREE.MeshStandardMaterial({
              color: 0xffeed8,
              emissive: 0xffdca0,
              emissiveIntensity: 1.5,
              roughness: 0.2,
              fog: false,
            })
          );
          lightStrip.position.set(ox, totalH / 2 + 0.12, 0.12);

          const arm1 = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.16), antiqueGoldMat);
          arm1.rotation.x = Math.PI / 2;
          arm1.position.set(ox - hoodW * 0.3, totalH / 2 + 0.14, 0.06);

          const arm2 = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.16), antiqueGoldMat);
          arm2.rotation.x = Math.PI / 2;
          arm2.position.set(ox + hoodW * 0.3, totalH / 2 + 0.14, 0.06);

          artGroup.add(lightHood, lightStrip, arm1, arm2);
        });
      }

      // 6. Museum Brass Title Plaque
      const plaqueMesh = new THREE.Mesh(
        new THREE.BoxGeometry(Math.min(1.2, artW * 0.25), 0.14, 0.015),
        new THREE.MeshStandardMaterial({
          color: 0xc8aa6e,
          roughness: 0.30,
          metalness: 0.70,
          fog: false,
        })
      );
      plaqueMesh.position.set(0, -totalH / 2 - 0.14, 0.01);
      artGroup.add(plaqueMesh);

      return {
        group: artGroup,
        canvasMesh,
        canvasMat,
        plaqueMesh,
      };
    };

    // --- HIGH-PERFORMANCE UNIFIED DYNAMIC CHAMBER LIGHTING POOL ---
    // Attached directly to hallwayGroup. Constant light count prevents mid-scroll WebGLProgram recompilations.
    // Instead of 20 simultaneous dynamic lights, this pooled system evaluates only 3 chamber lights,
    // reducing GPU fragment shading load by over 70% across the entire mansion.
    const chamberLightsGroup = new THREE.Group();
    chamberLightsGroup.name = "permanentChamberLights";
    hallwayGroup.add(chamberLightsGroup);

    // 1. Dynamic Chamber Hero SpotLight (smoothly steers to active chamber)
    activeChamberSpot = new THREE.SpotLight(0xffecd0, 1.8, 24, Math.PI / 3, 0.45);
    activeChamberSpot.position.set(-11.5, 6.8, -24.8);
    activeChamberSpot.target.position.set(-5.8, 0.35, -20);
    chamberLightsGroup.add(activeChamberSpot, activeChamberSpot.target);

    // 2. Dynamic Chandelier PointLight (smoothly steers to active chandelier)
    activeChandelierLight = new THREE.PointLight(0xfff0d6, 0.85, 11.0, 2.0);
    activeChandelierLight.position.set(-17.0, 5.2, -20.0);
    chamberLightsGroup.add(activeChandelierLight);

    // 3. Dedicated Sanctum Diya Flame PointLight
    sanctumDiyaLight = new THREE.PointLight(0xff9a28, 0.0, 4.0, 2.0);
    sanctumDiyaLight.position.set(-17.0 - 5.5, 1.05, -70.0);
    chamberLightsGroup.add(sanctumDiyaLight);

    // --- STATEMENT CHANDELIER & CURATED ARTIFACT MATERIALS ---
    const crystalSparkleMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.08,
      metalness: 0.15,
      emissive: 0xfff6ea,
      emissiveIntensity: 0.35,
      fog: false,
    });

    const chandelierGlowMat = new THREE.MeshBasicMaterial({
      color: 0xfff8e7,
    });

    const templeFlameMat = new THREE.MeshBasicMaterial({
      color: 0xff9a24,
    });

    const porcelainCobaltMat = new THREE.MeshStandardMaterial({
      color: 0x14223d,
      roughness: 0.12,
      metalness: 0.15,
      fog: false,
    });

    const cognacBlotterMat = new THREE.MeshStandardMaterial({
      color: 0x8a451e,
      roughness: 0.38,
      metalness: 0.05,
      fog: false,
    });

    const safeMerge = (geos: THREE.BufferGeometry[], mat: THREE.Material): THREE.Mesh | null => {
      if (!geos || geos.length === 0) return null;
      try {
        const hasIndex = geos.some((g) => g.index !== null);
        const hasNonIndex = geos.some((g) => g.index === null);
        let normalizedGeos = geos;
        let needsDispose = false;
        if (hasIndex && hasNonIndex) {
          normalizedGeos = geos.map((g) => (g.index ? g.toNonIndexed() : g));
          needsDispose = true;
        }
        const merged = BufferGeometryUtils.mergeGeometries(normalizedGeos, false);
        geos.forEach((g) => g.dispose());
        if (needsDispose) {
          normalizedGeos.forEach((g) => g.dispose());
        }
        if (!merged) return null;
        return new THREE.Mesh(merged, mat);
      } catch (err) {
        console.warn("safeMerge failed:", err);
        return null;
      }
    };

    // 1. Grand Tiered Crystal & Brass Chandelier (Chamber I: Grand Living)
    const buildTieredCrystalChandelier = (
      roomGroup: THREE.Group,
      localX: number,
      localY: number,
      localZ: number,
      worldX: number,
      worldY: number,
      worldZ: number
    ) => {
      const group = new THREE.Group();
      group.position.set(localX, localY, localZ);

      const brassGeos: THREE.BufferGeometry[] = [];
      const crystalGeos: THREE.BufferGeometry[] = [];
      const glowGeos: THREE.BufferGeometry[] = [];

      const ceilingH = 7.2 - localY;
      const medallionGeo = new THREE.CylinderGeometry(0.48, 0.52, 0.06, 24);
      medallionGeo.translate(0, ceilingH - 0.03, 0);
      brassGeos.push(medallionGeo);

      const rodGeo = new THREE.CylinderGeometry(0.02, 0.02, Math.max(0.2, ceilingH - 0.5), 12);
      rodGeo.translate(0, (ceilingH + 0.5) / 2, 0);
      brassGeos.push(rodGeo);

      const urnGeo = new THREE.CylinderGeometry(0.12, 0.08, 0.6, 16);
      urnGeo.translate(0, 0.5, 0);
      brassGeos.push(urnGeo);

      const tiers = [
        { radius: 0.75, y: 0.60, count: 18, prismH: 0.40, prismR: 0.032 },
        { radius: 1.25, y: 0.20, count: 26, prismH: 0.50, prismR: 0.035 },
        { radius: 1.75, y: -0.25, count: 34, prismH: 0.62, prismR: 0.038 },
      ];

      tiers.forEach((tier) => {
        const ringGeo = new THREE.TorusGeometry(tier.radius, 0.025, 12, 32);
        ringGeo.rotateX(Math.PI / 2);
        ringGeo.translate(0, tier.y, 0);
        brassGeos.push(ringGeo);

        for (let s = 0; s < 4; s++) {
          const angle = (s * Math.PI) / 2;
          const spokeGeo = new THREE.CylinderGeometry(0.012, 0.012, tier.radius, 8);
          spokeGeo.rotateZ(Math.PI / 2);
          spokeGeo.rotateY(angle);
          spokeGeo.translate((Math.cos(angle) * tier.radius) / 2, tier.y, (Math.sin(angle) * tier.radius) / 2);
          brassGeos.push(spokeGeo);
        }

        for (let i = 0; i < tier.count; i++) {
          const a = (i / tier.count) * Math.PI * 2;
          const px = Math.cos(a) * tier.radius;
          const pz = Math.sin(a) * tier.radius;

          const loopGeo = new THREE.SphereGeometry(0.016, 8, 8);
          loopGeo.translate(px, tier.y - 0.02, pz);
          brassGeos.push(loopGeo);

          const prismGeo = new THREE.CylinderGeometry(tier.prismR, tier.prismR * 0.7, tier.prismH, 8);
          prismGeo.translate(px, tier.y - 0.02 - tier.prismH / 2, pz);
          crystalGeos.push(prismGeo);

          const tipGeo = new THREE.ConeGeometry(tier.prismR * 0.7, tier.prismR * 1.5, 8);
          tipGeo.rotateX(Math.PI);
          tipGeo.translate(px, tier.y - 0.02 - tier.prismH - (tier.prismR * 1.5) / 2, pz);
          crystalGeos.push(tipGeo);
        }
      });

      const candleCount = 14;
      for (let c = 0; c < candleCount; c++) {
        const a = (c / candleCount) * Math.PI * 2;
        const cx = Math.cos(a) * 1.25;
        const cz = Math.sin(a) * 1.25;

        const saucerGeo = new THREE.CylinderGeometry(0.055, 0.03, 0.02, 12);
        saucerGeo.translate(cx, 0.22, cz);
        brassGeos.push(saucerGeo);

        const sleeveGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.12, 12);
        sleeveGeo.translate(cx, 0.29, cz);
        brassGeos.push(sleeveGeo);

        const bulbGeo = new THREE.ConeGeometry(0.018, 0.05, 10);
        bulbGeo.translate(cx, 0.37, cz);
        glowGeos.push(bulbGeo);
      }

      const brassMesh = safeMerge(brassGeos, antiqueGoldMat);
      if (brassMesh) group.add(brassMesh);

      const crystalMesh = safeMerge(crystalGeos, crystalSparkleMat);
      if (crystalMesh) group.add(crystalMesh);

      const glowMesh = safeMerge(glowGeos, chandelierGlowMat);
      if (glowMesh) group.add(glowMesh);

      roomGroup.add(group);

      return group;
    };

    // 2. Crystal Drop Cluster Chandelier (Chamber II: Versace Suite)
    const buildClusterDropChandelier = (
      roomGroup: THREE.Group,
      localX: number,
      localY: number,
      localZ: number,
      worldX: number,
      worldY: number,
      worldZ: number
    ) => {
      const group = new THREE.Group();
      group.position.set(localX, localY, localZ);

      const brassGeos: THREE.BufferGeometry[] = [];
      const crystalGeos: THREE.BufferGeometry[] = [];
      const glowGeos: THREE.BufferGeometry[] = [];

      const ceilingH = 7.2 - localY;
      const canopyGeo = new THREE.CylinderGeometry(1.25, 1.25, 0.04, 32);
      canopyGeo.translate(0, ceilingH - 0.02, 0);
      brassGeos.push(canopyGeo);

      const dropConfigs = [
        { ringR: 0.30, count: 6, baseDrop: 1.8, var: 0.25 },
        { ringR: 0.68, count: 8, baseDrop: 2.2, var: 0.35 },
        { ringR: 1.05, count: 10, baseDrop: 2.6, var: 0.40 },
      ];

      let dropIdx = 0;
      dropConfigs.forEach((cfg) => {
        for (let i = 0; i < cfg.count; i++) {
          const a = (i / cfg.count) * Math.PI * 2 + (dropIdx % 2 ? 0.2 : 0);
          const px = Math.cos(a) * cfg.ringR;
          const pz = Math.sin(a) * cfg.ringR;
          const dropLen = cfg.baseDrop + Math.sin(dropIdx * 1.7) * cfg.var;
          const dropBottomY = ceilingH - dropLen;

          const cableGeo = new THREE.CylinderGeometry(0.004, 0.004, dropLen - 0.35, 6);
          cableGeo.translate(px, ceilingH - (dropLen - 0.35) / 2, pz);
          brassGeos.push(cableGeo);

          const fittingGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.08, 12);
          fittingGeo.translate(px, dropBottomY + 0.35, pz);
          brassGeos.push(fittingGeo);

          const crystalGeo = new THREE.CylinderGeometry(0.034, 0.028, 0.32, 8);
          crystalGeo.translate(px, dropBottomY + 0.18, pz);
          crystalGeos.push(crystalGeo);

          const finialGeo = new THREE.ConeGeometry(0.028, 0.08, 8);
          finialGeo.rotateX(Math.PI);
          finialGeo.translate(px, dropBottomY - 0.04, pz);
          crystalGeos.push(finialGeo);

          const glowGeo = new THREE.SphereGeometry(0.020, 8, 8);
          glowGeo.translate(px, dropBottomY + 0.15, pz);
          glowGeos.push(glowGeo);

          dropIdx++;
        }
      });

      const brassMesh = safeMerge(brassGeos, antiqueGoldMat);
      if (brassMesh) group.add(brassMesh);

      const crystalMesh = safeMerge(crystalGeos, crystalSparkleMat);
      if (crystalMesh) group.add(crystalMesh);

      const glowMesh = safeMerge(glowGeos, chandelierGlowMat);
      if (glowMesh) group.add(glowMesh);

      roomGroup.add(group);

      return group;
    };

    // 3. Ornate Brass Temple Hanging Lamp / Akhand Diya (Chamber III: Sacred Sanctum)
    const buildTempleHangingLamp = (
      roomGroup: THREE.Group,
      localX: number,
      localY: number,
      localZ: number,
      worldX: number,
      worldY: number,
      worldZ: number
    ) => {
      const group = new THREE.Group();
      group.position.set(localX, localY, localZ);

      const brassGeos: THREE.BufferGeometry[] = [];
      const flameGeos: THREE.BufferGeometry[] = [];

      const ceilingH = 7.2 - localY;

      const rosetteGeo = new THREE.CylinderGeometry(0.52, 0.58, 0.06, 24);
      rosetteGeo.translate(0, ceilingH - 0.03, 0);
      brassGeos.push(rosetteGeo);

      const rosetteTrim = new THREE.TorusGeometry(0.54, 0.03, 12, 24);
      rosetteTrim.rotateX(Math.PI / 2);
      rosetteTrim.translate(0, ceilingH - 0.05, 0);
      brassGeos.push(rosetteTrim);

      const chainLen = Math.max(0.5, ceilingH - 1.2);
      const chainR = 0.38;
      for (let c = 0; c < 4; c++) {
        const a = (c * Math.PI) / 2 + Math.PI / 4;
        const cx = Math.cos(a) * chainR;
        const cz = Math.sin(a) * chainR;

        const chainGeo = new THREE.CylinderGeometry(0.014, 0.014, chainLen, 8);
        chainGeo.translate(cx, ceilingH - chainLen / 2, cz);
        brassGeos.push(chainGeo);

        for (let l = 0; l < 4; l++) {
          const linkGeo = new THREE.TorusGeometry(0.032, 0.008, 8, 16);
          linkGeo.translate(cx, ceilingH - (chainLen * (l + 1)) / 5, cz);
          brassGeos.push(linkGeo);
        }
      }

      const domeGeo = new THREE.CylinderGeometry(0.18, 0.46, 0.42, 24);
      domeGeo.translate(0, 1.0, 0);
      brassGeos.push(domeGeo);

      const domeTrim = new THREE.TorusGeometry(0.48, 0.025, 12, 24);
      domeTrim.rotateX(Math.PI / 2);
      domeTrim.translate(0, 0.79, 0);
      brassGeos.push(domeTrim);

      const bowlGeo = new THREE.CylinderGeometry(0.68, 0.28, 0.26, 24);
      bowlGeo.translate(0, 0.65, 0);
      brassGeos.push(bowlGeo);

      const rimGeo = new THREE.TorusGeometry(0.70, 0.03, 12, 32);
      rimGeo.rotateX(Math.PI / 2);
      rimGeo.translate(0, 0.78, 0);
      brassGeos.push(rimGeo);

      const wickCount = 8;
      for (let w = 0; w < wickCount; w++) {
        const a = (w / wickCount) * Math.PI * 2;
        const wx = Math.cos(a) * 0.72;
        const wz = Math.sin(a) * 0.72;

        const spoutGeo = new THREE.BoxGeometry(0.06, 0.03, 0.08);
        spoutGeo.rotateY(-a);
        spoutGeo.translate(wx, 0.78, wz);
        brassGeos.push(spoutGeo);

        const flameGeo = new THREE.ConeGeometry(0.035, 0.12, 12);
        flameGeo.translate(wx * 1.04, 0.86, wz * 1.04);
        flameGeos.push(flameGeo);
      }

      const finialGeo = new THREE.CylinderGeometry(0.24, 0.08, 0.35, 16);
      finialGeo.translate(0, 0.35, 0);
      brassGeos.push(finialGeo);

      const dropFinialGeo = new THREE.SphereGeometry(0.07, 12, 12);
      dropFinialGeo.translate(0, 0.14, 0);
      brassGeos.push(dropFinialGeo);

      for (let b = 0; b < 8; b++) {
        const a = (b / 8) * Math.PI * 2 + Math.PI / 8;
        const bx = Math.cos(a) * 0.68;
        const bz = Math.sin(a) * 0.68;

        const miniChain = new THREE.CylinderGeometry(0.005, 0.005, 0.14, 6);
        miniChain.translate(bx, 0.58, bz);
        brassGeos.push(miniChain);

        const bellGeo = new THREE.CylinderGeometry(0.02, 0.045, 0.07, 12);
        bellGeo.translate(bx, 0.48, bz);
        brassGeos.push(bellGeo);
      }

      const brassMesh = safeMerge(brassGeos, antiqueGoldMat);
      if (brassMesh) group.add(brassMesh);

      const flameMesh = safeMerge(flameGeos, templeFlameMat);
      if (flameMesh) group.add(flameMesh);

      roomGroup.add(group);

      return group;
    };

    // 4. Sleek Linear Executive Chandelier (Chamber IV: Executive Boardroom)
    const buildLinearExecutiveChandelier = (
      roomGroup: THREE.Group,
      localX: number,
      localY: number,
      localZ: number,
      worldX: number,
      worldY: number,
      worldZ: number
    ) => {
      const group = new THREE.Group();
      group.position.set(localX, localY, localZ);

      const brassGeos: THREE.BufferGeometry[] = [];
      const glassGeos: THREE.BufferGeometry[] = [];
      const glowGeos: THREE.BufferGeometry[] = [];

      const ceilingH = 7.2 - localY;

      const can1 = new THREE.CylinderGeometry(0.12, 0.12, 0.03, 16);
      can1.translate(0, ceilingH - 0.015, -1.1);
      const can2 = new THREE.CylinderGeometry(0.12, 0.12, 0.03, 16);
      can2.translate(0, ceilingH - 0.015, 1.1);
      brassGeos.push(can1, can2);

      const cable1 = new THREE.CylinderGeometry(0.005, 0.005, ceilingH - 0.08, 8);
      cable1.translate(0, (ceilingH - 0.08) / 2, -1.1);
      const cable2 = new THREE.CylinderGeometry(0.005, 0.005, ceilingH - 0.08, 8);
      cable2.translate(0, (ceilingH - 0.08) / 2, 1.1);
      brassGeos.push(cable1, cable2);

      const barGeo = new THREE.BoxGeometry(0.14, 0.12, 3.2);
      barGeo.translate(0, 0.06, 0);
      brassGeos.push(barGeo);

      const cap1 = new THREE.BoxGeometry(0.16, 0.14, 0.04);
      cap1.translate(0, 0.06, -1.62);
      const cap2 = new THREE.BoxGeometry(0.16, 0.14, 0.04);
      cap2.translate(0, 0.06, 1.62);
      brassGeos.push(cap1, cap2);

      const ledGeo = new THREE.BoxGeometry(0.08, 0.015, 3.0);
      ledGeo.translate(0, -0.005, 0);
      glowGeos.push(ledGeo);

      const louverCount = 24;
      for (let i = 0; i < louverCount; i++) {
        const lz = -1.38 + (i / (louverCount - 1)) * 2.76;
        const louverGeo = new THREE.BoxGeometry(0.24, 0.38, 0.032);
        louverGeo.translate(0, -0.20, lz);
        glassGeos.push(louverGeo);

        const clampGeo = new THREE.BoxGeometry(0.16, 0.03, 0.04);
        clampGeo.translate(0, -0.015, lz);
        brassGeos.push(clampGeo);
      }

      const brassMesh = safeMerge(brassGeos, antiqueGoldMat);
      if (brassMesh) group.add(brassMesh);

      const glassMesh = safeMerge(glassGeos, smokedCrystalMat);
      if (glassMesh) group.add(glassMesh);

      const glowMesh = safeMerge(glowGeos, chandelierGlowMat);
      if (glowMesh) group.add(glowMesh);

      roomGroup.add(group);

      return group;
    };

    // 5. Monumental Royal Cascade Chandelier (Chamber V: Royal Salon)
    const buildRoyalCascadeChandelier = (
      roomGroup: THREE.Group,
      localX: number,
      localY: number,
      localZ: number,
      worldX: number,
      worldY: number,
      worldZ: number
    ) => {
      const group = new THREE.Group();
      group.position.set(localX, localY, localZ);

      const brassGeos: THREE.BufferGeometry[] = [];
      const crystalGeos: THREE.BufferGeometry[] = [];
      const flameGeos: THREE.BufferGeometry[] = [];

      const ceilingH = 7.2 - localY;

      const rosette = new THREE.CylinderGeometry(0.68, 0.76, 0.08, 24);
      rosette.translate(0, ceilingH - 0.04, 0);
      brassGeos.push(rosette);

      const rosetteMoulding = new THREE.TorusGeometry(0.72, 0.04, 12, 24);
      rosetteMoulding.rotateX(Math.PI / 2);
      rosetteMoulding.translate(0, ceilingH - 0.07, 0);
      brassGeos.push(rosetteMoulding);

      const stem = new THREE.CylinderGeometry(0.035, 0.035, Math.max(0.4, ceilingH - 1.2), 12);
      stem.translate(0, (ceilingH + 1.2) / 2, 0);
      brassGeos.push(stem);

      const urn1 = new THREE.CylinderGeometry(0.18, 0.28, 0.5, 16);
      urn1.translate(0, 1.2, 0);
      const urn2 = new THREE.CylinderGeometry(0.32, 0.16, 0.6, 16);
      urn2.translate(0, 0.7, 0);
      const urn3 = new THREE.CylinderGeometry(0.22, 0.38, 0.45, 16);
      urn3.translate(0, 0.25, 0);
      brassGeos.push(urn1, urn2, urn3);

      const collar1 = new THREE.TorusGeometry(0.26, 0.045, 12, 24);
      collar1.rotateX(Math.PI / 2);
      collar1.translate(0, 0.95, 0);
      const collar2 = new THREE.TorusGeometry(0.36, 0.05, 12, 24);
      collar2.rotateX(Math.PI / 2);
      collar2.translate(0, 0.45, 0);
      crystalGeos.push(collar1, collar2);

      const armTiers = [
        { radius: 0.95, y: 1.15, count: 6, armThick: 0.02 },
        { radius: 1.55, y: 0.65, count: 8, armThick: 0.024 },
        { radius: 2.15, y: 0.15, count: 12, armThick: 0.028 },
      ];

      armTiers.forEach((tier) => {
        const ringGeo = new THREE.TorusGeometry(tier.radius * 0.45, 0.03, 12, 24);
        ringGeo.rotateX(Math.PI / 2);
        ringGeo.translate(0, tier.y - 0.1, 0);
        brassGeos.push(ringGeo);

        for (let aIdx = 0; aIdx < tier.count; aIdx++) {
          const angle = (aIdx / tier.count) * Math.PI * 2;
          const ax = Math.cos(angle) * tier.radius;
          const az = Math.sin(angle) * tier.radius;

          const armMidR = tier.radius * 0.6;
          const armMidY = tier.y - 0.22;
          const mx = Math.cos(angle) * armMidR;
          const mz = Math.sin(angle) * armMidR;

          const seg1 = new THREE.CylinderGeometry(tier.armThick, tier.armThick, armMidR, 8);
          seg1.rotateZ(Math.PI / 2.8);
          seg1.rotateY(-angle);
          seg1.translate(mx / 2, (tier.y + armMidY) / 2, mz / 2);
          brassGeos.push(seg1);

          const outerLen = tier.radius - armMidR;
          const seg2 = new THREE.CylinderGeometry(tier.armThick, tier.armThick, outerLen * 1.3, 8);
          seg2.rotateZ(-Math.PI / 3);
          seg2.rotateY(-angle);
          seg2.translate((mx + ax) / 2, (armMidY + tier.y) / 2, (mz + az) / 2);
          brassGeos.push(seg2);

          const bobeche = new THREE.CylinderGeometry(0.08, 0.04, 0.035, 12);
          bobeche.translate(ax, tier.y, az);
          crystalGeos.push(bobeche);

          const sleeve = new THREE.CylinderGeometry(0.018, 0.018, 0.16, 10);
          sleeve.translate(ax, tier.y + 0.10, az);
          brassGeos.push(sleeve);

          const flame = new THREE.ConeGeometry(0.022, 0.065, 10);
          flame.translate(ax, tier.y + 0.21, az);
          flameGeos.push(flame);

          const dropPrism = new THREE.CylinderGeometry(0.028, 0.014, 0.24, 8);
          dropPrism.translate(ax, tier.y - 0.14, az);
          crystalGeos.push(dropPrism);
        }
      });

      const swagRing = new THREE.TorusGeometry(1.85, 0.028, 8, 32);
      swagRing.rotateX(Math.PI / 2);
      swagRing.translate(0, 0.02, 0);
      crystalGeos.push(swagRing);

      const bottomBall = new THREE.SphereGeometry(0.12, 16, 16);
      bottomBall.translate(0, -0.05, 0);
      const bottomSpear = new THREE.ConeGeometry(0.08, 0.32, 10);
      bottomSpear.rotateX(Math.PI);
      bottomSpear.translate(0, -0.28, 0);
      crystalGeos.push(bottomBall, bottomSpear);

      const brassMesh = safeMerge(brassGeos, antiqueGoldMat);
      if (brassMesh) group.add(brassMesh);

      const crystalMesh = safeMerge(crystalGeos, crystalSparkleMat);
      if (crystalMesh) group.add(crystalMesh);

      const flameMesh = safeMerge(flameGeos, chandelierGlowMat);
      if (flameMesh) group.add(flameMesh);

      roomGroup.add(group);

      return group;
    };

    // 6. Modern Sculptural Orbital Pendant (Chamber VI: Corporate Reception)
    const buildModernOrbitalPendant = (
      roomGroup: THREE.Group,
      localX: number,
      localY: number,
      localZ: number,
      worldX: number,
      worldY: number,
      worldZ: number
    ) => {
      const group = new THREE.Group();
      group.position.set(localX, localY, localZ);

      const brassGeos: THREE.BufferGeometry[] = [];
      const ledGeos: THREE.BufferGeometry[] = [];

      const ceilingH = 7.2 - localY;

      const canopy = new THREE.CylinderGeometry(0.38, 0.38, 0.03, 24);
      canopy.translate(0, ceilingH - 0.015, 0);
      brassGeos.push(canopy);

      for (let w = 0; w < 4; w++) {
        const a = (w * Math.PI) / 2;
        const wx = Math.cos(a) * 0.28;
        const wz = Math.sin(a) * 0.28;
        const wire = new THREE.CylinderGeometry(0.004, 0.004, Math.max(0.3, ceilingH - 0.5), 6);
        wire.translate(wx, (ceilingH + 0.5) / 2, wz);
        brassGeos.push(wire);
      }

      const rings = [
        { radius: 1.15, tube: 0.035, rotX: 0.42, rotZ: 0.22, y: 0.15 },
        { radius: 0.82, tube: 0.030, rotX: -0.55, rotZ: 0.45, y: 0.0 },
        { radius: 0.52, tube: 0.025, rotX: 0.70, rotZ: -0.35, y: -0.15 },
      ];

      rings.forEach((r) => {
        const ringGeo = new THREE.TorusGeometry(r.radius, r.tube, 12, 32);
        ringGeo.rotateX(r.rotX);
        ringGeo.rotateZ(r.rotZ);
        ringGeo.translate(0, r.y, 0);
        brassGeos.push(ringGeo);

        const ledGeo = new THREE.TorusGeometry(r.radius - r.tube * 0.7, r.tube * 0.45, 10, 32);
        ledGeo.rotateX(r.rotX);
        ledGeo.rotateZ(r.rotZ);
        ledGeo.translate(0, r.y, 0);
        ledGeos.push(ledGeo);
      });

      const brassMesh = safeMerge(brassGeos, sculpturalBronzeDeskMat);
      if (brassMesh) group.add(brassMesh);

      const ledMesh = safeMerge(ledGeos, chandelierGlowMat);
      if (ledMesh) group.add(ledMesh);

      roomGroup.add(group);

      return group;
    };

    // --- CURATED ARTIFACT & DECOR BUILDERS ---
    const buildArtBookStack = (parentGroup: THREE.Group, x: number, y: number, z: number, baseRot: number) => {
      const books = [
        { w: 0.38, d: 0.28, h: 0.052, rot: baseRot, mat: bookTerracottaMat },
        { w: 0.36, d: 0.26, h: 0.048, rot: baseRot + 0.14, mat: bookCharcoalMat },
        { w: 0.34, d: 0.25, h: 0.044, rot: baseRot - 0.10, mat: bookIvoryMat },
      ];

      let currentY = y;
      books.forEach((b) => {
        const bookGroup = new THREE.Group();
        bookGroup.position.set(x, currentY + b.h / 2, z);
        bookGroup.rotation.y = b.rot;

        const cover = new THREE.Mesh(new THREE.BoxGeometry(b.w, b.h, b.d), b.mat);
        const pages = new THREE.Mesh(new THREE.BoxGeometry(b.w - 0.02, b.h - 0.008, b.d - 0.015), bookPaperPagesMat);
        pages.position.set(0.008, 0, 0);
        const spine = new THREE.Mesh(new THREE.BoxGeometry(0.006, b.h, b.d * 0.8), antiqueGoldMat);
        spine.position.set(-b.w / 2 - 0.001, 0, 0);

        bookGroup.add(cover, pages, spine);
        parentGroup.add(bookGroup);
        currentY += b.h;
      });
    };

    const buildSculpturalCeramicVase = (
      parentGroup: THREE.Group,
      x: number,
      y: number,
      z: number,
      vaseMat: THREE.Material,
      hasBranches: boolean = false
    ) => {
      const vaseGroup = new THREE.Group();
      vaseGroup.position.set(x, y, z);

      const vaseGeos: THREE.BufferGeometry[] = [];
      const base = new THREE.CylinderGeometry(0.12, 0.14, 0.06, 16);
      base.translate(0, 0.03, 0);
      const body = new THREE.CylinderGeometry(0.22, 0.12, 0.35, 20);
      body.translate(0, 0.23, 0);
      const neck = new THREE.CylinderGeometry(0.09, 0.22, 0.16, 20);
      neck.translate(0, 0.48, 0);
      const lip = new THREE.CylinderGeometry(0.13, 0.09, 0.04, 20);
      lip.translate(0, 0.58, 0);
      vaseGeos.push(base, body, neck, lip);

      const vaseMesh = safeMerge(vaseGeos, vaseMat);
      if (vaseMesh) vaseGroup.add(vaseMesh);

      if (hasBranches) {
        const branchGeos: THREE.BufferGeometry[] = [];
        const b1 = new THREE.CylinderGeometry(0.006, 0.008, 0.65, 6);
        b1.rotateZ(0.18);
        b1.translate(0.05, 0.85, 0);
        const b2 = new THREE.CylinderGeometry(0.005, 0.007, 0.58, 6);
        b2.rotateZ(-0.24);
        b2.translate(-0.06, 0.82, 0.04);
        branchGeos.push(b1, b2);
        const branchMesh = safeMerge(branchGeos, darkBronzeMat);
        if (branchMesh) vaseGroup.add(branchMesh);
      }

      parentGroup.add(vaseGroup);
    };

    const buildStatementMirror = (
      parentGroup: THREE.Group,
      x: number,
      y: number,
      z: number,
      w: number,
      h: number,
      rotY: number,
      style: "arched" | "baroque" | "versace" | "modern"
    ) => {
      const mirrorGroup = new THREE.Group();
      mirrorGroup.position.set(x, y, z);
      mirrorGroup.rotation.y = rotY;

      const pane = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mirrorMat);
      pane.position.set(0, 0, 0.015);
      mirrorGroup.add(pane);

      const frameGeos: THREE.BufferGeometry[] = [];
      const borderThick = 0.08;
      const frameD = 0.04;

      const top = new THREE.BoxGeometry(w + borderThick * 2, borderThick, frameD);
      top.translate(0, h / 2 + borderThick / 2, 0);
      const bottom = new THREE.BoxGeometry(w + borderThick * 2, borderThick, frameD);
      bottom.translate(0, -h / 2 - borderThick / 2, 0);
      const left = new THREE.BoxGeometry(borderThick, h, frameD);
      left.translate(-w / 2 - borderThick / 2, 0, 0);
      const right = new THREE.BoxGeometry(borderThick, h, frameD);
      right.translate(w / 2 + borderThick / 2, 0, 0);
      frameGeos.push(top, bottom, left, right);

      if (style === "arched" || style === "baroque") {
        const crest = new THREE.CylinderGeometry(w * 0.45, w * 0.55, borderThick, 16);
        crest.rotateX(Math.PI / 2);
        crest.translate(0, h / 2 + borderThick * 1.5, 0);
        frameGeos.push(crest);
      }

      const frameMesh = safeMerge(frameGeos, antiqueGoldMat);
      if (frameMesh) mirrorGroup.add(frameMesh);

      parentGroup.add(mirrorGroup);
    };

    const buildBirdSculpture = (parentGroup: THREE.Group, x: number, y: number, z: number) => {
      const group = new THREE.Group();
      group.position.set(x, y, z);

      const plinth = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.22, 0.18), neroMarquinaMat);
      plinth.position.set(0, 0.11, 0);
      group.add(plinth);

      const brassGeos: THREE.BufferGeometry[] = [];
      const body = new THREE.ConeGeometry(0.08, 0.24, 8);
      body.rotateX(-Math.PI / 2.8);
      body.translate(0, 0.30, 0);

      const head = new THREE.SphereGeometry(0.045, 8, 8);
      head.translate(0, 0.36, 0.10);

      const perch = new THREE.CylinderGeometry(0.012, 0.012, 0.14, 8);
      perch.translate(0, 0.24, 0);

      const beak = new THREE.ConeGeometry(0.02, 0.07, 6);
      beak.rotateX(Math.PI / 2);
      beak.translate(0, 0.36, 0.16);

      brassGeos.push(body, head, perch, beak);
      const birdMesh = safeMerge(brassGeos, antiqueGoldMat);
      if (birdMesh) group.add(birdMesh);

      parentGroup.add(group);
    };

    const buildPerfumeTray = (parentGroup: THREE.Group, x: number, y: number, z: number) => {
      const group = new THREE.Group();
      group.position.set(x, y, z);

      const trayMirror = new THREE.Mesh(new THREE.PlaneGeometry(0.38, 0.58), mirrorMat);
      trayMirror.rotateX(-Math.PI / 2);
      trayMirror.position.set(0, 0.02, 0);
      group.add(trayMirror);

      const brassGeos: THREE.BufferGeometry[] = [];
      const trayRim = new THREE.BoxGeometry(0.40, 0.04, 0.60);
      trayRim.translate(0, 0.02, 0);
      brassGeos.push(trayRim);

      const flacon1 = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.14, 8), amberGlassMat);
      flacon1.position.set(0.05, 0.09, -0.16);
      const stopper1 = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8), antiqueGoldMat);
      stopper1.position.set(0.05, 0.18, -0.16);
      group.add(flacon1, stopper1);

      const flacon2 = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.18, 12), smokedCrystalMat);
      flacon2.position.set(-0.06, 0.11, -0.04);
      const stopper2 = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.04, 8), crystalSparkleMat);
      stopper2.position.set(-0.06, 0.22, -0.04);
      group.add(flacon2, stopper2);

      const box = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.09, 0.18), cordovanLeatherMat);
      box.position.set(0.02, 0.065, 0.14);
      const clasp = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.02, 0.025), antiqueGoldMat);
      clasp.position.set(-0.055, 0.065, 0.14);
      group.add(box, clasp);

      const trayMesh = safeMerge(brassGeos, antiqueGoldMat);
      if (trayMesh) group.add(trayMesh);

      parentGroup.add(group);
    };

    const buildTempleAltarDecor = (parentGroup: THREE.Group, consoleX: number) => {
      const group = new THREE.Group();
      group.position.set(consoleX, 0, 0);

      const blossomCount = 28;
      for (let s = 0; s < 2; s++) {
        for (let i = 0; i <= blossomCount; i++) {
          const u = i / blossomCount;
          const arcZ = (u - 0.5) * 1.8;
          const sagY = 0.88 - Math.sin(u * Math.PI) * 0.32;
          const blossomMat = i % 2 === 0 ? marigoldOrangeMat : marigoldYellowMat;
          const blossom = new THREE.Mesh(new THREE.SphereGeometry(0.038, 8, 8), blossomMat);
          blossom.position.set(0.42, sagY, arcZ);
          group.add(blossom);
        }
      }

      const idolGroup = new THREE.Group();
      idolGroup.position.set(0, 0.92, -0.6);
      const idolGeos: THREE.BufferGeometry[] = [];
      const idolPed = new THREE.CylinderGeometry(0.16, 0.20, 0.08, 16);
      idolPed.translate(0, 0.04, 0);
      const lotusBase = new THREE.CylinderGeometry(0.18, 0.14, 0.05, 16);
      lotusBase.translate(0, 0.10, 0);
      const idolBody = new THREE.CylinderGeometry(0.10, 0.14, 0.32, 12);
      idolBody.translate(0, 0.28, 0);
      const haloAureole = new THREE.TorusGeometry(0.18, 0.02, 8, 24);
      haloAureole.translate(0, 0.36, -0.04);
      idolGeos.push(idolPed, lotusBase, idolBody, haloAureole);
      const idolMesh = safeMerge(idolGeos, antiqueGoldMat);
      if (idolMesh) idolGroup.add(idolMesh);
      group.add(idolGroup);

      const bellGroup = new THREE.Group();
      bellGroup.position.set(0, 0.92, 0.5);
      const ghantiGeos: THREE.BufferGeometry[] = [];
      const bellDome = new THREE.CylinderGeometry(0.02, 0.06, 0.08, 12);
      bellDome.translate(0, 0.04, 0);
      const bellHandle = new THREE.CylinderGeometry(0.008, 0.008, 0.12, 8);
      bellHandle.translate(0, 0.14, 0);
      const finialIcon = new THREE.SphereGeometry(0.02, 8, 8);
      finialIcon.translate(0, 0.21, 0);
      ghantiGeos.push(bellDome, bellHandle, finialIcon);
      const ghantiMesh = safeMerge(ghantiGeos, antiqueGoldMat);
      if (ghantiMesh) bellGroup.add(ghantiMesh);
      group.add(bellGroup);

      parentGroup.add(group);
    };

    const buildHangingTempleBells = (parentGroup: THREE.Group, x: number, z: number, ceilingH: number, bellH: number) => {
      const group = new THREE.Group();
      group.position.set(x, 0, z);

      const brassGeos: THREE.BufferGeometry[] = [];
      const bracket = new THREE.CylinderGeometry(0.14, 0.14, 0.04, 16);
      bracket.translate(0, ceilingH - 0.02, 0);
      brassGeos.push(bracket);

      const chainLen = Math.max(0.4, ceilingH - bellH);
      const chain = new THREE.CylinderGeometry(0.012, 0.012, chainLen, 8);
      chain.translate(0, ceilingH - chainLen / 2, 0);
      brassGeos.push(chain);

      const bellDome = new THREE.CylinderGeometry(0.08, 0.22, 0.35, 16);
      bellDome.translate(0, bellH, 0);
      const bellRim = new THREE.TorusGeometry(0.23, 0.025, 10, 20);
      bellRim.rotateX(Math.PI / 2);
      bellRim.translate(0, bellH - 0.17, 0);
      const clapper = new THREE.SphereGeometry(0.045, 10, 10);
      clapper.translate(0, bellH - 0.22, 0);
      brassGeos.push(bellDome, bellRim, clapper);

      const bellMesh = safeMerge(brassGeos, antiqueGoldMat);
      if (bellMesh) group.add(bellMesh);

      parentGroup.add(group);
    };

    const buildExecutiveDeskDecor = (parentGroup: THREE.Group, x: number, y: number, z: number) => {
      const group = new THREE.Group();
      group.position.set(x, y, z);

      const blotter = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.018, 0.95), cognacBlotterMat);
      blotter.position.set(0, 0.009, 0);
      group.add(blotter);

      const brassGeos: THREE.BufferGeometry[] = [];
      const corners = [
        [-0.26, -0.46], [0.26, -0.46], [-0.26, 0.46], [0.26, 0.46]
      ];
      corners.forEach(([cx, cz]) => {
        const cGeo = new THREE.BoxGeometry(0.05, 0.022, 0.05);
        cGeo.translate(cx, 0.011, cz);
        brassGeos.push(cGeo);
      });
      const tray = new THREE.BoxGeometry(0.06, 0.015, 0.24);
      tray.translate(-0.20, 0.02, 0);
      const pen1 = new THREE.CylinderGeometry(0.005, 0.005, 0.16, 8);
      pen1.rotateX(Math.PI / 2);
      pen1.translate(-0.20, 0.03, -0.02);
      const pen2 = new THREE.CylinderGeometry(0.005, 0.005, 0.16, 8);
      pen2.rotateX(Math.PI / 2);
      pen2.translate(-0.20, 0.03, 0.02);
      brassGeos.push(tray, pen1, pen2);

      const brassAccents = safeMerge(brassGeos, antiqueGoldMat);
      if (brassAccents) group.add(brassAccents);

      const armillaryGroup = new THREE.Group();
      armillaryGroup.position.set(0, 0, -0.80);
      const armGeos: THREE.BufferGeometry[] = [];
      const armBase = new THREE.CylinderGeometry(0.12, 0.15, 0.08, 16);
      armBase.translate(0, 0.04, 0);
      const armShaft = new THREE.CylinderGeometry(0.025, 0.025, 0.14, 12);
      armShaft.translate(0, 0.15, 0);
      const r1 = new THREE.TorusGeometry(0.18, 0.014, 10, 24);
      r1.translate(0, 0.35, 0);
      const r2 = new THREE.TorusGeometry(0.18, 0.014, 10, 24);
      r2.rotateX(Math.PI / 3);
      r2.translate(0, 0.35, 0);
      const r3 = new THREE.TorusGeometry(0.14, 0.012, 10, 24);
      r3.rotateZ(Math.PI / 4);
      r3.translate(0, 0.35, 0);
      armGeos.push(armBase, armShaft, r1, r2, r3);
      const armMesh = safeMerge(armGeos, antiqueGoldMat);
      if (armMesh) armillaryGroup.add(armMesh);
      group.add(armillaryGroup);

      const bookendsGroup = new THREE.Group();
      bookendsGroup.position.set(0, 0, 0.78);
      const bEnd1 = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.22, 4), calacattaConsoleMat);
      bEnd1.rotation.y = Math.PI / 4;
      bEnd1.position.set(0, 0.11, -0.16);
      const bEnd2 = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.22, 4), calacattaConsoleMat);
      bEnd2.rotation.y = Math.PI / 4;
      bEnd2.position.set(0, 0.11, 0.16);
      const bk1 = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.20, 0.045), bookTerracottaMat);
      bk1.position.set(0, 0.10, -0.06);
      const bk2 = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.18, 0.045), bookCharcoalMat);
      bk2.position.set(0, 0.09, 0);
      const bk3 = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.22, 0.045), bookIvoryMat);
      bk3.position.set(0, 0.11, 0.06);
      bookendsGroup.add(bEnd1, bEnd2, bk1, bk2, bk3);
      group.add(bookendsGroup);

      parentGroup.add(group);
    };

    const buildAwardWallTriptych = (parentGroup: THREE.Group, x: number, y: number, z: number, rotY: number) => {
      const group = new THREE.Group();
      group.position.set(x, y, z);
      group.rotation.y = rotY;

      for (let i = 0; i < 3; i++) {
        const ax = (i - 1) * 0.95;
        const certGroup = new THREE.Group();
        certGroup.position.set(ax, 0, 0);

        const frame = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.92, 0.03), antiqueGoldMat);
        const matting = new THREE.Mesh(new THREE.PlaneGeometry(0.66, 0.86), bookPaperPagesMat);
        matting.position.set(0, 0, 0.016);
        const seal = new THREE.Mesh(new THREE.CircleGeometry(0.06, 16), antiqueGoldMat);
        seal.position.set(0, -0.26, 0.018);

        certGroup.add(frame, matting, seal);
        group.add(certGroup);
      }

      parentGroup.add(group);
    };

    const buildRoyalSalonDecor = (parentGroup: THREE.Group, x: number, y: number, z: number) => {
      const group = new THREE.Group();
      group.position.set(x, y, z);

      const urnGroup = new THREE.Group();
      urnGroup.position.set(0, 0, -0.75);
      const urnPorcelain = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.12, 0.52, 16), porcelainCobaltMat);
      urnPorcelain.position.set(0, 0.30, 0);
      const urnGoldGeos: THREE.BufferGeometry[] = [];
      const uBase = new THREE.CylinderGeometry(0.14, 0.18, 0.08, 16);
      uBase.translate(0, 0.04, 0);
      const uNeck = new THREE.CylinderGeometry(0.10, 0.20, 0.16, 16);
      uNeck.translate(0, 0.60, 0);
      const uFinial = new THREE.ConeGeometry(0.06, 0.14, 12);
      uFinial.translate(0, 0.74, 0);
      const h1 = new THREE.TorusGeometry(0.14, 0.02, 8, 16);
      h1.translate(-0.20, 0.38, 0);
      const h2 = new THREE.TorusGeometry(0.14, 0.02, 8, 16);
      h2.translate(0.20, 0.38, 0);
      urnGoldGeos.push(uBase, uNeck, uFinial, h1, h2);
      const urnGoldMesh = safeMerge(urnGoldGeos, antiqueGoldMat);
      if (urnGoldMesh) urnGroup.add(urnGoldMesh);
      urnGroup.add(urnPorcelain);
      group.add(urnGroup);

      const candGroup = new THREE.Group();
      candGroup.position.set(0, 0, 0.75);
      const candGeos: THREE.BufferGeometry[] = [];
      const flameGeos: THREE.BufferGeometry[] = [];
      const cBase = new THREE.CylinderGeometry(0.14, 0.18, 0.10, 16);
      cBase.translate(0, 0.05, 0);
      const cStem = new THREE.CylinderGeometry(0.025, 0.035, 0.52, 12);
      cStem.translate(0, 0.32, 0);
      candGeos.push(cBase, cStem);

      const ccSleeve = new THREE.CylinderGeometry(0.016, 0.016, 0.18, 8);
      ccSleeve.translate(0, 0.64, 0);
      candGeos.push(ccSleeve);
      const ccFlame = new THREE.ConeGeometry(0.016, 0.05, 8);
      ccFlame.translate(0, 0.76, 0);
      flameGeos.push(ccFlame);

      for (let a = 0; a < 4; a++) {
        const ang = (a * Math.PI) / 2 + Math.PI / 4;
        const ax = Math.cos(ang) * 0.24;
        const az = Math.sin(ang) * 0.24;

        const arm = new THREE.CylinderGeometry(0.014, 0.014, 0.28, 8);
        arm.rotateZ(Math.PI / 3.5);
        arm.rotateY(-ang);
        arm.translate(ax / 2, 0.42, az / 2);
        candGeos.push(arm);

        const bobeche = new THREE.CylinderGeometry(0.045, 0.025, 0.02, 10);
        bobeche.translate(ax, 0.48, az);
        const sleeve = new THREE.CylinderGeometry(0.015, 0.015, 0.15, 8);
        sleeve.translate(ax, 0.56, az);
        candGeos.push(bobeche, sleeve);

        const flame = new THREE.ConeGeometry(0.015, 0.045, 8);
        flame.translate(ax, 0.66, az);
        flameGeos.push(flame);
      }
      const candMesh = safeMerge(candGeos, darkBronzeMat);
      if (candMesh) candGroup.add(candMesh);
      const flameMesh = safeMerge(flameGeos, chandelierGlowMat);
      if (flameMesh) candGroup.add(flameMesh);
      group.add(candGroup);

      const shieldGroup = new THREE.Group();
      shieldGroup.position.set(0, 0, 0);
      const shield = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.14, 0.38, 6), antiqueGoldMat);
      shield.rotation.y = Math.PI / 2;
      shield.position.set(0, 0.32, 0);
      const easel = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.45, 6), darkBronzeMat);
      easel.rotation.z = -0.35;
      easel.position.set(-0.08, 0.22, 0);
      shieldGroup.add(shield, easel);
      group.add(shieldGroup);

      parentGroup.add(group);
    };

    const buildCorporateReceptionDecor = (parentGroup: THREE.Group, x: number, y: number, z: number) => {
      const group = new THREE.Group();
      group.position.set(x, y, z);

      const stagGroup = new THREE.Group();
      stagGroup.position.set(0, 0, -0.70);
      const stagPlinth = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.14, 0.26), neroMarquinaPedestalMat);
      stagPlinth.position.set(0, 0.07, 0);
      stagGroup.add(stagPlinth);

      const stagGeos: THREE.BufferGeometry[] = [];
      const body = new THREE.CylinderGeometry(0.08, 0.09, 0.32, 8);
      body.rotateZ(Math.PI / 2.3);
      body.translate(0, 0.32, 0);
      const neck = new THREE.CylinderGeometry(0.05, 0.065, 0.26, 8);
      neck.rotateZ(-0.35);
      neck.translate(-0.10, 0.48, 0);
      const head = new THREE.ConeGeometry(0.045, 0.12, 6);
      head.rotateZ(Math.PI / 2.2);
      head.translate(-0.20, 0.60, 0);
      const legs = [
        [-0.08, 0.15, -0.06], [-0.08, 0.15, 0.06],
        [0.08, 0.15, -0.06], [0.08, 0.15, 0.06]
      ];
      legs.forEach(([lx, ly, lz]) => {
        const leg = new THREE.CylinderGeometry(0.012, 0.008, 0.28, 6);
        leg.translate(lx, ly, lz);
        stagGeos.push(leg);
      });
      for (let a = -1; a <= 1; a += 2) {
        const mainAntler = new THREE.CylinderGeometry(0.008, 0.012, 0.32, 6);
        mainAntler.rotateZ(-0.45);
        mainAntler.rotateX(a * 0.35);
        mainAntler.translate(-0.16, 0.72, a * 0.09);
        const tine = new THREE.CylinderGeometry(0.006, 0.008, 0.14, 6);
        tine.rotateZ(-0.85);
        tine.translate(-0.19, 0.76, a * 0.12);
        stagGeos.push(mainAntler, tine);
      }
      stagGeos.push(body, neck, head);
      const stagMesh = safeMerge(stagGeos, receptionGoldMat);
      if (stagMesh) stagGroup.add(stagMesh);
      group.add(stagGroup);

      const vaseGroup = new THREE.Group();
      vaseGroup.position.set(0, 0, 0.70);
      const glassVase = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.075, 0.48, 20), smokedCrystalMat);
      glassVase.position.set(0, 0.24, 0);
      vaseGroup.add(glassVase);
      const branchGeos: THREE.BufferGeometry[] = [];
      const br1 = new THREE.CylinderGeometry(0.006, 0.008, 0.75, 6);
      br1.rotateZ(0.22);
      br1.translate(0.06, 0.58, 0);
      const br2 = new THREE.CylinderGeometry(0.004, 0.006, 0.45, 6);
      br2.rotateZ(-0.35);
      br2.translate(-0.05, 0.68, 0.04);
      branchGeos.push(br1, br2);
      const brMesh = safeMerge(branchGeos, darkBronzeMat);
      if (brMesh) vaseGroup.add(brMesh);
      group.add(vaseGroup);

      buildArtBookStack(group, 0, 0, 0, 0.08);

      parentGroup.add(group);
    };

    // -------------------------------------------------------------------------
    // CHAMBER I: GRAND LIVING (Curated Architectural Gallery & Real 3D Furniture)
    // -------------------------------------------------------------------------
    const buildGrandLivingChamber = () => {
      const xDoor = -hallWidth / 2;
      const zCenter = -20;
      const { roomGroup, roomW, roomD, roomH, wallMat } = buildRoomShell(
        xDoor,
        zCenter,
        -1,
        0xe6ded2,
        grandFloorMat
      );
      wallMat.fog = false;

      const backX = -(roomW / 2);

      // Back Feature Wall: Grand Double-Height Drapery Backdrop
      const draperyMat = new THREE.MeshStandardMaterial({
        color: 0xd6cbbb,
        roughness: 0.88,
        fog: false,
      });
      const sheerDrapery = new THREE.Mesh(
        new THREE.PlaneGeometry(roomD, roomH),
        draperyMat
      );
      sheerDrapery.position.set(backX + 0.04, roomH / 2, 0);
      sheerDrapery.rotation.y = Math.PI / 2;
      roomGroup.add(sheerDrapery);

      // Artwork 1 (Back Wall Hero): Monumental 12.2m x 5.8m 4K Centerpiece commanding entire feature wall
      const ch1HeroArt = createFramedArtMesh(texCh1Living, 12.2, 5.8, 0.11, true, 0.14);
      ch1HeroArt.group.position.set(backX + 0.10, 3.40, 0);
      ch1HeroArt.group.rotation.y = Math.PI / 2;
      roomGroup.add(ch1HeroArt.group);
      heroArtRefs.current["grand"] = ch1HeroArt;

      // Flanking heavy textured curtains on left & right
      const curtainMat = new THREE.MeshStandardMaterial({
        color: 0x8a8279,
        roughness: 0.92,
      });
      const curtainLeft = new THREE.Mesh(new THREE.BoxGeometry(0.35, roomH, 1.8), curtainMat);
      curtainLeft.position.set(backX + 0.22, roomH / 2, -roomD / 2 + 0.9);
      const curtainRight = new THREE.Mesh(new THREE.BoxGeometry(0.35, roomH, 1.8), curtainMat);
      curtainRight.position.set(backX + 0.22, roomH / 2, roomD / 2 - 0.9);
      roomGroup.add(curtainLeft, curtainRight);

      // Side Wall 1 (Z = -roomD/2): Limestone wall exhibiting 2 monumental fine art project works
      const sideWall1 = new THREE.Mesh(new THREE.PlaneGeometry(roomW, roomH), wallMat);
      sideWall1.position.set(0, roomH / 2, -roomD / 2);

      // Artwork 2 (Side Wall 1 Left): The Horizon Dining Pavilion (Monumental 5.8m x 3.8m)
      const ch1ArtDining = createFramedArtMesh(texCh1Dining, 5.8, 3.8, 0.09, true);
      ch1ArtDining.group.position.set(-3.5, 3.60, -roomD / 2 + 0.08);

      // Artwork 3 (Side Wall 1 Right): The Family Media Parlour (Monumental 5.8m x 3.8m)
      const ch1ArtParlour = createFramedArtMesh(texCh1Parlour, 5.8, 3.8, 0.09, true);
      ch1ArtParlour.group.position.set(3.5, 3.60, -roomD / 2 + 0.08);
      roomGroup.add(sideWall1, ch1ArtDining.group, ch1ArtParlour.group);

      // Side Wall 2 (Z = +roomD/2): Fluted honey oak wall exhibiting 2 monumental fine art project works
      const sideWall2 = new THREE.Mesh(new THREE.PlaneGeometry(roomW, roomH), flutedOakMat);
      sideWall2.position.set(0, roomH / 2, roomD / 2);
      sideWall2.rotation.y = Math.PI;

      // Artwork 4 (Side Wall 2 Left): The Atelier Floral Lounge (Monumental 5.8m x 3.8m)
      const ch1ArtLounge = createFramedArtMesh(texCh1Lounge, 5.8, 3.8, 0.09, true);
      ch1ArtLounge.group.position.set(-3.5, 3.60, roomD / 2 - 0.08);
      ch1ArtLounge.group.rotation.y = Math.PI;

      // Artwork 5 (Side Wall 2 Right): The Master Entertainment Wall (Monumental 5.8m x 3.8m)
      const ch1ArtMedia = createFramedArtMesh(texCh1Media, 5.8, 3.8, 0.09, true);
      ch1ArtMedia.group.position.set(3.5, 3.60, roomD / 2 - 0.08);
      ch1ArtMedia.group.rotation.y = Math.PI;
      roomGroup.add(sideWall2, ch1ArtLounge.group, ch1ArtMedia.group);

      // 5. Ambient Dust Motes Drifting in Frustum across Open Gallery Floor
      const dGeo = new THREE.BufferGeometry();
      const dPos = new Float32Array(grandDustCount * 3);
      for (let i = 0; i < grandDustCount; i++) {
        dPos[i * 3 + 0] = -3.5 + Math.random() * 7.0; // Spanning vast reflective floor
        dPos[i * 3 + 1] = 0.5 + Math.random() * 4.5;
        dPos[i * 3 + 2] = -4.0 + Math.random() * 8.0;
      }
      dGeo.setAttribute("position", new THREE.BufferAttribute(dPos, 3));
      grandDustPoints = new THREE.Points(
        dGeo,
        new THREE.PointsMaterial({
          color: 0xffe2aa,
          size: 0.055,
          transparent: true,
          opacity: 0.75,
          blending: THREE.AdditiveBlending,
        })
      );
      roomGroup.add(grandDustPoints);

      // 7. STATEMENT CHANDELIER OVERHEAD & CURATED ARTIFACTS
      // Grand Tiered Crystal & Brass Chandelier suspended at center
      buildTieredCrystalChandelier(roomGroup, 0, 5.0, 0, xDoor - roomW / 2, 5.0, zCenter);

      // Monolithic Nero Marquina Coffee Table Ensemble (Center-foreground)
      const ch1TableGroup = new THREE.Group();
      ch1TableGroup.position.set(-2.8, 0, 0);
      const ch1TableTop = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.14, 2.5), grandFloorMat);
      ch1TableTop.position.set(0, 0.35, 0);
      const ch1TablePlinth = new THREE.Mesh(new THREE.BoxGeometry(0.70, 0.28, 2.1), darkBronzeMat);
      ch1TablePlinth.position.set(0, 0.14, 0);
      const ch1TableShadow = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 2.7), contactShadowMat);
      ch1TableShadow.rotation.x = -Math.PI / 2;
      ch1TableShadow.position.set(0, 0.005, 0);
      ch1TableGroup.add(ch1TableTop, ch1TablePlinth, ch1TableShadow);
      roomGroup.add(ch1TableGroup);

      // Curated Hardcover Art Book Stack on Coffee Table (Flanking left)
      buildArtBookStack(ch1TableGroup, 0, 0.42, -0.65, 0.12);

      // Sculptural Matte Ceramic Vase with Botanical Branches on Coffee Table (Flanking right)
      buildSculpturalCeramicVase(ch1TableGroup, 0, 0.42, 0.65, darkCeramicMat, true);

      // Monumental Arched Gilded Statement Mirror on Side Wall 1
      buildStatementMirror(roomGroup, 0, 3.4, -roomD / 2 + 0.08, 1.5, 2.4, 0, "arched");

      hallwayGroup.add(roomGroup);
      return roomGroup;
    };

    // -------------------------------------------------------------------------
    // CHAMBER II: VERSACE SUITE (Curated Master Suite Architectural Gallery)
    // -------------------------------------------------------------------------
    const buildVersaceSuiteChamber = () => {
      const xDoor = hallWidth / 2;
      const zCenter = -45;
      const { roomGroup, roomW, roomD, roomH, wallMat } = buildRoomShell(
        xDoor,
        zCenter,
        1,
        0xe2d6c4,
        grandFloorMat // Continuous Italian Nero Marquina black marble floor
      );

      const backX = roomW / 2; // +8.0

      // Back Wall: Full-height vertical fluted European white oak paneling with top cove light
      const oakBackWall = new THREE.Mesh(new THREE.PlaneGeometry(roomD, roomH), flutedOakMat);
      oakBackWall.position.set(backX - 0.04, roomH / 2, 0);
      oakBackWall.rotation.y = -Math.PI / 2;
      roomGroup.add(oakBackWall);

      // Artwork 1 (Back Wall Hero): Monumental 12.2m x 5.8m 4K Master Retreat Centerpiece
      const ch2HeroArt = createFramedArtMesh(texCh2WoodBed, 12.2, 5.8, 0.11, true, 0.14);
      ch2HeroArt.group.position.set(backX - 0.08, 3.40, 0);
      ch2HeroArt.group.rotation.y = -Math.PI / 2;
      roomGroup.add(ch2HeroArt.group);
      heroArtRefs.current["versace"] = ch2HeroArt;

      // Side Wall 1 (Z = -roomD/2): Oak paneling exhibiting 2 monumental fine art master suite works
      const sideWall1 = new THREE.Mesh(new THREE.PlaneGeometry(roomW, roomH), flutedOakMat);
      sideWall1.position.set(0, roomH / 2, -roomD / 2);

      // Artwork 2 (Side Wall 1 Left): The Horizon Master Bed Suite (Monumental 5.8m x 3.8m)
      const ch2ArtBed1 = createFramedArtMesh(texCh2Bed1, 5.8, 3.8, 0.09, true);
      ch2ArtBed1.group.position.set(-3.5, 3.60, -roomD / 2 + 0.08);

      // Artwork 3 (Side Wall 1 Right): The Haute Couture Vanity Mirror (Monumental 5.8m x 3.8m)
      const ch2ArtVanity = createFramedArtMesh(texCh2Vanity, 5.8, 3.8, 0.09, true);
      ch2ArtVanity.group.position.set(3.5, 3.60, -roomD / 2 + 0.08);
      roomGroup.add(sideWall1, ch2ArtBed1.group, ch2ArtVanity.group);

      // Side Wall 2 (Z = +roomD/2): Limestone wall exhibiting 2 monumental fine art master suite works
      const sideWall2 = new THREE.Mesh(new THREE.PlaneGeometry(roomW, roomH), wallMat);
      sideWall2.position.set(0, roomH / 2, roomD / 2);
      sideWall2.rotation.y = Math.PI;

      // Artwork 4 (Side Wall 2 Left): The Emerald Accent Master Suite (Monumental 5.8m x 3.8m)
      const ch2ArtEmerald = createFramedArtMesh(texCh2Emerald, 5.8, 3.8, 0.09, true);
      ch2ArtEmerald.group.position.set(-3.5, 3.60, roomD / 2 - 0.08);
      ch2ArtEmerald.group.rotation.y = Math.PI;

      // Artwork 5 (Side Wall 2 Right): The Linear Headboard Atelier (Monumental 5.8m x 3.8m)
      const ch2ArtLinear = createFramedArtMesh(texCh2Linear, 5.8, 3.8, 0.09, true);
      ch2ArtLinear.group.position.set(3.5, 3.60, roomD / 2 - 0.08);
      ch2ArtLinear.group.rotation.y = Math.PI;
      roomGroup.add(sideWall2, ch2ArtEmerald.group, ch2ArtLinear.group);

      // Micro-Dust Motes Floating across Open Gallery Space
      const vDustGeo = new THREE.BufferGeometry();
      const vDustPos = new Float32Array(versaceDustCount * 3);
      for (let i = 0; i < versaceDustCount; i++) {
        vDustPos[i * 3 + 0] = 3.5 + Math.random() * 7.0;
        vDustPos[i * 3 + 1] = 0.6 + Math.random() * 4.5;
        vDustPos[i * 3 + 2] = -4.0 + Math.random() * 8.0;
      }
      vDustGeo.setAttribute("position", new THREE.BufferAttribute(vDustPos, 3));
      versaceDustPoints = new THREE.Points(
        vDustGeo,
        new THREE.PointsMaterial({
          color: 0xffdfaa,
          size: 0.05,
          transparent: true,
          opacity: 0.80,
          blending: THREE.AdditiveBlending,
        })
      );
      roomGroup.add(versaceDustPoints);

      // 7. STATEMENT CHANDELIER OVERHEAD & CURATED ARTIFACTS
      // Elegant Crystal Drop Cluster Chandelier
      buildClusterDropChandelier(roomGroup, 0, 4.6, 0, xDoor + roomW / 2, 4.6, zCenter);

      // Curated Smoked Oak & Marble Credenza / Console Table (Center-foreground)
      const ch2CredenzaGroup = new THREE.Group();
      ch2CredenzaGroup.position.set(2.8, 0, 0);
      const ch2Top = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.08, 2.4), calacattaConsoleMat);
      ch2Top.position.set(0, 0.80, 0);
      const ch2Body = new THREE.Mesh(new THREE.BoxGeometry(0.60, 0.55, 2.3), smokedOakMat);
      ch2Body.position.set(0, 0.48, 0);
      const ch2Legs: THREE.BufferGeometry[] = [];
      [
        [-0.22, -1.05],
        [0.22, -1.05],
        [-0.22, 1.05],
        [0.22, 1.05],
      ].forEach(([lx, lz]) => {
        const leg = new THREE.CylinderGeometry(0.02, 0.012, 0.22, 8);
        leg.translate(lx, 0.11, lz);
        ch2Legs.push(leg);
      });
      const ch2LegsMesh = safeMerge(ch2Legs, antiqueGoldMat);
      if (ch2LegsMesh) ch2CredenzaGroup.add(ch2LegsMesh);
      const ch2Shadow = new THREE.Mesh(new THREE.PlaneGeometry(0.85, 2.6), contactShadowMat);
      ch2Shadow.rotation.x = -Math.PI / 2;
      ch2Shadow.position.set(0, 0.005, 0);
      ch2CredenzaGroup.add(ch2Top, ch2Body, ch2Shadow);
      roomGroup.add(ch2CredenzaGroup);

      // Sculptural Brass & Marble Bird Sculpture on Credenza (Flanking left)
      buildBirdSculpture(ch2CredenzaGroup, 0, 0.84, -0.75);

      // Luxury Perfume Flacons & Jewelry Tray on Credenza (Flanking right)
      buildPerfumeTray(ch2CredenzaGroup, 0, 0.84, 0.65);

      // Ornate Versace-Style Mirror on Side Wall 1
      buildStatementMirror(roomGroup, 0, 3.4, -roomD / 2 + 0.08, 1.4, 2.3, 0, "versace");

      hallwayGroup.add(roomGroup);
      return roomGroup;
    };

    // -------------------------------------------------------------------------
    // CHAMBER III: SACRED SANCTUM (Mandir Altar, Gayatri Wall, Backlit Onyx Halo)
    // -------------------------------------------------------------------------
    const buildSacredSanctumChamber = () => {
      const xDoor = -hallWidth / 2;
      const zCenter = -70;
      const { roomGroup, roomW, roomD, roomH, wallMat } = buildRoomShell(
        xDoor,
        zCenter,
        -1,
        0xf4ece2,
        sanctumFloorMarbleMat // Continuous Polished Italian Calacatta marble floor with fog: false
      );
      wallMat.fog = false;

      const backX = -(roomW / 2); // -8.0m

      // 1. BACK FEATURE WALL: Monumental double-height mineral acoustic plaster backdrop
      const backWall = new THREE.Mesh(
        new THREE.PlaneGeometry(roomD, roomH),
        sanctumPlasterMat
      );
      backWall.position.set(backX + 0.04, roomH / 2, 0);
      backWall.rotation.y = Math.PI / 2;
      roomGroup.add(backWall);

      // Artwork 1 (Back Wall Hero): Monumental 12.2m x 5.8m 4K Sacred Sanctum Centerpiece
      // Authentic Gopal Lahoti Mandir Altar with backlit Tirupati Venkateswara halo & Sanskrit Gayatri Mantra
      const ch3HeroArt = createFramedArtMesh(texCh3Classic, 12.2, 5.8, 0.11, true, 0.14);
      ch3HeroArt.group.position.set(backX + 0.10, 3.40, 0);
      ch3HeroArt.group.rotation.y = Math.PI / 2;
      roomGroup.add(ch3HeroArt.group);
      heroArtRefs.current["sacred"] = ch3HeroArt;

      // 2. RIGHT FEATURE WALL (Z = -roomD/2 = -8.0m):
      // Full monumental gallery wall exhibiting 2 framed 4K Mandir artworks
      const sideWall1 = new THREE.Mesh(new THREE.PlaneGeometry(roomW, roomH), sanctumPlasterMat);
      sideWall1.position.set(0, roomH / 2, -roomD / 2);

      // Artwork 2 (Side Wall 1 Left): Handcrafted Wooden Temple Sanctuary (Monumental 5.8m x 3.8m)
      const ch3ArtRight1 = createFramedArtMesh(texCh3Stone, 5.8, 3.8, 0.09, true);
      ch3ArtRight1.group.position.set(-3.5, 3.60, -roomD / 2 + 0.08);

      // Artwork 3 (Side Wall 1 Right): Sacred Altar & Temple Bells (Monumental 5.8m x 3.8m)
      const ch3ArtRight2 = createFramedArtMesh(texCh3Courtyard, 5.8, 3.8, 0.09, true);
      ch3ArtRight2.group.position.set(3.5, 3.60, -roomD / 2 + 0.08);
      roomGroup.add(sideWall1, ch3ArtRight1.group, ch3ArtRight2.group);

      // 3. LEFT FEATURE WALL (Z = +roomD/2 = +8.0m):
      // Full monumental gallery wall exhibiting 2 framed 4K Mandir artworks
      const sideWall2 = new THREE.Mesh(new THREE.PlaneGeometry(roomW, roomH), sanctumPlasterMat);
      sideWall2.position.set(0, roomH / 2, roomD / 2);
      sideWall2.rotation.y = Math.PI;

      // Artwork 4 (Side Wall 2 Left): Intricate Teakwood Temple Jali (Monumental 5.8m x 3.8m)
      const ch3ArtLeft1 = createFramedArtMesh(texCh3Foyer, 5.8, 3.8, 0.09, true);
      ch3ArtLeft1.group.position.set(-3.5, 3.60, roomD / 2 - 0.08);
      ch3ArtLeft1.group.rotation.y = Math.PI;

      // Artwork 5 (Side Wall 2 Right): Heritage Teakwood Mandir (Monumental 5.8m x 3.8m)
      const ch3ArtLeft2 = createFramedArtMesh(texCh3Portal, 5.8, 3.8, 0.09, true);
      ch3ArtLeft2.group.position.set(3.5, 3.60, roomD / 2 - 0.08);
      ch3ArtLeft2.group.rotation.y = Math.PI;
      roomGroup.add(sideWall2, ch3ArtLeft1.group, ch3ArtLeft2.group);

      // Ceiling Coffers Downlights
      const sanctumDownlightMat = new THREE.MeshStandardMaterial({
        color: 0xfff0d6,
        emissive: 0xffd88e,
        emissiveIntensity: 1.8,
        roughness: 0.2,
      });
      for (const cx of [-4.5, 0, 4.5]) {
        for (const cz of [-4.5, 0, 4.5]) {
          const downlight = new THREE.Mesh(new THREE.CircleGeometry(0.12, 16), sanctumDownlightMat);
          downlight.position.set(cx, roomH - 0.02, cz);
          downlight.rotation.x = Math.PI / 2;
          roomGroup.add(downlight);
        }
      }

      // 5. SACRED CEREMONIAL PEDESTAL CONSOLE WITH FLICKERING DIYA & INCENSE
      const diyaConsole = new THREE.Group();
      diyaConsole.position.set(-5.5, 0, 0);

      // Statuario Marble Pedestal Base
      const pedBase = new THREE.Mesh(
        new THREE.CylinderGeometry(0.38, 0.42, 0.85, 24),
        sanctumFloorMarbleMat
      );
      pedBase.position.y = 0.425;

      const pedTrim = new THREE.Mesh(
        new THREE.TorusGeometry(0.42, 0.02, 16, 32),
        antiqueGoldMat
      );
      pedTrim.position.y = 0.84;
      pedTrim.rotation.x = Math.PI / 2;

      // Ceremonial Brass Diya with Real Flickering Flame
      const diyaBowl = new THREE.Mesh(
        new THREE.CylinderGeometry(0.14, 0.06, 0.08, 20),
        antiqueGoldMat
      );
      diyaBowl.position.y = 0.89;

      const diyaOil = new THREE.Mesh(
        new THREE.CylinderGeometry(0.13, 0.13, 0.015, 16),
        new THREE.MeshStandardMaterial({ color: 0xc47e22, roughness: 0.15, metalness: 0.4, fog: false })
      );
      diyaOil.position.y = 0.93;

      sanctumFlameMesh = new THREE.Mesh(
        new THREE.ConeGeometry(0.04, 0.14, 16),
        new THREE.MeshBasicMaterial({ color: 0xffaa22 })
      );
      sanctumFlameMesh.position.set(0, 1.02, 0);

      if (sanctumDiyaLight) {
        sanctumDiyaLight.position.set(xDoor - 5.5, 1.05, zCenter);
      }

      diyaConsole.add(pedBase, pedTrim, diyaBowl, diyaOil, sanctumFlameMesh);
      roomGroup.add(diyaConsole);

      // 6. RISING INCENSE SMOKE PARTICLES
      incenseOrigin.set(-hallWidth / 2 - 5.5, 1.05, -70.0);

      const incGeo = new THREE.BufferGeometry();
      const incPos = new Float32Array(incenseCount * 3);
      for (let i = 0; i < incenseCount; i++) {
        incPos[i * 3 + 0] = incenseOrigin.x + (Math.random() - 0.5) * 0.05;
        incPos[i * 3 + 1] = 1.05 + (i / incenseCount) * 1.8;
        incPos[i * 3 + 2] = incenseOrigin.z + (Math.random() - 0.5) * 0.05;
      }
      incGeo.setAttribute("position", new THREE.BufferAttribute(incPos, 3));
      incenseParticles = new THREE.Points(
        incGeo,
        new THREE.PointsMaterial({
          color: 0xe0d6c4,
          size: 0.05,
          transparent: true,
          opacity: 0.60,
          blending: THREE.NormalBlending,
        })
      );
      roomGroup.add(incenseParticles);

      // 7. GOLDEN DUST PARTICLES DRIFTING ACROSS EXPANSIVE SANCTUM GALLERY
      const sDustGeo = new THREE.BufferGeometry();
      const sDustPos = new Float32Array(versaceDustCount * 3);
      for (let i = 0; i < versaceDustCount; i++) {
        sDustPos[i * 3 + 0] = -3.5 - Math.random() * 4.0;
        sDustPos[i * 3 + 1] = 0.6 + Math.random() * 4.5;
        sDustPos[i * 3 + 2] = -4.0 + Math.random() * 8.0;
      }
      sDustGeo.setAttribute("position", new THREE.BufferAttribute(sDustPos, 3));
      const sanctumDust = new THREE.Points(
        sDustGeo,
        new THREE.PointsMaterial({
          color: 0xffdfaa,
          size: 0.05,
          transparent: true,
          opacity: 0.80,
          blending: THREE.AdditiveBlending,
        })
      );
      roomGroup.add(sanctumDust);

      // 8. STATEMENT OVERHEAD FIXTURE & CURATED SANCTUM ARTIFACTS
      // Ornate Brass Temple Hanging Lamp (Hanging Akhand Diya / Kalash fixture)
      buildTempleHangingLamp(roomGroup, 0, 4.8, 0, xDoor - roomW / 2, 4.8, zCenter);

      // Fresh Flower Marigold Garlands (Genda Phool), Brass Deity Idol & Pooja Bell on Altar Console
      buildTempleAltarDecor(roomGroup, -5.5);

      // Monumental Cast Brass Temple Bells on Chains flanking Altar
      buildHangingTempleBells(roomGroup, -3.8, -2.2, roomH, 2.8);
      buildHangingTempleBells(roomGroup, -3.8, 2.2, roomH, 2.8);

      hallwayGroup.add(roomGroup);
      return roomGroup;
    };

    // -------------------------------------------------------------------------
    // -------------------------------------------------------------------------
    // CHAMBER IV: CORPORATE RECEPTION (Curated Commercial Architectural Gallery)
    // -------------------------------------------------------------------------
    const buildCorporateReceptionChamber = () => {
      const xDoor = hallWidth / 2;
      const zCenter = -95;
      const { roomGroup, roomW, roomD, roomH, wallMat } = buildRoomShell(
        xDoor,
        zCenter,
        1,
        0x361d28, // deep rich aubergine wall base
        grandFloorMat // Continuous Italian Nero Marquina black marble floor
      );
      wallMat.fog = false;

      const backX = roomW / 2; // +8.0

      // Back Wall: Deep plum/aubergine architectural wall paneling
      const featureBackWall = new THREE.Mesh(
        new THREE.PlaneGeometry(roomD, roomH),
        aubergineWallMat
      );
      featureBackWall.position.set(backX - 0.04, roomH / 2, 0);
      featureBackWall.rotation.y = -Math.PI / 2;
      roomGroup.add(featureBackWall);

      // Artwork 1 (Back Wall Hero): Monumental 12.2m x 5.8m 4K Executive Boardroom Centerpiece
      const ch4HeroArt = createFramedArtMesh(texCh4Boardroom, 12.2, 5.8, 0.11, true, 0.14);
      ch4HeroArt.group.position.set(backX - 0.08, 3.40, 0);
      ch4HeroArt.group.rotation.y = -Math.PI / 2;
      roomGroup.add(ch4HeroArt.group);
      heroArtRefs.current["corporate"] = ch4HeroArt;

      // Side Wall 1 (Z = -roomD/2): Exhibiting 2 monumental fine art commercial works
      const sideWall1 = new THREE.Mesh(new THREE.PlaneGeometry(roomW, roomH), wallMat);
      sideWall1.position.set(0, roomH / 2, -roomD / 2);

      // Artwork 2 (Side Wall 1 Left): The Sky Lounge Pavilion (Monumental 5.8m x 3.8m)
      const ch4ArtSkyLounge = createFramedArtMesh(texCh4SkyLounge, 5.8, 3.8, 0.09, true);
      ch4ArtSkyLounge.group.position.set(-3.5, 3.60, -roomD / 2 + 0.08);

      // Artwork 3 (Side Wall 1 Right): The Executive Dining Suite (Monumental 5.8m x 3.8m)
      const ch4ArtDining = createFramedArtMesh(texCh4Dining, 5.8, 3.8, 0.09, true);
      ch4ArtDining.group.position.set(3.5, 3.60, -roomD / 2 + 0.08);
      roomGroup.add(sideWall1, ch4ArtSkyLounge.group, ch4ArtDining.group);

      // Side Wall 2 (Z = +roomD/2): Exhibiting 2 monumental fine art commercial works
      const sideWall2 = new THREE.Mesh(new THREE.PlaneGeometry(roomW, roomH), wallMat);
      sideWall2.position.set(0, roomH / 2, roomD / 2);
      sideWall2.rotation.y = Math.PI;

      // Artwork 4 (Side Wall 2 Left): The VIP Executive Salon (Monumental 5.8m x 3.8m)
      const ch4ArtVip = createFramedArtMesh(texCh4Vip, 5.8, 3.8, 0.09, true);
      ch4ArtVip.group.position.set(-3.5, 3.60, roomD / 2 - 0.08);
      ch4ArtVip.group.rotation.y = Math.PI;

      // Artwork 5 (Side Wall 2 Right): The Skyline Terrace Lounge (Monumental 5.8m x 3.8m)
      const ch4ArtTerrace = createFramedArtMesh(texCh4Terrace, 5.8, 3.8, 0.09, true);
      ch4ArtTerrace.group.position.set(3.5, 3.60, roomD / 2 - 0.08);
      ch4ArtTerrace.group.rotation.y = Math.PI;
      roomGroup.add(sideWall2, ch4ArtVip.group, ch4ArtTerrace.group);

      // 6. STATEMENT CHANDELIER OVERHEAD & CURATED ARTIFACTS
      // Sleek Linear Crystal / Brass-and-Glass Chandelier overhead
      buildLinearExecutiveChandelier(roomGroup, 0, 5.2, 0, xDoor + roomW / 2, 5.2, zCenter);

      // Executive Credenza Desk (Center-foreground)
      const execDeskGroup = new THREE.Group();
      execDeskGroup.position.set(2.8, 0, 0);
      const edTop = new THREE.Mesh(new THREE.BoxGeometry(0.70, 0.08, 2.5), wengeTimberMat);
      edTop.position.set(0, 0.80, 0);
      const edTrim = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.025, 2.52), antiqueGoldMat);
      edTrim.position.set(0, 0.75, 0);
      const edBody = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.52, 2.4), wengeTimberMat);
      edBody.position.set(0, 0.48, 0);
      const edShadow = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 2.7), contactShadowMat);
      edShadow.rotation.x = -Math.PI / 2;
      edShadow.position.set(0, 0.005, 0);
      execDeskGroup.add(edTop, edTrim, edBody, edShadow);
      roomGroup.add(execDeskGroup);

      // Curated Leather Blotter, Brass Armillary Globe, and Marble Bookends
      buildExecutiveDeskDecor(execDeskGroup, 0, 0.84, 0);

      // Framed International Award / Certificate Credential Wall Triptych on Side Wall 1
      buildAwardWallTriptych(roomGroup, 0, 3.4, -roomD / 2 + 0.08, 0);

      hallwayGroup.add(roomGroup);
      return roomGroup;
    };

    // -------------------------------------------------------------------------
    // CHAMBER V: ROYAL SALON (Curated Living Room 2 - Marble Media Wall & Floating Staircase)
    // -------------------------------------------------------------------------
    const buildRoyalLivingChamber = () => {
      const xDoor = -hallWidth / 2;
      const zCenter = -120;
      const { roomGroup, roomW, roomD, roomH, wallMat } = buildRoomShell(
        xDoor,
        zCenter,
        -1,
        0xe8e0d6,
        grandFloorMat // Continuous Italian Nero Marquina black marble floor
      );
      wallMat.fog = false;

      const backX = -(roomW / 2); // -8.0m

      // Back Feature Wall: Grand Double-Height Acoustic Mineral Plaster & Statuario Accent
      const featureWallMat = new THREE.MeshStandardMaterial({
        color: 0xdfd6c8,
        roughness: 0.72,
        fog: false,
      });
      const featureBackWall = new THREE.Mesh(
        new THREE.PlaneGeometry(roomD, roomH),
        featureWallMat
      );
      featureBackWall.position.set(backX + 0.04, roomH / 2, 0);
      featureBackWall.rotation.y = Math.PI / 2;
      roomGroup.add(featureBackWall);

      // Artwork 1 (Back Wall Hero): Monumental 12.2m x 5.8m 4K Centerpiece - Royal Salon Living Wall
      const ch5HeroArt = createFramedArtMesh(texCh5Living, 12.2, 5.8, 0.11, true, 0.14);
      ch5HeroArt.group.position.set(backX + 0.10, 3.40, 0);
      ch5HeroArt.group.rotation.y = Math.PI / 2;
      roomGroup.add(ch5HeroArt.group);
      heroArtRefs.current["royal_living"] = ch5HeroArt;

      // Side Wall 1 (Z = -roomD/2): Exhibiting 2 monumental fine art living room works
      const sideWall1 = new THREE.Mesh(new THREE.PlaneGeometry(roomW, roomH), wallMat);
      sideWall1.position.set(0, roomH / 2, -roomD / 2);

      // Artwork 2 (Side Wall 1 Left): The Velvet Cocktail Lounge (Monumental 5.8m x 3.8m)
      const ch5ArtLounge = createFramedArtMesh(texCh5Lounge, 5.8, 3.8, 0.09, true);
      ch5ArtLounge.group.position.set(-3.5, 3.60, -roomD / 2 + 0.08);

      // Artwork 3 (Side Wall 1 Right): The Cantilever Staircase Atrium (Monumental 5.8m x 3.8m)
      const ch5ArtStaircase = createFramedArtMesh(texCh5Staircase, 5.8, 3.8, 0.09, true);
      ch5ArtStaircase.group.position.set(3.5, 3.60, -roomD / 2 + 0.08);
      roomGroup.add(sideWall1, ch5ArtLounge.group, ch5ArtStaircase.group);

      // Side Wall 2 (Z = +roomD/2): Exhibiting 2 monumental fine art living room works
      const sideWall2 = new THREE.Mesh(new THREE.PlaneGeometry(roomW, roomH), flutedOakMat);
      sideWall2.position.set(0, roomH / 2, roomD / 2);
      sideWall2.rotation.y = Math.PI;

      // Artwork 4 (Side Wall 2 Left): The Minimalist Media Salon (Monumental 5.8m x 3.8m)
      const ch5ArtMinimalist = createFramedArtMesh(texCh5Minimalist, 5.8, 3.8, 0.09, true);
      ch5ArtMinimalist.group.position.set(-3.5, 3.60, roomD / 2 - 0.08);
      ch5ArtMinimalist.group.rotation.y = Math.PI;

      // Artwork 5 (Side Wall 2 Right): The Royal Velvet Fireside (Monumental 5.8m x 3.8m)
      const ch5ArtVelvet = createFramedArtMesh(texCh5Velvet, 5.8, 3.8, 0.09, true);
      ch5ArtVelvet.group.position.set(3.5, 3.60, roomD / 2 - 0.08);
      ch5ArtVelvet.group.rotation.y = Math.PI;
      roomGroup.add(sideWall2, ch5ArtMinimalist.group, ch5ArtVelvet.group);

      // 6. STATEMENT CHANDELIER OVERHEAD & CURATED ARTIFACTS
      // Monumental 3.2m 4-Tier Royal Cascade Chandelier (The grandest of all six rooms)
      buildRoyalCascadeChandelier(roomGroup, 0, 4.8, 0, xDoor - roomW / 2, 4.8, zCenter);

      // Grand Royal Gilded Console Table (Center-foreground)
      const royalConsoleGroup = new THREE.Group();
      royalConsoleGroup.position.set(-2.8, 0, 0);
      const rcTop = new THREE.Mesh(new THREE.BoxGeometry(0.70, 0.10, 2.5), grandFloorMat);
      rcTop.position.set(0, 0.82, 0);
      const rcGoldTrim = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.035, 2.52), antiqueGoldMat);
      rcGoldTrim.position.set(0, 0.76, 0);
      const rcLegs: THREE.BufferGeometry[] = [];
      [
        [-0.25, -1.05],
        [0.25, -1.05],
        [-0.25, 1.05],
        [0.25, 1.05],
      ].forEach(([lx, lz]) => {
        const leg = new THREE.CylinderGeometry(0.04, 0.02, 0.74, 8);
        leg.translate(lx, 0.37, lz);
        rcLegs.push(leg);
      });
      const rcLegsMesh = safeMerge(rcLegs, antiqueGoldMat);
      if (rcLegsMesh) royalConsoleGroup.add(rcLegsMesh);
      const rcShadow = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 2.7), contactShadowMat);
      rcShadow.rotation.x = -Math.PI / 2;
      rcShadow.position.set(0, 0.005, 0);
      royalConsoleGroup.add(rcTop, rcGoldTrim, rcShadow);
      roomGroup.add(royalConsoleGroup);

      // Curated Imperial Cobalt & Gold Porcelain Urn, 5-Arm Candelabra, and Ceremonial Shield
      buildRoyalSalonDecor(royalConsoleGroup, 0, 0.86, 0);

      // Monumental Gilded Rococo Mirror on Side Wall 1
      buildStatementMirror(roomGroup, 0, 3.4, -roomD / 2 + 0.08, 1.6, 2.6, 0, "baroque");

      hallwayGroup.add(roomGroup);
      return roomGroup;
    };

    // -------------------------------------------------------------------------
    // CHAMBER VI: CORPORATE RECEPTION 2 (Laxmi Commercial HQ - Brass Concierge & Chevron Timber)
    // -------------------------------------------------------------------------
    const buildCorporateLobbyChamber = () => {
      const xDoor = hallWidth / 2;
      const zCenter = -145;
      const { roomGroup, roomW, roomD, roomH, wallMat } = buildRoomShell(
        xDoor,
        zCenter,
        1,
        0x201c18, // Warm espresso timber tone
        grandFloorMat // Continuous Italian Nero Marquina black marble floor
      );
      wallMat.fog = false;

      const backX = roomW / 2; // +8.0m

      // Back Feature Wall: Architectural chevron timber paneling with bronze trim
      const featureBackWall = new THREE.Mesh(
        new THREE.PlaneGeometry(roomD, roomH),
        wengeTimberMat
      );
      featureBackWall.position.set(backX - 0.04, roomH / 2, 0);
      featureBackWall.rotation.y = -Math.PI / 2;
      roomGroup.add(featureBackWall);

      // Artwork 1 (Back Wall Hero): Monumental 12.2m x 5.8m 4K Centerpiece - Laxmi Brass Concierge Desk
      const ch6HeroArt = createFramedArtMesh(texCh6Reception, 12.2, 5.8, 0.11, true, 0.14);
      ch6HeroArt.group.position.set(backX - 0.08, 3.40, 0);
      ch6HeroArt.group.rotation.y = -Math.PI / 2;
      roomGroup.add(ch6HeroArt.group);
      heroArtRefs.current["corporate_lobby"] = ch6HeroArt;

      // Side Wall 1 (Z = -roomD/2): Exhibiting 2 monumental corporate reception works
      const sideWall1 = new THREE.Mesh(new THREE.PlaneGeometry(roomW, roomH), wallMat);
      sideWall1.position.set(0, roomH / 2, -roomD / 2);

      // Artwork 2 (Side Wall 1 Left): The Chevron Timber Executive Foyer (Monumental 5.8m x 3.8m)
      const ch6ArtChevron = createFramedArtMesh(texCh6Chevron, 5.8, 3.8, 0.09, true);
      ch6ArtChevron.group.position.set(-3.5, 3.60, -roomD / 2 + 0.08);

      // Artwork 3 (Side Wall 1 Right): The Executive Waiting Lounge (Monumental 5.8m x 3.8m)
      const ch6ArtFoyer = createFramedArtMesh(texCh6Foyer, 5.8, 3.8, 0.09, true);
      ch6ArtFoyer.group.position.set(3.5, 3.60, -roomD / 2 + 0.08);
      roomGroup.add(sideWall1, ch6ArtChevron.group, ch6ArtFoyer.group);

      // Side Wall 2 (Z = +roomD/2): Exhibiting 2 monumental corporate reception works
      const sideWall2 = new THREE.Mesh(new THREE.PlaneGeometry(roomW, roomH), wallMat);
      sideWall2.position.set(0, roomH / 2, roomD / 2);
      sideWall2.rotation.y = Math.PI;

      // Artwork 4 (Side Wall 2 Left): The Entrance Glass Partition Lobby (Monumental 5.8m x 3.8m)
      const ch6ArtLobby = createFramedArtMesh(texCh6Lobby, 5.8, 3.8, 0.09, true);
      ch6ArtLobby.group.position.set(-3.5, 3.60, roomD / 2 - 0.08);
      ch6ArtLobby.group.rotation.y = Math.PI;

      // Artwork 5 (Side Wall 2 Right): The Global Operations Executive Suite (Monumental 5.8m x 3.8m)
      const ch6ArtWorkstation = createFramedArtMesh(texCh6Workstation, 5.8, 3.8, 0.09, true);
      ch6ArtWorkstation.group.position.set(3.5, 3.60, roomD / 2 - 0.08);
      ch6ArtWorkstation.group.rotation.y = Math.PI;
      roomGroup.add(sideWall2, ch6ArtLobby.group, ch6ArtWorkstation.group);

      // 6. STATEMENT CHANDELIER OVERHEAD & CURATED ARTIFACTS
      // Modern Sculptural Orbital Pendant Chandelier overhead
      buildModernOrbitalPendant(roomGroup, 0, 5.2, 0, xDoor + roomW / 2, 5.2, zCenter);

      // Minimalist Monolithic Reception Table (Center-foreground)
      const corpTableGroup = new THREE.Group();
      corpTableGroup.position.set(2.8, 0, 0);
      const ctTop = new THREE.Mesh(new THREE.BoxGeometry(0.90, 0.08, 2.4), wengeTimberMat);
      ctTop.position.set(0, 0.35, 0);
      const ctBase = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.28, 2.0), darkBronzeMat);
      ctBase.position.set(0, 0.14, 0);
      const ctShadow = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 2.6), contactShadowMat);
      ctShadow.rotation.x = -Math.PI / 2;
      ctShadow.position.set(0, 0.005, 0);
      corpTableGroup.add(ctTop, ctBase, ctShadow);
      roomGroup.add(corpTableGroup);

      // Curated Polished Gold Stag Sculpture, Fluted Smoked-Glass Vase with Botanical Branch, and Monograph Books
      buildCorporateReceptionDecor(corpTableGroup, 0, 0.39, 0);

      hallwayGroup.add(roomGroup);
      return roomGroup;
    };

    // Instantiate all 6 chambers with spatial references for occlusion culling
    const chamber1Group = buildGrandLivingChamber();
    const chamber2Group = buildVersaceSuiteChamber();
    const chamber3Group = buildSacredSanctumChamber();
    const chamber4Group = buildCorporateReceptionChamber();
    const chamber5Group = buildRoyalLivingChamber();
    const chamber6Group = buildCorporateLobbyChamber();

    // Attach Master Hallway Group to Scene (isolated & culled until doors open)
    scene.add(hallwayGroup);

    // --- 9. EXACT TIMED CAMERA WAYPOINTS & PIECEWISE CUBIC HERMITE TRAJECTORY ---
    interface CameraWaypoint {
      t: number;
      pos: THREE.Vector3;
      look: THREE.Vector3;
    }

    const cameraWaypoints: CameraWaypoint[] = [
      // 0.00: Grand Hall Entrance gazing down the marble gallery
      { t: 0.00, pos: new THREE.Vector3(0, 2.45, 8.0), look: new THREE.Vector3(0, 2.4, -18.0) },
      // 0.06: Gliding forward along central gallery
      { t: 0.06, pos: new THREE.Vector3(0, 2.4, -6.0), look: new THREE.Vector3(-1.5, 2.35, -18.0) },
      // 0.10: Angling toward Portal I archway on the left
      { t: 0.10, pos: new THREE.Vector3(-2.2, 2.35, -18.5), look: new THREE.Vector3(-8.0, 2.2, -20.0) },
      // 0.12: Passing THROUGH Portal I doorway arch at X = -4.0
      { t: 0.12, pos: new THREE.Vector3(-4.4, 2.25, -20.0), look: new THREE.Vector3(-15.0, 2.6, -20.0) },
      // 0.15: Chamber I Hero View (Grand Living - monumental 12.2m x 5.8m 4K wall artwork & mirror floor)
      { t: 0.15, pos: new THREE.Vector3(-7.8, 2.25, -20.0), look: new THREE.Vector3(-20.0, 3.20, -20.0) },
      // 0.19: Chamber I Panoramic Gallery View
      { t: 0.19, pos: new THREE.Vector3(-9.2, 2.15, -20.0), look: new THREE.Vector3(-20.0, 3.20, -20.0) },
      // 0.22: Gliding backward through Portal I doorway into hallway
      { t: 0.22, pos: new THREE.Vector3(-4.0, 2.3, -22.0), look: new THREE.Vector3(0, 2.4, -36.0) },
      // 0.25: Re-entering central gallery, advancing forward
      { t: 0.25, pos: new THREE.Vector3(0, 2.4, -32.0), look: new THREE.Vector3(1.2, 2.35, -44.0) },

      // 0.28: Angling toward Portal II archway on the right
      { t: 0.28, pos: new THREE.Vector3(2.2, 2.35, -43.5), look: new THREE.Vector3(8.0, 2.2, -45.0) },
      // 0.30: Passing THROUGH Portal II doorway arch at X = +4.0
      { t: 0.30, pos: new THREE.Vector3(4.4, 2.25, -45.0), look: new THREE.Vector3(15.0, 2.6, -45.0) },
      // 0.32: Chamber II Hero View (Versace Suite - monumental 11.6m x 5.6m 4K artwork & oak gallery)
      { t: 0.32, pos: new THREE.Vector3(7.8, 2.25, -45.0), look: new THREE.Vector3(20.0, 3.20, -45.0) },
      // 0.36: Chamber II Panoramic Gallery View
      { t: 0.36, pos: new THREE.Vector3(9.2, 2.15, -45.0), look: new THREE.Vector3(20.0, 3.20, -45.0) },
      // 0.39: Gliding backward through Portal II doorway into hallway
      { t: 0.39, pos: new THREE.Vector3(4.0, 2.3, -48.0), look: new THREE.Vector3(0, 2.4, -62.0) },
      // 0.42: Advancing in central gallery toward Portal III
      { t: 0.42, pos: new THREE.Vector3(0, 2.4, -58.0), look: new THREE.Vector3(-1.2, 2.35, -69.0) },

      // 0.45: Angling toward Portal III archway on the left
      { t: 0.45, pos: new THREE.Vector3(-2.2, 2.35, -68.5), look: new THREE.Vector3(-8.0, 2.2, -70.0) },
      // 0.47: Passing THROUGH Portal III doorway arch at X = -4.0
      { t: 0.47, pos: new THREE.Vector3(-4.4, 2.25, -70.0), look: new THREE.Vector3(-15.0, 2.6, -70.0) },
      // 0.49: Chamber III Hero View (Sacred Sanctum - monumental 9.6m x 5.4m artwork & glowing halo)
      { t: 0.49, pos: new THREE.Vector3(-7.8, 2.25, -70.0), look: new THREE.Vector3(-20.0, 3.20, -70.0) },
      // 0.53: Chamber III Panoramic Gallery View
      { t: 0.53, pos: new THREE.Vector3(-9.2, 2.15, -70.0), look: new THREE.Vector3(-20.0, 3.20, -70.0) },
      // 0.56: Gliding backward through Portal III doorway into hallway
      { t: 0.56, pos: new THREE.Vector3(-4.0, 2.3, -73.0), look: new THREE.Vector3(0, 2.4, -86.0) },
      // 0.59: Advancing in central gallery toward Portal IV
      { t: 0.59, pos: new THREE.Vector3(0, 2.4, -82.0), look: new THREE.Vector3(1.2, 2.35, -94.0) },

      // 0.62: Angling toward Portal IV archway on the right
      { t: 0.62, pos: new THREE.Vector3(2.2, 2.35, -93.5), look: new THREE.Vector3(8.0, 2.2, -95.0) },
      // 0.64: Passing THROUGH Portal IV doorway arch at X = +4.0
      { t: 0.64, pos: new THREE.Vector3(4.4, 2.25, -95.0), look: new THREE.Vector3(15.0, 2.6, -95.0) },
      // 0.66: Chamber IV Hero View (Executive Boardroom - monumental 12.2m x 5.8m artwork)
      { t: 0.66, pos: new THREE.Vector3(7.8, 2.25, -95.0), look: new THREE.Vector3(20.0, 3.20, -95.0) },
      // 0.70: Chamber IV Panoramic Gallery View
      { t: 0.70, pos: new THREE.Vector3(9.2, 2.15, -95.0), look: new THREE.Vector3(20.0, 3.20, -95.0) },
      // 0.73: Gliding backward through Portal IV doorway into hallway
      { t: 0.73, pos: new THREE.Vector3(4.0, 2.3, -98.0), look: new THREE.Vector3(0, 2.4, -111.0) },
      // 0.76: Advancing in central gallery toward Portal V
      { t: 0.76, pos: new THREE.Vector3(0, 2.4, -107.0), look: new THREE.Vector3(-1.2, 2.35, -119.0) },

      // 0.79: Angling toward Portal V archway on the left
      { t: 0.79, pos: new THREE.Vector3(-2.2, 2.35, -118.5), look: new THREE.Vector3(-8.0, 2.2, -120.0) },
      // 0.81: Passing THROUGH Portal V doorway arch at X = -4.0
      { t: 0.81, pos: new THREE.Vector3(-4.4, 2.25, -120.0), look: new THREE.Vector3(-15.0, 2.6, -120.0) },
      // 0.83: Chamber V Hero View (Royal Salon - backlit marble media wall & floating stairs)
      { t: 0.83, pos: new THREE.Vector3(-7.8, 2.25, -120.0), look: new THREE.Vector3(-20.0, 3.20, -120.0) },
      // 0.87: Chamber V Panoramic Gallery View
      { t: 0.87, pos: new THREE.Vector3(-9.2, 2.15, -120.0), look: new THREE.Vector3(-20.0, 3.20, -120.0) },
      // 0.90: Gliding backward through Portal V doorway into hallway
      { t: 0.90, pos: new THREE.Vector3(-4.0, 2.3, -123.0), look: new THREE.Vector3(0, 2.4, -136.0) },
      // 0.93: Advancing in central gallery toward Portal VI
      { t: 0.93, pos: new THREE.Vector3(0, 2.4, -132.0), look: new THREE.Vector3(1.2, 2.35, -144.0) },

      // 0.95: Angling toward Portal VI archway on the right
      { t: 0.95, pos: new THREE.Vector3(2.2, 2.35, -143.5), look: new THREE.Vector3(8.0, 2.2, -145.0) },
      // 0.96: Passing THROUGH Portal VI doorway arch at X = +4.0
      { t: 0.96, pos: new THREE.Vector3(4.4, 2.25, -145.0), look: new THREE.Vector3(15.0, 2.6, -145.0) },
      // 0.97: Chamber VI Hero View (Corporate Reception - sculptural brass concierge & chevron timber)
      { t: 0.97, pos: new THREE.Vector3(7.8, 2.25, -145.0), look: new THREE.Vector3(20.0, 3.20, -145.0) },
      // 0.99: Chamber VI Panoramic Gallery View
      { t: 0.99, pos: new THREE.Vector3(9.2, 2.15, -145.0), look: new THREE.Vector3(20.0, 3.20, -145.0) },
      // 1.00: Final gallery destination inside Chamber VI
      { t: 1.00, pos: new THREE.Vector3(10.5, 2.15, -145.0), look: new THREE.Vector3(20.0, 3.20, -145.0) },
    ];

    const _trajPos = new THREE.Vector3();
    const _trajLook = new THREE.Vector3();
    const _trajResult = { pos: _trajPos, look: _trajLook };

    const getCameraTrajectory = (progressVal: number) => {
      const clamped = THREE.MathUtils.clamp(progressVal, 0, 1);
      let i = 0;
      while (i < cameraWaypoints.length - 1 && cameraWaypoints[i + 1].t <= clamped) {
        i++;
      }
      if (i >= cameraWaypoints.length - 1) {
        const last = cameraWaypoints[cameraWaypoints.length - 1];
        _trajPos.copy(last.pos);
        _trajLook.copy(last.look);
        return _trajResult;
      }
      const k0 = cameraWaypoints[i];
      const k1 = cameraWaypoints[i + 1];
      const range = k1.t - k0.t;
      const rawU = range > 0 ? (clamped - k0.t) / range : 0;
      // Smooth cubic Hermite curve for smooth acceleration/deceleration without jerk
      const u = rawU * rawU * (3 - 2 * rawU);
      _trajPos.lerpVectors(k0.pos, k1.pos, u);
      _trajLook.lerpVectors(k0.look, k1.look, u);
      return _trajResult;
    };

    // --- 10. PRE-WARM GPU: PRELOAD TEXTURES & SHADERS ACROSS ALL WAYPOINTS ---
    const allTextures = [
      calacattaMarbleTex,
      italianBlackMarbleTex,
      chamberBlackMarbleTex,
      runnerRugTex,
      fineLimestoneTex,
      honeyFlutedOakTex,
      ...allMuralTextures,
      ...allChamberTextures,
      ...allExhibitionArtTextures,
    ];

    // --- GRAND ENTRANCE DOOR OPENING, PROGRESSIVE LIGHT REVEAL & SKIP SEQUENCE ---
    const lightingZones = bayLightingFixtures.map((bay) => {
      const cz = bay.cz;
      const sconces = sconceLightingFixtures.filter((s) => Math.abs(s.z - cz) <= 6.5);
      const murals = muralLightingFixtures.filter((m) => Math.abs(m.z - cz) <= 6.5);
      const arches = archLightingFixtures.filter((a) => Math.abs(a.z - cz) <= 6.5);
      return {
        cz,
        lensMat: bay.lensMat,
        haloMat: bay.haloMat,
        coveMat: bay.coveMat,
        sconces,
        murals,
        arches,
      };
    });

    const snapAllLightsToFull = () => {
      sceneStateRef.current.introComplete = true;
      hemiLight.intensity = 1.45;
      hemiLight.color.set(0xfffaee);
      hemiLight.groundColor.set(0xd8c8b2);
      mainSun.intensity = 1.10;
      fillSun.intensity = 1.10;
      ceilingUpLight.intensity = 1.0;
      corridorCeilingMat.emissiveIntensity = 0.20;
      luxuryCofferMat.emissiveIntensity = 0.38;
      artLampHoodMat.emissiveIntensity = 0.75;
      scene.background = new THREE.Color("#ede5d9");
      if (scene.fog) {
        (scene.fog as THREE.Fog).color.set("#e4d8c8");
        (scene.fog as THREE.Fog).near = 85;
        (scene.fog as THREE.Fog).far = 185;
      }
      waveLight.intensity = 0;

      const dRefs = doorAnimationRef.current;
      if (dRefs.doorKeyLight) dRefs.doorKeyLight.intensity = 0;
      if (dRefs.doorUplight) dRefs.doorUplight.intensity = 0;
      if (dRefs.porticoFill) dRefs.porticoFill.intensity = 0;

      lightingZones.forEach((zone) => {
        zone.lensMat.emissiveIntensity = 3.4;
        zone.haloMat.opacity = 0.70;
        zone.coveMat.emissiveIntensity = 1.5;
        zone.sconces.forEach((s) => {
          s.shadeMat.emissiveIntensity = 1.8;
          s.scallopMat.opacity = 0.70;
        });
        zone.murals.forEach((m) => {
          m.lampMat.emissiveIntensity = 0.75;
          m.canvasMat.emissiveIntensity = 0.38;
        });
        zone.arches.forEach((a) => {
          a.lensMat.emissiveIntensity = 1.5;
        });
      });

      torchereGlowMat.emissiveIntensity = 2.2;
      backlitWindowMat.emissiveIntensity = 2.2;
      floorSpillMat.opacity = 0.42;
      focalLightSpill.intensity = 4.2;
    };

    // Dynamic Chamber Lighting Configs for Pooled Lights
    const CHAMBER_LIGHTS = [
      {
        heroP: 0.15,
        spotPos: [-11.5, 6.8, -24.8] as const,
        spotTarget: [-5.8, 0.35, -20.0] as const,
        spotColor: 0xffecd0,
        spotIntensity: 1.8,
        chPos: [-17.0, 5.2, -20.0] as const,
        chColor: 0xfff0d6,
        chIntensity: 0.85,
        chDist: 11.0,
      },
      {
        heroP: 0.32,
        spotPos: [19.0, 6.6, -45.0] as const,
        spotTarget: [17.0, 2.5, -45.0] as const,
        spotColor: 0xffecd0,
        spotIntensity: 1.8,
        chPos: [17.0, 5.3, -45.0] as const,
        chColor: 0xffebd2,
        chIntensity: 0.80,
        chDist: 10.0,
      },
      {
        heroP: 0.49,
        spotPos: [-19.0, 6.6, -70.0] as const,
        spotTarget: [-17.0, 2.5, -70.0] as const,
        spotColor: 0xffeed6,
        spotIntensity: 1.8,
        chPos: [-17.0, 5.1, -70.0] as const,
        chColor: 0xff9e28,
        chIntensity: 0.90,
        chDist: 9.5,
      },
      {
        heroP: 0.66,
        spotPos: [19.0, 6.6, -95.0] as const,
        spotTarget: [17.0, 2.5, -95.0] as const,
        spotColor: 0xffecd0,
        spotIntensity: 1.8,
        chPos: [17.0, 5.2, -95.0] as const,
        chColor: 0xffeed8,
        chIntensity: 0.75,
        chDist: 10.0,
      },
      {
        heroP: 0.83,
        spotPos: [-19.0, 6.6, -120.0] as const,
        spotTarget: [-17.0, 2.5, -120.0] as const,
        spotColor: 0xffeed6,
        spotIntensity: 1.8,
        chPos: [-17.0, 5.2, -120.0] as const,
        chColor: 0xfff2d4,
        chIntensity: 0.95,
        chDist: 12.0,
      },
      {
        heroP: 0.97,
        spotPos: [19.0, 6.6, -145.0] as const,
        spotTarget: [17.0, 2.5, -145.0] as const,
        spotColor: 0xffecd0,
        spotIntensity: 1.8,
        chPos: [17.0, 5.1, -145.0] as const,
        chColor: 0xfff4e6,
        chIntensity: 0.80,
        chDist: 10.0,
      },
    ];

    const warmUpGPU = () => {
      // 1. Pre-upload all loaded textures to VRAM
      allTextures.forEach((tex) => {
        try {
          const img = tex?.image as { complete?: boolean; width?: number } | undefined;
          if (img && (img.complete || (img.width && img.width > 0))) {
            renderer.initTexture(tex);
          }
        } catch (_) {}
      });

      // 2. Reveal hallwayGroup and all 6 chambers so compiler traverses every single material & light
      hallwayGroup.visible = true;
      if (chamber1Group) chamber1Group.visible = true;
      if (chamber2Group) chamber2Group.visible = true;
      if (chamber3Group) chamber3Group.visible = true;
      if (chamber4Group) chamber4Group.visible = true;
      if (chamber5Group) chamber5Group.visible = true;
      if (chamber6Group) chamber6Group.visible = true;

      // 3. Ignite full mansion illumination so shaders are compiled for active lit conditions
      const wasIntroComplete = sceneStateRef.current.introComplete;
      snapAllLightsToFull();

      // 4. Exhaustive Pre-Compilation:
      // Temporarily disable frustum culling on all scene meshes so Three.js compiler compiles EVERY single
      // material, texture, chandelier, artifact, and particle across all 6 rooms and hallway
      const culledMeshes: THREE.Object3D[] = [];
      scene.traverse((obj) => {
        if (obj.frustumCulled) {
          culledMeshes.push(obj);
          obj.frustumCulled = false;
        }
      });

      // Compile across all 6 chambers with their respective pooled lights activated
      for (let chIdx = 0; chIdx < CHAMBER_LIGHTS.length; chIdx++) {
        const ch = CHAMBER_LIGHTS[chIdx];
        if (activeChamberSpot && activeChandelierLight) {
          activeChamberSpot.position.set(ch.spotPos[0], ch.spotPos[1], ch.spotPos[2]);
          activeChamberSpot.target.position.set(ch.spotTarget[0], ch.spotTarget[1], ch.spotTarget[2]);
          activeChamberSpot.color.setHex(ch.spotColor);
          activeChamberSpot.intensity = ch.spotIntensity;
          activeChandelierLight.position.set(ch.chPos[0], ch.chPos[1], ch.chPos[2]);
          activeChandelierLight.color.setHex(ch.chColor);
          activeChandelierLight.intensity = ch.chIntensity;
        }
        if (sanctumDiyaLight) {
          sanctumDiyaLight.intensity = chIdx === 2 ? 1.0 : 0.0;
        }
        const { pos, look } = getCameraTrajectory(ch.heroP);
        camera.position.copy(pos);
        camera.lookAt(look);
        camera.updateMatrixWorld();
        renderer.compile(scene, camera);
        renderer.render(scene, camera);
      }

      // Also compile along hallway gallery waypoints
      const hallwayP = [0.0, 0.08, 0.25, 0.42, 0.59, 0.76, 0.93];
      for (const hp of hallwayP) {
        const { pos, look } = getCameraTrajectory(hp);
        camera.position.copy(pos);
        camera.lookAt(look);
        camera.updateMatrixWorld();
        renderer.compile(scene, camera);
        renderer.render(scene, camera);
      }

      // Restore original frustum culling
      culledMeshes.forEach((obj) => {
        obj.frustumCulled = true;
      });

      // 5. If door is still loading or ready, restore pre-door state outside closed doors
      if (sceneStateRef.current.doorState === "loading" || sceneStateRef.current.doorState === "ready") {
        hallwayGroup.visible = false;
        camera.position.set(0, 2.85, 14.5);
        camera.lookAt(0, 3.10, 8.2);
        camera.updateMatrixWorld();
        if (!wasIntroComplete) {
          sceneStateRef.current.introComplete = false;
          mainSun.intensity = 0.0;
          fillSun.intensity = 0.0;
          ceilingUpLight.intensity = 0.0;
        }
      }
    };

    triggerWarmUpGPU = warmUpGPU;
    warmUpGPU();

    const runHallwayLightSequence = () => {
      if (sceneStateRef.current.isLightingSequence) return;
      sceneStateRef.current.isLightingSequence = true;
      setIsLightingSequence(true);

      const humController = isMuted ? null : startElectricHum();

      const tl = gsap.timeline({
        onComplete: () => {
          sceneStateRef.current.isLightingSequence = false;
          sceneStateRef.current.introComplete = true;
          setIsLightingSequence(false);
          document.body.classList.remove("cinematic-active");
          humController?.stop();
        },
      });
      lightingTimelineRef.current = tl;

      // Moving dynamic wave key light starts at entrance and sweeps down corridor
      waveLight.intensity = 3.6;
      waveLight.position.set(0, 5.5, 8.0);

      // Smoothly ramp global ambient daylight from cool dim moonlight (0.25) to daytime sunlit brilliance (1.45)
      tl.to(hemiLight, { intensity: 1.45, duration: 1.15, ease: "power1.inOut" }, 0);
      const hemiCol = { r: 0x38 / 255, g: 0x46 / 255, b: 0x5c / 255 };
      tl.to(hemiCol, {
        r: 0xff / 255, g: 0xfa / 255, b: 0xee / 255,
        duration: 1.15,
        ease: "power1.inOut",
        onUpdate: () => hemiLight.color.setRGB(hemiCol.r, hemiCol.g, hemiCol.b),
      }, 0);
      const hemiGnd = { r: 0x18 / 255, g: 0x1c / 255, b: 0x26 / 255 };
      tl.to(hemiGnd, {
        r: 0xd8 / 255, g: 0xc8 / 255, b: 0xb2 / 255,
        duration: 1.15,
        ease: "power1.inOut",
        onUpdate: () => hemiLight.groundColor.setRGB(hemiGnd.r, hemiGnd.g, hemiGnd.b),
      }, 0);

      // Ramp balanced symmetrical suns together
      tl.to(mainSun, { intensity: 1.10, duration: 1.15, ease: "power1.inOut" }, 0);
      tl.to(fillSun, { intensity: 1.10, duration: 1.15, ease: "power1.inOut" }, 0);
      tl.to(ceilingUpLight, { intensity: 1.0, duration: 1.15, ease: "power1.inOut" }, 0);
      tl.to(corridorCeilingMat, { emissiveIntensity: 0.20, duration: 1.15, ease: "power1.inOut" }, 0);
      tl.to(luxuryCofferMat, { emissiveIntensity: 0.38, duration: 1.15, ease: "power1.inOut" }, 0);
      tl.to(artLampHoodMat, { emissiveIntensity: 0.75, duration: 1.15, ease: "power1.inOut" }, 0);

      // Smoothly transition background and fog to warm sunlit mansion atmosphere
      const bgCol = { r: 0x0e / 255, g: 0x12 / 255, b: 0x1a / 255 };
      tl.to(bgCol, {
        r: 0xed / 255, g: 0xe5 / 255, b: 0xd9 / 255,
        duration: 1.15,
        ease: "power1.inOut",
        onUpdate: () => {
          scene.background = new THREE.Color(bgCol.r, bgCol.g, bgCol.b);
        },
      }, 0);

      if (scene.fog) {
        const fogCol = { r: 0x0e / 255, g: 0x12 / 255, b: 0x1a / 255 };
        tl.to(fogCol, {
          r: 0xe4 / 255, g: 0xd8 / 255, b: 0xc8 / 255,
          duration: 1.15,
          ease: "power1.inOut",
          onUpdate: () => {
            if (scene.fog) (scene.fog as THREE.Fog).color.setRGB(fogCol.r, fogCol.g, fogCol.b);
          },
        }, 0);
        tl.to(scene.fog, { near: 85, far: 185, duration: 1.15, ease: "power1.inOut" }, 0);
      }

      // Dynamic Wave Key Light follows wave down corridor, throwing dynamic specular reflections across the floor
      tl.to(waveLight.position, {
        z: -168,
        duration: 1.15,
        ease: "power1.inOut",
      }, 0);

      // Sequential light-up animation across each zone (staggered by 0.065s for swift dynamic wave)
      const zoneStagger = 0.065;
      lightingZones.forEach((zone, idx) => {
        const tStart = idx * zoneStagger;

        // Relay click audio with upward pitch progression as wave travels down corridor
        tl.call(() => {
          playRelayClick(1.0 + (idx / 14) * 0.45, 0.03 + (idx / 14) * 0.035);
        }, [], tStart);

        // 1. Coffer Downlight Lens: micro-strike flicker then warm surge
        tl.to(zone.lensMat, { emissiveIntensity: 2.4, duration: 0.02, ease: "power3.in" }, tStart);
        tl.to(zone.lensMat, { emissiveIntensity: 1.3, duration: 0.025, ease: "power1.out" }, tStart + 0.02);
        tl.to(zone.lensMat, { emissiveIntensity: 3.4, duration: 0.10, ease: "power2.out" }, tStart + 0.045);

        // 2. Coffer Downlight Halo: soft radial bloom
        tl.to(zone.haloMat, { opacity: 0.70, duration: 0.14, ease: "power2.out" }, tStart + 0.02);

        // 3. Cove Lighting: smooth warm architectural surge (both left and right cove channels ignite together)
        tl.to(zone.coveMat, { emissiveIntensity: 1.5, duration: 0.16, ease: "power2.out" }, tStart + 0.015);

        // 4. Sconces in this zone (symmetrically paired left and right)
        zone.sconces.forEach((sconce) => {
          tl.to(sconce.shadeMat, { emissiveIntensity: 2.2, duration: 0.02, ease: "power3.in" }, tStart);
          tl.to(sconce.shadeMat, { emissiveIntensity: 1.1, duration: 0.025, ease: "power1.out" }, tStart + 0.02);
          tl.to(sconce.shadeMat, { emissiveIntensity: 1.8, duration: 0.10, ease: "power2.out" }, tStart + 0.045);
          tl.to(sconce.scallopMat, { opacity: 0.70, duration: 0.16, ease: "power2.out" }, tStart + 0.015);
        });

        // 5. Murals and picture lamps in this zone (symmetrically paired left and right)
        zone.murals.forEach((mural) => {
          tl.to(mural.lampMat, { emissiveIntensity: 0.75, duration: 0.14, ease: "power2.out" }, tStart + 0.025);
          tl.to(mural.canvasMat, { emissiveIntensity: 0.38, duration: 0.16, ease: "power2.out" }, tStart + 0.025);
        });

        // 6. Arches in this zone
        zone.arches.forEach((arch) => {
          tl.to(arch.lensMat, { emissiveIntensity: 1.5, duration: 0.14, ease: "power2.out" }, tStart + 0.02);
        });
      });

      // GRAND TERMINUS CLIMAX: Far-End Portal Ignites with Full Resonance Chime
      const terminusTime = 14 * zoneStagger + 0.04;
      tl.call(() => {
        playFullResonanceChime();
      }, [], terminusTime);

      tl.to(torchereGlowMat, { emissiveIntensity: 2.2, duration: 0.22, ease: "power2.out" }, terminusTime);
      tl.to(backlitWindowMat, { emissiveIntensity: 2.2, duration: 0.25, ease: "power2.out" }, terminusTime);
      tl.to(floorSpillMat, { opacity: 0.42, duration: 0.25, ease: "power2.out" }, terminusTime);
      tl.to(focalLightSpill, { intensity: 4.2, duration: 0.25, ease: "power2.out" }, terminusTime);

      // Fade out dynamic wave light once reveal is complete
      tl.to(waveLight, { intensity: 0, duration: 0.20, ease: "power2.in" }, terminusTime + 0.06);
    };

    const openDoorSequence = () => {
      if (sceneStateRef.current.doorState !== "ready") return;
      warmUpGPU();
      sceneStateRef.current.doorState = "opening";
      setDoorState("opening");

      // Hide custom cursor during cinematic intro sequence to avoid stray floating dot
      document.body.classList.add("cinematic-active");

      // 1. Immediately fade out the door UI overlay (title, medallion, button, tagline)
      setDoorUIFading(true);

      // Auto-unmute on explicit enter click and initiate audio experience
      setIsMuted(false);
      startAmbientDrone();
      playDoorLatchClick();
      playDoorOpeningGroan();

      const dRefs = doorAnimationRef.current;
      const tl = gsap.timeline({
        onComplete: () => {
          if (sceneStateRef.current.doorState === "opening") {
            sceneStateRef.current.doorState = "opened";
            sceneStateRef.current.currentProgress = 0;
            sceneStateRef.current.targetProgress = 0;
            setDoorState("opened");
            setIsDoorOpen(true);
            if (dRefs.doorGroup) {
              dRefs.doorGroup.visible = false;
            }
            // Trigger progressive lighting reveal down the hallway
            runHallwayLightSequence();
          }
        },
      });
      doorTimelineRef.current = tl;

      // 1b. Complete removal of door UI overlay from DOM/rendering before hallway starts
      tl.call(() => {
        setDoorUIHidden(true);
      }, [], 0.25);

      // 2. Both door handles rotate downward (unlatch click) 0s -> 0.22s
      if (dRefs.leftHandle && dRefs.rightHandle) {
        tl.to(dRefs.leftHandle.rotation, { z: -0.32, duration: 0.22, ease: "power2.inOut" }, 0);
        tl.to(dRefs.rightHandle.rotation, { z: 0.32, duration: 0.22, ease: "power2.inOut" }, 0);
      }

      // 3. Both door panels swing open inward into the hallway 0.20s -> 1.40s
      if (dRefs.leftPivot && dRefs.rightPivot) {
        tl.to(dRefs.leftPivot.rotation, { y: -Math.PI / 2.1, duration: 1.20, ease: "power2.inOut" }, 0.20);
        tl.to(dRefs.rightPivot.rotation, { y: Math.PI / 2.1, duration: 1.20, ease: "power2.inOut" }, 0.20);
      }

      // 3b. Crack slit, glow and floor spill fade out immediately as doors part (0.20s -> 0.40s)
      if (dRefs.crackSlit) {
        tl.to((dRefs.crackSlit.material as THREE.MeshBasicMaterial), { opacity: 0.0, duration: 0.20, ease: "power2.out" }, 0.20);
      }
      if (dRefs.crackGlow) {
        tl.to((dRefs.crackGlow.material as THREE.MeshBasicMaterial), { opacity: 0.0, duration: 0.20, ease: "power2.out" }, 0.20);
      }
      if (dRefs.floorSpill) {
        tl.to((dRefs.floorSpill.material as THREE.MeshBasicMaterial), { opacity: 0.0, duration: 0.25, ease: "power2.out" }, 0.20);
      }

      // 3c. Dark occluder behind doors dissolves as doors part (0.20s -> 0.55s)
      if (dRefs.doorBacker) {
        const bMat = dRefs.doorBacker.material as THREE.MeshBasicMaterial;
        tl.to(dRefs.doorBacker.scale, { x: 0.001, duration: 0.35, ease: "power2.inOut" }, 0.20);
        tl.to(bMat, { opacity: 0.0, duration: 0.35, ease: "power2.out" }, 0.20);
      }

      // 4. Reveal interior hallway meshes and all chambers at t = 0.30s so moonlit architecture is seen through parting doors
      tl.call(() => {
        hallwayGroup.visible = true;
        if (chamber1Group) chamber1Group.visible = true;
        if (chamber2Group) chamber2Group.visible = true;
        if (chamber3Group) chamber3Group.visible = true;
        if (chamber4Group) chamber4Group.visible = true;
        if (chamber5Group) chamber5Group.visible = true;
        if (chamber6Group) chamber6Group.visible = true;
      }, [], 0.30);

      // 5. Camera pushes forward through doorway into hallway 0.25s -> 1.45s (smooth glide)
      tl.to(dRefs.cameraPos, {
        y: 2.45,
        z: 8.0,
        duration: 1.20,
        ease: "power2.inOut",
      }, 0.25);

      tl.to(dRefs.cameraLook, {
        y: 2.40,
        z: -18.0,
        duration: 1.20,
        ease: "power2.inOut",
      }, 0.25);

      // 6. Cross-fade exterior sunlit ambiance to cool dim moonlit interior fill (0.25s -> 1.15s)
      // Maintains visible moonlight geometry (columns, floor sheen, ceiling silhouette) — NEVER pure black!
      tl.to(hemiLight, { intensity: 0.25, duration: 0.90, ease: "power2.inOut" }, 0.25);
      tl.to(mainSun, { intensity: 0.0, duration: 0.70, ease: "power2.inOut" }, 0.25);
      tl.to(fillSun, { intensity: 0.0, duration: 0.70, ease: "power2.inOut" }, 0.25);
      tl.to(ceilingUpLight, { intensity: 0.0, duration: 0.70, ease: "power2.inOut" }, 0.25);

      if (dRefs.doorKeyLight) {
        tl.to(dRefs.doorKeyLight, { intensity: 0, duration: 0.70, ease: "power2.inOut" }, 0.25);
      }
      if (dRefs.doorUplight) {
        tl.to(dRefs.doorUplight, { intensity: 0, duration: 0.70, ease: "power2.inOut" }, 0.25);
      }
      if (dRefs.porticoFill) {
        tl.to(dRefs.porticoFill, { intensity: 0, duration: 0.70, ease: "power2.inOut" }, 0.25);
      }

      // Smooth color transition to cool moonlit slate tones
      const hemiDimCol = { r: 1.0, g: 0.98, b: 0.94 };
      tl.to(hemiDimCol, {
        r: 0x38 / 255, g: 0x46 / 255, b: 0x5c / 255,
        duration: 0.90,
        ease: "power2.inOut",
        onUpdate: () => hemiLight.color.setRGB(hemiDimCol.r, hemiDimCol.g, hemiDimCol.b),
      }, 0.25);
      const hemiDimGnd = { r: 0.85, g: 0.78, b: 0.70 };
      tl.to(hemiDimGnd, {
        r: 0x18 / 255, g: 0x1c / 255, b: 0x26 / 255,
        duration: 0.90,
        ease: "power2.inOut",
        onUpdate: () => hemiLight.groundColor.setRGB(hemiDimGnd.r, hemiDimGnd.g, hemiDimGnd.b),
      }, 0.25);

      const bgDimCol = { r: 0xed / 255, g: 0xe5 / 255, b: 0xd9 / 255 };
      tl.to(bgDimCol, {
        r: 0x0e / 255, g: 0x12 / 255, b: 0x1a / 255,
        duration: 0.90,
        ease: "power2.inOut",
        onUpdate: () => {
          scene.background = new THREE.Color(bgDimCol.r, bgDimCol.g, bgDimCol.b);
        },
      }, 0.25);

      if (scene.fog) {
        const fogDimCol = { r: 0xe4 / 255, g: 0xd8 / 255, b: 0xc8 / 255 };
        tl.to(fogDimCol, {
          r: 0x0e / 255, g: 0x12 / 255, b: 0x1a / 255,
          duration: 0.90,
          ease: "power2.inOut",
          onUpdate: () => {
            if (scene.fog) (scene.fog as THREE.Fog).color.setRGB(fogDimCol.r, fogDimCol.g, fogDimCol.b);
          },
        }, 0.25);
        tl.to(scene.fog, { near: 35, far: 145, duration: 0.90, ease: "power2.inOut" }, 0.25);
      }

      // 7. Door meshes hidden once camera has fully passed through into the hallway (t = 1.45s)
      tl.call(() => {
        if (dRefs.doorGroup) {
          dRefs.doorGroup.visible = false;
        }
      }, [], 1.45);

      // 8. Crisp cinematic breath in the moonlit hallway (1.45s -> 1.60s, exactly 0.15s)
      // Camera is settled at (0, 2.45, 8.0). Architecture (columns, floor, ceiling silhouette)
      // is faintly and beautifully visible in cool dim moonlight. No pure black void!
      tl.to({}, { duration: 0.15 }, 1.45);
    };

    const skipDoorSequence = () => {
      if (doorTimelineRef.current) {
        doorTimelineRef.current.kill();
      }
      if (lightingTimelineRef.current) {
        lightingTimelineRef.current.kill();
      }
      document.body.classList.remove("cinematic-active");
      const dRefs = doorAnimationRef.current;
      gsap.killTweensOf(dRefs.cameraPos);
      gsap.killTweensOf(dRefs.cameraLook);
      gsap.killTweensOf(sceneStateRef.current);
      if (dRefs.leftPivot) gsap.killTweensOf(dRefs.leftPivot.rotation);
      if (dRefs.rightPivot) gsap.killTweensOf(dRefs.rightPivot.rotation);
      if (dRefs.leftHandle) gsap.killTweensOf(dRefs.leftHandle.rotation);
      if (dRefs.rightHandle) gsap.killTweensOf(dRefs.rightHandle.rotation);
      if (dRefs.lightFlood) gsap.killTweensOf(dRefs.lightFlood.material as any);
      if (dRefs.crackSlit) {
        gsap.killTweensOf(dRefs.crackSlit.material as any);
        dRefs.crackSlit.visible = false;
      }
      if (dRefs.crackGlow) {
        gsap.killTweensOf(dRefs.crackGlow.material as any);
        dRefs.crackGlow.visible = false;
      }
      if (dRefs.doorBacker) {
        gsap.killTweensOf(dRefs.doorBacker.scale);
        gsap.killTweensOf(dRefs.doorBacker.material as any);
        dRefs.doorBacker.visible = false;
      }
      if (dRefs.doorKeyLight) gsap.killTweensOf(dRefs.doorKeyLight);
      if (dRefs.doorUplight) gsap.killTweensOf(dRefs.doorUplight);
      if (dRefs.porticoFill) gsap.killTweensOf(dRefs.porticoFill);
      gsap.killTweensOf(mainSun);
      gsap.killTweensOf(fillSun);
      gsap.killTweensOf(ceilingUpLight);
      gsap.killTweensOf(hemiLight);
      gsap.killTweensOf(corridorCeilingMat);
      gsap.killTweensOf(luxuryCofferMat);
      gsap.killTweensOf(artLampHoodMat);
      gsap.killTweensOf(torchereGlowMat);
      gsap.killTweensOf(backlitWindowMat);
      gsap.killTweensOf(floorSpillMat);
      gsap.killTweensOf(focalLightSpill);
      gsap.killTweensOf(waveLight);
      gsap.killTweensOf(waveLight.position);

      sceneStateRef.current.introComplete = true;

      dRefs.cameraPos.set(0, 2.45, 8.0);
      dRefs.cameraLook.set(0, 2.4, -18.0);

      hallwayGroup.visible = true;
      if (chamber1Group) chamber1Group.visible = true;
      if (chamber2Group) chamber2Group.visible = true;
      if (chamber3Group) chamber3Group.visible = true;
      if (chamber4Group) chamber4Group.visible = true;
      if (chamber5Group) chamber5Group.visible = true;
      if (chamber6Group) chamber6Group.visible = true;

      if (dRefs.doorGroup) {
        dRefs.doorGroup.visible = false;
      }

      sceneStateRef.current.doorState = "opened";
      sceneStateRef.current.currentProgress = 0;
      sceneStateRef.current.targetProgress = 0;
      sceneStateRef.current.isLightingSequence = false;
      setDoorState("opened");
      setIsDoorOpen(true);
      setIsLightingSequence(false);

      snapAllLightsToFull();
      warmUpGPU();

      setDoorUIFading(true);
      setDoorUIHidden(true);
    };

    triggerOpenDoorRef.current = openDoorSequence;
    triggerSkipDoorRef.current = skipDoorSequence;

    // --- 11. SCROLL CAPTURE & MOMENTUM GLIDE INTERACTION ---
    const handleWheel = (e: WheelEvent) => {
      // If lighting sequence is running and user scrolls, immediately finish lighting sequence and let them move!
      if (sceneStateRef.current.doorState === "opened" && sceneStateRef.current.isLightingSequence) {
        if (lightingTimelineRef.current) {
          lightingTimelineRef.current.progress(1);
        }
        snapAllLightsToFull();
        sceneStateRef.current.isLightingSequence = false;
        setIsLightingSequence(false);
      }

      if (sceneStateRef.current.doorState !== "opened" || sceneStateRef.current.isLightingSequence) {
        if (e.cancelable) e.preventDefault();
        return;
      }
      if (e.cancelable) {
        e.preventDefault();
      }
      const state = sceneStateRef.current;
      state.isSnapping = false;
      state.lastScrollTime = performance.now();

      // Normalize delta across operating systems, browsers, and devices
      let rawDelta = e.deltaY;
      if (e.deltaMode === 1) {
        rawDelta *= 33; // DOM_DELTA_LINE
      } else if (e.deltaMode === 2) {
        rawDelta *= 600; // DOM_DELTA_PAGE
      }

      // Smooth buttery progress accumulation:
      // Trackpads fire high-frequency small deltas (|delta| < 40).
      // Mouse wheels fire discrete notches (|delta| >= 40, usually 100).
      // 1 standard wheel notch (~100px) moves ~0.0135 progress for a dignified architectural stroll (~12 notches between chambers).
      // Trackpad fingers translate 1:1 with silky continuous precision.
      const isTrackpad = Math.abs(rawDelta) < 40;
      const progressDelta = isTrackpad
        ? rawDelta * 0.00012
        : Math.sign(rawDelta) * Math.min(Math.abs(rawDelta), 160) * 0.000135;

      state.targetProgress = Math.max(0, Math.min(1, state.targetProgress + progressDelta));

      // Gentle kinetic glide inertia on fast flicks without runaway acceleration
      if (Math.abs(rawDelta) > 80) {
        state.targetVelocity = Math.max(-0.003, Math.min(0.003, state.targetVelocity + Math.sign(rawDelta) * 0.00075));
      }
    };

    let touchStartY = 0;
    let lastTouchY = 0;
    let lastTouchTime = 0;
    let touchVelocity = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (sceneStateRef.current.doorState !== "opened" || sceneStateRef.current.isLightingSequence) return;
      if (e.touches.length > 0) {
        touchStartY = e.touches[0].clientY;
        lastTouchY = touchStartY;
        lastTouchTime = performance.now();
        touchVelocity = 0;
        const state = sceneStateRef.current;
        state.isSnapping = false;
        state.targetVelocity = 0;
        state.scrollVelocity = 0;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (sceneStateRef.current.doorState === "opened" && sceneStateRef.current.isLightingSequence) {
        if (lightingTimelineRef.current) {
          lightingTimelineRef.current.progress(1);
        }
        snapAllLightsToFull();
        sceneStateRef.current.isLightingSequence = false;
        setIsLightingSequence(false);
      }
      if (sceneStateRef.current.doorState !== "opened" || sceneStateRef.current.isLightingSequence) {
        if (e.cancelable) e.preventDefault();
        return;
      }
      if (e.cancelable) {
        e.preventDefault();
      }
      if (e.touches.length === 0) return;
      const currentY = e.touches[0].clientY;
      const now = performance.now();
      const dtTouch = Math.max(1, now - lastTouchTime);
      const deltaY = lastTouchY - currentY;

      touchVelocity = (deltaY / dtTouch) * 0.00020;
      lastTouchY = currentY;
      lastTouchTime = now;

      const state = sceneStateRef.current;
      state.lastScrollTime = now;
      state.isSnapping = false;
      state.targetProgress = Math.max(0, Math.min(1, state.targetProgress + deltaY * 0.00030));
    };

    const handleTouchEnd = () => {
      const state = sceneStateRef.current;
      if (Math.abs(touchVelocity) > 0.0001) {
        state.targetVelocity = Math.max(-0.004, Math.min(0.004, touchVelocity * 4));
      }
    };

    // Canvas click & drag glide navigation
    let isPointerDown = false;
    let lastPointerY = 0;
    let lastPointerTime = 0;
    let pointerVelocity = 0;

    const handlePointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      if (sceneStateRef.current.doorState === "ready") {
        triggerOpenDoorRef.current();
        return;
      }
      if (sceneStateRef.current.doorState !== "opened" || sceneStateRef.current.isLightingSequence) return;
      isPointerDown = true;
      lastPointerY = e.clientY;
      lastPointerTime = performance.now();
      pointerVelocity = 0;
      const state = sceneStateRef.current;
      state.isSnapping = false;
      state.targetVelocity = 0;
      state.scrollVelocity = 0;
    };

    const handlePointerMove = (e: PointerEvent) => {
      const nx = (e.clientX / window.innerWidth - 0.5) * 2;
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;
      sceneStateRef.current.targetTilt = { x: nx * 0.28, y: -ny * 0.18 };

      if (!isPointerDown) return;
      const now = performance.now();
      const dtPtr = Math.max(1, now - lastPointerTime);
      const deltaY = lastPointerY - e.clientY;
      pointerVelocity = (deltaY / dtPtr) * 0.00020;
      lastPointerY = e.clientY;
      lastPointerTime = now;

      const state = sceneStateRef.current;
      state.lastScrollTime = now;
      state.isSnapping = false;
      state.targetProgress = Math.max(0, Math.min(1, state.targetProgress + deltaY * 0.00032));
    };

    const handlePointerUp = () => {
      if (isPointerDown) {
        isPointerDown = false;
        const state = sceneStateRef.current;
        if (Math.abs(pointerVelocity) > 0.0001) {
          state.targetVelocity = Math.max(-0.004, Math.min(0.004, pointerVelocity * 4));
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (sceneStateRef.current.doorState !== "opened" || sceneStateRef.current.isLightingSequence) {
        if (e.key === "Enter" || e.key === " ") {
          if (sceneStateRef.current.doorState === "ready") {
            triggerOpenDoorRef.current();
          }
        }
        return;
      }
      const state = sceneStateRef.current;
      if (
        e.key === "ArrowDown" ||
        e.key === "ArrowRight" ||
        e.key === "PageDown" ||
        e.key === " "
      ) {
        e.preventDefault();
        state.isSnapping = false;
        state.lastScrollTime = performance.now();
        state.targetProgress = Math.min(1, state.targetProgress + 0.016);
      } else if (
        e.key === "ArrowUp" ||
        e.key === "ArrowLeft" ||
        e.key === "PageUp"
      ) {
        e.preventDefault();
        state.isSnapping = false;
        state.lastScrollTime = performance.now();
        state.targetProgress = Math.max(0, state.targetProgress - 0.016);
      }
    };

    // Attach listeners to window
    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("keydown", handleKeyDown);

    // Development / automated inspection helper
    (window as any).__setMansionProgress = (prog: number) => {
      if (doorTimelineRef.current) {
        doorTimelineRef.current.kill();
      }
      if (lightingTimelineRef.current) {
        lightingTimelineRef.current.kill();
      }
      const state = sceneStateRef.current;
      gsap.killTweensOf(state);
      const dRefs = doorAnimationRef.current;
      gsap.killTweensOf(dRefs.cameraPos);
      gsap.killTweensOf(dRefs.cameraLook);
      state.isSnapping = false;
      state.doorState = "opened";
      state.isLightingSequence = false;
      setIsLightingSequence(false);
      if (doorAnimationRef.current.doorGroup) {
        doorAnimationRef.current.doorGroup.visible = false;
      }
      hallwayGroup.visible = true;
      if (chamber1Group) chamber1Group.visible = true;
      if (chamber2Group) chamber2Group.visible = true;
      if (chamber3Group) chamber3Group.visible = true;
      if (chamber4Group) chamber4Group.visible = true;
      if (chamber5Group) chamber5Group.visible = true;
      if (chamber6Group) chamber6Group.visible = true;
      snapAllLightsToFull();
      warmUpGPU();
      setIsDoorOpen(true);
      setDoorState("opened");
      state.targetProgress = THREE.MathUtils.clamp(prog, 0, 1);
      state.currentProgress = THREE.MathUtils.clamp(prog, 0, 1);
      state.lastScrollTime = Date.now() + 60000; // prevent immediate snap during inspection
    };

    (window as any).__triggerOpenDoor = () => triggerOpenDoorRef.current();
    (window as any).__triggerSkipDoor = () => triggerSkipDoorRef.current();
    (window as any).__getLightingState = () => ({
      isLightingSequence: sceneStateRef.current.isLightingSequence,
      doorState: sceneStateRef.current.doorState,
      introComplete: sceneStateRef.current.introComplete,
      currentProgress: sceneStateRef.current.currentProgress,
      targetProgress: sceneStateRef.current.targetProgress,
      mainSunIntensity: mainSun.intensity,
      fillSunIntensity: fillSun.intensity,
      ceilingUpLightIntensity: ceilingUpLight.intensity,
      hemiLightIntensity: hemiLight.intensity,
      doorTimelineProgress: doorTimelineRef.current ? doorTimelineRef.current.progress() : 0,
      lightingTimelineProgress: lightingTimelineRef.current ? lightingTimelineRef.current.progress() : 0,
    });

    (window as any).__switchChamberArtwork = (chamberId: string, artworkId: string) => {
      const list = EXHIBITION_CATALOG[chamberId] || [];
      const art = list.find((a) => a.id === artworkId);
      if (art) {
        handleSelectArtwork(chamberId, art);
      }
    };

    // Expose debug hooks for performance diagnostic profiling
    (window as any).__debugRenderer = renderer;
    (window as any).__debugScene = scene;

    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth || window.innerWidth;
      const h = mountRef.current.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      const currentDpr = Math.min(window.devicePixelRatio || 1, 1.0);
      renderer.setPixelRatio(currentDpr);
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // --- 12. ANIMATION RAF LOOP (BUTTER-SMOOTH HARDWARE WEBGL) ---
    let reqId: number;
    const startTime = performance.now();
    let lastFrameTime = performance.now();
    let avgFrameTime = 16.6;
    let frameCount = 0;
    const targetDpr = Math.min(window.devicePixelRatio || 1, 1.0);
    let activeDpr = targetDpr;

    const renderLoop = () => {
      reqId = requestAnimationFrame(renderLoop);
      const currentTime = performance.now();
      const rawDt = (currentTime - lastFrameTime) * 0.001;
      const dt = Math.min(rawDt, 0.05);
      lastFrameTime = currentTime;
      avgFrameTime = avgFrameTime * 0.92 + (rawDt * 1000) * 0.08;
      frameCount++;

      // Adaptive DPR scaling: drops resolution on struggling hardware, smoothly recovers when free
      if (frameCount % 45 === 0) {
        if (avgFrameTime > 20.0 && activeDpr > 1.0) {
          activeDpr = Math.max(1.0, activeDpr - 0.15);
          renderer.setPixelRatio(activeDpr);
        } else if (avgFrameTime < 14.0 && activeDpr < targetDpr) {
          activeDpr = Math.min(targetDpr, activeDpr + 0.10);
          renderer.setPixelRatio(activeDpr);
        }
      }

      const elapsed = (currentTime - startTime) * 0.001;
      const state = sceneStateRef.current;

      // Smooth mouse tilt parallax with physical damping
      const tiltAlpha = 1.0 - Math.exp(-8.0 * dt);
      state.tilt.x += (state.targetTilt.x - state.tilt.x) * tiltAlpha;
      state.tilt.y += (state.targetTilt.y - state.tilt.y) * tiltAlpha;

      if (state.doorState !== "opened") {
        const dRefs = doorAnimationRef.current;

        // Spatial culling: hide hallwayGroup and all 6 chambers while at the door
        if (state.doorState === "loading" || state.doorState === "ready") {
          if (hallwayGroup.visible) hallwayGroup.visible = false;
        }
        if (chamber1Group && chamber1Group.visible) chamber1Group.visible = false;
        if (chamber2Group && chamber2Group.visible) chamber2Group.visible = false;
        if (chamber3Group && chamber3Group.visible) chamber3Group.visible = false;
        if (chamber4Group && chamber4Group.visible) chamber4Group.visible = false;
        if (chamber5Group && chamber5Group.visible) chamber5Group.visible = false;
        if (chamber6Group && chamber6Group.visible) chamber6Group.visible = false;

        // Subtle ambient breathing pulse on the door crack while closed
        if (state.doorState === "loading" || state.doorState === "ready") {
          if (dRefs.crackSlit) {
            (dRefs.crackSlit.material as THREE.MeshBasicMaterial).opacity =
              0.70 + 0.25 * Math.sin(elapsed * 2.5);
          }
          if (dRefs.floorSpill) {
            (dRefs.floorSpill.material as THREE.MeshBasicMaterial).opacity =
              0.35 + 0.15 * Math.sin(elapsed * 2.5);
          }
        }

        camera.position.set(
          dRefs.cameraPos.x + state.tilt.x * 0.15,
          dRefs.cameraPos.y + state.tilt.y * 0.12,
          dRefs.cameraPos.z
        );
        camera.lookAt(dRefs.cameraLook.x, dRefs.cameraLook.y, dRefs.cameraLook.z);
      } else {
        // --- BUTTER-SMOOTH KINETIC GLIDE MOMENTUM ---
        // 1. Silky friction decay on flick velocity
        const friction = Math.pow(0.85, dt * 60);
        state.targetVelocity *= friction;
        if (Math.abs(state.targetVelocity) < 0.00001) {
          state.targetVelocity = 0;
        }

        // 2. Accumulate flick velocity into targetProgress
        if (state.targetVelocity !== 0) {
          state.targetProgress = Math.max(0, Math.min(1, state.targetProgress + state.targetVelocity));
        }

        // 3. Magnetic Gentle Hero Latch (only when user has completely paused for > 1.2s near a hero view)
        const timeSinceScroll = currentTime - state.lastScrollTime;
        if (!isPointerDown && timeSinceScroll > 1200 && Math.abs(state.targetVelocity) < 0.0001) {
          for (const ch of CHAMBER_DATA) {
            const dist = ch.heroProgress - state.targetProgress;
            if (Math.abs(dist) < 0.020) {
              const magneticPull = dist * (1.0 - Math.exp(-3.0 * dt));
              state.targetProgress += magneticPull;
              break;
            }
          }
        }

        // 4. Critically damped buttery camera glide toward targetProgress
        // followSpeed = 9.0 provides responsive tracking and silky, cushioned steadycam deceleration
        const cameraAlpha = 1.0 - Math.exp(-9.0 * dt);
        state.currentProgress += (state.targetProgress - state.currentProgress) * cameraAlpha;
        const p = Math.max(0, Math.min(1, state.currentProgress));

        // Spatial chamber geometry culling: each chamber is strictly rendered only when visible through portal/entrance
        const c1Vis = p >= 0.05 && p <= 0.23;
        const c2Vis = p >= 0.24 && p <= 0.40;
        const c3Vis = p >= 0.41 && p <= 0.57;
        const c4Vis = p >= 0.58 && p <= 0.74;
        const c5Vis = p >= 0.75 && p <= 0.91;
        const c6Vis = p >= 0.92 && p <= 1.00;

        if (chamber1Group && chamber1Group.visible !== c1Vis) chamber1Group.visible = c1Vis;
        if (chamber2Group && chamber2Group.visible !== c2Vis) chamber2Group.visible = c2Vis;
        if (chamber3Group && chamber3Group.visible !== c3Vis) chamber3Group.visible = c3Vis;
        if (chamber4Group && chamber4Group.visible !== c4Vis) chamber4Group.visible = c4Vis;
        if (chamber5Group && chamber5Group.visible !== c5Vis) chamber5Group.visible = c5Vis;
        if (chamber6Group && chamber6Group.visible !== c6Vis) chamber6Group.visible = c6Vis;

        (window as any).__currentProgress = p;

        // Direct DOM progress bar and indicator updates - 0 React re-renders during 60FPS scroll
        const pct = Math.round(p * 100);
        if (progressLineRef.current) {
          progressLineRef.current.style.width = `${pct}%`;
        }
        if (progressTextRef.current) {
          progressTextRef.current.textContent = `${pct}%`;
        }

        const { pos: targetPos, look: targetLook } = getCameraTrajectory(p);

        camera.position.set(
          targetPos.x + state.tilt.x,
          targetPos.y + state.tilt.y,
          targetPos.z
        );
        camera.lookAt(targetLook.x, targetLook.y, targetLook.z);

        // --- POOLED DYNAMIC CHAMBER LIGHT STEERING ---
        if (activeChamberSpot && activeChandelierLight) {
          let bestCh = CHAMBER_LIGHTS[0];
          let bestDist = Math.abs(p - bestCh.heroP);
          for (let i = 1; i < CHAMBER_LIGHTS.length; i++) {
            const d = Math.abs(p - CHAMBER_LIGHTS[i].heroP);
            if (d < bestDist) {
              bestDist = d;
              bestCh = CHAMBER_LIGHTS[i];
            }
          }
          const prox = Math.max(0.20, 1.0 - Math.min(1.0, bestDist / 0.09));
          activeChamberSpot.position.set(bestCh.spotPos[0], bestCh.spotPos[1], bestCh.spotPos[2]);
          activeChamberSpot.target.position.set(bestCh.spotTarget[0], bestCh.spotTarget[1], bestCh.spotTarget[2]);
          activeChamberSpot.color.setHex(bestCh.spotColor);
          activeChamberSpot.intensity = bestCh.spotIntensity * prox;

          activeChandelierLight.position.set(bestCh.chPos[0], bestCh.chPos[1], bestCh.chPos[2]);
          activeChandelierLight.color.setHex(bestCh.chColor);
          activeChandelierLight.intensity = bestCh.chIntensity * prox;
          activeChandelierLight.distance = bestCh.chDist;
        }

        // Dedicated Chamber 3 Diya Light
        if (sanctumDiyaLight) {
          if (p >= 0.42 && p <= 0.56) {
            const flameNoise = Math.sin(elapsed * 14) * Math.cos(elapsed * 9);
            sanctumDiyaLight.intensity = 0.85 + flameNoise * 0.20;
          } else {
            sanctumDiyaLight.intensity = 0.0;
          }
        }

        // --- CHAMBER-SPECIFIC AMBIENT ANIMATIONS ---
        if (p >= 0.10 && p <= 0.22 && grandDustPoints) {
          grandDustPoints.rotation.y = elapsed * 0.04;
          grandDustPoints.position.y = Math.sin(elapsed * 0.5) * 0.04;
        } else if (p >= 0.27 && p <= 0.39) {
          if (versaceDustPoints) {
            versaceDustPoints.rotation.y = elapsed * 0.035;
            versaceDustPoints.position.y = Math.sin(elapsed * 0.4) * 0.03;
          }
        } else if (p >= 0.44 && p <= 0.56) {
          const flameNoise = Math.sin(elapsed * 14) * Math.cos(elapsed * 9);
          if (sanctumFlameMesh) {
            sanctumFlameMesh.scale.set(
              1 + flameNoise * 0.15,
              1 + Math.abs(flameNoise) * 0.25,
              1 + flameNoise * 0.15
            );
          }
          if (incenseParticles) {
            incenseParticles.rotation.y = elapsed * 0.05;
            incenseParticles.position.y = Math.sin(elapsed * 0.7) * 0.03;
          }
        }

        // Far-End Focal Masterpiece Ambient Animation (Hallway view)
        if (
          focalSculptureGroup &&
          (p < 0.10 ||
            (p > 0.22 && p < 0.28) ||
            (p > 0.39 && p < 0.45) ||
            (p > 0.56 && p < 0.62) ||
            (p > 0.73 && p < 0.79) ||
            (p > 0.90 && p < 0.95))
        ) {
          focalSculptureGroup.rotation.y = elapsed * 0.18;
          focalSculptureGroup.rotation.x = Math.sin(elapsed * 0.4) * 0.1;
        }

        // Check Chamber HUD visibility
        let matchingChamber: ChamberInfo | null = null;
        let opacity = 0;
        for (const ch of CHAMBER_DATA) {
          const dist = Math.abs(p - ch.heroProgress);
          if (dist <= 0.045) {
            matchingChamber = ch;
            opacity = Math.max(0, 1 - dist / 0.045);
            break;
          }
        }
        const matchId = matchingChamber ? matchingChamber.id : null;
        if (matchId !== currentChamberIdRef.current) {
          currentChamberIdRef.current = matchId;
          setActiveChamber(matchingChamber);
        }

        if (hudRef.current) {
          hudRef.current.style.opacity = `${opacity}`;
          hudRef.current.style.transform = `translate3d(0, ${(1 - opacity) * 30}px, 0)`;
          hudRef.current.style.pointerEvents = opacity > 0.1 ? "auto" : "none";
        }
      }
      // Direct high-performance WebGL hardware render (0 compositor overhead, 60+ FPS lock)
      renderer.render(scene, camera);
    };

    renderLoop();

    return () => {
      cancelAnimationFrame(reqId);
      clearTimeout(safetyTimer);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
      delete (window as any).__setMansionProgress;
      delete (window as any).__switchChamberArtwork;
      document.body.classList.remove("cinematic-active");

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-screen bg-[#ebe2d6] text-[#2c2621] overflow-hidden select-none">
      {/* 1. THREE.JS WEBGL CANVAS CONTAINER */}
      <div ref={mountRef} className="absolute inset-0 z-0 cursor-grab active:cursor-grabbing" />

      {/* 2. SUBTLE FILM NOISE OVERLAY */}
      <div className="webgl__noise pointer-events-none opacity-20" />

      {/* 3. LIGHT LUXURY WARM VIGNETTES (NO HARSH BLACK CUTS) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/15 pointer-events-none z-10" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/25 via-transparent to-black/15 pointer-events-none z-10" />

      {/* 4. TOP LUXURY HEADER */}
      <header className="fixed top-0 left-0 w-full z-40 py-6 px-8 md:px-16 flex items-center justify-between pointer-events-none">
        <div
          className="pointer-events-auto flex flex-col items-start cursor-pointer group"
          onClick={() => flyToChamber(0)}
        >
          <span className="font-serif text-xl md:text-2xl tracking-[0.25em] text-[#1e1915] group-hover:text-[#b8975a] transition-colors uppercase font-medium">
            Gopal Lahoti
          </span>
          <span className="text-[9px] uppercase font-mono tracking-[0.35em] text-[#b8975a] font-semibold">
            House of Interiors
          </span>
        </div>

        <div className="pointer-events-auto flex items-center space-x-6">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-3 rounded-full border border-[#b8975a]/40 hover:border-[#b8975a] text-[#3d332a] hover:text-[#b8975a] transition-all bg-[#f5ede3] cursor-pointer shadow-md"
            title={isMuted ? "Unmute Ambient Sound" : "Mute Sound"}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>
      </header>

      {/* 4.5 GRAND ENTRANCE DOOR OPENING SEQUENCE OVERLAY */}
      {!doorUIHidden && !isDoorOpen && (
        <div
          className={`absolute inset-0 z-30 pointer-events-none flex flex-col justify-between p-8 md:p-14 select-none transition-opacity duration-300 ease-out ${
            doorUIFading ? "opacity-0 pointer-events-none" : "opacity-100 animate-fadeIn"
          }`}
        >
          {/* Center Call To Action */}
          <div className="flex flex-col items-center justify-center my-auto text-center pointer-events-auto">
            {/* Luxury Estate Badge */}
            <div className="flex items-center space-x-2 px-4 py-1.5 rounded-full border border-[#b8975a]/30 bg-[#161210]/95 shadow-lg mb-6">
              <Sparkles size={12} className="text-[#e5c38c]" />
              <span className="text-[10px] uppercase font-mono tracking-[0.3em] text-[#e5c38c] font-medium">
                Grand Private Estate
              </span>
            </div>
            {/* Animated Brass Door Knocker / Medallion */}
            <div
              onClick={() => {
                if (doorState === "ready") triggerOpenDoorRef.current();
              }}
              className={`relative mb-6 cursor-pointer group ${
                doorState === "ready" ? "cursor-pointer" : "cursor-default"
              }`}
            >
              <div className="w-20 h-20 md:w-22 md:h-22 rounded-full border-2 border-[#b8975a]/60 flex flex-col items-center justify-center bg-[#191411]/95 shadow-[0_0_35px_rgba(184,151,90,0.45)] group-hover:shadow-[0_0_60px_rgba(229,195,140,0.85)] group-hover:border-[#e5c38c] transition-all duration-500">
                <div className="w-14 h-14 rounded-full border border-[#e5c38c]/40 flex items-center justify-center relative">
                  <span className="font-serif text-[#e5c38c] text-lg font-bold tracking-widest group-hover:scale-110 transition-transform">
                    GL
                  </span>
                  {/* Subtle knocker ring at bottom */}
                  <div className="absolute -bottom-1 w-7 h-7 rounded-full border-2 border-[#e5c38c]/70 group-hover:translate-y-1 transition-transform" />
                </div>
              </div>
              {doorState === "ready" && (
                <div
                  className="absolute -inset-2 rounded-full border border-[#e5c38c]/40 animate-ping opacity-30 pointer-events-none"
                  style={{ animationDuration: "2.8s" }}
                />
              )}
            </div>

            {/* Ready State CTA Button */}
            {doorState === "loading" && (
              <div className="flex items-center space-x-3 px-8 py-3.5 rounded-full border border-[#b8975a]/40 bg-[#181412]/90 text-[#f5eee6] font-serif tracking-[0.25em] text-xs uppercase shadow-2xl">
                <span className="w-2 h-2 rounded-full bg-[#b8975a] animate-ping" />
                <span>Preparing Residence...</span>
              </div>
            )}

            {(doorState === "ready" || doorState === "opening") && (
              <button
                onClick={() => {
                  if (doorState === "ready") triggerOpenDoorRef.current();
                }}
                disabled={doorState === "opening"}
                className={`group pointer-events-auto flex items-center space-x-4 px-10 py-4 rounded-full border transition-all duration-500 shadow-2xl ${
                  doorState === "opening"
                    ? "border-[#e5c38c] bg-[#2a2119] text-[#fff6e6] scale-105 shadow-[0_0_60px_rgba(229,195,140,0.8)]"
                    : "border-[#b8975a]/60 hover:border-[#ffe8a8] bg-[#1a1410]/95 hover:bg-[#271e17] text-[#fbf6ed] hover:text-white shadow-[0_0_35px_rgba(184,151,90,0.35)] hover:shadow-[0_0_55px_rgba(229,195,140,0.65)] hover:scale-[1.03] cursor-pointer"
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#e5c38c] group-hover:scale-125 transition-transform shadow-[0_0_8px_#e5c38c]" />
                <span className="font-serif tracking-[0.28em] text-xs md:text-sm uppercase">
                  {doorState === "opening" ? "Unlocking Sanctuary..." : "Enter the Residence"}
                </span>
                <span className="text-[#e5c38c] text-sm group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </button>
            )}

            <p className="text-[11px] font-mono tracking-[0.3em] uppercase text-[#d4c3b2]/70 mt-5">
              A Curated Odyssey of Interior Architecture
            </p>
          </div>

          {/* Bottom Bar: Audio Atmosphere Note & Skip Option */}
          <div className="flex items-center justify-between pointer-events-auto pt-4">
            <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-[#d4c3b2]/50 hidden sm:inline">
              Audio Atmosphere Enabled
            </span>
            <button
              onClick={() => triggerSkipDoorRef.current()}
              className="text-[10px] font-mono tracking-[0.28em] uppercase text-[#d4c3b2]/70 hover:text-[#e5c38c] transition-all py-2 px-5 rounded-full border border-white/10 hover:border-[#b8975a]/50 bg-[#181412]/90 hover:bg-black/95 cursor-pointer ml-auto"
            >
              Skip Intro →
            </button>
          </div>
        </div>
      )}

      {/* 5. DECOUPLED ROOM HUD OVERLAYS (FADES IN UPON CHAMBER ARRIVAL) */}
      {activeChamber && (
        <div
          ref={hudRef}
          className="absolute left-8 md:left-16 top-20 md:top-24 z-30 max-w-lg pointer-events-none transition-all duration-300 ease-out"
          style={{
            opacity: 0,
            transform: "translate3d(0, 30px, 0)",
          }}
        >
          <div className="inline-flex items-center space-x-3 mb-3 px-3.5 py-1 rounded-full bg-[#241f1b]/95 border border-[#b8975a]/30">
            <span className="text-[11px] font-mono tracking-[0.35em] uppercase text-[#e5c38c] font-medium">
              {activeChamber.chapterNum}
            </span>
            <span className="w-5 h-[1px] bg-[#e5c38c]/50" />
            <span className="text-[11px] tracking-[0.2em] uppercase text-white/80 font-light">
              {activeChamber.location}
            </span>
          </div>

          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl tracking-tight text-[#ffffff] leading-[0.95] mb-3 font-light uppercase drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
            {activeChamber.title1}
            <br />
            <span className="italic font-normal text-white/95">{activeChamber.title2}</span>
          </h1>

          <p className="text-xs md:text-sm text-white/90 font-light tracking-wide max-w-md mb-4 leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)] bg-[#1e1915]/90 p-3 rounded-xl border border-white/10">
            {activeChamber.subtitle}
          </p>

          <div className="flex flex-wrap items-center gap-2.5 mb-4">
            <button
              onClick={() => setShowSpecs(true)}
              className="pointer-events-auto inline-flex items-center space-x-2 text-[11px] tracking-[0.2em] uppercase text-[#fdfbf7] hover:text-[#181410] px-4 py-2.5 border border-[#b8975a]/50 hover:border-[#b8975a] rounded-full bg-[#241f1b]/95 hover:bg-[#b8975a] transition-all duration-300 group cursor-pointer shadow-xl font-medium"
            >
              <span>Chamber Details</span>
              <ChevronRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </button>

            {EXHIBITION_CATALOG[activeChamber.id] && EXHIBITION_CATALOG[activeChamber.id].length > 0 && (
              <button
                onClick={() => setInspectedArtwork(EXHIBITION_CATALOG[activeChamber.id][0])}
                className="pointer-events-auto inline-flex items-center space-x-2 text-[11px] tracking-[0.2em] uppercase text-[#e5c38c] hover:text-[#181410] px-4 py-2.5 border border-[#e5c38c]/40 hover:border-[#e5c38c] rounded-full bg-[#1e1915]/95 hover:bg-[#e5c38c] transition-all duration-300 group cursor-pointer shadow-xl font-medium"
              >
                <Layers size={13} className="text-[#e5c38c] group-hover:text-[#181410] transition-colors" />
                <span>Wall Gallery (5 Works)</span>
              </button>
            )}
          </div>

          {/* Interactive Curated Wall Artwork Strip */}
          {EXHIBITION_CATALOG[activeChamber.id] && (
            <div className="pointer-events-auto bg-[#181412]/95 border border-[#b8975a]/40 rounded-2xl p-3.5 shadow-2xl max-w-md">
              <div className="flex items-center justify-between mb-2.5 text-[10px] font-mono tracking-[0.25em] uppercase text-[#e5c38c]">
                <span className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#e5c38c] animate-pulse" />
                  <span>Curated Wall Installations</span>
                </span>
                <span className="text-white/60">Click to Change Wall Art</span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {EXHIBITION_CATALOG[activeChamber.id].map((art, idx) => {
                  const isSelected = activeArtworks[activeChamber.id] === art.id;
                  return (
                    <button
                      key={art.id}
                      onClick={() => handleSelectArtwork(activeChamber.id, art)}
                      className={`group relative aspect-[4/3] rounded-lg overflow-hidden border transition-all duration-300 cursor-pointer shadow-md bg-black/40 ${
                        isSelected
                          ? "border-[#e5c38c] ring-2 ring-[#e5c38c] shadow-[0_0_15px_rgba(229,195,140,0.75)] scale-105"
                          : "border-white/20 hover:border-[#e5c38c]/70 hover:scale-105"
                      }`}
                      title={`Change wall artwork to: ${art.title} - ${art.project}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={art.thumbnail || art.image.replace("/assets/exhibition/", "/assets/exhibition/thumbs/")}
                        alt={art.title}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div
                        className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent transition-opacity ${
                          isSelected ? "opacity-15" : "opacity-60 group-hover:opacity-10"
                        }`}
                      />
                      {isSelected && (
                        <span className="absolute top-1 left-1 w-2 h-2 rounded-full bg-[#e5c38c] shadow-[0_0_6px_#e5c38c]" />
                      )}
                      <span
                        className={`absolute bottom-1 right-1 text-[8px] font-mono px-1 rounded transition-colors ${
                          isSelected ? "text-black bg-[#e5c38c] font-bold" : "text-white/90 bg-black/70"
                        }`}
                      >
                        0{idx + 1}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 6. HALLWAY SCROLL HINT */}
      {!activeChamber && isDoorOpen && !isLightingSequence && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 text-center pointer-events-none animate-pulse">
          <div className="flex flex-col items-center space-y-2 px-5 py-2.5 rounded-full bg-[#fbf8f2]/95 border border-[#b8975a]/30 shadow-md pointer-events-none">
            <Compass size={18} className="text-[#b8975a] animate-spin" style={{ animationDuration: "12s" }} />
            <span className="text-[10px] uppercase font-mono tracking-[0.35em] text-[#3d3227] font-semibold">
              Scroll to Glide Through Mansion
            </span>
          </div>
        </div>
      )}

      {/* 6b. ILLUMINATION WAVE SKIP INTRO BUTTON */}
      {isLightingSequence && (
        <div className="fixed top-8 right-8 z-50 pointer-events-auto animate-fadeIn">
          <button
            onClick={() => triggerSkipDoorRef.current()}
            className="text-[10px] font-mono tracking-[0.28em] uppercase text-[#e5c38c] hover:text-white transition-all py-2 px-5 rounded-full border border-[#b8975a]/50 bg-[#181412]/90 hover:bg-black/95 cursor-pointer shadow-xl flex items-center space-x-2"
          >
            <span>Skip Intro</span>
            <span>→</span>
          </button>
        </div>
      )}

      {/* 7. FIXED BOTTOM NAVIGATION BAR */}
      {isDoorOpen && !isLightingSequence && (
        <nav className="fixed bottom-0 left-0 w-full z-40 py-5 px-8 md:px-16 flex flex-col md:flex-row items-center justify-between border-t border-[#b8975a]/30 bg-[#1a1614]/98 pointer-events-none shadow-2xl animate-fadeIn">
          {/* Continuous Gold Scroll Progress Line */}
          <div className="absolute top-0 left-0 w-full h-[3px] bg-black/40 pointer-events-none">
            <div
              ref={progressLineRef}
              className="h-full bg-gradient-to-r from-[#b8975a] via-[#e5c38c] to-[#fff3d4] transition-all duration-75 ease-out shadow-[0_0_8px_rgba(184,151,90,0.8)]"
              style={{ width: "0%" }}
            />
          </div>

          {/* Room Navigation Links */}
          <div className="pointer-events-auto flex items-center space-x-6 md:space-x-10 text-[11px] font-mono tracking-[0.25em] uppercase text-neutral-400">
            {CHAMBER_DATA.map((ch) => {
              const isCurrent = activeChamber?.id === ch.id;
              return (
                <button
                  key={ch.id}
                  onClick={() => flyToChamber(ch.heroProgress)}
                  className={`transition-colors duration-300 flex items-center space-x-2 py-1 ${
                    isCurrent
                      ? "text-[#e5c38c] font-semibold"
                      : "hover:text-[#fbf8f2] text-neutral-400"
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full transition-colors"
                    style={{ backgroundColor: isCurrent ? "#e5c38c" : "rgba(255,255,255,0.25)" }}
                  />
                  <span>
                    {ch.chapterNum.split("/")[0]} {ch.title1}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Global Progress Indicator */}
          <div className="hidden md:flex items-center space-x-3 text-[10px] font-mono tracking-[0.25em] text-[#d4c3b2]">
            <span>SPATIAL PROGRESS</span>
            <span ref={progressTextRef} className="text-[#e5c38c] font-semibold">0%</span>
          </div>
        </nav>
      )}

      {/* 8. ARCHITECTURAL SPECIFICATIONS DRAWER MODAL */}
      {showSpecs && activeChamber && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-md transition-all duration-500">
          <div className="relative w-full max-w-xl h-full bg-[#181513] border-l border-[#b8975a]/30 p-8 md:p-14 flex flex-col justify-between overflow-y-auto animate-slideLeft text-[#f4efe8]">
            <div>
              <div className="flex items-center justify-between pb-8 border-b border-white/10">
                <span className="text-xs font-mono tracking-[0.3em] uppercase text-[#b8975a] font-semibold">
                  {activeChamber.chapterNum} Specification
                </span>
                <button
                  onClick={() => setShowSpecs(false)}
                  className="p-2.5 rounded-full border border-white/20 hover:border-[#b8975a] text-white hover:text-[#b8975a] transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="py-8">
                <span className="text-[11px] font-mono tracking-[0.25em] text-white/50 uppercase block mb-2">
                  {activeChamber.location} · {activeChamber.sqft}
                </span>
                <h2 className="font-serif text-3xl md:text-4xl text-[#fdfbf7] uppercase tracking-wide mb-6">
                  {activeChamber.title1} {activeChamber.title2}
                </h2>
                <p className="text-neutral-300 font-light leading-relaxed text-sm md:text-base mb-8">
                  {activeChamber.specs.description}
                </p>

                {/* Materials */}
                <div className="mb-8">
                  <h3 className="text-xs font-mono tracking-[0.25em] uppercase text-[#b8975a] mb-4 font-semibold">
                    Specified Materials
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {activeChamber.specs.materials.map((mat, i) => (
                      <span
                        key={i}
                        className="px-3.5 py-1.5 rounded-full text-xs font-mono tracking-wider border border-[#b8975a]/30 bg-[#2b241e] text-[#f4ede3]"
                      >
                        {mat}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Architectural Features */}
                <div>
                  <h3 className="text-xs font-mono tracking-[0.25em] uppercase text-[#b8975a] mb-4 font-semibold">
                    Architectural Systems
                  </h3>
                  <ul className="space-y-3">
                    {activeChamber.specs.details.map((det, i) => (
                      <li
                        key={i}
                        className="flex items-center space-x-3 text-xs md:text-sm text-neutral-300 font-light"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#b8975a]" />
                        <span>{det}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-white/10 flex items-center justify-between">
              <span className="text-[11px] font-mono tracking-widest text-[#b8975a] font-semibold">
                PORTFOLIO ARCHIVE
              </span>
              <button
                onClick={() => setShowSpecs(false)}
                className="text-xs tracking-[0.2em] uppercase text-white hover:text-[#b8975a] transition-colors cursor-pointer font-medium"
              >
                Return to Walkthrough →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8.5 ARTWORK EXHIBITION INSPECTION MODAL */}
      {inspectedArtwork && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10 bg-black/85 backdrop-blur-xl animate-fadeIn text-[#f4efe8]">
          <div className="relative w-full max-w-6xl max-h-[92vh] bg-[#161311] border border-[#b8975a]/40 rounded-2xl shadow-[0_0_60px_rgba(0,0,0,0.9)] flex flex-col lg:flex-row overflow-hidden">
            {/* Close Button */}
            <button
              onClick={() => setInspectedArtwork(null)}
              className="absolute top-5 right-5 z-20 p-2.5 rounded-full bg-black/60 hover:bg-[#b8975a] border border-white/20 hover:border-[#b8975a] text-white hover:text-black transition-all cursor-pointer shadow-lg"
              title="Close Artwork Viewer"
            >
              <X size={18} />
            </button>

            {/* Left Column: Museum Framed Photograph View */}
            <div className="lg:w-3/5 bg-[#0e0c0b] p-6 md:p-10 flex flex-col items-center justify-center relative overflow-hidden border-b lg:border-b-0 lg:border-r border-[#b8975a]/20">
              <div className="relative group max-h-[60vh] max-w-full flex items-center justify-center">
                {/* Museum Outer Gold Frame & Bevel Mat */}
                <div className="p-3 bg-gradient-to-br from-[#d4af37] via-[#94763e] to-[#423114] rounded-lg shadow-2xl">
                  <div className="p-4 md:p-6 bg-[#f7f3ec] rounded shadow-inner">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={inspectedArtwork.image}
                      alt={inspectedArtwork.title}
                      className="max-h-[48vh] w-auto max-w-full object-contain rounded shadow-md"
                    />
                  </div>
                </div>
              </div>

              {/* Artwork Navigation Controls */}
              <div className="flex items-center justify-between w-full mt-6 pt-4 border-t border-white/10 text-xs font-mono tracking-widest text-[#e5c38c]">
                {(() => {
                  const currentList = EXHIBITION_CATALOG[inspectedArtwork.chamberId] || [];
                  const currentIndex = currentList.findIndex((a) => a.id === inspectedArtwork.id);
                  const prevArt = currentList[(currentIndex - 1 + currentList.length) % currentList.length];
                  const nextArt = currentList[(currentIndex + 1) % currentList.length];

                  return (
                    <>
                      <button
                        onClick={() => setInspectedArtwork(prevArt)}
                        className="flex items-center space-x-2 text-white/70 hover:text-[#e5c38c] transition-colors cursor-pointer uppercase text-[11px]"
                      >
                        <ChevronLeft size={16} />
                        <span>Previous Work</span>
                      </button>

                      <span className="text-[11px] text-white/50 font-mono">
                        {currentIndex + 1} / {currentList.length}
                      </span>

                      <button
                        onClick={() => setInspectedArtwork(nextArt)}
                        className="flex items-center space-x-2 text-white/70 hover:text-[#e5c38c] transition-colors cursor-pointer uppercase text-[11px]"
                      >
                        <span>Next Work</span>
                        <ChevronRight size={16} />
                      </button>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Right Column: Architectural Narrative & Material Specifications */}
            <div className="lg:w-2/5 p-6 md:p-10 flex flex-col justify-between overflow-y-auto max-h-[60vh] lg:max-h-[92vh]">
              <div>
                {/* Project Badge & Location */}
                <div className="flex items-center space-x-2 text-xs font-mono tracking-[0.25em] text-[#e5c38c] uppercase mb-3">
                  <MapPin size={13} className="text-[#b8975a]" />
                  <span>{inspectedArtwork.location}</span>
                </div>

                <div className="text-[11px] font-mono tracking-[0.2em] text-white/50 uppercase mb-2">
                  {inspectedArtwork.project} · {inspectedArtwork.category}
                </div>

                {/* Monumental Title */}
                <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl text-[#fffdfa] uppercase tracking-wide leading-tight mb-5">
                  {inspectedArtwork.title}
                </h2>

                {/* Dimensions badge */}
                <div className="inline-block px-3 py-1 rounded border border-[#b8975a]/30 bg-[#241f1b] text-[10px] font-mono text-[#e5c38c] tracking-widest uppercase mb-6">
                  {inspectedArtwork.dimensions}
                </div>

                {/* Rich Architectural Description */}
                <div className="mb-6">
                  <h3 className="text-xs font-mono tracking-[0.25em] uppercase text-[#b8975a] font-semibold mb-3">
                    Architectural Narrative
                  </h3>
                  <p className="text-neutral-300 font-light leading-relaxed text-sm md:text-[15px]">
                    {inspectedArtwork.description}
                  </p>
                </div>

                {/* Specified Materials */}
                <div className="mb-6">
                  <h3 className="text-xs font-mono tracking-[0.25em] uppercase text-[#b8975a] font-semibold mb-3">
                    Curated Materials & Finishes
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {inspectedArtwork.materials.map((mat, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 rounded-full text-xs font-mono tracking-wider border border-[#b8975a]/30 bg-[#251e19] text-[#f4ede3]"
                      >
                        {mat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                <span className="text-[10px] font-mono tracking-widest text-[#b8975a] font-semibold">
                  GOPAL LAHOTI ARCHIVE
                </span>
                <button
                  onClick={() => setInspectedArtwork(null)}
                  className="text-xs tracking-[0.2em] uppercase text-white hover:text-[#b8975a] transition-colors cursor-pointer font-medium"
                >
                  Close & View in 3D →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 9. LUXURY PRELOADER SCREEN */}
      {isLoading && (
        <div className="fixed inset-0 z-50 bg-[#ebe2d6] flex flex-col items-center justify-center text-center p-8 transition-opacity duration-700">
          <div className="flex flex-col items-center max-w-sm w-full">
            <span className="font-serif text-3xl tracking-[0.3em] uppercase text-[#1e1915] mb-2 font-medium">
              Gopal Lahoti
            </span>
            <span className="text-[10px] uppercase font-mono tracking-[0.4em] text-[#b8975a] mb-12 font-semibold">
              House of Interiors
            </span>

            <div className="w-full h-[2px] bg-[#d9cbba] mb-4 overflow-hidden rounded-full">
              <div
                className="h-full bg-gradient-to-r from-[#b8975a] to-[#e5c38c] transition-all duration-300 ease-out"
                style={{ width: `${loadProgress}%` }}
              />
            </div>

            <div className="flex items-center justify-between w-full text-[10px] font-mono tracking-[0.3em] text-[#4d4033] font-medium">
              <span>ILLUMINATING ARCHITECTURE</span>
              <span>{loadProgress}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

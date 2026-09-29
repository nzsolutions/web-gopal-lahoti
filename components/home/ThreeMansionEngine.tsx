"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { Volume2, VolumeX, ChevronRight, ChevronLeft, X, Compass, Info, Layers, MapPin, Maximize2, DoorClosed, Sparkles } from "lucide-react";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
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
    chapterNum: "CHAMBER I/IV",
    title1: "GRAND",
    title2: "LIVING",
    subtitle: "Italian Black Marble & Double-Height Ambient Lounges",
    location: "Koregaon Park Estate, Pune",
    sqft: "5,400 SQ. FT.",
    heroProgress: 0.22,
    specs: {
      description:
        "A double-height living sanctuary defined by continuous Italian Nero Marquina black marble floors, monolithic coffee tables, bespoke beige modular sofa lounges, and layered sheer drapery.",
      materials: ["Italian Nero Marquina Marble", "Fluted Oak Millwork", "Italian Full-Grain Leather"],
      details: ["Circadian 2700K Cove Lighting", "Concealed HVAC Diffusers", "Acoustic Wall Panels"],
    },
  },
  {
    id: "versace",
    chapterNum: "CHAMBER II/IV",
    title1: "VERSACE",
    title2: "SUITE",
    subtitle: "Acoustic Oak Paneling & Tailored Leather Headboard",
    location: "Worli Sea Face, Mumbai",
    sqft: "850 SQ. FT.",
    heroProgress: 0.50,
    specs: {
      description:
        "An opulent master chamber clad in acoustic vertical fluted natural oak paneling with continuous Italian Nero Marquina black marble floors, an upholstered burgundy leather headboard, and designer drop pendant spotlights.",
      materials: ["Italian Nero Marquina Marble", "European White Oak", "Burgundy Italian Leather"],
      details: ["Integrated Bedside Dimmers", "Sound-Absorbing Backing", "Versace Silk Textiles"],
    },
  },
  {
    id: "sacred",
    chapterNum: "CHAMBER III/IV",
    title1: "SACRED",
    title2: "SANCTUM",
    subtitle: "Illuminated Onyx Halo & Gayatri Mantra Wall Art",
    location: "Amanora Park Town, Pune",
    sqft: "450 SQ. FT.",
    heroProgress: 0.72,
    specs: {
      description:
        "A contemporary spiritual sanctum featuring continuous Italian Nero Marquina black marble floors, laser-etched Sanskrit Gayatri Mantra wall typography, a glowing backlit halo deity backdrop, and fluted timber ceilings.",
      materials: ["Italian Nero Marquina Marble", "Translucent Acrylic Onyx", "Fluted Teakwood Ceiling"],
      details: ["Celestial Ambient Backlighting", "Floating Coral Cabinetry", "Mandala Wall Relief"],
    },
  },
  {
    id: "corporate",
    chapterNum: "CHAMBER IV/IV",
    title1: "CORPORATE",
    title2: "RECEPTION",
    subtitle: "Italian Black Marble & Sculptural Bronze Reception",
    location: "BKC Commercial Hub, Mumbai",
    sqft: "3,800 SQ. FT.",
    heroProgress: 0.94,
    specs: {
      description:
        "A commanding corporate entrance defined by monolithic Italian Nero Marquina black marble floors, a sculptural bronze reception counter, executive club seating, and fluted architectural glass.",
      materials: ["Italian Nero Marquina Marble", "Patinated Bronze Finish", "Burgundy Velvet Upholstery"],
      details: ["Sculptural Reception Counter", "Integrated Toe-Kick Glow", "Fluted Privacy Glass"],
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
  const [isMuted, setIsMuted] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);

  // Grand Entrance Door Opening Sequence State
  const [doorState, setDoorState] = useState<"loading" | "ready" | "opening" | "opened">("loading");
  const [isDoorOpen, setIsDoorOpen] = useState(false);

  const doorAnimationRef = useRef<{
    leftPivot: THREE.Group | null;
    rightPivot: THREE.Group | null;
    leftHandle: THREE.Group | null;
    rightHandle: THREE.Group | null;
    lightFlood: THREE.Mesh | null;
    crackSlit: THREE.Mesh | null;
    floorSpill: THREE.Mesh | null;
    doorBacker: THREE.Mesh | null;
    doorGroup: THREE.Group | null;
    cameraPos: THREE.Vector3;
    cameraLook: THREE.Vector3;
  }>({
    leftPivot: null,
    rightPivot: null,
    leftHandle: null,
    rightHandle: null,
    lightFlood: null,
    crackSlit: null,
    floorSpill: null,
    doorBacker: null,
    doorGroup: null,
    cameraPos: new THREE.Vector3(0, 2.85, 14.5),
    cameraLook: new THREE.Vector3(0, 3.10, 8.2),
  });

  const triggerOpenDoorRef = useRef<() => void>(() => {});
  const triggerSkipDoorRef = useRef<() => void>(() => {});

  const sceneStateRef = useRef<{
    targetProgress: number;
    currentProgress: number;
    lastScrollTime: number;
    isSnapping: boolean;
    tilt: { x: number; y: number };
    targetTilt: { x: number; y: number };
    doorState: "loading" | "ready" | "opening" | "opened";
  }>({
    targetProgress: 0,
    currentProgress: 0,
    lastScrollTime: 0,
    isSnapping: false,
    tilt: { x: 0, y: 0 },
    targetTilt: { x: 0, y: 0 },
    doorState: "loading",
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
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.0));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.10; // perfectly calibrated to prevent white blowout on marble floor
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // --- 2. TEXTURE LOADING MANAGER ---
    const loadingManager = new THREE.LoadingManager();
    loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
      setLoadProgress(Math.round((itemsLoaded / itemsTotal) * 100));
    };
    loadingManager.onLoad = () => {
      setTimeout(() => {
        setIsLoading(false);
        if (sceneStateRef.current.doorState === "loading") {
          sceneStateRef.current.doorState = "ready";
          setDoorState("ready");
        }
      }, 300);
    };
    loadingManager.onError = (url) => {
      console.warn("Texture load failed, continuing:", url);
      setIsLoading(false);
      if (sceneStateRef.current.doorState === "loading") {
        sceneStateRef.current.doorState = "ready";
        setDoorState("ready");
      }
    };
    // Fallback safety: ensure preloader is dismissed within 2s under all network conditions
    const safetyTimer = setTimeout(() => {
      setIsLoading(false);
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
    italianBlackMarbleTex.repeat.set(4, 24);
    italianBlackMarbleTex.colorSpace = THREE.SRGBColorSpace;

    // Pure Italian Black Marble Texture for All 4 Chambers (Seamlessly Connecting with Hallway Floor)
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
    runnerRugTex.repeat.set(1, 14); // Stately Persian palmette medallions
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
    const loadMural = (src: string) => {
      const t = textureLoader.load(src, (loaded) => {
        loaded.colorSpace = THREE.SRGBColorSpace;
        loaded.minFilter = THREE.LinearMipmapLinearFilter;
        loaded.magFilter = THREE.LinearFilter;
        loaded.generateMipmaps = true;
        loaded.needsUpdate = true;
      });
      t.colorSpace = THREE.SRGBColorSpace;
      t.minFilter = THREE.LinearMipmapLinearFilter;
      t.magFilter = THREE.LinearFilter;
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

    const allMuralTextures = [
      muralTex1, muralTex2, muralTex3, muralTex4,
      muralTex5, muralTex6, muralTex7, muralTex8,
      muralTex9, muralTex10, muralTex11, muralTex12,
      muralTex13, muralTex14, muralTex15, muralTex16,
    ];

    // Chamber Photography Renders
    const texGrand = loadMural("/assets/chambers/chamber1_grand.jpg");
    const texVersace = loadMural("/assets/chambers/chamber2_versace.jpg");
    const texSacred = loadMural("/assets/chambers/chamber3_sacred.jpg");
    const texCorporate = loadMural("/assets/chambers/chamber4_corporate.jpg");

    const texGrandDetail = loadMural("/assets/chambers/chamber1_detail.jpg");
    const texVersaceDetail = loadMural("/assets/chambers/chamber2_detail.jpg");
    const texSacredDetail = loadMural("/assets/chambers/chamber3_detail.jpg");
    const texCorporateDetail = loadMural("/assets/chambers/chamber4_detail.jpg");

    // Real Gopal Lahoti Portfolio Exhibition Wall Artworks
    const texCh1Living = loadMural("/assets/exhibition/ch1_living.jpg");
    const texCh1Dining = loadMural("/assets/exhibition/ch1_dining.jpg");
    const texCh1Parlour = loadMural("/assets/exhibition/ch1_parlour.jpg");
    const texCh1Lounge = loadMural("/assets/exhibition/ch1_lounge.jpg");
    const texCh1Media = loadMural("/assets/exhibition/ch1_media.jpg");

    const texCh2WoodBed = loadMural("/assets/exhibition/ch2_woodbed.jpg");
    const texCh2Bed1 = loadMural("/assets/exhibition/ch2_bed1.jpg");
    const texCh2Vanity = loadMural("/assets/exhibition/ch2_vanity.jpg");
    const texCh2Emerald = loadMural("/assets/exhibition/ch2_emerald.jpg");
    const texCh2Linear = loadMural("/assets/exhibition/ch2_linear.jpg");

    const texCh3Classic = loadMural("/assets/exhibition/ch3_mandir_classic.jpg");
    const texCh3Stone = loadMural("/assets/exhibition/ch3_stone_altar.jpg");
    const texCh3Courtyard = loadMural("/assets/exhibition/ch3_courtyard.jpg");
    const texCh3Foyer = loadMural("/assets/exhibition/ch3_foyer.jpg");
    const texCh3Portal = loadMural("/assets/exhibition/ch3_portal.jpg");

    const texCh4Boardroom = loadMural("/assets/exhibition/ch4_boardroom.jpg");
    const texCh4SkyLounge = loadMural("/assets/exhibition/ch4_skylounge.jpg");
    const texCh4Dining = loadMural("/assets/exhibition/ch4_dining.jpg");
    const texCh4Vip = loadMural("/assets/exhibition/ch4_vip.jpg");
    const texCh4Terrace = loadMural("/assets/exhibition/ch4_terrace.jpg");

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
      texGrand,
      texVersace,
      texSacred,
      texCorporate,
      texGrandDetail,
      texVersaceDetail,
      texSacredDetail,
      texCorporateDetail,
      texCh1Living,
      texCh1Dining,
      texCh1Parlour,
      texCh1Lounge,
      texCh1Media,
      texCh2WoodBed,
      texCh2Bed1,
      texCh2Vanity,
      texCh2Emerald,
      texCh2Linear,
      texCh3Classic,
      texCh3Stone,
      texCh3Courtyard,
      texCh3Foyer,
      texCh3Portal,
      texCh4Boardroom,
      texCh4SkyLounge,
      texCh4Dining,
      texCh4Vip,
      texCh4Terrace,
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
      fog: false,
    });

    // Central Runner Rug: Woven velvet runner with Greek key gold embroidery
    const runnerRugMat = new THREE.MeshStandardMaterial({
      map: runnerRugTex,
      roughness: 0.88,
      metalness: 0.02,
      fog: false,
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
      emissiveIntensity: 0.20,
      roughness: 0.60,
    });

    // Antique Gold & Brushed Brass Accents (#C9A961 - rich, luminous & warm champagne gold)
    const antiqueGoldMat = new THREE.MeshStandardMaterial({
      color: 0xc9a961,
      roughness: 0.30,
      metalness: 0.65,
      fog: false,
    });

    // Five-Star Hotel Lobby Coffered Ceiling Material (Warm Champagne Gold, Quilted Satin Sheen)
    const luxuryCofferMat = new THREE.MeshStandardMaterial({
      map: cofferDiffTex,
      normalMap: cofferNormTex,
      normalScale: new THREE.Vector2(0.40, 0.40),
      color: 0xd4af55, // Warm champagne / brushed antique gold
      emissive: 0x48341a, // Soft cove indirect glow
      emissiveIntensity: 0.38,
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
      fog: false,
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

    // --- 4. SCENE LIGHTING (BRIGHT, SUNLIT, WARM MANSION DAYLIGHT) ---
    const hemiLight = new THREE.HemisphereLight(0xfffaee, 0xd8c8b2, 1.45);
    scene.add(hemiLight);

    const mainSun = new THREE.DirectionalLight(0xfff7e8, 1.35);
    mainSun.position.set(12, 22, 10);
    scene.add(mainSun);

    const fillSun = new THREE.DirectionalLight(0xf5ede2, 0.85);
    fillSun.position.set(-10, 16, -40);
    scene.add(fillSun);

    // Upward architectural fill light illuminating the coffered ceiling tray with subtle directional gradient
    const ceilingUpLight = new THREE.DirectionalLight(0xfff2da, 1.1);
    ceilingUpLight.position.set(2.2, 1.2, -48.0);
    ceilingUpLight.target.position.set(0, 7.0, -52.5);
    scene.add(ceilingUpLight);
    scene.add(ceilingUpLight.target);

    // --- 5. ENCLOSED CENTRAL CORRIDOR GEOMETRY ---
    const hallWidth = 10;
    const hallHeight = 7.0;
    const hallZStart = 15;
    const hallZEnd = -120;
    const hallLength = hallZStart - hallZEnd; // 135m
    const hallZCenter = (hallZStart + hallZEnd) / 2; // -52.5

    // 1. High-Performance Pure Italian Black Marble Floor (Nero Marquina / Portoro)
    const floorGeo = new THREE.PlaneGeometry(hallWidth, hallLength);
    const floorMesh = new THREE.Mesh(floorGeo, corridorFloorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.set(0, 0, hallZCenter);
    scene.add(floorMesh);

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
    scene.add(leftContactShadow, rightContactShadow);

    // 5. Deep 3D Architectural Coffered Ceiling with Recessed Tray & Concealed Cove Lighting
    const ceilGeo = new THREE.PlaneGeometry(hallWidth, hallLength);
    const ceilMesh = new THREE.Mesh(ceilGeo, corridorCeilingMat);
    ceilMesh.rotation.x = Math.PI / 2;
    ceilMesh.position.set(0, hallHeight, hallZCenter);
    scene.add(ceilMesh);

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
    scene.add(leftSoffit, rightSoffit);

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
    scene.add(leftSoffitReveal, rightSoffitReveal);

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
      scene.add(mainBeam, mainBeamGold);
    }

    // 2. Modular Coffered Cassettes in Each Bay (2 across X, 3 along Z)
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
      const g = sourceGeo.clone();
      if (rx !== 0 || ry !== 0 || rz !== 0) {
        g.rotateX(rx);
        g.rotateY(ry);
        g.rotateZ(rz);
      }
      g.translate(tx, ty, tz);
      targetList.push(g);
    };

    for (let cz = hallZStart - 12; cz >= hallZEnd + 12; cz -= 12) {
      appendTransformedGeo(stoneGeos, spineBeamGeo, 0, hallHeight - 0.13, cz);
      appendTransformedGeo(goldGeos, spineGoldGeo, 0, hallHeight - 0.265, cz);

      for (const divZ of [-1.80, 1.80]) {
        appendTransformedGeo(stoneGeos, rowDividerGeo, 0, hallHeight - 0.11, cz + divZ);
        appendTransformedGeo(goldGeos, rowDividerGoldGeo, 0, hallHeight - 0.225, cz + divZ);
      }

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
        }
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

      scene.add(
        new THREE.Mesh(mergedStone, stoneTrimMat),
        new THREE.Mesh(mergedGold, antiqueGoldMat),
        new THREE.Mesh(mergedShadow, cofferShadowMat),
        new THREE.Mesh(mergedPanels, luxuryCofferMat)
      );
    }

    // Recessed indirect LED cove light channels hidden inside the soffit pocket (high emissive for soft bloom)
    const coveLightMat = new THREE.MeshStandardMaterial({
      color: 0xffe6c2,
      emissive: 0xffc472,
      emissiveIntensity: 1.5,
      roughness: 0.25,
      metalness: 0.0,
      toneMapped: true,
    });
    const leftCoveGlow = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.06, hallLength),
      coveLightMat
    );
    leftCoveGlow.position.set(-hallWidth / 2 + soffitWidth - 0.06, hallHeight - 0.06, hallZCenter);

    const rightCoveGlow = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.06, hallLength),
      coveLightMat
    );
    rightCoveGlow.position.set(hallWidth / 2 - soffitWidth + 0.06, hallHeight - 0.06, hallZCenter);
    scene.add(leftCoveGlow, rightCoveGlow);

    // --- 4 TRANSVERSE ARCHES ACROSS THE CORRIDOR (CURATED ARCHITECTURAL SPACING) ---
    const transverseArchZ = [-20, -45, -70, -95];
    const archRomanNumerals = ["I", "II", "III", "IV"];

    transverseArchZ.forEach((az, i) => {
      const archGroup = new THREE.Group();
      archGroup.position.set(0, 0, az);

      // Overhead transverse beam spanning the corridor
      const beam = new THREE.Mesh(
        new THREE.BoxGeometry(hallWidth, 0.6, 0.8),
        stoneTrimMat
      );
      beam.position.set(0, hallHeight - 0.3, 0);

      // Gold reveal molding along lower beam edge
      const reveal = new THREE.Mesh(
        new THREE.BoxGeometry(hallWidth + 0.05, 0.06, 0.85),
        antiqueGoldMat
      );
      reveal.position.set(0, hallHeight - 0.6, 0);

      // Supporting wall pilasters on left & right
      const leftPilaster = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, hallHeight, 0.8),
        i === 1 ? flutedOakMat : stoneTrimMat
      );
      leftPilaster.position.set(-hallWidth / 2 + 0.25, hallHeight / 2, 0);

      const rightPilaster = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, hallHeight, 0.8),
        i === 1 ? flutedOakMat : stoneTrimMat
      );
      rightPilaster.position.set(hallWidth / 2 - 0.25, hallHeight / 2, 0);

      // Center Keystone with Roman Numeral Plaque in Antique Gold
      const keystone = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, 0.75, 0.9),
        antiqueGoldMat
      );
      keystone.position.set(0, hallHeight - 0.32, 0);

      // Architectural Emissive Downlight Fixture (zero dynamic light cost)
      const archLens = new THREE.Mesh(
        new THREE.CylinderGeometry(0.14, 0.14, 0.03, 16),
        coveLightMat
      );
      archLens.position.set(0, hallHeight - 0.52, 0);

      archGroup.add(beam, reveal, leftPilaster, rightPilaster, keystone, archLens);
      scene.add(archGroup);
    });

    // Corridor Start Wall at Z = +15
    const startWall = new THREE.Mesh(
      new THREE.PlaneGeometry(hallWidth, hallHeight),
      corridorWallMat
    );
    startWall.position.set(0, hallHeight / 2, hallZStart);
    startWall.rotation.y = Math.PI;
    scene.add(startWall);

    // --- GRAND ENTRANCE DOOR OPENING GATE & ENCLOSURE AT Z = 8.2 ---
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

      // Gilded Arch Molding Trims (inner reveal framing doors)
      const leftGoldReveal = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 4.7, 0.48),
        antiqueGoldMat
      );
      leftGoldReveal.position.set(-1.82, 2.35, 0);

      const rightGoldReveal = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 4.7, 0.48),
        antiqueGoldMat
      );
      rightGoldReveal.position.set(1.82, 2.35, 0);

      const topGoldReveal = new THREE.Mesh(
        new THREE.BoxGeometry(3.6, 0.08, 0.48),
        antiqueGoldMat
      );
      topGoldReveal.position.set(0, 4.75, 0);

      // Center Keystone crowning the arch lintel header
      const keystone = new THREE.Mesh(
        new THREE.BoxGeometry(0.48, 0.28, 0.25),
        antiqueGoldMat
      );
      keystone.position.set(0, 5.80, 0.20);

      // 2. GOPAL LAHOTI — HOUSE OF INTERIORS Architectural Bronze Plaque
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

      // 3. Flanking Vestibule Enclosure Walls (blocks any outside view until opened)
      const leftWallInfill = new THREE.Mesh(
        new THREE.BoxGeometry(2.5, hallHeight, 0.4),
        corridorWallMat
      );
      leftWallInfill.position.set(-3.75, 3.5, 0);

      const rightWallInfill = new THREE.Mesh(
        new THREE.BoxGeometry(2.5, hallHeight, 0.4),
        corridorWallMat
      );
      rightWallInfill.position.set(3.75, 3.5, 0);

      const topWallInfill = new THREE.Mesh(
        new THREE.BoxGeometry(hallWidth, 1.4, 0.4),
        corridorWallMat
      );
      topWallInfill.position.set(0, 6.3, 0);

      // 4. Ornate Carved Double Doors (Dark Walnut Timber with Raised Boiserie & Brass)
      const doorWoodMat = new THREE.MeshStandardMaterial({
        map: wengeTimberTex,
        color: 0x36251c,
        roughness: 0.36,
        metalness: 0.08,
        fog: false,
      });

      // Helper to build raised boiserie panels and gold fillets on a door leaf
      const buildLeafPanels = (parent: THREE.Object3D, leafCenterX: number) => {
        // Core door slab
        const slab = new THREE.Mesh(
          new THREE.BoxGeometry(1.74, 4.65, 0.10),
          doorWoodMat
        );
        slab.position.set(leafCenterX, 2.325, 0);
        parent.add(slab);

        // 3 Tiers of Raised Boiserie Panels on front face (+Z)
        const panelConfigs = [
          { y: 0.70, h: 0.90 }, // Lower kick panel
          { y: 2.45, h: 2.10 }, // Middle grand field panel
          { y: 4.15, h: 0.90 }, // Upper header panel
        ];

        panelConfigs.forEach((cfg) => {
          // Raised timber panel
          const pMesh = new THREE.Mesh(
            new THREE.BoxGeometry(1.36, cfg.h, 0.04),
            doorWoodMat
          );
          pMesh.position.set(leafCenterX, cfg.y, 0.06);

          // Antique gold perimeter bevel frame
          const goldTrim = new THREE.Mesh(
            new THREE.BoxGeometry(1.40, cfg.h + 0.04, 0.015),
            antiqueGoldMat
          );
          goldTrim.position.set(leafCenterX, cfg.y, 0.05);

          parent.add(goldTrim, pMesh);
        });
      };

      // Helper to build vertical sculpted brass pull handle
      const buildHandle = (parent: THREE.Object3D, posX: number) => {
        const handleGroup = new THREE.Group();
        handleGroup.position.set(posX, 2.15, 0.06);

        // Escutcheon backplate
        const escutcheon = new THREE.Mesh(
          new THREE.BoxGeometry(0.12, 0.85, 0.025),
          antiqueGoldMat
        );
        escutcheon.position.set(0, 0, 0);

        // Cylindrical vertical pull bar
        const pullBar = new THREE.Mesh(
          new THREE.CylinderGeometry(0.025, 0.025, 0.60, 16),
          antiqueGoldMat
        );
        pullBar.position.set(0, 0, 0.05);

        // Stand-off mounting posts
        const postTop = new THREE.Mesh(
          new THREE.CylinderGeometry(0.018, 0.018, 0.05, 12),
          antiqueGoldMat
        );
        postTop.rotation.x = Math.PI / 2;
        postTop.position.set(0, 0.24, 0.025);

        const postBottom = new THREE.Mesh(
          new THREE.CylinderGeometry(0.018, 0.018, 0.05, 12),
          antiqueGoldMat
        );
        postBottom.rotation.x = Math.PI / 2;
        postBottom.position.set(0, -0.24, 0.025);

        // Classical Lion Knocker Ring
        const knockerRing = new THREE.Mesh(
          new THREE.TorusGeometry(0.065, 0.015, 12, 24),
          antiqueGoldMat
        );
        knockerRing.position.set(0, 0.22, 0.045);

        handleGroup.add(escutcheon, pullBar, postTop, postBottom, knockerRing);
        parent.add(handleGroup);
        return handleGroup;
      };

      // Left Door Pivot (hinge at X = -1.78)
      const leftPivot = new THREE.Group();
      leftPivot.position.set(-1.78, 0, 0);
      buildLeafPanels(leftPivot, 0.87);
      const leftHandle = buildHandle(leftPivot, 1.56);

      // Right Door Pivot (hinge at X = +1.78)
      const rightPivot = new THREE.Group();
      rightPivot.position.set(1.78, 0, 0);
      buildLeafPanels(rightPivot, -0.87);
      const rightHandle = buildHandle(rightPivot, -1.56);

      // Central Gold Astragal Lip (overlap bead along inner edge of right leaf)
      const astragal = new THREE.Mesh(
        new THREE.BoxGeometry(0.05, 4.65, 0.035),
        antiqueGoldMat
      );
      astragal.position.set(-0.025, 2.325, 0.06);
      rightPivot.add(astragal);

      // 5. Ambient Light Slit & Floor Spill (pulsing warm glow hinting at grandeur inside)
      const crackMat = new THREE.MeshBasicMaterial({
        color: 0xffdf8e,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
      });
      const crackSlit = new THREE.Mesh(
        new THREE.PlaneGeometry(0.025, 4.65),
        crackMat
      );
      crackSlit.position.set(0, 2.325, 0.08);

      const floorCrackMat = new THREE.MeshBasicMaterial({
        map: floorSpillTex,
        transparent: true,
        opacity: 0.45,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const floorSpill = new THREE.Mesh(
        new THREE.PlaneGeometry(2.8, 1.8),
        floorCrackMat
      );
      floorSpill.rotation.x = -Math.PI / 2;
      floorSpill.position.set(0, 0.006, 0.9);

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
        plaqueMesh,
        plaqueGoldFrame,
        leftWallInfill,
        rightWallInfill,
        topWallInfill,
        leftPivot,
        rightPivot,
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
        floorSpill,
        doorBacker,
        lightFlood,
      };
    };

    const entranceDoor = buildGrandEntranceDoor();
    doorAnimationRef.current.doorGroup = entranceDoor.doorGroup;
    doorAnimationRef.current.leftPivot = entranceDoor.leftPivot;
    doorAnimationRef.current.rightPivot = entranceDoor.rightPivot;
    doorAnimationRef.current.leftHandle = entranceDoor.leftHandle;
    doorAnimationRef.current.rightHandle = entranceDoor.rightHandle;
    doorAnimationRef.current.crackSlit = entranceDoor.crackSlit;
    doorAnimationRef.current.floorSpill = entranceDoor.floorSpill;
    doorAnimationRef.current.doorBacker = entranceDoor.doorBacker;
    doorAnimationRef.current.lightFlood = entranceDoor.lightFlood;

    // Corridor End Wall at Z = -120 with Recessed Architectural Niche
    const endWall = new THREE.Mesh(
      new THREE.PlaneGeometry(hallWidth, hallHeight),
      corridorWallMat
    );
    endWall.position.set(0, hallHeight / 2, hallZEnd);
    scene.add(endWall);

    // --- FAR-END GRAND ARCHITECTURAL FOCAL POINT (TERMINUS OF THE MANSION) ---
    const focalGroup = new THREE.Group();
    focalGroup.position.set(0, 0, -118.5);

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
      emissiveIntensity: 2.2, // warm glowing backlit alabaster
      roughness: 0.15,
      metalness: 0.05,
      fog: false,
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
      emissiveIntensity: 2.2,
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
    const focalLightSpill = new THREE.SpotLight(0xffe2a4, 4.2, 52, Math.PI / 3.4, 0.65, 1.2);
    focalLightSpill.position.set(0, 5.8, -118.5);
    const focalTarget = new THREE.Object3D();
    focalTarget.position.set(0, 0, -88); // points forward toward Chamber IV
    scene.add(focalTarget);
    focalLightSpill.target = focalTarget;
    scene.add(focalLightSpill);

    // 7. Ground Light Spill Plane (Additive radial glow carpet leading out from portal)
    const floorSpillMat = new THREE.MeshBasicMaterial({
      map: floorSpillTex,
      transparent: true,
      opacity: 0.42,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const floorSpillMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(6.8, 28),
      floorSpillMat
    );
    floorSpillMesh.rotation.x = -Math.PI / 2;
    floorSpillMesh.position.set(0, 0.009, -104);
    scene.add(floorSpillMesh);

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
    scene.add(focalGroup);

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

    const createLuxurySconce = (
      x: number,
      y: number,
      z: number,
      facingDir: number
    ) => {
      const sconceGroup = new THREE.Group();
      sconceGroup.position.set(x, y, z);

      // 1. Slim Brushed Antique Brass Backplate mounted flush against wall
      const backplate = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, 1.1, 0.18),
        antiqueGoldMat
      );
      backplate.position.set(facingDir * 0.02, 0, 0);

      // Ambient Occlusion Shadow on wall behind backplate
      const aoShadow = new THREE.Mesh(
        new THREE.PlaneGeometry(0.32, 1.25),
        contactShadowMat
      );
      aoShadow.rotation.y = facingDir * (Math.PI / 2);
      aoShadow.position.set(facingDir * 0.005, 0, 0);

      // 2. Horizontal Curved Brass Bracket Arm extending outward into hallway
      const arm = new THREE.Mesh(
        new THREE.BoxGeometry(0.28, 0.045, 0.045),
        antiqueGoldMat
      );
      arm.position.set(facingDir * 0.16, 0, 0);

      // 3. Top & Bottom Brass Caps & Decorative Finial
      const topCap = new THREE.Mesh(
        new THREE.CylinderGeometry(0.09, 0.09, 0.08, 20),
        antiqueGoldMat
      );
      topCap.position.set(facingDir * 0.28, 0.38, 0);

      const bottomCap = new THREE.Mesh(
        new THREE.CylinderGeometry(0.09, 0.09, 0.08, 20),
        antiqueGoldMat
      );
      bottomCap.position.set(facingDir * 0.28, -0.38, 0);

      const finial = new THREE.Mesh(
        new THREE.ConeGeometry(0.05, 0.22, 16),
        antiqueGoldMat
      );
      finial.rotation.x = Math.PI;
      finial.position.set(facingDir * 0.28, -0.52, 0);

      // 4. Real 3D Elongated Frosted Alabaster Glass Cylinder Shade (Emissive glow without forward light cost)
      const shadeMat = new THREE.MeshStandardMaterial({
        color: 0xfffaea,
        emissive: 0xffe1aa,
        emissiveIntensity: 1.8,
        roughness: 0.14,
        metalness: 0.04,
        transparent: true,
        opacity: 0.96,
      });
      const shade = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, 0.72, 24),
        shadeMat
      );
      shade.position.set(facingDir * 0.28, 0, 0);

      // 5. Baked Soft Wall Scallop Glow Wash (Downward & Upward pools with Additive Blending)
      const downScallop = new THREE.Mesh(sconceDownScallopGeo, sconceScallopMat);
      downScallop.rotation.y = facingDir * (Math.PI / 2);
      downScallop.position.set(facingDir * 0.008, -1.25, 0);

      const upScallop = new THREE.Mesh(sconceUpScallopGeo, sconceScallopMat);
      upScallop.rotation.y = facingDir * (Math.PI / 2);
      upScallop.rotation.z = Math.PI;
      upScallop.position.set(facingDir * 0.008, 1.05, 0);

      sconceGroup.add(backplate, aoShadow, arm, topCap, bottomCap, finial, shade, downScallop, upScallop);
      scene.add(sconceGroup);
    };

    // Instantiate Curated Luxury 3D Sconces at Doorway Piers & Architectural Junctions
    createLuxurySconce(-hallWidth / 2, 3.8, 12.0, 1);
    createLuxurySconce(hallWidth / 2, 3.8, 12.0, -1);
    createLuxurySconce(-hallWidth / 2, 3.8, -16.5, 1);
    createLuxurySconce(-hallWidth / 2, 3.8, -23.5, 1);
    createLuxurySconce(hallWidth / 2, 3.8, -41.5, -1);
    createLuxurySconce(hallWidth / 2, 3.8, -48.5, -1);
    createLuxurySconce(-hallWidth / 2, 3.8, -66.5, 1);
    createLuxurySconce(-hallWidth / 2, 3.8, -73.5, 1);
    createLuxurySconce(hallWidth / 2, 3.8, -91.5, -1);
    createLuxurySconce(hallWidth / 2, 3.8, -98.5, -1);

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
      emissiveIntensity: 0.75,
      roughness: 0.28,
      metalness: 0.55,
    });

    const createMonumental2BlockMural = (
      x: number,
      y: number,
      z: number,
      facingDir: number,
      tex: THREE.Texture
    ) => {
      const artGroup = new THREE.Group();
      artGroup.position.set(x, y, z);

      // 1. Drop shadow behind monumental frame
      const dropShadow = new THREE.Mesh(sharedMuralDropShadowGeo, contactShadowMat);
      dropShadow.rotation.y = facingDir * (Math.PI / 2);
      dropShadow.position.set(facingDir * 0.002, 0, 0);

      // 2. Outer Gilded Museum Rails (Antique Gold Bevel Frame)
      const topRail = new THREE.Mesh(sharedMuralTopBottomRailGeo, antiqueGoldMat);
      topRail.position.set(facingDir * (muralRailDepth / 2), (muralOuterHeight - muralRailWidth) / 2, 0);

      const bottomRail = new THREE.Mesh(sharedMuralTopBottomRailGeo, antiqueGoldMat);
      bottomRail.position.set(facingDir * (muralRailDepth / 2), -(muralOuterHeight - muralRailWidth) / 2, 0);

      const leftRail = new THREE.Mesh(sharedMuralLeftRightRailGeo, antiqueGoldMat);
      leftRail.position.set(facingDir * (muralRailDepth / 2), 0, -(muralOuterWidth - muralRailWidth) / 2);

      const rightRail = new THREE.Mesh(sharedMuralLeftRightRailGeo, antiqueGoldMat);
      rightRail.position.set(facingDir * (muralRailDepth / 2), 0, (muralOuterWidth - muralRailWidth) / 2);

      // Front stepped gold reveal moldings
      const frontMoldingTop = new THREE.Mesh(sharedMuralFrontMoldingGeo, antiqueGoldMat);
      frontMoldingTop.position.set(facingDir * (muralRailDepth + 0.007), (muralOuterHeight - muralRailWidth) / 2, 0);

      const frontMoldingBottom = new THREE.Mesh(sharedMuralFrontMoldingGeo, antiqueGoldMat);
      frontMoldingBottom.position.set(facingDir * (muralRailDepth + 0.007), -(muralOuterHeight - muralRailWidth) / 2, 0);

      // 3. Dark Bronze Inner Shadow Fillet
      const innerFilletTop = new THREE.Mesh(sharedMuralFilletTopBottomGeo, darkBronzeMat);
      innerFilletTop.position.set(facingDir * (muralRailDepth - muralFilletDepth / 2), (muralInnerH - muralFilletWidth) / 2, 0);

      const innerFilletBottom = new THREE.Mesh(sharedMuralFilletTopBottomGeo, darkBronzeMat);
      innerFilletBottom.position.set(facingDir * (muralRailDepth - muralFilletDepth / 2), -(muralInnerH - muralFilletWidth) / 2, 0);

      const innerFilletLeft = new THREE.Mesh(sharedMuralFilletLeftRightGeo, darkBronzeMat);
      innerFilletLeft.position.set(facingDir * (muralRailDepth - muralFilletDepth / 2), 0, -(muralInnerW - muralFilletWidth) / 2);

      const innerFilletRight = new THREE.Mesh(sharedMuralFilletLeftRightGeo, darkBronzeMat);
      innerFilletRight.position.set(facingDir * (muralRailDepth - muralFilletDepth / 2), 0, (muralInnerW - muralFilletWidth) / 2);

      // 4. Archival Off-White Linen Matting Margin
      const matMesh = new THREE.Mesh(sharedMuralMatGeo, artLinenMat);
      matMesh.rotation.y = facingDir * (Math.PI / 2);
      matMesh.position.set(facingDir * 0.035, 0, 0);

      // 5. Crystal-Clear 4K Master Artwork Canvas (with uniform museum illumination)
      const canvasMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: tex,
        emissiveMap: tex,
        emissive: 0xffffff,
        emissiveIntensity: 0.38, // Museum picture-light illumination for 100% crystal clarity
        roughness: 0.35,
        metalness: 0.02,
        side: THREE.FrontSide,
      });

      const canvasMesh = new THREE.Mesh(sharedMuralCanvasGeo, canvasMat);
      canvasMesh.rotation.y = facingDir * (Math.PI / 2);
      canvasMesh.position.set(facingDir * 0.055, 0, 0);

      // 6. Protective Museum Glass Pane
      const glassPane = new THREE.Mesh(sharedMuralGlassGeo, museumGlassMat);
      glassPane.rotation.y = facingDir * (Math.PI / 2);
      glassPane.position.set(facingDir * 0.082, 0, 0);

      // 7. Triple Overhead Brass Gallery Picture Light Fixtures across the 6.8m span
      const lightY = muralOuterHeight / 2 + 0.30;
      for (const offsetZ of [-2.1, 0, 2.1]) {
        const arm1 = new THREE.Mesh(sharedMuralArmGeo, antiqueGoldMat);
        arm1.rotation.z = facingDir * (Math.PI / 2);
        arm1.position.set(facingDir * 0.22, lightY, offsetZ - 0.45);

        const arm2 = new THREE.Mesh(sharedMuralArmGeo, antiqueGoldMat);
        arm2.rotation.z = facingDir * (Math.PI / 2);
        arm2.position.set(facingDir * 0.22, lightY, offsetZ + 0.45);

        const lampHood = new THREE.Mesh(sharedMuralHoodGeo, artLampHoodMat);
        lampHood.rotation.x = Math.PI / 2;
        lampHood.position.set(facingDir * 0.44, lightY, offsetZ);

        artGroup.add(arm1, arm2, lampHood);
      }

      artGroup.add(
        dropShadow,
        topRail, bottomRail, leftRail, rightRail,
        frontMoldingTop, frontMoldingBottom,
        innerFilletTop, innerFilletBottom, innerFilletLeft, innerFilletRight,
        matMesh, canvasMesh, glassPane
      );
      scene.add(artGroup);
    };

    // Place 2-Block Wide 4K Monumental Exhibition Murals along both walls (Full-Wall Height, Center Y = 2.92)
    // LEFT WALL (facingDir = 1, X = -hallWidth/2) - 2 Blocks Per Image
    // Section 1: Entry to Chamber 1 (Z = +10 to -16)
    createMonumental2BlockMural(-hallWidth / 2, 2.92, 8.5, 1, muralTex1);   // Double-Height Living Suite (Bays 1-2)
    createMonumental2BlockMural(-hallWidth / 2, 2.92, 1.0, 1, muralTex2);   // Royal Velvet Dining Hall (Bays 3-4)
    createMonumental2BlockMural(-hallWidth / 2, 2.92, -6.5, 1, muralTex3);  // Master Bedroom Recliner Suite (Bays 5-6)
    // [Portal I at Z = -20: Chamber 1 Entry - leaves 3.6m clean clearance]
    // Section 2: Between Chamber 1 and Chamber 3 (Z = -26 to -64)
    createMonumental2BlockMural(-hallWidth / 2, 2.92, -27.5, 1, muralTex4); // Master Bedroom Vanity
    createMonumental2BlockMural(-hallWidth / 2, 2.92, -35.0, 1, muralTex5); // Parents Classical Bedroom
    createMonumental2BlockMural(-hallWidth / 2, 2.92, -42.5, 1, muralTex6); // Parents Velvet Lounge
    createMonumental2BlockMural(-hallWidth / 2, 2.92, -50.0, 1, muralTex7); // Coral Velvet Pooja Mandir
    createMonumental2BlockMural(-hallWidth / 2, 2.92, -57.5, 1, muralTex8); // Sacred Mandir Jali Suite
    // [Portal III at Z = -70: Chamber 3 Entry]
    // Section 3: After Chamber 3 (Z = -76 to -115)
    createMonumental2BlockMural(-hallWidth / 2, 2.92, -77.5, 1, muralTex9);  // Luxury Guest Suite
    createMonumental2BlockMural(-hallWidth / 2, 2.92, -85.0, 1, muralTex10); // Architectural Silk Guest Lounge
    createMonumental2BlockMural(-hallWidth / 2, 2.92, -92.5, 1, muralTex11); // Master Penthouse Suite
    createMonumental2BlockMural(-hallWidth / 2, 2.92, -100.0, 1, muralTex12); // Grand Panoramic Living
    createMonumental2BlockMural(-hallWidth / 2, 2.92, -107.5, 1, muralTex13); // Royal Dining Suite

    // RIGHT WALL (facingDir = -1, X = hallWidth/2) - 2 Blocks Per Image
    // Section 1: Entry to Chamber 2 (Z = +10 to -40)
    createMonumental2BlockMural(hallWidth / 2, 2.92, 8.5, -1, muralTex14);  // Executive Library Lounge
    createMonumental2BlockMural(hallWidth / 2, 2.92, 1.0, -1, muralTex15);  // Master Bedroom Spa Suite
    createMonumental2BlockMural(hallWidth / 2, 2.92, -6.5, -1, muralTex16); // Bespoke Walk-in Wardrobe
    createMonumental2BlockMural(hallWidth / 2, 2.92, -14.0, -1, muralTex1); // Double-Height Grand Living
    createMonumental2BlockMural(hallWidth / 2, 2.92, -21.5, -1, muralTex2); // Royal Velvet Dining Hall
    createMonumental2BlockMural(hallWidth / 2, 2.92, -29.0, -1, muralTex3); // Master Bedroom Recliner Suite
    createMonumental2BlockMural(hallWidth / 2, 2.92, -36.5, -1, muralTex4); // Master Bedroom Vanity
    // [Portal II at Z = -45: Chamber 2 Entry]
    // Section 2: Between Chamber 2 and Chamber 4 (Z = -51 to -89)
    createMonumental2BlockMural(hallWidth / 2, 2.92, -52.5, -1, muralTex5); // Parents Classical Bedroom
    createMonumental2BlockMural(hallWidth / 2, 2.92, -60.0, -1, muralTex6); // Parents Velvet Lounge
    createMonumental2BlockMural(hallWidth / 2, 2.92, -67.5, -1, muralTex7); // Coral Velvet Pooja Mandir
    createMonumental2BlockMural(hallWidth / 2, 2.92, -75.0, -1, muralTex8); // Sacred Mandir Jali Suite
    createMonumental2BlockMural(hallWidth / 2, 2.92, -82.5, -1, muralTex9); // Luxury Guest Suite
    // [Portal IV at Z = -95: Chamber 4 Entry]
    // Section 3: After Chamber 4 (Z = -101 to -115)
    createMonumental2BlockMural(hallWidth / 2, 2.92, -102.5, -1, muralTex10); // Architectural Silk Guest Lounge
    createMonumental2BlockMural(hallWidth / 2, 2.92, -110.0, -1, muralTex11); // Master Penthouse Suite

    // --- CORRIDOR WALLS & INSTANCED BOISERIE PANEL SYSTEM (2 DRAW CALLS TOTAL) ---
    const unitBoxGeo = new THREE.BoxGeometry(1, 1, 1);
    const maxBoiserieInstances = 650;
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
      doorZ1: number,
      doorZ2: number,
      sideFacing: number
    ) => {
      const wallGroup = new THREE.Group();
      const zDoors = [doorZ1, doorZ2];

      const addWallSegment = (zStart: number, zEnd: number) => {
        const segLen = zStart - zEnd;
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

      // Segment 1: from hallZStart to doorZ1 + 3
      addWallSegment(hallZStart, doorZ1 + 3);

      // Segment 2: between doorZ1 - 3 and doorZ2 + 3
      addWallSegment(doorZ1 - 3, doorZ2 + 3);

      // Segment 3: from doorZ2 - 3 to hallZEnd
      addWallSegment(doorZ2 - 3, hallZEnd);

      // Header walls above doorways
      zDoors.forEach((dz) => {
        const headerH = hallHeight - 5.2;
        const header = new THREE.Mesh(
          new THREE.PlaneGeometry(6, headerH),
          corridorWallMat
        );
        header.rotation.y = sideFacing * (Math.PI / 2);
        header.position.set(xPos, 5.2 + headerH / 2, dz);
        wallGroup.add(header);
      });

      scene.add(wallGroup);
    };

    // Build Left (X = -5) and Right (X = +5) Walls
    buildWallWithDoorways(-hallWidth / 2, -20, -70, 1);
    buildWallWithDoorways(hallWidth / 2, -45, -95, -1);

    // Finalize instanced boiserie panel meshes
    stonePanelInstanced.count = stoneBarIdx;
    stonePanelInstanced.instanceMatrix.needsUpdate = true;
    goldPanelInstanced.count = goldBarIdx;
    goldPanelInstanced.instanceMatrix.needsUpdate = true;
    scene.add(stonePanelInstanced, goldPanelInstanced);

    // --- 6. PHYSICAL 3D DOORWAYS & ARCHWAYS (ANTIQUE GOLD & HONEY OAK TRIM) ---
    const portals = [
      { z: -20, xDoor: -hallWidth / 2, dir: -1, roman: "I" },
      { z: -45, xDoor: hallWidth / 2, dir: 1, roman: "II" },
      { z: -70, xDoor: -hallWidth / 2, dir: -1, roman: "III" },
      { z: -95, xDoor: hallWidth / 2, dir: 1, roman: "IV" },
    ];

    portals.forEach((p) => {
      const archGroup = new THREE.Group();
      archGroup.position.set(p.xDoor, 0, p.z);

      const frameDepth = 0.85;
      const frameWidth = 0.45;
      const doorOpenWidth = 6.0;
      const doorOpenHeight = 5.2;

      // Left Jamb in Soft Taupe Stone
      const leftJamb = new THREE.Mesh(
        new THREE.BoxGeometry(frameDepth, doorOpenHeight, frameWidth),
        stoneTrimMat
      );
      leftJamb.position.set(0, doorOpenHeight / 2, -doorOpenWidth / 2);

      // Right Jamb
      const rightJamb = new THREE.Mesh(
        new THREE.BoxGeometry(frameDepth, doorOpenHeight, frameWidth),
        stoneTrimMat
      );
      rightJamb.position.set(0, doorOpenHeight / 2, doorOpenWidth / 2);

      // Overhead Lintel Arch in Antique Gold
      const lintel = new THREE.Mesh(
        new THREE.BoxGeometry(frameDepth + 0.1, 0.55, doorOpenWidth + frameWidth * 2),
        antiqueGoldMat
      );
      lintel.position.set(0, doorOpenHeight + 0.275, 0);

      // Flush architectural brass transition inlay on floor connecting hallway to room
      const thresh = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 0.003, doorOpenWidth),
        antiqueGoldMat
      );
      thresh.position.set(0, 0.0015, 0);

      // Roman Numeral Plaque
      const plaque = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.6, 1.25),
        antiqueGoldMat
      );
      plaque.position.set(-p.dir * 0.38, doorOpenHeight + 0.75, 0);

      archGroup.add(leftJamb, rightJamb, lintel, thresh, plaque);
      scene.add(archGroup);
    });

    // =========================================================================
    // --- 7. COMPLETE ENCLOSED CHAMBER ARCHITECTURE & 3D FURNITURE SYSTEMS ---
    // =========================================================================

    // Variables for room-specific ambient animations (culled per active chamber)
    let grandDustPoints: THREE.Points | null = null;
    const grandDustCount = 50;

    let versacePendantGroup: THREE.Group | null = null;
    let versaceDustPoints: THREE.Points | null = null;
    const versaceDustCount = 40;

    let sanctumDiyaLight: THREE.PointLight | null = null;
    let sanctumFlameMesh: THREE.Mesh | null = null;
    let incenseParticles: THREE.Points | null = null;
    const incenseCount = 35;
    const incenseOrigin = new THREE.Vector3(-6.53, 1.15, 0.42);
    let corporateKineticToy: THREE.Group | null = null;

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
      const doorW = 6.0;
      const doorH = 5.2;
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
      tex: THREE.Texture,
      artW: number,
      artH: number,
      frameThick = 0.08,
      hasPictureLight = true
    ) => {
      const artGroup = new THREE.Group();

      const matBorder = 0.16;
      const totalW = artW + matBorder * 2 + frameThick * 2;
      const totalH = artH + matBorder * 2 + frameThick * 2;

      // 1. Backing Board (prevents see-through or light leaks)
      const backingMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(totalW, totalH),
        new THREE.MeshStandardMaterial({
          color: 0x1f1b18,
          roughness: 0.95,
        })
      );
      backingMesh.position.z = 0;

      // 2. Archival Beveled Linen Mat
      const matMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(artW + matBorder * 2, artH + matBorder * 2),
        new THREE.MeshStandardMaterial({
          color: 0xf5f1e8,
          roughness: 0.92,
        })
      );
      matMesh.position.z = 0.008;

      // 3. Photographic Fine Art Canvas
      const canvasMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(artW, artH),
        new THREE.MeshStandardMaterial({
          map: tex,
          roughness: 0.32,
          metalness: 0.04,
        })
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

      // 5. Architectural Picture Downlight Hood (Warm Emissive Halo)
      if (hasPictureLight) {
        const hoodW = Math.min(2.0, artW * 0.65);
        const lightHood = new THREE.Mesh(
          new THREE.BoxGeometry(hoodW, 0.04, 0.16),
          antiqueGoldMat
        );
        lightHood.position.set(0, totalH / 2 + 0.14, 0.12);

        const lightStrip = new THREE.Mesh(
          new THREE.BoxGeometry(hoodW - 0.06, 0.014, 0.05),
          new THREE.MeshStandardMaterial({
            color: 0xffeed8,
            emissive: 0xffdca0,
            emissiveIntensity: 1.5,
            roughness: 0.2,
          })
        );
        lightStrip.position.set(0, totalH / 2 + 0.12, 0.12);

        const arm1 = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.16), antiqueGoldMat);
        arm1.rotation.x = Math.PI / 2;
        arm1.position.set(-hoodW * 0.3, totalH / 2 + 0.14, 0.06);

        const arm2 = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.16), antiqueGoldMat);
        arm2.rotation.x = Math.PI / 2;
        arm2.position.set(hoodW * 0.3, totalH / 2 + 0.14, 0.06);

        artGroup.add(lightHood, lightStrip, arm1, arm2);
      }

      // 6. Museum Brass Title Plaque
      const plaque = new THREE.Mesh(
        new THREE.BoxGeometry(0.65, 0.14, 0.015),
        new THREE.MeshStandardMaterial({
          color: 0xc8aa6e,
          roughness: 0.30,
          metalness: 0.70,
        })
      );
      plaque.position.set(0, -totalH / 2 - 0.14, 0.01);
      artGroup.add(plaque);

      return artGroup;
    };

    // -------------------------------------------------------------------------
    // CHAMBER I: GRAND LIVING (Curated Architectural Gallery & Real 3D Furniture)
    // -------------------------------------------------------------------------
    const buildGrandLivingChamber = () => {
      const { roomGroup, roomW, roomD, roomH, wallMat } = buildRoomShell(
        -hallWidth / 2,
        -20,
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

      // Artwork 1 (Back Wall Hero): The Monolithic Living Suite (6.6m x 3.8m Centerpiece)
      const ch1ArtLiving = createFramedArtMesh(texCh1Living, 6.6, 3.8, 0.10, true);
      ch1ArtLiving.position.set(backX + 0.10, roomH / 2 + 0.2, 0);
      ch1ArtLiving.rotation.y = Math.PI / 2;
      roomGroup.add(ch1ArtLiving);

      // Flanking heavy textured curtains on left & right
      const curtainMat = new THREE.MeshStandardMaterial({
        color: 0x8a8279,
        roughness: 0.92,
      });
      const curtainLeft = new THREE.Mesh(new THREE.BoxGeometry(0.35, roomH, 2.2), curtainMat);
      curtainLeft.position.set(backX + 0.22, roomH / 2, -roomD / 2 + 1.1);
      const curtainRight = new THREE.Mesh(new THREE.BoxGeometry(0.35, roomH, 2.2), curtainMat);
      curtainRight.position.set(backX + 0.22, roomH / 2, roomD / 2 - 1.1);
      roomGroup.add(curtainLeft, curtainRight);

      // Side Wall 1 (Z = -roomD/2): Limestone wall exhibiting 2 fine art project works
      const sideWall1 = new THREE.Mesh(new THREE.PlaneGeometry(roomW, roomH), wallMat);
      sideWall1.position.set(0, roomH / 2, -roomD / 2);

      // Artwork 2 (Side Wall 1 Left): The Horizon Dining Pavilion
      const ch1ArtDining = createFramedArtMesh(texCh1Dining, 4.4, 2.8, 0.08, true);
      ch1ArtDining.position.set(-2.8, roomH / 2, -roomD / 2 + 0.08);

      // Artwork 3 (Side Wall 1 Right): The Family Media Parlour
      const ch1ArtParlour = createFramedArtMesh(texCh1Parlour, 4.4, 2.8, 0.08, true);
      ch1ArtParlour.position.set(2.8, roomH / 2, -roomD / 2 + 0.08);
      roomGroup.add(sideWall1, ch1ArtDining, ch1ArtParlour);

      // Side Wall 2 (Z = +roomD/2): Fluted honey oak wall exhibiting 2 fine art project works
      const sideWall2 = new THREE.Mesh(new THREE.PlaneGeometry(roomW, roomH), flutedOakMat);
      sideWall2.position.set(0, roomH / 2, roomD / 2);
      sideWall2.rotation.y = Math.PI;

      // Artwork 4 (Side Wall 2 Left): The Atelier Floral Lounge
      const ch1ArtLounge = createFramedArtMesh(texCh1Lounge, 4.2, 2.8, 0.08, true);
      ch1ArtLounge.position.set(-2.8, roomH / 2, roomD / 2 - 0.08);
      ch1ArtLounge.rotation.y = Math.PI;

      // Artwork 5 (Side Wall 2 Right): The Master Entertainment Wall
      const ch1ArtMedia = createFramedArtMesh(texCh1Media, 4.2, 2.8, 0.08, true);
      ch1ArtMedia.position.set(2.8, roomH / 2, roomD / 2 - 0.08);
      ch1ArtMedia.rotation.y = Math.PI;
      roomGroup.add(sideWall2, ch1ArtLounge, ch1ArtMedia);

      // --- REAL 3D BESPOKE LUXURY FURNITURE ENSEMBLE ---
      // 1. Hand-Tufted High-Pile Wool Bouclé Area Rug (Expansive 6.6m x 5.0m)
      const rugGroup = new THREE.Group();
      rugGroup.position.set(-0.55, 0, 0);

      // Deep Grounding Ambient Contact Shadow under Rug
      const rugShadow = new THREE.Mesh(
        new THREE.PlaneGeometry(7.0, 5.4),
        new THREE.MeshBasicMaterial({
          color: 0x120c06,
          transparent: true,
          opacity: 0.42,
          depthWrite: false,
        })
      );
      rugShadow.rotation.x = -Math.PI / 2;
      rugShadow.position.y = 0.002;

      // Primary Woven Wool Rug Plane
      const grandRug = new THREE.Mesh(new THREE.PlaneGeometry(6.6, 5.0), woolBoucleRugMat);
      grandRug.rotation.x = -Math.PI / 2;
      grandRug.position.y = 0.008;

      // Raised Border Lip / Pile Thickness Reveal (Eliminates flat paper look)
      const rugBorderTop = new THREE.Mesh(new THREE.BoxGeometry(6.64, 0.014, 0.06), woolBoucleRugMat);
      rugBorderTop.position.set(0, 0.012, 2.47);
      const rugBorderBottom = new THREE.Mesh(new THREE.BoxGeometry(6.64, 0.014, 0.06), woolBoucleRugMat);
      rugBorderBottom.position.set(0, 0.012, -2.47);
      const rugBorderLeft = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.014, 5.0), woolBoucleRugMat);
      rugBorderLeft.position.set(-3.27, 0.012, 0);
      const rugBorderRight = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.014, 5.0), woolBoucleRugMat);
      rugBorderRight.position.set(3.27, 0.012, 0);

      rugGroup.add(rugShadow, grandRug, rugBorderTop, rugBorderBottom, rugBorderLeft, rugBorderRight);
      roomGroup.add(rugGroup);

      // 2. Sculpted Modular Bouclé Sectional (Deep Lounge with Seam Welt Piping & Pillowed Crowns)
      const sofaGroup = new THREE.Group();
      sofaGroup.position.set(-2.65, 0, 0);

      // Contact Shadow under Sofa Base
      const sofaShadow = new THREE.Mesh(
        new THREE.PlaneGeometry(1.4, 4.0),
        new THREE.MeshBasicMaterial({
          color: 0x140e08,
          transparent: true,
          opacity: 0.52,
          depthWrite: false,
        })
      );
      sofaShadow.rotation.x = -Math.PI / 2;
      sofaShadow.position.set(0, 0.003, 0);
      sofaGroup.add(sofaShadow);

      // Recessed Floating Plinth Base in Dark Bronze
      const sofaPlinth = new THREE.Mesh(
        new THREE.BoxGeometry(1.10, 0.08, 3.65),
        darkBronzeMat
      );
      sofaPlinth.position.set(0, 0.07, 0);
      sofaGroup.add(sofaPlinth);

      // Primary Lower Upholstered Deck
      const sofaDeck = new THREE.Mesh(
        new THREE.BoxGeometry(1.18, 0.16, 3.70),
        boucleMat
      );
      sofaDeck.position.set(0, 0.19, 0);
      sofaGroup.add(sofaDeck);

      // 3 Modular Seat Cushions with Pillowed Crowns & Seam Piping Welts
      for (let i = -1; i <= 1; i++) {
        const cz = i * 1.20;

        // Core Cushion Body with soft rounded edges
        const seatBody = new THREE.Mesh(
          new THREE.BoxGeometry(0.98, 0.18, 1.14),
          boucleMat
        );
        seatBody.position.set(0.04, 0.36, cz);

        // Pillowed Crown Top (convex cushion dome catching highlights)
        const seatCrown = new THREE.Mesh(
          new THREE.BoxGeometry(0.94, 0.05, 1.10),
          boucleMat
        );
        seatCrown.position.set(0.04, 0.46, cz);

        // French Welt Perimeter Seam Piping (tailored upholstery bead)
        const weltFront = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1.14, 8), boucleMat);
        weltFront.rotation.x = Math.PI / 2;
        weltFront.position.set(0.51, 0.44, cz);

        const weltLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.98, 8), boucleMat);
        weltLeft.rotation.z = Math.PI / 2;
        weltLeft.position.set(0.04, 0.44, cz - 0.57);

        const weltRight = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.98, 8), boucleMat);
        weltRight.rotation.z = Math.PI / 2;
        weltRight.position.set(0.04, 0.44, cz + 0.57);

        sofaGroup.add(seatBody, seatCrown, weltFront, weltLeft, weltRight);
      }

      // Angled Ergonomic Backrest Rail Structure (Tilted 10 degrees backward)
      const backRail = new THREE.Mesh(
        new THREE.BoxGeometry(0.26, 0.65, 3.70),
        boucleMat
      );
      backRail.position.set(-0.44, 0.72, 0);
      backRail.rotation.z = -0.16;
      sofaGroup.add(backRail);

      // 3 Plump Loose Back Cushions with Natural Lived-In Asymmetric Tilts
      const backCushionConfigs = [
        { z: -1.20, rotY: 0.04, rotZ: -0.19 },
        { z: 0.00, rotY: 0.00, rotZ: -0.17 },
        { z: 1.20, rotY: -0.05, rotZ: -0.16 },
      ];
      backCushionConfigs.forEach((cfg) => {
        const backCushion = new THREE.Mesh(
          new THREE.BoxGeometry(0.20, 0.56, 1.10),
          boucleMat
        );
        backCushion.position.set(-0.34, 0.74, cfg.z);
        backCushion.rotation.y = cfg.rotY;
        backCushion.rotation.z = cfg.rotZ;

        // Perimeter Piping Bead for Back Cushion
        const bWeltTop = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 1.10, 8), boucleMat);
        bWeltTop.rotation.x = Math.PI / 2;
        bWeltTop.position.set(0, 0.28, 0);
        backCushion.add(bWeltTop);

        sofaGroup.add(backCushion);
      });

      // Sculpted Low-Profile Armrests (Left & Right) with Bullnose Rounded Caps
      const armLeft = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.42, 0.26), boucleMat);
      armLeft.position.set(0, 0.36, -1.86);
      const armLeftCap = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 1.18, 16), boucleMat);
      armLeftCap.rotation.z = Math.PI / 2;
      armLeftCap.position.set(0, 0.57, -1.86);

      const armRight = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.42, 0.26), boucleMat);
      armRight.position.set(0, 0.36, 1.86);
      const armRightCap = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 1.18, 16), boucleMat);
      armRightCap.rotation.z = Math.PI / 2;
      armRightCap.position.set(0, 0.57, 1.86);

      sofaGroup.add(armLeft, armLeftCap, armRight, armRightCap);

      // Chaise Lounge Return Module (L-Shape Configuration extending at Z = +2.45m)
      const chaiseGroup = new THREE.Group();
      chaiseGroup.position.set(0.72, 0, 1.86);

      const chaisePlinth = new THREE.Mesh(new THREE.BoxGeometry(1.50, 0.08, 1.10), darkBronzeMat);
      chaisePlinth.position.set(0, 0.07, 0);
      const chaiseDeck = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.16, 1.14), boucleMat);
      chaiseDeck.position.set(0, 0.19, 0);
      const chaiseCushion = new THREE.Mesh(new THREE.BoxGeometry(1.48, 0.18, 1.08), boucleMat);
      chaiseCushion.position.set(0, 0.36, 0);
      const chaiseCrown = new THREE.Mesh(new THREE.BoxGeometry(1.44, 0.05, 1.04), boucleMat);
      chaiseCrown.position.set(0, 0.46, 0);
      chaiseGroup.add(chaisePlinth, chaiseDeck, chaiseCushion, chaiseCrown);
      sofaGroup.add(chaiseGroup);

      // --- ASYMMETRIC LIVED-IN ACCESSORIES ON SOFA ---
      // 1. Casually Draped Cashmere Throw Blanket over Left Armrest
      const throwBlanket = new THREE.Group();
      throwBlanket.position.set(0.08, 0.58, -1.86);
      throwBlanket.rotation.y = 0.10;

      const throwTop = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.025, 0.34), cashmereThrowMat);
      const throwDrapeOuter = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.38, 0.025), cashmereThrowMat);
      throwDrapeOuter.position.set(0, -0.18, -0.17);
      const throwDrapeInner = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.22, 0.025), cashmereThrowMat);
      throwDrapeInner.position.set(0, -0.10, 0.17);
      const throwFold = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.035, 0.38), cashmereThrowMat);
      throwFold.position.set(0.04, 0.015, 0.20);
      throwFold.rotation.z = -0.06;
      throwBlanket.add(throwTop, throwDrapeOuter, throwDrapeInner, throwFold);
      sofaGroup.add(throwBlanket);

      // 2. Curated Accent Pillows (Contrasting Olive Velvet, Ivory Bouclé, and Cognac Leather)
      // Pillow 1: Rich Olive Velvet (50x50cm) nestled in corner at 22° tilt
      const pillowOlive = new THREE.Mesh(
        new THREE.BoxGeometry(0.16, 0.48, 0.48),
        oliveVelvetMat
      );
      pillowOlive.position.set(-0.20, 0.58, -1.45);
      pillowOlive.rotation.y = 0.38;
      pillowOlive.rotation.z = -0.25;

      // Pillow 2: Ivory Bouclé Lumbar Pillow overlapping Olive Pillow
      const pillowIvory = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.28, 0.44),
        boucleMat
      );
      pillowIvory.position.set(-0.04, 0.50, -1.25);
      pillowIvory.rotation.y = -0.22;
      pillowIvory.rotation.z = -0.15;

      // Pillow 3: Cognac Saddle Leather Accent Pillow on Chaise Lounge with modeled karate chop crease
      const pillowCognac = new THREE.Mesh(
        new THREE.BoxGeometry(0.42, 0.14, 0.42),
        cognacLeatherMat
      );
      pillowCognac.position.set(0.85, 0.52, 1.86);
      pillowCognac.rotation.y = 0.28;
      pillowCognac.rotation.x = 0.12;

      const pillowCrease = new THREE.Mesh(
        new THREE.CylinderGeometry(0.012, 0.012, 0.40, 8),
        cognacLeatherMat
      );
      pillowCrease.rotation.x = Math.PI / 2;
      pillowCrease.position.set(0.85, 0.58, 1.86);

      sofaGroup.add(pillowOlive, pillowIvory, pillowCognac, pillowCrease);
      roomGroup.add(sofaGroup);

      // 3. Sculpted Cognac Leather Swivel Lounge Armchair (Foreground Left Composition)
      const chairGroup = new THREE.Group();
      chairGroup.position.set(1.10, 0, -2.15);
      chairGroup.rotation.y = -0.52; // Angled ~30° into the room, revealing front bucket, deep seat, and neckroll

      // 4-Star Spider Swivel Base in Dark Patinated Bronze
      const baseHub = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.22, 20), darkBronzeMat);
      baseHub.position.set(0, 0.18, 0);
      chairGroup.add(baseHub);

      // 4 Cantilevered Swivel Legs with Satin Brass Floor Glides & Contact Shadows
      for (let a = 0; a < 4; a++) {
        const legAngle = a * (Math.PI / 2);
        const legArm = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.032, 0.04), darkBronzeMat);
        legArm.rotation.y = legAngle;
        legArm.rotation.z = 0.18; // Slopes gracefully down to floor
        legArm.position.set(Math.cos(legAngle) * 0.18, 0.11, Math.sin(legAngle) * 0.18);

        // Machined Satin Brass Glide Disc
        const glide = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.034, 0.016, 16), antiqueGoldMat);
        glide.position.set(Math.cos(legAngle) * 0.36, 0.018, Math.sin(legAngle) * 0.36);

        // Grounding Contact Shadow Disc under Glide
        const glideShadow = new THREE.Mesh(
          new THREE.CylinderGeometry(0.055, 0.055, 0.002, 16),
          new THREE.MeshBasicMaterial({ color: 0x120c06, transparent: true, opacity: 0.65 })
        );
        glideShadow.position.set(Math.cos(legAngle) * 0.36, 0.009, Math.sin(legAngle) * 0.36);

        chairGroup.add(legArm, glide, glideShadow);
      }

      // Sculpted Bucket Seat Shell in Cognac Saddle Leather
      const seatBucket = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.16, 0.82), cognacLeatherMat);
      seatBucket.position.set(0, 0.38, 0);
      seatBucket.rotation.z = -0.12;

      // Ergonomic Wrapping Side Wings / Armrests
      const wingLeft = new THREE.Mesh(new THREE.BoxGeometry(0.80, 0.32, 0.12), cognacLeatherMat);
      wingLeft.position.set(0, 0.52, -0.42);
      wingLeft.rotation.z = -0.12;

      const wingRight = new THREE.Mesh(new THREE.BoxGeometry(0.80, 0.32, 0.12), cognacLeatherMat);
      wingRight.position.set(0, 0.52, 0.42);
      wingRight.rotation.z = -0.12;

      // Contoured Reclined High-Back Shell
      const chairBack = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.84, 0.78), cognacLeatherMat);
      chairBack.position.set(-0.32, 0.82, 0);
      chairBack.rotation.z = -0.26;

      // Dark Bronze Perimeter Welt Reveal Trim
      const weltBackTop = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.78, 12), darkBronzeMat);
      weltBackTop.rotation.x = Math.PI / 2;
      weltBackTop.position.set(-0.43, 1.22, 0);

      // Inset Plump Leather Seat Cushion with Double-Needle Seam Reveal
      const chairCushion = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.14, 0.74), cognacLeatherMat);
      chairCushion.position.set(0.02, 0.46, 0);
      chairCushion.rotation.z = -0.12;

      // Cylindrical Leather Headrest Pillow with Dark Bronze Mounting Brackets
      const headrestRoll = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.56, 16), cognacLeatherMat);
      headrestRoll.rotation.x = Math.PI / 2;
      headrestRoll.position.set(-0.48, 1.26, 0);

      const bracket1 = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.08), darkBronzeMat);
      bracket1.rotation.z = Math.PI / 2;
      bracket1.position.set(-0.42, 1.26, -0.18);

      const bracket2 = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.08), darkBronzeMat);
      bracket2.rotation.z = Math.PI / 2;
      bracket2.position.set(-0.42, 1.26, 0.18);

      chairGroup.add(
        seatBucket,
        wingLeft,
        wingRight,
        chairBack,
        weltBackTop,
        chairCushion,
        headrestRoll,
        bracket1,
        bracket2
      );
      roomGroup.add(chairGroup);

      // 4. Layered Monolithic Coffee Table Grouping (Honed Nero Marquina Marble & Cantilevered Smoked Oak)
      const coffeeTableGroup = new THREE.Group();
      coffeeTableGroup.position.set(-0.55, 0, 0);

      // --- TIER 1: HONED NERO MARQUINA MARBLE SLAB ---
      // Grounding Contact Shadows under Sled Legs
      for (const sz of [-0.78, 0.78]) {
        const legShadow = new THREE.Mesh(
          new THREE.PlaneGeometry(0.92, 0.12),
          new THREE.MeshBasicMaterial({ color: 0x120c06, transparent: true, opacity: 0.65, depthWrite: false })
        );
        legShadow.rotation.x = -Math.PI / 2;
        legShadow.position.set(0, 0.009, sz);
        coffeeTableGroup.add(legShadow);

        // Brushed Antique Gold Sled Leg
        const sledLeg = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.22, 0.04), antiqueGoldMat);
        sledLeg.position.set(0, 0.12, sz);
        coffeeTableGroup.add(sledLeg);
      }

      // Honed Nero Marquina Marble Primary Slab
      const marbleSlab = new THREE.Mesh(new THREE.BoxGeometry(0.94, 0.07, 1.90), neroMarquinaMat);
      marbleSlab.position.set(0, 0.265, 0);

      // Bullnose Chamfer Perimeter Edges (reflects subtle specular light)
      const chamferFront = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.02, 1.90), neroMarquinaMat);
      chamferFront.position.set(0.47, 0.30, 0);
      chamferFront.rotation.z = Math.PI / 4;
      const chamferBack = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.02, 1.90), neroMarquinaMat);
      chamferBack.position.set(-0.47, 0.30, 0);
      chamferBack.rotation.z = Math.PI / 4;
      coffeeTableGroup.add(marbleSlab, chamferFront, chamferBack);

      // --- TIER 2: CANTILEVERED SMOKED OAK BRIDGE TABLE ---
      const oakBridge = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.045, 1.15), flutedOakMat);
      oakBridge.position.set(0.20, 0.44, 0.20);

      // Mitred Waterfall Return Leg cascading down to the rug
      const oakWaterfall = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.42, 1.15), flutedOakMat);
      oakWaterfall.position.set(0.45, 0.23, 0.20);

      const waterfallShadow = new THREE.Mesh(
        new THREE.PlaneGeometry(0.12, 1.20),
        new THREE.MeshBasicMaterial({ color: 0x120c06, transparent: true, opacity: 0.65, depthWrite: false })
      );
      waterfallShadow.rotation.x = -Math.PI / 2;
      waterfallShadow.position.set(0.45, 0.009, 0.20);

      // Satin Brass Riser Foot resting on marble slab
      const oakRiser = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.14, 0.90), antiqueGoldMat);
      oakRiser.position.set(-0.05, 0.37, 0.20);

      coffeeTableGroup.add(oakBridge, oakWaterfall, waterfallShadow, oakRiser);

      // --- CURATED EDITORIAL STAGING DECOR ON COFFEE TABLES ---
      // 1. Stack of Architectural Hardcover Monographs (Natural 14° angle on Marble Slab)
      const bookStack = new THREE.Group();
      bookStack.position.set(-0.24, 0.30, -0.48);
      bookStack.rotation.y = 0.24; // 14° off-axis human rotation

      // Book 1 (Bottom, Terracotta Linen Cloth Binding)
      const book1Cover = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.042, 0.28), bookTerracottaMat);
      const book1Pages = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.038, 0.26), bookPaperPagesMat);
      book1Pages.position.set(0.015, 0, 0);
      book1Cover.add(book1Pages);

      // Book 2 (Middle, Matte Charcoal Monograph)
      const book2Cover = new THREE.Mesh(new THREE.BoxGeometry(0.33, 0.036, 0.24), bookCharcoalMat);
      book2Cover.position.set(0.01, 0.039, 0.01);
      const book2Pages = new THREE.Mesh(new THREE.BoxGeometry(0.31, 0.032, 0.22), bookPaperPagesMat);
      book2Pages.position.set(0.012, 0, 0);
      book2Cover.add(book2Pages);

      // Book 3 (Top, Ivory Parchment with Bookmark Ribbon)
      const book3Cover = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.024, 0.20), bookIvoryMat);
      book3Cover.position.set(0.02, 0.069, 0.02);
      book3Cover.rotation.y = 0.08; // subtle micro-shift on top
      const book3Pages = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.020, 0.18), bookPaperPagesMat);
      book3Pages.position.set(0.01, 0, 0);
      const bookRibbon = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.003, 0.02), antiqueGoldMat);
      bookRibbon.position.set(0.08, 0.013, 0.06);
      book3Cover.add(book3Pages, bookRibbon);

      bookStack.add(book1Cover, book2Cover, book3Cover);
      coffeeTableGroup.add(bookStack);

      // 2. Artisanal Fluted Ceramic Floral Vase with Branching Botanicals
      const vaseGroup = new THREE.Group();
      vaseGroup.position.set(-0.16, 0.30, 0.44);

      // Ribbed Ceramic Vase Body
      const vaseBody = new THREE.Mesh(
        new THREE.CylinderGeometry(0.14, 0.10, 0.36, 24),
        darkCeramicMat
      );
      vaseBody.position.set(0, 0.18, 0);

      const vaseNeck = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.08, 0.10, 24),
        darkCeramicMat
      );
      vaseNeck.position.set(0, 0.40, 0);

      // Delicate Branching Dried Botanicals catching the Golden Sunbeam
      const botanicals = new THREE.Group();
      botanicals.position.set(0, 0.44, 0);
      const branchAngles = [-0.25, 0.15, -0.05, 0.30, -0.18];
      branchAngles.forEach((bAng, bIdx) => {
        const branchStem = new THREE.Mesh(
          new THREE.CylinderGeometry(0.004, 0.006, 0.52 + bIdx * 0.04, 8),
          darkBronzeMat
        );
        branchStem.position.set(Math.sin(bAng) * 0.08, 0.24, Math.cos(bAng) * 0.08);
        branchStem.rotation.z = bAng;
        branchStem.rotation.x = Math.sin(bIdx) * 0.2;

        // Seed Pods at Branch Tips
        const pod = new THREE.Mesh(new THREE.SphereGeometry(0.016, 8, 8), antiqueGoldMat);
        pod.position.set(0, 0.27 + bIdx * 0.02, 0);
        branchStem.add(pod);

        botanicals.add(branchStem);
      });

      vaseGroup.add(vaseBody, vaseNeck, botanicals);
      coffeeTableGroup.add(vaseGroup);

      // 3. Heavy Fluted Amber Glass Candle Dish (On Oak Bridge Tier)
      const candleGroup = new THREE.Group();
      candleGroup.position.set(0.22, 0.465, 0.22);

      const amberDish = new THREE.Mesh(
        new THREE.CylinderGeometry(0.16, 0.15, 0.08, 24),
        amberGlassMat
      );
      amberDish.position.set(0, 0.04, 0);

      const soyWax = new THREE.Mesh(
        new THREE.CylinderGeometry(0.14, 0.14, 0.05, 20),
        new THREE.MeshStandardMaterial({ color: 0xfbf6ee, roughness: 0.55 })
      );
      soyWax.position.set(0, 0.05, 0);

      const wick1 = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.018), darkBronzeMat);
      wick1.position.set(-0.04, 0.08, 0);
      const wick2 = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.018), darkBronzeMat);
      wick2.position.set(0.04, 0.08, 0);

      candleGroup.add(amberDish, soyWax, wick1, wick2);
      coffeeTableGroup.add(candleGroup);

      // 4. Brushed Brass Catchall Tray with Polished Marble Spheres
      const trayGroup = new THREE.Group();
      trayGroup.position.set(-0.25, 0.30, 0.02);

      const brassTray = new THREE.Mesh(
        new THREE.CylinderGeometry(0.22, 0.20, 0.02, 24),
        antiqueGoldMat
      );
      brassTray.position.set(0, 0.01, 0);

      const marbleSphere1 = new THREE.Mesh(
        new THREE.SphereGeometry(0.032, 16, 16),
        new THREE.MeshStandardMaterial({ map: calacattaMarbleTex, roughness: 0.10, metalness: 0.15 })
      );
      marbleSphere1.position.set(-0.04, 0.042, 0.02);

      const marbleSphere2 = new THREE.Mesh(
        new THREE.SphereGeometry(0.026, 16, 16),
        new THREE.MeshStandardMaterial({ map: calacattaMarbleTex, roughness: 0.10, metalness: 0.15 })
      );
      marbleSphere2.position.set(0.04, 0.036, -0.02);

      trayGroup.add(brassTray, marbleSphere1, marbleSphere2);
      coffeeTableGroup.add(trayGroup);
      roomGroup.add(coffeeTableGroup);

      // 5. EMOTIONAL LIGHTING SCHEME: GOLDEN DAYLIGHT SPILL (2800K Sunlight & 5500K Sky Fill)
      // Angled Golden Sunbeam Directional Key Light
      const grandSunbeam = new THREE.DirectionalLight(0xffecd0, 1.5);
      grandSunbeam.position.set(-6.5, 6.8, -4.8);
      grandSunbeam.target.position.set(-0.8, 0.35, 0);
      roomGroup.add(grandSunbeam);
      roomGroup.add(grandSunbeam.target);

      // Soft Skylight Fill (Cool Blue Skylight bounce in shaded crevices)
      const grandSkyFill = new THREE.DirectionalLight(0xe4eff8, 0.5);
      grandSkyFill.position.set(3.5, 5.2, 2.5);
      grandSkyFill.target.position.set(-0.8, 0.35, 0);
      roomGroup.add(grandSkyFill);
      roomGroup.add(grandSkyFill.target);

      // 6. Ambient Dust Motes Drifting in Sunbeam Frustum
      const dGeo = new THREE.BufferGeometry();
      const dPos = new Float32Array(grandDustCount * 3);
      for (let i = 0; i < grandDustCount; i++) {
        dPos[i * 3 + 0] = -2.8 + Math.random() * 4.2; // Centered over lounge & table
        dPos[i * 3 + 1] = 0.5 + Math.random() * 3.8;
        dPos[i * 3 + 2] = -2.5 + Math.random() * 5.0;
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

      scene.add(roomGroup);
      return roomGroup;
    };

    // -------------------------------------------------------------------------
    // CHAMBER II: VERSACE SUITE (Bespoke 3D Master Bed, Nightstands, Lighting)
    // -------------------------------------------------------------------------
    const buildVersaceSuiteChamber = () => {
      const { roomGroup, roomW, roomD, roomH, wallMat } = buildRoomShell(
        hallWidth / 2,
        -45,
        1,
        0xe2d6c4,
        grandFloorMat // Warm polished Italian honey marble floor
      );

      const backX = roomW / 2; // +8.0

      // Back Wall: Full-height vertical fluted European white oak paneling with top cove light
      const oakBackWall = new THREE.Mesh(new THREE.PlaneGeometry(roomD, roomH), flutedOakMat);
      oakBackWall.position.set(backX - 0.04, roomH / 2, 0);
      oakBackWall.rotation.y = -Math.PI / 2;
      roomGroup.add(oakBackWall);

      // Artwork 1 (Back Wall Hero): The Fluted White Oak Retreat (above headboard at Y = 4.30)
      const ch2ArtWoodBed = createFramedArtMesh(texCh2WoodBed, 6.2, 3.2, 0.08, true);
      ch2ArtWoodBed.position.set(backX - 0.08, 4.30, 0);
      ch2ArtWoodBed.rotation.y = -Math.PI / 2;
      roomGroup.add(ch2ArtWoodBed);

      // Side Wall 1 (Z = -roomD/2): Oak paneling exhibiting 2 fine art master suite works
      const sideWall1 = new THREE.Mesh(new THREE.PlaneGeometry(roomW, roomH), flutedOakMat);
      sideWall1.position.set(0, roomH / 2, -roomD / 2);

      // Artwork 2 (Side Wall 1 Left): The Horizon Master Bed Suite
      const ch2ArtBed1 = createFramedArtMesh(texCh2Bed1, 4.2, 2.8, 0.08, true);
      ch2ArtBed1.position.set(-2.8, roomH / 2, -roomD / 2 + 0.08);

      // Artwork 3 (Side Wall 1 Right): The Haute Couture Vanity Mirror (Vertical Format)
      const ch2ArtVanity = createFramedArtMesh(texCh2Vanity, 2.6, 3.4, 0.08, true);
      ch2ArtVanity.position.set(2.8, roomH / 2, -roomD / 2 + 0.08);
      roomGroup.add(sideWall1, ch2ArtBed1, ch2ArtVanity);

      // Side Wall 2 (Z = +roomD/2): Limestone wall exhibiting 2 fine art master suite works
      const sideWall2 = new THREE.Mesh(new THREE.PlaneGeometry(roomW, roomH), wallMat);
      sideWall2.position.set(0, roomH / 2, roomD / 2);
      sideWall2.rotation.y = Math.PI;

      // Artwork 4 (Side Wall 2 Left): The Emerald Accent Master Suite
      const ch2ArtEmerald = createFramedArtMesh(texCh2Emerald, 4.2, 2.8, 0.08, true);
      ch2ArtEmerald.position.set(-2.8, roomH / 2, roomD / 2 - 0.08);
      ch2ArtEmerald.rotation.y = Math.PI;

      // Artwork 5 (Side Wall 2 Right): The Linear Headboard Atelier
      const ch2ArtLinear = createFramedArtMesh(texCh2Linear, 4.2, 2.8, 0.08, true);
      ch2ArtLinear.position.set(2.8, roomH / 2, roomD / 2 - 0.08);
      ch2ArtLinear.rotation.y = Math.PI;
      roomGroup.add(sideWall2, ch2ArtEmerald, ch2ArtLinear);

      // --- BESPOKE 3D MASTER BEDROOM FURNITURE ENSEMBLE ---

      // 1. Silk & Wool Suite Area Rug (5.8m along Z, 4.8m along X)
      const rugGroup = new THREE.Group();
      rugGroup.position.set(5.1, 0, 0);

      // Grounding Ambient Contact Shadow under Rug
      const rugShadow = new THREE.Mesh(
        new THREE.PlaneGeometry(5.2, 6.2),
        new THREE.MeshBasicMaterial({
          color: 0x120c08,
          transparent: true,
          opacity: 0.45,
          depthWrite: false,
        })
      );
      rugShadow.rotation.x = -Math.PI / 2;
      rugShadow.position.y = 0.002;

      // Primary Woven Silk-Wool Rug Plane (textured with versace_suite_rug.jpg)
      const suiteRug = new THREE.Mesh(new THREE.PlaneGeometry(4.8, 5.8), versaceRugMat);
      suiteRug.rotation.x = -Math.PI / 2;
      suiteRug.position.y = 0.008;

      // Raised 3D Border Pile Lip (Eliminates flat paper decal look)
      const rugBorderLipMat = new THREE.MeshStandardMaterial({
        color: 0x221e1c, // dark bronze/charcoal border lip
        roughness: 0.85,
        fog: false,
      });
      const lipFront = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.016, 5.84), rugBorderLipMat);
      lipFront.position.set(-2.41, 0.012, 0);
      const lipBack = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.016, 5.84), rugBorderLipMat);
      lipBack.position.set(2.41, 0.012, 0);
      const lipLeft = new THREE.Mesh(new THREE.BoxGeometry(4.84, 0.016, 0.06), rugBorderLipMat);
      lipLeft.position.set(0, 0.012, -2.91);
      const lipRight = new THREE.Mesh(new THREE.BoxGeometry(4.84, 0.016, 0.06), rugBorderLipMat);
      lipRight.position.set(0, 0.012, 2.91);

      rugGroup.add(rugShadow, suiteRug, lipFront, lipBack, lipLeft, lipRight);
      roomGroup.add(rugGroup);

      // 2. The 3D Luxury Versace Master Bed Ensemble
      const bedGroup = new THREE.Group();
      bedGroup.position.set(4.8, 0, 0);

      // Deep Grounding Contact Shadow under Bed Frame
      const bedShadow = new THREE.Mesh(
        new THREE.PlaneGeometry(2.7, 2.8),
        new THREE.MeshBasicMaterial({
          color: 0x100a06,
          transparent: true,
          opacity: 0.58,
          depthWrite: false,
        })
      );
      bedShadow.rotation.x = -Math.PI / 2;
      bedShadow.position.set(0.05, 0.009, 0);
      bedGroup.add(bedShadow);

      // --- A. 8-PANEL CHANNEL-TUFTED CORDOVAN LEATHER HEADBOARD ---
      const headboardGroup = new THREE.Group();
      headboardGroup.position.set(2.35, 0, 0); // local X = 4.8 + 2.35 = 7.15 (close to back oak wall at 8.0)

      const numChannels = 8;
      const totalHeadboardW = 3.80; // spans Z = -1.90 to +1.90
      const channelW = totalHeadboardW / numChannels; // 0.475m per channel
      const headboardH = 2.05; // from Y = 0.10 to 2.15

      // Structural Backing Board
      const hbBacking = new THREE.Mesh(
        new THREE.BoxGeometry(0.10, headboardH, totalHeadboardW),
        smokedOakMat
      );
      hbBacking.position.set(0.05, headboardH / 2 + 0.08, 0);
      headboardGroup.add(hbBacking);

      // 8 Sculpted Vertical Channel Cushions with Convex Crown Curves & Seam Piping
      for (let c = 0; c < numChannels; c++) {
        const cz = -totalHeadboardW / 2 + channelW / 2 + c * channelW;

        // Main Channel Cushion Body
        const channelBody = new THREE.Mesh(
          new THREE.BoxGeometry(0.12, headboardH - 0.02, channelW - 0.015),
          cordovanLeatherMat
        );
        channelBody.position.set(-0.02, headboardH / 2 + 0.08, cz);

        // Convex Front Pad catching soft light highlights
        const channelCrown = new THREE.Mesh(
          new THREE.BoxGeometry(0.04, headboardH - 0.06, channelW - 0.035),
          cordovanLeatherMat
        );
        channelCrown.position.set(-0.08, headboardH / 2 + 0.08, cz);

        headboardGroup.add(channelBody, channelCrown);

        // Vertical Dark Bronze Inset Reveal Bead between adjacent panels
        if (c < numChannels - 1) {
          const seamBead = new THREE.Mesh(
            new THREE.CylinderGeometry(0.008, 0.008, headboardH, 8),
            darkBronzeMat
          );
          seamBead.position.set(-0.08, headboardH / 2 + 0.08, cz + channelW / 2);
          headboardGroup.add(seamBead);
        }
      }

      // Brushed Antique Gold Top Cap Crown Rail across full headboard width
      const hbTopCap = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 0.045, totalHeadboardW + 0.04),
        antiqueGoldMat
      );
      hbTopCap.position.set(-0.02, headboardH + 0.09, 0);

      // Lateral Brushed Gold End Caps
      const hbLeftCap = new THREE.Mesh(new THREE.BoxGeometry(0.18, headboardH + 0.04, 0.025), antiqueGoldMat);
      hbLeftCap.position.set(-0.02, headboardH / 2 + 0.08, -totalHeadboardW / 2 - 0.01);
      const hbRightCap = new THREE.Mesh(new THREE.BoxGeometry(0.18, headboardH + 0.04, 0.025), antiqueGoldMat);
      hbRightCap.position.set(-0.02, headboardH / 2 + 0.08, totalHeadboardW / 2 + 0.01);
      headboardGroup.add(hbTopCap, hbLeftCap, hbRightCap);

      // Concealed Warm LED Halo Uplight Channel behind top of headboard
      const haloStrip = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, 0.015, totalHeadboardW - 0.2),
        new THREE.MeshBasicMaterial({ color: 0xffe2a4 })
      );
      haloStrip.position.set(0.08, headboardH + 0.06, 0);
      headboardGroup.add(haloStrip);



      bedGroup.add(headboardGroup);

      // --- B. LOW FLOATING PLATFORM BED FRAME ---
      // Recessed Inset Plinth Base (in dark bronze with deep floating shadow reveal)
      const plinthBase = new THREE.Mesh(
        new THREE.BoxGeometry(2.35, 0.12, 2.30),
        darkBronzeMat
      );
      plinthBase.position.set(0.08, 0.06, 0);
      bedGroup.add(plinthBase);

      // Primary Outer Upholstered Platform Frame Deck in Cordovan Leather
      const platformDeck = new THREE.Mesh(
        new THREE.BoxGeometry(2.55, 0.26, 2.48),
        cordovanLeatherMat
      );
      platformDeck.position.set(0.05, 0.25, 0);

      // Antique Gold Corner Trim Brackets on Platform Foot
      for (const cz of [-1.24, 1.24]) {
        const cornerTrim = new THREE.Mesh(
          new THREE.BoxGeometry(0.08, 0.27, 0.08),
          antiqueGoldMat
        );
        cornerTrim.position.set(-1.21, 0.25, cz);
        bedGroup.add(cornerTrim);
      }
      bedGroup.add(platformDeck);

      // --- C. LUXURY MATTRESS ---
      const mattress = new THREE.Mesh(
        new THREE.BoxGeometry(2.36, 0.28, 2.32),
        whiteLinenMat
      );
      mattress.position.set(0.12, 0.48, 0);

      // Tailored Piping Bead along perimeter of mattress
      const matPipingFront = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 2.32, 8), whiteLinenMat);
      matPipingFront.rotation.x = Math.PI / 2;
      matPipingFront.position.set(-1.05, 0.62, 0);
      bedGroup.add(mattress, matPipingFront);

      // --- D. VOLUMETRIC CHAMPAGNE SILK DUVET & LINEN TURN-DOWN ---
      // Main Duvet Body with soft convex crown
      const duvetBody = new THREE.Mesh(
        new THREE.BoxGeometry(1.75, 0.16, 2.34),
        champagneSilkMat
      );
      duvetBody.position.set(-0.20, 0.61, 0);

      // Pillowed Crown Dome (convex highlight catcher)
      const duvetCrown = new THREE.Mesh(
        new THREE.BoxGeometry(1.68, 0.05, 2.26),
        champagneSilkMat
      );
      duvetCrown.position.set(-0.20, 0.69, 0);

      // Waterfall Side Drops cascading over the mattress edges
      const dropLeft = new THREE.Mesh(new THREE.BoxGeometry(1.72, 0.26, 0.04), champagneSilkMat);
      dropLeft.position.set(-0.20, 0.50, -1.18);
      const dropRight = new THREE.Mesh(new THREE.BoxGeometry(1.72, 0.26, 0.04), champagneSilkMat);
      dropRight.position.set(-0.20, 0.50, 1.18);

      // Foot Drop cascading over the foot of the bed
      const dropFoot = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.28, 2.34), champagneSilkMat);
      dropFoot.position.set(-1.08, 0.49, 0);

      // Crisp Egyptian White Linen Sheet Turn-Down Fold (folded back 48cm)
      const turnDownFold = new THREE.Mesh(
        new THREE.BoxGeometry(0.48, 0.12, 2.33),
        whiteLinenMat
      );
      turnDownFold.position.set(0.85, 0.63, 0);

      const turnDownCuff = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.045, 2.34),
        whiteLinenMat
      );
      turnDownCuff.position.set(0.62, 0.70, 0);

      bedGroup.add(duvetBody, duvetCrown, dropLeft, dropRight, dropFoot, turnDownFold, turnDownCuff);

      // --- E. VERSACE MIDNIGHT NAVY & GOLD SILK BED RUNNER ---
      // Positioned at foot of bed, resting atop duvet and cascading down both sides
      const runnerMain = new THREE.Mesh(
        new THREE.BoxGeometry(0.86, 0.04, 2.36),
        versaceRunnerMat
      );
      runnerMain.position.set(-0.62, 0.74, 0);

      // Left Waterfall Drape
      const runnerDropLeft = new THREE.Mesh(
        new THREE.BoxGeometry(0.86, 0.38, 0.04),
        versaceRunnerMat
      );
      runnerDropLeft.position.set(-0.62, 0.54, -1.20);

      // Right Waterfall Drape
      const runnerDropRight = new THREE.Mesh(
        new THREE.BoxGeometry(0.86, 0.38, 0.04),
        versaceRunnerMat
      );
      runnerDropRight.position.set(-0.62, 0.54, 1.20);

      // Raised Antique Gold Seam Welt Trims along runner borders
      const runnerGoldTrim1 = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.042, 2.37), antiqueGoldMat);
      runnerGoldTrim1.position.set(-0.62 + 0.42, 0.742, 0);
      const runnerGoldTrim2 = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.042, 2.37), antiqueGoldMat);
      runnerGoldTrim2.position.set(-0.62 - 0.42, 0.742, 0);

      bedGroup.add(runnerMain, runnerDropLeft, runnerDropRight, runnerGoldTrim1, runnerGoldTrim2);

      // --- F. 6-PIECE MASTER PILLOW LANDSCAPE ---
      // Row 1 (Back): Twin Ivory Linen Euro Shams propped upright against headboard
      for (const [sz, rz] of [[-0.62, -0.20], [0.62, -0.20]]) {
        const euroSham = new THREE.Group();
        euroSham.position.set(1.92, 0.98, sz);
        euroSham.rotation.z = rz;

        const shamBody = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.56, 0.84), whiteLinenMat);
        const shamFlange = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.64, 0.92), whiteLinenMat);
        euroSham.add(shamBody, shamFlange);
        bedGroup.add(euroSham);
      }

      // Row 2 (Middle): Twin King Sleeping Pillows in Champagne Silk with Natural Asymmetric Tilts
      const pillowLeft = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.18, 0.78), champagneSilkMat);
      pillowLeft.position.set(1.45, 0.74, -0.60);
      pillowLeft.rotation.set(0.04, 0.06, -0.28);

      const pillowRight = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.18, 0.78), champagneSilkMat);
      pillowRight.position.set(1.45, 0.74, 0.60);
      pillowRight.rotation.set(-0.03, -0.05, -0.28);

      bedGroup.add(pillowLeft, pillowRight);

      // Row 3 (Front): Designer Curated Accent Cushions
      // Left: Peacock Emerald Velvet Cushion with Karate-Chop Crease
      const emeraldCushion = new THREE.Mesh(
        new THREE.BoxGeometry(0.20, 0.44, 0.44),
        emeraldVelvetMat
      );
      emeraldCushion.position.set(1.08, 0.84, -0.52);
      emeraldCushion.rotation.set(0.06, 0.22, -0.18);

      // Right: Versace Midnight Navy Silk Cushion with Satin Gold Piping
      const navyCushion = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 0.44, 0.44),
        versaceRunnerMat
      );
      navyCushion.position.set(1.08, 0.84, 0.52);
      navyCushion.rotation.set(-0.05, -0.18, -0.16);

      const navyPiping = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.44, 8), antiqueGoldMat);
      navyPiping.rotation.x = Math.PI / 2;
      navyPiping.position.set(0, 0.22, 0);
      navyCushion.add(navyPiping);

      // Center: Bouclé & Gold Strip Lumbar Cushion
      const lumbarCushion = new THREE.Mesh(
        new THREE.BoxGeometry(0.16, 0.24, 0.52),
        boucleMat
      );
      lumbarCushion.position.set(0.92, 0.76, 0);
      lumbarCushion.rotation.z = -0.14;

      const goldLumbarBand = new THREE.Mesh(
        new THREE.BoxGeometry(0.165, 0.245, 0.10),
        antiqueGoldMat
      );
      lumbarCushion.add(goldLumbarBand);

      bedGroup.add(emeraldCushion, navyCushion, lumbarCushion);
      roomGroup.add(bedGroup);

      // 3. TWIN DESIGNER BEDSIDE NIGHTSTANDS

      // --- RIGHT NIGHTSTAND: FLOATING 2-DRAWER SMOKED OAK & NERO MARQUINA CREDENZA ---
      // (Directly underneath the Dual-Drop Pendant & Spotlight)
      const rightStandGroup = new THREE.Group();
      rightStandGroup.position.set(6.4, 0, 2.35);

      // Grounding Contact Shadow
      const rightStandShadow = new THREE.Mesh(
        new THREE.PlaneGeometry(0.72, 1.05),
        new THREE.MeshBasicMaterial({ color: 0x120c08, transparent: true, opacity: 0.52, depthWrite: false })
      );
      rightStandShadow.rotation.x = -Math.PI / 2;
      rightStandShadow.position.y = 0.01;
      rightStandGroup.add(rightStandShadow);

      // Floating Dark Bronze Plinth Base
      const rightPlinth = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.10, 0.78), darkBronzeMat);
      rightPlinth.position.set(0, 0.05, 0);

      // Smoked Oak 2-Drawer Body
      const rightCabinet = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.46, 0.86), smokedOakMat);
      rightCabinet.position.set(0, 0.33, 0);

      // Drawer Face Divides & Recessed Brushed Antique Gold Finger Pulls
      for (const dy of [0.22, 0.44]) {
        const drawerPull = new THREE.Mesh(
          new THREE.BoxGeometry(0.03, 0.016, 0.16),
          antiqueGoldMat
        );
        drawerPull.position.set(-0.28, dy, 0);
        rightStandGroup.add(drawerPull);
      }

      // Honed Nero Marquina Marble Slab Top with Polished Bullnose Rim
      const rightMarbleTop = new THREE.Mesh(
        new THREE.BoxGeometry(0.57, 0.035, 0.89),
        neroMarquinaMat
      );
      rightMarbleTop.position.set(0, 0.58, 0);
      rightStandGroup.add(rightPlinth, rightCabinet, rightMarbleTop);

      // Editorial Object A: Modern Fluted Bronze Table Lamp with Frosted Glass Drum
      const lampGroup = new THREE.Group();
      lampGroup.position.set(0.06, 0.60, -0.16);

      const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 0.05, 24), darkBronzeMat);
      lampBase.position.y = 0.025;
      const lampStem = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.24, 16), antiqueGoldMat);
      lampStem.position.y = 0.17;
      const lampShade = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.18, 24), frostedGlassMat);
      lampShade.position.y = 0.34;

      // Warm Internal Lamp Light
      const lampBulb = new THREE.Mesh(
        new THREE.SphereGeometry(0.03, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0xffe6b0 })
      );
      lampBulb.position.y = 0.34;

      const lampPoint = new THREE.PointLight(0xffe2a4, 1.6, 3.5, 1.8);
      lampPoint.position.y = 0.34;

      lampGroup.add(lampBase, lampStem, lampShade, lampBulb, lampPoint);
      rightStandGroup.add(lampGroup);

      // Editorial Object B: Smoked Crystal Bedside Water Carafe & Inverted Tumbler Glass
      const carafeGroup = new THREE.Group();
      carafeGroup.position.set(-0.08, 0.60, 0.22);

      const carafeBody = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 0.16, 20), smokedCrystalMat);
      carafeBody.position.y = 0.08;
      const carafeNeck = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.038, 0.06, 20), smokedCrystalMat);
      carafeNeck.position.y = 0.19;
      const tumblerGlass = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.03, 0.08, 20), smokedCrystalMat);
      tumblerGlass.position.y = 0.24;

      carafeGroup.add(carafeBody, carafeNeck, tumblerGlass);
      rightStandGroup.add(carafeGroup);

      // Editorial Object C: Machined Brass Catchall Tray
      const tray = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.06, 0.015, 24), antiqueGoldMat);
      tray.position.set(0.12, 0.605, 0.20);
      rightStandGroup.add(tray);

      roomGroup.add(rightStandGroup);

      // --- LEFT NIGHTSTAND: FLUTED CALACATTA MARBLE & BRUSHED GOLD PEDESTAL TABLE ---
      const leftStandGroup = new THREE.Group();
      leftStandGroup.position.set(6.4, 0, -2.35);

      // Grounding Contact Shadow
      const leftStandShadow = new THREE.Mesh(
        new THREE.PlaneGeometry(0.80, 0.80),
        new THREE.MeshBasicMaterial({ color: 0x120c08, transparent: true, opacity: 0.50, depthWrite: false })
      );
      leftStandShadow.rotation.x = -Math.PI / 2;
      leftStandShadow.position.y = 0.01;
      leftStandGroup.add(leftStandShadow);

      // Fluted Calacatta Marble Column Pedestal Base
      const marbleColumn = new THREE.Mesh(
        new THREE.CylinderGeometry(0.14, 0.16, 0.54, 32),
        calacattaConsoleMat
      );
      marbleColumn.position.y = 0.27;

      // Brushed Antique Gold Pedestal Top Disc with Raised Lip
      const goldDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.035, 32), antiqueGoldMat);
      goldDisc.position.y = 0.56;

      const goldDiscLip = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.012, 12, 32), antiqueGoldMat);
      goldDiscLip.rotation.x = Math.PI / 2;
      goldDiscLip.position.y = 0.575;

      leftStandGroup.add(marbleColumn, goldDisc, goldDiscLip);

      // Editorial Object D: Stack of 2 Hardcover Fashion Monographs
      const book1 = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.035, 0.30), bookCharcoalMat);
      book1.position.set(0, 0.595, 0.02);
      const book2 = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.030, 0.28), bookTerracottaMat);
      book2.position.set(0.01, 0.628, 0.02);
      book2.rotation.y = 0.18; // casual natural angle

      // Editorial Object E: Amber Glass Candle Dish
      const candleDish = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.045, 0.06, 20), amberGlassMat);
      candleDish.position.set(-0.12, 0.61, -0.10);

      leftStandGroup.add(book1, book2, candleDish);
      roomGroup.add(leftStandGroup);

      // 4. DUAL-DROP MINIMALIST PENDANT LUMINAIRE (Over Right Nightstand)
      const pGroup = new THREE.Group();
      pGroup.position.set(6.4, roomH, 2.35);
      versacePendantGroup = pGroup;

      const canopy = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.03, 20), darkBronzeMat);
      pGroup.add(canopy);

      // Staggered Braided Cords with Brass Socket Sleeves and Frosted Opal Glass Globes
      const drops = [
        { x: -0.09, z: 0, cordH: 4.3, dropY: -4.3, r: 0.14 },
        { x: 0.09, z: 0.05, cordH: 4.7, dropY: -4.7, r: 0.12 },
      ];

      drops.forEach((d) => {
        // Cord
        const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, d.cordH, 12), darkBronzeMat);
        cord.position.set(d.x, -d.cordH / 2, d.z);

        // Brass Socket Sleeve
        const socket = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.08, 16), antiqueGoldMat);
        socket.position.set(d.x, d.dropY + 0.04, d.z);

        // Frosted Opal Globe
        const globe = new THREE.Mesh(new THREE.SphereGeometry(d.r, 24, 24), frostedGlassMat);
        globe.position.set(d.x, d.dropY - d.r + 0.02, d.z);

        // Emissive Core Inside Globe
        const core = new THREE.Mesh(
          new THREE.SphereGeometry(d.r * 0.45, 16, 16),
          new THREE.MeshBasicMaterial({ color: 0xffeec2 })
        );
        core.position.set(d.x, d.dropY - d.r + 0.02, d.z);

        pGroup.add(cord, socket, globe, core);
      });

      // Dedicated Warm Spotlight Pooling onto the Right Nightstand
      const pendantSpot = new THREE.SpotLight(0xffe8b4, 3.2, 12, Math.PI / 4, 0.48);
      pendantSpot.position.set(0, -4.5, 0);
      pendantSpot.target = rightMarbleTop;
      pGroup.add(pendantSpot);
      roomGroup.add(pGroup);

      // Bed Accent Downlight: Warm gentle wash illuminating the duvet, runner & pillows
      const bedAccentSpot = new THREE.SpotLight(0xffecd0, 0.75, 14, Math.PI / 3.5, 0.5);
      bedAccentSpot.position.set(4.8, roomH - 0.2, 0);
      bedAccentSpot.target = duvetBody;
      roomGroup.add(bedAccentSpot);

      // 5. Micro-Dust Motes Floating in Spotlight Cone
      const vDustGeo = new THREE.BufferGeometry();
      const vDustPos = new Float32Array(versaceDustCount * 3);
      for (let i = 0; i < versaceDustCount; i++) {
        vDustPos[i * 3 + 0] = 6.4 + (Math.random() - 0.5) * 1.8;
        vDustPos[i * 3 + 1] = 0.8 + Math.random() * 3.8;
        vDustPos[i * 3 + 2] = 2.35 + (Math.random() - 0.5) * 1.8;
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

      scene.add(roomGroup);
      return roomGroup;
    };

    // -------------------------------------------------------------------------
    // CHAMBER III: SACRED SANCTUM (Mandir Altar, Gayatri Wall, Backlit Onyx Halo)
    // -------------------------------------------------------------------------
    const buildSacredSanctumChamber = () => {
      const { roomGroup, roomW, roomD, roomH, wallMat } = buildRoomShell(
        -hallWidth / 2,
        -70,
        -1,
        0xf4ece2,
        sanctumFloorMarbleMat // Polished Italian Calacatta marble floor with fog: false
      );

      // Intimate Pooja Room Sanctuary Alcove:
      // Depth extends from entrance at X = +5.20 to back altar wall at X = -2.80
      // Width extends from right wall Z = -2.65 to left Gayatri wall Z = +2.65
      const backX = -2.80;
      const alcoveHalfW = 2.65;
      const alcoveDepth = 5.20 - backX; // 8.0m

      // 1. CEILING: Fluted dark teakwood acoustic slats with architectural track spotlights
      const teakMat = new THREE.MeshStandardMaterial({
        color: 0x2c1b12,
        roughness: 0.50,
        metalness: 0.04,
        fog: false,
      });

      // Ceiling slats spanning across Z from -alcoveHalfW to +alcoveHalfW
      for (let sz = -alcoveHalfW + 0.15; sz <= alcoveHalfW - 0.15; sz += 0.28) {
        const slat = new THREE.Mesh(new THREE.BoxGeometry(alcoveDepth + 0.2, 0.08, 0.14), teakMat);
        slat.position.set((5.20 + backX) / 2, roomH - 0.04, sz);
        roomGroup.add(slat);
      }

      // Ceiling Track Spotlight Bar in Dark Bronze
      const trackBar = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.04, 3.8), darkBronzeMat);
      trackBar.position.set(-1.60, roomH - 0.10, 0);
      roomGroup.add(trackBar);

      // 3 Directional Track Downlights aiming directly at the Mandir Altar & Idols
      for (const sz of [-1.10, 0, 1.10]) {
        const fixture = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.14, 16), darkBronzeMat);
        fixture.position.set(-1.60, roomH - 0.17, sz);
        fixture.rotation.z = -0.22;

        const fixtureRim = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.008, 12, 16), antiqueGoldMat);
        fixtureRim.position.set(-1.60, roomH - 0.24, sz);
        fixtureRim.rotation.x = Math.PI / 2;

        const fixtureLens = new THREE.Mesh(new THREE.CircleGeometry(0.045, 12), coveLightMat);
        fixtureLens.position.set(-1.60, roomH - 0.24, sz);
        fixtureLens.rotation.x = Math.PI / 2;
        roomGroup.add(fixture, fixtureRim, fixtureLens);
      }

      // 2. BACK WALL: Fine mineral acoustic plaster in soft travertine tone (matches real photo)
      const plasterBack = new THREE.Mesh(new THREE.PlaneGeometry(alcoveHalfW * 2 + 0.2, roomH), sanctumPlasterMat);
      plasterBack.position.set(backX + 0.02, roomH / 2, 0);
      plasterBack.rotation.y = Math.PI / 2;
      roomGroup.add(plasterBack);

      // Outer room backdrop plaster wall
      const outerBackWall = new THREE.Mesh(new THREE.PlaneGeometry(roomD, roomH), sanctumPlasterMat);
      outerBackWall.position.set(-roomW / 2 + 0.02, roomH / 2, 0);
      outerBackWall.rotation.y = Math.PI / 2;
      roomGroup.add(outerBackWall);

      // 3. ILLUMINATED BACKLIT SACRED ONYX HALO DISC (Lord Venkateswara / Tirupati Balaji)
      const haloGroup = new THREE.Group();
      haloGroup.position.set(backX + 0.08, 3.45, 0);

      // Main Backlit Onyx Disc with sacred Tirupati Balaji iconography (Faces +X towards viewer)
      const haloGeo = new THREE.CircleGeometry(1.15, 64);
      const haloDisc = new THREE.Mesh(haloGeo, sacredHaloMat);
      haloDisc.position.set(0.015, 0, 0);
      haloDisc.rotation.y = Math.PI / 2;
      haloGroup.add(haloDisc);

      // Brushed Antique Gold Outer Framing Bezel Ring
      const haloBezel = new THREE.Mesh(
        new THREE.TorusGeometry(1.16, 0.024, 16, 64),
        antiqueGoldMat
      );
      haloBezel.position.set(0.020, 0, 0);
      haloBezel.rotation.y = Math.PI / 2;
      haloGroup.add(haloBezel);

      // Inner Satin Gold Fillet Ring
      const haloInnerRing = new THREE.Mesh(
        new THREE.TorusGeometry(1.12, 0.008, 12, 64),
        antiqueGoldMat
      );
      haloInnerRing.position.set(0.022, 0, 0);
      haloInnerRing.rotation.y = Math.PI / 2;
      haloGroup.add(haloInnerRing);

      // Soft Indirect Corona Backlight behind the halo disc
      const haloCoronaLight = new THREE.PointLight(0xffdd94, 0.8, 3.8, 1.8);
      haloCoronaLight.position.set(-0.04, 0, 0);
      haloGroup.add(haloCoronaLight);

      roomGroup.add(haloGroup);

      // 4. TWIN HANGING TEMPLE BELLS (GHANTI) FLANKING THE HALO
      // Suspended on slender antique brass chains from the teak slat ceiling
      for (const bz of [-1.65, 1.65]) {
        const bellGroup = new THREE.Group();
        bellGroup.position.set(-2.15, 0, bz);

        // Slender Brass Chain from ceiling (Y = 7.10 down to Y = 2.45)
        const chainH = roomH - 2.45;
        const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, chainH), antiqueGoldMat);
        chain.position.set(0, roomH - chainH / 2, 0);

        // Suspension Loop Ring
        const loop = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.008, 12, 16), antiqueGoldMat);
        loop.position.set(0, 2.44, 0);

        // Bell Body with Flared Rim
        const bellBody = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.13, 0.18, 24), antiqueGoldMat);
        bellBody.position.set(0, 2.30, 0);

        const bellRim = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.016, 12, 24), antiqueGoldMat);
        bellRim.position.set(0, 2.21, 0);
        bellRim.rotation.x = Math.PI / 2;

        // Spherical Brass Clapper
        const clapper = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 12), antiqueGoldMat);
        clapper.position.set(0, 2.16, 0);

        bellGroup.add(chain, loop, bellBody, bellRim, clapper);
        roomGroup.add(bellGroup);
      }

      // 5. LEFT FEATURE WALL (Z = +alcoveHalfW): LASER-ETCHED GAYATRI MANTRA & OM MANDALA
      // Exact recreation of Gopal Lahoti's signature Sacred Sanctum feature wall
      // Placed immediately along the left wall of the intimate pooja chamber
      const gayatriPanel = new THREE.Mesh(
        new THREE.PlaneGeometry(alcoveDepth + 0.1, roomH - 0.2),
        gayatriWallMat
      );
      gayatriPanel.position.set((5.20 + backX) / 2, roomH / 2, alcoveHalfW - 0.02);
      gayatriPanel.rotation.y = Math.PI; // Face inward into sanctuary (-Z)
      roomGroup.add(gayatriPanel);

      // Dedicated architectural graze wash light highlighting the Sanskrit Devanagari text
      const mantraWashLight = new THREE.SpotLight(0xfff6e4, 1.8, 10, Math.PI / 3, 0.45);
      mantraWashLight.position.set((5.20 + backX) / 2, roomH - 0.25, alcoveHalfW - 1.2);
      mantraWashLight.target = gayatriPanel;
      roomGroup.add(mantraWashLight);

      // 6. RIGHT FEATURE WALL (Z = -alcoveHalfW): Warm Teak Acoustic Slat & Plaster Wall
      const rightWall = new THREE.Mesh(
        new THREE.PlaneGeometry(alcoveDepth + 0.1, roomH - 0.2),
        teakMat
      );
      rightWall.position.set((5.20 + backX) / 2, roomH / 2, -alcoveHalfW + 0.02);
      roomGroup.add(rightWall);

      // Pair of warm brass architectural sconces on the right wall
      for (const sx of [0.4, 3.2]) {
        const sconce = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.36, 0.06), antiqueGoldMat);
        sconce.position.set(sx, 2.6, -alcoveHalfW + 0.05);
        roomGroup.add(sconce);
      }

      // 7. SACRED PRAYER RUG (AASAN) ON FLOOR
      const prayerRugGroup = new THREE.Group();
      prayerRugGroup.position.set(-0.65, 0, 0);

      // Grounding Ambient Contact Shadow under Rug
      const rugShadow = new THREE.Mesh(
        new THREE.PlaneGeometry(2.4, 3.8),
        new THREE.MeshBasicMaterial({ color: 0x140c06, transparent: true, opacity: 0.52, depthWrite: false })
      );
      rugShadow.rotation.x = -Math.PI / 2;
      rugShadow.position.y = 0.003;

      // Primary Woven Maroon & Gold Silk Rug Plane
      const prayerRug = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 3.6), sanctumPrayerRugMat);
      prayerRug.rotation.x = -Math.PI / 2;
      prayerRug.position.y = 0.008;

      // Raised Border Lip / Pile Thickness Reveal
      const rugLipMat = new THREE.MeshStandardMaterial({ color: 0x241610, roughness: 0.85, fog: false });
      const rLipN = new THREE.Mesh(new THREE.BoxGeometry(2.24, 0.015, 0.04), rugLipMat);
      rLipN.position.set(0, 0.012, 1.81);
      const rLipS = new THREE.Mesh(new THREE.BoxGeometry(2.24, 0.015, 0.04), rugLipMat);
      rLipS.position.set(0, 0.012, -1.81);
      const rLipW = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.015, 3.64), rugLipMat);
      rLipW.position.set(-1.11, 0.012, 0);
      const rLipE = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.015, 3.64), rugLipMat);
      rLipE.position.set(1.11, 0.012, 0);

      prayerRugGroup.add(rugShadow, prayerRug, rLipN, rLipS, rLipW, rLipE);
      roomGroup.add(prayerRugGroup);

      // 8. REAL 3D MANDIR CONSOLE & ALTAR ENSEMBLE
      // Centered against the travertine back wall at local X = -2.05
      const mandirGroup = new THREE.Group();
      mandirGroup.position.set(-2.05, 0, 0);

      // Deep Grounding Contact Shadow under Mandir Base
      const mandirShadow = new THREE.Mesh(
        new THREE.PlaneGeometry(1.05, 3.8),
        new THREE.MeshBasicMaterial({ color: 0x120a06, transparent: true, opacity: 0.62, depthWrite: false })
      );
      mandirShadow.rotation.x = -Math.PI / 2;
      mandirShadow.position.set(0, 0.004, 0);
      mandirGroup.add(mandirShadow);

      // 8 Sculpted Dark Bronze / Satin Brass Raised Tapered Feet (0.08m high)
      for (const fx of [-0.34, 0.34]) {
        for (const fz of [-1.65, -0.55, 0.55, 1.65]) {
          const footBase = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.035, 0.08, 16), darkBronzeMat);
          footBase.position.set(fx, 0.04, fz);
          const footGlide = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.015, 16), antiqueGoldMat);
          footGlide.position.set(fx, 0.008, fz);
          mandirGroup.add(footBase, footGlide);
        }
      }

      // Coral Terracotta Lacquered Console Cabinet Body
      const consoleBody = new THREE.Mesh(
        new THREE.BoxGeometry(0.78, 0.98, 3.60),
        mandirCoralDoorMat
      );
      consoleBody.position.set(0, 0.57, 0);
      mandirGroup.add(consoleBody);

      // 4 Capsule-Arch Fluted Doors with Concealed Recessed Gold Pull Handles
      const doorW = 0.88;
      const doorH = 0.96;
      for (let i = 0; i < 4; i++) {
        const dz = -1.32 + i * 0.88;

        // Fluted door panel textured with capsule arch relief
        const doorPanel = new THREE.Mesh(
          new THREE.BoxGeometry(0.04, doorH, doorW - 0.015),
          mandirCoralDoorMat
        );
        doorPanel.position.set(0.41, 0.57, dz);

        // Minimalist Horizontal Recessed Brushed Gold Pull Handle near top
        const handle = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.02, 0.12), antiqueGoldMat);
        handle.position.set(0.435, 0.95, dz);

        // Subtle dark shadow line between doors
        if (i < 3) {
          const doorGap = new THREE.Mesh(new THREE.BoxGeometry(0.045, doorH, 0.006), darkBronzeMat);
          doorGap.position.set(0.41, 0.57, dz + doorW / 2);
          mandirGroup.add(doorGap);
        }

        mandirGroup.add(doorPanel, handle);
      }

      // Inset Satin Gold Reveal Bead between Cabinet and Marble Slab
      const revealBead = new THREE.Mesh(new THREE.BoxGeometry(0.80, 0.018, 3.64), antiqueGoldMat);
      revealBead.position.set(0, 1.07, 0);
      mandirGroup.add(revealBead);

      // Polished Pure White Statuario Marble Slab Countertop with Bullnose Rim
      const marbleTop = new THREE.Mesh(
        new THREE.BoxGeometry(0.88, 0.06, 3.76),
        mandirCountertopMat
      );
      marbleTop.position.set(0, 1.11, 0);
      mandirGroup.add(marbleTop);

      // 9. ALTAR CEREMONIAL ARTIFACTS & SACRED OFFERINGS

      // A. Royal Red Silk Ceremonial Aasan Cloth with Gold Border
      const aasanCloth = new THREE.Mesh(
        new THREE.BoxGeometry(0.66, 0.012, 2.80),
        new THREE.MeshStandardMaterial({ color: 0xa81420, roughness: 0.75, fog: false })
      );
      aasanCloth.position.set(0.02, 1.145, 0);

      const aasanGoldBorder1 = new THREE.Mesh(new THREE.BoxGeometry(0.67, 0.014, 0.025), antiqueGoldMat);
      aasanGoldBorder1.position.set(0.02, 1.146, 1.40);
      const aasanGoldBorder2 = new THREE.Mesh(new THREE.BoxGeometry(0.67, 0.014, 0.025), antiqueGoldMat);
      aasanGoldBorder2.position.set(0.02, 1.146, -1.40);
      mandirGroup.add(aasanCloth, aasanGoldBorder1, aasanGoldBorder2);

      // B. Sculpted Brass Lord Ganesha Deity Idol (Center)
      const idolGroup = new THREE.Group();
      idolGroup.position.set(0.02, 1.15, 0);

      // Stepped Lotus Pedestal (Padma Peetham)
      const peethamBase = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 0.045, 24), antiqueGoldMat);
      peethamBase.position.y = 0.022;
      const peethamMid = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.23, 0.035, 24), antiqueGoldMat);
      peethamMid.position.y = 0.06;
      const peethamTop = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.19, 0.03, 24), antiqueGoldMat);
      peethamTop.position.y = 0.09;

      // Sculpted Ganesha Form: Torso, Arms, Head, Curved Trunk, Modak, and Ornate Royal Crown
      const ganeshaTorso = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.17, 0.22, 20), antiqueGoldMat);
      ganeshaTorso.position.y = 0.21;

      const ganeshaHead = new THREE.Mesh(new THREE.SphereGeometry(0.11, 20, 20), antiqueGoldMat);
      ganeshaHead.position.set(0.02, 0.38, 0);

      // Sacred Curved Elephant Trunk (Vakratunda)
      const trunk1 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.12, 16), antiqueGoldMat);
      trunk1.position.set(0.12, 0.34, -0.02);
      trunk1.rotation.z = -0.6;

      const trunk2 = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.038, 0.10, 16), antiqueGoldMat);
      trunk2.position.set(0.16, 0.28, -0.06);
      trunk2.rotation.y = 0.8;
      trunk2.rotation.z = -0.3;

      // Modak in Trunk / Palm
      const modak = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.03, 12), antiqueGoldMat);
      modak.position.set(0.18, 0.29, -0.07);

      // Auspicious Large Ears (Supakarna)
      const earLeft = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.14, 0.10), antiqueGoldMat);
      earLeft.position.set(-0.02, 0.40, -0.14);
      earLeft.rotation.y = -0.3;

      const earRight = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.14, 0.10), antiqueGoldMat);
      earRight.position.set(-0.02, 0.40, 0.14);
      earRight.rotation.y = 0.3;

      // 3-Tier Ornate Royal Kireetam Crown
      const crown1 = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 0.08, 20), antiqueGoldMat);
      crown1.position.y = 0.48;
      const crown2 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.085, 0.08, 20), antiqueGoldMat);
      crown2.position.y = 0.55;
      const crown3 = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.10, 16), antiqueGoldMat);
      crown3.position.y = 0.63;

      // Fresh Sacred Marigold Garland encircling Ganesha's base
      const garlandGroup = new THREE.Group();
      const numFlowers = 24;
      for (let m = 0; m < numFlowers; m++) {
        const ma = (m * 2 * Math.PI) / numFlowers;
        const mr = 0.24;
        const flower = new THREE.Mesh(
          new THREE.SphereGeometry(0.026, 12, 12),
          m % 2 === 0 ? marigoldOrangeMat : marigoldYellowMat
        );
        flower.position.set(Math.cos(ma) * mr, 0.04, Math.sin(ma) * mr);
        garlandGroup.add(flower);
      }

      idolGroup.add(
        peethamBase,
        peethamMid,
        peethamTop,
        ganeshaTorso,
        ganeshaHead,
        trunk1,
        trunk2,
        modak,
        earLeft,
        earRight,
        crown1,
        crown2,
        crown3,
        garlandGroup
      );
      mandirGroup.add(idolGroup);

      // C. Left Flank: Ornate Stepped Gold Framed Deity Murti & Chandan Bowl
      const leftDeityFrame = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, 0.42, 0.54),
        antiqueGoldMat
      );
      leftDeityFrame.position.set(0.02, 1.37, -0.85);

      const leftDeityArt = new THREE.Mesh(
        new THREE.PlaneGeometry(0.46, 0.34),
        new THREE.MeshStandardMaterial({ map: texCh3Classic, roughness: 0.25, fog: false })
      );
      leftDeityArt.rotation.y = Math.PI / 2;
      leftDeityArt.position.set(0.042, 1.37, -0.85);

      // Small Hand-Hammered Brass Sindoor/Chandan Bowl (Katori)
      const chandanBowl = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.03, 0.035, 16), antiqueGoldMat);
      chandanBowl.position.set(0.18, 1.17, -0.85);
      mandirGroup.add(leftDeityFrame, leftDeityArt, chandanBowl);

      // D. Right Flank: Standing Brass Sri Venkateswara Murti & Sri Yantra Plaque
      const balajiPedestal = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, 0.44), antiqueGoldMat);
      balajiPedestal.position.set(0.02, 1.17, 0.85);

      const balajiIdol1 = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.06, 0.32, 16), antiqueGoldMat);
      balajiIdol1.position.set(0.02, 1.34, 0.75);
      const balajiCrown1 = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.12, 16), antiqueGoldMat);
      balajiCrown1.position.set(0.02, 1.54, 0.75);

      const balajiIdol2 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.055, 0.30, 16), antiqueGoldMat);
      balajiIdol2.position.set(0.02, 1.33, 0.95);
      const balajiCrown2 = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.11, 16), antiqueGoldMat);
      balajiCrown2.position.set(0.02, 1.52, 0.95);

      const yantraFrame = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.24, 0.24), antiqueGoldMat);
      yantraFrame.position.set(0.02, 1.28, 1.18);
      mandirGroup.add(balajiPedestal, balajiIdol1, balajiCrown1, balajiIdol2, balajiCrown2, yantraFrame);

      // E. Traditional Brass Diya (Oil Lamp) with Real Flickering Flame
      const diyaGroup = new THREE.Group();
      diyaGroup.position.set(0.20, 1.15, -0.38);

      const diyaFoot = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.065, 0.02, 16), antiqueGoldMat);
      const diyaStem = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.022, 0.08, 16), antiqueGoldMat);
      diyaStem.position.y = 0.05;

      const diyaBowl = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.03, 0.045, 20), antiqueGoldMat);
      diyaBowl.position.y = 0.10;

      const diyaOil = new THREE.Mesh(
        new THREE.CylinderGeometry(0.075, 0.075, 0.008, 16),
        new THREE.MeshStandardMaterial({ color: 0xc47e22, roughness: 0.15, metalness: 0.4, fog: false })
      );
      diyaOil.position.y = 0.12;

      sanctumFlameMesh = new THREE.Mesh(
        new THREE.ConeGeometry(0.028, 0.09, 16),
        new THREE.MeshBasicMaterial({ color: 0xffaa22 })
      );
      sanctumFlameMesh.position.set(0.06, 0.17, 0);

      sanctumDiyaLight = new THREE.PointLight(0xff9a28, 0.85, 2.5, 2.0);
      sanctumDiyaLight.position.set(0.06, 0.20, 0);

      diyaGroup.add(diyaFoot, diyaStem, diyaBowl, diyaOil, sanctumFlameMesh, sanctumDiyaLight);
      mandirGroup.add(diyaGroup);

      // F. Ceremonial Brass Bell (Ghanti) & Carved Agarbatti Stand
      const ghantiGroup = new THREE.Group();
      ghantiGroup.position.set(0.20, 1.15, 0.38);

      const bellBase = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.065, 0.08, 20), antiqueGoldMat);
      bellBase.position.y = 0.04;
      const bellHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.012, 0.12, 16), antiqueGoldMat);
      bellHandle.position.y = 0.14;
      const garudaFinial = new THREE.Mesh(new THREE.ConeGeometry(0.022, 0.05, 12), antiqueGoldMat);
      garudaFinial.position.y = 0.22;
      ghantiGroup.add(bellBase, bellHandle, garudaFinial);

      // Agarbatti Burner with Glowing Incense Sticks
      const agarbattiStand = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.03, 16), antiqueGoldMat);
      agarbattiStand.position.set(0, 0.015, 0.14);
      for (let s = -1; s <= 1; s++) {
        const stick = new THREE.Mesh(
          new THREE.CylinderGeometry(0.003, 0.003, 0.18, 8),
          new THREE.MeshStandardMaterial({ color: 0x3d281a, roughness: 0.9, fog: false })
        );
        stick.position.set(s * 0.015, 0.09, 0.14);
        stick.rotation.z = s * 0.12;

        const glowingTip = new THREE.Mesh(
          new THREE.SphereGeometry(0.005, 8, 8),
          new THREE.MeshBasicMaterial({ color: 0xff3300 })
        );
        glowingTip.position.set(s * 0.022, 0.18, 0.14);
        ghantiGroup.add(stick, glowingTip);
      }
      ghantiGroup.add(agarbattiStand);
      mandirGroup.add(ghantiGroup);

      roomGroup.add(mandirGroup);

      // 10. RISING INCENSE SMOKE PARTICLES
      // Incense burner world coordinates:
      // room center is (-13.0, 0, -70.0)
      // mandir is at local X = -2.05, ghanti at local X = -2.05 + 0.20 = -1.85, Z = 0.38 + 0.14 = 0.52
      incenseOrigin.set(-14.85, 1.25, -69.48);

      const incGeo = new THREE.BufferGeometry();
      const incPos = new Float32Array(incenseCount * 3);
      for (let i = 0; i < incenseCount; i++) {
        incPos[i * 3 + 0] = incenseOrigin.x + (Math.random() - 0.5) * 0.05;
        incPos[i * 3 + 1] = 1.15 + (i / incenseCount) * 1.5;
        incPos[i * 3 + 2] = incenseOrigin.z + (Math.random() - 0.5) * 0.05;
      }
      incGeo.setAttribute("position", new THREE.BufferAttribute(incPos, 3));
      incenseParticles = new THREE.Points(
        incGeo,
        new THREE.PointsMaterial({
          color: 0xe0d6c4,
          size: 0.045,
          transparent: true,
          opacity: 0.60,
          blending: THREE.NormalBlending,
        })
      );
      roomGroup.add(incenseParticles);

      scene.add(roomGroup);
      return roomGroup;
    };

    // -------------------------------------------------------------------------
    // CHAMBER IV: CORPORATE RECEPTION (Sculptural Bronze Desk, Linear Pendant, Lounge)
    // -------------------------------------------------------------------------
    const buildCorporateReceptionChamber = () => {
      const { roomGroup, roomW, roomD, roomH, wallMat } = buildRoomShell(
        hallWidth / 2,
        -95,
        1,
        0x361d28, // deep rich aubergine wall base
        sanctumFloorMarbleMat // Italian Calacatta Gold marble tiles with fog: false
      );
      wallMat.fog = false;

      // 1. CEILING: Clean crisp architectural ceiling with surface-mounted track lighting
      const trackBar1 = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 0.03, 5.4),
        receptionBronzeMat
      );
      trackBar1.position.set(0.90, roomH - 0.03, -0.60);
      roomGroup.add(trackBar1);

      // Track canisters with warm directional spot pool
      const trackTargets = [
        [-1.60, 0.15, new THREE.Vector3(2.8, 3.6, -1.4)], // aiming at insignia
        [-0.40, -0.10, new THREE.Vector3(1.3, 0.9, 0.2)], // aiming at bronze desk
        [0.80, -0.35, new THREE.Vector3(1.2, 0.4, 2.3)], // aiming at lounge / stag
      ] as [number, number, THREE.Vector3][];

      for (const [tz, trotY] of trackTargets) {
        const can = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.045, 0.13, 16), receptionBronzeMat);
        can.position.set(0.90, roomH - 0.10, tz);
        can.rotation.x = 0.25;
        can.rotation.y = trotY;
        const canRim = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.007, 12, 16), receptionGoldMat);
        canRim.position.set(0.90, roomH - 0.16, tz);
        canRim.rotation.x = Math.PI / 2;
        const canLens = new THREE.Mesh(new THREE.CircleGeometry(0.04, 12), coveLightMat);
        canLens.position.set(0.90, roomH - 0.16, tz);
        canLens.rotation.x = Math.PI / 2;
        roomGroup.add(can, canRim, canLens);
      }

      // 2. BACK FEATURE WALL (At local X = +3.20, spanning Z from -4.0 to +2.8)
      // Deep plum/aubergine architectural wall paneling
      const featureBackWall = new THREE.Mesh(
        new THREE.PlaneGeometry(6.8, roomH),
        aubergineWallMat
      );
      featureBackWall.position.set(3.20, roomH / 2, -0.60);
      featureBackWall.rotation.y = -Math.PI / 2;
      roomGroup.add(featureBackWall);

      // Horizontal architectural reveal battens on plum wall
      for (const yLevel of [1.65, 2.45]) {
        const revealBatten = new THREE.Mesh(
          new THREE.BoxGeometry(0.02, 0.035, 6.78),
          receptionBronzeMat
        );
        revealBatten.position.set(3.18, yLevel, -0.60);
        roomGroup.add(revealBatten);
      }

      // 3. GLAZED TERRACOTTA HERRINGBONE TILE PANEL
      // Behind desk: runs floor to ceiling, width 1.65m, centered at Z = -1.40
      const herringbonePanel = new THREE.Mesh(
        new THREE.PlaneGeometry(1.65, roomH),
        terracottaHerringboneMat
      );
      herringbonePanel.position.set(3.16, roomH / 2, -1.40);
      herringbonePanel.rotation.y = -Math.PI / 2;

      // Dark bronze slim perimeter reveals framing the terracotta tile panel
      const hbFrameL = new THREE.Mesh(new THREE.BoxGeometry(0.03, roomH, 0.04), receptionBronzeMat);
      hbFrameL.position.set(3.15, roomH / 2, -1.40 - 1.65 / 2);
      const hbFrameR = new THREE.Mesh(new THREE.BoxGeometry(0.03, roomH, 0.04), receptionBronzeMat);
      hbFrameR.position.set(3.15, roomH / 2, -1.40 + 1.65 / 2);
      roomGroup.add(herringbonePanel, hbFrameL, hbFrameR);

      // 4. ILLUMINATED "SHALU'S LAXMI GROUP OF COMPANIES" INSIGNIA SHIELD
      const insigniaGroup = new THREE.Group();
      insigniaGroup.position.set(3.14, 3.65, -1.40);
      insigniaGroup.rotation.y = -Math.PI / 2;

      // Primary Illuminated Insignia Graphic Face (transparent shield on terracotta tile)
      const insigniaFace = new THREE.Mesh(
        new THREE.PlaneGeometry(1.25, 1.20),
        laxmiInsigniaMat
      );
      insigniaFace.position.z = 0.015;

      insigniaGroup.add(insigniaFace);

      // Soft Backlit Golden Corona Light behind insignia on terracotta tile
      const insigniaHaloLight = new THREE.PointLight(0xffdf99, 0.95, 3.0);
      insigniaHaloLight.position.set(3.15, 3.65, -1.40);
      roomGroup.add(insigniaGroup, insigniaHaloLight);

      // 5. LEFT POWDER PINK FLOATING CREDENZA (Z = -2.85)
      const pinkCredenzaGroup = new THREE.Group();
      pinkCredenzaGroup.position.set(2.80, 1.02, -2.85);

      // Powder pink lacquer dual-drawer body
      const credenzaBody = new THREE.Mesh(
        new THREE.BoxGeometry(0.48, 0.38, 1.30),
        powderPinkLacquerMat
      );

      // Drawer divider reveal seam
      const drawerSeam = new THREE.Mesh(
        new THREE.BoxGeometry(0.485, 0.012, 1.28),
        receptionBronzeMat
      );

      // Dual brushed brass spherical knobs
      const knob1 = new THREE.Mesh(new THREE.SphereGeometry(0.016, 16, 16), receptionGoldMat);
      knob1.position.set(-0.25, 0.07, -0.32);
      const knob2 = new THREE.Mesh(new THREE.SphereGeometry(0.016, 16, 16), receptionGoldMat);
      knob2.position.set(-0.25, 0.07, 0.32);

      // Open dark bronze tubular steel support framework below
      const frameLower = new THREE.Mesh(
        new THREE.BoxGeometry(0.46, 0.03, 1.28),
        receptionBronzeMat
      );
      frameLower.position.set(0, -0.58, 0);

      const frameLeg1 = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.58), receptionBronzeMat);
      frameLeg1.position.set(-0.20, -0.29, -0.60);
      const frameLeg2 = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.58), receptionBronzeMat);
      frameLeg2.position.set(-0.20, -0.29, 0.60);

      // Drop contact shadow on floor under credenza
      const credenzaShadow = new THREE.Mesh(
        new THREE.PlaneGeometry(0.60, 1.45),
        new THREE.MeshBasicMaterial({ color: 0x140e0a, transparent: true, opacity: 0.40, depthWrite: false })
      );
      credenzaShadow.rotation.x = -Math.PI / 2;
      credenzaShadow.position.set(0, -1.018, 0);

      pinkCredenzaGroup.add(credenzaBody, drawerSeam, knob1, knob2, frameLower, frameLeg1, frameLeg2, credenzaShadow);
      roomGroup.add(pinkCredenzaGroup);

      // Modern metallic triple switch plate on plum wall above credenza
      const switchPlate = new THREE.Mesh(
        new THREE.BoxGeometry(0.02, 0.12, 0.22),
        receptionGoldMat
      );
      switchPlate.position.set(3.18, 1.65, -2.55);
      roomGroup.add(switchPlate);

      // 6. BESPOKE RECEPTION DESK (Antique Bronze Monolith + Cantilever Wenge Waterfall)
      const deskGroup = new THREE.Group();
      deskGroup.position.set(1.25, 0, 0);

      // --- A) Sculptural Brushed Antique Bronze Monolith Shield (Right Volume) ---
      const shieldW = 1.15; // along Z
      const shieldH = 1.22; // height
      const shieldD = 0.24; // depth in X
      const shieldZ = 0.30; // centered at Z = 0.30

      const bronzeShield = new THREE.Mesh(
        new THREE.BoxGeometry(shieldD, shieldH, shieldW),
        sculpturalBronzeDeskMat
      );
      bronzeShield.position.set(0, shieldH / 2, shieldZ);

      // Vertical shadow reveal groove down the right-hand third
      const revealGroove = new THREE.Mesh(
        new THREE.BoxGeometry(shieldD + 0.01, shieldH, 0.022),
        receptionBronzeMat
      );
      revealGroove.position.set(0, shieldH / 2, shieldZ + 0.32);

      // "Reception" Plaque / Lettering near top right
      const receptionPlaque = new THREE.Mesh(
        new THREE.BoxGeometry(0.02, 0.08, 0.42),
        receptionGoldMat
      );
      receptionPlaque.position.set(-shieldD / 2 - 0.012, shieldH - 0.16, shieldZ + 0.22);

      // Grounding contact shadow under bronze monolith
      const shieldShadow = new THREE.Mesh(
        new THREE.PlaneGeometry(shieldD + 0.25, shieldW + 0.25),
        new THREE.MeshBasicMaterial({ color: 0x140e0a, transparent: true, opacity: 0.55, depthWrite: false })
      );
      shieldShadow.rotation.x = -Math.PI / 2;
      shieldShadow.position.set(0, 0.003, shieldZ);

      // Dramatic warm metallic spotlight on the front face of bronze monolith
      const bronzeMonolithSpot = new THREE.SpotLight(0xfffae6, 3.2, 12, Math.PI / 3.8, 0.45);
      bronzeMonolithSpot.position.set(-1.40, 3.6, shieldZ);
      bronzeMonolithSpot.target = bronzeShield;
      deskGroup.add(bronzeShield, revealGroove, receptionPlaque, shieldShadow, bronzeMonolithSpot);

      // --- B) Cantilevered Wenge Waterfall Desktop (Left Volume) ---
      // Extends from Z = -2.05 to Z = +0.10 (penetrating inside the bronze monolith)
      const deskLen = 2.15;
      const deskDepth = 0.82;
      const deskThick = 0.055;
      const deskY = 0.76;
      const deskZCenter = -2.05 + deskLen / 2; // -0.975

      const wengeTop = new THREE.Mesh(
        new THREE.BoxGeometry(deskDepth, deskThick, deskLen),
        wengeTimberMat
      );
      wengeTop.position.set(0.12, deskY - deskThick / 2, deskZCenter);

      // Vertical Waterfall Leg at Left Flank (Z = -2.05)
      const wengeWaterfallLeg = new THREE.Mesh(
        new THREE.BoxGeometry(deskDepth, deskY, deskThick),
        wengeTimberMat
      );
      wengeWaterfallLeg.position.set(0.12, deskY / 2, -2.05 + deskThick / 2);

      // Modesty Panel
      const modestyPanel = new THREE.Mesh(
        new THREE.BoxGeometry(0.03, 0.60, deskLen - 0.15),
        wengeTimberMat
      );
      modestyPanel.position.set(0.48, deskY - 0.33, deskZCenter + 0.05);

      // Contact shadow under waterfall leg
      const legShadow = new THREE.Mesh(
        new THREE.PlaneGeometry(deskDepth + 0.15, 0.25),
        new THREE.MeshBasicMaterial({ color: 0x140e0a, transparent: true, opacity: 0.50, depthWrite: false })
      );
      legShadow.rotation.x = -Math.PI / 2;
      legShadow.position.set(0.12, 0.003, -2.05 + deskThick / 2);

      deskGroup.add(wengeTop, wengeWaterfallLeg, modestyPanel, legShadow);

      // --- C) Desk Accessories & Kinetic Balance Toy ---
      // Executive dark leather blotter pad
      const leatherBlotter = new THREE.Mesh(
        new THREE.BoxGeometry(0.52, 0.012, 0.76),
        new THREE.MeshStandardMaterial({ color: 0x181412, roughness: 0.55, fog: false })
      );
      leatherBlotter.position.set(0.08, deskY + 0.006, -1.15);
      deskGroup.add(leatherBlotter);

      // Modern executive tablet / keyboard folio
      const tablet = new THREE.Mesh(
        new THREE.BoxGeometry(0.22, 0.014, 0.32),
        new THREE.MeshStandardMaterial({ color: 0x222226, roughness: 0.25, metalness: 0.85, fog: false })
      );
      tablet.position.set(0.10, deskY + 0.015, -1.15);
      deskGroup.add(tablet);

      // Kinetic Balancing Gymnast Sculpture (Gold Trapeze Balancer)
      const balanceToyBase = new THREE.Group();
      balanceToyBase.position.set(0.08, deskY, -0.52);

      const toyStand = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.18, 16), receptionGoldMat);
      toyStand.position.y = 0.09;
      const toyFulcrum = new THREE.Mesh(new THREE.SphereGeometry(0.010, 12, 12), receptionGoldMat);
      toyFulcrum.position.y = 0.185;
      balanceToyBase.add(toyStand, toyFulcrum);

      // Swinging arm (rocking pendulum)
      const balanceArmGroup = new THREE.Group();
      balanceArmGroup.position.set(0, 0.185, 0);

      // Stylized gymnast figurine
      const gymnastTorso = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.010, 0.07, 12), receptionGoldMat);
      gymnastTorso.position.y = 0.04;
      const gymnastHead = new THREE.Mesh(new THREE.SphereGeometry(0.012, 12, 12), receptionGoldMat);
      gymnastHead.position.y = 0.085;
      const gymnastLegs = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.06, 8), receptionGoldMat);
      gymnastLegs.position.set(0.015, 0.08, 0);
      gymnastLegs.rotation.z = 0.45;

      // Curved counterweight wire arc
      const arcGeo = new THREE.TorusGeometry(0.12, 0.004, 8, 24, Math.PI);
      const arcWire = new THREE.Mesh(arcGeo, receptionGoldMat);
      arcWire.position.y = 0.01;
      arcWire.rotation.x = Math.PI;

      // Brass counterweight spheres at tips
      const weightL = new THREE.Mesh(new THREE.SphereGeometry(0.015, 12, 12), receptionGoldMat);
      weightL.position.set(-0.12, -0.05, 0);
      const weightR = new THREE.Mesh(new THREE.SphereGeometry(0.015, 12, 12), receptionGoldMat);
      weightR.position.set(0.12, -0.05, 0);

      balanceArmGroup.add(gymnastTorso, gymnastHead, gymnastLegs, arcWire, weightL, weightR);
      balanceToyBase.add(balanceArmGroup);
      deskGroup.add(balanceToyBase);
      corporateKineticToy = balanceArmGroup; // assign for animated physics sway

      // --- D) Executive High-Back Mesh Task Chair (Behind Desk) ---
      const chairGroup = new THREE.Group();
      chairGroup.position.set(0.82, 0, -1.15);
      chairGroup.rotation.y = -Math.PI / 2;

      // 5-Star Castor Base
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.08, 16), receptionBronzeMat);
      hub.position.y = 0.12;
      chairGroup.add(hub);

      for (let a = 0; a < 5; a++) {
        const angle = (a / 5) * Math.PI * 2;
        const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.025, 0.04), receptionBronzeMat);
        spoke.position.set(Math.cos(angle) * 0.16, 0.11, Math.sin(angle) * 0.16);
        spoke.rotation.y = -angle;

        const wheel = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8), new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8 }));
        wheel.position.set(Math.cos(angle) * 0.32, 0.03, Math.sin(angle) * 0.32);
        chairGroup.add(spoke, wheel);
      }

      // Gas-lift piston cylinder
      const piston = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.34, 16), receptionBronzeMat);
      piston.position.y = 0.28;

      // Ergonomic mesh seat cushion
      const chairSeat = new THREE.Mesh(
        new THREE.BoxGeometry(0.54, 0.08, 0.50),
        new THREE.MeshStandardMaterial({ color: 0x181818, roughness: 0.75, fog: false })
      );
      chairSeat.position.set(0, 0.46, 0);

      // Curved high-back mesh backrest
      const chairBack = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 0.72, 0.48),
        new THREE.MeshStandardMaterial({ color: 0x151515, roughness: 0.65, fog: false })
      );
      chairBack.position.set(-0.23, 0.84, 0);

      // Adjustable lumbar support bar
      const lumbar = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.12, 0.42),
        new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.5, fog: false })
      );
      lumbar.position.set(-0.25, 0.68, 0);

      // Sculpted 3D armrests
      for (const az of [-0.26, 0.26]) {
        const armPost = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.22, 0.04), receptionBronzeMat);
        armPost.position.set(-0.05, 0.58, az);
        const armPad = new THREE.Mesh(
          new THREE.BoxGeometry(0.26, 0.03, 0.08),
          new THREE.MeshStandardMaterial({ color: 0x151515, roughness: 0.7, fog: false })
        );
        armPad.position.set(0.04, 0.69, az);
        chairGroup.add(armPost, armPad);
      }

      chairGroup.add(piston, chairSeat, chairBack, lumbar);
      deskGroup.add(chairGroup);
      roomGroup.add(deskGroup);

      // 7. BACK CREDENZA SHELF & DESIGNER COLLECTIBLE ART OBJECTS
      // Behind reception desk to the right, visible beside bronze monolith: X = 2.90, Z = 1.05
      const credenzaRight = new THREE.Mesh(
        new THREE.BoxGeometry(0.38, 0.54, 1.10),
        new THREE.MeshStandardMaterial({ color: 0x241c18, roughness: 0.42, fog: false })
      );
      credenzaRight.position.set(2.90, 0.54 / 2, 1.05);
      roomGroup.add(credenzaRight);

      // --- Glossy Jade / Emerald Bearbrick Collectible Figurine ---
      const bearbrickGroup = new THREE.Group();
      bearbrickGroup.position.set(2.82, 0.54, 0.85);
      bearbrickGroup.rotation.y = -Math.PI / 2;

      // Legs
      for (const lx of [-0.035, 0.035]) {
        const bLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.14, 16), bearbrickJadeMat);
        bLeg.position.set(lx, 0.07, 0);
        bearbrickGroup.add(bLeg);
      }
      // Torso
      const bTorso = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.045, 0.15, 16), bearbrickJadeMat);
      bTorso.position.y = 0.21;
      // Golden belly detail
      const bBelly = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 12), receptionGoldMat);
      bBelly.position.set(0, 0.20, 0.035);
      bBelly.scale.set(1, 1.2, 0.4);
      // Head
      const bHead = new THREE.Mesh(new THREE.SphereGeometry(0.055, 16, 16), bearbrickJadeMat);
      bHead.position.y = 0.32;
      // Snout
      const bSnout = new THREE.Mesh(new THREE.SphereGeometry(0.022, 12, 12), bearbrickJadeMat);
      bSnout.position.set(0, 0.305, 0.042);
      bSnout.scale.set(1.2, 0.8, 0.8);
      // Characteristic Bear Ears
      for (const ex of [-0.05, 0.05]) {
        const bEar = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.012, 16), bearbrickJadeMat);
        bEar.position.set(ex, 0.37, 0);
        bEar.rotation.x = Math.PI / 2;
        bearbrickGroup.add(bEar);
      }
      // Arms
      for (const ax of [-0.065, 0.065]) {
        const bArm = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.13, 12), bearbrickJadeMat);
        bArm.position.set(ax, 0.18, 0);
        bearbrickGroup.add(bArm);
      }
      bearbrickGroup.add(bTorso, bBelly, bHead, bSnout);
      roomGroup.add(bearbrickGroup);

      // --- Brass Geometric Starburst / Stellation Sculpture ---
      const starGroup = new THREE.Group();
      starGroup.position.set(2.82, 0.66, 1.20);
      const starCenter = new THREE.Mesh(new THREE.DodecahedronGeometry(0.04), receptionGoldMat);
      starGroup.add(starCenter);
      for (let s = 0; s < 12; s++) {
        const spike = new THREE.Mesh(new THREE.ConeGeometry(0.018, 0.10, 8), receptionGoldMat);
        const theta = (s / 12) * Math.PI * 2;
        const phi = Math.sin(s * 1.5) * 1.2;
        spike.position.set(Math.cos(theta) * 0.05, Math.sin(phi) * 0.05, Math.sin(theta) * 0.05);
        spike.lookAt(spike.position.clone().multiplyScalar(2));
        starGroup.add(spike);
      }
      roomGroup.add(starGroup);

      // 8. SUSPENDED FLUTED CRYSTAL LINEAR PENDANT LUMINAIRE
      // Suspended directly above reception desk at X = 1.25, Y = 4.40, Z = -0.55
      const pendantGroup = new THREE.Group();
      pendantGroup.position.set(1.25, 4.40, -0.55);

      const luminaireLen = 2.40;
      const luminaireH = 0.15;
      const luminaireW = 0.13;

      // Outer fluted crystal glass prism body
      const crystalBody = new THREE.Mesh(
        new THREE.BoxGeometry(luminaireW, luminaireH, luminaireLen),
        new THREE.MeshPhysicalMaterial({
          color: 0xfffcf5,
          transmission: 0.70,
          opacity: 0.90,
          transparent: true,
          roughness: 0.12,
          ior: 1.55,
          fog: false,
        })
      );

      // Fluted vertical crystal facets along Z
      for (let fz = -luminaireLen / 2 + 0.05; fz <= luminaireLen / 2 - 0.05; fz += 0.07) {
        const facet = new THREE.Mesh(
          new THREE.CylinderGeometry(0.012, 0.012, luminaireH - 0.02, 8),
          receptionGoldMat
        );
        facet.position.set(luminaireW / 2, 0, fz);
        crystalBody.add(facet);
      }

      // Inner warm diffuse LED core (controlled, NO blown-out white blobs)
      const innerLed = new THREE.Mesh(
        new THREE.BoxGeometry(luminaireW - 0.04, luminaireH - 0.04, luminaireLen - 0.06),
        new THREE.MeshStandardMaterial({
          color: 0xfff2da,
          emissive: 0xffe6b8,
          emissiveIntensity: 0.85,
          roughness: 0.20,
          fog: false,
        })
      );

      // Dark bronze end caps
      for (const cz of [-luminaireLen / 2 - 0.01, luminaireLen / 2 + 0.01]) {
        const cap = new THREE.Mesh(new THREE.BoxGeometry(luminaireW + 0.015, luminaireH + 0.015, 0.025), receptionBronzeMat);
        cap.position.set(0, 0, cz);
        pendantGroup.add(cap);
      }

      // Twin suspension aircraft wires up to ceiling (roomH = 7.2m)
      const wireHeight = (roomH - 0.04) - 4.40; // ~2.76m
      for (const wz of [-0.85, 0.85]) {
        const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, wireHeight), receptionBronzeMat);
        wire.position.set(0, wireHeight / 2, wz);
        const canopy = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.02, 16), receptionBronzeMat);
        canopy.position.set(0, wireHeight, wz);
        pendantGroup.add(wire, canopy);
      }

      // Dramatic focused desk downlight pool
      const deskSpot = new THREE.SpotLight(0xfffaea, 2.2, 10, Math.PI / 4, 0.55);
      deskSpot.position.set(0, 0, 0);
      deskSpot.target.position.set(0, -3.6, 0);
      pendantGroup.add(crystalBody, innerLed, deskSpot, deskSpot.target);
      roomGroup.add(pendantGroup);

      // 9. EXECUTIVE GUEST LOUNGE (Plush Plum Velvet Rug, Cognac Armchairs, Tables, Golden Stag)
      const loungeGroup = new THREE.Group();
      loungeGroup.position.set(1.20, 0, 2.35);

      // --- Circular Deep Plum Velvet Rug (2.6m Diameter) ---
      const rugRadius = 1.30;
      const velvetRug = new THREE.Mesh(
        new THREE.CylinderGeometry(rugRadius, rugRadius, 0.016, 48),
        plumVelvetRugMat
      );
      velvetRug.position.y = 0.008;

      // Grounding contact shadow under circular rug
      const rugContactShadow = new THREE.Mesh(
        new THREE.PlaneGeometry(rugRadius * 2.25, rugRadius * 2.25),
        new THREE.MeshBasicMaterial({ color: 0x120c08, transparent: true, opacity: 0.46, depthWrite: false })
      );
      rugContactShadow.rotation.x = -Math.PI / 2;
      rugContactShadow.position.y = 0.002;

      // Raised outer pile lip reveal
      const rugLip = new THREE.Mesh(
        new THREE.TorusGeometry(rugRadius, 0.012, 12, 48),
        plumVelvetRugMat
      );
      rugLip.rotation.x = Math.PI / 2;
      rugLip.position.y = 0.016;

      loungeGroup.add(velvetRug, rugContactShadow, rugLip);

      // --- Pair of Curved Cognac Leather Tub Armchairs ---
      const createCognacArmchair = () => {
        const chair = new THREE.Group();

        // Four slim tapered splayed bronze legs with brass ferrules
        for (const [lx, lz] of [[-0.26, -0.26], [-0.26, 0.26], [0.26, -0.26], [0.26, 0.26]]) {
          const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.022, 0.38, 12), receptionBronzeMat);
          leg.position.set(lx, 0.19, lz);
          leg.rotation.x = lz * 0.25;
          leg.rotation.z = -lx * 0.25;
          const ferrule = new THREE.Mesh(new THREE.CylinderGeometry(0.017, 0.019, 0.08, 12), receptionGoldMat);
          ferrule.position.set(lx, 0.04, lz);
          chair.add(leg, ferrule);
        }

        // Thick contoured seat cushion in warm caramel cognac leather
        const seat = new THREE.Mesh(
          new THREE.CylinderGeometry(0.36, 0.34, 0.16, 24),
          corporateCognacLeatherMat
        );
        seat.position.y = 0.44;

        // Solid curved tub backrest with realistic double-layer thickness
        const backrestOuter = new THREE.Mesh(
          new THREE.CylinderGeometry(0.39, 0.38, 0.46, 24, 1, false, 0, Math.PI * 1.20),
          corporateCognacLeatherMat
        );
        backrestOuter.position.set(0, 0.65, 0);
        backrestOuter.rotation.y = Math.PI * 0.90;

        const backrestInner = new THREE.Mesh(
          new THREE.CylinderGeometry(0.34, 0.33, 0.44, 24, 1, false, 0, Math.PI * 1.20),
          corporateCognacLeatherMat
        );
        backrestInner.position.set(0, 0.65, 0);
        backrestInner.rotation.y = Math.PI * 0.90;

        // Welt cord piping rim along backrest top edge
        const weltRim = new THREE.Mesh(
          new THREE.TorusGeometry(0.365, 0.022, 12, 32, Math.PI * 1.20),
          corporateCognacLeatherMat
        );
        weltRim.position.set(0, 0.88, 0);
        weltRim.rotation.x = Math.PI / 2;
        weltRim.rotation.z = Math.PI * 0.90;

        // Armchair contact shadow on rug
        const chairShadow = new THREE.Mesh(
          new THREE.PlaneGeometry(0.88, 0.88),
          new THREE.MeshBasicMaterial({ color: 0x140e0a, transparent: true, opacity: 0.55, depthWrite: false })
        );
        chairShadow.rotation.x = -Math.PI / 2;
        chairShadow.position.y = 0.018;

        chair.add(seat, backrestOuter, backrestInner, weltRim, chairShadow);
        return chair;
      };

      // Chair 1 (Rear Left): facing inward
      const chair1 = createCognacArmchair();
      chair1.position.set(0.35, 0, -0.65);
      chair1.rotation.y = 0.38;

      // Chair 2 (Front Right): facing inward
      const chair2 = createCognacArmchair();
      chair2.position.set(-0.25, 0, 0.60);
      chair2.rotation.y = -0.48;

      loungeGroup.add(chair1, chair2);

      // --- Central Round Dark Marble Side Table ---
      const sideTableGroup = new THREE.Group();
      sideTableGroup.position.set(0.15, 0, 0);

      // Stepped fluted dark bronze pedestal base
      const pedBase = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.22, 0.03, 24), receptionBronzeMat);
      pedBase.position.y = 0.015;
      const pedCol = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.50, 16), receptionBronzeMat);
      pedCol.position.y = 0.28;
      const pedColGold = new THREE.Mesh(new THREE.TorusGeometry(0.048, 0.008, 12, 16), receptionGoldMat);
      pedColGold.position.y = 0.50;
      pedColGold.rotation.x = Math.PI / 2;

      // Nero Marquina dark marble tabletop disc
      const marbleTop = new THREE.Mesh(
        new THREE.CylinderGeometry(0.26, 0.26, 0.028, 32),
        neroMarquinaPedestalMat
      );
      marbleTop.position.y = 0.54;

      // Miniature stylized dark bronze gazelle / deer sculptures on table
      for (const [gz, gr] of [[-0.06, 0.3], [0.06, -0.4]]) {
        const miniDeer = new THREE.Mesh(new THREE.ConeGeometry(0.022, 0.12, 8), receptionBronzeMat);
        miniDeer.position.set(0, 0.61, gz);
        miniDeer.rotation.y = gr;
        sideTableGroup.add(miniDeer);
      }

      sideTableGroup.add(pedBase, pedCol, pedColGold, marbleTop);
      loungeGroup.add(sideTableGroup);
      roomGroup.add(loungeGroup);

      // --- Foreground Calacatta Marble Coffee Table with Golden Stag Sculpture ---
      // Position: At local X = -0.45, Z = 1.65 (sits in the foreground right of camera view)
      const stagTableGroup = new THREE.Group();
      stagTableGroup.position.set(-0.45, 0, 1.65);

      // Grounding contact shadow on marble floor
      const stagTableShadow = new THREE.Mesh(
        new THREE.PlaneGeometry(1.15, 1.15),
        new THREE.MeshBasicMaterial({ color: 0x140e0a, transparent: true, opacity: 0.52, depthWrite: false })
      );
      stagTableShadow.rotation.x = -Math.PI / 2;
      stagTableShadow.position.y = 0.003;

      // Cylindrical dark bronze fluted pedestal base with brass trim ring
      const stagPedBase = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 0.04, 32), receptionBronzeMat);
      stagPedBase.position.y = 0.02;
      const stagPedCol = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.34, 24), receptionBronzeMat);
      stagPedCol.position.y = 0.21;
      const stagPedRing = new THREE.Mesh(new THREE.TorusGeometry(0.125, 0.012, 12, 24), receptionGoldMat);
      stagPedRing.position.y = 0.37;
      stagPedRing.rotation.x = Math.PI / 2;

      // Round Calacatta Gold polished marble slab top (balanced warmth so veins show)
      const stagMarbleTop = new THREE.Mesh(
        new THREE.CylinderGeometry(0.44, 0.44, 0.038, 36),
        new THREE.MeshStandardMaterial({
          map: calacattaMarbleTex,
          roughness: 0.18,
          metalness: 0.08,
          color: 0xd8d0be,
          fog: false,
        })
      );
      stagMarbleTop.position.y = 0.40;

      // --- Sculpted Majestic Polished Golden Stag Figurine ---
      const stagFigurine = new THREE.Group();
      stagFigurine.position.set(0, 0.42, 0);
      stagFigurine.scale.set(1.35, 1.35, 1.35); // majestic prominent scale
      stagFigurine.rotation.y = -Math.PI * 0.65; // elegant 3/4 pose

      // Muscular chest & body
      const stagChest = new THREE.Mesh(new THREE.SphereGeometry(0.048, 16, 16), receptionGoldMat);
      stagChest.position.set(0, 0.16, 0.04);
      stagChest.scale.set(0.9, 1.2, 1.3);

      const stagHindquarters = new THREE.Mesh(new THREE.SphereGeometry(0.042, 16, 16), receptionGoldMat);
      stagHindquarters.position.set(0, 0.15, -0.06);
      stagHindquarters.scale.set(0.85, 1.1, 1.2);

      // Four slender articulated legs with hooves
      for (const [lx, lz] of [[-0.028, 0.04], [0.028, 0.04], [-0.025, -0.06], [0.025, -0.06]]) {
        const legUpper = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.005, 0.09, 8), receptionGoldMat);
        legUpper.position.set(lx, 0.10, lz);
        const legLower = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.004, 0.08, 8), receptionGoldMat);
        legLower.position.set(lx, 0.035, lz + 0.005);
        const hoof = new THREE.Mesh(new THREE.BoxGeometry(0.010, 0.008, 0.014), receptionGoldMat);
        hoof.position.set(lx, 0.004, lz + 0.006);
        stagFigurine.add(legUpper, legLower, hoof);
      }

      // Elegant arched neck
      const stagNeck = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.034, 0.13, 12), receptionGoldMat);
      stagNeck.position.set(0, 0.24, 0.08);
      stagNeck.rotation.x = -0.35;

      // Sculpted head & alert ears
      const stagHead = new THREE.Mesh(new THREE.ConeGeometry(0.024, 0.07, 12), receptionGoldMat);
      stagHead.position.set(0, 0.30, 0.12);
      stagHead.rotation.x = 1.15;

      for (const ex of [-0.022, 0.022]) {
        const ear = new THREE.Mesh(new THREE.ConeGeometry(0.008, 0.038, 8), receptionGoldMat);
        ear.position.set(ex, 0.32, 0.09);
        ear.rotation.z = -ex * 1.4;
        ear.rotation.x = -0.2;
        stagFigurine.add(ear);
      }

      // Majestic branching multi-tined antlers
      for (const side of [-1, 1]) {
        const antlerMain = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.006, 0.16, 8), receptionGoldMat);
        antlerMain.position.set(side * 0.035, 0.39, 0.08);
        antlerMain.rotation.z = -side * 0.45;
        antlerMain.rotation.x = -0.25;

        // Branching tines
        for (let b = 1; b <= 3; b++) {
          const tine = new THREE.Mesh(new THREE.CylinderGeometry(0.002, 0.0035, 0.05, 6), receptionGoldMat);
          tine.position.set(side * (0.025 + b * 0.018), 0.35 + b * 0.03, 0.09 + b * 0.01);
          tine.rotation.z = -side * 0.95;
          tine.rotation.x = 0.30;
          stagFigurine.add(tine);
        }
        stagFigurine.add(antlerMain);
      }

      stagFigurine.add(stagChest, stagHindquarters, stagNeck, stagHead);
      stagTableGroup.add(stagTableShadow, stagPedBase, stagPedCol, stagPedRing, stagMarbleTop, stagFigurine);
      roomGroup.add(stagTableGroup);

      // 10. RIGHT BOUNDARY (Z = +3.65 to +4.0): WHITE PILASTER & BOARDROOM GLASS PARTITION
      // Architectural White Pilaster
      const pilaster = new THREE.Mesh(
        new THREE.BoxGeometry(1.10, roomH, 0.16),
        new THREE.MeshStandardMaterial({ color: 0xf6f3ea, roughness: 0.70, fog: false })
      );
      pilaster.position.set(1.60, roomH / 2, 3.65);
      roomGroup.add(pilaster);

      // Stacked Pair of Framed B&W Architectural Photographs on Pilaster (facing into the room toward -Z)
      for (const [py, pTex] of [[2.70, texCh4Boardroom], [1.90, texCh4SkyLounge]] as [number, THREE.Texture][]) {
        const photoFrame = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.56, 0.025), receptionBronzeMat);
        photoFrame.position.set(1.60, py, 3.56);
        const photoMatBorder = new THREE.Mesh(
          new THREE.PlaneGeometry(0.50, 0.50),
          new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9, fog: false, side: THREE.DoubleSide })
        );
        photoMatBorder.position.set(1.60, py, 3.542);
        photoMatBorder.rotation.y = Math.PI;

        const photoPic = new THREE.Mesh(
          new THREE.PlaneGeometry(0.38, 0.38),
          new THREE.MeshStandardMaterial({ map: pTex, roughness: 0.4, fog: false, side: THREE.DoubleSide })
        );
        photoPic.position.set(1.60, py, 3.538);
        photoPic.rotation.y = Math.PI;

        roomGroup.add(photoFrame, photoMatBorder, photoPic);
      }

      // Floor-to-Ceiling Boardroom Glass Partition
      const glassPartitionW = 2.80;
      const glassPartition = new THREE.Mesh(
        new THREE.PlaneGeometry(glassPartitionW, roomH),
        boardroomGlassMat
      );
      glassPartition.position.set(3.20, roomH / 2, 3.65);
      glassPartition.rotation.y = Math.PI;

      // Frosted geometric manifestation band
      const frostedBand = new THREE.Mesh(
        new THREE.PlaneGeometry(glassPartitionW, 1.40),
        frostedManifestationMat
      );
      frostedBand.position.set(3.20, 1.80, 3.64);
      frostedBand.rotation.y = Math.PI;

      // Dark bronze framing mullions
      for (const mx of [2.15, 3.20, 4.25]) {
        const mullion = new THREE.Mesh(new THREE.BoxGeometry(0.06, roomH, 0.08), receptionBronzeMat);
        mullion.position.set(mx, roomH / 2, 3.65);
        roomGroup.add(mullion);
      }
      roomGroup.add(glassPartition, frostedBand);

      // 11. CURATED EXHIBITION ARTWORKS (Commercial Portfolio on Left Wall & Entry Flanks)
      // Left Wall (Z = -roomD/2): Exhibiting 2 fine art works with antique gold museum frames
      const sideWallLeft = new THREE.Mesh(
        new THREE.PlaneGeometry(roomW, roomH),
        wallMat
      );
      sideWallLeft.position.set(0, roomH / 2, -roomD / 2);
      roomGroup.add(sideWallLeft);

      // Artwork: The Sky Lounge Executive Suite
      const ch4ArtSkyLounge = createFramedArtMesh(texCh4SkyLounge, 3.8, 2.4, 0.08, true);
      ch4ArtSkyLounge.position.set(-2.5, roomH / 2, -roomD / 2 + 0.08);

      // Artwork: The Executive Rooftop Pavilion
      const ch4ArtTerrace = createFramedArtMesh(texCh4Terrace, 3.8, 2.4, 0.08, true);
      ch4ArtTerrace.position.set(2.5, roomH / 2, -roomD / 2 + 0.08);
      roomGroup.add(ch4ArtSkyLounge, ch4ArtTerrace);

      // Entrance Flanks: Exhibiting 2 works
      const ch4ArtDining = createFramedArtMesh(texCh4Dining, 3.2, 2.2, 0.07, true);
      ch4ArtDining.position.set(-roomW / 2 + 0.08, roomH / 2, -4.5);
      ch4ArtDining.rotation.y = Math.PI / 2;

      const ch4ArtVip = createFramedArtMesh(texCh4Vip, 3.2, 2.2, 0.07, true);
      ch4ArtVip.position.set(-roomW / 2 + 0.08, roomH / 2, 4.5);
      ch4ArtVip.rotation.y = Math.PI / 2;
      roomGroup.add(ch4ArtDining, ch4ArtVip);

      scene.add(roomGroup);
      return roomGroup;
    };

    // Instantiate all 4 chambers with spatial references for occlusion culling
    const chamber1Group = buildGrandLivingChamber();
    const chamber2Group = buildVersaceSuiteChamber();
    const chamber3Group = buildSacredSanctumChamber();
    const chamber4Group = buildCorporateReceptionChamber();

    // --- 9. EXACT TIMED CAMERA WAYPOINTS & PIECEWISE CUBIC HERMITE TRAJECTORY ---
    interface CameraWaypoint {
      t: number;
      pos: THREE.Vector3;
      look: THREE.Vector3;
    }

    const cameraWaypoints: CameraWaypoint[] = [
      // 0.00: Grand Hall Entrance gazing down the marble gallery
      { t: 0.00, pos: new THREE.Vector3(0, 2.45, 8.0), look: new THREE.Vector3(0, 2.4, -18.0) },
      // 0.08: Gliding forward along central gallery
      { t: 0.08, pos: new THREE.Vector3(0, 2.4, -6.0), look: new THREE.Vector3(-1.5, 2.35, -18.0) },
      // 0.14: Angling toward Portal I archway on the left
      { t: 0.14, pos: new THREE.Vector3(-2.2, 2.35, -18.5), look: new THREE.Vector3(-8.0, 2.0, -20.0) },
      // 0.17: Passing THROUGH Portal I doorway arch at X = -4.0
      { t: 0.17, pos: new THREE.Vector3(-4.4, 2.2, -20.0), look: new THREE.Vector3(-15.0, 1.8, -20.0) },
      // 0.22: Chamber I Hero View (Grand Living - fully framed 3D lounge, marble, back drapery)
      { t: 0.22, pos: new THREE.Vector3(-7.8, 1.95, -20.0), look: new THREE.Vector3(-17.5, 1.45, -20.0) },
      // 0.27: Chamber I Detail View (Close inspection of marble coffee table & sofa)
      { t: 0.27, pos: new THREE.Vector3(-9.6, 1.60, -20.0), look: new THREE.Vector3(-14.8, 1.05, -20.0) },
      // 0.33: Gliding backward through Portal I doorway into hallway
      { t: 0.33, pos: new THREE.Vector3(-4.0, 2.3, -22.0), look: new THREE.Vector3(0, 2.4, -36.0) },
      // 0.37: Re-entering central gallery, advancing forward
      { t: 0.37, pos: new THREE.Vector3(0, 2.4, -32.0), look: new THREE.Vector3(1.2, 2.35, -44.0) },
      // 0.43: Angling toward Portal II archway on the right
      { t: 0.43, pos: new THREE.Vector3(2.2, 2.35, -43.5), look: new THREE.Vector3(8.0, 2.0, -45.0) },
      // 0.46: Passing THROUGH Portal II doorway arch at X = +4.0
      { t: 0.46, pos: new THREE.Vector3(4.4, 2.2, -45.0), look: new THREE.Vector3(15.0, 1.8, -45.0) },
      // 0.50: Chamber II Hero View (Versace Suite - luxury bed, fluted oak, nightstand, pendant)
      { t: 0.50, pos: new THREE.Vector3(7.8, 1.95, -45.0), look: new THREE.Vector3(17.5, 1.45, -45.0) },
      // 0.55: Chamber II Detail View (Close inspection of headboard & nightstand)
      { t: 0.55, pos: new THREE.Vector3(11.2, 1.70, -45.0), look: new THREE.Vector3(16.5, 1.40, -45.0) },
      // 0.60: Gliding backward through Portal II doorway into hallway
      { t: 0.60, pos: new THREE.Vector3(4.0, 2.3, -48.0), look: new THREE.Vector3(0, 2.4, -62.0) },
      // 0.64: Advancing forward in central gallery toward Portal III
      { t: 0.64, pos: new THREE.Vector3(0, 2.4, -58.0), look: new THREE.Vector3(-1.2, 2.35, -69.0) },
      // 0.67: Angling toward Portal III archway on the left
      { t: 0.67, pos: new THREE.Vector3(-2.2, 2.35, -68.5), look: new THREE.Vector3(-8.0, 2.0, -70.0) },
      // 0.69: Passing THROUGH Portal III doorway arch at X = -4.0
      { t: 0.69, pos: new THREE.Vector3(-4.4, 2.2, -70.0), look: new THREE.Vector3(-15.0, 1.8, -70.0) },
      // 0.72: Chamber III Hero View (Sacred Sanctum - glowing onyx halo, mandir console, diya)
      { t: 0.72, pos: new THREE.Vector3(-7.8, 1.95, -70.0), look: new THREE.Vector3(-17.5, 1.45, -70.0) },
      // 0.77: Chamber III Detail View (Close inspection of Ganesha idol & mantra wall)
      { t: 0.77, pos: new THREE.Vector3(-11.2, 1.70, -70.0), look: new THREE.Vector3(-16.5, 1.40, -70.0) },
      // 0.82: Gliding backward through Portal III doorway into hallway
      { t: 0.82, pos: new THREE.Vector3(-4.0, 2.3, -73.0), look: new THREE.Vector3(0, 2.4, -86.0) },
      // 0.86: Advancing forward in gallery toward Portal IV
      { t: 0.86, pos: new THREE.Vector3(0, 2.4, -82.0), look: new THREE.Vector3(1.2, 2.35, -94.0) },
      // 0.90: Angling toward Portal IV archway on the right
      { t: 0.90, pos: new THREE.Vector3(2.2, 2.35, -93.5), look: new THREE.Vector3(8.0, 2.0, -95.0) },
      // 0.92: Passing THROUGH Portal IV doorway arch at X = +4.0
      { t: 0.92, pos: new THREE.Vector3(4.4, 2.2, -95.0), look: new THREE.Vector3(15.0, 1.8, -95.0) },
      // 0.94: Chamber IV Hero View (Corporate Reception - bronze desk, linear pendant, executive lounge)
      { t: 0.94, pos: new THREE.Vector3(7.8, 1.95, -95.0), look: new THREE.Vector3(17.5, 1.45, -95.0) },
      // 0.98: Chamber IV Detail View (Close inspection of reception desk & stag)
      { t: 0.98, pos: new THREE.Vector3(11.2, 1.70, -95.0), look: new THREE.Vector3(16.5, 1.40, -95.0) },
      // 1.00: Final gallery destination
      { t: 1.00, pos: new THREE.Vector3(12.5, 1.85, -95.0), look: new THREE.Vector3(18.0, 1.5, -95.0) },
    ];

    const getCameraTrajectory = (progressVal: number) => {
      const clamped = THREE.MathUtils.clamp(progressVal, 0, 1);
      let i = 0;
      while (i < cameraWaypoints.length - 1 && cameraWaypoints[i + 1].t <= clamped) {
        i++;
      }
      if (i >= cameraWaypoints.length - 1) {
        const last = cameraWaypoints[cameraWaypoints.length - 1];
        return { pos: last.pos.clone(), look: last.look.clone() };
      }
      const k0 = cameraWaypoints[i];
      const k1 = cameraWaypoints[i + 1];
      const range = k1.t - k0.t;
      const rawU = range > 0 ? (clamped - k0.t) / range : 0;
      // Smooth cubic Hermite curve for smooth acceleration/deceleration without jerk
      const u = rawU * rawU * (3 - 2 * rawU);
      const pos = new THREE.Vector3().lerpVectors(k0.pos, k1.pos, u);
      const look = new THREE.Vector3().lerpVectors(k0.look, k1.look, u);
      return { pos, look };
    };

    // --- 10. PRE-WARM GPU: PRELOAD TEXTURES & SHADERS ACROSS ALL WAYPOINTS ---
    // Pre-uploads all textures to VRAM and pre-compiles WebGL shaders for all chambers
    // completely eliminating mid-scroll shader compilation spikes.
    const allTextures = [
      calacattaMarbleTex,
      italianBlackMarbleTex,
      chamberBlackMarbleTex,
      runnerRugTex,
      fineLimestoneTex,
      honeyFlutedOakTex,
      ...allMuralTextures,
      texGrand, texVersace, texSacred, texCorporate,
      texGrandDetail, texVersaceDetail, texSacredDetail, texCorporateDetail,
    ];

    const warmUpGPU = () => {
      allTextures.forEach((tex) => {
        try {
          const img = tex?.image as { complete?: boolean; width?: number } | undefined;
          if (img && (img.complete || (img.width && img.width > 0))) {
            renderer.initTexture(tex);
          }
        } catch (_) {}
      });

      // Temporarily reveal all chambers so compile reaches all geometry & lights
      [chamber1Group, chamber2Group, chamber3Group, chamber4Group].forEach((g) => {
        if (g) g.visible = true;
      });

      // Compile across sample waypoints (hallway, Chamber I, II, III, IV)
      const sampleWaypoints = [0.0, 0.22, 0.50, 0.72, 0.94];
      for (const t of sampleWaypoints) {
        const { pos, look } = getCameraTrajectory(t);
        camera.position.copy(pos);
        camera.lookAt(look);
        camera.updateMatrixWorld();
        renderer.compile(scene, camera);
      }

      // Reset camera to initial door sequence position outside closed doors
      camera.position.set(0, 2.85, 14.5);
      camera.lookAt(0, 3.10, 8.2);
      camera.updateMatrixWorld();

      // After GPU compile warmup, hide all chambers while at the entrance door
      if (chamber1Group) chamber1Group.visible = false;
      if (chamber2Group) chamber2Group.visible = false;
      if (chamber3Group) chamber3Group.visible = false;
      if (chamber4Group) chamber4Group.visible = false;
    };

    warmUpGPU();

    // --- GRAND ENTRANCE DOOR OPENING & SKIP SEQUENCE ---
    const openDoorSequence = () => {
      if (sceneStateRef.current.doorState !== "ready") return;
      sceneStateRef.current.doorState = "opening";
      setDoorState("opening");

      // Auto-unmute on explicit enter click and initiate audio experience
      setIsMuted(false);
      startAmbientDrone();
      playDoorLatchClick();
      playDoorOpeningGroan();

      const dRefs = doorAnimationRef.current;
      const tl = gsap.timeline({
        onComplete: () => {
          sceneStateRef.current.doorState = "opened";
          sceneStateRef.current.currentProgress = 0;
          sceneStateRef.current.targetProgress = 0;
          setDoorState("opened");
          setIsDoorOpen(true);
          if (dRefs.doorGroup) {
            dRefs.doorGroup.visible = false;
          }
        },
      });

      // 1. Both door handles rotate downward (unlatch click) 0s -> 0.35s
      if (dRefs.leftHandle && dRefs.rightHandle) {
        tl.to(dRefs.leftHandle.rotation, { z: -0.32, duration: 0.32, ease: "power2.inOut" }, 0);
        tl.to(dRefs.rightHandle.rotation, { z: 0.32, duration: 0.32, ease: "power2.inOut" }, 0);
      }

      // 2. Both door panels swing open inward into the hallway 0.3s -> 2.3s
      if (dRefs.leftPivot && dRefs.rightPivot) {
        tl.to(dRefs.leftPivot.rotation, { y: -Math.PI / 2.1, duration: 2.0, ease: "power3.inOut" }, 0.3);
        tl.to(dRefs.rightPivot.rotation, { y: Math.PI / 2.1, duration: 2.0, ease: "power3.inOut" }, 0.3);
      }

      // 3. Volumetric warm golden light flood bursts through opening doors 0.3s -> 2.2s
      if (dRefs.lightFlood) {
        const mat = dRefs.lightFlood.material as THREE.MeshBasicMaterial;
        tl.to(mat, { opacity: 0.85, duration: 1.1, ease: "power2.in" }, 0.3);
        tl.to(dRefs.lightFlood.scale, { x: 3.5, duration: 1.5, ease: "power2.out" }, 0.3);
        tl.to(mat, { opacity: 0.0, duration: 0.6, ease: "power2.out" }, 1.6);
      }

      // 3b. Occluder behind doors collapses as doors part
      if (dRefs.doorBacker) {
        const bMat = dRefs.doorBacker.material as THREE.MeshBasicMaterial;
        tl.to(dRefs.doorBacker.scale, { x: 0.001, duration: 1.2, ease: "power2.inOut" }, 0.3);
        tl.to(bMat, { opacity: 0.0, duration: 0.7, ease: "power2.out" }, 0.5);
      }

      // 4. Camera pushes through doorway into hallway 0.75s -> 2.45s
      tl.to(dRefs.cameraPos, {
        y: 2.45,
        z: 8.0,
        duration: 1.7,
        ease: "power2.inOut",
      }, 0.75);

      tl.to(dRefs.cameraLook, {
        y: 2.40,
        z: -18.0,
        duration: 1.7,
        ease: "power2.inOut",
      }, 0.75);
    };

    const skipDoorSequence = () => {
      const dRefs = doorAnimationRef.current;
      gsap.killTweensOf(dRefs.cameraPos);
      gsap.killTweensOf(dRefs.cameraLook);
      if (dRefs.leftPivot) gsap.killTweensOf(dRefs.leftPivot.rotation);
      if (dRefs.rightPivot) gsap.killTweensOf(dRefs.rightPivot.rotation);
      if (dRefs.leftHandle) gsap.killTweensOf(dRefs.leftHandle.rotation);
      if (dRefs.rightHandle) gsap.killTweensOf(dRefs.rightHandle.rotation);
      if (dRefs.lightFlood) gsap.killTweensOf(dRefs.lightFlood.material as any);
      if (dRefs.doorBacker) {
        gsap.killTweensOf(dRefs.doorBacker.scale);
        gsap.killTweensOf(dRefs.doorBacker.material as any);
        dRefs.doorBacker.visible = false;
      }

      dRefs.cameraPos.set(0, 2.45, 8.0);
      dRefs.cameraLook.set(0, 2.4, -18.0);

      if (dRefs.doorGroup) {
        dRefs.doorGroup.visible = false;
      }

      sceneStateRef.current.doorState = "opened";
      sceneStateRef.current.currentProgress = 0;
      sceneStateRef.current.targetProgress = 0;
      setDoorState("opened");
      setIsDoorOpen(true);
    };

    triggerOpenDoorRef.current = openDoorSequence;
    triggerSkipDoorRef.current = skipDoorSequence;

    // --- 11. SCROLL CAPTURE & MOMENTUM INTERACTION ---
    const handleWheel = (e: WheelEvent) => {
      if (sceneStateRef.current.doorState !== "opened") {
        if (e.cancelable) e.preventDefault();
        return;
      }
      if (e.cancelable) {
        e.preventDefault();
      }
      const state = sceneStateRef.current;
      gsap.killTweensOf(state);
      state.isSnapping = false;
      state.lastScrollTime = Date.now();

      // Normalize delta across operating systems, browsers, and devices (mouse wheel, free-spin, trackpad)
      let rawDelta = e.deltaY;
      if (e.deltaMode === 1) {
        rawDelta *= 33; // DOM_DELTA_LINE
      } else if (e.deltaMode === 2) {
        rawDelta *= 800; // DOM_DELTA_PAGE
      }

      // Responsive sensitivity tuned for continuous mansion glide with clamped delta to prevent stutter
      const clampedDelta = Math.sign(rawDelta) * Math.min(Math.abs(rawDelta), 60);
      const delta = clampedDelta * 0.00065;
      state.targetProgress = Math.max(0, Math.min(1, state.targetProgress + delta));
    };

    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      if (sceneStateRef.current.doorState !== "opened") return;
      if (e.touches.length > 0) {
        touchStartY = e.touches[0].clientY;
      }
      const state = sceneStateRef.current;
      gsap.killTweensOf(state);
      state.isSnapping = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (sceneStateRef.current.doorState !== "opened") {
        if (e.cancelable) e.preventDefault();
        return;
      }
      if (e.cancelable) {
        e.preventDefault();
      }
      if (e.touches.length === 0) return;
      const currentY = e.touches[0].clientY;
      const delta = (touchStartY - currentY) * 0.0012;
      touchStartY = currentY;

      const state = sceneStateRef.current;
      gsap.killTweensOf(state);
      state.lastScrollTime = Date.now();
      state.isSnapping = false;
      state.targetProgress = Math.max(0, Math.min(1, state.targetProgress + delta));
    };

    // Canvas click & drag glide navigation
    let isPointerDown = false;
    let lastPointerY = 0;
    const handlePointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      if (sceneStateRef.current.doorState === "ready") {
        triggerOpenDoorRef.current();
        return;
      }
      if (sceneStateRef.current.doorState !== "opened") return;
      isPointerDown = true;
      lastPointerY = e.clientY;
      const state = sceneStateRef.current;
      gsap.killTweensOf(state);
      state.isSnapping = false;
    };

    const handlePointerMove = (e: PointerEvent) => {
      const nx = (e.clientX / window.innerWidth - 0.5) * 2;
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;
      sceneStateRef.current.targetTilt = { x: nx * 0.28, y: -ny * 0.18 };

      if (!isPointerDown) return;
      const deltaY = lastPointerY - e.clientY;
      lastPointerY = e.clientY;

      const state = sceneStateRef.current;
      gsap.killTweensOf(state);
      state.lastScrollTime = Date.now();
      state.isSnapping = false;
      state.targetProgress = Math.max(0, Math.min(1, state.targetProgress + deltaY * 0.0014));
    };

    const handlePointerUp = () => {
      isPointerDown = false;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (sceneStateRef.current.doorState !== "opened") {
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
        gsap.killTweensOf(state);
        state.isSnapping = false;
        state.lastScrollTime = Date.now();
        state.targetProgress = Math.min(1, state.targetProgress + 0.08);
      } else if (
        e.key === "ArrowUp" ||
        e.key === "ArrowLeft" ||
        e.key === "PageUp"
      ) {
        e.preventDefault();
        gsap.killTweensOf(state);
        state.isSnapping = false;
        state.lastScrollTime = Date.now();
        state.targetProgress = Math.max(0, state.targetProgress - 0.08);
      }
    };

    // Attach listeners to window (single listener prevents duplicate event execution)
    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("keydown", handleKeyDown);

    // Development / automated inspection helper
    (window as any).__setMansionProgress = (prog: number) => {
      const state = sceneStateRef.current;
      gsap.killTweensOf(state);
      state.isSnapping = false;
      state.doorState = "opened";
      if (doorAnimationRef.current.doorGroup) {
        doorAnimationRef.current.doorGroup.visible = false;
      }
      setIsDoorOpen(true);
      setDoorState("opened");
      state.targetProgress = THREE.MathUtils.clamp(prog, 0, 1);
      state.currentProgress = THREE.MathUtils.clamp(prog, 0, 1);
      state.lastScrollTime = Date.now() + 60000; // prevent immediate snap during inspection
    };

    // --- 11. CINEMATIC POST-PROCESSING PIPELINE ---
    // Custom film grain & subtle corner vignette shader
    const GrainVignetteShader = {
      name: "GrainVignetteShader",
      uniforms: {
        tDiffuse: { value: null },
        time: { value: 0.0 },
        grainIntensity: { value: 0.022 },
        vignetteOffset: { value: 1.05 },
        vignetteDarkness: { value: 0.75 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }
      `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float time;
        uniform float grainIntensity;
        uniform float vignetteOffset;
        uniform float vignetteDarkness;
        varying vec2 vUv;

        // Ultra-fast hash generator (0 trig sin/cos instructions)
        float hash(vec2 p) {
          vec3 p3 = fract(vec3(p.xyx) * 0.1031);
          p3 += dot(p3, p3.yzx + 33.33);
          return fract((p3.x + p3.y) * p3.z);
        }

        void main() {
          vec4 texel = texture2D( tDiffuse, vUv );

          // 1. Delicate photographic film grain (anti-CG sterile look)
          float noise = (hash(vUv * 600.0 + fract(time * 0.4)) - 0.5) * grainIntensity;
          vec3 color = texel.rgb + noise;

          // 2. Soft architectural corner vignette
          vec2 uv = (vUv - vec2(0.5)) * vec2(vignetteOffset);
          float dist = dot(uv, uv);
          float vignette = clamp(1.0 - dist * vignetteDarkness, 0.0, 1.0);
          color *= vignette;

          gl_FragColor = vec4( color, texel.a );
        }
      `,
    };

    // EffectComposer initialization
    const composer = new EffectComposer(renderer);

    // Pass 1: Primary scene render pass
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    // Pass 2: High-efficiency downsampled architectural bloom (quarter resolution)
    // Running at quarter-res drastically conserves fill-rate while giving a silky smooth glow
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(Math.floor(width / 4), Math.floor(height / 4)),
      0.20, // refined warm glow
      0.25, // radius
      0.94  // threshold: targets only real glowing emissive fixtures
    );
    composer.addPass(bloomPass);

    // Pass 3: Subtle photographic film grain and architectural lens vignette
    const grainVignettePass = new ShaderPass(GrainVignetteShader);
    composer.addPass(grainVignettePass);

    // Pass 4: Final output & color space conversion
    const outputPass = new OutputPass();
    composer.addPass(outputPass);

    // Expose debug hooks for performance diagnostic profiling
    (window as any).__debugRenderer = renderer;
    (window as any).__debugComposer = composer;
    (window as any).__debugScene = scene;
    (window as any).__debugPasses = {
      bloom: bloomPass,
      grain: grainVignettePass,
    };

    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth || window.innerWidth;
      const h = mountRef.current.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      composer.setSize(w, h);
      bloomPass.resolution.set(Math.floor(w / 4), Math.floor(h / 4));
    };
    window.addEventListener("resize", handleResize);

    // --- 12. ANIMATION RAF LOOP ---
    let reqId: number;
    const startTime = performance.now();
    let lastFrameTime = performance.now();
    let avgFrameTime = 16.6;

    const renderLoop = () => {
      reqId = requestAnimationFrame(renderLoop);
      const currentTime = performance.now();
      const rawDt = (currentTime - lastFrameTime) * 0.001;
      const dt = Math.min(rawDt, 0.05);
      lastFrameTime = currentTime;
      avgFrameTime = avgFrameTime * 0.92 + (rawDt * 1000) * 0.08;

      const elapsed = (currentTime - startTime) * 0.001;
      const state = sceneStateRef.current;

      // Smooth mouse tilt parallax with physical damping
      const tiltAlpha = 1.0 - Math.exp(-8.0 * dt);
      state.tilt.x += (state.targetTilt.x - state.tilt.x) * tiltAlpha;
      state.tilt.y += (state.targetTilt.y - state.tilt.y) * tiltAlpha;

      if (state.doorState !== "opened") {
        const dRefs = doorAnimationRef.current;

        // Spatial culling: hide all 4 chambers while at the door to save 1,300 meshes
        if (chamber1Group && chamber1Group.visible) chamber1Group.visible = false;
        if (chamber2Group && chamber2Group.visible) chamber2Group.visible = false;
        if (chamber3Group && chamber3Group.visible) chamber3Group.visible = false;
        if (chamber4Group && chamber4Group.visible) chamber4Group.visible = false;

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
        // Silky exponential camera progress smoothing (critically damped inertia)
        const smoothRate = 1.0 - Math.exp(-9.5 * dt);
        state.currentProgress += (state.targetProgress - state.currentProgress) * smoothRate;
        const p = Math.max(0, Math.min(1, state.currentProgress));

        // Spatial chamber visibility culling: only keep chamber visible when near its portal
        const c1Vis = p >= 0.08 && p <= 0.38;
        const c2Vis = p >= 0.35 && p <= 0.62;
        const c3Vis = p >= 0.58 && p <= 0.85;
        const c4Vis = p >= 0.80 && p <= 1.00;

        if (chamber1Group && chamber1Group.visible !== c1Vis) chamber1Group.visible = c1Vis;
        if (chamber2Group && chamber2Group.visible !== c2Vis) chamber2Group.visible = c2Vis;
        if (chamber3Group && chamber3Group.visible !== c3Vis) chamber3Group.visible = c3Vis;
        if (chamber4Group && chamber4Group.visible !== c4Vis) chamber4Group.visible = c4Vis;

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

        // Chamber ambient animation culling (lights and geometry remain stable so GLSL program cache is never invalidated)

        // --- CHAMBER-SPECIFIC AMBIENT ANIMATIONS (SPATIALLY CULLED, ZERO CPU BUFFER RE-UPLOADS) ---
        if (p >= 0.12 && p <= 0.35 && grandDustPoints) {
          // Chamber I: Gentle dust motes in living room window wash (pure GPU transform)
          grandDustPoints.rotation.y = elapsed * 0.04;
          grandDustPoints.position.y = Math.sin(elapsed * 0.5) * 0.04;
        } else if (p >= 0.38 && p <= 0.60) {
          // Chamber II: Subtle pendant sway & bed spotlight dust motes
          if (versacePendantGroup) {
            versacePendantGroup.rotation.z = Math.sin(elapsed * 0.8) * 0.012;
            versacePendantGroup.rotation.x = Math.cos(elapsed * 0.6) * 0.008;
          }
          if (versaceDustPoints) {
            versaceDustPoints.rotation.y = elapsed * 0.035;
            versaceDustPoints.position.y = Math.sin(elapsed * 0.4) * 0.03;
          }
        } else if (p >= 0.63 && p <= 0.83) {
          // Chamber III: Sacred Sanctum diya flame flicker & incense smoke ascent
          const flameNoise = Math.sin(elapsed * 14) * Math.cos(elapsed * 9);
          if (sanctumDiyaLight) {
            sanctumDiyaLight.intensity = 0.85 + flameNoise * 0.20;
          }
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
        } else if (p >= 0.88 && p <= 1.0) {
          // Chamber IV: Corporate Reception subtle kinetic balance toy oscillation
          if (corporateKineticToy) {
            corporateKineticToy.rotation.z = Math.sin(elapsed * 1.8) * 0.12;
            corporateKineticToy.rotation.x = Math.cos(elapsed * 1.3) * 0.04;
          }
        }

        // Far-End Focal Masterpiece Ambient Animation (Hallway view)
        if (
          focalSculptureGroup &&
          (p < 0.15 || (p > 0.33 && p < 0.45) || (p > 0.60 && p < 0.68) || (p > 0.82 && p < 0.90))
        ) {
          focalSculptureGroup.rotation.y = elapsed * 0.18;
          focalSculptureGroup.rotation.x = Math.sin(elapsed * 0.4) * 0.1;
        }

        // Auto-Snap Detection
        if (!state.isSnapping && Date.now() - state.lastScrollTime > 350) {
          for (const ch of CHAMBER_DATA) {
            if (Math.abs(state.targetProgress - ch.heroProgress) < 0.038) {
              state.isSnapping = true;
              gsap.to(state, {
                targetProgress: ch.heroProgress,
                duration: 1.1,
                ease: "power2.out",
                onComplete: () => {
                  state.isSnapping = false;
                },
              });
              break;
            }
          }
        }

        // Check Chamber HUD visibility
        let matchingChamber: ChamberInfo | null = null;
        let opacity = 0;
        for (const ch of CHAMBER_DATA) {
          const dist = Math.abs(p - ch.heroProgress);
          if (dist <= 0.055) {
            matchingChamber = ch;
            opacity = Math.max(0, 1 - dist / 0.055);
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
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
      delete (window as any).__setMansionProgress;

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      composer.dispose();
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
      {!isDoorOpen && (
        <div className="absolute inset-0 z-30 pointer-events-none flex flex-col justify-between p-8 md:p-14 animate-fadeIn select-none">
          {/* Center Call To Action */}
          <div className="flex flex-col items-center justify-center my-auto text-center pointer-events-auto">
            {/* Luxury Estate Badge */}
            <div className="flex items-center space-x-2 px-4 py-1.5 rounded-full border border-[#b8975a]/30 bg-[#161210]/95 shadow-lg mb-6">
              <Sparkles size={12} className="text-[#e5c38c]" />
              <span className="text-[10px] uppercase font-mono tracking-[0.3em] text-[#e5c38c] font-medium">
                Grand Private Estate
              </span>
            </div>
            {/* Animated Brass Door Knocker / Handle Icon */}
            <div
              onClick={() => {
                if (doorState === "ready") triggerOpenDoorRef.current();
              }}
              className={`relative mb-6 cursor-pointer group ${
                doorState === "ready" ? "cursor-pointer" : "cursor-default"
              }`}
            >
              <div className="w-18 h-18 md:w-20 md:h-20 rounded-full border border-[#b8975a]/50 flex items-center justify-center bg-[#191411]/90 shadow-[0_0_35px_rgba(184,151,90,0.35)] group-hover:shadow-[0_0_55px_rgba(229,195,140,0.7)] group-hover:border-[#e5c38c] transition-all duration-500">
                <DoorClosed
                  size={28}
                  className={`text-[#e5c38c] transition-transform duration-500 ${
                    doorState === "ready" ? "group-hover:scale-110 animate-pulse" : "opacity-60"
                  }`}
                />
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
            <div className="pointer-events-auto bg-[#181412]/95 border border-[#b8975a]/30 rounded-2xl p-3 shadow-2xl max-w-md">
              <div className="flex items-center justify-between mb-2.5 text-[10px] font-mono tracking-[0.25em] uppercase text-[#e5c38c]">
                <span className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#e5c38c] animate-pulse" />
                  <span>Curated Wall Installations</span>
                </span>
                <span className="text-white/50">5 Works · Tap to Inspect</span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {EXHIBITION_CATALOG[activeChamber.id].map((art, idx) => (
                  <button
                    key={art.id}
                    onClick={() => setInspectedArtwork(art)}
                    className="group relative aspect-[4/3] rounded-lg overflow-hidden border border-white/20 hover:border-[#e5c38c] transition-all duration-200 cursor-pointer shadow-md hover:scale-105 bg-black/40"
                    title={`${art.title} - ${art.project}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={art.image}
                      alt={art.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-10 transition-opacity" />
                    <span className="absolute bottom-1 right-1 text-[8px] font-mono text-white/90 bg-black/70 px-1 rounded">
                      0{idx + 1}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 6. HALLWAY SCROLL HINT */}
      {!activeChamber && isDoorOpen && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 text-center pointer-events-none animate-pulse">
          <div className="flex flex-col items-center space-y-2 px-5 py-2.5 rounded-full bg-[#fbf8f2]/95 border border-[#b8975a]/30 shadow-md pointer-events-none">
            <Compass size={18} className="text-[#b8975a] animate-spin" style={{ animationDuration: "12s" }} />
            <span className="text-[10px] uppercase font-mono tracking-[0.35em] text-[#3d3227] font-semibold">
              Scroll to Glide Through Mansion
            </span>
          </div>
        </div>
      )}

      {/* 7. FIXED BOTTOM NAVIGATION BAR */}
      {isDoorOpen && (
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

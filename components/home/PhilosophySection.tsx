"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Award, Compass, Sparkles, Gem, ShieldCheck } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const pillars = [
  {
    icon: Compass,
    title: "Spatial Alchemy",
    subtitle: "Volume & Proportion",
    description:
      "We treat interior architecture as a live sculpture. By harmonizing negative space, sightlines, and natural illumination, each room breathes with quiet authority.",
  },
  {
    icon: Gem,
    title: "Rare Materiality",
    subtitle: "Tactile Authenticity",
    description:
      "From book-matched Italian Statuario to warm fluted teak, brushed champagne brass, and custom textiles, every surface invites tactile discovery.",
  },
  {
    icon: ShieldCheck,
    title: "Turnkey Mastery",
    subtitle: "Precision Execution",
    description:
      "Seamless realization from initial 3D photorealism to custom joinery, MEP integration, and final art curation with zero compromise.",
  },
];

const stats = [
  { value: "50+", label: "Bespoke Residences & Estates", sub: "Designed Across India" },
  { value: "100%", label: "Turnkey Project Delivery", sub: "End-to-End Execution" },
  { value: "8+", label: "Years of Spatial Mastery", sub: "Since 2018" },
  { value: "15+", label: "Industry Recognitions", sub: "Design & Craft Excellence" },
];

export default function PhilosophySection() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const ctx = gsap.context(() => {
      gsap.from(".philosophy-reveal", {
        scrollTrigger: {
          trigger: container,
          start: "top 75%",
        },
        y: 60,
        opacity: 0,
        stagger: 0.15,
        duration: 1,
        ease: "power3.out",
      });
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="philosophy"
      ref={containerRef}
      className="relative py-28 md:py-40 bg-[#080809] text-[#f4f1ea] px-6 md:px-12 overflow-hidden border-t border-white/5"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-24">
          <div className="lg:col-span-4 space-y-4">
            <span className="text-xs uppercase font-sans tracking-ultraLuxury text-[#c5a880] block">
              01 • Architectural Philosophy
            </span>
            <h2 className="philosophy-reveal font-serif text-3xl md:text-5xl lg:text-6xl uppercase tracking-tight text-[#f5f2eb] leading-tight">
              Designing Spaces That <span className="italic text-gold-gradient">Resonate</span>
            </h2>
          </div>

          <div className="lg:col-span-8 space-y-6 lg:pl-12 border-l border-white/10">
            <p className="philosophy-reveal text-lg md:text-2xl text-neutral-300 font-serif font-light leading-relaxed">
              "True luxury is not loud ornament; it is the calm assurance of flawless
              proportions, authentic materials, and lighting that transforms an interior into an
              emotional sanctuary."
            </p>
            <div className="philosophy-reveal flex items-center space-x-4 pt-2">
              <div className="w-12 h-[1px] bg-[#c5a880]" />
              <span className="text-xs uppercase tracking-widest font-sans text-[#c5a880] font-semibold">
                Gopal Lahoti • Principal Interior Architect
              </span>
            </div>
          </div>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-28">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="philosophy-reveal group p-8 rounded-2xl glass-panel border border-white/10 hover:border-[#c5a880]/50 transition-all duration-500 hover:-translate-y-2 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8 text-4xl font-serif text-white/5 group-hover:text-[#c5a880]/10 transition-colors">
                  0{idx + 1}
                </div>
                <div className="p-3 w-fit rounded-xl bg-white/5 border border-white/10 text-[#c5a880] mb-6 group-hover:scale-110 transition-transform">
                  <Icon size={24} />
                </div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#c5a880] block mb-1">
                  {pillar.subtitle}
                </span>
                <h3 className="font-serif text-2xl text-[#f5f2eb] mb-3">
                  {pillar.title}
                </h3>
                <p className="text-sm text-neutral-400 font-sans leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Visual Showcase: Raw Space to Sculpted Sanctum */}
        <div className="philosophy-reveal relative rounded-3xl overflow-hidden glass-panel border border-white/10 mb-28 p-4 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden group">
              <img
                src="/assets/images/18.jpg"
                alt="Living room interior design by Gopal Lahoti"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#c5a880] block">
                  Featured Living Sanctuary
                </span>
                <h4 className="font-serif text-xl text-white">
                  The Koregaon Park Penthouse Lounge
                </h4>
              </div>
            </div>

            <div className="space-y-6 lg:p-6">
              <span className="text-xs uppercase font-sans tracking-ultraLuxury text-[#c5a880] block">
                Harmonized Volumes
              </span>
              <h3 className="font-serif text-3xl md:text-4xl text-[#f5f2eb]">
                Balancing Grandeur with Intimate Warmth
              </h3>
              <p className="text-sm md:text-base text-neutral-300 font-sans leading-relaxed">
                By pairing monolithic Italian marble surfaces with soft velvet textiles and custom
                acoustic timber louvers, we craft living spaces that feel vast yet intensely personal.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10 text-xs font-mono text-neutral-400">
                <div>
                  <span className="text-white block font-medium">Bespoke Millwork</span>
                  <span>Fluted Natural Oak</span>
                </div>
                <div>
                  <span className="text-white block font-medium">Luminescence</span>
                  <span>Circadian 2700K Tune</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Metrics Matrix */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="philosophy-reveal p-6 md:p-8 rounded-2xl glass-panel border border-white/5 text-center space-y-2"
            >
              <div className="font-serif text-4xl md:text-6xl text-[#c5a880] font-light">
                {stat.value}
              </div>
              <div className="text-xs md:text-sm font-sans uppercase tracking-wider text-white font-medium">
                {stat.label}
              </div>
              <div className="text-[10px] md:text-xs text-neutral-500 font-mono">
                {stat.sub}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

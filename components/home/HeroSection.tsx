"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ArrowDown, Sparkles, Compass } from "lucide-react";

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subtextRef = useRef<HTMLParagraphElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.2 });

      tl.from(".hero-badge", {
        opacity: 0,
        y: -20,
        duration: 0.8,
        ease: "power3.out",
      })
        .from(
          ".hero-title-line",
          {
            y: 100,
            opacity: 0,
            rotateX: -25,
            stagger: 0.15,
            duration: 1.2,
            ease: "power4.out",
          },
          "-=0.4"
        )
        .from(
          ".hero-fade-in",
          {
            opacity: 0,
            y: 30,
            stagger: 0.1,
            duration: 0.9,
            ease: "power3.out",
          },
          "-=0.6"
        );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen w-full flex flex-col justify-between pt-32 pb-12 px-6 md:px-12 overflow-hidden select-none bg-[#070708]"
    >
      {/* Background Video Layer with Film Grain and Vignette */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover scale-105 opacity-40 mix-blend-luminosity filter brightness-90 contrast-110"
        >
          <source src="/assets/videos/combine_video_1_final.mp4" type="video/mp4" />
        </video>
        {/* Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#080809] via-[#080809]/40 to-[#080809]/80" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#080809]/50 to-[#080809]" />
        <div className="absolute inset-0 bg-grain pointer-events-none opacity-40" />
      </div>

      {/* Top Meta Bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="hero-badge flex items-center space-x-3 glass-pill px-4 py-2 rounded-full">
          <span className="w-2 h-2 rounded-full bg-[#c5a880] animate-ping" />
          <span className="text-[10px] md:text-xs uppercase tracking-widest font-sans text-neutral-300">
            Accepting Bespoke Commissions 2025–2026
          </span>
        </div>

        <div className="hero-badge flex items-center space-x-6 text-[10px] md:text-xs uppercase tracking-widest text-neutral-400 font-mono">
          <span className="flex items-center space-x-1.5">
            <Compass size={13} className="text-[#c5a880]" />
            <span>19.0760° N, 72.8777° E</span>
          </span>
          <span className="hidden sm:inline-block">Residential & Commercial</span>
        </div>
      </div>

      {/* Center Cinematic Typography */}
      <div className="relative z-10 max-w-6xl my-auto py-12 md:py-16">
        <div className="overflow-hidden">
          <p className="hero-title-line text-xs md:text-sm font-sans uppercase tracking-ultraLuxury text-[#c5a880] mb-3 md:mb-5 font-semibold">
            Gopal Lahoti • Spatial Atelier
          </p>
        </div>

        <h1
          ref={headlineRef}
          className="font-serif text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-light tracking-tight leading-[0.92] uppercase text-[#f5f2eb]"
        >
          <span className="block overflow-hidden">
            <span className="hero-title-line block">Sculpting</span>
          </span>
          <span className="block overflow-hidden">
            <span className="hero-title-line block italic font-normal text-gold-gradient">
              Spatial
            </span>
          </span>
          <span className="block overflow-hidden">
            <span className="hero-title-line block">Harmony.</span>
          </span>
        </h1>

        <div className="mt-8 md:mt-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <p
            ref={subtextRef}
            className="hero-fade-in max-w-xl text-neutral-300 font-sans text-sm md:text-lg font-light leading-relaxed tracking-wide"
          >
            We orchestrate light, material alchemy, and architectural proportion to create
            sanctuaries of quiet grandeur. Every space is a bespoke narrative of timeless luxury.
          </p>

          <div className="hero-fade-in flex items-center space-x-4">
            <a
              href="#walkthrough"
              className="inline-flex items-center space-x-3 px-8 py-4 rounded-full bg-[#c5a880] hover:bg-[#d5bc96] text-[#080809] font-sans text-xs uppercase font-semibold tracking-widest transition-all duration-300 hover:scale-105 shadow-[0_0_40px_rgba(197,168,128,0.3)]"
              data-cursor="EXPLORE"
            >
              <span>Explore Walkthrough</span>
              <Sparkles size={14} />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Scroll Invite */}
      <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-6 text-[10px] md:text-xs uppercase tracking-widest text-neutral-400 font-sans">
        <span className="flex items-center space-x-2">
          <span>Scroll to traverse spaces</span>
        </span>

        <a
          href="#philosophy"
          className="flex items-center space-x-2 text-neutral-300 hover:text-[#c5a880] transition-colors"
          data-cursor="SCROLL"
        >
          <span>Discover Philosophy</span>
          <ArrowDown size={14} className="animate-bounce" />
        </a>
      </div>
    </section>
  );
}

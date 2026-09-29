"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Compass, Box, Hammer, KeyRound, ArrowRight } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    step: "01",
    icon: Compass,
    title: "Spatial Blueprint & Lifestyle Study",
    timeline: "Week 01 – 03",
    description:
      "We begin by deconstructing your daily rituals, aesthetic desires, and spatial volumes. Every line is drawn to optimize natural daylight, movement corridors, and privacy hierarchy.",
    deliverables: ["Architectural Space Plans", "Mood & Texture Boards", "Budget Feasibility Study"],
  },
  {
    step: "02",
    icon: Box,
    title: "3D Photorealism & Material Curation",
    timeline: "Week 04 – 07",
    description:
      "We render hyper-realistic 3D walkthroughs with exact ray-traced lighting, shadow gradients, and actual stone slab grain patterns before a single hammer is struck.",
    deliverables: ["Photorealistic 3D Renders", "Material Palette Box", "Comprehensive Joinery Drawings"],
  },
  {
    step: "03",
    icon: Hammer,
    title: "Bespoke Millwork & Site Execution",
    timeline: "Week 08 – 16",
    description:
      "Our master artisans and site engineers construct custom furniture, fluted paneling, and stone inlays with zero tolerance for error under continuous on-site supervision.",
    deliverables: ["Precision Custom Millwork", "Integrated MEP & Automation", "Daily Quality Audits"],
  },
  {
    step: "04",
    icon: KeyRound,
    title: "White-Glove Curation & Handover",
    timeline: "Week 17 – 18",
    description:
      "We complete the sensory transformation with art curation, custom upholstery, soft textiles, circadian lighting calibration, and luxury home scenting for your grand reveal.",
    deliverables: ["Fine Art & Decor Styling", "Automation Calibration", "Turnkey Key Handover"],
  },
];

export default function ProcessSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.from(".process-card", {
        scrollTrigger: {
          trigger: el,
          start: "top 70%",
        },
        y: 60,
        opacity: 0,
        stagger: 0.15,
        duration: 0.9,
        ease: "power3.out",
      });
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="process"
      ref={sectionRef}
      className="py-28 md:py-40 bg-[#080809] text-[#f4f1ea] px-6 md:px-12 border-t border-white/5"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
          <div>
            <span className="text-xs uppercase font-sans tracking-ultraLuxury text-[#c5a880] block mb-3">
              04 • Methodology
            </span>
            <h2 className="font-serif text-3xl md:text-6xl uppercase tracking-tight text-[#f5f2eb]">
              The Turnkey <span className="italic text-gold-gradient">Journey</span>
            </h2>
          </div>
          <p className="max-w-md text-sm text-neutral-400 font-sans leading-relaxed">
            From raw spatial volume to turnkey perfection, our 4-phase methodology guarantees complete design fidelity and effortless execution.
          </p>
        </div>

        {/* Process Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="process-card group p-6 md:p-8 rounded-2xl glass-panel border border-white/10 hover:border-[#c5a880]/50 transition-all duration-500 hover:-translate-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <span className="font-serif text-3xl md:text-4xl text-[#c5a880] font-light">
                      {item.step}
                    </span>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-neutral-300 group-hover:text-[#c5a880] transition-colors">
                      <Icon size={20} />
                    </div>
                  </div>

                  <span className="text-[10px] font-mono uppercase text-neutral-400 tracking-wider block mb-2">
                    {item.timeline}
                  </span>

                  <h3 className="font-serif text-xl text-[#f5f2eb] mb-3 leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-xs text-neutral-400 font-sans leading-relaxed mb-6">
                    {item.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/10 space-y-2">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-[#c5a880] block">
                    Key Deliverables:
                  </span>
                  <ul className="text-[11px] text-neutral-300 font-sans space-y-1">
                    {item.deliverables.map((d) => (
                      <li key={d} className="flex items-center space-x-1.5">
                        <span className="w-1 h-1 rounded-full bg-[#c5a880]" />
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

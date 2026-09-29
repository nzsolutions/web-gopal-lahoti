"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Layers, Sliders, CheckCircle2, ArrowRight } from "lucide-react";

interface MaterialItem {
  id: string;
  name: string;
  category: string;
  origin: string;
  finish: string;
  image: string;
  description: string;
  properties: { label: string; score: number }[];
  application: string;
}

const materials: MaterialItem[] = [
  {
    id: "statuario-marble",
    name: "Calacatta Gold & Statuario Marble",
    category: "Natural Stone",
    origin: "Carrara, Italy",
    finish: "Book-matched High Polish & Honed",
    image: "/assets/images/19.jpg",
    description:
      "Quarried from the Apuan Alps, this iconic stone features dramatic warm ochre and charcoal veining traversing an immaculate milky white field. Each slab is custom-templated and book-matched across flooring and monolithic feature counters.",
    properties: [
      { label: "Light Reflectance", score: 94 },
      { label: "Tactile Coolness", score: 98 },
      { label: "Visual Grandeur", score: 99 },
    ],
    application: "Living room floors, kitchen islands, vanity slabs, fireplace surrounds",
  },
  {
    id: "fluted-oak",
    name: "Acoustic Fluted White Oak & Walnut",
    category: "Timber & Millwork",
    origin: "Bavaria, Germany",
    finish: "Matte Polyurethane & Natural Hardwax",
    image: "/assets/images/1.jpg",
    description:
      "Sustainably harvested hardwoods precision-milled into micro and macro architectural flutes. Backed by acoustic dampening fleece, this surface warms the ambient tone while creating mesmerizing shadow lines when grazed by soft light.",
    properties: [
      { label: "Acoustic Absorption", score: 88 },
      { label: "Tactile Warmth", score: 96 },
      { label: "Architectural Depth", score: 95 },
    ],
    application: "Feature walls, master bedroom headboards, concealed wardrobe fronts",
  },
  {
    id: "champagne-brass",
    name: "Brushed Champagne Brass Trims",
    category: "Metals & Hardware",
    origin: "Milan, Italy",
    finish: "PVD Coated Brushed Satin",
    image: "/assets/images/22.jpg",
    description:
      "A subtle, understated golden hue treated with Physical Vapor Deposition (PVD) for exceptional scratch and oxidation resistance. Used as micro-reveals between stone and wood joints to elevate fine craftsmanship.",
    properties: [
      { label: "Corrosion Resistance", score: 98 },
      { label: "Lustrous Sheen", score: 90 },
      { label: "Precision Jointing", score: 97 },
    ],
    application: "Skirting inlays, door handles, bespoke lighting armatures, mirror borders",
  },
  {
    id: "glazed-terracotta",
    name: "Glazed Herringbone Terracotta",
    category: "Ceramic & Clay",
    origin: "Emilia-Romagna, Italy",
    finish: "Hand-Glazed Semi-Gloss",
    image: "/assets/images/5.jpg",
    description:
      "Handcrafted clay tiles fired at extreme temperatures to produce rich chromatic variations. Installed in dynamic herringbone chevron patterns to bring vibrant texture and organic personality to reception portals.",
    properties: [
      { label: "Chromatic Richness", score: 96 },
      { label: "Thermal Inertia", score: 85 },
      { label: "Texture Contrast", score: 94 },
    ],
    application: "Corporate reception backdrops, feature niches, bar facades",
  },
];

export default function MaterialAtelier() {
  const [selectedId, setSelectedId] = useState(materials[0].id);
  const activeMaterial = materials.find((m) => m.id === selectedId) || materials[0];

  return (
    <section id="atelier" className="py-28 md:py-40 bg-[#070708] text-[#f4f1ea] px-6 md:px-12 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
          <div>
            <span className="text-xs uppercase font-sans tracking-ultraLuxury text-[#c5a880] block mb-3">
              03 • Material Alchemy
            </span>
            <h2 className="font-serif text-3xl md:text-6xl uppercase tracking-tight text-[#f5f2eb]">
              The Tactile <span className="italic text-gold-gradient">Atelier</span>
            </h2>
          </div>
          <p className="max-w-md text-sm text-neutral-400 font-sans leading-relaxed">
            We scour global quarries and artisanal mills to source materials that age with grace, delivering spaces rich with tactile resonance.
          </p>
        </div>

        {/* Material Selection Tabs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {materials.map((mat) => {
            const isSelected = mat.id === selectedId;
            return (
              <button
                key={mat.id}
                onClick={() => setSelectedId(mat.id)}
                className={`p-5 rounded-2xl text-left transition-all duration-300 glass-panel border ${
                  isSelected
                    ? "border-[#c5a880] bg-[#c5a880]/10 shadow-[0_0_30px_rgba(197,168,128,0.15)] scale-[1.02]"
                    : "border-white/5 hover:border-white/20"
                }`}
                data-cursor="SELECT"
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] uppercase font-mono text-[#c5a880]">
                    {mat.category}
                  </span>
                  {isSelected && <Sparkles size={14} className="text-[#c5a880]" />}
                </div>
                <h3 className="font-serif text-lg text-white font-medium mb-1">
                  {mat.name.split("&")[0]}
                </h3>
                <span className="text-xs text-neutral-400 font-sans">
                  Origin: {mat.origin.split(",")[0]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Material Showcase Panel */}
        <div className="glass-panel border border-white/10 rounded-3xl p-6 md:p-12 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeMaterial.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center"
            >
              {/* Visual Preview */}
              <div className="lg:col-span-6 relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                <img
                  src={activeMaterial.image}
                  alt={activeMaterial.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                  <div className="glass-pill px-3 py-1.5 rounded-full text-[10px] font-mono text-white">
                    {activeMaterial.finish}
                  </div>
                </div>
              </div>

              {/* Material Detail Specifications */}
              <div className="lg:col-span-6 space-y-6">
                <div className="space-y-2">
                  <span className="text-xs uppercase font-mono tracking-widest text-[#c5a880]">
                    {activeMaterial.category} • Provenance: {activeMaterial.origin}
                  </span>
                  <h3 className="font-serif text-3xl md:text-4xl text-white">
                    {activeMaterial.name}
                  </h3>
                </div>

                <p className="text-sm md:text-base text-neutral-300 font-sans leading-relaxed">
                  {activeMaterial.description}
                </p>

                {/* Score Meters */}
                <div className="space-y-3 pt-4 border-t border-white/10">
                  {activeMaterial.properties.map((prop) => (
                    <div key={prop.label} className="space-y-1">
                      <div className="flex justify-between text-xs font-mono text-neutral-300">
                        <span>{prop.label}</span>
                        <span className="text-[#c5a880]">{prop.score}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${prop.score}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className="h-full bg-gradient-to-r from-[#c5a880] to-[#f5f2eb]"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Recommended Application */}
                <div className="pt-4 border-t border-white/10 flex items-start space-x-3 text-xs text-neutral-400 font-sans">
                  <CheckCircle2 size={16} className="text-[#c5a880] shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Optimal Applications: </strong>
                    {activeMaterial.application}
                  </span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

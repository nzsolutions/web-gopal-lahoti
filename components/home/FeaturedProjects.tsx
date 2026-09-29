"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, X, Sparkles, MapPin, Maximize, Layers } from "lucide-react";

interface Project {
  id: string;
  title: string;
  category: "residential" | "commercial" | "sacred" | "suites";
  categoryLabel: string;
  location: string;
  area: string;
  year: string;
  image: string;
  description: string;
  materials: string[];
  highlights: string[];
}

const projects: Project[] = [
  {
    id: "bhujbal-residence",
    title: "The Bhujbal Celestial Residence",
    category: "residential",
    categoryLabel: "Luxury Residence",
    location: "Koregaon Park, Pune",
    area: "5,400 SQ. FT.",
    year: "2024",
    image: "/assets/images/18.jpg",
    description:
      "A grand contemporary living lounge designed with an expansive open-concept layout. Features custom beige Italian modular sofas, tan leather swivel recliners, layered sheer acoustic drapery, and high-gloss marble flooring with architectural cove luminescence.",
    materials: ["Italian Statuario Marble", "Fluted Oak Millwork", "Leather Upholstery", "Acoustic Drapes"],
    highlights: ["Circadian Cove Lighting System", "Custom Monolithic Coffee Tables", "Concealed Audio Integration"],
  },
  {
    id: "laxmi-headquarters",
    title: "Laxmi Group Corporate Headquarters",
    category: "commercial",
    categoryLabel: "Commercial & Corporate",
    location: "BKC Commercial Hub, Mumbai",
    area: "3,800 SQ. FT.",
    year: "2024",
    image: "/assets/images/5.jpg",
    description:
      "A commanding luxury corporate reception suite designed to leave an unforgettable impression. Features handcrafted terracotta herringbone tile wall panelling, a custom sculptural bronze reception console, marble flooring, and fluted glass partitions.",
    materials: ["Handmade Glazed Herringbone Tiles", "Patinated Bronze Finish", "Calacatta Porcelain", "Fluted Glass"],
    highlights: ["Custom Sculptural Reception Desk", "Backlit Corporate Emblem", "Linear Track Lighting Grid"],
  },
  {
    id: "sacred-sanctum",
    title: "The Sacred Sanctum (Pooja Room)",
    category: "sacred",
    categoryLabel: "Sacred & Spiritual",
    location: "Amanora Park Town, Pune",
    area: "450 SQ. FT.",
    year: "2024",
    image: "/assets/images/6.jpg",
    description:
      "A serene and contemporary spiritual sanctuary. Features laser-etched Gayatri Mantra typography on ivory plaster, an illuminated halo deity backdrop with ambient backlighting, fluted timber ceilings, and fluted terracotta storage joinery.",
    materials: ["Sanskrit Wall Engraving", "Backlit Translucent Onyx Acrylic", "Fluted Teakwood Ceiling", "Fluted Coral Cabinetry"],
    highlights: ["Sacred Mandala Wall Relief", "Suspended Brass Diyas", "Hidden Ambient Illumination"],
  },
  {
    id: "versace-suite",
    title: "The Versace Master Suite",
    category: "suites",
    categoryLabel: "Luxury Suites",
    location: "Worli Sea Face, Mumbai",
    area: "850 SQ. FT.",
    year: "2023",
    image: "/assets/images/1.jpg",
    description:
      "An opulent master bedroom suite centered around acoustic fluted natural oak wall paneling, a custom burgundy leather headboard, designer drop pendant spotlights, and bespoke Versace textile bedding.",
    materials: ["Fluted White Oak Paneling", "Italian Burgundy Leather", "Brushed Matte Brass", "Versace Silk Textiles"],
    highlights: ["Concealed Headboard Mood Lighting", "Minimalist Marble Nightstands", "Architectural Downlights"],
  },
  {
    id: "givenchy-suite",
    title: "The Givenchy Dark Walnut Suite",
    category: "suites",
    categoryLabel: "Luxury Suites",
    location: "Bandra West, Mumbai",
    area: "780 SQ. FT.",
    year: "2023",
    image: "/assets/images/2.jpg",
    description:
      "A rich, atmospheric guest suite clad in book-matched dark walnut wood veneer, a custom stone nightstand with brass accents, modern ceramic drop pendant, and Givenchy luxury bedding.",
    materials: ["Smoked Dark Walnut Veneer", "Nero Marquina Marble", "Ceramic Pendant", "Givenchy Linens"],
    highlights: ["Custom Floating Side Tables", "Warm Grazing Wall Washers", "Integrated Bedside Automation"],
  },
  {
    id: "amber-lounge",
    title: "The Grand Living & Amber Lounge",
    category: "residential",
    categoryLabel: "Luxury Residence",
    location: "Prabhat Road, Pune",
    area: "4,200 SQ. FT.",
    year: "2024",
    image: "/assets/images/3.jpg",
    description:
      "An expansive residential living room boasting panoramic glass windows, double-height sheer curtains, Italian leather seating, and custom timber display cabinetry with concealed lighting.",
    materials: ["Fine Weave Sheers", "Italian Tan Leather", "Smoked Glass Cabinetry", "Composite Marble"],
    highlights: ["Custom Timber Vitrine", "Integrated Ceiling AC Diffusers", "Layered Acoustic Textiles"],
  },
];

const categories = [
  { id: "all", label: "All Commissions" },
  { id: "residential", label: "Bespoke Residences" },
  { id: "commercial", label: "Corporate & Commercial" },
  { id: "sacred", label: "Sacred Sanctums" },
  { id: "suites", label: "Master Suites" },
];

export default function FeaturedProjects() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const filteredProjects =
    activeCategory === "all"
      ? projects
      : projects.filter((p) => p.category === activeCategory);

  return (
    <section id="projects" className="py-28 md:py-40 bg-[#080809] text-[#f4f1ea] px-6 md:px-12 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div>
            <span className="text-xs uppercase font-sans tracking-ultraLuxury text-[#c5a880] block mb-3">
              02 • Selected Portfolio
            </span>
            <h2 className="font-serif text-3xl md:text-6xl uppercase tracking-tight text-[#f5f2eb]">
              Curated <span className="italic text-gold-gradient">Commissions</span>
            </h2>
          </div>
          <p className="max-w-md text-sm text-neutral-400 font-sans leading-relaxed">
            Each project is an uncompromised translation of our client's aspiration into enduring architectural form and sensory luxury.
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center gap-3 mb-16 pb-4 border-b border-white/10">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-5 py-2.5 rounded-full text-xs uppercase font-sans tracking-wider transition-all duration-300 ${
                activeCategory === cat.id
                  ? "bg-[#c5a880] text-[#080809] font-semibold shadow-lg scale-105"
                  : "bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10"
              }`}
              data-cursor="FILTER"
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project) => (
            <motion.div
              key={project.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              onClick={() => setSelectedProject(project)}
              className="group cursor-pointer rounded-2xl glass-panel border border-white/10 overflow-hidden hover:border-[#c5a880]/50 transition-all duration-500 hover:-translate-y-2 flex flex-col"
              data-cursor="VIEW CASE"
            >
              {/* Image Container */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-900">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 filter brightness-95 group-hover:brightness-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                {/* Category Badge */}
                <div className="absolute top-4 left-4 glass-pill px-3 py-1.5 rounded-full text-[10px] uppercase font-mono text-[#c5a880]">
                  {project.categoryLabel}
                </div>

                {/* Arrow Icon */}
                <div className="absolute top-4 right-4 p-2.5 rounded-full glass-pill text-white group-hover:bg-[#c5a880] group-hover:text-black transition-all">
                  <ArrowUpRight size={16} />
                </div>

                <div className="absolute bottom-4 left-4 right-4">
                  <span className="text-[10px] font-mono text-neutral-400 block mb-1">
                    {project.location} • {project.year}
                  </span>
                  <h3 className="font-serif text-xl text-[#f5f2eb] group-hover:text-[#c5a880] transition-colors">
                    {project.title}
                  </h3>
                </div>
              </div>

              {/* Card Footer Info */}
              <div className="p-5 flex items-center justify-between text-xs text-neutral-400 font-mono border-t border-white/5 mt-auto">
                <span className="flex items-center space-x-1.5">
                  <Layers size={13} className="text-[#c5a880]" />
                  <span>{project.area}</span>
                </span>
                <span className="text-[#c5a880] uppercase text-[10px] tracking-wider font-sans font-semibold">
                  View Specifications →
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Interactive Case Study Modal */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-xl"
            onClick={() => setSelectedProject(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl w-full max-h-[90vh] overflow-y-auto glass-panel border border-[#c5a880]/40 rounded-3xl p-6 md:p-10 shadow-2xl"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedProject(null)}
                className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-[#c5a880] hover:text-black transition-colors text-white"
              >
                <X size={18} />
              </button>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center mb-8">
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
                  <img
                    src={selectedProject.image}
                    alt={selectedProject.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-4">
                  <span className="text-xs uppercase font-mono tracking-widest text-[#c5a880]">
                    {selectedProject.categoryLabel} • {selectedProject.year}
                  </span>
                  <h3 className="font-serif text-3xl md:text-4xl text-white">
                    {selectedProject.title}
                  </h3>
                  <div className="flex items-center space-x-4 text-xs font-mono text-neutral-400 py-2 border-y border-white/10">
                    <span className="flex items-center space-x-1">
                      <MapPin size={13} className="text-[#c5a880]" />
                      <span>{selectedProject.location}</span>
                    </span>
                    <span>•</span>
                    <span>{selectedProject.area}</span>
                  </div>
                  <p className="text-sm text-neutral-300 font-sans leading-relaxed">
                    {selectedProject.description}
                  </p>
                </div>
              </div>

              {/* Specifications Matrix */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-white/10">
                <div className="space-y-2">
                  <h4 className="text-xs uppercase font-mono tracking-wider text-[#c5a880] flex items-center space-x-2">
                    <Sparkles size={13} />
                    <span>Materials & Finishes</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-neutral-300 font-sans">
                    {selectedProject.materials.map((m) => (
                      <li key={m} className="flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#c5a880]" />
                        <span>{m}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs uppercase font-mono tracking-wider text-[#c5a880] flex items-center space-x-2">
                    <Layers size={13} />
                    <span>Architectural Highlights</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-neutral-300 font-sans">
                    {selectedProject.highlights.map((h) => (
                      <li key={h} className="flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#c5a880]" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Inquiry Action */}
              <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs text-neutral-400 font-sans">
                  Interested in a similar spatial blueprint?
                </span>
                <a
                  href="#contact"
                  onClick={() => setSelectedProject(null)}
                  className="inline-flex items-center space-x-2 px-6 py-3 rounded-full bg-[#c5a880] text-[#080809] font-sans text-xs uppercase font-semibold tracking-wider hover:bg-[#d8be98] transition-colors"
                >
                  <span>Request Commission</span>
                  <ArrowUpRight size={14} />
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

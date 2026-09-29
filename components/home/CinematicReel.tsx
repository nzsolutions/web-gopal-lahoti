"use client";

import { useState, useRef } from "react";
import { Play, Pause, Volume2, VolumeX, Sparkles, Quote, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const testimonials = [
  {
    id: 1,
    quote:
      "Gopal transformed our 5,400 sq. ft. penthouse into a living art gallery. The harmony of Italian marble, acoustic fluted timber, and customized lighting exceeded every expectation.",
    author: "Mr. R. Bhujbal",
    designation: "Industrialist & Homeowner",
    location: "Koregaon Park, Pune",
  },
  {
    id: 2,
    quote:
      "The corporate headquarters reception designed by Gopal Lahoti has become our brand's most powerful statement. The herringbone terracotta and bronze console are pure perfection.",
    author: "Virendra S.",
    designation: "Managing Director, Laxmi Group",
    location: "BKC, Mumbai",
  },
  {
    id: 3,
    quote:
      "The Mandir design brings an overwhelming sense of calm every morning. The illuminated backlit halo and Gayatri Mantra wall etching are breathtaking in detail.",
    author: "Dr. Ananya Mehta",
    designation: "Private Residence",
    location: "Amanora, Pune",
  },
];

export default function CinematicReel() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <section className="py-28 md:py-40 bg-[#070708] text-[#f4f1ea] px-6 md:px-12 border-t border-white/5 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div>
            <span className="text-xs uppercase font-sans tracking-ultraLuxury text-[#c5a880] block mb-3">
              05 • Cinematic Motion
            </span>
            <h2 className="font-serif text-3xl md:text-6xl uppercase tracking-tight text-[#f5f2eb]">
              Atmosphere in <span className="italic text-gold-gradient">Motion</span>
            </h2>
          </div>
          <p className="max-w-md text-sm text-neutral-400 font-sans leading-relaxed">
            Experience the fluid choreography of space, shadow, and materiality captured across our completed luxury commissions.
          </p>
        </div>

        {/* Video Player Box */}
        <div className="relative aspect-video w-full rounded-3xl overflow-hidden glass-panel border border-white/10 shadow-2xl mb-20 group">
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover filter brightness-95 contrast-105"
          >
            <source src="/assets/videos/lahoti_designs_reels_video_4_final.mp4" type="video/mp4" />
          </video>

          {/* Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

          {/* Top Info Badge */}
          <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
            <div className="glass-pill px-4 py-2 rounded-full flex items-center space-x-2 text-xs font-mono text-white">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span>Gopal Lahoti • 4K Cinematic Showcase</span>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={toggleMute}
                className="p-3 rounded-full glass-pill hover:bg-[#c5a880] hover:text-black transition-all text-white"
                data-cursor="AUDIO"
              >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
              <button
                onClick={togglePlay}
                className="p-3 rounded-full bg-[#c5a880] hover:bg-[#d8be98] text-[#080809] transition-transform duration-300 hover:scale-110 shadow-lg"
                data-cursor={isPlaying ? "PAUSE" : "PLAY"}
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              </button>
            </div>
          </div>

          {/* Bottom Headline */}
          <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
            <div>
              <span className="text-[10px] uppercase font-mono text-[#c5a880] tracking-widest block">
                Official Studio Reel
              </span>
              <h3 className="font-serif text-xl md:text-3xl text-white">
                Fluid Spatial Choreography
              </h3>
            </div>
          </div>
        </div>

        {/* Client Acclaim & Testimonials */}
        <div className="glass-panel border border-white/10 rounded-3xl p-8 md:p-16">
          <div className="flex items-center space-x-2 text-xs font-mono text-[#c5a880] uppercase tracking-widest mb-8">
            <Sparkles size={14} />
            <span>Client Acclaim & Experience</span>
          </div>

          <div className="relative min-h-[160px] flex flex-col justify-between">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                <p className="font-serif text-xl md:text-3xl text-[#f5f2eb] font-light italic leading-relaxed">
                  "{testimonials[activeTestimonial].quote}"
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-white/10">
                  <div>
                    <h4 className="font-sans text-sm font-semibold uppercase tracking-wider text-white">
                      {testimonials[activeTestimonial].author}
                    </h4>
                    <span className="text-xs text-neutral-400 font-sans">
                      {testimonials[activeTestimonial].designation} •{" "}
                      {testimonials[activeTestimonial].location}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1 text-[#c5a880]">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill="#c5a880" />
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Testimonial Nav Dots */}
          <div className="flex items-center space-x-3 mt-8">
            {testimonials.map((t, idx) => (
              <button
                key={t.id}
                onClick={() => setActiveTestimonial(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  activeTestimonial === idx ? "w-8 bg-[#c5a880]" : "w-2 bg-white/20 hover:bg-white/40"
                }`}
                aria-label={`Testimonial ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

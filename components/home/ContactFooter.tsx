"use client";

import { useState } from "react";
import { ArrowUpRight, ArrowUp, Mail, MapPin, Phone, Sparkles, CheckCircle } from "lucide-react";

export default function ContactFooter() {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    projectType: "Luxury Residence",
    approxArea: "3,000 - 5,000 SQ. FT.",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => setFormSubmitted(false), 6000);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer id="contact" className="relative bg-[#050506] text-[#f4f1ea] pt-28 md:pt-40 pb-16 px-6 md:px-12 border-t border-white/10 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-28">
          {/* Left Column: Big Brand Statement & Contacts */}
          <div className="lg:col-span-6 space-y-12">
            <div>
              <span className="text-xs uppercase font-sans tracking-ultraLuxury text-[#c5a880] block mb-3">
                06 • Commission an Atelier Space
              </span>
              <h2 className="font-serif text-4xl sm:text-6xl md:text-7xl uppercase tracking-tight text-[#f5f2eb] leading-tight">
                Let's Craft Your <span className="italic text-gold-gradient">Masterpiece</span>
              </h2>
            </div>

            <p className="text-base md:text-lg text-neutral-300 font-sans leading-relaxed max-w-lg">
              We accept a limited number of bespoke residential and commercial commissions each
              year to ensure meticulous craftsmanship and personal attention to every square inch.
            </p>

            <div className="space-y-6 pt-4 border-t border-white/10">
              <div className="flex items-start space-x-4">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[#c5a880] shrink-0">
                  <Mail size={18} />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 block">
                    Direct Studio Inquiries
                  </span>
                  <a
                    href="mailto:gopallahotidesigns@gmail.com"
                    className="text-lg md:text-xl font-serif text-white hover:text-[#c5a880] transition-colors"
                  >
                    gopallahotidesigns@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[#c5a880] shrink-0">
                  <MapPin size={18} />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 block">
                    Atelier Locations
                  </span>
                  <p className="text-sm md:text-base font-sans text-neutral-200">
                    Mumbai • Pune • Pan-India Turnkey Executions
                  </p>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-4 pt-4">
              <a
                href="https://www.instagram.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-2 px-4 py-2 rounded-full glass-pill hover:bg-[#c5a880] hover:text-black text-xs font-mono uppercase transition-all"
                data-cursor="INSTA"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                <span>Instagram</span>
              </a>
              <a
                href="https://www.linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-2 px-4 py-2 rounded-full glass-pill hover:bg-[#c5a880] hover:text-black text-xs font-mono uppercase transition-all"
                data-cursor="LINKEDIN"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
                <span>LinkedIn</span>
              </a>
            </div>
          </div>

          {/* Right Column: Luxury Inquiry Form */}
          <div className="lg:col-span-6">
            <div className="glass-panel p-8 md:p-12 rounded-3xl border border-white/10 shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-serif text-2xl text-white">
                  Spatial Consultation Request
                </h3>
                <span className="text-[10px] font-mono text-[#c5a880] uppercase tracking-widest">
                  Priority Response
                </span>
              </div>

              {formSubmitted ? (
                <div className="py-16 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-[#c5a880]/20 border border-[#c5a880] flex items-center justify-center mx-auto text-[#c5a880]">
                    <CheckCircle size={32} />
                  </div>
                  <h4 className="font-serif text-2xl text-white">Inquiry Received</h4>
                  <p className="text-sm text-neutral-300 font-sans max-w-sm mx-auto">
                    Thank you for reaching out to Gopal Lahoti Designs. Our principal architect will contact you within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono uppercase text-neutral-400">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rohini Singhania"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#c5a880] transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono uppercase text-neutral-400">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="rohini@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#c5a880] transition-colors"
                      />
                    </div>
                  </div>

                  {/* Phone & Scope */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono uppercase text-neutral-400">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#c5a880] transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono uppercase text-neutral-400">
                        Commission Type
                      </label>
                      <select
                        value={formData.projectType}
                        onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                        className="w-full bg-[#121214] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#c5a880] transition-colors"
                      >
                        <option value="Luxury Residence">Luxury Residence / Villa</option>
                        <option value="Sky Penthouse">Sky Penthouse Lounge</option>
                        <option value="Commercial HQ">Corporate Headquarters</option>
                        <option value="Sacred Mandir">Sacred Mandir Sanctuary</option>
                        <option value="Turnkey Styling">Full Turnkey Interior</option>
                      </select>
                    </div>
                  </div>

                  {/* Message */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase text-neutral-400">
                      Project Vision & Timeline
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Describe your spatial scope, location, and aesthetic preferences..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#c5a880] transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 rounded-full bg-[#c5a880] hover:bg-[#d8be98] text-[#080809] font-sans text-xs uppercase font-semibold tracking-wider flex items-center justify-center space-x-2 transition-transform duration-300 hover:scale-[1.02] shadow-[0_0_30px_rgba(197,168,128,0.3)]"
                    data-cursor="SUBMIT"
                  >
                    <span>Transmit Commission Brief</span>
                    <ArrowUpRight size={16} />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Footer Bar */}
        <div className="pt-12 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-neutral-500 font-mono">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-6">
            <span>© {new Date().getFullYear()} Gopal Lahoti Designs. All Rights Reserved.</span>
            <span>Crafted for Luxury Spatial Architecture</span>
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center space-x-2 text-neutral-300 hover:text-[#c5a880] transition-colors uppercase font-sans text-[10px] tracking-widest"
            data-cursor="TOP"
          >
            <span>Back to Top</span>
            <div className="p-2 rounded-full glass-pill">
              <ArrowUp size={12} />
            </div>
          </button>
        </div>
      </div>
    </footer>
  );
}

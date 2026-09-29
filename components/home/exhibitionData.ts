export interface ExhibitionArtwork {
  id: string;
  chamberId: string;
  title: string;
  project: string;
  location: string;
  category: string;
  image: string;
  description: string;
  materials: string[];
  dimensions: string;
  aspectRatio: "landscape" | "portrait" | "panoramic";
}

export const EXHIBITION_CATALOG: Record<string, ExhibitionArtwork[]> = {
  grand: [
    {
      id: "ch1_living",
      chamberId: "grand",
      title: "The Monolithic Living Suite",
      project: "Koregaon Park Estate",
      location: "Pune, Maharashtra",
      category: "Double-Height Main Salon",
      image: "/assets/exhibition/ch1_living.jpg",
      description:
        "A sprawling double-height living pavilion anchored by book-matched Italian Statuario marble slabs with subtle champagne gold veining. Bespoke low-profile modular seating in textured Belgian taupe linen wraps the central lounge, complemented by floating monolithic coffee tables in honed Nero Marquina and brushed brass accents. Concealed architectural cove illumination casts a warm 2700K ambient wash down the 24-foot limestone plaster feature walls.",
      materials: ["Statuario Gold Marble", "Belgian Taupe Linen", "Honed Nero Marquina", "Brushed Brass Reveal"],
      dimensions: "6.5m × 3.6m Feature Display",
      aspectRatio: "panoramic",
    },
    {
      id: "ch1_dining",
      chamberId: "grand",
      title: "The Horizon Dining Pavilion",
      project: "Panchshil Waterfront Penthouse",
      location: "Pune, Maharashtra",
      category: "Formal Dining Gallery",
      image: "/assets/exhibition/ch1_dining.jpg",
      description:
        "A grand 10-seater formal dining sanctuary defined by a custom seamless Calacatta porcelain table with bullnose edging and champagne bronze pedestal bases. Above hangs an organic bespoke multi-tiered blown glass and brushed brass chandelier. Backlit acoustic white oak fluted millwork lines the perimeter, concealing flush climate diffusers and integrated service credenzas.",
      materials: ["Calacatta Gold Porcelain", "Champagne Bronze", "Fluted European White Oak", "Artisan Blown Glass"],
      dimensions: "3.8m × 2.6m Wall Frame",
      aspectRatio: "landscape",
    },
    {
      id: "ch1_parlour",
      chamberId: "grand",
      title: "The Family Media Parlour",
      project: "Koregaon Park Estate",
      location: "Pune, Maharashtra",
      category: "Intimate Entertainment Salon",
      image: "/assets/exhibition/ch1_parlour.jpg",
      description:
        "Designed for circadian relaxation, this private family lounge showcases deep coffered timber ceiling trays with integrated warm LED light channels. A plush sectional in saddle-stitched cognac leather provides luxurious comfort, framed by fluted acoustic fabric wall panels that eliminate flutter echoes during audio playback.",
      materials: ["Natural Smoked Walnut", "Saddle-Stitched Cognac Leather", "Acoustic Suede Paneling", "Warm LED Coving"],
      dimensions: "3.8m × 2.6m Wall Frame",
      aspectRatio: "landscape",
    },
    {
      id: "ch1_lounge",
      chamberId: "grand",
      title: "The Atelier Floral Lounge",
      project: "Koregaon Park Estate",
      location: "Pune, Maharashtra",
      category: "Private Conversation Alcove",
      image: "/assets/exhibition/ch1_lounge.jpg",
      description:
        "An intimate salon nook featuring sculpted velvet accent seating in dusty rose and charcoal tones. A recessed architectural niche clad in polished backlit travertine highlights seasonal Japanese Ikebana floral artistry and bespoke bronze pedestal tables.",
      materials: ["Backlit Travertine Niche", "Italian Rose Velvet", "PVD Champagne Gold Brass", "Smoked Oak Parquet"],
      dimensions: "3.6m × 2.6m Wall Frame",
      aspectRatio: "landscape",
    },
    {
      id: "ch1_media",
      chamberId: "grand",
      title: "The Master Entertainment Wall",
      project: "Koregaon Park Estate",
      location: "Pune, Maharashtra",
      category: "Architectural Millwork & AV Console",
      image: "/assets/exhibition/ch1_media.jpg",
      description:
        "A monumental media installation blending seamless Italian porcelain slabs, vertical white oak acoustics, and an integrated cantilevered fireplace hearth. Precision shadow reveals and recessed perimeter halo lighting give the massive stone elements an ethereal floating appearance.",
      materials: ["Book-matched Porcelain", "Vertical Oak Slats", "Integrated Fire Ribbon", "Concealed AV Diffusers"],
      dimensions: "3.6m × 2.6m Wall Frame",
      aspectRatio: "landscape",
    },
  ],

  versace: [
    {
      id: "ch2_woodbed",
      chamberId: "versace",
      title: "The Fluted White Oak Retreat",
      project: "Worli Sea Face Residence",
      location: "Mumbai, Maharashtra",
      category: "Master Bedroom Chamber",
      image: "/assets/exhibition/ch2_woodbed.jpg",
      description:
        "An opulent master chamber defined by floor-to-ceiling European white oak paneling milled with micro-fluted vertical profiles. The bed headboard is wrapped in rich burgundy aniline leather with brass channel inlays, framed beneath a recessed floating ceiling tray that casts a soothing indirect 2400K candlelight glow over the suite.",
      materials: ["European Fluted White Oak", "Burgundy Italian Aniline Leather", "Brushed Brass Channel Inlay", "Silk Carpet"],
      dimensions: "6.0m × 3.2m Hero Headboard Feature",
      aspectRatio: "panoramic",
    },
    {
      id: "ch2_bed1",
      chamberId: "versace",
      title: "The Horizon Master Bed Suite",
      project: "Worli Sea Face Residence",
      location: "Mumbai, Maharashtra",
      category: "Bedroom Lounge Installation",
      image: "/assets/exhibition/ch2_bed1.jpg",
      description:
        "A serene primary bedroom composition showcasing tailored wall drapery in fine oyster linen, integrated bedside cantilever consoles, and drop pendant spotlight luminaires in solid satin brass providing focused reading illumination without ambient glare.",
      materials: ["Oyster Belgian Linen", "Satin Brass Pendants", "Cantilevered Nightstands", "Engineered Oak Flooring"],
      dimensions: "3.8m × 2.6m Wall Frame",
      aspectRatio: "landscape",
    },
    {
      id: "ch2_vanity",
      chamberId: "versace",
      title: "The Haute Couture Vanity Mirror",
      project: "Worli Sea Face Residence",
      location: "Mumbai, Maharashtra",
      category: "Walk-in Dressing & Grooming Suite",
      image: "/assets/exhibition/ch2_vanity.jpg",
      description:
        "A bespoke vanity ensemble featuring floor-to-ceiling vertical amber fluted glass louvers backlit with circadian 3000K beauty illumination. The floating dressing counter is carved from a monolithic slab of Calacatta Gold marble, paired with brushed champagne brass tapware and custom velvet-lined jewellery organizers.",
      materials: ["Fluted Amber Glass", "Calacatta Gold Marble Slab", "Brushed Champagne Brass", "Full-Height Backlit Mirrors"],
      dimensions: "2.6m × 3.2m Portrait Display",
      aspectRatio: "portrait",
    },
    {
      id: "ch2_emerald",
      chamberId: "versace",
      title: "The Emerald Accent Master Suite",
      project: "Worli Sea Face Residence",
      location: "Mumbai, Maharashtra",
      category: "Upholstered Bed Chamber",
      image: "/assets/exhibition/ch2_emerald.jpg",
      description:
        "An ultra-luxury bedroom vignette highlighting channel-tufted deep emerald velvet wall paneling with brushed brass shadow reveals. Floating side tables in Nero Marquina marble with integrated wireless inductive charging provide sleek modern functionality.",
      materials: ["Deep Emerald Velvet", "Nero Marquina Marble", "Brushed Brass Spacers", "Recessed LED Channels"],
      dimensions: "3.8m × 2.6m Wall Frame",
      aspectRatio: "landscape",
    },
    {
      id: "ch2_linear",
      chamberId: "versace",
      title: "The Linear Headboard Atelier",
      project: "Worli Sea Face Residence",
      location: "Mumbai, Maharashtra",
      category: "Master Suite Detail",
      image: "/assets/exhibition/ch2_linear.jpg",
      description:
        "Close architectural study of bespoke horizontal headboard upholstery integrated with architectural reading lights and concealed storage wardrobes with custom milled oak pull profiles.",
      materials: ["Warm Taupe Bouclé", "Smoked Oak Veneer", "Concealed Wardrobe Joinery", "Minimalist Brass Sconces"],
      dimensions: "3.8m × 2.6m Wall Frame",
      aspectRatio: "landscape",
    },
  ],

  sacred: [
    {
      id: "ch3_mandir_classic",
      chamberId: "sacred",
      title: "The Traditional Heritage Mandir",
      project: "Amanora Park Town Sanctuary",
      location: "Pune, Maharashtra",
      category: "Spiritual Puja Alcove",
      image: "/assets/exhibition/ch3_mandir_classic.jpg",
      description:
        "A sublime spiritual sanctuary honoring traditional Indian temple architecture with contemporary luxury craftsmanship. Hand-carved Burmese teakwood features intricate floral jali fretwork, solid brass temple bells suspended on links, and recessed warm niches for brass deity idols and traditional oil diyas.",
      materials: ["Burmese Teakwood", "Hand-Carved Floral Jali", "Solid Brass Temple Bells", "Warm Amber Niches"],
      dimensions: "2.8m × 3.8m Altar Flank Frame",
      aspectRatio: "portrait",
    },
    {
      id: "ch3_stone_altar",
      chamberId: "sacred",
      title: "The Stone Altar Sanctuary",
      project: "Amanora Park Town Sanctuary",
      location: "Pune, Maharashtra",
      category: "Textured Stone Mandir",
      image: "/assets/exhibition/ch3_stone_altar.jpg",
      description:
        "A monumental puja altar set against a split-face textured limestone feature wall. A cantilevered pedestal in white Statuario marble cradles hand-cast brass deities, illuminated by a celestial concealed cove light that washes down the natural stone relief.",
      materials: ["Split-Face Limestone", "Statuario Marble Pedestal", "Hand-Cast Brass Idols", "Concealed 2400K Coving"],
      dimensions: "2.8m × 3.8m Altar Flank Frame",
      aspectRatio: "portrait",
    },
    {
      id: "ch3_courtyard",
      chamberId: "sacred",
      title: "The Ceremonial Entry Courtyard",
      project: "Amanora Park Town Sanctuary",
      location: "Pune, Maharashtra",
      category: "Spiritual Foyer & Water Feature",
      image: "/assets/exhibition/ch3_courtyard.jpg",
      description:
        "The sacred threshold to the sanctum featuring a hand-hammered antique brass urli vessel floating with fresh lotus blossoms. Flanking hand-chiseled stone steps and warm perimeter up-lighting welcome residents into a tranquil state of meditation.",
      materials: ["Hand-Hammered Antique Brass", "Chiseled Sandstone", "Lotus Water Feature", "Architectural Step Lights"],
      dimensions: "4.2m × 2.8m Feature Gallery Wall",
      aspectRatio: "landscape",
    },
    {
      id: "ch3_foyer",
      chamberId: "sacred",
      title: "The Sacred Foyer Alcove",
      project: "Amanora Park Town Sanctuary",
      location: "Pune, Maharashtra",
      category: "Backlit Spiritual Niche",
      image: "/assets/exhibition/ch3_foyer.jpg",
      description:
        "A bespoke spiritual entryway with a backlit translucent onyx panel etched with sacred geometric Mandalas, casting a serene golden aura across polished ivory travertine flooring.",
      materials: ["Translucent Gold Onyx", "Laser-Etched Mandalas", "Ivory Travertine", "Champagne Brass Accents"],
      dimensions: "3.6m × 2.6m Wall Frame",
      aspectRatio: "landscape",
    },
    {
      id: "ch3_portal",
      chamberId: "sacred",
      title: "The Divine Light Portal",
      project: "Amanora Park Town Sanctuary",
      location: "Pune, Maharashtra",
      category: "Puja Room Light Portal",
      image: "/assets/exhibition/ch3_portal.jpg",
      description:
        "An architectural archway framing the deity altar, blending traditional Indian temple proportions with minimalist contemporary shadow lines and warm circadian LED halo backlighting.",
      materials: ["Teakwood Archway", "Acoustic Fluting", "Circadian LED Halo", "Handmade Brass Diya Holders"],
      dimensions: "3.6m × 2.6m Wall Frame",
      aspectRatio: "landscape",
    },
  ],

  corporate: [
    {
      id: "ch4_boardroom",
      chamberId: "corporate",
      title: "The Presidential Boardroom",
      project: "BKC Commercial Hub",
      location: "Mumbai, Maharashtra",
      category: "Executive Conference Chamber",
      image: "/assets/exhibition/ch4_boardroom.jpg",
      description:
        "A 20-person executive boardroom centered around a custom 22-foot monolithic American walnut conference table with concealed motorized pop-up AV and microphone connectivity. Overhead, continuous acoustic micro-slat wood baffles integrate flush magnetic track lighting and precision HVAC diffusers.",
      materials: ["American Black Walnut", "Acoustic Slatted Baffles", "PVD Matte Bronze Trims", "Ergonomic Italian Leather"],
      dimensions: "6.5m × 3.6m Hero Executive Display",
      aspectRatio: "panoramic",
    },
    {
      id: "ch4_skylounge",
      chamberId: "corporate",
      title: "The Sky Lounge Executive Suite",
      project: "BKC Commercial Hub",
      location: "Mumbai, Maharashtra",
      category: "Corporate Hospitality Lounge",
      image: "/assets/exhibition/ch4_skylounge.jpg",
      description:
        "A panoramic corner executive lounge overlooking the Mumbai financial district skyline. Features glazed terracotta herringbone flooring, custom bronze cocktail credenzas, and tailored velvet armchairs for high-level client negotiations.",
      materials: ["Hand-Glazed Terracotta Tiles", "Patinated Bronze Cabinetry", "Low-Iron Acoustic Glass", "Cognac Leather Seating"],
      dimensions: "4.0m × 2.6m Wall Frame",
      aspectRatio: "landscape",
    },
    {
      id: "ch4_dining",
      chamberId: "corporate",
      title: "The Private Client Dining Chamber",
      project: "BKC Commercial Hub",
      location: "Mumbai, Maharashtra",
      category: "Executive Private Dining",
      image: "/assets/exhibition/ch4_dining.jpg",
      description:
        "An exclusive private dining suite tailored for hosting dignitaries and C-suite executives. A circular Statuario marble dining table is crowned with a sculptural brushed bronze chandelier and surrounded by sound-dampening acoustic suede wall paneling.",
      materials: ["Statuario Marble Table", "Sculptural Bronze Luminaire", "Acoustic Suede Wall Panels", "Solid Oak Parquetry"],
      dimensions: "3.8m × 2.6m Wall Frame",
      aspectRatio: "landscape",
    },
    {
      id: "ch4_vip",
      chamberId: "corporate",
      title: "The VIP Welcome Parlour",
      project: "BKC Commercial Hub",
      location: "Mumbai, Maharashtra",
      category: "Reception Waiting Salon",
      image: "/assets/exhibition/ch4_vip.jpg",
      description:
        "An inviting pre-meeting reception lounge with sculpted ochre armchairs, smoked tempered glass side tables, and integrated low-glare architectural cove illumination creating a welcoming luxury hospitality ambiance.",
      materials: ["Ochre Wool Upholstery", "Smoked Tempered Glass", "Fluted Terrazzo Accent Wall", "Recessed Warm Linear Wash"],
      dimensions: "3.8m × 2.6m Wall Frame",
      aspectRatio: "landscape",
    },
    {
      id: "ch4_terrace",
      chamberId: "corporate",
      title: "The Executive Rooftop Pavilion",
      project: "BKC Commercial Hub",
      location: "Mumbai, Maharashtra",
      category: "Outdoor Executive Breakout",
      image: "/assets/exhibition/ch4_terrace.jpg",
      description:
        "A seamless indoor-outdoor breakout terrace designed for corporate celebrations and private evening events. Features basalt stone pavers, bespoke teakwood cabana seating, and integrated landscape bollard illumination.",
      materials: ["Honed Basalt Pavers", "Weather-Resistant Teakwood", "Architectural Planter Boxes", "Bronze Landscape Lights"],
      dimensions: "3.8m × 2.6m Wall Frame",
      aspectRatio: "landscape",
    },
  ],
};

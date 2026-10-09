import React, { useState } from 'react';
import {
  BookOpen,
  Recycle,
  Search,
  CheckCircle2,
  AlertTriangle,
  Info,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';

export const RecyclingGuide: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const guides = [
    {
      code: 1,
      name: 'PET',
      fullName: 'Polyethylene Terephthalate',
      color: 'bg-emerald-50 border-emerald-300 text-emerald-900',
      badge: 'High Circularity Potential',
      examples: 'Clear water bottles, soda containers, salad dressing bottles, peanut butter jars, thermoformed clamshells.',
      sorting: 'Rinse liquid remnants. Flatten to save bale density. Keep caps on if compatible, or separate if requested by local reprocessor.',
      route: 'Mechanical hot-wash flake grinding → Decontamination pellets → Food-grade rPET bottles or polyester yarn.',
      limitations: 'Susceptible to thermal distortion above 65°C. Pigmented/opaque PET or barrier layers reduce recycled flake value.',
    },
    {
      code: 2,
      name: 'HDPE',
      fullName: 'High-Density Polyethylene',
      color: 'bg-emerald-50/70 border-emerald-400 text-[#14532D]',
      badge: 'Widely Reprocessed',
      examples: 'Milk jugs, laundry detergent bottles, shampoo containers, chemical drums, bottle caps.',
      sorting: 'Completely drain detergent or dairy residues. Triple-rinse containers used for household cleaners.',
      route: 'Color-sorting → Shredding & float-sink wash → Extrusion into pipes, plastic lumber, or non-food detergent jugs.',
      limitations: 'Cross-contamination with LDPE alters melt flow index. Odor absorption from volatile cleaning liquids requires intensive degassing.',
    },
    {
      code: 3,
      name: 'PVC',
      fullName: 'Polyvinyl Chloride',
      color: 'bg-red-50 border-red-200 text-red-950',
      badge: 'Specialist Only',
      examples: 'Blister packaging, medical tubing, construction conduit, cling wrap, rigid cosmetic bottles.',
      sorting: 'Strictly isolate from PET streams. Even tiny fractions (50 ppm) of PVC will ruin a PET recycling batch.',
      route: 'Industrial mechanical reprocessing or controlled chemical feedstock recycling where available.',
      limitations: 'Chlorine content releases corrosive hydrochloric acid during standard thermal melting. Rarely accepted curbside.',
    },
    {
      code: 4,
      name: 'LDPE',
      fullName: 'Low-Density Polyethylene',
      color: 'bg-teal-50 border-teal-300 text-teal-950',
      badge: 'Drop-off Common',
      examples: 'Squeeze bottles, stretch wrap, bread bags, pallet shrink film, flexible lids.',
      sorting: 'Must be clean and bone-dry. Do not place thin flexible film in standard curbside single-stream bins without verification.',
      route: 'Aggregated film baling → Pelletizing into bin liners, composite decking, and construction vapor barriers.',
      limitations: 'Thin films wrap around optical sorters and rotating trommel screens in MRFs (Materials Recovery Facilities).',
    },
    {
      code: 5,
      name: 'PP',
      fullName: 'Polypropylene',
      color: 'bg-emerald-50 border-[#10B981]/50 text-emerald-950',
      badge: 'Expanding Infrastructure',
      examples: 'Yogurt cups, reusable food prep containers, bottle caps, medicine bottles, ketchup bottles.',
      sorting: 'Remove food solids. Check container integrity before discarding, as PP boasts high fatigue strength for reuse.',
      route: 'Near-Infrared optical sort → Solvent or mechanical wash → Injection molded battery cases, pails, automotive trays.',
      limitations: 'Acceptance varies greatly across municipalities. Food-grade decontamination approval is more stringent.',
    },
    {
      code: 6,
      name: 'PS',
      fullName: 'Polystyrene',
      color: 'bg-amber-50 border-amber-200 text-amber-950',
      badge: 'Limited Facility Acceptance',
      examples: 'Rigid disposable cutlery, yogurt multi-packs, expanded foam coffee cups, protective packaging foam.',
      sorting: 'Keep separate from rigid polyolefins. Do not crush expanded foam into mixed recyclables.',
      route: 'Compaction / densification → Extrusion into insulation boards or picture frames.',
      limitations: 'Extremely brittle and lightweight, leading to low economic collection viability. Banned in many municipal jurisdictions.',
    },
    {
      code: 7,
      name: 'Other',
      fullName: 'Multi-layer, Polycarbonate, Bioplastics, Unclassified',
      color: 'bg-slate-50 border-slate-300 text-slate-800',
      badge: 'Complex / Specialized',
      examples: 'Multi-layer barrier pouches (metallized film), acrylic containers, PLA bioplastics, polycarbonate jugs.',
      sorting: 'Do not mix bio-plastics (like PLA) into PET/HDPE recycling streams; PLA ruins standard petroleum polymer melts.',
      route: 'Specialized industrial pyrolysis, chemical recycling, or controlled industrial composting (for certified compostables).',
      limitations: 'Virtually never collected in municipal curbside sorting. Requires direct manufacturer take-back.',
    },
  ];

  const filtered = guides.filter(
    (g) =>
      g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.examples.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(g.code).includes(searchTerm)
  );

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn text-left">
      {/* Title & Introduction */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#17251D]">
          Polymer Recycling Guide
        </h2>
        <p className="text-xs sm:text-sm text-[#64748B] mt-1 max-w-3xl">
          Educational reference for standard Resin Identification Codes (SPI 1-7). Proper resin sorting prevents stream cross-contamination and preserves secondary polymer utility.
        </p>
      </div>

      {/* Mandatory Facility Reminder Banner */}
      <div className="bg-emerald-50 border-2 border-emerald-300 rounded-[16px] p-4 flex items-start gap-3 shadow-subtle text-xs text-emerald-950">
        <Info className="w-5 h-5 text-[#14532D] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-sm text-[#14532D]">
            Important Facility Verification Notice:
          </p>
          <p className="leading-relaxed text-emerald-900">
            A resin triangle indicates the polymer chemical family, not universal facility acceptance. Do not assume every item bearing a recycling code is collected curbside.
          </p>
          <div className="pt-1 font-semibold text-[#166534]">
            "Check with your local municipal waste-management service or authorized recycler."
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Filter by resin code, polymer name, or packaging item..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-white border border-[#E2E8F0] rounded-xl text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500 shadow-2xs"
        />
      </div>

      {/* Material Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((item) => (
          <div
            key={item.code}
            className={`rounded-[18px] border p-5 shadow-subtle flex flex-col justify-between space-y-4 ${item.color} bg-white`}
          >
            <div>
              {/* Card Header with Triangle Code */}
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#14532D] text-white flex flex-col items-center justify-center shrink-0 shadow-xs">
                    <Recycle className="w-5 h-5 text-emerald-300" />
                    <span className="text-[11px] font-black -mt-1">{item.code}</span>
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-slate-900 tracking-tight leading-tight">
                      {item.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium leading-tight">
                      {item.fullName}
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 shrink-0">
                  {item.badge}
                </span>
              </div>

              {/* Card Content Sections */}
              <div className="space-y-3 text-xs">
                <div>
                  <span className="font-bold text-slate-800 block mb-0.5">Common Examples:</span>
                  <p className="text-slate-600 leading-relaxed">{item.examples}</p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="font-bold text-[#14532D] block mb-0.5">Sorting & Preparation:</span>
                  <p className="text-slate-700 leading-relaxed">{item.sorting}</p>
                </div>

                <div>
                  <span className="font-bold text-slate-800 block mb-0.5">Reprocessing Pathway:</span>
                  <p className="text-slate-600 leading-relaxed">{item.route}</p>
                </div>

                <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/80">
                  <span className="font-bold text-amber-900 block mb-0.5 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Important Limitations:</span>
                  </span>
                  <p className="text-amber-800 leading-relaxed">{item.limitations}</p>
                </div>
              </div>
            </div>

            {/* Card Footer Reminder */}
            <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 italic">
              Verify local acceptance prior to curbside disposal.
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

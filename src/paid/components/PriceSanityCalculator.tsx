import { Calculator } from 'lucide-react';
import { useState } from 'react';

export function PriceSanityCalculator() {
  const [priceTsh, setPriceTsh] = useState(15000);
  const [priceUsd, setPriceUsd] = useState(7);
  const [buildHours, setBuildHours] = useState(8);

  const safeHours = Math.max(1, buildHours);
  const scenarios = [
    { label: 'Early Validation (5 buyers)', count: 5 },
    { label: 'First Launch Month (15 buyers)', count: 15 },
    { label: 'Steady Quarter (30 buyers)', count: 30 },
  ];

  const getPriceNote = () => {
    if (priceTsh < 8000) {
      return 'Below TSh 8,000 requires larger volume to reward your time. Consider adding 1–2 practical checklists or templates to sit in the TSh 12,000–20,000 range.';
    }
    if (priceTsh <= 25000) {
      return 'Sweet spot for first-time mobile-money buyers in Tanzania (TSh 10,000–25,000). Low hesitation for a focused weekend guide or spreadsheet.';
    }
    return 'Higher starter price (TSh 25,000+). Make sure Step 4 conversations confirm a high-cost mistake your kit prevents or includes worked templates.';
  };

  return (
    <div className="bg-[#F7F3E9] border border-[#183926]/20 p-5 space-y-4">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 shrink-0 bg-[#183926] text-[#C29B48] flex items-center justify-center">
          <Calculator className="w-4 h-4" />
        </div>
        <div>
          <h3 className="font-display text-lg font-bold text-[#183926]">
            Price &amp; Weekend Effort Sanity Check
          </h3>
          <p className="text-xs text-[#526056] mt-0.5">
            Check whether your planned price makes sense for the hours needed to build Version 1.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-semibold text-[#183926] mb-1">
            Planned Local Price (TSh)
          </label>
          <input
            type="number"
            min={1000}
            step={1000}
            value={priceTsh}
            onChange={(e) => setPriceTsh(Math.max(0, Number(e.target.value)))}
            className="w-full px-3 py-2 text-sm font-mono-tabular bg-white border border-[#183926]/20 rounded focus:outline-none focus:border-[#183926]"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#183926] mb-1">
            International Price ($ USD)
          </label>
          <input
            type="number"
            min={1}
            step={1}
            value={priceUsd}
            onChange={(e) => setPriceUsd(Math.max(0, Number(e.target.value)))}
            className="w-full px-3 py-2 text-sm font-mono-tabular bg-white border border-[#183926]/20 rounded focus:outline-none focus:border-[#183926]"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#183926] mb-1">
            Est. Build Time (Hours)
          </label>
          <input
            type="number"
            min={1}
            max={100}
            value={buildHours}
            onChange={(e) => setBuildHours(Math.max(1, Number(e.target.value)))}
            className="w-full px-3 py-2 text-sm font-mono-tabular bg-white border border-[#183926]/20 rounded focus:outline-none focus:border-[#183926]"
          />
        </div>
      </div>

      <div className="border border-[#183926]/20 bg-white overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#183926] text-[#F7F3E9]">
              <th className="py-2 px-3 font-semibold">Scenario (Not a Guarantee)</th>
              <th className="py-2 px-3 text-right font-semibold">Local Total (TSh)</th>
              <th className="py-2 px-3 text-right font-semibold">Intl. Total (USD)</th>
              <th className="py-2 px-3 text-right font-semibold">TSh / Build Hour</th>
            </tr>
          </thead>
          <tbody>
            {scenarios.map((sc, idx) => {
              const totalTsh = sc.count * priceTsh;
              const totalUsd = sc.count * priceUsd;
              const perHour = Math.round(totalTsh / safeHours);
              return (
                <tr key={sc.label} className={idx % 2 === 1 ? 'bg-[#EDE7D6]/55' : 'bg-white'}>
                  <td className="py-2.5 px-3 font-medium text-[#18291F]">{sc.label}</td>
                  <td className="py-2.5 px-3 text-right font-mono-tabular font-bold text-[#183926]">
                    TSh {totalTsh.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono-tabular text-[#526056]">
                    ${totalUsd.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono-tabular text-[#183926]">
                    TSh {perHour.toLocaleString()}/hr
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-[#526056] leading-relaxed">
        <strong>Pricing check:</strong> {getPriceNote()} These numbers only illustrate simple multiplication to help you avoid spending 40 hours on a low-value product; real sales depend on Step 4 &amp; Step 5 evidence.
      </p>
    </div>
  );
}

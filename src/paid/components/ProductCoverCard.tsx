import { Download, Maximize2, X } from 'lucide-react';
import { useState } from 'react';

interface ProductCoverCardProps {
  showControls?: boolean;
  compact?: boolean;
}

type CoverSubtitleLang = 'en' | 'sw';
type CoverEditionLabel = 'blueprint' | 'kit';

export function ProductCoverCard({
  showControls = true,
  compact = false,
}: ProductCoverCardProps) {
  const [lang, setLang] = useState<CoverSubtitleLang>('en');
  const [edition, setEdition] = useState<CoverEditionLabel>('blueprint');
  const [zoomOpen, setZoomOpen] = useState(false);

  const subtitle =
    lang === 'en'
      ? 'Know if your idea will sell before you spend a single week building it.'
      : 'Jua kama wazo lako litauzika kabla hujapoteza wiki nzima kulijenga.';

  const editionText =
    edition === 'blueprint'
      ? 'PRODUCT BLUEPRINT + SALES PAGE COPY'
      : '6-STEP DIGITAL KIT · SWAHILI & ENGLISH';

  const downloadCoverPng = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 1697;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#183926';
    ctx.fillRect(0, 0, 1200, 1697);

    ctx.fillStyle = 'rgba(46, 91, 65, 0.72)';
    ctx.beginPath();
    ctx.arc(1030, 195, 395, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(15, 38, 25, 0.78)';
    ctx.beginPath();
    ctx.arc(165, 1465, 345, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#C29B48';
    ctx.lineWidth = 3;
    ctx.strokeRect(78, 78, 1044, 1541);

    ctx.fillStyle = '#C29B48';
    ctx.font = '700 22px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('B I A S H A R A   B A S E', 124, 194);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '700 84px "Playfair Display", Georgia, serif';
    ctx.fillText('Product Idea', 124, 525);
    ctx.fillText('Validator Kit', 124, 625);

    ctx.fillStyle = '#C29B48';
    ctx.fillRect(124, 675, 224, 7);

    ctx.fillStyle = '#EDE7D6';
    ctx.font = 'italic 36px "Playfair Display", Georgia, serif';
    const words = subtitle.split(' ');
    let line = '';
    let y = 768;
    const maxWidth = 720;
    for (let i = 0; i < words.length; i++) {
      const test = line + words[i] + ' ';
      if (ctx.measureText(test).width > maxWidth && i > 0) {
        ctx.fillText(line.trim(), 124, y);
        line = words[i] + ' ';
        y += 52;
      } else {
        line = test;
      }
    }
    if (line.trim()) {
      ctx.fillText(line.trim(), 124, y);
    }

    ctx.fillStyle = '#C29B48';
    ctx.font = '700 20px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(editionText, 124, 1495);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '500 24px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('biasharabase.com', 124, 1540);

    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `Biashara-Base-Product-Cover-${lang.toUpperCase()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const renderCoverCanvas = (large = false) => (
    <div
      className={`relative w-full aspect-[1/1.414] bg-[#183926] overflow-hidden select-none shadow-[0_18px_42px_rgba(24,57,38,0.28)] ${
        large ? 'max-w-[460px]' : compact ? 'max-w-[300px]' : 'max-w-[360px]'
      }`}
    >
      <div
        aria-hidden="true"
        className="absolute -top-[12%] -right-[18%] w-[68%] aspect-square rounded-full bg-[#2E5B41]/70 pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-[10%] -left-[18%] w-[58%] aspect-square rounded-full bg-[#0F2619]/75 pointer-events-none"
      />

      <div className="relative z-10 h-full w-full p-[6.5%]">
        <div className="h-full w-full border border-[#C29B48]/90 px-[8%] py-[10%] flex flex-col justify-between">
          <div className="text-[10px] sm:text-[11px] font-bold tracking-[0.22em] text-[#C29B48] uppercase">
            BIASHARA BASE
          </div>

          <div className="my-auto py-4">
            <h3
              className={`font-display font-bold text-white leading-[1.06] tracking-tight ${
                large
                  ? 'text-4xl sm:text-[46px]'
                  : compact
                  ? 'text-2xl sm:text-[28px]'
                  : 'text-3xl sm:text-[36px]'
              }`}
            >
              Product Idea
              <br />
              Validator Kit
            </h3>

            <div className="w-16 sm:w-20 h-[3px] bg-[#C29B48] my-4 sm:my-5" />

            <p
              className={`font-display italic text-[#EDE7D6] leading-relaxed max-w-[260px] ${
                large ? 'text-lg' : compact ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'
              }`}
            >
              {subtitle}
            </p>
          </div>

          <div className="space-y-1">
            <div className="text-[9px] sm:text-[10px] font-bold tracking-[0.08em] text-[#C29B48] uppercase">
              {editionText}
            </div>
            <div className="text-[11px] sm:text-xs font-medium text-white/90">
              biasharabase.com
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-4">
      {renderCoverCanvas(false)}

      {showControls && (
        <div className="w-full max-w-[360px] space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="inline-flex bg-[#EDE7D6] border border-[#C29B48]/45 p-0.5 rounded">
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`px-2.5 py-1 font-semibold rounded cursor-pointer ${
                  lang === 'en' ? 'bg-[#183926] text-[#C29B48]' : 'text-[#526056]'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLang('sw')}
                className={`px-2.5 py-1 font-semibold rounded cursor-pointer ${
                  lang === 'sw' ? 'bg-[#183926] text-[#C29B48]' : 'text-[#526056]'
                }`}
              >
                Kiswahili
              </button>
            </div>

            <div className="inline-flex bg-[#EDE7D6] border border-[#C29B48]/45 p-0.5 rounded">
              <button
                type="button"
                onClick={() => setEdition('blueprint')}
                className={`px-2.5 py-1 font-semibold rounded cursor-pointer ${
                  edition === 'blueprint' ? 'bg-[#183926] text-[#C29B48]' : 'text-[#526056]'
                }`}
              >
                Blueprint
              </button>
              <button
                type="button"
                onClick={() => setEdition('kit')}
                className={`px-2.5 py-1 font-semibold rounded cursor-pointer ${
                  edition === 'kit' ? 'bg-[#183926] text-[#C29B48]' : 'text-[#526056]'
                }`}
              >
                Kit Edition
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={downloadCoverPng}
              className="flex-1 inline-flex items-center justify-center gap-2 px-3.5 py-2.5 text-xs font-bold uppercase tracking-wide text-[#183926] bg-[#C29B48] rounded hover:bg-[#AE8838] transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download Cover PNG
            </button>
            <button
              type="button"
              onClick={() => setZoomOpen(true)}
              aria-label="Inspect full-size product cover"
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold text-[#183926] bg-white border border-[#183926]/20 rounded hover:bg-[#EDE7D6] transition-colors cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              Zoom
            </button>
          </div>
        </div>
      )}

      {zoomOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Full-size Biashara Base Product Cover"
          className="fixed inset-0 z-50 bg-[#0F2417]/85 p-4 flex items-center justify-center overflow-y-auto"
          onClick={() => setZoomOpen(false)}
        >
          <div
            className="relative w-full max-w-[460px] flex flex-col items-center gap-4 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setZoomOpen(false)}
              aria-label="Close cover preview"
              className="self-end inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#F7F3E9] bg-[#183926] border border-[#C29B48]/70 rounded hover:bg-[#224B33] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              Close
            </button>
            {renderCoverCanvas(true)}
            <button
              type="button"
              onClick={downloadCoverPng}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wide text-[#183926] bg-[#C29B48] rounded hover:bg-[#AE8838] cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Download High-Res Cover PNG (1200×1697)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

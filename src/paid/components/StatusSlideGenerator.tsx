import { Download } from 'lucide-react';
import { useState } from 'react';

interface StatusSlideGeneratorProps {
  topic: string;
  audience: string;
  priceTsh: string;
  priceUsd: string;
  productTitle: string;
}

type SlideTheme = 'forest' | 'parchment';
type SlideLang = 'en' | 'sw';

function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number {
  const paragraphs = text.split('\n');
  let cursorY = y;

  for (const para of paragraphs) {
    const words = para.split(' ');
    let line = '';

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(line.trim(), x, cursorY);
        line = words[n] + ' ';
        cursorY += lineHeight;
      } else {
        line = testLine;
      }
    }
    if (line.trim()) {
      ctx.fillText(line.trim(), x, cursorY);
    }
    cursorY += lineHeight * 1.15;
  }

  return cursorY;
}

export function StatusSlideGenerator({
  topic,
  audience,
  priceTsh,
  priceUsd,
  productTitle,
}: StatusSlideGeneratorProps) {
  const [lang, setLang] = useState<SlideLang>('sw');
  const [theme, setTheme] = useState<SlideTheme>('forest');
  const [slideNumber, setSlideNumber] = useState<1 | 2 | 3>(1);

  const safeTopic = topic.trim() || 'solving this weekly headache';
  const safeAudience = audience.trim() || 'beginners & practitioners';
  const safeTitle = productTitle.trim() || 'Starter Practical Kit';
  const safeTsh = priceTsh.trim() || 'TSh 15,000';
  const safeUsd = priceUsd.trim() || '$7';

  const slides: Record<
    1 | 2 | 3,
    { kicker: string; headline: string; body: string; cta: string }
  > =
    lang === 'sw'
      ? {
          1: {
            kicker: 'SWALI FUPI',
            headline: `Kwa ${safeAudience}:`,
            body: `Nimeona watu wengi wakipoteza muda na pesa kwenye ${safeTopic}.\n\nNi sehemu gani inayokusumbua zaidi kila wiki?`,
            cta: 'Nijibu hapa chini (sijauza kitu bado).',
          },
          2: {
            kicker: 'WAZO LA MWONGOZO',
            headline: safeTitle,
            body: `Nafikiria kuweka checklist, mifano halisi, na hatua rahisi kwenye mwongozo mmoja unaotumika moja kwa moja kwenye simu.\n\nLengo: uache kubahatisha na uokoe muda.`,
            cta: 'Je, kitu kama hiki kingekusaidia?',
          },
          3: {
            kicker: 'MAJARIBIO YA MAPEMA',
            headline: `Bei ya mapema: ${safeTsh}`,
            body: `(${safeUsd} kimataifa)\n\nKabla sijaandika yote, natafuta watu 5 wa mwanzo wanaohitaji kweli ili niuandae wiki hii.`,
            cta: 'Jibu "TAYARI" kupata maelezo ya mapema.',
          },
        }
      : {
          1: {
            kicker: 'QUICK QUESTION',
            headline: `For ${safeAudience}:`,
            body: `I keep seeing people lose hours and money on ${safeTopic}.\n\nWhat is the single most frustrating part of it for you right now?`,
            cta: 'Reply below (not selling anything yet).',
          },
          2: {
            kicker: 'WEEKEND TOOLKIT IDEA',
            headline: safeTitle,
            body: `I am considering turning my exact checklists, templates, and step-by-step fix into a phone-friendly starter guide.\n\nNo fluff—just what works.`,
            cta: 'Would something like this save you time?',
          },
          3: {
            kicker: 'EARLY PRE-SELL TEST',
            headline: `Early test price: ${safeTsh}`,
            body: `(${safeUsd} international)\n\nBefore I build the whole thing, I want to see if at least 5 people genuinely want it this week.`,
            cta: 'Reply "READY" if you would pay for this.',
          },
        };

  const currentSlide = slides[slideNumber];

  const downloadSlidePng = (num: 1 | 2 | 3) => {
    const s = slides[num];
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isForest = theme === 'forest';
    const bg = isForest ? '#183926' : '#F7F3E9';
    const fg = isForest ? '#FFFFFF' : '#183926';
    const bodyFg = isForest ? '#EDE7D6' : '#18291F';
    const accent = '#C29B48';

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 1080, 1920);

    ctx.fillStyle = isForest ? 'rgba(38, 78, 54, 0.55)' : 'rgba(237, 231, 214, 0.9)';
    ctx.beginPath();
    ctx.arc(920, 220, 320, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = accent;
    ctx.lineWidth = 3;
    ctx.strokeRect(72, 72, 936, 1776);

    ctx.fillStyle = accent;
    ctx.font = 'bold 34px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`0${num} · ${s.kicker}`, 136, 230);

    ctx.fillStyle = fg;
    ctx.font = 'bold 74px Georgia, serif';
    const afterHeadlineY = wrapCanvasText(ctx, s.headline, 136, 420, 808, 92);

    ctx.fillStyle = accent;
    ctx.fillRect(136, afterHeadlineY + 12, 160, 6);

    ctx.fillStyle = bodyFg;
    ctx.font = '46px "Plus Jakarta Sans", sans-serif';
    wrapCanvasText(ctx, s.body, 136, afterHeadlineY + 130, 808, 68);

    ctx.fillStyle = isForest ? '#C29B48' : '#183926';
    ctx.fillRect(136, 1520, 808, 150);
    ctx.fillStyle = isForest ? '#183926' : '#F7F3E9';
    ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
    wrapCanvasText(ctx, s.cta, 176, 1586, 728, 50);

    ctx.fillStyle = accent;
    ctx.font = 'bold 26px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('BIASHARA BASE · VALIDATOR KIT', 136, 1775);

    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = `status-slide-${num}-${lang}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-[#EDE7D6]/60 border border-[#C29B48]/50 p-5 sm:p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#C29B48]/35 pb-4">
        <div>
          <div className="text-xs font-semibold tracking-wider uppercase text-[#9A772F]">
            Ready-to-Post Visuals · 1080×1920 PNG
          </div>
          <h3 className="font-display text-xl font-bold text-[#183926] mt-0.5">
            WhatsApp Status &amp; IG Story Slide Builder
          </h3>
          <p className="text-xs text-[#526056] mt-1">
            Generate clean 3-slide pre-sell images directly on your phone using your own topic and price.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex p-1 bg-white border border-[#183926]/20 rounded">
            {(['sw', 'en'] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                className={`px-2.5 py-1 text-xs font-semibold rounded cursor-pointer ${
                  lang === l ? 'bg-[#183926] text-[#C29B48]' : 'text-[#526056]'
                }`}
              >
                {l === 'sw' ? 'Kiswahili' : 'English'}
              </button>
            ))}
          </div>
          <div className="flex p-1 bg-white border border-[#183926]/20 rounded">
            {(['forest', 'parchment'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTheme(t)}
                className={`px-2.5 py-1 text-xs font-semibold rounded cursor-pointer capitalize ${
                  theme === t ? 'bg-[#183926] text-[#C29B48]' : 'text-[#526056]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div className="lg:col-span-7 space-y-3">
          {([1, 2, 3] as const).map((num) => {
            const active = slideNumber === num;
            return (
              <div
                key={num}
                className={`p-4 border transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  active
                    ? 'bg-white border-[#183926]'
                    : 'bg-[#F7F3E9] border-[#183926]/15 hover:bg-white'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setSlideNumber(num)}
                  className="text-left flex-1 cursor-pointer"
                >
                  <div className="text-[11px] font-semibold text-[#9A772F]">
                    Slide 0{num} · {slides[num].kicker}
                  </div>
                  <div className="text-sm font-bold text-[#183926] mt-0.5">
                    {slides[num].headline}
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => downloadSlidePng(num)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#183926] bg-[#C29B48] rounded hover:bg-[#AE8838] transition-colors cursor-pointer shrink-0 self-start sm:self-center"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Slide {num} PNG
                </button>
              </div>
            );
          })}
        </div>

        <div className="lg:col-span-5 flex justify-center">
          <div
            className={`w-full max-w-[270px] aspect-[9/16] p-5 border flex flex-col justify-between relative overflow-hidden ${
              theme === 'forest'
                ? 'bg-[#183926] text-[#F7F3E9] border-[#C29B48]'
                : 'bg-[#F7F3E9] text-[#18291F] border-[#183926]'
            }`}
          >
            <div className="border border-[#C29B48]/70 h-full p-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="text-[10px] font-bold tracking-[0.14em] text-[#C29B48]">
                  0{slideNumber} · {currentSlide.kicker}
                </div>
                <h4
                  className={`font-display text-lg font-bold leading-snug ${
                    theme === 'forest' ? 'text-white' : 'text-[#183926]'
                  }`}
                >
                  {currentSlide.headline}
                </h4>
                <div className="w-10 h-0.5 bg-[#C29B48]" />
                <p className="text-xs leading-relaxed whitespace-pre-line opacity-90">
                  {currentSlide.body}
                </p>
              </div>

              <div className="space-y-2">
                <div
                  className={`p-2.5 text-[11px] font-bold leading-snug ${
                    theme === 'forest'
                      ? 'bg-[#C29B48] text-[#183926]'
                      : 'bg-[#183926] text-[#F7F3E9]'
                  }`}
                >
                  {currentSlide.cta}
                </div>
                <div className="text-[9px] font-bold tracking-[0.14em] text-[#C29B48]">
                  BIASHARA BASE
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

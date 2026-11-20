export function PublicCoverPreview() {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-full max-w-[340px] aspect-[1/1.414] bg-[#183926] overflow-hidden select-none shadow-[0_18px_42px_rgba(24,57,38,0.28)]">
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
              <h3 className="font-display font-bold text-white leading-[1.06] tracking-tight text-3xl sm:text-[36px]">
                Product Idea
                <br />
                Validator Kit
              </h3>

              <div className="w-16 sm:w-20 h-[3px] bg-[#C29B48] my-4 sm:my-5" />

              <p className="font-display italic text-[#EDE7D6] leading-relaxed max-w-[260px] text-sm sm:text-base">
                Know if your idea will sell before you spend a single week building it.
              </p>
            </div>

            <div className="space-y-1">
              <div className="text-[9px] sm:text-[10px] font-bold tracking-[0.08em] text-[#C29B48] uppercase">
                6-STEP DIGITAL KIT · SWAHILI &amp; ENGLISH
              </div>
              <div className="text-[11px] sm:text-xs font-medium text-white/90">
                biasharabase.com
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-[#526056] text-center max-w-[320px]">
        Included inside your Paid Member Kit (full printable guide + 1200×1697 cover export).
      </p>
    </div>
  );
}

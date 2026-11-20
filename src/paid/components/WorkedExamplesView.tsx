import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import type { WorkedExample } from '../types';

interface WorkedExamplesViewProps {
  examples: WorkedExample[];
  standalone?: boolean;
  onOpenKit?: () => void;
  onDownloadZip?: () => void;
}

export function WorkedExamplesView({
  examples,
  standalone = false,
  onOpenKit,
  onDownloadZip,
}: WorkedExamplesViewProps) {
  const [selectedId, setSelectedId] = useState(examples[0]?.id ?? '');
  const active = examples.find((ex) => ex.id === selectedId) ?? examples[0];

  if (!active) return null;

  return (
    <div className={standalone ? 'max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-8' : 'space-y-6'}>
      {standalone && (
        <div className="space-y-3 max-w-2xl">
          <p className="text-xs font-semibold tracking-[0.14em] text-[#9A772F]">
            PAID MEMBER EXTRAS · 3 WORKED EXAMPLES START TO FINISH
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#183926] text-balance">
            See how beginners tested real ideas before building.
          </h1>
          <p className="text-base text-[#526056] leading-relaxed">
            Follow how three digital creators—a Dar es Salaam Reels creator, a Canva media-kit creator, and a part-time faceless creator who had to fix a broad course idea—tested demand before building.
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 p-1 bg-[#EDE7D6] border border-[#C29B48]/45 rounded w-fit">
        {examples.map((ex, idx) => {
          const isSelected = ex.id === active.id;
          return (
            <button
              key={ex.id}
              type="button"
              onClick={() => setSelectedId(ex.id)}
              className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded transition-colors cursor-pointer whitespace-nowrap ${
                isSelected
                  ? 'bg-[#183926] text-[#C29B48] font-semibold'
                  : 'text-[#18291F] hover:bg-white/60'
              }`}
            >
              0{idx + 1}. {ex.creatorRole.split('(')[0].trim()}
            </button>
          );
        })}
      </div>

      <article className="bg-white border border-[#183926]/20 overflow-hidden">
        <div className="p-6 sm:p-8 bg-[#183926] text-[#F7F3E9] border-b-2 border-[#C29B48] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="text-xs font-medium text-[#C29B48]">
              {active.regionTag} · {active.format}
            </div>
            <h2 className="font-display text-2xl font-bold text-white">
              {active.productTitle}
            </h2>
            <p className="text-sm text-[#EDE7D6]/85">
              Creator: <span className="font-semibold text-white">{active.creatorRole}</span> · Test Price:{' '}
              <span className="font-mono-tabular font-semibold text-[#C29B48]">{active.targetPrice}</span>
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-4">
            <div className="text-left lg:text-right">
              <div className="text-xs text-[#EDE7D6]/75">Scoring Sheet Result</div>
              <div className="font-mono-tabular text-2xl font-bold text-white">
                {active.step3Scores.total}{' '}
                <span className="text-sm font-normal text-[#EDE7D6]/60">/ 25</span>
              </div>
            </div>
            <div className="px-3 py-1.5 text-xs font-bold rounded bg-[#C29B48] text-[#183926] whitespace-nowrap">
              Verdict: {active.step6Decision}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#C29B48]/30">
          <div className="p-6 sm:p-8 space-y-6">
            <div>
              <div className="text-xs font-semibold tracking-wide text-[#9A772F]">
                01. SKILL INVENTORY
              </div>
              <p className="mt-1.5 text-sm text-[#18291F]/85 leading-relaxed">{active.step1Skill}</p>
            </div>

            <div className="pt-5 border-t border-[#C29B48]/25">
              <div className="text-xs font-semibold tracking-wide text-[#9A772F]">
                02. IDEA FORMULA
              </div>
              <p className="mt-1.5 text-sm font-semibold text-[#183926] leading-relaxed">
                “{active.step2Formula}”
              </p>
            </div>

            <div className="pt-5 border-t border-[#C29B48]/25">
              <div className="text-xs font-semibold tracking-wide text-[#9A772F]">
                03. SCORE BREAKDOWN (VS. RUNNER-UP)
              </div>
              <div className="mt-3 grid grid-cols-5 gap-2 text-center">
                {[
                  { label: 'Demand', val: active.step3Scores.demand },
                  { label: 'Help', val: active.step3Scores.helpfulness },
                  { label: 'Ease', val: active.step3Scores.easeToBuild },
                  { label: 'Price', val: active.step3Scores.pricePotential },
                  { label: 'Reach', val: active.step3Scores.reachBuyers },
                ].map((metric) => (
                  <div
                    key={metric.label}
                    className="bg-[#F7F3E9] border border-[#183926]/15 py-2 px-1"
                  >
                    <div className="text-[11px] text-[#526056]">{metric.label}</div>
                    <div className="font-mono-tabular text-base font-bold text-[#183926] mt-0.5">
                      {metric.val}/5
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-2.5 text-xs text-[#526056]">
                Beaten alternative: {active.step3Scores.runnerUpTitle}
              </p>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6 bg-[#EDE7D6]/40">
            <div>
              <div className="text-xs font-semibold tracking-wide text-[#9A772F]">
                04. TALK TO 10 PEOPLE
              </div>
              <p className="mt-1.5 text-sm text-[#18291F]/85 leading-relaxed">
                {active.step4Conversations}
              </p>
            </div>

            <div className="pt-5 border-t border-[#C29B48]/25">
              <div className="text-xs font-semibold tracking-wide text-[#9A772F]">
                05. THE PRE-SELL TEST
              </div>
              <p className="mt-1.5 text-sm text-[#18291F]/85 leading-relaxed">{active.step5PreSell}</p>
            </div>

            <div className="pt-5 border-t border-[#C29B48]/25">
              <div className="text-xs font-semibold tracking-wide text-[#9A772F]">
                06. DECISION &amp; WEEKEND BUILD OUTCOME
              </div>
              <p className="mt-1.5 text-sm font-semibold text-[#183926] leading-relaxed">
                {active.step6Summary}
              </p>
            </div>
          </div>
        </div>
      </article>

      {standalone && (
        <div className="bg-[#EDE7D6] border border-[#C29B48]/50 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-lg font-bold text-[#183926]">
              Ready to run your own idea through all 6 steps?
            </h3>
            <p className="text-sm text-[#526056] mt-1">
              Open your interactive Kit Workspace or download your complete 6-file digital kit bundle.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {onDownloadZip && (
              <button
                type="button"
                onClick={onDownloadZip}
                className="px-4 py-2.5 text-sm font-semibold text-[#183926] bg-white border border-[#183926]/20 rounded hover:bg-[#F7F3E9] transition-colors cursor-pointer whitespace-nowrap"
              >
                Download Kit (.zip)
              </button>
            )}
            {onOpenKit && (
              <button
                type="button"
                onClick={onOpenKit}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-[#183926] bg-[#C29B48] rounded hover:bg-[#AE8838] transition-colors cursor-pointer whitespace-nowrap"
              >
                Open Kit Workspace
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

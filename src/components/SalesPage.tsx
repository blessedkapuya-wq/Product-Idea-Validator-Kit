import { ArrowRight, Check, ChevronDown, Lock, Plus, X } from 'lucide-react';
import { useState } from 'react';
import { PUBLIC_STEP_OVERVIEW, SALES_FAQ } from '../data/publicContent';
import type { AppRoute, PublicConfig, SessionState } from '../types/public';
import { FreeChecklistView } from './FreeChecklistView';
import { InlineOfferCard } from './InlineOfferCard';
import { PublicCoverPreview } from './PublicCoverPreview';

interface SalesPageProps {
  publicConfig: PublicConfig;
  session: SessionState;
  onOpenCheckout: () => void;
  onNavigate: (route: AppRoute) => void;
  onUnlockSuccess: () => Promise<void> | void;
}

const WHATS_INSIDE_ROWS = [
  {
    item: '6-Step Validator Guide',
    detail: '25–35 page plain-language walkthrough designed to finish in one weekend on your phone',
  },
  {
    item: 'Auto-Ranking Scoring Sheet',
    detail: 'Interactive web sheet + Excel/Google Sheets CSV with live SUM & RANK formulas',
  },
  {
    item: 'Swahili & English Script Pack',
    detail: '5 copy-paste WhatsApp & DM templates so you never sound awkward or salesy',
  },
  {
    item: 'Pre-Sell Templates + PNG Slide Maker',
    detail: 'Ready-to-post copy & 1080×1920 image generator for WhatsApp Status, Instagram & Threads',
  },
  {
    item: 'TSh & USD Price Sanity Calculator',
    detail: 'Verify your launch price covers your build hours before writing a single page',
  },
  {
    item: '3 Worked Examples Start to Finish',
    detail: 'Digital creator cases: a Dar Reels template pack, a Canva rate card kit, and a faceless creator pivot',
  },
  {
    item: '10 Red Flags Audit Checklist',
    detail: 'Spot weak, "polite-compliment-only" ideas before you lose weeks building them',
  },
  {
    item: '7-Day Build Plan & Offer Draft',
    detail: 'Auto-assembles your buyer quotes into launch copy + points to the Biashara Base Blueprint',
  },
];

const EXTRA_FAQ = [
  ...SALES_FAQ,
  {
    q: 'What happens if my idea fails Step 4 or Step 5?',
    a: 'That is a win—the kit just saved you weeks of building to silence. You keep your #2 and #3 ranked ideas from Step 3 and test the next strongest one immediately.',
  },
  {
    q: 'What do I actually receive as a paid member?',
    a: 'Your Paid Member Access Key unlocks the interactive phone-ready workspace, full worked examples, Swahili & English scripts, printable guide, and the exact customer .zip bundle.',
  },
];

export function SalesPage({
  publicConfig,
  session,
  onOpenCheckout,
  onNavigate,
  onUnlockSuccess,
}: SalesPageProps) {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const scrollToOffer = () => {
    const el = document.getElementById('get-kit-card');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      onOpenCheckout();
    }
  };

  return (
    <main className="bg-[#F7F3E9]">
      {/* 1. HERO SPLIT */}
      <section className="bg-[#183926] text-[#F7F3E9] border-b-2 border-[#C29B48]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
            {/* Left Column: Core Copy & Weekend Promise */}
            <div className="lg:col-span-6 flex flex-col justify-between space-y-6 py-2">
              <div className="space-y-5">
                <p className="text-xs font-semibold tracking-[0.16em] text-[#C29B48]">
                  BIASHARA BASE · PRODUCT IDEA VALIDATOR KIT
                </p>

                <h1 className="font-display text-[clamp(2.25rem,4vw,3.4rem)] font-bold tracking-tight text-white leading-[1.08] text-balance">
                  Stop guessing what to sell. Test your idea first.
                </h1>

                <div className="w-20 h-0.5 bg-[#C29B48]" />

                <p className="font-display italic text-lg sm:text-xl text-[#EDE7D6] leading-relaxed">
                  Know if your idea will sell before you spend a single week building it.
                </p>

                <p className="text-sm sm:text-base text-[#EDE7D6]/85 leading-relaxed">
                  The Product Idea Validator Kit helps you check whether people actually want your digital product before you spend weeks building it—in one weekend, straight from your phone, using Swahili and English scripts.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <a
                    href="#free-checklist"
                    className="inline-flex items-center justify-center px-5 py-3 text-sm font-semibold text-[#F7F3E9] border border-[#C29B48]/70 rounded hover:bg-[#264E36]/60 transition-colors whitespace-nowrap"
                  >
                    Try free 3-min check first
                  </a>
                  <button
                    type="button"
                    onClick={() => onNavigate(session.authenticated ? 'kit' : 'access')}
                    className="inline-flex items-center gap-1.5 px-4 py-3 text-sm font-semibold text-[#C29B48] hover:underline underline-offset-4 cursor-pointer whitespace-nowrap"
                  >
                    {!session.authenticated && <Lock className="w-3.5 h-3.5" />}
                    <span>{session.authenticated ? 'Open Kit Workspace' : 'Member Key Sign-In'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <a
                    href="#product-cover"
                    className="inline-flex items-center px-2 py-3 text-sm font-medium text-[#EDE7D6]/85 hover:text-[#C29B48] underline underline-offset-4 whitespace-nowrap"
                  >
                    View product cover
                  </a>
                </div>
              </div>

              {/* Compact 3-Day Weekend Rhythm */}
              <div className="pt-5 border-t border-[#C29B48]/35 grid grid-cols-3 gap-4 text-xs">
                <div>
                  <div className="font-bold text-[#C29B48]">FRIDAY</div>
                  <div className="text-white font-semibold mt-0.5">Score 10 Ideas</div>
                  <div className="text-[#EDE7D6]/70 mt-0.5">Steps 1–3 · 45 mins</div>
                </div>
                <div>
                  <div className="font-bold text-[#C29B48]">SATURDAY</div>
                  <div className="text-white font-semibold mt-0.5">Ask 10 People</div>
                  <div className="text-[#EDE7D6]/70 mt-0.5">Swahili &amp; EN scripts</div>
                </div>
                <div>
                  <div className="font-bold text-[#C29B48]">SUNDAY</div>
                  <div className="text-white font-semibold mt-0.5">Pre-Sell &amp; Decide</div>
                  <div className="text-[#EDE7D6]/70 mt-0.5">Build / Fix / Drop</div>
                </div>
              </div>
            </div>

            {/* Right Column: Live Inline Offer & Access Card */}
            <div className="lg:col-span-6 flex items-center">
              <InlineOfferCard
                publicConfig={publicConfig}
                session={session}
                onUnlockSuccess={onUnlockSuccess}
                onOpenKit={() => onNavigate('kit')}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. PROOF SPOTLIGHT + GUESSING VS TESTING */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: The Problem & Guessing vs Testing Table */}
          <div className="lg:col-span-7 bg-white border border-[#C29B48] overflow-hidden">
            <div className="px-6 py-4 bg-[#183926] text-[#F7F3E9] border-b-2 border-[#C29B48]">
              <h2 className="font-display text-xl font-bold text-white">
                The problem—and why testing first changes everything
              </h2>
              <p className="text-xs text-[#EDE7D6]/80 mt-0.5">
                You have knowledge worth sharing. Stop guessing in isolation.
              </p>
            </div>

            <div className="p-6 space-y-5 bg-[#F7F3E9]">
              <p className="text-sm sm:text-base text-[#18291F] leading-relaxed">
                You are not sure which idea to turn into a product, and you are afraid of spending weeks on something nobody wants. So you wait. Or you build it anyway and hear silence.
              </p>

              <div className="bg-[#EDE7D6] border border-[#C29B48]/50 p-4 text-sm font-semibold text-[#183926]">
                It is one of the most common reasons beginners give up. The fix is not more motivation. It is testing the idea first.
              </div>

              <div className="border border-[#183926]/20 bg-white overflow-hidden">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-[#183926] text-[#F7F3E9] text-xs">
                      <th className="py-2.5 px-3.5 font-semibold">Stage</th>
                      <th className="py-2.5 px-3.5 font-semibold">Guessing First</th>
                      <th className="py-2.5 px-3.5 font-semibold text-[#C29B48]">
                        Testing First (Kit)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-white border-b border-[#C29B48]/25">
                      <td className="py-3 px-3.5 font-semibold text-[#183926]">Picking an idea</td>
                      <td className="py-3 px-3.5 text-[#526056]">Guess whatever feels cool</td>
                      <td className="py-3 px-3.5 font-medium text-[#18291F] bg-[#EDE7D6]/45">
                        Auto-rank 10 ideas on 5 buyer signals
                      </td>
                    </tr>
                    <tr className="bg-[#EDE7D6]/30 border-b border-[#C29B48]/25">
                      <td className="py-3 px-3.5 font-semibold text-[#183926]">Real feedback</td>
                      <td className="py-3 px-3.5 text-[#526056]">Wait 3–6 weeks to hear silence</td>
                      <td className="py-3 px-3.5 font-medium text-[#18291F] bg-[#EDE7D6]/70">
                        48 hrs talking to 10 people on WhatsApp
                      </td>
                    </tr>
                    <tr className="bg-white">
                      <td className="py-3 px-3.5 font-semibold text-[#183926]">If idea is weak</td>
                      <td className="py-3 px-3.5 text-[#9A3412]">Burn out after wasted weeks</td>
                      <td className="py-3 px-3.5 font-semibold text-[#183926] bg-[#EDE7D6]/45">
                        Spot Red Flags Sunday &amp; pivot to #2
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right: Digital Creator Outcome Snapshot (Full Walkthroughs Are Gated) */}
          <div className="lg:col-span-5 bg-[#F7F3E9] border border-[#C29B48] overflow-hidden">
            <div className="px-6 py-4 bg-[#183926] text-[#F7F3E9] border-b-2 border-[#C29B48] flex items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-bold text-white">
                  Worked Proof: Digital Creator (Dar)
                </h2>
                <p className="text-xs text-[#EDE7D6]/80 mt-0.5">
                  Example scoring snapshot from the Member Kit
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('examples')}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#C29B48] hover:underline cursor-pointer shrink-0"
              >
                {!session.authenticated && <Lock className="w-3 h-3" />}
                <span>{session.authenticated ? 'All 3 cases' : 'Member cases'}</span>
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="border border-[#183926]/15 overflow-hidden bg-white">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#183926] text-[#F7F3E9]">
                      <th className="py-2 px-3 font-semibold">Rank</th>
                      <th className="py-2 px-3 font-semibold">Creator Idea Scored</th>
                      <th className="py-2 px-3 text-right font-semibold">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-[#EDE7D6]">
                      <td className="py-2.5 px-3 font-mono-tabular font-bold text-[#183926]">#1</td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-[#18291F]">
                          30-Min CapCut Reels &amp; Hook Pack
                        </div>
                        <div className="text-[11px] text-[#183926] font-medium">
                          4 paid M-Pesa deposits in 36 hrs
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono-tabular font-bold text-[#183926]">
                        23/25
                      </td>
                    </tr>
                    <tr className="bg-white">
                      <td className="py-2.5 px-3 font-mono-tabular text-[#526056]">#2</td>
                      <td className="py-2.5 px-3">
                        <div className="font-medium text-[#18291F]">Canva Media Kit &amp; Rate Sheet</div>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono-tabular font-semibold text-[#18291F]">
                        19/25
                      </td>
                    </tr>
                    <tr className="bg-[#EDE7D6]/55">
                      <td className="py-2.5 px-3 font-mono-tabular text-[#526056]">#3</td>
                      <td className="py-2.5 px-3">
                        <div className="font-medium text-[#526056]">14-Module Filmmaking Course</div>
                        <div className="text-[11px] text-[#9A3412]">Dropped — too slow to film</div>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono-tabular text-[#526056]">
                        14/25
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-[#EDE7D6] border border-[#C29B48]/45 p-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold tracking-wide text-[#9A772F] uppercase">
                    Included Bilingual Script Pack
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#183926]">
                    <Lock className="w-3 h-3 text-[#C29B48]" />
                    Paid Members Only
                  </span>
                </div>
                <p className="text-xs text-[#18291F] leading-relaxed">
                  Inside the Paid Member Kit: 5 word-for-word Swahili &amp; English outreach scripts, 3 pre-sell message templates for WhatsApp Status / Instagram / Threads, and all 3 creator case studies step by step.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. THE 6 STEPS + FULL DELIVERABLE TABLE */}
      <section className="border-t border-[#C29B48]/30 bg-white/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-10">
          <div className="max-w-2xl space-y-2">
            <div className="text-xs font-semibold tracking-[0.14em] text-[#9A772F]">
              THE SOLUTION · 6 SIMPLE STEPS
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#183926] text-balance">
              Go from “I think this might work” to “I have real evidence.”
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {PUBLIC_STEP_OVERVIEW.map((step) => (
              <div
                key={step.id}
                className="bg-[#F7F3E9] border border-[#C29B48]/65 p-5 flex flex-col justify-between gap-3"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="w-9 h-9 bg-[#183926] text-[#C29B48] font-display text-lg font-bold flex items-center justify-center">
                      {step.number}
                    </div>
                    <span className="text-xs font-mono-tabular text-[#9A772F] font-medium">
                      {step.timeEstimate} · {step.pageRange}
                    </span>
                  </div>
                  <h3 className="font-display text-lg font-bold text-[#183926]">{step.title}</h3>
                  <p className="text-sm text-[#18291F]/85 leading-relaxed">{step.buyerAction}</p>
                </div>
              </div>
            ))}
          </div>

          <div
            id="product-cover"
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-2"
          >
            {/* Left: Official Biashara Base Product Cover (Non-Downloadable Preview) */}
            <div className="lg:col-span-5 bg-[#EDE7D6]/65 border border-[#C29B48] p-6 sm:p-7 flex flex-col items-center gap-4">
              <div className="w-full flex items-center justify-between border-b border-[#C29B48]/40 pb-3">
                <div>
                  <div className="text-[11px] font-bold tracking-[0.14em] text-[#9A772F] uppercase">
                    Official Digital Edition Cover
                  </div>
                  <h3 className="font-display text-lg font-bold text-[#183926]">
                    Product Idea Validator Kit
                  </h3>
                </div>
                <span className="font-mono-tabular text-xs font-bold text-[#183926] bg-white border border-[#C29B48]/60 px-2.5 py-1">
                  25–35 Pages
                </span>
              </div>

              <PublicCoverPreview />
            </div>

            {/* Right: Deliverable Table */}
            <div className="lg:col-span-7 border border-[#C29B48] overflow-hidden bg-white">
              <div className="px-6 py-4 bg-[#183926] text-[#F7F3E9] border-b-2 border-[#C29B48] flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-display text-lg font-bold text-white">
                    What is inside the Validator Kit
                  </h3>
                  <p className="text-xs text-[#EDE7D6]/80">
                    Unlocked immediately when you enter your Paid Member Access Key
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('kit')}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#C29B48] hover:underline cursor-pointer whitespace-nowrap"
                >
                  {!session.authenticated && <Lock className="w-3 h-3" />}
                  <span>{session.authenticated ? 'Open workspace' : 'Member login'}</span>
                </button>
              </div>
              <table className="w-full text-left border-collapse">
                <tbody className="text-sm">
                  {WHATS_INSIDE_ROWS.map((row, idx) => (
                    <tr
                      key={row.item}
                      className={idx % 2 === 0 ? 'bg-white' : 'bg-[#EDE7D6]/70'}
                    >
                      <td className="py-3.5 px-4 sm:px-6 font-bold text-[#183926] w-2/5">
                        <span className="inline-flex items-center gap-2">
                          <Plus className="w-3.5 h-3.5 text-[#C29B48] shrink-0" />
                          <span>{row.item}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-[#18291F]/85">{row.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FREE 3-MINUTE CHECKLIST */}
      <section className="bg-[#EDE7D6]/70 border-y border-[#C29B48]/35">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="text-xs font-semibold tracking-[0.14em] text-[#9A772F]">
              FREE LEAD MAGNET · 3-MINUTE CHECK
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#183926] text-balance">
              Test one idea right now before you buy.
            </h2>
            <p className="text-sm sm:text-base text-[#526056]">
              Answer 8 honest yes/no questions below. Score 5 or higher? Your idea is ready for a cheap real-world test.
            </p>
          </div>

          <FreeChecklistView
            embedded
            isAuthenticated={session.authenticated}
            onOpenCheckout={scrollToOffer}
            onOpenKit={() => onNavigate('kit')}
          />
        </div>
      </section>

      {/* 5. WHO IT IS FOR / NOT FOR / WALK AWAY WITH */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white border border-[#C29B48]/60 overflow-hidden">
            <div className="px-5 py-3 bg-[#183926] text-white border-b-2 border-[#C29B48] font-display text-lg font-bold">
              Who it is for
            </div>
            <ul className="p-5 space-y-3 text-sm text-[#18291F]/85 bg-[#F7F3E9]">
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#183926] shrink-0 mt-0.5" />
                <span>
                  Beginners who want to start a digital product but do not know which idea to pick
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#183926] shrink-0 mt-0.5" />
                <span>People with a skill who are not sure anyone will pay for it</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#183926] shrink-0 mt-0.5" />
                <span>Anyone who has been stuck “planning” for weeks</span>
              </li>
            </ul>
          </div>

          <div className="bg-[#EDE7D6] border border-[#C29B48] overflow-hidden">
            <div className="px-5 py-3 bg-[#183926] text-white border-b-2 border-[#C29B48] font-display text-lg font-bold">
              Who it is NOT for
            </div>
            <div className="p-5 space-y-3">
              <div className="flex items-start gap-2.5 text-sm text-[#18291F] leading-relaxed">
                <X className="w-4 h-4 text-[#9A3412] shrink-0 mt-0.5" />
                <span>
                  People looking for a guaranteed income shortcut. No kit can promise sales.
                </span>
              </div>
              <p className="text-xs text-[#526056] leading-relaxed pt-3 border-t border-[#C29B48]/40">
                Keep it honest: this kit helps you test an idea cheaply before building. A strong test score improves your odds, never guarantees income.
              </p>
            </div>
          </div>

          <div className="bg-white border border-[#C29B48]/60 overflow-hidden">
            <div className="px-5 py-3 bg-[#183926] text-white border-b-2 border-[#C29B48] font-display text-lg font-bold">
              What you will walk away with
            </div>
            <ul className="p-5 space-y-3 text-sm text-[#18291F]/85 bg-[#F7F3E9]">
              <li className="flex items-start gap-2.5">
                <Plus className="w-4 h-4 text-[#C29B48] shrink-0 mt-0.5" />
                <span>A ranked list of your best product ideas</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Plus className="w-4 h-4 text-[#C29B48] shrink-0 mt-0.5" />
                <span>Real feedback from real people</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Plus className="w-4 h-4 text-[#C29B48] shrink-0 mt-0.5" />
                <span>A clear Build / Fix / Drop decision</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Plus className="w-4 h-4 text-[#C29B48] shrink-0 mt-0.5" />
                <span>Confidence about your next step</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 6. FAQ & BOTTOM OFFER CARD */}
      <section className="border-t border-[#C29B48]/30 bg-white/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: FAQ */}
            <div className="lg:col-span-7 space-y-6">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#183926]">
                Frequently asked questions
              </h2>

              <div className="divide-y divide-[#C29B48]/30 border border-[#C29B48]/60 bg-white">
                {EXTRA_FAQ.map((item, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <div key={item.q}>
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                        className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left hover:bg-[#EDE7D6]/45 transition-colors cursor-pointer"
                      >
                        <span className="text-sm sm:text-base font-bold text-[#183926]">
                          {item.q}
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 text-[#9A772F] shrink-0 transition-transform duration-150 ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-4 text-sm text-[#526056] leading-relaxed">
                          {item.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <p className="font-display italic text-xl text-[#183926] pt-2">
                The cheapest time to find out an idea will not work is before you build it.
              </p>
            </div>

            {/* Right: Second Inline Offer Card */}
            <div className="lg:col-span-5">
              <InlineOfferCard
                id="get-kit-card-bottom"
                publicConfig={publicConfig}
                session={session}
                onUnlockSuccess={onUnlockSuccess}
                onOpenKit={() => onNavigate('kit')}
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

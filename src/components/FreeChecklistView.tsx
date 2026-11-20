import { ArrowRight, Check, Lock, Printer, RotateCcw, ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import { SELLABILITY_QUESTIONS } from '../data/publicContent';

interface FreeChecklistViewProps {
  embedded?: boolean;
  isAuthenticated?: boolean;
  onOpenCheckout: () => void;
  onOpenKit?: () => void;
}

type AnswerValue = 'yes' | 'no' | null;

export function FreeChecklistView({
  embedded = false,
  isAuthenticated = false,
  onOpenCheckout,
  onOpenKit,
}: FreeChecklistViewProps) {
  const [ideaName, setIdeaName] = useState('');
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});

  const answeredCount = Object.values(answers).filter((v) => v !== null && v !== undefined).length;
  const yesCount = Object.values(answers).filter((v) => v === 'yes').length;
  const allAnswered = answeredCount === SELLABILITY_QUESTIONS.length;

  const setAnswer = (id: string, val: 'yes' | 'no') => {
    setAnswers((prev) => ({ ...prev, [id]: val }));
  };

  const resetChecklist = () => {
    setAnswers({});
    setIdeaName('');
  };

  const getInterpretation = () => {
    if (answeredCount === 0) {
      return {
        label: 'Waiting for your answers',
        toneClass: 'bg-[#EDE7D6] border-[#C29B48]/45 text-[#18291F]',
        title: 'Answer all 8 questions honestly in under 3 minutes.',
        detail:
          'Pick one digital product idea you are considering right now and answer Yes or No based on real facts—not hopeful guesses.',
      };
    }
    if (yesCount >= 5) {
      return {
        label: 'Score 5–8 · Worth testing in the real world',
        toneClass: 'bg-[#183926] border-[#C29B48] text-[#F7F3E9]',
        isDark: true,
        title: 'Your idea has enough substance to test cheaply before building.',
        detail:
          'You have a concrete problem, real people in mind, and a fast path to a first version. The next step is talking to 10 real people and running a simple pre-sell test inside the Product Idea Validator Kit.',
      };
    }
    if (yesCount >= 3) {
      return {
        label: 'Score 3–4 · Promising, needs sharper focus',
        toneClass: 'bg-[#EDE7D6] border-[#C29B48] text-[#18291F]',
        title: 'Do not build yet—narrow who this is for and how you will reach them.',
        detail:
          'Most 3–4 ideas fail only because they are too broad or too slow to build. Use Step 2 (Idea Generator) and Step 3 (Scoring Sheet) inside the Validator Kit to compare sharper angles first.',
      };
    }
    return {
      label: 'Score 0–2 · Pause before spending a week here',
      toneClass: 'bg-[#F5E8E4] border-[#B45309]/40 text-[#18291F]',
      title: 'Hold off on this angle and generate fresher ideas from your skill inventory.',
      detail:
        'A low score just saved you weeks of silence after launch. Revisit what people already ask you for help with before choosing your test candidate.',
    };
  };

  const result = getInterpretation();

  return (
    <section
      id="free-checklist"
      className={embedded ? '' : 'max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14 print-container'}
    >
      <div className="bg-white border border-[#183926]/20 p-6 sm:p-10">
        {/* Top Metadata + Print Utility */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-6 border-b border-[#C29B48]/40">
          <div className="space-y-2 max-w-2xl">
            <p className="text-xs font-semibold tracking-[0.14em] text-[#9A772F]">
              FREE ONE-PAGE CHECKLIST · 3-MINUTE TEST
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#183926] text-balance">
              Is My Idea Sellable?
            </h2>
            <p className="text-sm sm:text-base text-[#526056] leading-relaxed">
              Answer these 8 yes/no questions before you spend a single week designing slides, recording videos, or writing pages.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 no-print">
            <button
              type="button"
              onClick={resetChecklist}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#183926] bg-[#F7F3E9] border border-[#183926]/20 rounded hover:bg-[#EDE7D6] transition-colors cursor-pointer whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#183926] bg-[#F7F3E9] border border-[#183926]/20 rounded hover:bg-[#EDE7D6] transition-colors cursor-pointer whitespace-nowrap"
            >
              <Printer className="w-3.5 h-3.5" />
              Print 1-Page PDF
            </button>
          </div>
        </div>

        {/* Optional Idea Input */}
        <div className="py-5 border-b border-[#C29B48]/25">
          <label htmlFor="checklist-idea-name" className="block text-xs font-semibold text-[#183926] mb-2">
            Idea you are testing right now (optional)
          </label>
          <input
            id="checklist-idea-name"
            type="text"
            value={ideaName}
            onChange={(e) => setIdeaName(e.target.value)}
            placeholder="e.g., 30-Minute CapCut Reels & bilingual hook template pack for creators"
            className="w-full px-3.5 py-2.5 text-sm text-[#18291F] bg-[#F7F3E9] border border-[#183926]/20 rounded focus:outline-none focus:bg-white focus:border-[#183926] transition-colors"
          />
        </div>

        {/* 8 Yes/No Questions */}
        <div className="divide-y divide-[#C29B48]/25">
          {SELLABILITY_QUESTIONS.map((item) => {
            const val = answers[item.id] ?? null;
            return (
              <div
                key={item.id}
                className="py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1 max-w-2xl">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 shrink-0 bg-[#183926] text-[#C29B48] font-display text-xs font-bold flex items-center justify-center mt-0.5">
                      {item.number}
                    </span>
                    <div>
                      <p className="text-sm sm:text-base font-semibold text-[#18291F] leading-snug">
                        {item.question}
                      </p>
                      <p className="text-xs sm:text-sm text-[#526056] mt-1 leading-relaxed">
                        {item.helper}
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  role="group"
                  aria-label={`Question ${item.number} answer`}
                  className="flex items-center gap-2 pl-9 sm:pl-0 shrink-0"
                >
                  <button
                    type="button"
                    onClick={() => setAnswer(item.id, 'yes')}
                    aria-pressed={val === 'yes'}
                    className={`min-h-[44px] min-w-[72px] px-4 py-2 text-sm font-semibold rounded border transition-colors cursor-pointer whitespace-nowrap ${
                      val === 'yes'
                        ? 'bg-[#183926] text-[#C29B48] border-[#183926]'
                        : 'bg-[#F7F3E9] text-[#18291F] border-[#183926]/20 hover:bg-[#EDE7D6]'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnswer(item.id, 'no')}
                    aria-pressed={val === 'no'}
                    className={`min-h-[44px] min-w-[72px] px-4 py-2 text-sm font-semibold rounded border transition-colors cursor-pointer whitespace-nowrap ${
                      val === 'no'
                        ? 'bg-[#526056] text-white border-[#526056]'
                        : 'bg-[#F7F3E9] text-[#18291F] border-[#183926]/20 hover:bg-[#EDE7D6]'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Score Summary at Bottom */}
        <div className={`mt-6 p-5 sm:p-6 border ${result.toneClass}`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div
                className={`flex flex-wrap items-center gap-2 text-xs font-semibold ${
                  result.isDark ? 'text-[#C29B48]' : 'text-[#9A772F]'
                }`}
              >
                <span>{result.label}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono-tabular">
                  {answeredCount} of {SELLABILITY_QUESTIONS.length} answered
                </span>
              </div>
              <h3
                className={`font-display text-lg sm:text-xl font-bold ${
                  result.isDark ? 'text-white' : 'text-[#183926]'
                }`}
              >
                {ideaName.trim() ? `${ideaName.trim()}: ` : ''}
                {result.title}
              </h3>
              <p
                className={`text-sm leading-relaxed ${
                  result.isDark ? 'text-[#EDE7D6]' : 'text-[#18291F]/85'
                }`}
              >
                {result.detail}
              </p>
            </div>

            <div className="flex flex-col items-start md:items-end gap-2.5 shrink-0">
              <div className="text-left md:text-right">
                <div
                  className={`text-xs font-medium ${
                    result.isDark ? 'text-[#EDE7D6]/80' : 'text-[#526056]'
                  }`}
                >
                  Your Yes Score
                </div>
                <div
                  className={`font-mono-tabular text-3xl sm:text-4xl font-bold ${
                    result.isDark ? 'text-[#C29B48]' : 'text-[#183926]'
                  }`}
                >
                  {yesCount}
                  <span
                    className={`text-lg font-normal ${
                      result.isDark ? 'text-[#EDE7D6]/60' : 'text-[#526056]'
                    }`}
                  >
                    {' '}
                    / 8
                  </span>
                </div>
              </div>

              {yesCount >= 5 && (
                <button
                  type="button"
                  onClick={isAuthenticated && onOpenKit ? onOpenKit : onOpenCheckout}
                  className="no-print inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-[#183926] bg-[#C29B48] rounded hover:bg-[#AE8838] transition-colors cursor-pointer whitespace-nowrap"
                >
                  {isAuthenticated ? 'Open Paid Kit Workspace' : 'Get the Validator Kit'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              {allAnswered && yesCount < 5 && (
                <button
                  type="button"
                  onClick={isAuthenticated && onOpenKit ? onOpenKit : onOpenCheckout}
                  className="no-print inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-[#183926] bg-white border border-[#183926]/25 rounded hover:bg-[#F7F3E9] transition-colors cursor-pointer whitespace-nowrap"
                >
                  {!isAuthenticated && <Lock className="w-3.5 h-3.5 text-[#9A772F]" />}
                  {isAuthenticated ? 'Open Step 1–2 Idea Generator' : 'Unlock Step 1–2 Idea Generator'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div
            className={`mt-4 pt-4 border-t flex items-start gap-2.5 text-xs leading-relaxed ${
              result.isDark
                ? 'border-[#C29B48]/30 text-[#EDE7D6]/80'
                : 'border-[#C29B48]/30 text-[#526056]'
            }`}
          >
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              <strong>Keep it honest:</strong> A score of 5 or higher does not guarantee sales. It simply tells you the idea is grounded enough to test cheaply before spending weeks building it.
            </span>
          </div>
        </div>

        {!embedded && (
          <div className="mt-6 pt-5 border-t border-[#C29B48]/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#526056]">
            <span className="inline-flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-[#183926]" />
              Biashara Base · biasharabase.com
            </span>
            <span>Product Idea Validator Kit · TSh 15,000 / $7</span>
          </div>
        )}
      </div>
    </section>
  );
}

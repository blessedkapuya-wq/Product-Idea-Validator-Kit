import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Check,
  CheckSquare,
  Compass,
  Copy,
  Download,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
  ListChecks,
  LogOut,
  MessageSquare,
  Megaphone,
  Plus,
  Printer,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type {
  KitSectionId,
  PaidKitBundleData,
  ProductIdea,
  WorkspaceState,
} from '../types';
import { PriceSanityCalculator } from './PriceSanityCalculator';
import { ProductCoverCard } from './ProductCoverCard';
import { ScoringSheet, calculateIdeaTotal } from './ScoringSheet';
import { ScriptPackView } from './ScriptPackView';
import { StatusSlideGenerator } from './StatusSlideGenerator';
import { WorkedExamplesView } from './WorkedExamplesView';

interface KitWorkspaceProps {
  paidData: PaidKitBundleData;
  state: WorkspaceState;
  onChangeState: (next: WorkspaceState) => void;
  onResetSamples: () => void;
  onClearBlank: () => void;
  onDownloadZip: () => void;
  downloadingZip: boolean;
  onSignOut: () => void;
}

const FORMAT_PRESETS = [
  'PDF Guide + Checklist',
  'Google Sheet / Excel Calculator',
  'Template & Script Pack',
  'Printable Pattern / Fit Chart',
  'Short Video Walkthrough + Workbook',
];

const DECISION_CRITERIA = [
  {
    id: 'd-1',
    label: 'My top-ranked idea scored 18/25 or higher in Step 3.',
  },
  {
    id: 'd-2',
    label: 'At least 6 out of 10 people in Step 4 confirmed this problem wastes their time or money.',
  },
  {
    id: 'd-3',
    label: 'In Step 5, at least 3 people explicitly said they would pay or asked how to pay.',
  },
  {
    id: 'd-4',
    label: 'I checked the 10 Red Flags and none of the critical blockers apply.',
  },
  {
    id: 'd-5',
    label: 'I can ship Version 1 in 7 days on my phone or computer without waiting on extra tools.',
  },
];

export function KitWorkspace({
  paidData,
  state,
  onChangeState,
  onResetSamples,
  onClearBlank,
  onDownloadZip,
  downloadingZip,
  onSignOut,
}: KitWorkspaceProps) {
  const [activeSection, setActiveSection] = useState<KitSectionId>('full-guide');
  const [guideHtml, setGuideHtml] = useState<string>('');
  const [loadingGuide, setLoadingGuide] = useState(false);
  const [guideError, setGuideError] = useState('');
  const guideFrameRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    if (activeSection !== 'full-guide') return;
    let active = true;
    setLoadingGuide(true);
    setGuideError('');
    fetch('/api/paid/guide', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspaceState: state }),
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error('Could not load the 25-page guide.');
        }
        return res.text();
      })
      .then((html) => {
        if (active) {
          setGuideHtml(html);
          setLoadingGuide(false);
        }
      })
      .catch((err) => {
        if (active) {
          setGuideError(err instanceof Error ? err.message : 'Unable to load guide.');
          setLoadingGuide(false);
        }
      });
    return () => {
      active = false;
    };
  }, [activeSection, state]);

  const [skillDrafts, setSkillDrafts] = useState({
    whatIKnow: '',
    askedForHelp: '',
    problemsSolved: '',
  });
  const [ideaDraft, setIdeaDraft] = useState({
    format: FORMAT_PRESETS[0],
    audience: '',
    result: '',
    title: '',
  });

  const [outreachDraft, setOutreachDraft] = useState({
    name: '',
    channel: 'WhatsApp',
    exactQuote: '',
  });

  const [preSellDraft, setPreSellDraft] = useState({
    platform: 'WhatsApp Status' as 'WhatsApp Status' | 'Instagram' | 'Threads',
    offerLine: '',
    priceTested: 'TSh 15,000 ($7)',
  });

  const activeStepMeta = paidData.guideSteps.find((s) => s.id === activeSection);

  const topRankedIdea = [...state.ideas].sort(
    (a, b) => calculateIdeaTotal(b.scores) - calculateIdeaTotal(a.scores)
  )[0];

  const [copiedOffer, setCopiedOffer] = useState(false);

  const totalSkillsCount =
    state.skillInventory.whatIKnow.length +
    state.skillInventory.askedForHelp.length +
    state.skillInventory.problemsSolved.length;

  const confirmedOutreachCount = state.outreach.filter(
    (o) => o.problemConfirmed === 'yes'
  ).length;

  const totalWouldPay = state.preSellLogs.reduce((acc, log) => acc + log.wouldPayCount, 0);
  const totalDeposits = state.preSellLogs.reduce((acc, log) => acc + log.depositsCount, 0);
  const redFlagCount = Object.values(state.redFlagsChecked).filter(Boolean).length;

  const buyerQuotes = state.outreach
    .map((o) => o.exactQuote.trim())
    .filter(Boolean)
    .slice(0, 2);

  const draftedOfferText = topRankedIdea
    ? `${topRankedIdea.title}\n\nA ${topRankedIdea.format.toLowerCase()} that helps ${topRankedIdea.audience} to ${topRankedIdea.result}.\n\n${
        buyerQuotes.length > 0
          ? `Built directly from what real people told me:\n${buyerQuotes.map((q) => `• "${q}"`).join('\n')}\n\n`
          : ''
      }Launch test price: ${state.scriptVariables.priceTsh || 'TSh 15,000'} (${state.scriptVariables.priceUsd || '$7'}).`
    : 'Add and score an idea in Steps 2–3 and log real buyer quotes in Step 4 to auto-draft your offer summary here.';

  const copyOfferDraft = async () => {
    try {
      await navigator.clipboard.writeText(draftedOfferText);
      setCopiedOffer(true);
      setTimeout(() => setCopiedOffer(false), 1800);
    } catch {
      // ignore fallback
    }
  };

  const addSkillItem = (col: keyof typeof state.skillInventory) => {
    const val = skillDrafts[col].trim();
    if (!val) return;
    onChangeState({
      ...state,
      skillInventory: {
        ...state.skillInventory,
        [col]: [...state.skillInventory[col], val],
      },
    });
    setSkillDrafts((prev) => ({ ...prev, [col]: '' }));
  };

  const removeSkillItem = (col: keyof typeof state.skillInventory, index: number) => {
    onChangeState({
      ...state,
      skillInventory: {
        ...state.skillInventory,
        [col]: state.skillInventory[col].filter((_, i) => i !== index),
      },
    });
  };

  const handleGenerateIdea = (e: React.FormEvent) => {
    e.preventDefault();
    if (state.ideas.length >= 10) return;
    if (!ideaDraft.audience.trim() || !ideaDraft.result.trim()) return;

    const generatedTitle =
      ideaDraft.title.trim() ||
      `${ideaDraft.format} for ${ideaDraft.audience.trim()}`;

    const newIdea: ProductIdea = {
      id: `idea-${Date.now()}`,
      format: ideaDraft.format,
      audience: ideaDraft.audience.trim(),
      result: ideaDraft.result.trim(),
      title: generatedTitle,
      scores: {
        demand: 4,
        helpfulness: 4,
        easeToBuild: 4,
        pricePotential: 3,
        reachBuyers: 4,
      },
      notes: `A ${ideaDraft.format.toLowerCase()} that helps ${ideaDraft.audience.trim()} to ${ideaDraft.result.trim()}.`,
    };

    onChangeState({
      ...state,
      ideas: [...state.ideas, newIdea],
      scriptVariables: {
        ...state.scriptVariables,
        topic: ideaDraft.result.trim(),
        audience: ideaDraft.audience.trim(),
      },
    });

    setIdeaDraft({
      format: ideaDraft.format,
      audience: '',
      result: '',
      title: '',
    });
  };

  const addOutreachContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!outreachDraft.name.trim()) return;
    onChangeState({
      ...state,
      outreach: [
        ...state.outreach,
        {
          id: `c-${Date.now()}`,
          name: outreachDraft.name.trim(),
          channel: outreachDraft.channel,
          problemConfirmed: 'pending',
          exactQuote: outreachDraft.exactQuote.trim(),
          urgencyNote: '',
        },
      ],
    });
    setOutreachDraft({ name: '', channel: 'WhatsApp', exactQuote: '' });
  };

  const addPreSellLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!preSellDraft.offerLine.trim()) return;
    onChangeState({
      ...state,
      preSellLogs: [
        ...state.preSellLogs,
        {
          id: `ps-${Date.now()}`,
          platform: preSellDraft.platform,
          offerLine: preSellDraft.offerLine.trim(),
          priceTested: preSellDraft.priceTested.trim() || 'TSh 15,000',
          repliesCount: 0,
          wouldPayCount: 0,
          depositsCount: 0,
          outcomeNotes: '',
        },
      ],
    });
    setPreSellDraft({
      platform: 'WhatsApp Status',
      offerLine: '',
      priceTested: 'TSh 15,000 ($7)',
    });
  };

  const sidebarGroups: {
    groupLabel: string;
    items: { id: KitSectionId; label: string; badge?: string; icon: React.ComponentType<{ className?: string }> }[];
  }[] = [
    {
      groupLabel: 'The 6-Step Guide (25 Pages)',
      items: [
        { id: 'full-guide', label: 'Full 25-Page Guide', badge: '25p', icon: FileText },
        { id: 'step-1', label: '01. Your Skill Inventory', icon: ListChecks },
        { id: 'step-2', label: '02. Idea Generator', badge: `${state.ideas.length}/10`, icon: Plus },
        { id: 'step-3', label: '03. The Scoring Sheet', icon: FileSpreadsheet },
        { id: 'step-4', label: '04. Talk to 10 People', badge: `${state.outreach.length}/10`, icon: MessageSquare },
        { id: 'step-5', label: '05. The Pre-Sell Test', icon: Megaphone },
        { id: 'step-6', label: '06. Decision Time', icon: CheckSquare },
      ],
    },
    {
      groupLabel: 'Kit Extras & Templates',
      items: [
        { id: 'scripts', label: 'Swahili & EN Scripts', icon: MessageSquare },
        { id: 'presell', label: 'Pre-Sell Templates', icon: Megaphone },
        { id: 'examples', label: '3 Worked Examples', icon: BookOpen },
        { id: 'red-flags', label: '10 Red Flags Checklist', badge: redFlagCount > 0 ? `${redFlagCount}` : undefined, icon: AlertTriangle },
        { id: 'cover', label: 'Product Cover & PNG', icon: ImageIcon },
        { id: 'next-steps', label: 'Next Steps & Launch Plan', icon: Compass },
      ],
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <div className="mb-6 pb-5 border-b border-[#C29B48]/40 flex flex-col lg:flex-row lg:items-center justify-between gap-4 no-print">
        <div>
          <div className="text-xs font-semibold tracking-[0.12em] text-[#9A772F]">
            BIASHARA BASE · PAID MEMBER WORKSPACE · KEY {paidData.session.keyId}
            {paidData.session.orderRef ? ` · ORDER ${paidData.session.orderRef}` : ''}
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#183926] mt-1">
            6-Step Validation Workspace
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onResetSamples}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#183926] bg-white border border-[#183926]/20 rounded hover:bg-[#EDE7D6] transition-colors cursor-pointer whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Load Dar Creator Example
          </button>
          <button
            type="button"
            onClick={onClearBlank}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#526056] bg-white border border-[#183926]/20 rounded hover:bg-[#EDE7D6] transition-colors cursor-pointer whitespace-nowrap"
          >
            Start Blank
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('full-guide')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#183926] bg-[#EDE7D6] border border-[#C29B48] rounded hover:bg-[#C29B48]/35 transition-colors cursor-pointer whitespace-nowrap"
          >
            <FileText className="w-3.5 h-3.5 text-[#9A772F]" />
            25-Page Guide
          </button>
          <button
            type="button"
            disabled={downloadingZip}
            onClick={onDownloadZip}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#183926] bg-[#C29B48] rounded hover:bg-[#AE8838] disabled:opacity-60 transition-colors cursor-pointer whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            {downloadingZip ? 'Preparing ZIP...' : 'Download Kit (.zip)'}
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#F7F3E9] bg-[#183926] rounded hover:bg-[#122B1C] transition-colors cursor-pointer whitespace-nowrap"
          >
            <Printer className="w-3.5 h-3.5 text-[#C29B48]" />
            Print / PDF
          </button>
          <button
            type="button"
            onClick={onSignOut}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#9A3412] bg-white border border-[#9A3412]/30 rounded hover:bg-[#F5E8E4] transition-colors cursor-pointer whitespace-nowrap"
          >
            <LogOut className="w-3.5 h-3.5" />
            Lock &amp; Sign Out
          </button>
        </div>
      </div>

      {/* Weekend Progress Strip */}
      <div className="mb-6 grid grid-cols-2 sm:grid-cols-5 gap-3 no-print">
        <button
          type="button"
          onClick={() => setActiveSection('step-1')}
          className="text-left bg-white border border-[#183926]/20 p-3 hover:border-[#C29B48] transition-colors cursor-pointer"
        >
          <div className="text-[11px] font-semibold text-[#526056]">01. Skills Logged</div>
          <div className="font-mono-tabular text-lg font-bold text-[#183926] mt-0.5">
            {totalSkillsCount}
          </div>
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('step-3')}
          className="text-left bg-white border border-[#183926]/20 p-3 hover:border-[#C29B48] transition-colors cursor-pointer"
        >
          <div className="text-[11px] font-semibold text-[#526056]">03. Top Idea Score</div>
          <div className="font-mono-tabular text-lg font-bold text-[#183926] mt-0.5">
            {topRankedIdea ? `${calculateIdeaTotal(topRankedIdea.scores)}/25` : '—'}
          </div>
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('step-4')}
          className="text-left bg-white border border-[#183926]/20 p-3 hover:border-[#C29B48] transition-colors cursor-pointer"
        >
          <div className="text-[11px] font-semibold text-[#526056]">04. Interviews</div>
          <div className="font-mono-tabular text-lg font-bold text-[#183926] mt-0.5">
            {state.outreach.length} / 10
          </div>
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('step-5')}
          className="text-left bg-white border border-[#183926]/20 p-3 hover:border-[#C29B48] transition-colors cursor-pointer"
        >
          <div className="text-[11px] font-semibold text-[#526056]">05. Intent / Deposits</div>
          <div className="font-mono-tabular text-lg font-bold text-[#183926] mt-0.5">
            {totalWouldPay} / {totalDeposits}
          </div>
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('step-6')}
          className="col-span-2 sm:col-span-1 text-left bg-[#183926] text-[#F7F3E9] border border-[#C29B48] p-3 hover:bg-[#122B1C] transition-colors cursor-pointer"
        >
          <div className="text-[11px] font-semibold text-[#C29B48]">06. Current Call</div>
          <div className="font-display text-lg font-bold text-white mt-0.5 uppercase">
            {state.decision.verdict ?? 'Pending'}
          </div>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <aside className="lg:col-span-3 bg-white border border-[#183926]/20 p-3 space-y-5 no-print">
          {sidebarGroups.map((group) => (
            <div key={group.groupLabel} className="space-y-1">
              <div className="px-3 py-1 text-[11px] font-semibold tracking-wider uppercase text-[#9A772F]">
                {group.groupLabel}
              </div>
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 text-left text-sm transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#183926] text-[#F7F3E9] font-semibold'
                        : 'text-[#18291F] hover:bg-[#EDE7D6]/70 font-medium'
                    }`}
                  >
                    <span className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-[#C29B48]' : 'text-[#526056]'}`} />
                      <span className="truncate">{item.label}</span>
                    </span>
                    {item.badge && (
                      <span
                        className={`font-mono-tabular text-xs shrink-0 ${
                          active ? 'text-[#C29B48]' : 'text-[#526056]'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </aside>

        <div className="lg:col-span-9 bg-white border border-[#183926]/20 p-5 sm:p-8 space-y-6 print-container">
          {activeStepMeta && (
            <div className="pb-5 border-b border-[#C29B48]/40 flex items-start gap-4">
              <div className="w-11 h-11 shrink-0 bg-[#183926] text-[#C29B48] font-display text-2xl font-bold flex items-center justify-center">
                {activeStepMeta.number}
              </div>
              <div>
                <div className="text-xs font-semibold tracking-wider uppercase text-[#9A772F]">
                  Step {activeStepMeta.number} of 6 · {activeStepMeta.pageRange} · {activeStepMeta.timeEstimate}
                </div>
                <h2 className="font-display text-2xl font-bold text-[#183926] mt-0.5">
                  {activeStepMeta.title}
                </h2>
                <p className="text-sm text-[#526056] mt-1 leading-relaxed">
                  {activeStepMeta.summary}
                </p>
              </div>
            </div>
          )}

          {activeSection === 'full-guide' && (
            <div className="space-y-5">
              <div className="pb-4 border-b border-[#C29B48]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold tracking-wider uppercase text-[#9A772F]">
                    Complete Printable Workbook · Pages 1–25
                  </div>
                  <h2 className="font-display text-2xl font-bold text-[#183926] mt-0.5">
                    25-Page Step-by-Step Validator Guide
                  </h2>
                  <p className="text-sm text-[#526056] mt-1">
                    Synced automatically with your workspace answers, scored ideas, buyer quotes, and 7-day build plan. Also included inside your <code className="font-mono-tabular text-xs bg-[#EDE7D6] px-1">.zip</code> download.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0 no-print">
                  <button
                    type="button"
                    onClick={() => guideFrameRef.current?.contentWindow?.print()}
                    disabled={!guideHtml}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#183926] bg-[#C29B48] rounded hover:bg-[#AE8838] disabled:opacity-50 cursor-pointer whitespace-nowrap"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Print / Save 25-Page PDF
                  </button>
                  <a
                    href="/api/paid/guide"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#F7F3E9] bg-[#183926] rounded hover:bg-[#122B1C] whitespace-nowrap"
                  >
                    <span>Open Standalone</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#C29B48]" />
                  </a>
                  <button
                    type="button"
                    onClick={() => setActiveSection('step-1')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#183926] bg-[#F7F3E9] border border-[#183926]/20 rounded hover:bg-[#EDE7D6] cursor-pointer whitespace-nowrap"
                  >
                    <span>Start Interactive Step 1</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {loadingGuide && (
                <div className="p-8 text-center bg-[#F7F3E9] border border-[#C29B48]/40 text-sm text-[#183926]">
                  Preparing your 25-page step-by-step guide...
                </div>
              )}

              {guideError && (
                <div className="p-4 bg-[#F5E8E4] border border-[#9A3412]/30 text-sm text-[#9A3412]">
                  {guideError}
                </div>
              )}

              {!loadingGuide && guideHtml && (
                <iframe
                  ref={guideFrameRef}
                  title="Biashara Base 25-Page Step-by-Step Guide"
                  srcDoc={guideHtml}
                  className="w-full h-[780px] border border-[#C29B48] bg-[#E2DAC6]"
                />
              )}
            </div>
          )}

          {activeSection === 'step-1' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {(
                  [
                    {
                      key: 'whatIKnow' as const,
                      title: '1. What You Already Know',
                      hint: 'Tools, workflows, recipes, patterns, spreadsheets, or shortcuts you use regularly.',
                      placeholder: 'e.g., Pricing custom client packages cleanly...',
                    },
                    {
                      key: 'askedForHelp' as const,
                      title: '2. What People Ask You For',
                      hint: 'Questions friends, clients, or followers send you on WhatsApp or in person.',
                      placeholder: 'e.g., How do you edit product Reels so fast?',
                    },
                    {
                      key: 'problemsSolved' as const,
                      title: '3. Problems You Solved',
                      hint: 'Mistakes you figured out the hard way that a beginner would gladly skip.',
                      placeholder: 'e.g., Cut weekly editing time from 3 hrs to 25 mins',
                    },
                  ]
                ).map((col) => (
                  <div
                    key={col.key}
                    className="bg-[#F7F3E9] border border-[#183926]/15 p-4 flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-3">
                      <div>
                        <h3 className="text-sm font-bold text-[#183926]">{col.title}</h3>
                        <p className="text-xs text-[#526056] mt-1 leading-relaxed">{col.hint}</p>
                      </div>

                      <ul className="space-y-2">
                        {state.skillInventory[col.key].length === 0 ? (
                          <li className="text-xs text-[#526056]/70 italic py-2">
                            No items added yet. Add 2–3 real items below.
                          </li>
                        ) : (
                          state.skillInventory[col.key].map((item, idx) => (
                            <li
                              key={`${col.key}-${idx}`}
                              className="flex items-start justify-between gap-2 bg-white border border-[#183926]/15 px-3 py-2 text-xs text-[#18291F]"
                            >
                              <span className="leading-relaxed">{item}</span>
                              <button
                                type="button"
                                aria-label="Remove skill item"
                                onClick={() => removeSkillItem(col.key, idx)}
                                className="text-[#526056] hover:text-[#9A3412] shrink-0 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </li>
                          ))
                        )}
                      </ul>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-[#C29B48]/30">
                      <input
                        type="text"
                        value={skillDrafts[col.key]}
                        onChange={(e) =>
                          setSkillDrafts((prev) => ({ ...prev, [col.key]: e.target.value }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addSkillItem(col.key);
                          }
                        }}
                        placeholder={col.placeholder}
                        className="flex-1 min-w-0 px-2.5 py-2 text-xs bg-white border border-[#183926]/20 rounded focus:outline-none focus:border-[#183926]"
                      />
                      <button
                        type="button"
                        onClick={() => addSkillItem(col.key)}
                        className="px-3 py-2 text-xs font-bold text-[#183926] bg-[#C29B48] rounded hover:bg-[#AE8838] shrink-0 cursor-pointer"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setActiveSection('step-2')}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-[#183926] bg-[#C29B48] rounded hover:bg-[#AE8838] transition-colors cursor-pointer"
                >
                  Next: Step 2 · Idea Generator
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {activeSection === 'step-2' && (
            <div className="space-y-6">
              <form
                onSubmit={handleGenerateIdea}
                className="bg-[#EDE7D6] border border-[#C29B48]/50 p-5 space-y-4"
              >
                <div className="space-y-1">
                  <div className="text-xs font-semibold tracking-wider uppercase text-[#9A772F]">
                    Fill-in-the-blank Idea Formula
                  </div>
                  <p className="font-display text-base sm:text-lg font-bold text-[#183926]">
                    “A <span className="underline decoration-[#C29B48]">[format]</span> that helps{' '}
                    <span className="underline decoration-[#C29B48]">[who]</span> to{' '}
                    <span className="underline decoration-[#C29B48]">[result]</span>.”
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#183926] mb-1.5">
                      Product Format
                    </label>
                    <select
                      value={ideaDraft.format}
                      onChange={(e) => setIdeaDraft((p) => ({ ...p, format: e.target.value }))}
                      className="w-full px-3 py-2.5 text-sm bg-white border border-[#183926]/20 rounded focus:outline-none focus:border-[#183926]"
                    >
                      {FORMAT_PRESETS.map((fmt) => (
                        <option key={fmt} value={fmt}>
                          {fmt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#183926] mb-1.5">
                      Short Product Name (optional)
                    </label>
                    <input
                      type="text"
                      value={ideaDraft.title}
                      onChange={(e) => setIdeaDraft((p) => ({ ...p, title: e.target.value }))}
                      placeholder="e.g., 30-Min CapCut Reels Hook Pack"
                      className="w-full px-3 py-2.5 text-sm bg-white border border-[#183926]/20 rounded focus:outline-none focus:border-[#183926]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#183926] mb-1.5">
                      Who It Helps ([who])
                    </label>
                    <input
                      type="text"
                      required
                      value={ideaDraft.audience}
                      onChange={(e) => setIdeaDraft((p) => ({ ...p, audience: e.target.value }))}
                      placeholder="e.g., small business creators in Tanzania"
                      className="w-full px-3 py-2.5 text-sm bg-white border border-[#183926]/20 rounded focus:outline-none focus:border-[#183926]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#183926] mb-1.5">
                      Specific Result ([result])
                    </label>
                    <input
                      type="text"
                      required
                      value={ideaDraft.result}
                      onChange={(e) => setIdeaDraft((p) => ({ ...p, result: e.target.value }))}
                      placeholder="e.g., edit product Reels on their phone in 30 minutes"
                      className="w-full px-3 py-2.5 text-sm bg-white border border-[#183926]/20 rounded focus:outline-none focus:border-[#183926]"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <span className="text-xs text-[#526056] font-mono-tabular">
                    Ideas saved for Step 3 scoring: {state.ideas.length} / 10
                  </span>
                  <button
                    type="submit"
                    disabled={state.ideas.length >= 10}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-bold text-[#183926] bg-[#C29B48] rounded hover:bg-[#AE8838] disabled:opacity-45 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Add to My 10 Ideas
                  </button>
                </div>
              </form>

              <div className="space-y-3">
                <h3 className="text-sm font-bold text-[#183926]">
                  Your Candidate Ideas ({state.ideas.length})
                </h3>
                {state.ideas.length === 0 ? (
                  <p className="text-sm text-[#526056] py-6 text-center border border-dashed border-[#C29B48]/50">
                    Generate your first idea above to send it into the Scoring Sheet.
                  </p>
                ) : (
                  <div className="divide-y divide-[#C29B48]/25 border border-[#183926]/20">
                    {state.ideas.map((idea, idx) => (
                      <div
                        key={idea.id}
                        className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          idx % 2 === 1 ? 'bg-[#EDE7D6]/40' : 'bg-white'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="text-xs font-medium text-[#9A772F]">
                            <span className="font-mono-tabular">0{idx + 1}</span> · {idea.format}
                          </div>
                          <div className="text-sm font-bold text-[#183926]">{idea.title}</div>
                          <div className="text-xs text-[#526056]">
                            A {idea.format.toLowerCase()} that helps {idea.audience} to {idea.result}.
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            onChangeState({
                              ...state,
                              ideas: state.ideas.filter((item) => item.id !== idea.id),
                            })
                          }
                          className="self-start sm:self-center text-xs font-medium text-[#526056] hover:text-[#9A3412] cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveSection('step-3')}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-[#183926] bg-[#C29B48] rounded hover:bg-[#AE8838] cursor-pointer"
                >
                  Next: Step 3 · Score &amp; Rank Ideas
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {activeSection === 'step-3' && (
            <div className="space-y-6">
              <ScoringSheet
                ideas={state.ideas}
                onChangeIdeas={(nextIdeas) => onChangeState({ ...state, ideas: nextIdeas })}
                onResetSamples={onResetSamples}
              />
              <PriceSanityCalculator />
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setActiveSection('step-4')}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-[#183926] bg-[#C29B48] rounded hover:bg-[#AE8838] cursor-pointer"
                >
                  Next: Step 4 · Talk to 10 People
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {activeSection === 'step-4' && (
            <div className="space-y-6">
              <div className="bg-[#EDE7D6] border border-[#C29B48]/50 p-4 text-xs sm:text-sm text-[#183926] leading-relaxed">
                <strong>Rule for Step 4 — No pitching yet:</strong> Ask about their current headache, what they have already tried, and what it costs them in time or money. Only listen in this step.
              </div>

              <div className="flex items-center justify-between gap-4 bg-[#F7F3E9] border border-[#183926]/15 p-4">
                <div>
                  <div className="text-xs font-medium text-[#526056]">Outreach Progress</div>
                  <div className="font-mono-tabular text-lg font-bold text-[#183926]">
                    {state.outreach.length} / 10 People Logged{' '}
                    <span className="text-sm font-normal text-[#526056]">
                      ({confirmedOutreachCount} confirmed pain)
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveSection('scripts')}
                  className="px-3.5 py-2 text-xs font-semibold text-[#F7F3E9] bg-[#183926] rounded hover:bg-[#122B1C] transition-colors cursor-pointer whitespace-nowrap"
                >
                  Open Swahili &amp; EN Scripts
                </button>
              </div>

              <form
                onSubmit={addOutreachContact}
                className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-[#F7F3E9] border border-[#183926]/15 p-4"
              >
                <div className="sm:col-span-3">
                  <label className="block text-xs font-medium text-[#526056] mb-1">
                    Person Name
                  </label>
                  <input
                    type="text"
                    required
                    value={outreachDraft.name}
                    onChange={(e) => setOutreachDraft((p) => ({ ...p, name: e.target.value }))}
                    placeholder="e.g., Halima T."
                    className="w-full px-3 py-2 text-xs bg-white border border-[#183926]/20 rounded focus:outline-none focus:border-[#183926]"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-xs font-medium text-[#526056] mb-1">
                    Channel
                  </label>
                  <select
                    value={outreachDraft.channel}
                    onChange={(e) => setOutreachDraft((p) => ({ ...p, channel: e.target.value }))}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#183926]/20 rounded focus:outline-none focus:border-[#183926]"
                  >
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Instagram DM">Instagram DM</option>
                    <option value="Threads Reply">Threads Reply</option>
                    <option value="Phone / In Person">Phone / In Person</option>
                  </select>
                </div>
                <div className="sm:col-span-4">
                  <label className="block text-xs font-medium text-[#526056] mb-1">
                    Their Exact Words / Quote
                  </label>
                  <input
                    type="text"
                    value={outreachDraft.exactQuote}
                    onChange={(e) => setOutreachDraft((p) => ({ ...p, exactQuote: e.target.value }))}
                    placeholder="What frustrated them most?"
                    className="w-full px-3 py-2 text-xs bg-white border border-[#183926]/20 rounded focus:outline-none focus:border-[#183926]"
                  />
                </div>
                <div className="sm:col-span-2 flex items-end">
                  <button
                    type="submit"
                    className="w-full py-2 px-3 text-xs font-bold text-[#183926] bg-[#C29B48] rounded hover:bg-[#AE8838] cursor-pointer"
                  >
                    Log Contact
                  </button>
                </div>
              </form>

              <div className="overflow-x-auto border border-[#183926]/20">
                <table className="w-full min-w-[640px] text-left border-collapse">
                  <thead>
                    <tr className="bg-[#183926] text-[#F7F3E9] text-xs font-semibold">
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Person &amp; Channel</th>
                      <th className="py-2.5 px-3">Problem Confirmed?</th>
                      <th className="py-2.5 px-3">Exact Quote</th>
                      <th className="py-2.5 px-3 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#C29B48]/25 text-xs sm:text-sm">
                    {state.outreach.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-[#526056]">
                          Log your first conversation above after sending Script 1 on WhatsApp.
                        </td>
                      </tr>
                    ) : (
                      state.outreach.map((contact, idx) => (
                        <tr
                          key={contact.id}
                          className={idx % 2 === 1 ? 'bg-[#EDE7D6]/40' : 'bg-white'}
                        >
                          <td className="py-3 px-3 font-mono-tabular text-[#526056]">
                            {idx + 1}
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-semibold text-[#183926]">{contact.name}</div>
                            <div className="text-xs text-[#526056]">{contact.channel}</div>
                          </td>
                          <td className="py-3 px-3">
                            <select
                              value={contact.problemConfirmed}
                              onChange={(e) =>
                                onChangeState({
                                  ...state,
                                  outreach: state.outreach.map((c) =>
                                    c.id === contact.id
                                      ? {
                                          ...c,
                                          problemConfirmed: e.target.value as
                                            | 'yes'
                                            | 'partial'
                                            | 'no'
                                            | 'pending',
                                        }
                                      : c
                                  ),
                                })
                              }
                              className="px-2.5 py-1 text-xs font-medium bg-[#F7F3E9] border border-[#183926]/20 rounded"
                            >
                              <option value="pending">Pending reply</option>
                              <option value="yes">Yes — strong pain</option>
                              <option value="partial">Partial — mild issue</option>
                              <option value="no">No — not urgent</option>
                            </select>
                          </td>
                          <td className="py-3 px-3">
                            <input
                              type="text"
                              value={contact.exactQuote}
                              placeholder="Type exact wording..."
                              onChange={(e) =>
                                onChangeState({
                                  ...state,
                                  outreach: state.outreach.map((c) =>
                                    c.id === contact.id
                                      ? { ...c, exactQuote: e.target.value }
                                      : c
                                  ),
                                })
                              }
                              className="w-full px-2 py-1 text-xs text-[#18291F] bg-transparent border border-transparent hover:border-[#C29B48]/50 focus:border-[#183926] rounded focus:outline-none"
                            />
                          </td>
                          <td className="py-3 px-2 text-right">
                            <button
                              type="button"
                              aria-label="Remove contact"
                              onClick={() =>
                                onChangeState({
                                  ...state,
                                  outreach: state.outreach.filter((c) => c.id !== contact.id),
                                })
                              }
                              className="text-[#526056] hover:text-[#9A3412] cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveSection('step-5')}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-[#183926] bg-[#C29B48] rounded hover:bg-[#AE8838] cursor-pointer"
                >
                  Next: Step 5 · The Pre-Sell Test
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {activeSection === 'step-5' && (
            <div className="space-y-6">
              <div className="bg-[#EDE7D6] border border-[#C29B48]/50 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-sm font-bold text-[#183926]">
                    Test real buyer intent before you build
                  </div>
                  <p className="text-xs sm:text-sm text-[#526056]">
                    Post your offer on WhatsApp Status, Instagram, or Threads. Track genuine “I would pay for this” replies and small early deposits.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveSection('presell')}
                  className="px-3.5 py-2 text-xs font-semibold text-[#F7F3E9] bg-[#183926] rounded hover:bg-[#122B1C] cursor-pointer whitespace-nowrap shrink-0"
                >
                  Copy Pre-Sell Templates
                </button>
              </div>

              <form
                onSubmit={addPreSellLog}
                className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-[#F7F3E9] border border-[#183926]/15 p-4"
              >
                <div className="sm:col-span-3">
                  <label className="block text-xs font-medium text-[#526056] mb-1">
                    Platform
                  </label>
                  <select
                    value={preSellDraft.platform}
                    onChange={(e) =>
                      setPreSellDraft((p) => ({
                        ...p,
                        platform: e.target.value as 'WhatsApp Status' | 'Instagram' | 'Threads',
                      }))
                    }
                    className="w-full px-3 py-2 text-xs bg-white border border-[#183926]/20 rounded"
                  >
                    <option value="WhatsApp Status">WhatsApp Status</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Threads">Threads</option>
                  </select>
                </div>
                <div className="sm:col-span-5">
                  <label className="block text-xs font-medium text-[#526056] mb-1">
                    What You Offered
                  </label>
                  <input
                    type="text"
                    required
                    value={preSellDraft.offerLine}
                    onChange={(e) => setPreSellDraft((p) => ({ ...p, offerLine: e.target.value }))}
                    placeholder={topRankedIdea?.title || 'e.g., Weekend Fit Guide Early Bird'}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#183926]/20 rounded"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-[#526056] mb-1">
                    Test Price
                  </label>
                  <input
                    type="text"
                    value={preSellDraft.priceTested}
                    onChange={(e) => setPreSellDraft((p) => ({ ...p, priceTested: e.target.value }))}
                    className="w-full px-3 py-2 text-xs font-mono-tabular bg-white border border-[#183926]/20 rounded"
                  />
                </div>
                <div className="sm:col-span-2 flex items-end">
                  <button
                    type="submit"
                    className="w-full py-2 px-3 text-xs font-bold text-[#183926] bg-[#C29B48] rounded hover:bg-[#AE8838] cursor-pointer"
                  >
                    Add Test
                  </button>
                </div>
              </form>

              <div className="space-y-3">
                {state.preSellLogs.length === 0 ? (
                  <p className="text-sm text-[#526056] py-8 text-center border border-dashed border-[#C29B48]/50">
                    No pre-sell posts logged yet. Grab a template and post your first 48-hour test.
                  </p>
                ) : (
                  state.preSellLogs.map((log) => (
                    <div
                      key={log.id}
                      className="border border-[#183926]/20 p-4 sm:p-5 space-y-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <div className="text-xs font-medium text-[#9A772F]">
                            {log.platform} · Price tested:{' '}
                            <span className="font-mono-tabular font-semibold text-[#183926]">
                              {log.priceTested}
                            </span>
                          </div>
                          <div className="text-sm font-bold text-[#183926] mt-0.5">
                            {log.offerLine}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            onChangeState({
                              ...state,
                              preSellLogs: state.preSellLogs.filter((l) => l.id !== log.id),
                            })
                          }
                          className="text-xs text-[#526056] hover:text-[#9A3412] cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="bg-[#F7F3E9] border border-[#183926]/15 p-3">
                          <label className="block text-xs text-[#526056] mb-1">
                            Total Replies / DMs
                          </label>
                          <input
                            type="number"
                            min={0}
                            value={log.repliesCount}
                            onChange={(e) =>
                              onChangeState({
                                ...state,
                                preSellLogs: state.preSellLogs.map((l) =>
                                  l.id === log.id
                                    ? { ...l, repliesCount: Math.max(0, Number(e.target.value)) }
                                    : l
                                ),
                              })
                            }
                            className="w-full font-mono-tabular text-lg font-bold text-[#183926] bg-white border border-[#183926]/20 rounded px-2.5 py-1"
                          />
                        </div>
                        <div className="bg-[#F7F3E9] border border-[#183926]/15 p-3">
                          <label className="block text-xs text-[#526056] mb-1">
                            Said “I Would Pay for This”
                          </label>
                          <input
                            type="number"
                            min={0}
                            value={log.wouldPayCount}
                            onChange={(e) =>
                              onChangeState({
                                ...state,
                                preSellLogs: state.preSellLogs.map((l) =>
                                  l.id === log.id
                                    ? { ...l, wouldPayCount: Math.max(0, Number(e.target.value)) }
                                    : l
                                ),
                              })
                            }
                            className="w-full font-mono-tabular text-lg font-bold text-[#183926] bg-white border border-[#183926]/20 rounded px-2.5 py-1"
                          />
                        </div>
                        <div className="bg-[#183926] border border-[#C29B48] p-3">
                          <label className="block text-xs text-[#C29B48] mb-1">
                            Paid Early Deposits
                          </label>
                          <input
                            type="number"
                            min={0}
                            value={log.depositsCount}
                            onChange={(e) =>
                              onChangeState({
                                ...state,
                                preSellLogs: state.preSellLogs.map((l) =>
                                  l.id === log.id
                                    ? { ...l, depositsCount: Math.max(0, Number(e.target.value)) }
                                    : l
                                ),
                              })
                            }
                            className="w-full font-mono-tabular text-lg font-bold text-[#183926] bg-[#F7F3E9] border border-[#C29B48] rounded px-2.5 py-1"
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <StatusSlideGenerator
                topic={state.scriptVariables.topic}
                audience={state.scriptVariables.audience}
                priceTsh={state.scriptVariables.priceTsh}
                priceUsd={state.scriptVariables.priceUsd}
                productTitle={topRankedIdea?.title || ''}
              />

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveSection('step-6')}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-[#183926] bg-[#C29B48] rounded hover:bg-[#AE8838] cursor-pointer"
                >
                  Next: Step 6 · Decision Time
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {activeSection === 'step-6' && (
            <div className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-[#183926]">
                  Evidence Checklist Before You Commit a Week
                </h3>
                <div className="divide-y divide-[#C29B48]/25 border border-[#183926]/20">
                  {DECISION_CRITERIA.map((crit) => {
                    const checked = Boolean(state.decision.checks[crit.id]);
                    return (
                      <label
                        key={crit.id}
                        className="flex items-start gap-3 p-4 cursor-pointer hover:bg-[#EDE7D6]/40 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) =>
                            onChangeState({
                              ...state,
                              decision: {
                                ...state.decision,
                                checks: {
                                  ...state.decision.checks,
                                  [crit.id]: e.target.checked,
                                },
                              },
                            })
                          }
                          className="mt-0.5 w-4 h-4 accent-[#183926] rounded cursor-pointer"
                        />
                        <span className="text-sm text-[#18291F] leading-snug">{crit.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-bold text-[#183926]">Your Final Call</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {(
                    [
                      {
                        id: 'build' as const,
                        title: 'BUILD (Passed)',
                        desc: 'Strong pain + real buyer commitment. Start the 7-day build plan below.',
                      },
                      {
                        id: 'fix' as const,
                        title: 'FIX (Needs Angle Shift)',
                        desc: 'Problem exists, but the audience or format was too broad. Narrow Step 2 and re-test.',
                      },
                      {
                        id: 'drop' as const,
                        title: 'DROP (Saved You Weeks)',
                        desc: 'Silence across Step 4 & 5. Archive this idea proudly and pick #2 from Step 3.',
                      },
                    ]
                  ).map((opt) => {
                    const selected = state.decision.verdict === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() =>
                          onChangeState({
                            ...state,
                            decision: { ...state.decision, verdict: opt.id },
                          })
                        }
                        className={`text-left p-4 border transition-colors cursor-pointer ${
                          selected
                            ? 'border-[#C29B48] bg-[#183926] text-[#F7F3E9]'
                            : 'border-[#183926]/20 bg-[#F7F3E9] text-[#18291F] hover:bg-[#EDE7D6]'
                        }`}
                      >
                        <div className={`text-sm font-bold ${selected ? 'text-[#C29B48]' : 'text-[#183926]'}`}>
                          {opt.title}
                        </div>
                        <p
                          className={`text-xs mt-1.5 leading-relaxed ${
                            selected ? 'text-[#EDE7D6]' : 'text-[#526056]'
                          }`}
                        >
                          {opt.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {state.decision.verdict === 'build' && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-[#183926]">
                      Simple 7-Day Build Plan
                    </h3>
                    <span className="font-mono-tabular text-xs text-[#526056]">
                      {state.decision.sevenDayPlan.filter((d) => d.done).length} / 7 days complete
                    </span>
                  </div>
                  <div className="divide-y divide-[#C29B48]/25 border border-[#183926]/20">
                    {state.decision.sevenDayPlan.map((dayItem) => (
                      <label
                        key={dayItem.day}
                        className="flex items-start gap-3 p-4 cursor-pointer hover:bg-[#EDE7D6]/40"
                      >
                        <input
                          type="checkbox"
                          checked={dayItem.done}
                          onChange={(e) =>
                            onChangeState({
                              ...state,
                              decision: {
                                ...state.decision,
                                sevenDayPlan: state.decision.sevenDayPlan.map((d) =>
                                  d.day === dayItem.day ? { ...d, done: e.target.checked } : d
                                ),
                              },
                            })
                          }
                          className="mt-1 w-4 h-4 accent-[#183926] rounded cursor-pointer"
                        />
                        <div className="space-y-0.5">
                          <div className="text-xs font-semibold text-[#9A772F]">
                            Day {dayItem.day} · {dayItem.focus}
                          </div>
                          <div
                            className={`text-sm ${
                              dayItem.done ? 'line-through text-[#526056]/60' : 'text-[#18291F]'
                            }`}
                          >
                            {dayItem.task}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-[#EDE7D6] border border-[#C29B48]/60 p-5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="text-xs font-semibold tracking-wider uppercase text-[#9A772F]">
                      Auto-Drafted From Your Steps 2–5 Evidence
                    </div>
                    <h3 className="font-display text-lg font-bold text-[#183926]">
                      Ready-to-Use Offer Summary (WhatsApp / Sales Bio)
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={copyOfferDraft}
                    className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#183926] bg-[#C29B48] rounded hover:bg-[#AE8838] cursor-pointer"
                  >
                    {copiedOffer ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy Offer Text
                      </>
                    )}
                  </button>
                </div>
                <pre className="whitespace-pre-wrap font-sans text-xs sm:text-sm text-[#18291F] bg-white border border-[#183926]/15 p-4 leading-relaxed">
                  {draftedOfferText}
                </pre>
              </div>
            </div>
          )}

          {activeSection === 'scripts' && (
            <div className="space-y-4">
              <div className="pb-4 border-b border-[#C29B48]/40">
                <div className="text-xs font-semibold tracking-wider uppercase text-[#9A772F]">
                  Kit Extra · Bilingual Copy-Paste Pack
                </div>
                <h2 className="font-display text-2xl font-bold text-[#183926] mt-1">
                  Conversation Script Pack (Swahili &amp; English)
                </h2>
                <p className="text-sm text-[#526056] mt-1">
                  5 natural WhatsApp and DM message templates for Step 4—designed to start honest conversations without pitching.
                </p>
              </div>
              <ScriptPackView
                mode="conversation"
                conversationScripts={paidData.conversationScripts}
                presellTemplates={paidData.presellTemplates}
                variables={state.scriptVariables}
                onChangeVariables={(next) =>
                  onChangeState({ ...state, scriptVariables: next })
                }
              />
            </div>
          )}

          {activeSection === 'presell' && (
            <div className="space-y-4">
              <div className="pb-4 border-b border-[#C29B48]/40">
                <div className="text-xs font-semibold tracking-wider uppercase text-[#9A772F]">
                  Kit Extra · Step 5 Templates
                </div>
                <h2 className="font-display text-2xl font-bold text-[#183926] mt-1">
                  Pre-Sell Message Templates
                </h2>
                <p className="text-sm text-[#526056] mt-1">
                  Copy-paste formats tailored for WhatsApp Status, Instagram, and Threads in English and Swahili.
                </p>
              </div>
              <ScriptPackView
                mode="presell"
                conversationScripts={paidData.conversationScripts}
                presellTemplates={paidData.presellTemplates}
                variables={state.scriptVariables}
                onChangeVariables={(next) =>
                  onChangeState({ ...state, scriptVariables: next })
                }
              />
              <StatusSlideGenerator
                topic={state.scriptVariables.topic}
                audience={state.scriptVariables.audience}
                priceTsh={state.scriptVariables.priceTsh}
                priceUsd={state.scriptVariables.priceUsd}
                productTitle={topRankedIdea?.title || ''}
              />
            </div>
          )}

          {activeSection === 'examples' && (
            <div className="space-y-4">
              <div className="pb-4 border-b border-[#C29B48]/40">
                <div className="text-xs font-semibold tracking-wider uppercase text-[#9A772F]">
                  Kit Extra · Real Case Walkthroughs
                </div>
                <h2 className="font-display text-2xl font-bold text-[#183926] mt-1">
                  3 Worked Examples Start to Finish
                </h2>
                <p className="text-sm text-[#526056] mt-1">
                  Follow how a Dar es Salaam Reels creator, a Canva media-kit creator, and a faceless 9-to-5 creator validated (or fixed) their digital product ideas before building.
                </p>
              </div>
              <WorkedExamplesView examples={paidData.workedExamples} />
            </div>
          )}

          {activeSection === 'red-flags' && (
            <div className="space-y-5">
              <div className="pb-4 border-b border-[#C29B48]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold tracking-wider uppercase text-[#9A3412]">
                    Kit Extra · Early Warning Audit
                  </div>
                  <h2 className="font-display text-2xl font-bold text-[#183926] mt-1">
                    10 Red Flags That an Idea May Not Sell
                  </h2>
                  <p className="text-sm text-[#526056] mt-1">
                    Tick any warning signs that apply to your current idea right now. Finding 3+ red flags early saves you weeks of wasted effort.
                  </p>
                </div>
                <div className="font-mono-tabular text-sm font-bold text-[#183926] bg-[#EDE7D6] border border-[#C29B48] px-3 py-2 shrink-0">
                  {redFlagCount} / 10 Flagged
                </div>
              </div>

              <div className="divide-y divide-[#C29B48]/25 border border-[#183926]/20">
                {paidData.redFlags.map((flag) => {
                  const flagged = Boolean(state.redFlagsChecked[flag.id]);
                  return (
                    <label
                      key={flag.id}
                      className={`flex items-start gap-3.5 p-4 cursor-pointer transition-colors ${
                        flagged ? 'bg-[#F5E8E4]' : 'hover:bg-[#EDE7D6]/40'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={flagged}
                        onChange={(e) =>
                          onChangeState({
                            ...state,
                            redFlagsChecked: {
                              ...state.redFlagsChecked,
                              [flag.id]: e.target.checked,
                            },
                          })
                        }
                        className="mt-1 w-4 h-4 accent-[#9A3412] rounded cursor-pointer"
                      />
                      <div className="space-y-1">
                        <div className="text-sm font-semibold text-[#183926]">
                          <span className="font-mono-tabular text-[#9A772F] mr-2">
                            {String(flag.number).padStart(2, '0')}
                          </span>
                          {flag.title}
                        </div>
                        <p className="text-xs sm:text-sm text-[#526056] leading-relaxed">
                          {flag.whyItMatters}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {activeSection === 'cover' && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-[#C29B48]/40">
                <div className="text-xs font-semibold tracking-wider uppercase text-[#9A772F]">
                  Kit Extra · Official Cover Artwork
                </div>
                <h2 className="font-display text-2xl font-bold text-[#183926] mt-1">
                  Biashara Base — Product Idea Validator Kit Cover
                </h2>
                <p className="text-sm text-[#526056] mt-1">
                  Preview the full-bleed forest green &amp; antique gold cover, toggle English or Kiswahili tagline, or export a crisp 1200×1697 PNG.
                </p>
              </div>

              <div className="bg-[#F7F3E9] border border-[#C29B48]/50 p-6 sm:p-10 flex justify-center">
                <ProductCoverCard showControls />
              </div>
            </div>
          )}

          {activeSection === 'next-steps' && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-[#C29B48]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold tracking-wider uppercase text-[#9A772F]">
                    Next Steps · Launch Plan &amp; Printable Guide
                  </div>
                  <h2 className="font-display text-2xl font-bold text-[#183926] mt-1">
                    Launch Plan &amp; Biashara Base Lineup
                  </h2>
                  <p className="text-sm text-[#526056] mt-1">
                    The 4-step rollout sequence and 25–35 page weekend guide structure.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#F7F3E9] bg-[#183926] rounded hover:bg-[#122B1C] cursor-pointer shrink-0 no-print"
                >
                  <Printer className="w-4 h-4 text-[#C29B48]" />
                  Print Full Workbook
                </button>
              </div>

              <div className="divide-y divide-[#C29B48]/40 border border-[#183926]/20 bg-[#F7F3E9]">
                {[
                  {
                    num: '1',
                    title: 'Build the free checklist first',
                    desc: 'One page. Use it right away to test interest and collect leads.',
                  },
                  {
                    num: '2',
                    title: 'Build the full kit',
                    desc: 'Guide, scoring sheet, script pack, pre-sell templates, examples, red flags list.',
                  },
                  {
                    num: '3',
                    title: 'Post the first reel',
                    desc: 'Hook: "Don\'t build your digital product until you do this one thing." End card points to biasharabase.com.',
                  },
                  {
                    num: '4',
                    title: 'Link it into your lineup',
                    desc: 'Add a next-step page pointing buyers to the Biashara Base Blueprint and your other products.',
                  },
                ].map((step) => (
                  <div key={step.num} className="p-5 flex items-start gap-4">
                    <span className="font-display text-2xl font-bold text-[#C29B48] shrink-0 leading-none">
                      {step.num}
                    </span>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-[#183926]">
                        {step.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#526056] mt-1">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border border-[#183926]/20 divide-y divide-[#C29B48]/25">
                {paidData.guideSteps.map((step) => (
                  <div
                    key={step.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <div className="text-xs font-mono-tabular text-[#9A772F]">
                        Step {step.number} · {step.pageRange} · {step.timeEstimate}
                      </div>
                      <div className="text-sm font-bold text-[#183926] mt-0.5">{step.title}</div>
                      <div className="text-xs text-[#526056] mt-0.5">{step.buyerAction}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveSection(step.id)}
                      className="self-start sm:self-center text-xs font-semibold text-[#183926] underline decoration-[#C29B48] underline-offset-4 hover:text-[#9A772F] cursor-pointer shrink-0"
                    >
                      Open Step {step.number}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

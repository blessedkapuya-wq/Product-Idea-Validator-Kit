import { ArrowUpDown, Download, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { IdeaScores, ProductIdea } from '../types';

interface ScoringSheetProps {
  ideas: ProductIdea[];
  onChangeIdeas: (ideas: ProductIdea[]) => void;
  onResetSamples: () => void;
}

const SCORE_COLUMNS: {
  key: keyof IdeaScores;
  label: string;
  shortHint: string;
}[] = [
  { key: 'demand', label: 'Demand', shortHint: '1 = rare wish, 5 = urgent weekly pain' },
  { key: 'helpfulness', label: 'How Much You Help', shortHint: '1 = shallow tip, 5 = clear fix' },
  { key: 'easeToBuild', label: 'Ease to Build', shortHint: '5 = weekend build, 1 = weeks of work' },
  { key: 'pricePotential', label: 'Price Potential', shortHint: '1 = hard to charge, 5 = fair paid value' },
  { key: 'reachBuyers', label: 'Reach Buyers', shortHint: '1 = strangers only, 5 = direct WhatsApp/IG access' },
];

export function calculateIdeaTotal(scores: IdeaScores): number {
  return (
    scores.demand +
    scores.helpfulness +
    scores.easeToBuild +
    scores.pricePotential +
    scores.reachBuyers
  );
}

export function ScoringSheet({ ideas, onChangeIdeas, onResetSamples }: ScoringSheetProps) {
  const [sortByRank, setSortByRank] = useState(true);

  const rankedIdeas = useMemo(() => {
    const withTotals = ideas.map((idea, index) => ({
      idea,
      index,
      total: calculateIdeaTotal(idea.scores),
    }));

    const sortedTotals = [...withTotals].sort((a, b) => b.total - a.total);
    const rankMap = new Map<string, number>();
    sortedTotals.forEach((item, idx) => {
      if (idx > 0 && item.total === sortedTotals[idx - 1].total) {
        rankMap.set(item.idea.id, rankMap.get(sortedTotals[idx - 1].idea.id) ?? idx + 1);
      } else {
        rankMap.set(item.idea.id, idx + 1);
      }
    });

    const enriched = withTotals.map((item) => ({
      ...item,
      rank: rankMap.get(item.idea.id) ?? 1,
    }));

    if (sortByRank) {
      return [...enriched].sort((a, b) => b.total - a.total || a.index - b.index);
    }
    return enriched;
  }, [ideas, sortByRank]);

  const updateScore = (id: string, field: keyof IdeaScores, value: number) => {
    const clamped = Math.max(1, Math.min(5, value));
    onChangeIdeas(
      ideas.map((idea) =>
        idea.id === id ? { ...idea, scores: { ...idea.scores, [field]: clamped } } : idea
      )
    );
  };

  const updateTitle = (id: string, title: string) => {
    onChangeIdeas(ideas.map((idea) => (idea.id === id ? { ...idea, title } : idea)));
  };

  const updateNotes = (id: string, notes: string) => {
    onChangeIdeas(ideas.map((idea) => (idea.id === id ? { ...idea, notes } : idea)));
  };

  const addIdeaRow = () => {
    if (ideas.length >= 10) return;
    const newId = `idea-${Date.now()}`;
    const newIdea: ProductIdea = {
      id: newId,
      format: 'PDF Guide',
      audience: 'target buyers',
      result: 'solve a specific problem faster',
      title: `New Product Idea ${ideas.length + 1}`,
      scores: {
        demand: 3,
        helpfulness: 3,
        easeToBuild: 3,
        pricePotential: 3,
        reachBuyers: 3,
      },
      notes: '',
    };
    onChangeIdeas([...ideas, newIdea]);
  };

  const deleteIdeaRow = (id: string) => {
    onChangeIdeas(ideas.filter((idea) => idea.id !== id));
  };

  const downloadSpreadsheetCsv = () => {
    const header = [
      'Rank Formula',
      'Product Idea',
      'Format',
      'Target Audience',
      'Demand (1-5)',
      'How Much You Help (1-5)',
      'Ease to Build (5=Fast)',
      'Price Potential (1-5)',
      'Reach Buyers (1-5)',
      'Total Score (/25)',
      'Notes',
    ];

    const lastRow = Math.max(2, ideas.length + 1);
    const rows = ideas.map((idea, idx) => {
      const rowNum = idx + 2;
      const escapeCsv = (val: string) => `"${(val || '').replace(/"/g, '""')}"`;
      return [
        `=RANK(J${rowNum},$J$2:$J$${lastRow})`,
        escapeCsv(idea.title),
        escapeCsv(idea.format),
        escapeCsv(idea.audience),
        idea.scores.demand,
        idea.scores.helpfulness,
        idea.scores.easeToBuild,
        idea.scores.pricePotential,
        idea.scores.reachBuyers,
        `=SUM(E${rowNum}:I${rowNum})`,
        escapeCsv(idea.notes),
      ].join(',');
    });

    const csvContent = [header.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'biashara-base-idea-scoring-sheet.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getStatusDisplay = (total: number) => {
    if (total >= 20) {
      return {
        label: 'Top Candidate',
        className: 'text-[#183926] bg-[#EDE7D6] border-[#C29B48]',
      };
    }
    if (total >= 15) {
      return {
        label: 'Refine & Check',
        className: 'text-[#9A772F] bg-[#F7F3E9] border-[#C29B48]/50',
      };
    }
    return {
      label: 'Weak / Skip',
      className: 'text-[#9A3412] bg-[#F5E8E4] border-[#9A3412]/30',
    };
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#C29B48]/35">
        <div className="text-xs text-[#526056]">
          Score each criterion from <span className="font-mono-tabular font-semibold text-[#183926]">1</span> to{' '}
          <span className="font-mono-tabular font-semibold text-[#183926]">5</span>. Max score is{' '}
          <span className="font-mono-tabular font-semibold text-[#183926]">25</span>. Ranks update automatically.
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSortByRank((prev) => !prev)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#183926] bg-[#F7F3E9] border border-[#183926]/20 rounded hover:bg-[#EDE7D6] transition-colors cursor-pointer whitespace-nowrap"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            {sortByRank ? 'Sorted: Highest Rank' : 'Sorted: Entry Order'}
          </button>
          <button
            type="button"
            onClick={addIdeaRow}
            disabled={ideas.length >= 10}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#183926] bg-[#C29B48] rounded hover:bg-[#AE8838] disabled:opacity-45 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Idea ({ideas.length}/10)
          </button>
          <button
            type="button"
            onClick={downloadSpreadsheetCsv}
            disabled={ideas.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#F7F3E9] bg-[#183926] rounded hover:bg-[#122B1C] disabled:opacity-45 transition-colors cursor-pointer whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            Export Excel / Sheets (.csv)
          </button>
          <button
            type="button"
            onClick={onResetSamples}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[#526056] hover:text-[#183926] transition-colors cursor-pointer whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Load Samples
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 text-xs bg-[#EDE7D6]/70 border border-[#C29B48]/40 p-3">
        {SCORE_COLUMNS.map((col) => (
          <div key={col.key}>
            <div className="font-bold text-[#183926]">{col.label}</div>
            <div className="text-[#526056] mt-0.5">{col.shortHint}</div>
          </div>
        ))}
      </div>

      {ideas.length === 0 ? (
        <div className="py-12 px-6 text-center border border-dashed border-[#C29B48]/60 bg-[#F7F3E9]">
          <p className="text-sm font-bold text-[#183926]">No ideas in your scoring sheet yet</p>
          <p className="text-xs text-[#526056] mt-1 max-w-md mx-auto">
            Add ideas from Step 2 (Idea Generator) or create a blank row below to start ranking them objectively.
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={addIdeaRow}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#183926] bg-[#C29B48] rounded hover:bg-[#AE8838] cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add First Idea
            </button>
            <button
              type="button"
              onClick={onResetSamples}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-[#183926] bg-white border border-[#183926]/20 rounded hover:bg-[#EDE7D6] cursor-pointer"
            >
              Load Worked Samples
            </button>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto border border-[#183926]/20 bg-white">
          <table className="w-full min-w-[820px] border-collapse text-left">
            <thead>
              <tr className="bg-[#183926] text-[#F7F3E9] text-xs font-semibold">
                <th className="py-3 px-3 w-14">Rank</th>
                <th className="py-3 px-3 min-w-[230px]">Product Idea &amp; Quick Note</th>
                <th className="py-3 px-2 text-center w-20">Demand</th>
                <th className="py-3 px-2 text-center w-20">Help</th>
                <th className="py-3 px-2 text-center w-20">Ease</th>
                <th className="py-3 px-2 text-center w-20">Price</th>
                <th className="py-3 px-2 text-center w-20">Reach</th>
                <th className="py-3 px-3 text-right w-24">Total</th>
                <th className="py-3 px-3 w-36">Signal</th>
                <th className="py-3 px-2 w-10">
                  <span className="sr-only">Delete</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#C29B48]/25 text-sm">
              {rankedIdeas.map(({ idea, total, rank }, idx) => {
                const status = getStatusDisplay(total);
                return (
                  <tr
                    key={idea.id}
                    className={`${idx % 2 === 1 ? 'bg-[#EDE7D6]/45' : 'bg-white'} hover:bg-[#EDE7D6]/80 transition-colors align-top`}
                  >
                    <td className="py-3 px-3">
                      <span className="font-mono-tabular text-sm font-bold text-[#183926]">
                        #{rank}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 space-y-1.5">
                      <input
                        type="text"
                        aria-label="Product idea title"
                        value={idea.title}
                        onChange={(e) => updateTitle(idea.id, e.target.value)}
                        className="w-full px-2 py-1 text-sm font-semibold text-[#18291F] bg-transparent border border-transparent hover:border-[#C29B48]/50 focus:border-[#183926] focus:bg-white rounded focus:outline-none"
                      />
                      <input
                        type="text"
                        aria-label="Idea note"
                        value={idea.notes}
                        placeholder="Add brief note on format or audience..."
                        onChange={(e) => updateNotes(idea.id, e.target.value)}
                        className="w-full px-2 py-0.5 text-xs text-[#526056] bg-transparent border border-transparent hover:border-[#C29B48]/50 focus:border-[#183926] focus:bg-white rounded focus:outline-none"
                      />
                    </td>

                    {SCORE_COLUMNS.map((col) => (
                      <td key={col.key} className="py-2.5 px-2 text-center">
                        <select
                          aria-label={`${idea.title} ${col.label} score`}
                          value={idea.scores[col.key]}
                          onChange={(e) => updateScore(idea.id, col.key, Number(e.target.value))}
                          className="font-mono-tabular text-sm font-medium text-[#18291F] bg-[#F7F3E9] border border-[#183926]/20 rounded px-2 py-1.5 focus:outline-none focus:border-[#183926] cursor-pointer"
                        >
                          {[1, 2, 3, 4, 5].map((num) => (
                            <option key={num} value={num}>
                              {num}
                            </option>
                          ))}
                        </select>
                      </td>
                    ))}

                    <td className="py-3 px-3 text-right">
                      <span className="font-mono-tabular text-base font-bold text-[#183926]">
                        {total}
                      </span>
                      <span className="font-mono-tabular text-xs text-[#526056]"> /25</span>
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 text-xs font-semibold rounded border whitespace-nowrap ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </td>

                    <td className="py-2.5 px-2 text-right">
                      <button
                        type="button"
                        aria-label={`Remove ${idea.title}`}
                        onClick={() => deleteIdeaRow(idea.id)}
                        className="p-1.5 text-[#526056] hover:text-[#9A3412] rounded transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-[#526056]">
        Honest reminder: Scoring 20+ out of 25 only chooses your best test candidate. Real confirmation comes in Step 4 (10 conversations) and Step 5 (Pre-Sell Test).
      </p>
    </div>
  );
}

import type { WorkspaceState } from '../src/paid/types';
import {
  CONVERSATION_SCRIPTS,
  DEFAULT_WORKSPACE_STATE,
  GUIDE_STEPS,
  PRESELL_TEMPLATES,
  RED_FLAGS,
  SELLABILITY_CHECKLIST_QUESTIONS,
  WORKED_EXAMPLES,
} from './paidData';
import { createZipBuffer } from './zipBuilder';

function buildScoringCsv(state: WorkspaceState): string {
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

  const lastRow = Math.max(2, state.ideas.length + 1);
  const rows = state.ideas.map((idea, idx) => {
    const rowNum = idx + 2;
    const esc = (v: string) => `"${(v || '').replace(/"/g, '""')}"`;
    return [
      `=RANK(J${rowNum},$J$2:$J$${lastRow})`,
      esc(idea.title),
      esc(idea.format),
      esc(idea.audience),
      idea.scores.demand,
      idea.scores.helpfulness,
      idea.scores.easeToBuild,
      idea.scores.pricePotential,
      idea.scores.reachBuyers,
      `=SUM(E${rowNum}:I${rowNum})`,
      esc(idea.notes),
    ].join(',');
  });

  return [header.join(','), ...rows].join('\n');
}

function buildScriptsMarkdown(state: WorkspaceState): string {
  const fill = (text: string) =>
    text
      .replaceAll('{{topic}}', state.scriptVariables.topic || '[your topic]')
      .replaceAll('{{audience}}', state.scriptVariables.audience || '[your audience]')
      .replaceAll('{{priceTsh}}', state.scriptVariables.priceTsh || 'TSh 15,000')
      .replaceAll('{{priceUsd}}', state.scriptVariables.priceUsd || '$7');

  const lines: string[] = [
    'BIASHARA BASE — CONVERSATION & PRE-SELL SCRIPT PACK (ENGLISH & KISWAHILI)',
    '=========================================================================',
    '',
    'PART A: 5 CONVERSATION SCRIPTS (STEP 4 — NO PITCHING YET)',
    '',
  ];

  for (const s of CONVERSATION_SCRIPTS) {
    lines.push(`0${s.number}. ${s.title}`);
    lines.push(`When to use: ${s.whenToUse}`);
    lines.push(`Goal: ${s.goal}`);
    lines.push('');
    lines.push('[ENGLISH]');
    lines.push(fill(s.english));
    lines.push('');
    lines.push('[KISWAHILI]');
    lines.push(fill(s.swahili));
    lines.push('\n-------------------------------------------------------------------------\n');
  }

  lines.push('PART B: PRE-SELL MESSAGE TEMPLATES (STEP 5 — WHATSAPP STATUS, IG, THREADS)\n');
  for (const p of PRESELL_TEMPLATES) {
    lines.push(`PLATFORM: ${p.platform}`);
    lines.push(`Notes: ${p.formatNote}`);
    lines.push('');
    lines.push('[ENGLISH]');
    lines.push(fill(p.english));
    lines.push('');
    lines.push('[KISWAHILI]');
    lines.push(fill(p.swahili));
    lines.push('\n-------------------------------------------------------------------------\n');
  }

  return lines.join('\n');
}

function buildWorkedExamplesAndRedFlags(): string {
  const lines: string[] = [
    'BIASHARA BASE — WORKED EXAMPLES & 10 RED FLAGS CHECKLIST',
    '========================================================',
    '',
    'PART A: 3 WORKED EXAMPLES START TO FINISH',
    '',
  ];

  WORKED_EXAMPLES.forEach((ex, i) => {
    lines.push(`${i + 1}. ${ex.productTitle} (${ex.regionTag})`);
    lines.push(`Creator: ${ex.creatorRole} | Format: ${ex.format} | Price: ${ex.targetPrice}`);
    lines.push(`Step 1 (Skill): ${ex.step1Skill}`);
    lines.push(`Step 2 (Formula): ${ex.step2Formula}`);
    lines.push(`Step 3 (Score): ${ex.step3Scores.total}/25 (Beat: ${ex.step3Scores.runnerUpTitle})`);
    lines.push(`Step 4 (10 People): ${ex.step4Conversations}`);
    lines.push(`Step 5 (Pre-Sell): ${ex.step5PreSell}`);
    lines.push(`Step 6 (${ex.step6Decision}): ${ex.step6Summary}`);
    lines.push('\n--------------------------------------------------------\n');
  });

  lines.push('PART B: 10 RED FLAGS THAT AN IDEA MAY NOT SELL\n');
  RED_FLAGS.forEach((rf) => {
    lines.push(`[ ] ${rf.number}. ${rf.title}`);
    lines.push(`    Why it matters: ${rf.whyItMatters}\n`);
  });

  return lines.join('\n');
}

export function buildGuideHtml(state: WorkspaceState): string {
  const esc = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Biashara Base — Product Idea Validator Kit Guide</title>
<style>
  body { font-family: Georgia, serif; background: #F7F3E9; color: #18291F; max-width: 780px; margin: 40px auto; padding: 24px; line-height: 1.6; }
  h1, h2, h3 { color: #183926; }
  .cover { background: #183926; color: #F7F3E9; padding: 32px; border: 1px solid #C29B48; margin-bottom: 32px; }
  .cover-inner { border: 1px solid #C29B48; padding: 36px 28px; }
  .cover h1 { color: #FFFFFF; margin: 16px 0; font-size: 34px; line-height: 1.1; }
  .rule { width: 64px; height: 3px; background: #C29B48; margin: 18px 0; }
  .gold { color: #C29B48; font-family: sans-serif; font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; font-weight: 700; }
  .step { background: #FFFFFF; border: 1px solid #C29B48; padding: 20px; margin-bottom: 16px; }
  .note { background: #EDE7D6; padding: 14px 18px; border: 1px solid #C29B48; margin: 20px 0; font-family: sans-serif; font-size: 14px; }
  ul { font-family: sans-serif; font-size: 14px; }
</style>
</head>
<body>
  <div class="cover">
    <div class="cover-inner">
      <div class="gold">BIASHARA BASE</div>
      <h1>Product Idea<br/>Validator Kit</h1>
      <div class="rule"></div>
      <p><em>Know if your idea will sell before you spend a single week building it.</em></p>
      <div style="margin-top:36px;">
        <div class="gold">6-STEP DIGITAL KIT · SWAHILI &amp; ENGLISH</div>
        <div style="font-family:sans-serif;font-size:12px;color:#FFFFFF;margin-top:4px;">biasharabase.com</div>
      </div>
    </div>
  </div>

  <div class="note">
    <strong>Keep it honest:</strong> This kit helps you test an idea cheaply before spending weeks building. A good score improves your odds, but never guarantees sales or income.
  </div>

  <h2>The 6 Steps Inside the Guide</h2>
  ${GUIDE_STEPS.map(
    (s) => `
    <div class="step">
      <div class="gold">Step ${s.number} · ${esc(s.pageRange)} · ${esc(s.timeEstimate)}</div>
      <h3>${esc(s.title)}</h3>
      <p>${esc(s.summary)}</p>
      <p><strong>What to do:</strong> ${esc(s.buyerAction)}</p>
    </div>`
  ).join('')}

  <h2>Your Saved Skill Inventory</h2>
  <ul>
    ${[...state.skillInventory.whatIKnow, ...state.skillInventory.askedForHelp, ...state.skillInventory.problemsSolved]
      .map((item) => `<li>${esc(item)}</li>`)
      .join('') || '<li>Fill in Step 1 inside your interactive workspace.</li>'}
  </ul>

  <h2>7-Day Build Plan (Once Your Idea Passes Step 6)</h2>
  <ul>
    ${state.decision.sevenDayPlan
      .map((d) => `<li><strong>Day ${d.day} (${esc(d.focus)}):</strong> ${esc(d.task)}</li>`)
      .join('')}
  </ul>
</body>
</html>`;
}

function buildLeadMagnetHtml(): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Is My Idea Sellable? — 1-Page Checklist</title>
<style>
  body { font-family: sans-serif; background: #F7F3E9; color: #18291F; max-width: 720px; margin: 32px auto; padding: 24px; line-height: 1.5; }
  h1 { font-family: Georgia, serif; color: #183926; }
  .q { background: #FFFFFF; border: 1px solid #C29B48; padding: 14px 16px; margin-bottom: 10px; }
  .footer { background: #183926; color: #F7F3E9; padding: 18px; margin-top: 20px; }
</style>
</head>
<body>
  <p style="color:#9A772F;font-weight:700;font-size:12px;">BIASHARA BASE · FREE 3-MINUTE CHECKLIST</p>
  <h1>Is My Idea Sellable?</h1>
  <p>Answer these 8 yes/no questions honestly before spending a single week building your digital product.</p>
  ${SELLABILITY_CHECKLIST_QUESTIONS.map(
    (q) => `
    <div class="q">
      <strong>[ YES / NO ] ${q.number}. ${q.question}</strong>
      <div style="font-size:13px;color:#526056;margin-top:4px;">${q.helper}</div>
    </div>`
  ).join('')}
  <div class="footer">
    <strong>Your Score: ____ / 8</strong><br/>
    Scored 5 or higher? You have a solid candidate to test in the real world with the full Product Idea Validator Kit (biasharabase.com). Remember: a good score does not guarantee sales.
  </div>
</body>
</html>`;
}

function buildOfferDraftText(state: WorkspaceState): string {
  const topIdea = [...state.ideas].sort(
    (a, b) =>
      b.scores.demand +
      b.scores.helpfulness +
      b.scores.easeToBuild +
      b.scores.pricePotential +
      b.scores.reachBuyers -
      (a.scores.demand +
        a.scores.helpfulness +
        a.scores.easeToBuild +
        a.scores.pricePotential +
        a.scores.reachBuyers)
  )[0];

  const quotes = state.outreach.map((o) => o.exactQuote.trim()).filter(Boolean);

  return [
    'BIASHARA BASE — MY VALIDATED OFFER DRAFT',
    '=========================================',
    '',
    `Top Product Candidate: ${topIdea?.title || 'Not yet scored'}`,
    `Format: ${topIdea?.format || 'PDF Guide + Templates'}`,
    `Audience: ${topIdea?.audience || state.scriptVariables.audience || '[Audience]'}`,
    `Result: ${topIdea?.result || state.scriptVariables.topic || '[Result]'}`,
    `Test Price: ${state.scriptVariables.priceTsh || 'TSh 15,000'} (${state.scriptVariables.priceUsd || '$7'})`,
    `Final Decision: ${(state.decision.verdict || 'PENDING').toUpperCase()}`,
    '',
    'REAL BUYER QUOTES COLLECTED IN STEP 4:',
    ...(quotes.length > 0 ? quotes.map((q) => `- "${q}"`) : ['- No quotes logged yet.']),
    '',
    'PRE-SELL TEST RESULTS (STEP 5):',
    ...(state.preSellLogs.length > 0
      ? state.preSellLogs.map(
          (l) =>
            `- ${l.platform}: ${l.repliesCount} replies, ${l.wouldPayCount} would pay, ${l.depositsCount} deposits (${l.priceTested})`
        )
      : ['- No pre-sell posts logged yet.']),
  ].join('\n');
}

export function sanitizeWorkspaceState(input: unknown): WorkspaceState {
  if (!input || typeof input !== 'object') {
    return DEFAULT_WORKSPACE_STATE;
  }
  const raw = input as Partial<WorkspaceState>;
  return {
    skillInventory: {
      whatIKnow: Array.isArray(raw.skillInventory?.whatIKnow)
        ? raw.skillInventory.whatIKnow.map(String).slice(0, 50)
        : DEFAULT_WORKSPACE_STATE.skillInventory.whatIKnow,
      askedForHelp: Array.isArray(raw.skillInventory?.askedForHelp)
        ? raw.skillInventory.askedForHelp.map(String).slice(0, 50)
        : DEFAULT_WORKSPACE_STATE.skillInventory.askedForHelp,
      problemsSolved: Array.isArray(raw.skillInventory?.problemsSolved)
        ? raw.skillInventory.problemsSolved.map(String).slice(0, 50)
        : DEFAULT_WORKSPACE_STATE.skillInventory.problemsSolved,
    },
    ideas: Array.isArray(raw.ideas)
      ? raw.ideas.slice(0, 15)
      : DEFAULT_WORKSPACE_STATE.ideas,
    outreach: Array.isArray(raw.outreach)
      ? raw.outreach.slice(0, 50)
      : DEFAULT_WORKSPACE_STATE.outreach,
    preSellLogs: Array.isArray(raw.preSellLogs)
      ? raw.preSellLogs.slice(0, 50)
      : DEFAULT_WORKSPACE_STATE.preSellLogs,
    redFlagsChecked:
      raw.redFlagsChecked && typeof raw.redFlagsChecked === 'object'
        ? raw.redFlagsChecked
        : DEFAULT_WORKSPACE_STATE.redFlagsChecked,
    decision: {
      checks:
        raw.decision?.checks && typeof raw.decision.checks === 'object'
          ? raw.decision.checks
          : DEFAULT_WORKSPACE_STATE.decision.checks,
      verdict:
        raw.decision?.verdict === 'build' ||
        raw.decision?.verdict === 'fix' ||
        raw.decision?.verdict === 'drop' ||
        raw.decision?.verdict === null
          ? raw.decision.verdict
          : DEFAULT_WORKSPACE_STATE.decision.verdict,
      chosenIdeaTitle:
        typeof raw.decision?.chosenIdeaTitle === 'string'
          ? raw.decision.chosenIdeaTitle.slice(0, 200)
          : DEFAULT_WORKSPACE_STATE.decision.chosenIdeaTitle,
      sevenDayPlan: Array.isArray(raw.decision?.sevenDayPlan)
        ? raw.decision.sevenDayPlan.slice(0, 14)
        : DEFAULT_WORKSPACE_STATE.decision.sevenDayPlan,
    },
    scriptVariables: {
      topic:
        typeof raw.scriptVariables?.topic === 'string'
          ? raw.scriptVariables.topic.slice(0, 200)
          : DEFAULT_WORKSPACE_STATE.scriptVariables.topic,
      audience:
        typeof raw.scriptVariables?.audience === 'string'
          ? raw.scriptVariables.audience.slice(0, 200)
          : DEFAULT_WORKSPACE_STATE.scriptVariables.audience,
      priceTsh:
        typeof raw.scriptVariables?.priceTsh === 'string'
          ? raw.scriptVariables.priceTsh.slice(0, 40)
          : DEFAULT_WORKSPACE_STATE.scriptVariables.priceTsh,
      priceUsd:
        typeof raw.scriptVariables?.priceUsd === 'string'
          ? raw.scriptVariables.priceUsd.slice(0, 40)
          : DEFAULT_WORKSPACE_STATE.scriptVariables.priceUsd,
    },
  };
}

export function generateCustomerKitZipBuffer(stateInput?: unknown): Buffer {
  const state = sanitizeWorkspaceState(stateInput);
  return createZipBuffer([
    { filename: '01-Product-Idea-Validator-Guide.html', content: buildGuideHtml(state) },
    { filename: '02-Idea-Scoring-Sheet.csv', content: buildScoringCsv(state) },
    { filename: '03-Swahili-English-Scripts.txt', content: buildScriptsMarkdown(state) },
    { filename: '04-Is-My-Idea-Sellable-Checklist.html', content: buildLeadMagnetHtml() },
    { filename: '05-Worked-Examples-And-Red-Flags.txt', content: buildWorkedExamplesAndRedFlags() },
    { filename: '06-My-Validated-Offer-Draft.txt', content: buildOfferDraftText(state) },
  ]);
}

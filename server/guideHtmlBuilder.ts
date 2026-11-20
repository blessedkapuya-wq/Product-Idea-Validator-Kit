import type { WorkspaceState } from '../src/paid/types';
import {
  CONVERSATION_SCRIPTS,
  GUIDE_STEPS,
  PRESELL_TEMPLATES,
  RED_FLAGS,
  WORKED_EXAMPLES,
} from './paidData';

function esc(value: string | number | undefined | null): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function fillScriptVars(text: string, state: WorkspaceState): string {
  return text
    .replaceAll('{{topic}}', state.scriptVariables.topic || '[your topic]')
    .replaceAll('{{audience}}', state.scriptVariables.audience || '[your target buyer]')
    .replaceAll('{{priceTsh}}', state.scriptVariables.priceTsh || 'TSh 15,000')
    .replaceAll('{{priceUsd}}', state.scriptVariables.priceUsd || '$7');
}

function wrapPage(pageNum: number, totalPages: number, sectionLabel: string, innerHtml: string): string {
  return `
  <section class="page" id="page-${pageNum}">
    <header class="running-header">
      <span>BIASHARA BASE · PRODUCT IDEA VALIDATOR KIT</span>
      <span>${esc(sectionLabel)}</span>
    </header>
    <div class="page-body">
      ${innerHtml}
    </div>
    <footer class="running-footer">
      <span>biasharabase.com</span>
      <span>Page ${pageNum} of ${totalPages}</span>
    </footer>
  </section>`;
}

export function build25PageGuideHtml(state: WorkspaceState): string {
  const totalPages = 25;

  const sortedIdeas = [...state.ideas].sort((a, b) => {
    const sumA =
      a.scores.demand +
      a.scores.helpfulness +
      a.scores.easeToBuild +
      a.scores.pricePotential +
      a.scores.reachBuyers;
    const sumB =
      b.scores.demand +
      b.scores.helpfulness +
      b.scores.easeToBuild +
      b.scores.pricePotential +
      b.scores.reachBuyers;
    return sumB - sumA;
  });

  const topIdea = sortedIdeas[0];
  const quotes = state.outreach.map((o) => o.exactQuote.trim()).filter(Boolean);

  const page1Cover = `
  <section class="page cover-page" id="page-1">
    <div class="cover-circle-tr"></div>
    <div class="cover-circle-bl"></div>
    <div class="cover-frame">
      <div class="cover-kicker">BIASHARA BASE</div>
      <div class="cover-main">
        <h1>Product Idea<br/>Validator Kit</h1>
        <div class="cover-rule"></div>
        <p class="cover-subtitle">Know if your idea will sell before you spend a single week building it.</p>
      </div>
      <div class="cover-bottom">
        <div class="cover-tag">25-PAGE STEP-BY-STEP GUIDE · SWAHILI &amp; ENGLISH</div>
        <div class="cover-domain">biasharabase.com</div>
      </div>
    </div>
  </section>`;

  const page2 = wrapPage(
    2,
    totalPages,
    'WELCOME & WEEKEND MAP',
    `
    <div class="kicker">START HERE</div>
    <h2>How to finish this kit in one weekend (on your phone)</h2>
    <p>You do not need another 30-day course, expensive laptop software, or a big audience before testing your first digital product. This 25-page step-by-step workbook is designed so you can go from guessing to real evidence in 48–72 hours.</p>

    <div class="callout-sand">
      <strong>Keep it honest:</strong> This kit must never promise sales or guaranteed income. It helps you test an idea cheaply before spending weeks building. A strong test score improves your odds—it never guarantees sales.
    </div>

    <h3>Your Weekend Schedule</h3>
    <table>
      <thead>
        <tr>
          <th>Day</th>
          <th>Steps Covered</th>
          <th>Time Needed</th>
          <th>Goal by Nightfall</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Friday Evening</strong></td>
          <td>Steps 1, 2 &amp; 3 (Pages 3–11)</td>
          <td>60–80 mins</td>
          <td>List your skills, write 10 ideas, score them, pick your top #1 &amp; #2.</td>
        </tr>
        <tr>
          <td><strong>Saturday</strong></td>
          <td>Step 4 (Pages 12–15)</td>
          <td>45 mins + replies</td>
          <td>Message 10 real people using the Swahili/English scripts—listen only.</td>
        </tr>
        <tr>
          <td><strong>Sunday</strong></td>
          <td>Step 5 &amp; Step 6 (Pages 16–25)</td>
          <td>45 mins + 48h test</td>
          <td>Run a simple pre-sell test, audit 10 Red Flags, and make a Build / Fix / Drop call.</td>
        </tr>
      </tbody>
    </table>

    <h3>Inside This 25-Page Guide</h3>
    <div class="two-col-list">
      <div><strong>Pages 3–5:</strong> Step 1 · Your Skill Inventory &amp; 12 Prompts</div>
      <div><strong>Pages 6–8:</strong> Step 2 · Idea Generator &amp; Angle Sharpening</div>
      <div><strong>Pages 9–11:</strong> Step 3 · 5-Signal Scoring Sheet &amp; Price Sanity</div>
      <div><strong>Pages 12–15:</strong> Step 4 · Talk to 10 People + 5 Bilingual Scripts</div>
      <div><strong>Pages 16–18:</strong> Step 5 · Pre-Sell Test Templates &amp; Objection Guide</div>
      <div><strong>Pages 19–20:</strong> 3 Digital Creator Worked Examples (Start to Finish)</div>
      <div><strong>Page 21:</strong> The 10 Red Flags Audit Checklist</div>
      <div><strong>Pages 22–25:</strong> Step 6 · Decision Time, 7-Day Build Plan &amp; Next Steps</div>
    </div>
    `
  );

  const page3 = wrapPage(
    3,
    totalPages,
    'STEP 1 · YOUR SKILL INVENTORY',
    `
    <div class="step-badge">STEP 1 · PAGES 3–5 · EST. 25 MINS</div>
    <h2>Your Skill Inventory: Why you already know enough to help</h2>
    <p>Most beginners stall before Step 1 because they assume they must be a world-famous expert to sell a digital product. In reality, people happily pay <strong>TSh 10,000–30,000 ($5–$15)</strong> to learn something from someone who is simply <strong>one or two steps ahead of them</strong> and can save them hours of trial and error.</p>

    <div class="card">
      <h3>The 3-Column Extraction Method</h3>
      <p>Instead of staring at a blank screen asking <em>"What should I sell?"</em>, pull evidence from real life using three buckets:</p>
      <ol>
        <li><strong>What I Already Know How to Do:</strong> Repeatable workflows at work, on your phone, in your business, or in software like Canva, CapCut, Excel, or Notion.</li>
        <li><strong>What People Already Ask Me For Help With:</strong> Questions friends, followers, or coworkers keep sending in WhatsApp or Instagram DMs.</li>
        <li><strong>Problems I Have Personally Solved:</strong> Frustrations that used to take you 3 hours or cost you money until you figured out a shortcut.</li>
      </ol>
    </div>

    <div class="callout-dark">
      <strong>Rule of Thumb:</strong> Do not look for "impressive" skills. Look for <em>annoying everyday problems</em> people gladly pay a small price to skip—formatting a brand rate card, batching Reels in 30 minutes, pricing cakes accurately, or tracking daily shop stock.
    </div>
    `
  );

  const page4 = wrapPage(
    4,
    totalPages,
    'STEP 1 · SKILL EXTRACTION PROMPTS',
    `
    <div class="step-badge">STEP 1 · WORKSHEET PROMPTS</div>
    <h2>12 Questions to Uncover Sellable Skills in 15 Minutes</h2>
    <p>Read each question and write down whatever comes to mind—even if it feels obvious to you. What feels obvious to you is often a headache for someone just starting out.</p>

    <div class="grid-2">
      <div class="card">
        <h3>Work &amp; Tools (Questions 1–6)</h3>
        <ol>
          <li>What tool or app do people watch you use and say, "How did you do that so fast?"</li>
          <li>What spreadsheet, template, or checklist have you already built for yourself?</li>
          <li>What beginner mistake do you see people in your field making every week?</li>
          <li>If a friend started doing what you do tomorrow, what 5 mistakes would you warn them about first?</li>
          <li>What part of your job or creator workflow did you learn the hard way?</li>
          <li>What task can you finish in 20 minutes that takes beginners 3 hours?</li>
        </ol>
      </div>
      <div class="card">
        <h3>DMs &amp; Real Requests (Questions 7–12)</h3>
        <ol start="7">
          <li>Open your WhatsApp and IG DMs: what have at least 3 people asked you how to do?</li>
          <li>What advice do you repeat so often you wish you could just send a link?</li>
          <li>Have you ever helped someone land a client, save money, or fix an error? How?</li>
          <li>What small system helped you stay consistent while working a 9–5 or running a shop?</li>
          <li>Which niche tutorials do you save or share most often because others miss the point?</li>
          <li>What local context (Swahili hooks, Tanzania mobile money, local pricing) do foreign courses miss?</li>
        </ol>
      </div>
    </div>
    `
  );

  const page5 = wrapPage(
    5,
    totalPages,
    'STEP 1 · YOUR SKILL WORKSHEET',
    `
    <div class="step-badge">STEP 1 · FILTER &amp; SAVED INVENTORY</div>
    <h2>Your Saved Skill Inventory &amp; Filter Check</h2>
    <p>Review your items below. Cross out pure "fun trivia" and highlight skills tied to saving time, avoiding costly mistakes, making clean presentations, or getting faster results.</p>

    <div class="grid-3">
      <div class="card">
        <h3>1. What I Know</h3>
        <ul>
          ${state.skillInventory.whatIKnow.map((x) => `<li>${esc(x)}</li>`).join('') || '<li class="muted">Write 3+ skills here...</li>'}
        </ul>
      </div>
      <div class="card">
        <h3>2. Asked For Help</h3>
        <ul>
          ${state.skillInventory.askedForHelp.map((x) => `<li>${esc(x)}</li>`).join('') || '<li class="muted">Write 3+ DM/WhatsApp asks...</li>'}
        </ul>
      </div>
      <div class="card">
        <h3>3. Problems Solved</h3>
        <ul>
          ${state.skillInventory.problemsSolved.map((x) => `<li>${esc(x)}</li>`).join('') || '<li class="muted">Write 3+ solved headaches...</li>'}
        </ul>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Weak Hobby Topic (Harder to Sell)</th>
          <th>Sharper Problem-Solving Skill (Easier to Test)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>"How to use CapCut"</td>
          <td>"Edit clean bilingual product Reels on your phone in under 30 minutes"</td>
        </tr>
        <tr>
          <td>"Social media tips for creators"</td>
          <td>"2-page Canva media kit + rate calculator so creators stop undercharging brands"</td>
        </tr>
        <tr>
          <td>"General Canva design"</td>
          <td>"12 reusable faceless carousel templates for busy 9–5 creators"</td>
        </tr>
      </tbody>
    </table>
    `
  );

  const page6 = wrapPage(
    6,
    totalPages,
    'STEP 2 · IDEA GENERATOR FORMULA',
    `
    <div class="step-badge">STEP 2 · PAGES 6–8 · EST. 30 MINS</div>
    <h2>Idea Generator: One sentence that makes buyers immediately get it</h2>
    <p>Do not name your idea something vague like <em>"Creator Masterclass."</em> Use this exact fill-in-the-blank formula for every single idea:</p>

    <div class="callout-dark" style="text-align:center;font-size:16px;">
      <strong>"A [format] that helps [specific person] to [concrete result]."</strong>
    </div>

    <h3>5 Fast Digital Product Formats You Can Ship in a Weekend</h3>
    <table>
      <thead>
        <tr>
          <th>Format</th>
          <th>Best For</th>
          <th>Typical Weekend Build Time</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>1. PDF Guide + Checklist</strong></td>
          <td>Step-by-step processes, playbooks, local buyer guides</td>
          <td>1–2 days (Google Docs / Canva)</td>
        </tr>
        <tr>
          <td><strong>2. Spreadsheet / Calculator</strong></td>
          <td>Pricing, budgeting, brand rates, profit tracking</td>
          <td>Half a day (Google Sheets / Excel)</td>
        </tr>
        <tr>
          <td><strong>3. Template &amp; Script Pack</strong></td>
          <td>CapCut hooks, Canva media kits, WhatsApp DM scripts</td>
          <td>1 weekend (bundle existing files)</td>
        </tr>
        <tr>
          <td><strong>4. Notion / Batching Board</strong></td>
          <td>Content calendars, client trackers, study planners</td>
          <td>1 day (duplicate &amp; clean yours)</td>
        </tr>
        <tr>
          <td><strong>5. Short Walkthrough + Workbook</strong></td>
          <td>Showing exact screen clicks (3–5 short phone videos)</td>
          <td>2–3 evenings</td>
        </tr>
      </tbody>
    </table>
    `
  );

  const page7 = wrapPage(
    7,
    totalPages,
    'STEP 2 · 10-IDEA BRAINSTORM SHEET',
    `
    <div class="step-badge">STEP 2 · 10-IDEA WORKSHEET</div>
    <h2>Turn Your Skills Into 10 Concrete Product Candidates</h2>
    <p>Quantity beats perfection in Step 2. Write 10 different combinations by changing either the <strong>Format</strong>, the <strong>Who</strong>, or the <strong>Result</strong>. Do not judge or filter yet—just get all 10 down.</p>

    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Product Title</th>
          <th>Formula ("A [format] that helps [who] to [result]")</th>
        </tr>
      </thead>
      <tbody>
        ${Array.from({ length: 10 }, (_, idx) => {
          const idea = state.ideas[idx];
          if (idea) {
            return `<tr>
              <td><strong>${idx + 1}</strong></td>
              <td><strong>${esc(idea.title)}</strong></td>
              <td>A ${esc(idea.format.toLowerCase())} that helps ${esc(idea.audience)} to ${esc(idea.result)}.</td>
            </tr>`;
          }
          return `<tr>
            <td><strong>${idx + 1}</strong></td>
            <td class="muted">__________________________</td>
            <td class="muted">A [________] that helps [____________] to [____________________].</td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>
    `
  );

  const page8 = wrapPage(
    8,
    totalPages,
    'STEP 2 · NARROWING BROAD IDEAS',
    `
    <div class="step-badge">STEP 2 · SHARPENING ANGLES</div>
    <h2>How to Fix Broad Ideas Before You Spend Time Testing</h2>
    <p>If your formula sounds like it applies to "everyone on the internet," nobody will feel spoken to. Narrowing who it is for and adding a time or outcome anchor makes people reply immediately.</p>

    <table>
      <thead>
        <tr>
          <th>Too Broad (Easy to Ignore)</th>
          <th>Sharpened (Clear Value in 5 Seconds)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>"An ebook about making money on Instagram"</td>
          <td>"A Canva media kit + pitch script pack that helps micro-creators (3k–15k followers) quote brands with confidence"</td>
        </tr>
        <tr>
          <td>"A video editing course for beginners"</td>
          <td>"A CapCut template + 25 Swahili &amp; English hook pack that helps shop owners edit Reels in 30 minutes"</td>
        </tr>
        <tr>
          <td>"A guide to staying consistent online"</td>
          <td>"A Notion batching calendar + 12 faceless carousel prompts for 9–5 workers creating on Sundays"</td>
        </tr>
      </tbody>
    </table>

    <div class="callout-sand">
      <strong>Quick 10-Second Clarity Test:</strong> Read each of your 10 formulas out loud. Can a stranger immediately picture what they hold in their hands and what changes for them by Sunday night? If not, tighten the <em>[who]</em> or <em>[result]</em> before moving to Step 3.
    </div>
    `
  );

  const page9 = wrapPage(
    9,
    totalPages,
    'STEP 3 · SCORING RUBRIC',
    `
    <div class="step-badge">STEP 3 · PAGES 9–11 · EST. 25 MINS</div>
    <h2>The Scoring Sheet: Replace gut feeling with 5 buyer signals</h2>
    <p>Score every candidate idea from <strong>1 (Weak)</strong> to <strong>5 (Strong)</strong> across five practical criteria. Maximum total score is <strong>25</strong>.</p>

    <table>
      <thead>
        <tr>
          <th>Criterion</th>
          <th>Score 1 (Weak)</th>
          <th>Score 3 (Moderate)</th>
          <th>Score 5 (Strong)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>1. Demand</strong></td>
          <td>Nobody asks about this</td>
          <td>Occasional curiosity</td>
          <td>People ask weekly &amp; complain openly</td>
        </tr>
        <tr>
          <td><strong>2. How Much You Help</strong></td>
          <td>Tiny tip easily Googled</td>
          <td>Saves an hour or two</td>
          <td>Removes a painful blocker or mistake</td>
        </tr>
        <tr>
          <td><strong>3. Ease to Build</strong></td>
          <td>Requires 4–8 weeks / coding</td>
          <td>Takes 1–2 weeks of evenings</td>
          <td>Can build Version 1 in 1 weekend</td>
        </tr>
        <tr>
          <td><strong>4. Price Potential</strong></td>
          <td>Hard to charge &gt; TSh 3,000</td>
          <td>Fair at TSh 8,000–12,000</td>
          <td>Clear value at TSh 15,000–30,000 ($7–$15)</td>
        </tr>
        <tr>
          <td><strong>5. Reach Buyers</strong></td>
          <td>No idea where buyers hang out</td>
          <td>Can find them in public groups</td>
          <td>10+ buyers already in your WhatsApp/IG</td>
        </tr>
      </tbody>
    </table>

    <div class="callout-dark">
      <strong>Be brutally honest on "Ease to Build":</strong> A 20-module video course scores 1 here—even if demand is high. Pick something fast enough to validate before enthusiasm runs out.
    </div>
    `
  );

  const page10 = wrapPage(
    10,
    totalPages,
    'STEP 3 · YOUR SCORED IDEAS',
    `
    <div class="step-badge">STEP 3 · RANKING MATRIX</div>
    <h2>Your Ranked Ideas &amp; Tie-Breaker Rules</h2>
    <p>Total up all 5 columns (or use <code>02-Idea-Scoring-Sheet.csv</code> in Excel/Google Sheets with live <code>SUM</code> &amp; <code>RANK</code> formulas). Circle your <strong>#1</strong> and keep your <strong>#2</strong> as backup.</p>

    <table>
      <thead>
        <tr>
          <th>Rank</th>
          <th>Idea</th>
          <th>Dem</th>
          <th>Help</th>
          <th>Ease</th>
          <th>Price</th>
          <th>Reach</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        ${sortedIdeas
          .map((idea, idx) => {
            const total =
              idea.scores.demand +
              idea.scores.helpfulness +
              idea.scores.easeToBuild +
              idea.scores.pricePotential +
              idea.scores.reachBuyers;
            return `<tr>
              <td><strong>#${idx + 1}</strong></td>
              <td><strong>${esc(idea.title)}</strong><br/><span class="muted" style="font-size:11px;">${esc(idea.format)}</span></td>
              <td>${idea.scores.demand}</td>
              <td>${idea.scores.helpfulness}</td>
              <td>${idea.scores.easeToBuild}</td>
              <td>${idea.scores.pricePotential}</td>
              <td>${idea.scores.reachBuyers}</td>
              <td><strong>${total}/25</strong></td>
            </tr>`;
          })
          .join('')}
      </tbody>
    </table>

    <div class="grid-3">
      <div class="card">
        <h3>19–25 Points</h3>
        <p>Strong test candidate. Take #1 directly into Step 4 (Talk to 10 People).</p>
      </div>
      <div class="card">
        <h3>14–18 Points</h3>
        <p>Promising, but check which column dragged it down (often Reach or Ease).</p>
      </div>
      <div class="card">
        <h3>5–13 Points</h3>
        <p>Park it for now. Do not waste a week building a low-scoring idea.</p>
      </div>
    </div>
    `
  );

  const page11 = wrapPage(
    11,
    totalPages,
    'STEP 3 · PRICE SANITY CHECK',
    `
    <div class="step-badge">STEP 3 · TSH &amp; USD PRICING</div>
    <h2>Price Sanity Check: Does the math respect your time?</h2>
    <p>A common beginner mistake is pricing a useful tool at TSh 2,000 ($1) thinking "cheap sells faster." In reality, overly cheap products feel low-trust and require 10× more buyers just to cover basic time.</p>

    <table>
      <thead>
        <tr>
          <th>Tier</th>
          <th>Tanzania Price</th>
          <th>International</th>
          <th>Best Fit</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Starter Checklist / Mini Pack</strong></td>
          <td>TSh 10,000 – 15,000</td>
          <td>$5 – $7</td>
          <td>1–2 hour quick-win guides, scripts, CapCut packs, calculators</td>
        </tr>
        <tr>
          <td><strong>Complete Kit / Multi-Template</strong></td>
          <td>TSh 18,000 – 30,000</td>
          <td>$9 – $15</td>
          <td>Workbooks + spreadsheets + templates + worked walkthroughs</td>
        </tr>
        <tr>
          <td><strong>Deep Niche System</strong></td>
          <td>TSh 35,000 – 60,000</td>
          <td>$19 – $29</td>
          <td>Specialized B2B/creator kits saving major time or cost</td>
        </tr>
      </tbody>
    </table>

    <div class="callout-sand">
      <strong>Sanity Formula:</strong> Multiply your planned build hours by your minimum hourly value. If Version 1 takes 8 weekend hours, selling 10 copies at <strong>TSh 15,000 ($7)</strong> brings TSh 150,000 ($70) for your first small test batch—while staying affordable via M-Pesa, Mixx by Yas, Airtel Money, or card.
    </div>
    `
  );

  const page12 = wrapPage(
    12,
    totalPages,
    'STEP 4 · TALK TO 10 PEOPLE',
    `
    <div class="step-badge">STEP 4 · PAGES 12–15 · EST. 1–2 DAYS</div>
    <h2>Talk to 10 People: Listen before you pitch</h2>
    <p>This step alone separates products that sell from products that collect digital dust. Your goal is to message <strong>10 real people</strong> who match your target buyer—and <strong>never pitch a product</strong> in the first message.</p>

    <div class="callout-dark">
      <strong>Why no pitching yet?</strong> If you ask friends, <em>"Would you buy my new guide?"</em>, polite people say <em>"Yes, awesome!"</em> to be nice—and then disappear on launch day. When you ask about their real frustration instead, you hear the truth (and capture the exact words to put on your sales page).
    </div>

    <div class="card">
      <h3>Where to Find 10 Real People Today</h3>
      <ul>
        <li><strong>People who already asked you:</strong> Scroll back 3–6 months in your WhatsApp &amp; Instagram DMs.</li>
        <li><strong>Status / Story responders:</strong> Post one open question on WhatsApp Status and message the people who reply.</li>
        <li><strong>Peer creator or trade groups:</strong> Reach out politely to 3–4 active members facing the exact workflow problem.</li>
        <li><strong>Past clients or colleagues:</strong> People who already trust your reliability.</li>
      </ul>
    </div>
    `
  );

  const page13 = wrapPage(
    13,
    totalPages,
    'STEP 4 · SCRIPTS #1–#3 (EN & SW)',
    `
    <div class="step-badge">STEP 4 · CONVERSATION SCRIPTS 1–3</div>
    <h2>Word-for-Word WhatsApp &amp; DM Scripts (English &amp; Kiswahili)</h2>
    <p>Personalized with your active test topic (<strong>${esc(state.scriptVariables.topic)}</strong>) and audience (<strong>${esc(state.scriptVariables.audience)}</strong>):</p>

    ${CONVERSATION_SCRIPTS.slice(0, 3)
      .map(
        (s) => `
      <div class="card">
        <h3>0${s.number}. ${esc(s.title)}</h3>
        <p class="muted" style="font-size:12px;margin-bottom:6px;"><strong>When:</strong> ${esc(s.whenToUse)}</p>
        <p><strong>EN:</strong> ${esc(fillScriptVars(s.english, state))}</p>
        <p style="margin-bottom:0;"><strong>SW:</strong> ${esc(fillScriptVars(s.swahili, state))}</p>
      </div>`
      )
      .join('')}
    `
  );

  const page14 = wrapPage(
    14,
    totalPages,
    'STEP 4 · SCRIPTS #4–#5 & SIGNALS',
    `
    <div class="step-badge">STEP 4 · SCRIPTS 4–5 &amp; SIGNAL DECODER</div>
    <h2>Scripts #4–#5 &amp; How to Tell Polite Replies From Real Pain</h2>

    ${CONVERSATION_SCRIPTS.slice(3, 5)
      .map(
        (s) => `
      <div class="card">
        <h3>0${s.number}. ${esc(s.title)}</h3>
        <p class="muted" style="font-size:12px;margin-bottom:6px;"><strong>When:</strong> ${esc(s.whenToUse)}</p>
        <p><strong>EN:</strong> ${esc(fillScriptVars(s.english, state))}</p>
        <p style="margin-bottom:0;"><strong>SW:</strong> ${esc(fillScriptVars(s.swahili, state))}</p>
      </div>`
      )
      .join('')}

    <table>
      <thead>
        <tr>
          <th>Weak / Polite Signal (Be Careful)</th>
          <th>Strong Pain Signal (Keep Digging)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>"Wow, nice idea! Good luck with that."</td>
          <td>"Honestly I wasted 2 hours on this yesterday and still messed it up."</td>
        </tr>
        <tr>
          <td>"Yeah people probably need that."</td>
          <td>"Wait—do you already have a template for this? When is it ready?"</td>
        </tr>
      </tbody>
    </table>
    `
  );

  const page15 = wrapPage(
    15,
    totalPages,
    'STEP 4 · 10-PERSON OUTREACH LOG',
    `
    <div class="step-badge">STEP 4 · EVIDENCE TRACKER</div>
    <h2>Your 10-Person Outreach &amp; Exact Quote Log</h2>
    <p>Copy down the <strong>exact phrases</strong> people use—do not rewrite them into corporate English. Those exact phrases become your headlines and bullet points.</p>

    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Name &amp; Channel</th>
          <th>Pain Confirmed?</th>
          <th>Exact Buyer Quote</th>
        </tr>
      </thead>
      <tbody>
        ${Array.from({ length: 10 }, (_, idx) => {
          const item = state.outreach[idx];
          if (item) {
            return `<tr>
              <td><strong>${idx + 1}</strong></td>
              <td><strong>${esc(item.name)}</strong><br/><span class="muted" style="font-size:11px;">${esc(item.channel)}</span></td>
              <td>${esc(item.problemConfirmed.toUpperCase())}</td>
              <td>"${esc(item.exactQuote)}"</td>
            </tr>`;
          }
          return `<tr>
            <td><strong>${idx + 1}</strong></td>
            <td class="muted">_________________</td>
            <td class="muted">[ ] Yes  [ ] No</td>
            <td class="muted">"________________________________________"</td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>
    `
  );

  const page16 = wrapPage(
    16,
    totalPages,
    'STEP 5 · THE PRE-SELL TEST',
    `
    <div class="step-badge">STEP 5 · PAGES 16–18 · EST. 48 HOURS</div>
    <h2>The Pre-Sell Test: Ask for commitment before building</h2>
    <p>Talk is cheap—even good conversations in Step 4 only prove the problem exists. Step 5 tests whether anyone is willing to cross the line toward paying <strong>before</strong> you spend a week formatting pages or filming tutorials.</p>

    <div class="grid-3">
      <div class="card">
        <h3>Level A: Deposit Test (Strongest)</h3>
        <p>Offer 5–10 early spots at a launch discount (e.g., TSh 10,000 instead of TSh 15,000) delivered within 7 days, or full refund if you decide not to build.</p>
      </div>
      <div class="card">
        <h3>Level B: Explicit Waitlist Reply</h3>
        <p>Ask viewers to reply <strong>"READY" / "TAYARI"</strong> if they genuinely want the payment link when it drops on Friday.</p>
      </div>
      <div class="card">
        <h3>Level C: Poll + DM Follow-Up</h3>
        <p>Run a 2-option IG/Threads poll and DM everyone who votes "Need this" with price &amp; format details.</p>
      </div>
    </div>

    <div class="callout-sand">
      <strong>Honesty &amp; Trust Rule:</strong> Always state clearly that it is an <strong>early-access / founding batch</strong> shipping on a specific day (for example, Friday), and never take deposits unless you are ready to deliver or refund promptly.
    </div>
    `
  );

  const page17 = wrapPage(
    17,
    totalPages,
    'STEP 5 · PRE-SELL TEMPLATES',
    `
    <div class="step-badge">STEP 5 · WHATSAPP, INSTAGRAM &amp; THREADS TEMPLATES</div>
    <h2>Ready-to-Post Pre-Sell Templates (English &amp; Kiswahili)</h2>
    <p>Pick the platform where your Step 4 buyers already watch you. Use the Status Slide PNG Maker inside the workspace to turn the WhatsApp Status slides into crisp images in 60 seconds.</p>

    ${PRESELL_TEMPLATES.map(
      (tpl) => `
      <div class="card">
        <h3>${esc(tpl.platform)}</h3>
        <p class="muted" style="font-size:11px;margin-bottom:6px;">${esc(tpl.formatNote)}</p>
        <p style="white-space:pre-line;font-size:12px;"><strong>[EN]</strong>\n${esc(fillScriptVars(tpl.english, state))}</p>
        <p style="white-space:pre-line;font-size:12px;margin-bottom:0;"><strong>[SW]</strong>\n${esc(fillScriptVars(tpl.swahili, state))}</p>
      </div>`
    ).join('')}
    `
  );

  const page18 = wrapPage(
    18,
    totalPages,
    'STEP 5 · OBJECTIONS & LOG',
    `
    <div class="step-badge">STEP 5 · HANDLING REPLIES &amp; TRACKER</div>
    <h2>How to Read Pre-Sell Replies (Plus Your Saved Log)</h2>

    <table>
      <thead>
        <tr>
          <th>If Someone Replies...</th>
          <th>What It Means &amp; How to Respond</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>"How do I pay?" / sends deposit</strong></td>
          <td>Strongest green light. Thank them, confirm delivery date, and ask the #1 thing they hope it solves.</td>
        </tr>
        <tr>
          <td><strong>"Send me when it's ready"</strong></td>
          <td>Warm interest. Reply: <em>"Sure! Just so I build the right thing—what is the main part you want inside?"</em></td>
        </tr>
        <tr>
          <td><strong>"Too expensive right now"</strong></td>
          <td>Ask: <em>"Got it—if it included [specific template], what price would feel like a no-brainer?"</em></td>
        </tr>
        <tr>
          <td><strong>0 replies after 48 hours</strong></td>
          <td>Do not panic. Check whether your hook named a painful outcome or whether you posted to the wrong audience.</td>
        </tr>
      </tbody>
    </table>

    <h3>Your Logged Pre-Sell Tests</h3>
    <table>
      <thead>
        <tr>
          <th>Platform</th>
          <th>Offer Tested</th>
          <th>Price</th>
          <th>Replies</th>
          <th>Would Pay</th>
          <th>Deposits</th>
        </tr>
      </thead>
      <tbody>
        ${state.preSellLogs
          .map(
            (l) => `<tr>
              <td>${esc(l.platform)}</td>
              <td>${esc(l.offerLine)}</td>
              <td>${esc(l.priceTested)}</td>
              <td>${l.repliesCount}</td>
              <td>${l.wouldPayCount}</td>
              <td><strong>${l.depositsCount}</strong></td>
            </tr>`
          )
          .join('') || '<tr><td colspan="6" class="muted">Log your Step 5 posts inside the workspace.</td></tr>'}
      </tbody>
    </table>
    `
  );

  const ex1 = WORKED_EXAMPLES[0];
  const page19 = wrapPage(
    19,
    totalPages,
    'WORKED EXAMPLE #1 · TANZANIA CREATOR',
    `
    <div class="step-badge">WORKED EXAMPLE #1 · START TO FINISH</div>
    <h2>${esc(ex1.productTitle)} (${esc(ex1.regionTag)})</h2>
    <p><strong>Creator:</strong> ${esc(ex1.creatorRole)} · <strong>Format:</strong> ${esc(ex1.format)} · <strong>Price:</strong> ${esc(ex1.targetPrice)}</p>

    <div class="card">
      <p><strong>Step 1 (Skill Inventory):</strong> ${esc(ex1.step1Skill)}</p>
      <p><strong>Step 2 (Formula):</strong> ${esc(ex1.step2Formula)}</p>
      <p><strong>Step 3 (Scoring Sheet):</strong> Scored <strong>${ex1.step3Scores.total}/25</strong> (Demand ${ex1.step3Scores.demand}, Helpfulness ${ex1.step3Scores.helpfulness}, Ease ${ex1.step3Scores.easeToBuild}, Price ${ex1.step3Scores.pricePotential}, Reach ${ex1.step3Scores.reachBuyers}). Beat out: <em>${esc(ex1.step3Scores.runnerUpTitle)}</em>.</p>
      <p><strong>Step 4 (10 People):</strong> ${esc(ex1.step4Conversations)}</p>
      <p><strong>Step 5 (Pre-Sell Test):</strong> ${esc(ex1.step5PreSell)}</p>
      <p style="margin-bottom:0;"><strong>Step 6 (${esc(ex1.step6Decision)}):</strong> ${esc(ex1.step6Summary)}</p>
    </div>

    <div class="callout-sand">
      <strong>Key Lesson from Example #1:</strong> Kelvin originally wanted to film a 14-module filmmaking course. Step 3 showed him it would take weeks and score poorly on Ease to Build (14/25), while his phone Reels template pack scored 23/25 and got 4 pre-orders in 36 hours.
    </div>
    `
  );

  const page20 = wrapPage(
    20,
    totalPages,
    'WORKED EXAMPLES #2 & #3',
    `
    <div class="step-badge">WORKED EXAMPLES #2 &amp; #3 · DIGITAL CREATORS</div>
    <h2>Two More Creator Case Studies (Including a Pivot)</h2>

    ${WORKED_EXAMPLES.slice(1)
      .map(
        (ex, idx) => `
      <div class="card">
        <h3>Example #${idx + 2}: ${esc(ex.productTitle)} — <span style="color:#9A772F;">${esc(ex.step6Decision)}</span></h3>
        <p class="muted" style="font-size:12px;">${esc(ex.regionTag)} · ${esc(ex.creatorRole)} · ${esc(ex.targetPrice)}</p>
        <p><strong>Steps 1–2:</strong> ${esc(ex.step1Skill)} Formula: <em>${esc(ex.step2Formula)}</em></p>
        <p><strong>Step 3 Score:</strong> ${ex.step3Scores.total}/25 (Beat: ${esc(ex.step3Scores.runnerUpTitle)})</p>
        <p><strong>Step 4 &amp; Step 5:</strong> ${esc(ex.step4Conversations)} ${esc(ex.step5PreSell)}</p>
        <p style="margin-bottom:0;"><strong>Verdict:</strong> ${esc(ex.step6Summary)}</p>
      </div>`
      )
      .join('')}
    `
  );

  const page21 = wrapPage(
    21,
    totalPages,
    '10 RED FLAGS AUDIT CHECKLIST',
    `
    <div class="step-badge">PRE-BUILD AUDIT · 10 WARNING SIGNS</div>
    <h2>10 Red Flags That an Idea May Not Sell</h2>
    <p>Check any box that honestly applies right now. Zero to one minor flag is normal. Three or more red flags means pause and fix the angle before building.</p>

    <table style="font-size:12px;">
      <thead>
        <tr>
          <th style="width:42px;">Check</th>
          <th>Red Flag Warning Sign</th>
          <th>Why It Matters</th>
        </tr>
      </thead>
      <tbody>
        ${RED_FLAGS.map(
          (rf) => `<tr>
            <td style="text-align:center;">${state.redFlagsChecked[rf.id] ? '[X]' : '[ ]'}</td>
            <td><strong>${rf.number}. ${esc(rf.title)}</strong></td>
            <td>${esc(rf.whyItMatters)}</td>
          </tr>`
        ).join('')}
      </tbody>
    </table>
    `
  );

  const page22 = wrapPage(
    22,
    totalPages,
    'STEP 6 · DECISION TIME',
    `
    <div class="step-badge">STEP 6 · PAGES 22–24 · EST. 20 MINS</div>
    <h2>Decision Time: Build, Fix, or Drop</h2>
    <p>Look at your evidence from Steps 3, 4, and 5—not your hopes. Check each criterion below honestly:</p>

    <div class="card">
      <h3>The 5-Point Evidence Scorecard</h3>
      <ul>
        <li>[${state.decision.checks['d-1'] ? 'X' : ' '}] Top-ranked idea scored <strong>18/25 or higher</strong> in Step 3.</li>
        <li>[${state.decision.checks['d-2'] ? 'X' : ' '}] At least <strong>6 out of 10 people</strong> in Step 4 confirmed this pain costs them time or money.</li>
        <li>[${state.decision.checks['d-3'] ? 'X' : ' '}] In Step 5, at least <strong>3 people</strong> explicitly said they would pay or sent an early deposit.</li>
        <li>[${state.decision.checks['d-4'] ? 'X' : ' '}] Audited the <strong>10 Red Flags</strong> and cleared major blockers.</li>
        <li>[${state.decision.checks['d-5'] ? 'X' : ' '}] Can ship <strong>Version 1 in 7 days</strong> without hiring developers or buying expensive gear.</li>
      </ul>
      <p style="margin-bottom:0;"><strong>Current Recorded Verdict:</strong> ${(state.decision.verdict || 'PENDING').toUpperCase()} (${esc(state.decision.chosenIdeaTitle || topIdea?.title || 'No candidate selected')})</p>
    </div>

    <div class="grid-3">
      <div class="card">
        <h3>4–5 Checks = BUILD</h3>
        <p>Start your 7-Day Build Plan on Page 23 immediately. Ship Version 1 fast to your early buyers.</p>
      </div>
      <div class="card">
        <h3>2–3 Checks = FIX</h3>
        <p>Keep the core problem, but sharpen the target buyer ("who"), deliverable format, or launch price.</p>
      </div>
      <div class="card">
        <h3>0–1 Checks = DROP</h3>
        <p>Celebrate! You just saved 3–6 weeks of wasted work. Pull your #2 idea from Step 3 and test it next.</p>
      </div>
    </div>
    `
  );

  const page23 = wrapPage(
    23,
    totalPages,
    'STEP 6 · 7-DAY BUILD PLAN',
    `
    <div class="step-badge">STEP 6 · 7-DAY EXECUTION ROADMAP</div>
    <h2>Your 7-Day Version 1 Build Plan</h2>
    <p>Once an idea earns a <strong>BUILD</strong> verdict, do not disappear for two months perfecting fonts. Follow this 7-day sprint to deliver Version 1 cleanly from your phone or computer:</p>

    <table>
      <thead>
        <tr>
          <th>Day</th>
          <th>Focus</th>
          <th>Exact Action to Finish</th>
          <th>Done</th>
        </tr>
      </thead>
      <tbody>
        ${state.decision.sevenDayPlan
          .map(
            (d) => `<tr>
              <td><strong>Day ${d.day}</strong></td>
              <td><strong>${esc(d.focus)}</strong></td>
              <td>${esc(d.task)}</td>
              <td style="text-align:center;">${d.done ? '[X]' : '[ ]'}</td>
            </tr>`
          )
          .join('')}
      </tbody>
    </table>

    <div class="callout-sand">
      <strong>Version 1 Rule:</strong> Buyers do not pay for 100 decorative pages—they pay for clarity, templates, and speed to their result. A clean 15–25 page toolkit that solves the problem beats a bloated 80-page textbook every time.
    </div>
    `
  );

  const page24 = wrapPage(
    24,
    totalPages,
    'STEP 6 · OFFER DRAFT & DELIVERY',
    `
    <div class="step-badge">STEP 6 · OFFER DRAFT &amp; CHECKOUT SETUP</div>
    <h2>Your Auto-Assembled Launch Offer &amp; Delivery Checklist</h2>
    <p>Use your top-ranked idea and exact Step 4 buyer quotes below as the foundation for your sales card:</p>

    <div class="card">
      <h3>Drafted Offer Summary</h3>
      <p><strong>Product:</strong> ${esc(topIdea?.title || state.decision.chosenIdeaTitle || '[Your Product Title]')}</p>
      <p><strong>Promise:</strong> A ${esc(topIdea?.format.toLowerCase() || 'digital toolkit')} that helps ${esc(topIdea?.audience || state.scriptVariables.audience)} to ${esc(topIdea?.result || state.scriptVariables.topic)}.</p>
      <p><strong>Test Price:</strong> ${esc(state.scriptVariables.priceTsh)} (${esc(state.scriptVariables.priceUsd)})</p>
      <p><strong>Exact Buyer Words Collected:</strong></p>
      <ul>
        ${quotes.map((q) => `<li>"${esc(q)}"</li>`).join('') || '<li class="muted">Add real quotes from Step 4 to drop them directly into your copy.</li>'}
      </ul>
    </div>

    <div class="card">
      <h3>Simple Delivery Checklist (Before Sending Your Link)</h3>
      <ul>
        <li>[ ] Test opening your exported PDF, CSV, or template links on an Android/iOS phone screen.</li>
        <li>[ ] Put all product files in one neat ZIP or cloud folder with clear numbered filenames (<code>01-...</code>, <code>02-...</code>).</li>
        <li>[ ] Configure your Selar checkout page (Mobile Money + international card) at your validated launch price.</li>
        <li>[ ] Send Version 1 to your Step 5 early testers first and ask what confused them so Version 1.1 is even sharper.</li>
      </ul>
    </div>
    `
  );

  const page25 = wrapPage(
    25,
    totalPages,
    'NEXT STEPS · BIASHARA BASE',
    `
    <div class="step-badge">NEXT STEPS · YOUR BIASHARA BASE LINEUP</div>
    <h2>Launch Plan &amp; Where to Go Next</h2>
    <p>Validating your product idea is the smartest first step—most creators skip it completely. Once your first product passes and goes live, follow this 4-step rollout sequence:</p>

    <div class="card">
      <ol>
        <li><strong>Use the Free 1-Page Checklist as your lead magnet:</strong> Share "Is My Idea Sellable?" in your bio and WhatsApp Status to attract serious beginners.</li>
        <li><strong>Post your first short Reel / TikTok / Thread:</strong> Hook: <em>"Don't build your digital product until you do this one thing."</em> Point viewers to your link in bio.</li>
        <li><strong>Collect real feedback from your first 10 paid buyers:</strong> Update your scripts and templates using questions real customers ask in week 1.</li>
        <li><strong>Move into the Biashara Base Blueprint:</strong> Once you have a validated product, use the full Biashara Base system to package, price, and build consistent organic traffic.</li>
      </ol>
    </div>

    <div class="callout-dark" style="margin-top:24px;">
      <strong>Final Honest Reminder from Biashara Base:</strong><br/>
      <em>"The cheapest time to find out an idea will not work is before you build it."</em><br/>
      Keep testing cheaply, keep listening to real people, and keep every promise grounded in real work.
    </div>
    `
  );

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Biashara Base — 25-Page Step-by-Step Product Idea Validator Guide</title>
<style>
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    padding: 24px 16px;
    background: #E2DAC6;
    color: #18291F;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    line-height: 1.5;
  }
  .toolbar {
    max-width: 820px;
    margin: 0 auto 20px;
    background: #183926;
    color: #F7F3E9;
    border: 1px solid #C29B48;
    padding: 12px 18px;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }
  .toolbar-title { font-weight: 700; font-size: 13px; letter-spacing: 0.04em; }
  .toolbar-btn {
    background: #C29B48;
    color: #183926;
    border: none;
    padding: 8px 14px;
    font-weight: 700;
    font-size: 12px;
    cursor: pointer;
    border-radius: 3px;
  }
  .page {
    width: 100%;
    max-width: 820px;
    min-height: 1120px;
    margin: 0 auto 24px;
    background: #F7F3E9;
    border: 1px solid #C29B48;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    page-break-after: always;
    break-after: page;
    position: relative;
    overflow: hidden;
  }
  .page:last-child { page-break-after: auto; break-after: auto; }
  .cover-page {
    background: #183926;
    color: #F7F3E9;
    padding: 36px;
  }
  .cover-circle-tr {
    position: absolute;
    top: -120px;
    right: -120px;
    width: 420px;
    height: 420px;
    border-radius: 9999px;
    background: rgba(46, 91, 65, 0.72);
  }
  .cover-circle-bl {
    position: absolute;
    bottom: -100px;
    left: -100px;
    width: 340px;
    height: 340px;
    border-radius: 9999px;
    background: rgba(15, 38, 25, 0.8);
  }
  .cover-frame {
    position: relative;
    z-index: 2;
    flex: 1;
    border: 1.5px solid #C29B48;
    padding: 48px 44px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .cover-kicker {
    color: #C29B48;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.22em;
  }
  .cover-main h1 {
    font-family: Georgia, "Times New Roman", serif;
    font-size: 52px;
    line-height: 1.06;
    color: #FFFFFF;
    margin: 0;
  }
  .cover-rule {
    width: 90px;
    height: 3px;
    background: #C29B48;
    margin: 26px 0;
  }
  .cover-subtitle {
    font-family: Georgia, "Times New Roman", serif;
    font-style: italic;
    font-size: 20px;
    color: #EDE7D6;
    max-width: 440px;
    margin: 0;
  }
  .cover-tag {
    color: #C29B48;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.14em;
  }
  .cover-domain {
    color: #FFFFFF;
    font-size: 13px;
    margin-top: 4px;
  }
  .running-header {
    background: #183926;
    color: #EDE7D6;
    border-bottom: 2px solid #C29B48;
    padding: 10px 32px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.12em;
    display: flex;
    justify-content: space-between;
    gap: 12px;
  }
  .running-footer {
    border-top: 1px solid rgba(194, 155, 72, 0.55);
    padding: 10px 32px;
    font-size: 11px;
    color: #526056;
    display: flex;
    justify-content: space-between;
  }
  .page-body {
    flex: 1;
    padding: 28px 36px;
  }
  .kicker, .step-badge {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.14em;
    color: #9A772F;
    margin-bottom: 6px;
    text-transform: uppercase;
  }
  h2 {
    font-family: Georgia, "Times New Roman", serif;
    font-size: 24px;
    line-height: 1.2;
    color: #183926;
    margin: 0 0 14px;
  }
  h3 {
    font-family: Georgia, "Times New Roman", serif;
    font-size: 16px;
    color: #183926;
    margin: 14px 0 8px;
  }
  p { font-size: 13.5px; margin: 0 0 12px; }
  ul, ol { font-size: 13px; padding-left: 20px; margin: 0 0 12px; }
  li { margin-bottom: 6px; }
  .card {
    background: #FFFFFF;
    border: 1px solid rgba(24, 57, 38, 0.22);
    padding: 16px 18px;
    margin-bottom: 14px;
  }
  .callout-sand {
    background: #EDE7D6;
    border-left: 4px solid #C29B48;
    padding: 14px 16px;
    margin: 14px 0;
    font-size: 13px;
  }
  .callout-dark {
    background: #183926;
    color: #F7F3E9;
    border: 1px solid #C29B48;
    padding: 14px 18px;
    margin: 14px 0;
    font-size: 13px;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 12px 0 16px;
    font-size: 12.5px;
    background: #FFFFFF;
  }
  th {
    background: #183926;
    color: #F7F3E9;
    text-align: left;
    padding: 8px 10px;
    font-size: 11.5px;
    letter-spacing: 0.04em;
  }
  td {
    border-bottom: 1px solid rgba(194, 155, 72, 0.35);
    padding: 8px 10px;
    vertical-align: top;
  }
  tr:nth-child(even) td { background: rgba(237, 231, 214, 0.45); }
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
  .two-col-list { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 18px; font-size: 13px; background: #FFFFFF; border: 1px solid rgba(194,155,72,0.5); padding: 14px 16px; }
  .muted { color: #526056; }
  code { font-family: ui-monospace, SFMono-Regular, monospace; font-size: 11.5px; background: #EDE7D6; padding: 1px 4px; }
  @media print {
    body { background: #FFFFFF; padding: 0; }
    .toolbar { display: none; }
    .page { margin: 0; border: none; min-height: 296mm; height: 296mm; }
  }
  @media (max-width: 680px) {
    .grid-2, .grid-3, .two-col-list { grid-template-columns: 1fr; }
    .page-body { padding: 20px; }
  }
</style>
</head>
<body>
  <div class="toolbar">
    <div class="toolbar-title">BIASHARA BASE · COMPLETE 25-PAGE STEP-BY-STEP VALIDATOR GUIDE</div>
    <button class="toolbar-btn" type="button" onclick="window.print()">Print / Save 25-Page PDF</button>
  </div>
  ${[
    page1Cover,
    page2,
    page3,
    page4,
    page5,
    page6,
    page7,
    page8,
    page9,
    page10,
    page11,
    page12,
    page13,
    page14,
    page15,
    page16,
    page17,
    page18,
    page19,
    page20,
    page21,
    page22,
    page23,
    page24,
    page25,
  ].join('\n')}
</body>
</html>`;
}

// Re-export step count sanity check reference if needed
export { GUIDE_STEPS };

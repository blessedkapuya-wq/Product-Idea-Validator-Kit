import type {
  PreSellTemplate,
  ProductIdea,
  ScriptTemplate,
  WorkedExample,
  WorkspaceState,
} from '../src/paid/types';

export interface GuideStepMeta {
  id: 'step-1' | 'step-2' | 'step-3' | 'step-4' | 'step-5' | 'step-6';
  number: number;
  title: string;
  pageRange: string;
  timeEstimate: string;
  summary: string;
  buyerAction: string;
}

export const GUIDE_STEPS: GuideStepMeta[] = [
  {
    id: 'step-1',
    number: 1,
    title: 'Your Skill Inventory',
    pageRange: 'Pages 3–6',
    timeEstimate: '25 mins',
    summary: 'Extract practical knowledge you already use every week without realizing others struggle with it.',
    buyerAction: 'List what you know, what people ask you for help with, and problems you have personally solved.',
  },
  {
    id: 'step-2',
    number: 2,
    title: 'Idea Generator',
    pageRange: 'Pages 7–11',
    timeEstimate: '30 mins',
    summary: 'Turn raw skills into 10 concrete digital product ideas using one fill-in-the-blank formula.',
    buyerAction: 'Generate 10 clear concepts using: "A [format] that helps [who] to [result]."',
  },
  {
    id: 'step-3',
    number: 3,
    title: 'The Scoring Sheet',
    pageRange: 'Pages 12–16',
    timeEstimate: '25 mins',
    summary: 'Replace gut feeling with five simple 1–5 scores so your top two ideas rise to the top immediately.',
    buyerAction: 'Score each idea on Demand, Helpfulness, Effort to Build, Price Potential, and Reach.',
  },
  {
    id: 'step-4',
    number: 4,
    title: 'Talk to 10 People',
    pageRange: 'Pages 17–21',
    timeEstimate: '1–2 days',
    summary: 'Listen before you pitch. Use short WhatsApp scripts in Swahili or English to confirm the real pain.',
    buyerAction: 'Message 10 real people to ask about their problem—zero pitching in this step.',
  },
  {
    id: 'step-5',
    number: 5,
    title: 'The Pre-Sell Test',
    pageRange: 'Pages 22–26',
    timeEstimate: '48 hours',
    summary: 'See who moves from polite encouragement to real commitment before you build the full product.',
    buyerAction: 'Post a simple pre-sell message on WhatsApp Status, Instagram, or Threads to test paid intent.',
  },
  {
    id: 'step-6',
    number: 6,
    title: 'Decision Time',
    pageRange: 'Pages 27–32',
    timeEstimate: '20 mins',
    summary: 'Use evidence—not hope—to make a clean Build, Fix, or Drop call and map your next 7 days.',
    buyerAction: 'Complete the Build / Fix / Drop checklist and follow the 7-day build plan if your idea passes.',
  },
];

export const CONVERSATION_SCRIPTS: ScriptTemplate[] = [
  {
    id: 'script-1',
    number: 1,
    title: 'Warm Check-In (Friend or Past Client)',
    whenToUse: 'Step 4 · Day 1 — Start with 3–4 people who already know or trust you.',
    goal: 'Confirm whether the problem actually bothers them right now, without mentioning any product.',
    english: `Hi [Name], quick question — I'm researching how people handle {{topic}} right now. When you deal with {{topic}}, what part takes the most time or causes the biggest headache for you? Not selling anything, just trying to understand what people actually struggle with.`,
    swahili: `Mambo [Jina], naomba nikuulize swali fupi — nafanya utafiti mdogo kuhusu jinsi watu wanavyoshughulikia {{topic}} kwa sasa. Unapokutana na mambo ya {{topic}}, ni sehemu gani inayokupa ugumu zaidi au kukupotezea muda mwingi? Sijakuja kuuza kitu chochote, nataka tu kuelewa changamoto halisi.`,
  },
  {
    id: 'script-2',
    number: 2,
    title: 'WhatsApp Status Reply Opener',
    whenToUse: 'Step 4 · After posting a simple question on your Status or Story.',
    goal: 'Turn casual poll voters or story viewers into short, honest problem conversations.',
    english: `Thanks for replying to my status about {{topic}}! Out of curiosity, what have you tried so far to fix it for {{audience}}, and what didn't work well about it?`,
    swahili: `Asante kwa kujibu status yangu kuhusu {{topic}}! Kwa udadisi tu, hadi sasa umejaribu njia gani kutatua hili kwa {{audience}}, na nini hakikufanya kazi vizuri?`,
  },
  {
    id: 'script-3',
    number: 3,
    title: 'The 3-Question Voice Note Ask',
    whenToUse: 'Step 4 · When someone shares a strong frustration and has 2 minutes.',
    goal: 'Capture exact buyer wording you can later reuse on your sales page.',
    english: `That makes total sense. Could I ask two quick follow-ups? (1) How often does this happen to you in a normal month? (2) If you had a simple step-by-step guide or template that solved it in an afternoon, what would change for you?`,
    swahili: `Hapo nimekuelewa kabisa. Naomba maswali mawili mafupi zaidi: (1) Hili linakutokea mara ngapi kwa mwezi? (2) Kama ungekuwa na mwongozo rahisi au template ya kukusaidia kulitatua ndani ya alasiri moja, ingekusaidiaje?`,
  },
  {
    id: 'script-4',
    number: 4,
    title: 'Reality Check on Price & Willingness',
    whenToUse: 'Step 4 · Conversations 6–10 once the problem is clearly confirmed.',
    goal: 'Separate polite compliments from problems people actually pay to solve.',
    english: `I've heard the same thing from a few {{audience}} this week. Have you ever paid for a course, tool, or someone's help to solve {{topic}} before? If yes, roughly how much felt fair — and if no, what stopped you?`,
    swahili: `Nimesikia kitu hicho hicho kutoka kwa {{audience}} kadhaa wiki hii. Je, umewahi kulipia mwongozo, kifaa, au msaada wa mtu kutatua {{topic}} hapo awali? Kama ndiyo, kiasi gani kilionekana sawa — na kama hapana, nini kilikuzuia?`,
  },
  {
    id: 'script-5',
    number: 5,
    title: 'Soft Follow-Up Without Being Pushy',
    whenToUse: 'Step 5 · Messaging people from Step 4 once you test your pre-sell offer.',
    goal: 'Invite genuinely interested people to confirm interest or place a small early deposit.',
    english: `Hey [Name], thanks again for sharing your thoughts on {{topic}} earlier! Based on what you and a few others told me, I'm putting together a practical toolkit this week for {{audience}} at {{priceTsh}} ({{priceUsd}}). No pressure at all — would you want early access when it's ready, or should I skip you for this one?`,
    swahili: `Habari [Jina], asante tena kwa kushare maoni yako kuhusu {{topic}} juzi! Kutokana na ulichoniambia na maoni ya wengine, ninaandaa mwongozo wa vitendo wiki hii kwa ajili ya {{audience}} kwa {{priceTsh}} ({{priceUsd}}). Bila presha yoyote — ungependa nikuweke kwenye list ya kupata mapema ukikamilika, au nikupitishe kwa sasa?`,
  },
];

export const PRESELL_TEMPLATES: PreSellTemplate[] = [
  {
    id: 'presell-wa',
    platform: 'WhatsApp Status',
    formatNote: 'Post as 2–3 short text slides on plain dark or light background. Avoid long paragraphs.',
    english: `Slide 1: Quick question for {{audience}} 👇
I keep seeing people lose hours (and money) on {{topic}}.

Slide 2: I'm thinking of turning my exact templates + step-by-step checklist into a short weekend kit so you can fix it without guessing.

Slide 3: Early test price: {{priceTsh}} ({{priceUsd}}).
Reply "READY" if you'd genuinely pay for this once it's done — if at least 5 people want it, I'll build it this week.`,
    swahili: `Slide 1: Swali fupi kwa {{audience}} 👇
Nimeona watu wengi wakipoteza muda (na pesa) kwenye {{topic}}.

Slide 2: Nafikiria kubadilisha mbinu na checklist ninazotumia kuwa mwongozo mfupi wa vitendo ili usihangaike kubahatisha tena.

Slide 3: Bei ya majaribio ya mapema: {{priceTsh}} ({{priceUsd}}).
Jibu "TAYARI" kama kweli ungenunua huu mwongozo ukikamilika — watu 5 wakihitaji, nauandaa wiki hii.`,
  },
  {
    id: 'presell-ig',
    platform: 'Instagram',
    formatNote: 'Use on an Instagram Story with a Poll ("Count me in" / "Not for me") or a 4-slide Carousel.',
    english: `Don't spend weeks guessing {{topic}}.

I'm building a practical starter pack for {{audience}} that shows you how to get [specific outcome] step by step—without expensive tools or fluff.

Before I record/write the whole thing, I'm opening 10 early-bird spots at {{priceTsh}} ({{priceUsd}}).

DM me "TEST" if you want the details (you only pay if you want to reserve a spot, or tell me honestly if this isn't what you need).`,
    swahili: `Usipoteze wiki nzima ukibahatisha {{topic}}.

Ninaandaa mwongozo wa vitendo kwa ajili ya {{audience}} unaokuonyesha hatua kwa hatua jinsi ya kupata [matokeo halisi] bila kuhitaji vifaa vya gharama.

Kabla sijaandika mwongozo mzima, nafungua nafasi 10 za mapema kwa {{priceTsh}} ({{priceUsd}}).

Nitext DM neno "TAYARI" kama ungependa maelezo zaidi (au niambie wazi kama hiki siyo unachohitaji sasa).`,
  },
  {
    id: 'presell-threads',
    platform: 'Threads',
    formatNote: 'Conversational single post or 2-post thread. Direct, honest, and easy to reply to.',
    english: `Testing an idea before I build it:

I've helped people solve {{topic}} over and over, and I'm considering packaging the exact checklists & templates into a {{priceUsd}} ({{priceTsh}}) digital kit for {{audience}}.

Honest check: if this existed by Friday, would you buy it—or what's the #1 thing it MUST include to be worth your money?`,
    swahili: `Najaribu wazo kabla sijalitengeneza:

Nimesaidia watu kutatua {{topic}} mara nyingi, na nafikiria kuweka checklist na mifano yote kwenye mwongozo wa {{priceTsh}} ({{priceUsd}}) kwa {{audience}}.

Ukweli mtupu: kama huu mwongozo ungekuwepo Ijumaa hii, ungeununua — au ni kitu gani kimoja lazima kiwemo ili uone thamani ya pesa yako?`,
  },
];

export const WORKED_EXAMPLES: WorkedExample[] = [
  {
    id: 'example-reels-creator',
    regionTag: 'Tanzania Case Study · Dar es Salaam',
    creatorRole: 'Short-Form Video & Reels Creator (Mikocheni)',
    productTitle: '30-Minute CapCut Reels & Hook Template Pack',
    format: 'CapCut Template Links + 25 Bilingual (SW/EN) Hook Scripts PDF',
    targetPrice: 'TSh 15,000 ($7)',
    step1Skill:
      'Small shop owners and fellow creators kept DMing Kelvin every week asking how he edited clean bilingual product Reels on his phone in 20 minutes without expensive desktop software.',
    step2Formula:
      'A CapCut template + 25 Swahili & English hook script pack that helps small business creators edit clean product Reels on their phone in under 30 minutes.',
    step3Scores: {
      demand: 5,
      helpfulness: 5,
      easeToBuild: 4,
      pricePotential: 4,
      reachBuyers: 5,
      total: 23,
      runnerUpTitle: 'Full 14-Module Smartphone Filmmaking Course (Scored 14/25 — too slow to record)',
      runnerUpTotal: 14,
    },
    step4Conversations:
      'Kelvin messaged 10 creators and IG shop owners on WhatsApp who regularly asked for editing advice. 8 out of 10 said filming took 10 minutes, but they froze for 2 hours writing hooks and cutting beat transitions.',
    step5PreSell:
      'He posted 3 WhatsApp Status slides showing one before/after 15-second Reel timeline and offered early access for TSh 10,000 deposit via mobile money. 8 people replied "TAYARI" and 4 sent deposits within 36 hours.',
    step6Decision: 'BUILD',
    step6Summary:
      'Passed with 4 paid pre-orders before writing page 1. Built in 4 evenings using his existing CapCut projects and Canva.',
  },
  {
    id: 'example-canva-creator',
    regionTag: 'Digital Creator Toolkit · Nairobi / Dar / Remote',
    creatorRole: 'Canva & Carousel Content Creator',
    productTitle: 'Creator Rate Card & Brand Pitch Kit',
    format: 'Editable Canva Media Kit + Google Sheets Rate Calculator + 6 Pitch Emails',
    targetPrice: 'TSh 18,000 ($7)',
    step1Skill:
      'Micro-creators with 3k–15k followers constantly asked Neema how she formatted her 2-page media kit and what to reply when brands asked "what are your charges?" in DMs.',
    step2Formula:
      'An editable Canva media kit + rate calculator sheet that helps micro-creators send clean, confident brand partnership proposals in 15 minutes.',
    step3Scores: {
      demand: 5,
      helpfulness: 5,
      easeToBuild: 5,
      pricePotential: 4,
      reachBuyers: 4,
      total: 23,
      runnerUpTitle: '50 Aesthetic Instagram Story Stickers Pack (Scored 13/25 — low urgency)',
      runnerUpTotal: 13,
    },
    step4Conversations:
      'Talked to 10 micro-creators in two creator WhatsApp communities. Almost everyone admitted undercharging or losing brand replies because they sent messy voice notes instead of a clear rate card.',
    step5PreSell:
      'Posted a Threads question + Instagram Story poll showing a blurred preview of her 2-page Canva media kit. 15 creators voted "Need this" and 6 replied in DMs asking for the payment link.',
    step6Decision: 'BUILD',
    step6Summary:
      'Built in one weekend by duplicating the Canva media kit she already used for brand deals, cleaning up her pricing calculator, and recording a 5-minute phone walkthrough.',
  },
  {
    id: 'example-faceless-pivot',
    regionTag: 'Pivot Example · How Testing Saves Weeks',
    creatorRole: 'YouTube & Threads Digital Creator',
    productTitle: 'Faceless Carousel & 30-Day Batching System',
    format: 'Notion Content Calendar + 12 Reusable Carousel Prompts',
    targetPrice: 'TSh 12,000 ($5)',
    step1Skill:
      'Busy 9-to-5 professionals always asked Baraka how he published 4 educational carousels every week without showing his face or spending every night designing.',
    step2Formula:
      'First idea: "A complete social media growth course for all creators." -> Scored weak on Specificity & Build Time. Fixed to: "A 30-day batching calendar + 12 faceless carousel prompts for part-time creators working 9–5 jobs."',
    step3Scores: {
      demand: 4,
      helpfulness: 5,
      easeToBuild: 5,
      pricePotential: 3,
      reachBuyers: 4,
      total: 21,
      runnerUpTitle: 'Broad "How to Go Viral on Social Media" Ebook (Scored 12/25)',
      runnerUpTotal: 12,
    },
    step4Conversations:
      'His broad "social media growth" idea got polite "nice idea!" replies with zero urgency. When he narrowed it to part-time 9–5 faceless creators, 7 of 10 immediately shared how Sunday burnout made them quit posting.',
    step5PreSell:
      'Posted on WhatsApp Status and Threads offering the Notion batching board + 12 carousel templates for TSh 10,000 early bird. Got 6 firm commitments and 2 early mobile-money transfers.',
    step6Decision: 'FIX -> BUILD',
    step6Summary:
      'The first broad course idea would have flopped. Fixing the target creator ("who") before writing saved 3 weeks of wasted work.',
  },
];

export interface RedFlagItem {
  id: string;
  number: number;
  title: string;
  whyItMatters: string;
}

export const RED_FLAGS: RedFlagItem[] = [
  {
    id: 'rf-1',
    number: 1,
    title: 'Everyone says "that\'s a cool idea!"—but nobody asks when it\'s ready or how much it costs.',
    whyItMatters: 'Polite encouragement from friends is free. Look for questions about price, format, or delivery.',
  },
  {
    id: 'rf-2',
    number: 2,
    title: 'You cannot name 10 specific people who have this exact problem this month.',
    whyItMatters: 'If you have to invent an imaginary persona, finding your first 10 buyers will stall immediately.',
  },
  {
    id: 'rf-3',
    number: 3,
    title: 'Your product solves a "someday" curiosity instead of an annoying current problem.',
    whyItMatters: 'People pay to remove friction, save time, avoid costly mistakes, or get a clear result sooner.',
  },
  {
    id: 'rf-4',
    number: 4,
    title: 'You plan to spend 4–8 weeks filming 30 videos before showing anyone a single page.',
    whyItMatters: 'Overbuilding before testing is the #1 reason beginners burn out and quit.',
  },
  {
    id: 'rf-5',
    number: 5,
    title: 'Your target buyer has zero budget or expects everything in this niche to be free forever.',
    whyItMatters: 'Some audiences love free content but never buy tools. Verify past spending habits in Step 4.',
  },
  {
    id: 'rf-6',
    number: 6,
    title: 'You cannot explain the result in one plain sentence without buzzwords.',
    whyItMatters: 'If buyers have to decode what it does, they scroll right past your Status or Story.',
  },
  {
    id: 'rf-7',
    number: 7,
    title: 'You only picked the idea because it looks trendy online—not because you have real experience solving it.',
    whyItMatters: 'Beginners spot generic advice fast. Real worked details from your own hands build trust.',
  },
  {
    id: 'rf-8',
    number: 8,
    title: 'All 10 people in Step 4 said "yeah I guess" and changed the subject quickly.',
    whyItMatters: 'Real pain makes people vent, ask follow-up questions, or share an embarrassing recent story.',
  },
  {
    id: 'rf-9',
    number: 9,
    title: 'The product requires complicated software, custom coding, or constant 1-on-1 support just to work.',
    whyItMatters: 'Your first digital product should be lightweight and easy to deliver on a phone or laptop.',
  },
  {
    id: 'rf-10',
    number: 10,
    title: 'You skipped Step 4 and Step 5 because asking people felt uncomfortable.',
    whyItMatters: 'Silence at launch hurts far more than 10 casual WhatsApp check-ins today.',
  },
];

export const INITIAL_SAMPLE_IDEAS: ProductIdea[] = [
  {
    id: 'idea-1',
    format: 'CapCut Templates + PDF',
    audience: 'small business creators in Tanzania',
    result: 'edit bilingual product Reels on their phone in 30 minutes',
    title: '30-Minute CapCut Reels & Hook Template Pack',
    scores: { demand: 5, helpfulness: 5, easeToBuild: 4, pricePotential: 4, reachBuyers: 5 },
    notes: 'High demand from IG shops & fellow creators posting weekly.',
  },
  {
    id: 'idea-2',
    format: 'Canva Media Kit + Sheet',
    audience: 'micro-creators (3k–15k followers)',
    result: 'send clean brand pitch proposals and price sponsorships confidently',
    title: 'Creator Rate Card & Brand Pitch Kit',
    scores: { demand: 5, helpfulness: 4, easeToBuild: 5, pricePotential: 4, reachBuyers: 4 },
    notes: 'Can build from my existing Canva media kit & rate sheet in a weekend.',
  },
  {
    id: 'idea-3',
    format: '12-Video Course',
    audience: 'general social media users',
    result: 'learn every part of going viral online',
    title: 'Complete Viral Creator Masterclass',
    scores: { demand: 3, helpfulness: 3, easeToBuild: 1, pricePotential: 3, reachBuyers: 2 },
    notes: 'Too broad and takes weeks to film. Weak score.',
  },
];

export const DEFAULT_WORKSPACE_STATE: WorkspaceState = {
  skillInventory: {
    whatIKnow: [
      'Editing fast, clean 20-second product Reels on a phone using CapCut',
      'Writing bilingual Swahili & English opening hooks that stop scrolling',
      'Packaging simple Canva media kits and creator brand rate cards',
    ],
    askedForHelp: [
      'How do I edit product Reels quickly without paying for desktop software?',
      'What should I charge when a brand asks for my rates in Instagram DMs?',
    ],
    problemsSolved: [
      'Cut my own weekly Reel editing time from 3 hours down to 25 minutes',
      'Built a repeatable 2-page Canva rate card so brand inquiries convert faster',
    ],
  },
  ideas: INITIAL_SAMPLE_IDEAS,
  outreach: [
    {
      id: 'c-1',
      name: 'Amina K. (Mikocheni Creator)',
      channel: 'WhatsApp',
      problemConfirmed: 'yes',
      exactQuote: 'Filming takes me 10 minutes, then I waste 2 hours staring at CapCut trying to match audio beats.',
      urgencyNote: 'Posts 4 product Reels a week.',
    },
    {
      id: 'c-2',
      name: 'Grace M. (Arusha IG Shop)',
      channel: 'WhatsApp',
      problemConfirmed: 'yes',
      exactQuote: 'I never know what to say in the first 3 seconds so people swipe away before seeing the price.',
      urgencyNote: 'Asked if I have copy-paste Swahili hook lines.',
    },
    {
      id: 'c-3',
      name: 'Juma S. (TikTok Creator)',
      channel: 'WhatsApp / IG DM',
      problemConfirmed: 'partial',
      exactQuote: 'I want to batch my weekend videos fast so they do not eat my whole Sunday.',
      urgencyNote: 'Works 9–5 and creates part-time.',
    },
  ],
  preSellLogs: [
    {
      id: 'ps-1',
      platform: 'WhatsApp Status',
      offerLine: '30-Minute CapCut Reels & Hook Template Pack (Early Test)',
      priceTested: 'TSh 15,000 ($7)',
      repliesCount: 9,
      wouldPayCount: 6,
      depositsCount: 4,
      outcomeNotes: '4 creators sent early M-Pesa deposits within 36 hours; 2 asked for Friday payday.',
    },
  ],
  redFlagsChecked: {},
  decision: {
    checks: {
      'd-1': true,
      'd-2': true,
      'd-3': true,
      'd-4': true,
      'd-5': false,
    },
    verdict: 'build',
    chosenIdeaTitle: '30-Minute CapCut Reels & Hook Template Pack',
    sevenDayPlan: [
      { day: 1, focus: 'Outline', task: 'Write the 5–7 core steps and list every template or hook buyers need.', done: true },
      { day: 2, focus: 'Core Draft', task: 'Draft the main pages or template links using real creator examples.', done: false },
      { day: 3, focus: 'Examples & Visuals', task: 'Take clean phone screenshots or short screen recordings of worked examples.', done: false },
      { day: 4, focus: 'Templates', task: 'Package the copy-paste hooks, templates, or calculators neatly.', done: false },
      { day: 5, focus: 'Polish & Phone Check', task: 'Export PDF/links and test opening everything on your phone.', done: false },
      { day: 6, focus: 'Delivery Link', task: 'Set up your simple checkout + instant download link (mobile money & card).', done: false },
      { day: 7, focus: 'Deliver to Early Testers', task: 'Send to your Step 5 early buyers first and ask for honest feedback.', done: false },
    ],
  },
  scriptVariables: {
    topic: 'editing product Reels & writing hooks in under 30 minutes',
    audience: 'digital creators & IG shop owners',
    priceTsh: 'TSh 15,000',
    priceUsd: '$7',
  },
};

export const SELLABILITY_CHECKLIST_QUESTIONS = [
  {
    id: 'q1',
    number: 1,
    question: 'Does this solve a specific problem people already spend time or money trying to fix?',
    helper: 'Look for active frustration, not a vague "nice to know" topic.',
  },
  {
    id: 'q2',
    number: 2,
    question: 'Can you name at least 10 real people (by name or WhatsApp contact) who have this problem right now?',
    helper: 'If you cannot name 10 real people, reaching buyers later will feel like pushing uphill.',
  },
  {
    id: 'q3',
    number: 3,
    question: 'Have people already asked you for advice, templates, or help with this skill in the last 6 months?',
    helper: 'Repeated questions in DMs, WhatsApp, or at work are strong early demand signals.',
  },
  {
    id: 'q4',
    number: 4,
    question: 'Can a buyer clearly picture the "after" result in under 10 seconds?',
    helper: 'Specific outcomes ("price a custom cake in 5 minutes") beat broad themes ("baking business").',
  },
  {
    id: 'q5',
    number: 5,
    question: 'Can you build Version 1 in a weekend or 7 days without hiring developers or buying expensive gear?',
    helper: 'PDF guides, checklists, spreadsheets, video walkthroughs, and pattern packs are fast to ship.',
  },
  {
    id: 'q6',
    number: 6,
    question: 'Is the problem urgent enough that someone would pay TSh 10,000–30,000 ($5–$15) today to skip trial and error?',
    helper: 'Ask whether saving hours, avoiding a costly mistake, or landing a result justifies a modest price.',
  },
  {
    id: 'q7',
    number: 7,
    question: 'Do you already have a direct way to reach these buyers (WhatsApp Status, IG, Threads, local community, or referrals)?',
    helper: 'No distribution channel means even a good product sits unseen.',
  },
  {
    id: 'q8',
    number: 8,
    question: 'Are you willing to ask 10 people about their problem before creating the final slides or pages?',
    helper: 'Testing first protects your time. Guessing for weeks is the expensive option.',
  },
];

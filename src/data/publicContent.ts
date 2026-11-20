export interface SellabilityQuestion {
  id: string;
  number: number;
  question: string;
  helper: string;
}

export const SELLABILITY_QUESTIONS: SellabilityQuestion[] = [
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

export const PUBLIC_STEP_OVERVIEW = [
  {
    id: 'step-1',
    number: 1,
    title: 'Your Skill Inventory',
    pageRange: 'Pages 3–6',
    timeEstimate: '25 mins',
    buyerAction: 'List what you know, what people ask you for help with, and problems you have personally solved.',
  },
  {
    id: 'step-2',
    number: 2,
    title: 'Idea Generator',
    pageRange: 'Pages 7–11',
    timeEstimate: '30 mins',
    buyerAction: 'Generate 10 clear concepts using: "A [format] that helps [who] to [result]."',
  },
  {
    id: 'step-3',
    number: 3,
    title: 'The Scoring Sheet',
    pageRange: 'Pages 12–16',
    timeEstimate: '25 mins',
    buyerAction: 'Score each idea on Demand, Helpfulness, Effort to Build, Price Potential, and Reach.',
  },
  {
    id: 'step-4',
    number: 4,
    title: 'Talk to 10 People',
    pageRange: 'Pages 17–21',
    timeEstimate: '1–2 days',
    buyerAction: 'Message 10 real people to ask about their problem—zero pitching in this step.',
  },
  {
    id: 'step-5',
    number: 5,
    title: 'The Pre-Sell Test',
    pageRange: 'Pages 22–26',
    timeEstimate: '48 hours',
    buyerAction: 'Post a simple pre-sell message on WhatsApp Status, Instagram, or Threads to test paid intent.',
  },
  {
    id: 'step-6',
    number: 6,
    title: 'Decision Time',
    pageRange: 'Pages 27–32',
    timeEstimate: '20 mins',
    buyerAction: 'Complete the Build / Fix / Drop checklist and follow the 7-day build plan if your idea passes.',
  },
];

export const SALES_FAQ = [
  {
    q: 'Do I need experience?',
    a: 'No. It is made for beginners. Every step uses plain language, fill-in-the-blank prompts, and worked examples so you can finish in one weekend.',
  },
  {
    q: 'Do I need a computer?',
    a: 'No. You can do everything on your phone—including filling out the checklist, copying the Swahili & English WhatsApp scripts, and scoring your ideas.',
  },
  {
    q: 'Will this guarantee sales?',
    a: 'No. It helps you test before you build, and a tested idea gives you better odds than a guess.',
  },
  {
    q: 'What if I already have a product?',
    a: 'You can still use it to test your next one—or run an existing slow-selling idea through Step 4 and Step 5 to see what buyers actually want fixed.',
  },
  {
    q: 'How do I unlock the Kit Workspace & ZIP after paying on Selar?',
    a: 'All real payments run through Selar at TSh 15,000 / USD $7 (Mobile Money or Card). Once your paid Selar order is confirmed, you receive an individual Paid Member Access Key to unlock the Kit Workspace, scripts, worked examples, and the offline .zip bundle.',
  },
];

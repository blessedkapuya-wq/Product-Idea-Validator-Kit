export type KitSectionId =
  | 'full-guide'
  | 'step-1'
  | 'step-2'
  | 'step-3'
  | 'step-4'
  | 'step-5'
  | 'step-6'
  | 'scripts'
  | 'presell'
  | 'examples'
  | 'red-flags'
  | 'cover'
  | 'next-steps';

export interface IdeaScores {
  demand: number;
  helpfulness: number;
  easeToBuild: number;
  pricePotential: number;
  reachBuyers: number;
}

export interface ProductIdea {
  id: string;
  format: string;
  audience: string;
  result: string;
  title: string;
  scores: IdeaScores;
  notes: string;
}

export interface SkillInventoryData {
  whatIKnow: string[];
  askedForHelp: string[];
  problemsSolved: string[];
}

export interface OutreachContact {
  id: string;
  name: string;
  channel: string;
  problemConfirmed: 'yes' | 'partial' | 'no' | 'pending';
  exactQuote: string;
  urgencyNote: string;
}

export interface PreSellLog {
  id: string;
  platform: 'WhatsApp Status' | 'Instagram' | 'Threads';
  offerLine: string;
  priceTested: string;
  repliesCount: number;
  wouldPayCount: number;
  depositsCount: number;
  outcomeNotes: string;
}

export interface DecisionData {
  checks: Record<string, boolean>;
  verdict: 'build' | 'fix' | 'drop' | null;
  chosenIdeaTitle: string;
  sevenDayPlan: {
    day: number;
    focus: string;
    task: string;
    done: boolean;
  }[];
}

export interface WorkspaceState {
  skillInventory: SkillInventoryData;
  ideas: ProductIdea[];
  outreach: OutreachContact[];
  preSellLogs: PreSellLog[];
  redFlagsChecked: Record<string, boolean>;
  decision: DecisionData;
  scriptVariables: {
    topic: string;
    audience: string;
    priceTsh: string;
    priceUsd: string;
  };
}

export interface GuideStepMeta {
  id: 'step-1' | 'step-2' | 'step-3' | 'step-4' | 'step-5' | 'step-6';
  number: number;
  title: string;
  pageRange: string;
  timeEstimate: string;
  summary: string;
  buyerAction: string;
}

export interface ScriptTemplate {
  id: string;
  number: number;
  title: string;
  whenToUse: string;
  goal: string;
  english: string;
  swahili: string;
}

export interface PreSellTemplate {
  id: string;
  platform: 'WhatsApp Status' | 'Instagram' | 'Threads';
  formatNote: string;
  english: string;
  swahili: string;
}

export interface WorkedExample {
  id: string;
  regionTag: string;
  creatorRole: string;
  productTitle: string;
  format: string;
  targetPrice: string;
  step1Skill: string;
  step2Formula: string;
  step3Scores: {
    demand: number;
    helpfulness: number;
    easeToBuild: number;
    pricePotential: number;
    reachBuyers: number;
    total: number;
    runnerUpTitle: string;
    runnerUpTotal: number;
  };
  step4Conversations: string;
  step5PreSell: string;
  step6Decision: 'BUILD' | 'FIX -> BUILD' | 'DROP';
  step6Summary: string;
}

export interface RedFlagItem {
  id: string;
  number: number;
  title: string;
  whyItMatters: string;
}

export interface PaidKitBundleData {
  session: {
    keyId: string;
    orderRef?: string;
    expiresAt: number;
  };
  guideSteps: GuideStepMeta[];
  conversationScripts: ScriptTemplate[];
  presellTemplates: PreSellTemplate[];
  workedExamples: WorkedExample[];
  redFlags: RedFlagItem[];
  defaultWorkspaceState: WorkspaceState;
}

export type AppRoute = 'sales' | 'checklist' | 'access' | 'kit' | 'examples';

export interface PublicConfig {
  priceTsh: number;
  originalPriceTsh: number;
  priceUsd: number;
  checkoutConfigured: boolean;
  checkoutUrl: string | null;
  accessVerificationConfigured: boolean;
}

export interface SessionState {
  loading: boolean;
  authenticated: boolean;
  keyId?: string;
  orderRef?: string;
}

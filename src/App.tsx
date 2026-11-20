/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useState } from 'react';
import { CheckoutModal } from './components/CheckoutModal';
import { FreeChecklistView } from './components/FreeChecklistView';
import { Header } from './components/Header';
import { PaidAccessGate } from './components/PaidAccessGate';
import { PaidBundleHost } from './components/PaidBundleHost';
import { SalesPage } from './components/SalesPage';
import type { AppRoute, PublicConfig, SessionState } from './types/public';

const DEFAULT_PUBLIC_CONFIG: PublicConfig = {
  priceTsh: 15000,
  originalPriceTsh: 30000,
  priceUsd: 7,
  checkoutConfigured: true,
  checkoutUrl: 'https://selar.com/17tgm219sm',
  accessVerificationConfigured: false,
};

function getInitialRoute(): AppRoute {
  if (typeof window === 'undefined') return 'sales';
  const hash = window.location.hash.replace('#', '');
  if (
    hash === 'checklist' ||
    hash === 'kit' ||
    hash === 'examples' ||
    hash === 'access' ||
    hash === 'sales'
  ) {
    return hash;
  }
  return 'sales';
}

export default function App() {
  const [activeRoute, setActiveRoute] = useState<AppRoute>(getInitialRoute);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [publicConfig, setPublicConfig] = useState<PublicConfig>(DEFAULT_PUBLIC_CONFIG);
  const [session, setSession] = useState<SessionState>({
    loading: true,
    authenticated: false,
  });

  const refreshServerState = useCallback(async () => {
    try {
      const [cfgRes, sessionRes] = await Promise.all([
        fetch('/api/public/config', { cache: 'no-store' }),
        fetch('/api/auth/session', { credentials: 'include', cache: 'no-store' }),
      ]);

      if (cfgRes.ok) {
        const cfg = (await cfgRes.json()) as PublicConfig;
        setPublicConfig({
          ...cfg,
          checkoutConfigured: true,
          checkoutUrl: cfg.checkoutConfigured && cfg.checkoutUrl
            ? cfg.checkoutUrl
            : DEFAULT_PUBLIC_CONFIG.checkoutUrl,
        });
      }
      if (sessionRes.ok) {
        const sess = (await sessionRes.json()) as {
          authenticated: boolean;
          keyId?: string;
          orderRef?: string;
        };
        setSession({
          loading: false,
          authenticated: Boolean(sess.authenticated),
          keyId: sess.keyId,
          orderRef: sess.orderRef,
        });
      } else {
        setSession({ loading: false, authenticated: false });
      }
    } catch {
      setSession({ loading: false, authenticated: false });
    }
  }, []);

  useEffect(() => {
    refreshServerState();
  }, [refreshServerState]);

  const navigateTo = useCallback((route: AppRoute) => {
    setCheckoutOpen(false);
    setActiveRoute(route);
    if (window.location.hash !== `#${route}`) {
      window.history.replaceState(null, '', `#${route}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const onHashChange = () => {
      setActiveRoute(getInitialRoute());
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const handleUnlockSuccess = useCallback(async () => {
    await refreshServerState();
    setActiveRoute((prev) => (prev === 'examples' ? 'examples' : 'kit'));
    const nextHash = activeRoute === 'examples' ? '#examples' : '#kit';
    if (window.location.hash !== nextHash) {
      window.history.replaceState(null, '', nextHash);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeRoute, refreshServerState]);

  const handleSessionInvalid = useCallback(() => {
    setSession({ loading: false, authenticated: false });
    setActiveRoute((prev) => (prev === 'kit' || prev === 'examples' ? 'access' : prev));
  }, []);

  const isPaidRoute = activeRoute === 'kit' || activeRoute === 'examples' || activeRoute === 'access';

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F3E9] text-[#18291F]">
      <Header
        activeRoute={activeRoute}
        isAuthenticated={session.authenticated}
        onNavigate={navigateTo}
        onOpenCheckout={() => setCheckoutOpen(true)}
      />

      {/* Compact non-sticky mobile route switcher (< 640px) */}
      <div className="sm:hidden bg-[#EDE7D6] border-b border-[#C29B48]/40 px-3 py-2 flex items-center gap-1.5 overflow-x-auto no-print">
        {(
          [
            { id: 'sales', label: 'Sales Page' },
            { id: 'checklist', label: '3-Min Check' },
            { id: 'kit', label: 'Kit Workspace' },
            { id: 'examples', label: 'Examples' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => navigateTo(tab.id)}
            className={`px-3 py-1.5 text-xs font-semibold rounded whitespace-nowrap shrink-0 cursor-pointer ${
              activeRoute === tab.id
                ? 'bg-[#183926] text-[#C29B48]'
                : 'bg-white/70 text-[#18291F]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1">
        {activeRoute === 'sales' && (
          <SalesPage
            publicConfig={publicConfig}
            session={session}
            onOpenCheckout={() => setCheckoutOpen(true)}
            onNavigate={navigateTo}
            onUnlockSuccess={handleUnlockSuccess}
          />
        )}

        {activeRoute === 'checklist' && (
          <FreeChecklistView
            isAuthenticated={session.authenticated}
            onOpenCheckout={() => setCheckoutOpen(true)}
            onOpenKit={() => navigateTo('kit')}
          />
        )}

        {isPaidRoute && session.loading && (
          <div className="max-w-3xl mx-auto px-4 py-16 text-center">
            <div className="inline-block bg-white border border-[#C29B48] px-6 py-4 text-sm font-medium text-[#183926]">
              Checking paid member session...
            </div>
          </div>
        )}

        {isPaidRoute && !session.loading && !session.authenticated && (
          <PaidAccessGate
            requestedAreaLabel={
              activeRoute === 'examples'
                ? 'Worked Examples'
                : 'the Product Idea Validator Kit'
            }
            publicConfig={publicConfig}
            onUnlockSuccess={handleUnlockSuccess}
            onGoToChecklist={() => navigateTo('checklist')}
            onGoToSalesPage={() => navigateTo('sales')}
          />
        )}

        {(activeRoute === 'kit' || activeRoute === 'examples') &&
          !session.loading &&
          session.authenticated && (
            <PaidBundleHost
              view={activeRoute === 'examples' ? 'examples' : 'kit'}
              onSwitchView={(v) => navigateTo(v)}
              onSessionInvalid={handleSessionInvalid}
            />
          )}

        {activeRoute === 'access' && !session.loading && session.authenticated && (
          <PaidBundleHost
            view="kit"
            onSwitchView={(v) => navigateTo(v)}
            onSessionInvalid={handleSessionInvalid}
          />
        )}
      </div>

      {/* Quiet Editorial Footer */}
      <footer className="bg-[#183926] text-[#EDE7D6] border-t-2 border-[#C29B48] no-print">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="text-sm font-bold tracking-[0.14em] uppercase text-white">
              Biashara Base · biasharabase.com
            </div>
            <p className="text-xs text-[#EDE7D6]/75 max-w-md leading-relaxed">
              Product Idea Validator Kit. Test your idea cheaply before spending weeks building. A good score improves your odds, but never guarantees sales or income.
            </p>
          </div>

          <nav className="flex flex-wrap items-center gap-5 text-xs font-medium text-[#EDE7D6]/85">
            <button
              type="button"
              onClick={() => navigateTo('sales')}
              className="hover:text-[#C29B48] cursor-pointer"
            >
              Sales Page
            </button>
            <button
              type="button"
              onClick={() => navigateTo('checklist')}
              className="hover:text-[#C29B48] cursor-pointer"
            >
              Free 3-Min Check
            </button>
            <button
              type="button"
              onClick={() => navigateTo('kit')}
              className="hover:text-[#C29B48] cursor-pointer"
            >
              {session.authenticated ? 'Interactive Kit' : 'Member Key Sign-In'}
            </button>
            <button
              type="button"
              onClick={() => navigateTo('examples')}
              className="hover:text-[#C29B48] cursor-pointer"
            >
              Worked Examples
            </button>
          </nav>
        </div>
      </footer>

      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        publicConfig={publicConfig}
        session={session}
        onUnlockSuccess={handleUnlockSuccess}
        onOpenKit={() => navigateTo('kit')}
        onGoToSalesPage={() => navigateTo('sales')}
      />
    </div>
  );
}

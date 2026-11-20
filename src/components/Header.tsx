import { Lock, Menu, ShieldCheck, X } from 'lucide-react';
import { useState } from 'react';
import type { AppRoute } from '../types/public';

interface HeaderProps {
  activeRoute: AppRoute;
  isAuthenticated: boolean;
  onNavigate: (route: AppRoute) => void;
  onOpenCheckout: () => void;
}

export function Header({
  activeRoute,
  isAuthenticated,
  onNavigate,
  onOpenCheckout,
}: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems: { id: AppRoute; label: string; gated?: boolean }[] = [
    { id: 'sales', label: 'Sales Page' },
    { id: 'checklist', label: '3-Min Check' },
    { id: 'kit', label: 'Kit Workspace', gated: true },
    { id: 'examples', label: 'Worked Examples', gated: true },
  ];

  const handleNav = (route: AppRoute) => {
    onNavigate(route);
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-[#183926] border-b-2 border-[#C29B48] no-print">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 sm:gap-8">
        {/* Zone 1: Single text element wordmark */}
        <button
          type="button"
          onClick={() => handleNav('sales')}
          className="text-sm sm:text-base font-bold tracking-[0.14em] uppercase text-[#F7F3E9] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C29B48] cursor-pointer"
        >
          Biashara Base
        </button>

        {/* Zone 2: 4 concise single-line text links */}
        <nav
          aria-label="Primary navigation"
          className="hidden sm:flex items-center gap-4 lg:gap-6 text-xs lg:text-sm font-medium text-[#EDE7D6]/85"
        >
          {navItems.map((item) => {
            const isActive = activeRoute === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNav(item.id)}
                className={`inline-flex items-center gap-1.5 py-1.5 border-b-2 transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C29B48] ${
                  isActive
                    ? 'border-[#C29B48] text-white font-semibold'
                    : 'border-transparent hover:text-white hover:border-[#C29B48]/50'
                }`}
              >
                {item.gated && !isAuthenticated && (
                  <Lock className="w-3 h-3 text-[#C29B48]" aria-hidden="true" />
                )}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          {isAuthenticated ? (
            <button
              type="button"
              onClick={() => handleNav('kit')}
              className="hidden md:inline-flex items-center gap-1.5 justify-center px-4 py-2 text-xs sm:text-sm font-bold text-[#183926] bg-[#C29B48] rounded hover:bg-[#AE8838] transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F7F3E9]"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Open Member Kit</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenCheckout}
              className="hidden md:inline-flex items-center justify-center px-4 py-2 text-xs sm:text-sm font-bold text-[#183926] bg-[#C29B48] rounded hover:bg-[#AE8838] transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F7F3E9]"
            >
              Get the Validator Kit
            </button>
          )}

          <button
            type="button"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((prev) => !prev)}
            className="sm:hidden inline-flex items-center justify-center w-11 h-11 rounded border border-[#C29B48]/40 text-[#F7F3E9] hover:bg-[#224B33] cursor-pointer"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="sm:hidden border-t border-[#C29B48]/30 bg-[#122B1C] px-4 py-3 space-y-1">
          {navItems.map((item) => {
            const isActive = activeRoute === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center justify-between text-left px-3 py-2.5 rounded text-sm font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#224B33] text-[#C29B48] font-semibold'
                    : 'text-[#F7F3E9] hover:bg-[#183926]'
                }`}
              >
                <span>{item.label}</span>
                {item.gated && !isAuthenticated && (
                  <Lock className="w-3.5 h-3.5 text-[#C29B48]" aria-hidden="true" />
                )}
              </button>
            );
          })}
          <div className="pt-2 border-t border-[#C29B48]/20">
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                if (isAuthenticated) {
                  handleNav('kit');
                } else {
                  onOpenCheckout();
                }
              }}
              className="w-full px-4 py-2.5 text-sm font-bold text-[#183926] bg-[#C29B48] rounded hover:bg-[#AE8838] transition-colors cursor-pointer"
            >
              {isAuthenticated ? 'Open Member Kit' : 'Get the Validator Kit'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

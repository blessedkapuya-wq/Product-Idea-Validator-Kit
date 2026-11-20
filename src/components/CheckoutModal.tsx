import { ArrowRight, Check, ExternalLink, KeyRound, Lock, ShieldCheck, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { PublicConfig, SessionState } from '../types/public';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  publicConfig: PublicConfig;
  session: SessionState;
  onUnlockSuccess: () => Promise<void> | void;
  onOpenKit: () => void;
  onGoToSalesPage?: () => void;
}

export function CheckoutModal({
  isOpen,
  onClose,
  publicConfig,
  session,
  onUnlockSuccess,
  onOpenKit,
  onGoToSalesPage,
}: CheckoutModalProps) {
  const [mode, setMode] = useState<'buy' | 'unlock'>('buy');
  const [accessKey, setAccessKey] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicConfig.accessVerificationConfigured) {
      setError('Paid access verification is not configured on the server yet.');
      return;
    }
    const trimmed = accessKey.trim();
    if (!trimmed) {
      setError('Enter your Paid Member Access Key.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/auth/unlock', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessKey: trimmed }),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(body.error || 'Invalid Paid Member Access Key.');
        return;
      }
      setAccessKey('');
      await onUnlockSuccess();
      onClose();
    } catch {
      setError('Could not reach verification server. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#122B1C]/75 backdrop-blur-xs"
    >
      <div className="relative w-full max-w-lg bg-[#F7F3E9] border border-[#C29B48] shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="px-6 py-4 bg-[#183926] text-[#F7F3E9] border-b-2 border-[#C29B48] flex items-center justify-between gap-4">
          <div>
            <h2 id="checkout-modal-title" className="font-display text-lg font-bold text-white">
              Get the Product Idea Validator Kit
            </h2>
            <p className="text-xs text-[#EDE7D6]/80 mt-0.5">
              Selar Checkout (TSh 15,000 / $7) · Paid Member Access Key
            </p>
          </div>
          <button
            type="button"
            aria-label="Close modal"
            onClick={onClose}
            className="w-9 h-9 inline-flex items-center justify-center rounded text-[#EDE7D6] hover:bg-[#264E36] hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {session.authenticated ? (
          <div className="p-6 sm:p-8 space-y-5 bg-[#F7F3E9]">
            <div className="w-11 h-11 bg-[#183926] text-[#C29B48] flex items-center justify-center">
              <Check className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h3 className="font-display text-xl font-bold text-[#183926]">
                Paid Member Session Active
              </h3>
              <p className="text-sm text-[#526056] leading-relaxed">
                Your session is verified{session.orderRef ? ` for Selar order ${session.orderRef}` : ''}. Open the interactive workspace to use the tools or download your customer <code className="font-mono-tabular text-xs">.zip</code> bundle.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenKit();
              }}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold text-[#183926] bg-[#C29B48] rounded hover:bg-[#AE8838] transition-colors cursor-pointer"
            >
              <span>Open Paid Kit Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="p-6 space-y-5 bg-[#F7F3E9]">
            {/* Mode Switch */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-[#EDE7D6] border border-[#C29B48]/45">
              <button
                type="button"
                onClick={() => {
                  setMode('buy');
                  setError('');
                }}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 text-xs sm:text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  mode === 'buy'
                    ? 'bg-[#183926] text-[#C29B48] font-semibold'
                    : 'text-[#18291F] hover:bg-white/60'
                }`}
              >
                <ExternalLink className="w-4 h-4 shrink-0" />
                <span>Pay via Selar</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('unlock');
                  setError('');
                }}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 text-xs sm:text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  mode === 'unlock'
                    ? 'bg-[#183926] text-[#C29B48] font-semibold'
                    : 'text-[#18291F] hover:bg-white/60'
                }`}
              >
                <KeyRound className="w-4 h-4 shrink-0" />
                <span>Enter Member Key</span>
              </button>
            </div>

            {/* Price Summary Line */}
            <div className="flex items-baseline justify-between py-3 px-4 bg-[#183926] text-[#F7F3E9] border border-[#C29B48]/50">
              <div>
                <div className="text-xs font-medium text-[#C29B48]">Biashara Base Launch Price</div>
                <div className="text-sm font-semibold text-white">
                  Product Idea Validator Kit
                </div>
              </div>
              <div className="text-right shrink-0">
                <div>
                  <span className="font-mono-tabular text-xs text-[#EDE7D6]/55 line-through mr-1.5">
                    TSh {publicConfig.originalPriceTsh.toLocaleString()}
                  </span>
                  <span className="font-mono-tabular text-lg font-bold text-[#C29B48]">
                    TSh {publicConfig.priceTsh.toLocaleString()}
                  </span>
                </div>
                <div className="font-mono-tabular text-xs text-[#EDE7D6]/85">
                  or ${publicConfig.priceUsd} USD
                </div>
              </div>
            </div>

            {mode === 'buy' ? (
              <div className="space-y-4">
                <p className="text-xs text-[#526056] leading-relaxed bg-white border border-[#183926]/15 p-4">
                  Real purchases are processed solely on <strong>Selar</strong> (Tanzania Mobile Money &amp; international cards). After your paid Selar order is confirmed, enter your individual Paid Member Access Key to unlock the Kit Workspace, scripts, worked examples, and customer <code className="font-mono-tabular">.zip</code>.
                </p>

                {publicConfig.checkoutConfigured && publicConfig.checkoutUrl ? (
                  <a
                    href={publicConfig.checkoutUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-5 text-sm font-bold tracking-[0.06em] uppercase text-[#183926] bg-[#C29B48] rounded hover:bg-[#AE8838] transition-colors"
                  >
                    <span>
                      Pay on Selar · TSh {publicConfig.priceTsh.toLocaleString()} / ${publicConfig.priceUsd}
                    </span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                ) : (
                  <button
                    type="button"
                    disabled
                    aria-disabled="true"
                    className="w-full py-3.5 px-5 text-sm font-bold tracking-[0.06em] uppercase text-[#526056] bg-white border border-[#183926]/20 rounded opacity-70 cursor-not-allowed"
                  >
                    Selar Checkout Unavailable (Server Setup Pending)
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setMode('unlock')}
                  className="w-full text-center text-xs font-semibold text-[#183926] hover:underline underline-offset-4 cursor-pointer"
                >
                  Already have a Paid Member Access Key? Unlock here →
                </button>
              </div>
            ) : (
              <form onSubmit={handleUnlock} className="space-y-4">
                {!publicConfig.accessVerificationConfigured && (
                  <div
                    role="alert"
                    className="bg-[#F5E8E4] border border-[#9A3412]/35 p-3 text-xs text-[#9A3412]"
                  >
                    Paid key verification is disabled until server secrets are configured.
                  </div>
                )}

                <div>
                  <label htmlFor="modal-member-key" className="block text-xs font-bold text-[#183926] mb-1.5">
                    Paid Member Access Key
                  </label>
                  <input
                    id="modal-member-key"
                    type="text"
                    autoComplete="off"
                    spellCheck={false}
                    value={accessKey}
                    onChange={(e) => setAccessKey(e.target.value)}
                    disabled={!publicConfig.accessVerificationConfigured || submitting}
                    placeholder="BB1.eyJ2Ijox..."
                    className="w-full px-3.5 py-2.5 text-sm font-mono-tabular text-[#18291F] bg-white border border-[#183926]/25 rounded focus:outline-none focus:border-[#183926] disabled:opacity-55"
                  />
                </div>

                {error && (
                  <p role="alert" className="text-xs font-medium text-[#9A3412] bg-[#F5E8E4] border border-[#9A3412]/30 px-3 py-2">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={!publicConfig.accessVerificationConfigured || submitting}
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-5 text-sm font-bold tracking-[0.06em] uppercase text-[#183926] bg-[#C29B48] rounded hover:bg-[#AE8838] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  {submitting ? 'Verifying Key...' : 'Verify Key & Unlock Kit'}
                </button>
              </form>
            )}

            <div className="flex items-start justify-between gap-3 text-xs text-[#526056] leading-relaxed pt-2 border-t border-[#C29B48]/30">
              <div className="flex items-start gap-2">
                <Lock className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#9A772F]" />
                <span>
                  Honest promise: This kit helps you test ideas cheaply before building; it never promises sales or income.
                </span>
              </div>
              {onGoToSalesPage && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onGoToSalesPage();
                  }}
                  className="shrink-0 font-semibold text-[#183926] underline decoration-[#C29B48] underline-offset-4 hover:text-[#9A772F] cursor-pointer whitespace-nowrap"
                >
                  View Sales Page
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

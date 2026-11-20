import { ArrowRight, Check, ExternalLink, KeyRound, Lock, ShieldCheck } from 'lucide-react';
import { useId, useState } from 'react';
import type { PublicConfig, SessionState } from '../types/public';

interface InlineOfferCardProps {
  id?: string;
  publicConfig: PublicConfig;
  session: SessionState;
  onUnlockSuccess: () => Promise<void> | void;
  onOpenKit: () => void;
}

export function InlineOfferCard({
  id = 'get-kit-card',
  publicConfig,
  session,
  onUnlockSuccess,
  onOpenKit,
}: InlineOfferCardProps) {
  const uid = useId();
  const [mode, setMode] = useState<'buy' | 'unlock'>('buy');
  const [accessKey, setAccessKey] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicConfig.accessVerificationConfigured) {
      setError('Paid access verification is not configured on the server yet.');
      return;
    }
    const trimmed = accessKey.trim();
    if (!trimmed) {
      setError('Enter the Paid Member Access Key issued for your Selar order.');
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
    } catch {
      setError('Could not reach verification server. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      id={id}
      className="w-full bg-[#F7F3E9] border border-[#C29B48] shadow-sm overflow-hidden"
    >
      {/* Top Dark Evergreen Header */}
      <div className="px-6 py-4 bg-[#183926] text-[#F7F3E9] border-b-2 border-[#C29B48]">
        <h2 className="font-display text-xl font-bold text-white">
          Get the Product Idea Validator Kit
        </h2>
        <p className="text-xs text-[#EDE7D6]/85 mt-0.5">
          Real checkout via Selar · Paid Member Access Key unlocks the kit
        </p>
      </div>

      {session.authenticated ? (
        <div className="p-6 space-y-5 bg-[#F7F3E9]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#183926] text-[#C29B48] flex items-center justify-center shrink-0">
              <Check className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-[#183926]">
                Paid Member Session Active
              </h3>
              <p className="text-xs text-[#526056]">
                Verified key{session.orderRef ? ` · Order ${session.orderRef}` : ''}
              </p>
            </div>
          </div>

          <div className="bg-[#EDE7D6] border border-[#C29B48]/45 p-4 space-y-1.5 text-xs text-[#18291F]">
            <div className="font-bold text-[#183926]">Unlocked for your session:</div>
            <div>+ 6-Step Interactive Kit Workspace &amp; Scoring Sheet</div>
            <div>+ 5 Swahili &amp; English Scripts + Pre-Sell Slide Maker</div>
            <div>+ 3 Digital Creator Worked Examples + 10 Red Flags Audit</div>
            <div>+ Exact Customer Bundle Download (.zip)</div>
          </div>

          <button
            type="button"
            onClick={onOpenKit}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 text-xs sm:text-sm font-bold tracking-[0.06em] uppercase text-[#183926] bg-[#C29B48] rounded hover:bg-[#AE8838] transition-colors cursor-pointer"
          >
            <span>Open Paid Kit Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="p-6 space-y-4 bg-[#F7F3E9]">
          {/* Mode Switch: Buy via Selar vs Enter Access Key */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#EDE7D6] border border-[#C29B48]/45">
            <button
              type="button"
              onClick={() => {
                setMode('buy');
                setError('');
              }}
              className={`flex items-center justify-center gap-2 py-2.5 px-2 text-xs sm:text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
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
              className={`flex items-center justify-center gap-2 py-2.5 px-2 text-xs sm:text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                mode === 'unlock'
                  ? 'bg-[#183926] text-[#C29B48] font-semibold'
                  : 'text-[#18291F] hover:bg-white/60'
              }`}
            >
              <KeyRound className="w-4 h-4 shrink-0" />
              <span>Have a Member Key?</span>
            </button>
          </div>

          {/* Dark Evergreen Price Summary Strip */}
          <div className="flex items-center justify-between gap-3 py-3 px-4 bg-[#183926] text-[#F7F3E9] border border-[#C29B48]/50">
            <div>
              <div className="text-xs font-medium text-[#C29B48]">Biashara Base Launch Price</div>
              <div className="text-sm font-bold text-white">Product Idea Validator Kit</div>
            </div>
            <div className="text-right shrink-0">
              <div className="flex items-baseline gap-2 justify-end">
                <span className="font-mono-tabular text-xs text-[#EDE7D6]/55 line-through">
                  TSh {publicConfig.originalPriceTsh.toLocaleString()}
                </span>
                <span className="font-mono-tabular text-lg font-bold text-[#C29B48]">
                  TSh {publicConfig.priceTsh.toLocaleString()}
                </span>
              </div>
              <div className="font-mono-tabular text-xs text-[#EDE7D6]/85">
                or USD ${publicConfig.priceUsd} (Card / Mobile Money)
              </div>
            </div>
          </div>

          {mode === 'buy' ? (
            <div className="space-y-4">
              <div className="bg-white border border-[#183926]/15 p-4 space-y-2 text-xs text-[#18291F] leading-relaxed">
                <div className="font-bold text-[#183926]">How delivery &amp; member access work:</div>
                <p className="text-[#526056]">
                  1. Complete payment securely on <strong>Selar</strong> (M-Pesa, Mixx by Yas, Airtel Money, or international card).
                </p>
                <p className="text-[#526056]">
                  2. After your paid Selar order is confirmed, you receive an individual <strong>Paid Member Access Key</strong> (<code className="font-mono-tabular">BB1...</code>).
                </p>
                <p className="text-[#526056]">
                  3. Enter that key under <em>Have a Member Key?</em> to unlock the workspace, scripts, examples, and exact customer <code className="font-mono-tabular">.zip</code>.
                </p>
              </div>

              {publicConfig.checkoutConfigured && publicConfig.checkoutUrl ? (
                <a
                  href={publicConfig.checkoutUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-5 text-xs sm:text-sm font-bold tracking-[0.06em] uppercase text-[#183926] bg-[#C29B48] rounded hover:bg-[#AE8838] transition-colors"
                >
                  <span>
                    Buy on Selar · TSh {publicConfig.priceTsh.toLocaleString()} / ${publicConfig.priceUsd}
                  </span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  aria-disabled="true"
                  className="w-full py-3.5 px-5 text-xs sm:text-sm font-bold tracking-[0.06em] uppercase text-[#526056] bg-white border border-[#183926]/20 rounded opacity-70 cursor-not-allowed"
                >
                  Selar Checkout Unavailable (Server Setup Pending)
                </button>
              )}

              <button
                type="button"
                onClick={() => setMode('unlock')}
                className="w-full text-center text-xs font-semibold text-[#183926] hover:underline underline-offset-4 cursor-pointer"
              >
                Already bought on Selar? Enter your Paid Member Access Key →
              </button>
            </div>
          ) : (
            <form onSubmit={handleUnlock} className="space-y-3.5">
              {!publicConfig.accessVerificationConfigured && (
                <div
                  role="alert"
                  className="bg-[#F5E8E4] border border-[#9A3412]/35 p-3 text-xs text-[#9A3412]"
                >
                  Server verification is failing closed because server secrets are not configured yet.
                </div>
              )}

              <div>
                <label
                  htmlFor={`${uid}-key`}
                  className="block text-xs font-bold text-[#183926] mb-1.5"
                >
                  Paid Member Access Key
                </label>
                <input
                  id={`${uid}-key`}
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
                <p
                  role="alert"
                  className="text-xs font-medium text-[#9A3412] bg-[#F5E8E4] border border-[#9A3412]/30 px-3 py-2"
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={!publicConfig.accessVerificationConfigured || submitting}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-5 text-xs sm:text-sm font-bold tracking-[0.06em] uppercase text-[#183926] bg-[#C29B48] rounded hover:bg-[#AE8838] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                {submitting ? 'Verifying Key...' : 'Unlock Validator Kit'}
              </button>
            </form>
          )}

          <div className="flex items-start gap-2 text-xs text-[#526056] leading-relaxed pt-1 border-t border-[#C29B48]/30">
            <Lock className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#9A772F]" />
            <span>
              Honest promise: This kit helps you test ideas cheaply before building; it never promises sales or income.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

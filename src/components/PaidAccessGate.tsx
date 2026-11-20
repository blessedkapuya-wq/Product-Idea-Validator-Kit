import { ExternalLink, KeyRound, Lock, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import type { PublicConfig } from '../types/public';

interface PaidAccessGateProps {
  requestedAreaLabel: string;
  publicConfig: PublicConfig;
  onUnlockSuccess: () => Promise<void> | void;
  onGoToChecklist: () => void;
  onGoToSalesPage: () => void;
}

export function PaidAccessGate({
  requestedAreaLabel,
  publicConfig,
  onUnlockSuccess,
  onGoToChecklist,
  onGoToSalesPage,
}: PaidAccessGateProps) {
  const [accessKey, setAccessKey] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
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
    } catch {
      setError('Could not reach verification server. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <div className="bg-[#F7F3E9] border border-[#C29B48] overflow-hidden shadow-sm">
        <div className="px-6 py-5 bg-[#183926] text-[#F7F3E9] border-b-2 border-[#C29B48] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#264E36] border border-[#C29B48]/70 text-[#C29B48] flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold tracking-[0.14em] text-[#C29B48] uppercase">
                Paid Member Access Only
              </div>
              <h1 className="font-display text-xl sm:text-2xl font-bold text-white">
                Unlock {requestedAreaLabel}
              </h1>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          <p className="text-sm text-[#18291F]/85 leading-relaxed">
            The 6-step Kit Workspace, full digital creator worked examples, Swahili &amp; English scripts, 10 Red Flags audit, and downloadable customer <code className="font-mono-tabular text-xs bg-[#EDE7D6] px-1.5 py-0.5">.zip</code> bundle are reserved exclusively for verified paid members.
          </p>

          {!publicConfig.accessVerificationConfigured && (
            <div
              role="alert"
              className="bg-[#F5E8E4] border border-[#9A3412]/35 p-4 text-xs sm:text-sm text-[#9A3412]"
            >
              <strong>Verification unavailable:</strong> Paid member verification is failing closed because server security configuration has not been completed yet.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 bg-white border border-[#183926]/20 p-5">
            <div className="flex items-center gap-2 text-sm font-bold text-[#183926]">
              <KeyRound className="w-4 h-4 text-[#C29B48]" />
              <span>Enter Your Paid Member Access Key</span>
            </div>

            <div>
              <label
                htmlFor="paid-member-access-key"
                className="block text-xs font-medium text-[#526056] mb-1.5"
              >
                Access key issued after your paid Selar order (starts with <span className="font-mono-tabular">BB1.</span>)
              </label>
              <input
                id="paid-member-access-key"
                type="text"
                autoComplete="off"
                spellCheck={false}
                value={accessKey}
                onChange={(e) => setAccessKey(e.target.value)}
                disabled={!publicConfig.accessVerificationConfigured || submitting}
                placeholder="BB1.eyJ2Ijox..."
                className="w-full px-3.5 py-2.5 text-sm font-mono-tabular text-[#18291F] bg-[#F7F3E9] border border-[#183926]/25 rounded focus:outline-none focus:bg-white focus:border-[#183926] disabled:opacity-55"
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
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold tracking-[0.06em] uppercase text-[#183926] bg-[#C29B48] rounded hover:bg-[#AE8838] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              {submitting ? 'Verifying Access Key...' : 'Verify Key & Unlock Kit'}
            </button>
          </form>

          {/* Selar Purchase Card */}
          <div className="bg-[#EDE7D6] border border-[#C29B48]/55 p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="text-xs font-bold tracking-wider uppercase text-[#9A772F]">
                  Not a Paid Member Yet?
                </div>
                <div className="font-display text-lg font-bold text-[#183926]">
                  Get Full Access via Selar
                </div>
              </div>
              <div className="text-left sm:text-right">
                <span className="font-mono-tabular text-xs text-[#526056] line-through mr-2">
                  TSh {publicConfig.originalPriceTsh.toLocaleString()}
                </span>
                <span className="font-mono-tabular text-base font-bold text-[#183926]">
                  TSh {publicConfig.priceTsh.toLocaleString()} · ${publicConfig.priceUsd} USD
                </span>
              </div>
            </div>

            <p className="text-xs text-[#526056] leading-relaxed">
              Pay safely on Selar via Mobile Money (M-Pesa, Mixx by Yas, Airtel Money) or international card. Returning from Selar alone does not unlock access—you will receive an individual Paid Member Access Key once your paid order is verified.
            </p>

            {publicConfig.checkoutConfigured && publicConfig.checkoutUrl ? (
              <a
                href={publicConfig.checkoutUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold tracking-[0.06em] uppercase text-[#F7F3E9] bg-[#183926] rounded hover:bg-[#122B1C] transition-colors"
              >
                <span>Pay on Selar · TSh {publicConfig.priceTsh.toLocaleString()} / ${publicConfig.priceUsd}</span>
                <ExternalLink className="w-4 h-4 text-[#C29B48]" />
              </a>
            ) : (
              <button
                type="button"
                disabled
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold tracking-[0.06em] uppercase text-[#526056] bg-white border border-[#183926]/20 rounded opacity-70 cursor-not-allowed"
              >
                Selar Checkout Disabled (Not Yet Configured)
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#C29B48]/35 text-xs">
            <button
              type="button"
              onClick={onGoToChecklist}
              className="font-semibold text-[#183926] hover:underline cursor-pointer"
            >
              Try the Free 3-Minute Check instead →
            </button>
            <button
              type="button"
              onClick={onGoToSalesPage}
              className="text-[#526056] hover:text-[#183926] cursor-pointer"
            >
              Back to Sales Page
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

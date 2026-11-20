import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import type { PreSellTemplate, ScriptTemplate } from '../types';

interface ScriptPackViewProps {
  mode: 'conversation' | 'presell';
  conversationScripts: ScriptTemplate[];
  presellTemplates: PreSellTemplate[];
  variables: {
    topic: string;
    audience: string;
    priceTsh: string;
    priceUsd: string;
  };
  onChangeVariables: (next: {
    topic: string;
    audience: string;
    priceTsh: string;
    priceUsd: string;
  }) => void;
}

export function ScriptPackView({
  mode,
  conversationScripts,
  presellTemplates,
  variables,
  onChangeVariables,
}: ScriptPackViewProps) {
  const [language, setLanguage] = useState<'both' | 'en' | 'sw'>('both');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fillPlaceholders = (text: string) => {
    return text
      .replaceAll('{{topic}}', variables.topic.trim() || '[your topic]')
      .replaceAll('{{audience}}', variables.audience.trim() || '[your audience]')
      .replaceAll('{{priceTsh}}', variables.priceTsh.trim() || 'TSh 15,000')
      .replaceAll('{{priceUsd}}', variables.priceUsd.trim() || '$7');
  };

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId((curr) => (curr === id ? null : curr)), 1800);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedId(id);
      setTimeout(() => setCopiedId((curr) => (curr === id ? null : curr)), 1800);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#EDE7D6] border border-[#C29B48]/45 p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-[#183926]">
              Personalize your copy-paste templates
            </h3>
            <p className="text-xs text-[#526056] mt-0.5">
              Edit these fields once and every English &amp; Swahili message updates automatically.
            </p>
          </div>

          <div className="flex items-center gap-1 p-1 bg-white border border-[#183926]/20 rounded shrink-0 self-start">
            {(
              [
                { id: 'both', label: 'EN + Swahili' },
                { id: 'en', label: 'English' },
                { id: 'sw', label: 'Kiswahili' },
              ] as const
            ).map((lang) => (
              <button
                key={lang.id}
                type="button"
                onClick={() => setLanguage(lang.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer whitespace-nowrap ${
                  language === lang.id
                    ? 'bg-[#183926] text-[#C29B48] font-semibold'
                    : 'text-[#526056] hover:text-[#183926]'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-[#526056] mb-1">
              Problem / Topic
            </label>
            <input
              type="text"
              value={variables.topic}
              onChange={(e) => onChangeVariables({ ...variables, topic: e.target.value })}
              className="w-full px-3 py-2 text-xs text-[#18291F] bg-white border border-[#183926]/20 rounded focus:outline-none focus:border-[#183926]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#526056] mb-1">
              Who It Helps
            </label>
            <input
              type="text"
              value={variables.audience}
              onChange={(e) => onChangeVariables({ ...variables, audience: e.target.value })}
              className="w-full px-3 py-2 text-xs text-[#18291F] bg-white border border-[#183926]/20 rounded focus:outline-none focus:border-[#183926]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#526056] mb-1">
              Local Price (TSh)
            </label>
            <input
              type="text"
              value={variables.priceTsh}
              onChange={(e) => onChangeVariables({ ...variables, priceTsh: e.target.value })}
              className="w-full px-3 py-2 text-xs font-mono-tabular text-[#18291F] bg-white border border-[#183926]/20 rounded focus:outline-none focus:border-[#183926]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#526056] mb-1">
              International Price ($)
            </label>
            <input
              type="text"
              value={variables.priceUsd}
              onChange={(e) => onChangeVariables({ ...variables, priceUsd: e.target.value })}
              className="w-full px-3 py-2 text-xs font-mono-tabular text-[#18291F] bg-white border border-[#183926]/20 rounded focus:outline-none focus:border-[#183926]"
            />
          </div>
        </div>
      </div>

      {mode === 'conversation' ? (
        <div className="space-y-4">
          {conversationScripts.map((script) => {
            const enText = fillPlaceholders(script.english);
            const swText = fillPlaceholders(script.swahili);
            return (
              <div
                key={script.id}
                className="bg-white border border-[#183926]/20 p-5 sm:p-6 space-y-4"
              >
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 shrink-0 bg-[#183926] text-[#C29B48] font-display text-sm font-bold flex items-center justify-center mt-0.5">
                    {script.number}
                  </span>
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-[#9A772F]">{script.whenToUse}</div>
                    <h4 className="font-display text-lg font-bold text-[#183926]">
                      {script.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-[#526056]">{script.goal}</p>
                  </div>
                </div>

                <div
                  className={`grid gap-4 ${
                    language === 'both' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
                  }`}
                >
                  {(language === 'both' || language === 'en') && (
                    <div className="bg-[#F7F3E9] border border-[#183926]/15 p-4 flex flex-col justify-between gap-3">
                      <div className="space-y-2">
                        <div className="text-xs font-semibold text-[#526056]">English</div>
                        <p className="text-sm text-[#18291F] whitespace-pre-line leading-relaxed">
                          {enText}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(`${script.id}-en`, enText)}
                        className="self-start inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#183926] bg-white border border-[#183926]/20 rounded hover:bg-[#EDE7D6] transition-colors cursor-pointer"
                      >
                        {copiedId === `${script.id}-en` ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-[#183926]" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            Copy English
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {(language === 'both' || language === 'sw') && (
                    <div className="bg-[#EDE7D6]/60 border border-[#C29B48]/40 p-4 flex flex-col justify-between gap-3">
                      <div className="space-y-2">
                        <div className="text-xs font-semibold text-[#9A772F]">Kiswahili</div>
                        <p className="text-sm text-[#18291F] whitespace-pre-line leading-relaxed">
                          {swText}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(`${script.id}-sw`, swText)}
                        className="self-start inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#183926] bg-white border border-[#183926]/20 rounded hover:bg-[#F7F3E9] transition-colors cursor-pointer"
                      >
                        {copiedId === `${script.id}-sw` ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-[#183926]" />
                            Imenakiliwa
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            Copy Swahili
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4">
          {presellTemplates.map((tpl) => {
            const enText = fillPlaceholders(tpl.english);
            const swText = fillPlaceholders(tpl.swahili);
            return (
              <div
                key={tpl.id}
                className="bg-white border border-[#183926]/20 p-5 sm:p-6 space-y-4"
              >
                <div>
                  <h4 className="font-display text-lg font-bold text-[#183926]">{tpl.platform}</h4>
                  <p className="text-xs sm:text-sm text-[#526056] mt-1">{tpl.formatNote}</p>
                </div>

                <div
                  className={`grid gap-4 ${
                    language === 'both' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
                  }`}
                >
                  {(language === 'both' || language === 'en') && (
                    <div className="bg-[#F7F3E9] border border-[#183926]/15 p-4 flex flex-col justify-between gap-3">
                      <div className="space-y-2">
                        <div className="text-xs font-semibold text-[#526056]">English</div>
                        <p className="text-sm text-[#18291F] whitespace-pre-line leading-relaxed">
                          {enText}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(`${tpl.id}-en`, enText)}
                        className="self-start inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#183926] bg-white border border-[#183926]/20 rounded hover:bg-[#EDE7D6] transition-colors cursor-pointer"
                      >
                        {copiedId === `${tpl.id}-en` ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-[#183926]" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            Copy {tpl.platform} (EN)
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {(language === 'both' || language === 'sw') && (
                    <div className="bg-[#EDE7D6]/60 border border-[#C29B48]/40 p-4 flex flex-col justify-between gap-3">
                      <div className="space-y-2">
                        <div className="text-xs font-semibold text-[#9A772F]">Kiswahili</div>
                        <p className="text-sm text-[#18291F] whitespace-pre-line leading-relaxed">
                          {swText}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(`${tpl.id}-sw`, swText)}
                        className="self-start inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#183926] bg-white border border-[#183926]/20 rounded hover:bg-[#F7F3E9] transition-colors cursor-pointer"
                      >
                        {copiedId === `${tpl.id}-sw` ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-[#183926]" />
                            Imenakiliwa
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            Copy {tpl.platform} (SW)
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

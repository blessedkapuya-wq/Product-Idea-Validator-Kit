import { useEffect, useState } from 'react';
import { KitWorkspace } from './components/KitWorkspace';
import { WorkedExamplesView } from './components/WorkedExamplesView';
import type { PaidKitBundleData, WorkspaceState } from './types';

export interface PaidAppProps {
  view: 'kit' | 'examples';
  onSwitchView: (view: 'kit' | 'examples') => void;
  onSessionInvalid: () => void;
}

export function PaidApp({ view, onSwitchView, onSessionInvalid }: PaidAppProps) {
  const [paidData, setPaidData] = useState<PaidKitBundleData | null>(null);
  const [workspaceState, setWorkspaceState] = useState<WorkspaceState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloadingZip, setDownloadingZip] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch('/api/paid/kit-data', {
          credentials: 'include',
          cache: 'no-store',
        });
        if (res.status === 401) {
          if (active) onSessionInvalid();
          return;
        }
        if (!res.ok) {
          throw new Error('Could not load paid kit content.');
        }
        const data = (await res.json()) as PaidKitBundleData;
        if (active) {
          setPaidData(data);
          setWorkspaceState(data.defaultWorkspaceState);
          setLoading(false);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Failed to load paid toolkit.');
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [onSessionInvalid]);

  const handleDownloadZip = async () => {
    if (!workspaceState || downloadingZip) return;
    setDownloadingZip(true);
    try {
      const res = await fetch('/api/paid/zip', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceState }),
      });
      if (res.status === 401) {
        onSessionInvalid();
        return;
      }
      if (!res.ok) {
        throw new Error('Failed to generate ZIP download.');
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Biashara-Base-Validator-Kit.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ZIP download failed.');
    } finally {
      setDownloadingZip(false);
    }
  };

  const handleSignOut = async () => {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    }).catch(() => {});
    onSessionInvalid();
  };

  const createBlankState = (data: PaidKitBundleData): WorkspaceState => ({
    skillInventory: { whatIKnow: [], askedForHelp: [], problemsSolved: [] },
    ideas: [],
    outreach: [],
    preSellLogs: [],
    redFlagsChecked: {},
    decision: {
      checks: {},
      verdict: null,
      chosenIdeaTitle: '',
      sevenDayPlan: data.defaultWorkspaceState.decision.sevenDayPlan.map((d) => ({
        ...d,
        done: false,
      })),
    },
    scriptVariables: {
      topic: '',
      audience: '',
      priceTsh: 'TSh 15,000',
      priceUsd: '$7',
    },
  });

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="inline-block bg-white border border-[#C29B48] px-6 py-5 text-sm font-medium text-[#183926]">
          Verifying paid member session &amp; loading toolkit...
        </div>
      </div>
    );
  }

  if (error || !paidData || !workspaceState) {
    return (
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-16">
        <div className="bg-[#F5E8E4] border border-[#9A3412]/40 p-6 text-sm text-[#9A3412]">
          {error || 'Paid session unavailable.'}
        </div>
      </div>
    );
  }

  if (view === 'examples') {
    return (
      <WorkedExamplesView
        examples={paidData.workedExamples}
        standalone
        onOpenKit={() => onSwitchView('kit')}
        onDownloadZip={handleDownloadZip}
      />
    );
  }

  return (
    <KitWorkspace
      paidData={paidData}
      state={workspaceState}
      onChangeState={setWorkspaceState}
      onResetSamples={() => setWorkspaceState(paidData.defaultWorkspaceState)}
      onClearBlank={() => setWorkspaceState(createBlankState(paidData))}
      onDownloadZip={handleDownloadZip}
      downloadingZip={downloadingZip}
      onSignOut={handleSignOut}
    />
  );
}

import { useEffect, useRef, useState } from 'react';

interface PaidBundleHostProps {
  view: 'kit' | 'examples';
  onSwitchView: (view: 'kit' | 'examples') => void;
  onSessionInvalid: () => void;
}

interface PaidMountGlobal {
  __BIASHARA_MOUNT_PAID_KIT__?: (
    container: HTMLElement,
    props: {
      view: 'kit' | 'examples';
      onSwitchView: (view: 'kit' | 'examples') => void;
      onSessionInvalid: () => void;
    }
  ) => void;
  __BIASHARA_UNMOUNT_PAID_KIT__?: (container: HTMLElement) => void;
}

export function PaidBundleHost({
  view,
  onSwitchView,
  onSessionInvalid,
}: PaidBundleHostProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [bundleReady, setBundleReady] = useState(false);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const cssId = 'bb-paid-bundle-css';
    const scriptId = 'bb-paid-bundle-js';

    const ensureBundleLoaded = async () => {
      try {
        const w = window as unknown as PaidMountGlobal;
        if (typeof w.__BIASHARA_MOUNT_PAID_KIT__ === 'function') {
          if (!cancelled) setBundleReady(true);
          return;
        }

        if (!document.getElementById(cssId)) {
          const link = document.createElement('link');
          link.id = cssId;
          link.rel = 'stylesheet';
          link.href = '/api/paid/bundle.css';
          document.head.appendChild(link);
        }

        const existingScript = document.getElementById(scriptId) as HTMLScriptElement | null;
        if (existingScript) {
          existingScript.remove();
        }

        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.id = scriptId;
          script.src = '/api/paid/bundle.js';
          script.async = true;
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Unauthorized or failed to load paid toolkit bundle.'));
          document.body.appendChild(script);
        });

        if (!cancelled) {
          if (typeof (window as unknown as PaidMountGlobal).__BIASHARA_MOUNT_PAID_KIT__ !== 'function') {
            throw new Error('Paid toolkit did not initialize cleanly.');
          }
          setBundleReady(true);
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Unable to load paid toolkit.');
          onSessionInvalid();
        }
      }
    };

    ensureBundleLoaded();

    return () => {
      cancelled = true;
    };
  }, [onSessionInvalid]);

  useEffect(() => {
    const container = containerRef.current;
    const w = window as unknown as PaidMountGlobal;
    if (bundleReady && container && typeof w.__BIASHARA_MOUNT_PAID_KIT__ === 'function') {
      w.__BIASHARA_MOUNT_PAID_KIT__(container, {
        view,
        onSwitchView,
        onSessionInvalid: () => {
          w.__BIASHARA_UNMOUNT_PAID_KIT__?.(container);
          document.getElementById('bb-paid-bundle-js')?.remove();
          document.getElementById('bb-paid-bundle-css')?.remove();
          onSessionInvalid();
        },
      });
    }
  }, [bundleReady, view, onSwitchView, onSessionInvalid]);

  useEffect(() => {
    const container = containerRef.current;
    return () => {
      const w = window as unknown as PaidMountGlobal;
      if (container && typeof w.__BIASHARA_UNMOUNT_PAID_KIT__ === 'function') {
        w.__BIASHARA_UNMOUNT_PAID_KIT__(container);
      }
    };
  }, []);

  if (loadError) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12">
        <div className="bg-[#F5E8E4] border border-[#9A3412]/35 p-5 text-sm text-[#9A3412]">
          {loadError}
        </div>
      </div>
    );
  }

  return (
    <div>
      {!bundleReady && (
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="inline-block bg-white border border-[#C29B48] px-6 py-4 text-sm font-medium text-[#183926]">
            Loading Paid Member Toolkit...
          </div>
        </div>
      )}
      <div ref={containerRef} />
    </div>
  );
}

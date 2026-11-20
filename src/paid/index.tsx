import { createRoot, type Root } from 'react-dom/client';
import './paid.css';
import { PaidApp, type PaidAppProps } from './PaidApp';

const mountedRoots = new WeakMap<HTMLElement, Root>();

declare global {
  interface Window {
    __BIASHARA_MOUNT_PAID_KIT__?: (container: HTMLElement, props: PaidAppProps) => void;
    __BIASHARA_UNMOUNT_PAID_KIT__?: (container: HTMLElement) => void;
  }
}

window.__BIASHARA_MOUNT_PAID_KIT__ = (container: HTMLElement, props: PaidAppProps) => {
  let root = mountedRoots.get(container);
  if (!root) {
    root = createRoot(container);
    mountedRoots.set(container, root);
  }
  root.render(<PaidApp {...props} />);
};

window.__BIASHARA_UNMOUNT_PAID_KIT__ = (container: HTMLElement) => {
  const root = mountedRoots.get(container);
  if (root) {
    root.unmount();
    mountedRoots.delete(container);
  }
};

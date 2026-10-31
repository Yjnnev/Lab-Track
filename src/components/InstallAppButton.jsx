import { useEffect, useState } from "preact/hooks";

let deferredPrompt = null;
let appInstalled = false;
const promptListeners = new Set();

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event;
    promptListeners.forEach((listener) => listener(deferredPrompt, appInstalled));
  });
  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    appInstalled = true;
    promptListeners.forEach((listener) => listener(null, appInstalled));
  });
}

export function InstallAppButton() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const syncPrompt = (prompt, isInstalled) => {
      setInstallPrompt(prompt);
      setInstalled(isInstalled || window.matchMedia("(display-mode: standalone)").matches);
    };
    promptListeners.add(syncPrompt);
    syncPrompt(deferredPrompt, appInstalled);
    return () => promptListeners.delete(syncPrompt);
  }, []);

  async function install() {
    if (!installPrompt) return;
    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
    deferredPrompt = null;
  }

  if (installed) return <p class="install-hint">Lab Track is installed on this device.</p>;

  if (installPrompt) {
    return <button class="btn-link install-action" type="button" onClick={install}>Install for offline use</button>;
  }

  return (
    <p class="install-hint">
      To keep Lab Track available offline, use your browser menu to install it or add it to your home screen.
    </p>
  );
}

import { registerSW } from "virtual:pwa-register";

function showStatus(message: string): void {
  let status = document.getElementById("pwa-status");
  if (!status) {
    status = document.createElement("div");
    status.id = "pwa-status";
    status.className = "pwa-status";
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    document.body.append(status);
  }
  status.textContent = message;
}

function showUpdatePrompt(applyUpdate: () => void): void {
  if (document.getElementById("pwa-update")) {
    return;
  }

  const prompt = document.createElement("aside");
  prompt.id = "pwa-update";
  prompt.className = "pwa-update";
  prompt.setAttribute("aria-label", "App update available");

  const message = document.createElement("span");
  message.textContent = "A new Train With Me version is ready.";

  const button = document.createElement("button");
  button.type = "button";
  button.textContent = "Update now";
  button.addEventListener("click", () => {
    button.disabled = true;
    button.textContent = "Updating...";
    applyUpdate();
  });

  prompt.append(message, button);
  document.body.append(prompt);
}

export function registerPwa(): void {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  const updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      showUpdatePrompt(() => updateSW(true));
    },
    onOfflineReady() {
      showStatus("Train With Me is ready to use offline.");
    },
    onRegisterError(error) {
      console.error("Service worker registration failed.", error);
    },
  });
}

// Web Push requires the VAPID public key as a Uint8Array applicationServerKey,
// but the key is distributed (and stored in env vars) as URL-safe base64.
export function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(new ArrayBuffer(rawData.length));
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function isIosDevice(): boolean {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

export function isStandaloneDisplayMode(): boolean {
  return window.matchMedia("(display-mode: standalone)").matches;
}

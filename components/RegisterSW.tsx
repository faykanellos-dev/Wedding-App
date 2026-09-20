"use client";

import { useEffect } from "react";

// Registers the service worker on the client only. Silently no-ops if
// service workers aren't supported (older browsers, some in-app webviews).
export default function RegisterSW() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  return null;
}

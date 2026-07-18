"use client";

import { useEffect } from "react";
import { logger } from "@/lib/logger";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js").catch((error) => {
      logger.error("service_worker.register_failed", {
        message: error instanceof Error ? error.message : String(error),
      });
    });
  }, []);

  return null;
}

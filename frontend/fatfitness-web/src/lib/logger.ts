type LogLevel = "info" | "warn" | "error";
type LogMeta = Record<string, unknown>;

function send(level: LogLevel, message: string, meta?: LogMeta) {
  const body = JSON.stringify({
    level,
    message,
    meta,
    url: typeof window !== "undefined" ? window.location.href : undefined,
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
  });

  // fire-and-forget — never await this on the calling side
  fetch("/api/log", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {
    // swallow: logging must never throw or block the UI
  });
}

export const logger = {
  info(message: string, meta?: LogMeta) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[logger]", message, meta ?? "");
    }
    send("info", message, meta);
  },

  warn(message: string, meta?: LogMeta) {
    console.warn("[logger]", message, meta ?? "");
    send("warn", message, meta);
  },

  error(message: string, meta?: LogMeta) {
    console.error("[logger]", message, meta ?? "");
    send("error", message, meta);
  },
};

// Minimal monitoring helper. If `SENTRY_DSN` is provided, initialize Sentry.
let sentry = null;
if (process.env.SENTRY_DSN) {
  try {
    // Use require to avoid adding Sentry to client bundles; this file runs server-side.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Sentry = require("@sentry/node");
    Sentry.init({ dsn: process.env.SENTRY_DSN });
    sentry = Sentry;
  } catch (e) {
    // Fail gracefully if Sentry is not installed
    // eslint-disable-next-line no-console
    console.error("monitor: failed to init Sentry:", e && e.message ? e.message : e);
  }
}

export function captureException(err) {
  if (sentry) {
    try {
      sentry.captureException(err);
      return;
    } catch (e) {
      // fall through to console
    }
  }
  // Fallback logging
  // eslint-disable-next-line no-console
  console.error(err);
}

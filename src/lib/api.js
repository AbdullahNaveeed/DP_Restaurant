const DEFAULT_TIMEOUT_MS = 8000;

function getBaseUrl() {
  if (typeof window !== "undefined") {
    return "";
  }

  const envBase = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!envBase) {
    return "";
  }

  return envBase.replace(/\/+$/, "");
}

function buildUrl(path) {
  if (!path.startsWith("/")) {
    throw new Error(`API path must start with '/': ${path}`);
  }

  const baseUrl = getBaseUrl();
  return baseUrl ? `${baseUrl}${path}` : path;
}

function parseErrorMessage(payload, fallback) {
  if (payload && typeof payload === "object" && typeof payload.error === "string") {
    return payload.error;
  }
  if (typeof payload === "string" && payload.trim()) {
    return payload;
  }
  return fallback;
}

export async function apiRequest(path, options = {}) {
  const controller = new AbortController();
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
    const res = await fetch(buildUrl(path), {
      ...options,
      signal: controller.signal,
      credentials: options.credentials ?? "same-origin",
    });

    let payload = null;
    const isJson = res.headers.get("content-type")?.includes("application/json");
    if (isJson) {
      payload = await res.json();
    } else {
      payload = await res.text();
    }

    if (!res.ok) {
      const msg = parseErrorMessage(payload, `Request failed (${res.status})`);
      throw new Error(msg);
    }

    return payload;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("Request timed out. Please check your API/server connection.");
    }
    if (error instanceof TypeError) {
      throw new Error("Network connection failed. Verify the API server is running and URL is correct.");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

import fs from "fs";
import path from "path";
import os from "os";

/**
 * Returns a writable path for the fallback orders file.
 * On Vercel the project directory is read-only; use os.tmpdir() (/tmp) instead.
 */
export function getFallbackOrdersFilePath() {
  // Prefer /tmp (writable on Vercel) over project root
  const dir = process.env.VERCEL ? os.tmpdir() : path.resolve(process.cwd(), "temp_init");
  return path.join(dir, "fallback-orders.json");
}

export async function readFallbackOrders() {
  const file = getFallbackOrdersFilePath();
  try {
    const raw = await fs.promises.readFile(file, "utf8");
    return JSON.parse(raw || "[]");
  } catch {
    return [];
  }
}

export async function writeFallbackOrders(orders) {
  const file = getFallbackOrdersFilePath();
  try {
    await fs.promises.mkdir(path.dirname(file), { recursive: true });
    await fs.promises.writeFile(file, JSON.stringify(orders, null, 2), "utf8");
  } catch (err) {
    console.warn("writeFallbackOrders failed (read-only fs?):", err.message);
  }
}

export async function appendFallbackOrder(orderPayload) {
  const list = await readFallbackOrders();
  const fallbackOrder = { _id: `fallback-${Date.now()}`, ...orderPayload };
  list.unshift(fallbackOrder);
  await writeFallbackOrders(list);
  return fallbackOrder;
}

export async function listFallbackOrders(status = null) {
  const list = await readFallbackOrders();
  const filtered =
    status && status !== "All"
      ? list.filter((order) => order.status === status)
      : list;

  return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function matchLooseId(a, b) {
  try {
    const A = String(a).trim();
    const B = String(b).trim();
    return A === B || A.includes(B) || B.includes(A);
  } catch {
    return false;
  }
}

export async function updateFallbackOrderStatus(id, nextStatus) {
  const NEXT = {
    Pending: "Preparing",
    Preparing: "Delivered",
  };

  const list = await readFallbackOrders();
  const idx = list.findIndex((o) => matchLooseId(o._id, id));
  if (idx === -1) {
    return { error: "Order not found", status: 404 };
  }

  const current = list[idx].status;
  if (current === "Delivered") {
    return { error: "Order already delivered", status: 400 };
  }

  if (NEXT[current] !== nextStatus) {
    return { error: "Invalid status transition", status: 400 };
  }

  list[idx].status = nextStatus;
  await writeFallbackOrders(list);
  return { value: list[idx] };
}

import { useEffect, useState, useCallback } from "react";

export type DemoState = {
  active: boolean;
  role: "patient" | "doctor" | null;
};

const LS_KEY = "telemed-demo-state";

function readLocal(): DemoState {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return { active: false, role: null };
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && parsed.active) {
      return {
        active: true,
        role: parsed.role === "doctor" ? "doctor" : "patient",
      };
    }
  } catch {
    /* ignore */
  }
  return { active: false, role: null };
}

const listeners = new Set<(s: DemoState) => void>();
let current: DemoState = { active: false, role: null };
let initialized = false;

function notify() {
  for (const l of listeners) l(current);
}

function setLocal(s: DemoState) {
  current = s;
  if (s.active) localStorage.setItem(LS_KEY, JSON.stringify(s));
  else localStorage.removeItem(LS_KEY);
  notify();
}

async function fetchServerState(): Promise<DemoState> {
  try {
    const res = await fetch("/api/demo/me", { credentials: "same-origin" });
    if (!res.ok) return { active: false, role: null };
    const j = (await res.json()) as {
      active: boolean;
      role?: "patient" | "doctor";
    };
    return j.active && j.role
      ? { active: true, role: j.role }
      : { active: false, role: null };
  } catch {
    return { active: false, role: null };
  }
}

export async function startDemo(role: "patient" | "doctor"): Promise<void> {
  const res = await fetch("/api/demo/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({ role }),
  });
  if (!res.ok) throw new Error("Failed to start demo");
  setLocal({ active: true, role });
}

export async function stopDemo(): Promise<void> {
  await fetch("/api/demo/logout", {
    method: "POST",
    credentials: "same-origin",
  });
  setLocal({ active: false, role: null });
}

export async function switchDemoRole(
  role: "patient" | "doctor",
): Promise<void> {
  await startDemo(role);
}

export function useDemo() {
  const [state, setState] = useState<DemoState>(() => current);

  useEffect(() => {
    listeners.add(setState);
    if (!initialized) {
      initialized = true;
      // Hydrate from localStorage immediately, reconcile with server
      const local = readLocal();
      if (local.active) {
        current = local;
        notify();
      }
      void fetchServerState().then((server) => {
        if (server.active !== current.active || server.role !== current.role) {
          setLocal(server);
        }
      });
    } else {
      setState(current);
    }
    return () => {
      listeners.delete(setState);
    };
  }, []);

  const start = useCallback(
    (role: "patient" | "doctor") => startDemo(role),
    [],
  );
  const stop = useCallback(() => stopDemo(), []);
  const switchRole = useCallback(
    (role: "patient" | "doctor") => switchDemoRole(role),
    [],
  );

  return { ...state, start, stop, switchRole };
}

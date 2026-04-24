import { useDemo } from "@/lib/demo";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Sparkles, X, ArrowLeftRight } from "lucide-react";

export function DemoBanner() {
  const demo = useDemo();
  const qc = useQueryClient();
  const [, setLocation] = useLocation();

  if (!demo.active) return null;

  async function flip() {
    const next = demo.role === "doctor" ? "patient" : "doctor";
    await demo.switchRole(next);
    qc.clear();
    setLocation(next === "doctor" ? "/doctor" : "/patient");
  }

  async function exit() {
    await demo.stop();
    qc.clear();
    setLocation("/");
  }

  return (
    <div className="bg-primary text-primary-foreground">
      <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-2 min-w-0">
          <Sparkles className="w-4 h-4 shrink-0" />
          <span className="truncate">
            Demo mode · viewing as{" "}
            <strong className="font-semibold capitalize">{demo.role}</strong>
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={flip}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 hover:bg-white/15 transition-colors"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              Switch to {demo.role === "doctor" ? "patient" : "doctor"}
            </span>
            <span className="sm:hidden">Switch</span>
          </button>
          <button
            onClick={exit}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 hover:bg-white/15 transition-colors"
            aria-label="Exit demo"
          >
            <X className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exit</span>
          </button>
        </div>
      </div>
    </div>
  );
}

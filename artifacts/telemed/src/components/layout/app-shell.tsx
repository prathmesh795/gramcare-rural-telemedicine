import { ReactNode } from "react";
import { AppHeader } from "./app-header";
import { OfflineBanner } from "./offline-banner";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col">
      <OfflineBanner />
      <AppHeader />
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-6">{children}</main>
      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        <span className="font-medium">GramCare</span> · Built for rural families
      </footer>
    </div>
  );
}

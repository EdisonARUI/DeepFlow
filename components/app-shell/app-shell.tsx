import { Sidebar } from "./sidebar";
import { TopBar } from "./top-bar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg-primary">
      <Sidebar />
      <TopBar />
      <main className="ml-64 min-h-screen pt-16">{children}</main>
    </div>
  );
}

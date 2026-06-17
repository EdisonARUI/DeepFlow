import { TopBar } from "./top-bar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black p-10">
      <TopBar />
      <main className="mx-auto mt-10 max-w-[1280px]">{children}</main>
    </div>
  );
}

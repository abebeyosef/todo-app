export default function MainContent({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex-1 overflow-y-auto px-10 py-8" style={{ background: 'var(--bg-app)' }}>
      {children}
    </main>
  );
}

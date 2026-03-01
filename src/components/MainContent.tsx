export default function MainContent({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex-1 overflow-y-auto"
      style={{ padding: '32px 48px', background: 'var(--bg-main)' }}>
      {children}
    </main>
  );
}

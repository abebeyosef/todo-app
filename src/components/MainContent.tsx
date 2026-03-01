export default function MainContent({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex-1 overflow-y-auto bg-white px-10 py-8">
      {children}
    </main>
  );
}

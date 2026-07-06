export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-zinc-950 pt-20 text-white sm:pt-16">
      <div className="mx-auto w-full max-w-5xl px-4 pb-10">
        {children}
      </div>
    </main>
  );
}
import Sidebar from "@/components/SideBar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100vh-120px)] w-full">
      <Sidebar />

      <main className="flex-1 px-6 py-6">
        <div className="mx-auto w-full max-w-5xl">
          {children}
        </div>
      </main>
    </div>
  );
}
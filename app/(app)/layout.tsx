import Sidebar from "@/components/SideBar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex w-full flex-col md:flex-row">
      <Sidebar />

      <main className="flex-1 px-4 py-6 md:px-6">
        <div className="mx-auto w-full max-w-5xl">
          {children}
        </div>
      </main>
    </div>
  );
}
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 lg:ml-[260px] transition-all duration-300">
        <Header />
        <div className="p-6 max-w-7xl">{children}</div>
      </main>
    </div>
  );
}

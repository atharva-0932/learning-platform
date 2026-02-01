import { Sidebar } from "./sidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen bg-background overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(139,92,246,0.1),transparent_50%)] pointer-events-none" />
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}

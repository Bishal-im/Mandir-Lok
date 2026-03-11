import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/jwt";
import AdminSidebar from "./AdminSidebar";
import AdminNotificationBell from "@/components/admin/AdminNotificationBell";
import GoogleTranslate from "@/components/GoogleTranslate";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const token = cookies().get("mandirlok_token")?.value;

    if (!token) {
        redirect("/admin/login");
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "admin") {
        redirect("/admin/login");
    }

    return (
        <div className="h-screen overflow-hidden bg-gray-50 flex flex-col lg:flex-row">
            <AdminSidebar />
            <div className="flex-1 overflow-auto">
                <header className="hidden lg:flex bg-white border-b border-gray-200 px-6 py-4 items-center justify-between sticky top-0 z-30">
                    <div>
                        <h1 className="font-display font-bold text-gray-900 text-lg">
                            Admin Dashboard
                        </h1>
                        <p className="text-xs text-gray-500">
                            Welcome back, Admin
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <GoogleTranslate />
                        <AdminNotificationBell />
                        <div className="h-8 w-[1px] bg-gray-200 mx-1" />
                        <div className="flex items-center gap-3">
                            <span className="badge-saffron text-xs">Super Admin</span>
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ff7f0a] to-[#8b0000] flex items-center justify-center text-white text-sm font-bold">
                                A
                            </div>
                        </div>
                    </div>
                </header>

                <main className="p-4 lg:p-6 space-y-6">{children}</main>
            </div>
        </div>
    );
}

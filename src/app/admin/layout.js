"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  HiOutlineBookOpen,
  HiOutlineChartBar,
  HiOutlineClipboardList,
  HiOutlineLogout,
  HiOutlineMenuAlt3,
  HiX,
} from "react-icons/hi";

const SIDEBAR_LINKS = [
  { href: "/admin", label: "Dashboard", icon: HiOutlineChartBar },
  { href: "/admin/menu", label: "Menu Items", icon: HiOutlineBookOpen },
  { href: "/admin/orders", label: "Orders", icon: HiOutlineClipboardList },
];

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (pathname === "/admin/login") return <>{children}</>;

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
      toast.success("Logged out");
      router.push("/admin/login");
    } catch {
      toast.error("Logout failed");
    }
  };

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-bg-primary">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-overlay animate-fade-in lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 max-w-[80vw] flex-col border-r border-border-color bg-bg-secondary transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-border-color px-5">
          <Link href="/admin" className="font-serif text-xl font-bold gold-text">
            Ghani Shinwari
          </Link>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-text-muted transition-colors hover:text-text-primary lg:hidden"
            aria-label="Close sidebar"
          >
            <HiX size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {SIDEBAR_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                  active
                    ? "bg-accent-gold/10 text-accent-gold"
                    : "text-text-muted hover:bg-bg-elevated hover:text-text-primary"
                }`}
              >
                <link.icon size={20} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="shrink-0 border-t border-border-color p-3">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-danger transition-colors hover:bg-danger/10"
          >
            <HiOutlineLogout size={20} />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-border-color bg-bg-secondary/50 px-4 min-[375px]:px-5 min-[480px]:px-6 md:px-8 lg:px-10">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-text-muted transition-colors hover:text-text-primary lg:hidden"
            aria-label="Open sidebar"
          >
            <HiOutlineMenuAlt3 size={22} />
          </button>

          <div className="ml-auto flex items-center gap-2">
            <div className="gold-gradient flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-bg-primary">
              A
            </div>
            <span className="hidden text-sm text-text-secondary sm:block">Admin</span>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 min-[375px]:p-5 min-[480px]:p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
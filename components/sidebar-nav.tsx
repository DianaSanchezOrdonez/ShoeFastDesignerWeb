"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Wand2, FolderClosed, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import Cookies from "js-cookie";
import { toast } from "sonner";

export function SidebarNav() {
  const router = useRouter();
  const pathname = usePathname();
  const navItems = [
    { icon: Wand2, label: "Generar", href: "/" },
    { icon: FolderClosed, label: "Mis Diseños", href: "/mis-disenos" },
  ];

  const handleLogout = async () => {
    try {
      const token = Cookies.get("auth_token");

      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } finally {
      Cookies.remove("auth_token");
      Cookies.remove("user_email");

      toast.info("Sesión cerrada", {
        description: "Has salido de ShoeFastDesigner correctamente.",
        icon: null,
      });

      router.push("/login");
    }
  };

  return (
    <aside
      className={cn(
        "bg-white border-t md:border-t-0 md:border-r z-50",
        "fixed bottom-0 w-full h-16 md:relative md:w-20 md:h-full flex md:flex-col",
      )}
    >
      <nav className="flex h-full w-full md:flex-col items-center justify-around md:justify-between py-2 md:py-8 px-4">
        <div className="flex md:flex-col items-center gap-4 w-full justify-around md:justify-start">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center p-2 rounded-xl transition-all",
                pathname === item.href
                  ? "text-white bg-enfasis-1"
                  : "text-enfasis-5 hover:bg-enfasis-6",
              )}
            >
              <item.icon className="h-6 w-6" />
              <span className="text-[10px] mt-1 font-medium hidden md:block text-center">
                {item.label}
              </span>
            </Link>
          ))}
        </div>
        <button
          onClick={handleLogout}
          className={cn(
            "flex flex-col items-center justify-center p-2 w-12 h-12 md:w-14 md:h-14 rounded-xl transition-all",
            "text-enfasis-5 hover:bg-red-50 hover:text-red-500 group",
          )}
          title="Cerrar Sesión"
        >
          <LogOut className="h-6 w-6 transition-transform group-hover:scale-110" />
          <span className="text-[10px] mt-1 font-medium hidden md:block text-center">
            Salir
          </span>
        </button>
      </nav>
    </aside>
  );
}

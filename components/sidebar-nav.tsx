"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wand2, FolderClosed } from "lucide-react";
import { cn } from "@/lib/utils";

export function SidebarNav() {
  const pathname = usePathname();
  const navItems = [
    { icon: Wand2, label: "Generar", href: "/" },
    { icon: FolderClosed, label: "Mis Diseños", href: "/mis-disenos" },
  ];

  return (
    <aside
      className={cn(
        "bg-white border-t md:border-t-0 md:border-r z-50",
        "fixed bottom-0 w-full h-16 md:relative md:w-20 md:h-full flex md:flex-col"
      )}
    >
      <nav className="flex h-full w-full md:flex-col items-center justify-around md:justify-start md:pt-8 gap-4 px-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center p-2 rounded-xl transition-all",
              pathname === item.href
                ? "text-white bg-enfasis-1"
                : "text-enfasis-5 hover:bg-enfasis-6"
            )}
          >
            <item.icon className="h-6 w-6" />
            <span className="text-[10px] mt-1 font-medium hidden md:block text-center">
              {item.label}
            </span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}

"use client";

import { SidebarNav } from "@/components/sidebar-nav";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { usePathname } from "next/navigation";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  return (
    <html lang="es" suppressHydrationWarning>
      <body className="flex h-screen bg-background overflow-hidden">
        {/* Barra lateral delgada oscura */}
        {!isLoginPage && <SidebarNav />}

        {/* Contenedor principal donde cargan las páginas */}
        <main className="flex-1 h-full overflow-y-auto bg-[#FBFBFB]">
          {children}
          {/* Configuramos la posición arriba a la derecha */}
          <Toaster position="top-right" richColors closeButton />{" "}
          {/* duration={2000} */}
        </main>
      </body>
    </html>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Folder, MoreVertical, Plus, ImageIcon, Loader2 } from "lucide-react";
import Image from "next/image";

export default function MyDesignsPage() {
  const folders = [
    { name: "Colección Primavera", count: 8 },
    { name: "Mules", count: 3 },
    { name: "Exploraciones", count: 15 },
  ];

  const [designs, setDesigns] = useState<
    Array<{ name: string; url: string; updated: string }>
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchDesigns();
  }, []);

  const fetchDesigns = async () => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;

    setIsLoading(true);
    try {
      const response = await fetch(`${baseUrl}/storage/list`);
      const data = await response.json();
      if (data.status === "success") {
        setDesigns(data.designs);
      }
    } catch (error) {
      console.error("Error al cargar diseños:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="flex h-screen flex-col bg-enfasis-6">
      {/* Header - Exactamente igual al GeneratorPage */}
      <header className="flex h-16 items-center justify-between border-b bg-white px-6 md:px-8 shrink-0">
        <span className="text-xl font-bold text-enfasis-1">
          ShoeFastDesigner
        </span>
        <span className="text-sm text-enfasis-5">Brand Logo</span>
      </header>

      {/* Contenido Principal con Scroll */}
      <div className="flex-1 overflow-y-auto">
        {/* Container con los mismos paddings que el GeneratorPage */}
        <div className="mx-auto max-w-7xl px-6 py-8 md:px-8 md:py-10">
          {/* Header de Sección */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-enfasis-5">Mis Diseños</h1>
              <p className="text-sm text-enfasis-5/70">
                Gestiona tus proyectos y colecciones
              </p>
            </div>
            <Button className="bg-enfasis-2 hover:bg-enfasis-2/90 text-white rounded-xl px-6 h-12 shadow-md font-bold text-xs tracking-wider transition-all active:scale-95">
              <Plus className="h-4 w-4" /> Crear Proyecto
            </Button>
          </div>

          {/* 1. COLECCIONES (Carpetas) */}
          <section className="mb-12">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-enfasis-5">
              Proyectos Recientes
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-2 px-2">
              {folders.map((folder) => (
                <div
                  key={folder.name}
                  className="min-w-[240px] flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border border-transparent hover:border-enfasis-1 transition-all cursor-pointer group"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-enfasis-1/10 text-enfasis-1 group-hover:bg-enfasis-1 group-hover:text-white transition-colors">
                    <Folder className="h-6 w-6" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="font-bold text-sm text-enfasis-5 truncate">
                      {folder.name}
                    </p>
                    <p className="text-xs text-enfasis-5/60">
                      {folder.count} diseños
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 2. DISEÑOS SUELTOS (Grid) */}
          <section>
            <h2 className="mb-6 text-sm font-bold uppercase tracking-wider text-enfasis-5">
              Todos los diseños
            </h2>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-enfasis-1 mb-2" />
                <p className="text-enfasis-5/60 text-sm">Cargando galería...</p>
              </div>
            ) : designs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-enfasis-5/20">
                <ImageIcon className="h-12 w-12 text-enfasis-5/20 mb-4" />
                <p className="text-enfasis-5 font-medium">
                  No hay diseños guardados
                </p>
                <p className="text-sm text-enfasis-5/40">
                  Tus creaciones aparecerán aquí cuando las guardes.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {designs.map((design, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-2xl overflow-hidden shadow-lg border border-slate-100 group transition-all hover:-translate-y-1"
                  >
                    <div className="aspect-square bg-enfasis-6 relative flex items-center justify-center p-4">
                      {/* LA IMAGEN REAL DESDE LA URL FIRMADA */}
                      <Image
                        src={design.url}
                        alt={design.name}
                        fill // Ocupa todo el contenedor padre
                        className="object-contain" // Mantiene la proporción del zapato
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Ayuda a Next a elegir el tamaño real
                      />
                      <div className="absolute top-3 right-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full bg-white/80 hover:bg-white"
                        >
                          <MoreVertical className="h-4 w-4 text-enfasis-5" />
                        </Button>
                      </div>
                    </div>

                    <div className="p-5 border-t border-enfasis-6 flex justify-between items-center">
                      <div className="overflow-hidden">
                        <p className="font-bold text-sm text-enfasis-5 truncate pr-2">
                          {design.name.split("_")[0]}{" "}
                          {/* Limpiamos un poco el nombre si usas timestamps */}
                        </p>
                        <p className="text-[10px] uppercase font-bold text-enfasis-5/40 tracking-widest">
                          {formatDate(design.updated)}
                        </p>
                      </div>
                      {/* Un punto de color por defecto ya que el Bucket no guarda el color del zapato */}
                      <div className="h-3 w-3 rounded-full bg-enfasis-1 shadow-inner" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ImageIcon,
  Loader2,
  Maximize2,
  Download,
  X,
  Clock,
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { apiFetch } from "@/lib/api-client";
import { formatDate } from "@/lib/utils";
import { DesignExpander } from "@/components/design-expander";
import { WorkflowWithGeneration } from "@/types";
import { HistoryDialog } from "@/components/history-dialog";

export default function MyDesignsPage() {
  const token = Cookies.get("auth_token");

  const [designs, setDesigns] = useState<Array<WorkflowWithGeneration>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newBucketName, setNewBucketName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [folders, setFolders] = useState<
    Array<{ name: string; count: number }>
  >([]);
  const [selectedDesign, setSelectedDesign] =
    useState<WorkflowWithGeneration | null>(null);
  const [historyWorkflow, setHistoryWorkflow] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const fetchDesigns = async () => {
    setIsLoading(true);
    try {
      const response = await apiFetch("/workflows/latest-generation");

      if (response) {
        const data = await response.json();
        setDesigns(data);
      }
    } catch (error) {
      console.error("Error al cargar diseños:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFolders = async () => {
    try {
      const response = await apiFetch("/storage/collections");

      if (response) {
        const data = await response.json();
        setFolders(data.collections);
      }
    } catch (error) {
      console.error("Error al cargar carpetas:", error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDesigns();
      fetchFolders();
    }
  }, [token]);

  const handleCreateBucket = async () => {
    if (!newBucketName.trim()) return;

    setIsCreating(true);

    try {
      const response = await apiFetch("/storage/create-bucket", {
        method: "POST",
        body: JSON.stringify({ collection_name: newBucketName }),
      });

      if (response) {
        setFolders([{ name: newBucketName, count: 0 }, ...folders]);
        setNewBucketName("");
        setIsDialogOpen(false);

        toast.success("Colección nueva creada", {
          description: `Se ha agregado ${newBucketName} exitosamente.`,
          icon: null,
        });
      }
    } catch (error) {
      console.error("Error creando bucket:", error);
      toast.error("Error al crear flujo", {
        description:
          "Hubo un problema al crear el nuevo flujo de diseño. Inténtalo de nuevo.",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDownload = async (blobPath: string) => {
    try {
      const response = await apiFetch(
        `/workflows/generate-download-url/${blobPath}`,
      );

      if (response) {
        const data = await response.json();
        const secureUrl = data.download_url;

        // Creamos un link invisible y lo clickeamos
        // Como la URL ya tiene 'attachment', el navegador iniciará la descarga solo
        const link = document.createElement("a");
        link.href = secureUrl;
        link.setAttribute("download", blobPath); // Refuerzo de nombre
        link.target = "_blank"; // Abre en pestaña invisible para no recargar la app

        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
      }
    } catch (error) {
      console.error("Error en descarga:", error);
      toast.error("No se pudo iniciar la descarga");
    }
  };

  return (
    <div className="flex h-screen flex-col bg-enfasis-6">
      <header className="flex h-16 items-center justify-between border-b bg-white px-6 md:px-8 shrink-0">
        <span className="text-xl font-bold text-enfasis-1">
          ShoeFastDesigner
        </span>
        <span className="text-sm text-enfasis-5">Brand Logo</span>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-6 py-8 md:px-8 md:py-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-enfasis-5">Mis Diseños</h1>
              <p className="text-sm text-enfasis-5/70">
                Gestiona tus flujos de diseño y colecciones
              </p>
            </div>
            {/* <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-enfasis-2 hover:bg-enfasis-2/90 text-white rounded-xl px-6 h-12 shadow-md font-bold text-xs tracking-wider transition-all active:scale-95">
                  <Plus className="h-4 w-4" /> Crear Proyecto
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] rounded-3xl">
                <DialogHeader>
                  <DialogTitle className="text-enfasis-5">
                    Nuevo Proyecto
                  </DialogTitle>
                  <DialogDescription>
                    Asigna un nombre a tu nuevo proyecto para tus diseños.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <Input
                    placeholder="Ej: Colección Verano 2026"
                    value={newBucketName}
                    onChange={(e) => setNewBucketName(e.target.value)}
                    className="rounded-xl border-enfasis-6 focus:ring-enfasis-1"
                  />
                </div>
                <DialogFooter>
                  <Button
                    variant="ghost"
                    onClick={() => setIsDialogOpen(false)}
                    className="rounded-xl"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleCreateBucket}
                    disabled={isCreating || !newBucketName}
                    className="bg-enfasis-1 hover:bg-enfasis-1/90 text-white rounded-xl px-8"
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creando...
                      </>
                    ) : (
                      "Guardar"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog> */}
          </div>

          {/* <section className="mb-12">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-enfasis-5">
              Proyectos Recientes
            </h2>

            {folders.length === 0 ? (
              <div className="flex flex-col items-center justify-center w-full py-10 bg-white/40 rounded-3xl border-2 border-dashed border-enfasis-5/10">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-enfasis-5/20 shadow-sm mb-4">
                  <Folder className="h-7 w-7" />
                </div>
                <div className="text-center px-4">
                  <p className="text-sm font-bold text-enfasis-5/70">
                    No hay proyectos creados
                  </p>
                  <p className="text-[11px] text-center text-enfasis-5/40 mt-1 max-w-[200px] mx-auto leading-tight">
                    Crea proyectos para organizar tus diseños por temporadas o
                    estilos.
                  </p>
                </div>

                <Button
                  variant="ghost"
                  onClick={() => setIsDialogOpen(true)}
                  className="mt-4 text-enfasis-1 hover:text-enfasis-1 hover:bg-enfasis-1/5 text-[11px] font-bold uppercase tracking-tighter"
                >
                  <Plus className="h-3 w-3 mr-1" /> Comenzar un proyecto
                </Button>
              </div>
            ) : (
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
            )}
          </section> */}

          <section>
            <h2 className="mb-6 text-sm font-bold uppercase tracking-wider text-enfasis-5">
              Todos los diseños
            </h2>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-enfasis-1 mb-2" />
                <p className="text-enfasis-5/60 text-sm">Cargando galería...</p>
              </div>
            ) : designs?.length === 0 ? (
              <div className="flex flex-col items-center justify-center w-full py-10 bg-white/40 rounded-3xl border-2 border-dashed border-enfasis-5/10">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-enfasis-5/20 shadow-sm mb-4">
                  <ImageIcon className="h-7 w-7" />
                </div>
                <p className="text-sm font-bold text-enfasis-5/70">
                  No hay diseños guardados
                </p>
                <p className="text-[11px] text-center text-enfasis-5/40 mt-1 max-w-[200px] mx-auto leading-tight">
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
                      <Image
                        src={design.latest_generation.image_url ?? ""}
                        alt={design.name}
                        fill // Ocupa todo el contenedor padre
                        className="object-contain" // Mantiene la proporción del zapato
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Ayuda a Next a elegir el tamaño real
                      />
                      <div className="absolute inset-0 bg-enfasis-5/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <Button
                          size="icon"
                          className="bg-white text-enfasis-5 hover:bg-enfasis-1 hover:text-white rounded-full transition-colors"
                          onClick={() =>
                            setHistoryWorkflow({
                              id: design.id,
                              name: design.name,
                            })
                          }
                        >
                          <Clock className="h-4 w-4" />
                        </Button>

                        <Button
                          size="icon"
                          className="bg-white text-enfasis-5 hover:bg-enfasis-1 hover:text-white rounded-full transition-colors"
                          onClick={() => setSelectedDesign(design)}
                        >
                          <Maximize2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          className="bg-white text-enfasis-5 hover:bg-enfasis-1 hover:text-white rounded-full transition-colors"
                          onClick={() =>
                            handleDownload(
                              design.latest_generation.image_blob_path,
                            )
                          }
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="p-5 border-t border-enfasis-6 flex justify-between items-center">
                      <div className="overflow-hidden">
                        <p className="font-bold text-sm text-enfasis-5 truncate pr-2">
                          {design.name.split("_")[0]}{" "}
                        </p>
                        <p className="text-[10px] uppercase font-bold text-enfasis-5/40 tracking-widest">
                          {formatDate(design.latest_generation.created_at)}
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

      {selectedDesign && (
        <DesignExpander
          design={{
            name: selectedDesign.name,
            url: selectedDesign.latest_generation.image_url,
            blob_path: selectedDesign.latest_generation.image_blob_path,
            updated: selectedDesign.updated_at,
          }}
          onClose={() => setSelectedDesign(null)}
          onDownload={(path) => handleDownload(path)}
        />
      )}

      {historyWorkflow && (
        <HistoryDialog
          workflowId={historyWorkflow?.id || null}
          workflowName={historyWorkflow?.name || ""}
          isOpen={!!historyWorkflow}
          onClose={() => setHistoryWorkflow(null)}
          onDownload={(path) => handleDownload(path)}
        />
      )}
    </div>
  );
}

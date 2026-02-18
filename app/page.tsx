"use client";

import React, { useState, ChangeEvent, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Upload,
  X,
  Plus,
  ImageIcon,
  RotateCcw,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api-client";
import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Workflow {
  id: string;
  name: string;
}

interface Material {
  id: string;
  name: string;
  image: string;
}

export default function GeneratorPage() {
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [sketchPreview, setSketchPreview] = useState<string | null>(null);
  const [sketchFile, setSketchFile] = useState<File | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(
    null,
  );
  const [generatedBlob, setGeneratedBlob] = useState<Blob | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<
    (typeof materials)[number] | null
  >(null);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>("");
  const [newWorkflowName, setNewWorkflowName] = useState("");
  const [isCreatingWorkflow, setIsCreatingWorkflow] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConfirmCloseOpen, setIsConfirmCloseOpen] = useState(false);

  const handleGenerate = async () => {
    if (!sketchFile || !selectedWorkflowId) {
      toast.error("Falta el boceto", {
        description:
          "Asegúrate de subir un boceto y seleccionar un flujo de diseño.",
        icon: null,
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedImageUrl(null);
    setGeneratedBlob(null);

    try {
      const formData = new FormData();
      formData.append("file", sketchFile);
      formData.append("workflow_id", selectedWorkflowId);

      if (selectedMaterial) {
        formData.append("material_id", selectedMaterial.id);
        formData.append("material_url", selectedMaterial.image);
      }

      const response = await apiFetch("/sketch-to-image/shoe", {
        method: "POST",
        body: formData,
      });

      if (response) {
        const strategy = response.headers.get("X-Strategy");

        if (strategy === "fallback") {
          toast.warning("Modelo de respaldo activado", {
            description:
              "Debido a la alta demanda, estamos procesando tu diseño con nuestro modelo de respaldo para no interrumpir tu flujo.",
            icon: null,
          });
        }

        const blob = await response.blob();
        setGeneratedBlob(blob);
        setGeneratedImageUrl(URL.createObjectURL(blob));
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error de generación", {
        description:
          // "No pudimos procesar tu imagen. Revisa tu conexión o el servidor."
          error instanceof Error ? error.message : "Error desconocido",
        icon: null,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSketchFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setSketchPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const clearSketch = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSketchPreview(null);
    setSketchFile(null);
    setGeneratedImageUrl(null);
    setGeneratedBlob(null);
  };

  const handleCreateWorkflow = async () => {
    if (!newWorkflowName || !sketchFile) {
      toast.error("Datos incompletos", {
        description: "Nombre y boceto son obligatorios",
        icon: null,
      });
      return;
    }

    setIsCreatingWorkflow(true);
    try {
      const formData = new FormData();
      formData.append("name", newWorkflowName);
      formData.append("file", sketchFile);

      const response = await apiFetch("/workflows/", {
        method: "POST",
        body: formData,
      });

      if (response) {
        const data = await response.json();
        setWorkflows((prev) => [...prev, data]);
        setSelectedWorkflowId(data.id);
        setIsDialogOpen(false);
        toast.success("Flujo de diseño creado", {
          description: "Ahora puedes generar imágenes",
          icon: null,
        });
      }
    } catch (error) {
      toast.error("Error al crear flujo de diseño");
    } finally {
      setIsCreatingWorkflow(false);
    }
  };

  const loadWorkflows = async () => {
    try {
      const response = await apiFetch("/workflows/");

      if (response) {
        const data = await response.json();
        setWorkflows(data);
      }
    } catch (error) {
      console.error("Error al cargar flujos de diseño:", error);
    }
  };

  const handleCloseWorkflow = async () => {
    try {
      setIsConfirmCloseOpen(false);

      await apiFetch(`/workflows/${selectedWorkflowId}/close`, {
        method: "PATCH",
      });

      setGeneratedImageUrl(null);
      setSelectedWorkflowId("");
      loadWorkflows();

      toast.success("Flujo archivado con éxito", {
        icon: null,
      });
    } catch (e) {
      toast.error("No se pudo cerrar el flujo", {
        icon: null,
      });
    }
  };

  useEffect(() => {
    loadWorkflows();
  }, []);

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const response = await apiFetch("/storage/leathers");

        if (response) {
          const data = await response.json();
          setMaterials(data.leathers);
        }
      } catch (error) {
        console.error("Error cargando cueros:", error);
      }
    };
    fetchMaterials();
  }, []);

  return (
    <div className="flex h-screen flex-col bg-white">
      <header className="flex h-16 items-center justify-between border-b border-enfasis-6 bg-white px-6 md:px-8">
        <span className="text-xl font-bold text-enfasis-1">
          ShoeFastDesigner
        </span>
        <span className="text-sm text-enfasis-5">Brand Logo</span>
      </header>

      <div className="flex flex-1 flex-col md:flex-row overflow-hidden">
        <div className="flex-1 overflow-y-auto md:overflow-hidden md:flex md:flex-row">
          <aside className="w-full md:w-80 border-b md:border-b-0 md:border-r border-enfasis-6 bg-white p-6 md:overflow-y-auto md:flex-shrink-0">
            <section className="mb-6 md:mb-8">
              <h2 className="mb-4 text-xs md:text-sm font-bold uppercase tracking-wider text-enfasis-5">
                1. Boceto
              </h2>
              <div className="group relative flex aspect-video cursor-pointer flex-col items-center justify-center rounded-lg md:rounded-xl border-2 border-dashed border-enfasis-6 bg-slate-50 transition-colors hover:border-enfasis-1 overflow-hidden">
                {sketchPreview ? (
                  <>
                    <img
                      src={sketchPreview}
                      alt="Preview"
                      className="h-full w-full object-contain p-1 md:p-2"
                    />
                    <button
                      onClick={clearSketch}
                      className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md text-enfasis-5 hover:text-enfasis-1 z-10"
                    >
                      <X className="h-3 w-3 md:h-4 md:w-4" />
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2 md:gap-3 text-enfasis-5/70 group-hover:text-enfasis-1">
                    <Upload className="h-6 w-6 md:h-8 md:w-8" />
                    <span className="text-xs md:text-sm font-medium">
                      Subir Boceto
                    </span>
                  </div>
                )}
                <input
                  type="file"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
            </section>

            <section className="mb-6 md:mb-8">
              <h2 className="mb-4 text-xs md:text-sm font-bold uppercase tracking-wider text-enfasis-5">
                2. Flujo de Diseño
              </h2>

              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <Combobox
                    value={selectedWorkflowId}
                    onValueChange={(val) => {
                      setSelectedWorkflowId(val ?? "");
                    }}
                  >
                    <div className="relative">
                      <ComboboxInput
                        placeholder="Seleccionar flujo..."
                        className="h-10 md:h-12 w-full rounded-lg border-enfasis-6 bg-white shadow-sm focus:border-enfasis-1"
                        value={
                          workflows.find((w) => w.id === selectedWorkflowId)
                            ?.name ?? ""
                        }
                      />
                    </div>
                    <ComboboxContent>
                      <ComboboxList>
                        {workflows.map((item) => (
                          <ComboboxItem key={item.id} value={item.id}>
                            {item.name}
                          </ComboboxItem>
                        ))}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      disabled={!sketchFile}
                      className={cn(
                        "h-10 md:h-12 bg-enfasis-1 hover:bg-enfasis-1/90 px-3 text-enfasis-6 hover:text-enfasis-6 transition-all",
                        !sketchFile &&
                          "opacity-50 grayscale cursor-not-allowed",
                      )}
                    >
                      <Plus className="h-4 w-4 md:mr-1" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle className="text-enfasis-1">
                        Nuevo Flujo de Diseño
                      </DialogTitle>
                    </DialogHeader>
                    <div className="py-6 space-y-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="workflow-name"
                          className="text-enfasis-5 font-semibold"
                        >
                          Nombre del flujo de diseño
                        </Label>
                        <Input
                          id="workflow-name"
                          placeholder="Ej: Zapatilla Urban Pro"
                          value={newWorkflowName}
                          onChange={(e) => setNewWorkflowName(e.target.value)}
                          className="border-enfasis-6 focus:border-enfasis-1"
                        />
                      </div>
                      <div className="bg-slate-50 p-3 rounded-lg border border-dashed border-enfasis-6">
                        <p className="text-[11px] text-enfasis-5/80 italic leading-relaxed">
                          * Al crear el flujo de diseño, el boceto que subiste
                          se vinculará como la base de este flujo.
                        </p>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        className="w-full bg-enfasis-1 hover:bg-enfasis-1/90"
                        onClick={handleCreateWorkflow}
                        disabled={isCreatingWorkflow || !newWorkflowName}
                      >
                        {isCreatingWorkflow ? (
                          <div className="flex items-center gap-2">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            Creando...
                          </div>
                        ) : (
                          "Confirmar y Crear"
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </section>

            <section className="mb-6 md:mb-8">
              <h2 className="mb-4 md:mb-6 text-xs md:text-sm font-bold uppercase tracking-wider text-enfasis-5">
                3. Parámetros
              </h2>
              <div className="space-y-4 md:space-y-6">
                <div className="space-y-2 md:space-y-3">
                  <Label className="text-sm font-semibold text-enfasis-5">
                    Material
                  </Label>

                  <Combobox
                    value={selectedMaterial?.id ?? ""}
                    onValueChange={(value) => {
                      if (!value) {
                        setSelectedMaterial(null);
                        return;
                      }

                      const material = materials.find((m) => m.id === value);

                      if (material) {
                        setSelectedMaterial(material ?? null);
                      }
                    }}
                  >
                    <ComboboxInput
                      placeholder="Seleccionar material..."
                      className="h-10 md:h-12 w-full rounded-lg border-enfasis-6 bg-white shadow-sm focus:border-enfasis-1"
                      value={selectedMaterial?.name ?? ""}
                    />
                    <ComboboxContent>
                      <ComboboxList>
                        <ComboboxItem
                          value=""
                          className="flex items-center gap-3 p-2 cursor-pointer text-gray-500 hover:text-gray-700"
                        >
                          <div className="h-8 w-8 shrink-0 overflow-hidden rounded-md border bg-gray-100 flex items-center justify-center">
                            <ImageIcon className="h-4 w-4 text-gray-400" />
                          </div>

                          <span className="flex-1 font-medium">
                            Sin material
                          </span>
                        </ComboboxItem>
                        {materials.map((item) => (
                          <ComboboxItem
                            key={item.id}
                            value={item.id}
                            className="flex items-center gap-3 p-2 cursor-pointer"
                          >
                            <div className="h-8 w-8 shrink-0 overflow-hidden rounded-md border">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-full w-full object-cover"
                              />
                            </div>

                            <span className="flex-1 font-medium text-gray-700">
                              {item.name}
                            </span>
                          </ComboboxItem>
                        ))}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                </div>
              </div>
            </section>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !sketchFile || !selectedWorkflowId}
              className="w-full bg-enfasis-1 hover:bg-enfasis-1/90 h-12 md:h-14 md:py-6 text-base md:text-lg font-bold rounded-xl"
            >
              {isGenerating ? "Generando..." : "Generar Diseño"}
            </Button>
          </aside>

          <section className="flex-1 bg-enfasis-6 p-6 md:p-12 md:overflow-y-auto">
            <div className="relative flex min-h-[400px] md:h-full w-full items-center justify-center rounded-2xl md:rounded-3xl border border-white bg-white shadow-xl md:shadow-2xl overflow-hidden p-4">
              {isGenerating && (
                <div className="flex flex-col items-center gap-4">
                  <div className="h-12 w-12 md:h-16 md:w-16 animate-spin rounded-full border-4 border-enfasis-1 border-t-transparent" />
                  <p className="text-enfasis-1 font-bold animate-pulse">
                    Generando imagen...
                  </p>
                </div>
              )}

              {!isGenerating && generatedImageUrl && (
                <>
                  <div className="relative w-full aspect-[21/9] flex items-center justify-center">
                    <img
                      src={generatedImageUrl}
                      alt="Generated design"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="absolute bottom-6 right-6 flex flex-col items-end gap-3 animate-in slide-in-from-right-4 duration-700">
                    <div className="flex items-center gap-2 rounded-lg bg-white/80 px-3 py-2 backdrop-blur-sm border border-enfasis-6 shadow-sm">
                      <span className="text-[11px] font-medium text-enfasis-5 leading-tight">
                        ✨ ¿Satisfecho con el resultado? <br />
                      </span>
                    </div>

                    <Dialog
                      open={isConfirmCloseOpen}
                      onOpenChange={setIsConfirmCloseOpen}
                    >
                      <DialogTrigger asChild>
                        <Button className="group h-12 bg-enfasis-1 hover:bg-enfasis-1/90 text-white shadow-xl shadow-enfasis-1/20 px-8 rounded-xl transition-all hover:scale-105 active:scale-95">
                          <CheckCircle className="mr-2 h-5 w-5" />
                          Finalizar y Cerrar Flujo
                        </Button>
                      </DialogTrigger>

                      <DialogContent className="sm:max-w-[425px] border-enfasis-6">
                        <DialogHeader className="flex flex-col items-center text-center gap-2">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-enfasis-1/10 mb-2">
                            <CheckCircle className="h-6 w-6 text-enfasis-1" />
                          </div>
                          <DialogTitle className="text-xl font-bold text-enfasis-1">
                            ¿Finalizar diseño?
                          </DialogTitle>
                          <p className="text-sm text-enfasis-5">
                            Si estás satisfecho con este zapato, lo archivaremos
                            y limpiaremos la mesa de trabajo para tu próximo
                            gran diseño.
                          </p>
                        </DialogHeader>

                        <div className="bg-slate-50 p-4 rounded-xl border border-dashed border-enfasis-6 my-4">
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 text-enfasis-1 font-bold">
                              💡
                            </div>
                            <p className="text-[11px] text-enfasis-5 leading-relaxed">
                              Una vez cerrado, el flujo pasará a tu historial de
                              proyectos terminados y no podrás generar más
                              variaciones sobre este boceto específico en este
                              flujo.
                            </p>
                          </div>
                        </div>

                        <DialogFooter className="flex gap-2 sm:gap-0">
                          <Button
                            variant="ghost"
                            onClick={() => setIsConfirmCloseOpen(false)}
                            className="flex-1 text-enfasis-5 hover:bg-slate-100"
                          >
                            Aún no
                          </Button>
                          <Button
                            onClick={handleCloseWorkflow}
                            className="flex-1 bg-enfasis-1 hover:bg-enfasis-1/90 text-white"
                          >
                            Sí, finalizar
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </>
              )}

              {!isGenerating && !generatedImageUrl && (
                <div className="text-enfasis-5 text-center">
                  <p className="text-base md:text-lg">
                    Tu diseño aparecerá aquí. Haz clic en “Generar diseño” para
                    empezar
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

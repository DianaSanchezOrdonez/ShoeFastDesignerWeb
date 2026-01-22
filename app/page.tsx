"use client";

import React, { useState, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, X, Save, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Cookies from "js-cookie";
import { apiFetch } from "@/lib/api-client";

export default function GeneratorPage() {
  const router = useRouter();

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [sketchPreview, setSketchPreview] = useState<string | null>(null);
  const [sketchFile, setSketchFile] = useState<File | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(
    null,
  );
  const [generatedBlob, setGeneratedBlob] = useState<Blob | null>(null); // Guardar el blob para enviar a GCS

  // Estados de los parámetros (controlados para enviarlos al guardar)
  const [material, setMaterial] = useState("full-grain");
  const [color, setColor] = useState("#3ee69f");
  const [toe, setToe] = useState("classic-round");

  const handleGenerate = async () => {
    if (!sketchFile) {
      toast.error("Falta el boceto", {
        description: "Por favor, sube una imagen antes de generar.",
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

      // Opcional: podrías pasar los parámetros actuales a la generación si tu API los usa
      // formData.append("material", material);

      const response = await apiFetch("/sketch-to-image/shoe", {
        method: "POST",
        body: formData,
      });

      if (response) {
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

  const handleSaveToLibrary = async () => {
    if (!generatedBlob) return;

    setIsSaving(true);
    try {
      const formData = new FormData();
      // Convertimos el blob en un archivo ficticio para el multipart
      formData.append("file", generatedBlob, "generated-shoe.png");
      formData.append("material", material);
      formData.append("color", color);
      formData.append("toe", toe);

      const response = await apiFetch("/storage/save", {
        method: "POST",
        body: formData,
      });

      if (response) {
        toast.success("Diseño guardado", {
          description: "Se ha añadido exitosamente a tu biblioteca.",
          icon: null,
        });
        // Esperamos 2 segundos para que el usuario lea el toast y luego redirigimos
        setTimeout(() => {
          router.push("/mis-disenos"); // Asegúrate de que este sea el nombre de tu carpeta en /app
        }, 2000);
      }
    } catch (error) {
      console.error("Error al guardar:", error);
      toast.error("Error de guardado", {
        description:
          error instanceof Error ? error.message : "Error desconocido",
        icon: null,
      });
    } finally {
      setIsSaving(false);
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

            {/* 2. Parameters */}
            {/* <section className="mb-6 md:mb-8">
              <h2 className="mb-4 md:mb-6 text-xs md:text-sm font-bold uppercase tracking-wider text-enfasis-5">
                2. Parámetros
              </h2>
              <div className="space-y-4 md:space-y-6">
                <div className="space-y-2 md:space-y-3">
                  <Label className="text-sm md:text-base font-semibold text-enfasis-5">
                    Material
                  </Label>
                  <Select defaultValue="full-grain">
                    <SelectTrigger className="h-10 md:h-12 w-full rounded-lg border-enfasis-6 bg-white shadow-sm focus:border-enfasis-1 focus:ring-2 focus:ring-enfasis-1/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-grain">
                        Full-Grain Leather
                      </SelectItem>
                      <SelectItem value="suede">Suede</SelectItem>
                      <SelectItem value="velvet">Velvet</SelectItem>
                      <SelectItem value="synthetic">Synthetic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:space-y-3">
                  <Label className="text-sm font-semibold text-enfasis-5">
                    Color Principal
                  </Label>
                  <div className="flex items-center gap-3">
                    <div
                      className="h-10 md:h-12 flex-1 rounded-lg border-2 border-enfasis-6"
                      style={{ backgroundColor: color }}
                    />
                    <Input
                      type="text"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="h-10 md:h-12 w-24 md:w-28 text-center font-mono text-enfasis-5"
                    />
                  </div>
                </div>

                <div className="space-y-2 md:space-y-3">
                  <Label className="text-sm font-semibold text-enfasis-5">
                    Punta
                  </Label>
                  <Select value={toe} onValueChange={setToe}>
                    <SelectTrigger className="h-10 md:h-12 w-full rounded-lg border-enfasis-6 bg-white shadow-sm focus:border-enfasis-1 focus:ring-2 focus:ring-enfasis-1/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="classic-round">
                        Punta ovalada
                      </SelectItem>
                      <SelectItem value="pointed">Punta triangular</SelectItem>
                      <SelectItem value="square">Punta cuadrada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section> */}

            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !sketchFile}
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

                  <Button
                    onClick={handleSaveToLibrary}
                    disabled={isSaving}
                    className="absolute bottom-4 right-4 md:bottom-8 md:right-8 bg-enfasis-1 hover:bg-enfasis-1/90 text-white flex gap-2 items-center shadow-lg"
                  >
                    {isSaving ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {isSaving ? "Guardando..." : "Guardar"}
                  </Button>
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

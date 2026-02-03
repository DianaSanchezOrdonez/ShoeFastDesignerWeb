"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, Download, Loader2, PencilLine } from "lucide-react";
import Image from "next/image";
import { formatDate } from "@/lib/utils";
import { apiFetch } from "@/lib/api-client";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Generation } from "@/types";

interface HistoryDialogProps {
  workflowId: string | null;
  workflowName: string;
  isOpen: boolean;
  onClose: () => void;
  onDownload: (path: string) => void;
}

export function HistoryDialog({
  workflowId,
  workflowName,
  isOpen,
  onClose,
  onDownload,
}: HistoryDialogProps) {
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sketchUrl, setSketchUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && workflowId) {
      const fetchHistory = async () => {
        setIsLoading(true);
        try {
          const response = await apiFetch(`/workflows/${workflowId}`);
          if (response) {
            const data = await response.json();
            setGenerations(data.generations || []);
            setSketchUrl(data.workflow?.sketch_url || null);
          }
        } catch (error) {
          console.error("Error cargando historial:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchHistory();
    }
  }, [isOpen, workflowId]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-4xl h-[85vh] flex flex-col p-0 overflow-hidden rounded-[2rem] border-none shadow-2xl"
        showCloseButton={false}
      >
        <DialogHeader className="p-6 bg-white border-b shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-enfasis-1/10 flex items-center justify-center text-enfasis-1">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-enfasis-5">
                Historial de Diseño
              </DialogTitle>
              <p className="text-sm text-enfasis-5/60">{workflowName}</p>
            </div>
          </div>
        </DialogHeader>
        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="py-6 px-8">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-enfasis-1 mb-2" />
                <p className="text-enfasis-5/60 text-sm">
                  Cargando historial...
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {sketchUrl && (
                  <div className="relative pl-12">
                    <div className="absolute left-3 top-1 h-4 w-4 rounded-full border-2 border-enfasis-5/20 bg-white z-10" />

                    <div className="flex items-center gap-2 mb-3">
                      <PencilLine className="h-3 w-3 text-enfasis-1" />
                      <span className="text-[10px] font-black text-enfasis-1 uppercase tracking-widest">
                        Punto de Origen
                      </span>
                    </div>

                    <div className="bg-white rounded-3xl p-4 shadow-sm border-2 border-dashed border-enfasis-1/20 flex flex-col md:flex-row gap-6">
                      <div className="relative h-40 w-40 bg-slate-50 rounded-2xl overflow-hidden shrink-0">
                        <Image
                          src={sketchUrl}
                          alt="Boceto Original"
                          fill
                          className="object-contain p-4 opacity-40 grayscale"
                        />
                        <Badge className="absolute top-2 left-2 bg-enfasis-5 text-white border-none text-[9px] font-bold">
                          SKETCH BASE
                        </Badge>
                      </div>
                      <div className="flex flex-col justify-center">
                        <h4 className="text-sm font-bold text-enfasis-5">
                          Boceto Maestro
                        </h4>
                        <p className="text-xs text-enfasis-5/40 mt-1 max-w-[220px] leading-relaxed">
                          Referencia técnica original sobre la cual se aplicaron
                          los materiales y texturas.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <hr className="border-slate-200" />

                <section className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:bg-enfasis-5/10">
                  {generations.map((gen, idx) => (
                    <div key={gen.generation_id || idx} className="relative pl-12">
                      <div className="absolute left-3 top-1 h-4 w-4 rounded-full border-2 border-enfasis-1 bg-white shadow-sm z-10" />
                      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow">
                        <div className="group relative h-40 w-40 bg-enfasis-6 rounded-xl overflow-hidden shrink-0">
                          <Image
                            src={gen.image_url}
                            alt="Iteración"
                            fill
                            className="object-contain"
                          />
                        </div>
                        <div className="flex-1 flex flex-col justify-between py-1">
                          <div>
                            <div className="flex justify-between items-start mb-2">
                              <Badge
                                variant="secondary"
                                className="bg-enfasis-6 text-enfasis-5/70 font-bold border-none"
                              >
                                Iteración {generations.length - idx}
                              </Badge>
                              <span className="text-[10px] font-bold text-enfasis-5/30 uppercase tracking-widest">
                                {formatDate(gen.created_at)}
                              </span>
                            </div>
                            <p className="text-xs text-enfasis-5/60 leading-relaxed italic">
                              Material aplicado:{" "}
                              <span className="text-enfasis-1 font-semibold">
                                {gen.material_id || "Original"}
                              </span>
                            </p>
                          </div>
                          <div className="flex gap-2 mt-4">
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-lg h-8 text-[10px] font-bold uppercase"
                              onClick={() => onDownload(gen.image_blob_path)}
                            >
                              <Download className="h-3 w-3 mr-2" /> Descargar
                              Diseño
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </section>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

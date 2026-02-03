"use client";

import React, { useEffect, useState } from "react";
import { Folder, Search, Image as ImageIcon, Plus, Menu } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { apiFetch } from "@/lib/api-client";
import { Generation } from "@/types";

interface Workflow {
  id: string;
  name: string;
  generations_count: number;
  user_id: string;
}

export default function MyHistoricalPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [originalSketch, setOriginalSketch] = useState<string | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    const fetchWorkflows = async () => {
      try {
        setLoading(true);
        const response = await apiFetch("/workflows/");

        if (response) {
          const data = await response.json();
          setWorkflows(data);
          if (data.length > 0) {
            setSelectedWorkflow(data[0]);
          }
        }
      } catch (error) {
        console.error("Error cargando flujos de diseño:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkflows();
  }, []);

  useEffect(() => {
    const fetchWorkflowDetails = async () => {
      if (!selectedWorkflow) return;

      setLoadingDetails(true);
      try {
        const response = await apiFetch(`/workflows/${selectedWorkflow.id}`);

        if (response) {
          const data = await response.json();
          setGenerations(data.generations || []);
          setOriginalSketch(data.workflow.sketch_url);
        }
      } catch (error) {
        console.error("Error al obtener detalles del flujo de diseño:", error);
        setGenerations([]);
      } finally {
        setLoadingDetails(false);
      }
    };

    fetchWorkflowDetails();
  }, [selectedWorkflow?.id]);

  const WorkflowList = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-enfasis-5 mb-4">
          Flujo de Diseño
        </h2>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-enfasis-5" />
          <Input
            placeholder="Buscar..."
            className="pl-8 bg-enfasis-6 border-none text-sm"
          />
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {workflows.map((w) => (
            <button
              key={w.id}
              onClick={() => setSelectedWorkflow(w)}
              className={`w-full flex items-center justify-between p-3 rounded-lg text-sm transition-colors ${
                selectedWorkflow?.id === w.id
                  ? "bg-enfasis-1/10 text-enfasis-1 font-medium"
                  : "text-enfasis-5 hover:bg-enfasis-6"
              }`}
            >
              <div className="flex items-center gap-3">
                <Folder className="h-4 w-4" />
                {w.name}
              </div>
              <Badge variant="secondary" className="bg-enfasis-6 text-[10px]">
                {w.generations_count || 0}
              </Badge>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );

  return (
    <div className="flex h-screen flex-col bg-enfasis-6">
      <header className="flex h-16 items-center justify-between border-b bg-white px-4 md:px-8 shrink-0">
        <div className="flex items-center gap-4">
          {/* BOTÓN HAMBURGUESA: Solo visible en móviles */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-enfasis-5"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72">
              <WorkflowList />
            </SheetContent>
          </Sheet>
          <span className="text-xl font-bold text-enfasis-1">
            ShoeFastDesigner
          </span>
        </div>
        <span className="text-sm text-enfasis-5 hidden sm:block">
          Brand Logo
        </span>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR DESKTOP: Oculto en móviles (hidden), visible en md (flex) */}
        <aside className="hidden md:flex w-64 border-r bg-white flex-col shrink-0">
          <WorkflowList />
        </aside>

        <main className="flex-1 overflow-y-auto w-full">
          <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
              <div>
                <h1 className="text-2xl font-bold text-enfasis-5 capitalize">
                  {selectedWorkflow?.name}
                </h1>
                <p className="text-sm text-enfasis-5/70">
                  Explora las generaciones de este flujo de diseño
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1 sm:flex-none bg-enfasis-1 hover:bg-enfasis-1/90 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" /> Nueva
                </Button>
              </div>
            </div>

            {/* Grid adaptativo: 1 col móvil, 2 tablet, 3-4 desktop */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-6">
              {loadingDetails ? (
                // Skeleton o Loader mientras cargan las imágenes firmadas
                [...Array(4)].map((_, i) => (
                  <Card
                    key={i}
                    className="animate-pulse bg-enfasis-6/20 h-64 border-none"
                  />
                ))
              ) : (
                <>
                  {/* 1. MOSTRAR EL BOCETO ORIGINAL SIEMPRE PRIMERO */}
                  {originalSketch && (
                    <Card className="overflow-hidden border-2 border-dashed border-enfasis-1/30 bg-white shadow-sm">
                      <CardContent className="p-0">
                        <div className="aspect-square bg-enfasis-6/10 relative">
                          <img
                            src={originalSketch}
                            alt="Boceto Original"
                            className="object-cover w-full h-full opacity-80"
                          />
                          <Badge className="absolute top-2 left-2 bg-enfasis-1 text-white border-none text-[10px]">
                            BOCETO BASE
                          </Badge>
                        </div>
                        <div className="p-4">
                          <p className="text-sm font-bold text-enfasis-1">
                            Sketch Inicial
                          </p>
                          <p className="text-[10px] text-enfasis-5/50 uppercase tracking-tighter">
                            Referencia original
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* 2. LISTAR LAS GENERACIONES DE LA IA */}
                  {generations.map((gen, i) => (
                    <Card
                      key={gen.generation_id || i}
                      className="overflow-hidden border-none shadow-md group hover:ring-2 ring-enfasis-1 transition-all cursor-pointer"
                    >
                      <CardContent className="p-0">
                        <div className="aspect-square bg-white overflow-hidden">
                          <img
                            src={gen.image_url}
                            alt={`Generación ${i}`}
                            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                          />
                        </div>
                        <div className="p-4 bg-white">
                          <div className="flex justify-between items-start mb-1">
                            <p className="text-sm font-medium text-enfasis-5">
                              Iteración {generations.length - i}
                            </p>
                            {gen.material_id && (
                              <Badge className="bg-enfasis-2/10 text-enfasis-2 border-none text-[10px] capitalize">
                                {gen.material_id}
                              </Badge>
                            )}
                          </div>
                          <p className="text-[10px] text-enfasis-5/50">
                            {gen.created_at
                              ? new Date(gen.created_at).toLocaleDateString(
                                  "es-ES",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  },
                                )
                              : "Reciente"}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {!loadingDetails &&
                    generations.length === 0 &&
                    !originalSketch && (
                      <div className="col-span-full py-20 text-center text-enfasis-5/40">
                        <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-20" />
                        <p>
                          No se encontraron imágenes en este flujo de diseño
                        </p>
                      </div>
                    )}
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

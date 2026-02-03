"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { X, Download, ZoomIn, Move } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DesignExpanderProps } from "@/types";

export function DesignExpander({
  design,
  onClose,
  onDownload,
}: DesignExpanderProps) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const containerRef = useRef<HTMLDivElement>(null);

  if (!design) return null;

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isZoomed || !containerRef.current) return;
    const { left, top, width, height } =
      containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePos({ x, y });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-white/70 backdrop-blur-2xl animate-in fade-in duration-300"
        onClick={onClose}
      />

      <div className="absolute top-6 left-0 right-0 px-8 flex justify-between items-center z-[110]">
        <div className="flex flex-col">
          <h3 className="text-xl font-bold text-neutral-800 tracking-tight">
            {design.name.split("_")[0]}
          </h3>
          <p className="text-xs text-neutral-500 font-medium">
            Revisión de diseño de calzado
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50 rounded-2xl px-6 h-11 shadow-sm transition-all"
            onClick={() => onDownload(design.blob_path)}
          >
            <Download className="h-4 w-4 mr-2" />
            Descargar Diseño
          </Button>

          <Button
            size="icon"
            variant="ghost"
            className="h-11 w-11 rounded-full bg-white/50 hover:bg-white text-neutral-500 hover:text-neutral-950 border border-neutral-200/50 transition-all"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
          </Button>
        </div>
      </div>

      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onClick={() => setIsZoomed(!isZoomed)}
        className={`relative w-[95vw] h-[80vh] flex items-center justify-center transition-all duration-500 ease-in-out ${
          isZoomed ? "cursor-zoom-out" : "cursor-zoom-in"
        }`}
      >
        <div
          className="relative w-full h-full transition-transform duration-300 ease-out will-change-transform"
          style={{
            transform: isZoomed ? "scale(2.2)" : "scale(1)",
            transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
          }}
        >
          <Image
            src={design.url}
            alt={design.name}
            fill
            className="object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.05)]"
            priority
            unoptimized
          />
        </div>
      </div>

      <div className="absolute bottom-8 z-[110] pointer-events-none">
        <div className="flex items-center gap-2 px-5 py-2.5 bg-neutral-900/90 text-white rounded-full shadow-2xl animate-in slide-in-from-bottom-4 duration-500">
          {isZoomed ? (
            <>
              <Move className="h-3.5 w-3.5" />
              <span className="text-[11px] font-bold uppercase tracking-widest">
                Mueve el mouse para explorar texturas
              </span>
            </>
          ) : (
            <>
              <ZoomIn className="h-3.5 w-3.5" />
              <span className="text-[11px] font-bold uppercase tracking-widest">
                Click en el zapato para ampliar
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

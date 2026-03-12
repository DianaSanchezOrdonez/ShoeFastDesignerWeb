"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Cookies from "js-cookie";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Link from "next/link";
import Image from "next/image";

import butrichLogo from "@/public/brands/butrich_logo.webp";
import garcesLogo from "@/public/brands/garces_bottier_logo.webp";
import joyceLogo from "@/public/brands/joyce_vania_logo.webp";
import humbersLogo from "@/public/brands/humbers_logo.webp";
import stefaniaLogo from "@/public/brands/stefania_logo.webp";
import geppettaLogo from "@/public/brands/geppetta_logo.webp";
import betnashoesLogo from "@/public/brands/betnashoes_logo.webp";
import lacaneaLogo from "@/public/brands/lacanea_logo.webp";
import miralosLogo from "@/public/brands/miralos_logo.webp";

export default function LoginPage() {
  const router = useRouter();
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [isResetting, setIsResetting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${baseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Error en la autenticación");
      }

      Cookies.set("auth_token", data.idToken, { expires: 1 });
      Cookies.set("user_email", data.email, { expires: 1 });

      toast.success("Bienvenido", {
        description: "Acceso concedido correctamente.",
        icon: null,
      });

      router.push("/");
      router.refresh(); // Refresca para que el layout detecte el cambio
    } catch (error) {
      toast.error("Error de acceso", {
        description: "Credenciales inválidas. Por favor, inténtalo de nuevo.",
        icon: null,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!resetEmail) {
      toast.error("Correo necesario", {
        description: "Escribe tu email para enviar el link.",
      });
      return;
    }

    setIsResetting(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      toast.success("Correo enviado", {
        description:
          "Revisa tu bandeja de entrada para elegir tu nueva contraseña.",
        icon: null,
      });
      setResetEmail("");
    } catch (error) {
      toast.error("Error", {
        description: "No pudimos enviar el correo. Verifica el email.",
        icon: null,
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-enfasis-6 p-6 md:p-10">
      <Card className="w-full max-w-[420px] rounded-[24px] border-none bg-white shadow-xl shadow-slate-200/50 z-10 transition-shadow hover:shadow-2xl hover:shadow-slate-200/60">
        <CardHeader className="space-y-2 pb-8 pt-10 text-center">
          <div className="flex justify-center mb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-2xl font-bold text-enfasis-1">
                ShoeFastDesigner
              </CardTitle>
            </div>
          </div>
          <CardDescription className="text-sm font-medium text-enfasis-5">
            Bienvenido de nuevo. Ingresa a tu cuenta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-xs font-bold uppercase tracking-wider text-enfasis-5 ml-1"
              >
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="usuario@ejemplo.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 rounded-xl border-enfasis-6 bg-enfasis-6 text-slate-700 focus:border-enfasis-1 focus:ring-enfasis-1/20 transition-all"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="password"
                  className="text-xs font-bold uppercase tracking-wider text-enfasis-5 ml-1"
                >
                  Contraseña
                </Label>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 rounded-xl border-enfasis-6 bg-enfasis-6 text-slate-700 focus:border-enfasis-1 focus:ring-enfasis-1/20 pr-10 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-enfasis-5 hover:text-enfasis-1 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full h-14 bg-enfasis-1 hover:bg-enfasis-1/90 text-white text-base font-bold rounded-xl shadow-lg shadow-enfasis-1/20 mt-4 active:scale-[0.98] transition-transform"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Cargando...</span>
                </div>
              ) : (
                "Ingresar"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pb-10 pt-4">
          {/* <button className="text-sm font-medium text-enfasis-2 hover:underline transition-all">
            ¿Olvidaste tu contraseña?
          </button>
          <p className="text-xs text-enfasis-5 text-center px-6">
            Al ingresar, aceptas nuestros términos de servicio y políticas de
            privacidad.
          </p> */}

          <Dialog>
            <DialogTrigger asChild>
              <button className="text-sm font-medium text-enfasis-2 hover:underline transition-all">
                ¿Deseas elegir tu propia contraseña? <br /> Resetear aquí
              </button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[425px] rounded-[24px]">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-enfasis-1">
                  Resetear Contraseña
                </DialogTitle>
                <DialogDescription className="text-enfasis-5">
                  Te enviaremos un enlace a tu correo para que puedas cambiar la
                  contraseña aleatoria por una que tú elijas.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="reset-email"
                    className="text-xs font-bold uppercase text-enfasis-5"
                  >
                    Tu correo registrado
                  </Label>
                  <Input
                    id="reset-email"
                    placeholder="ejemplo@correo.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="h-12 rounded-xl border-enfasis-6 bg-enfasis-6"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  onClick={handlePasswordReset}
                  disabled={isResetting}
                  className="w-full h-12 bg-enfasis-1 hover:bg-enfasis-1/90 text-white font-bold rounded-xl"
                >
                  {isResetting
                    ? "Enviando..."
                    : "Enviar enlace de recuperación"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>

      <footer className="w-full max-w-[1000px] py-8 px-6">
        <div className="flex flex-col items-center gap-10">
          <div className="flex items-center w-full gap-4 max-w-[500px]">
            <div className="h-[1px] bg-enfasis-5/20 flex-1"></div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-enfasis-5/40 whitespace-nowrap">
              Marcas que confían en nosotros
            </p>
            <div className="h-[1px] bg-enfasis-5/20 flex-1"></div>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-10 w-full">
            <Link
              href="https://garcesbottier.com/"
              target="_blank"
              className="flex justify-center items-center opacity-50 hover:opacity-100 hover:scale-110 transition-transform duration-300 w-[140px]"
            >
              <Image
                src={garcesLogo}
                alt="Garces"
                height={42}
                width={140}
                className="h-auto w-auto object-contain scale-110"
                unoptimized
              />
            </Link>

            <Link
              href="https://joycevania.com/"
              target="_blank"
              className="flex justify-center items-center opacity-50 hover:opacity-100 hover:scale-110 transition-transform duration-300 w-[120px]"
            >
              <Image
                src={joyceLogo}
                alt="Joyce"
                height={45}
                width={110}
                className="h-auto w-auto object-contain"
                unoptimized
              />
            </Link>

            <Link
              href="https://butrich.com"
              target="_blank"
              className="flex justify-center items-center opacity-50 hover:opacity-100 hover:scale-110 transition-transform duration-300 w-[140px]"
            >
              <Image
                src={butrichLogo}
                alt="Butrich"
                height={30}
                width={140}
                className="h-auto w-auto object-contain"
                unoptimized
              />
            </Link>

            <Link
              href="https://geppetta.cl/"
              target="_blank"
              className="flex justify-center items-center opacity-50 hover:opacity-100 hover:scale-110 transition-transform duration-300 w-[120px]"
            >
              <Image
                src={geppettaLogo}
                alt="Geppetta"
                height={45}
                width={120}
                className="h-auto w-auto object-contain"
                unoptimized
              />
            </Link>

            <Link
              href="https://calzadoshumbers.com/"
              target="_blank"
              className="flex justify-center items-center opacity-50 hover:opacity-100 hover:scale-110 transition-transform duration-300 w-[120px]"
            >
              <Image
                src={humbersLogo}
                alt="Humbers"
                height={45}
                width={120}
                className="h-auto w-auto object-contain"
                unoptimized
              />
            </Link>

            <Link
              href="https://lacaneape.com/"
              target="_blank"
              className="flex justify-center items-center opacity-50 hover:opacity-100 hover:scale-110 transition-transform duration-300 w-[120px]"
            >
              <Image
                src={lacaneaLogo}
                alt="La Canea"
                height={45}
                width={120}
                className="h-auto w-auto object-contain"
                unoptimized
              />
            </Link>

            <Link
              href="https://betnashoes.com/"
              target="_blank"
              className="flex justify-center items-center opacity-50 hover:opacity-100 hover:scale-110 transition-transform duration-300 w-[120px]"
            >
              <Image
                src={betnashoesLogo}
                alt="Betnashoes"
                height={45}
                width={120}
                className="h-auto w-auto object-contain"
                unoptimized
              />
            </Link>

            <div className="flex justify-center items-center opacity-50 hover:opacity-100 hover:scale-110 transition-transform duration-300 w-[120px]">
              <Image
                src={stefaniaLogo}
                alt="Stefania"
                height={45}
                width={120}
                className="h-auto w-auto object-contain"
                unoptimized
              />
            </div>

            <Link
              href="https://www.instagram.com/miralos.pe/"
              target="_blank"
              className="flex justify-center items-center opacity-50 hover:opacity-100 hover:scale-110 transition-transform duration-300 w-[80px]"
            >
              <Image
                src={miralosLogo}
                alt="Miralos"
                height={35}
                width={80}
                className="h-auto w-auto object-contain"
                unoptimized
              />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

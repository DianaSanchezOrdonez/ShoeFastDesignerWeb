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
    <div className="flex min-h-screen items-center justify-center bg-enfasis-6 p-4">
      <Card className="w-full max-w-[420px] rounded-[24px] border-none bg-white shadow-xl shadow-slate-200/50">
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
    </div>
  );
}

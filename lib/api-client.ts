import Cookies from "js-cookie";

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = Cookies.get("auth_token");
  const method = options.method?.toUpperCase() || "GET";

  const headers = new Headers(options.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);

  if (options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const config: RequestInit = {
    ...options,
    method,
    headers,
  };

  if (method === "GET" || method === "HEAD") {
    delete config.body;
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`,
      config,
    );

    if (response.status === 401) {
      // 1. Borramos la cookie localmente
      Cookies.remove("auth_token");

      // 2. Forzamos un reload.
      // Al recargar, el Middleware se ejecuta, detecta que no hay token
      // y redirige al /login de forma limpia.
      if (typeof window !== "undefined") {
        window.location.reload();
      }
      return null;
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "Error en la petición");
    }

    return response;
  } catch (error) {
    throw error;
  }
}

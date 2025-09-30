import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from '@/lib/auth';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  console.log(pathname.startsWith);

  // Se for rota pública, libera (ex.: login, registro, arquivos estáticos)
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico")
  ) {
    return NextResponse.next();
  }

  // Pega o token do header Authorization
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Token ausente" }, { status: 401 });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyToken(token);
    if (!decoded?.userId) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    // Token válido → segue
    return NextResponse.next();
  } catch {
    return NextResponse.json({ error: "Token inválido ou expirado" }, { status: 401 });
  }
}

// Configura quais rotas o middleware protege
export const config = {
  matcher: ["/api/:path*"], // protege todas rotas dentro de /api
};

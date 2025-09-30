import { NextResponse } from 'next/server';

export async function GET() {
  // Verificar variáveis de ambiente (sem expor senhas)
  const envCheck = {
    NODE_ENV: process.env.NODE_ENV,
    hasUserDb: !!process.env.NEXT_PUBLIC_USER_DB,
    hasHostDb: !!process.env.NEXT_PUBLIC_HOST_DB,
    hasDatabaseDb: !!process.env.NEXT_PUBLIC_DATABASE_DB,
    hasPasswordDb: !!process.env.NEXT_PUBLIC_PASSWORD_DB,
    hasJwtSecret: !!process.env.JWT_SECRET,
    userDb: process.env.NEXT_PUBLIC_USER_DB,
    hostDb: process.env.NEXT_PUBLIC_HOST_DB,
    databaseDb: process.env.NEXT_PUBLIC_DATABASE_DB,
    // passwordDb: process.env.NEXT_PUBLIC_PASSWORD_DB ? '***' : 'NOT_SET',
  };

  return NextResponse.json({
    status: 'debug',
    environment: envCheck,
    timestamp: new Date().toISOString()
  });
}

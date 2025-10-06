import { verifyToken } from '@/lib/auth';
import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization') || '';

  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
  if (!token) {
    return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
  }

  const decoded = verifyToken(token);
  if (!decoded || !decoded.userId) {
    return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
  }

  try {

    return NextResponse.json({
      status: 0,
      error: 'Erro ao cadastrar pessoa',
      message: 'Erro desconhecido'
    }, { status: 500 });

  } catch (error) {
    console.error("Erro ao cadastrar pessoa:", error);
    return NextResponse.json({
      status: 0,
      error: 'Erro ao cadastrar pessoa',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const description = searchParams.get('description');
  const companyId = searchParams.get('companyId');

  const token = request.headers.get('authorization')?.split(' ')[1];
  if (!token) {
    return NextResponse.json({ error: 'No token provided' }, { status: 401 });
  }

  const decoded = verifyToken(token);
  if (!decoded || !decoded.userId) {
    return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
  }

  try {
    // Verificar se companyId está vazio
    if (!companyId) {
      return NextResponse.json({ error: 'Company ID é obrigatório' }, { status: 400 });
    }

    const query = `SELECT * FROM leitura_biometrica WHERE id_cpma_unidade = $1 and nome like $2 order by id desc`;
    const { rows } = await pool.query(query, [companyId, `%${description || ''}%`]);
    const data = rows.length > 0 ? rows : [];

    return NextResponse.json({ data, message: "List leitura biometrica." }, { status: 200 });

  } catch (error) {
    console.error("Erro na query:", error);
    return NextResponse.json({ error: 'Failed to fetch leitura biometrica' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const authHeader = request.headers.get('authorization') || '';

  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
  if (!token) {
    return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
  }

  const decoded = verifyToken(token);
  if (!decoded || !decoded.userId) {
    return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
  }

  return NextResponse.json({
    status: 0,
    error: 'Pessoa não encontrada'
  }, { status: 404 });

}
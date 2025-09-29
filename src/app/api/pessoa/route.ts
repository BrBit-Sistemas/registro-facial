import { generateToken, verifyToken } from '@/lib/auth';
import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const {searchParams } = new URL(request.url);
  const companyId = searchParams.get('companyId');
  const authHeader = request.headers.get('authorization') || '';
  
const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
  if (!token) {
    return new Response('Token não fornecido', { status: 401 });
  }
  
  const decoded = verifyToken(token);
  if (!decoded ||!decoded.userId) {
    return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
  }
   try{

       return NextResponse.json({token, message: "authorization"  }, { status: 200 });
   
  } catch (error) {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const {searchParams } = new URL(request.url);
  const description = searchParams.get('description');
  const companyId = searchParams.get('companyId');
  
  const token = request.headers.get('authorization')?.split(' ')[1];
  if (!token) {
    return NextResponse.json({ error: 'No token provided' }, { status: 401 });
  }
  
  const decoded = verifyToken(token);
  if (!decoded ||!decoded.userId) {
    return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
  }

  try {
    const { rows } = await pool.query(`SELECT * FROM pessoas WHERE id_cpma_unidade = '${companyId}' and nome_completo like '%${description}%'`);
    const data = rows[0] === undefined? null : rows;
      
      if (!data) {
        return NextResponse.json({ error: 'pessoas not found' }, { status: 404 });
      }
      return NextResponse.json({ data, message: "List pessoas." }, { status: 200 });
 
    } catch (error) {
    return NextResponse.json({error: 'Failed to fetch products' }, { status: 500 });
  }
}
// app/api/auth/login/route.ts
import { comparePassword, generateToken } from '@/lib/auth';
import pool from '@/lib/db';
import { NextResponse } from 'next/server';
//login teste: admin@sagep.com.br / Password: Act@728125
export async function POST(request: Request) {
  const { email, password } = await request.json();
  
  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  }

  try {
    const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    const user = result.rows[0];
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isValid = (await comparePassword(password, user.password));

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    const getComapany = await pool.query('SELECT * FROM empresa WHERE id = $1', [user.id_cpma_unidade]);
    const restCompany = getComapany.rows[0] === undefined ? null : getComapany.rows[0];

    const getUser = await pool.query('SELECT id, email, nome FROM usuarios WHERE id = $1', [user.id]);
    const restUser = getUser.rows[0] === undefined ? null : getUser.rows[0];

    const token = generateToken(user.id);
    return NextResponse.json({token, company: restCompany, user: restUser }, { status: 200 });
  } catch (error) {
    console.error('Erro no login:', error);
    return NextResponse.json({ 
      error: 'Login failed', 
      details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined 
    }, { status: 500 });
  }
}
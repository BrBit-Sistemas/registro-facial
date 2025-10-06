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
  if (!decoded ||!decoded.userId) {
    return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
  }

  try {
    return NextResponse.json({
    status: 0,
    error: 'Empresa não encontrada'
  }, { status: 404 });
    
  } catch (error) {
    console.error("Erro ao cadastrar Empresa:", error);
    return NextResponse.json({ 
      status: 0, 
      error: 'Erro ao cadastrar Empresa',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const {searchParams } = new URL(request.url);
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
    // Verificar se companyId está vazio
    if (!companyId) {
      return NextResponse.json({ error: 'Company ID é obrigatório' }, { status: 400 });
    }
    
    const query = `SELECT * FROM empresa WHERE id = $1`;
    const { rows } = await pool.query(query, [companyId]);
    const data = rows.length > 0 ? rows : [];
      
    return NextResponse.json({ data, message: "List empresa." }, { status: 200 });
 
    } catch (error) {
      console.error("Erro na query:", error);
      return NextResponse.json({error: 'Failed to fetch empresas' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
  const authHeader = request.headers.get('authorization') || '';
  
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
  if (!token) {
    return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
  }
  
  const decoded = verifyToken(token);
  if (!decoded ||!decoded.userId) {
    return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    if (!body.id) {
      return NextResponse.json({ 
        status: 0, 
        error: 'ID da pessoa é obrigatório para edição'
      }, { status: 400 });
    }
    
    // Mapear os campos do frontend para o banco de dados
    const updateQuery = `
      UPDATE empresa SET data_cadastro = $2,
        razao_social = $3,
        cnpj = $4, 
        inscricao_estadual = $5,
        endereco = $6,
        complemento = $7,
        bairro = $8,
        ponto_referencia = $9,
        cidade = $10,
        uf = $11,
        contato = $12,
        email = $13,
        site = $14,
        dados_adicionais = $15,
        telefone = $16,
        celular = $17,
        cep = $18,
        responsavel = $19,
        status = $20,
        ip_facial = $21,
        id_usuario = $22
      WHERE id = $1
      RETURNING id
    `;
    
    const values = [
      body.id,
      body.data_cadastro,
      body.razao_social,
      body.cnpj,
      body.inscricao_estadual,
      body.endereco,
      body.complemento,
      body.bairro,
      body.ponto_referencia,
      body.cidade,
      body.uf,
      body.contato,
      body.email,
      body.site,
      body.dados_adicionais,
      body.telefone,
      body.celular,
      body.cep,
      body.responsavel,
      body.status,
      body.ip_facial,
      body.id_usuario
    ];
    
    const result = await pool.query(updateQuery, values);
    
    if (result.rows.length === 0) {
      return NextResponse.json({ 
        status: 0, 
        error: 'Empresa não encontrada'
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      status: 1, 
      message: "Empresa atualizada com sucesso!",
      data: { id: result.rows[0].id }
    }, { status: 200 });
    
  } catch (error) {
    console.error("Erro ao atualizar empresa:", error);
    return NextResponse.json({ 
      status: 0, 
      error: 'Erro ao atualizar empresa',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const personId = searchParams.get('id');
  const token = request.headers.get('authorization')?.split(' ')[1];
  
  if (!token) {
    return NextResponse.json({ error: 'No token provided' }, { status: 401 });
  }
  const decoded = verifyToken(token);
  if (!decoded ||!decoded.userId) {
    return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
  }
  if (!personId) {
    return NextResponse.json({ error: 'Empresa ID is required' }, { status: 400 });
  }
  try {
    return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 });
  } catch (error) {
    console.error('Error deleting empresa:', error);
    return NextResponse.json({ error: 'Failed to delete empresa' }, { status: 500 });
  }
}
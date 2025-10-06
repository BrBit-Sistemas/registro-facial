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
      UPDATE pessoas SET 
        nome_completo = $2, cpf = $3, rg = $4, data_nascimento = $5, sexo = $6, 
        vara = $7, regime_penal = $8, cidade = $9, uf = $10, processo = $11, 
        status = $12, prontuario = $13, naturalidade = $14, nacionalidade = $15, 
        nome_pai = $16, nome_mae = $17, contato_1 = $18, contato_2 = $19, 
        tipo_frequencia = $20, motivo_encerramento = $21, dados_adicionais = $22, 
        foto = $23
      WHERE id = $1
      RETURNING id
    `;
    
    const values = [
      body.id,
      body.Nome,
      body.CPF,
      body.RG,
      body.Data_Nascimento,
      body.Sexo,
      body.Vara,
      body.Regime,
      body.Cidade,
      body.UF,
      body.Processo,
      body.Status || 'Ativo',
      body.Prontuario || '',
      body.Naturalidade,
      body.Nacionalidade,
      body.Nome_Pai,
      body.Nome_Mae,
      body.Contato_1,
      body.Contato_2,
      body.tipo_frequencia,
      body.Motivo_Encerramento,
      body.Dados_Adicionais,
      body.Foto
    ];
    
    const result = await pool.query(updateQuery, values);
    
    if (result.rows.length === 0) {
      return NextResponse.json({ 
        status: 0, 
        error: 'Pessoa não encontrada'
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      status: 1, 
      message: "Pessoa atualizada com sucesso!",
      data: { id: result.rows[0].id }
    }, { status: 200 });
    
  } catch (error) {
    console.error("Erro ao atualizar pessoa:", error);
    return NextResponse.json({ 
      status: 0, 
      error: 'Erro ao atualizar pessoa',
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
    return NextResponse.json({ error: 'Person ID is required' }, { status: 400 });
  }
  try {
    const deleteQuery = 'UPDATE pessoas SET status = $1 WHERE id = $2';
    const result = await pool.query(deleteQuery, ['Inativo', personId]);
    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Person not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Person deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting person:', error);
    return NextResponse.json({ error: 'Failed to delete person' }, { status: 500 });
  }
}
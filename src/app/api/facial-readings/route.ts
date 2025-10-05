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
    const body = await request.json();

    // Mapear os campos do frontend para o banco de dados
    const insertQuery = `
      INSERT INTO pessoas (
        id_facial, nome_completo, cpf, rg, data_nascimento, sexo, vara, 
        regime_penal, cidade, uf, processo, status, prontuario, naturalidade, 
        nacionalidade, nome_pai, nome_mae, contato_1, contato_2, tipo_frequencia, 
        motivo_encerramento, dados_adicionais, foto, id_cpma_unidade, id_usuario
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)
      RETURNING id
    `;

    const values = [
      body.idFacial || null,
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
      body.Prontuario || body.idFacial,
      body.Naturalidade,
      body.Nacionalidade,
      body.Nome_Pai,
      body.Nome_Mae,
      body.Contato_1,
      body.Contato_2,
      body.tipo_frequencia,
      body.Motivo_Encerramento,
      body.Dados_Adicionais,
      body.Foto,
      body.ID_CPMA_UNIDADE,
      body.ID_usuario
    ];

    const result = await pool.query(insertQuery, values);

    return NextResponse.json({
      status: 1,
      message: "Pessoa cadastrada com sucesso!",
      data: { id: result.rows[0].id }
    }, { status: 200 });

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

    const query = `SELECT * FROM leitura_biometrica WHERE id_cpma_unidade = $1 and nome like $2`;
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
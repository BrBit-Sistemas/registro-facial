// app/api/facial-recognition/events/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from '@/lib/db';

// Cache em memória para prevenir duplicatas em curto período
const recentReadings = new Map();
const DEDUPLICATION_WINDOW = 30000; // 30 segundos

export async function POST(req: NextRequest) {
  try {
    // 1) Pega o corpo como texto bruto
    const rawBody = await req.text();

    // 2) Extrai JSON do multipart
    let jsonStr = "";
    let escrever = false;
    const lines = rawBody.split(/\r\n|\n|\r/);

    for (let i = 0; i < lines.length - 1; i++) {
      if (lines[i].startsWith("--myboundary")) {
        if (!escrever) {
          escrever = true;
          i += 3;
          continue;
        } else {
          break;
        }
      }

      if (escrever) {
        jsonStr += lines[i].trim();
      }
    }

    if (!jsonStr) {
      return NextResponse.json({ error: "Nenhum JSON encontrado" }, { status: 400 });
    }

    const parsed = JSON.parse(jsonStr);

    // 3) Pega os dados igual no PHP
    const evento = parsed?.Events?.[0];
    if (!evento) {
      return NextResponse.json({ error: "Evento inválido" }, { status: 400 });
    }

    const data = evento.Data;
    let userId = (data.UserID || "").trim();
    let leitorId = "";

    if (userId === "") {
      userId = "-1";
      leitorId = data.ReaderID;
    } else {
      leitorId = data.ReadID || data.ReaderID;
    }

    // 4) Verificação de duplicidade - Cache em memória
    const readingKey = `${userId}-${leitorId}-${Date.now()}`;
    const recentKey = Array.from(recentReadings.entries())
      .find(([key, timestamp]) => 
        key.startsWith(`${userId}-${leitorId}`) && 
        (Date.now() - timestamp) < DEDUPLICATION_WINDOW);
    
    if (recentKey) {
      console.log("Leitura duplicada detectada (cache)", userId, leitorId);
      return NextResponse.json({
        message: "Leitura já processada recentemente",
        code: "200",
        auth: "false"
      }, { status: 409 });
    }
    
    // Adicionar ao cache
    recentReadings.set(readingKey, Date.now());
    
    // Limpar cache antigo periodicamente
    if (recentReadings.size > 1000) {
      for (const [key, timestamp] of recentReadings.entries()) {
        if (Date.now() - timestamp > DEDUPLICATION_WINDOW) {
          recentReadings.delete(key);
        }
      }
    }

    // 5) Verificação de duplicidade - Banco de dados
    // Primeiro, busca o usuário pelo ID facial
    const userQuery = await pool.query(
      'SELECT id, prontuario, nome_completo, vara, regime_penal, processo FROM pessoas WHERE prontuario = $1',
      [userId]
    );

    if (userQuery.rows.length === 0) {
      console.log("401 - Rosto não cadastrado", userId);
      return NextResponse.json({
        message: "Rosto não cadastrado no sistema!",
        code: "200",
        auth: "false"
      });
    }

    const user = userQuery.rows[0];
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().split(' ')[0];

    // Verifica se já existe uma leitura para este usuário hoje
    const existingReading = await pool.query(
      `SELECT id FROM leitura_biometrica 
       WHERE prontuario = $1 AND data_leitura = $2 
       AND hora_leitura BETWEEN $3 AND $4`,
      [
        user.prontuario, 
        currentDate,
        // Verifica leituras dentro dos últimos 5 minutos
        new Date(now.getTime() - 5 * 60000).toTimeString().split(' ')[0],
        currentTime
      ]
    );

    if (existingReading.rows.length > 0) {
      console.log("Leitura duplicada detectada (BD)", user.prontuario);
      return NextResponse.json({
        message: "Leitura já registrada hoje",
        code: "200",
        auth: "false"
      }, { status: 409 });
    }

    // 6) Se não for duplicada, insere a nova leitura
    const result = await pool.query(
      `INSERT INTO leitura_biometrica 
       (hora_leitura, data_leitura, prontuario, nome, vara, regime, tipo, imprimir, processo, id_usuario, id_cpma_unidade) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
       RETURNING id`,
      [
        currentTime,
        currentDate,
        user.prontuario,
        user.nome_completo,
        user.vara,
        user.regime_penal,
        'F', // Tipo F para reconhecimento facial
        'N', // Não imprimir comprovante
        user.processo,
        user.id, // ID do usuário da tabela pessoas
        '1'  // ID da unidade CPMA (ajustar conforme necessário)
      ]
    );

    const insertedId = result.rows[0].id;
    console.log("200 - Leitura registrada", insertedId);
    
    return NextResponse.json({
      message: "Favor retirar seu comprovante",
      code: "200",
      auth: "true",
      userId: insertedId
    });

  } catch (err) {
    console.error("Erro:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
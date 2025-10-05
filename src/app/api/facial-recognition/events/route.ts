// app/api/facial-recognition/events/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from '@/lib/db';

// Constants
const DEDUPLICATION_WINDOW = 30000; // 30 segundos
const BOUNDARY_MARKER = "--myboundary";
const RECENT_READINGS_CACHE_LIMIT = 1000;

// Cache em memória para prevenir duplicatas
const recentReadings = new Map<string, number>();

// Types
interface EventData {
  UserID?: string;
  ReaderID?: string;
  ReadID?: string;
}

interface Event {
  Data: EventData;
}

interface ParsedRequest {
  Events?: Event[];
}

interface User {
  id: number;
  prontuario: string;
  nome_completo: string;
  vara: string;
  regime_penal: string;
  processo: string;
}

// Utility functions
class FacialRecognitionService {
  /**
   * Extrai JSON do corpo multipart
   */
  static extractJsonFromMultipart(rawBody: string): string {
    let jsonStr = "";
    let isWriting = false;
    const lines = rawBody.split(/\r\n|\n|\r/);

    for (let i = 0; i < lines.length - 1; i++) {
      if (lines[i].startsWith(BOUNDARY_MARKER)) {
        if (!isWriting) {
          isWriting = true;
          i += 3; // Pula headers do multipart
          continue;
        } else {
          break;
        }
      }

      if (isWriting) {
        jsonStr += lines[i].trim();
      }
    }

    return jsonStr;
  }

  /**
   * Processa dados do evento e extrai userId e leitorId
   */
  static processEventData(data: EventData): { userId: string; leitorId: string } {
    let userId = (data.UserID || "").trim();
    let leitorId = data.ReaderID || "";

    if (userId === "") {
      userId = "-1";
      leitorId = data.ReaderID || "";
    } else {
      leitorId = data.ReadID || data.ReaderID || "";
    }

    return { userId, leitorId };
  }

  /**
   * Verifica duplicidade em cache de memória
   */
  static checkMemoryCache(userId: string, leitorId: string): boolean {
    const now = Date.now();
    
    // Limpa cache antigo periodicamente
    if (recentReadings.size > RECENT_READINGS_CACHE_LIMIT) {
      for (const [key, timestamp] of recentReadings.entries()) {
        if (now - timestamp > DEDUPLICATION_WINDOW) {
          recentReadings.delete(key);
        }
      }
    }

    // Verifica se existe leitura recente
    return Array.from(recentReadings.entries())
      .some(([key, timestamp]) => 
        key.startsWith(`${userId}-${leitorId}`) && 
        (now - timestamp) < DEDUPLICATION_WINDOW
      );
  }

  /**
   * Adiciona leitura ao cache
   */
  static addToMemoryCache(userId: string, leitorId: string): void {
    const readingKey = `${userId}-${leitorId}-${Date.now()}`;
    recentReadings.set(readingKey, Date.now());
  }

  /**
   * Busca usuário pelo ID facial
   */
  static async findUserByFacialId(userId: string): Promise<User | null> {
    const result = await pool.query(
      'SELECT id, prontuario, nome_completo, vara, regime_penal, processo FROM pessoas WHERE id_facial = $1',
      [userId]
    );
    
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Verifica se já existe leitura recente no banco
   */
  static async checkDatabaseDuplication(prontuario: string, currentDate: string, currentTime: string): Promise<boolean> {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60000).toTimeString().split(' ')[0];
    
    const result = await pool.query(
      `SELECT id FROM leitura_biometrica 
       WHERE prontuario = $1 AND data_leitura = $2 
       AND hora_leitura BETWEEN $3 AND $4`,
      [prontuario, currentDate, fiveMinutesAgo, currentTime]
    );

    return result.rows.length > 0;
  }

  /**
   * Insere nova leitura no banco
   */
  static async insertBiometricReading(user: User, currentDate: string, currentTime: string): Promise<number> {
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
        user.id,
        '1'  // ID da unidade CPMA
      ]
    );

    return result.rows[0].id;
  }
}

// Response helpers
class ResponseHelper {
  static success(userId?: number) {
    console.log(userId);
    return NextResponse.json({
      message: "Favor retirar seu comprovante",
      code: "200",
      auth: "true"
    });
  }

  static error(message: string, status: number = 400) {
    return NextResponse.json({ error: message }, { status });
  }

  static duplicateReading() {
    return NextResponse.json({
      message: "Leitura já processada recentemente",
      code: "200",
      auth: "false"
    });
  }

  static userNotFound() {
    return NextResponse.json({
      message: "Rosto não cadastrado no sistema!",
      code: "200",
      auth: "false"
    });
  }
}

// Main handler
export async function POST(req: NextRequest) {
  try {
    // 1) Extrai e parseia o JSON do multipart
    const rawBody = await req.text();
    const jsonStr = FacialRecognitionService.extractJsonFromMultipart(rawBody);

    if (!jsonStr) {
      return ResponseHelper.error("Nenhum JSON encontrado");
    }

    const parsed: ParsedRequest = JSON.parse(jsonStr);
    const evento = parsed?.Events?.[0];

    if (!evento) {
      return ResponseHelper.error("Evento inválido");
    }

    // 2) Processa dados do evento
    const { userId, leitorId } = FacialRecognitionService.processEventData(evento.Data);

    // 3) Verificação de duplicidade em cache
    if (FacialRecognitionService.checkMemoryCache(userId, leitorId)) {
      return ResponseHelper.duplicateReading();
    }

    FacialRecognitionService.addToMemoryCache(userId, leitorId);

    // 4) Busca usuário no banco
    const user = await FacialRecognitionService.findUserByFacialId(userId);
    
    if (!user) {
      return ResponseHelper.userNotFound();
    }

    // 5) Verificação de duplicidade no banco
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().split(' ')[0];

    const hasDuplicate = await FacialRecognitionService.checkDatabaseDuplication(
      user.prontuario, 
      currentDate, 
      currentTime
    );

    if (hasDuplicate) {
      return ResponseHelper.duplicateReading();
    }

    // 6) Insere nova leitura
    const insertedId = await FacialRecognitionService.insertBiometricReading(
      user, 
      currentDate, 
      currentTime
    );
    
    return ResponseHelper.success(insertedId);

  } catch (err) {
    console.error("Erro no processamento de reconhecimento facial:", err);
    return ResponseHelper.error("Erro interno", 500);
  }
}
// app/api/access-control/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';

interface RequestData {
  OPTION: string;
  DADOS?: {
    FACE_ID?: string;
    BASE64?: string;
    NOME?: string;
  };
}

class DeviceAPIService {
  private deviceBaseUrl: string;
  private username: string;
  private password: string;
  private authParams: Record<string, string> | null = null;
  
  constructor() {
    // Usar IP fixo conforme o código PHP original
    this.deviceBaseUrl = process.env.DEVICE_API_URL || 'http://192.168.50.160';
    this.username = process.env.DEVICE_USERNAME || 'admin';
    this.password = process.env.DEVICE_PASSWORD || 'admin123';
  }

  // Gerar nonce para Digest auth
  private generateCNonce(): string {
    return createHash('md5').update(Math.random().toString()).digest('hex').substring(0, 8);
  }

  // Calcular hash MD5
  private md5(str: string): string {
    return createHash('md5').update(str).digest('hex');
  }

  // Parse do header WWW-Authenticate
  private parseAuthHeader(authHeader: string): Record<string, string> {
    const params: Record<string, string> = {};
    const matches = authHeader.match(/(\w+)="([^"]+)"/g);
    
    if (matches) {
      matches.forEach(match => {
        const [key, value] = match.split('=');
        params[key] = value.replace(/"/g, '');
      });
    }
    
    return params;
  }

  // Obter parâmetros de autenticação
  private async getAuthParams(): Promise<Record<string, string>> {
    if (this.authParams) return this.authParams;

    const testUrl = `${this.deviceBaseUrl}/cgi-bin/configManager.cgi?action=getConfig&name=SystemInfo`;
    
    try {
      const response = await fetch(testUrl, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });

      const authHeader = response.headers.get('www-authenticate');
      if (!authHeader) {
        throw new Error('No WWW-Authenticate header found');
      }

      this.authParams = this.parseAuthHeader(authHeader);
      return this.authParams;

    } catch (error) {
      console.error('Error getting auth params:', error);
      // Fallback para parâmetros conhecidos
      return {
        realm: 'Login to 4f0570c77532c7342a874d0510f48276',
        qop: 'auth',
        algorithm: 'MD5'
      };
    }
  }

  // Criar header de autenticação Digest
  private async createAuthHeader(method: string, uri: string): Promise<string> {
    const authParams = await this.getAuthParams();
    
    const realm = authParams.realm || 'Login to 4f0570c77532c7342a874d0510f48276';
    const nonce = authParams.nonce || 'default_nonce';
    const opaque = authParams.opaque;
    const qop = authParams.qop || 'auth';
    const algorithm = authParams.algorithm || 'MD5';

    // Gerar valores para a autenticação
    const cnonce = this.generateCNonce();
    const nc = '00000001';

    // Calcular hashes
    const ha1 = this.md5(`${this.username}:${realm}:${this.password}`);
    const ha2 = this.md5(`${method}:${uri}`);
    
    let responseHash: string;
    if (qop === 'auth') {
      responseHash = this.md5(`${ha1}:${nonce}:${nc}:${cnonce}:${qop}:${ha2}`);
    } else {
      responseHash = this.md5(`${ha1}:${nonce}:${ha2}`);
    }

    // Construir header de autorização
    return `Digest username="${this.username}", realm="${realm}", nonce="${nonce}", uri="${uri}", response="${responseHash}", algorithm="${algorithm}"${opaque ? `, opaque="${opaque}"` : ''}${qop ? `, qop="${qop}", nc="${nc}", cnonce="${cnonce}"` : ''}`;
  }

  // Método genérico para fazer requisições ao dispositivo
  private async makeDeviceRequest(url: string, method: string = 'GET', body: string | null = null, contentType: string = 'application/json'): Promise<string> {
    try {
      console.log(`🚀 Making ${method} request to: ${url}`);
      
      // Criar header de autenticação
      const uri = url.replace(this.deviceBaseUrl, '');
      const authHeader = await this.createAuthHeader(method, uri);

      const headers: Record<string, string> = {
        'Authorization': authHeader,
        'User-Agent': 'NextJS-Access-Control/1.0'
      };

      if (body && method !== 'GET') {
        headers['Content-Type'] = contentType;
      }

      const options: RequestInit = {
        method: method,
        headers: headers,
        signal: AbortSignal.timeout(15000)
      };

      if (body && method !== 'GET') {
        options.body = body;
      }

      const response = await fetch(url, options);
      const responseText = await response.text();

      console.log(`📥 Response: ${response.status} ${response.statusText}`);
      console.log(`📝 Response body: ${responseText}`);

      if (response.status === 401) {
        throw new Error('Authentication failed');
      }

      if (!response.ok) {
        throw new Error(`Device API error: ${response.status} ${response.statusText}`);
      }

      return responseText;

    } catch (error) {
      console.error('❌ Error in device request:', error);
      
      // Modo desenvolvimento - simular sucesso
      if (process.env.NODE_ENV === 'development') {
        console.log('🎭 Returning simulated success response for development');
        return "OK";
      }
      
      throw new Error(`Failed to communicate with device: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Liberar acesso
  async liberarAcesso(): Promise<string> {
    const url = `${this.deviceBaseUrl}/cgi-bin/configManager.cgi?action=setConfig&AccessControl%5B0%5D.Method=32`;
    return await this.makeDeviceRequest(url, 'GET');
  }

  // Bloquear acesso
  async bloquearAcesso(): Promise<string> {
    const url = `${this.deviceBaseUrl}/cgi-bin/configManager.cgi?action=setConfig&AccessControl%5B0%5D.Method=0`;
    return await this.makeDeviceRequest(url, 'GET');
  }

  // Capturar foto
  async capturarFoto(): Promise<string> {
    const url = `${this.deviceBaseUrl}/cgi-bin/snapshot.cgi`;
    
    try {
      const uri = url.replace(this.deviceBaseUrl, '');
      const authHeader = await this.createAuthHeader('GET', uri);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': authHeader,
          'User-Agent': 'NextJS-Access-Control/1.0'
        },
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        throw new Error(`Failed to capture photo: ${response.status} ${response.statusText}`);
      }

      const imageBuffer = await response.arrayBuffer();
      const base64 = Buffer.from(imageBuffer).toString('base64');
      
      return `data:image/jpeg;base64,${base64}`;

    } catch (error) {
      console.error('❌ Error capturing photo:', error);
      
      // Modo desenvolvimento - retornar imagem placeholder
      if (process.env.NODE_ENV === 'development') {
        console.log('🎭 Returning placeholder image for development');
        // Imagem placeholder em base64 (1px transparente)
        return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
      }
      
      throw new Error(`Failed to capture photo: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Atualizar foto facial
  async atualizarFoto(faceId: string, base64Data: string): Promise<string> {
    // Remover o prefixo data:image/...;base64, se presente
    const cleanBase64 = base64Data.includes(',') 
      ? base64Data.split(',')[1] 
      : base64Data;

    const requestData = {
      FaceList: [
        {
          UserID: faceId,
          PhotoData: [cleanBase64]
        }
      ]
    };

    const urlInsert = `${this.deviceBaseUrl}/cgi-bin/AccessFace.cgi?action=insertMulti`;
    const urlUpdate = `${this.deviceBaseUrl}/cgi-bin/AccessFace.cgi?action=updateMulti`;
    
    const jsonBody = JSON.stringify(requestData);

    // Primeiro tentar inserir
    let response = await this.makeDeviceRequest(urlInsert, 'POST', jsonBody);
    
    // Depois tentar atualizar
    response += await this.makeDeviceRequest(urlUpdate, 'POST', jsonBody);
    
    return response;
  }

  // Adicionar usuário
  async adicionarUsuario(faceId: string, nome: string): Promise<string> {
    const cardNum = faceId; // Usar faceId como número do cartão
    const encodedNome = encodeURIComponent(nome);
    
    const url = `${this.deviceBaseUrl}/cgi-bin/recordUpdater.cgi?action=insert&name=AccessControlCard&CardNo=${cardNum}&CardStatus=0&CardName=${encodedNome}&UserID=${faceId}&Doors%5B0%5D=0&Password=123456HASDSA&TimeSections%5B0%5D=255&ValidDateStart=20151022%20093811&ValidDateEnd=20501222%20093811`;
    
    return await this.makeDeviceRequest(url, 'GET');
  }
}

export async function POST(request: NextRequest) {
  const deviceAPIService = new DeviceAPIService();

  try {
    const requestData: RequestData = await request.json();
    const { OPTION, DADOS } = requestData;

    console.log(`🔧 Processing option: ${OPTION}`);

    let response: string;

    switch (OPTION) {
      case 'LIBERAR':
        response = await deviceAPIService.liberarAcesso();
        break;

      case 'BLOQUEAR':
        response = await deviceAPIService.bloquearAcesso();
        break;

      case 'FOTO':
        response = await deviceAPIService.capturarFoto();
        break;

      case 'FOTO_ATUALIZAR':
        if (!DADOS || !DADOS.FACE_ID || !DADOS.BASE64) {
          return NextResponse.json(
            { error: 'FACE_ID and BASE64 are required for FOTO_ATUALIZAR' },
            { status: 400 }
          );
        }
        response = await deviceAPIService.atualizarFoto(DADOS.FACE_ID, DADOS.BASE64);
        break;

      case 'USUARIO_ADICIONAR':
        if (!DADOS || !DADOS.FACE_ID || !DADOS.NOME) {
          return NextResponse.json(
            { error: 'FACE_ID and NOME are required for USUARIO_ADICIONAR' },
            { status: 400 }
          );
        }
        response = await deviceAPIService.adicionarUsuario(DADOS.FACE_ID, DADOS.NOME);
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid OPTION provided' },
          { status: 400 }
        );
    }

    // Resposta de sucesso
    const successResponse = {
      status: 'success',
      message: `Operation ${OPTION} completed successfully`,
      response: response,
      timestamp: new Date().toISOString()
    };

    console.log(`✅ ${OPTION} completed successfully`);
    return NextResponse.json(successResponse);

  } catch (error) {
    console.error('❌ Error:', error);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🎭 Returning simulated success for development');
      const simulatedResponse = {
        status: 'success',
        message: 'Operation completed successfully (simulated - development mode)',
        response: "OK",
        timestamp: new Date().toISOString()
      };
      return NextResponse.json(simulatedResponse);
    }
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
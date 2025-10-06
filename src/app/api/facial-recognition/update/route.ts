// app/api/facial-recognition/update/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';

// Interface para os dados do usuário
interface UserInfo {
  UserName: string;
  PhotoData?: string[];
}

interface RequestData {
  ipFacial: string;
  UserID: string;
  Info: UserInfo;
}

// Mock database - na implementação real, isso viria de um banco de dados
// const userDatabase = new Map([
//   ['6', { UserName: 'Alexandre16', hasBiometricData: true }],
//   ['17', { UserName: 'Maria23', hasBiometricData: false }],
//   ['18', { UserName: 'Joao45', hasBiometricData: true }]
// ]);

class DeviceAPIService {
  private deviceBaseUrl: string;
  private username: string;
  private password: string;
  private authParams: Record<string, string> | null = null;
  
  constructor() {
    let deviceIp = process.env.DEVICE_API_URL || 'http://localhost:8080';
    deviceIp = deviceIp.replace('{{', '').replace('}}', '');
    this.deviceBaseUrl = deviceIp;
    
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

    const testUrl = `${this.deviceBaseUrl}/cgi-bin/FaceInfoManager.cgi?action=count`;
    
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

  // Método para debug detalhado
  private debugRequestDetails(url: string, headers: Record<string, string>, body: string): void {
    
    // Log completo se for pequeno
    if (body.length < 1000) {
      console.log('Full body:', body);
    }
  }

  // Método alternativo para formato simples
  private async trySimpleFormat(url: string, authHeader: string, userId: string, userInfo: UserInfo): Promise<string> {
    const simpleData = `UserID=${userId}&UserName=${encodeURIComponent(userInfo.UserName)}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'NextJS-Facial-Recognition/1.0'
      },
      body: simpleData,
      signal: AbortSignal.timeout(10000)
    });

    const responseText = await response.text();

    return responseText;
  }

  async updateFacialData(ipFacial: string, userId: string, userInfo: UserInfo): Promise<string> {
    this.deviceBaseUrl = `${ipFacial}`;
    try {
      
      // Modo desenvolvimento - simular se não conseguir conectar
      if (this.deviceBaseUrl.includes('localhost')) {
        await new Promise(resolve => setTimeout(resolve, 500));
        return "OK\r\n";
      }

      const endpoint = '/cgi-bin/FaceInfoManager.cgi?action=update';
      const url = `${this.deviceBaseUrl}${endpoint}`;

      // Criar header de autenticação
      const authHeader = await this.createAuthHeader('POST', endpoint);

      // Garantir que PhotoData seja um array
      if (userInfo.PhotoData && !Array.isArray(userInfo.PhotoData)) {
        userInfo.PhotoData = [userInfo.PhotoData];
      }

      // Preparar dados no formato exato do Postman
      const photoDataString = userInfo.PhotoData && userInfo.PhotoData.length > 0 
        ? `"${userInfo.PhotoData[0]}"` 
        : '';

      const formattedJson = `{ \r\n   "UserID":"${userId}",\r\n   "Info":{ \r\n      "UserName":"${userInfo.UserName}",\r\n      "PhotoData":[${photoDataString}]          \t\t\t\r\n   }\r\n}`;

      // Debug detalhado
      this.debugRequestDetails(url, {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'User-Agent': 'NextJS-Facial-Recognition/1.0'
      }, formattedJson);

      // Primeiro tentar formato JSON complexo (como no Postman)
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json',
            'User-Agent': 'NextJS-Facial-Recognition/1.0'
          },
          body: formattedJson,
          signal: AbortSignal.timeout(15000)
        });

        const responseText = await response.text();

        if (response.status === 400) {
          const responseHeaders: Record<string, string> = {};
          response.headers.forEach((value, key) => {
            responseHeaders[key] = value;
          });
        }

        if (response.status === 401) {
          throw new Error('Authentication failed');
        }

        if (!response.ok) {
          throw new Error(`Device API error: ${response.status} ${response.statusText}`);
        }

        return responseText;

      } catch {
        console.log('❌ JSON format failed, trying simple format...');
        // Se falhar, tentar formato simples
        return await this.trySimpleFormat(url, authHeader, userId, userInfo);
      }

    } catch (error) {
      console.error('❌ Error calling device API:', error);
      
      // Modo desenvolvimento - simular sucesso
      if (process.env.NODE_ENV === 'development') {
        return "OK\r\n";
      }
      
      throw new Error(`Failed to update device: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async checkDeviceStatus(ipFacial: string): Promise<boolean> {
    try {
      this.deviceBaseUrl = `${ipFacial}`;
      // Modo desenvolvimento
      if (this.deviceBaseUrl.includes('localhost')) {
        return true;
      }

      // Testar um endpoint simples que deve existir
      const testUrl = `${this.deviceBaseUrl}/`;
      const response = await fetch(testUrl, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });

      return response.ok;

    } catch (error) {
      console.error('❌ Error checking device status:', error);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🔧 Simulating device online for development');
        return true;
      }
      
      return false;
    }
  }
}

// Serviço de validação de dados
class ValidationService {
  validateUserData(userId: string, userInfo: UserInfo): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validar UserID
    if (!userId || userId.trim() === '') {
      errors.push('UserID is required');
    } else if (!/^\d+$/.test(userId)) {
      errors.push('UserID must be a numeric value');
    }

    // Validar UserName
    if (!userInfo.UserName || userInfo.UserName.trim() === '') {
      errors.push('UserName is required');
    } else if (userInfo.UserName.length > 50) {
      errors.push('UserName must be less than 50 characters');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

}

// Serviço de processamento de dados biométricos
class BiometricProcessor {
  async processBiometricUpdate(userId: string, userInfo: UserInfo): Promise<void> {
    try {
      
      // Garantir que PhotoData seja um array
      if (userInfo.PhotoData && !Array.isArray(userInfo.PhotoData)) {
        userInfo.PhotoData = [userInfo.PhotoData];
      }

      if (userInfo.PhotoData && userInfo.PhotoData.length > 0) {
        await this.processPhotoData(userInfo.PhotoData);
      }

    } catch (error) {
      console.error('Error processing biometric data:', error);
      throw new Error('Failed to process biometric data');
    }
  }

  private async processPhotoData(photoData: string[]): Promise<{ processedCount: number; timestamp: string; status: string }> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return {
      processedCount: photoData.length,
      timestamp: new Date().toISOString(),
      status: 'processed'
    };
  }
}

export async function POST(request: NextRequest) {
  const validationService = new ValidationService();
  const biometricProcessor = new BiometricProcessor();
  const deviceAPIService = new DeviceAPIService();

  try {
    const formData = await request.formData();
    const jsonData = formData.get('data');
    
    if (!jsonData || typeof jsonData !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid JSON data' },
        { status: 400 }
      );
    }

    const requestData: RequestData = JSON.parse(jsonData);
    const { ipFacial, UserID, Info } = requestData;

    // Validação
    const validation = validationService.validateUserData(UserID, Info);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }


    // Processamento biométrico
    await biometricProcessor.processBiometricUpdate(UserID, Info);

    // Verificar dispositivo
    const deviceStatus = await deviceAPIService.checkDeviceStatus(ipFacial);
    
    if (!deviceStatus && process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { error: 'Facial recognition device is offline or unreachable' },
        { status: 503 }
      );
    }

    // Chamada para o dispositivo
    const deviceResponse = await deviceAPIService.updateFacialData(ipFacial,UserID, Info);
    
    // Resposta de sucesso
    const response = {
      status: 'success',
      message: 'Facial biometric data updated successfully',
      userID: UserID,
      userName: Info.UserName,
      deviceResponse: deviceResponse.trim(),
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response);

  } catch (error) {
    
    if (process.env.NODE_ENV === 'development') {
      
      return NextResponse.json(
        { 
          error: 'Internal server error',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
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
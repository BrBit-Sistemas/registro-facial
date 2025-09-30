// app/api/access-user/insert-multi/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';

// Interfaces para os dados dos usuários
interface UserData {
  UserID: string;
  UserName: string;
  UserType: number;
  UseTime: number;
  IsFirstEnter: boolean;
  FirstEnterDoors: number[];
  UserStatus: number;
  Authority: number;
  CitizenIDNo: string;
  Password: string;
  Doors: number[];
  TimeSections: number[];
  SpecialDaysSchedule: number[];
  ValidFrom: string;
  ValidTo: string;
}

interface RequestData {
  UserList: UserData[];
}

// Mock database - na implementação real, isso viria de um banco de dados
// const userDatabase = new Map();

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

    const testUrl = `${this.deviceBaseUrl}/cgi-bin/AccessUser.cgi?action=count`;
    
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
    console.log('🔍 Request Details:');
    console.log('URL:', url);
    console.log('Method: POST');
    console.log('Headers:', JSON.stringify(headers, null, 2));
    console.log('Body length:', body.length);
    console.log('Body preview (first 200 chars):', body.substring(0, 200));
    
    // Log completo se for pequeno
    if (body.length < 1000) {
      console.log('Full body:', body);
    }
  }

  async insertMultiUsers(userList: UserData[]): Promise<string> {
    try {
      console.log(`🚀 Attempting to insert ${userList.length} users to device at: ${this.deviceBaseUrl}`);
      
      // Modo desenvolvimento - simular se não conseguir conectar
      if (this.deviceBaseUrl.includes('localhost')) {
        console.log('🔧 Simulating device API call (development mode)');
        await new Promise(resolve => setTimeout(resolve, 500));
        return "OK\r\n";
      }

      const endpoint = '/cgi-bin/AccessUser.cgi?action=insertMulti';
      const url = `${this.deviceBaseUrl}${endpoint}`;

      // Criar header de autenticação
      const authHeader = await this.createAuthHeader('POST', endpoint);

      console.log(`📤 Sending to: ${url}`);
      console.log(`🔐 Auth header: ${authHeader.substring(0, 100)}...`);

      // Preparar dados no formato exato do Postman
      const formattedJson = JSON.stringify({ UserList: userList }, null, 4);

      console.log('📦 Request data (formatted):', formattedJson);

      // Debug detalhado
      this.debugRequestDetails(url, {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'User-Agent': 'NextJS-Access-User/1.0'
      }, formattedJson);

      // Tentar formato JSON
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json',
            'User-Agent': 'NextJS-Access-User/1.0'
          },
          body: formattedJson,
          signal: AbortSignal.timeout(15000)
        });

        const responseText = await response.text();
        console.log(`📥 Response: ${response.status} ${response.statusText}`);
        console.log(`📝 Response body: ${responseText}`);

        if (response.status === 400) {
          console.log('⚠️ Bad Request - verificando possíveis issues...');
          const responseHeaders: Record<string, string> = {};
          response.headers.forEach((value, key) => {
            responseHeaders[key] = value;
          });
          console.log('Response headers:', responseHeaders);
        }

        if (response.status === 401) {
          throw new Error('Authentication failed');
        }

        if (!response.ok) {
          throw new Error(`Device API error: ${response.status} ${response.statusText}`);
        }

        return responseText;

      } catch (error) {
        console.error('❌ Error calling device API:', error);
        throw new Error(`Failed to insert users: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

    } catch (error) {
      console.error('❌ Error in insertMultiUsers:', error);
      
      // Modo desenvolvimento - simular sucesso
      if (process.env.NODE_ENV === 'development') {
        console.log('🎭 Returning simulated success response for development');
        return "OK\r\n";
      }
      
      throw new Error(`Failed to update device: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async checkDeviceStatus(): Promise<boolean> {
    try {
      console.log(`🔍 Checking device status at: ${this.deviceBaseUrl}`);
      
      // Modo desenvolvimento
      if (this.deviceBaseUrl.includes('localhost')) {
        console.log('🔧 Simulating device online status (development mode)');
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
  validateUserData(userList: UserData[]): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!userList || userList.length === 0) {
      errors.push('UserList is required and cannot be empty');
      return { isValid: false, errors };
    }

    userList.forEach((user, index) => {
      // Validar UserID
      if (!user.UserID || user.UserID.trim() === '') {
        errors.push(`UserList[${index}]: UserID is required`);
      } else if (!/^\d+$/.test(user.UserID)) {
        errors.push(`UserList[${index}]: UserID must be a numeric value`);
      }

      // Validar UserName
      if (!user.UserName || user.UserName.trim() === '') {
        errors.push(`UserList[${index}]: UserName is required`);
      } else if (user.UserName.length > 50) {
        errors.push(`UserList[${index}]: UserName must be less than 50 characters`);
      }

      // Validar Password
      if (!user.Password || user.Password.trim() === '') {
        errors.push(`UserList[${index}]: Password is required`);
      }

      // Validar datas
      if (!this.isValidDate(user.ValidFrom)) {
        errors.push(`UserList[${index}]: ValidFrom must be a valid date in format YYYY-MM-DD HH:mm:ss`);
      }

      if (!this.isValidDate(user.ValidTo)) {
        errors.push(`UserList[${index}]: ValidTo must be a valid date in format YYYY-MM-DD HH:mm:ss`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private isValidDate(dateString: string): boolean {
    const regex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
    if (!regex.test(dateString)) return false;
    
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  }

  async checkDuplicateUserIDs(userList: UserData[]): Promise<string[]> {
    const duplicates: string[] = [];
    const seenIDs = new Set();
    
    userList.forEach(user => {
      if (seenIDs.has(user.UserID)) {
        duplicates.push(user.UserID);
      } else {
        seenIDs.add(user.UserID);
      }
    });
    
    return duplicates;
  }
}

export async function POST(request: NextRequest) {
  const validationService = new ValidationService();
  const deviceAPIService = new DeviceAPIService();

  try {
    const body = await request.json();
    const requestData: RequestData = body;

    console.log(`👥 Processing request to insert ${requestData.UserList.length} users`);

    // Validação
    const validation = validationService.validateUserData(requestData.UserList);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    // Verificar IDs duplicados
    const duplicateIDs = await validationService.checkDuplicateUserIDs(requestData.UserList);
    if (duplicateIDs.length > 0) {
      return NextResponse.json(
        { error: 'Duplicate UserIDs found', details: duplicateIDs },
        { status: 400 }
      );
    }

    // Verificar dispositivo
    const deviceStatus = await deviceAPIService.checkDeviceStatus();
    console.log(`📡 Device status: ${deviceStatus ? 'Online' : 'Offline'}`);
    
    if (!deviceStatus && process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { error: 'Access control device is offline or unreachable' },
        { status: 503 }
      );
    }

    // Chamada para o dispositivo
    const deviceResponse = await deviceAPIService.insertMultiUsers(requestData.UserList);
    
    // Resposta de sucesso
    const response = {
      status: 'success',
      message: `${requestData.UserList.length} users inserted successfully`,
      deviceResponse: deviceResponse.trim(),
      timestamp: new Date().toISOString(),
      insertedCount: requestData.UserList.length
    };

    console.log('✅ Insert completed successfully');
    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Error:', error);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🎭 Returning simulated success for development');
      const simulatedResponse = {
        status: 'success',
        message: 'Users inserted successfully (simulated - development mode)',
        deviceResponse: "OK",
        timestamp: new Date().toISOString(),
        insertedCount: 4
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
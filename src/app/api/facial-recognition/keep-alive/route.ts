// app/api/keep-alive/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { writeFile, appendFile, access, constants } from 'fs/promises';

export async function GET(request: NextRequest) {
  try {
    // Configurações de fuso horário e formato de data
    const datetimeFormat = 'yyyy-MM-dd HH:mm:ss';
    const timeZone = 'America/Sao_Paulo';
    
    // Obter data/hora atual no fuso horário de São Paulo
    const now = new Date();
    const dataAtual = new Date(now.toLocaleString('en-US', { timeZone }));
    
    // Formatar data no formato desejado
    const formattedDate = formatDate(dataAtual, datetimeFormat);
    
    // Escrever no arquivo de log
    const logMessage = `Data: ${formattedDate}\n`;
    await appendToFile('keepalive.txt', logMessage);
    
    // Retornar resposta JSON
    return NextResponse.json(
      { code: "200", auth: "true", timestamp: formattedDate },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Erro no endpoint keep-alive:', error);
    
    return NextResponse.json(
      { code: "500", auth: "false", error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Função para formatar data (substitui o formato do PHP)
function formatDate(date: Date, format: string): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return format
    .replace('yyyy', year.toString())
    .replace('MM', month)
    .replace('dd', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}

// Função para adicionar conteúdo a um arquivo (cria se não existir)
async function appendToFile(filename: string, content: string): Promise<void> {
  try {
    // Verificar se o arquivo existe
    await access(filename, constants.F_OK);
  } catch (error) {
    // Se o arquivo não existir, criar com conteúdo vazio
    await writeFile(filename, '');
  }
  
  // Adicionar conteúdo ao arquivo
  await appendFile(filename, content);
}

// Também implementar outros métodos HTTP para completude
export async function POST() {
  return NextResponse.json(
    { code: "405", error: "Method not allowed" },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { code: "405", error: "Method not allowed" },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { code: "405", error: "Method not allowed" },
    { status: 405 }
  );
}
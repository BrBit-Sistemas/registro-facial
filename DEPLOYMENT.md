# 🚀 Guia de Deployment - SAGEP Facial CPMA

## 📋 Pré-requisitos

- Docker instalado
- Node.js 18+ (para desenvolvimento local)
- Variáveis de ambiente configuradas

## 🐳 Deployment com Docker

### 1. Build da Imagem

```bash
# Build da imagem Docker
docker build -t sagep-facial-cpma .

# Ou usando o script npm
npm run docker:build
```

### 2. Executar Container

```bash
# Executar container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL="sua_api_url" \
  -e NEXT_PUBLIC_USER_DB="seu_usuario_db" \
  -e NEXT_PUBLIC_HOST_DB="seu_host_db" \
  -e NEXT_PUBLIC_DATABASE_DB="seu_database" \
  -e NEXT_PUBLIC_PASSWORD_DB="sua_senha_db" \
  -e JWT_SECRET="seu_jwt_secret" \
  sagep-facial-cpma

# Ou usando o script npm
npm run docker:run
```

### 3. Docker Compose (Recomendado)

```bash
# Criar arquivo .env com as variáveis necessárias
cp .env.example .env

# Editar .env com suas configurações
nano .env

# Executar com docker-compose
docker-compose up -d
```

## 🔧 Configuração de Produção

### Variáveis de Ambiente Necessárias

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://sua-api.com

# Database Configuration
NEXT_PUBLIC_USER_DB=seu_usuario
NEXT_PUBLIC_HOST_DB=seu_host
NEXT_PUBLIC_DATABASE_DB=seu_database
NEXT_PUBLIC_PASSWORD_DB=sua_senha

# JWT Configuration
JWT_SECRET=seu_jwt_secret_super_seguro
```

### Health Check

A aplicação inclui um endpoint de health check:

```
GET /api/health
```

Resposta:
```json
{
  "status": "ok",
  "timestamp": "2025-01-30T10:00:00.000Z",
  "uptime": 123.456
}
```

## 🏗️ Build Local para Produção

### 1. Build Standalone

```bash
# Build para produção (gera server.js)
npm run build

# Verificar se server.js foi gerado
ls -la .next/standalone/source/BrBit/registro-facial/
```

### 2. Executar Localmente

```bash
# Executar com server.js (produção)
npm run start:prod

# Ou diretamente
node .next/standalone/source/BrBit/registro-facial/server.js
```

## 🔍 Troubleshooting

### Erro: "Cannot find module '/app/server.js'"

**Causa**: O build não foi executado com `output: 'standalone'`

**Solução**:
1. Verificar se `next.config.ts` tem `output: 'standalone'`
2. Executar `npm run build` (não `npm run build:turbo`)
3. Verificar se `server.js` existe em `.next/standalone/`

### Erro de Conexão com Banco

**Causa**: Variáveis de ambiente não configuradas

**Solução**:
1. Verificar se todas as variáveis `NEXT_PUBLIC_*_DB` estão definidas
2. Testar conexão com o banco
3. Verificar se o banco aceita conexões externas

### Erro de JWT

**Causa**: `JWT_SECRET` não definido ou muito simples

**Solução**:
1. Definir `JWT_SECRET` com pelo menos 32 caracteres
2. Usar um gerador de senha seguro
3. Não usar o mesmo secret em desenvolvimento e produção

## 📊 Monitoramento

### Logs do Container

```bash
# Ver logs em tempo real
docker logs -f sagep-facial-cpma

# Ver logs com timestamp
docker logs -t sagep-facial-cpma
```

### Health Check

```bash
# Verificar saúde da aplicação
curl http://localhost:3000/api/health
```

## 🔄 Atualizações

### Deploy de Nova Versão

```bash
# 1. Parar container atual
docker stop sagep-facial-cpma

# 2. Remover container antigo
docker rm sagep-facial-cpma

# 3. Build nova imagem
docker build -t sagep-facial-cpma .

# 4. Executar nova versão
docker run -d -p 3000:3000 --name sagep-facial-cpma sagep-facial-cpma
```

### Com Docker Compose

```bash
# Atualizar e reiniciar
docker-compose down
docker-compose up -d --build
```

## 🛡️ Segurança

### Recomendações

1. **Nunca** commitar arquivos `.env`
2. Usar secrets management em produção
3. Configurar firewall para limitar acesso
4. Usar HTTPS em produção
5. Rotacionar JWT secrets periodicamente

### Variáveis Sensíveis

- `JWT_SECRET`: Deve ser único e complexo
- `NEXT_PUBLIC_PASSWORD_DB`: Senha do banco de dados
- Todas as variáveis `NEXT_PUBLIC_*`: São expostas no cliente

## 📝 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Desenvolvimento com Turbopack
npm run build:turbo      # Build com Turbopack

# Produção
npm run build            # Build standalone para produção
npm run start            # Start com Next.js
npm run start:prod       # Start com server.js

# Docker
npm run docker:build     # Build da imagem Docker
npm run docker:run       # Executar container
```

## 🆘 Suporte

Em caso de problemas:

1. Verificar logs do container
2. Testar health check
3. Verificar variáveis de ambiente
4. Consultar este guia
5. Verificar issues no repositório

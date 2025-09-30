# 🚀 Guia de Deployment no Railway

Este guia explica como fazer o deployment da aplicação SAGEP - Registro Facial no Railway.

## 📋 Pré-requisitos

- Conta no Railway
- Repositório Git configurado
- Variáveis de ambiente configuradas

## 🔧 Configuração para Railway

### 1. **Arquivos Específicos para Railway**

#### **`next.config.ts`** (já configurado)
```typescript
const nextConfig: NextConfig = {
  output: 'standalone',  // ← Essencial para Railway
  serverExternalPackages: ['pg'],
  outputFileTracingRoot: __dirname
};
```

#### **`Dockerfile.railway`** (criado)
- Multi-stage build otimizado
- Usa `output: 'standalone'`
- Executa `node server.js`

#### **`railway.json`** (criado)
- Configuração específica do Railway
- Health check configurado
- Restart policy definida

### 2. **Variáveis de Ambiente no Railway**

Configure as seguintes variáveis no Railway:

```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://sua-api.com
NEXT_PUBLIC_USER_DB=seu_usuario_db
NEXT_PUBLIC_HOST_DB=seu_host_db
NEXT_PUBLIC_DATABASE_DB=seu_database
NEXT_PUBLIC_PASSWORD_DB=sua_senha_db
JWT_SECRET=seu_jwt_secret_super_seguro
```

## 🚀 Processo de Deployment

### **Opção 1: Deploy Automático via Git**

1. **Conecte o repositório ao Railway**
2. **Configure as variáveis de ambiente**
3. **O Railway detectará automaticamente:**
   - `railway.json` para configuração
   - `Dockerfile.railway` para build
   - `next.config.ts` com `output: 'standalone'`

### **Opção 2: Deploy Manual**

1. **Build local:**
   ```bash
   docker build -f Dockerfile.railway -t sagep-facial-cpma .
   ```

2. **Push para registry:**
   ```bash
   docker tag sagep-facial-cpma railway/sagep-facial-cpma
   docker push railway/sagep-facial-cpma
   ```

## 🔍 Verificação do Deployment

### **Health Check**
- **URL**: `https://seu-app.railway.app/api/health`
- **Resposta esperada**:
  ```json
  {
    "status": "ok",
    "timestamp": "2025-09-30T16:16:00.799Z",
    "uptime": 17.454036341
  }
  ```

### **Logs do Railway**
```bash
railway logs
```

## 🛠️ Troubleshooting

### **Erro: "Cannot find module '/app/server.js'"**

**Causa**: Build sem `output: 'standalone'` ou Dockerfile incorreto

**Solução**:
1. Verificar se `next.config.ts` tem `output: 'standalone'`
2. Usar `Dockerfile.railway` (não o `Dockerfile` padrão)
3. Fazer rebuild completo no Railway

### **Erro: "Module not found"**

**Causa**: Dependências não instaladas corretamente

**Solução**:
1. Verificar se `package-lock.json` está no repositório
2. Usar `npm ci --legacy-peer-deps` no Dockerfile

### **Erro: "Port not accessible"**

**Causa**: Porta não configurada corretamente

**Solução**:
1. Verificar se `PORT=3000` está nas variáveis de ambiente
2. Railway usa porta dinâmica, não hardcode

## 📊 Monitoramento

### **Métricas Disponíveis**
- CPU Usage
- Memory Usage
- Network I/O
- Response Time

### **Logs**
- Application logs
- Build logs
- Error logs

## 🔄 Atualizações

### **Deploy de Atualizações**
1. Push para branch principal
2. Railway detecta mudanças automaticamente
3. Build e deploy automático

### **Rollback**
1. Acessar Railway Dashboard
2. Selecionar deployment anterior
3. Fazer rollback

## ✅ Checklist de Deployment

- [ ] `next.config.ts` com `output: 'standalone'`
- [ ] `Dockerfile.railway` configurado
- [ ] `railway.json` criado
- [ ] Variáveis de ambiente configuradas
- [ ] Health check funcionando
- [ ] Logs sem erros
- [ ] Aplicação acessível

## 🎯 Comandos Úteis

```bash
# Ver logs em tempo real
railway logs --follow

# Ver status do deployment
railway status

# Conectar ao container
railway shell

# Ver variáveis de ambiente
railway variables
```

---

**Desenvolvido com ❤️ para o SAGEP - Sistema de Gestão de Acesso e Controle de Pessoas**

# 🔧 Troubleshooting Railway - SAGEP Facial

Este guia resolve os problemas específicos encontrados no Railway.

## 🚨 Problemas Identificados e Soluções

### 1. **Erro 500 no Sign-in: "Login failed"**

#### **Problema:**
```
POST https://facial.sagep.com.br/api/auth/sign-in
{error: "Login failed"}
Erro 500
```

#### **Causa:**
- **Autenticação do banco falhou**: `password authentication failed for user "sagepcpmadb"`
- **Variáveis de ambiente incorretas** no Railway

#### **Solução:**

##### **Passo 1: Verificar Variáveis de Ambiente no Railway**
Acesse o Railway Dashboard → Seu Projeto → Variables

**Variáveis obrigatórias:**
```env
NEXT_PUBLIC_USER_DB=sagepcpmadb
NEXT_PUBLIC_HOST_DB=sagepcpmadb.postgresql.dbaas.com.br
NEXT_PUBLIC_DATABASE_DB=sagepcpmadb
NEXT_PUBLIC_PASSWORD_DB=SUA_SENHA_CORRETA_AQUI
JWT_SECRET=seu_jwt_secret_super_seguro
NODE_ENV=production
```

##### **Passo 2: Testar Conexão com Banco**
Use os endpoints de debug criados:

```bash
# Verificar variáveis de ambiente
curl https://facial.sagep.com.br/api/debug

# Testar conexão com banco
curl https://facial.sagep.com.br/api/test-db
```

##### **Passo 3: Verificar Logs do Railway**
```bash
railway logs --follow
```

**Logs esperados:**
```
Database config: {
  user: 'sagepcpmadb',
  host: 'sagepcpmadb.postgresql.dbaas.com.br',
  database: 'sagepcpmadb',
  hasPassword: true
}
Database connected successfully
```

**Se aparecer `hasPassword: false`**, a variável `NEXT_PUBLIC_PASSWORD_DB` não está configurada.

---

### 2. **Logo não encontrada: 404**

#### **Problema:**
```
https://facial.sagep.com.br/_next/image?url=%2Flogo-1920x570.png&w=256&q=75
404 Not Found
```

#### **Causa:**
- **Pasta `public` não copiada** no Docker build
- **Arquivos estáticos não servidos** corretamente

#### **Solução:**

##### **✅ JÁ CORRIGIDO:**
- **Dockerfile.railway atualizado** para copiar pasta `public`
- **Build testado** e funcionando

**Verificação:**
```bash
curl -I https://facial.sagep.com.br/logo-1920x570.png
# Deve retornar: HTTP/1.1 200 OK
```

---

## 🔍 Endpoints de Debug Criados

### **1. `/api/debug` - Verificar Variáveis de Ambiente**
```bash
curl https://facial.sagep.com.br/api/debug
```

**Resposta esperada:**
```json
{
  "status": "debug",
  "environment": {
    "NODE_ENV": "production",
    "hasUserDb": true,
    "hasHostDb": true,
    "hasDatabaseDb": true,
    "hasPasswordDb": true,
    "hasJwtSecret": true,
    "userDb": "sagepcpmadb",
    "hostDb": "sagepcpmadb.postgresql.dbaas.com.br",
    "databaseDb": "sagepcpmadb"
  },
  "timestamp": "2025-09-30T16:41:02.646Z"
}
```

### **2. `/api/test-db` - Testar Conexão com Banco**
```bash
curl https://facial.sagep.com.br/api/test-db
```

**Resposta de sucesso:**
```json
{
  "status": "success",
  "message": "Database connection successful",
  "currentTime": "2025-09-30T16:41:06.161Z",
  "timestamp": "2025-09-30T16:41:06.161Z"
}
```

**Resposta de erro:**
```json
{
  "status": "error",
  "message": "Database connection failed",
  "error": "password authentication failed for user \"sagepcpmadb\"",
  "timestamp": "2025-09-30T16:41:06.161Z"
}
```

### **3. `/api/health` - Health Check**
```bash
curl https://facial.sagep.com.br/api/health
```

---

## 🛠️ Comandos de Troubleshooting

### **Verificar Logs em Tempo Real:**
```bash
railway logs --follow
```

### **Verificar Variáveis de Ambiente:**
```bash
railway variables
```

### **Fazer Deploy Manual:**
```bash
railway up
```

### **Conectar ao Container:**
```bash
railway shell
```

---

## 📋 Checklist de Verificação

### **Antes do Deploy:**
- [ ] `next.config.ts` com `output: 'standalone'`
- [ ] `Dockerfile.railway` configurado
- [ ] `railway.json` criado
- [ ] Variáveis de ambiente definidas

### **Após o Deploy:**
- [ ] `/api/health` retorna 200
- [ ] `/api/debug` mostra todas as variáveis
- [ ] `/api/test-db` conecta com sucesso
- [ ] `/logo-1920x570.png` acessível
- [ ] `/api/auth/sign-in` funciona

### **Se algo falhar:**
- [ ] Verificar logs do Railway
- [ ] Testar endpoints de debug
- [ ] Verificar variáveis de ambiente
- [ ] Fazer redeploy se necessário

---

## 🚀 Próximos Passos

1. **Configurar variáveis de ambiente** corretas no Railway
2. **Fazer redeploy** com as correções
3. **Testar todos os endpoints** de debug
4. **Verificar login** com credenciais corretas
5. **Confirmar logo** acessível

---

**Desenvolvido com ❤️ para o SAGEP - Sistema de Gestão de Acesso e Controle de Pessoas**

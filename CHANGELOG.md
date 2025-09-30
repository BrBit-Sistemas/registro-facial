# 📝 Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [2.0.0] - 2025-09-30

### 🚀 Adicionado
- **APIs de Gerenciamento de Pessoas**
  - `POST /api/pessoa` - Cadastro de novas pessoas
  - `PUT /api/pessoa` - Atualização de pessoas existentes
  - `GET /api/pessoa` - Listagem com filtros por empresa e nome
  - Validação completa de todos os campos obrigatórios
  - Autenticação JWT em todas as rotas
  - Tratamento de erros padronizado

- **Sistema de Deployment**
  - `Dockerfile` otimizado para produção
  - `Dockerfile.railway` específico para Railway
  - `docker-compose.yml` para orquestração
  - `railway.json` para configuração do Railway
  - Scripts de produção no `package.json`

- **Endpoints de Monitoramento**
  - `GET /api/health` - Status da aplicação e uptime
  - `GET /api/debug` - Verificação de variáveis de ambiente
  - `GET /api/test-db` - Teste de conexão com banco de dados

- **Documentação Completa**
  - `DEPLOYMENT.md` - Guia de deployment Docker
  - `RAILWAY_DEPLOYMENT.md` - Guia específico para Railway
  - `RAILWAY_TROUBLESHOOTING.md` - Soluções para problemas
  - `RELEASE_NOTES.md` - Notas da release
  - `CHANGELOG.md` - Este arquivo

### 🔧 Corrigido
- **Crash em Produção**
  - Erro `Cannot find module '/app/server.js'` resolvido
  - Configuração `output: 'standalone'` no Next.js
  - Dockerfile multi-stage otimizado
  - Health check endpoint implementado

- **Loop Infinito de Autenticação**
  - Lógica do `PrivateRoute` corrigida
  - Middleware de autenticação otimizado
  - Parse correto do token JWT
  - Tratamento de erro 401 com redirecionamento
  - Layout com verificação de pathname

- **Campos de Seleção na Edição**
  - Conflito entre `register` e `setValue` resolvido
  - Proteção contra `onValueChange` com string vazia
  - Valores dos selects alinhados com banco de dados
  - Campos `Vara`, `Regime Penal`, `Sexo`, `UF` e `Frequência` funcionando

- **Problemas de Build Docker**
  - Erro `Cannot find module '../lightningcss.linux-arm64-musl.node'` resolvido
  - Downgrade para Tailwind CSS v3.4.0 estável
  - Correção do `globals.css` com diretivas corretas
  - Atualização do `postcss.config.mjs`
  - Adição do `autoprefixer` para compatibilidade

- **Problemas de Logo no Railway**
  - Pasta `public` não copiada no Docker build
  - Dockerfile atualizado para copiar arquivos estáticos
  - Logo acessível em `https://facial.sagep.com.br/logo-1920x570.png`

### 🛠️ Melhorado
- **TypeScript e Linting**
  - 100% dos tipos `any` substituídos por tipos específicos
  - Interfaces criadas para `ApiPersonItem`, `Person`, etc.
  - Tipos `Record<string, string>` para parâmetros de autenticação
  - 0 warnings de ESLint em todo o projeto
  - 0 erros de TypeScript em build de produção

- **React e Hooks**
  - Dependências de `useEffect` corrigidas em todos os componentes
  - `useCallback` implementado para otimização
  - `useMemo` para evitar recriações desnecessárias
  - Suspense boundary para `useSearchParams`
  - Loading states melhorados

- **UI e Componentes**
  - Elementos `<img>` substituídos por `<Image>` do Next.js
  - Imports não utilizados removidos
  - Componentes otimizados com props corretas
  - Formulários com validação mantida e melhorada

- **Banco de Dados**
  - Estrutura da tabela `pessoas` corrigida
  - Campos de tamanho adequado (`sexo`, `uf`, `tipo_frequencia`)
  - Dados de teste inseridos (5 pessoas de exemplo)
  - Scripts de setup criados e testados

### 🗑️ Removido
- **Arquivos Desnecessários**
  - Pasta `src/components/ui - Copia/` (arquivos duplicados)
  - Componentes duplicados eliminados
  - Imports não utilizados removidos
  - Variáveis mock não utilizadas

- **Código Legacy**
  - Operadores ternários convertidos para estruturas `if`
  - Código de autenticação refatorado
  - Configuração Tailwind convertida para ES modules

### 🔒 Segurança
- **Autenticação JWT**
  - Middleware de autenticação em todas as rotas API
  - Validação de token aprimorada
  - Tratamento seguro de erros de autenticação
  - Headers de autorização simplificados

### 📊 Performance
- **Otimizações**
  - Componentes otimizados com `useCallback` e `useMemo`
  - Imagens otimizadas com Next.js Image
  - Requisições API com tratamento de erro robusto
  - Build otimizado com `output: 'standalone'`

### 🧪 Testes
- **Validação Completa**
  - Build local testado (0 erros)
  - Build Docker testado (0 erros)
  - Container testado e funcionando
  - Health check endpoint funcionando
  - Railway build testado
  - Todas as funcionalidades testadas

---

## [1.0.0] - 2025-09-XX

### 🚀 Adicionado
- Sistema inicial de registro facial
- Autenticação básica
- Interface de cadastro de pessoas
- Integração com banco PostgreSQL
- Sistema de reconhecimento facial

### 🔧 Corrigido
- Problemas iniciais de build
- Configuração do banco de dados
- Interface de usuário básica

### 🛠️ Melhorado
- Estrutura inicial do projeto
- Configuração do Next.js
- Estilização com Tailwind CSS

---

## 📋 Formato das Entradas

### 🚀 Adicionado
Para novas funcionalidades.

### 🔧 Corrigido
Para correções de bugs.

### 🛠️ Melhorado
Para mudanças em funcionalidades existentes.

### 🗑️ Removido
Para funcionalidades removidas.

### 🔒 Segurança
Para correções de segurança.

### 📊 Performance
Para melhorias de performance.

### 🧪 Testes
Para mudanças relacionadas a testes.

---

**Desenvolvido com ❤️ para o SAGEP - Sistema de Gestão de Acesso e Controle de Pessoas**

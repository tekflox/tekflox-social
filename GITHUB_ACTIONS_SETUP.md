# GitHub Actions - Configuração de Deploy Automático

## 📋 Visão Geral

O projeto está configurado com **GitHub Actions** para fazer deploy automático em **2 ambientes** sempre que houver push na branch `main`:

1. **Vercel** - Backend (Express.js) + Frontend (React)
2. **GitHub Pages** - Frontend estático (React)

---

## 🔄 Workflows Configurados

### 1. Deploy to Production (`.github/workflows/deploy.yml`)

**Trigger:** Push na branch `main` ou execução manual

**Jobs:**

1. **Build and Test**
   - Instala dependências
   - Executa testes (não bloqueia se falhar)
   - Faz build do frontend
   - Upload dos artefatos

2. **Deploy to Vercel**
   - Deploy do backend + frontend
   - URL: https://tekflox-social.vercel.app
   - API: https://tekflox-social.vercel.app/api

3. **Deploy to GitHub Pages**
   - Deploy do frontend estático
   - URL: https://tekflox.github.io/tekflox-social

4. **Notify Deployment Success**
   - Resumo do deploy
   - Links de produção

**Tempo estimado:** 3-5 minutos

---

### 2. CI - Continuous Integration (`.github/workflows/ci.yml`)

**Trigger:** Pull requests ou push em `develop`

**Jobs:**

- Testes em múltiplas versões do Node.js (18, 20)
- Build do frontend
- Upload de coverage report

**Tempo estimado:** 2-3 minutos

---

## 🔑 Secrets Necessários

Para que os workflows funcionem, você precisa configurar os seguintes **secrets** no GitHub:

### Como Adicionar Secrets

1. Vá para o repositório no GitHub
2. **Settings** → **Secrets and variables** → **Actions**
3. Clique em **New repository secret**
4. Adicione cada secret abaixo

---

### Secrets para Vercel

#### 1. `VERCEL_TOKEN`

**O que é:** Token de autenticação da sua conta Vercel.

**Como obter:**
1. Acesse https://vercel.com/account/tokens
2. Clique em **Create Token**
3. Nome: `GitHub Actions - TekFlox Social`
4. Scope: `Full Access` (ou apenas o projeto específico)
5. Copie o token (começa com `vercel_...`)

**Adicionar no GitHub:**
- Name: `VERCEL_TOKEN`
- Secret: `vercel_abc123...` (o token copiado)

---

#### 2. `VERCEL_ORG_ID`

**O que é:** ID da sua organização/conta Vercel.

**Como obter:**

**Método 1 - Via CLI:**
```bash
# Instalar Vercel CLI (se não tiver)
npm i -g vercel

# Fazer login
vercel login

# Linkar projeto (na raiz do repo)
vercel link

# Ver configuração (.vercel/project.json)
cat .vercel/project.json
```

O arquivo `.vercel/project.json` terá:
```json
{
  "orgId": "team_abc123...",
  "projectId": "prj_xyz456..."
}
```

**Método 2 - Via Dashboard:**
1. Acesse https://vercel.com/dashboard
2. Clique no seu projeto **tekflox-social**
3. **Settings** → **General**
4. Procure por **Organization ID** ou **Team ID**
5. Copie o ID (começa com `team_...`)

**Adicionar no GitHub:**
- Name: `VERCEL_ORG_ID`
- Secret: `team_abc123...`

---

#### 3. `VERCEL_PROJECT_ID`

**O que é:** ID do projeto específico no Vercel.

**Como obter:**

**Método 1 - Via CLI:**
```bash
# Mesmo comando acima
cat .vercel/project.json
```

Copie o valor de `projectId`.

**Método 2 - Via Dashboard:**
1. Acesse https://vercel.com/dashboard
2. Clique no projeto **tekflox-social**
3. **Settings** → **General**
4. Procure por **Project ID**
5. Copie o ID (começa com `prj_...`)

**Adicionar no GitHub:**
- Name: `VERCEL_PROJECT_ID`
- Secret: `prj_xyz456...`

---

### Secrets para GitHub Pages

**Não precisa configurar secrets!** GitHub Pages usa o token automático `GITHUB_TOKEN` que é fornecido automaticamente pelo GitHub Actions.

---

## 📝 Checklist de Configuração

### Passo 1: Configurar Secrets

- [ ] `VERCEL_TOKEN` - Token da conta Vercel
- [ ] `VERCEL_ORG_ID` - ID da organização/conta
- [ ] `VERCEL_PROJECT_ID` - ID do projeto

### Passo 2: Habilitar GitHub Pages

1. **Settings** → **Pages**
2. **Source:** GitHub Actions (não "Deploy from a branch")
3. Salvar

### Passo 3: Verificar Permissões

1. **Settings** → **Actions** → **General**
2. **Workflow permissions:**
   - Selecione **Read and write permissions**
   - Marque **Allow GitHub Actions to create and approve pull requests**
3. Salvar

### Passo 4: Verificar Vercel

1. Acesse https://vercel.com/dashboard
2. Veja se projeto **tekflox-social** existe
3. Se não existir, faça deploy manual primeiro:
   ```bash
   npm i -g vercel
   vercel --prod
   ```

### Passo 5: Teste o Workflow

**Opção A - Via Commit:**
```bash
git add .
git commit -m "Configure GitHub Actions workflows"
git push origin main
```

**Opção B - Via Interface (Manual):**
1. Vá para **Actions** tab no GitHub
2. Selecione **Deploy to Production**
3. Clique em **Run workflow**
4. Selecione branch `main`
5. Clique em **Run workflow**

---

## 🚀 Como Funciona

### Fluxo Completo de Deploy

```
Developer                GitHub                    Vercel              GitHub Pages
    |                       |                         |                      |
    |--- git push main ---->|                         |                      |
    |                       |                         |                      |
    |                       |--- Trigger workflow --->|                      |
    |                       |                         |                      |
    |                       |--- 1. Build & Test -----|                      |
    |                       |    npm ci               |                      |
    |                       |    npm test             |                      |
    |                       |    npm run build        |                      |
    |                       |                         |                      |
    |                       |--- 2. Deploy Vercel --->|                      |
    |                       |    vercel deploy --prod |                      |
    |                       |                         |--- Deploy done ---   |
    |                       |                         |<-- 200 OK --------   |
    |                       |                         |                      |
    |                       |--- 3. Deploy GH Pages ----------------->|      |
    |                       |    upload dist/                         |      |
    |                       |    deploy-pages                         |      |
    |                       |                                         |      |
    |<--- ✅ Deploy OK -----|                                         |      |
    |   Email notification  |                                         |      |
    |                       |                                         |      |
```

### Tempo de Deploy

| Etapa | Tempo |
|-------|-------|
| Checkout + Setup | ~30s |
| Install dependencies | ~1min |
| Tests | ~30s |
| Build | ~45s |
| Deploy Vercel | ~1min |
| Deploy GitHub Pages | ~30s |
| **Total** | **~4-5min** |

---

## 📊 Monitoramento

### Ver Status do Deploy

1. Vá para **Actions** tab no GitHub
2. Veja a lista de workflows executados
3. Clique em um workflow para ver detalhes
4. Veja logs de cada job

### Status Badges

Adicione ao `README.md`:

```markdown
[![Deploy to Production](https://github.com/tekflox/tekflox-social/actions/workflows/deploy.yml/badge.svg)](https://github.com/tekflox/tekflox-social/actions/workflows/deploy.yml)

[![CI](https://github.com/tekflox/tekflox-social/actions/workflows/ci.yml/badge.svg)](https://github.com/tekflox/tekflox-social/actions/workflows/ci.yml)
```

### URLs de Produção

Após deploy bem-sucedido:

- **Vercel (Backend + Frontend):** https://tekflox-social.vercel.app
- **Vercel API:** https://tekflox-social.vercel.app/api/health
- **GitHub Pages (Frontend):** https://tekflox.github.io/tekflox-social

---

## 🐛 Troubleshooting

### Erro: "Error: Vercel token is not defined"

**Problema:** Secret `VERCEL_TOKEN` não está configurado.

**Solução:**
1. Vá para **Settings** → **Secrets and variables** → **Actions**
2. Adicione `VERCEL_TOKEN` com o token da Vercel

---

### Erro: "Resource not accessible by integration"

**Problema:** GitHub Actions não tem permissões para deploy no Pages.

**Solução:**
1. **Settings** → **Actions** → **General**
2. **Workflow permissions:** Read and write permissions
3. Salvar e tentar novamente

---

### Erro: "Project not found"

**Problema:** `VERCEL_PROJECT_ID` está incorreto ou projeto não existe.

**Solução:**
1. Fazer deploy manual primeiro:
   ```bash
   vercel --prod
   ```
2. Copiar IDs corretos de `.vercel/project.json`
3. Atualizar secrets no GitHub

---

### Erro: "Pages build and deployment failed"

**Problema:** Build do frontend falhou.

**Solução:**
1. Verificar logs do workflow
2. Testar build localmente:
   ```bash
   npm run build
   ```
3. Corrigir erros de build
4. Fazer novo commit

---

### Deploy demorado (>10 minutos)

**Problema:** Cache de dependências não está funcionando.

**Solução:**
1. Verificar se `package-lock.json` está no repositório
2. Não adicionar `node_modules/` ao Git
3. GitHub Actions cache automaticamente com `cache: 'npm'`

---

## 🔒 Segurança

### Secrets Expostos?

❌ **NÃO expor secrets em:**
- Código fonte
- Logs de workflow
- Comentários de commit
- Issues ou PRs

✅ **Secrets são:**
- Criptografados no GitHub
- Nunca visíveis em logs (mostram `***`)
- Apenas acessíveis durante execução do workflow

### Rotacionar Tokens

**Recomendação:** Rotacione tokens a cada 3-6 meses.

**Como rotacionar:**
1. Gerar novo token na Vercel
2. Atualizar secret `VERCEL_TOKEN` no GitHub
3. Deletar token antigo na Vercel

---

## 📚 Recursos Adicionais

### Documentação Oficial

- [GitHub Actions](https://docs.github.com/en/actions)
- [Vercel CLI](https://vercel.com/docs/cli)
- [GitHub Pages](https://docs.github.com/en/pages)

### Actions Usadas

- [`actions/checkout@v4`](https://github.com/actions/checkout)
- [`actions/setup-node@v4`](https://github.com/actions/setup-node)
- [`actions/upload-artifact@v3`](https://github.com/actions/upload-artifact)
- [`amondnet/vercel-action@v25`](https://github.com/amondnet/vercel-action)
- [`actions/deploy-pages@v3`](https://github.com/actions/deploy-pages)

---

## 🎯 Próximos Passos

### Melhorias Futuras

1. **Preview Deployments**
   - Deploy automático de PRs para preview
   - URLs temporárias para testar mudanças

2. **Rollback Automático**
   - Se health check falhar, fazer rollback
   - Notificação via Slack/Discord

3. **Cache Inteligente**
   - Cache de `node_modules` entre builds
   - Reduzir tempo de 4min para 2min

4. **Testes E2E**
   - Playwright/Cypress após deploy
   - Verificar funcionalidades críticas

5. **Notificações**
   - Slack/Discord quando deploy concluir
   - Email em caso de falha

---

## ✅ Resumo

**Após configurar os 3 secrets:**

1. Todo `git push origin main` faz deploy automático
2. Vercel atualizado em ~2 minutos
3. GitHub Pages atualizado em ~3 minutos
4. Notificação de sucesso/erro via email

**Você só precisa:**
```bash
git add .
git commit -m "Nova feature implementada"
git push origin main
```

**GitHub Actions cuida do resto! 🚀**

---

**Última atualização:** 8 de Outubro de 2025  
**Autor:** TekFlox Team  
**Status:** ✅ Configurado

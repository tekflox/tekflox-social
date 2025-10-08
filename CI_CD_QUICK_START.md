# 🚀 CI/CD Configurado - Resumo Rápido

## ✅ O que foi configurado

### 1. Deploy Automático (.github/workflows/deploy.yml)
- ✅ Deploy para **Vercel** (backend + frontend)
- ✅ Deploy para **GitHub Pages** (frontend)
- ✅ Trigger: Todo push na branch `main`
- ✅ Builds automáticos
- ✅ Testes antes do deploy

### 2. CI - Testes (. github/workflows/ci.yml)
- ✅ Roda em Pull Requests
- ✅ Testa em Node.js 18 e 20
- ✅ Build + Testes automáticos

---

## 🔑 Próximo Passo: Configurar Secrets

Para que o deploy automático funcione, você precisa adicionar 3 secrets no GitHub:

### Como Adicionar Secrets
1. Vá para: https://github.com/tekflox/tekflox-social/settings/secrets/actions
2. Clique em **New repository secret**
3. Adicione os 3 secrets abaixo:

### Secrets Necessários

#### 1. VERCEL_TOKEN
```bash
# Como obter:
# 1. Acesse: https://vercel.com/account/tokens
# 2. Clique em "Create Token"
# 3. Nome: "GitHub Actions - TekFlox Social"
# 4. Copie o token (começa com "vercel_...")

# Adicionar no GitHub:
# Name: VERCEL_TOKEN
# Secret: vercel_abc123...
```

#### 2. VERCEL_ORG_ID
```bash
# Como obter via CLI:
npm i -g vercel
vercel login
vercel link
cat .vercel/project.json
# Copie o valor de "orgId" (começa com "team_...")

# Ou via Dashboard:
# 1. https://vercel.com/dashboard
# 2. Clique no projeto "tekflox-social"
# 3. Settings → General → Organization ID

# Adicionar no GitHub:
# Name: VERCEL_ORG_ID
# Secret: team_abc123...
```

#### 3. VERCEL_PROJECT_ID
```bash
# Mesmo arquivo acima:
cat .vercel/project.json
# Copie o valor de "projectId" (começa com "prj_...")

# Ou via Dashboard:
# 1. https://vercel.com/dashboard
# 2. Clique no projeto "tekflox-social"
# 3. Settings → General → Project ID

# Adicionar no GitHub:
# Name: VERCEL_PROJECT_ID
# Secret: prj_xyz456...
```

---

## 🎯 Testar o Deploy Automático

Depois de configurar os secrets:

```bash
# 1. Fazer qualquer mudança
echo "# Test CI/CD" >> README.md

# 2. Commit e push
git add .
git commit -m "test: CI/CD automático"
git push origin main

# 3. Ver o progresso
# Acesse: https://github.com/tekflox/tekflox-social/actions
```

**Tempo esperado:** 4-5 minutos

**Resultado esperado:**
- ✅ Build bem-sucedido
- ✅ Deploy Vercel completo
- ✅ Deploy GitHub Pages completo
- ✅ Email de notificação

---

## 📊 Monitorar Deploys

### Ver Status
- **Actions Tab:** https://github.com/tekflox/tekflox-social/actions
- **Vercel Dashboard:** https://vercel.com/dashboard

### URLs de Produção
- **Vercel:** https://tekflox-social.vercel.app
- **API Health:** https://tekflox-social.vercel.app/api/health
- **GitHub Pages:** https://tekflox.github.io/tekflox-social

---

## 📚 Documentação Completa

Para mais detalhes, veja: **[GITHUB_ACTIONS_SETUP.md](./GITHUB_ACTIONS_SETUP.md)**

---

## ✨ Benefícios

### Antes (Manual)
```bash
# Toda vez que quer fazer deploy:
npm run build
npm run deploy          # GitHub Pages
npm run deploy:vercel   # Vercel
# ~10 minutos de trabalho manual
```

### Agora (Automático)
```bash
# Simplesmente:
git push origin main
# GitHub Actions faz tudo automaticamente! 🎉
```

---

## 🔥 Workflow Completo

```
Developer                    GitHub Actions               Production
    |                              |                          |
    |-- git push main ------------>|                          |
    |                              |                          |
    |                              |-- 1. Build & Test        |
    |                              |   npm ci                 |
    |                              |   npm test               |
    |                              |   npm run build          |
    |                              |                          |
    |                              |-- 2. Deploy Vercel ----->|
    |                              |                          |-- ✅
    |                              |                          |
    |                              |-- 3. Deploy GH Pages --->|
    |                              |                          |-- ✅
    |                              |                          |
    |<-- ✅ Deploy OK (4-5min) ----|                          |
    |                              |                          |
```

---

**🎯 Próximo Passo:** Configure os 3 secrets e faça um push para testar! 🚀

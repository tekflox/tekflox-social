# 🚀 Deploy TekFlox Social

Este guia detalha como fazer deploy da aplicação TekFlox Social usando Vercel.

---

## 📋 Pré-requisitos

1. Conta no [Vercel](https://vercel.com) (gratuita)
2. Repositório no GitHub (já temos!)
3. Node.js instalado localmente

---

## 🎯 Opção 1: Deploy via Dashboard Vercel (Mais Fácil)

### 1. Importar Projeto

1. Acesse [vercel.com](https://vercel.com) e faça login
2. Clique em **"Add New..."** → **"Project"**
3. Selecione **"Import Git Repository"**
4. Escolha o repositório: `tekflox/tekflox-social`
5. Clique em **"Import"**

### 2. Configurar Build

Vercel detecta automaticamente Vite. Confirme:

- **Framework Preset:** Vite
- **Root Directory:** `./` (raiz)
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### 3. Deploy

1. Clique em **"Deploy"**
2. Aguarde ~2 minutos
3. ✅ Sua aplicação estará no ar!

**URL:** `https://tekflox-social.vercel.app` (ou similar)

---

## 🎯 Opção 2: Deploy via CLI Vercel

### 1. Instalar Vercel CLI

```bash
npm install -g vercel
```

### 2. Login

```bash
vercel login
```

### 3. Deploy

```bash
# Deploy de produção
vercel --prod

# Ou deploy de preview
vercel
```

### 4. Seguir Prompts

```
? Set up and deploy "~/workspace/tekflox-social"? [Y/n] Y
? Which scope do you want to deploy to? tekflox
? Link to existing project? [y/N] N
? What's your project's name? tekflox-social
? In which directory is your code located? ./
? Want to override the settings? [y/N] N
```

---

## ⚙️ Configuração Detalhada

### Arquivos Criados

1. **`vercel.json`** - Configuração de build e rotas
   - Frontend: servido estaticamente de `dist/`
   - Backend: `mock-server/server.js` como serverless function

2. **`.env.example`** - Template de variáveis de ambiente

3. **Modificações:**
   - `src/services/api.js` - Detecta ambiente (dev/prod)
   - `mock-server/server.js` - Exporta app para Vercel
   - `package.json` - Adiciona script `vercel-build`

### Como Funciona

**Desenvolvimento (local):**
```
Frontend (5173) → http://localhost:3002/api → Mock Server
```

**Produção (Vercel):**
```
Frontend → /api → Serverless Function (mock-server/server.js)
```

---

## 🔐 Variáveis de Ambiente (Futuro)

Para adicionar secrets no Vercel:

### Via Dashboard:
1. Vá em **Settings** → **Environment Variables**
2. Adicione chave e valor
3. Escolha ambiente (Production/Preview/Development)
4. Salve e redeploy

### Via CLI:
```bash
vercel env add VITE_AI_API_KEY
```

---

## 📊 Monitoramento

### URLs Importantes

- **Produção:** `https://tekflox-social.vercel.app`
- **Dashboard:** [vercel.com/dashboard](https://vercel.com/dashboard)
- **Logs:** Dashboard → Seu projeto → Deployments → View Function Logs

### Verificar Status

```bash
# Health check da API
curl https://tekflox-social.vercel.app/api/health

# Response esperada:
# {"status":"ok","message":"Mock server is running!"}
```

---

## 🔄 Atualizações Automáticas

Após o primeiro deploy, toda vez que você fizer push na branch `main`:

```bash
git add .
git commit -m "feat: nova feature"
git push
```

**Vercel automaticamente:**
1. Detecta o push
2. Roda `npm install`
3. Roda `npm run build`
4. Faz deploy
5. Notifica via email/Slack

**Preview Deployments:**
- Branches e PRs ganham URLs únicas de preview
- Exemplo: `https://tekflox-social-git-feature-xyz.vercel.app`

---

## 🐛 Troubleshooting

### Erro: "Build failed"

**Solução 1:** Verificar logs no dashboard
```
Dashboard → Deployment → View Build Logs
```

**Solução 2:** Build local
```bash
npm run build
```

Se funcionar local, problema é no Vercel.

### Erro: "API calls failing"

**Verificar:**
1. `/api` routes no vercel.json
2. `src/services/api.js` usa path correto
3. Logs da serverless function

```bash
# Testar API diretamente
curl https://tekflox-social.vercel.app/api/conversations
```

### Erro: "Module not found"

**Solução:**
```bash
# Limpar e reinstalar
rm -rf node_modules package-lock.json
npm install
npm run build
```

Commit e push novamente.

### CORS Errors

**Não deve acontecer** (frontend e backend no mesmo domínio).

Se acontecer, verificar `mock-server/server.js`:
```javascript
app.use(cors({
  origin: true, // Permite qualquer origem
  credentials: true
}));
```

---

## 🚀 Otimizações

### 1. Custom Domain

Dashboard → Settings → Domains → Add Domain

```
tekflox-social.com → https://tekflox-social.vercel.app
```

### 2. Analytics

Dashboard → Analytics → Enable

- Page views
- Visitor stats
- Core Web Vitals

### 3. Edge Caching

Headers já configurados no Vite. Para mais controle:

```javascript
// vercel.json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### 4. Serverless Region

```json
// vercel.json
{
  "functions": {
    "mock-server/server.js": {
      "memory": 1024,
      "maxDuration": 10
    }
  },
  "regions": ["gru1"]  // São Paulo
}
```

---

## 📱 Alternativas ao Vercel

### 1. **Netlify**

```bash
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"
  
[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
```

### 2. **Railway**

- Suporta Node.js + frontend
- Gratuito para projetos pequenos
- Deploy via Git

### 3. **Render**

- Similar ao Railway
- Static site + backend service
- Free tier disponível

### 4. **GitHub Pages + Backend Separado**

- Frontend: GitHub Pages (gratuito)
- Backend: Railway/Render/Heroku
- Requer CORS configuration

---

## 📚 Recursos

- [Vercel Docs](https://vercel.com/docs)
- [Vite Deployment](https://vitejs.dev/guide/static-deploy.html)
- [Vercel CLI Reference](https://vercel.com/docs/cli)
- [Serverless Functions](https://vercel.com/docs/concepts/functions/serverless-functions)

---

## ✅ Checklist de Deploy

- [x] `vercel.json` configurado
- [x] `src/services/api.js` detecta ambiente
- [x] `mock-server/server.js` exporta app
- [x] `.env.example` criado
- [x] `.gitignore` atualizado
- [ ] Deploy realizado (Opção 1 ou 2)
- [ ] URL testada e funcionando
- [ ] Health check OK (`/api/health`)
- [ ] Conversas carregando
- [ ] Frontend estático OK
- [ ] Backend API OK

---

**Desenvolvido com 💜 por TekFlox** | Versão 1.0.0

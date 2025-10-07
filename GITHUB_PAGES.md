# GitHub Pages Deploy

Configuração para deploy do frontend no GitHub Pages.

## 📋 Configuração

### Arquivos Modificados:

1. **package.json**
   - Adicionado `homepage`: `https://tekflox.github.io/tekflox-social`
   - Adicionados scripts: `predeploy` e `deploy`

2. **vite.config.js**
   - Adicionado `base: '/tekflox-social/'` para paths corretos

3. **src/services/api.js**
   - API em produção aponta para: `https://tekflox-social.vercel.app/api`
   - Mantém `localhost:3001` em desenvolvimento

## 🚀 Deploy

### 1. Build e Deploy Automático:
```bash
npm run deploy
```

Isso executa:
1. `npm run build` (via predeploy)
2. `gh-pages -d dist` (cria branch gh-pages e faz push)

### 2. Habilitar GitHub Pages:

Após o primeiro deploy, configure no GitHub:

1. Vá em: **Settings** → **Pages**
2. Em **Source**, selecione:
   - Branch: `gh-pages`
   - Folder: `/ (root)`
3. Clique em **Save**

Aguarde ~1 minuto e acesse:
```
https://tekflox.github.io/tekflox-social
```

## 📊 Arquitetura

```
┌─────────────────────────────────────────┐
│  Qualquer Site (iframe embed)           │
│  <iframe src="github.io/...">          │
└─────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────┐
│  GitHub Pages (Frontend)                │
│  https://tekflox.github.io/tekflox-...  │
│  ├── HTML, CSS, JS estáticos            │
│  └── Faz chamadas API para →           │
└─────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────┐
│  Vercel (Backend API)                   │
│  https://tekflox-social.vercel.app/api  │
│  ├── Mock Server (Express serverless)   │
│  └── Todos os 20+ endpoints             │
└─────────────────────────────────────────┘
```

## 🌐 URLs

- **Frontend (GitHub Pages):** https://tekflox.github.io/tekflox-social
- **Backend (Vercel):** https://tekflox-social.vercel.app/api
- **Health Check:** https://tekflox-social.vercel.app/api/health

## 🔧 Uso em Outros Sites

### Opção 1: Iframe (Recomendado)

```html
<!DOCTYPE html>
<html>
<head>
  <title>Meu Site</title>
</head>
<body>
  <h1>TekFlox Social Embed</h1>
  
  <!-- Embed completo via iframe -->
  <iframe 
    src="https://tekflox.github.io/tekflox-social/"
    width="100%"
    height="800px"
    style="border: none; border-radius: 8px;"
    allow="clipboard-write"
  ></iframe>
</body>
</html>
```

### Opção 2: Iframe Responsivo

```html
<style>
  .tekflox-container {
    position: relative;
    width: 100%;
    padding-bottom: 75%; /* 4:3 Aspect Ratio */
    height: 0;
  }
  
  .tekflox-container iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: none;
  }
</style>

<div class="tekflox-container">
  <iframe 
    src="https://tekflox.github.io/tekflox-social/"
    allow="clipboard-write"
  ></iframe>
</div>
```

### Opção 3: Comunicação entre Iframe e Site Host

```javascript
// No site host - enviar mensagem para React app
const iframe = document.querySelector('iframe');
iframe.contentWindow.postMessage({
  type: 'OPEN_CONVERSATION',
  conversationId: 1
}, 'https://tekflox.github.io');

// No site host - receber mensagem do React app
window.addEventListener('message', (event) => {
  if (event.origin === 'https://tekflox.github.io') {
    console.log('Mensagem do TekFlox:', event.data);
  }
});
```

## 🔄 Atualizações

Para atualizar o site após mudanças:

```bash
# 1. Fazer mudanças no código
# 2. Commitar no Git
git add .
git commit -m "feat: nova funcionalidade"

# 3. Deploy no GitHub Pages
npm run deploy

# 4. Push no GitHub (opcional, para manter histórico)
git push origin main
```

**Nota:** O comando `npm run deploy` faz push apenas da branch `gh-pages` (build), não do código fonte.

## ⚙️ Troubleshooting

### Erro: "Failed to publish"
```bash
# Limpar cache do gh-pages
rm -rf node_modules/.cache/gh-pages
npm run deploy
```

### Assets não carregando (404)
- Verifique `base: '/tekflox-social/'` no `vite.config.js`
- Paths devem começar com `/tekflox-social/`

### API calls falhando
- Verifique URL no `api.js`: `https://tekflox-social.vercel.app/api`
- Teste API diretamente: `curl https://tekflox-social.vercel.app/api/health`
- Verifique CORS no backend (Vercel)

### React Router não funciona (página em branco)
**Problema**: Quando deploy para `/tekflox-social/`, o React Router precisa saber o base path.

**Solução**: Adicionar `basename` ao BrowserRouter em `src/main.jsx`:
```jsx
<BrowserRouter basename="/tekflox-social">
  <App />
</BrowserRouter>
```

### Roteamento não funciona (404 em rotas)
Adicione `.nojekyll` na raiz do projeto:
```bash
touch public/.nojekyll
```

Isso desabilita processamento Jekyll do GitHub Pages.

## 📦 Build Local

Para testar o build antes de fazer deploy:

```bash
# 1. Build
npm run build

# 2. Preview local
npm run preview

# 3. Acesse: http://localhost:4173/tekflox-social/
```

## 🚀 Deploy Automático via GitHub Actions

Para deploy automático a cada push:

Crie `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

## 📊 Limites do GitHub Pages

- **Repositório:** 1GB máximo
- **Bandwidth:** ~100GB/mês (soft limit)
- **Build:** 10 builds/hora
- **Apenas estático:** Sem backend (por isso usamos Vercel)

## ✅ Checklist

- [x] gh-pages instalado
- [x] package.json configurado (homepage + scripts)
- [x] vite.config.js com base path
- [x] api.js aponta para Vercel em produção
- [ ] Executar `npm run deploy`
- [ ] Habilitar GitHub Pages no repositório
- [ ] Testar URL: https://tekflox.github.io/tekflox-social
- [ ] Testar em outro site via iframe

---

**Desenvolvido com 💜 por TekFlox** | GitHub Pages + Vercel

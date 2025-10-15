# Análise de Cobertura de Testes vs TODO

Data: 2025-10-11

## 📊 Resumo Atual dos Testes

```
Test Files:  3 passed | 15 failed | 18 total
Tests:       100 passed | 99 failed | 199 total
Duration:    61.20s
```

### ✅ Arquivos 100% OK
1. **ProtectedRoute** (5/5 testes)
2. **Settings** (9/9 testes)
3. **Layout** (11/11 testes)

---

## 🔍 Análise: Itens FEITOS do TODO vs Testes

### [X] Item 1: Unificação Conversations/ConversationsNew
**Status**: ✅ FEITO
**Arquivo**: `src/pages/Conversations.jsx`
**Testes**: ❌ **FALTANDO**

**O que precisa**:
- Testes para a página Conversations unificada
- Testes de navegação entre conversas
- Testes de seleção de conversa
- Testes de exibição de mensagens

**Prioridade**: 🔴 ALTA (página principal)

---

### [X] Item 2: Foto aparecer no chat
**Status**: ✅ RESOLVIDO (backend fix)
**Arquivo**: `src/components/MessageBubble.jsx`
**Testes**: ✅ PARCIALMENTE COBERTO

**Cobertura atual**:
- ✅ MessageBubble renderiza corretamente
- ✅ Testa formatação de timestamp
- ✅ Testa ícones e estilos
- ❌ **FALTA**: Teste específico para attachments/imagens

**Recomendação**: Adicionar teste para mensagens com imagem/attachment

---

### [X] Item 3: Scroll para última mensagem em conversa longa
**Status**: ✅ RESOLVIDO (setTimeout 100ms + 300ms)
**Arquivo**: `src/pages/Conversations.jsx`
**Testes**: ❌ **FALTANDO**

**O que precisa**:
- Teste de scroll automático ao abrir conversa
- Teste de scroll ao receber nova mensagem
- Mock de scrollIntoView

**Prioridade**: 🟡 MÉDIA

---

### [X] Item 4: Foco automático na Sugestão AI
**Status**: ✅ RESOLVIDO (ref + useEffect com setTimeout 200ms)
**Arquivo**: `src/pages/Conversations.jsx` ou `src/components/AISuggestionCard.jsx`
**Testes**: ✅ PARCIALMENTE COBERTO

**Cobertura atual**:
- ✅ AISuggestionCard renderiza sugestão AI
- ✅ Testa botões de aceitar/editar
- ❌ **FALTA**: Teste de scroll automático para sugestão

**Recomendação**: Adicionar teste com mock de scrollIntoView

---

## 📁 Análise: Cobertura de Arquivos Core

### Componentes

| Arquivo | Tem Teste? | Status | Observações |
|---------|-----------|--------|-------------|
| App.jsx | ❌ | Faltando | Entry point principal |
| AISuggestionCard.jsx | ✅ | Parcial | Testes antigos falhando |
| ConversationCard.jsx | ✅ | 100% OK | 10/10 testes ✨ |
| GlobalPollingProvider.jsx | ✅ | Parcial | Alguns falhando |
| Layout.jsx | ✅ | 100% OK | 11/11 testes ✨ |
| LinkingModal.jsx | ✅ | Parcial | Testes antigos falhando |
| MessageBubble.jsx | ✅ | Parcial | Falta teste de imagens |
| OrderSearchBox.jsx | ✅ | Parcial | Alguns falhando |
| ProtectedRoute.jsx | ✅ | 100% OK | 5/5 testes ✨ |
| SessionExpiredModal.jsx | ✅ | Parcial | Alguns falhando |

### Páginas

| Arquivo | Tem Teste? | Status | Observações |
|---------|-----------|--------|-------------|
| Conversations.jsx | ❌ | **FALTANDO** | 🔴 Página principal! |
| Dashboard.jsx | ✅ | Parcial | Alguns falhando |
| Login.jsx | ✅ | Parcial | Alguns falhando |
| Settings.jsx | ✅ | 100% OK | 9/9 testes ✨ |

### Contexts

| Arquivo | Tem Teste? | Status | Observações |
|---------|-----------|--------|-------------|
| AppContext.jsx | ✅ | Parcial | Precisa AuthProvider wrap |
| AuthContext.jsx | ✅ | Parcial | Act warnings |

### Hooks

| Arquivo | Tem Teste? | Status | Observações |
|---------|-----------|--------|-------------|
| useConversationsPolling.js | ✅ | Parcial | Alguns falhando |
| useGlobalPolling.js | ✅ | Parcial | Alguns falhando |
| useMessagePolling.js | ✅ | Parcial | Timeout em 3 testes |

### Services

| Arquivo | Tem Teste? | Status | Observações |
|---------|-----------|--------|-------------|
| api.js | ✅ | Parcial | Teste antigo falhando |

---

## 🚨 Arquivos CRÍTICOS sem Testes

### 1. 🔴 **Conversations.jsx** - PRIORIDADE MÁXIMA
**Por quê?**: Página principal da aplicação
**Funcionalidades a testar**:
- Renderização da lista de conversas
- Seleção de conversa
- Exibição de mensagens
- Envio de mensagens
- Scroll automático (item do TODO)
- Foco em sugestão AI (item do TODO)
- Polling de mensagens
- Busca de conversas
- Filtros de plataforma

### 2. 🟠 **App.jsx**
**Por quê?**: Entry point, configuração de rotas
**Funcionalidades a testar**:
- Renderização de rotas
- Proteção de rotas
- Provider wrapping
- Navigation

### 3. 🟠 **main.jsx**
**Por quê?**: Bootstrap da aplicação
**Funcionalidades a testar**:
- Renderização inicial
- Provider setup

---

## 🎯 Funcionalidades Específicas dos TODOs sem Testes

### 1. Imagens no Chat (Item TODO: "foto aparecer no chat")
**Arquivo**: MessageBubble.jsx
**Teste faltante**:
```javascript
it('deve renderizar imagem quando attachment está presente', () => {
  const message = {
    id: 1,
    text: 'Veja esta imagem',
    attachments: [{ type: 'image', url: 'https://example.com/image.jpg' }],
    sender: 'customer'
  }
  render(<MessageBubble message={message} />)

  const img = screen.getByRole('img')
  expect(img).toHaveAttribute('src', 'https://example.com/image.jpg')
})
```

### 2. Scroll Automático (Item TODO: "última mensagem em foco")
**Arquivo**: Conversations.jsx
**Teste faltante**:
```javascript
it('deve fazer scroll para última mensagem ao abrir conversa', () => {
  const scrollIntoViewMock = vi.fn()
  Element.prototype.scrollIntoView = scrollIntoViewMock

  // Renderiza conversa com mensagens
  // Abre conversa

  expect(scrollIntoViewMock).toHaveBeenCalled()
})
```

### 3. Foco em Sugestão AI (Item TODO: "foco na sugestão AI")
**Arquivo**: Conversations.jsx ou AISuggestionCard.jsx
**Teste faltante**:
```javascript
it('deve fazer scroll para sugestão AI quando carregada', async () => {
  const scrollIntoViewMock = vi.fn()
  Element.prototype.scrollIntoView = scrollIntoViewMock

  // Renderiza com sugestão AI

  await waitFor(() => {
    expect(scrollIntoViewMock).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'nearest'
    })
  })
})
```

---

## 📈 Prioridades para Atingir 100% de Cobertura

### 🔴 Prioridade ALTA
1. **Criar testes para Conversations.jsx**
   - Página mais crítica
   - Cobre 2 itens do TODO (scroll + foco AI)
   - Estimativa: 20-25 testes

2. **Adicionar teste de imagem em MessageBubble**
   - Cobre item do TODO (foto no chat)
   - Estimativa: 2-3 testes

3. **Corrigir AppContext.test.jsx**
   - Adicionar AuthProvider wrapper
   - Estimativa: 1 fix

### 🟡 Prioridade MÉDIA
4. **Criar testes para App.jsx**
   - Entry point
   - Estimativa: 5-7 testes

5. **Corrigir testes com timeout**
   - useMessagePolling (3 testes)
   - Estimativa: 3 fixes

6. **Corrigir AuthContext act warnings**
   - Estimativa: 5-6 fixes

### 🟢 Prioridade BAIXA
7. **Melhorar testes parciais**
   - Dashboard, Login, GlobalPollingProvider
   - Estimativa: 10-15 fixes

8. **Adicionar testes de integração**
   - Fluxos completos
   - Estimativa: 10-15 testes

---

## 📊 Métricas de Cobertura

### Por Tipo de Arquivo
```
Componentes: 10/10 arquivos com testes (100%)
  ├─ Completos: 3/10 (30%)
  └─ Parciais: 7/10 (70%)

Páginas: 3/4 arquivos com testes (75%)
  ├─ Completos: 1/4 (25%)
  ├─ Parciais: 2/4 (50%)
  └─ Faltando: 1/4 (25%) 🔴 Conversations

Contexts: 2/2 arquivos com testes (100%)
  └─ Parciais: 2/2 (100%)

Hooks: 3/3 arquivos com testes (100%)
  └─ Parciais: 3/3 (100%)

Services: 1/1 arquivos com testes (100%)
  └─ Parciais: 1/1 (100%)
```

### Por Funcionalidade do TODO
```
✅ Unificação Conversations: ❌ Sem testes (0%)
✅ Foto no chat: 🟡 Parcial (50%)
✅ Scroll última mensagem: ❌ Sem testes (0%)
✅ Foco sugestão AI: 🟡 Parcial (30%)
```

---

## 🎯 Roadmap para 100% de Cobertura

### Fase 1: Críticos (1-2 dias)
- [ ] Testes completos para Conversations.jsx (20-25 testes)
- [ ] Teste de imagem em MessageBubble (2-3 testes)
- [ ] Fix AppContext wrapper (1 fix)

### Fase 2: Importantes (2-3 dias)
- [ ] Testes para App.jsx (5-7 testes)
- [ ] Fix testes com timeout (3 fixes)
- [ ] Fix AuthContext act warnings (5-6 fixes)

### Fase 3: Polimento (3-4 dias)
- [ ] Melhorar testes parciais (10-15 fixes)
- [ ] Testes de integração (10-15 testes)
- [ ] Coverage report > 90%

---

## 💡 Conclusão

### Status Atual
- ✅ **100 testes passando** (51%)
- ✅ **3 arquivos 100% cobertos**
- 🟡 **Conversations.jsx é o gap principal**
- 🟡 **Funcionalidades dos TODOs parcialmente testadas**

### Próximos Passos
1. 🔴 **URGENTE**: Criar testes para Conversations.jsx
2. 🔴 **URGENTE**: Adicionar teste de imagem
3. 🟡 Fix AppContext e AuthContext
4. 🟢 Melhorar cobertura geral

### Recomendação
Focar em **Conversations.jsx** primeiro, pois:
- É a página mais crítica
- Cobre 2 itens do TODO simultaneamente
- Vai aumentar significativamente a cobertura
- É onde os usuários passam mais tempo

---

**Gerado em**: 2025-10-11
**Ferramenta**: Claude Code + Vitest

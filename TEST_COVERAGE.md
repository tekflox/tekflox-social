# Cobertura de Testes - TekFlox Social

Este documento descreve a cobertura de testes unitários implementada no front-end da aplicação TekFlox Social.

## 📋 Sumário

Foi criada uma suite completa de testes unitários para o front-end React da aplicação, incluindo:
- Componentes React
- Páginas
- Hooks customizados
- Contexts (gerenciamento de estado)
- Services/API

## 🧪 Testes Implementados

### Componentes

#### ✅ MessageBubble.test.jsx (já existia)
Testa o componente de exibição de mensagens individuais no chat.

#### ✅ AISuggestionCard.test.jsx (já existia)
Testa o card de sugestões de IA para respostas.

#### ✅ LinkingModal.test.jsx (já existia)
Testa o modal de vinculação de pedidos/clientes.

#### ✅ ConversationCard.test.jsx (novo)
- Renderização de informações da conversa
- Exibição de resumo AI
- Modos de resposta (sugestão, edição, manual)
- Envio de respostas
- Testes: 10 casos

#### ✅ OrderSearchBox.test.jsx (novo)
- Input de busca
- Debounce de 300ms
- Exibição de resultados
- Formatação de moeda e datas
- Status coloridos
- Seleção de pedidos
- Testes: 14 casos

#### ✅ Layout.test.jsx (novo)
- Sidebar colapsável
- Navegação entre páginas
- Exibição de informações do usuário
- Botão de logout
- Itens de navegação ativos
- Testes: 11 casos

#### ✅ ProtectedRoute.test.jsx (novo)
- Redirecionamento para login quando não autenticado
- Renderização de children quando autenticado
- Validação de token e user
- Testes: 5 casos

#### ✅ GlobalPollingProvider.test.jsx (novo)
- Inicialização de polling
- Disparo de eventos customizados
- Detecção de atualizações
- Controle de intervalo
- Testes: 8 casos

#### ✅ SessionExpiredModal.test.jsx (novo)
- Exibição do modal
- Countdown de 10 segundos
- Redirecionamento automático
- Botão de login imediato
- Reset de countdown
- Testes: 13 casos

### Páginas

#### ✅ Login.test.jsx (novo)
- Renderização do formulário
- Validações de campos
- Login bem-sucedido
- Tratamento de erros
- Lembrança de credenciais
- Loading state
- Redirecionamento automático
- Testes: 16 casos

#### ✅ Dashboard.test.jsx (novo)
- Carregamento de dados
- Exibição de estatísticas
- Cards de métricas
- Estatísticas por plataforma
- Lista de conversas pendentes
- Loading state
- Testes: 10 casos

#### ✅ Settings.test.jsx (novo)
- Renderização de seções
- Toggles de configurações
- Interface de usuário
- Testes: 8 casos

### Hooks Customizados

#### ✅ useMessagePolling.test.js (novo)
- Inicialização de polling
- Long polling com timeout
- Detecção de novas mensagens
- Reconexão automática
- Abortar requisições
- Simulação de status de mensagem (sending → sent → delivered → read)
- Testes: 17 casos

#### ✅ useConversationsPolling.test.js (novo)
- Polling de conversas
- Detecção de mudanças
- Controle de intervalo
- Força de check manual
- Tratamento de erros
- Testes: 12 casos

#### ✅ useGlobalPolling.test.js (novo)
- Polling global unificado
- Persistência no localStorage
- Eventos de sessão expirada
- Funções reset e pollNow
- Tratamento de erros
- Testes: 14 casos

### Contexts

#### ✅ AppContext.test.jsx (já existia)
Testa o gerenciamento de estado global da aplicação.

#### ✅ AuthContext.test.jsx (novo)
- Inicialização do contexto
- Login e logout
- Persistência no localStorage
- Detecção de URL WordPress vs Mock Server
- Tratamento de erros
- Loading states
- Testes: 18 casos

### Services

#### ✅ api.test.js (já existia)
Testa as chamadas à API e interceptors do axios.

## 📊 Estatísticas

### Total de Arquivos de Teste
- **18 arquivos de teste**

### Total de Casos de Teste
- **~200 casos de teste** individuais

### Cobertura por Categoria
- ✅ Componentes: 9/9 (100%)
- ✅ Páginas: 3/4 (75%) - Falta: Conversations (muito complexa)
- ✅ Hooks: 3/3 (100%)
- ✅ Contexts: 2/2 (100%)
- ✅ Services: 1/1 (100%)

## 🚀 Como Executar os Testes

### Executar todos os testes
```bash
npm test
```

### Executar testes em modo watch
```bash
npm run test
```

### Executar com UI interativa
```bash
npm run test:ui
```

### Gerar relatório de cobertura
```bash
npm run test:coverage
```

## 🛠️ Tecnologias Utilizadas

- **Vitest**: Framework de testes rápido e moderno
- **@testing-library/react**: Utilitários para testes de componentes React
- **@testing-library/user-event**: Simulação de interações do usuário
- **@testing-library/jest-dom**: Matchers customizados para DOM

## 📝 Convenções de Testes

### Estrutura dos Testes
```javascript
describe('ComponentName', () => {
  beforeEach(() => {
    // Setup antes de cada teste
  })

  it('deve fazer algo específico', () => {
    // Arrange
    // Act
    // Assert
  })
})
```

### Boas Práticas Aplicadas
1. ✅ Testes isolados e independentes
2. ✅ Uso de mocks para dependências externas
3. ✅ Limpeza de estado entre testes
4. ✅ Testes de loading, erro e sucesso
5. ✅ Uso de fake timers para controle de tempo
6. ✅ Verificação de acessibilidade e UX

## 🔧 Configuração

### vitest.config.js
```javascript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '*.config.js',
        'mock-server/',
        'dist/'
      ]
    }
  }
})
```

### Setup Global (src/test/setup.js)
- Importa matchers do jest-dom
- Configura cleanup automático
- Mocks de window.matchMedia
- Mock de IntersectionObserver

## 🎯 Métricas de Qualidade

### Cobertura de Casos de Uso
- ✅ Fluxo de autenticação completo
- ✅ Gerenciamento de conversas
- ✅ Sistema de polling (real-time)
- ✅ Busca e vinculação de pedidos
- ✅ Sessão expirada e renovação
- ✅ Navegação e rotas protegidas
- ✅ Configurações do usuário

### Edge Cases Testados
- ✅ Erros de rede
- ✅ Timeout de requisições
- ✅ Estados vazios
- ✅ Validações de formulário
- ✅ Persistência de dados
- ✅ Limpeza de recursos

## 📈 Próximos Passos

### Melhorias Recomendadas
1. [ ] Adicionar testes E2E com Playwright (já configurado)
2. [ ] Aumentar cobertura para 100% (adicionar testes da página Conversations)
3. [ ] Adicionar testes de integração
4. [ ] Configurar CI/CD para rodar testes automaticamente
5. [ ] Adicionar testes de performance
6. [ ] Implementar visual regression testing

### Manutenção
- Atualizar testes ao modificar componentes
- Manter cobertura acima de 80%
- Revisar testes quebradiços (flaky tests)
- Documentar casos de teste complexos

## 📚 Recursos

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [React Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Última atualização**: 2025-10-11
**Mantido por**: TekFlox Team

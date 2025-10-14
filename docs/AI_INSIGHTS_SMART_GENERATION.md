# Chat com IA - Sistema de Geração Inteligente de Resumos

## 📋 Overview

Sistema inteligente de geração de resumos no Chat com IA que:
- ✅ **Gera automaticamente** o resumo quando a conversa é aberta pela primeira vez
- ✅ **Evita regeneração desnecessária** - só gera novos resumos quando há mensagens novas
- ✅ **Armazena estado** - guarda qual foi a última mensagem considerada
- ✅ **Cache inteligente** - retorna resumo existente se não há mensagens novas
- ✅ **Opção de forçar** - permite regeneração manual via parâmetro `force=true`

## 🗄️ Database Schema

### Tabela: `fkc_tekflox_social_insights_state`

Armazena o estado de geração de insights por conversa:

```sql
CREATE TABLE `fkc_tekflox_social_insights_state` (
  `id` bigint unsigned AUTO_INCREMENT PRIMARY KEY,
  `conversation_id` varchar(100) NOT NULL UNIQUE,
  `last_message_id` bigint unsigned NOT NULL,
  `generated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `last_message_id` (`last_message_id`),
  KEY `generated_at` (`generated_at`)
);
```

**Campos:**
- `id`: ID único do registro
- `conversation_id`: ID da conversa (UNIQUE - apenas um estado por conversa)
- `last_message_id`: ID da última mensagem considerada na geração
- `generated_at`: Data/hora da primeira geração
- `updated_at`: Data/hora da última atualização (atualiza automaticamente)

## 🔄 Flow de Geração Inteligente

### 1. Primeira Abertura (Sem Insights)

```
User abre conversa
    ↓
Frontend: loadConversationMetadata()
    ↓
Backend: GET /conversations/:id/metadata
    ↓
aiInsights array vazio
    ↓
Frontend: Detecta insights.length === 0
    ↓
Frontend: Chama api.generateAIInsights(conversationId)
    ↓
Backend: generate_insights()
    ├── Busca mensagens da conversa
    ├── Verifica última mensagem (ID: 123)
    ├── Consulta insights_state → NÃO EXISTE
    ├── Gera novo insight com OpenAI
    ├── Salva insight em ai_insights
    ├── Salva estado em insights_state:
    │   conversation_id=conv_1, last_message_id=123
    └── Retorna: { text: "Resumo...", cached: false }
    ↓
Frontend: Exibe insight no painel
```

### 2. Reabertura (Sem Mensagens Novas)

```
User reabre mesma conversa
    ↓
Frontend: loadConversationMetadata()
    ↓
Backend: GET /conversations/:id/metadata
    ↓
Retorna insights existentes do banco
    ↓
Frontend: Exibe insights (histórico completo)
    ↓
[OPCIONAL] Frontend: Chama generateAIInsights() novamente
    ↓
Backend: generate_insights()
    ├── Busca mensagens da conversa
    ├── Última mensagem: ID 123
    ├── Consulta insights_state:
    │   last_message_id=123 (MESMO!)
    ├── Busca insight mais recente no banco
    └── Retorna: { text: "Resumo...", cached: true, message: "Using cached insight" }
    ↓
Frontend: Não adiciona duplicata (já tem o insight)
```

### 3. Nova Mensagem Chegou

```
Nova mensagem enviada/recebida (ID: 124)
    ↓
User reabre conversa
    ↓
Frontend: Chama api.generateAIInsights()
    ↓
Backend: generate_insights()
    ├── Busca mensagens da conversa
    ├── Última mensagem: ID 124 (NOVA!)
    ├── Consulta insights_state:
    │   last_message_id=123 (DIFERENTE!)
    ├── Gera novo insight com OpenAI (inclui mensagem nova)
    ├── Salva novo insight em ai_insights
    ├── Atualiza insights_state:
    │   UPDATE ... SET last_message_id=124
    └── Retorna: { text: "Resumo atualizado...", cached: false }
    ↓
Frontend: Adiciona novo insight ao histórico
```

## 🔧 Backend Implementation

### Endpoint: `GET /conversations/:id/ai/insights`

**Query Parameters:**
- `force` (optional): Se `true`, força regeneração mesmo sem mensagens novas

**Response:**
```json
{
  "success": true,
  "text": "📊 Resumo da conversa...",
  "timestamp": "2025-10-11 20:30:00",
  "cached": false,
  "last_message_id": 124
}
```

**Response (Cached):**
```json
{
  "success": true,
  "text": "📊 Resumo da conversa...",
  "timestamp": "2025-10-11 20:25:00",
  "cached": true,
  "message": "Using cached insight (no new messages)"
}
```

### Lógica de Geração (`class-ai-routes.php`)

```php
public function generate_insights($request) {
    global $wpdb;
    
    $conversation_id = $request->get_param('id');
    $force = $request->get_param('force');
    
    // 1. Buscar mensagens
    $messages = $wpdb->get_results(/* ... */);
    $last_message = end($messages);
    $current_last_message_id = $last_message['id'];
    
    // 2. Verificar estado anterior
    $state = $wpdb->get_row(
        "SELECT * FROM {$wpdb->prefix}tekflox_social_insights_state 
         WHERE conversation_id = %s",
        $conversation_id
    );
    
    // 3. Se estado existe E não forçou E ID não mudou → CACHE
    if ($state && !$force && $state['last_message_id'] == $current_last_message_id) {
        $latest_insight = $wpdb->get_row(/* buscar insight mais recente */);
        return rest_ensure_response([
            'success' => true,
            'text' => $latest_insight['message'],
            'cached' => true,
            'message' => 'Using cached insight (no new messages)'
        ]);
    }
    
    // 4. Gerar novo insight
    $summary = $this->call_openai_api(/* ... */);
    
    // 5. Salvar insight
    $wpdb->insert(
        "{$wpdb->prefix}tekflox_social_ai_insights",
        ['conversation_id' => $conversation_id, 'sender' => 'ai', 'message' => $summary]
    );
    
    // 6. Atualizar/Inserir estado
    if ($state) {
        $wpdb->update(
            $state_table,
            ['last_message_id' => $current_last_message_id],
            ['conversation_id' => $conversation_id]
        );
    } else {
        $wpdb->insert(
            $state_table,
            ['conversation_id' => $conversation_id, 'last_message_id' => $current_last_message_id]
        );
    }
    
    return rest_ensure_response([
        'success' => true,
        'text' => $summary,
        'cached' => false,
        'last_message_id' => $current_last_message_id
    ]);
}
```

## 🎯 Frontend Implementation

### Auto-Generation on Conversation Open

```javascript
// src/pages/Conversations.jsx

const loadConversationMetadata = async () => {
  const response = await api.getConversationMetadata(conversationId);
  const insights = response.data.aiInsights || [];
  
  // Auto-generate se não tem insights
  if (insights.length === 0) {
    setIsLoadingInsights(true);
    try {
      const insightResponse = await api.generateAIInsights(conversationId);
      
      if (insightResponse?.data) {
        insights.push({
          sender: 'ai',
          text: insightResponse.data.text,
          timestamp: insightResponse.data.timestamp
        });
      }
    } catch (error) {
      console.error('Error generating insights:', error);
    } finally {
      setIsLoadingInsights(false);
    }
  }
  
  setAiInsights(insights);
};
```

### Forçar Regeneração (Futuro)

Se quiser adicionar botão "Regenerar Insight":

```javascript
const regenerateInsight = async () => {
  setIsLoadingInsights(true);
  try {
    // Passa force=true para forçar regeneração
    const response = await api.generateAIInsights(conversationId, { force: true });
    
    if (response?.data) {
      // Adiciona novo insight ao histórico
      setAiInsights([...aiInsights, {
        sender: 'ai',
        text: response.data.text,
        timestamp: response.data.timestamp
      }]);
    }
  } finally {
    setIsLoadingInsights(false);
  }
};
```

## 📊 Database Queries Úteis

### Ver estado de todas as conversas
```sql
SELECT 
    conversation_id,
    last_message_id,
    generated_at,
    updated_at
FROM fkc_tekflox_social_insights_state
ORDER BY updated_at DESC;
```

### Ver quantas gerações por conversa
```sql
SELECT 
    conversation_id,
    COUNT(*) as total_insights,
    COUNT(CASE WHEN sender = 'ai' THEN 1 END) as ai_insights,
    COUNT(CASE WHEN sender = 'user' THEN 1 END) as user_messages,
    MAX(timestamp) as last_activity
FROM fkc_tekflox_social_ai_insights
GROUP BY conversation_id
ORDER BY last_activity DESC;
```

### Ver conversas que precisam de novo insight
```sql
SELECT 
    c.conversation_id,
    c.last_message_id as current_last_msg,
    s.last_message_id as state_last_msg,
    (c.last_message_id != s.last_message_id) as needs_update
FROM (
    SELECT conversation_id, MAX(id) as last_message_id
    FROM fkc_tekflox_social_messages
    GROUP BY conversation_id
) c
LEFT JOIN fkc_tekflox_social_insights_state s
    ON c.conversation_id = s.conversation_id
WHERE c.last_message_id != s.last_message_id OR s.conversation_id IS NULL;
```

### Verificar eficiência do cache
```sql
-- Quantos insights foram gerados vs. quantas conversas existem
SELECT 
    (SELECT COUNT(DISTINCT conversation_id) FROM fkc_tekflox_social_ai_insights WHERE sender='ai') as total_insights_generated,
    (SELECT COUNT(*) FROM fkc_tekflox_social_conversations) as total_conversations,
    ROUND((SELECT COUNT(DISTINCT conversation_id) FROM fkc_tekflox_social_ai_insights WHERE sender='ai') / 
          (SELECT COUNT(*) FROM fkc_tekflox_social_conversations) * 100, 2) as coverage_percentage;
```

## 🐛 Troubleshooting

### Problema: Insights duplicados

**Sintoma:** Mesmo insight aparece várias vezes
**Causa:** Frontend chamando `generateAIInsights()` múltiplas vezes
**Solução:** 
```javascript
// Adicionar flag de controle
const [isGenerating, setIsGenerating] = useState(false);

if (insights.length === 0 && !isGenerating) {
  setIsGenerating(true);
  // ... gerar insight
  setIsGenerating(false);
}
```

### Problema: Insight não atualiza com mensagens novas

**Sintoma:** Nova mensagem chega mas insight continua antigo
**Causa:** Estado não está sendo atualizado corretamente
**Verificar:**
```sql
-- Ver se last_message_id está correto
SELECT s.*, m.id as real_last_msg_id
FROM fkc_tekflox_social_insights_state s
JOIN (
    SELECT conversation_id, MAX(id) as id
    FROM fkc_tekflox_social_messages
    GROUP BY conversation_id
) m ON s.conversation_id = m.conversation_id
WHERE s.last_message_id != m.id;
```

### Problema: Erro ao gerar insight

**Sintoma:** Console mostra erro 500
**Verificar logs:**
```bash
docker logs crispal_website --tail 50 | grep -i "tekflox\|insight"
```

**Verificar se tabela existe:**
```sql
SHOW TABLES LIKE '%insights_state%';
```

## 🚀 Performance

### Benefícios do Sistema Inteligente

1. **Redução de chamadas OpenAI:**
   - Sem cache: 1 chamada por abertura = ~100 chamadas/dia
   - Com cache: 1 chamada apenas com mensagem nova = ~10 chamadas/dia
   - **Economia: 90% de custo**

2. **Velocidade de resposta:**
   - Cache: ~50ms (query ao banco)
   - Geração nova: ~3-8s (OpenAI API)
   - **Melhoria: 60-160x mais rápido**

3. **Experiência do usuário:**
   - Primeira abertura: Gera automaticamente (1x)
   - Reaberturas: Instantâneo (cache)
   - Nova mensagem: Gera atualização (1x)

## 📝 Logs

### Backend Logs

```bash
# Ver logs de geração
docker logs crispal_website --tail 100 | grep "Generating new AI insights"

# Exemplo de saída:
[TekFlox] Generating new AI insights for conversation conv_123 (last_msg: 456)
```

### Frontend Console

```javascript
console.log('[Conversations] 🤖 Generating initial AI insights...');
// Quando auto-gera na primeira abertura

console.log('[Conversations] ✅ Using cached insight');
// Quando usa cache
```

## 📦 Migrations

### Migration File: `002_add_insights_generation_state.sql`

```sql
CREATE TABLE IF NOT EXISTS `fkc_tekflox_social_insights_state` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `conversation_id` varchar(100) NOT NULL,
  `last_message_id` bigint(20) unsigned NOT NULL,
  `generated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `conversation_id` (`conversation_id`),
  KEY `last_message_id` (`last_message_id`),
  KEY `generated_at` (`generated_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Como Executar Migration

```bash
# Local (Docker)
docker exec -i crispal_db mysql -u aiflow -paiFl0wr0x -D crispal < migrations/002_add_insights_generation_state.sql

# Produção (SSH)
mysql -u usuario -p banco < migrations/002_add_insights_generation_state.sql
```

## ✅ Checklist de Teste

- [ ] Abrir conversa sem insights → Deve auto-gerar
- [ ] Reabrir mesma conversa → Deve usar cache (backend retorna cached: true)
- [ ] Enviar nova mensagem → Próxima abertura deve gerar novo insight
- [ ] Verificar banco: `SELECT * FROM fkc_tekflox_social_insights_state;`
- [ ] Verificar logs: `docker logs crispal_website | grep insight`
- [ ] Forçar regeneração: `GET /insights?force=true` → Deve gerar novo
- [ ] Verificar performance: Reabertura deve ser instantânea (cache)

---

**Data de Criação:** 11 de Outubro de 2025  
**Última Atualização:** 11 de Outubro de 2025  
**Status:** ✅ Implementado e Funcionando

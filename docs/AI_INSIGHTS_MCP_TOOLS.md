# Chat com IA + MCP Tools - Documentação Técnica

## 📋 Visão Geral

Implementação completa do Chat com IA (com Resumo Automático) com integração OpenAI e suporte a MCP Tools (Model Context Protocol). O sistema permite que a IA analise conversas, gere resumos automáticos, responda perguntas E execute ações através de ferramentas.

---

## 🎯 Funcionalidades Implementadas

### 1. **OpenAI Integration**
- ✅ Chamadas reais à API OpenAI (gpt-4o-mini)
- ✅ Análise inteligente de conversas
- ✅ Chat contextual com histórico
- ✅ Fallback para respostas rule-based quando API indisponível

### 2. **MCP Tools (5 ferramentas disponíveis)**
- ✅ **search_products** - Busca produtos no WooCommerce
- ✅ **get_order_details** - Verifica detalhes de pedidos
- ✅ **check_product_stock** - Consulta disponibilidade em estoque
- ✅ **get_customer_orders** - Lista pedidos de um cliente
- ✅ **create_draft_order** - Cria rascunho de pedido

### 3. **Tool Calling Loop**
- ✅ OpenAI decide quando usar ferramentas
- ✅ Execução automática de tools
- ✅ Múltiplas chamadas em sequência (até 5 iterações)
- ✅ Resposta final interpretando resultados

---

## 🔧 Arquitetura Técnica

### Fluxo de Execução

```
User pergunta sobre produtos
    ↓
Frontend: POST /api/conversations/:id/ai/chat
    ↓
Backend: generate_ai_chat_response()
    ↓
OpenAI API + MCP Tools definidos
    ↓
OpenAI decide: "Preciso usar search_products"
    ↓
Backend: execute_mcp_tool('search_products', {query: 'camiseta'})
    ↓
WooCommerce API: busca produtos
    ↓
Backend: envia resultado de volta para OpenAI
    ↓
OpenAI: interpreta resultado e gera resposta amigável
    ↓
Backend: retorna resposta final
    ↓
Frontend: exibe no chat
```

---

## 📡 Endpoints

### 1. **POST /wp-json/tekflox-social/v1/conversations/:id/ai/chat**

Chat com IA sobre a conversa (com suporte a MCP Tools).

**Request:**
```json
{
  "message": "Busca produtos de camiseta"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Encontrei 3 produtos de camiseta: 
             1. Camiseta Básica - R$ 49,90 (Em estoque)
             2. Camiseta Premium - R$ 79,90 (Em estoque) 
             3. Camiseta Estampada - R$ 59,90 (Disponível)",
  "timestamp": "2025-10-06T15:30:00"
}
```

**Exemplo de Tool Calling Interno:**
```json
// OpenAI retorna:
{
  "tool_calls": [
    {
      "id": "call_abc123",
      "type": "function",
      "function": {
        "name": "search_products",
        "arguments": "{\"query\": \"camiseta\"}"
      }
    }
  ]
}

// Backend executa e envia resultado:
{
  "role": "tool",
  "tool_call_id": "call_abc123",
  "name": "search_products",
  "content": "{\"products\": [{\"id\": 123, \"name\": \"Camiseta Básica\", \"price\": 49.90, \"stock\": \"instock\"}]}"
}

// OpenAI interpreta e responde:
{
  "content": "Encontrei 3 produtos de camiseta: ..."
}
```

### 2. **GET /wp-json/tekflox-social/v1/conversations/:id/ai/insights**

Gera insights inteligentes sobre a conversa usando OpenAI.

**Response:**
```json
{
  "success": true,
  "insight": {
    "id": 1,
    "conversation_id": 123,
    "summary": "Cliente interessado em produtos de camiseta. 
                Demonstrou interesse em preços e disponibilidade. 
                Oportunidade de venda identificada.",
    "topics": ["Produtos", "Preços", "Estoque"],
    "sentiment": "Positivo",
    "opportunities": ["Venda de camisetas", "Cross-sell de acessórios"],
    "next_steps": ["Enviar catálogo completo", "Oferecer desconto para primeira compra"],
    "timestamp_created": "2025-10-06T15:00:00"
  }
}
```

### 3. **GET /wp-json/tekflox-social/v1/conversations/:id/ai/suggestions**

Retorna sugestão de próxima mensagem (já existia, mantido sem alterações).

---

## 🛠️ MCP Tools Detalhado

### Tool 1: search_products

**Descrição:** Busca produtos no WooCommerce por texto.

**Parâmetros:**
- `query` (string, required) - Termo de busca

**Exemplo de uso:**
```javascript
// OpenAI decide chamar:
{
  "name": "search_products",
  "arguments": {
    "query": "camiseta polo"
  }
}

// Resultado:
{
  "products": [
    {
      "id": 123,
      "name": "Camiseta Polo Masculina",
      "price": "89.90",
      "stock": "instock",
      "url": "https://loja.com/produto/camiseta-polo"
    }
  ]
}
```

### Tool 2: get_order_details

**Descrição:** Busca detalhes de um pedido específico.

**Parâmetros:**
- `order_id` (string) - ID do pedido
- `customer_email` (string) - Email do cliente (alternativo)

**Exemplo de uso:**
```javascript
{
  "name": "get_order_details",
  "arguments": {
    "order_id": "456"
  }
}

// Resultado:
{
  "order_id": 456,
  "status": "processing",
  "total": "159.80",
  "date": "05/10/2025",
  "items": [
    {"name": "Camiseta", "quantity": 2, "total": "99.80"},
    {"name": "Frete", "quantity": 1, "total": "60.00"}
  ]
}
```

### Tool 3: check_product_stock

**Descrição:** Verifica disponibilidade em estoque.

**Parâmetros:**
- `product_id` (string) - ID do produto
- `product_name` (string) - Nome do produto (alternativo)

**Exemplo de uso:**
```javascript
{
  "name": "check_product_stock",
  "arguments": {
    "product_id": "123"
  }
}

// Resultado:
{
  "product_id": 123,
  "name": "Camiseta Polo",
  "stock_status": "instock",
  "stock_quantity": 45,
  "available": true
}
```

### Tool 4: get_customer_orders

**Descrição:** Lista todos os pedidos de um cliente.

**Parâmetros:**
- `customer_email` (string) - Email do cliente
- `customer_name` (string) - Nome do cliente (alternativo)

**Exemplo de uso:**
```javascript
{
  "name": "get_customer_orders",
  "arguments": {
    "customer_email": "cliente@email.com"
  }
}

// Resultado:
{
  "orders": [
    {"order_id": 456, "status": "completed", "total": "159.80", "date": "05/10/2025"},
    {"order_id": 123, "status": "processing", "total": "89.90", "date": "01/10/2025"}
  ],
  "total": 2
}
```

### Tool 5: create_draft_order

**Descrição:** Cria um rascunho de pedido.

**Parâmetros:**
- `customer_email` (string, required) - Email do cliente
- `products` (array, required) - Lista de produtos
  - `product_id` (string) - ID do produto
  - `quantity` (number) - Quantidade

**Exemplo de uso:**
```javascript
{
  "name": "create_draft_order",
  "arguments": {
    "customer_email": "cliente@email.com",
    "products": [
      {"product_id": "123", "quantity": 2},
      {"product_id": "456", "quantity": 1}
    ]
  }
}

// Resultado:
{
  "success": true,
  "order_id": 789,
  "total": "159.80",
  "edit_url": "https://loja.com/wp-admin/post.php?post=789&action=edit"
}
```

---

## 💻 Código Backend

### Arquivo Modificado
`/Users/fredericowu/workspace/mcp-wordpress/src/tekflox-social/api/class-ai-routes.php`

### Métodos Principais

#### 1. call_openai_api($messages, $api_key, $tools = null)
```php
/**
 * Chama API OpenAI com suporte opcional a tools
 * 
 * @param array $messages - Array de mensagens (role + content)
 * @param string $api_key - Chave API OpenAI
 * @param array|null $tools - Array de tools (opcional)
 * @return array|null - Resposta da API ou null em erro
 */
```

**Features:**
- Adiciona `tools` ao request se fornecido
- Define `tool_choice: 'auto'` (OpenAI decide quando usar)
- Timeout de 30 segundos
- Max tokens aumentado para 1000 (era 500)
- Error logging detalhado

#### 2. get_mcp_tools()
```php
/**
 * Define as ferramentas MCP disponíveis para OpenAI
 * 
 * @return array - Array de tools no formato OpenAI function calling
 */
```

**Estrutura:**
```php
[
  [
    'type' => 'function',
    'function' => [
      'name' => 'search_products',
      'description' => 'Busca produtos no WooCommerce...',
      'parameters' => [
        'type' => 'object',
        'properties' => [...],
        'required' => [...]
      ]
    ]
  ],
  // ... mais 4 tools
]
```

#### 3. execute_mcp_tool($tool_name, $arguments)
```php
/**
 * Executa uma ferramenta MCP
 * 
 * @param string $tool_name - Nome da ferramenta
 * @param array $arguments - Argumentos da ferramenta
 * @return array - Resultado da execução
 */
```

**Switch case para cada tool:**
- `search_products` → `mcp_search_products()`
- `get_order_details` → `mcp_get_order_details()`
- `check_product_stock` → `mcp_check_product_stock()`
- `get_customer_orders` → `mcp_get_customer_orders()`
- `create_draft_order` → `mcp_create_draft_order()`

#### 4. generate_ai_chat_response($user_message, $conversation_messages)
```php
/**
 * Gera resposta de chat com suporte a MCP Tools
 * Implementa loop de tool calling:
 * 1. Chama OpenAI com tools
 * 2. Se OpenAI retornar tool_calls:
 *    - Executa cada tool
 *    - Adiciona resultados às mensagens
 *    - Chama OpenAI novamente
 * 3. Repete até OpenAI retornar resposta final (max 5 iterações)
 */
```

**Fluxo:**
```php
$max_iterations = 5;
$iteration = 0;

while ($iteration < $max_iterations) {
  $response = $this->call_openai_api($messages, $api_key, $tools);
  
  if (has tool_calls) {
    foreach (tool_calls) {
      $result = $this->execute_mcp_tool($tool_name, $args);
      $messages[] = ['role' => 'tool', 'content' => json_encode($result)];
    }
    continue; // Chama OpenAI novamente
  } else {
    return $response['content']; // Resposta final!
  }
}
```

### Métodos de Implementação de Tools

#### mcp_search_products($args)
```php
$products = wc_get_products([
  's' => $query,
  'limit' => 5,
  'status' => 'publish'
]);

return [
  'products' => [
    ['id', 'name', 'price', 'stock', 'url']
  ]
];
```

#### mcp_get_order_details($args)
```php
$order = wc_get_order($order_id);
return [
  'order_id', 'status', 'total', 'date',
  'items' => [['name', 'quantity', 'total']]
];
```

#### mcp_check_product_stock($args)
```php
$product = wc_get_product($product_id);
return [
  'product_id', 'name', 'stock_status', 
  'stock_quantity', 'available'
];
```

#### mcp_get_customer_orders($args)
```php
$orders = wc_get_orders([
  'customer' => $customer_email,
  'limit' => 10
]);
return ['orders' => [...], 'total' => count];
```

#### mcp_create_draft_order($args)
```php
$order = wc_create_order(['status' => 'draft']);
foreach ($products as $item) {
  $order->add_product(wc_get_product($item['product_id']), $quantity);
}
$order->calculate_totals();
return ['success', 'order_id', 'total', 'edit_url'];
```

---

## 🧪 Como Testar

### 1. Teste Simples (Sem Tools)

**Frontend:**
```javascript
// No chat de AI Insights
"Me dê um resumo desta conversa"
```

**Esperado:**
- OpenAI analisa o contexto
- Retorna resumo inteligente
- NÃO usa ferramentas

### 2. Teste com Search Products

**Frontend:**
```javascript
"Busca produtos de camiseta"
```

**Esperado:**
- OpenAI detecta necessidade de busca
- Chama `search_products` com query="camiseta"
- Recebe lista de produtos
- Interpreta e responde: "Encontrei X produtos..."

**Logs esperados:**
```
TekFlox Social: Assistant requested 1 tool calls
TekFlox Social: Executing tool: search_products with args: {"query":"camiseta"}
TekFlox Social: Tool result: {"products":[...]}
```

### 3. Teste com Order Details

**Frontend:**
```javascript
"Qual o status do pedido 123?"
```

**Esperado:**
- OpenAI detecta necessidade de consulta
- Chama `get_order_details` com order_id="123"
- Recebe detalhes do pedido
- Responde: "O pedido #123 está com status X, total de R$ Y..."

### 4. Teste com Stock Check

**Frontend:**
```javascript
"Tem a camiseta polo em estoque?"
```

**Esperado:**
- OpenAI pode chamar `search_products` primeiro (para achar ID)
- Depois chama `check_product_stock`
- Responde: "Sim, temos 45 unidades em estoque"

### 5. Teste com Múltiplas Ferramentas

**Frontend:**
```javascript
"Quais produtos de camiseta temos e quantos em estoque?"
```

**Esperado:**
- OpenAI pode chamar `search_products` primeiro
- Depois chamar `check_product_stock` para cada produto encontrado
- Compilar resposta final com tudo

### 6. Teste Create Order

**Frontend:**
```javascript
"Cria um pedido para cliente@email.com com 2 camisetas polo (produto 123)"
```

**Esperado:**
- OpenAI chama `create_draft_order`
- Retorna: "Criei um rascunho de pedido #789 com total de R$ 159,80"

---

## 🐛 Debugging

### Verificar Logs

```bash
# Logs do WordPress
tail -f /path/to/wordpress/wp-content/debug.log | grep "TekFlox Social"
```

**Logs esperados:**
```
TekFlox Social: Assistant requested 1 tool calls
TekFlox Social: Executing tool: search_products with args: {"query":"camiseta"}
TekFlox Social: Tool result: {"products":[...]}
```

### Verificar API Key

```php
// Via WP CLI
wp option get tekflox_mcp_openai_api_key

// Via código
$api_key = get_option('tekflox_mcp_openai_api_key');
error_log('API Key exists: ' . (!empty($api_key) ? 'YES' : 'NO'));
```

### Verificar Requisição OpenAI

Adicione log em `call_openai_api()`:
```php
error_log('OpenAI Request: ' . json_encode($request_body));
error_log('OpenAI Response: ' . $body);
```

### Testar Tool Diretamente

```php
// Via WP CLI ou código
$ai_routes = new AI_Routes();
$result = $ai_routes->execute_mcp_tool('search_products', ['query' => 'camiseta']);
error_log('Tool result: ' . json_encode($result));
```

---

## ⚠️ Limitações e Considerações

### 1. Rate Limits
- OpenAI gpt-4o-mini: ~60 requests/min (tier free)
- Considerar implementar cache de respostas

### 2. Custos
- gpt-4o-mini: $0.150/1M input tokens, $0.600/1M output tokens
- Estimativa: ~$0.001 por conversa com tools

### 3. Timeout
- Default: 30 segundos
- Tool calling pode levar 10-20 segundos (múltiplas chamadas)
- Frontend deve mostrar loading

### 4. Max Iterations
- Limite de 5 iterações para prevenir loops infinitos
- Se atingir limite, cai para fallback response

### 5. Error Handling
- Se OpenAI falhar: usa fallback rule-based
- Se tool falhar: retorna `{"error": "..."}`
- OpenAI pode interpretar erro e pedir dados diferentes

### 6. Permissions
- Tools acessam WooCommerce API
- Requer que WooCommerce esteja ativo
- `create_draft_order` requer permissões de admin

---

## 🚀 Próximos Passos

### Features Adicionais

1. **Cache de Respostas**
   - Cachear perguntas comuns
   - Reduzir custos e latência

2. **Mais Tools**
   - `update_order_status` - Atualizar status de pedido
   - `send_tracking_code` - Enviar código de rastreio
   - `apply_discount` - Aplicar cupom de desconto
   - `schedule_callback` - Agendar retorno

3. **Analytics**
   - Rastrear quais tools são mais usados
   - Medir tempo de resposta
   - Monitorar custos OpenAI

4. **User Feedback**
   - Permitir usuário avaliar resposta (👍👎)
   - Usar feedback para melhorar prompts

5. **Streaming Responses**
   - Implementar SSE (Server-Sent Events)
   - Mostrar resposta em tempo real

### Melhorias de UX

1. **Loading States**
   - Mostrar "Buscando produtos..." quando tool executando
   - Indicador de progresso

2. **Tool Call Visualization**
   - Mostrar quais ferramentas foram usadas
   - "🔍 Busquei 3 produtos | ✅ Verifiquei estoque"

3. **Sugestões de Perguntas**
   - "Você pode perguntar:"
   - "Buscar produtos..."
   - "Verificar pedido..."

---

## 📚 Referências

- [OpenAI Function Calling](https://platform.openai.com/docs/guides/function-calling)
- [WooCommerce REST API](https://woocommerce.github.io/woocommerce-rest-api-docs/)
- [Model Context Protocol (MCP)](https://modelcontextprotocol.io/)

---

**Documentação criada em:** 06/10/2025  
**Última atualização:** 06/10/2025  
**Versão:** 1.0.0

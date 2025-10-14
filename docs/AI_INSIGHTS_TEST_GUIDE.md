# 🧪 Guia Rápido de Teste - Chat com IA + MCP Tools

## ✅ Checklist de Testes

### Pré-requisitos
- [ ] WordPress rodando em localhost:8100
- [ ] Frontend rodando em localhost:5173
- [ ] OpenAI API Key configurada: `wp option get tekflox_mcp_openai_api_key`
- [ ] WooCommerce ativo com alguns produtos
- [ ] Pelo menos 1 conversa com mensagens no sistema

---

## 1. Teste Básico - Chat com IA Sem Tools

### Ação
No frontend, abra uma conversa e no painel "Chat com IA", pergunte:
```
"Me dê um resumo desta conversa"
```

### Resultado Esperado
✅ Resposta inteligente analisando o contexto  
✅ NÃO deve usar ferramentas  
✅ Tempo de resposta: 2-5 segundos  

### Logs Esperados
```
TekFlox Social: OpenAI API called
```

---

## 2. Teste Search Products

### Ação
```
"Busca produtos de camiseta"
```

### Resultado Esperado
✅ OpenAI usa tool `search_products`  
✅ Resposta lista produtos encontrados com preços  
✅ Tempo de resposta: 5-10 segundos (2 chamadas OpenAI)  

### Logs Esperados
```
TekFlox Social: Assistant requested 1 tool calls
TekFlox Social: Executing tool: search_products with args: {"query":"camiseta"}
TekFlox Social: Tool result: {"products":[{"id":123,"name":"Camiseta..."}]}
```

### Verificação Manual
```bash
# Via WP CLI
wp post list --post_type=product --s=camiseta --format=table
```

---

## 3. Teste Check Stock

### Ação
```
"Tem a camiseta polo em estoque?"
```

### Resultado Esperado
✅ OpenAI pode chamar `search_products` primeiro (para achar ID)  
✅ Depois chama `check_product_stock`  
✅ Resposta indica quantidade disponível  

### Logs Esperados
```
TekFlox Social: Assistant requested 1 tool calls
TekFlox Social: Executing tool: search_products
TekFlox Social: Assistant requested 1 tool calls
TekFlox Social: Executing tool: check_product_stock
```

---

## 4. Teste Get Order Details

### Ação
```
"Qual o status do pedido 123?"
```

### Resultado Esperado
✅ OpenAI usa tool `get_order_details`  
✅ Resposta mostra status, total, data  
✅ Lista itens do pedido  

### Logs Esperados
```
TekFlox Social: Executing tool: get_order_details with args: {"order_id":"123"}
```

### Verificação Manual
```bash
wp wc order get 123
```

---

## 5. Teste Get Customer Orders

### Ação
```
"Quais são os pedidos de cliente@email.com?"
```

### Resultado Esperado
✅ OpenAI usa tool `get_customer_orders`  
✅ Resposta lista todos os pedidos do cliente  
✅ Mostra status e totais  

### Logs Esperados
```
TekFlox Social: Executing tool: get_customer_orders with args: {"customer_email":"cliente@email.com"}
```

---

## 6. Teste Create Draft Order

### Ação
```
"Cria um pedido rascunho para cliente@email.com com 2 unidades do produto 123"
```

### Resultado Esperado
✅ OpenAI usa tool `create_draft_order`  
✅ Resposta confirma criação com ID do pedido  
✅ Mostra total do pedido  
⚠️ **Atenção:** Isso REALMENTE cria um pedido draft!  

### Logs Esperados
```
TekFlox Social: Executing tool: create_draft_order with args: {"customer_email":"...","products":[...]}
```

### Verificação Manual
```bash
wp wc order list --status=draft --format=table
```

---

## 7. Teste Múltiplas Ferramentas

### Ação
```
"Me mostra produtos de camiseta e verifica se tem em estoque"
```

### Resultado Esperado
✅ OpenAI usa `search_products` primeiro  
✅ Depois pode usar `check_product_stock` para cada produto  
✅ Resposta consolidada com tudo  
✅ Tempo: 10-20 segundos (múltiplas chamadas)  

### Logs Esperados
```
TekFlox Social: Assistant requested 1 tool calls
TekFlox Social: Executing tool: search_products
TekFlox Social: Assistant requested 3 tool calls
TekFlox Social: Executing tool: check_product_stock (3x)
```

---

## 8. Teste Error Handling

### Ação 1: Produto Não Existe
```
"Busca produtos de xyzabcnonexistent"
```

**Esperado:**  
✅ Tool retorna array vazio  
✅ OpenAI responde: "Não encontrei produtos com esse termo"  

### Ação 2: Pedido Não Existe
```
"Status do pedido 999999"
```

**Esperado:**  
✅ Tool retorna `{"error": "Order not found"}`  
✅ OpenAI responde: "Não encontrei esse pedido"  

### Ação 3: API Key Inválida
```bash
# Remover temporariamente
wp option update tekflox_mcp_openai_api_key ""
```

**Esperado:**  
✅ Fallback para resposta rule-based  
✅ Resposta genérica sem inteligência  

**Restaurar:**
```bash
wp option update tekflox_mcp_openai_api_key "sk-..."
```

---

## 9. Teste de Performance

### Ação
Fazer 10 perguntas seguidas rapidamente:
```
"Resumo"
"Busca produtos"
"Status pedido 1"
"Status pedido 2"
...
```

### Resultado Esperado
✅ Todas respondem sem erros  
✅ Tempo médio: 3-8 segundos cada  
⚠️ **Atenção a Rate Limits!**  

### Monitorar Logs
```bash
tail -f /path/to/wordpress/wp-content/debug.log | grep "TekFlox Social"
```

---

## 10. Teste de Insights Generation

### Ação
```bash
# Via API diretamente
curl http://localhost:8100/wp-json/tekflox-social/v1/conversations/123/ai/insights \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Resultado Esperado
✅ OpenAI analisa toda a conversa  
✅ Retorna insights estruturados  
✅ Armazena em wp_options  

### Logs Esperados
```
TekFlox Social: Generating insights for conversation 123
TekFlox Social: OpenAI API called
```

---

## 🐛 Troubleshooting

### Erro: "OpenAI API key not configured"
```bash
# Verificar
wp option get tekflox_mcp_openai_api_key

# Configurar
wp option update tekflox_mcp_openai_api_key "sk-proj-..."
```

### Erro: "WooCommerce functions not found"
```bash
# Verificar WooCommerce
wp plugin list | grep woocommerce

# Ativar
wp plugin activate woocommerce
```

### Erro: "Tool result: {\"error\":...}"
- Verificar se produto/pedido existe
- Verificar permissões WooCommerce
- Ver logs detalhados

### Resposta Muito Lenta (>30s)
- Timeout atingido
- Verificar conexão com OpenAI
- Considerar aumentar timeout em `call_openai_api()`

### Loop Infinito (Max iterations reached)
- OpenAI não conseguiu terminar
- Revisar prompts do sistema
- Verificar se tools estão retornando dados corretos

---

## 📊 Métricas de Sucesso

### Performance
- ✅ Chat sem tools: < 5s
- ✅ Chat com 1 tool: < 10s
- ✅ Chat com múltiplos tools: < 20s

### Qualidade
- ✅ Resposta relevante ao contexto
- ✅ Usa ferramentas quando apropriado
- ✅ Interpreta resultados corretamente
- ✅ Fallback funciona quando API falha

### Reliability
- ✅ 0 crashes
- ✅ Error handling adequado
- ✅ Logs informativos

---

## 🎯 Teste Completo em 5 Minutos

```bash
# 1. Verificar setup
wp option get tekflox_mcp_openai_api_key
wp plugin list | grep woocommerce

# 2. No frontend (localhost:5173)
# Abrir conversa qualquer

# 3. No AI Insights chat, testar:
"resumo" # Teste básico
"busca camiseta" # Tool: search_products
"status pedido 123" # Tool: get_order_details

# 4. Verificar logs
tail -f wp-content/debug.log | grep "TekFlox Social"

# 5. ✅ Se todos passaram, está funcionando!
```

---

**Última atualização:** 06/10/2025

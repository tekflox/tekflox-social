# Legenda
[ ] -> A fazer
[X] -> Feito
[?] -> A ser melhor definido, não iniciar construção agora



# TODO

[X] outra coisa, podemos remover o Conversations já que temos o ConversationsNew? Consegue ver se precisamos dos 2 e se podemos unificar? na verdade poderiamos mudar o código do ConversationsNew pro Conversations, o que acha?

[ ] O backend do dashboard nao foi implementado parece, vejo: api.js:256  GET http://localhost:8100/wp-json/tekflox-social/v1/analytics/dashboard 404 (Not Found).

[ ] Criar uma flag de mensagem lida ou nao, sinalizar na interface se a mensagem da conversa foi lida ou nao

[ ] Verificar se extamos conseguindo extender o token, fazer teste via curl e rever implementacao no código

[X] foto aparecer no chat, atualmente a mensagem fica vazia - ✅ RESOLVIDO: Bug no backend (class-conversation-routes.php) que hardcodeava type='text' e esquecia attachments. Fix deployado e funcionando!

[X] Chat com IA (com Resumo Automático), finalizar, construir a chamada a openai no backend, olhar o mcp-wordpress, já tem a key lá. Passar todo o histórico e  pedir um resumo. Habilitar o cliente a trocar ideia com o histórico. Dar acesso ao MCP do mcp-wordpress ao OpenAI, assim o usuário pode pedir e a OpenAI tomar ações - ✅ RESOLVIDO: Implementado sistema completo de Chat com IA + OpenAI + MCP Tools! Features: (1) Chat inteligente com análise de contexto usando gpt-4o-mini, (2) 5 MCP Tools implementados: search_products, get_order_details, check_product_stock, get_customer_orders, create_draft_order, (3) Tool calling loop automático - OpenAI decide quando usar ferramentas e interpreta resultados, (4) Fallback para respostas rule-based quando API indisponível, (5) Error handling robusto com logs detalhados. Documentação completa em docs/AI_INSIGHTS_MCP_TOOLS.md e guia de testes em docs/AI_INSIGHTS_TEST_GUIDE.md. Pronto para testar!

[ ] Quando clicar na imagem da mensagem, mostra ela num modal maior

[X] Em uma conversa long (Frederico Wu), nao aparece na tela a última mensagem enviada/recebida, nao fica em foco, nao da pra ver a ultima mensagem quando abrimos a conversa - ✅ RESOLVIDO: Adicionado setTimeout de 100ms no scroll quando conversationMessages muda + setTimeout de 300ms quando selectedConversation muda. Agora sempre abre na última mensagem!

[X] Quando aparecer a 'Sugestão AI', colocar o foco nela - ✅ RESOLVIDO: Adicionado ref aiSuggestionRef e useEffect que escuta mudanças em aiSuggestion state. Quando a sugestão carrega (via API getAISuggestion), o useEffect dispara scrollToAISuggestion() com setTimeout de 200ms. Usa scrollIntoView({ behavior: 'smooth', block: 'nearest' }) para scroll suave sem pular mensagens. Testado e funcionando - screenshot confirma sugestão visível após scroll automático!

[ ] Fazer um loading das conversas, assim quando abrirmos a tela inicial de conversas, onde nao temos nenhuma selecionada, quando ainda estamos carregando do servidor pela primeira vez, a tela aparece vazia, . Podemos adicionar um spinning wheel/loader pra informar que estamos carregando as informacoes

[ ] O botao de enviar nao está enviando a mensagem, revisar

[ ] Remover o "Sobre" que aparece numa conversa selecionada na barra da direita

[ ] Criar um SQL pra criar as tabelas todas com um SQL

[X] Settings, fazer o settings page funcional. Criar uma "Instrucoes de Resumo", que vai ser utilizada pra gerar o resumo do Chat com IA. Crie uma tabela de settings no banco se nao houver - ✅ RESOLVIDO: Implementado página Settings completa com 2 seções: (1) "Configurações do Chat com IA" com 4 campos (Modelo de IA, Tom das Respostas, Timeout, Auto-geração de Insights), (2) "Instruções de Resumo AI" com textarea para customizar o prompt do gpt-4o-mini. Todos os settings salvos corretamente na tabela fkc_tekflox_social_settings!

[ ] Atualizar o gerador de resumo do Chat com IA para usar as instruções customizadas do Settings na hora de gerar.

[?]



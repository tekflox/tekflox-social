import { useEffect, useState } from 'react';
import { Save, Sparkles, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { getSettings, updateSettings } from '../services/api';

function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({});
  const [aiInstructions, setAiInstructions] = useState('');
  const [aiChatModel, setAiChatModel] = useState('gpt-4o-mini');
  const [aiChatTone, setAiChatTone] = useState('professional');
  const [aiChatAutoGenerate, setAiChatAutoGenerate] = useState(true);
  const [aiChatTimeout, setAiChatTimeout] = useState(180);
  const [notification, setNotification] = useState(null);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await getSettings();
      console.log('[Settings] Response from API:', data);
      
      // Backend returns: { success: true, settings: { ai_summary_instructions: { value: "...", updated_at: "..." } } }
      setSettings(data.settings || {});
      setAiInstructions(data.settings?.ai_summary_instructions?.value || '');
      setAiChatModel(data.settings?.ai_chat_model?.value || 'gpt-4o-mini');
      setAiChatTone(data.settings?.ai_chat_tone?.value || 'professional');
      setAiChatAutoGenerate(data.settings?.ai_chat_auto_generate?.value === 'true' || data.settings?.ai_chat_auto_generate?.value === true);
      setAiChatTimeout(parseInt(data.settings?.ai_chat_timeout?.value) || 180);
    } catch (error) {
      console.error('Failed to load settings:', error);
      showNotification('error', 'Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Update settings
      await updateSettings({
        ai_summary_instructions: aiInstructions,
        ai_chat_model: aiChatModel,
        ai_chat_tone: aiChatTone,
        ai_chat_auto_generate: aiChatAutoGenerate.toString(),
        ai_chat_timeout: aiChatTimeout.toString(),
      });

      // Show success notification
      showNotification('success', 'Configurações salvas com sucesso!');
      
      // Reload settings to get updated data
      await loadSettings();
    } catch (error) {
      console.error('Failed to save settings:', error);
      showNotification('error', 'Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-xl">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Configurações</h1>
            <p className="text-gray-400 text-sm">Personalize o comportamento do sistema</p>
          </div>
        </motion.div>

        {/* Notification */}
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`p-4 rounded-xl border ${
              notification.type === 'success'
                ? 'bg-green-500/10 border-green-500/20 text-green-400'
                : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}
          >
            {notification.message}
          </motion.div>
        )}

        {/* AI Chat Configuration Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#1e1e2e] border border-gray-800 rounded-xl p-6 space-y-4"
        >
          <div className="flex items-start gap-3">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-white mb-1">
                Configurações do Chat com AI
              </h2>
              <p className="text-gray-400 text-sm">
                Personalize o comportamento do chat inteligente com AI Insights
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* AI Model Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Modelo de IA
              </label>
              <select
                value={aiChatModel}
                onChange={(e) => setAiChatModel(e.target.value)}
                className="w-full px-4 py-2 bg-[#2a2a3a] border border-gray-700 rounded-lg text-gray-200 
                         focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 
                         transition-colors"
              >
                <option value="gpt-4o-mini">GPT-4o Mini (Rápido e Econômico)</option>
                <option value="gpt-4o">GPT-4o (Balanceado)</option>
                <option value="gpt-4">GPT-4 (Máxima Qualidade)</option>
              </select>
              <p className="text-gray-500 text-xs mt-1">
                Modelo usado para gerar insights e respostas
              </p>
            </div>

            {/* Chat Tone */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Tom das Respostas
              </label>
              <select
                value={aiChatTone}
                onChange={(e) => setAiChatTone(e.target.value)}
                className="w-full px-4 py-2 bg-[#2a2a3a] border border-gray-700 rounded-lg text-gray-200 
                         focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 
                         transition-colors"
              >
                <option value="professional">Profissional</option>
                <option value="friendly">Amigável</option>
                <option value="casual">Casual</option>
                <option value="technical">Técnico</option>
              </select>
              <p className="text-gray-500 text-xs mt-1">
                Como a IA deve se comunicar
              </p>
            </div>

            {/* Timeout */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Timeout (segundos)
              </label>
              <input
                type="number"
                min="30"
                max="300"
                step="30"
                value={aiChatTimeout}
                onChange={(e) => setAiChatTimeout(parseInt(e.target.value))}
                className="w-full px-4 py-2 bg-[#2a2a3a] border border-gray-700 rounded-lg text-gray-200 
                         focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 
                         transition-colors"
              />
              <p className="text-gray-500 text-xs mt-1">
                Tempo máximo de espera por resposta (atual: {aiChatTimeout}s)
              </p>
            </div>

            {/* Auto Generate */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Auto-geração de Insights
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setAiChatAutoGenerate(!aiChatAutoGenerate)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    aiChatAutoGenerate ? 'bg-purple-500' : 'bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      aiChatAutoGenerate ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className="text-sm text-gray-300">
                  {aiChatAutoGenerate ? 'Ativado' : 'Desativado'}
                </span>
              </div>
              <p className="text-gray-500 text-xs mt-1">
                Gerar automaticamente insights ao abrir conversa
              </p>
            </div>
          </div>
        </motion.div>

        {/* AI Instructions Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#1e1e2e] border border-gray-800 rounded-xl p-6 space-y-4"
        >
          <div className="flex items-start gap-3">
            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 p-2 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-white mb-1">
                Instruções de Resumo AI
              </h2>
              <p className="text-gray-400 text-sm">
                Configure como a IA deve analisar e resumir as conversas
              </p>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 flex gap-3">
            <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-300">
              <p className="font-medium text-blue-400 mb-1">Dica de Formatação</p>
              <p>
                Você pode usar Markdown para formatar o resumo. Use <code className="bg-gray-800 px-1.5 py-0.5 rounded">**negrito**</code>, 
                <code className="bg-gray-800 px-1.5 py-0.5 rounded mx-1">### títulos</code>, 
                listas, emojis e outros elementos de formatação.
              </p>
            </div>
          </div>

          {/* Textarea */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Prompt para a IA (gpt-4o-mini)
            </label>
            <textarea
              value={aiInstructions}
              onChange={(e) => setAiInstructions(e.target.value)}
              rows={16}
              className="w-full px-4 py-3 bg-[#2a2a3a] border border-gray-700 rounded-lg text-gray-200 
                         focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 
                         transition-colors font-mono text-sm leading-relaxed"
              placeholder="Exemplo:
Analise a conversa e gere um resumo estruturado em português (Brasil) com:

### Análise da Conversa
**Principais Tópicos:** [liste os tópicos principais]
**Sentimento do Cliente:** [positivo/neutro/negativo e justificativa]
..."
            />
            <p className="text-gray-500 text-xs mt-2">
              {aiInstructions.length} caracteres
            </p>
          </div>
        </motion.div>

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex justify-end"
        >
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 
                     text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 
                     disabled:opacity-50 disabled:cursor-not-allowed transition-all
                     shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Salvando...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Salvar Configurações</span>
              </>
            )}
          </button>
        </motion.div>

        {/* Help Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[#1e1e2e] border border-gray-800 rounded-xl p-6"
        >
          <h3 className="text-white font-semibold mb-3">💡 Exemplos de Instruções</h3>
          <div className="space-y-3 text-sm text-gray-400">
            <div>
              <p className="text-gray-300 font-medium">Análise Detalhada:</p>
              <code className="block bg-[#2a2a3a] p-3 rounded mt-1 text-xs">
                Analise profundamente a conversa e identifique: contexto do problema, histórico de interações, 
                expectativas do cliente, pontos de atenção críticos, e recomendações específicas de ação.
              </code>
            </div>
            <div>
              <p className="text-gray-300 font-medium">Resumo Executivo:</p>
              <code className="block bg-[#2a2a3a] p-3 rounded mt-1 text-xs">
                Gere um resumo executivo conciso com: problema principal em uma frase, próximo passo 
                recomendado, e prioridade (alta/média/baixa).
              </code>
            </div>
            <div>
              <p className="text-gray-300 font-medium">Análise de Vendas:</p>
              <code className="block bg-[#2a2a3a] p-3 rounded mt-1 text-xs">
                Foque em oportunidades de vendas: interesse demonstrado, orçamento mencionado, 
                objeções identificadas, e probabilidade de conversão.
              </code>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Settings;

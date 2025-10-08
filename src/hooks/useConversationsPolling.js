import { useEffect, useRef, useState } from 'react';
import * as api from '../services/api';

/**
 * Hook para POLLING de lista de conversas
 * 
 * Verifica periodicamente se há:
 * - Novas conversas
 * - Novas mensagens em conversas existentes
 * - Mudanças de status
 * 
 * @param {function} onUpdate - Callback quando houver atualizações
 * @param {boolean} enabled - Se o polling está ativo (default: true quando autenticado)
 * @param {number} interval - Intervalo entre checks em ms (padrão: 10000 = 10s)
 */
export const useConversationsPolling = (onUpdate, enabled = true, interval = 10000) => {
  const [isPolling, setIsPolling] = useState(false);
  const lastCheckRef = useRef(null);
  const intervalIdRef = useRef(null);
  const conversationsHashRef = useRef(null);

  /**
   * Gera um hash simples das conversas para detectar mudanças
   * Considera: total de conversas, IDs, timestamps, unread counts
   */
  const generateConversationsHash = (conversations) => {
    if (!conversations || conversations.length === 0) return '';
    
    return conversations.map(c => 
      `${c.id}:${c.timestamp}:${c.unread ? '1' : '0'}:${c.lastMessage}`
    ).join('|');
  };

  /**
   * Verifica se houve mudanças comparando com o último estado
   */
  const hasChanges = (newConversations) => {
    const newHash = generateConversationsHash(newConversations);
    const oldHash = conversationsHashRef.current;
    
    if (oldHash === null) {
      // Primeira carga - não notifica
      conversationsHashRef.current = newHash;
      return false;
    }
    
    if (newHash !== oldHash) {
      console.log('[Conversations Polling] Changes detected');
      conversationsHashRef.current = newHash;
      return true;
    }
    
    return false;
  };

  /**
   * Busca conversas e verifica por mudanças
   */
  const checkForUpdates = async () => {
    if (!enabled) return;

    try {
      setIsPolling(true);
      
      // Buscar todas as conversas (sem filtro)
      const conversations = await api.getConversations();
      
      // Verificar se houve mudanças
      if (hasChanges(conversations)) {
        console.log('[Conversations Polling] Notifying updates:', {
          total: conversations.length,
          unread: conversations.filter(c => c.unread).length,
          pending: conversations.filter(c => c.status === 'pending').length
        });
        onUpdate(conversations);
      } else {
        console.log('[Conversations Polling] No changes detected');
      }
      
      lastCheckRef.current = new Date();
      
    } catch (error) {
      console.error('[Conversations Polling] Error:', error);
      // Continue polling mesmo com erro (pode ser temporário)
    } finally {
      setIsPolling(false);
    }
  };

  useEffect(() => {
    // Limpar intervalo anterior
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }

    if (!enabled) {
      console.log('[Conversations Polling] Disabled');
      return;
    }

    console.log(`[Conversations Polling] Started - interval: ${interval}ms (${interval/1000}s)`);

    // Fazer check imediato
    checkForUpdates();

    // Configurar intervalo
    intervalIdRef.current = setInterval(() => {
      checkForUpdates();
    }, interval);

    // Cleanup
    return () => {
      if (intervalIdRef.current) {
        console.log('[Conversations Polling] Stopped');
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    };
  }, [enabled, interval]); // Re-inicia se enabled ou interval mudar

  return {
    isPolling,
    lastCheck: lastCheckRef.current,
    forceCheck: checkForUpdates
  };
};

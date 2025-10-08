import { useEffect, useRef, useState } from 'react';
import * as api from '../services/api';

/**
 * Hook para LONG POLLING de atualizações de mensagens
 * 
 * Mantém a conexão aberta até haver updates ou timeout (default: 15s)
 * Aguarda 3 segundos entre reconexões para evitar sobrecarga
 * 
 * @param {number} conversationId - ID da conversa
 * @param {function} onUpdate - Callback quando houver atualizações
 * @param {number} timeout - Timeout da requisição em ms (padrão: 15000)
 * @param {boolean} enabled - Se o polling está ativo
 */
export const useMessagePolling = (conversationId, onUpdate, timeout = 15000, enabled = true) => {
  const [isPolling, setIsPolling] = useState(false);
  const lastCheckRef = useRef(new Date());
  const abortControllerRef = useRef(null);
  const isPollingRef = useRef(false);
  const reconnectDelay = 3000; // 3 segundos entre requests

  useEffect(() => {
    // Abort any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    if (!enabled || !conversationId) {
      return;
    }

    console.log(`[Long Polling] Started for conversation ${conversationId}, timeout: ${timeout}ms, delay: ${reconnectDelay}ms`);

    const longPoll = async () => {
      // Prevent concurrent polls
      if (isPollingRef.current) {
        console.log('[Long Polling] Skipping - already polling');
        return;
      }

      isPollingRef.current = true;
      setIsPolling(true);
      
      // Create abort controller for this request
      abortControllerRef.current = new AbortController();
      
      try {
        const result = await api.getMessageUpdates(
          conversationId, 
          lastCheckRef.current,
          timeout,
          abortControllerRef.current.signal
        );
        
        if (result.hasUpdates && result.messages.length > 0) {
          console.log(`[Long Polling] Found ${result.messages.length} updates`);
          onUpdate(result.messages);
          lastCheckRef.current = new Date();
        } else if (result.timeout) {
          console.log('[Long Polling] Timeout reached, reconnecting in 3s...');
        }
        
        // Aguarda 3 segundos antes de reconectar (evita sobrecarga)
        if (enabled && conversationId) {
          setTimeout(() => longPoll(), reconnectDelay);
        }
        
      } catch (error) {
        if (error.name === 'AbortError') {
          console.log('[Long Polling] Request aborted (conversation changed)');
        } else {
          console.error('[Long Polling] Error:', error);
          // Retry após 5 segundos em caso de erro
          if (enabled && conversationId) {
            setTimeout(() => longPoll(), 5000);
          }
        }
      } finally {
        isPollingRef.current = false;
        setIsPolling(false);
      }
    };

    // Inicia long polling após pequeno delay
    const initialTimeout = setTimeout(() => {
      longPoll();
    }, 500);

    return () => {
      console.log(`[Long Polling] Cleanup for conversation ${conversationId}`);
      clearTimeout(initialTimeout);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      isPollingRef.current = false;
    };
  }, [conversationId, enabled, timeout]);

  return { isPolling };
};

/**
 * Hook para simular status de mensagem (fallback quando API não responde)
 * 
 * @param {object} message - Mensagem recém enviada
 * @param {function} onStatusChange - Callback para mudança de status
 */
export const useMessageStatusSimulation = (message, onStatusChange) => {
  useEffect(() => {
    if (!message || message.sender !== 'agent') return;

    const timers = [];

    // sending → sent (500ms)
    if (message.status === 'sending') {
      timers.push(setTimeout(() => {
        onStatusChange(message.id, 'sent');
      }, 500));

      // sent → delivered (1500ms)
      timers.push(setTimeout(() => {
        onStatusChange(message.id, 'delivered');
      }, 1500));

      // delivered → read (3-5s random)
      timers.push(setTimeout(() => {
        onStatusChange(message.id, 'read');
      }, Math.random() * 2000 + 3000));
    }

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [message, onStatusChange]);
};

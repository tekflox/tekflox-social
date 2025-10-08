import { useEffect, useRef, useState } from 'react';
import * as api from '../services/api';

/**
 * Hook para polling de atualizações de mensagens
 * 
 * @param {number} conversationId - ID da conversa
 * @param {function} onUpdate - Callback quando houver atualizações
 * @param {number} interval - Intervalo de polling em ms (padrão: 3000)
 * @param {boolean} enabled - Se o polling está ativo
 */
export const useMessagePolling = (conversationId, onUpdate, interval = 3000, enabled = true) => {
  const [isPolling, setIsPolling] = useState(false);
  const lastCheckRef = useRef(new Date());
  const intervalRef = useRef(null);
  const isPollingRef = useRef(false); // Use ref instead of state to prevent re-renders

  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!enabled || !conversationId) {
      return;
    }

    console.log(`[Polling] Started for conversation ${conversationId}, interval: ${interval}ms`);

    const pollForUpdates = async () => {
      // Prevent concurrent polls using ref (doesn't trigger re-render)
      if (isPollingRef.current) {
        console.log('[Polling] Skipping - already polling');
        return;
      }

      isPollingRef.current = true;
      setIsPolling(true);
      
      try {
        const result = await api.getMessageUpdates(conversationId, lastCheckRef.current);
        
        if (result.hasUpdates && result.messages.length > 0) {
          console.log(`[Polling] Found ${result.messages.length} updates`);
          onUpdate(result.messages);
        }
        
        lastCheckRef.current = new Date();
      } catch (error) {
        console.error('[Polling] Error:', error);
      } finally {
        isPollingRef.current = false;
        setIsPolling(false);
      }
    };

    // Initial poll (delayed to avoid immediate call)
    const initialTimeout = setTimeout(() => {
      pollForUpdates();
    }, 1000);

    // Start interval
    intervalRef.current = setInterval(pollForUpdates, interval);

    return () => {
      console.log(`[Polling] Cleanup for conversation ${conversationId}`);
      clearTimeout(initialTimeout);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      isPollingRef.current = false;
    };
  }, [conversationId, enabled, interval]); // Removed onUpdate and isPolling from dependencies

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

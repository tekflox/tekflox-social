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

  useEffect(() => {
    if (!enabled || !conversationId) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const pollForUpdates = async () => {
      if (isPolling) return; // Prevent concurrent polls

      setIsPolling(true);
      try {
        const result = await api.getMessageUpdates(conversationId, lastCheckRef.current);
        
        if (result.hasUpdates && result.messages.length > 0) {
          onUpdate(result.messages);
        }
        
        lastCheckRef.current = new Date();
      } catch (error) {
        console.error('Polling error:', error);
      } finally {
        setIsPolling(false);
      }
    };

    // Initial poll
    pollForUpdates();

    // Start interval
    intervalRef.current = setInterval(pollForUpdates, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [conversationId, enabled, interval, onUpdate, isPolling]);

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

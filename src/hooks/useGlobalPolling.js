import { useState, useEffect, useRef, useCallback } from 'react';
import * as api from '../services/api';

/**
 * Hook de polling global usando /conversations com last_message_id
 * 
 * Quando last_message_id é passado, o backend retorna APENAS conversas com mensagens novas.
 * O frontend merge essas conversas atualizadas na memória.
 * 
 * Primeira carga (sem last_message_id): Retorna todas as conversas
 * Polling subsequente (com last_message_id): Retorna apenas conversas com mensagens novas
 * 
 * Armazena o último message ID no localStorage para persistência
 */
export function useGlobalPolling(isEnabled = true, interval = 5000) {
  const [updates, setUpdates] = useState({
    conversations: [],
    hasUpdates: false
  });
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState(null);
  const [sessionExpired, setSessionExpired] = useState(false);
  
  const pollingTimeoutRef = useRef(null);
  const lastMessageIdRef = useRef(null);
  const pollFunctionRef = useRef(null);

  // Carregar último message ID do localStorage na inicialização
  useEffect(() => {
    const storedId = localStorage.getItem('tekflox_last_message_id');
    
    if (storedId) {
      lastMessageIdRef.current = parseInt(storedId, 10);
    }
  }, []);

  // Listener para parar polling quando sessão expirar
  useEffect(() => {
    const handleSessionExpired = () => {
      console.log('[Global Polling] 🛑 Session expired - stopping polling');
      setSessionExpired(true);
      
      // Limpar polling ativo
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
        pollingTimeoutRef.current = null;
      }
    };

    window.addEventListener('tekflox-session-expired', handleSessionExpired);
    
    return () => {
      window.removeEventListener('tekflox-session-expired', handleSessionExpired);
    };
  }, []);

  // Função de polling (não usar useCallback para evitar dependências que causam re-criação do interval)
  // Armazenar em ref para acesso estável
  pollFunctionRef.current = async () => {
    if (!isEnabled) return;

    setIsPolling(true);
    setError(null);

    try {
      const params = {};
      
      // Se temos last_message_id, passar para buscar apenas conversas com mensagens novas
      if (lastMessageIdRef.current) {
        params.last_message_id = lastMessageIdRef.current;
      }

      // Chamar /conversations com ou sem last_message_id
      const response = await api.getConversations(params);

      // response = { conversations: [...], last_message_id: N }
      const hasNewConversations = response.conversations && response.conversations.length > 0;

      if (hasNewConversations) {
        console.log('[Global Polling] New updates:', {
          conversations: response.conversations.length,
          lastMessageId: response.last_message_id
        });

        setUpdates({
          conversations: response.conversations,
          hasUpdates: true
        });

        // Atualizar last_message_id para próximo polling
        if (response.last_message_id > 0) {
          lastMessageIdRef.current = response.last_message_id;
          localStorage.setItem('tekflox_last_message_id', response.last_message_id.toString());
        }
      } else {
        console.log('[Global Polling] No new updates');
        
        setUpdates({
          conversations: [],
          hasUpdates: false
        });
      }
    } catch (err) {
      // Log error details
      const status = err.response?.status;
      if (status === 401) {
        console.log('[Global Polling] 🔄 401 error - token refresh should be triggered by axios interceptor');
      } else {
        console.error('[Global Polling] Error:', err);
      }
      
      setError(err.message || 'Failed to fetch updates');
      
      setUpdates({
        conversations: [],
        hasUpdates: false
      });
    } finally {
      setIsPolling(false);
    }
  };
  
  // Wrapper para chamar a função do ref
  const poll = () => {
    if (pollFunctionRef.current) {
      pollFunctionRef.current();
    }
  };

  // Agendar próximo polling
  useEffect(() => {
    // Parar polling se sessão expirou
    if (sessionExpired) {
      console.log('[Global Polling] ⏹️ Polling stopped due to expired session');
      if (pollingTimeoutRef.current) {
        clearInterval(pollingTimeoutRef.current);
        pollingTimeoutRef.current = null;
      }
      return;
    }

    if (!isEnabled) {
      if (pollingTimeoutRef.current) {
        clearInterval(pollingTimeoutRef.current);
        pollingTimeoutRef.current = null;
      }
      return;
    }

    // Executar polling imediatamente
    poll();

    // Usar setInterval para polling contínuo (não setTimeout que só dispara uma vez)
    pollingTimeoutRef.current = setInterval(() => {
      poll();
    }, interval);

    // Cleanup
    return () => {
      if (pollingTimeoutRef.current) {
        clearInterval(pollingTimeoutRef.current);
      }
    };
  }, [isEnabled, interval, sessionExpired]); // REMOVIDO 'poll' das dependências para evitar re-criação do interval

  // Função para resetar o polling (útil após logout ou erro)
  const reset = useCallback(() => {
    lastMessageIdRef.current = null;
    localStorage.removeItem('tekflox_last_message_id');
    
    setUpdates({
      conversations: [],
      hasUpdates: false
    });
  }, []);

  // Função para forçar um poll imediato
  const pollNow = useCallback(() => {
    if (pollingTimeoutRef.current) {
      clearInterval(pollingTimeoutRef.current);
    }
    poll();
    // Re-criar interval após poll manual
    if (isEnabled && !sessionExpired) {
      pollingTimeoutRef.current = setInterval(() => {
        poll();
      }, interval);
    }
  }, [isEnabled, interval, sessionExpired]);

  return {
    updates,
    isPolling,
    error,
    reset,
    pollNow,
    lastMessageId: lastMessageIdRef.current
  };
}

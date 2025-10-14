import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useGlobalPolling } from '../hooks/useGlobalPolling';

/**
 * GlobalPollingProvider
 * 
 * Componente wrapper que gerencia o polling global único.
 * Dispara eventos customizados quando há atualizações.
 */
export function GlobalPollingProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const { updates, isPolling, error } = useGlobalPolling(isAuthenticated, 5000);

  // Disparar evento quando houver atualizações
  useEffect(() => {
    if (updates.hasUpdates) {
      console.log('[GlobalPolling] 📡 Dispatching updates:', {
        conversations: updates.conversations?.length || 0
      });

      // Criar e disparar evento customizado
      const event = new CustomEvent('tekflox-global-updates', {
        detail: updates
      });
      window.dispatchEvent(event);
    }
  }, [updates]);

  // Log de erros
  useEffect(() => {
    if (error) {
      console.error('[GlobalPolling] ❌ Error:', error);
    }
  }, [error]);

  // Log de status
  useEffect(() => {
    if (isAuthenticated) {
      console.log('[GlobalPolling] ✅ Polling active (every 5 seconds)');
    } else {
      console.log('[GlobalPolling] ⏸️ Polling paused (not authenticated)');
    }
  }, [isAuthenticated]);

  return <>{children}</>;
}

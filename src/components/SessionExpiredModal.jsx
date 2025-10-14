import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock } from 'lucide-react';

/**
 * Modal que aparece quando a sessão expira (401)
 * Mostra mensagem amigável e botão para re-login
 */
export default function SessionExpiredModal({ show, onClose }) {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);
  const timerRef = useRef(null);
  const startedRef = useRef(false);

  const handleLogin = () => {
    console.log('[SessionExpiredModal] Redirecting to login...');
    onClose?.();
    startedRef.current = false;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    // Use window.location.href to force a full page reload
    // This ensures all React state is cleared and no pending requests continue
    window.location.href = '/tekflox-social/login';
  };

  useEffect(() => {
    if (!show) {
      // Reset quando modal fecha
      setCountdown(10);
      startedRef.current = false;
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    // Só inicia countdown uma vez
    if (startedRef.current) {
      console.log('[SessionExpiredModal] Countdown already started, ignoring duplicate show');
      return;
    }

    console.log('[SessionExpiredModal] Starting countdown from 10...');
    startedRef.current = true;
    let currentCount = 10;
    setCountdown(10);

    // Auto-redirect após 10 segundos
    timerRef.current = setInterval(() => {
      currentCount--;
      console.log(`[SessionExpiredModal] Countdown: ${currentCount}s`);
      setCountdown(currentCount);
      
      if (currentCount <= 0) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        handleLogin();
      }
    }, 1000);

    return () => {
      console.log('[SessionExpiredModal] Cleaning up timer');
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [show]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md mx-4 animate-fade-in">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-yellow-100 rounded-full p-4">
            <Clock className="w-12 h-12 text-yellow-600" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">
          Sessão Expirada
        </h2>

        {/* Message */}
        <p className="text-gray-600 text-center mb-6">
          Sua sessão expirou por motivos de segurança.
          <br />
          Por favor, faça login novamente para continuar.
        </p>

        {/* Countdown */}
        <p className="text-sm text-gray-500 text-center mb-6">
          Redirecionando em <span className="font-bold text-yellow-600">{countdown}s</span>
        </p>

        {/* Button */}
        <button
          onClick={handleLogin}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all"
        >
          Fazer Login Agora
        </button>
      </div>
    </div>
  );
}

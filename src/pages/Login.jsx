import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, Server, User, Lock, AlertCircle, Loader2 } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading, error: authError } = useAuth();

  // Default backend URL: Vercel in production, localhost in development
  const defaultBackendURL = import.meta.env.PROD 
    ? 'https://tekflox-social.vercel.app'
    : 'http://localhost:3002';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [backendURL, setBackendURL] = useState(defaultBackendURL);
  const [rememberMe, setRememberMe] = useState(false);
  const [localError, setLocalError] = useState('');

  // Load saved credentials on mount
  useEffect(() => {
    const savedUsername = localStorage.getItem('rememberUsername');
    const savedPassword = localStorage.getItem('rememberPassword');
    const savedBackendURL = localStorage.getItem('baseURL');

    if (savedUsername) {
      setUsername(savedUsername);
      setRememberMe(true);
    }
    if (savedPassword) {
      setPassword(savedPassword);
    }
    if (savedBackendURL) {
      setBackendURL(savedBackendURL);
    }
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/conversations');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    // Basic validation
    if (!username.trim()) {
      setLocalError('Por favor, insira seu usuário');
      return;
    }

    if (!password) {
      setLocalError('Por favor, insira sua senha');
      return;
    }

    if (!backendURL.trim()) {
      setLocalError('Por favor, insira a URL do backend');
      return;
    }

    // Validate URL format
    try {
      new URL(backendURL);
    } catch {
      setLocalError('URL do backend inválida. Use formato: http://localhost:3002');
      return;
    }

    // Attempt login
    const result = await login(username, password, backendURL);

    if (result.success) {
      // Save credentials if "Remember me" is checked
      if (rememberMe) {
        localStorage.setItem('rememberUsername', username);
        localStorage.setItem('rememberPassword', password);
      } else {
        // Clear saved credentials if unchecked
        localStorage.removeItem('rememberUsername');
        localStorage.removeItem('rememberPassword');
      }
      
      navigate('/conversations');
    }
    // Error is handled by AuthContext
  };

  const displayError = localError || authError;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl mb-4 shadow-lg">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">TekFlox Social</h1>
          <p className="text-gray-600">Faça login para acessar o sistema</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Input */}
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                Usuário
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Digite seu usuário"
                  disabled={isLoading}
                  autoComplete="username"
                  autoFocus
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Digite sua senha"
                  disabled={isLoading}
                  autoComplete="current-password"
                />
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center">
              <input
                id="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-purple-500 border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                disabled={isLoading}
              />
              <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-700 cursor-pointer">
                Lembrar-me neste dispositivo
              </label>
            </div>

            {/* Backend URL Input */}
            <div>
              <label htmlFor="backendURL" className="block text-sm font-semibold text-gray-700 mb-2">
                URL do Backend
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Server className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  id="backendURL"
                  type="text"
                  value={backendURL}
                  onChange={(e) => setBackendURL(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder={defaultBackendURL}
                  disabled={isLoading}
                  autoComplete="url"
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">
                {import.meta.env.PROD 
                  ? 'URL padrão: Vercel (produção)'
                  : 'URL padrão: localhost (desenvolvimento)'}
              </p>
            </div>

            {/* Error Message */}
            {displayError && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-800">Erro ao fazer login</p>
                  <p className="text-sm text-red-700 mt-1">{displayError}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 px-4 rounded-xl hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Conectando...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Entrar</span>
                </>
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs font-semibold text-gray-700 mb-2">Credenciais de teste:</p>
            <div className="space-y-1 text-xs text-gray-600">
              <p><span className="font-mono bg-gray-100 px-2 py-0.5 rounded">admin</span> / <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">admin123</span> - Administrador</p>
              <p><span className="font-mono bg-gray-100 px-2 py-0.5 rounded">agente</span> / <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">agente123</span> - Agente de Suporte</p>
              <p><span className="font-mono bg-gray-100 px-2 py-0.5 rounded">demo</span> / <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">demo</span> - Usuário Demo</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          TekFlox Social © 2025 - Gerenciamento de Redes Sociais com IA
        </p>
      </div>
    </div>
  );
}

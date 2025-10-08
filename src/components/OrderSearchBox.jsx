import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader, ShoppingBag, X } from 'lucide-react';
import * as api from '../services/api';

export default function OrderSearchBox({ onSelectOrder, onClose }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimeoutRef = useRef(null);
  const containerRef = useRef(null);

  // Debounced search
  useEffect(() => {
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Se a query está vazia, limpar resultados
    if (!searchQuery.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }

    // Mostrar loading
    setIsLoading(true);

    // Criar novo timeout (300ms de debounce)
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const data = await api.searchOrdersAutocomplete(searchQuery);
        setResults(data);
        setShowResults(true);
      } catch (error) {
        console.error('Error searching orders:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    // Cleanup
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectOrder = (order) => {
    onSelectOrder(order);
    setSearchQuery('');
    setResults([]);
    setShowResults(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'processing': return 'bg-blue-100 text-blue-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed': return 'Concluído';
      case 'processing': return 'Processando';
      case 'pending': return 'Pendente';
      default: return status;
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar por nome, email ou número do pedido..."
          className="w-full pl-10 pr-10 py-3 border-2 border-purple-300 rounded-xl focus:outline-none focus:border-purple-500 text-sm"
          autoFocus
        />
        {isLoading && (
          <Loader className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-500 animate-spin" />
        )}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {showResults && results.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border-2 border-purple-200 rounded-xl shadow-lg max-h-96 overflow-y-auto">
          <div className="p-2">
            <p className="px-3 py-2 text-xs text-gray-500 font-medium">
              {results.length} pedido{results.length !== 1 ? 's' : ''} encontrado{results.length !== 1 ? 's' : ''} (últimos 45 dias)
            </p>
            {results.map((order) => (
              <button
                key={order.id}
                onClick={() => handleSelectOrder(order)}
                className="w-full text-left p-3 hover:bg-purple-50 rounded-lg transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <ShoppingBag className="w-4 h-4 text-purple-500" />
                    <span className="font-semibold text-gray-900 text-sm">
                      #{order.orderNumber}
                    </span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </span>
                </div>
                <div className="ml-6 space-y-1">
                  <p className="text-sm text-gray-900 font-medium">
                    {order.customerName}
                  </p>
                  <p className="text-xs text-gray-600">
                    {order.customerEmail}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-semibold text-purple-600">
                      {formatCurrency(order.total)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(order.date)}
                    </span>
                  </div>
                  {order.items && order.items.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {showResults && results.length === 0 && !isLoading && searchQuery.trim() && (
        <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-lg p-6">
          <div className="text-center">
            <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-600 font-medium mb-1">
              Nenhum pedido encontrado
            </p>
            <p className="text-xs text-gray-500">
              Tente buscar por outro nome, email ou número de pedido
            </p>
          </div>
        </div>
      )}

      {/* Initial State - Show recent orders */}
      {!searchQuery && !showResults && (
        <div className="mt-3 text-center">
          <p className="text-xs text-gray-500">
            Digite para buscar pedidos dos últimos 45 dias
          </p>
        </div>
      )}
    </div>
  );
}

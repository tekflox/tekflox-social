import { useState, useEffect } from 'react';
import { X, Search, User, ShoppingCart, Users } from 'lucide-react';
import * as api from '../services/api';

export default function LinkingModal({ conversation, onClose, onLink }) {
  const [activeTab, setActiveTab] = useState('customer'); // 'customer', 'order', 'wp_account'
  const [searchQuery, setSearchQuery] = useState('');
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [wpAccounts, setWpAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  
  useEffect(() => {
    loadData();
  }, [activeTab, searchQuery]);
  
  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'customer') {
        const data = searchQuery 
          ? await api.searchCustomers(searchQuery)
          : await api.getCustomers();
        setCustomers(data);
      } else if (activeTab === 'order') {
        const data = searchQuery
          ? await api.searchOrders(searchQuery)
          : await api.getOrders();
        setOrders(data);
      } else if (activeTab === 'wp_account') {
        const data = searchQuery
          ? await api.searchWordPressAccounts(searchQuery)
          : await api.getWordPressAccounts();
        setWpAccounts(data);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleLink = async () => {
    if (!selectedItem) return;
    
    const linkData = {};
    if (activeTab === 'customer') linkData.customerId = selectedItem.id;
    if (activeTab === 'order') linkData.orderId = selectedItem.id;
    if (activeTab === 'wp_account') linkData.wpAccountId = selectedItem.id;
    
    await onLink(conversation.id, linkData);
    onClose();
  };
  
  const tabs = [
    { id: 'customer', label: 'Cliente', icon: User },
    { id: 'order', label: 'Pedido', icon: ShoppingCart },
    { id: 'wp_account', label: 'Conta WP', icon: Users },
  ];
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Vincular Conversa</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">
            Vincule esta conversa com {conversation.contact.name} a um cliente, pedido ou conta WordPress.
          </p>
          
          {/* Tabs */}
          <div className="flex space-x-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSelectedItem(null);
                  }}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all
                    ${activeTab === tab.id
                      ? 'bg-gradient-ai text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Buscar ${tabs.find(t => t.id === activeTab)?.label.toLowerCase()}...`}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-purple-400 focus:outline-none"
            />
          </div>
        </div>
        
        {/* List */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            </div>
          ) : (
            <div className="space-y-2">
              {activeTab === 'customer' && customers.map((customer) => (
                <div
                  key={customer.id}
                  onClick={() => setSelectedItem(customer)}
                  className={`
                    p-4 rounded-lg border-2 cursor-pointer transition-all
                    ${selectedItem?.id === customer.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                    }
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={customer.avatar}
                      alt={customer.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">{customer.name}</p>
                      <p className="text-sm text-gray-600">{customer.email}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              {activeTab === 'order' && orders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => setSelectedItem(order)}
                  className={`
                    p-4 rounded-lg border-2 cursor-pointer transition-all
                    ${selectedItem?.id === order.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{order.orderId}</p>
                      <p className="text-sm text-gray-600">{order.customer}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-purple-600">{order.total}</p>
                      <p className="text-xs text-gray-500">{order.status}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              {activeTab === 'wp_account' && wpAccounts.map((account) => (
                <div
                  key={account.id}
                  onClick={() => setSelectedItem(account)}
                  className={`
                    p-4 rounded-lg border-2 cursor-pointer transition-all
                    ${selectedItem?.id === account.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                    }
                  `}
                >
                  <div>
                    <p className="font-semibold text-gray-900">@{account.username}</p>
                    <p className="text-sm text-gray-600">{account.email}</p>
                    <p className="text-xs text-gray-500 mt-1">Role: {account.role}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleLink}
            disabled={!selectedItem}
            className="px-6 py-2 bg-gradient-ai text-white rounded-lg font-medium hover:shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Vincular
          </button>
        </div>
      </div>
    </div>
  );
}

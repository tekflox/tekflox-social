import { useEffect, useState } from 'react';
import { MessageSquare, Clock, CheckCircle, Sparkles, Instagram, Facebook, MessageCircle, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useApp } from '../contexts/AppContext';
import AISuggestionCard from '../components/AISuggestionCard';

function Dashboard() {
  const { state, loadPendingConversations, loadDashboardStats, sendMessage } = useApp();
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        loadPendingConversations(),
        loadDashboardStats(),
      ]);
      setLoading(false);
    };
    loadData();
  }, []);
  
  const handleSendReply = async (conversationId, text, actionType) => {
    await sendMessage(conversationId, text, actionType);
    // Reload pending conversations after sending
    await loadPendingConversations();
  };
  
  const stats = state.dashboardStats;
  
  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'instagram': return Instagram;
      case 'facebook': return Facebook;
      case 'whatsapp': return MessageCircle;
      default: return MessageSquare;
    }
  };
  
  const statCards = [
    { 
      label: 'Total de Conversas', 
      value: stats?.totalConversations || 0, 
      icon: MessageSquare,
      color: 'from-blue-500 to-cyan-500'
    },
    { 
      label: 'Mensagens Pendentes', 
      value: stats?.pending || 0, 
      icon: Clock,
      color: 'from-yellow-500 to-orange-500'
    },
    { 
      label: 'Respondidas', 
      value: stats?.answered || 0, 
      icon: CheckCircle,
      color: 'from-green-500 to-emerald-500'
    },
    { 
      label: 'Resolvidas', 
      value: stats?.resolved || 0, 
      icon: Sparkles,
      color: 'from-purple-500 to-pink-500'
    },
  ];
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
          Dashboard 🎯
        </h1>
        <p className="text-gray-600">Gerencie suas conversas com inteligência artificial</p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl shadow-candy border border-purple-100 p-6 hover:shadow-ai transition-all duration-300"
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color} p-3 mb-4 shadow-md`}>
              <stat.icon className="w-full h-full text-white" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-600 mt-1 font-medium">{stat.label}</p>
          </motion.div>
        ))}
      </div>
      
      {/* Platform Stats */}
      {stats?.byPlatform && (
        <div className="bg-white rounded-2xl shadow-candy border border-purple-100 p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
            Conversas por Plataforma
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(stats.byPlatform).map(([platform, count]) => {
              const Icon = getPlatformIcon(platform);
              return (
                <div key={platform} className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                  <Icon className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                  <p className="text-sm text-gray-600 capitalize">{platform}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Pending Conversations with AI Suggestions */}
      <div>
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <Sparkles className="w-6 h-6 mr-2 text-purple-600 animate-pulse" />
          Mensagens Pendentes com Sugestões de IA
        </h2>
        
        {state.pendingConversations.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-candy border border-purple-100 p-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Tudo em dia! 🎉</h3>
            <p className="text-gray-600">Não há mensagens pendentes no momento.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {state.pendingConversations.map((conversation) => (
              <AISuggestionCard
                key={conversation.id}
                conversation={conversation}
                onSendReply={handleSendReply}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard

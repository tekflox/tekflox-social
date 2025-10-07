import { useApp } from '../contexts/AppContext'
import { Sparkles, Bell, Shield, Database } from 'lucide-react'

function Settings() {
  const { state, dispatch } = useApp()
  
  const settingSections = [
    {
      title: 'Inteligência Artificial',
      icon: Sparkles,
      settings: [
        {
          label: 'Sugestões Automáticas',
          description: 'Ativar sugestões de resposta por IA',
          type: 'toggle',
          value: state.aiSuggestions,
          onChange: () => dispatch({ type: 'TOGGLE_AI' })
        }
      ]
    },
    {
      title: 'Notificações',
      icon: Bell,
      settings: [
        {
          label: 'Notificações Desktop',
          description: 'Receber alertas de novas mensagens',
          type: 'toggle',
          value: true
        }
      ]
    }
  ]
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-ai-purple to-ai-pink bg-clip-text text-transparent">
          Configurações
        </h1>
        <p className="text-gray-600 mt-2">Personalize sua experiência</p>
      </div>
      
      {settingSections.map(section => (
        <div key={section.title} className="ai-card p-6">
          <div className="flex items-center space-x-3 mb-6">
            <section.icon className="w-5 h-5 text-ai-purple" />
            <h2 className="text-xl font-semibold">{section.title}</h2>
          </div>
          
          <div className="space-y-4">
            {section.settings.map(setting => (
              <div key={setting.label} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{setting.label}</p>
                  <p className="text-sm text-gray-500">{setting.description}</p>
                </div>
                {setting.type === 'toggle' && (
                  <button
                    onClick={setting.onChange}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      setting.value ? 'bg-ai-purple' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      setting.value ? 'translate-x-6' : ''
                    }`} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default Settings

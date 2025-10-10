import React, { useState, useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Dashboard Component
const Dashboard = () => {
  const [stats, setStats] = useState({
    total_leads: 0,
    hot_leads: 0,
    warm_leads: 0,
    cold_leads: 0,
    today_leads: 0
  });
  const [leads, setLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, leadsResponse] = await Promise.all([
        axios.get(`${API}/dashboard/stats`),
        axios.get(`${API}/leads`)
      ]);
      
      setStats(statsResponse.data);
      setLeads(leadsResponse.data);
      setLoading(false);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      setLoading(false);
    }
  };

  const fetchConversation = async (leadId) => {
    try {
      const response = await axios.get(`${API}/leads/${leadId}/conversation`);
      setConversation(response.data);
    } catch (error) {
      console.error("Erro ao buscar conversa:", error);
    }
  };

  const handleLeadClick = (lead) => {
    setSelectedLead(lead);
    fetchConversation(lead.id);
  };

  const getInterestColor = (level) => {
    switch (level) {
      case "hot": return "text-red-600 bg-red-100";
      case "warm": return "text-yellow-600 bg-yellow-100";
      case "cold": return "text-blue-600 bg-blue-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <img 
                  className="h-10 w-auto" 
                  src="https://www.hapvida.com.br/site/assets/img/hapvida-logo.svg" 
                  alt="Hapvida"
                />
              </div>
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-gray-900">Agente IA Dental</h1>
                <p className="text-sm text-gray-500">Sistema de Vendas Hapvida +Odonto</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                🤖 Agente Ativo
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">T</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total de Leads</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.total_leads}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">🔥</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Leads Quentes</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.hot_leads}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">⚡</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Leads Mornos</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.warm_leads}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-300 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">❄️</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Leads Frios</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.cold_leads}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">📅</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Hoje</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.today_leads}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Leads List */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Leads Recentes</h3>
              </div>
              <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {leads.map((lead) => (
                  <div
                    key={lead.id}
                    className={`px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                      selectedLead?.id === lead.id ? "bg-blue-50 border-r-4 border-blue-500" : ""
                    }`}
                    onClick={() => handleLeadClick(lead)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {lead.name || `Lead ${lead.phone_number.slice(-4)}`}
                        </p>
                        <p className="text-sm text-gray-500">{lead.phone_number}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDate(lead.created_at)}
                        </p>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${getInterestColor(lead.interest_level)}`}>
                          {lead.interest_level.toUpperCase()}
                        </span>
                        {lead.plan_interest && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {lead.plan_interest}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Conversation Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg h-96">
              {selectedLead ? (
                <div className="flex flex-col h-full">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">
                      Conversa com {selectedLead.name || selectedLead.phone_number}
                    </h3>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getInterestColor(selectedLead.interest_level)}`}>
                        {selectedLead.interest_level.toUpperCase()}
                      </span>
                      {selectedLead.plan_interest && (
                        <span className="text-xs text-gray-500">
                          Interesse: {selectedLead.plan_interest}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {conversation?.messages ? (
                      conversation.messages.map((message, index) => (
                        <div
                          key={index}
                          className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.sender === 'user'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p className={`text-xs mt-1 ${
                              message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                              {formatDate(message.timestamp)}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-gray-500">
                        <p>Carregando conversa...</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">💬</span>
                    </div>
                    <p>Selecione um lead para ver a conversa</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Agendamentos Section */}
        <div className="mt-8 bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Sistema de Agendamentos</h3>
            <p className="text-sm text-gray-500 mt-1">Gerenciar consultas e atendimentos com clientes</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center p-6 border border-dashed border-gray-300 rounded-lg">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl">📅</span>
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Agendamentos Automáticos</h4>
                <p className="text-sm text-gray-600 mb-4">
                  O agente IA oferece automaticamente agendamento para leads interessados
                </p>
                <div className="text-xs text-gray-500">
                  Horários disponíveis: Seg-Sex 9h às 18h
                </div>
              </div>
              
              <div className="text-center p-6 border border-dashed border-gray-300 rounded-lg">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl">👤</span>
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Consulta Humana</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Leads qualificados são direcionados para consultores especializados
                </p>
                <div className="text-xs text-gray-500">
                  Conversão personalizada para fechamento
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// WhatsApp Setup Component
const WhatsAppSetup = () => {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    setWebhookUrl(`${BACKEND_URL}/api/whatsapp/webhook`);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Configurar WhatsApp Business</h2>
              <p className="text-gray-600 mt-2">Conecte seu número do WhatsApp Business ao agente de vendas</p>
            </div>

            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">1. URL do Webhook</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Use esta URL como webhook no seu WhatsApp Business:</p>
                  <div className="flex items-center space-x-2">
                    <code className="flex-1 bg-white px-3 py-2 rounded border text-sm font-mono">
                      {webhookUrl}
                    </code>
                    <button
                      onClick={() => navigator.clipboard.writeText(webhookUrl)}
                      className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                    >
                      Copiar
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">2. Configurar no Meta Business</h3>
                <div className="bg-blue-50 p-6 rounded-lg">
                  <ol className="list-decimal list-inside space-y-3 text-sm text-gray-700">
                    <li>Acesse o <a href="https://business.facebook.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Meta Business</a></li>
                    <li>Vá para WhatsApp Business API</li>
                    <li>Configure o webhook com a URL acima</li>
                    <li>Defina os eventos: messages, message_status</li>
                    <li>Configure o token de verificação (opcional)</li>
                    <li>Ative o webhook para receber mensagens</li>
                  </ol>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">3. Teste a Integração</h3>
                <div className="bg-green-50 p-6 rounded-lg">
                  <p className="text-sm text-gray-700 mb-3">
                    Após configurar o webhook, envie uma mensagem para o seu número do WhatsApp Business para testar:
                  </p>
                  <div className="bg-white p-3 rounded border-l-4 border-green-500">
                    <p className="text-sm font-mono">"Oi, tenho interesse em plano odontológico"</p>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    O agente deve responder automaticamente se a configuração estiver correta.
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Status da Integração</h4>
                    <p className="text-sm text-gray-600">WhatsApp Business API</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    isConfigured 
                      ? "bg-green-100 text-green-800" 
                      : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {isConfigured ? "✅ Configurado" : "⏳ Pendente"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main App Component
function App() {
  const [currentView, setCurrentView] = useState("dashboard");

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={
            <div>
              {/* Navigation */}
              <nav className="bg-blue-600 text-white p-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                  <div className="flex items-center space-x-8">
                    <h1 className="text-xl font-bold">Hapvida +Odonto AI</h1>
                    <div className="flex space-x-4">
                      <button
                        onClick={() => setCurrentView("dashboard")}
                        className={`px-3 py-2 rounded ${
                          currentView === "dashboard" 
                            ? "bg-blue-800" 
                            : "hover:bg-blue-700"
                        }`}
                      >
                        Dashboard
                      </button>
                      <button
                        onClick={() => setCurrentView("whatsapp")}
                        className={`px-3 py-2 rounded ${
                          currentView === "whatsapp" 
                            ? "bg-blue-800" 
                            : "hover:bg-blue-700"
                        }`}
                      >
                        WhatsApp Setup
                      </button>
                    </div>
                  </div>
                </div>
              </nav>

              {/* Content */}
              {currentView === "dashboard" && <Dashboard />}
              {currentView === "whatsapp" && <WhatsAppSetup />}
            </div>
          }>
            <Route index element={<Dashboard />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
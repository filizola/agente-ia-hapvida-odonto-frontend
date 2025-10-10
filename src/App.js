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
    today_leads: 0,
    human_contacted: 0,
    not_contacted: 0
  });
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedLead, setSelectedLead] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    filterLeads();
  }, [leads, activeFilter]);

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

  const filterLeads = () => {
    let filtered = leads;
    
    switch (activeFilter) {
      case "hot":
        filtered = leads.filter(lead => lead.interest_level === "hot");
        break;
      case "warm":
        filtered = leads.filter(lead => lead.interest_level === "warm");
        break;
      case "cold":
        filtered = leads.filter(lead => lead.interest_level === "cold");
        break;
      case "today":
        const today = new Date().toISOString().split('T')[0];
        filtered = leads.filter(lead => lead.created_at.startsWith(today));
        break;
      case "contacted":
        filtered = leads.filter(lead => lead.human_contacted === true);
        break;
      case "not_contacted":
        filtered = leads.filter(lead => lead.human_contacted !== true);
        break;
      default:
        filtered = leads;
    }
    
    setFilteredLeads(filtered);
  };

  const handleFilterClick = (filterType) => {
    setActiveFilter(filterType);
    setSelectedLead(null);
    setConversation(null);
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

  const toggleHumanContact = async (leadId, currentStatus, event) => {
    event.stopPropagation(); // Evitar que o click do lead seja acionado
    
    try {
      const notes = !currentStatus ? prompt("Adicionar observações sobre o contato (opcional):") : null;
      
      await axios.put(`${API}/leads/${leadId}/human-contact`, {
        human_contacted: !currentStatus,
        notes: notes || undefined
      });
      
      // Atualizar os dados
      await fetchDashboardData();
      
      const statusText = !currentStatus ? "marcado como contactado" : "desmarcado";
      alert(`Lead ${statusText} com sucesso!`);
      
    } catch (error) {
      console.error("Erro ao atualizar contato humano:", error);
      alert("Erro ao atualizar status de contato");
    }
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
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xl font-bold">🦷</span>
                </div>
              </div>
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-gray-900">Agente IA Dental</h1>
                <p className="text-sm text-gray-500">Sistema de Vendas de Planos Odontológicos</p>
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
        {/* Filter Indicator */}
        {activeFilter !== "all" && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-blue-600 mr-2">
                  {activeFilter === "hot" && "🔥"}
                  {activeFilter === "warm" && "⚡"}
                  {activeFilter === "cold" && "❄️"}
                  {activeFilter === "today" && "📅"}
                </span>
                <span className="text-blue-800 font-medium">
                  Exibindo apenas: {" "}
                  {activeFilter === "hot" && "Leads Quentes"}
                  {activeFilter === "warm" && "Leads Mornos"}
                  {activeFilter === "cold" && "Leads Frios"}
                  {activeFilter === "today" && "Leads de Hoje"}
                  {activeFilter === "contacted" && "Leads Contactados"}
                  {activeFilter === "not_contacted" && "Leads Não Contactados"}
                </span>
                <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                  {filteredLeads.length} encontrado{filteredLeads.length !== 1 ? 's' : ''}
                </span>
              </div>
              <button
                onClick={() => handleFilterClick("all")}
                className="text-blue-600 hover:text-blue-800 text-sm underline"
              >
                Limpar filtro
              </button>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4 mb-8">
          <div 
            className={`bg-white overflow-hidden shadow rounded-lg cursor-pointer transition-all hover:shadow-lg transform hover:scale-105 ${
              activeFilter === "all" ? "ring-2 ring-blue-500 shadow-lg" : ""
            }`}
            onClick={() => handleFilterClick("all")}
          >
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

          <div 
            className={`bg-white overflow-hidden shadow rounded-lg cursor-pointer transition-all hover:shadow-lg transform hover:scale-105 ${
              activeFilter === "hot" ? "ring-2 ring-red-500 shadow-lg" : ""
            }`}
            onClick={() => handleFilterClick("hot")}
          >
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

          <div 
            className={`bg-white overflow-hidden shadow rounded-lg cursor-pointer transition-all hover:shadow-lg transform hover:scale-105 ${
              activeFilter === "warm" ? "ring-2 ring-yellow-500 shadow-lg" : ""
            }`}
            onClick={() => handleFilterClick("warm")}
          >
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

          <div 
            className={`bg-white overflow-hidden shadow rounded-lg cursor-pointer transition-all hover:shadow-lg transform hover:scale-105 ${
              activeFilter === "cold" ? "ring-2 ring-blue-300 shadow-lg" : ""
            }`}
            onClick={() => handleFilterClick("cold")}
          >
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

          <div 
            className={`bg-white overflow-hidden shadow rounded-lg cursor-pointer transition-all hover:shadow-lg transform hover:scale-105 ${
              activeFilter === "today" ? "ring-2 ring-green-500 shadow-lg" : ""
            }`}
            onClick={() => handleFilterClick("today")}
          >
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

          <div 
            className={`bg-white overflow-hidden shadow rounded-lg cursor-pointer transition-all hover:shadow-lg transform hover:scale-105 ${
              activeFilter === "contacted" ? "ring-2 ring-purple-500 shadow-lg" : ""
            }`}
            onClick={() => handleFilterClick("contacted")}
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">👤</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Contactados</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.human_contacted}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div 
            className={`bg-white overflow-hidden shadow rounded-lg cursor-pointer transition-all hover:shadow-lg transform hover:scale-105 ${
              activeFilter === "not_contacted" ? "ring-2 ring-orange-500 shadow-lg" : ""
            }`}
            onClick={() => handleFilterClick("not_contacted")}
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">⏳</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Não Contactados</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.not_contacted}</dd>
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
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {activeFilter === "all" && "Todos os Leads"}
                      {activeFilter === "hot" && "Leads Quentes 🔥"}
                      {activeFilter === "warm" && "Leads Mornos ⚡"}
                      {activeFilter === "cold" && "Leads Frios ❄️"}
                      {activeFilter === "today" && "Leads de Hoje 📅"}
                      {activeFilter === "contacted" && "Leads Contactados 👤"}
                      {activeFilter === "not_contacted" && "Leads Não Contactados ⏳"}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {filteredLeads.length} lead{filteredLeads.length !== 1 ? 's' : ''} 
                      {activeFilter !== "all" && ` filtrado${filteredLeads.length !== 1 ? 's' : ''}`}
                    </p>
                  </div>
                  {activeFilter !== "all" && (
                    <button
                      onClick={() => handleFilterClick("all")}
                      className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                    >
                      Ver Todos
                    </button>
                  )}
                </div>
              </div>
              <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {filteredLeads.length > 0 ? (
                  filteredLeads.map((lead) => (
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
                          {lead.name || `Cliente ${lead.phone_number.slice(-4)}`}
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
                ))
                ) : (
                  <div className="px-6 py-12 text-center text-gray-500">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">
                        {activeFilter === "hot" && "🔥"}
                        {activeFilter === "warm" && "⚡"}
                        {activeFilter === "cold" && "❄️"}
                        {activeFilter === "today" && "📅"}
                        {activeFilter === "contacted" && "👤"}
                        {activeFilter === "not_contacted" && "⏳"}
                        {activeFilter === "all" && "👥"}
                      </span>
                    </div>
                    <p>
                      {activeFilter === "all" && "Nenhum lead cadastrado"}
                      {activeFilter === "hot" && "Nenhum lead quente encontrado"}
                      {activeFilter === "warm" && "Nenhum lead morno encontrado"}
                      {activeFilter === "cold" && "Nenhum lead frio encontrado"}
                      {activeFilter === "today" && "Nenhum lead criado hoje"}
                      {activeFilter === "contacted" && "Nenhum lead foi contactado ainda"}
                      {activeFilter === "not_contacted" && "Todos os leads já foram contactados"}
                    </p>
                    {activeFilter !== "all" && (
                      <button
                        onClick={() => handleFilterClick("all")}
                        className="mt-3 text-sm text-blue-600 hover:text-blue-800 underline"
                      >
                        Ver todos os leads
                      </button>
                    )}
                  </div>
                )}
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

// Plans Management Component
const PlansManager = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    features: [''],
    is_popular: false
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await axios.get(`${API}/plans`);
      setPlans(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao buscar planos:', error);
      setLoading(false);
    }
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      price: plan.price.toString(),
      description: plan.description,
      features: [...plan.features],
      is_popular: plan.is_popular
    });
    setShowEditModal(true);
  };

  const handleSave = async () => {
    try {
      const updatedPlan = {
        ...formData,
        price: parseFloat(formData.price),
        features: formData.features.filter(f => f.trim() !== '')
      };

      await axios.put(`${API}/plans/${editingPlan.id}`, updatedPlan);
      
      alert('Plano atualizado com sucesso!');
      setShowEditModal(false);
      setEditingPlan(null);
      fetchPlans();
    } catch (error) {
      console.error('Erro ao atualizar plano:', error);
      alert('Erro ao atualizar plano');
    }
  };

  const addFeature = () => {
    setFormData({
      ...formData,
      features: [...formData.features, '']
    });
  };

  const updateFeature = (index, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({
      ...formData,
      features: newFeatures
    });
  };

  const removeFeature = (index) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      features: newFeatures
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando planos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Gerenciar Planos Odontológicos</h1>
          <p className="text-gray-600">Atualize valores, descrições e características dos planos</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div key={plan.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                  {plan.is_popular && (
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                      Popular
                    </span>
                  )}
                </div>
                
                <div className="mb-4">
                  <span className="text-2xl font-bold text-blue-600">
                    R$ {plan.price.toFixed(2).replace('.', ',')}
                  </span>
                  <span className="text-gray-500 ml-1">/mês</span>
                </div>
                
                <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                
                <div className="space-y-2 mb-6">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center text-sm text-gray-700">
                      <span className="text-green-500 mr-2">✓</span>
                      {feature}
                    </div>
                  ))}
                </div>
                
                <button
                  onClick={() => handleEdit(plan)}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Editar Plano
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Edit Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-96 overflow-y-auto">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Editar {editingPlan?.name}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome do Plano
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preço (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Características
                  </label>
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => updateFeature(index, e.target.value)}
                        placeholder="Digite uma característica"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {formData.features.length > 1 && (
                        <button
                          onClick={() => removeFeature(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addFeature}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    + Adicionar característica
                  </button>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_popular"
                    checked={formData.is_popular}
                    onChange={(e) => setFormData({...formData, is_popular: e.target.checked})}
                    className="mr-2"
                  />
                  <label htmlFor="is_popular" className="text-sm text-gray-700">
                    Marcar como popular
                  </label>
                </div>
              </div>

              <div className="flex space-x-3 pt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">ℹ️ Como Funciona</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Atualizações em Tempo Real</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Valores são atualizados automaticamente no agente IA</li>
                <li>• Novas conversas usam preços atualizados</li>
                <li>• Características são incluídas nas apresentações</li>
                <li>• Plano popular é destacado nas ofertas</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Dicas de Uso</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Use descrições claras e atrativas</li>
                <li>• Mantenha características objetivas</li>
                <li>• Marque apenas 1 plano como popular</li>
                <li>• Atualize preços conforme necessário</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Reports Component
const Reports = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  const downloadLeadsReport = async () => {
    setIsGenerating(true);
    try {
      const response = await axios.get(`${API}/reports/leads/excel`, {
        responseType: 'blob'
      });
      
      // Criar link de download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Extrair nome do arquivo do header
      const contentDisposition = response.headers['content-disposition'];
      const filename = contentDisposition 
        ? contentDisposition.split('filename=')[1].replace(/"/g, '')
        : `relatorio_leads_${new Date().toISOString().slice(0, 10)}.xlsx`;
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      alert('Relatório de leads baixado com sucesso!');
    } catch (error) {
      console.error('Erro ao baixar relatório de leads:', error);
      alert('Erro ao gerar relatório de leads');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadAppointmentsReport = async () => {
    setIsGenerating(true);
    try {
      const url = selectedMonth ? 
        `${API}/reports/appointments/excel?month=${selectedMonth}` :
        `${API}/reports/appointments/excel`;
        
      const response = await axios.get(url, {
        responseType: 'blob'
      });
      
      // Criar link de download
      const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = downloadUrl;
      
      // Extrair nome do arquivo do header
      const contentDisposition = response.headers['content-disposition'];
      const filename = contentDisposition 
        ? contentDisposition.split('filename=')[1].replace(/"/g, '')
        : `relatorio_agendamentos_${new Date().toISOString().slice(0, 10)}.xlsx`;
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
      
      alert('Relatório de agendamentos baixado com sucesso!');
    } catch (error) {
      console.error('Erro ao baixar relatório de agendamentos:', error);
      alert('Erro ao gerar relatório de agendamentos');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Relatórios e Exportação</h1>
          <p className="text-gray-600">Gere relatórios detalhados em formato Excel</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Relatório de Leads */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <span className="text-xl">📊</span>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Relatório de Leads</h3>
                <p className="text-sm text-gray-500">Exportar todos os leads e conversas</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Conteúdo do Relatório:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Dados completos dos leads</li>
                  <li>• Nível de interesse e qualificação</li>
                  <li>• Histórico de mensagens</li>
                  <li>• Status de agendamentos</li>
                  <li>• Datas de primeiro e último contato</li>
                </ul>
              </div>
              
              <button
                onClick={downloadLeadsReport}
                disabled={isGenerating}
                className={`w-full px-4 py-3 rounded-lg font-medium transition-colors ${
                  isGenerating 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isGenerating ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Gerando...
                  </span>
                ) : (
                  '📥 Baixar Relatório de Leads'
                )}
              </button>
            </div>
          </div>

          {/* Relatório de Agendamentos */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <span className="text-xl">📅</span>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Relatório de Agendamentos</h3>
                <p className="text-sm text-gray-500">Exportar agendamentos por período</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filtrar por Mês (opcional)
                </label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Deixe em branco para exportar todos os agendamentos
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Conteúdo do Relatório:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Informações completas dos agendamentos</li>
                  <li>• Dados de contato dos clientes</li>
                  <li>• Status e tipo de consulta</li>
                  <li>• Observações e notas</li>
                  <li>• Datas e horários</li>
                </ul>
              </div>
              
              <button
                onClick={downloadAppointmentsReport}
                disabled={isGenerating}
                className={`w-full px-4 py-3 rounded-lg font-medium transition-colors ${
                  isGenerating 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {isGenerating ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Gerando...
                  </span>
                ) : (
                  '📥 Baixar Relatório de Agendamentos'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Informações Adicionais */}
        <div className="mt-8 bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">ℹ️ Informações sobre os Relatórios</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Formato dos Arquivos</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Formato: Excel (.xlsx)</li>
                <li>• Compatível com Microsoft Excel e Google Sheets</li>
                <li>• Cabeçalhos formatados e colunas organizadas</li>
                <li>• Download direto no navegador</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Frequência Recomendada</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Relatório de leads: Semanal ou mensal</li>
                <li>• Relatório de agendamentos: Mensal</li>
                <li>• Para análises específicas: Conforme necessário</li>
                <li>• Backup de dados: Quinzenal</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Calendar Component
const Calendar = () => {
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState("");
  const [filterType, setFilterType] = useState("date"); // "date" or "month"
  const [availableSlots, setAvailableSlots] = useState([]);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    customer_name: "",
    customer_email: "",
    phone_number: "",
    preferred_time: "",
    consultation_type: "dental_plan",
    notes: ""
  });

  useEffect(() => {
    fetchAppointments();
    if (filterType === "date") {
      fetchAvailableSlots();
    }
  }, [selectedDate, selectedMonth, filterType]);

  const fetchAppointments = async () => {
    try {
      let url = `${API}/appointments`;
      if (filterType === "date") {
        const dateStr = selectedDate.toISOString().split('T')[0];
        url += `?date=${dateStr}`;
      } else if (filterType === "month" && selectedMonth) {
        url += `?month=${selectedMonth}`;
      }
      
      const response = await axios.get(url);
      setAppointments(response.data);
    } catch (error) {
      console.error("Erro ao buscar agendamentos:", error);
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const response = await axios.get(`${API}/appointments/available-slots?date=${dateStr}`);
      setAvailableSlots(response.data.available_slots);
    } catch (error) {
      console.error("Erro ao buscar horários disponíveis:", error);
    }
  };

  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const response = await axios.post(`${API}/appointments`, {
        ...newAppointment,
        preferred_date: dateStr
      });
      
      if (response.data.success) {
        alert("Agendamento criado com sucesso!");
        setShowAppointmentModal(false);
        setNewAppointment({
          customer_name: "",
          customer_email: "",
          phone_number: "",
          preferred_time: "",
          consultation_type: "dental_plan",
          notes: ""
        });
        fetchAppointments();
        fetchAvailableSlots();
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("Erro ao criar agendamento:", error);
      alert("Erro ao criar agendamento");
    }
  };

  const updateAppointmentStatus = async (appointmentId, status) => {
    try {
      await axios.put(`${API}/appointments/${appointmentId}/status`, { status });
      fetchAppointments();
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatTime = (time) => {
    return time;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "scheduled": return "bg-yellow-100 text-yellow-800";
      case "confirmed": return "bg-blue-100 text-blue-800";
      case "completed": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      case "no_show": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Calendário de Agendamentos</h1>
          <p className="text-gray-600">Gerencie consultas e atendimentos com leads</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar Selector */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Filtrar Agendamentos</h3>
            
            {/* Filter Type Selector */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Filtro</label>
              <select
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value);
                  if (e.target.value === "month") {
                    setSelectedMonth(new Date().toISOString().slice(0, 7));
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="date">Por Data Específica</option>
                <option value="month">Por Mês</option>
              </select>
            </div>

            {/* Date Selector */}
            {filterType === "date" && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Data</label>
                <input
                  type="date"
                  value={selectedDate.toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {/* Month Selector */}
            {filterType === "month" && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Mês</label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {/* Clear Filter Button */}
            <button
              onClick={() => {
                setFilterType("date");
                setSelectedDate(new Date());
                setSelectedMonth("");
                setAppointments([]);
              }}
              className="w-full mb-4 px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Limpar Filtros
            </button>
            
            {/* Available Slots - only show for date filter */}
            {filterType === "date" && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Horários Disponíveis</h4>
                <div className="grid grid-cols-2 gap-2">
                  {availableSlots.map((slot, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setNewAppointment({...newAppointment, preferred_time: slot});
                        setShowAppointmentModal(true);
                      }}
                      className="px-3 py-2 text-sm bg-green-100 text-green-800 rounded hover:bg-green-200 transition-colors"
                    >
                      {slot}
                    </button>
                  ))}
                </div>
                {availableSlots.length === 0 && filterType === "date" && (
                  <p className="text-sm text-gray-500">Nenhum horário disponível</p>
                )}
              </div>
            )}

            <button
              onClick={() => setShowAppointmentModal(true)}
              className="mt-6 w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Novo Agendamento
            </button>
          </div>

          {/* Appointments List */}
          <div className="lg:col-span-2 bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Agendamentos - {filterType === "date" ? formatDate(selectedDate) : 
                  filterType === "month" && selectedMonth ? 
                    new Date(selectedMonth + "-01").toLocaleDateString('pt-BR', { year: 'numeric', month: 'long' }) :
                    "Todos"}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {appointments.length} agendamento{appointments.length !== 1 ? 's' : ''} encontrado{appointments.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="divide-y divide-gray-200">
              {appointments.length > 0 ? (
                appointments.map((appointment) => (
                  <div key={appointment.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {appointment.customer_name || `Cliente ${appointment.phone_number.slice(-4)}`}
                            </p>
                            <p className="text-sm text-gray-500">{appointment.phone_number}</p>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center space-x-4">
                          <span className="text-sm text-gray-600">
                            🕐 {formatTime(appointment.appointment_time)}
                          </span>
                          <span className="text-sm text-gray-600">
                            📞 {appointment.consultation_type}
                          </span>
                        </div>
                        {appointment.notes && (
                          <p className="mt-1 text-sm text-gray-600">
                            📝 {appointment.notes}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(appointment.status)}`}>
                          {appointment.status.toUpperCase()}
                        </span>
                        <div className="flex space-x-1">
                          {appointment.status === "scheduled" && (
                            <button
                              onClick={() => updateAppointmentStatus(appointment.id, "confirmed")}
                              className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                              Confirmar
                            </button>
                          )}
                          {(appointment.status === "scheduled" || appointment.status === "confirmed") && (
                            <button
                              onClick={() => updateAppointmentStatus(appointment.id, "completed")}
                              className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                            >
                              Finalizar
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-12 text-center text-gray-500">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📅</span>
                  </div>
                  <p>Nenhum agendamento para esta data</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal for New Appointment */}
        {showAppointmentModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Novo Agendamento</h3>
              <form onSubmit={handleCreateAppointment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome do Cliente
                  </label>
                  <input
                    type="text"
                    value={newAppointment.customer_name}
                    onChange={(e) => setNewAppointment({...newAppointment, customer_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={newAppointment.phone_number}
                    onChange={(e) => setNewAppointment({...newAppointment, phone_number: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newAppointment.customer_email}
                    onChange={(e) => setNewAppointment({...newAppointment, customer_email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Horário *
                  </label>
                  <select
                    required
                    value={newAppointment.preferred_time}
                    onChange={(e) => setNewAppointment({...newAppointment, preferred_time: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecione um horário</option>
                    {availableSlots.map((slot, index) => (
                      <option key={index} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Observações
                  </label>
                  <textarea
                    value={newAppointment.notes}
                    onChange={(e) => setNewAppointment({...newAppointment, notes: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAppointmentModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Agendar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
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
                    <h1 className="text-xl font-bold">Agente IA Dental</h1>
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
                        onClick={() => setCurrentView("calendar")}
                        className={`px-3 py-2 rounded ${
                          currentView === "calendar" 
                            ? "bg-blue-800" 
                            : "hover:bg-blue-700"
                        }`}
                      >
                        Calendário
                      </button>
                      <button
                        onClick={() => setCurrentView("plans")}
                        className={`px-3 py-2 rounded ${
                          currentView === "plans" 
                            ? "bg-blue-800" 
                            : "hover:bg-blue-700"
                        }`}
                      >
                        Planos
                      </button>
                      <button
                        onClick={() => setCurrentView("reports")}
                        className={`px-3 py-2 rounded ${
                          currentView === "reports" 
                            ? "bg-blue-800" 
                            : "hover:bg-blue-700"
                        }`}
                      >
                        Relatórios
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
              {currentView === "calendar" && <Calendar />}
              {currentView === "plans" && <PlansManager />}
              {currentView === "reports" && <Reports />}
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
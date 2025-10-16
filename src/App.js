import React, { useState, useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import { Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";
const API = `${BACKEND_URL}/api`;
// Definir baseURL global para todas as chamadas axios e logar para inspeção
axios.defaults.baseURL = API;
// Log simples para facilitar diagnóstico de URL incorreta no runtime
if (typeof window !== "undefined") {
  // eslint-disable-next-line no-console
  console.log("[Frontend] API baseURL:", API);
}

// Evitar o intersticial de segurança do ngrok nas requisições XHR/fetch
// Referência: enviar cabeçalho "ngrok-skip-browser-warning" em todas as chamadas
axios.defaults.headers.common["ngrok-skip-browser-warning"] = "true";

// Admin Users Component
const AdminUsers = ({ currentUser }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "user", password: "" });

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API}/users`);
      setUsers(res.data || []);
    } catch (err) {
      console.error("Erro ao listar usuários", err);
      alert("Erro ao listar usuários");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const createUser = async (e) => {
    e.preventDefault();
    try {
      if (!newUser.password) {
        alert("Defina uma senha para o novo usuário");
        return;
      }
      const payload = { ...newUser };
      const res = await axios.post(`${API}/users`, payload);
      if (res.data?.success) {
        setNewUser({ name: "", email: "", role: "user", password: "" });
        await fetchUsers();
        alert("Usuário criado com sucesso");
      }
    } catch (err) {
      console.error("Erro ao criar usuário", err);
      alert(err.response?.data?.detail || "Erro ao criar usuário");
    }
  };

  const toggleActive = async (user) => {
    try {
      const res = await axios.put(`${API}/users/${user.id}`, { is_active: !user.is_active });
      await fetchUsers();
      alert(`Usuário ${res.data.is_active ? "desbloqueado" : "bloqueado"} com sucesso`);
    } catch (err) {
      console.error("Erro ao atualizar usuário", err);
      alert("Erro ao atualizar usuário");
    }
  };

  const changeRole = async (user, newRole) => {
    try {
      await axios.put(`${API}/users/${user.id}`, { role: newRole });
      await fetchUsers();
      alert("Perfil atualizado com sucesso");
    } catch (err) {
      console.error("Erro ao atualizar perfil", err);
      alert("Erro ao atualizar perfil");
    }
  };

  const deleteUser = async (user) => {
    if (!window.confirm(`Excluir usuário ${user.name || user.email}?`)) return;
    try {
      await axios.delete(`${API}/users/${user.id}`);
      await fetchUsers();
      alert("Usuário excluído");
    } catch (err) {
      console.error("Erro ao excluir usuário", err);
      alert("Erro ao excluir usuário");
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-gray-600">Carregando usuários...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-2xl font-bold mb-4">Administração de Usuários</h2>

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">Criar novo usuário</h3>
        <form onSubmit={createUser} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Nome"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md"
          />
          <input
            type="email"
            placeholder="Email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md"
            required
          />
          <input
            type="password"
            placeholder="Senha"
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md"
            required
          />
          <select
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="user">Usuário</option>
            <option value="admin">Administrador</option>
          </select>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            Criar usuário
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Perfil</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Criado em</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">{user.name || "-"}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={user.role || "user"}
                    onChange={(e) => changeRole(user, e.target.value)}
                    className="px-2 py-1 border rounded"
                  >
                    <option value="user">Usuário</option>
                    <option value="admin">Administrador</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.is_active ? (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Ativo</span>
                  ) : (
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">Bloqueado</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.created_at ? new Date(user.created_at).toLocaleString("pt-BR") : "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button
                    onClick={() => toggleActive(user)}
                    className={`px-3 py-1 rounded ${user.is_active ? "bg-yellow-500 hover:bg-yellow-600 text-white" : "bg-green-600 hover:bg-green-700 text-white"}`}
                  >
                    {user.is_active ? "Bloquear" : "Desbloquear"}
                  </button>
                  <button
                    onClick={() => deleteUser(user)}
                    className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white"
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Dashboard Component
const Dashboard = () => {
  const [stats, setStats] = useState({
    total_leads: 0,
    hot_leads: 0,
    warm_leads: 0,
    cold_leads: 0,
    today_leads: 0,
    human_contacted: 0,
    not_contacted: 0,
    sales_closed: 0,
    no_sale: 0
  });
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedLead, setSelectedLead] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [lastFetchAt, setLastFetchAt] = useState(null);
  const [leadsResponseStatus, setLeadsResponseStatus] = useState(null);
  const [rawLeadsType, setRawLeadsType] = useState(null);
  const [rawLeadsCount, setRawLeadsCount] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    filterLeads();
  }, [leads, activeFilter]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsResponse, leadsResponse] = await Promise.all([
        axios.get(`${API}/dashboard/stats`),
        axios.get(`${API}/leads`)
      ]);
      
      setStats(statsResponse.data);
      setLeads(Array.isArray(leadsResponse.data) ? leadsResponse.data : []);
      setLeadsResponseStatus(leadsResponse.status ?? null);
      const raw = leadsResponse.data;
      const type = Array.isArray(raw) ? 'array' : typeof raw;
      const count = Array.isArray(raw) ? raw.length : 0;
      setRawLeadsType(type);
      setRawLeadsCount(count);
      setFetchError(!Array.isArray(raw) ? 'Resposta de /leads não é um array' : null);
      setLastFetchAt(new Date().toISOString());
      setLoading(false);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      setFetchError(error?.response ? `HTTP ${error.response.status}: ${error.response.statusText || 'Erro na API'}` : (error?.message || 'Erro desconhecido'));
      setLeadsResponseStatus(error?.response?.status ?? null);
      setLastFetchAt(new Date().toISOString());
      setLoading(false);
    }
  };

  const filterLeads = () => {
    const base = Array.isArray(leads) ? leads : [];
    let filtered = base;
    
    switch (activeFilter) {
      case "hot":
        filtered = base.filter(lead => lead.interest_level === "hot");
        break;
      case "warm":
        filtered = base.filter(lead => lead.interest_level === "warm");
        break;
      case "cold":
        filtered = base.filter(lead => lead.interest_level === "cold");
        break;
      case "today":
        const today = new Date().toISOString().split('T')[0];
        filtered = base.filter(lead => lead.created_at && lead.created_at.startsWith(today));
        break;
      case "contacted":
        filtered = base.filter(lead => lead.human_contacted === true);
        break;
      case "not_contacted":
        filtered = base.filter(lead => lead.human_contacted !== true);
        break;
      case "sales_closed":
        filtered = base.filter(lead => lead.sale_closed === true);
        break;
      case "no_sale":
        filtered = base.filter(lead => lead.sale_closed !== true);
        break;
      default:
        filtered = base;
    }
    
    setFilteredLeads(Array.isArray(filtered) ? filtered : []);
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

  const toggleSaleStatus = async (leadId, currentStatus, event) => {
    event.stopPropagation(); // Evitar que o click do lead seja acionado
    
    try {
      let notes = null;
      let amount = null;
      
      if (!currentStatus) {
        notes = prompt("Observações sobre a venda (opcional):");
        const amountStr = prompt("Valor da venda (opcional, ex: 149.90):");
        if (amountStr && !isNaN(parseFloat(amountStr))) {
          amount = parseFloat(amountStr);
        }
      }
      
      await axios.put(`${API}/leads/${leadId}/sale`, {
        sale_closed: !currentStatus,
        notes: notes || undefined,
        sale_amount: amount || undefined
      });
      
      // Atualizar os dados
      await fetchDashboardData();
      
      const statusText = !currentStatus ? "marcado como venda fechada" : "desmarcado como venda";
      alert(`Lead ${statusText} com sucesso!`);
      
    } catch (error) {
      console.error("Erro ao atualizar venda:", error);
      alert("Erro ao atualizar status de venda");
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
                  {activeFilter === "sales_closed" && "Vendas Fechadas"}
                  {activeFilter === "no_sale" && "Sem Venda"}
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

        {/* Stats Cards - Primeira Linha */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
          {/* Primeira linha: Estatísticas principais */}
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

        </div>

        {/* Stats Cards - Segunda Linha */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* Segunda linha: Controle e vendas */}
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

          <div 
            className={`bg-white overflow-hidden shadow rounded-lg cursor-pointer transition-all hover:shadow-lg transform hover:scale-105 ${
              activeFilter === "sales_closed" ? "ring-2 ring-green-600 shadow-lg" : ""
            }`}
            onClick={() => handleFilterClick("sales_closed")}
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">💰</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Vendas Fechadas</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.sales_closed}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div 
            className={`bg-white overflow-hidden shadow rounded-lg cursor-pointer transition-all hover:shadow-lg transform hover:scale-105 ${
              activeFilter === "no_sale" ? "ring-2 ring-red-500 shadow-lg" : ""
            }`}
            onClick={() => handleFilterClick("no_sale")}
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">❌</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Sem Venda</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.no_sale}</dd>
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
                      {activeFilter === "sales_closed" && "Vendas Fechadas 💰"}
                      {activeFilter === "no_sale" && "Sem Venda ❌"}
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
                        <div className="flex flex-col space-y-1">
                          <button
                            onClick={(e) => toggleHumanContact(lead.id, lead.human_contacted, e)}
                            className={`text-xs px-2 py-1 rounded transition-colors ${
                              lead.human_contacted 
                                ? "bg-purple-100 text-purple-800 hover:bg-purple-200" 
                                : "bg-orange-100 text-orange-800 hover:bg-orange-200"
                            }`}
                            title={lead.human_contacted ? "Marcar como não contactado" : "Marcar como contactado"}
                          >
                            {lead.human_contacted ? "✅ Contactado" : "⏳ Não contactado"}
                          </button>
                          
                          <button
                            onClick={(e) => toggleSaleStatus(lead.id, lead.sale_closed, e)}
                            className={`text-xs px-2 py-1 rounded transition-colors ${
                              lead.sale_closed 
                                ? "bg-green-100 text-green-800 hover:bg-green-200" 
                                : "bg-red-100 text-red-800 hover:bg-red-200"
                            }`}
                            title={lead.sale_closed ? "Desmarcar venda" : "Marcar como venda fechada"}
                          >
                            {lead.sale_closed ? "💰 Venda fechada" : "❌ Sem venda"}
                          </button>
                        </div>
                        
                        {lead.human_contacted && lead.human_contact_date && (
                          <span className="text-xs text-gray-400">
                            Contactado em {formatDate(lead.human_contact_date)}
                          </span>
                        )}
                        
                        {lead.sale_closed && lead.sale_date && (
                          <span className="text-xs text-gray-400">
                            Venda: {formatDate(lead.sale_date)}
                            {lead.sale_amount && (
                              <span className="block text-green-600 font-medium">
                                R$ {lead.sale_amount.toFixed(2)}
                              </span>
                            )}
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
                        {activeFilter === "sales_closed" && "💰"}
                        {activeFilter === "no_sale" && "❌"}
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
                      {activeFilter === "sales_closed" && "Nenhuma venda fechada ainda"}
                      {activeFilter === "no_sale" && "Todas as vendas foram fechadas"}
                    </p>
                    {activeFilter !== "all" && (
                      <button
                        onClick={() => handleFilterClick("all")}
                        className="mt-3 text-sm text-blue-600 hover:text-blue-800 underline"
                      >
                        Ver todos os leads
                      </button>
                    )}

                    {/* Diagnóstico quando lista vazia no filtro ALL */}
                    {activeFilter === "all" && (
                      <div className="mt-6 text-left bg-gray-50 border border-gray-200 rounded p-4 max-w-xl mx-auto">
                        <div className="flex items-center mb-2 text-gray-700">
                          <AlertCircle className="w-4 h-4 mr-2" />
                          <span className="font-medium">Diagnóstico</span>
                        </div>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li><span className="text-gray-500">Backend:</span> {BACKEND_URL || 'não definido'}</li>
                          <li><span className="text-gray-500">Endpoint:</span> {`${API}/leads`}</li>
                          <li><span className="text-gray-500">Status /leads:</span> {leadsResponseStatus ?? '—'}</li>
                          <li><span className="text-gray-500">Tipo resposta:</span> {rawLeadsType ?? '—'}</li>
                          <li><span className="text-gray-500">Contagem recebida:</span> {rawLeadsCount ?? 0}</li>
                          <li><span className="text-gray-500">Última atualização:</span> {lastFetchAt ? new Date(lastFetchAt).toLocaleString() : '—'}</li>
                          {fetchError && (
                            <li className="text-red-600"><span className="text-gray-500">Erro:</span> {fetchError}</li>
                          )}
                        </ul>
                        {Array.isArray(leads) && leads.length > 0 && filteredLeads.length === 0 && (
                          <div className="mt-3 bg-white border border-gray-200 rounded p-3">
                            <div className="text-sm text-gray-700 font-medium mb-2">Amostra (2 primeiros itens):</div>
                            <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
                              {leads.slice(0, 2).map((l, i) => (
                                <li key={l.id || i}>
                                  {(l.name || (l.phone_number ? `Cliente ${l.phone_number.slice(-4)}` : `Lead ${i+1}`))}
                                  {" — "}
                                  {l.phone_number || 'sem telefone'}
                                  {l.created_at && (
                                    <span className="text-gray-500"> ({new Date(l.created_at).toLocaleString()})</span>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <div className="mt-3">
                          <button
                            onClick={fetchDashboardData}
                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                            disabled={loading}
                          >
                            {loading ? 'Recarregando…' : 'Recarregar'}
                          </button>
                        </div>
                      </div>
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
                  Horários disponíveis: Segunda a sexta, das 09:00 às 17:00
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
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const raw = localStorage.getItem("auth:user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem("auth:token") || "");

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [token]);

  const handleLogin = (user, tok) => {
    setCurrentUser(user);
    setToken(tok);
    localStorage.setItem("auth:user", JSON.stringify(user));
    localStorage.setItem("auth:token", tok);
    setCurrentView("dashboard");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setToken("");
    localStorage.removeItem("auth:user");
    localStorage.removeItem("auth:token");
    setCurrentView("dashboard");
  };

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={
            !currentUser ? (
              <Login onLogin={handleLogin} />
            ) : (
            <div>
              {/* Navigation */}
              <nav className="bg-blue-600 text-white p-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                  <div className="flex items-center space-x-8">
                    <h1 className="text-xl font-bold">Agente IA Dental</h1>
                    <div className="flex space-x-4">
                      {currentUser?.role === "admin" && (
                        <button
                          onClick={() => setCurrentView("admin")}
                          className={`px-3 py-2 rounded ${
                            currentView === "admin" 
                              ? "bg-blue-800" 
                              : "hover:bg-blue-700"
                          }`}
                        >
                          Administração
                        </button>
                      )}
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
                      {!currentUser ? (
                        <button
                          onClick={() => setCurrentView("login")}
                          className={`px-3 py-2 rounded ${
                            currentView === "login" 
                              ? "bg-blue-800" 
                              : "hover:bg-blue-700"
                          }`}
                        >
                          Login
                        </button>
                      ) : (
                        <button
                          onClick={handleLogout}
                          className="px-3 py-2 rounded bg-red-600 hover:bg-red-700 text-white"
                        >
                          sair
                        </button>
                      )}
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
              {currentView === "admin" && <AdminUsers currentUser={currentUser} />}
              {currentView === "login" && <Login onLogin={handleLogin} />}
            </div>
            )
          }>
            <Route index element={<Dashboard />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
// Login Component
const Login = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    // validação simples customizada
    let valid = true;
    setEmailError("");
    setPasswordError("");
    if (!email) {
      setEmailError("email obrigatorio");
      valid = false;
    }
    if (!password) {
      setPasswordError("senha obrigatoria");
      valid = false;
    }
    if (!valid) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API}/auth/login`, { email, password });
      if (res.data?.token && res.data?.user) {
        onLogin(res.data.user, res.data.token);
      } else {
        alert("usuario e senha invalido");
      }
    } catch (err) {
      if (err?.response?.status === 401) {
        alert("usuario e senha invalido");
      } else {
        alert("Erro ao fazer login");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="bg-white/90 backdrop-blur p-10 rounded-2xl shadow-xl border border-gray-200 w-full max-w-md">
        <h2 className="text-3xl font-bold mb-2 text-gray-900">Login</h2>
        <p className="text-sm text-gray-600 mb-6">Acesse com seu e-mail e senha</p>
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (e.target.value) setEmailError("");
              }}
              placeholder=" "
              aria-invalid={!!emailError}
              aria-describedby={emailError ? "email-error" : undefined}
              className={`peer w-full pl-10 pr-3 py-3 border rounded-md focus:outline-none focus:ring-2 ${
                emailError ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
              } focus:border-transparent`}
              required
            />
            <label htmlFor="login-email" className="absolute left-10 bg-white px-1 text-gray-500 transition-all duration-150 top-0 -translate-y-2.5 scale-90 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-0 peer-focus:-translate-y-2.5 peer-focus:scale-90 peer-focus:text-blue-600">
              Email
            </label>
            {emailError && (
              <div className="mt-2 flex items-center text-sm text-red-600" id="email-error">
                <AlertCircle className="h-4 w-4 mr-1" />
                <span>{emailError}</span>
              </div>
            )}
          </div>
          <div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (e.target.value) setPasswordError("");
                }}
                placeholder=" "
                aria-invalid={!!passwordError}
                aria-describedby={passwordError ? "password-error" : undefined}
                className={`peer w-full pl-10 pr-10 py-3 border rounded-md focus:outline-none focus:ring-2 ${
                  passwordError ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                } focus:border-transparent`}
                required
              />
              <label htmlFor="login-password" className="absolute left-10 bg-white px-1 text-gray-500 transition-all duration-150 top-0 -translate-y-2.5 scale-90 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-0 peer-focus:-translate-y-2.5 peer-focus:scale-90 peer-focus:text-blue-600">
                Senha
              </label>
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
              {passwordError && (
                <div className="mt-2 flex items-center text-sm text-red-600" id="password-error">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  <span>{passwordError}</span>
                </div>
              )}
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full h-10 bg-blue-600 text-white px-4 rounded-md font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
            {loading ? "Login..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};
'use client';

import React, { useEffect, useState } from 'react';
import { buscarHonorarios } from './lista';
import { Search, Plus, Calendar, ChevronDown, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import Header from '@/components/Header/header';
import ModalHonorario from "@/components/ModalHonorario/ModalHonorario";
import Image from 'next/image';
import DatePicker, { registerLocale } from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { ptBR } from 'date-fns/locale';
import toast, { Toaster } from 'react-hot-toast';

// Registrar a localização em português
registerLocale('pt-BR', ptBR);

function ListaHonorarios() {
  const [honorarios, setHonorarios] = useState([]);
  const [honorariosFiltrados, setHonorariosFiltrados] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHonorario, setSelectedHonorario] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [honorarioToDelete, setHonorarioToDelete] = useState(null);
  
  // Filtros
  const [busca, setBusca] = useState('');
  const [statusSelecionado, setStatusSelecionado] = useState('');
  const [dataInicio, setDataInicio] = useState(null);
  const [dataFim, setDataFim] = useState(null);
  const [mesReferencia, setMesReferencia] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  const formatarData = (data) => {
    if (!data) return '';
    
    try {
      const date = new Date(data);
      
      // Verificar se a data é válida
      if (isNaN(date.getTime())) {
        console.error('Data inválida:', data);
        return 'Data inválida';
      }
      
      const dia = date.getDate().toString().padStart(2, '0');
      const mes = (date.getMonth() + 1).toString().padStart(2, '0');
      const ano = date.getFullYear();
      
      const dataFormatada = `${dia}/${mes}/${ano}`;
      console.log('Data original:', data, 'Data formatada:', dataFormatada);
      
      return dataFormatada;
    } catch (error) {
      console.error('Erro ao formatar data:', error, data);
      return 'Erro na data';
    }
  };

  const calcularDiasAteVencimento = (dataVencimento) => {
    if (!dataVencimento) return 0;
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const vencimento = new Date(dataVencimento);
    vencimento.setHours(0, 0, 0, 0);
    return Math.ceil((vencimento - hoje) / (1000 * 60 * 60 * 24));
  };

  // Função para verificar e atualizar honorários atrasados
  const verificarHonorariosAtrasados = async () => {
    try {
      const response = await fetch('http://localhost:8000/honorarios/check-overdue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        console.log('Status de honorários atrasados atualizado com sucesso');
        // Recarrega a lista para mostrar as mudanças
        await fetchHonorarios();
      } else {
        console.error('Erro ao verificar honorários atrasados');
      }
    } catch (error) {
      console.error('Erro ao verificar honorários atrasados:', error);
    }
  };

  // Função para verificar status localmente (para feedback visual imediato)
  const verificarStatusLocal = (honorario) => {
    if (!honorario.dataVencimento || honorario.status?.nome === 'PAGO') {
      return honorario.status;
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const vencimento = new Date(honorario.dataVencimento);
    vencimento.setHours(0, 0, 0, 0);

    // Se passou da data de vencimento e não está pago, deve estar atrasado
    if (vencimento < hoje && honorario.status?.nome === 'PENDENTE') {
      return {
        nome: 'ATRASADO',
        cor: 'red'
      };
    }

    return honorario.status;
  };

  useEffect(() => {
    fetchHonorarios();
    
    // Verificar honorários atrasados ao carregar a página
    verificarHonorariosAtrasados();
  }, []);

  useEffect(() => {
    filtrarHonorarios();
  }, [busca, statusSelecionado, dataInicio, dataFim, mesReferencia, honorarios]);

  const filtrarHonorarios = () => {
    let resultados = [...honorarios];

    // Filtro por nome do cliente
    if (busca) {
      resultados = resultados.filter(honorario => 
        honorario.cliente?.nome?.toLowerCase().includes(busca.toLowerCase())
      );
    }

    // Filtro por status
    if (statusSelecionado) {
      resultados = resultados.filter(honorario => 
        honorario.status?.nome === statusSelecionado
      );
    }

    // Filtro por mês de referência
    if (mesReferencia) {
      resultados = resultados.filter(honorario => {
        if (!honorario.mes_referencia) return false;
        
        // Formatar o mês selecionado para YYYY-MM
        const mesSelecionado = `${mesReferencia.getFullYear()}-${String(mesReferencia.getMonth() + 1).padStart(2, '0')}`;
        
        // Comparar diretamente com o mes_referencia do honorário
        return honorario.mes_referencia === mesSelecionado;
      });
    }

    // Filtro por data
    if (dataInicio) {
      const inicio = new Date(dataInicio);
      inicio.setHours(0, 0, 0, 0);
      resultados = resultados.filter(honorario => 
        new Date(honorario.dataVencimento) >= inicio
      );
    }

    if (dataFim) {
      const fim = new Date(dataFim);
      fim.setHours(23, 59, 59, 999);
      resultados = resultados.filter(honorario => 
        new Date(honorario.dataVencimento) <= fim
      );
    }

    setHonorariosFiltrados(resultados);
  };

  // Função para calcular o total de páginas
  const totalPages = Math.ceil(honorariosFiltrados.length / itemsPerPage);

  // Função para obter os honorários da página atual
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return honorariosFiltrados.slice(startIndex, endIndex);
  };

  // Função para mudar de página
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Toast helper function
  const showToast = (type, message) => {
    const baseStyle = {
      background: '#FFFFFF',
      color: '#1F2937',
      padding: '14px 24px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
      fontSize: '14px',
      maxWidth: '380px',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      fontFamily: 'Inter, sans-serif',
      border: '1px solid #E5E7EB',
    };

    const iconProps = {
      size: 20,
      strokeWidth: 2,
      className: "flex-shrink-0"
    };

    const configs = {
      success: {
        icon: <CheckCircle2 {...iconProps} className="text-green-600" />,
        style: {
          ...baseStyle,
          borderLeft: '4px solid #059669'
        },
      },
      error: {
        icon: <XCircle {...iconProps} className="text-red-600" />,
        style: {
          ...baseStyle,
          borderLeft: '4px solid #DC2626'
        },
      },
      warning: {
        icon: <AlertCircle {...iconProps} className="text-yellow-600" />,
        style: {
          ...baseStyle,
          borderLeft: '4px solid #D97706'
        },
      }
    };

    const config = configs[type];
    toast(
      (t) => (
        <div className="flex items-center gap-4">
          {config.icon}
          <span className="font-medium">{message}</span>
        </div>
      ),
      {
        style: config.style,
        duration: 5000,
      }
    );
  };

  const fetchHonorarios = async () => {
    try {
      setIsLoading(true);
      const data = await buscarHonorarios();
      setHonorarios(data);
    } catch (error) {
      console.error('Erro ao carregar honorários:', error);
      setError('Não foi possível carregar os honorários. Tente novamente mais tarde.');
      showToast('error', 'Erro ao carregar honorários. Tente novamente mais tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveHonorario = async (formData) => {
    try {
      if (!formData.mes_referencia || typeof formData.mes_referencia !== 'string' || !formData.mes_referencia.match(/^\d{4}-(?:0[1-9]|1[0-2])$/)) {
        showToast('warning', 'Por favor, selecione um mês de referência válido no formato YYYY-MM.');
        return;
      }

      // Preparar dados para envio
      const honorarioData = {
        cliente_id: parseInt(formData.cliente_id),
        valor: parseFloat(formData.valor),
        data_vencimento: formData.data_vencimento.toISOString().split('T')[0],
        mes_referencia: formData.mes_referencia,
        descricao: formData.descricao || ''
      };

      // Adicionar campos específicos para criação ou edição
      if (selectedHonorario) {
        // Para edição, incluir status_id se foi alterado
        const statusMap = { 'PENDENTE': 1, 'PAGO': 2, 'ATRASADO': 3 };
        honorarioData.status_id = statusMap[formData.status] || 1;
      } else {
        // Para criação, usar status padrão
        honorarioData.status_id = 1;   // PENDENTE
      }

      const url = selectedHonorario 
        ? `http://localhost:8000/honorarios/${selectedHonorario.id}`
        : 'http://localhost:8000/honorarios/';
      
      const method = selectedHonorario ? 'PUT' : 'POST';

      console.log('Dados sendo enviados para a API:', {
        url,
        method,
        data: honorarioData
      });

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(honorarioData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Honorário salvo com sucesso!', result);
        await fetchHonorarios();
        showToast('success', selectedHonorario ? 'Honorário atualizado com sucesso!' : 'Honorário cadastrado com sucesso!');
        setIsModalOpen(false);
      } else {
        const errorData = await response.json();
        console.error('Erro detalhado da API:', errorData);
        let mensagemErro = 'Erro desconhecido';
        
        if (errorData.detail && Array.isArray(errorData.detail)) {
          mensagemErro = errorData.detail.map(err => err.msg || err.message || JSON.stringify(err)).join('\n');
        } else if (errorData.detail) {
          mensagemErro = errorData.detail;
        }
        
        showToast('error', `Erro ao salvar honorário: ${mensagemErro}`);
      }
    } catch (error) {
      console.error('Erro ao salvar honorário:', error);
      showToast('error', 'Erro ao salvar honorário. Verifique sua conexão e tente novamente.');
    }
  };

  const handleEdit = (honorario) => {
    setSelectedHonorario(honorario);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (honorario) => {
    setHonorarioToDelete(honorario);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!honorarioToDelete) return;

    try {
      const response = await fetch(`http://localhost:8000/honorarios/${honorarioToDelete.id}/soft-delete`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_deleted: true })
      });

      if (response.ok) {
        await fetchHonorarios(); // Recarrega a lista para refletir as mudanças
        showToast('success', 'Honorário excluído com sucesso!');
      } else {
        const errorData = await response.json();
        console.error('Erro ao excluir honorário:', errorData);
        showToast('error', 'Erro ao excluir honorário. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao excluir honorário:', error);
      showToast('error', 'Erro ao excluir honorário. Tente novamente.');
    } finally {
      setIsDeleteModalOpen(false);
      setHonorarioToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setHonorarioToDelete(null);
  };

  const handleRestore = async (id) => {
    try {
      const response = await fetch(`http://localhost:8000/honorarios/${id}/restore`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_deleted: false })
      });

      if (response.ok) {
        await fetchHonorarios(); // Recarrega a lista para refletir as mudanças
        showToast('success', 'Honorário restaurado com sucesso!');
      } else {
        const errorData = await response.json();
        console.error('Erro ao restaurar honorário:', errorData);
        showToast('error', 'Erro ao restaurar honorário. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao restaurar honorário:', error);
      showToast('error', 'Erro ao restaurar honorário. Tente novamente.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Erro! </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      PENDENTE: 'bg-yellow-100 text-yellow-800',
      PAGO: 'bg-green-100 text-green-800',
      ATRASADO: 'bg-red-100 text-red-800',
      default: 'bg-gray-100 text-gray-800'
    };
    return statusClasses[status?.nome] || statusClasses.default;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <style jsx global>{`
        @keyframes custom-enter {
          0% {
            transform: translateX(100%);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes custom-exit {
          0% {
            transform: translateX(0);
            opacity: 1;
          }
          100% {
            transform: translateX(100%);
            opacity: 0;
          }
        }

        .go2072408551 {
          transition: all 0.3s ease-in-out !important;
        }

        /* Ajuste da posição do botão de limpar do DatePicker */
        .react-datepicker__close-icon {
          right: 8px !important;
        }

        /* Estilo do botão de limpar do campo de busca */
        .search-clear-button {
          width: 24px !important;
          height: 24px !important;
          padding: 0 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          color: #1a73e8 !important;
          background: transparent !important;
          border: none !important;
          cursor: pointer !important;
          outline: none !important;
        }

        .search-clear-button:hover {
          color: #174ea6 !important;
        }

        .search-clear-button::after {
          content: none !important;
        }
      `}</style>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 5000,
          style: {
            background: 'white',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
          },
        }}
        gutter={12}
      />
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 font-inter">Honorários Cadastrados</h1>
          <button
            onClick={() => {
              setSelectedHonorario(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-inter cursor-pointer"
          >
            <Plus size={20} />
            Novo Honorário
          </button>
        </div>

        {/* Filtros */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <div className="grid grid-cols-5 gap-6">
            {/* Busca por Cliente */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">
                Buscar Cliente
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Digite o nome do cliente..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="w-full pl-10 pr-8 py-2 border rounded-lg border-gray-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-inter"
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
                {busca && (
                  <button
                    onClick={() => setBusca('')}
                    className="search-clear-button absolute right-2 top-2"
                  >
                    <XCircle size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Status */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">
                Status do Honorário
              </label>
              <div className="relative">
                <select
                  value={statusSelecionado}
                  onChange={(e) => setStatusSelecionado(e.target.value)}
                  className="w-full h-10 px-4 py-2 border rounded-lg border-gray-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none font-inter bg-white cursor-pointer"
                >
                  <option value="">Todos os status</option>
                  <option value="PENDENTE">Pendente</option>
                  <option value="PAGO">Pago</option>
                  <option value="ATRASADO">Atrasado</option>
                </select>
                <ChevronDown className="absolute right-3 top-3 text-gray-400 pointer-events-none" size={16} />
              </div>
            </div>

            {/* Mês de Referência */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">
                Mês de Referência
              </label>
              <div className="relative">
                <DatePicker
                  selected={mesReferencia}
                  onChange={(date) => setMesReferencia(date)}
                  dateFormat="MM/yyyy"
                  showMonthYearPicker
                  locale="pt-BR"
                  placeholderText="mm/aaaa"
                  className="w-full pl-10 pr-4 py-2 border rounded-lg border-gray-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-inter cursor-pointer"
                  showPopperArrow={false}
                  isClearable
                />
                <Calendar className="absolute left-3 top-2.5 text-gray-400 pointer-events-none" size={20} />
              </div>
            </div>

            {/* Data Inicial */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">
                Data Inicial do Vencimento
              </label>
              <div className="relative">
                <DatePicker
                  selected={dataInicio}
                  onChange={(date) => setDataInicio(date)}
                  dateFormat="dd/MM/yyyy"
                  locale="pt-BR"
                  placeholderText="dd/mm/aaaa"
                  className="w-full pl-10 pr-4 py-2 border rounded-lg border-gray-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-inter cursor-pointer"
                  showPopperArrow={false}
                  isClearable
                />
                <Calendar className="absolute left-3 top-2.5 text-gray-400 pointer-events-none" size={20} />
              </div>
            </div>

            {/* Data Final */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">
                Data Final do Vencimento
              </label>
              <div className="relative">
                <DatePicker
                  selected={dataFim}
                  onChange={(date) => setDataFim(date)}
                  dateFormat="dd/MM/yyyy"
                  locale="pt-BR"
                  placeholderText="dd/mm/aaaa"
                  className="w-full pl-10 pr-4 py-2 border rounded-lg border-gray-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-inter cursor-pointer"
                  showPopperArrow={false}
                  isClearable
                />
                <Calendar className="absolute left-3 top-2.5 text-gray-400 pointer-events-none" size={20} />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Header */}
          <div className="bg-blue-500 px-6 py-4">
            <div className="grid grid-cols-6 gap-4">
              <div className="text-sm font-inter text-white uppercase tracking-wider text-center">Cliente</div>
              <div className="text-sm font-inter text-white uppercase tracking-wider text-right">Valor</div>
              <div className="text-sm font-inter text-white uppercase tracking-wider text-center">Mês Ref.</div>
              <div className="text-sm font-inter text-white uppercase tracking-wider text-center">Data Vencimento</div>
              <div className="text-sm font-inter text-white uppercase tracking-wider text-center">Status</div>
              <div className="text-sm font-inter text-white uppercase tracking-wider text-center">Ações</div>
            </div>
          </div>

          {/* Tabela */}
          <div className="divide-y divide-gray-200">
            {getCurrentPageItems().length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 bg-gray-50">
                {honorarios.length === 0 ? (
                  <div className="text-gray-500 font-inter text-base text-center">
                    <div className="mb-2">Você ainda não possui honorários cadastrados</div>
                    <div>
                      Clique em <span className="text-blue-600 font-semibold">"Novo Honorário"</span> para começar!
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-500 mb-4 font-inter text-base text-center">
                    Nenhum honorário encontrado com os filtros selecionados.<br/>
                    Tente ajustar os filtros para ver mais resultados.
                  </div>
                )}
              </div>
            ) : (
              getCurrentPageItems().map((honorario, index) => {
                const statusAtual = verificarStatusLocal(honorario);
                const diasAteVencimento = calcularDiasAteVencimento(honorario.dataVencimento);
                
                // Formatar o mês de referência para MM/AAAA
                const formatarMesReferencia = (mesRef) => {
                  if (!mesRef) return '-';
                  try {
                    const [ano, mes] = mesRef.split('-');
                    return `${mes}/${ano}`;
                  } catch (error) {
                    console.error('Erro ao formatar mês de referência:', error);
                    return mesRef;
                  }
                };
                
                return (
                  <div 
                    key={honorario.id}
                    className={`grid grid-cols-6 gap-4 px-6 py-4 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    } hover:bg-gray-100 transition-colors`}
                  >
                    <div className="text-sm font-inter text-gray-900 flex flex-col justify-center">
                      <div className="font-semibold font-inter">{honorario.cliente?.nome}</div>
                    </div>
                    <div className="text-sm font-inter text-gray-900 flex flex-col justify-center">
                      <div className="font-semibold font-inter text-right">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(honorario.valor)}
                      </div>
                    </div>
                    <div className="text-sm font-inter text-gray-900 flex flex-col justify-center">
                      <div className="font-semibold font-inter text-center">
                        {formatarMesReferencia(honorario.mes_referencia)}
                      </div>
                    </div>
                    <div className="text-sm font-inter text-gray-900 flex flex-col justify-center">
                      <div className="font-semibold font-inter text-center">
                        {formatarData(honorario.dataVencimento)}
                        {statusAtual?.nome !== 'PAGO' && honorario.dataVencimento && (
                          <div className={`text-xs font-inter text-center ${
                            diasAteVencimento < 0 ? 'text-red-500' : 
                            diasAteVencimento <= 3 ? 'text-yellow-500' : 'text-gray-500'
                          }`}>
                            {diasAteVencimento < 0 
                              ? `Atrasado há ${Math.abs(diasAteVencimento)} dias`
                              : diasAteVencimento === 0 
                                ? 'Vence hoje!'
                                : `Vence em ${diasAteVencimento} dias`
                            }
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col justify-center">
                      <span className={`flex justify-center w-30 ml-15 px-2 py-1 text-xs font-semibold font-inter rounded-full ${getStatusBadgeClass(statusAtual)}`}>
                        {statusAtual?.nome || 'Status não informado'}
                      </span>
                    </div>
                    <div className="flex items-center justify-center gap-3">
                      <button 
                        onClick={() => handleEdit(honorario)}
                        className="text-blue-600 hover:text-blue-900 transition-colors cursor-pointer"
                      >
                        <Image 
                          src="/edicao-icon.svg" 
                          alt="Editar" 
                          width={35} 
                          height={35}
                        />
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(honorario)}
                        className="text-red-600 hover:text-red-900 transition-colors cursor-pointer"
                      >
                        <Image 
                          src="/deletar-icon.svg" 
                          alt="Excluir" 
                          width={35} 
                          height={35} 
                        />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Paginação */}
        <div className="mt-6 flex items-center justify-between bg-white px-6 py-4 rounded-lg shadow">
          <div className="text-sm text-gray-700 font-inter">
            Mostrando <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span> a{' '}
            <span className="font-medium">
              {Math.min(currentPage * itemsPerPage, honorariosFiltrados.length)}
            </span> de{' '}
            <span className="font-medium">{honorariosFiltrados.length}</span> honorários
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-4 py-2 border rounded-md text-sm font-inter cursor-pointer ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Anterior
            </button>
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                onClick={() => handlePageChange(index + 1)}
                className={`px-4 py-2 border rounded-md text-sm font-inter cursor-pointer ${
                  currentPage === index + 1
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {index + 1}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 border rounded-md text-sm font-inter cursor-pointer ${
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Próxima
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Confirmação de Exclusão */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
            <div className="flex items-center justify-center mb-4 text-red-600">
              <AlertCircle size={48} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2 font-inter">
              Confirmar Exclusão
            </h3>
            <p className="text-gray-600 text-center mb-6 font-inter">
              Tem certeza que deseja excluir este honorário? Esta ação não poderá ser desfeita.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 font-inter cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-inter cursor-pointer"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      <ModalHonorario
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedHonorario(null);
        }}
        honorario={selectedHonorario}
        onSave={handleSaveHonorario}
      />
    </div>
  );
}

export default ListaHonorarios;
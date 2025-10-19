'use client';

import React, { useEffect, useState } from 'react';
import { buscarPagamentos, buscarTiposPagamento, salvarPagamento, excluirPagamento } from './lista';
import { Search, Plus, XCircle, AlertCircle, CheckCircle2, Calendar } from 'lucide-react';
import Header from '@/components/Header/header';
import Image from 'next/image';
import toast, { Toaster } from 'react-hot-toast';
import ModalPagamento from "@/components/ModalPagamento/ModalPagamento";
import DatePicker, { registerLocale } from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { ptBR } from 'date-fns/locale';

// Registrar a localização em português
registerLocale('pt-BR', ptBR);

function ListaPagamentos() {
  const [pagamentos, setPagamentos] = useState([]);
  const [pagamentosFiltrados, setPagamentosFiltrados] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPagamento, setSelectedPagamento] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [pagamentoToDelete, setPagamentoToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  
  // Filtros
  const [nomeCliente, setNomeCliente] = useState('');
  const [mesReferencia, setMesReferencia] = useState(null);
  const [tipoPagamento, setTipoPagamento] = useState('');
  const [dataInicio, setDataInicio] = useState(null);
  const [dataFim, setDataFim] = useState(null);
  const [tiposPagamento, setTiposPagamento] = useState([]);

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

  useEffect(() => {
    fetchPagamentos();
    fetchTiposPagamento();
  }, []);

  useEffect(() => {
    filtrarPagamentos();
  }, [nomeCliente, mesReferencia, tipoPagamento, dataInicio, dataFim, pagamentos]);

  const formatarData = (data) => {
    if (!data) return '';
    
    try {
      // Adiciona T00:00:00 para garantir que a data seja interpretada no fuso horário local
      const date = new Date(data + 'T00:00:00');
      
      if (isNaN(date.getTime())) {
        console.error('Data inválida:', data);
        return 'Data inválida';
      }
      
      const dia = date.getDate().toString().padStart(2, '0');
      const mes = (date.getMonth() + 1).toString().padStart(2, '0');
      const ano = date.getFullYear();
      
      return `${dia}/${mes}/${ano}`;
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return 'Erro na data';
    }
  };

  const formatarValor = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const fetchPagamentos = async () => {
    try {
      setIsLoading(true);
      const data = await buscarPagamentos();
      setPagamentos(data);
      setPagamentosFiltrados(data);
    } catch (error) {
      console.error('Erro ao carregar pagamentos:', error);
      setError('Não foi possível carregar os pagamentos. Tente novamente mais tarde.');
      showToast('error', 'Erro ao carregar pagamentos. Tente novamente mais tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTiposPagamento = async () => {
    try {
      const data = await buscarTiposPagamento();
      setTiposPagamento(data);
    } catch (error) {
      console.error('Erro ao buscar tipos de pagamento:', error);
    }
  };

  const filtrarPagamentos = () => {
    let resultados = [...pagamentos];

    // Filtro por nome do cliente
    if (nomeCliente) {
      resultados = resultados.filter(pagamento => 
        pagamento.honorario?.cliente?.nome?.toLowerCase().includes(nomeCliente.toLowerCase())
      );
    }

    // Filtro por mês de referência
    if (mesReferencia) {
      resultados = resultados.filter(pagamento => {
        if (!pagamento.honorario?.mes_referencia) return false;
        
        // Formatar o mês selecionado para YYYY-MM
        const mesSelecionado = `${mesReferencia.getFullYear()}-${String(mesReferencia.getMonth() + 1).padStart(2, '0')}`;
        
        // Comparar diretamente com o mes_referencia do honorário
        return pagamento.honorario.mes_referencia === mesSelecionado;
      });
    }

    // Filtro por tipo de pagamento
    if (tipoPagamento) {
      resultados = resultados.filter(pagamento => 
        pagamento.tipo_pagamento_id === parseInt(tipoPagamento)
      );
    }

    // Filtro por data
    if (dataInicio) {
      const inicio = new Date(dataInicio);
      inicio.setHours(0, 0, 0, 0);
      resultados = resultados.filter(pagamento => 
        new Date(pagamento.data_pagamento) >= inicio
      );
    }

    if (dataFim) {
      const fim = new Date(dataFim);
      fim.setHours(23, 59, 59, 999);
      resultados = resultados.filter(pagamento => 
        new Date(pagamento.data_pagamento) <= fim
      );
    }

    setPagamentosFiltrados(resultados);
  };

  // Função para calcular o total de páginas
  const totalPages = Math.ceil(pagamentosFiltrados.length / itemsPerPage);

  // Função para obter os pagamentos da página atual
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return pagamentosFiltrados.slice(startIndex, endIndex);
  };

  // Função para mudar de página
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleEdit = (pagamento) => {
    setSelectedPagamento(pagamento);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (pagamento) => {
    setPagamentoToDelete(pagamento);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!pagamentoToDelete) return;

    try {
      await excluirPagamento(pagamentoToDelete.id);
      await fetchPagamentos();
      showToast('success', 'Pagamento excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir pagamento:', error);
      showToast('error', 'Erro ao excluir pagamento. Tente novamente.');
    } finally {
      setIsDeleteModalOpen(false);
      setPagamentoToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setPagamentoToDelete(null);
  };

  const handleSavePagamento = async (formData) => {
    try {
      // Previne múltiplas requisições simultâneas
      if (isModalOpen) {
        setIsModalOpen(false);
      }

      await salvarPagamento(formData, selectedPagamento);
      await fetchPagamentos();
      showToast('success', selectedPagamento ? 'Pagamento atualizado com sucesso!' : 'Pagamento cadastrado com sucesso!');
      setSelectedPagamento(null);
    } catch (error) {
      console.error('Erro ao salvar pagamento:', error);
      showToast('error', error.message || 'Erro ao salvar pagamento. Verifique sua conexão e tente novamente.');
      setIsModalOpen(true);
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

  return (
    <div className="min-h-screen bg-gray-50">
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
          <h1 className="text-2xl font-bold text-gray-800 font-inter">Pagamentos Cadastrados</h1>
          <button
            onClick={() => {
              setSelectedPagamento(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[#021edf] text-white rounded-lg hover:bg-blue-600 transition-colors font-inter cursor-pointer"
          >
            <Plus size={20} />
            Novo Pagamento
          </button>
        </div>

        {/* Filtros */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <div className="grid grid-cols-5 gap-6">
            {/* Nome do Cliente */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">
                Buscar Cliente
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Digite o nome do cliente..."
                  value={nomeCliente}
                  onChange={(e) => setNomeCliente(e.target.value)}
                  className="w-full pl-10 pr-8 py-2 border rounded-lg border-gray-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-inter"
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
                {nomeCliente && (
                  <button
                    onClick={() => setNomeCliente('')}
                    className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    <XCircle size={20} />
                  </button>
                )}
              </div>
            </div>

            {/* Tipo de Pagamento */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">
                Tipo de Pagamento
              </label>
              <select
                value={tipoPagamento}
                onChange={(e) => setTipoPagamento(e.target.value)}
                className="w-full h-10 px-4 py-2 border rounded-lg border-gray-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none font-inter bg-white cursor-pointer"
              >
                <option value="">Todos os tipos</option>
                {tiposPagamento.map((tipo) => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.nome}
                  </option>
                ))}
              </select>
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
                Data Inicial do Pagamento
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
                Data Final do Pagamento
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
          <div className="bg-[#F1F3F6] px-6 py-4">
            <div className="grid grid-cols-5 gap-4">
              <div className="text-sm font-semibold text-[#0B174C] tracking-wider">Cliente/Referência</div>
              <div className="text-sm font-semibold text-[#0B174C] tracking-wider text-center">Valor</div>
              <div className="text-sm font-semibold text-[#0B174C] tracking-wider text-center">Tipo Pagamento</div>
              <div className="text-sm font-semibold text-[#0B174C] tracking-wider text-center">Data Pagamento</div>
              <div className="text-sm font-semibold text-[#0B174C] tracking-wider text-center">Ações</div>
            </div>
          </div>

          {/* Tabela */}
          <div className="divide-y divide-gray-200">
            {getCurrentPageItems().length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 bg-gray-50">
                {pagamentos.length === 0 ? (
                  <div className="text-gray-500 font-inter text-base text-center">
                    <div className="mb-2">Você ainda não possui pagamentos cadastrados</div>
                    <div>
                      Clique em <span className="text-[#021edf] font-semibold">"Novo Pagamento"</span> para começar!
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-500 mb-4 font-inter text-base text-center">
                    Nenhum pagamento encontrado com os filtros selecionados.<br/>
                    Tente ajustar os filtros para ver mais resultados.
                  </div>
                )}
              </div>
            ) : (
              getCurrentPageItems().map((pagamento, index) => {
                let mesReferencia = 'Sem referência';
                if (pagamento.honorario?.mes_referencia) {
                  const [ano, mes] = pagamento.honorario.mes_referencia.split('-');
                  mesReferencia = `${mes}/${ano}`;
                }

                return (
                  <div 
                    key={pagamento.id}
                    className={`grid grid-cols-5 gap-4 px-6 py-4 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    } hover:bg-gray-100 transition-colors items-center`}
                  >
                    {/* Cliente e Referência */}
                    <div className="flex flex-col justify-center">
                      <span className="text-sm font-regular text-gray-900 truncate">
                        {pagamento.honorario?.cliente?.nome || 'Cliente não encontrado'}
                      </span>
                      <span className="text-xs text-gray-500">
                        Ref: {mesReferencia}
                      </span>
                    </div>

                    {/* Valor */}
                    <div className="flex justify-center items-center">
                      <span className="text-sm font-regular text-gray-900">
                        {formatarValor(pagamento.valor)}
                      </span>
                    </div>

                    {/* Tipo de Pagamento */}
                    <div className="flex justify-center items-center">
                      <span className="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800">
                        {pagamento.tipo_pagamento?.nome || 'Tipo não encontrado'}
                      </span>
                    </div>

                    {/* Data */}
                    <div className="flex justify-center items-center">
                      <span className="text-sm font-regular text-gray-900">
                        {formatarData(pagamento.data_pagamento)}
                      </span>
                    </div>

                    {/* Ações */}
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => handleEdit(pagamento)}
                        className="p-1.5 rounded-full hover:bg-blue-50 transition-colors"
                      >
                        <Image 
                          src="/edicao-icon.svg" 
                          alt="Editar" 
                          width={35} 
                          height={35}
                          className="text-blue-600"
                        />
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(pagamento)}
                        className="p-1.5 rounded-full hover:bg-red-50 transition-colors"
                      >
                        <Image 
                          src="/deletar-icon.svg" 
                          alt="Excluir" 
                          width={35} 
                          height={35}
                          className="text-red-600"
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
              {Math.min(currentPage * itemsPerPage, pagamentosFiltrados.length)}
            </span> de{' '}
            <span className="font-medium">{pagamentosFiltrados.length}</span> pagamentos
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
                    ? 'bg-[#021edf] text-white border-[#021edf]'
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
              Tem certeza que deseja excluir este pagamento? Esta ação não poderá ser desfeita.
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

      <ModalPagamento
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPagamento(null);
        }}
        pagamento={selectedPagamento}
        onSave={handleSavePagamento}
      />
    </div>
  );
}

export default ListaPagamentos; 
'use client';

import React, { useEffect, useState } from 'react';
import { buscarClientes } from './lista';
import { Search, Plus, XCircle, AlertCircle, CheckCircle2 } from 'lucide-react';
import Header from '@/components/Header/header';
import Image from 'next/image';
import toast, { Toaster } from 'react-hot-toast';
import ModalCliente from "@/components/ModalCliente/ModalCliente";

function ListaClientes({ triggerReload }) {
  const [clientes, setClientes] = useState([]);
  const [clientesFiltrados, setClientesFiltrados] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [clienteToDelete, setClienteToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  
  // Filtros
  const [busca, setBusca] = useState('');

  // Função para formatar o telefone no padrão brasileiro
  const formatarTelefone = (valor) => {
    if (!valor) return '';
    // Remove tudo que não é número
    const apenasNumeros = valor.replace(/\D/g, '');
    
    // Se não há números, retorna string vazia
    if (!apenasNumeros) return '';
    
    // Formata o número de acordo com a quantidade de dígitos
    if (apenasNumeros.length <= 10) {
      // Formato: (XX) XXXX-XXXX
      return apenasNumeros
        .replace(/(\d{2})/, '($1) ')
        .replace(/(\d{4})/, '$1-')
        .replace(/(\d{4})\d+?$/, '$1');
    } else {
      // Formato: (XX) XXXXX-XXXX
      return apenasNumeros
        .replace(/(\d{2})/, '($1) ')
        .replace(/(\d{5})/, '$1-')
        .replace(/(\d{4})\d+?$/, '$1');
    }
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

  useEffect(() => {
    fetchClientes();
  }, [triggerReload]);

  useEffect(() => {
    filtrarClientes();
  }, [busca, clientes]);

  const fetchClientes = async () => {
    try {
      setIsLoading(true);
      const data = await buscarClientes();
      setClientes(data);
      setClientesFiltrados(data);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      setError('Não foi possível carregar os clientes. Tente novamente mais tarde.');
      showToast('error', 'Erro ao carregar clientes. Tente novamente mais tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  const filtrarClientes = () => {
    let resultados = [...clientes];

    // Filtro por nome do cliente
    if (busca) {
      resultados = resultados.filter(cliente => 
        cliente.nome?.toLowerCase().includes(busca.toLowerCase())
      );
    }

    setClientesFiltrados(resultados);
  };

  // Função para calcular o total de páginas
  const totalPages = Math.ceil(clientesFiltrados.length / itemsPerPage);

  // Função para obter os clientes da página atual
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return clientesFiltrados.slice(startIndex, endIndex);
  };

  // Função para mudar de página
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleEdit = (cliente) => {
    setSelectedCliente(cliente);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (cliente) => {
    setClienteToDelete(cliente);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!clienteToDelete) return;

    try {
      const response = await fetch(`http://localhost:8000/clientes/${clienteToDelete.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Atualizar a lista de clientes após a exclusão lógica
        await fetchClientes();
        showToast('success', 'Cliente excluido com sucesso!');
      } else {
        const errorData = await response.json();
        console.error('Erro ao excluir cliente:', errorData);
        showToast('error', 'Erro ao excluir cliente. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
      showToast('error', 'Erro ao excluir cliente. Tente novamente.');
    } finally {
      setIsDeleteModalOpen(false);
      setClienteToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setClienteToDelete(null);
  };

  const handleSaveCliente = async (formData) => {
    try {
      if (!formData.nome) {
        showToast('warning', 'Por favor, preencha o nome do cliente.');
        return;
      }

      const url = selectedCliente 
        ? `http://localhost:8000/clientes/${selectedCliente.id}`
        : 'http://localhost:8000/clientes/';
      
      const method = selectedCliente ? 'PUT' : 'POST';

      // Previne múltiplas requisições simultâneas
      if (isModalOpen) {
        setIsModalOpen(false);
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || 'Erro ao salvar cliente');
      }

      // Só atualiza a lista e mostra mensagem de sucesso se a requisição foi bem sucedida
      await fetchClientes();
      showToast('success', selectedCliente ? 'Cliente atualizado com sucesso!' : 'Cliente cadastrado com sucesso!');
      setSelectedCliente(null);
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      showToast('error', error.message || 'Erro ao salvar cliente. Verifique sua conexão e tente novamente.');
      // Reabre o modal em caso de erro
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
          <h1 className="text-2xl font-bold text-gray-800 font-inter">Clientes Cadastrados</h1>
          <button
            onClick={() => {
              setSelectedCliente(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[#021edf] text-white rounded-lg hover:bg-blue-600 transition-colors font-inter cursor-pointer"
          >
            <Plus size={20} />
            Novo Cliente
          </button>
        </div>

        {/* Filtros */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <div className="grid grid-cols-1 gap-6">
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
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Header */}
          <div className="bg-[#F1F3F6] px-6 py-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="text-sm font-semibold text-[#0B174C] tracking-wider">Nome</div>
              <div className="text-sm font-semibold text-[#0B174C] tracking-wider">Email</div>
              <div className="text-sm font-semibold text-[#0B174C] tracking-wider">Telefone</div>
              <div className="text-sm font-semibold text-[#0B174C] tracking-wider text-center">Ações</div>
            </div>
          </div>

          {/* Tabela */}
          <div className="divide-y divide-gray-200">
            {getCurrentPageItems().length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 bg-gray-50">
                {clientes.length === 0 ? (
                  <div className="text-gray-500 font-inter text-base text-center">
                    <div className="mb-2">Você ainda não possui clientes cadastrados</div>
                    <div>
                      Clique em <span className="text-[#021edf] font-semibold">"Novo Cliente"</span> para começar!
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-500 mb-4 font-inter text-base text-center">
                    Nenhum cliente encontrado com os filtros selecionados.<br/>
                    Tente ajustar os filtros para ver mais resultados.
                  </div>
                )}
              </div>
            ) : (
              getCurrentPageItems().map((cliente, index) => (
                <div 
                  key={cliente.id}
                  className={`grid grid-cols-4 gap-4 px-6 py-4 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  } hover:bg-gray-100 transition-colors`}
                >
                  <div className="text-sm font-inter text-gray-900 flex flex-col justify-center">
                    <div className="font-regular font-inter">{cliente.nome}</div>
                  </div>
                  <div className="text-sm font-inter text-gray-900 flex flex-col justify-center">
                    <div className="font-regular font-inter">{cliente.email}</div>
                  </div>
                  <div className="text-sm font-inter text-gray-900 flex flex-col justify-center">
                    <div className="font-regular font-inter">{formatarTelefone(cliente.telefone)}</div>
                  </div>
                  <div className="flex items-center justify-center gap-3">
                    <button 
                      onClick={() => handleEdit(cliente)}
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
                      onClick={() => handleDeleteClick(cliente)}
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
              ))
            )}
          </div>
        </div>

        {/* Paginação */}
        <div className="mt-6 flex items-center justify-between bg-white px-6 py-4 rounded-lg shadow">
          <div className="text-sm text-gray-700 font-inter">
            Mostrando <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span> a{' '}
            <span className="font-medium">
              {Math.min(currentPage * itemsPerPage, clientesFiltrados.length)}
            </span> de{' '}
            <span className="font-medium">{clientesFiltrados.length}</span> clientes
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
              Tem certeza que deseja excluir este cliente? O cliente será mantido no banco de dados, mas não aparecerá mais na lista.
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

      <ModalCliente
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCliente(null);
        }}
        cliente={selectedCliente}
        onSave={handleSaveCliente}
      />
    </div>
  );
}

export default ListaClientes;

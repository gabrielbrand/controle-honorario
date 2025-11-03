import React, { useState, useEffect } from 'react';
import { X, Calendar } from 'lucide-react';
import DatePicker, { registerLocale } from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { ptBR } from 'date-fns/locale';

// Registrar a localização em português
registerLocale('pt-BR', ptBR);

export default function ModalHonorario({ isOpen, onClose, honorario = null, onSave }) {
  const [formData, setFormData] = useState({
    cliente_id: '',
    valor: '',
    data_vencimento: null,
    mes_referencia: new Date(),
    descricao: ''
  });

  const [clientes, setClientes] = useState([]);
  const [isLoadingClientes, setIsLoadingClientes] = useState(false);

  // Função para formatar valor como moeda brasileira
  const formatarMoeda = (valor) => {
    // Remove tudo que não é dígito
    const apenasNumeros = valor.replace(/\D/g, '');
    
    // Se não há números, retorna string vazia
    if (!apenasNumeros) return '';
    
    // Converte para número e divide por 100 para ter centavos
    const numero = parseFloat(apenasNumeros) / 100;
    
    // Se o número é 0, retorna string vazia
    if (numero === 0) return '';
    
    // Formata como moeda brasileira
    return numero.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Função para converter moeda formatada de volta para número
  const converterMoedaParaNumero = (valorFormatado) => {
    if (!valorFormatado) return 0;
    
    // Remove R$, espaços e pontos, substitui vírgula por ponto
    const numeroString = valorFormatado
      .replace(/R\$\s?/g, '')
      .replace(/\./g, '')
      .replace(',', '.');
    
    const numero = parseFloat(numeroString);
    return isNaN(numero) ? 0 : numero;
  };

  const handleValorChange = (e) => {
    const valorDigitado = e.target.value;
    
    // Se o usuário está apagando tudo, permite campo vazio
    if (valorDigitado === '') {
      setFormData({ ...formData, valor: '' });
      return;
    }
    
    // Aplica formatação apenas se há dígitos
    const valorFormatado = formatarMoeda(valorDigitado);
    setFormData({ ...formData, valor: valorFormatado });
  };

  // Buscar clientes quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      fetchClientes();
      
      // Se não há honorário selecionado (novo honorário), limpa os campos
        if (!honorario) {
        setFormData({
          cliente_id: '',
          valor: '',
          data_vencimento: null,
          mes_referencia: new Date(),
          descricao: ''
        });
      }
    }
  }, [isOpen, honorario]);

  useEffect(() => {
    if (honorario) {
      console.log('Carregando honorário para edição:', honorario);
      
      // Converter o mês de referência de YYYY-MM para Date
      let mesReferenciaDate = null;
      if (honorario.mes_referencia) {
        const [ano, mes] = honorario.mes_referencia.split('-');
        mesReferenciaDate = new Date(parseInt(ano), parseInt(mes) - 1, 1);
        console.log('Mês de referência convertido:', mesReferenciaDate);
      } else {
        mesReferenciaDate = new Date();
        console.log('Usando data atual como mês de referência:', mesReferenciaDate);
      }

      setFormData({
        cliente_id: honorario.cliente?.id || '',
        valor: honorario.valor ? formatarMoeda((honorario.valor * 100).toString()) : '',
        data_vencimento: honorario.dataVencimento ? new Date(honorario.dataVencimento) : null,
        mes_referencia: mesReferenciaDate,
        descricao: honorario.descricao || ''
      });
    }
  }, [honorario]);

  const fetchClientes = async () => {
    try {
      setIsLoadingClientes(true);
      const { apiGet } = await import('@/utils/api');
      const data = await apiGet('/clientes/');
      setClientes(data);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
    } finally {
      setIsLoadingClientes(false);
    }
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Preparar dados para envio
    let mesReferencia = null;
    if (formData.mes_referencia && formData.mes_referencia instanceof Date && !isNaN(formData.mes_referencia)) {
      const ano = formData.mes_referencia.getFullYear();
      const mes = String(formData.mes_referencia.getMonth() + 1).padStart(2, '0');
      mesReferencia = `${ano}-${mes}`;
    } else {
      // Se não houver mês de referência, usar o mês atual
      const hoje = new Date();
      const ano = hoje.getFullYear();
      const mes = String(hoje.getMonth() + 1).padStart(2, '0');
      mesReferencia = `${ano}-${mes}`;
    }

    const formDataParaEnvio = {
      ...formData,
      valor: converterMoedaParaNumero(formData.valor),
      mes_referencia: mesReferencia
    };
    
    console.log('Dados do formulário antes do envio:', formDataParaEnvio);
    
    onSave(formDataParaEnvio);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-2xl relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 cursor-pointer"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold text-gray-800 font-inter mb-8">
          {honorario ? 'Editar Honorário' : 'Novo Honorário'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">
              Cliente
            </label>
            <select
              value={formData.cliente_id}
              onChange={(e) => setFormData({ ...formData, cliente_id: e.target.value })}
              className="w-full p-2.5 border rounded-md focus:ring-2 border-gray-300 text-black focus:ring-blue-500 focus:border-blue-500 font-inter"
              required
              disabled={isLoadingClientes}
            >
              <option value="" className="text-gray-400">
                {isLoadingClientes ? 'Carregando clientes...' : 'Selecione um cliente'}
              </option>
              {clientes.map((cliente) => (
                <option key={cliente.id} value={cliente.id} className="text-black">
                  {cliente.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">
              Valor
            </label>
            <input
              type="text"
              placeholder="Digite um valor de honorário"
              value={formData.valor}
              onChange={handleValorChange}
              className="w-full p-2.5 border rounded-md focus:ring-2 border-gray-300 text-black focus:ring-blue-500 focus:border-blue-500 placeholder-gray-300 font-inter"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">
                Data de Vencimento
              </label>
              <div className="relative">
                <DatePicker
                  selected={formData.data_vencimento}
                  onChange={(date) => setFormData({ ...formData, data_vencimento: date })}
                  dateFormat="dd/MM/yyyy"
                  locale="pt-BR"
                  placeholderText="dd/mm/aaaa"
                  className="w-full pl-10 pr-4 py-2.5 border rounded-md focus:ring-2 border-gray-300 text-black focus:ring-blue-500 focus:border-blue-500 placeholder-gray-300 font-inter"
                  showPopperArrow={false}
                  required
                  highlightDates={[new Date()]}
                  calendarStartDay={1}
                />
                <Calendar className="absolute left-3 top-3 text-gray-400 pointer-events-none" size={20} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">
                Mês de Referência
              </label>
              <div className="relative">
                <DatePicker
                  selected={formData.mes_referencia}
                  onChange={(date) => setFormData({ ...formData, mes_referencia: date })}
                  dateFormat="MM/yyyy"
                  showMonthYearPicker
                  locale="pt-BR"
                  placeholderText="mm/aaaa"
                  className="w-full pl-10 pr-4 py-2.5 border rounded-md focus:ring-2 border-gray-300 text-black focus:ring-blue-500 focus:border-blue-500 placeholder-gray-300 font-inter"
                  showPopperArrow={false}
                  required
                />
                <Calendar className="absolute left-3 top-3 text-gray-400 pointer-events-none" size={20} />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">
              Descrição
            </label>
            <textarea
              placeholder="Digite a descrição do honorário"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              className="w-full p-2.5 border rounded-md focus:ring-2 border-gray-300 text-black focus:ring-blue-500 focus:border-blue-500 placeholder-gray-300 font-inter"
              rows="3"
            />
          </div>

          <div className="flex justify-between space-x-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-[#021edf] border border-[#021edf] rounded-md hover:bg-blue-50 font-inter cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-white bg-[#021edf] rounded-md hover:bg-blue-500 font-inter cursor-pointer"
            >
              {honorario ? 'Salvar' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 
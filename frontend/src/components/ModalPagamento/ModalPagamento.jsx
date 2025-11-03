import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import DatePicker, { registerLocale } from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { ptBR } from 'date-fns/locale';

// Registrar a localização em português
registerLocale('pt-BR', ptBR);

function ModalPagamento({ isOpen, onClose, pagamento, onSave }) {
  const [formData, setFormData] = useState({
    honorario_id: '',
    valor: '',
    tipo_pagamento_id: '',
    data_pagamento: new Date(),
    observacao: ''
  });
  const [honorarios, setHonorarios] = useState([]);
  const [tiposPagamento, setTiposPagamento] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Função para formatar valor em moeda brasileira
  const formatarMoeda = (valor) => {
    if (!valor) return '';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  // Função para limpar a formatação da moeda
  const limparFormatacaoMoeda = (valor) => {
    if (!valor) return '';
    return valor.replace(/\D/g, '');
  };

  useEffect(() => {
    if (isOpen) {
      fetchHonorarios();
      fetchTiposPagamento();
      if (pagamento) {
        // Corrigir problema de fuso horário na data
        const dataPagamento = new Date(pagamento.data_pagamento + 'T00:00:00');
        setFormData({
          honorario_id: pagamento.honorario_id,
          valor: pagamento.valor.toString(),
          tipo_pagamento_id: pagamento.tipo_pagamento_id,
          data_pagamento: dataPagamento,
          observacao: pagamento.observacao || ''
        });
      } else {
        setFormData({
          honorario_id: '',
          valor: '',
          tipo_pagamento_id: '',
          data_pagamento: new Date(),
          observacao: ''
        });
      }
      setIsSubmitting(false);
    }
  }, [isOpen, pagamento]);

  const fetchHonorarios = async () => {
    try {
      const { apiGet } = await import('@/utils/api');
      const data = await apiGet('/honorarios/');
      console.log('Honorários recebidos:', data);
      setHonorarios(data);
    } catch (error) {
      console.error('Erro ao buscar honorários:', error);
    }
  };

  const fetchTiposPagamento = async () => {
    try {
      const { apiGet } = await import('@/utils/api');
      const data = await apiGet('/tipos-pagamento/');
      setTiposPagamento(data);
    } catch (error) {
      console.error('Erro ao buscar tipos de pagamento:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      // Formatar a data para YYYY-MM-DD
      const data = formData.data_pagamento;
      const dataFormatada = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}`;

      // Converter valor para número e formatar dados
      const dadosParaEnviar = {
        ...formData,
        valor: parseFloat(formData.valor),
        honorario_id: parseInt(formData.honorario_id),
        tipo_pagamento_id: parseInt(formData.tipo_pagamento_id),
        data_pagamento: dataFormatada
      };

      await onSave(dadosParaEnviar);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar pagamento:', error);
    } finally {
      setIsSubmitting(false);
    }
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
          {pagamento ? 'Editar Pagamento' : 'Novo Pagamento'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">
              Honorário
            </label>
            <select
              value={formData.honorario_id}
              onChange={(e) => {
                const selectedHonorarioId = e.target.value;
                const selectedHonorario = honorarios.find(h => h.id === parseInt(selectedHonorarioId));
                setFormData({ 
                  ...formData, 
                  honorario_id: selectedHonorarioId,
                  valor: selectedHonorario ? selectedHonorario.valor.toString() : ''
                });
              }}
              className="w-full p-2.5 border rounded-md focus:ring-2 border-gray-300 text-black focus:ring-blue-500 focus:border-blue-500 placeholder-gray-300 font-inter"
              required
            >
              <option value="">Selecione um honorário</option>
              {honorarios.map((honorario) => {
                let mesReferencia = 'Sem referência';
                if (honorario.mes_referencia) {
                  const [ano, mes] = honorario.mes_referencia.split('-');
                  mesReferencia = `${mes}/${ano}`;
                }
                
                return (
                  <option key={honorario.id} value={honorario.id}>
                    {honorario.cliente?.nome || 'Cliente não encontrado'} - {mesReferencia} - {formatarMoeda(honorario.valor)}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">
                Valor
              </label>
              <input
                type="text"
                value={formData.honorario_id ? formatarMoeda(formData.valor) : formData.valor}
                onChange={(e) => {
                  const value = formData.honorario_id 
                    ? limparFormatacaoMoeda(e.target.value)
                    : e.target.value;
                  const numericValue = formData.honorario_id 
                    ? (parseInt(value) / 100).toString()
                    : value;
                  setFormData({ ...formData, valor: numericValue });
                }}
                className="w-full p-2.5 border rounded-md focus:ring-2 border-gray-300 text-black focus:ring-blue-500 focus:border-blue-500 placeholder-gray-300 font-inter"
                placeholder="0,00"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">
                Data do Pagamento
              </label>
              <DatePicker
                selected={formData.data_pagamento}
                onChange={(date) => setFormData({ ...formData, data_pagamento: date })}
                dateFormat="dd/MM/yyyy"
                locale="pt-BR"
                className="w-full p-2.5 border rounded-md focus:ring-2 border-gray-300 text-black focus:ring-blue-500 focus:border-blue-500 placeholder-gray-300 font-inter"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">
                Tipo de Pagamento
              </label>
              <select
                value={formData.tipo_pagamento_id}
                onChange={(e) => setFormData({ ...formData, tipo_pagamento_id: e.target.value })}
                className="w-full p-2.5 border rounded-md focus:ring-2 border-gray-300 text-black focus:ring-blue-500 focus:border-blue-500 placeholder-gray-300 font-inter"
                required
              >
                <option value="">Selecione um tipo</option>
                {tiposPagamento.map((tipo) => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">
              Observação
            </label>
            <textarea
              value={formData.observacao}
              onChange={(e) => setFormData({ ...formData, observacao: e.target.value })}
              className="w-full p-2.5 border rounded-md focus:ring-2 border-gray-300 text-black focus:ring-blue-500 focus:border-blue-500 placeholder-gray-300 font-inter resize-none"
              rows={4}
              placeholder="Digite aqui qualquer observação relevante sobre o pagamento..."
            />
          </div>

          <div className="flex justify-between space-x-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-2.5 text-[#021edf] border border-[#021edf] rounded-md hover:bg-blue-50 font-inter cursor-pointer disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 text-white bg-[#021edf] rounded-md hover:bg-blue-500 font-inter cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Salvando...' : pagamento ? 'Salvar' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ModalPagamento; 
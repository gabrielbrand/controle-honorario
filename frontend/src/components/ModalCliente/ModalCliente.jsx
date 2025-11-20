'use client';

import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

function ModalCliente({ isOpen, onClose, cliente, onSave }) {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
  });

  const [errors, setErrors] = useState({
    email: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (cliente) {
      setFormData({
        nome: cliente.nome || '',
        email: cliente.email || '',
        telefone: cliente.telefone || '',
      });
      setErrors({ email: '' });
    } else {
      setFormData({
        nome: '',
        email: '',
        telefone: '',
      });
      setErrors({ email: '' });
    }
    setIsSubmitting(false);
  }, [cliente]);

  const validarEmail = (email) => {
    if (!email) return true;
    return email.includes('@');
  };

  const formatarTelefone = (valor) => {
    const apenasNumeros = valor.replace(/\D/g, '');
    
    if (!apenasNumeros) return '';
    
    if (apenasNumeros.length <= 10) {
      return apenasNumeros
        .replace(/(\d{2})/, '($1) ')
        .replace(/(\d{4})/, '$1-')
        .replace(/(\d{4})\d+?$/, '$1');
    } else {
      return apenasNumeros
        .replace(/(\d{2})/, '($1) ')
        .replace(/(\d{5})/, '$1-')
        .replace(/(\d{4})\d+?$/, '$1');
    }
  };

  const handleTelefoneChange = (e) => {
    const valorDigitado = e.target.value;
    const telefoneFormatado = formatarTelefone(valorDigitado);
    setFormData({ ...formData, telefone: telefoneFormatado });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    if (formData.email && !validarEmail(formData.email)) {
      setErrors({ ...errors, email: 'Email inválido. Deve conter @' });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const dadosParaEnviar = {
        ...formData,
        telefone: formData.telefone.replace(/\D/g, '')
      };

      await onSave(dadosParaEnviar);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
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
          {cliente ? 'Editar Cliente' : 'Novo Cliente'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">
              Nome
            </label>
            <input
              type="text"
              placeholder="Digite o nome do cliente"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              className="w-full p-2.5 border rounded-md focus:ring-2 border-gray-300 text-black focus:ring-blue-500 focus:border-blue-500 placeholder-gray-300 font-inter"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">
                Email
              </label>
              <div>
                <input
                  type="text"
                  placeholder="Digite o email do cliente"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (errors.email) setErrors({ ...errors, email: '' });
                  }}
                  className={`w-full p-2.5 border rounded-md focus:ring-2 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  } text-black focus:ring-blue-500 focus:border-blue-500 placeholder-gray-300 font-inter`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 font-inter">
                    {errors.email}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">
                Telefone
              </label>
              <input
                type="tel"
                placeholder="Exemplo: (66) 91234-5678"
                value={formData.telefone}
                onChange={handleTelefoneChange}
                maxLength={15}
                className="w-full p-2.5 border rounded-md focus:ring-2 border-gray-300 text-black focus:ring-blue-500 focus:border-blue-500 placeholder-gray-300 font-inter"
              />
            </div>
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
              {isSubmitting ? 'Salvando...' : cliente ? 'Salvar' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ModalCliente; 
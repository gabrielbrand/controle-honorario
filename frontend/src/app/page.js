"use client"; // Certifique-se de que o componente seja um cliente se estiver usando hooks

import React from 'react';
import Link from 'next/link';

function App() {
  return (
    <div className="bg-white min-h-screen flex items-center justify-center">
      <div className="w-full max-w-4xl px-6 py-10">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h1 className="text-3xl font-semibold text-center text-gray-800 mb-6">Bem-vindo ao Controle de Honorários</h1>
          
          {/* Menu de Navegação */}
          <div className="flex justify-center space-x-6">
            <Link href="/clientes" className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
              Cadastrar Cliente
            </Link>
            <Link href="/honorarios" className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600">
              Consultar Honorários
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

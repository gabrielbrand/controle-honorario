"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header/header';
import Stats from '@/components/Dashboard/Stats';
import Charts from '@/components/Dashboard/Charts';
import RecentHonorarios from '@/components/Dashboard/RecentHonorarios';
import { format, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

function App() {
  const [stats, setStats] = useState({});
  const [revenueData, setRevenueData] = useState([]);
  const [clientData, setClientData] = useState([]);
  const [recentHonorarios, setRecentHonorarios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Buscar estatísticas gerais
      const statsResponse = await fetch('http://localhost:8000/dashboard/stats');
      const statsData = await statsResponse.json();
      setStats(statsData);

      // Buscar dados de receita dos últimos 6 meses
      const revenueResponse = await fetch('http://localhost:8000/dashboard/revenue');
      const revenueData = await revenueResponse.json();
      setRevenueData(revenueData);

      // Buscar dados de clientes
      const clientResponse = await fetch('http://localhost:8000/dashboard/clients');
      const clientData = await clientResponse.json();
      setClientData(clientData);

      // Buscar honorários recentes
      const honorariosResponse = await fetch('http://localhost:8000/honorarios/');
      const honorariosData = await honorariosResponse.json();
      setRecentHonorarios(honorariosData.slice(0, 5)); // Mostrar apenas os 5 mais recentes

    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <div className="space-x-4">
            <Link 
              href="/clientes" 
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-500 hover:bg-blue-700"
            >
              Consultar Clientes
            </Link>
            <Link 
              href="/honorarios" 
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              Consultar Honorários
            </Link>
          </div>
        </div>

        {/* Estatísticas */}
        <Stats stats={stats} />

        {/* Gráficos */}
        <Charts revenueData={revenueData} clientData={clientData} />

        {/* Honorários Recentes */}
        <RecentHonorarios honorarios={recentHonorarios} />
      </div>
    </div>
  );
}

export default App;

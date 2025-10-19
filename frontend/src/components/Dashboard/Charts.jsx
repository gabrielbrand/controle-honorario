import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';

export default function Charts({ revenueData, clientData }) {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const translateMonth = (monthStr) => {
    const [month, year] = monthStr.split('/');
    const monthTranslations = {
      'Jan': 'Jan',
      'Feb': 'Fev',
      'Mar': 'Mar',
      'Apr': 'Abr',
      'May': 'Mai',
      'Jun': 'Jun',
      'Jul': 'Jul',
      'Aug': 'Ago',
      'Sep': 'Set',
      'Oct': 'Out',
      'Nov': 'Nov',
      'Dec': 'Dez'
    };
    return `${monthTranslations[month]}/${year}`;
  };

  // Traduzir os meses nos dados
  const translatedRevenueData = revenueData?.map(item => ({
    ...item,
    month: translateMonth(item.month)
  })) || [];

  const translatedClientData = clientData?.map(item => ({
    ...item,
    month: translateMonth(item.month)
  })) || [];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-200 shadow-md">
          <p className="text-sm text-gray-600">{`Mês: ${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.name === "Valor" ? formatCurrency(entry.value) : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const axisStyle = {
    fontSize: '13px',
    fontFamily: 'Inter, sans-serif'
  };

  const legendStyle = {
    fontSize: '14px',
    fontFamily: 'Inter, sans-serif'
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {/* Gráfico de Receita */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Receita Mensal</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={translatedRevenueData}
              margin={{ top: 10, right: 30, left: 15, bottom: 5 }}
            >
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#021edf" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#021edf" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                style={axisStyle}
                dy={8}
              />
              <YAxis 
                tickFormatter={(value) => formatCurrency(value)} 
                style={axisStyle}
                dx={-5}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                name="Valor"
                stroke="#3B82F6"
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfico de Clientes */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Evolução de Clientes</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={translatedClientData}
              margin={{ top: 10, right: 30, left: 15, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                style={axisStyle}
                dy={8}
              />
              <YAxis 
                style={axisStyle}
                dx={-5}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={legendStyle}
                iconSize={10}
                margin={{ top: 0, left: 0, right: 0, bottom: 0 }}
              />
              <Bar 
                name="Clientes Ativos" 
                dataKey="active" 
                fill="#10B981"
              />
              <Bar 
                name="Novos Clientes" 
                dataKey="new" 
                fill="#021edf"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
} 
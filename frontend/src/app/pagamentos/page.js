'use client';

import React from 'react';
import TabelaPagamentos from '@/components/TabelaPagamentos';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function PagamentosPage() {
  return (
    <ProtectedRoute>
      <TabelaPagamentos />
    </ProtectedRoute>
  );
} 
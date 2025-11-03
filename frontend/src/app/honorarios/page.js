'use client';

import ListaHonorarios from '@/components/TabelaHonorarios';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function HonorariosPage() {
  return (
    <ProtectedRoute>
      <div>
        <ListaHonorarios />
      </div>
    </ProtectedRoute>
  );
}
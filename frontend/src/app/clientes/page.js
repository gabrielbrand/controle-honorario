'use client';

import { useState } from 'react';
import TabelaClientes from '@/components/TabelaClientes';

export default function ClientesPage() {
  const [reloadTrigger, setReloadTrigger] = useState(0);

  const handleClienteCriado = () => {
    setReloadTrigger((prev) => prev + 1);
  };

  return (
    <div>
      <TabelaClientes />
    </div>
  );
}
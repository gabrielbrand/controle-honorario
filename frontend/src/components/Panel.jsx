import React, { useState } from 'react';
import CadastroHonorario from './CadastrarHonorario';
import HonorarioList from './TabelaHonorarios';

const Panel = () => {
  const [honorarios, setHonorarios] = useState([]);

  const handleAddHonorario = (honorario) => {
    setHonorarios((prevHonorarios) => [...prevHonorarios, honorario]);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Painel de Cadastro de Honorários</h1>
      <CadastroHonorario onSubmit={handleAddHonorario} />
      <HonorarioList honorarios={honorarios} />
    </div>
  );
};

export default Panel;

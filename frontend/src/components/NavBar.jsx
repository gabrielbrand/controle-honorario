import React from 'react';
import Link from 'next/link';

const Navbar = () => {
  return (
    <nav className="bg-blue-600 p-4">
      <ul className="flex justify-around">
        <li>
          <Link href="/clientes" className="text-white font-bold">
            Cadastrar Cliente
          </Link>
        </li>
        <li>
          <Link href="/honorarios" className="text-white font-bold">
            Consultar Honorários
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  AlignJustify, 
  Home, 
  DollarSign, 
  UserPlus, 
  UserCog,
  CreditCard,
  LogOut 
} from 'lucide-react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      <div className="w-full h-15 bg-blue-500 flex flex-row items-center justify-start gap-2 relative z-20">
        <AlignJustify 
          className="text-white ml-5 cursor-pointer" 
          onClick={toggleMenu}
        />
        <Image 
          src="/logo.svg" 
          alt="Logo" 
          width={50} 
          height={50}
          className="ml-10 select-none"
        />
        <div className="text-white text-2xl font-bold font-inter select-none">Controle de Honorários</div>
      </div>
      
      {/* Overlay escuro */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black/30 z-10" onClick={toggleMenu}></div>
      )}

      {/* Menu lateral */}
      {isMenuOpen && (
        <div className="fixed left-0 top-15 w-70 h-[calc(100vh-60px)] bg-white z-20 shadow-lg">
          <ul className="flex flex-col gap-2 p-4">
            <li 
              className="cursor-pointer hover:bg-gray-100 p-2 rounded transition-colors text-normal text-black flex items-center gap-2 select-none"
              onClick={() => router.push('/')}
            >
              <Home size={20} /> 
              Home
            </li>
            <li 
              className="cursor-pointer hover:bg-gray-100 p-2 rounded transition-colors text-normal text-black flex items-center gap-2 select-none"
              onClick={() => router.push('/honorarios')}
            >
              <DollarSign size={20} /> 
              Honorários
            </li>
            
            <li 
              className="cursor-pointer hover:bg-gray-100 p-2 rounded transition-colors text-normal text-black flex items-center gap-2 select-none"
              onClick={() => router.push('/pagamentos')}
            >
              <CreditCard size={20} /> 
              Pagamentos
            </li>
            
            <li 
              className="cursor-pointer hover:bg-gray-100 p-2 rounded transition-colors text-normal text-black flex items-center gap-2 select-none"
              onClick={() => router.push('/clientes')}
            >
              <UserPlus size={20} /> 
              Clientes
            </li>
            
            <li 
              className="cursor-pointer hover:bg-gray-100 p-2 rounded transition-colors text-normal text-black flex items-center gap-2 select-none"
              onClick={() => router.push('/contadores')}
            >
              <UserCog size={20} /> 
              Contadores
            </li>
            
            <li className="cursor-pointer hover:bg-gray-100 p-2 rounded transition-colors text-normal text-red-500 flex items-center gap-2 mt-auto select-none">
              <LogOut size={20} className="text-red-500" /> 
              Sair
            </li>
          </ul>
        </div>
      )}
    </>
  );
} 
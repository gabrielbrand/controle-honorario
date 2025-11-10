import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  AlignJustify, 
  Home, 
  DollarSign, 
  UserPlus, 
  CreditCard,
  LogOut,
  Sun,
  CloudSun,
  Moon
} from 'lucide-react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  let myDate = new Date();
    let hours = myDate.getHours();

  return (
    <>
      <div className="w-full h-15 bg-white shadow-sm flex flex-row items-center justify-start gap-2 relative z-20">
        <AlignJustify 
          className="text-gray-800 ml-5 cursor-pointer" 
          onClick={toggleMenu}
        />
        <div className="text-gray-800 text-2xl font-bold font-inter ml-10">Controle de Honorários</div>
        <div 
          className="flex text-gray-800 text-md font-bold font-inter ml-10 items-center gap-2 absolute right-10">
            {
              hours < 12 ? (
                <>
                  <Sun className="text-yellow-500" size={24} />
                  <span>Bom dia, {user.nome}!</span>
                </>
              ) : hours >= 12 && hours <= 17 ? (
                <>
                  <CloudSun className="text-yellow-600" size={24} />
                  <span>Boa tarde, {user.nome}!</span>
                </>
              ) : (
                <>
                  <Moon className="text-blue-800" size={24} />
                  <span>Boa noite, {user.nome}!</span>
                </>
              )
            }
        </div>
      </div>

      
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black/30 z-10" onClick={toggleMenu}></div>
      )}

      {isMenuOpen && (
        <div className="fixed left-0 top-15 w-70 h-[calc(100vh-60px)] bg-white z-20 shadow-lg">
          <ul className="flex flex-col gap-2 p-4">
            <li 
              className="cursor-pointer hover:bg-gray-100 p-2 rounded transition-colors text-normal text-black flex items-center gap-2 select-none"
              onClick={() => router.push('/dashboard')}
            >
              <Home size={20} /> 
              Home
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
              onClick={() => {
                setIsMenuOpen(false);
                router.push('/');
              }}
            >
              <LogOut size={20} /> 
              Sair
            </li>
          </ul>
        </div>
      )}
    </>
  );
} 
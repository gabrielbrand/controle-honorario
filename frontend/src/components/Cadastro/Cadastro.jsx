'use client';

import React, { useState } from 'react';
import { FileChartColumn, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const Cadastro = () => {
    const router = useRouter();
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        // Validações
        if (!nome || !email || !password || !confirmPassword) {
            setError('Por favor, preencha todos os campos.');
            return;
        }
        
        if (password !== confirmPassword) {
            setError('As senhas digitadas não conferem.');
            return;
        }
        
        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres.');
            return;
        }
        
        if (password.length > 72) {
            setError('A senha deve ter no máximo 72 caracteres.');
            return;
        }
        
        try {
            setIsLoading(true);
            
            const response = await fetch('http://localhost:8000/auth/cadastro', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nome,
                    email,
                    senha: password
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                // Se for erro da API, mostrar a mensagem
                const errorMessage = data.detail || 'Erro ao criar conta. Tente novamente.';
                setError(errorMessage);
                return;
            }

            // Sucesso - redirecionar para login
            alert('Conta criada com sucesso! Você será redirecionado para a página de login.');
            router.push('/');
            
        } catch (error) {
            console.error('Erro ao cadastrar:', error);
            setError('Erro ao conectar com o servidor. Verifique sua conexão e tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 px-4">
            <div className="w-full max-w-md">
                {/* Card de Cadastro */}
                <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
                    {/* Logo/Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
                            <UserPlus className="text-white" size={32} />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Criar Conta
                        </h1>
                        <p className="text-gray-600">
                            Cadastre-se para começar
                        </p>
                    </div>

                    {/* Mensagem de erro */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {/* Formulário */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Campo Nome */}
                        <div>
                            <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-2">
                                Nome Completo
                            </label>
                            <div className="relative">
                                <input
                                    id="nome"
                                    type="text"
                                    value={nome}
                                    onChange={(e) => setNome(e.target.value)}
                                    placeholder="Seu nome completo"
                                    required
                                    className="block w-full pl-5 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900 placeholder-gray-400"
                                />
                            </div>
                        </div>

                        {/* Campo Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="seu@email.com"
                                    required
                                    className="block w-full pl-5 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900 placeholder-gray-400"
                                />
                            </div>
                        </div>

                        {/* Campo Senha */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Senha
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                    maxLength={72}
                                    className="block w-full pl-5 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900 placeholder-gray-400"
                                />
                            </div>
                        </div>

                        {/* Campo Confirmar Senha */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                Confirmar Senha
                            </label>
                            <div className="relative">
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                    maxLength={72}
                                    className="block w-full pl-5 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900 placeholder-gray-400"
                                />
                            </div>
                        </div>

                        {/* Botão de Cadastro */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                        >
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                                    Criando conta...
                                </>
                            ) : (
                                'Criar Conta'
                            )}
                        </button>
                    </form>

                    {/* Link para Login */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Já tem uma conta?{' '}
                            <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium">
                                Fazer login
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cadastro;


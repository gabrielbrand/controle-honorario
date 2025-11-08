'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error('Erro ao carregar usuário:', error);
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await fetch('http://localhost:8000/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, senha: password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || 'Erro ao fazer login');
            }

            const userData = {
                id: data.id,
                nome: data.nome,
                email: data.email,
            };

            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);

            return { success: true, data: userData };
        } catch (error) {
            console.error('Erro no login:', error);
            return { success: false, error: error.message };
        }
    };

    const logout = () => {
        localStorage.removeItem('user');
        setUser(null);
        router.push('/');
    };

    const isAuthenticated = () => {
        return user !== null;
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated, loading }}>
            {children}
        </AuthContext.Provider>
    );
};


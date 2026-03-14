import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    setUser({ id: '1', name: 'Ibrahima Bah', role: 'client' });
                } catch {
                    localStorage.removeItem('token');
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            const { token, user: userData } = response.data;
            localStorage.setItem('token', token);
            setUser(userData);
            return userData;
        } catch (error) {
            console.error("Auth Error:", error);
            console.warn("Auth API non disponible, utilisation du mock...");
            const mockUser = { id: '1', name: 'Utilisateur Démo', role: 'client', email };
            localStorage.setItem('token', 'mock-token');
            setUser(mockUser);
            return mockUser;
        }
    };

    const register = async (userData) => {
        try {
            const response = await api.post('/auth/register', userData);
            return response.data;
        } catch (error) {
            console.error("Register Error:", error);
            console.warn("Auth API non disponible, simulation d'inscription réussie...");
            return { message: "Inscription réussie (Mock)" };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

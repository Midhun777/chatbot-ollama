import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const refreshUser = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setUser(null);
            setLoading(false);
            return;
        }
        try {
            const res = await api.get('/auth/me');
            setUser({ ...res.data, token });
        } catch (error) {
            console.error("Failed to refresh user profile", error);
            // If token is invalid/expired
            if (error.response?.status === 401) {
                logout();
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshUser();
    }, []);

    const login = async (email, password) => {
        try {
            const formData = new FormData();
            formData.append('username', email); // OAuth2 expects username
            formData.append('password', password);

            const res = await api.post('/auth/login', formData);
            const { access_token } = res.data;

            // Decode JWT payload to get basic info
            const payload = JSON.parse(atob(access_token.split('.')[1]));

            localStorage.setItem('token', access_token);
            localStorage.setItem('role', payload.role);
            localStorage.setItem('status', payload.status);
            localStorage.setItem('user_id', payload.sub);

            // Fetch full profile info for global state
            await refreshUser();
            return true;
        } catch (error) {
            console.error("Login failed", error);
            return false;
        }
    };

    const register = async (userData) => {
        try {
            const res = await api.post('/auth/register', userData);
            const { access_token } = res.data;

            const payload = JSON.parse(atob(access_token.split('.')[1]));

            localStorage.setItem('token', access_token);
            localStorage.setItem('role', payload.role);
            localStorage.setItem('status', payload.status);
            localStorage.setItem('user_id', payload.sub);

            // Fetch full profile info
            await refreshUser();
            return { success: true };
        } catch (error) {
            console.error("Registration failed", error);
            const errorMsg = error.response?.data?.detail || "Registration failed. Please try again.";
            return { success: false, error: errorMsg };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('status');
        localStorage.removeItem('user_id');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, refreshUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

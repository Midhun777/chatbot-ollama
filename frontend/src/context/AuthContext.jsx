import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if token exists on load
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        const status = localStorage.getItem('status');
        const id = localStorage.getItem('user_id');

        if (token && role) {
            setUser({ id, token, role, status });
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const formData = new FormData();
            formData.append('username', email); // OAuth2 expects username
            formData.append('password', password);

            const res = await api.post('/auth/login', formData);
            const { access_token } = res.data;

            // Decode JWT payload
            const payload = JSON.parse(atob(access_token.split('.')[1]));

            localStorage.setItem('token', access_token);
            localStorage.setItem('role', payload.role);
            localStorage.setItem('status', payload.status);
            localStorage.setItem('user_id', payload.sub);

            setUser({ id: payload.sub, token: access_token, role: payload.role, status: payload.status });
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

            setUser({ id: payload.sub, token: access_token, role: payload.role, status: payload.status });
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
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

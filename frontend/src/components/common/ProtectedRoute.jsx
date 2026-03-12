import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

export const ProtectedRoute = ({ allowedRoles }) => {
    const { user, loading } = useContext(AuthContext);

    if (loading) {
        return <div>Loading...</div>; // Could replace with spinner component
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // If logged in but unauthorized, return to basic dashboard
        return <Navigate to={`/${user.role}/dashboard`} replace />;
    }

    return <Outlet />;
};

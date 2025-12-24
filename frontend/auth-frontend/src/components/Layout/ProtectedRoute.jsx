import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ authToken, children }) => {
  // Se não houver token, redireciona para a página de login
  if (!authToken) {
    return <Navigate to="/login" replace />;
  }

  // Se houver token, renderiza o conteúdo protegido (os componentes filhos)
  return children;
};

export default ProtectedRoute;
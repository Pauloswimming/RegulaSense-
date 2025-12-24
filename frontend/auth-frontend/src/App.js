import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Layout from './components/Layout/Layout.jsx';
import ProtectedRoute from './components/Layout/ProtectedRoute.jsx'; 
import Login from './components/Login/Login.jsx';
import Home from './components/Home/Home.jsx';
import Solicitacoes from './components/Solicitacoes/Solicitacoes.jsx';
import NovaSolicitacao from './components/NovaSolicitacao/NovaSolicitacao.jsx';
import Justificativa from './components/Justificativa/Justificativa.jsx';
import RegulaFlow from './components/RegulaFlow/RegulaFlow';
import Relatorios from './components/Relatorios/Relatorios.jsx';
import SolicitacaoDetalhe from './components/SolicitacaoDetalhe/SolicitacaoDetalhe.jsx'; 


function App() {
    const [authToken, setAuthToken] = useState(localStorage.getItem('accessToken'));
    const [username, setUsername] = useState('');

    useEffect(() => {
    }, [authToken]);

    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route path="/login" element={<Login setAuthToken={setAuthToken} setUsername={setUsername} />} />
                    <Route 
                        path="/" 
                        element={
                            <ProtectedRoute authToken={authToken}>
                                <Layout username={username} />
                            </ProtectedRoute>
                        }
                    >
                        <Route path="/" element={<Home />} />
                        <Route path="/home" element={<Home />} />
                        <Route path="/solicitacoes" element={<Solicitacoes />} />
                        <Route path="/nova-solicitacao" element={<NovaSolicitacao />} />
                        <Route path="/regulaflow" element={<RegulaFlow />} />
                        <Route path="/justificativa" element={<Justificativa/>} />
                        <Route path="/relatorios" element={<Relatorios/>} />
                        <Route path="/fillsense/:id" element={<SolicitacaoDetalhe />} />
                    </Route>
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;

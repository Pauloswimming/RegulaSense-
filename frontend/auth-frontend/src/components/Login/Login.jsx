import React, { useState } from 'react';
import apiClient from '../../api/apiClient';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login({ setAuthToken, setUsername}) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await apiClient.post('api/auth/login/', {
                email,
                password,
            });

            if (response.status === 200) {
                localStorage.setItem('accessToken', response.data.access);
                localStorage.setItem('refreshToken', response.data.refresh);
                setAuthToken(response.data.access);
                setUsername(response.data.username);
                navigate('/home');
            } else {
                setError('Ocorreu um erro inesperado. Tente novamente.');
            }
        } catch (err) {
            // Lógica de feedback ousada e específica
            let errorMessage = '';
            
            if (err.response) {
                // Erro de comunicação com o servidor (4xx, 5xx)
                if (err.response.status === 401) {
                    errorMessage = 'Acesso Negado. Email ou senha estão incorretos.';
                } else if (err.response.status === 400) {
                    errorMessage = 'Dados Incompletos. Por favor, preencha todos os campos.';
                } else {
                    errorMessage = `Falha de Serviço (${err.response.status}). Tente novamente mais tarde.`;
                }
            } else if (err.request) {
                // Erro de rede (Backend não está rodando ou não foi encontrado)
                errorMessage = 'Servidor Indisponível. Verifique sua conexão ou se o Backend está ativo (porta 8000).';
            } else {
                // Outro erro de requisição (JavaScript)
                errorMessage = 'Erro Local. Não foi possível enviar a requisição de login.';
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="logo-placeholder">
                <img src="./RegulaSense.png" alt="RegulaSense Logo" />
            </div>
            <h2>Acesse sua conta</h2>
            <form onSubmit={handleSubmit}>
                <div className="input-group">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="seu@email.com"
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="password">Senha</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="********"
                    />
                </div>
                <div className="links-container">
                    <span className="create-account-link-placeholder"></span>
                </div>
                <button type="submit" className="login-button" disabled={loading}>
                    {loading ? 'Entrando...' : 'Entrar'}
                </button>
                {error && <p className="error-message">{error}</p>}
            </form>
        </div>
    );
}

export default Login;
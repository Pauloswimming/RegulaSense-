// src/components/Register/Register.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Register.css'; // Usaremos um CSS próprio para ele

function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }
        setError('');
        setLoading(true);
        // Lógica para registrar o usuário (chamada de API) viria aqui
        console.log("Tentando registrar com:", email);
        // Simulação de chamada de API
        setTimeout(() => {
            console.log("Registro bem-sucedido!");
            setLoading(false);
            navigate('/login'); // Redireciona para o login após o registro
        }, 1500);
    };

    return (
        <div className="register-container">
            <h2>Crie sua conta</h2>
            <p>É rápido e fácil.</p>
            <form onSubmit={handleSubmit}>
                <div className="input-group">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
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
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="Crie uma senha forte"
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="confirmPassword">Confirmar Senha</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        placeholder="Confirme sua senha"
                    />
                </div>
                <button type="submit" className="register-button" disabled={loading}>
                    {loading ? 'Criando...' : 'Criar conta'}
                </button>
                {error && <p className="error-message">{error}</p>}
            </form>
            <div className="login-link">
                Já tem uma conta? <Link to="/login">Faça login</Link>
            </div>
        </div>
    );
}

export default Register;

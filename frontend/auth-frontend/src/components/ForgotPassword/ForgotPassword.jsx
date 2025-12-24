// src/components/ForgotPassword/ForgotPassword.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Para voltar à página de login
import './ForgotPassword.css'; // Estilo para este componente

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);

        try {
            // Aqui você faria uma chamada API para um endpoint do seu backend
            // para solicitar a redefinição de senha, enviando o email.
            // Ex: await axios.post('http://localhost:8000/api/auth/reset-password/', { email });
            // Por enquanto, é apenas uma simulação.

            console.log(`Solicitação de redefinição para: ${email}`);
            // Simula um delay de rede
            await new Promise(resolve => setTimeout(resolve, 1500));
            setMessage('Se um email cadastrado for encontrado, instruções para redefinição de senha foram enviadas.');
        } catch (err) {
            console.error('Erro ao solicitar redefinição:', err);
            setError('Ocorreu um erro ao processar sua solicitação. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="forgot-password-container">
            <div className="forgot-password-card">
                <h2>Esqueceu sua Senha?</h2>
                <p>Por favor, insira seu email cadastrado para receber um link de redefinição de senha.</p>
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
                    <button type="submit" className="forgot-password-button" disabled={loading}>
                        {loading ? 'Enviando...' : 'Redefinir Senha'}
                    </button>
                    {message && <p className="success-message">{message}</p>}
                    {error && <p className="error-message">{error}</p>}
                </form>
                <div className="back-to-login">
                    <Link to="/login">Voltar para o Login</Link>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;

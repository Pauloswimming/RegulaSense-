import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import './Solicitacoes.css';

function Solicitacoes() {
    const [solicitacoes, setSolicitacoes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchSolicitacoes = async () => {
        try {
            const response = await apiClient.get('api/fillsense/solicitacoes/');
            setSolicitacoes(response.data);
            setLoading(false);
        } catch (err) {
            setError('Não foi possível carregar as solicitações.');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSolicitacoes();
    }, []);

    return (
        <>
        <section className="module-hero">
            <h1><i className="fas fa-magic"></i> FillSense: Histórico de Solicitações</h1>
            <p>Gerencie o fluxo de solicitações de devoluções. Acompanhe o status e as etapas de aprovação para garantir a conformidade regulatória.</p>
            <div className="action-buttons">
                <Link to="/nova-solicitacao" className="action-button"><i className="fa-solid fa-plus"></i> Nova Solicitação</Link>
            </div>
        </section>

        <section className="history-section">
            <h2>Suas Solicitações Recentes</h2>
            {loading && <p className="loading-spinner">Carregando...</p>}
            {error && <p className="error-message-display">{error}</p>}
            {!loading && !error && solicitacoes.length === 0 && <p>Nenhuma solicitação encontrada.</p>}
            {!loading && !error && solicitacoes.length > 0 && (
                <div className="history-table-container">
                    <table className="history-table">
                        <thead>
                            <tr>
                                <th>Protocolo</th>
                                <th>Procedimento</th>
                                <th>Data da Solicitação</th>
                                <th>Status</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {solicitacoes.map((solicitacao) => (
                                <tr key={solicitacao.id}>
                                    <td>{solicitacao.protocolo}</td>
                                    <td>{solicitacao.procedimento_label}</td>
                                    <td>{solicitacao.data_criacao_display}</td>
                                    <td className={`status-${solicitacao.status.toLowerCase()}`}>{solicitacao.status_display}</td>
                                    <td><Link to={`/fillsense/${solicitacao.id}`} className="detail-button"><i className="fa-solid fa-eye"></i></Link></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
        </>
    );
}

export default Solicitacoes;
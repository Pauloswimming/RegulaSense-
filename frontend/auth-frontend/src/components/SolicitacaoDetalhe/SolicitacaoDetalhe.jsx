import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import './SolicitacaoDetalhe.css';

function SolicitacaoDetalhe({ user }) {
    const { id } = useParams();
    const navigate = useNavigate();

    const [solicitacao, setSolicitacao] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDetalhes = async () => {
            setLoading(true);
            setError(null);
            
            // Simulação de dados (Caso a API falhe ou não encontre o item)
            const MOCK_DATA = { 
                protocolo: `FS-2025-${id}`, 
                procedimento: "Glomerulonefrite Crônica", 
                status: "EM_EDICAO",
                data_criacao: "2025-09-01T10:00:00Z",
                nome: "Paciente Teste Mock",
                cpf: "123.456.789-00",
                justificativa: "Justificativa final simulada gerada pela IA e salva.",
                metadados_ia: {
                    descricao_medica_inicial: "O paciente apresenta sinais renais graves conforme notas técnicas."
                }
            };
            
            try {
                // Requisição GET para o endpoint detalhado: /api/fillsense/solicitacoes/{id}/
                const response = await apiClient.get(`api/fillsense/solicitacoes/${id}/`);
                
                // Se a API retornar dados válidos, use-os
                setSolicitacao(response.data); 

            } catch (err) {
                // Se o Backend falhar (erro 404, 500, ou de rede), usamos o mock data
                let errorMsg = 'Não foi possível carregar os detalhes da solicitação. Exibindo dados de simulação.';
                if (err.response && err.response.status === 404) {
                    errorMsg = `Solicitação de ID ${id} não encontrada.`;
                } else if (err.request) {
                    errorMsg = 'Erro de conexão com o servidor. Verifique o Backend.';
                }
                setError(errorMsg);
                setSolicitacao(MOCK_DATA); // Use mock data para que o layout seja testável
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchDetalhes();
        } else {
            setError('ID da solicitação não fornecido na URL.');
            setLoading(false);
        }
    }, [id]);

    if (loading) {
        return (
            <div className="solicitacao-detalhe-layout">
                <div className="loading-container">
                    <i className="fas fa-spinner fa-spin text-2xl"></i>
                    <p>Carregando detalhes da solicitação {id}...</p>
                </div>
            </div>
        );
    }

    if (error && !solicitacao) {
        return (
            <div className="solicitacao-detalhe-layout">
                <div className="error-container bg-red-100 p-6 rounded-lg text-red-700">
                    <i className="fas fa-exclamation-triangle mr-2"></i>
                    {error}
                    <button onClick={() => navigate('/solicitacoes')} className="mt-4 text-blue-600 underline block">Voltar para a lista</button>
                </div>
            </div>
        );
    }

    const formatDate = (dateString) => {
        if (!dateString) return '—';
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    };

    const statusClass = solicitacao.status ? solicitacao.status.toLowerCase().replace(/_/g, '-') : 'status-default';
    
    // Função para o futuro botão de edição
    const handleEditJustificativa = () => {
        alert("Funcionalidade de edição será implementada aqui.");
    };

    return (
        <div className="solicitacao-detalhe-layout">
            <main className="detalhe-main">
                <section className="detalhe-hero">
                    <h1 className="text-3xl font-bold mb-1 text-gray-800">Detalhes da Solicitação</h1>
                    <p className="text-xl text-gray-600 mb-6">Protocolo: <strong>{solicitacao.protocolo || '—'}</strong></p>
                </section>

                <div className="detalhe-grid">
                    
                    {/* Coluna 1: Dados Principais e Status */}
                    <div className="card-detalhe large-field">
                        <h2>Informações Básicas</h2>
                        <div className="info-item">
                            <strong>Procedimento:</strong> <span>{solicitacao.procedimento}</span>
                        </div>
                        <div className="info-item">
                            <strong>Data de Criação:</strong> <span>{formatDate(solicitacao.data_criacao)}</span>
                        </div>
                         <div className="info-item status-info">
                            <strong>Status:</strong> <span className={`status-tag ${statusClass}`}>{solicitacao.status}</span>
                        </div>
                        <div className="form-actions mt-6">
                             <button onClick={() => navigate('/solicitacoes')} className="cancel-button"><i className="fas fa-arrow-left"></i> Voltar à Lista</button>
                             <button onClick={handleEditJustificativa} className="edit-button"><i className="fas fa-pen"></i> Editar Justificativa</button>
                        </div>
                    </div>

                    {/* Coluna 2: Descrição Médica (Original do Formulário) */}
                    <div className="card-detalhe large-field">
                         <h2>Descrição Médica Original</h2>
                        <textarea readOnly value={solicitacao.descricao_medica || 'Descrição médica inicial não fornecida.'} rows="8"></textarea>
                    </div>

                    {/* Coluna 3: Justificativa (Texto Final Gerado) */}
                    <div className="card-detalhe large-field">
                         <h2>Justificativa Final (Gerada)</h2>
                         <textarea readOnly value={solicitacao.justificativa || 'Justificativa ainda não gerada ou salva.'} rows="10"></textarea>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default SolicitacaoDetalhe;

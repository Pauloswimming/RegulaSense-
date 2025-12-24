import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient'; 
import './RegulaFlow.css'; // Importação do CSS

function RegulaFlow() {
    const [devolucoes, setDevolucoes] = useState([]);
    const [totalRegistros, setTotalRegistros] = useState(0);
    const [totalPaginas, setTotalPaginas] = useState(0)
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    
    // Estado para os filtros
    const [filters, setFilters] = useState({
        usuario: '',
        profissional: '',
        dataSolicitacaoInicio: '',
        dataSolicitacaoFim: '',
        dataDevolucaoInicio: '',
        dataDevolucaoFim: ''
    });

    const LIMIT = 50; // linhas por página

    const fetchDevolucoes = async () => {
        setLoading(true);
        setError(null);
        try {
            // Montagem dos query params
            const params = {
                page: page,
                limit: LIMIT,
                usuario: filters.usuario || undefined,
                profissional_solicitante: filters.profissional || undefined,
                data_solicitacao_inicio: filters.dataSolicitacaoInicio || undefined,
                data_solicitacao_fim: filters.dataSolicitacaoFim || undefined,
                data_devolucao_inicio: filters.dataDevolucaoInicio || undefined,
                data_devolucao_fim: filters.dataDevolucaoFim || undefined,
            };

            const response = await apiClient.get('/api/devolucoes', { params });
            setDevolucoes(response.data.devolucoes);
            setTotalRegistros(response.data.pagination.total_registros);
            setTotalPaginas(response.data.pagination.total_paginas);
        } catch (err) {
            console.error(err);
            if (err.response) {
                const status = err.response.status;
                if (status === 404) {
                    setError('Desculpe, não encontramos nenhum registro de devolução no momento.');
                } else if (status === 500) {
                    setError('Desculpe, ocorreu um erro interno em nossos servidores. Tente novamente mais tarde.');
                } else if (status === 501) {
                    setError('Desculpe, esta funcionalidade ainda não foi totalmente implementada no servidor.');
                } else {
                    setError(`Desculpe, ocorreu um erro inesperado (Código: ${status}). Por favor, contate o suporte.`);
                }
            } else {
                setError('Desculpe, não foi possível conectar ao servidor. Verifique sua conexão com a internet.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Efeito para carregar dados ao mudar a página
    useEffect(() => {
        fetchDevolucoes();
    }, [page]); 

    // Handler para o formulário de filtros
    const handleFilterSubmit = (e) => {
        e.preventDefault();
        setPage(1); // Retorna à primeira página ao aplicar novos filtros
        fetchDevolucoes();
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    // Função utilitária para formatar valores nulos
    const formatValue = (val) => {
        if (val === null || val === undefined || val === '') return "Não informado";
        return val;
    };

    // Função utilitária para formatar datas
    const formatDate = (dateString) => {
        if (!dateString) return "Não informado";
        try {
            // Tenta converter. Se for inválido, retorna a string original ou trata o erro
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString;
            return date.toLocaleDateString('pt-BR');
        } catch (e) {
            return dateString;
        }
    };

    return (
        <div className="regula-flow-container">
            {/* Header da Página */}
            <section className="module-hero">
                <h1><i className="fas fa-redo-alt"></i> RegulaFlow: Devoluções</h1>
                <p>Gerenciamento e monitoramento de solicitações de devolução e respostas.</p>
            </section>

            {/* Seção de Filtros */}
            <section className="filter-section">
                <form onSubmit={handleFilterSubmit} className="filter-form">
                    <div className="filter-group">
                        <label>Usuário</label>
                        <input 
                            type="text" 
                            name="usuario" 
                            value={filters.usuario} 
                            onChange={handleFilterChange} 
                            placeholder="Buscar por usuário..." 
                        />
                    </div>
                    <div className="filter-group">
                        <label>Profissional Solicitante</label>
                        <input 
                            type="text" 
                            name="profissional" 
                            value={filters.profissional} 
                            onChange={handleFilterChange} 
                            placeholder="Buscar por profissional..." 
                        />
                    </div>
                    <div className="filter-group">
                        <label>Data Solicitação</label>
                        <div className="date-range">
                            <input type="date" name="dataSolicitacaoInicio" value={filters.dataSolicitacaoInicio} onChange={handleFilterChange} />
                            <span>a</span>
                            <input type="date" name="dataSolicitacaoFim" value={filters.dataSolicitacaoFim} onChange={handleFilterChange} />
                        </div>
                    </div>
                    <div className="filter-group">
                        <label>Data Devolução</label>
                        <div className="date-range">
                            <input type="date" name="dataDevolucaoInicio" value={filters.dataDevolucaoInicio} onChange={handleFilterChange} />
                            <span>a</span>
                            <input type="date" name="dataDevolucaoFim" value={filters.dataDevolucaoFim} onChange={handleFilterChange} />
                        </div>
                    </div>
                    <button type="submit" className="filter-button"><i className="fas fa-search"></i> Filtrar</button>
                </form>
            </section>

            {/* Área de Dados */}
            <section className="data-section">
                {loading && (
                    <div className="loading-spinner">
                        <i className="fas fa-spinner fa-spin fa-2x"></i>
                        <p>Carregando dados...</p>
                    </div>
                )}
                
                {error && (
                    <div className="error-message-display">
                        <i className="fas fa-exclamation-triangle"></i>
                        <p>{error}</p>
                    </div>
                )}

                {!loading && !error && devolucoes.length === 0 && (
                    <p className="no-data-message">Nenhum registro encontrado para os critérios selecionados.</p>
                )}

                {!loading && !error && (devolucoes.length > 0) && (
                    <>
                        <div className="table-responsive">
                            <table className="regula-table zebra-striped">
                                <thead>
                                    <tr>
                                        <th>Cód. Solicitação</th>
                                        <th>Usuário</th>
                                        <th>CNS</th>
                                        <th>Endereço</th>
                                        <th>Telefone</th>
                                        <th>Data Solicitação</th>
                                        <th>Data Devolução</th>
                                        <th>Profissional Solicitante</th>
                                        <th>Unidade Solicitante</th>
                                        <th>Justificativa</th>
                                        <th>Resposta ao Solicitante</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {devolucoes.map((item, index) => (
                                        <tr key={index}>
                                            <td>{formatValue(item.Codigo_Solicitacao)}</td>
                                            <td>{formatValue(item.Usuario)}</td>
                                            <td>{formatValue(item.CNS)}</td>
                                            <td>{formatValue(item.Endereco)}</td>
                                            <td>{formatValue(item.Telefone)}</td>
                                            <td>{formatDate(item.Data_Solicitacao)}</td>
                                            <td>{formatDate(item.Data_Devolucao)}</td>
                                            <td>{formatValue(item.Profissional_Solicitante)}</td>
                                            <td>{formatValue(item.Unidade_Solicitante)}</td>
                                            <td title={item.Justificativa}>{formatValue(item.Justificativa)}</td>
                                            <td title={item.resposta_solicitante}>{formatValue(item.resposta_solicitante)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Paginação */}
                        <div className="pagination-controls">
                            <button 
                                onClick={() => setPage(p => Math.max(1, p - 1))} 
                                disabled={page === 1}
                                className="page-btn"
                            >
                                <i className="fas fa-chevron-left"></i> Anterior
                            </button>
                            
                            <span className="page-info">
                                Página {page} de {totalPaginas}
                            </span>
                            
                            <button 
                                onClick={() => setPage(p => p + 1)} 
                                disabled={page >= totalPaginas} /* Melhor prática: desabilitar se for a última página */
                                className="page-btn"
                            >
                                Próximo <i className="fas fa-chevron-right"></i>
                            </button>

                            {/* Novo Elemento de Total de Registros */}
                            <span className="total-summary">
                                Total: <strong>{totalRegistros}</strong> registros
                            </span>
                        </div>
                    </>
                )}
            </section>
        </div>
    );
}

export default RegulaFlow;
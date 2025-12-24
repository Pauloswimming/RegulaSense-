import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import { useNavigate } from 'react-router-dom';
import './Justificativa.css';
import { useLocation } from 'react-router-dom';

const Justificativa = () => {
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(true);
    const [justificationText, setJustificationText] = useState('');
    const [error, setError] = useState(null);

    const location = useLocation();
    const procedimento = location.state?.procedimento;
    const clinico_text = location.state?.clinico_text;
    const solicitacaoId = location.state?.solicitacaoId;
    const selectedErs = location.state?.ers;
    const [statusMessage, setStatusMessage] = useState('');

    const generateJustification = async () => {
        if (!solicitacaoId) {
            setError("IDs da solicitação não fornecida.");
            setIsLoading(false);
            return;
        }

        const formData = {
            procedimento: procedimento, // O nome (Label) do procedimento
            clinico_text: clinico_text, // O texto clínico combinado
            ers: selectedErs // A lista de ERs
        }

        console.log(formData)

        try {
            const response = await apiClient.post(`/api/fillsense/solicitacoes/gerar-justificativa/`, formData);

            if (response.status !== 200) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }

            const data = response.data;
            setJustificationText(data.justificativa);

        } catch (err) {
            let errorMsg = 'Falha crítica: Verifique o servidor (porta 8000).';
            if (err.response) {
                errorMsg = `Falha na Geração: Erro ${err.response.status}. Verifique se a solicitação ${solicitacaoId} existe.`;
            }
            setError(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        generateJustification();
    }, [procedimento, clinico_text, solicitacaoId, selectedErs]);

    const handleSaveButton = async (event) => {
        event.preventDefault();
        setStatusMessage('');
        try {
            const formData = {
                'justificativa': justificationText
            };

            const response = await apiClient.patch(`/api/fillsense/solicitacoes/${solicitacaoId}/`, formData);

            if (response.status !== 200) {
                throw new Error(`Erro HTTP: ${response.status}`);
            } else {
                setStatusMessage(`SUCESSO: Justificativa salva para protocolo ${response.data.protocolo}! Redirecionando...`);
                setTimeout(() => navigate('/solicitacoes'), 1000);
            }

        } catch (err) {
            let errorMsg = 'Falha ao salvar: O servidor não respondeu.';
            if (err.response && err.response.status === 404) {
                 errorMsg = 'Falha Crítica: Solicitação não encontrada no sistema.';
            } else if (err.response) {
                errorMsg = `Falha ao salvar: Erro ${err.response.status}. Verifique o formato do texto.`;
            }
            setError(errorMsg);
        }
    };

    const handleCopyButton = (event) => {
        event.preventDefault();
        navigator.clipboard.writeText(justificationText)
            .then(() => {
                setStatusMessage('COPIADO: Texto da justificativa salvo na área de transferência!');
                setTimeout(() => setStatusMessage(''), 3000);
            })
            .catch(err => {
                setError('Falha ao copiar. Verifique as permissões do navegador.');
            });
    };

    const handleBackButton = (event) => {
        event.preventDefault();
        navigate('/nova-solicitacao');
    };

    if (isLoading) {
        return (
            <>
                <section className="page-header">
                    <h1><i className="fas fa-file-signature"></i> Revisar Justificativa Médica</h1>
                    <p>Revise o texto gerado pela Inteligência Artificial e faça os ajustes necessários antes de utilizá-lo na sua solicitação.</p>
                </section>

                <div className="disclaimer-box">
                    <i className="fas fa-exclamation-triangle"></i>
                    <div>
                        <strong>Aviso Importante:</strong> Este texto foi gerado por Inteligência Artificial. Ele serve como uma <strong>sugestão</strong> e um ponto de partida, mas <strong>não é uma garantia de conformidade legal ou validade clínica absoluta</strong>.
                        É de sua responsabilidade <strong>revisar, validar e adaptar</strong> a justificativa para garantir sua precisão,
                        adequação e aderência a todas as normas e ao quadro clínico específico do paciente.
                    </div>
                </div>
                <section className="ai-generator">
                    <div className="title"><i className="fa-solid fa-robot"></i> Gerando texto com IA…</div>
                    <div className="subtitle">Estamos preparando sua justificativa. Por favor, aguarde.
                        <br/>
                        <i className="fas fa-spinner fa-spin"></i>
                    </div>
                </section>
            </>
        );
    }

    if (error) {
        return (
            <div className="disclaimer-box error-box">{error}</div>
        )
    }

    return (
        <>
            <section className="page-header">
                <h1><i className="fas fa-file-signature"></i> Revisar Justificativa Médica</h1>
                <p>Revise o texto gerado pela Inteligência Artificial e faça os ajustes necessários antes de utilizá-lo na sua solicitação.</p>
            </section>

            <div className="disclaimer-box">
                <i className="fas fa-exclamation-triangle"></i>
                <div>
                    <strong>Aviso Importante:</strong> Este texto foi gerado por Inteligência Artificial. Ele serve como uma <strong>sugestão</strong> e um ponto de partida, mas <strong>não é uma garantia de conformidade legal ou validade clínica absoluta</strong>.
                    É de sua responsabilidade <strong>revisar, validar e adaptar</strong> a justificativa para garantir sua precisão,
                    adequação e aderência a todas as normas e ao quadro clínico específico do paciente.
                </div>
            </div>
            <section className="justification-area">
                <h2>Texto da Justificativa</h2>
                <textarea
                    id="justificationText"
                    rows="15"
                    value={justificationText}
                    onChange={(e) => setJustificationText(e.target.value)}
                />
            </section>

            <div id="actionBar" className="action-buttons">
                <button type="button" id="backButton" className="action-button back-button" onClick={handleBackButton}><i className="fas fa-arrow-left"></i> Voltar</button>
                <button type="button" id="copyButton" className="action-button copy-button" onClick={handleCopyButton}><i className="fas fa-copy"></i> Copiar</button>
                <button type="button" id="saveButton" className="action-button save-button" onClick={handleSaveButton}><i className="fas fa-save"></i> Salvar</button>
            </div>
             {statusMessage && <div className="status-message-box">{statusMessage}</div>}
        </>
    );
};

export default Justificativa;
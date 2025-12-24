import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import './NovaSolicitacao.css';
import './Modal.css';

const initialStateDadosAdicionais = {};

// Função auxiliar para classes de aviso
const getAvisoClass = (labelText) => {
    const text = labelText.toLowerCase();
    if (text.includes('vermelha')) {
        return 'aviso-vermelho';
    }
    if (text.includes('amarela')) {
        return 'aviso-amarelo';
    }
    return 'aviso-neutro';
};

function NovaSolicitacao() {
    const navigate = useNavigate();

    // --- ESTADOS DO COMPONENTE ---
    const [procedimento, setProcedimento] = useState('');
    const [procedimentoLabel, setProcedimentoLabel] = useState('');
    const [descricaoMedica, setDescricaoMedica] = useState('');
    const [dadosAdicionais, setDadosAdicionais] = useState(initialStateDadosAdicionais);
    const [formError, setFormError] = useState('');
    const [notaTecnicaLabel, setNotaTecnicaLabel] = useState(null); 
    const [procedimentosConfig, setProcedimentosConfig] = useState([]); 
    const [selectedErs, setSelectedErs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [apiError, setApiError] = useState(null);

    // --- HOOK DE EFEITO PARA BUSCAR DADOS DA API ---
    useEffect(() => {
        const fetchProcedimentos = async () => {
            try {
                const response = await apiClient.get('/api/fillsense/solicitacoes/procedimentos/');
                
                const combinedProcs = response.data; 

                if (!combinedProcs || !Array.isArray(combinedProcs)) {
                    throw new Error("Formato de resposta da API inválido. Esperava uma lista.");
                }

                const formattedProcedures = combinedProcs.map(proc => {
                    const fieldsWithUniqueIds = proc.fields.map(field => ({
                        ...field,
                        uniqueId: `${proc.proc_id}_${field.name}`
                    }));

                    return {
                        value: proc.proc_id,
                        label: proc.proc_label,
                        fields: fieldsWithUniqueIds,
                        nota_tecnica: proc.NT_label || null,
                        ers: proc.ers || []
                    };
                });
                
                setProcedimentosConfig(formattedProcedures);

            } catch (err) {
                setApiError('Não foi possível carregar os procedimentos. Verifique sua conexão e tente novamente.');
                console.error("Erro ao buscar procedimentos:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProcedimentos();
    },[]);

    // --- MODIFICA O FORMULÁRIO AO MODIFICAR O PROCEDIMENTO --- 
    const handleProcedimentoChange = (event) => {
        const procId = event.target.value;
        setProcedimento(procId);

        const newDadosAdicionais = {};
        let novaNotaTecnica = null; 
        let novoLabel = '';
        let novosErs = [];

        if (procId) {
            const selectedProc = procedimentosConfig.find(p => p.value === procId);
            if (selectedProc) {
                selectedProc.fields.forEach(field => {
                    if (field.type === 'checkbox') {
                        newDadosAdicionais[field.uniqueId] = {};
                    // Ignora 'label' ao iniciar o estado
                    } else if (field.type !== 'label') { 
                        newDadosAdicionais[field.uniqueId] = '';
                    }
                });
                // Captura as novas informações
                novaNotaTecnica = selectedProc.nota_tecnica; 
                novoLabel = selectedProc.label;
                novosErs = selectedProc.ers;
            }
        }
        setDadosAdicionais(newDadosAdicionais);
        setNotaTecnicaLabel(novaNotaTecnica);
        setProcedimentoLabel(novoLabel);
        setSelectedErs(novosErs);
    };

    const handleDadosAdicionaisChange = (event) => {
        const { name: uniqueId, value, checked } = event.target;
        const selectedProc = procedimentosConfig.find(p => p.value === procedimento);
        const fieldDef = selectedProc?.fields.find(f => f.uniqueId === uniqueId);

        if (!fieldDef) return;

        if (fieldDef.type === 'checkbox') {
            setDadosAdicionais(prevData => ({
                ...prevData,
                [uniqueId]: {
                    ...prevData[uniqueId],
                    [value]: checked
                }
            }));
        } else {
            setDadosAdicionais(prevData => ({
                ...prevData,
                [uniqueId]: value,
            }));
        }
    };

    // --- ENVIA O FORMULÁRIO PARA API CASO ELE ESTEJA TOTALMENTE PREENCHIDO ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        setIsSubmitting(true); // Ativa o loading

        if (!procedimento) {
            setFormError('Por favor, selecione um procedimento.');
            setIsSubmitting(false);
            return;
        }

        const selectedProcedureConfig = procedimentosConfig.find(p => p.value === procedimento);
        if (!selectedProcedureConfig) {
            setFormError('Erro: Configuração do procedimento não encontrada.');
            setIsSubmitting(false);
            return;
        }

        // Monta o texto clínico
        const dadosFormularioArray = [];
        selectedProcedureConfig.fields.forEach(field => {
            if (field.type !== 'label') {
                let valueText = "";
                if (field.type === 'checkbox') {
                    const selectedOptions = Object.keys(dadosAdicionais[field.uniqueId] || {})
                    .filter(option => dadosAdicionais[field.uniqueId][option]);
                    if (selectedOptions.length > 0) {
                        valueText = selectedOptions.join('; ');
                    }
                } else {
                    if (dadosAdicionais[field.uniqueId]) {
                        valueText = dadosAdicionais[field.uniqueId];
                    }
                }
                // Apenas insere os campos que foram preenchidos
                if(valueText.length !== 0)
                    dadosFormularioArray.push(`${field.label}: ${valueText}`);
            }
        });
        
        const tituloNotaTecnica = `Título da Nota Técnica: ${notaTecnicaLabel}`;
        const textoDoFormularioAdicional = `${tituloNotaTecnica}\n\nInformações Necessárias:\n${dadosFormularioArray.join("\n")}`;
        const descricaoFinalCombinada = `${textoDoFormularioAdicional}\n\nDescrição Clínica Adicional: ${descricaoMedica || 'Nenhuma descrição adicional fornecida.'}`;

        const formData = {
            procedimento,
            'descricao_medica': descricaoFinalCombinada
        };

        // Chama o NOVO endpoint de geração
        try {
            const response = await apiClient.post('api/fillsense/solicitacoes/', formData);
            // Se o formulário foi salvo
            if (response.status === 201) {
                const payload = {
                    procedimento: procedimentoLabel, // O nome (Label) do procedimento
                    clinico_text: descricaoFinalCombinada, // O texto clínico combinado
                    solicitacaoId: response.data.id, // O id da solicitação
                    ers: selectedErs // A lista de ERs
                };

                navigate('/justificativa', {
                    state: payload
                });
            }
        // Se aconteceu algum erro ao
        // enviar o formulário
        } catch (err) {
            setFormError('Erro ao enviar a solicitação. Tente novamente.');
        }
    };
    
    // Cancelamento do formulário
    const handleCancel = () => {
        navigate('/solicitacoes');
    };

    const renderField = (field) => {
        // Pula, caso o campo seja do tipo 'label'
        if (!field || field.type === 'label') return null; 
        const commonProps = {
            id: field.uniqueId,
            name: field.uniqueId,
            onChange: handleDadosAdicionaisChange,
        };

        // Lógica do Hint (tooltip)
        const renderHint = field.hint ? (
            <span className="field-hint-icon tooltip-container">
                <i className="fas fa-question-circle"></i>
                <span className="tooltip-text">{field.hint}</span>
            </span>
        ) : null;

        // Renderização de Input
        const renderInput = () => <input 
            {...commonProps} 
            type={field.type === 'date' ? 'date' : field.subtype || 'text'} 
            value={dadosAdicionais[field.uniqueId] || ''} 
            placeholder={field.placeholder || field.default || ''} 
            step={field.step || null}
        />;

        // Renderização de Textarea
        const renderTextarea = () => <textarea 
            {...commonProps} 
            value={dadosAdicionais[field.uniqueId] || ''} 
            placeholder={field.placeholder || field.default || ''}
        ></textarea>;

        // Renderização de Select
        const renderSelect = () => (
            <select {...commonProps} value={dadosAdicionais[field.uniqueId] || ''}>
                <option value="">Selecione...</option>
                {field.options.map((opt, index) => <option key={index} value={opt}>{opt}</option>)}
            </select>
        );

        // Renderização de Checkbox
        const renderCheckboxGroup = () => (
        <div className="checkbox-group">
            {field.options.map((option, index) => (
                <label key={index} htmlFor={`${field.uniqueId}-${index}`} className="checkbox-label">
                    <input
                    type="checkbox"
                    id={`${field.uniqueId}-${index}`}
                            name={field.uniqueId}
                            value={option}
                            checked={!!dadosAdicionais[field.uniqueId]?.[option]}
                            onChange={handleDadosAdicionaisChange}
                        />
                        {option}
                    </label>
                ))}
            </div>
        );

        return (
            // Adiciona className (para col-3, etc.)
            <div className={`form-group ${field.className || 'col-12'}`} key={field.uniqueId}> 
                <label htmlFor={field.uniqueId}>
                    {field.label}
                    {renderHint}
                </label>
                {field.type === 'textarea' && renderTextarea()}
                {field.type === 'select' && renderSelect()}
                {['text', 'date', 'number'].includes(field.type) && renderInput()}
                {field.type === 'checkbox' && renderCheckboxGroup()}
            </div>
        );
    };
    
    const selectedProcedureConfig = procedimentosConfig.find(p => p.value === procedimento);
    
    // Filtra campos de input vs campos de aviso
    const fieldsToRender = selectedProcedureConfig
        ? selectedProcedureConfig.fields.filter(f => f.type !== 'label')
        : [];
        
    const avisosToRender = selectedProcedureConfig
        ? selectedProcedureConfig.fields.filter(f => f.type === 'label')
        : [];

    // Renderiza informações todas as informações do formulário:
    // Nota Técnica, Avisos (labels) e Campos
    const renderAdditionalInfoForm = () => (
        <div className="form-section">
            <h2><i className="fa-solid fa-notes-medical"></i> Informações Adicionais</h2>
            
            {/* Exibe a Nota Técnica */}
            {notaTecnicaLabel && (
                <h3 className="nota-tecnica-header">Conforme {notaTecnicaLabel}</h3>
            )}
            
            {/* Exibe os Avisos (labels) */}
            {avisosToRender.length > 0 && (
                <div className="avisos-section">
                    {avisosToRender.map(aviso => (
                        <div key={aviso.name} className={`aviso-box ${getAvisoClass(aviso.label)}`}>
                            <i className="fas fa-exclamation-triangle"></i>
                            <span>{aviso.label}</span>
                        </div>
                    ))}
                </div>
            )}

            <div className="grid">
                {/* Renderiza apenas os campos (sem os avisos) */}
                {fieldsToRender.map(field => renderField(field))}
            </div>
        </div>
    );
    
    // O HTML da página em si
    return (
        <>
            <section className="form-header">
                <h1><i className="fas fa-file-medical"></i> Nova Solicitação de Procedimento SUS</h1>
                <p>Utilize o FillSense para preencher seu formulário de forma inteligente e rápida, com sugestões e validações em tempo real.</p>
            </section>
            <form onSubmit={handleSubmit}>
                <div className="form-section">
                    <h2>Detalhes do Procedimento</h2>
                    <div className="form-group">
                        <label htmlFor="procedimento">Procedimento:</label>
                        <select
                            id="procedimento"
                            name="procedimento"
                            value={procedimento}
                            onChange={handleProcedimentoChange}
                            required
                            disabled={isLoading}
                        >
                            <option value="">{isLoading ? "Carregando procedimentos..." : "Selecione..."}</option>
                            {!isLoading && procedimentosConfig.map(proc => (
                                <option key={proc.value} value={proc.value}>{proc.label}</option>
                            ))}
                        </select>
                        {apiError && <p className="form-error-message" style={{textAlign: 'left', marginTop: '8px'}}>{apiError}</p>}
                    </div>
                </div>

                {procedimento && (
                    <div key={procedimento}>
                        {renderAdditionalInfoForm()}
                    </div>
                )}

                <div className="form-section">
                    <h2>Descrição Clínica Adicional</h2>
                    <div className="form-group">
                        <label htmlFor="descricaoMedica">Descrição:</label>
                        <textarea
                            id="descricaoMedica"
                            name="descricaoMedica"
                            rows="7"
                            value={descricaoMedica}
                            onChange={(e) => setDescricaoMedica(e.target.value)}
                            placeholder="Se necessário, adicione aqui outras informações clínicas, hipóteses diagnósticas ou detalhes relevantes para a solicitação."
                        ></textarea>
                    </div>
                </div>

                <div className="ai-suggestion-box">
                    <i className="fas fa-robot"></i>
                    <span>A IA irá gerar uma sugestão de justificativa com base nos dados preenchidos e notas técnicas.</span>
                </div>
                <div className="form-actions">
                    <button type="button" className="cancel-button" onClick={handleCancel}>Cancelar</button>
                    <button type="submit" name="generateSuggestion" className="submit-button" disabled={isLoading || isSubmitting || !procedimento}>
                        {isSubmitting ? (
                            <><i className="fas fa-spinner fa-spin"></i> Gerando...</>
                        ) : (
                            <><i className="fas fa-robot"></i> Gerar Justificativa</>
                        )}
                    </button>
                </div>
                {formError && <p className="form-error-message">{formError}</p>}
            </form>
        </>
    );
}

export default NovaSolicitacao;
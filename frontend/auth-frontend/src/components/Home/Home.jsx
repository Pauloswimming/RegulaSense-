import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
    return (
        <>
        <section className="welcome-section">
            <h1>Painel Principal</h1>
            <p>Selecione um dos módulos abaixo para iniciar suas atividades ou explore as opções de navegação.</p>
        </section>

        <section className="modules-grid">
            <div className="module-card" id="regulaflow-module">
                <i className="fas fa-redo-alt" style={{ fontSize: '3em', color: '#3D668B', marginBottom: '15px' }}></i>
                <h3>RegulaFlow</h3>
                <p>Gerencie a fila de solicitações de devoluções. Otimize o fluxo, acompanhe o status e minimize os gargalos no processo regulatório.</p>
                <Link to="/regulaflow" className="module-button">Acessar RegulaFlow</Link>
            </div>

            <div className="module-card" id="fillsense-module">
                <i className="fas fa-magic" style={{ fontSize: '3em', color: '#3D668B', marginBottom: '15px' }}></i>
                <h3>FillSense</h3>
                <p>Utilize a inteligência artificial generativa para auxiliar no preenchimento de solicitações, garantindo precisão e agilidade nos formulários do SUS.</p>
                <Link to="/solicitacoes" className="module-button">Acessar FillSense</Link>
            </div>
        </section>
        </>
    );
}

export default Home;
